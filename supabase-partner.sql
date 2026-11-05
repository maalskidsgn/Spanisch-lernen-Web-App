-- ============================================================
--  Partnerprogramm: Codes, Klicks, bezahlte Verkaeufe
-- ============================================================
-- Keine Policies: Nur der Server mit dem Service-Schluessel kommt dran.
create table if not exists partner (
  code text primary key,
  name text not null,
  rabatt_prozent numeric not null default 0,
  provision_prozent numeric not null default 0,
  erstellt_am timestamptz not null default now()
);
create table if not exists partner_verkaeufe (
  id uuid primary key default gen_random_uuid(),
  code text not null references partner(code),
  quelle text not null,
  beleg text not null unique,
  nutzer_id uuid,
  betrag_cent int not null,
  waehrung text not null default 'eur',
  provision_cent int not null,
  am timestamptz not null default now(),
  ausgezahlt_am timestamptz
);
create table if not exists partner_klicks (
  code text not null references partner(code),
  tag date not null,
  anzahl int not null default 0,
  primary key (code, tag)
);
alter table partner enable row level security;
alter table partner_verkaeufe enable row level security;
alter table partner_klicks enable row level security;
create or replace function partner_klick(p_code text, p_tag date) returns void language sql security definer as $$
  insert into partner_klicks (code, tag, anzahl) values (p_code, p_tag, 1)
  on conflict (code, tag) do update set anzahl = partner_klicks.anzahl + 1;
$$;
revoke all on function partner_klick(text, date) from public, anon, authenticated;
insert into partner (code, name, rabatt_prozent, provision_prozent) values ('FRIEND30', 'Freunde', 30, 0) on conflict (code) do nothing;
