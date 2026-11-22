// Kurz-Einführung – ENTWURF (22.11.2026, Manuel): „Die Einführung soll nur
// in kurzen Schritten erklären, warum die App so toll ist, dann soll man
// Lektion 1 starten oder frei erkunden können. Mit Stimme.“
//
// Warum: Auswertung 22.11. – 70 % der Habloo-Konten haben nach der langen
// 9-Schritte-Tour nie eine Lektion abgeschlossen. Jetzt: 5 kurze Karten
// (je ein Satz, gesprochen), danach die Wahl.
//
// Ansehen: Adresse mit ?einfuehrung=kurz (die bisherige Tour bleibt Standard,
// bis Manuel den Entwurf freigibt).
//
// Stimme: ElevenLabs eleven_v4, Julia, je Schritt eine MP3 unter
// public/einfuehrung/<schritt>.<de|en>.mp3. Fehlt eine Datei, bleibt es still.
// Ton aus/an merkt sich das Gerät (localStorage 'ef-ton').

import { useEffect, useRef, useState } from 'react'
import NavBild from './NavBild.jsx'
import Logo from './Logo.jsx'
import { lektionTon } from './erfolgston.js'
import { sprache } from './sprache.js'

const APP_KEY = 'habloo'
// Je Schritt: Bild, Überschrift, gesprochener Satz (= Sprechblase), optional Chips
const SCHRITTE = [
  { id: 'hallo', held: 'start',
    de: { titel: '¡Hola! Willkommen bei Habloo', text: 'Schön, dass du da bist! In einer Minute zeige ich dir, warum du mit Habloo wirklich Spanisch sprechen lernst.' },
    en: { titel: '¡Hola! Welcome to Habloo', text: 'Great to have you here! In one minute I’ll show you why Habloo gets you really speaking Spanish.' } },
  { id: 'lektionen', held: 'lektionen',
    de: { titel: 'Kurze Lektionen, großer Fortschritt', text: 'Fünf Minuten am Tag reichen. Jede Lektion baut auf der letzten auf – von den ersten Wörtern bis zu echten Gesprächen.', punkte: ['5 Minuten am Tag', 'A1 bis B2', 'Schritt für Schritt'] },
    en: { titel: 'Short lessons, big progress', text: 'Five minutes a day is enough. Each lesson builds on the last – from your first words to real conversations.', punkte: ['5 minutes a day', 'A1 to B2', 'Step by step'] } },
  { id: 'sprechen', held: 'sprechen',
    de: { titel: 'Sprich vom ersten Tag an', text: 'Mit dem KI-Sprach-Trainer führst du echte Gespräche auf Spanisch – ohne Hemmungen, wann immer du willst.', punkte: ['Echte Gespräche', 'Ohne Hemmungen', 'Rund um die Uhr'] },
    en: { titel: 'Speak from day one', text: 'With the AI speaking coach you have real conversations in Spanish – no pressure, whenever you like.', punkte: ['Real conversations', 'No pressure', 'Any time'] } },
  { id: 'mediathek', held: 'youtube',
    de: { titel: 'Lerne mit Videos und Songs', text: 'Schau echte Videos und hör Songs. Tipp ein Wort im Untertitel an – schon hast du die Übersetzung.', punkte: ['Echte Videos', 'Songs mit Text', 'Wort antippen = verstehen'] },
    en: { titel: 'Learn with videos and songs', text: 'Watch real videos and listen to songs. Tap a word in the subtitles – and you instantly get the translation.', punkte: ['Real videos', 'Songs with lyrics', 'Tap a word to understand it'] } },
  { id: 'trainer', held: 'trainer',
    de: { titel: 'Nichts mehr vergessen', text: 'Dein Trainer merkt sich, was dir schwerfällt, und fragt es genau im richtigen Moment ab. So bleibt alles hängen.', punkte: ['Vokabeltrainer', 'Spiele', 'Clever wiederholen'] },
    en: { titel: 'Never forget again', text: 'Your trainer remembers what you find hard and asks it again at just the right moment. That’s how it sticks.', punkte: ['Vocabulary trainer', 'Games', 'Smart reviews'] } },
  { id: 'los', held: 'lektionen',
    de: { titel: 'Bereit?', text: 'Jetzt bist du dran! Starte direkt mit Lektion eins – oder schau dich erst in Ruhe um.' },
    en: { titel: 'Ready?', text: 'Now it’s your turn! Jump straight into lesson one – or take a look around first.' } },
]
const TEXT = {
  de: { los: 'Los geht’s', weiter: 'Weiter', zurueck: 'Zurück', ueberspringen: 'Überspringen', lektion: 'Lektion 1 starten', erkunden: 'Frei erkunden', tonAn: 'Stimme an', tonAus: 'Stimme aus' },
  en: { los: 'Let’s go', weiter: 'Next', zurueck: 'Back', ueberspringen: 'Skip', lektion: 'Start lesson 1', erkunden: 'Explore on my own', tonAn: 'Voice on', tonAus: 'Voice off' },
}


