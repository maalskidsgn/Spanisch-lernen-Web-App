-- ============================================================
--  Duelle: zu zweit gegeneinander Vokabeln raten
-- ============================================================
--
-- Bewusst NICHT in Echtzeit. Zwei Leute gleichzeitig vor dem Handy zu
-- haben, klappt in einer Lern-App praktisch nie – und eine Lobby, in
-- der man auf jemanden wartet, der nicht kommt, ist schlimmer als
-- gar kein Spiel. Stattdessen: Beide bekommen dieselben sieben
-- Fragen und spielen, wann sie Zeit haben. Wer mehr richtig hat,
-- gewinnt; bei Gleichstand entscheidet die Zeit.
--
-- Die Fragen liegen als JSON in der Zeile, nicht als Zufallszahl.
-- Ein Startwert waere schlanker, wuerde aber andere Fragen erzeugen,
-- sobald Lektionen dazukommen – mitten im laufenden Duell.

create extension if not exists pgcrypto;

create table if not exists duelle (
  id          uuid primary key default gen_random_uuid(),
  -- a ist der Herausforderer, b der Herausgeforderte
  a           uuid not null references auth.users(id) on delete cascade,
  b           uuid not null references auth.users(id) on delete cascade,
  fragen      jsonb not null,
  punkte_a    int,          -- null heisst: hat noch nicht gespielt
  zeit_a      int,          -- Millisekunden, fuer den Gleichstand
  punkte_b    int,
  zeit_b      int,
  erstellt_am timestamptz not null default now(),
  constraint duell_nicht_gegen_sich check (a <> b)
);

create index if not exists duelle_a_idx on duelle (a, erstellt_am desc);
create index if not exists duelle_b_idx on duelle (b, erstellt_am desc);

alter table duelle enable row level security;

-- Sehen und aendern darf nur, wer mitspielt.
drop policy if exists "duell sehen" on duelle;
create policy "duell sehen" on duelle
  for select using (auth.uid() = a or auth.uid() = b);

drop policy if exists "duell loeschen" on duelle;
create policy "duell loeschen" on duelle
  for delete using (auth.uid() = a or auth.uid() = b);

-- Angelegt und ausgefuellt wird nur ueber die Funktionen unten,
-- deshalb gibt es bewusst KEINE insert/update-Policy.


-- ------------------------------------------------------------
--  Duell starten
-- ------------------------------------------------------------
-- Nur gegen Freunde: Sonst koennte man Fremde mit Duellen zuschuetten.
-- Gibt die Duell-ID zurueck, oder wirft mit klarer Meldung.

create or replace function duell_starten(gegner text, fragen jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  mich   uuid := auth.uid();
  andere uuid;
  neue   uuid;
begin
  if mich is null then
    raise exception 'Bitte zuerst anmelden.';
  end if;

  select id into andere from profile where benutzername = gegner;
  if andere is null then
    raise exception 'Diesen Benutzernamen gibt es nicht.';
  end if;
  if andere = mich then
    raise exception 'Gegen sich selbst spielt es sich schlecht.';
  end if;

  if not exists (
    select 1 from freunde f
    where f.status = 'angenommen'
      and ((f.von = mich and f.an = andere) or (f.von = andere and f.an = mich))
  ) then
    raise exception 'Ihr seid noch keine Freunde.';
  end if;

  -- Ein offenes Duell pro Paar reicht. Sonst sammeln sich fuenf
  -- angefangene an und keines wird je zu Ende gespielt.
  if exists (
    select 1 from duelle d
    where ((d.a = mich and d.b = andere) or (d.a = andere and d.b = mich))
      and (d.punkte_a is null or d.punkte_b is null)
  ) then
    raise exception 'Euer letztes Duell laeuft noch.';
  end if;

  insert into duelle (a, b, fragen) values (mich, andere, fragen)
  returning id into neue;
  return neue;
end;
$$;


-- ------------------------------------------------------------
--  Ergebnis abgeben
-- ------------------------------------------------------------
-- Traegt in die eigene Spalte ein – und nur, solange sie leer ist.
-- Sonst koennte man so lange spielen, bis das Ergebnis passt.

create or replace function duell_abgeben(duell uuid, punkte int, zeit int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  mich uuid := auth.uid();
  zeile duelle%rowtype;
begin
  if mich is null then
    raise exception 'Bitte zuerst anmelden.';
  end if;

  select * into zeile from duelle where id = duell;
  if not found then
    raise exception 'Dieses Duell gibt es nicht mehr.';
  end if;

  if zeile.a = mich then
    if zeile.punkte_a is not null then
      raise exception 'Du hast dieses Duell schon gespielt.';
    end if;
    update duelle set punkte_a = punkte, zeit_a = zeit where id = duell;
  elsif zeile.b = mich then
    if zeile.punkte_b is not null then
      raise exception 'Du hast dieses Duell schon gespielt.';
    end if;
    update duelle set punkte_b = punkte, zeit_b = zeit where id = duell;
  else
    raise exception 'Du spielst in diesem Duell nicht mit.';
  end if;
end;
$$;


-- ------------------------------------------------------------
--  Meine Duelle
-- ------------------------------------------------------------
-- Dreht die Tabelle auf die eigene Sicht: nicht a und b, sondern
-- "ich" und "der andere". Spart jede Fallunterscheidung in der App.

drop function if exists meine_duelle();
create or replace function meine_duelle()
returns table (
  id            uuid,
  gegner        text,
  gegner_bild   text,
  fragen        jsonb,
  punkte_ich    int,
  zeit_ich      int,
  punkte_gegner int,
  zeit_gegner   int,
  ich_fing_an   boolean,
  erstellt_am   timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    d.id,
    p.benutzername,
    p.bild,
    d.fragen,
    case when d.a = auth.uid() then d.punkte_a else d.punkte_b end,
    case when d.a = auth.uid() then d.zeit_a   else d.zeit_b   end,
    case when d.a = auth.uid() then d.punkte_b else d.punkte_a end,
    case when d.a = auth.uid() then d.zeit_b   else d.zeit_a   end,
    d.a = auth.uid(),
    d.erstellt_am
  from duelle d
  join profile p
    on p.id = case when d.a = auth.uid() then d.b else d.a end
  where d.a = auth.uid() or d.b = auth.uid()
  order by
    -- Oben, was auf mich wartet; dann was auf den anderen wartet;
    -- fertige Duelle zuletzt.
    (case when d.a = auth.uid() then d.punkte_a else d.punkte_b end) is not null,
    d.erstellt_am desc
  limit 30;
$$;

grant execute on function duell_starten(text, jsonb) to authenticated;
grant execute on function duell_abgeben(uuid, int, int) to authenticated;
grant execute on function meine_duelle() to authenticated;
