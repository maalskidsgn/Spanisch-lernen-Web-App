-- ============================================================
--  HABLOO – Tageskontingente
--  Einspielen: Supabase-Dashboard → SQL Editor → einfügen → "Run"
--  Kann gefahrlos mehrfach ausgeführt werden.
-- ============================================================
--
--  Warum serverseitig: Ein Zähler im Browser ist keine Grenze,
--  sondern eine Bitte – Konsole auf, Eintrag löschen, weiter.
--  Jeder Abruf kostet uns aber echtes Geld (Transkript-Dienst,
--  OpenAI). Deshalb zählt der Server mit, und zwar hier.
--
--  Bewusst allgemein gehalten: `art` unterscheidet, worum es
--  geht ('video' heute, später beliebig mehr). So braucht keine
--  weitere Begrenzung eine eigene Tabelle.
-- ============================================================

CREATE TABLE IF NOT EXISTS nutzung (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutzer_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag          DATE NOT NULL,
  art          TEXT NOT NULL,
  anzahl       INT  NOT NULL DEFAULT 0,
  erstellt_am  TIMESTAMPTZ DEFAULT NOW(),

  -- Eine Zeile je Nutzer, Tag und Art – Voraussetzung für das
  -- "anlegen oder hochzählen" (upsert) des Servers.
  UNIQUE (nutzer_id, tag, art)
);

CREATE INDEX IF NOT EXISTS idx_nutzung_heute ON nutzung(nutzer_id, tag, art);


-- ------------------------------------------------------------
--  Zugriffsschutz
-- ------------------------------------------------------------
--
--  Lesen darf jeder seine eigene Zeile (für die Anzeige
--  "noch 1 Video heute"). SCHREIBEN darf nur der Server über
--  den Service-Key, der die Regeln ohnehin umgeht – sonst
--  könnte sich jeder sein Kontingent selbst zurücksetzen.

ALTER TABLE nutzung ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eigene_nutzung_lesen" ON nutzung;
CREATE POLICY "eigene_nutzung_lesen" ON nutzung
  FOR SELECT USING (auth.uid() = nutzer_id);
