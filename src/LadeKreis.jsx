// Kleiner Fortschrittskreis für alles, worauf man wartet (16.11.2026, Manuel:
// „sodass man weiß, wie lange es noch dauert“) – KI-Listen, Sätze, Texte,
// E-Books, Verb-Tabellen, YouTube-Videos, Suche.
//
// Der Server meldet keinen Fortschritt, der Kreis schätzt (17.11.2026
// verlässlicher gemacht – Manuel wartete 12 s auf „gleich fertig“):
//   – Er merkt sich je Art die letzten 8 echten Dauern und rechnet mit
//     der langsamsten der üblichen (≈ 80 %-Wert), nicht mit dem Mittel.
//   – Läuft es trotzdem länger, verlängert er die Schätzung sichtbar
//     („noch ~6 s“) statt ewig „gleich fertig“ zu zeigen.
import { useEffect, useRef, useState } from 'react'
import { sprache } from './sprache.js'

// Ausgangswerte in Sekunden, bis eigene Messungen da sind (eher großzügig)
const STANDARD = {
  liste: 20,
  saetze: 18,
  text: 22,
  buch: 90, // 10 ausführliche Kapitel (17.11.2026)
  ebook: 60,
  konjugation: 12,
  uebungen: 22,
  uebersetzen: 4,
  vokabeln: 16,
  video: 12,
  suche: 8,
}
const SPEICHER = 'lade-dauern-2'

function gemessen() {
  try {
    return JSON.parse(localStorage.getItem(SPEICHER)) || {}
  } catch {
    return {}
  }
}

function schaetzung(art) {
  const standard = STANDARD[art] ?? 12
  const liste = (gemessen()[art] || []).filter((x) => Number.isFinite(x)).sort((a, b) => a - b)
  if (liste.length < 2) return Math.max(standard, liste[0] ?? 0)
  // 80 %-Wert der letzten Dauern, plus ein kleiner Puffer
  const p80 = liste[Math.min(liste.length - 1, Math.floor(liste.length * 0.8))]
  return Math.max(3, p80 * 1.1 + 1)
}

function merke(art, sekunden) {
  if (sekunden < 1 || sekunden > 300) return // sofortige Fehler und Hänger zählen nicht
  const alle = gemessen()
  alle[art] = [...(alle[art] || []), Math.round(sekunden * 10) / 10].slice(-8)
  try {
    localStorage.setItem(SPEICHER, JSON.stringify(alle))
  } catch { /* Speicher voll – dann eben ohne Lernen */ }
}

const RADIUS = 9
const UMFANG = 2 * Math.PI * RADIUS

/**
 * @param {string} art   – Schlüssel aus STANDARD
 * @param {boolean} kurz – nur „~5 s“ statt „noch ~5 s“ (für schmale Knöpfe)
 */
export default function LadeKreis({ art = 'liste', kurz = false }) {
  const grund = useRef(schaetzung(art))
  const [sek, setSek] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const takt = setInterval(() => setSek((performance.now() - start) / 1000), 200)
    return () => {
      clearInterval(takt)
      merke(art, (performance.now() - start) / 1000)
    }
  }, [art])

  // Ist die Schätzung überschritten, wächst sie in Schritten mit – so zählt
  // der Kreis immer etwas Ehrliches herunter, statt stehenzubleiben.
  let s = grund.current
  while (sek > s - 1) s = s + Math.max(4, s * 0.35)
  const anteil = Math.min(0.97, sek / s)
  const rest = Math.max(1, Math.ceil(s - sek))
  const en = sprache() === 'en'
  const text = kurz ? `~${rest} s` : en ? `about ${rest} s left` : `noch ~${rest} s`

  return (
    <span className={'lade-kreis' + (kurz ? ' lade-kurz' : '')} role="status" aria-label={text}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle className="lk-bahn" cx="12" cy="12" r={RADIUS} />
        <circle className="lk-wert" cx="12" cy="12" r={RADIUS} strokeDasharray={UMFANG} strokeDashoffset={UMFANG * (1 - anteil)} />
      </svg>
      <span className="lk-text">{text}</span>
    </span>
  )
}
