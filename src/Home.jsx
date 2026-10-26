import { API_URL, istApp } from './api.js'
import { TUTOREN } from './tutoren.js'
import { MODULE, lektionenVon } from './lektionen.js'
import { UNTERRICHT, stand, restzeit, terminText } from './unterricht.js'
import { usePremium } from './premium.js'
import { letzteWoche, jahresRaster, erstesJahr, summeWiederholungen } from './aktivitaet.js'
import Lernkurve from './Lernkurve.jsx'
import Meilensteine from './Meilensteine.jsx'
import InstallKnopf from './InstallKnopf.jsx'
import { zitatDesTages } from './zitate.js'
import { stueckDesTages } from './landUndLeute.js'
import { ladeGelesen } from './LandUndLeute.jsx'
import { useEffect, useState } from 'react'
import { FeedTuer } from './Feed.jsx'
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

export default function Home({
  progress,
  counts,
  nextLesson,
  lessonProgress = {},
  onNavigate,
  nutzerEmail,
}) {
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
      <h1 className="trainer-titel start-gruss">
        ¡Hola<span className="accent">!</span>
      </h1>

      {/* Nur im Browser: App auf den Startbildschirm holen */}
      <InstallKnopf app="Habloo" />
      {/* Der Satz des Tages steht da, wo vorher eine feste Zeile
          stand. Er ist zweisprachig: Wer ihn liest, hat schon einen
          echten spanischen Satz gelesen, bevor die erste Lektion
          anfaengt. */}
      <div className="zitat">
        <p className="zitat-es">{zitat.es}</p>
        <p className="zitat-de">
          {zitat.de}
          {zitat.quelle && <span className="zitat-quelle"> · {zitat.quelle}</span>}
        </p>
      </div>

      {/* ============ 1. WEITERLERNEN ============ */}
      <section className="start-karte start-lektion">
        <MiniRoute fertig={!nextLesson} />
        <div className="start-lektion-text">
          <span className="start-marke">
            {nextLesson ? 'Nächste aktive Lektion' : 'Alles geschafft'}
          </span>
          <h2>{nextLesson ? nextLesson.titel : 'Alle 150 Lektionen durch'}</h2>
          <p>
            {nextLesson
              ? (nextLesson.grammatik?.[0] ?? nextLesson.beschreibung)
              : 'Halte die Sprache mit dem Trainer und der Mediathek wach.'}
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
            {nextLesson ? 'Weiterlernen' : 'Zum Trainer'}
            <IconPfeil groesse={18} />
          </button>
        </div>
      </section>

      {/* ============ TEASER: Unterricht mit Tutoren ============ */}
      {TUTOREN_ZEIGEN && <TutorenTeaser nutzerEmail={nutzerEmail} />}

      {/* ============ 3. DIE WOCHE ============ */}
      <section className="start-karte">
        {/* Die Serie als Hingucker: Flamme + große Zahl */}
        <div className="streak-kopf">
          <span className={'streak-flamme' + (progress.streak > 0 ? ' streak-an' : '')} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="40" height="40">
              <defs>
                <linearGradient id="streak-verlauf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffb347" />
                  <stop offset="100%" stopColor="#ff5a00" />
                </linearGradient>
              </defs>
              <path
                d="M12 2.5c.6 3.3 3.1 4.9 4.6 7.2 1.2 1.8 1.9 3.5 1.9 5.3A6.5 6.5 0 0 1 12 21.5 6.5 6.5 0 0 1 5.5 15c0-2.6 1.3-4.6 3-6.3.2 1.6.9 2.7 2 3.3-.3-3.6.3-6.6 1.5-9.5z"
                fill="url(#streak-verlauf)"
              />
              <path
                d="M12 21.5a3.3 3.3 0 0 1-3.3-3.3c0-1.9 1.6-3 2.6-4.6.5 1.4 1.4 2 2.3 2.6.9.6 1.7 1.2 1.7 2.1a3.3 3.3 0 0 1-3.3 3.2z"
                fill="#ffe29a"
              />
            </svg>
          </span>
          <div className="streak-text">
            <b className="streak-zahl">{progress.streak}</b>
            <span className="streak-label">
              {progress.streak === 1 ? 'Tag' : 'Tage'} in Folge
            </span>
          </div>
          <h2 className="start-abschnitt streak-titel">Deine Lernstreak</h2>
        </div>

        <ol className="woche-reihe" aria-label={`${wochenSumme} Einheiten diese Woche`}>
          {woche.map((tag, i) => (
            <li key={i} className={'woche-punkt' + (tag.istHeute ? ' punkt-heute' : '')}>
              <span className="woche-name">{tag.istHeute ? 'Heute' : tag.label}</span>
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
  const max = Math.max(1, ...werte.map((w) => w.wert))
  return (
    <div className="sammelbalken">
      <p className="start-abschnitt-sub balken-titel">Gesammelt</p>
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
  const jetzt = new Date()
  const [ansicht, setAnsicht] = useState('monat') // 'monat' | 'jahr'
  const [gewaehlt, setGewaehlt] = useState(null)
  const [jahr, setJahr] = useState(jetzt.getFullYear())
  const [monat, setMonat] = useState(jetzt.getMonth())
  const [wisch, setWisch] = useState(null) // Startpunkt einer Wischgeste

  const monate = jahresRaster(jahr)
  const frueh = Math.min(erstesJahr(), jetzt.getFullYear())
  const wochentage = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

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
          Kalender · {aktiveTage} {aktiveTage === 1 ? 'aktiver Tag' : 'aktive Tage'}
        </p>
        <div className="kal-umschalter" role="tablist">
          <button type="button" className={ansicht === 'monat' ? 'ist-aktiv' : ''} onClick={() => wechsle('monat')}>
            Monat
          </button>
          <button type="button" className={ansicht === 'jahr' ? 'ist-aktiv' : ''} onClick={() => wechsle('jahr')}>
            Jahr
          </button>
        </div>
      </div>

      <div className="kal-jahr-nav">
        <button type="button" aria-label="Zurück" disabled={amAnfang} onClick={() => blaettern(-1)}>‹</button>
        <b>{titel}</b>
        <button type="button" aria-label="Weiter" disabled={amEnde} onClick={() => blaettern(1)}>›</button>
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
            <p className="kal-detail-leer">An diesem Tag wurde nichts gelernt.</p>
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
                  <span>{gewaehlt.lektionen === 1 ? 'Lektion' : 'Lektionen'}</span>
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
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })
}

/** Aufschlüsselung eines Tages als Text, z. B. "1 Lektion, 2 Wiederholungen". */
function kalTeile(z) {
  const teile = []
  if (z.lektionen > 0) teile.push(z.lektionen + (z.lektionen === 1 ? ' Lektion' : ' Lektionen'))
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
        Lerne in der <span className="accent">Praxis!</span>
      </h2>

      <p className="tutor-text">
        {s.zustand === 'laeuft' ? (
          <>
            Die Gruppenstunde mit <b className="accent">{UNTERRICHT.lehrerin}</b> läuft
            gerade – {restzeit(s.endetIn)} ist Schluss.
          </>
        ) : (
          <>
            Gruppenunterricht mit <b className="accent">{UNTERRICHT.lehrerin}</b>:{' '}
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
            {s.zustand === 'laeuft' ? 'Jetzt beitreten' : 'Raum öffnen'}
            <IconPfeil groesse={16} />
          </a>
        )}

        {offen && premium && !raumDa && (
          <button className="tutor-knopf" disabled>
            Raum wird vorbereitet
          </button>
        )}

        {!premium && !istApp && (
          <button className="tutor-knopf" onClick={() => onNavigate('mehr')}>
            Mit Premium teilnehmen <IconPfeil groesse={16} />
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
        <p className="tutor-hinweis">
          Die Zugangsadresse fehlt noch (VITE_UNTERRICHT_URL).
        </p>
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
    titel: 'Jeden Tag eine Etappe',
    text: 'Zwölf neue Wörter, ein Dialog, ein paar Übungen – acht bis zehn Minuten. Mehr braucht ein Tag nicht. Die Reiseroute zeigt dir immer genau die eine Lektion, die als Nächstes dran ist. Suchen musst du nichts.',
    ziel: 'lektionen',
    link: 'Zur Reiseroute',
  },
  {
    titel: 'Was du lernst, geht nicht wieder weg',
    text: 'Jede Vokabel aus einer Lektion landet im Trainer. Der merkt sich, wann du sie zuletzt konntest, und legt sie dir genau dann wieder vor, wenn du sie zu vergessen drohst – nach einem Tag, nach dreien, nach einer Woche. Das ist der Unterschied zwischen „schon mal gesehen“ und „kann ich“.',
    ziel: 'trainer',
    link: 'Zum Vokabeltrainer',
  },
  {
    titel: 'Grammatik in kleinen Bausteinen',
    text: 'Ser oder estar, Indefinido oder Imperfekt: 55 Regeln, jede mit fünf Aufgaben. Jeden Tag ist eine andere dran – im selben Karteikasten wie die Vokabeln. Zwei Minuten, und die Regel bleibt.',
    ziel: 'trainer',
    link: 'Zu den Bausteinen',
  },
  {
    titel: 'Lernen, ohne zu lernen',
    text: 'In der Mediathek sagst du auf Deutsch, worüber du etwas schauen willst – Ernährung, Sport, Psychologie – und bekommst spanische Videos dazu. Dazu Songs mit mitlaufendem Text und Buchzusammenfassungen. Unbekannte Wörter tippst du an, sie wandern in den Trainer.',
    ziel: 'videos',
    link: 'Zur Mediathek',
  },
  {
    titel: 'Und an den Tagen ohne Lust',
    text: 'Vier Spiele: Memory, Wortpaare, Wortsuche, Wortfang. Sie nehmen genau die Wörter, die als Nächstes fällig wären. Wer sie im Spiel wiedererkennt, schiebt sie eine Stufe weiter. Lernen, das sich nicht danach anfühlt.',
    ziel: 'trainer',
    link: 'Zu den Spielen',
  },
  {
    titel: 'Was die KI dir abnimmt',
    text: 'Sie stellt Wortlisten zu jedem Thema zusammen – ohne die Wörter, die du längst hast. Sie sucht Videos zu deinen Interessen. Sie schreibt dir eine Buchzusammenfassung auf Spanisch. Sie lernt nicht für dich, sie nimmt dir das Suchen ab.',
    ziel: 'trainer',
    link: 'Liste erstellen lassen',
  },
  {
    titel: 'Warum es Level und Serien gibt',
    text: 'Ehrlich gesagt: weil Lernen ohne sichtbaren Fortschritt aufhört. XP, Level, die Tage-Serie und die Prüfstation am Ende jedes Moduls sind kleine Beweise, dass etwas passiert – gerade an den Tagen, an denen es sich nicht so anfühlt.',
    ziel: 'mehr',
    link: 'Zu deinen Zielen',
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
  const [geteilt, setGeteilt] = useState(false)

  async function einladen() {
    const daten = {
      title: 'Habloo',
      text: 'Ich lerne gerade Spanisch mit Habloo – Lektionen, echte Videos und ein Trainer, der sich merkt, wann du wiederholen musst. Kommst du mit?',
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
        <span className="zurueck-pfeil" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></span>Zurück
      </button>
      <h1 className="trainer-titel">
        So nutzt du <span className="accent">Habloo</span>
      </h1>
      <p className="intro">
        Deine Reise durch die App – und was wir uns dabei gedacht haben.
      </p>

      {/* Der geführte Rundgang: die App klickt selbst durch alle
          Bereiche und erklärt jeden kurz. Für alle, die lieber
          schauen als lesen. */}
      {onRundgang && (
        <button className="btn rundgang-start" onClick={onRundgang}>
          ✦ Rundgang starten – einmal durch die ganze App
        </button>
      )}

      <ol className="reise-liste">
        {STATIONEN.map((s, i) => (
          <li className="reise-station" key={s.titel}>
            <span className="reise-punkt" aria-hidden="true">{i + 1}</span>
            <div className="reise-inhalt">
              <h3>{s.titel}</h3>
              <p>{s.text}</p>
              <button className="reise-link" onClick={() => onNavigate(s.ziel)}>
                {s.link}
                <IconPfeil groesse={15} />
              </button>
            </div>
          </li>
        ))}
      </ol>

      <div className="reise-ziel">
        <h3>Zu zweit hält man länger durch</h3>
        <p>
          Die Serie reißt seltener, wenn noch jemand mitzählt. Schnapp dir jemanden,
          der auch schon immer mal Spanisch lernen wollte.
        </p>
        <button className="einladen" onClick={einladen}>
          {geteilt ? 'Link kopiert ✓' : 'Freunde einladen'}
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
      setFehler(e.message || 'Hat nicht geklappt.')
    } finally {
      setLaedt(false)
    }
  }

  return (
    <section className="start-karte tutoren">
      <span className="tutoren-marke">Bald neu · Live-Unterricht</span>
      <h2 className="tutoren-titel">Unterricht mit echten Tutoren</h2>
      <p className="tutoren-text">
        Sprich live mit Muttersprachlern – in kleinen Gruppen oder 1:1, passend zu
        deinem Niveau. Wir sagen dir Bescheid, sobald es losgeht.
      </p>

      {TUTOREN.map((t) => (
        <TutorProfil key={t.id} t={t} />
      ))}

      {eingetragen ? (
        <p className="tutoren-ok">
          <span aria-hidden="true">✓</span> Du stehst auf der Liste – wir melden uns.
        </p>
      ) : !andere ? (
        <div className="tutoren-knoepfe">
          <button className="btn" disabled={laedt} onClick={() => eintragen(nutzerEmail)}>
            {laedt ? 'Einen Moment …' : 'Probestunde vormerken'}
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
            placeholder="deine@email.de"
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
    t.lektionen != null && { wert: t.lektionen.toLocaleString('de-DE'), text: 'Unterrichtsstunden' },
    t.preis != null && { wert: `${t.preis} €`, text: '50-Min.-Stunde' },
  ].filter(Boolean)

  return (
    <article className="tp-karte">
      <div className="tp-kopf">
        <div className="tp-foto">
          <img src={t.foto} alt={t.name} width="84" height="84" loading="lazy" />
          <span className="tp-online" title="Bald verfügbar" />
        </div>
        <div className="tp-name-block">
          <h3 className="tp-name">
            {t.name} <span aria-hidden="true">{t.herkunft?.flagge}</span>
            {t.verifiziert && (
              <span className="tp-verifiziert" title="Geprüfte Tutorin">
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </h3>
          <p className="tp-ueberschrift">{t.ueberschrift}</p>
        </div>
      </div>

      <div className="tp-sprachen">
        {t.sprachen.map((s) => (
          <span key={s.name} className="tp-chip">
            <b>{s.name}</b>
            {s.stufe && <span>{s.stufe}</span>}
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
            <span key={s}>{s}</span>
          ))}
        </div>
      )}

      {t.ueber && (
        <div className="tp-ueber">
          <p className={mehr ? '' : 'tp-gekuerzt'}>{t.ueber}</p>
          <button type="button" className="tp-mehr" onClick={() => setMehr(!mehr)}>
            {mehr ? 'Weniger' : 'Mehr lesen'}
          </button>
        </div>
      )}

      <ul className="tp-vorteile">
        <li>1:1 oder kleine Gruppe</li>
        <li>Per Video, bequem von zu Hause</li>
        <li>Passend zu deinem Niveau in Habloo</li>
      </ul>
    </article>
  )
}
