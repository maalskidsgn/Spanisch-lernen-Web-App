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
    const c = context()
    if (!c) return
    if (c.state === 'suspended') c.resume()

    const jetzt = c.currentTime
    // Zwei Töne: G5 und darüber D6 – eine Quinte, klingt „gelöst".
    const toene = [
      { hz: 784, start: 0, dauer: 0.12 },
      { hz: 1175, start: 0.09, dauer: 0.16 },
    ]

    for (const t of toene) {
      const osc = c.createOscillator()
      const lautstaerke = c.createGain()
      osc.type = 'triangle' // weicher als eine reine Sinuswelle wirkt hier voller
      osc.frequency.value = t.hz

      // Schnell an, sanft aus – ein „Pling", kein Piepser.
      const a = jetzt + t.start
      lautstaerke.gain.setValueAtTime(0, a)
      lautstaerke.gain.linearRampToValueAtTime(0.18, a + 0.015)
      lautstaerke.gain.exponentialRampToValueAtTime(0.0001, a + t.dauer)

      osc.connect(lautstaerke).connect(c.destination)
      osc.start(a)
      osc.stop(a + t.dauer + 0.02)
    }
  } catch {
    // Kein Ton ist kein Fehler.
  }
}
