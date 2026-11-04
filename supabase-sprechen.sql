-- ============================================================
--  Sprach-Trainer: Gespraeche und was sich der Trainer merkt
-- ============================================================
--
-- Lesen darf jeder nur das Eigene, geschrieben wird nur ueber den
-- Server. Sonst koennte jemand seine Minuten zuruecksetzen.

create extension if not exists pgcrypto;

create table if not exists sprech_gespraeche (
  id          uuid primary key default gen_random_uuid(),
  nutzer_id   uuid not null references auth.users(id) on delete cascade,
  akzent      text not null,
  beginn      timestamptz not null default now(),
  ende        timestamptz
);
create index if not exists sprech_gespraeche_idx on sprech_gespraeche (nutzer_id, beginn desc);

create table if not exists sprech_gedaechtnis (
  nutzer_id    uuid primary key references auth.users(id) on delete cascade,
  zuletzt      text,                          -- worum es beim letzten Mal ging
  fehler       jsonb not null default '[]',   -- [{falsch, richtig, erklaerung, anzahl, zuletzt}]
  merken       jsonb not null default '[]',   -- Fakten und Ziele, z. B. "reist im Mai nach Mexiko"
  gespraeche   int not null default 0,
  geaendert_am timestamptz not null default now()
);

alter table sprech_gespraeche  enable row level security;
alter table sprech_gedaechtnis enable row level security;

drop policy if exists "gespraeche lesen" on sprech_gespraeche;
create policy "gespraeche lesen" on sprech_gespraeche for select using (auth.uid() = nutzer_id);
drop policy if exists "gedaechtnis lesen" on sprech_gedaechtnis;
create policy "gedaechtnis lesen" on sprech_gedaechtnis for select using (auth.uid() = nutzer_id);

-- Erweiterung: hartes Limit, gespeicherte Gespraeche, Lernprofil
alter table sprech_gespraeche add column if not exists call_id text;
alter table sprech_gespraeche add column if not exists bis timestamptz;
alter table sprech_gespraeche add column if not exists verlauf jsonb;
alter table sprech_gespraeche add column if not exists zusammenfassung text;
alter table sprech_gespraeche add column if not exists fehler jsonb;
alter table sprech_gespraeche add column if not exists vokabeln jsonb;
alter table sprech_gespraeche add column if not exists tokens jsonb;
alter table sprech_gedaechtnis add column if not exists profil jsonb not null default '{}';
create index if not exists sprech_gespraeche_offen on sprech_gespraeche (bis) where ende is null;
