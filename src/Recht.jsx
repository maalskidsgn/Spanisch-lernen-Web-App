/**
 * Impressum, Datenschutzerklärung und AGB.
 *
 * WICHTIG für alle, die hier etwas ändern: Die Liste der
 * Datenempfänger in der Datenschutzerklärung ist am 23.08.2026 aus
 * dem Quelltext ERHOBEN worden, nicht abgeschrieben – jeder Eintrag
 * entspricht einem Aufruf, den der Code wirklich macht. Wer einen
 * Dienst hinzufügt oder entfernt, muss diese Liste nachziehen, sonst
 * stimmt die Erklärung nicht mehr.
 *
 * Nachprüfen lässt sich das so:
 *   grep -rhoE "https://[a-z0-9.-]+\.[a-z]{2,}" src/ server/ | sort -u
 *
 * Zwei Feinheiten, die beim Erheben aufgefallen sind und oft falsch
 * in solchen Texten stehen:
 *
 *   ElevenLabs steht NICHT in der Liste. Die Stimmen sind einmal
 *   vorab erzeugt und liegen als fertige Dateien im Speicher – im
 *   laufenden Betrieb geht kein Nutzerdatum dorthin.
 *
 *   Anthropic verarbeitet nur bei Premium (E-Books), nicht bei allen.
 */

import { useEffect } from 'react'

const STAND = '23. August 2026'

/* ---------- Bausteine, damit alle drei Seiten gleich aussehen ---------- */

function Seite({ titel, kinder, onZurueck }) {
  // Ohne das oeffnet sich die Seite an der Scrollposition, von der
  // aus man sie angeklickt hat – man landet mitten im Text.
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="recht">
      <button className="recht-zurueck" onClick={onZurueck}>← Zurück</button>
      <h1>{titel}</h1>
      {kinder}
      <p className="recht-stand">Stand: {STAND}</p>
    </div>
  )
}

const H2 = ({ children }) => <h2 className="recht-h2">{children}</h2>
const H3 = ({ children }) => <h3 className="recht-h3">{children}</h3>
const P = ({ children, className }) => (
  <p className={className ? 'recht-p ' + className : 'recht-p'}>{children}</p>
)

/* ================================================================
   IMPRESSUM
   ================================================================ */

export function Impressum({ onZurueck }) {
  return (
    <Seite titel="Impressum" onZurueck={onZurueck} kinder={<>
      <H2>Angaben gemäß § 5 DDG</H2>
      <P>
        Manuel Killert – Einzelunternehmer<br />
        Klarwerk Digital<br />
        Geschwister-Scholl-Straße 27<br />
        49610 Quakenbrück<br />
        Deutschland
      </P>

      <H2>Kontakt</H2>
      <P>
        Telefon: +49 173 7439196<br />
        E-Mail: <a href="mailto:lernen@habloo.de">lernen@habloo.de</a>
      </P>

      <H2>Umsatzsteuer-Identifikationsnummer</H2>
      <P>Gemäß § 27 a Umsatzsteuergesetz: DE323508810</P>

      <H2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</H2>
      <P>
        Manuel Killert<br />
        Geschwister-Scholl-Straße 27<br />
        49610 Quakenbrück
      </P>

      <H2>Streitbeilegung</H2>
      <P>
        Die Europäische Kommission stellt eine Plattform zur
        Online-Streitbeilegung bereit:{' '}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">
          ec.europa.eu/consumers/odr
        </a>
      </P>
      <P>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor
        einer Verbraucherschlichtungsstelle teilzunehmen.
      </P>
    </>} />
  )
}

/* ================================================================
   DATENSCHUTZERKLÄRUNG
   ================================================================ */

/** Ein Empfänger in der Übersicht – Zweck, Daten, Sitz, Grundlage. */
function Empfaenger({ name, sitz, zweck, daten, grundlage, drittland }) {
  return (
    <div className="recht-dienst">
      <h4>{name}</h4>
      <dl>
        <dt>Zweck</dt><dd>{zweck}</dd>
        <dt>Übermittelte Daten</dt><dd>{daten}</dd>
        <dt>Anbieter / Sitz</dt><dd>{sitz}</dd>
        <dt>Rechtsgrundlage</dt><dd>{grundlage}</dd>
        {drittland && <><dt>Drittland</dt><dd>{drittland}</dd></>}
      </dl>
    </div>
  )
}

