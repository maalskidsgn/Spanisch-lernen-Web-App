-- ============================================================
--  HABLOO – Datenbank-Schema für Supabase (PostgreSQL)
--  Einspielen: Supabase-Dashboard → SQL Editor → einfügen → "Run"
--  Kann gefahrlos mehrfach ausgeführt werden.
-- ============================================================


-- ============================================================
--  1. VIDEO-BIBLIOTHEK  (öffentlich, für alle Nutzer gleich)
-- ============================================================
-- Hier liegen die kuratierten Lernvideos MIT fertigem Transkript.
-- Befüllt wird die Tabelle von Manuels Mac aus (yt-dlp), damit der
-- Server YouTube nie selbst fragen muss.

CREATE TABLE IF NOT EXISTS videos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id   TEXT UNIQUE NOT NULL,        -- z.B. "Gr0lQAvGkR4"
  titel        TEXT NOT NULL,
  kanal        TEXT,
  dauer_sek    INT,
  thumbnail    TEXT,
  niveau       TEXT DEFAULT 'A1',           -- A1 | A2 | B1 | B2
  kategorie    TEXT DEFAULT 'allgemein',    -- musik, podcast, kochen, nachrichten …
  -- Das Transkript als Liste von Zeilen mit Zeitstempeln:
  -- [{"start": 1.2, "dauer": 2.4, "text": "Hola, ¿qué tal?"}, …]
  transkript   JSONB NOT NULL DEFAULT '[]'::jsonb,
  aktiv        BOOLEAN DEFAULT true,        -- false = ausblenden statt löschen
  erstellt_am  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_niveau    ON videos(niveau)    WHERE aktiv;
CREATE INDEX IF NOT EXISTS idx_videos_kategorie ON videos(kategorie) WHERE aktiv;


-- ============================================================
--  2. PROFILE  (ein Eintrag pro angemeldetem Nutzer)
-- ============================================================
-- Supabase legt Anmeldedaten selbst in "auth.users" ab.
-- Hier stehen nur unsere eigenen Zusatzfelder.

CREATE TABLE IF NOT EXISTS profile (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  anzeigename   TEXT,
  premium_bis   TIMESTAMPTZ,               -- NULL = kostenloser Tarif
  tagesziel_xp  INT DEFAULT 30,
  erstellt_am   TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  3. VOKABELN  (pro Nutzer, mit Spaced Repetition)
-- ============================================================

CREATE TABLE IF NOT EXISTS vokabeln (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutzer_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wort_es        TEXT NOT NULL,
  uebersetzung   TEXT NOT NULL,
  beispielsatz   TEXT,
  kategorie      TEXT DEFAULT 'allgemein',
  -- Karteikasten-Stufe: 0=neu, 1=1 Tag, 2=3 Tage, 3=7, 4=14, 5=30, 6=90 Tage
  stufe          INT DEFAULT 0 CHECK (stufe BETWEEN 0 AND 6),
  faellig_am     TIMESTAMPTZ DEFAULT NOW(),
  richtig        INT DEFAULT 0,
  falsch         INT DEFAULT 0,
  erstellt_am    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (nutzer_id, wort_es)
);

-- Für die häufigste Abfrage: "welche Vokabeln sind jetzt fällig?"
CREATE INDEX IF NOT EXISTS idx_vokabeln_faellig ON vokabeln(nutzer_id, faellig_am);


-- ============================================================
--  4. GESPEICHERTE VIDEOS  (Nutzer merkt sich ein Video)
-- ============================================================

CREATE TABLE IF NOT EXISTS gespeicherte_videos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutzer_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id     UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  kategorie    TEXT DEFAULT 'allgemein',
  erstellt_am  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (nutzer_id, video_id)
);


-- ============================================================
--  5. LEKTIONS-FORTSCHRITT
-- ============================================================

CREATE TABLE IF NOT EXISTS lektion_fortschritt (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutzer_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lektion_id   TEXT NOT NULL,              -- z.B. "begruessung"
  erledigt_am  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (nutzer_id, lektion_id)
);


-- ============================================================
--  6. STATISTIK  (XP, Level, Serie – ein Eintrag pro Nutzer)
-- ============================================================

