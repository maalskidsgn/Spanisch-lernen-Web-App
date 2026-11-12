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

// 24.08. abgeschaltet, seit 12.11.2026 wieder AN mit den neuen Klängen
// (Klick „Thock“, Erfolg „Harfen-Lauf“, Fehler „Gedämpftes Duo“) –
// genau wie in Davaigo.
const ERFOLGSTOENE_AKTIV = true

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
let hall = null

function context() {
  if (ctx) return ctx
  const AudioC = window.AudioContext || window.webkitAudioContext
  if (!AudioC) return null
  ctx = new AudioC()
  // Kleiner heller Raum (0,7 s) – lässt die Harfe ausklingen, ohne zu hallen
  try {
    const n = Math.floor(ctx.sampleRate * 0.7)
    const ir = ctx.createBuffer(2, n, ctx.sampleRate)
    for (let k = 0; k < 2; k++) {
      const d = ir.getChannelData(k)
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 5)
    }
    hall = ctx.createConvolver()
    hall.buffer = ir
  } catch {
    hall = null
  }
  return ctx
}

// Marimba-Klangfarbe: Teiltöne [Faktor, Lautstärke, Anteil am Ausklang]
const MARIMBA = [[1, 1, 1], [3.93, 0.22, 0.18], [9.8, 0.04, 0.06]]
// Dreiklang nach oben: C5 – E5 – G5 [Hz, Einsatz in s, Länge in s]
const DREIKLANG = [[523.25, 0, 0.3], [659.25, 0.065, 0.3], [783.99, 0.13, 0.55]]

/**
 * Spielt den Erfolgston „Marimba-Dreiklang“ (gewählt 12.11.2026, ersetzt
 * den Harfen-Lauf): C–E–G auf der Marimba, rund und fröhlich.
 * Tut nichts, wenn der Browser kein Web-Audio kann oder der Klang
 * (noch) nicht erlaubt ist – ein fehlender Ton darf nie eine Aktion
 * blockieren.
 */
export function erfolgston() {
  try {
    if (!erfolgstoeneAn()) return
    const c = context()
    if (!c) return
    if (c.state === 'suspended') c.resume()

    const t0 = c.currentTime + 0.003
    const bus = c.createGain()
    const samt = c.createBiquadFilter()
    samt.type = 'lowpass'
    samt.frequency.value = 6000
    const begrenzer = c.createDynamicsCompressor()
    begrenzer.threshold.value = -16
    begrenzer.ratio.value = 4
    begrenzer.attack.value = 0.003
    begrenzer.release.value = 0.15
    bus.connect(samt).connect(begrenzer).connect(c.destination)
    if (hall) {
      const hallLaut = c.createGain()
      hallLaut.gain.value = 0.22
      samt.connect(hall).connect(hallLaut).connect(c.destination)
    }

    DREIKLANG.forEach(([hz, ab, lang]) => {
      const a = t0 + ab
      for (const [faktor, anteil, ausklang] of MARIMBA) {
        const osc = c.createOscillator()
        const g = c.createGain()
        osc.type = 'sine'
        osc.frequency.value = hz * faktor
        const dauer = Math.max(0.03, lang * ausklang)
        g.gain.setValueAtTime(0.0001, a)
        g.gain.exponentialRampToValueAtTime(0.32 * anteil, a + 0.004)
        g.gain.exponentialRampToValueAtTime(0.0001, a + dauer)
        osc.connect(g).connect(bus)
        osc.start(a)
        osc.stop(a + dauer + 0.05)
      }
    })
  } catch {
    // Kein Ton ist kein Fehler.
  }
}

// ---------------------------------------------------------------------------
// Klickton „Thock“ (gewählt 12.11.2026, ersetzt „Watte sanft“): kurzer,
// satter Tastenanschlag – tiefer Sinus 260 → 150 Hz plus ein winziger
// Anschlag bei 1,2 kHz, zusammen unter 50 ms. Gilt universell: Navigation,
// Übungen, Spiele, alle Knöpfe. Spielt beim Runterdrücken (pointerdown).
// Hängt am selben Ton-Schalter wie Erfolg und Fehler. Ein Knopf mit
// data-kein-klick (oder darin) bleibt stumm.

