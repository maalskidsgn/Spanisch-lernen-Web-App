-- ============================================================
--  BENUTZERNAMEN AUTOMATISCH  (28.10.2026)
--  Einspielen: Supabase-Dashboard → SQL Editor → einfügen → "Run"
--  Setzt supabase-rangliste.sql voraus. Mehrfach ausführbar.
-- ============================================================
--
--  Bisher wurde jeder einmal gefragt, wie er heißen will. Das
--  hielt die Rangliste leer: Wer "Später" tippte, stand nie drin,
--  obwohl er XP gesammelt hat. Jetzt bekommt jeder automatisch
--  einen Namen aus dem, was er bei der Anmeldung angegeben hat.
--
--  Wer ihn nicht mag, ändert ihn unter Profil – aber dabei sein
--  ist man von Anfang an.

-- 1. Aus einem Anzeigenamen einen gültigen Benutzernamen machen
-- ------------------------------------------------------------
--  Muss zum CHECK aus supabase-rangliste.sql passen:
--  ^[A-Za-z0-9_.]{3,20}$ – also keine Umlaute, keine Leerzeichen.
--  Aus "Meloş" wird "Melos", aus "Anna Maria" wird "Anna_Maria".
CREATE OR REPLACE FUNCTION name_saeubern(roh TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(
    substring(
      regexp_replace(
        -- Umlaute und Akzente sinnvoll ersetzen, statt sie zu verlieren
        translate(
          trim(coalesce(roh, '')),
          'äöüÄÖÜßáàâãéèêíìîóòôõúùûñçşğıÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÑÇ ',
          'aouAOUsaaaaeeeiiioooouuuncsgiAAAAEEEIIIOOOOUUUNC_'
        ),
        -- alles, was danach noch nicht erlaubt ist, fliegt raus
        '[^A-Za-z0-9_.]', '', 'g'
      ),
      1, 20
    ),
  '');
$$;


-- 2. Einen freien Namen finden
-- ------------------------------------------------------------
--  Gibt es den Namen schon, wird gezählt: Anna, Anna2, Anna3 …
--  Ist nach der Säuberung nichts übrig (z. B. nur Emojis), gibt
--  es "Lernende" mit Nummer – nie die E-Mail-Adresse, die geht
--  niemanden etwas an.
CREATE OR REPLACE FUNCTION name_freimachen(roh TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  basis TEXT := name_saeubern(roh);
  kandidat TEXT;
  n INT := 1;
BEGIN
  IF basis IS NULL OR length(basis) < 3 THEN
    basis := coalesce(basis, '') || 'Lernende';
    basis := substring(basis, 1, 14);
  END IF;

  kandidat := basis;
  WHILE EXISTS (SELECT 1 FROM profile WHERE lower(benutzername) = lower(kandidat)) LOOP
    n := n + 1;
    -- Platz für die Zahl lassen, damit 20 Zeichen nicht überschritten werden
    kandidat := substring(basis, 1, 20 - length(n::text)) || n::text;
    IF n > 9999 THEN
      RETURN NULL;     -- gibt es praktisch nie; dann lieber ohne Namen
    END IF;
  END LOOP;

  RETURN kandidat;
END;
$$;


-- 3. Alle bestehenden Nutzer nachtragen
-- ------------------------------------------------------------
--  Einer nach dem anderen, weil jeder Name den nächsten
--  beeinflusst (zwei "Anne" dürfen nicht beide "Anne" heißen).
DO $$
DECLARE
  z RECORD;
  neuer TEXT;
BEGIN
  FOR z IN
    SELECT id, anzeigename FROM profile
    WHERE benutzername IS NULL
    ORDER BY erstellt_am
  LOOP
    neuer := name_freimachen(z.anzeigename);
    IF neuer IS NOT NULL THEN
      UPDATE profile SET benutzername = neuer WHERE id = z.id;
    END IF;
  END LOOP;
END $$;


-- 4. Für alle Neuen: Name kommt beim Anlegen des Profils
-- ------------------------------------------------------------
--  Greift sowohl beim Einfügen als auch dann, wenn der
--  Anzeigename später nachgetragen wird.
CREATE OR REPLACE FUNCTION profil_benutzername_setzen()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.benutzername IS NULL THEN
    NEW.benutzername := name_freimachen(NEW.anzeigename);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profil_benutzername ON profile;
CREATE TRIGGER profil_benutzername
  BEFORE INSERT OR UPDATE OF anzeigename ON profile
  FOR EACH ROW
  EXECUTE FUNCTION profil_benutzername_setzen();