/** Kleine Sprechblasen-Bühne im 3D-Toon-Stil für den KI-Sprach-Trainer */
function SprechBild() {
  return (
    <svg viewBox="0 0 120 100" width="104" height="88" aria-hidden="true">
      <defs>
        <linearGradient id="efb1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--primary)" stopOpacity=".85" /><stop offset="1" stopColor="var(--primary)" /></linearGradient>
      </defs>
      <g transform="translate(6 10)">
        <rect x="0" y="6" width="66" height="42" rx="16" fill="var(--primary-press)" />
        <rect x="0" y="0" width="66" height="42" rx="16" fill="url(#efb1)" />
        <path d="M14 40 l-4 14 l16 -12z" fill="url(#efb1)" />
        <circle cx="20" cy="21" r="4.5" fill="#fff" /><circle cx="33" cy="21" r="4.5" fill="#fff" /><circle cx="46" cy="21" r="4.5" fill="#fff" />
      </g>
      <g transform="translate(48 40)">
        <rect x="0" y="6" width="62" height="38" rx="15" fill="#d9d3e6" />
        <rect x="0" y="0" width="62" height="38" rx="15" fill="#fff" stroke="#ece6f3" strokeWidth="2" />
        <path d="M48 36 l6 13 l-16 -11z" fill="#fff" />
        <rect x="12" y="12" width="38" height="5" rx="2.5" fill="var(--primary)" opacity=".35" />
        <rect x="12" y="22" width="26" height="5" rx="2.5" fill="var(--primary)" opacity=".25" />
      </g>
    </svg>
  )
}

function Held({ art }) {
  return (
    <div className="ef-held" aria-hidden="true">
      <span className="ef-held-glanz" />
      <span className="ef-held-podest" />
      <span className="ef-held-bild">{art === 'sprechen' ? <SprechBild /> : <NavBild art={art} />}</span>
      <i className="ef-funke-a">✦</i>
      <i className="ef-funke-b">✦</i>
    </div>
  )
}

function Lautsprecher({ an }) {
  return an ? (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" /><path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
  )
}

/**
 * @param {(ziel: 'lektion'|'erkunden') => void} props.onFertig
 */
export default function EinfuehrungKurz({ onFertig }) {
  const sp = sprache() === 'en' ? 'en' : 'de'
  const tx = TEXT[sp]
  const [nr, setNr] = useState(0)
  const schritt = SCHRITTE[nr]
  const letzter = nr === SCHRITTE.length - 1
  const [ton, setTon] = useState(() => { try { return localStorage.getItem('ef-ton') !== 'aus' } catch { return true } })
  const audio = useRef(null)

  // Wie in einer Lektion: keine Menüleiste
  useEffect(() => {
    document.body.classList.add('lektion-laeuft')
    return () => { document.body.classList.remove('lektion-laeuft'); audio.current?.pause() }
  }, [])

  // Je Schritt den Satz sprechen (Browser lassen Ton evtl. erst nach dem ersten Tipp zu)
  useEffect(() => {
    window.scrollTo(0, 0)
    audio.current?.pause()
    if (!ton) return
    const a = new Audio(`/einfuehrung/${APP_KEY}-${schritt.id}.${sp}.mp3`)
    audio.current = a
    a.play().catch(() => {})
    if (letzter) lektionTon()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nr])

  function tonUmschalten() {
    const neu = !ton
    setTon(neu)
    try { localStorage.setItem('ef-ton', neu ? 'an' : 'aus') } catch { /* egal */ }
    if (!neu) audio.current?.pause()
    else {
      const a = new Audio(`/einfuehrung/${APP_KEY}-${schritt.id}.${sp}.mp3`)
      audio.current = a
      a.play().catch(() => {})
    }
  }

  const weiter = () => setNr((n) => Math.min(n + 1, SCHRITTE.length - 1))
  const zurueck = () => setNr((n) => Math.max(n - 1, 0))

  return (
    <div className="ef efk">
      <div className="efk-kopf">
        <button className="btn-plain" onClick={() => onFertig('erkunden')} aria-label={tx.ueberspringen}>✕</button>
        <div className="efk-punkte" aria-hidden="true">
          {SCHRITTE.map((s, i) => <span key={s.id} className={i === nr ? 'an' : i < nr ? 'war' : ''} />)}
        </div>
        <button className={'efk-ton' + (ton ? ' an' : '')} onClick={tonUmschalten} aria-label={ton ? tx.tonAus : tx.tonAn}><Lautsprecher an={ton} /></button>
      </div>

      <div className="ef-kopf" key={'k' + nr}>
        <Held art={schritt.held} />
        <h1 className="efk-titel">{schritt[sp].titel}</h1>
        <div className="ef-coach">
          <span className="ef-coach-bild" aria-hidden="true"><Logo /></span>
          <p className="ef-coach-blase">
            {schritt[sp].text.split(' ').map((w, i) => <span key={i} style={{ animationDelay: 120 + i * 28 + 'ms' }}>{w} </span>)}
          </p>
        </div>
        {schritt[sp].punkte && (
          <ul className="efk-chips">
            {schritt[sp].punkte.map((p) => <li key={p}>{p}</li>)}
          </ul>
        )}
      </div>

      <div className="efk-unten">
        {!letzter ? (
          <>
            <button className="ef-knopf" onClick={weiter}>{nr === 0 ? tx.los : tx.weiter}</button>
            {nr > 0 ? <button className="ef-leise" onClick={zurueck}>{tx.zurueck}</button> : <button className="ef-leise" onClick={() => onFertig('erkunden')}>{tx.ueberspringen}</button>}
          </>
        ) : (
          <>
            <button className="ef-knopf efk-gross" onClick={() => onFertig('lektion')}>{tx.lektion}</button>
            <button className="ef-knopf ef-knopf-hell" onClick={() => onFertig('erkunden')}>{tx.erkunden}</button>
          </>
        )}
      </div>
    </div>
  )
}
