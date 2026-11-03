/**
 * Sammelt Texte aus ALLEN Inhaltsdateien - nicht nur lektionen.js.
 *
 * Die Prüfstationen liegen in pruefstationen.js, die Hörszenen in
 * mitgehoert.js, die Grammatik in bausteine.js, die Landeskunde in
 * landUndLeute.js. Jede dieser Dateien hat eigene Titel, Fragen und
 * Erklärtexte - und keine davon stand in der ersten Sammlung.
 *
 * Deshalb hier jede Datei durchlaufen, statt eine Liste zu pflegen.
 */
import { readFileSync, writeFileSync } from 'node:fs'

// Manche Inhaltsdateien ziehen ueber Umwege supabase.js herein, und
// das erwartet die Vite-Umgebungsvariablen. In Node gibt es die
// nicht - deshalb hier vortaeuschen, bevor irgendetwas geladen wird.
if (!import.meta.env) {
  globalThis.import_meta_env_shim = true
}

const SRC = '/Users/manuelkillert/Projekte/spanisch-app/src'
const DATEIEN = [
  'lektionen.js', 'pruefstationen.js', 'mitgehoert.js', 'bausteine.js',
  'landUndLeute.js', 'startpakete.js', 'saetze.js', 'lesetexte.js',
]

const TECHNISCH = new Set([
  'id', 'niveau', 'kursNr', 'emoji', 'farbe', 'pfad', 'symbol', 'von', 'bis',
  'wiederholt', 'vorher', 'es', 'beispielEs', 'sprecher', 'stimme', 'ziele_es',
  'wert', 'klasse', 'icon', 'audio', 'bild', 'quelle', 'url', 'typ',
])

const texte = new Set()

function durchlaufe(wert, feld = '') {
  if (typeof wert === 'string') {
    if (TECHNISCH.has(feld) || /Es$/.test(feld)) return
    const t = wert.trim()
    if (t.length < 3) return
    if (!/[a-zäöüß]/i.test(t)) return
    if (/[¿¡]/.test(t)) return            // eindeutig spanisch
    if (/^[a-z0-9_-]+$/.test(t)) return   // ids, Klassennamen
    texte.add(t)
    return
  }
  if (Array.isArray(wert)) return wert.forEach((x) => durchlaufe(x, feld))
  if (wert && typeof wert === 'object') {
    for (const [k, v] of Object.entries(wert)) durchlaufe(v, k)
  }
}

for (const datei of DATEIEN) {
  let modul
  try {
    modul = await import(`${SRC}/${datei}`)
  } catch (f) {
    console.error(`  ${datei} liess sich nicht laden: ${f.message.split('\n')[0]}`)
    continue
  }
  for (const [name, wert] of Object.entries(modul)) {
    // Vokabeln und Beispielsaetze laufen ueber eigene Tabellen
    if (name === 'LEKTIONEN') {
      for (const l of wert) { const { items, ...rest } = l; durchlaufe(rest) }
      continue
    }
    durchlaufe(wert, name)
  }
}

const liste = [...texte]
writeFileSync('alle-inhalte.json', JSON.stringify(liste, null, 1))

const fertig = JSON.parse(readFileSync('uebersetzt.json', 'utf8')).texte
const offen = liste.filter((t) => !fertig[t])
writeFileSync('offen2.json', JSON.stringify(offen, null, 1))
console.log(`gesamt ${liste.length}, davon offen ${offen.length}`)
