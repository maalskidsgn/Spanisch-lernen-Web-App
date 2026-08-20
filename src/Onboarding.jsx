import { useState, useEffect } from 'react'
import { paketFuer } from './startpakete.js'
import Logo from './Logo.jsx'

/**
 * Das Onboarding – die ersten neunzig Sekunden mit Habloo.
 *
 * Bisher landete jeder nach der Registrierung wortlos mitten in der
 * App: kein Ziel, keine Erklärung, keine Ahnung, ob man bei den
 * Lektionen oder beim Trainer anfängt. Jetzt: drei Fragen zum
 * Antippen, und danach liegt das Startpaket bereit: eine Wortliste
 * zum gewählten Grund, ein Video und ein Song.
 *
 * Der Trichter läuft VOR der Anmeldung – wer auf der Startseite auf
 * "Loslegen" tippt, landet sofort hier und sieht erst danach das
 * Anmeldefenster. Wer sich dann anmeldet, bekommt sein Paket ins
 * Konto gezogen; wer abspringt, hat nichts verloren.
 *
 * Der Ladebildschirm dazwischen wartet auf nichts – das Paket liegt
 * fertig in startpakete.js. Er ist die FÜHRUNG durch die App: sechs
 * Karten, alle vier Sekunden eine. Niemand liest eine Anleitung,
 * aber zwanzig Sekunden zusehen tut jeder.
 */

// Die drei Fragen. "wert" wird gespeichert; beim Tagesziel ist es
// direkt die Tages-XP-Zahl – dieselben vier Stufen, die auch in den
// Einstellungen zur Wahl stehen.
const SCHRITTE = [
  {
    id: 'grund',
    frage: 'Warum lernst du Spanisch?',
    optionen: [
      { wert: 'reisen', emoji: '✈️', text: 'Reisen' },
      { wert: 'familie', emoji: '❤️', text: 'Familie & Partner' },
      { wert: 'kultur', emoji: '🎵', text: 'Musik & Kultur' },
      { wert: 'beruf', emoji: '💼', text: 'Beruf & Karriere' },
      { wert: 'auswandern', emoji: '🏝️', text: 'Auswandern' },
      { wert: 'lust', emoji: '✨', text: 'Einfach Lust drauf' },
    ],
  },
  {
    id: 'niveau',
    frage: 'Wie viel Spanisch kannst du schon?',
    optionen: [
      { wert: 'neu', emoji: '🌱', text: 'Ich fange ganz neu an' },
      { wert: 'woerter', emoji: '🔤', text: 'Ich kenne ein paar Wörter' },
      { wert: 'saetze', emoji: '💬', text: 'Ich führe einfache Gespräche' },
      { wert: 'viel', emoji: '🚀', text: 'Ich verstehe schon einiges' },
    ],
  },
  {
    id: 'ziel',
    frage: 'Wie viel Zeit hast du am Tag?',
    optionen: [
      { wert: 10, emoji: '☕', text: '5 Minuten', hinweis: 'Entspannt' },
      { wert: 20, emoji: '🙂', text: '10 Minuten', hinweis: 'Normal' },
      { wert: 30, emoji: '💪', text: '15 Minuten', hinweis: 'Ernsthaft' },
      { wert: 50, emoji: '🔥', text: '30 Minuten', hinweis: 'Intensiv' },
    ],
  },
]

/**
 * Die Tour auf dem Ladebildschirm: eine Karte je Funktion.
 *
 * Sechs Karten à vier Sekunden sind rund 24 Sekunden – etwa so lange
 * braucht die Wortlisten-KI. Die Reihenfolge ist die empfohlene
 * Lernreihenfolge, nicht die Menüreihenfolge.
 */
const TOUR = [
  {
    emoji: '🎓',
    titel: '150 Lektionen',
    text: 'Von der ersten Begrüßung bis zum Vorstellungsgespräch – jedes Wort und jeder Dialog mit echten spanischen Stimmen.',
  },
  {
    emoji: '🃏',
    titel: 'Der Vokabeltrainer',
    text: 'Merkt sich, was du zu vergessen drohst, und fragt genau dann – erst nach Tagen, dann nach Wochen, dann nach Monaten.',
  },
  {
    emoji: '🧩',
    titel: 'Grammatik in Bausteinen',
    text: 'Kein Regelwerk am Stück: kleine Übungsrunden, die wiederkommen, bis eine Regel von allein sitzt.',
  },
  {
    emoji: '☕',
    titel: 'Mitgehört',
    text: 'Echten Gesprächen folgen, ohne mitzulesen – erst hören, dann Fragen zum Inhalt, zum Schluss die Abschrift.',
  },
  {
    emoji: '🎬',
    titel: 'Deine Mediathek',
    text: 'Videos, Songs und Ebooks auf deinem Niveau – und aus jedem Inhalt wandern neue Wörter in deinen Trainer.',
  },
  {
    emoji: '✨',
    titel: 'KI, die mitdenkt',
    text: 'Wortlisten, Übungsvarianten und Lesetexte entstehen aus dem, was du wählst – so wie gerade dein Startpaket.',
  },
]

