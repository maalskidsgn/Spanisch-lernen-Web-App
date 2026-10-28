-- ============================================================
--  RANGLISTE NACH ZEITRAUM  (28.10.2026)
--  Einspielen: Supabase-Dashboard → SQL Editor → einfügen → "Run"
--  Setzt supabase-rangliste.sql voraus. Mehrfach ausführbar.
-- ============================================================
--
--  Bisher gab es nur den Gesamtstand (statistik.xp). Für "dieser
--  Monat" und "dieses Jahr" muss mitgeschrieben werden, WANN die
--  XP verdient wurden – deshalb eine Zeile je Nutzer und Tag.
--
--  Wichtig: Rückwirkend gibt es diese Angaben nicht. Die Monats-
--  und Jahresliste beginnt am Tag der Einrichtung bei null und
--  füllt sich von da an. Die Gesamtliste ist davon unberührt, sie
--  liest weiter statistik.xp.

-- 1. XP pro Tag ------------------------------------------------
CREATE TABLE IF NOT EXISTS xp_tage (
  nutzer_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag         DATE NOT NULL,
  xp          INT  NOT NULL DEFAULT 0,
  PRIMARY KEY (nutzer_id, tag)
);

-- Für die Summen je Zeitraum
CREATE INDEX IF NOT EXISTS idx_xp_tage_tag ON xp_tage (tag);

ALTER TABLE xp_tage ENABLE ROW LEVEL SECURITY;

-- Jeder sieht und schreibt nur seine eigenen Tage. Die Rangliste
-- selbst liest über SECURITY DEFINER an dieser Regel vorbei und
-- gibt nur Name, XP und Platz heraus.
DROP POLICY IF EXISTS "eigene_xp_tage" ON xp_tage;
CREATE POLICY "eigene_xp_tage" ON xp_tage
  FOR ALL USING (auth.uid() = nutzer_id) WITH CHECK (auth.uid() = nutzer_id);


-- 2. Rangliste mit Zeitraum ------------------------------------
--  zeitraum: 'gesamt' (Standard) | 'monat' | 'jahr'
--
--  'gesamt' liest statistik.xp – das ist der gewachsene Stand und
--  bleibt auch dann richtig, wenn für frühere Tage nichts
--  mitgeschrieben wurde.
--  'monat' und 'jahr' summieren xp_tage ab dem Monats- bzw.
--  Jahresanfang. Wer in dem Zeitraum nichts gemacht hat, steht
--  nicht drin – eine Liste voller Nullen hilft niemandem.
CREATE OR REPLACE FUNCTION rangliste_zeitraum(zeitraum TEXT DEFAULT 'gesamt', anzahl INT DEFAULT 10)
RETURNS TABLE (platz BIGINT, benutzername TEXT, xp INT, ich BOOLEAN)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH grenze AS (
    SELECT CASE lower(zeitraum)
             WHEN 'monat' THEN date_trunc('month', CURRENT_DATE)::date
             WHEN 'jahr'  THEN date_trunc('year',  CURRENT_DATE)::date
             ELSE NULL                       -- gesamt: keine Grenze
           END AS ab
  ),
  punkte AS (
    SELECT
      p.id,
      p.benutzername,
      p.erstellt_am,
      CASE
        WHEN (SELECT ab FROM grenze) IS NULL
          THEN COALESCE(s.xp, 0)
        ELSE COALESCE((
          SELECT SUM(t.xp) FROM xp_tage t
          WHERE t.nutzer_id = p.id AND t.tag >= (SELECT ab FROM grenze)
        ), 0)
      END::INT AS xp
    FROM profile p
    LEFT JOIN statistik s ON s.nutzer_id = p.id
    WHERE p.benutzername IS NOT NULL
  ),
  liste AS (
    SELECT
      ROW_NUMBER() OVER (ORDER BY xp DESC, erstellt_am ASC) AS platz,
      benutzername,
      xp,
      COALESCE(id = auth.uid(), false) AS ich
    FROM punkte
    -- Bei Monat/Jahr nur zeigen, wer in dem Zeitraum etwas getan hat.
    -- Man selbst bleibt immer sichtbar, sonst wirkt es wie ein Fehler.
    WHERE (SELECT ab FROM grenze) IS NULL OR xp > 0 OR id = auth.uid()
  )
  SELECT platz, benutzername, xp, ich
  FROM liste
  WHERE platz <= LEAST(GREATEST(anzahl, 1), 50) OR ich
  ORDER BY platz;
$$;

REVOKE ALL ON FUNCTION rangliste_zeitraum(TEXT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION rangliste_zeitraum(TEXT, INT) TO authenticated;


-- 3. Tages-XP verbuchen ----------------------------------------
--  Die App ruft das beim Speichern der Statistik auf. Es setzt den
--  Wert für den Tag (nicht addieren): xp_heute ist bereits die
--  Tagessumme, und bei mehreren Geräten gewinnt der höhere Stand.
CREATE OR REPLACE FUNCTION xp_tag_merken(tag DATE, punkte INT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO xp_tage (nutzer_id, tag, xp)
  VALUES (auth.uid(), tag, GREATEST(punkte, 0))
  ON CONFLICT (nutzer_id, tag)
  DO UPDATE SET xp = GREATEST(xp_tage.xp, EXCLUDED.xp);
$$;

REVOKE ALL ON FUNCTION xp_tag_merken(DATE, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION xp_tag_merken(DATE, INT) TO authenticated;