export function Datenschutz({ onZurueck }) {
  return (
    <Seite titel="Datenschutzerklärung" onZurueck={onZurueck} kinder={<>
      <H2>1. Verantwortlicher</H2>
      <P>
        Manuel Killert, Geschwister-Scholl-Straße 27, 49610 Quakenbrück,
        Deutschland. E-Mail: <a href="mailto:lernen@habloo.de">lernen@habloo.de</a>.
        Einen Datenschutzbeauftragten haben wir nicht bestellt; dazu sind wir
        nicht verpflichtet.
      </P>

      <H2>2. Was Habloo von dir verarbeitet</H2>

      <H3>Ohne Konto</H3>
      <P>
        Du kannst die Startseite ansehen und den Einstiegsfragebogen durchklicken,
        ohne ein Konto anzulegen. Dabei speichern wir keine personenbezogenen
        Daten auf unseren Servern. Deine Antworten und das daraus gewählte
        Startpaket liegen ausschließlich im Speicher deines Geräts, bis du dich
        anmeldest.
      </P>

      <H3>Mit Konto</H3>
      <P>
        Für ein Konto brauchen wir deine E-Mail-Adresse und ein Passwort;
        freiwillig kannst du einen Anzeigenamen angeben. Beim Lernen entstehen
        außerdem: deine gesammelten Vokabeln samt Lernstand, abgeschlossene
        Lektionen, Punkte, Level und Tagesserie, gemerkte Videos und Songs sowie
        – bei Premium – erzeugte E-Books.
      </P>
      <P>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO: Ohne diese Daten lässt
        sich der Dienst nicht erbringen, denn genau darin besteht er.
      </P>

      <H3>Server-Protokolle</H3>
      <P>
        Beim Aufruf entstehen technische Protokolldaten (IP-Adresse, Zeitpunkt,
        abgerufene Adresse, Browsertyp). Sie dienen dem sicheren Betrieb und
        werden kurzfristig gelöscht. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
        DSGVO – unser berechtigtes Interesse an einem funktionierenden,
        angriffssicheren Dienst.
      </P>

      <H2>3. An wen Daten weitergegeben werden</H2>
      <P>
        Diese Liste ist vollständig und aus dem Programmcode erhoben. Weitergegeben
        wird jeweils nur, was für den genannten Zweck nötig ist.
      </P>

      <Empfaenger
        name="Supabase"
        zweck="Konto, Anmeldung und Speicherung deines Lernfortschritts"
        daten="E-Mail-Adresse, Passwort (verschlüsselt), Anzeigename, Vokabeln, Lektionsfortschritt, Punktestand, Abo-Status"
        sitz="Supabase Inc., San Francisco, USA – Datenhaltung in der EU"
        grundlage="Art. 6 Abs. 1 lit. b DSGVO (Vertrag), Auftragsverarbeitung nach Art. 28"
      />
      <Empfaenger
        name="Hetzner Online GmbH"
        zweck="Betrieb von Website und Anwendungsserver"
        daten="Alle Anfragen an habloo.de, technische Protokolldaten"
        sitz="Hetzner Online GmbH, Gunzenhausen, Deutschland – Rechenzentrum Falkenstein"
        grundlage="Art. 6 Abs. 1 lit. b und f DSGVO, Auftragsverarbeitung nach Art. 28"
      />
      <Empfaenger
        name="OpenAI"
        zweck="Erzeugen von Vokabellisten und zusätzlichen Grammatikaufgaben, Übersetzen von Wörtern und Untertiteln"
        daten="Der jeweils zu übersetzende Text bzw. das gewählte Thema und – zur Vermeidung von Wiederholungen – eine Liste bereits gelernter Wörter. Keine E-Mail-Adresse, keine Kontokennung."
        sitz="OpenAI Ireland Ltd., Dublin, Irland"
        grundlage="Art. 6 Abs. 1 lit. b DSGVO"
        drittland="Verarbeitung kann in den USA erfolgen; abgesichert über Standardvertragsklauseln."
      />
      <Empfaenger
        name="Anthropic (nur Premium)"
        zweck="Erzeugen zweisprachiger E-Books zu deinem Wunschthema"
        daten="Das von dir angegebene Thema und dein Niveau. Keine E-Mail-Adresse, keine Kontokennung."
        sitz="Anthropic PBC, San Francisco, USA"
        grundlage="Art. 6 Abs. 1 lit. b DSGVO"
        drittland="USA, abgesichert über Standardvertragsklauseln."
      />
      <Empfaenger
        name="Google / YouTube"
        zweck="Eingebettete Lernvideos, Vorschaubilder und Videosuche"
        daten="Beim Abspielen eines Videos: IP-Adresse und Geräteinformationen an YouTube. Bei der Suche: dein Suchbegriff. Wir betten Videos im erweiterten Datenschutzmodus ein (youtube-nocookie), dennoch stellt YouTube beim Abspielen eine Verbindung her."
        sitz="Google Ireland Ltd., Dublin, Irland"
        grundlage="Art. 6 Abs. 1 lit. b DSGVO"
        drittland="USA, abgesichert über Standardvertragsklauseln."
      />
      <Empfaenger
        name="Google Analytics"
        zweck="Anonyme Reichweitenmessung – wie viele Menschen Habloo nutzen und über welche Wege sie herkommen"
        daten="Gekürzte IP-Adresse, Seitenaufrufe, Gerätetyp, Herkunftsseite. Cookies mit den Namen _ga und _ga_*."
        sitz="Google Ireland Ltd., Dublin, Irland"
        grundlage="Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG – ausschließlich nach deiner Einwilligung. Ohne Einwilligung wird kein Skript geladen und kein Cookie gesetzt. Widerruf jederzeit unter „Mehr → Messung“."
        drittland="USA, abgesichert über Standardvertragsklauseln."
      />
      <Empfaenger
        name="Stripe"
        zweck="Abwicklung der Premium-Zahlung"
        daten="E-Mail-Adresse und eine Kennung deines Kontos. Deine Zahlungsdaten gibst du unmittelbar bei Stripe ein; wir sehen und speichern sie nicht."
        sitz="Stripe Payments Europe Ltd., Dublin, Irland"
        grundlage="Art. 6 Abs. 1 lit. b DSGVO"
      />
      <Empfaenger
        name="Spotify (nur wenn du es verbindest)"
        zweck="Songvorschläge auf Grundlage deines Musikgeschmacks"
        daten="Nach deiner Freigabe liest Habloo deine gespeicherten Titel, deine privaten Playlists und deine meistgehörten Künstler (Berechtigungen: user-library-read, playlist-read-private, user-top-read). Die Verbindung kannst du jederzeit trennen."
        sitz="Spotify AB, Stockholm, Schweden"
        grundlage="Art. 6 Abs. 1 lit. a DSGVO – nur nach ausdrücklicher Freigabe durch dich"
      />
      <Empfaenger
        name="TubeAlfred"
        zweck="Abruf von Video-Untertiteln, wenn unser Server sie nicht selbst laden kann"
        daten="Die Kennung des Videos. Keine personenbezogenen Daten."
        sitz="TubeAlfred, EU"
        grundlage="Art. 6 Abs. 1 lit. b DSGVO"
      />
      <Empfaenger
        name="ALL-INKL.COM – Neue Medien Münnich"
        zweck="Versand von Bestätigungs- und Passwort-E-Mails"
        daten="Deine E-Mail-Adresse und der Inhalt der jeweiligen Nachricht"
        sitz="Neue Medien Münnich, Friedersdorf, Deutschland"
        grundlage="Art. 6 Abs. 1 lit. b DSGVO, Auftragsverarbeitung nach Art. 28"
      />

      <P className="recht-hinweis">
        <b>Nicht in dieser Liste – und warum:</b> Die Sprachaufnahmen im Kurs
        wurden einmalig vorab mit einem Sprachdienst erzeugt und liegen seither
        als fertige Audiodateien auf unserem Speicher. Beim Lernen wird nichts
        an diesen Dienst übermittelt.
      </P>

      <H2>4. Cookies und Speicherung auf deinem Gerät</H2>
      <P>
        Habloo speichert deinen Lernstand im lokalen Speicher deines Browsers,
        damit die App auch ohne Verbindung funktioniert und schnell startet. Das
        ist technisch notwendig (§ 25 Abs. 2 Nr. 2 TDDDG) und braucht keine
        Einwilligung. Ein Cookie zur Anmeldung setzt Supabase, solange du
        angemeldet bist.
      </P>
      <P>
        Cookies zur Reichweitenmessung (Google Analytics) setzen wir
        ausschließlich nach deiner Einwilligung über den Hinweis beim ersten
        Besuch. Du kannst sie jederzeit unter „Mehr → Messung“ widerrufen; die
        Cookies werden dann gelöscht.
      </P>

      <H2>5. Wie lange wir speichern</H2>
      <P>
        Kontodaten und Lernfortschritt speichern wir, solange dein Konto besteht.
        Löschst du dein Konto unter „Mehr → Konto löschen“, werden alle
        zugehörigen Daten unwiderruflich entfernt. Rechnungsdaten bewahren wir
        aufgrund steuerrechtlicher Pflichten zehn Jahre auf (§ 147 AO).
      </P>

      <H2>6. Deine Rechte</H2>
      <P>
        Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16),
        Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
        Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO). Eine
        erteilte Einwilligung kannst du jederzeit mit Wirkung für die Zukunft
        widerrufen.
      </P>
      <P>
        Für Auskunft und Löschung genügt eine E-Mail an{' '}
        <a href="mailto:lernen@habloo.de">lernen@habloo.de</a>. Deinen gesamten
        Lernstand kannst du außerdem jederzeit selbst unter „Mehr → Backup
        erstellen“ als Datei herunterladen.
      </P>
      <P>
        Du kannst dich bei einer Aufsichtsbehörde beschweren. Für uns zuständig
        ist die Landesbeauftragte für Datenschutz Niedersachsen, Prinzenstraße 5,
        30159 Hannover.
      </P>

      <H2>7. Änderungen</H2>
      <P>
        Wenn sich Habloo ändert, ändert sich diese Erklärung mit. Es gilt jeweils
        die hier veröffentlichte Fassung.
      </P>
    </>} />
  )
}

