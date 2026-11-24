// Premium-Pause zwischen Lektionen (24.11.2026, Manuel): Gratis-Nutzer sehen
// nach jeder dritten abgeschlossenen Lektion vor der nächsten 5 Sekunden lang
// eine Einblendung für Premium – am ersten Lerntag noch gar nicht. Steckt
// fertig in der App, ist aber AUS: Der Server schaltet sie ein, ohne neues
// App-Paket (GET /api/app/pause; Coolify: PAUSE_AN=1, PAUSE_JEDE=3,
// PAUSE_SEKUNDEN=5, PAUSE_ERSTER_TAG=1 hebt die Schonfrist auf).
// Ansehen: Adresse mit ?werbung
import { API_URL } from './api.js'
import { ohneKasse } from './kauf.js'

let cfg = { an: false, jede: 3, sekunden: 5, ersterTagFrei: true }
try {
  const gemerkt = JSON.parse(localStorage.getItem('pp-cfg') || 'null')
  if (gemerkt) cfg = { ...cfg, ...gemerkt }
} catch { /* dann eben die Vorgabe */ }

fetch(API_URL + '/api/app/pause')
  .then((r) => (r.ok ? r.json() : null))
  .then((j) => {
    if (!j) return
    cfg = {
      an: Boolean(j.an),
      jede: Math.max(1, Number(j.jede) || 3),
      sekunden: Math.min(30, Math.max(3, Number(j.sekunden) || 5)),
      ersterTagFrei: j.ersterTagFrei !== false,
    }
    try { localStorage.setItem('pp-cfg', JSON.stringify(cfg)) } catch { /* egal */ }
  })
  .catch(() => {})

const lies = (k) => { try { return localStorage.getItem(k) } catch { return null } }
const schreib = (k, w) => { try { localStorage.setItem(k, w) } catch { /* egal */ } }
const heute = () => new Date().toLocaleDateString('sv-SE')
const zaehler = () => Number(lies('pp-n')) || 0
// Erster Lerntag auf diesem Gerät: der Tag der ersten abgeschlossenen Lektion
const amErstenTag = () => { const start = lies('pp-start'); return !start || start === heute() }
const schonfrist = () => cfg.ersterTagFrei && amErstenTag()

/** Nach jeder abgeschlossenen Lektion aufrufen. Am ersten Tag wird noch nicht gezählt. */
export function lektionGezaehlt() {
  if (!lies('pp-start')) schreib('pp-start', heute())
  if (!schonfrist()) schreib('pp-n', String(zaehler() + 1))
}
/** Ist vor der nächsten Lektion eine Pause dran? Nie für Premium, nie ohne Kaufmöglichkeit. */
export const pauseFaellig = (premium) => cfg.an && !premium && !ohneKasse() && !schonfrist() && zaehler() >= cfg.jede
export const pauseGezeigt = () => schreib('pp-n', '0')
export const pauseSekunden = () => cfg.sekunden
