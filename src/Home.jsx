import { API_URL, istApp } from './api.js'
import { TUTOREN } from './tutoren.js'
import { MODULE, lektionenVon } from './lektionen.js'
import { UNTERRICHT, stand, restzeit, terminText } from './unterricht.js'
import { usePremium } from './premium.js'
import { letzteWoche, jahresRaster, erstesJahr, summeWiederholungen } from './aktivitaet.js'
import Lernkurve from './Lernkurve.jsx'
import Meilensteine from './Meilensteine.jsx'
import Flamme from './Flamme.jsx'
import InstallKnopf from './InstallKnopf.jsx'
import { zitatDesTages } from './zitate.js'
import { stueckDesTages } from './landUndLeute.js'
import { ladeGelesen } from './LandUndLeute.jsx'
import { useEffect, useState } from 'react'
import { IconLektion, IconKarten, IconMediathek } from './icons.jsx'
import { ladeBenutzername } from './rangliste.js'
import { FeedTuer } from './Feed.jsx'
import { RanglistenKarte } from './Rangliste.jsx'
import { useTexte, gebiet, text as inhaltsText, t } from './sprache.js'
import { IconPfeil, IconLandkarte, IconSprache, IconBuch } from './icons.jsx'

// Die Startseite.
//
// Drei Karten, in dieser Reihenfolge: weiterlernen, verstehen, wie
// die App gedacht ist, und was diese Woche passiert ist. Das ist die
// Antwort auf "Was mache ich jetzt?" – von der klarsten zur
// lockersten.

// Die Gruppenstunde steht nicht mehr auf dem Start. Ihr Bauplan ist
// unten erhalten: Diese eine Zeile holt sie zurueck.
const PRAXIS_ZEIGEN = false
// Tutoren-Teaser (Warteliste, Yulibeth) – vorerst ausgeblendet
const TUTOREN_ZEIGEN = false
// Die Karte "Nächste aktive Lektion" ist vorerst ausgeblendet (Manuel,
// 28.10.). Der Code bleibt stehen – auf true setzen, dann ist sie zurück.
const LEKTIONSKARTE_ZEIGEN = false
const ZITAT_ZEIGEN = false

/**
 * Begrüßung nach Tageszeit.
 *
 * Spanisch, weil die App Spanisch lehrt – und weil "¡Buenos días!"
 * schon beim Öffnen ein kleines Erfolgserlebnis ist. Die Grenzen
 * sind die üblichen: bis 11 Morgen, bis 18 Tag, danach Abend.
 */
function gruss() {
  const stunde = new Date().getHours()
  if (stunde < 11) return '¡Buenos días'
  if (stunde < 18) return '¡Buenas tardes'
  return '¡Buenas noches'
}

