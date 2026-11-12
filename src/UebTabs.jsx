// Umschalter „Üben | Spielen“ auf der Seite „Wie willst du üben?“
// (12.11.2026) – für Vokabeln und Sätze gleich. Die App merkt sich
// den zuletzt gewählten Tab. In Habloo und Davaigo gleich.
import { useState } from 'react'
import { useTexte } from './sprache.js'

const SCHLUESSEL = 'uebung-tab'

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
        {t('ub.ueben')} <small>{ueben}</small>
      </button>
      <button type="button" role="tab" aria-selected={tab === 'spielen'} className={tab === 'spielen' ? 'an' : ''} onClick={() => onTab('spielen')}>
        {t('ub.spielen')} <small>{spielen}</small>
      </button>
    </div>
  )
}