/* ================================================================
   AGB
   ================================================================ */

export function AGB({ onZurueck }) {
  return (
    <Seite titel="Allgemeine Geschäftsbedingungen" onZurueck={onZurueck} kinder={<>
      <H2>§ 1 Geltungsbereich und Anbieter</H2>
      <P>
        Diese Bedingungen gelten für die Nutzung der Sprachlern-Anwendung Habloo,
        angeboten von Manuel Killert, Geschwister-Scholl-Straße 27, 49610
        Quakenbrück („wir“). Vertragspartner bist du als Nutzer.
      </P>

      <H2>§ 2 Was Habloo ist</H2>
      <P>
        Habloo ist eine Anwendung zum Spanischlernen mit geführten Lektionen,
        einem Vokabeltrainer, Hörverstehensübungen und einer Mediathek mit
        Videos, Songs und E-Books. Teile der Inhalte werden mit Hilfe künstlicher
        Intelligenz erzeugt.
      </P>
      <P>
        Habloo ist ein Lernangebot, keine Unterrichtsleistung und keine
        Prüfungsvorbereitung mit zugesichertem Ergebnis. Einen bestimmten
        Lernerfolg schulden wir nicht.
      </P>

      <H2>§ 3 Konto</H2>
      <P>
        Für die Nutzung ist ein Konto erforderlich. Du musst mindestens 16 Jahre
        alt sein; jüngere Nutzer brauchen die Einwilligung der Eltern. Halte dein
        Passwort geheim und gib dein Konto nicht weiter.
      </P>

      <H2>§ 4 Kostenlose Nutzung und Premium</H2>
      <P>
        Alle Lernfunktionen sind kostenlos nutzbar. Premium schaltet die
        KI-Werkzeuge ohne Tageslimit frei: unbegrenzte Vokabellisten und
        E-Books sowie Statistiken zu deinem Fortschritt.
      </P>
      <P>
        Die jeweils geltenden Preise stehen in der Anwendung. Zum Zeitpunkt
        dieser Fassung: 5,99 € monatlich, 50 € jährlich oder 89 € einmalig für
        dauerhaften Zugang. Alle Preise verstehen sich inklusive gesetzlicher
        Umsatzsteuer.
      </P>

      <H2>§ 5 Vertragsschluss</H2>
      <P>
        Mit dem Anlegen eines Kontos kommt ein unentgeltlicher Nutzungsvertrag
        zustande. Ein Premium-Vertrag kommt zustande, wenn du den
        Bestellvorgang über unseren Zahlungsdienstleister Stripe abschließt. Wir
        bestätigen dir den Vertrag per E-Mail.
      </P>

      <H2>§ 6 Laufzeit und Kündigung</H2>
      <P>
        Das Monatsabo läuft einen Monat und verlängert sich um jeweils einen
        weiteren Monat, wenn du es nicht bis zum Ende der Laufzeit kündigst. Das
        Jahresabo läuft ein Jahr und verlängert sich nach dem ersten Jahr um
        jeweils einen Monat (§ 312k BGB). Der Einmalkauf hat keine Laufzeit.
      </P>
      <P>
        Kündigen kannst du jederzeit unter „Mehr → Abo verwalten“ – ohne
        Begründung und ohne Frist bis zum Ende der laufenden Periode. Das
        kostenlose Konto kannst du jederzeit unter „Mehr → Konto löschen“
        beenden.
      </P>

      <H2>§ 7 Widerrufsrecht für Verbraucher</H2>
      <div className="recht-kasten">
        <H3>Widerrufsbelehrung</H3>
        <P>
          Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen
          Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem
          Tag des Vertragsabschlusses.
        </P>
        <P>
          Um dein Widerrufsrecht auszuüben, musst du uns – Manuel Killert,
          Geschwister-Scholl-Straße 27, 49610 Quakenbrück,{' '}
          <a href="mailto:lernen@habloo.de">lernen@habloo.de</a> – mittels einer
          eindeutigen Erklärung (z. B. per E-Mail) über deinen Entschluss
          informieren. Zur Wahrung der Frist reicht es, dass du die Mitteilung vor
          Ablauf der Frist absendest.
        </P>
        <P>
          <b>Folgen des Widerrufs:</b> Wenn du diesen Vertrag widerrufst,
          erstatten wir dir alle Zahlungen unverzüglich und spätestens binnen
          vierzehn Tagen ab dem Tag zurück, an dem die Mitteilung über deinen
          Widerruf bei uns eingegangen ist. Für die Rückzahlung verwenden wir
          dasselbe Zahlungsmittel, das du eingesetzt hast; dafür entstehen dir
          keine Kosten.
        </P>
        <P>
          <b>Vorzeitiges Erlöschen:</b> Dein Widerrufsrecht erlischt vorzeitig,
          wenn wir mit der Leistung begonnen haben, nachdem du ausdrücklich
          zugestimmt hast, dass wir vor Ablauf der Widerrufsfrist beginnen, und du
          bestätigt hast, dass du dein Widerrufsrecht damit verlierst
          (§ 356 Abs. 5 BGB).
        </P>
      </div>

      <H2>§ 8 Inhalte, die eine KI erzeugt</H2>
      <P>
        Vokabellisten, zusätzliche Übungen, E-Books und Übersetzungen erzeugen
        wir zum Teil automatisch. Solche Inhalte können Fehler enthalten. Wir
        prüfen sie mit automatischen Regeln, können aber nicht für die Richtigkeit
        jedes einzelnen Satzes einstehen. Verlasse dich bei wichtigen
        Angelegenheiten nicht allein darauf.
      </P>

      <H2>§ 9 Inhalte Dritter</H2>
      <P>
        Habloo bindet Videos von YouTube ein und kann auf Wunsch auf Spotify
        zugreifen. Für diese Inhalte gelten zusätzlich die Bedingungen der
        jeweiligen Anbieter. Auf Verfügbarkeit und Inhalt haben wir keinen
        Einfluss.
      </P>

      <H2>§ 10 Deine Pflichten</H2>
      <P>
        Nutze Habloo nicht missbräuchlich: kein automatisiertes Auslesen, kein
        Umgehen von Nutzungsgrenzen, keine Weitergabe von Zugangsdaten, keine
        Nutzung für rechtswidrige Zwecke. Bei erheblichen Verstößen dürfen wir
        das Konto sperren.
      </P>

      <H2>§ 11 Verfügbarkeit</H2>
      <P>
        Wir bemühen uns um einen durchgehenden Betrieb, schulden aber keine
        bestimmte Verfügbarkeit. Wartungsarbeiten, Störungen und Ausfälle bei
        Diensten Dritter können zu Unterbrechungen führen. Bei längeren
        Ausfällen im Premium-Zeitraum erstatten wir anteilig.
      </P>

      <H2>§ 12 Haftung</H2>
      <P>
        Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei
        Verletzung von Leben, Körper und Gesundheit. Bei einfacher Fahrlässigkeit
        haften wir nur für die Verletzung wesentlicher Vertragspflichten – also
        solcher, deren Erfüllung den Vertrag überhaupt erst ermöglicht – und der
        Höhe nach begrenzt auf den vertragstypischen, vorhersehbaren Schaden. Die
        Haftung nach dem Produkthaftungsgesetz bleibt unberührt.
      </P>

      <H2>§ 13 Änderungen dieser Bedingungen</H2>
      <P>
        Wir dürfen diese Bedingungen ändern, wenn dafür ein sachlicher Grund
        besteht. Über Änderungen informieren wir dich mindestens sechs Wochen
        vorher per E-Mail. Widersprichst du nicht bis zum Wirksamwerden, gelten
        sie als angenommen; darauf weisen wir in der Mitteilung gesondert hin.
        Widersprichst du, dürfen wir zum Ende der Laufzeit kündigen.
      </P>

      <H2>§ 14 Schlussbestimmungen</H2>
      <P>
        Es gilt deutsches Recht. Ist eine Bestimmung unwirksam, bleibt der übrige
        Vertrag wirksam. Zur Teilnahme an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle sind wir nicht bereit oder verpflichtet.
      </P>
    </>} />
  )
}

