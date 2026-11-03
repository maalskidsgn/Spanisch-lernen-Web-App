/**
 * Findet t()-Aufrufe in Konstanten auf Modulebene.
 *
 * Dort gibt es keinen Hook, und selbst mit Modul-Import waere der
 * Text eingefroren: Die Konstante wird einmal beim Laden
 * ausgewertet und aendert sich beim Sprachwechsel nie wieder.
 *
 * Erkannt wird ein Block, der mit `const NAME = [` oder `= {` in
 * Spalte 1 beginnt und mit `]` oder `}` in Spalte 1 endet.
 */
import { readFileSync, readdirSync } from 'node:fs'

const SRC = '/Users/manuelkillert/Projekte/spanisch-app/src'
let treffer = 0

for (const datei of readdirSync(SRC).filter((f) => f.endsWith('.jsx') || f.endsWith('.js'))) {
  if (datei === 'sprache.js') continue
  const zeilen = readFileSync(`${SRC}/${datei}`, 'utf8').split('\n')
  let drin = null

  zeilen.forEach((z, i) => {
    if (drin === null) {
      const m = z.match(/^(?:export\s+)?const\s+(\w+)\s*=\s*[[{]\s*$/)
      if (m) drin = { name: m[1], ab: i }
      return
    }
    if (/^[\]}]/.test(z)) { drin = null; return }
    if (/\bt\(['"]/.test(z)) {
      console.log(`${datei}:${i + 1}  ${drin.name} ruft t() auf Modulebene auf`)
      console.log(`    ${z.trim().slice(0, 80)}`)
      treffer++
    }
  })
}
console.log(treffer ? `\n${treffer} Stellen.` : '\nKeine t()-Aufrufe auf Modulebene.')