/** Das Habloo-Maskottchen: die Sprechblase, leicht schwebend. */
function Maskottchen() {
  return (
    <span className="ob-maskottchen" aria-hidden="true">
      <Logo />
    </span>
  )
}

/**
 * @param {function} onFertig – bekommt (antworten, paket)
 * @param {function} onUeberspringen – der leise Ausweg
 * @param {boolean} [kontoNoetig] – true im Trichter vor der Anmeldung:
 *   ändert den Schluss-Knopf und den Hinweis darunter
 */
export default function Onboarding({ onFertig, onUeberspringen, kontoNoetig = false }) {
  const [index, setIndex] = useState(0)
  const [antworten, setAntworten] = useState({})
  const [gewaehlt, setGewaehlt] = useState(null) // leuchtet kurz auf
  const fertig = index >= SCHRITTE.length
  const schritt = SCHRITTE[index]

  function waehle(option) {
    if (gewaehlt !== null) return // schon gewählt, der Sprung läuft
    setGewaehlt(option.wert)
    setAntworten((a) => ({ ...a, [schritt.id]: option.wert }))
    setTimeout(() => {
      setGewaehlt(null)
      setIndex((i) => i + 1)
    }, 400)
  }

  // ---------- Das Startpaket ----------
  //
  // Es liegt fertig in startpakete.js – kein Netz, keine Kosten, kein
  // Fehlschlag. Warum nicht live erzeugt: Der Trichter laeuft VOR der
  // Anmeldung, jeder anonyme Besuch loeste sonst eine OpenAI-Anfrage
  // aus. Und ein leerer Kasten, weil das Kontingent alle ist, waere
  // der schlechteste erste Eindruck ueberhaupt.
  const paket = paketFuer(antworten.grund)

  // ---------- Der Ladebildschirm ----------
  //
  // Er wartet auf nichts – das Paket ist sofort da. Er ist die
  // FUEHRUNG durch die App: sechs Karten, alle vier Sekunden eine.
  // Niemand liest eine Anleitung, aber zwanzig Sekunden zusehen tut
  // jeder.
  //
  // Deshalb steht dort auch "wird zusammengestellt" und nicht "wird
  // generiert": Erzeugt wurde das Paket vorher, ausgesucht wird es
  // jetzt – nach der Antwort auf Frage eins. Beides stimmt so.
  const TOUR_DAUER = 4000
  const KARTEN_BIS_WEITER = 3 // danach darf man ueberspringen
  const [tourIndex, setTourIndex] = useState(0)
  const [durch, setDurch] = useState(false)

  useEffect(() => {
    if (!fertig) return
    const takt = setInterval(() => {
      setTourIndex((t) => {
        if (t + 1 >= TOUR.length) {
          setDurch(true)
          clearInterval(takt)
          return t
        }
        return t + 1
      })
    }, TOUR_DAUER)
    return () => clearInterval(takt)
  }, [fertig])

  // Der Balken laeuft ueber die ganze Tour – er zeigt also wirklich
  // an, wie weit man ist, und nicht eine erfundene Rechenzeit.
  const [balken, setBalken] = useState(0)
  useEffect(() => {
    if (!fertig) return
    const gesamt = TOUR.length * TOUR_DAUER
    const start = Date.now()
    const takt = setInterval(() => {
      setBalken(Math.min(100, ((Date.now() - start) / gesamt) * 100))
    }, 120)
    return () => clearInterval(takt)
  }, [fertig])

  if (!fertig) {
    // ---------- Frage-Bildschirm ----------
    return (
      <div className="ob">
        <div className="ob-kopf">
          {index > 0 && (
            <button className="ob-zurueck" onClick={() => setIndex((i) => i - 1)} aria-label="Zurück">
              ←
            </button>
          )}
          <div className="ob-balken">
            <div
              className="ob-balken-voll"
              style={{ width: ((index + 1) / (SCHRITTE.length + 1)) * 100 + '%' }}
            />
          </div>
          <button className="ob-skip" onClick={onUeberspringen}>
            Überspringen
          </button>
        </div>

        <div className="ob-frage-zeile">
          <Maskottchen />
          <div className="ob-blase">{schritt.frage}</div>
        </div>

        {/* key: Bei jedem Schritt neu aufgebaut, damit die
            Einblend-Animation wieder läuft – wie beim Umschalter
            der Mediathek. */}
        <div className="ob-optionen" key={schritt.id}>
          {schritt.optionen.map((o) => (
            <button
              key={o.wert}
              className={'ob-option' + (gewaehlt === o.wert ? ' ob-option-aktiv' : '')}
              onClick={() => waehle(o)}
            >
              <span className="ob-option-emoji">{o.emoji}</span>
              <span className="ob-option-text">
                {o.text}
                {o.hinweis && <small>{o.hinweis}</small>}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const karte = TOUR[tourIndex]

  // ---------- Ladebildschirm: Balken + Funktions-Tour ----------
  if (!durch) {
    return (
      <div className="ob">
        <div className="ob-karte ob-laden">
          <span className="ob-schwebt"><Maskottchen /></span>
          <h1>Dein Startpaket wird zusammengestellt.</h1>
          <p className="ob-text">
            Passend zu <b>{paket.label}</b> – und währenddessen: was dich erwartet.
          </p>

          <div className="ob-ladebalken">
            <div className="ob-ladebalken-voll" style={{ width: balken + '%' }} />
          </div>

          {/* key: laesst die Karte bei jedem Wechsel neu einblenden */}
          <div className="ob-tour" key={tourIndex}>
            <span className="ob-tour-emoji">{karte.emoji}</span>
            <h2>{karte.titel}</h2>
            <p>{karte.text}</p>
          </div>
          <div className="ob-tour-punkte" aria-hidden="true">
            {TOUR.map((_, i) => (
              <span key={i} className={i === tourIndex ? 'aktiv' : ''} />
            ))}
          </div>

          {/* Wer die Tour kennt, muss sie nicht zu Ende sehen – aber
              erst nach ein paar Karten, sonst klickt man reflexhaft
              weiter und hat nichts mitbekommen. */}
          {tourIndex >= KARTEN_BIS_WEITER && (
            <button className="ob-skip ob-skip-tour" onClick={() => setDurch(true)}>
              Weiter zum Startpaket →
            </button>
          )}
        </div>
      </div>
    )
  }

  // ---------- Abschluss: das Startpaket ----------
  const zielOption = SCHRITTE[2].optionen.find((o) => o.wert === antworten.ziel)
  const anzahl = paket.vokabeln.length

  return (
    <div className="ob">
      <div className="ob-karte ob-schluss">
        <Maskottchen />
        <h1>
          ¡Listo! <span className="ob-akzent">Dein Startpaket ist da.</span>
        </h1>
        <p className="ob-text">
          Dein Plan: <b>{zielOption?.text ?? '10 Minuten'} am Tag</b> ·{' '}
          <b>{anzahl} Wörter</b> zum Thema {paket.label}
          {kontoNoetig ? ' warten auf dich' : ' warten im Trainer'}.
        </p>

        {/* Warum genau diese Wörter – die Begründung stammt aus
            derselben KI, die die Liste zusammengestellt hat. */}
        {paket.begruendung && <p className="ob-begruendung">{paket.begruendung}</p>}

        <div className="ob-liste">
          {paket.vokabeln.slice(0, 5).map((w) => (
            <div key={w.wort} className="ob-liste-zeile">
              <span className="ob-liste-es">{w.wort}</span>
              <span className="ob-liste-de">{w.uebersetzung}</span>
            </div>
          ))}
          {anzahl > 5 && (
            <div className="ob-liste-zeile ob-liste-mehr">… und {anzahl - 5} weitere</div>
          )}
        </div>

        <div className="ob-medien">
          <div className="ob-medium">
            <img src={paket.video.thumbnail} alt="" loading="lazy" />
            <span className="ob-medium-art">🎬 Dein erstes Video</span>
            <span className="ob-medium-titel">{paket.video.title}</span>
          </div>
          <div className="ob-medium">
            <img src={paket.song.thumbnail} alt="" loading="lazy" />
            <span className="ob-medium-art">🎵 Dein erster Song</span>
            <span className="ob-medium-titel">{paket.song.title}</span>
          </div>
        </div>

        <button className="ob-los" onClick={() => onFertig(antworten, paket)}>
          {kontoNoetig ? 'Konto anlegen und Paket sichern' : '¡Vamos! Los geht’s'}
        </button>
        <p className="ob-hinweis">
          {kontoNoetig ? (
            <>Kostenlos. Dein Startpaket liegt danach im Trainer und in der Mediathek.</>
          ) : (
            <>
              Am besten startest du mit <b>Lektion 1</b> – dein Startpaket wartet derweil im
              Trainer und in der Mediathek.
            </>
          )}
        </p>
      </div>
    </div>
  )
}