export function klickton() {
  try {
    if (!erfolgstoeneAn()) return
    const c = context()
    if (!c) return
    if (c.state === 'suspended') c.resume()
    const t = c.currentTime + 0.002

    const bus = c.createGain()
    const weich = c.createBiquadFilter()
    weich.type = 'lowpass'
    weich.frequency.value = 7000
    const begrenzer = c.createDynamicsCompressor()
    begrenzer.threshold.value = -6
    begrenzer.ratio.value = 6
    begrenzer.attack.value = 0.001
    begrenzer.release.value = 0.05
    bus.connect(weich).connect(begrenzer).connect(c.destination)

    // Körper: tiefer Ton, der schnell absackt
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(260, t)
    o.frequency.exponentialRampToValueAtTime(150, t + 0.027)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.85, t + 0.002) // 12.11.: lauter (vorher 0.45)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045)
    o.connect(g).connect(bus)
    o.start(t)
    o.stop(t + 0.065)

    // Anschlag: 6 ms gefiltertes Rauschen
    const n = Math.max(32, Math.floor(c.sampleRate * 0.006))
    const puffer = c.createBuffer(1, n, c.sampleRate)
    const d = puffer.getChannelData(0)
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 4)
    const quelle = c.createBufferSource()
    quelle.buffer = puffer
    const f = c.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 1200
    f.Q.value = 1.5
    const gk = c.createGain()
    gk.gain.value = 0.6
    quelle.connect(f).connect(gk).connect(bus)
    quelle.start(t)
  } catch {
    // Kein Ton ist kein Fehler.
  }
}

const KNOPF = 'button, .btn, [role="button"], [role="tab"], .quiz-option'

/** Einmal beim Start aufrufen: hängt den Klickton an alle Knöpfe der App. */
export function klicktoeneStarten() {
  if (typeof document === 'undefined' || klicktoeneStarten.laeuft) return
  klicktoeneStarten.laeuft = true
  document.addEventListener(
    'pointerdown',
    (e) => {
      if (e.button > 0) return
      const el = typeof e.target?.closest === 'function' ? e.target.closest(KNOPF) : null
      if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true' || el.closest('[data-kein-klick]')) return
      klickton()
    },
    { capture: true, passive: true },
  )
}

// ---------------------------------------------------------------------------
// Fehlerton „Gedämpftes Duo“ (gewählt 12.11.2026): zwei dumpfe
// Kalimba-Töne nach unten (C5 → A4), leise und kurz – sagt „nicht ganz“,
// ohne zu bestrafen. Gleicher Ton-Schalter wie Erfolg und Klick.

const KALIMBA = [[1, 1, 1], [3.01, 0.12, 0.25], [5.9, 0.05, 0.12]]

export function fehlerton() {
  try {
    if (!erfolgstoeneAn()) return
    const c = context()
    if (!c) return
    if (c.state === 'suspended') c.resume()

    const t0 = c.currentTime + 0.003
    const dumpf = c.createBiquadFilter()
    dumpf.type = 'lowpass'
    dumpf.frequency.value = 1500
    const begrenzer = c.createDynamicsCompressor()
    begrenzer.threshold.value = -16
    begrenzer.ratio.value = 4
    begrenzer.attack.value = 0.003
    begrenzer.release.value = 0.15
    dumpf.connect(begrenzer).connect(c.destination)
    if (hall) {
      const hallLaut = c.createGain()
      hallLaut.gain.value = 0.22
      dumpf.connect(hall).connect(hallLaut).connect(c.destination)
    }

    ;[[523.25, 0, 0.32, 0.25], [440, 0.1, 0.3, 0.4]].forEach(([hz, ab, laut, lang]) => {
      const a = t0 + ab
      for (const [faktor, anteil, ausklang] of KALIMBA) {
        const osc = c.createOscillator()
        const g = c.createGain()
        osc.type = 'sine'
        osc.frequency.value = hz * faktor
        const dauer = Math.max(0.03, lang * ausklang)
        g.gain.setValueAtTime(0.0001, a)
        g.gain.exponentialRampToValueAtTime(laut * anteil, a + 0.01)
        g.gain.exponentialRampToValueAtTime(0.0001, a + dauer)
        osc.connect(g).connect(dumpf)
        osc.start(a)
        osc.stop(a + dauer + 0.05)
      }
    })
  } catch {
    // Kein Ton ist kein Fehler.
  }
}
