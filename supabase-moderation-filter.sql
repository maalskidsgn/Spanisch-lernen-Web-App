-- ============================================================
--  Blockierte aus den Listen nehmen – serverseitig
-- ============================================================
--
-- Bisher filterte nur die App. Das reicht fuer die Anzeige, aber ein
-- veraenderter Client koennte den Filter umgehen und blockierte
-- Profile trotzdem sehen. Deshalb hier zusaetzlich in der Datenbank.
--
-- Die bestehenden Funktionen werden NICHT neu geschrieben: Sie
-- bekommen den Zusatz "_roh" und eine Huelle unter dem alten Namen,
-- die sie aufruft und das Ergebnis filtert. So bleibt die gepruefte
-- Logik unangetastet - nur das Sieb kommt dazu.

-- ------------------------------------------------------------
--  Hilfsabfrage: Benutzernamen, die fuer mich blockiert sind
-- ------------------------------------------------------------
create or replace function blockierte_namen()
returns table (benutzername text)
language sql
stable
security definer
set search_path = public
as $$
  select p.benutzername
  from blockiert b
  join profile p
    on p.id = case when b.wer = auth.uid() then b.wen else b.wer end
  where b.wer = auth.uid() or b.wen = auth.uid();
$$;


-- ------------------------------------------------------------
--  1. Suche
-- ------------------------------------------------------------
do $$
begin
  -- Nur beim ersten Mal umbenennen; ein zweiter Durchlauf soll
  -- nicht die Huelle umbenennen und damit alles verdrehen.
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'nutzer_suchen_roh'
  ) then
    alter function nutzer_suchen(text) rename to nutzer_suchen_roh;
  end if;
end $$;

create or replace function nutzer_suchen(was text)
returns table (benutzername text, xp integer, bild text, stand text)
language sql
security definer
set search_path = public
as $$
  select r.benutzername, r.xp, r.bild, r.stand
  from nutzer_suchen_roh(was) r
  where r.benutzername not in (select benutzername from blockierte_namen());
$$;


-- ------------------------------------------------------------
--  2. Rangliste (mit Zeitraum)
-- ------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rangliste_zeitraum_roh'
  ) then
    alter function rangliste_zeitraum(text, integer, boolean)
      rename to rangliste_zeitraum_roh;
  end if;
end $$;

create or replace function rangliste_zeitraum(zeitraum text, anzahl integer, nur_freunde boolean)
returns table (platz bigint, benutzername text, xp integer, ich boolean, bild text)
language sql
security definer
set search_path = public
as $$
  -- Mehr holen als gefragt, damit die Liste nicht kuerzer wird,
  -- wenn jemand herausfaellt. Die Plaetze bleiben die echten:
  -- Wer blockiert ist, besetzt weiterhin seinen Rang - die Liste
  -- hat dann eben eine Luecke, statt alle nachruecken zu lassen.
  select r.platz, r.benutzername, r.xp, r.ich, r.bild
  from rangliste_zeitraum_roh(zeitraum, anzahl + 20, nur_freunde) r
  where r.benutzername not in (select benutzername from blockierte_namen())
  limit anzahl;
$$;


-- ------------------------------------------------------------
--  3. Rangliste (alte Fassung, dient als Rueckfall)
-- ------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rangliste_roh'
  ) then
    alter function rangliste(integer) rename to rangliste_roh;
  end if;
end $$;

create or replace function rangliste(anzahl integer)
returns table (platz bigint, benutzername text, xp integer, ich boolean)
language sql
security definer
set search_path = public
as $$
  select r.platz, r.benutzername, r.xp, r.ich
  from rangliste_roh(anzahl + 20) r
  where r.benutzername not in (select benutzername from blockierte_namen())
  limit anzahl;
$$;


-- ------------------------------------------------------------
--  4. Freundesliste
-- ------------------------------------------------------------
-- Beim Blockieren wird die Freundschaft zwar geloescht, aber eine
-- Blockierung kann auch von der anderen Seite kommen - dann steht
-- der Eintrag noch.
do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'meine_freunde_roh'
  ) then
    alter function meine_freunde() rename to meine_freunde_roh;
  end if;
end $$;

create or replace function meine_freunde()
returns table (benutzername text, xp integer, bild text, stand text, anfrage_id uuid)
language sql
security definer
set search_path = public
as $$
  select r.benutzername, r.xp, r.bild, r.stand, r.anfrage_id
  from meine_freunde_roh() r
  where r.benutzername not in (select benutzername from blockierte_namen());
$$;


-- ------------------------------------------------------------
--  5. Keine Anfragen an Blockierte
-- ------------------------------------------------------------
-- Ohne das koennte man jemanden, der einen blockiert hat, weiter
-- mit Freundschaftsanfragen behelligen.
--
-- Auch hier eine Huelle statt einer Neufassung: freund_anfragen
-- ist in Gebrauch und geprueft, die Logik bleibt wie sie ist.
do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'freund_anfragen_roh'
  ) then
    alter function freund_anfragen(text) rename to freund_anfragen_roh;
  end if;
end $$;

create or replace function freund_anfragen(name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  andere uuid;
begin
  select id into andere from profile where benutzername = name;
  if andere is not null and ist_blockiert(auth.uid(), andere) then
    -- Bewusst ohne Begruendung: Wer blockiert wurde, soll nicht
    -- erfahren, dass er es wurde.
    raise exception 'Das geht gerade nicht.';
  end if;
  return freund_anfragen_roh(name);
end;
$$;

grant execute on function blockierte_namen() to authenticated;
grant execute on function nutzer_suchen(text) to authenticated;
grant execute on function rangliste_zeitraum(text, integer, boolean) to authenticated;
grant execute on function rangliste(integer) to authenticated;
grant execute on function meine_freunde() to authenticated;
grant execute on function freund_anfragen(text) to authenticated;
