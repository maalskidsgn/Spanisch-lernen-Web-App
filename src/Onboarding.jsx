import { useState, useEffect, useRef } from 'react'
import { API_URL } from './api.js'
import Logo from './Logo.jsx'

/**
 * Das Onboarding – die ersten neunzig Sekunden mit Habloo.
 *
 * Bisher landete jeder nach der Registrierung wortlos mitten in der
 * App: kein Ziel, keine Erklärung, keine Ahnung, ob man bei den
 * Lektionen oder beim Trainer anfängt. Jetzt: drei Fragen zum
 * Antippen, und aus den Antworten baut die KI das erste Startpaket –
 * eine Wortliste zum gewählten Grund, ein erstes Video auf dem
 * richtigen Niveau, ein erster Song.
 *
 * Während das Paket entsteht, läuft der Ladebildschirm: ein Balken
 * ("Deine Inhalte werden generiert.") und darüber eine Tour, die
 * nacheinander erklärt, was die App kann. Die Wartezeit IST die
 * Führung – niemand liest eine Anleitung, aber zwanzig Sekunden
 * zusehen tut jeder.
 *
 * Fällt etwas aus (Server aus, Kontingent leer), geht es mit dem
 * Rest weiter. Das Onboarding blockiert nie den Weg in die App.
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

// Aus dem "Warum" werden Thema der Wortliste und Song-Suche.
const STARTPAKET = {
  reisen: { thema: 'Reisen und unterwegs sein in Spanien', label: 'Reisen', song: 'bekannte spanische Lieder zum Mitsingen' },
  familie: { thema: 'Familie und nahestehende Menschen', label: 'Familie', song: 'schöne spanische Lieder über Liebe' },
  kultur: { thema: 'Musik, Ausgehen und Kultur', label: 'Musik & Kultur', song: 'beliebte spanische Popsongs' },
  beruf: { thema: 'Arbeit und Beruf', label: 'Beruf', song: 'bekannte spanische Lieder zum Mitsingen' },
  auswandern: { thema: 'Wohnen, Behörden und Alltag in Spanien', label: 'Alltag in Spanien', song: 'bekannte spanische Lieder zum Mitsingen' },
  lust: { thema: 'die allerersten Wörter für den Einstieg', label: 'deine ersten Wörter', song: 'beliebte spanische Popsongs' },
}

// Aus der Selbsteinschätzung wird das Niveau der Videosuche.
const VIDEO_NIVEAU = { neu: 'A1', woerter: 'A1', saetze: 'A2', viel: 'B1' }

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
 * @param {function} onFertig – bekommt (antworten, paket) mit
 *   paket = { woerter: [...], begruendung, video: {...}|null, song: {...}|null }
 * @param {function} onUeberspringen – der leise Ausweg, setzt nur die Flagge
 */
