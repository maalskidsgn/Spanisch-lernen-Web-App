// Umschalter „Üben | Spielen“ auf der Seite „Wie willst du üben?“
// (12.11.2026) – für Vokabeln und Sätze gleich. Die App merkt sich
// den zuletzt gewählten Tab. In Habloo und Davaigo gleich.
import { useState } from 'react'
import { useTexte } from './sprache.js'

const SCHLUESSEL = 'uebung-tab'

const BUCH = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" /><path d="M8 7h6" />
  </svg>
)
const PAD = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="7" width="20" height="11" rx="5" /><path d="M7 11v3M5.5 12.5h3" /><circle cx="16" cy="12" r="1" /><circle cx="18" cy="14" r="1" />
  </svg>
)

export function useUebTab() {
  const [tab, setTab] = useState(() => {
    try { return localStorage.getItem(SCHLUESSEL) === 'spielen' ? 'spielen' : 'ueben' } catch { return 'ueben' }
  })
  function waehle(t) {
    setTab(t)
    try { localStorage.setItem(SCHLUESSEL, t) } catch { /* egal */ }
  }
  return [tab, waehle]
}

export default function UebTabs({ tab, onTab, ueben, spielen }) {
  const t = useTexte()
  return (
    <div className="ueb-tabs" role="tablist">
      <button type="button" role="tab" aria-selected={tab === 'ueben'} className={tab === 'ueben' ? 'an' : ''} onClick={() => onTab('ueben')}>
        {BUCH}{t('ub.ueben')} <small>{ueben}</small>
      </button>
      <button type="button" role="tab" aria-selected={tab === 'spielen'} className={tab === 'spielen' ? 'an' : ''} onClick={() => onTab('spielen')}>
        {PAD}{t('ub.spielen')} <small>{spielen}</small>
      </button>
    </div>
  )
}
