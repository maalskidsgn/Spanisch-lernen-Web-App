import { useEffect, useRef } from 'react'
import INHALT from './startseite/inhalt.js'
import CSS from './startseite/startseite.css?raw'
import { beleben } from './startseite/leben.js'
import { mitAnbieter } from './auth.js'
import { sprache, setzeSprache } from './sprache.js'

/**
 * Startseite B (09.11.2026): Hero, Videobereich + Toon-Bento, Abschluss.
 * Das Markup kommt fertig aus ~/Projekte/startseite-b/gen.py (eigene Zeichnungen,
 * feste Texte, keine Nutzereingaben). Es lebt in einem Shadow-DOM, damit die
 * App-Styles (gleichnamige Klassen wie .streak) nicht hineinfunken.
 */
export default function StartseiteB({ teil, onStarten, onAnmelden, onRecht }) {
  const host = useRef(null)
  const sp = sprache() === 'en' ? 'en' : 'de'
  useEffect(() => {
    const h = host.current
    if (!h) return
    const root = h.shadowRoot || h.attachShadow({ mode: 'open' })
    root.innerHTML = `<style>:host{display:block}${CSS}</style><div class="sbx">${INHALT[sp][teil]}</div>`
    return beleben(root.querySelector('.sbx'), {
      starten: () => onStarten?.(),
      anmelden: () => onAnmelden?.(),
      google: () => mitAnbieter('google').catch(() => onStarten?.()),
      apple: () => mitAnbieter('apple').catch(() => onStarten?.()),
      recht: (w) => onRecht?.(w),
      sprache: () => setzeSprache(sp === 'en' ? 'de' : 'en'),
    })
  }, [sp, teil])
  return <div ref={host} className="sb-host" />
}
