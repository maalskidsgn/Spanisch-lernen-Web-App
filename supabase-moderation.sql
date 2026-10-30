-- ============================================================
--  Melden und Blockieren
-- ============================================================
--
-- Seit es Benutzernamen, Profilbilder und eine Rangliste gibt,
-- sehen Nutzer Inhalte anderer Nutzer. Apple (Richtlinie 1.2) und
-- Google verlangen dafuer dreierlei: melden koennen, blockieren
-- koennen, und dass gemeldete Inhalte jemand ansieht.
--
-- Ohne das wird die App abgelehnt - und zu Recht: Ein anstoessiges
-- Profilbild waere sonst fuer alle sichtbar, ohne dass jemand
-- etwas dagegen tun kann.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
--  1. Blockieren
-- ------------------------------------------------------------
-- Wer blockiert ist, verschwindet aus Rangliste, Suche und
-- Duellen - und zwar in beide Richtungen. Sonst sieht der
-- Blockierte weiterhin den, der ihn nicht mehr sehen will, und
-- kann ihn anschreiben.

create table if not exists blockiert (
  wer         uuid not null references auth.users(id) on delete cascade,
  wen         uuid not null references auth.users(id) on delete cascade,
  erstellt_am timestamptz not null default now(),
  primary key (wer, wen),
  constraint nicht_sich_selbst check (wer <> wen)
);

create index if not exists blockiert_wen_idx on blockiert (wen);

alter table blockiert enable row level security;

drop policy if exists "eigene Blockierungen sehen" on blockiert;
create policy "eigene Blockierungen sehen" on blockiert
  for select using (auth.uid() = wer);

drop policy if exists "selbst blockieren" on blockiert;
create policy "selbst blockieren" on blockiert
  for insert with check (auth.uid() = wer);

drop policy if exists "blockierung aufheben" on blockiert;
create policy "blockierung aufheben" on blockiert
  for delete using (auth.uid() = wer);


/**
 * Steht zwischen zwei Konten eine Blockierung - in welche Richtung
 * auch immer?
 *
 * Als eigene Funktion, weil die Abfrage in jeder Liste gebraucht
 * wird. STABLE, damit Postgres sie je Abfrage nur einmal auswertet.
 */
create or replace function ist_blockiert(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from blockiert
    where (wer = a and wen = b) or (wer = b and wen = a)
  );
$$;


