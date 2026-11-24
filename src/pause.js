// Premium-Pause zwischen Lektionen (24.11.2026, Manuel): Gratis-Nutzer sehen
// nach jeder zweiten abgeschlossenen Lektion vor der nächsten eine kurze
// Einblendung für Premium. Steckt fertig in der App, ist aber AUS – der
// Server schaltet sie ein (GET /api/app/pause, Coolify: PAUSE_AN=1,
// PAUSE_JEDE=2, PAUSE_SEKUNDEN=10), ohne neues App-Paket.
// Ansehen: Adresse mit ?werbung
import { API_URL } from './api.js'
import { ohneKasse } from './kauf.js'

let cfg = { an: false, jede: 2, sekunden: 10 }
try {
  const gemerkt = JSON.parse(localStorage.getItem('pp-cfg') || 'null')
  if (gemerkt) cfg = { ...cfg, ...gemerkt }
} catch { /* dann eben die Vorgabe */ }

fetch(API_URL + '/api/app/pause')
  .then((r) => (r.ok ? r.json() : null))
  .then((j) => {
    if (!j) return
    cfg = { an: Boolean(j.an), jede: Math.max(1, Number(j.jede) || 2), sekunden: Math.min(30, Math.max(3, Number(j.sekunden) || 10)) }
    try { localStorage.setItem('pp-cfg', JSON.stringify(cfg)) } catch { /* egal */ }
  })
  .catch(() => {})

const zaehler = () => { try { return Number(localStorage.getItem('pp-n')) || 0 } catch { return 0 } }
const setze = (n) => { try { localStorage.setItem('pp-n', String(n)) } catch { /* egal */ } }

/** Nach jeder abgeschlossenen Lektion aufrufen. */
export const lektionGezaehlt = () => setze(zaehler() + 1)
/** Ist vor der nächsten Lektion eine Pause dran? Nie für Premium, nie ohne Kaufmöglichkeit. */
export const pauseFaellig = (premium) => cfg.an && !premium && !ohneKasse() && zaehler() >= cfg.jede
export const pauseGezeigt = () => setze(0)
export const pauseSekunden = () => cfg.sekunden
