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
import { LEKTIONEN } from './lektionen.js'
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

// ---- Von selbst anhoeren --------------------------------------
//
// Auf der Wortkarte spielt die Aufnahme ab, sobald die Karte da ist.
// Das ist der Punkt einer Sprach-App: Wer erst tippen muss, liest das
// Wort zuerst still – und praegt sich die falsche Aussprache ein,
// bevor er die richtige gehoert hat.
//
// Der Schalter ist trotzdem noetig. Wer im Zug oder im Buero lernt,
// will nicht, dass es aus dem Nichts spricht.
const AUTO_SPEICHER = 'tonVonSelbst'

/** Soll die Aufnahme von selbst starten? Standard: ja. */
export function tonVonSelbst() {
  try {
    return localStorage.getItem(AUTO_SPEICHER) !== 'aus'
  } catch {
    return true
  }
}

export function setzeTonVonSelbst(an) {
  try {
    localStorage.setItem(AUTO_SPEICHER, an ? 'an' : 'aus')
  } catch {
    // dann gilt es eben nur fuer diese Sitzung
  }
}

// Was zuletzt von selbst lief – gegen das doppelte Abspielen.
let zuletzt = { text: null, zeit: 0 }

/**
 * Von selbst abspielen – aber denselben Text nicht zweimal.
 *
 * React haengt Bauteile in der Entwicklung absichtlich zweimal ein,
 * um Effekte ohne Aufraeumen zu entlarven. Ohne diese Sperre spricht
 * die Karte das Wort deshalb doppelt – und ein Fehler in der
 * Abhaengigkeitsliste taete in der fertigen App dasselbe.
 *
 * Gesperrt wird nur eineinhalb Sekunden. Taucht dasselbe Wort spaeter
 * in einer Uebung wieder auf, spricht es ganz normal.
 */
export function spieleVonSelbst(text, einstellungen) {
  if (!tonVonSelbst()) return
  const jetzt = Date.now()
  if (zuletzt.text === text && jetzt - zuletzt.zeit < 1500) return
  zuletzt = { text, zeit: jetzt }
  return spiele(text, einstellungen)
}

// ---- Was der Kurs selbst mitbringt ----------------------------
//
// Seit dem 20.08. ist jeder Text des Kurses vertont – alle 4.518
// Woerter, Beispielsaetze und Dialogzeilen. Fuer die muss niemand
// mehr beim Speicher nachfragen: Es steht in lektionen.js, und die
// Datei liegt ohnehin in der App.
//
// Das war vorher der sichtbare Fehler. Der Lautsprecher fragte per
// HEAD nach, zeigte solange nichts an und sprang danach nach – auf
// einer fertig gezeichneten Karte, die dadurch noch einmal
// verrutschte. Es sah aus wie ein Bug, und es war einer.
//
// Ein erzeugtes Verzeichnis der Pruefsummen waere die andere
// Loesung gewesen: 57 KB gezippt, gemessen, also 16 % mehr Bundle
// fuer eine Auskunft, die schon da ist.
//
// Verglichen werden Texte, nicht Pruefsummen: Ein Set aufzubauen
// kostet nichts, 4.518 SHA-256-Summen im Browser auszurechnen schon.
let vertonteTexte = null

function tonSchluessel(text, stimme) {
  return `${stimme}|${sprechText(text)}`
}

function verzeichnis() {
  if (vertonteTexte) return vertonteTexte
  vertonteTexte = new Set()
  for (const l of LEKTIONEN) {
    for (const i of l.items) {
      vertonteTexte.add(tonSchluessel(i.es, STIMMEN.standard))
      if (i.beispielEs) vertonteTexte.add(tonSchluessel(i.beispielEs, STIMMEN.standard))
    }
    for (const z of l.dialog ?? []) {
      vertonteTexte.add(tonSchluessel(z.es, stimmeImDialog(l.dialog, z.sprecher)))
    }
  }
  return vertonteTexte
}

/**
 * Steht fest, dass es diese Aufnahme gibt? Ohne Netz, ohne Warten.
 *
 * Nur fuer Kursinhalte wahr. Woerter aus eigenen Listen, Videos und
 * Ebooks kann niemand vorher vertonen – dort bleibt es beim Nachfragen.
 *
 * WICHTIG: Wer einen Lektionstext aendert, aendert die Pruefsumme und
 * damit den Dateinamen. Diese Auskunft waere dann falsch, bis das
 * Vertonungsskript nachgelaufen ist. `node scripts/vertone.mjs`
 * (ohne --los) sagt, ob noch etwas fehlt – vor einer Veroeffentlichung
 * gehoert das gelaufen.
 */
export function sicherVertont(text, stimme = STIMMEN.standard) {
  return verzeichnis().has(tonSchluessel(text, stimme))
}

// Merkt sich pro Sitzung, welche Dateien existieren (oder fehlen),
// damit wir nicht bei jedem Klick erneut nachfragen.
const bekannt = new Map()

/**
 * Gibt es zu diesem Text eine echte Aufnahme?
 *
 * Damit kann die Oberflaeche den Lautsprecher weglassen, statt eine
 * Blechstimme anzubieten. In einer Sprach-App ist keine Stimme
 * besser als eine schlechte: Wer "La eñe es una letra española" von
 * der Browser-Stimme hoert, lernt eine Aussprache, die es nicht gibt.
 *
 * WICHTIG: Ein Netzfehler wird NICHT als "gibt es nicht" gemerkt.
 * Sonst bliebe der Knopf die ganze Sitzung weg, nur weil eine
 * Abfrage einmal gezuckt hat.
 */
export async function gibtEsAufnahme(text, stimme = STIMMEN.standard) {
  // Kursinhalt: Antwort steht fest, kein Netz noetig.
  if (sicherVertont(text, stimme)) return true

  const name = await audioName(text, stimme)
  if (bekannt.has(name)) return bekannt.get(name)
  try {
    const antwort = await fetch(`${ABLAGE}/${name}`, { method: 'HEAD' })
    bekannt.set(name, antwort.ok)
    return antwort.ok
  } catch {
    return false // nur fuer dieses Mal – nicht merken
  }
}
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

  // Kursinhalt braucht keine Nachfrage – sonst wartet der erste
  // Klick auf jedes Wort erst eine Anfrage lang.
  let vorhanden = sicherVertont(text, stimme) || bekannt.get(name)
  if (vorhanden === undefined) {
    try {
      const antwort = await fetch(url, { method: 'HEAD' })
      vorhanden = antwort.ok
      bekannt.set(name, vorhanden) // nur eine echte Antwort merken
    } catch {
      // Netz gezuckt: diesmal Browser-Stimme, aber nicht fuer immer
      vorhanden = false
    }
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
 *
 * @param {object} [opt]
 * @param {(index: number) => void} [opt.beiZeile] – wird gerufen,
 *   BEVOR eine Zeile erklingt. Damit kann die Anzeige mitlaufen,
 *   statt nach eigenem Takt zu blättern: Eine lange Zeile bleibt
 *   dann so lange stehen, wie sie gesprochen wird.
 */
export function dialogAbspielen(dialog, { beiZeile } = {}) {
  let gestoppt = false

  const lauf = (async () => {
    for (const [index, zeile] of dialog.entries()) {
      if (gestoppt) return
      beiZeile?.(index)
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
