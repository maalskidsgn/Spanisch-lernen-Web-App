// Die Ton-Zentrale der App.
//
// Heute spricht die Browser-Stimme. Später liegen fertige
// ElevenLabs-Aufnahmen im Supabase-Speicher – und zwar unter einem
// Namen, der aus dem TEXT SELBST berechnet wird (einer Prüfsumme).
//
// Warum das klug ist: Ändern wir eine Lektionszeile, ändert sich
// automatisch der Dateiname. Die App findet dann keine (veraltete)
// Aufnahme mehr und fällt auf die Browser-Stimme zurück, bis das
// Vertonungs-Skript die neue Datei erzeugt hat. Es kann also nie
// ein Audio laufen, das nicht zum Text passt.

import { sprich } from './sprich.js'
import {
  STIMMEN,
  sprechText,
  stimmeImDialog,
  dateiName,
  pruefsummeQuelle,
} from './stimmen.js'

export { STIMMEN, sprechText, stimmeImDialog }

// Wo die fertigen Aufnahmen liegen (öffentlicher Supabase-Ordner)
const ABLAGE =
  'https://okwegzwsjrxusmznohis.supabase.co/storage/v1/object/public/audio'

/** Prüfsumme aus Text + Stimme – ergibt den Dateinamen. */
export async function audioName(text, stimme = STIMMEN.standard) {
  const daten = new TextEncoder().encode(pruefsummeQuelle(text, stimme))
  const hash = await crypto.subtle.digest('SHA-256', daten)
  const hex = [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return dateiName(hex)
}

// Merkt sich pro Sitzung, welche Dateien existieren (oder fehlen),
// damit wir nicht bei jedem Klick erneut nachfragen.
const bekannt = new Map()
let laufend = null // das gerade spielende Audio

/**
 * Spielt einen Text ab: echte Aufnahme, wenn vorhanden – sonst
 * Browser-Stimme. Gibt zurück, was gespielt wurde ('datei'|'browser').
 *
 * @param {string} text
 * @param {object} [opt]
 * @param {string} [opt.stimme]  – eine Kennung aus STIMMEN
 * @param {number} [opt.tempo]   – 1 = normal, 0.75 = langsam
 */
export async function spiele(text, { stimme = STIMMEN.standard, tempo = 1 } = {}) {
  const name = await audioName(text, stimme)
  const url = `${ABLAGE}/${name}`

  // Läuft schon etwas? Stoppen – wie bei der Browser-Stimme auch.
  if (laufend) {
    laufend.pause()
    laufend = null
  }

  let vorhanden = bekannt.get(name)
  if (vorhanden === undefined) {
    try {
      const antwort = await fetch(url, { method: 'HEAD' })
      vorhanden = antwort.ok
    } catch {
      vorhanden = false
    }
    bekannt.set(name, vorhanden)
  }

  if (vorhanden) {
    const ton = new Audio(url)
    ton.playbackRate = tempo
    // Browser halten beim Verlangsamen die Tonhöhe – klingt also
    // nach "langsam gesprochen", nicht nach Zeitlupe.
    ton.preservesPitch = true
    laufend = ton
    try {
      await ton.play()
      return 'datei'
    } catch {
      // Abspielen blockiert (z.B. Autoplay-Regel) – Browser-Stimme
    }
  }

  sprich(sprechText(text))
  return 'browser'
}


/**
 * Spielt einen ganzen Dialog als Gespräch ab, Zeile für Zeile mit
 * kurzer Pause. Bricht ab, wenn stop() aufgerufen wird.
 */
export function dialogAbspielen(dialog) {
  let gestoppt = false

  const lauf = (async () => {
    for (const zeile of dialog) {
      if (gestoppt) return
      await spiele(zeile.es, { stimme: stimmeImDialog(dialog, zeile.sprecher) })
      // Auf das Ende der Datei bzw. der Browser-Stimme warten
      await new Promise((fertig) => {
        if (laufend) {
          laufend.onended = fertig
          laufend.onerror = fertig
        } else {
          // Browser-Stimme: grob nach Textlänge schätzen
          setTimeout(fertig, 900 + zeile.es.length * 65)
        }
      })
      if (gestoppt) return
      await new Promise((f) => setTimeout(f, 450)) // Atempause
    }
  })()

  return {
    fertig: lauf,
    stop() {
      gestoppt = true
      if (laufend) laufend.pause()
      try { speechSynthesis.cancel() } catch { /* kein Ton da */ }
    },
  }
}
