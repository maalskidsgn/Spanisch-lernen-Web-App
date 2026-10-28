-- ============================================================
--  RANGLISTE + BENUTZERNAMEN  (28.10.2026)
-- ============================================================
-- Jeder wählt einen Benutzernamen, den es nur einmal gibt. Auf der
-- Startseite steht die Rangliste der zehn Lernenden mit den meisten XP.
--
-- Warum Funktionen statt einer offenen Leseregel: profile und statistik
-- bleiben privat (jeder sieht nur sich selbst). Die Funktionen laufen
-- als SECURITY DEFINER und geben NUR Benutzername, XP und Platz heraus –
-- keine E-Mail, keinen Anzeigenamen, keine IDs anderer Leute.
--
-- Mehrfach ausführbar.

-- 1. Spalte + Regeln ------------------------------------------------
ALTER TABLE profile ADD COLUMN IF NOT EXISTS benutzername TEXT;

-- 3–20 Zeichen: Buchstaben, Ziffern, Punkt, Unterstrich
ALTER TABLE profile DROP CONSTRAINT IF EXISTS benutzername_format;
ALTER TABLE profile ADD CONSTRAINT benutzername_format
  CHECK (benutzername IS NULL OR benutzername ~ '^[A-Za-z0-9_.]{3,20}$');

-- Eindeutig OHNE Groß/Klein: "Manuel" und "manuel" sind derselbe Name
CREATE UNIQUE INDEX IF NOT EXISTS profile_benutzername_eindeutig
  ON profile (lower(benutzername))
  WHERE benutzername IS NOT NULL;

-- Für die Rangliste: XP absteigend
CREATE INDEX IF NOT EXISTS idx_statistik_xp ON statistik (xp DESC);


-- 2. Ist ein Name noch frei? ----------------------------------------
-- Der eigene Name zählt als frei (sonst meldet das Umbenennen auf
-- dieselbe Schreibweise "vergeben").
CREATE OR REPLACE FUNCTION benutzername_frei(name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM profile
    WHERE lower(benutzername) = lower(name)
      AND id IS DISTINCT FROM auth.uid()
  );
$$;


-- 3. Die Top 10 (+ der eigene Platz) --------------------------------
-- Nur wer einen Benutzernamen hat, steht in der Liste – ohne Namen
-- gäbe es nichts Öffentliches zum Anzeigen.
-- Gleichstand: wer früher dabei war, steht weiter oben.
CREATE OR REPLACE FUNCTION rangliste(anzahl INT DEFAULT 10)
RETURNS TABLE (platz BIGINT, benutzername TEXT, xp INT, ich BOOLEAN)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH liste AS (
    SELECT
      ROW_NUMBER() OVER (ORDER BY COALESCE(s.xp, 0) DESC, p.erstellt_am ASC) AS platz,
      p.benutzername,
      COALESCE(s.xp, 0)::INT AS xp,
      COALESCE(p.id = auth.uid(), false) AS ich
    FROM profile p
    LEFT JOIN statistik s ON s.nutzer_id = p.id
    WHERE p.benutzername IS NOT NULL
  )
  SELECT platz, benutzername, xp, ich
  FROM liste
  WHERE platz <= LEAST(GREATEST(anzahl, 1), 50) OR ich
  ORDER BY platz;
$$;

REVOKE ALL ON FUNCTION rangliste(INT)        FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION benutzername_frei(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION rangliste(INT)        TO authenticated;
GRANT EXECUTE ON FUNCTION benutzername_frei(TEXT) TO authenticated;
