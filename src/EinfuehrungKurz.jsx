// Kurz-Einführung im Stil „A · Fokus“ (23.11.2026, Manuel hat aus drei
// Entwürfen A gewählt): je Schritt EIN bewegtes Bild, EINE Überschrift,
// EIN Satz – der Nutzer soll nicht erschlagen werden, nur Funktion und
// Mehrwert erkennen.
//   1. Lektion   – Wortkarte dreht sich, „in deinen Trainer“
//   2. Trainer   – Vokabel/Satz/Text fächern auf
//   3. Sprechen  – zwei Sprechblasen + pulsierendes Mikro
//   4. Mediathek – Video, Wort im Untertitel wird übersetzt
//   5. Freunde   – XP-Duell
// Danach „Lektion 1 starten“ oder „Erst mal umschauen“.
//
// Stimme je Schritt: public/einfuehrung/<app>-<schritt>.<de|en>.mp3
// (ElevenLabs eleven_v4: DE Julia, EN Jessica). Ton-Schalter oben.
// Ansehen: ?einfuehrung=kurz – Sprache erzwingen mit &sprache=de|en.

import { useEffect, useRef, useState } from 'react'
import { lektionTon } from './erfolgston.js'
import { sprache } from './sprache.js'

const TX = {
  de: { weiter: "Weiter", ueberspringen: "Überspringen", lektion: "Lektion 1 starten", erkunden: "Erst mal umschauen", tonAn: "Stimme an", tonAus: "Stimme aus",
    inTrainer: "in deinen Trainer", vokabel: "VOKABEL", satz: "SATZ", text: "TEXT", du: "Du", duell: "Duell der Woche · Spiele bringen XP" },
  en: { weiter: "Next", ueberspringen: "Skip", lektion: "Start lesson 1", erkunden: "Look around first", tonAn: "Voice on", tonAus: "Voice off",
    inTrainer: "into your trainer", vokabel: "WORD", satz: "SENTENCE", text: "TEXT", du: "You", duell: "Duel of the week · games earn XP" },
}

const APP_KEY = "habloo"
const DATEN = {
  wort: "hola", laut: null, bed: { de: "Hallo", en: "Hello" },
  karten: ["gracias", "¿Dónde está la playa?", "Mi día en Madrid"],
  chat: ["¡Hola! ¿Qué tal tu día?", "¡Muy bien, gracias!"],
  satz: ["Me", "gusta", "la música"], satzBed: { de: "die Musik", en: "music" },
  freund: { de: "Lena", en: "Emma" }, los: "¡Vamos!",
}
const TEXTE = {
  lektion: { de: { titel: "Lernen in kleinen Lektionen", satz: "Alles, was du lernst, landet automatisch im Trainer." }, en: { titel: "Learn in bite-sized lessons", satz: "Everything you learn goes straight into your trainer." } },
  trainer: { de: { titel: "Wiederholen, was dich interessiert", satz: "Vokabeln, Sätze und Texte – die KI baut sie dir zu deinen Themen." }, en: { titel: "Review what you care about", satz: "Words, sentences and texts – the AI builds them around your interests." } },
  sprechen: { de: { titel: "Sprich mit Habla", satz: "Echte Gespräche mit der KI – ohne Hemmungen, jederzeit." }, en: { titel: "Talk with Habla", satz: "Real conversations with the AI – no pressure, any time." } },
  mediathek: { de: { titel: "Videos, Songs & E-Books", satz: "Ein Wort antippen – schon ist es übersetzt." }, en: { titel: "Videos, songs & e-books", satz: "Tap a word – and it’s translated instantly." } },
  freunde: { de: { titel: "Gemeinsam schneller", satz: "Lade Freunde ein, spielt und sammelt um die Wette XP." }, en: { titel: "Faster together", satz: "Invite friends, play games and race each other for XP." } },
  los: { de: { titel: "Bereit?", satz: "Deine erste Lektion dauert nur 3 Minuten." }, en: { titel: "Ready?", satz: "Your first lesson takes just 3 minutes." } },
}


const SCHRITTE = ['lektion', 'trainer', 'sprechen', 'mediathek', 'freunde', 'los']

function Pfeil() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
}
function Lautsprecher({ an }) {
  return an ? (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" /><path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
  )
}

