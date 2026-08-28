// Ein kurzer, freundlicher Erfolgston – wie bei Babbel, wenn man
// etwas richtig hat.
//
// Warum erzeugt statt Audiodatei: Ein kleines „Pling" als Datei wäre
// ein weiterer Download, der beim ersten Mal verzögert kommt. Der
// Web-Audio-Klang ist sofort da, klingt auf jedem Gerät gleich und
// kostet nichts. Zwei aufsteigende Töne (eine Quinte) – kurz genug,
// um nicht zu nerven, klar genug, um sich gut anzufühlen.
//
// Ein einziger AudioContext für die ganze App. Browser erlauben Klang
// erst nach der ersten Nutzer-Geste; bis dahin bleibt der Context
// „suspended" und der erste Aufruf weckt ihn.

// KOMPLETT AUS (24.08., Manuels Wunsch: "mach den erfolgssound raus
// komplett erstmal"). Der ganze Klang bleibt fertig im Code – diese
// eine Zeile holt ihn zurueck.
const ERFOLGSTOENE_AKTIV = false

// Abstellbar: Der Schalter liegt in den Einstellungen unter "Ton".
// Standard ist AN – wer ihn nicht mag, macht ihn einmal aus.
const SCHALTER = 'erfolgstoene'

export function erfolgstoeneAn() {
  return ERFOLGSTOENE_AKTIV && localStorage.getItem(SCHALTER) !== 'aus'
}

/** Fuer die Einstellungen: den Schalter nur zeigen, wenn das Feature an ist. */
export function erfolgstoeneVerfuegbar() {
  return ERFOLGSTOENE_AKTIV
}

export function setzeErfolgstoene(an) {
  localStorage.setItem(SCHALTER, an ? 'an' : 'aus')
}

let ctx = null

function context() {
  if (ctx) return ctx
  const AudioC = window.AudioContext || window.webkitAudioContext
  if (!AudioC) return null
  ctx = new AudioC()
  return ctx
}

/**
 * Spielt den Erfolgston. Tut nichts, wenn der Browser kein Web-Audio
 * kann oder der Klang (noch) nicht erlaubt ist – ein fehlender Ton
 * darf nie eine Aktion blockieren.
 */
export function erfolgston() {
  try {
    if (!erfolgstoeneAn()) return
    const c = context()
    if (!c) return
    if (c.state === 'suspended') c.resume()

    const jetzt = c.currentTime
    // Zwei weiche Töne, A5 hoch zur Terz C#6 – kürzer und leiser als
    // die erste Fassung (die war Manuel zu aufdringlich).
    const toene = [
      { hz: 880, start: 0, dauer: 0.09 },
      { hz: 1109, start: 0.07, dauer: 0.14 },
    ]

    for (const t of toene) {
      const osc = c.createOscillator()
      const lautstaerke = c.createGain()
      osc.type = 'sine' // die weichste Wellenform – ein Tupfer, kein Piepser
      osc.frequency.value = t.hz

      // Schnell an, sanft aus – ein „Pling", kein Piepser.
      const a = jetzt + t.start
      lautstaerke.gain.setValueAtTime(0, a)
      lautstaerke.gain.linearRampToValueAtTime(0.11, a + 0.02)
      lautstaerke.gain.exponentialRampToValueAtTime(0.0001, a + t.dauer)

      osc.connect(lautstaerke).connect(c.destination)
      osc.start(a)
      osc.stop(a + t.dauer + 0.02)
    }
  } catch {
    // Kein Ton ist kein Fehler.
  }
}