/** Jemanden blockieren. Loest eine bestehende Freundschaft auf. */
create or replace function nutzer_blockieren(name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  mich   uuid := auth.uid();
  andere uuid;
begin
  if mich is null then
    raise exception 'Bitte zuerst anmelden.';
  end if;

  select id into andere from profile where benutzername = name;
  if andere is null then
    raise exception 'Diesen Benutzernamen gibt es nicht.';
  end if;
  if andere = mich then
    raise exception 'Sich selbst kann man nicht blockieren.';
  end if;

  insert into blockiert (wer, wen) values (mich, andere)
  on conflict do nothing;

  -- Freundschaft und offene Anfragen aufloesen: Wer jemanden
  -- blockiert, will ihn nicht in seiner Freundesliste behalten.
  delete from freunde
  where (von = mich and an = andere) or (von = andere and an = mich);

  -- Laufende Duelle ebenfalls - sonst wartet eines ewig auf einen
  -- Gegner, den man nicht mehr sehen will.
  delete from duelle
  where (a = mich and b = andere) or (a = andere and b = mich);

  return 'blockiert';
end;
$$;


/** Blockierung wieder aufheben. */
create or replace function nutzer_freigeben(name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  mich   uuid := auth.uid();
  andere uuid;
begin
  if mich is null then raise exception 'Bitte zuerst anmelden.'; end if;
  select id into andere from profile where benutzername = name;
  if andere is null then raise exception 'Diesen Benutzernamen gibt es nicht.'; end if;
  delete from blockiert where wer = mich and wen = andere;
  return 'freigegeben';
end;
$$;


/** Wen habe ich blockiert? Fuer die Liste in den Einstellungen. */
drop function if exists meine_blockierungen();
create or replace function meine_blockierungen()
returns table (benutzername text, bild text, seit timestamptz)
language sql
security definer
set search_path = public
as $$
  select p.benutzername, p.bild, b.erstellt_am
  from blockiert b
  join profile p on p.id = b.wen
  where b.wer = auth.uid()
  order by b.erstellt_am desc;
$$;


-- ------------------------------------------------------------
--  2. Melden
-- ------------------------------------------------------------
-- Eine Meldung ist keine Beschwerde ins Leere: Sie landet in einer
-- Tabelle, die Manuel durchsieht. Der Server schickt zusaetzlich
-- eine Mail (siehe server/index.js), damit es nicht erst auffaellt,
-- wenn jemand zufaellig nachschaut.

create table if not exists meldungen (
  id          uuid primary key default gen_random_uuid(),
  melder      uuid not null references auth.users(id) on delete cascade,
  gemeldeter  uuid not null references auth.users(id) on delete cascade,
  grund       text not null,
  bemerkung   text,
  stand       text not null default 'offen',
  erstellt_am timestamptz not null default now(),
  constraint grund_erlaubt check (grund in
    ('bild', 'name', 'belaestigung', 'spam', 'anderes')),
  constraint stand_erlaubt check (stand in ('offen', 'erledigt', 'verworfen'))
);

create index if not exists meldungen_offen_idx on meldungen (stand, erstellt_am desc);

alter table meldungen enable row level security;

-- Nur die eigenen Meldungen sehen. Bearbeitet werden sie mit dem
-- Dienstschluessel, nicht aus der App.
drop policy if exists "eigene Meldungen sehen" on meldungen;
create policy "eigene Meldungen sehen" on meldungen
  for select using (auth.uid() = melder);


/**
 * Jemanden melden.
 *
 * Blockiert die Person gleich mit: Wer etwas meldet, will es in
 * aller Regel auch nicht mehr sehen - und muss nicht warten, bis
 * jemand die Meldung bearbeitet hat.
 */
create or replace function nutzer_melden(name text, grund text, bemerkung text default null)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  mich   uuid := auth.uid();
  andere uuid;
begin
  if mich is null then
    raise exception 'Bitte zuerst anmelden.';
  end if;

  select id into andere from profile where benutzername = name;
  if andere is null then
    raise exception 'Diesen Benutzernamen gibt es nicht.';
  end if;
  if andere = mich then
    raise exception 'Sich selbst zu melden ergibt keinen Sinn.';
  end if;

  -- Nicht mehrfach dasselbe melden
  if exists (
    select 1 from meldungen
    where melder = mich and gemeldeter = andere and stand = 'offen'
  ) then
    return 'schon gemeldet';
  end if;

  insert into meldungen (melder, gemeldeter, grund, bemerkung)
  values (mich, andere, grund, left(coalesce(bemerkung, ''), 500));

  perform nutzer_blockieren(name);
  return 'gemeldet';
end;
$$;


-- ------------------------------------------------------------
--  3. Blockierte aus den Listen nehmen
-- ------------------------------------------------------------
-- Folgt in einem zweiten Schritt: Die bestehenden Funktionen
-- (nutzer_suchen, rangliste, meine_freunde) bekommen den Filter
-- ergaenzt. Dafuer muessen sie erst im Original gelesen werden -
-- neu schreiben waere zu riskant.

grant execute on function ist_blockiert(uuid, uuid) to authenticated;
grant execute on function nutzer_blockieren(text) to authenticated;
grant execute on function nutzer_freigeben(text) to authenticated;
grant execute on function meine_blockierungen() to authenticated;
grant execute on function nutzer_melden(text, text, text) to authenticated;
