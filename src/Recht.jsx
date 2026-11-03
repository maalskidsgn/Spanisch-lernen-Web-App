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

import { useTexte, sprache } from './sprache.js'
const STAND = '23. August 2026'

/* ---------- Bausteine, damit alle drei Seiten gleich aussehen ---------- */

function Seite({ titel, kinder, onZurueck }) {
  const t = useTexte()
  // Ohne das oeffnet sich die Seite an der Scrollposition, von der
  // aus man sie angeklickt hat – man landet mitten im Text.
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="recht">
      <button className="btn-zurueck" onClick={onZurueck}><span className="zurueck-pfeil" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></span>{t('rt.zurueck')}</button>
      <h1>{titel}</h1>
      {kinder}
      <p className="recht-stand">{t('rt2.stand', { datum: STAND })}</p>
      {/* Bei uebersetzten Rechtstexten ueblich und noetig: Welche
          Fassung gilt, wenn die Uebersetzung von der Quelle
          abweicht. Auf Deutsch steht der Satz nicht - dort IST es
          die massgebliche Fassung. */}
      {sprache() === 'en' && (
        <p className="recht-stand recht-hinweis">{t('rt2.massgeblich')}</p>
      )}
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
  const t = useTexte()
  return (
    <Seite titel={t("rt3.impressum")} onZurueck={onZurueck} kinder={<>
      <H2>{t('rt.angabenGemaess5')}</H2>
      <P>
        Manuel Killert – Einzelunternehmer<br />
        Klarwerk Digital<br />
        Geschwister-Scholl-Straße 27<br />
        49610 Quakenbrück<br />
        Deutschland
      </P>

      <H2>{t('rt.kontakt')}</H2>
      <P>
        Telefon: +49 173 7439196<br />
        E-Mail: <a href="mailto:lernen@habloo.de">{t('rt.lernenHablooDe')}</a>
      </P>

      <H2>{t('rt.umsatzsteuerIdentifikationsnummer')}</H2>
      <P>{t('rt.gemaess27A')}</P>

      <H2>{t('rt.verantwortlichFuerDen')}</H2>
      <P>
        Manuel Killert<br />
        Geschwister-Scholl-Straße 27<br />
        49610 Quakenbrück
      </P>

      <H2>{t('rt.streitbeilegung')}</H2>
      <P>
        {t('rt4.odrPlattform')}{' '}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">
          ec.europa.eu/consumers/odr
        </a>
      </P>
      <P>{t('rtl.wirSindNicht')}</P>
    </>} />
  )
}

/* ================================================================
   DATENSCHUTZERKLÄRUNG
   ================================================================ */

/** Ein Empfänger in der Übersicht – Zweck, Daten, Sitz, Grundlage. */
function Empfaenger({ name, sitz, zweck, daten, grundlage, drittland }) {
  const t = useTexte()
  return (
    <div className="recht-dienst">
      <h4>{name}</h4>
      <dl>
        <dt>{t('rt.zweck')}</dt><dd>{zweck}</dd>
        <dt>{t('rt.uebermittelteDaten')}</dt><dd>{daten}</dd>
        <dt>{t('rt.anbieterSitz')}</dt><dd>{sitz}</dd>
        <dt>{t('rt.rechtsgrundlage')}</dt><dd>{grundlage}</dd>
        {drittland && <><dt>{t('rt.drittland')}</dt><dd>{drittland}</dd></>}
      </dl>
    </div>
  )
}