/* Die fünf Bilder – reine CSS-Bewegung, je ein Gedanke */
function Bild({ id, sp }) {
  const D = DATEN
  if (id === 'lektion') return (
    <div className="efa-bild efa-spalte">
      <div className="efa-flip"><div className="efa-dreh">
        <div className="efa-vorne"><b>{D.wort}</b>{D.laut && <em>{D.laut[sp]}</em>}</div>
        <div className="efa-hinten"><b>{D.bed[sp]}</b></div>
      </div></div>
      <span className="efa-pille"><Pfeil /> {TX[sp].inTrainer}</span>
    </div>
  )
  if (id === 'trainer') return (
    <div className="efa-bild efa-faecher">
      <div className="efa-karte efa-f1"><small>{TX[sp].vokabel}</small><b>{D.karten[0]}</b></div>
      <div className="efa-karte efa-f3"><small>{TX[sp].text}</small><b className="klein">{D.karten[2]}</b></div>
      <div className="efa-karte efa-f2 efa-voll"><small>{TX[sp].satz}</small><b className="klein">{D.karten[1]}</b></div>
    </div>
  )
  if (id === 'sprechen') return (
    <div className="efa-bild efa-spalte efa-chat">
      <p className="efa-blase efa-b1">{D.chat[0]}</p>
      <p className="efa-blase efa-b2 du">{D.chat[1]}</p>
      <span className="efa-mikro"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg></span>
    </div>
  )
  if (id === 'mediathek') return (
    <div className="efa-bild efa-spalte efa-media">
      <div className="efa-video"><span><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg></span><i /></div>
      <div className="efa-untertitel">
        {D.satz.map((w, i) => <span key={i} className={i === D.satz.length - 1 ? 'efa-wort' : ''}>{w}</span>)}
        <span className="efa-tipp">{D.satzBed[sp]}</span>
      </div>
    </div>
  )
  if (id === 'freunde') return (
    <div className="efa-bild efa-spalte efa-duell">
      <div className="efa-zeile"><span className="efa-ava">{TX[sp].du}</span><div className="efa-bahn"><i className="efa-x1" /></div></div>
      <div className="efa-zeile"><span className="efa-ava dunkel">{D.freund[sp][0]}</span><div className="efa-bahn"><i className="efa-x2 dunkel" /></div></div>
      <small>{TX[sp].duell}</small>
    </div>
  )
  return <div className="efa-bild efa-ende"><span>{D.los}</span></div>
}

/** @param {(ziel: 'lektion'|'erkunden') => void} props.onFertig */
export default function EinfuehrungKurz({ onFertig }) {
  const [sp] = useState(() => {
    try { const s = new URLSearchParams(window.location.search).get('sprache'); if (s === 'de' || s === 'en') return s } catch { /* egal */ }
    return sprache() === 'en' ? 'en' : 'de'
  })
  const tx = TX[sp]
  const [nr, setNr] = useState(0)
  const id = SCHRITTE[nr]
  const ende = nr === SCHRITTE.length - 1
  const [ton, setTon] = useState(() => { try { return localStorage.getItem('ef-ton') !== 'aus' } catch { return true } })
  const audio = useRef(null)

  useEffect(() => {
    document.body.classList.add('lektion-laeuft')
    return () => { document.body.classList.remove('lektion-laeuft'); audio.current?.pause() }
  }, [])

  const spiele = () => {
    audio.current?.pause()
    const a = new Audio(`/einfuehrung/${APP_KEY}-${id}.${sp}.mp3`)
    audio.current = a
    a.play().catch(() => {})
  }
  useEffect(() => {
    window.scrollTo(0, 0)
    if (ton) spiele(); else audio.current?.pause()
    if (ende) lektionTon()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nr])

  function tonUmschalten() {
    const neu = !ton
    setTon(neu)
    try { localStorage.setItem('ef-ton', neu ? 'an' : 'aus') } catch { /* egal */ }
    if (neu) spiele(); else audio.current?.pause()
  }

  const text = TEXTE[id][sp]
  return (
    <div className="efa">
      <div className="efa-kopf">
        <div className="efa-striche" aria-hidden="true">
          {SCHRITTE.slice(0, 5).map((s, i) => <span key={s} className={i <= Math.min(nr, 4) ? 'an' : ''} />)}
        </div>
        <button className={'efa-ton' + (ton ? ' an' : '')} onClick={tonUmschalten} aria-label={ton ? tx.tonAus : tx.tonAn}><Lautsprecher an={ton} /></button>
        {!ende && <button className="efa-leise" onClick={() => setNr(SCHRITTE.length - 1)}>{tx.ueberspringen}</button>}
      </div>

      <div className="efa-mitte" key={id}>
        <Bild id={id} sp={sp} />
        <div className="efa-text">
          <h1>{text.titel}</h1>
          <p>{text.satz}</p>
        </div>
      </div>

      {!ende ? (
        <button className="efa-knopf" onClick={() => setNr(nr + 1)}>{tx.weiter}</button>
      ) : (
        <div className="efa-zwei">
          <button className="efa-knopf" onClick={() => onFertig('lektion')}>{tx.lektion}</button>
          <button className="efa-leise efa-gross" onClick={() => onFertig('erkunden')}>{tx.erkunden}</button>
        </div>
      )}
    </div>
  )
}
