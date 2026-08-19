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

// Wo die fertigen Aufnahmen liegen (öffentlicher Supabase-Ordner)
const ABLAGE =
  'https://okwegzwsjrxusmznohis.supabase.co/storage/v1/object/public/audio'

// Die Sprechrollen. Die Kennungen sind bewusst neutral – welche
// ElevenLabs-Stimme dahinter steckt, entscheidet allein das
// Vertonungs-Skript. App und Skript müssen nur dieselben Namen
// benutzen, damit die Prüfsummen zusammenpassen.
export const STIMMEN = {
  standard: 'es-a', // Wörter und Beispielsätze
  rolleA: 'es-a',   // erste Person im Dialog
  rolleB: 'es-b',   // zweite Person im Dialog
}

/**
 * Text vor dem Vertonen säubern – identisch im Skript!
 * "alemán / alemana" soll nicht als "alemán Schrägstrich…" enden.
 */
export function sprechText(text) {
  return String(text)
    .replace(/\s*\/\s*/g, ', ')   // "a / b" -> "a, b"
    .replace(/\s*\([^)]*\)/g, '') // "(m/w)" u.ä. entfernen
    .replace(/…/g, '')
    .trim()
}

/** Prüfsumme aus Text + Stimme – ergibt den Dateinamen. */
export async function audioName(text, stimme = STIMMEN.standard) {
  const daten = new TextEncoder().encode(stimme + '|' + sprechText(text))
  const hash = await crypto.subtle.digest('SHA-256', daten)
  return (
    [...new Uint8Array(hash)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 24) + '.mp3'
  )
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
 * Welche Rolle spricht diese Dialogzeile? Die erste Person, die im
 * Dialog auftaucht, ist immer Rolle A – deterministisch, damit das
 * Vertonungs-Skript zur selben Zuordnung kommt.
 */
export function stimmeImDialog(dialog, sprecher) {
  const erste = dialog[0]?.sprecher
  return sprecher === erste ? STIMMEN.rolleA : STIMMEN.rolleB
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