export function Datenschutz({ onZurueck }) {
  const t = useTexte()
  return (
    <Seite titel={t("rt3.datenschutzerklaerung")} onZurueck={onZurueck} kinder={<>
      <H2>{t('rt.1Verantwortlicher')}</H2>
      <P>
        {t('rt4.anschrift')} <a href="mailto:lernen@habloo.de">{t('rt.lernenHablooDe')}</a>.{' '}
        {t('rt4.keinDsb')}
      </P>

      <H2>{t('rt.2WasHabloo')}</H2>

      <H3>{t('rt.ohneKonto')}</H3>
      <P>{t('rtl.duKannstDie')}</P>

      <H3>{t('rt.mitKonto')}</H3>
      <P>{t('rtl.fuerEinKonto')}</P>
      <P>{t('rtl.rechtsgrundlageIstArt')}</P>

      <H3>{t('rt.serverProtokolle')}</H3>
      <P>{t('rtl.beimAufrufEntstehen')}</P>

      <H2>{t('rt.3AnWen')}</H2>
      <P>{t('rtl.dieseListeIst')}</P>

      <Empfaenger
        name="Supabase"
        zweck={t("rt3.kontoAnmeldungUnd")}
        daten={t("rt3.eMailAdresse")}
        sitz={t("rt3.supabaseIncSan")}
        grundlage={t("rt3.art6Abs")}
      />
      <Empfaenger
        name="Hetzner Online GmbH"
        zweck={t("rt3.betriebVonWebsite")}
        daten={t("rt3.alleAnfragenAn")}
        sitz={t("rt3.hetznerOnlineGmbh")}
        grundlage={t("rt3.art6Abs2")}
      />
      <Empfaenger
        name="OpenAI"
        zweck={t("rt3.erzeugenVonVokabellisten")}
        daten={t("rt3.derJeweilsZu")}
        sitz={t("rt3.openaiIrelandLtd")}
        grundlage="Art. 6 Abs. 1 lit. b DSGVO"
        drittland={t("rt3.verarbeitungKannIn")}
      />
      <Empfaenger
        name={t("rt3.anthropicNurPremium")}
        zweck={t("rt3.erzeugenZweisprachigerE")}
        daten={t("rt3.dasVonDir")}
        sitz="Anthropic PBC, San Francisco, USA"
        grundlage="Art. 6 Abs. 1 lit. b DSGVO"
        drittland={t("rt3.usaAbgesichertUeber")}
      />
      <Empfaenger
        name="Google / YouTube"
        zweck={t("rt3.eingebetteteLernvideosVorschaubilder")}
        daten={t("rt3.beimAbspielenEines")}
        sitz={t("rt3.googleIrelandLtd")}
        grundlage="Art. 6 Abs. 1 lit. b DSGVO"
        drittland={t("rt3.usaAbgesichertUeber")}
      />
      <Empfaenger
        name="Google Analytics"
        zweck={t("rt3.anonymeReichweitenmessungWie")}
        daten={t("rt3.gekuerzteIpAdresse")}
        sitz={t("rt3.googleIrelandLtd")}
        grundlage={t("rt3.art6Abs3")}
        drittland={t("rt3.usaAbgesichertUeber")}
      />
      <Empfaenger
        name="Stripe"
        zweck={t("rt3.abwicklungDerPremium")}
        daten={t("rt3.eMailAdresse2")}
        sitz={t("rt3.stripePaymentsEurope")}
        grundlage="Art. 6 Abs. 1 lit. b DSGVO"
      />
      <Empfaenger
        name={t("rt3.spotifyNurWenn")}
        zweck={t("rt3.songvorschlaegeAufGrundlage")}
        daten={t("rt3.nachDeinerFreigabe")}
        sitz={t("rt3.spotifyAbStockholm")}
        grundlage={t("rt3.art6Abs4")}
      />
      <Empfaenger
        name="TubeAlfred"
        zweck={t("rt3.abrufVonVideo")}
        daten={t("rt3.dieKennungDes")}
        sitz="TubeAlfred, EU"
        grundlage="Art. 6 Abs. 1 lit. b DSGVO"
      />
      <Empfaenger
        name="ALL-INKL.COM – Neue Medien Münnich"
        zweck={t("rt3.versandVonBestaetigungs")}
        daten={t("rt3.deineEMail")}
        sitz={t("rt3.neueMedienMuennich")}
        grundlage={t("rt3.art6Abs5")}
      />

      <P className="recht-hinweis">
        <b>{t('rt.nichtInDieser')}</b> {t('rt4.sprachaufnahmen')}
      </P>

      <H2>{t('rt.4CookiesUnd')}</H2>
      <P>{t('rtl.hablooSpeichertDeinen')}</P>
      <P>{t('rtl.cookiesZurReichweitenmessung')}</P>

      <H2>{t('rt.5WieLange')}</H2>
      <P>{t('rtl.kontodatenUndLernfortschritt')}</P>

      <H2>{t('rt.6DeineRechte')}</H2>
      <P>{t('rtl.duHastDas')}</P>
      <P>
        {t('rt4.auskunftMail')}{' '}
        <a href="mailto:lernen@habloo.de">{t('rt.lernenHablooDe')}</a>. {t('rt4.backupSelbst')}
      </P>
      <P>{t('rtl.duKannstDich')}</P>

      <H2>{t('rt.7Aenderungen')}</H2>
      <P>{t('rtl.wennSichHabloo')}</P>
    </>} />
  )
}

/* ================================================================
   AGB
   ================================================================ */