/* ================================================================
   KONTO LÖSCHEN

   Google Play verlangt für jede App, in der man ein Konto anlegen
   kann, eine ÖFFENTLICH aufrufbare Adresse, unter der man die
   Löschung anstoßen kann – erreichbar auch für jemanden, der die App
   schon deinstalliert hat und deshalb nicht mehr an den Knopf in den
   Einstellungen kommt. Genau dafür gibt es diese Seite.
   ================================================================ */

export function KontoLoeschen({ onZurueck }) {
  return (
    <Seite titel="Konto und Daten löschen" onZurueck={onZurueck} kinder={<>
      <P>
        Du kannst dein Habloo-Konto jederzeit löschen. Es gibt zwei Wege –
        beide löschen dasselbe.
      </P>

      <H2>In der App</H2>
      <P>
        Öffne <b>Mehr</b> und scrolle nach unten zu <b>Konto löschen</b>.
        Nach zwei Rückfragen ist das Konto weg. Das ist der schnellste Weg.
      </P>

      <H2>Per E-Mail</H2>
      <P>
        Wenn du die App schon gelöscht hast oder nicht mehr hineinkommst,
        schreib an{' '}
        <a href="mailto:lernen@habloo.de?subject=Konto%20l%C3%B6schen">
          lernen@habloo.de
        </a>{' '}
        – von der Adresse, mit der du dich angemeldet hast. Wir löschen das
        Konto innerhalb von 30 Tagen und bestätigen es dir.
      </P>

      <H2>Was gelöscht wird</H2>
      <div className="recht-kasten">
        <P>
          <b>Sofort und vollständig:</b> dein Konto und die Anmeldedaten,
          dein Anzeigename, alle gesammelten Vokabeln samt Lernstand, dein
          Lektionsfortschritt, gespeicherte Videos und Songs, Punktestand
          und Tagesserie.
        </P>
        <P>
          <b>Was bleibt:</b> Rechnungsdaten zu einem bezahlten Abo. Die
          müssen wir nach § 147 AO und § 257 HGB zehn Jahre aufbewahren –
          das dürfen wir nicht löschen, auch wenn du es verlangst. Sie
          werden für nichts anderes verwendet.
        </P>
        <P>
          Ein laufendes Abo endet nicht automatisch mit der Löschung.
          Kündige es vorher unter <b>Mehr → Abo verwalten</b>.
        </P>
      </div>

      <P className="recht-hinweis">
        Die Löschung lässt sich nicht rückgängig machen. Es gibt keine
        Sicherungskopie, aus der wir dein Konto zurückholen könnten –
        das ist Absicht.
      </P>
    </>} />
  )
}
