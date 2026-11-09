import { useEffect, useRef } from 'react'
import INHALT from './startseite/inhalt.js'
import { beleben } from './startseite/leben.js'
import { mitAnbieter } from './auth.js'
import { sprache } from './sprache.js'
import './startseite/startseite.css'

/**
 * Startseite B (09.11.2026): Videobereich + Toon-Bento + Abschluss.
 * Das Markup kommt fertig aus ~/Projekte/startseite-b/gen.py (eigene Zeichnungen,
 * feste Texte, keine Nutzereingaben) – Klicks und Bewegung macht leben.js.
 */
export default function StartseiteB({ teil, onStarten, onAnmelden }) {
  const ref = useRef(null)
  const sp = sprache() === 'en' ? 'en' : 'de'
  useEffect(() => beleben(ref.current, {
    starten: () => onStarten?.(),
    anmelden: () => onAnmelden?.(),
    google: () => mitAnbieter('google').catch(() => onStarten?.()),
    apple: () => mitAnbieter('apple').catch(() => onStarten?.()),
  }), [sp, teil])
  return <div className="sbx" ref={ref} dangerouslySetInnerHTML={{ __html: INHALT[sp][teil] }} />
}
