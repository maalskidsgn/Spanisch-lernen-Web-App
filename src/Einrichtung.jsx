import { useEffect, useRef, useState } from 'react'
import { sprache } from './sprache.js'
import { erfolgston } from './erfolgston.js'

/**
 * Einrichtung (12.11.2026, Manuel): Wer sich NEU anmeldet, soll sehen,
 * dass etwas passiert – Wörter fliegen in den Trainer, Sätze und
 * Lektionen werden vorbereitet, der Lernplan entsteht. Läuft einmal je
 * Konto (Schalter in App.jsx), zum Ansehen jederzeit mit ?einrichtung.
 *
 * Die Zahlen sind echt: das Startgeschenk (Wörter + Sätze) und alle
 * Lektionen der App. Die Animation dauert ~6 s, egal wie schnell der
 * Abgleich im Hintergrund ist.
 */

const SCHRITTE = [
  { id: 'woerter', von: 0, bis: 2400 },
  { id: 'saetze', von: 2400, bis: 3500 },
  { id: 'lektionen', von: 3500, bis: 5000 },
  { id: 'plan', von: 5000, bis: 5800 },
]
const ENDE = 6000

const ICONS = {
  woerter: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="13" height="15" rx="3" fill="currentColor" opacity=".35" />
      <rect x="7" y="3" width="13" height="15" rx="3" fill="currentColor" />
      <path d="M10.5 9h6M10.5 12.5h4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  saetze: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" fill="currentColor" />
      <path d="M7 9.5h10M7 13h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  lektionen: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6.5C6 5 9 5 12 6.8 15 5 18 5 21 6.5V19c-3-1.4-6-1.4-9 .5-3-1.9-6-1.9-9-.5z" fill="currentColor" />
      <path d="M12 7v12" stroke="#fff" strokeWidth="2" />
    </svg>
  ),
  plan: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <circle cx="12" cy="12" r="5.5" fill="#fff" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  ),
}

const HAKEN = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 12.5l4 4 8-9" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function texte(en, app, z) {
  return {
    titel: en ? `Setting up your ${app}` : `Wir richten dein ${app} ein`,
    fertigTitel: en ? 'All set!' : 'Alles bereit!',
    unter: en ? 'Just a moment – we are packing everything you need for day one.' : 'Einen Moment – wir packen alles ein, was du am ersten Tag brauchst.',
    fertigUnter: en
      ? `${z.woerter} words, ${z.saetze} sentences and ${z.lektionen} lessons are waiting for you.`
      : `${z.woerter} Wörter, ${z.saetze} Sätze und ${z.lektionen} Lektionen warten auf dich.`,
    woerter: en ? 'Words into your trainer' : 'Vokabeln in deinen Trainer',
    saetze: en ? 'Preparing sentences' : 'Sätze vorbereiten',
    lektionen: en ? 'Building your lessons' : 'Lektionen aufbauen',
    plan: en ? 'Creating your learning plan' : 'Deinen Lernplan erstellen',
    los: en ? "Let's go" : 'Los geht’s',
    trainer: en ? 'Open my trainer' : 'Zum Vokabeltrainer',
  }
}

