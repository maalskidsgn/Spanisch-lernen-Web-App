-- ============================================================
--  HABLOO – Lesetexte (Wissenstexte zum Wiederlesen)
--  Einspielen: Supabase-Dashboard → SQL Editor → einfügen → "Run"
--  Kann gefahrlos mehrfach ausgeführt werden.
-- ============================================================
--
--  Wie beim Satz-Trainer gilt: Der Lesebereich funktioniert auch
--  OHNE diese Tabelle – dann liegen die Texte nur im Browser.
--  Sobald sie angelegt ist, synchronisiert die App von selbst.
--
--  Die Absätze und die Wortliste stehen als JSON in je einer
--  Spalte. Das ist hier richtig: Sie gehören untrennbar zu
--  genau diesem Text, werden immer zusammen gelesen und nie
--  einzeln durchsucht.
-- ============================================================

CREATE TABLE IF NOT EXISTS lesetexte (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutzer_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Kennung aus der App (z. B. "t-m2x9f-ab12")
  text_id        TEXT NOT NULL,

  titel_es       TEXT NOT NULL,
  titel_de       TEXT NOT NULL,
  -- [{ "es": "…", "de": "…" }, …] – absatzweise, damit der
  -- Sprachumschalter die Stelle behält
  absaetze       JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- [{ "wort": "el pulpo", "uebersetzung": "der Oktopus" }, …]
  woerter        JSONB NOT NULL DEFAULT '[]'::jsonb,
  merksatz       TEXT,

  gebiet         TEXT,
  stufe          TEXT DEFAULT 'b1',
  gelesen        INT DEFAULT 0,

  -- Karteikasten, wie bei Vokabeln und Sätzen
  kategorie      TEXT DEFAULT 'lernen',
  kartenstufe    INT DEFAULT 0 CHECK (kartenstufe BETWEEN 0 AND 6),
  intervall      REAL,
  leichtigkeit   REAL,
  faellig_am     TIMESTAMPTZ DEFAULT NOW(),
  erstellt_am    TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (nutzer_id, text_id)
);

CREATE INDEX IF NOT EXISTS idx_lesetexte_faellig ON lesetexte(nutzer_id, faellig_am);


-- ------------------------------------------------------------
--  Zugriffsschutz: jeder sieht nur seine eigenen Texte
-- ------------------------------------------------------------

ALTER TABLE lesetexte ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eigene_lesetexte" ON lesetexte;
CREATE POLICY "eigene_lesetexte" ON lesetexte
  FOR ALL USING (auth.uid() = nutzer_id) WITH CHECK (auth.uid() = nutzer_id);
