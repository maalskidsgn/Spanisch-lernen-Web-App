import { MODULE, lektionenVon } from './lektionen.js'
import { UNTERRICHT, stand, restzeit, terminText } from './unterricht.js'
import { usePremium } from './premium.js'
import { letzteWoche } from './aktivitaet.js'
import { useEffect, useState } from 'react'
import { IconPfeil } from './icons.jsx'

// Die Startseite.
//
// Drei Karten, in dieser Reihenfolge: weiterlernen, schnell etwas
// erzeugen, und was diese Woche passiert ist. Das ist die Antwort
// auf "Was mache ich jetzt?" – von der klarsten zur lockersten.
//
// Die beiden Felder im Schnellzugriff erzeugen NICHTS selbst. Sie
// nehmen die Frage entgegen und reichen sie an die Stelle weiter,
// die es ohnehin kann: Wortlisten an den Trainer, Videos an die
// Mediathek. Sonst gaebe es zwei Stellen, an denen dasselbe
// entsteht – und eine davon waere irgendwann veraltet.

// Die Gruppenstunde steht nicht mehr auf dem Start. Ihr Bauplan ist
// unten erhalten: Diese eine Zeile holt sie zurueck.
const PRAXIS_ZEIGEN = false

export default function Home({
  progress,
  counts,
  nextLesson,
  lessonProgress = {},
  onNavigate,
  onVideoFrage,
  onListenFrage,
}) {
  const [listeFeld, setListeFeld] = useState('')
  const [videoFeld, setVideoFeld] = useState('')

  const modul = nextLesson
    ? MODULE.find((m) => nextLesson.kursNr >= m.von && nextLesson.kursNr <= m.bis)
    : null
  const modulListe = modul ? lektionenVon(modul) : []
  const modulFertig = modulListe.filter((l) => lessonProgress[l.id]?.fertig).length

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
      <p className="intro">Bereit für deinen nächsten Schritt?</p>

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

      {/* ============ 2. SCHNELLZUGRIFF ============ */}
      <section className="start-karte">
        <h2 className="start-abschnitt">Schnellzugriff</h2>
        <div className="schnell-paar">
          <SchnellFeld
            titel="Vokabel-Listengenerator"
            text="Neue Wörter nach Thema"
            platzhalter="z. B. Restaurant, Reisen …"
            wert={listeFeld}
            onWert={setListeFeld}
            onAbsenden={() => onListenFrage(listeFeld.trim())}
          />
          <SchnellFeld
            titel="Video finden"
            text="Passende spanische Videos"
            platzhalter="z. B. Ernährung, Schlaf …"
            wert={videoFeld}
            onWert={setVideoFeld}
            onAbsenden={() => onVideoFrage(videoFeld.trim())}
          />
        </div>
      </section>

      {/* ============ 3. DIE WOCHE ============ */}
      <section className="start-karte">
        <h2 className="start-abschnitt">Dein Lernfortschritt</h2>
        <p className="start-abschnitt-sub">Diese Woche</p>

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

        <div className="start-zahlen">
          <div className="start-zahl">
            <b>{progress.streak}</b>
            <span>Tage Serie</span>
          </div>
          <div className="start-zahl">
            <b>{counts.woerter}</b>
            <span>Wörter</span>
          </div>
          <div className="start-zahl">
            <b>{lektionenFertig}</b>
            <span>Lektionen</span>
          </div>
        </div>
      </section>

      {PRAXIS_ZEIGEN && <Gruppenstunde onNavigate={onNavigate} />}
    </div>
  )
}

/** Eines der beiden Felder im Schnellzugriff. */
function SchnellFeld({ titel, text, platzhalter, wert, onWert, onAbsenden }) {
  return (
    <form
      className="schnell"
      onSubmit={(e) => {
        e.preventDefault()
        if (wert.trim()) onAbsenden()
      }}
    >
      <h3>{titel}</h3>
      <p>{text}</p>
      <div className="schnell-feld">
        <input
          value={wert}
          onChange={(e) => onWert(e.target.value)}
          placeholder={platzhalter}
        />
        <button type="submit" disabled={!wert.trim()} aria-label={titel + ' starten'}>
          <IconPfeil groesse={17} />
        </button>
      </div>
    </form>
  )
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

        {!premium && (
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
