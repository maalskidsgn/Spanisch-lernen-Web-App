import { MODULE, lektionenVon } from './lektionen.js'
import { UNTERRICHT, stand, restzeit, terminText } from './unterricht.js'
import { usePremium } from './premium.js'
import { letzteWoche, kalenderRaster } from './aktivitaet.js'
import { zitatDesTages } from './zitate.js'
import { stueckDesTages } from './landUndLeute.js'
import { ladeGelesen } from './LandUndLeute.jsx'
import { useEffect, useState } from 'react'
import { IconPfeil } from './icons.jsx'

// Die Startseite.
//
// Drei Karten, in dieser Reihenfolge: weiterlernen, verstehen, wie
// die App gedacht ist, und was diese Woche passiert ist. Das ist die
// Antwort auf "Was mache ich jetzt?" – von der klarsten zur
// lockersten.

// Die Gruppenstunde steht nicht mehr auf dem Start. Ihr Bauplan ist
// unten erhalten: Diese eine Zeile holt sie zurueck.
const PRAXIS_ZEIGEN = false

export default function Home({
  progress,
  counts,
  nextLesson,
  lessonProgress = {},
  onNavigate,
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

      {/* ============ 2. DER WEG ZUM LEITFADEN ============ */}
      {/* Nur die Tuer, nicht der ganze Raum: Der Leitfaden ist lang
          und liest sich einmal – auf dem Start stuende er jeden Tag
          im Weg. */}
      <button className="start-karte leitfaden-tuer" onClick={() => onNavigate('leitfaden')}>
        <span className="leitfaden-text">
          <span className="start-marke">Neu hier?</span>
          <h2>So nutzt du Habloo</h2>
          <p>Deine Reise durch die App – und was wir uns dabei gedacht haben.</p>
        </span>
        <span className="leitfaden-pfeil" aria-hidden="true">
          <IconPfeil groesse={18} />
        </span>
      </button>

      {/* ============ 3. SPRECHEN ============ */}
      {/* Das Eigentliche: mit dem Gelernten wirklich reden. Steht
          bewusst weit oben – wer spricht, lernt am meisten. */}
      <button className="start-karte gespr-tuer" onClick={() => onNavigate('gespraech')}>
        <span className="leitfaden-text">
          <span className="start-marke">Neu · Sprechen</span>
          <h2>Rede mit Habla</h2>
          <p>Ein Gespräch auf Spanisch, in deinem Tempo – die KI antwortet einfach und hilft, wenn du hängst.</p>
        </span>
        <span className="leitfaden-pfeil" aria-hidden="true">
          <IconPfeil groesse={18} />
        </span>
      </button>

      {/* ============ 3. LAND & LEUTE ============ */}
      {/* Der Grund, die App auch an einem Tag zu oeffnen, an dem man
          keine Lektion machen will. Steht deshalb VOR der Wochen-
          uebersicht: Die schaut man an, wenn man schon da ist. */}
      <button className="start-karte lul-tuer" onClick={() => onNavigate('landundleute')}>
        <span className="leitfaden-text">
          <span className="start-marke">
            {schonGelesen ? 'Land & Leute' : 'Heute neu · Land & Leute'}
          </span>
          <h2>{stueck.titel}</h2>
          <p>{stueck.vorspann}</p>
        </span>
        <span className="leitfaden-pfeil" aria-hidden="true">
          <IconPfeil groesse={18} />
        </span>
      </button>

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

        {/* Der Kalender: ein Kreuz an jedem Tag, an dem etwas gelernt
            wurde. Antippen zeigt, wie viele Lektionen und
            Wiederholungen es waren. */}
        <Kalender />
      </section>

      {PRAXIS_ZEIGEN && <Gruppenstunde onNavigate={onNavigate} />}
    </div>
  )
}

/**
 * Kalender der letzten Wochen. Kreuz = an diesem Tag gelernt; antippen
 * zeigt die Aufschlüsselung in Lektionen und Wiederholungen.
 */
function Kalender() {
  const zellen = kalenderRaster(6)
  const [gewaehlt, setGewaehlt] = useState(null)
  const wochentage = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

  const aktiveTage = zellen.filter((z) => z.gesamt > 0).length

  return (
    <div className="kalender">
      <p className="start-abschnitt-sub kal-titel">
        Kalender · {aktiveTage} {aktiveTage === 1 ? 'aktiver Tag' : 'aktive Tage'}
      </p>

      <div className="kal-wochentage">
        {wochentage.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>

      <div className="kal-gitter">
        {zellen.map((z) => (
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
            {z.gesamt > 0 && <span className="kal-kreuz" aria-hidden="true">✕</span>}
          </button>
        ))}
      </div>

      {gewaehlt && (
        <p className="kal-detail">
          <b>{kalDatum(gewaehlt.schluessel)}</b>{' '}
          {gewaehlt.gesamt === 0 ? '– nichts gelernt' : '– ' + kalTeile(gewaehlt)}
        </p>
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
      <button className="btn-plain back-link" onClick={onZurueck}>
        ← Zurück
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
