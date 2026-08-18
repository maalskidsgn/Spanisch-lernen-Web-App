-- ============================================================
--  HABLOO – Abo-Tabelle für Stripe erweitern
--  Einspielen: Supabase-Dashboard → SQL Editor → einfügen → "Run"
--  Kann gefahrlos mehrfach ausgeführt werden.
-- ============================================================
--
--  ACHTUNG, falls du eine frühere Fassung gesehen hast:
--  Die Tabelle "abos" gibt es bereits aus supabase-schema.sql.
--  Ein "CREATE TABLE IF NOT EXISTS" hätte deshalb stillschweigend
--  gar nichts getan. Diese Datei erweitert die vorhandene Tabelle,
--  statt eine zweite anzulegen – bestehende Zeilen bleiben erhalten.
--
--  Grundgedanke bleibt: Hier steht nicht, dass jemand gekauft hat,
--  sondern dass jemand berechtigt IST. Wo bezahlt wurde – Stripe,
--  Apple oder Google – merkt sich nur die Spalte "quelle".
-- ============================================================


-- ------------------------------------------------------------
--  1. Neue Spalten
-- ------------------------------------------------------------

-- Woher die Berechtigung stammt. "geschenk" ist praktisch, um
-- Testnutzern Premium zu geben, ohne eine Zahlung zu erfinden.
ALTER TABLE abos ADD COLUMN IF NOT EXISTS quelle TEXT NOT NULL DEFAULT 'stripe';

DO $$ BEGIN
  ALTER TABLE abos ADD CONSTRAINT abos_quelle_pruefung
    CHECK (quelle IN ('stripe', 'apple', 'google', 'geschenk'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Die Kennung beim Anbieter, z. B. die Stripe-Abo-ID "sub_123...".
-- Damit finden wir bei einer Rückfrage den passenden Vorgang.
ALTER TABLE abos ADD COLUMN IF NOT EXISTS extern_id TEXT;

ALTER TABLE abos ADD COLUMN IF NOT EXISTS geaendert_am TIMESTAMPTZ DEFAULT NOW();


-- ------------------------------------------------------------
--  2. Ein Abo pro Nutzer
-- ------------------------------------------------------------
-- Bisher gab es nur einen normalen Index. Für "anlegen oder
-- aktualisieren" (upsert) braucht die Datenbank aber die Zusage,
-- dass nutzer_id eindeutig ist – sonst wüsste sie nicht, welche
-- Zeile sie ersetzen soll.
--
-- Falls hier ein Fehler kommt, gibt es bereits mehrere Abos für
-- denselben Nutzer. Dann zuerst aufräumen:
--   SELECT nutzer_id, COUNT(*) FROM abos GROUP BY 1 HAVING COUNT(*) > 1;

DO $$ BEGIN
  ALTER TABLE abos ADD CONSTRAINT abos_ein_abo_pro_nutzer UNIQUE (nutzer_id);
EXCEPTION WHEN duplicate_table THEN NULL;
        WHEN duplicate_object THEN NULL;
END $$;


-- ------------------------------------------------------------
--  3. geaendert_am automatisch mitführen
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION abos_zeitstempel()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geaendert_am = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_abos_zeitstempel ON abos;
CREATE TRIGGER trg_abos_zeitstempel
  BEFORE UPDATE ON abos
  FOR EACH ROW EXECUTE FUNCTION abos_zeitstempel();


-- ------------------------------------------------------------
--  4. Eine Wahrheit für "ist Premium?"
-- ------------------------------------------------------------
-- laeuft_ab IS NULL bedeutet "lifetime" – also unbegrenzt.
-- Das muss hier ausdrücklich stehen, sonst würde ein Lifetime-Abo
-- als abgelaufen gelten.

CREATE OR REPLACE FUNCTION ist_premium(nutzer UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM abos
    WHERE nutzer_id = nutzer
      AND (laeuft_ab IS NULL OR laeuft_ab > NOW())
      AND status <> 'abgelaufen'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ------------------------------------------------------------
--  5. Zugriffsregeln prüfen
-- ------------------------------------------------------------
-- RLS und die Leseregel kommen schon aus supabase-schema.sql.
-- Hier nur zur Sicherheit noch einmal – mehrfaches Ausführen
-- schadet nicht.

ALTER TABLE abos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eigene_abos_lesen" ON abos;
CREATE POLICY "eigene_abos_lesen" ON abos
  FOR SELECT USING (auth.uid() = nutzer_id);

-- Schreiben: KEINE Richtlinie. Das ist Absicht, kein Vergessen.
--
-- Row Level Security verbietet alles, wofür es keine ausdrückliche
-- Erlaubnis gibt. Ohne INSERT/UPDATE/DELETE-Richtlinie kann sich
-- niemand mit dem öffentlichen Anon-Key selbst Premium eintragen –
-- auch nicht über die Browser-Konsole.
--
-- Der Server umgeht RLS mit dem Service-Role-Key. Nur er schreibt
-- hier, und erst nachdem Stripe eine Zahlung bestätigt hat.
