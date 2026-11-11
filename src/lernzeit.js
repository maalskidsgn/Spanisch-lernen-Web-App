// Lernzeit in Minuten (seit 11.11.2026).
//
// Gezählt wird, solange die App sichtbar ist UND jemand etwas tut:
// tippen, wischen, scrollen, tippen auf der Tastatur. Wer das Handy
// mit offener App weglegt, sammelt nach 90 Sekunden nichts mehr.
// Videos und Gespräche mit der KI-Trainerin melden sich selbst über
// lebenszeichen(), weil man dabei oft nichts antippt.
//
// Jede volle Minute landet als 'minuten' in der Lernkurve – damit
// reist sie über verlauf.js mit dem Konto auf alle Geräte und steht
// im Jahresrückblick.

import { merkeGelernt } from './lernkurve.js'

const LEERLAUF = 90 * 1000 // so lange gilt man nach dem letzten Tippen als aktiv
const TAKT = 5 // Sekunden

let zuletzt = Date.now()
let sekunden = 0
let laeuft = false

/** „Hier lernt gerade jemand“ – auch ohne Berührung (Video, Gespräch). */
export function lebenszeichen() {
  zuletzt = Date.now()
}

/** Einmal beim Start der App aufrufen. */
export function starteLernzeit() {
  if (laeuft) return
  laeuft = true
  for (const art of ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll']) {
    window.addEventListener(art, lebenszeichen, { passive: true, capture: true })
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) lebenszeichen()
  })
  setInterval(() => {
    if (document.hidden || Date.now() - zuletzt > LEERLAUF) return
    sekunden += TAKT
    if (sekunden >= 60) {
      sekunden -= 60
      merkeGelernt('minuten')
    }
  }, TAKT * 1000)
}