export default function Einrichtung({ app = 'Habloo', woerter = [], saetze = 10, lektionen = 0, onFertig, onTrainer }) {
  const en = sprache() === 'en'
  const ziel = { woerter: woerter.length, saetze, lektionen }
  const tx = texte(en, app, ziel)
  const [zeit, setZeit] = useState(0)
  const [chips, setChips] = useState([])
  const [geht, setGeht] = useState(false)
  const getoent = useRef(false)

  // Uhr der Animation (bei „weniger Bewegung“ dreifach so schnell)
  useEffect(() => {
    const tempo = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 3 : 1
    const start = performance.now()
    let rahmen
    const tick = (jetzt) => {
      const t = Math.min(ENDE, (jetzt - start) * tempo)
      setZeit(t)
      if (t < ENDE) rahmen = requestAnimationFrame(tick)
    }
    rahmen = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rahmen)
  }, [])

  // Wörter fliegen in die Box, solange Wörter und Sätze laufen
  useEffect(() => {
    if (!woerter.length) return
    let n = 0
    const iv = setInterval(() => {
      const w = woerter[n % woerter.length]
      const id = n++
      setChips((alt) => [...alt.slice(-7), { id, wort: w.wort, x: 12 + ((id * 37) % 76), dreh: ((id * 53) % 24) - 12 }])
      if (n > 22) clearInterval(iv)
    }, 150)
    return () => clearInterval(iv)
  }, [woerter])

  const fertig = zeit >= ENDE
  useEffect(() => {
    if (fertig && !getoent.current) {
      getoent.current = true
      try { erfolgston() } catch { /* ohne Ton */ }
    }
  }, [fertig])

  function zu(weiter) {
    if (geht) return
    setGeht(true)
    setTimeout(() => weiter?.(), 280)
  }

  const prozent = Math.round((Math.min(zeit, SCHRITTE[3].bis) / SCHRITTE[3].bis) * 100)

  return (
    <div className={'ein-schicht' + (geht ? ' ein-geht' : '') + (fertig ? ' ein-fertig' : '')} role="dialog" aria-modal="true" aria-label={tx.titel}>
      <div className="ein-karte">
        <div className="ein-buehne" aria-hidden="true">
          {chips.map((c) => (
            <span key={c.id} className="ein-chip" style={{ left: c.x + '%', '--dreh': c.dreh + 'deg', '--dx': Math.round(110 - c.x * 2.2) + 'px' }}>{c.wort}</span>
          ))}
          <div className={'ein-box' + (zeit > 0 && !fertig ? ' ein-box-wackelt' : '')}>
            <span className="ein-box-deckel" />
            <span className="ein-box-koerper">
              <b>{Math.round(ziel.woerter * Math.min(1, zeit / SCHRITTE[0].bis))}</b>
            </span>
          </div>
          {fertig && (
            <span className="ein-funken">
              {Array.from({ length: 10 }, (_, i) => <i key={i} style={{ '--w': i * 36 + 'deg' }} />)}
            </span>
          )}
        </div>

        <h2 className="ein-titel">{fertig ? tx.fertigTitel : tx.titel}</h2>
        <p className="ein-unter">{fertig ? tx.fertigUnter : tx.unter}</p>

        <div className="ein-balken" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={prozent}>
          <i style={{ width: prozent + '%' }} />
          <span>{prozent} %</span>
        </div>

        <ul className="ein-liste">
          {SCHRITTE.map((s) => {
            const anteil = Math.max(0, Math.min(1, (zeit - s.von) / (s.bis - s.von)))
            const zustand = anteil >= 1 ? 'ok' : anteil > 0 ? 'laeuft' : 'wartet'
            const gesamt = ziel[s.id]
            return (
              <li key={s.id} className={'ein-schritt ein-' + zustand}>
                <span className="ein-icon">{ICONS[s.id]}</span>
                <span className="ein-text">
                  <b>{tx[s.id]}</b>
                  {gesamt ? <small>{Math.round(gesamt * anteil)} / {gesamt}</small> : null}
                </span>
                <span className="ein-status">{zustand === 'ok' ? HAKEN : zustand === 'laeuft' ? <i className="ein-dreher" /> : null}</span>
              </li>
            )
          })}
        </ul>

        <div className="ein-knoepfe">
          <button type="button" className="ein-los" disabled={!fertig} onClick={() => zu(onFertig)}>{tx.los}</button>
          {fertig && onTrainer && (
            <button type="button" className="ein-trainer" onClick={() => zu(onTrainer)}>{tx.trainer}</button>
          )}
        </div>
      </div>
    </div>
  )
}
