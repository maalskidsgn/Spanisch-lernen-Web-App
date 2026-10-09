-- ============================================================
--  HABLOO – Satz-Karteikasten
--  Einspielen: Supabase-Dashboard → SQL Editor → einfügen → "Run"
--  Kann gefahrlos mehrfach ausgeführt werden.
-- ============================================================
--
--  Der Satz-Trainer funktioniert auch OHNE diese Tabelle – dann
--  liegen die Sätze nur im Browser. Sobald sie angelegt ist,
--  synchronisiert die App von selbst, ohne Code-Änderung: Die
--  Sätze wandern dann wie die Vokabeln aufs Konto und sind auf
--  jedem Gerät da.
--
--  Aufbau bewusst wie bei "vokabeln" – es ist derselbe
--  Karteikasten, nur mit Sätzen statt Einzelwörtern.
-- ============================================================

CREATE TABLE IF NOT EXISTS saetze (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutzer_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Der Satz kleingeschrieben – das ist der Schlüssel, damit
  -- "Me gustaría…" und "me gustaría…" nicht zweimal drinstehen.
  satz_es        TEXT NOT NULL,
  -- Derselbe Satz in Originalschreibung; das sieht der Nutzer.
  anzeige        TEXT,
  uebersetzung   TEXT NOT NULL,
  -- Das eine Wort, auf das es ankommt (z. B. die Verbform "gustaría")
  schluesselwort TEXT,

  -- Woher der Satz stammt: Thema und – falls vorgegeben – Zeitform
  thema          TEXT,
  zeitform       TEXT,

  -- Karteikasten, identisch zu vokabeln
  kategorie      TEXT DEFAULT 'lernen',          -- neu | lernen | gewusst
  stufe          INT DEFAULT 0 CHECK (stufe BETWEEN 0 AND 6),
  intervall      REAL,                            -- Abstand in Tagen (Anki-Logik)
  leichtigkeit   REAL,                            -- Multiplikator, startet bei 2.5
  faellig_am     TIMESTAMPTZ DEFAULT NOW(),
  richtig        INT DEFAULT 0,
  falsch         INT DEFAULT 0,
  erstellt_am    TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (nutzer_id, satz_es)
);

-- Für die häufigste Abfrage: "welche Sätze sind jetzt fällig?"
CREATE INDEX IF NOT EXISTS idx_saetze_faellig ON saetze(nutzer_id, faellig_am);


-- ------------------------------------------------------------
--  Zugriffsschutz: jeder sieht nur seine eigenen Sätze
-- ------------------------------------------------------------

ALTER TABLE saetze ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eigene_saetze" ON saetze;
CREATE POLICY "eigene_saetze" ON saetze
  FOR ALL USING (auth.uid() = nutzer_id) WITH CHECK (auth.uid() = nutzer_id);
