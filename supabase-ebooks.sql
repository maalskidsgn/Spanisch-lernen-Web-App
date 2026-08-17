-- ============================================================
--  HABLOO – Bilinguale E-Books
--  Einspielen: Supabase-Dashboard → SQL Editor → "Run"
-- ============================================================

CREATE TABLE IF NOT EXISTS ebooks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- NULL = Beispiel-Buch, das alle Nutzer sehen.
  -- Sonst: das Buch gehört diesem einen Nutzer.
  nutzer_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titel        TEXT NOT NULL,
  autor        TEXT,
  thema        TEXT,
  niveau       TEXT DEFAULT 'A2',           -- A1 | A2 | B1 | B2
  -- Die Kapitel als Liste von Absatzpaaren:
  -- [{"es": "Hola…", "de": "Hallo…"}, …]
  kapitel      JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Die wichtigsten Wörter: [{"es": "playa", "de": "Strand"}, …]
  vokabeln     JSONB NOT NULL DEFAULT '[]'::jsonb,
  ist_beispiel BOOLEAN DEFAULT false,
  erstellt_am  TIMESTAMPTZ DEFAULT NOW()
);

-- Für die Freemium-Prüfung: "wie viele hat dieser Nutzer diesen Monat erzeugt?"
CREATE INDEX IF NOT EXISTS idx_ebooks_nutzer_monat
  ON ebooks(nutzer_id, erstellt_am DESC);

CREATE INDEX IF NOT EXISTS idx_ebooks_beispiele
  ON ebooks(ist_beispiel) WHERE ist_beispiel;

-- ---------- Sicherheit ----------
ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;

-- Jeder angemeldete Nutzer sieht die Beispiel-Bücher UND seine eigenen.
DROP POLICY IF EXISTS "ebooks_lesen" ON ebooks;
CREATE POLICY "ebooks_lesen" ON ebooks
  FOR SELECT USING (ist_beispiel = true OR auth.uid() = nutzer_id);

-- Löschen darf man nur die eigenen Bücher (Beispiele bleiben bestehen).
DROP POLICY IF EXISTS "ebooks_eigene_loeschen" ON ebooks;
CREATE POLICY "ebooks_eigene_loeschen" ON ebooks
  FOR DELETE USING (auth.uid() = nutzer_id);

-- Angelegt werden Bücher ausschließlich vom Server (service_role),
-- damit niemand das Monatslimit umgehen kann – deshalb keine
-- INSERT-Regel für normale Nutzer.

-- ---------- Prüfung ----------
SELECT 'ebooks angelegt' AS status;
