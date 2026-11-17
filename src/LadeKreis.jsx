// Kleiner Fortschrittskreis für alles, worauf man wartet (16.11.2026, Manuel:
// „sodass man weiß, wie lange es noch dauert“) – KI-Listen, Sätze, Texte,
// E-Books, Verb-Tabellen, YouTube-Videos, Suche.
//
// Der Server meldet keinen Fortschritt. Der Kreis schätzt deshalb: Er merkt
// sich je Art, wie lange es zuletzt wirklich gedauert hat (gleitender
// Mittelwert im Gerätespeicher), füllt sich bis dahin auf 90 % und kriecht
// danach nur noch – er steht nie auf „fertig“, solange noch gewartet wird.
import { useEffect, useRef, useState } from 'react'
import { sprache } from './sprache.js'

// Ausgangswerte in Sekunden, bis eigene Messungen da sind
const STANDARD = {
  liste: 9,
  saetze: 9,
  text: 14,
  buch: 30,
  ebook: 55,
  konjugation: 8,
  uebungen: 18,
  uebersetzen: 3,
  vokabeln: 10,
  video: 10,
  suche: 6,
}
const SPEICHER = 'lade-dauern'

function gemessen() {
  try {
    return JSON.parse(localStorage.getItem(SPEICHER)) || {}
  } catch {
    return {}
  }
}

function schaetzung(art) {
  const standard = STANDARD[art] ?? 8
  const wert = gemessen()[art]
  // Ausreißer (Abbruch, hängendes Netz) dürfen die Schätzung nicht kippen
  return wert ? Math.min(standard * 2.5, Math.max(standard * 0.4, wert)) : standard
}

function merke(art, sekunden) {
  if (sekunden < 1 || sekunden > 300) return // sofortige Fehler und Hänger zählen nicht
  const alle = gemessen()
  alle[art] = alle[art] ? alle[art] * 0.6 + sekunden * 0.4 : sekunden
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
  const soll = useRef(schaetzung(art))
  const [sek, setSek] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const takt = setInterval(() => setSek((performance.now() - start) / 1000), 200)
    return () => {
      clearInterval(takt)
      merke(art, (performance.now() - start) / 1000)
    }
  }, [art])

  const s = soll.current
  const anteil = sek < s ? (0.9 * sek) / s : 0.9 + 0.09 * (1 - Math.exp(-(sek - s) / s))
  const rest = Math.ceil(s - sek)
  const en = sprache() === 'en'
  const text =
    rest > 0
      ? kurz ? `~${rest} s` : en ? `about ${rest} s left` : `noch ~${rest} s`
      : kurz ? '…' : en ? 'almost done' : 'gleich fertig'

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