export default function Home({
  progress,
  counts,
  nextLesson,
  lessonProgress = {},
  onNavigate,
  nutzerEmail,
  nutzerId,
}) {
  const t = useTexte()
  const faellig = counts.faellig ?? 0

  // Der Name für die Begrüßung: derselbe, unter dem man in der
  // Rangliste steht. Ohne Konto bleibt die Begrüßung namenlos.
  const [name, setName] = useState('')
  useEffect(() => {
    if (!nutzerId) return setName('')
    ladeBenutzername(nutzerId).then((n) => setName(n || ''))
    const neu = (e) => setName(e.detail || '')
    window.addEventListener('benutzername', neu)
    return () => window.removeEventListener('benutzername', neu)
  }, [nutzerId])

  // Kommt der Lernverlauf von einem anderen Gerät an, neu zeichnen
  const [, setVerlaufStand] = useState(0)
  useEffect(() => {
    const neu = () => setVerlaufStand((n) => n + 1)
    window.addEventListener('aktivitaet', neu)
    window.addEventListener('lernkurve', neu)
    return () => {
      window.removeEventListener('aktivitaet', neu)
      window.removeEventListener('lernkurve', neu)
    }
  }, [])

  const modul = nextLesson
    ? MODULE.find((m) => nextLesson.kursNr >= m.von && nextLesson.kursNr <= m.bis)
    : null
  const modulListe = modul ? lektionenVon(modul) : []
  const modulFertig = modulListe.filter((l) => lessonProgress[l.id]?.fertig).length

  const zitat = zitatDesTages()
  const stueck = stueckDesTages()
  // Nur einmal beim Aufbauen gelesen – die Karte muss sich nicht
  // aktualisieren, waehrend man auf ihr steht.
  const [schonGelesen] = useState(() => ladeGelesen().has(stueck.id))

  const woche = letzteWoche()
  const wochenSumme = woche.reduce((s, t) => s + t.anzahl, 0)

  // Nur echte Lektionen zaehlen. Im selben Objekt liegen auch die
  // Pruefstationen – die sind Abschluesse, keine Lektionen.
  const lektionenFertig = Object.keys(lessonProgress).filter(
    (id) => lessonProgress[id]?.fertig && !id.startsWith('station-')
  ).length

  return (
    <div className="trainer home">
      {/* Begrüßung mit Namen und drei Wegen, direkt weiterzumachen.
          Wer die App öffnet, will loslegen – nicht erst suchen. */}
      <header className="start-begruessung">
        <h1 className="start-hallo">
          {gruss()}
          {name ? ', ' : ''}
          {name && <span className="accent">{name}</span>}
          <span className="accent">!</span>
        </h1>
        <p className="start-zurueck">
          {progress.xp > 0 ? t('home.schoenWieder') : t('home.schoen')}
        </p>

        <div className="start-wege">
          <button className="start-weg" onClick={() => onNavigate('lektionen')}>
            <span className="sw-zeichen"><IconLektion groesse={22} /></span>
            <span className="sw-text">
              <b>{t('home.lektion')}</b>
              <small>{nextLesson ? inhaltsText(nextLesson.titel) : t('hm.allesGeschafft')}</small>
            </span>
          </button>
          <button className="start-weg" onClick={() => onNavigate('trainer')}>
            <span className="sw-zeichen"><IconKarten groesse={22} /></span>
            <span className="sw-text">
              <b>{t('home.trainer')}</b>
              <small>{faellig > 0 ? t('home.faellig', { zahl: faellig }) : t('home.woerterUeben')}</small>
            </span>
          </button>
          <button className="start-weg" onClick={() => onNavigate('videos')}>
            <span className="sw-zeichen"><IconMediathek groesse={22} /></span>
            <span className="sw-text">
              <b>{t('home.youtube')}</b>
              <small>{t('home.videosAnsehen')}</small>
            </span>
          </button>
        </div>
      </header>

      {/* Rangliste: die Top 10 nach XP – ganz oben, als Ansporn */}
      {nutzerId && <RanglistenKarte nutzerId={nutzerId} eigeneXp={progress.xp ?? 0} />}

      {/* Nur im Browser: App auf den Startbildschirm holen */}
      <InstallKnopf app="Habloo" />
      {/* Der Satz des Tages ist ausgeblendet (Manuel, 28.10.) –
          auf true setzen, dann ist er zurueck. */}
      {ZITAT_ZEIGEN && (
      <div className="zitat">
        <p className="zitat-es">{zitat.es}</p>
        <p className="zitat-de">
          {inhaltsText(zitat.de)}
          {zitat.quelle && <span className="zitat-quelle"> · {zitat.quelle}</span>}
        </p>
      </div>
      )}

      {/* ============ 1. WEITERLERNEN ============ */}
      {LEKTIONSKARTE_ZEIGEN && (
      <section className="start-karte start-lektion">
        <MiniRoute fertig={!nextLesson} />
        <div className="start-lektion-text">
          <span className="start-marke">
            {nextLesson ? t('hm.naechsteAktive') : t('hm.allesGeschafft')}
          </span>
          <h2>{nextLesson ? inhaltsText(nextLesson.titel) : t('hm.alle150Lektionen')}</h2>
          <p>
            {nextLesson
              ? (nextLesson.grammatik?.[0] ?? nextLesson.beschreibung)
              : t('hmm.halteDieSprache')}
          </p>

          {nextLesson && modul && (
            <div className="start-lektion-stand">
              <span className="xp-bar goal-bar">
                <span
                  className="xp-bar-fill"
                  style={{
                    width: (modulFertig / modulListe.length) * 100 + '%',
                    display: 'block',
                  }}
                />
              </span>
              <span className="start-lektion-zahl">
                <b>{modulFertig}</b> / {modulListe.length} Lektionen
              </span>
            </div>
          )}

          <button
            className="start-weiter"
            onClick={() => onNavigate(nextLesson ? 'lektionen' : 'trainer')}
          >
            {nextLesson ? t('hm9.weiterlernen') : t('hm9.zumTrainer')}
            <IconPfeil groesse={18} />
          </button>
        </div>
      </section>
      )}

      {/* ============ TEASER: Unterricht mit Tutoren ============ */}
      {TUTOREN_ZEIGEN && <TutorenTeaser nutzerEmail={nutzerEmail} />}

      {/* ============ 3. DIE WOCHE ============ */}
      <section className="start-karte">
        {/* Die Serie als Hingucker: Flamme + große Zahl */}
        <div className="streak-kopf">
          <span className={'streak-flamme' + (progress.streak > 0 ? ' streak-an' : '')} aria-hidden="true">
            <Flamme an={progress.streak > 0} groesse={46} />
          </span>
          <div className="streak-text">
            <b className="streak-zahl">{progress.streak}</b>
            <span className="streak-label">
              {progress.streak === 1 ? t('hm.tagInFolge') : t('hm.tageInFolge')}
            </span>
          </div>
          <h2 className="start-abschnitt streak-titel">{t('home.lernstreak')}</h2>
        </div>

        <ol className="woche-reihe" aria-label={t('hm.einheitenDieseWoche', { zahl: wochenSumme })}>
          {woche.map((tag, i) => (
            <li key={i} className={'woche-punkt' + (tag.istHeute ? ' punkt-heute' : '')}>
              <span className="woche-name">{tag.istHeute ? t('hm.heute') : tag.label}</span>
              <span className={'woche-kreis' + stufe(tag.anzahl)}>
                {tag.anzahl >= 2 && (
                  <svg viewBox="0 0 24 24" width="13" height="13">
                    <path
                      d="M5 12.5l5 5L19 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
            </li>
          ))}
        </ol>

        {/* Der Kalender: ein Kreuz an jedem Tag, an dem etwas gelernt
            wurde. Antippen zeigt, wie viele Lektionen und
            Wiederholungen es waren. */}
        <Kalender />

        {/* Lernkurve: was wovon gelernt wurde, als Linien je Bereich */}
        <Lernkurve />
      </section>

      {/* Meilensteine: Abzeichen zum Teilen */}
      <Meilensteine
        app="Habloo"
        adresse="habloo.de"
        xp={progress.xp}
        werte={{
          woerter: counts.woerter ?? 0,
          texte: counts.texte ?? 0,
          saetze: counts.saetze ?? 0,
          lektionen: lektionenFertig,
          streak: progress.streak ?? 0,
          wiederholungen: summeWiederholungen(),
        }}
      />

      {PRAXIS_ZEIGEN && <Gruppenstunde onNavigate={onNavigate} />}
    </div>
  )
}

/** Vier farbige Balken: Woerter, Lektionen, Songs, Videos. */
function Sammelbalken({ werte }) {
  const t = useTexte()
  const max = Math.max(1, ...werte.map((w) => w.wert))
  return (
    <div className="sammelbalken">
      <p className="start-abschnitt-sub balken-titel">{t('hm.gesammelt')}</p>
      {werte.map((w) => (
        <div key={w.name} className="balken-zeile">
          <span className="balken-name">{w.name}</span>
          <span className="balken-bahn">
            <span
              className="balken-voll"
              style={{ width: Math.max(3, (w.wert / max) * 100) + '%', background: w.farbe }}
            />
          </span>
          <b className="balken-wert">{w.wert}</b>
        </div>
      ))}
    </div>
  )
}

/**
 * Kalender der letzten Wochen. Kreuz = an diesem Tag gelernt; antippen
 * zeigt die Aufschlüsselung in Lektionen und Wiederholungen.
 */
function Kalender() {
  const t = useTexte()
  const jetzt = new Date()
  const [ansicht, setAnsicht] = useState('monat') // 'monat' | 'jahr'
  const [gewaehlt, setGewaehlt] = useState(null)
  const [jahr, setJahr] = useState(jetzt.getFullYear())
  const [monat, setMonat] = useState(jetzt.getMonth())
  const [wisch, setWisch] = useState(null) // Startpunkt einer Wischgeste

  const monate = jahresRaster(jahr)
  const frueh = Math.min(erstesJahr(), jetzt.getFullYear())
  // Die Kuerzel kommen vom Browser, nicht aus einer Liste: Auf
  // Englisch heissen sie Mon..Sun, und eine zweite feste Liste
  // waere eine zweite Stelle, die man beim Sprachwechsel vergisst.
  // Der 4. Januar 2021 war ein Montag - von dort aus sieben Tage.
  const wochentage = Array.from({ length: 7 }, (_, i) =>
    new Date(2021, 0, 4 + i).toLocaleDateString(gebiet(), { weekday: 'short' }).replace('.', '')
  )

  // Grenzen: nicht vor das erste Jahr mit Daten, nicht in die Zukunft
  const amAnfang = ansicht === 'monat' ? jahr <= frueh && monat === 0 : jahr <= frueh
  const amEnde =
    ansicht === 'monat'
      ? jahr === jetzt.getFullYear() && monat === jetzt.getMonth()
      : jahr >= jetzt.getFullYear()

  function blaettern(richtung) {
    if ((richtung < 0 && amAnfang) || (richtung > 0 && amEnde)) return
    setGewaehlt(null)
    if (ansicht === 'jahr') return setJahr(jahr + richtung)
    const neu = monat + richtung
    if (neu < 0) { setMonat(11); setJahr(jahr - 1) }
    else if (neu > 11) { setMonat(0); setJahr(jahr + 1) }
    else setMonat(neu)
  }

  // Wischen: nach links = vor, nach rechts = zurück
  function wischStart(e) {
    const t = e.touches[0]
    setWisch({ x: t.clientX, y: t.clientY })
  }
  function wischEnde(e) {
    if (!wisch) return
    const t = e.changedTouches[0]
    const dx = t.clientX - wisch.x
    const dy = t.clientY - wisch.y
    setWisch(null)
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) blaettern(dx < 0 ? 1 : -1)
  }

  function wechsle(neu) {
    setAnsicht(neu)
    setGewaehlt(null)
    setJahr(jetzt.getFullYear())
    setMonat(jetzt.getMonth())
  }

  const aktuellerMonat = monate[monat]
  const aktiveTage =
    ansicht === 'monat' ? aktuellerMonat.aktiv : monate.reduce((summe, m) => summe + m.aktiv, 0)
  const titel =
    ansicht === 'monat'
      ? aktuellerMonat.name.charAt(0).toUpperCase() + aktuellerMonat.name.slice(1) + ' ' + jahr
      : String(jahr)

  return (
    <div className="kalender">
      <div className="kal-kopf">
        <p className="start-abschnitt-sub kal-titel">
          {t('hm.kalenderTage', { zahl: aktiveTage, einheit: aktiveTage === 1 ? t('hm.aktiverTag') : t('hm.aktiveTage') })}
        </p>
        <div className="kal-umschalter" role="tablist">
          <button type="button" className={ansicht === 'monat' ? 'ist-aktiv' : ''} onClick={() => wechsle('monat')}>
            {t('home.monat')}
          </button>
          <button type="button" className={ansicht === 'jahr' ? 'ist-aktiv' : ''} onClick={() => wechsle('jahr')}>
            {t('home.jahr')}
          </button>
        </div>
      </div>

      <div className="kal-jahr-nav">
        <button type="button" aria-label={t('hm.zurueck')} disabled={amAnfang} onClick={() => blaettern(-1)}>‹</button>
        <b>{titel}</b>
        <button type="button" aria-label={t('hm.weiter')} disabled={amEnde} onClick={() => blaettern(1)}>›</button>
      </div>

      <div className="kal-wischflaeche" onTouchStart={wischStart} onTouchEnd={wischEnde}>
        {ansicht === 'monat' && (
          <div key={jahr + '-' + monat} className="kal-blatt">
            <div className="kal-wochentage">
              {wochentage.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="kal-gitter">
              {Array.from({ length: aktuellerMonat.versatz }, (_, i) => (
                <span key={'l' + i} />
              ))}
              {aktuellerMonat.tage.map((z) => (
                <button
                  key={z.schluessel}
                  type="button"
                  disabled={z.zukunft}
                  className={
                    'kal-tag' +
                    (z.gesamt > 0 ? ' kal-aktiv' : '') +
                    (z.istHeute ? ' kal-heute' : '') +
                    (z.zukunft ? ' kal-zukunft' : '') +
                    (gewaehlt?.schluessel === z.schluessel ? ' kal-gewaehlt' : '')
                  }
                  onClick={() => setGewaehlt(z)}
                >
                  <span className="kal-zahl">{z.tag}</span>
                  {z.gesamt > 0 && (
                    <svg className="kal-haken" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {ansicht === 'jahr' && (
          <div key={jahr} className="kal-jahr kal-blatt">
            {monate.map((m, i) => (
              <div key={m.name} className="kal-monat">
                <button
                  type="button"
                  className="kal-monat-name"
                  onClick={() => { setMonat(i); setAnsicht('monat'); setGewaehlt(null) }}
                >
                  {m.name}
                  {m.aktiv > 0 && <span>{m.aktiv}</span>}
                </button>
                <div className="kal-mini">
                  {Array.from({ length: m.versatz }, (_, i) => (
                    <span key={'l' + i} />
                  ))}
                  {m.tage.map((t) => (
                    <button
                      key={t.schluessel}
                      type="button"
                      disabled={t.zukunft}
                      aria-label={kalDatum(t.schluessel)}
                      className={
                        'kal-punkt' +
                        (t.gesamt > 0 ? ' kal-aktiv' : '') +
                        (t.istHeute ? ' kal-heute' : '') +
                        (t.zukunft ? ' kal-zukunft' : '') +
                        (gewaehlt?.schluessel === t.schluessel ? ' kal-gewaehlt' : '')
                      }
                      onClick={() => setGewaehlt(t)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {gewaehlt && (
        <div className={'kal-detail' + (gewaehlt.gesamt > 0 ? ' kal-detail-aktiv' : '')}>
          <p className="kal-detail-datum">{kalDatum(gewaehlt.schluessel)}</p>
          {gewaehlt.gesamt === 0 ? (
            <p className="kal-detail-leer">{t('hm.anDiesemTag')}</p>
          ) : (
            <div className="kal-detail-werte">
              {gewaehlt.wiederholungen > 0 && (
                <div className="kal-wert kal-wert-wdh">
                  <b>{gewaehlt.wiederholungen}</b>
                  <span>{gewaehlt.wiederholungen === 1 ? 'Wiederholung' : 'Wiederholungen'}</span>
                </div>
              )}
              {gewaehlt.lektionen > 0 && (
                <div className="kal-wert kal-wert-lek">
                  <b>{gewaehlt.lektionen}</b>
                  <span>{gewaehlt.lektionen === 1 ? t('hm9.lektion') : t('hm9.lektionen')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** "2026-08-24" → "Mo, 24. Aug." */
function kalDatum(schluessel) {
  const [j, m, t] = schluessel.split('-').map(Number)
  const d = new Date(j, m - 1, t)
  return d.toLocaleDateString(gebiet(), { weekday: 'short', day: 'numeric', month: 'short' })
}

/** Aufschlüsselung eines Tages als Text, z. B. "1 Lektion, 2 Wiederholungen". */
function kalTeile(z) {
  const teile = []
  if (z.lektionen > 0) teile.push(z.lektionen + ' ' + (z.lektionen === 1 ? t('hm9.lektion') : t('hm9.lektionen')))
  if (z.wiederholungen > 0)
    teile.push(z.wiederholungen + (z.wiederholungen === 1 ? ' Wiederholung' : ' Wiederholungen'))
  return teile.join(', ')
}

/** Wie voll ist der Tageskreis? Nichts, angefangen, erledigt. */
function stufe(anzahl) {
  if (anzahl >= 2) return ' kreis-voll'
  if (anzahl === 1) return ' kreis-halb'
  return ''
}

/**
 * Die kleine Vorschau des Lernpfads.
 *
 * Bewusst ohne echte Daten: Sie zeigt nicht den Weg, sondern das
 * Bild davon – drei Halte, einer aktiv, einer geschafft. Ein
 * verkleinerter echter Pfad waere bei 22 Etappen ein Gekritzel.
 */
function MiniRoute({ fertig = false }) {
  return (
    <svg className="mini-route" viewBox="0 0 64 150" aria-hidden="true">
      <path d="M32 24 C 32 60, 44 66, 44 84 S 32 112, 32 126" className="mini-weg" />
      <path
        d={fertig ? 'M32 24 C 32 60, 44 66, 44 84 S 32 112, 32 126' : 'M32 24 C 32 60, 44 66, 44 84'}
        className="mini-weg-fertig"
      />
      <circle cx="32" cy="24" r="13" className="mini-punkt mini-punkt-dran" />
      <circle cx="44" cy="84" r="13" className="mini-punkt mini-punkt-fertig" />
      <path d="M39 84 l3.5 3.5 6.5-7" className="mini-haken" />
      <circle cx="32" cy="126" r="12" className="mini-punkt" />
    </svg>
  )
}

/**
 * Der wöchentliche Gruppenunterricht.
 *
 * Der Knopf ist nur im Zeitfenster ein Beitreten-Knopf – sonst zeigt
 * die Karte, wann es losgeht. Ein Knopf, der jederzeit in einen
 * leeren Raum führt, wäre schlimmer als keiner.
 */
function Gruppenstunde({ onNavigate }) {
  const t = useTexte()
  const { premium } = usePremium()
  const [jetzt, setJetzt] = useState(() => new Date())

  // Einmal je Minute nachsehen: Der Countdown soll von selbst
  // umspringen, wenn jemand die App offen liegen lässt.
  useEffect(() => {
    const takt = setInterval(() => setJetzt(new Date()), 30_000)
    return () => clearInterval(takt)
  }, [])

  const s = stand(jetzt)
  const offen = s.zustand === 'laeuft' || s.zustand === 'gleich'
  const raumDa = Boolean(UNTERRICHT.raum)

  return (
    <section className="tutor-karte">
      <div className="tutor-bild">
        {/* Bis ein Foto da ist: die Anfangsbuchstaben als Platzhalter */}
        <span className="tutor-initialen" aria-hidden="true">
          {UNTERRICHT.lehrerin[0]}
        </span>
        {s.zustand === 'laeuft' && <span className="tutor-live">live</span>}
      </div>

      <h2 className="tutor-titel">
        {t('hm2.lerneInDer')} <span className="accent">{t('hm.praxis')}</span>
      </h2>

      <p className="tutor-text">
        {s.zustand === 'laeuft' ? (
          <>
            {t('hm2.gruppeLaeuft1')} <b className="accent">{UNTERRICHT.lehrerin}</b>{' '}
            {t('hm2.gruppeLaeuft2', { rest: restzeit(s.endetIn) })}
          </>
        ) : (
          <>
            {t('hm2.gruppeTermin')} <b className="accent">{UNTERRICHT.lehrerin}</b>:{' '}
            {terminText(s.termin)}, {restzeit(s.beginntIn)}.
          </>
        )}
      </p>

      <div className="tutor-knoepfe">
        {/* Fuenf Faelle, bewusst einzeln statt verschachtelt: Beim
            Verschachteln landete der laufende Unterricht im Zweig fuer
            "noch nicht offen" und rechnete mit s.beginntIn, das es
            dort gar nicht gibt – auf dem Bildschirm stand dann
            "Öffnet in NaN Tagen". */}
        {offen && premium && raumDa && (
          <a
            className="tutor-knopf tutor-knopf-live"
            href={UNTERRICHT.raum}
            target="_blank"
            rel="noopener noreferrer"
          >
            {s.zustand === 'laeuft' ? t('hm9.jetztBeitreten') : t('hm9.raumOeffnen')}
            <IconPfeil groesse={16} />
          </a>
        )}

        {offen && premium && !raumDa && (
          <button className="tutor-knopf" disabled>{t('hm2.raumWirdVorbereitet')}</button>
        )}

        {!premium && !istApp && (
          <button className="tutor-knopf" onClick={() => onNavigate('mehr')}>
            {t('hm9.mitPremiumTeilnehmen')} <IconPfeil groesse={16} />
          </button>
        )}

        {!offen && premium && (
          <button className="tutor-knopf" disabled>
            Öffnet {restzeit(Math.max(0, s.beginntIn - UNTERRICHT.vorlaufMinuten * 60000))}
          </button>
        )}

        <button className="tutor-knopf tutor-knopf-zweit" onClick={() => onNavigate('trainer')}>
          KI Hilfe
        </button>
      </div>

      {offen && premium && !raumDa && (
        <p className="tutor-hinweis">{t('hm2.dieZugangsadresseFehlt')}</p>
      )}
    </section>
  )
}

/**
 * Die Stationen der Reise durch die App.
 *
 * Sie stehen hier als Daten und nicht als Markup, weil sie eine
 * Reihenfolge HABEN: Die Nummer links kommt aus der Position, nicht
 * aus einer gepflegten Zahl. Wer eine Station einschiebt, muss nichts
 * nachzaehlen.
 */
const STATIONEN = [
  {
    titel: 'hm.jedenTagEine',
    text: 'hm.zwoelfNeueWoerter',
    ziel: 'lektionen',
    link: 'hm.zurReiseroute',
  },
  {
    titel: 'hm.wasDuLernst',
    text: 'hm.jedeVokabelAus',
    ziel: 'trainer',
    link: 'hm.zumVokabeltrainer',
  },
  {
    titel: 'hm.grammatikInKleinen',
    text: 'hm.serOderEstar',
    ziel: 'trainer',
    link: 'hm.zuDenBausteinen',
  },
  {
    titel: 'hm.lernenOhneZu',
    text: 'hm.inDerMediathek',
    ziel: 'videos',
    link: 'hm.zurMediathek',
  },
  {
    titel: 'hm.undAnDen',
    text: 'hm.sechsSpieleMemory',
    ziel: 'trainer',
    link: 'hm.zuDenSpielen',
  },
  {
    titel: 'hm.wasDieKi',
    text: 'hm.sieStelltWortlisten',
    ziel: 'trainer',
    link: 'hm.listeErstellenLassen',
  },
  {
    titel: 'hm.warumEsLevel',
    text: 'hm.ehrlichGesagtWeil',
    ziel: 'mehr',
    link: 'hm.zuDeinenZielen',
  },
]

/**
 * "So nutzt du Habloo" – die Reise durch die App.
 *
 * Warum das auf dem Start steht und nicht in einer Hilfe: Eine Hilfe
 * liest niemand. Die Frage "Was mache ich hier eigentlich?" stellt
 * sich aber genau hier, in den ersten Wochen, immer wieder.
 */
export function Leitfaden({ onNavigate, onZurueck, onRundgang }) {
  const t = useTexte()
  const [geteilt, setGeteilt] = useState(false)

  async function einladen() {
    const daten = {
      title: 'Habloo',
      text: t('hm.ichLerneGerade'),
      url: 'https://habloo.de',
    }
    // Auf dem Handy oeffnet das die Teilen-Auswahl des Systems. Auf
    // dem Rechner gibt es die meist nicht – dann in die Zwischenablage.
    try {
      if (navigator.share) return await navigator.share(daten)
      await navigator.clipboard.writeText(daten.text + ' ' + daten.url)
      setGeteilt(true)
      setTimeout(() => setGeteilt(false), 2500)
    } catch {
      // Abgebrochen ist kein Fehler – dann passiert einfach nichts.
    }
  }

  return (
    <div className="trainer home leitfaden-seite">
      <button className="btn-zurueck" onClick={onZurueck}>
        <span className="zurueck-pfeil" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></span>{t('hm.zurueck')}
      </button>
      <h1 className="trainer-titel">
        {t('hm2.soNutztDu')} <span className="accent">{t('hm.habloo')}</span>
      </h1>
      <p className="intro">{t('hm2.deineReiseDurch')}</p>

      {/* Der geführte Rundgang: die App klickt selbst durch alle
          Bereiche und erklärt jeden kurz. Für alle, die lieber
          schauen als lesen. */}
      {onRundgang && (
        <button className="btn rundgang-start" onClick={onRundgang}>{t('hm2.rundgangStartenEinmal')}</button>
      )}

      <ol className="reise-liste">
        {STATIONEN.map((s, i) => (
          <li className="reise-station" key={s.titel}>
            <span className="reise-punkt" aria-hidden="true">{i + 1}</span>
            <div className="reise-inhalt">
              <h3>{t(s.titel)}</h3>
              <p>{t(s.text)}</p>
              <button className="reise-link" onClick={() => onNavigate(s.ziel)}>
                {t(s.link)}
                <IconPfeil groesse={15} />
              </button>
            </div>
          </li>
        ))}
      </ol>

      <div className="reise-ziel">
        <h3>{t('hm.zuZweitHaelt')}</h3>
        <p>{t('hm2.dieSerieReisst')}</p>
        <button className="einladen" onClick={einladen}>
          {geteilt ? t('hm9.linkKopiert') : t('hm9.freundeEinladen')}
        </button>
      </div>
    </div>
  )
}


/**
 * Teaser: Bald gibt es Unterricht mit echten Tutoren. Wer informiert
 * werden will, landet auf der Warteliste in Listmonk.
 * Angemeldete tippen nur einen Knopf (Konto-Adresse), alle anderen
 * geben ihre Adresse ein.
 */
function TutorenTeaser({ nutzerEmail }) {
  const t = useTexte()
  const [eingetragen, setEingetragen] = useState(
    () => localStorage.getItem('tutoren-interesse') === 'ja'
  )
  const [andere, setAndere] = useState(!nutzerEmail)
  const [email, setEmail] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')

  async function eintragen(adresse) {
    setLaedt(true)
    setFehler('')
    try {
      const r = await fetch(API_URL + '/api/tutoren-interesse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adresse }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      localStorage.setItem('tutoren-interesse', 'ja')
      setEingetragen(true)
    } catch (e) {
      setFehler(e.message || t('hmm.hatNichtGeklappt'))
    } finally {
      setLaedt(false)
    }
  }

  return (
    <section className="start-karte tutoren">
      <span className="tutoren-marke">{t('hm.baldNeuLive')}</span>
      <h2 className="tutoren-titel">{t('hm.unterrichtMitEchten')}</h2>
      <p className="tutoren-text">{t('hm2.sprichLiveMit')}</p>

      {TUTOREN.map((t) => (
        <TutorProfil key={t.id} t={t} />
      ))}

      {eingetragen ? (
        <p className="tutoren-ok">
          <span aria-hidden="true">✓</span> {t('hm2.aufDerListe')}
        </p>
      ) : !andere ? (
        <div className="tutoren-knoepfe">
          <button className="btn" disabled={laedt} onClick={() => eintragen(nutzerEmail)}>
            {laedt ? t('hm9.einenMoment') : t('hm9.probestundeVormerken')}
          </button>
          <button className="btn-plain tutoren-andere" onClick={() => setAndere(true)}>
            An andere Adresse
          </button>
        </div>
      ) : (
        <form
          className="tutoren-form"
          onSubmit={(e) => {
            e.preventDefault()
            if (email.trim()) eintragen(email.trim())
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('hmk.deineEmailDe')}
            autoComplete="email"
          />
          <button className="btn" disabled={laedt || !email.trim()}>
            {laedt ? '…' : 'Informier mich'}
          </button>
        </form>
      )}
      {fehler && <p className="error">{fehler}</p>}
    </section>
  )
}

/** Profilkarte im Stil einer Tutorenplattform. Leere Felder fallen weg. */
function TutorProfil({ t }) {
  const txt = useTexte()
  const [mehr, setMehr] = useState(false)
  const kennzahlen = [
    t.bewertung != null && {
      wert: (
        <>
          <span className="tp-stern" aria-hidden="true">★</span> {String(t.bewertung).replace('.', ',')}
        </>
      ),
      text: t.bewertungen != null ? `${t.bewertungen} Bewertungen` : 'Bewertung',
    },
    t.lektionen != null && { wert: t.lektionen.toLocaleString(gebiet()), text: txt('hm.unterrichtsstunden') },
    t.preis != null && { wert: `${t.preis} €`, text: txt('hm.50MinStunde') },
  ].filter(Boolean)

  return (
    <article className="tp-karte">
      <div className="tp-kopf">
        <div className="tp-foto">
          <img src={t.foto} alt={t.name} width="84" height="84" loading="lazy" />
          <span className="tp-online" title={txt('hm.baldVerfuegbar')} />
        </div>
        <div className="tp-name-block">
          <h3 className="tp-name">
            {t.name} <span aria-hidden="true">{t.herkunft?.flagge}</span>
            {t.verifiziert && (
              <span className="tp-verifiziert" title={txt('hm.gepruefteTutorin')}>
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </h3>
          <p className="tp-ueberschrift">{txt(t.ueberschrift)}</p>
        </div>
      </div>

      <div className="tp-sprachen">
        {t.sprachen.map((s) => (
          <span key={s.name} className="tp-chip">
            <b>{txt(s.name)}</b>
            {s.stufe && <span>{txt(s.stufe)}</span>}
          </span>
        ))}
      </div>

      {kennzahlen.length > 0 && (
        <div className="tp-zahlen">
          {kennzahlen.map((k, i) => (
            <div key={i}>
              <b>{k.wert}</b>
              <span>{k.text}</span>
            </div>
          ))}
        </div>
      )}

      {t.schwerpunkte?.length > 0 && (
        <div className="tp-schwerpunkte">
          {t.schwerpunkte.map((s) => (
            <span key={s}>{txt(s)}</span>
          ))}
        </div>
      )}

      {t.ueber && (
        <div className="tp-ueber">
          <p className={mehr ? '' : 'tp-gekuerzt'}>{t.ueber}</p>
          <button type="button" className="tp-mehr" onClick={() => setMehr(!mehr)}>
            {mehr ? txt('hm9.weniger') : txt('hm9.mehrLesen')}
          </button>
        </div>
      )}

      <ul className="tp-vorteile">
        <li>{txt('hm.11Oder')}</li>
        <li>{txt('hm.perVideoBequem')}</li>
        <li>{txt('hm.passendZuDeinem')}</li>
      </ul>
    </article>
  )
}
