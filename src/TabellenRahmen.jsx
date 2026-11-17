// Rahmen für Lerntabellen: Passt die Tabelle nicht in die Breite (Handy, lange
// Wörter), lässt sie sich seitlich wischen – und ein kleiner Hinweis sagt das
// auch. Vorher wurde die letzte Spalte einfach abgeschnitten (17.11.2026, Manuel).
import { useLayoutEffect, useRef, useState } from 'react'
import { sprache } from './sprache.js'

export default function TabellenRahmen({ children }) {
  const rahmen = useRef(null)
  const [breit, setBreit] = useState(false)

  useLayoutEffect(() => {
    const el = rahmen.current
    if (!el) return
    const pruefe = () => setBreit(el.scrollWidth > el.clientWidth + 2)
    pruefe()
    if (typeof ResizeObserver === 'undefined') return
    const beobachter = new ResizeObserver(pruefe)
    beobachter.observe(el)
    if (el.firstElementChild) beobachter.observe(el.firstElementChild)
    return () => beobachter.disconnect()
  }, [])

  return (
    <>
      <div className={'info-tabelle-rahmen' + (breit ? ' ist-breit' : '')} ref={rahmen}>
        {children}
      </div>
      {breit && (
        <small className="tab-wischen">
          <span aria-hidden="true">↔</span> {sprache() === 'en' ? 'Swipe the table sideways' : 'Tabelle seitlich wischen'}
        </small>
      )}
    </>
  )
}