export default function Onboarding({ onFertig, onUeberspringen }) {
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

  // ---------- Das Startpaket: Wortliste + Video + Song parallel ----------
  const paketInfo = STARTPAKET[antworten.grund] ?? STARTPAKET.lust
  const [woerter, setWoerter] = useState({ status: 'laedt', daten: [], begruendung: '' })
  const [video, setVideo] = useState({ status: 'laedt', daten: null })
  const [song, setSong] = useState({ status: 'laedt', daten: null })

  useEffect(() => {
    if (!fertig) return
    const abbruch = new AbortController()
    // Nach spätestens 45 Sekunden geht es mit dem weiter, was da ist.
    const timer = setTimeout(() => abbruch.abort(), 45000)
    const signal = abbruch.signal

    // 1. Die Wortliste, passend zum gewählten Grund
    fetch(API_URL + '/api/vokabelliste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thema: paketInfo.thema }),
      signal,
    })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.vokabeln) && d.vokabeln.length) {
          setWoerter({ status: 'fertig', daten: d.vokabeln, begruendung: d.begruendung ?? '' })
        } else setWoerter({ status: 'fehler', daten: [], begruendung: '' })
      })
      .catch(() => setWoerter({ status: 'fehler', daten: [], begruendung: '' }))

    // 2. Ein erstes Video auf dem Niveau der Selbsteinschätzung
    const niveau = VIDEO_NIVEAU[antworten.niveau] ?? 'A1'
    fetch(
      API_URL + '/api/search?q=' + encodeURIComponent('Spanisch lernen für Anfänger') + '&niveau=' + niveau,
      { signal }
    )
      .then((r) => r.json())
      .then((d) => {
        const treffer = (d.results ?? []).find((v) => v.videoId?.length === 11)
        setVideo(treffer ? { status: 'fertig', daten: treffer } : { status: 'fehler', daten: null })
      })
      .catch(() => setVideo({ status: 'fehler', daten: null }))

    // 3. Ein erster Song, passend zum Grund
    fetch(API_URL + '/api/search?q=' + encodeURIComponent(paketInfo.song) + '&nurMusik=1', { signal })
      .then((r) => r.json())
      .then((d) => {
        const treffer = (d.results ?? []).find((v) => v.videoId?.length === 11)
        setSong(treffer ? { status: 'fertig', daten: treffer } : { status: 'fehler', daten: null })
      })
      .catch(() => setSong({ status: 'fehler', daten: null }))

    return () => { clearTimeout(timer); abbruch.abort() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fertig])

  // ---------- Der Ladebalken ----------
  //
  // Er zeigt ECHTEN Fortschritt: jede der drei Aufgaben ist ein
  // Drittel. Dazwischen kriecht er langsam weiter, damit er nie
  // stillsteht – ein stehender Balken heißt für jeden "hängt".
  // Er kriecht aber nur bis kurz vor die nächste Drittelmarke:
  // Ein Balken bei 99 %, der dann doch nicht fertig ist, lügt.
  const erledigt =
    (woerter.status !== 'laedt' ? 1 : 0) +
    (video.status !== 'laedt' ? 1 : 0) +
    (song.status !== 'laedt' ? 1 : 0)
  const [balken, setBalken] = useState(4)
  useEffect(() => {
    if (!fertig) return
    const takt = setInterval(() => {
      setBalken((b) => {
        const deckel = erledigt >= 3 ? 100 : erledigt * 33 + 26
        return Math.min(b + (erledigt >= 3 ? 6 : 0.7), deckel)
      })
    }, 180)
    return () => clearInterval(takt)
  }, [fertig, erledigt])

  // Die Tour blättert von allein weiter …
  const [tourIndex, setTourIndex] = useState(0)
  useEffect(() => {
    if (!fertig) return
    const takt = setInterval(() => setTourIndex((t) => (t + 1) % TOUR.length), 4000)
    return () => clearInterval(takt)
  }, [fertig])

  // … und der Ladebildschirm bleibt MINDESTENS acht Sekunden stehen,
  // auch wenn alles schneller da ist. Er ist ja nicht nur Wartezeit,
  // sondern die Führung durch die App – zwei Karten soll jeder sehen.
  const [mindestzeitUm, setMindestzeitUm] = useState(false)
  const startRef = useRef(null)
  useEffect(() => {
    if (!fertig) return
    startRef.current = Date.now()
    const timer = setTimeout(() => setMindestzeitUm(true), 8000)
    return () => clearTimeout(timer)
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

  const allesDa = erledigt >= 3 && mindestzeitUm

  // ---------- Ladebildschirm: Balken + Funktions-Tour ----------
  if (!allesDa) {
    const karte = TOUR[tourIndex]
    return (
      <div className="ob">
        <div className="ob-karte ob-laden">
          <span className="ob-schwebt"><Maskottchen /></span>
          <h1>Deine Inhalte werden generiert.</h1>
          <p className="ob-text">
            Passend zu <b>{paketInfo.label}</b> – einen Moment.
          </p>

          <div className="ob-ladebalken">
            <div className="ob-ladebalken-voll" style={{ width: balken + '%' }} />
          </div>

          {/* Die Tour: der key lässt die Karte bei jedem Wechsel neu
              einblenden. */}
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
        </div>
      </div>
    )
  }

  // ---------- Abschluss: das Startpaket ----------
  const zielOption = SCHRITTE[2].optionen.find((o) => o.wert === antworten.ziel)
  const paket = {
    woerter: woerter.daten,
    begruendung: woerter.begruendung,
    video: video.daten,
    song: song.daten,
  }
  const anzahl = woerter.daten.length

  return (
    <div className="ob">
      <div className="ob-karte ob-schluss">
        <Maskottchen />
        <h1>
          ¡Listo! <span className="ob-akzent">Dein Startpaket ist da.</span>
        </h1>
        <p className="ob-text">
          Dein Plan: <b>{zielOption?.text ?? '10 Minuten'} am Tag</b>
          {anzahl > 0 && (
            <>
              {' '}· <b>{anzahl} Wörter</b> zum Thema {paketInfo.label} warten im Trainer
            </>
          )}
          .
        </p>

        {/* Warum genau diese Wörter – die KI begründet ihre Auswahl */}
        {paket.begruendung && <p className="ob-begruendung">{paket.begruendung}</p>}

        {anzahl > 0 && (
          <div className="ob-liste">
            {woerter.daten.slice(0, 5).map((w) => (
              <div key={w.wort} className="ob-liste-zeile">
                <span className="ob-liste-es">{w.wort}</span>
                <span className="ob-liste-de">{w.uebersetzung}</span>
              </div>
            ))}
            {anzahl > 5 && (
              <div className="ob-liste-zeile ob-liste-mehr">… und {anzahl - 5} weitere</div>
            )}
          </div>
        )}

        {(paket.video || paket.song) && (
          <div className="ob-medien">
            {paket.video && (
              <div className="ob-medium">
                <img src={paket.video.thumbnail} alt="" />
                <span className="ob-medium-art">🎬 Dein erstes Video</span>
                <span className="ob-medium-titel">{paket.video.title}</span>
              </div>
            )}
            {paket.song && (
              <div className="ob-medium">
                <img src={paket.song.thumbnail} alt="" />
                <span className="ob-medium-art">🎵 Dein erster Song</span>
                <span className="ob-medium-titel">{paket.song.title}</span>
              </div>
            )}
          </div>
        )}

        <button className="ob-los" onClick={() => onFertig(antworten, paket)}>
          ¡Vamos! Los geht’s
        </button>
        <p className="ob-hinweis">
          Am besten startest du mit <b>Lektion 1</b> – dein Startpaket wartet derweil im
          Trainer und in der Mediathek.
        </p>
      </div>
    </div>
  )
}