CREATE TABLE IF NOT EXISTS statistik (
  nutzer_id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp               INT DEFAULT 0,
  level            INT DEFAULT 1,
  serie            INT DEFAULT 0,          -- Streak in Tagen
  letzter_tag      DATE,
  xp_heute         INT DEFAULT 0,
  ki_nutzung       JSONB DEFAULT '{}'::jsonb,  -- Freemium-Zähler {"videoGen": 3, …}
  aktualisiert_am  TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  7. ABOS
-- ============================================================

CREATE TABLE IF NOT EXISTS abos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutzer_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tarif        TEXT NOT NULL CHECK (tarif IN ('monatlich','jaehrlich','lifetime')),
  preis_eur    NUMERIC(6,2),
  status       TEXT DEFAULT 'aktiv' CHECK (status IN ('aktiv','gekuendigt','abgelaufen')),
  start_am     TIMESTAMPTZ DEFAULT NOW(),
  laeuft_ab    TIMESTAMPTZ,                -- NULL bei lifetime
  erstellt_am  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abos_nutzer ON abos(nutzer_id, status);


-- ============================================================
--  8. SICHERHEIT (Row Level Security)
-- ============================================================
-- Ohne RLS könnte jeder mit dem öffentlichen Schlüssel ALLE Daten
-- lesen. Mit RLS sieht jeder Nutzer nur noch seine eigenen Zeilen –
-- das erzwingt die Datenbank selbst, nicht unser Code.

ALTER TABLE videos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile             ENABLE ROW LEVEL SECURITY;
ALTER TABLE vokabeln            ENABLE ROW LEVEL SECURITY;
ALTER TABLE gespeicherte_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lektion_fortschritt ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistik           ENABLE ROW LEVEL SECURITY;
ALTER TABLE abos                ENABLE ROW LEVEL SECURITY;

-- Die Video-Bibliothek darf JEDER lesen (auch ohne Anmeldung).
-- Schreiben darf nur der Server mit dem geheimen service_role-Schlüssel,
-- der RLS ohnehin umgeht – deshalb hier bewusst keine Schreibregel.
DROP POLICY IF EXISTS "bibliothek_oeffentlich_lesen" ON videos;
CREATE POLICY "bibliothek_oeffentlich_lesen" ON videos
  FOR SELECT USING (aktiv = true);

-- Alle übrigen Tabellen: jeder sieht und ändert ausschließlich das Eigene.
-- (FOR ALL deckt SELECT, INSERT, UPDATE und DELETE gemeinsam ab.)
DROP POLICY IF EXISTS "eigenes_profil" ON profile;
CREATE POLICY "eigenes_profil" ON profile
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "eigene_vokabeln" ON vokabeln;
CREATE POLICY "eigene_vokabeln" ON vokabeln
  FOR ALL USING (auth.uid() = nutzer_id) WITH CHECK (auth.uid() = nutzer_id);

DROP POLICY IF EXISTS "eigene_videos" ON gespeicherte_videos;
CREATE POLICY "eigene_videos" ON gespeicherte_videos
  FOR ALL USING (auth.uid() = nutzer_id) WITH CHECK (auth.uid() = nutzer_id);

DROP POLICY IF EXISTS "eigener_fortschritt" ON lektion_fortschritt;
CREATE POLICY "eigener_fortschritt" ON lektion_fortschritt
  FOR ALL USING (auth.uid() = nutzer_id) WITH CHECK (auth.uid() = nutzer_id);

DROP POLICY IF EXISTS "eigene_statistik" ON statistik;
CREATE POLICY "eigene_statistik" ON statistik
  FOR ALL USING (auth.uid() = nutzer_id) WITH CHECK (auth.uid() = nutzer_id);

-- Abos darf der Nutzer nur ANSEHEN – angelegt werden sie vom Server
-- nach einer echten Zahlung, sonst könnte sich jeder Premium schenken.
DROP POLICY IF EXISTS "eigene_abos_lesen" ON abos;
CREATE POLICY "eigene_abos_lesen" ON abos
  FOR SELECT USING (auth.uid() = nutzer_id);


-- ============================================================
--  9. AUTOMATIK: Profil + Statistik bei Registrierung anlegen
-- ============================================================
-- Sobald sich jemand registriert, legt Supabase eine Zeile in
-- auth.users an. Dieser Auslöser ergänzt automatisch die beiden
-- Zeilen, die unsere App braucht.

CREATE OR REPLACE FUNCTION neuer_nutzer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profile (id, anzeigename)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO statistik (nutzer_id)
  VALUES (NEW.id)
  ON CONFLICT (nutzer_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bei_neuer_registrierung ON auth.users;
CREATE TRIGGER bei_neuer_registrierung
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION neuer_nutzer();


-- ============================================================
--  Fertig. Prüfung: welche Tabellen sind jetzt da?
-- ============================================================
SELECT table_name AS tabelle
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