export function AGB({ onZurueck }) {
  const t = useTexte()
  return (
    <Seite titel={t("rt3.allgemeineGeschaeftsbedingungen")} onZurueck={onZurueck} kinder={<>
      <H2>{t('rt.1GeltungsbereichUnd')}</H2>
      <P>{t('rtl.dieseBedingungenGelten')}</P>

      <H2>{t('rt.2WasHabloo2')}</H2>
      <P>{t('rtl.hablooIstEine')}</P>
      <P>{t('rtl.hablooIstEin')}</P>

      <H2>{t('rt.3Konto')}</H2>
      <P>{t('rtl.fuerDieNutzung')}</P>

      <H2>{t('rt.4BenutzernameProfilbild')}</H2>
      <P>{t('rtl.benutzernameUndProfilbild')}</P>
      <P>{t('rtl.jederKannEin')}</P>
      <P>{t('rtl.wennDuMeinst')}</P>

      <H2>{t('rt.5KostenloseNutzung')}</H2>
      <P>{t('rtl.alleLernfunktionenSind')}</P>
      <P>{t('rtl.dieJeweilsGeltenden')}</P>

      <H2>{t('rt.6Vertragsschluss')}</H2>
      <P>{t('rtl.mitDemAnlegen')}</P>

      <H2>{t('rt.7LaufzeitUnd')}</H2>
      <P>{t('rtl.dasMonatsaboLaeuft')}</P>
      <P>{t('rtl.kuendigenKannstDu')}</P>

      <H2>{t('rt.8WiderrufsrechtFuer')}</H2>
      <div className="recht-kasten">
        <H3>{t('rt.widerrufsbelehrung')}</H3>
        <P>{t('rtl.duHastDas2')}</P>
        <P>
          {t('rt4.widerrufAusueben1')}{' '}
          <a href="mailto:lernen@habloo.de">{t('rt.lernenHablooDe')}</a> {t('rt4.widerrufAusueben2')}
        </P>
        <P>
          <b>{t('rt.folgenDesWiderrufs')}</b> {t('rt4.widerrufFolgen')}
        </P>
        <P>
          <b>{t('rt.vorzeitigesErloeschen')}</b> {t('rt4.widerrufErlischt')}
        </P>
      </div>

      <H2>{t('rt.9InhalteDie')}</H2>
      <P>{t('rtl.vokabellistenZusaetzlicheUebungen')}</P>

      <H2>{t('rt.10InhalteDritter')}</H2>
      <P>{t('rtl.hablooBindetVideos')}</P>

      <H2>{t('rt.11DeinePflichten')}</H2>
      <P>{t('rtl.nutzeHablooNicht')}</P>

      <H2>{t('rt.12Verfuegbarkeit')}</H2>
      <P>{t('rtl.wirBemuehenUns')}</P>

      <H2>{t('rt.13Haftung')}</H2>
      <P>{t('rtl.wirHaftenUnbeschraenkt')}</P>

      <H2>{t('rt.14AenderungenDieser')}</H2>
      <P>{t('rtl.wirDuerfenDiese')}</P>

      <H2>{t('rt.15Schlussbestimmungen')}</H2>
      <P>{t('rtl.esGiltDeutsches')}</P>
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
  const t = useTexte()
  return (
    <Seite titel={t("rt3.kontoUndDaten")} onZurueck={onZurueck} kinder={<>
      <P>{t('rtl.duKannstDein')}</P>

      <H2>{t('rt.inDerApp')}</H2>
      <P>
        Öffne <b>{t('rt.profil')}</b> {t('rt.undScrolleNach')} <b>{t('rt.kontoLoeschen')}</b>.
        Nach zwei Rückfragen ist das Konto weg. Das ist der schnellste Weg.
      </P>

      <H2>{t('rt.perEMail')}</H2>
      <P>
        Wenn du die App schon gelöscht hast oder nicht mehr hineinkommst,
        schreib an{' '}
        <a href="mailto:lernen@habloo.de?subject=Konto%20l%C3%B6schen">
          {t('rt.lernenHablooDe')}
        </a>{' '}
        – von der Adresse, mit der du dich angemeldet hast. Wir löschen das
        Konto innerhalb von 30 Tagen und bestätigen es dir.
      </P>

      <H2>{t('rt.wasGeloeschtWird')}</H2>
      <div className="recht-kasten">
        <P>
          <b>{t('rt.sofortUndVollstaendig')}</b> dein Konto und die Anmeldedaten,
          dein Anzeigename, alle gesammelten Vokabeln samt Lernstand, dein
          Lektionsfortschritt, gespeicherte Videos und Songs, Punktestand
          und Tagesserie.
        </P>
        <P>
          <b>{t('rt.wasBleibt')}</b> Rechnungsdaten zu einem bezahlten Abo. Die
          müssen wir nach § 147 AO und § 257 HGB zehn Jahre aufbewahren –
          das dürfen wir nicht löschen, auch wenn du es verlangst. Sie
          werden für nichts anderes verwendet.
        </P>
        <P>
          Ein laufendes Abo endet nicht automatisch mit der Löschung.
          Kündige es vorher unter <b>{t('rt.mehrAboVerwalten')}</b>.
        </P>
      </div>

      <P className="recht-hinweis">{t('rtl.dieLoeschungLaesst')}</P>
    </>} />
  )
}
