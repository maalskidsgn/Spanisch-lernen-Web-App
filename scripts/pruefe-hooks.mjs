/**
 * Findet t()-Aufrufe ohne Hook in der umgebenden Komponente.
 *
 * Nur Funktionen der OBERSTEN Ebene zaehlen als Komponente - eine
 * Hilfsfunktion innerhalb einer Komponente sieht deren t() ueber
 * den Closure und braucht keinen eigenen Hook. Die erste Fassung
 * dieser Pruefung hat das verwechselt und 87 Fehlalarme geliefert.
 */
import { readFileSync, readdirSync } from 'node:fs'

const SRC = '/Users/manuelkillert/Projekte/spanisch-app/src'
let probleme = 0

for (const datei of readdirSync(SRC).filter((f) => f.endsWith('.jsx'))) {
  const inhalt = readFileSync(`${SRC}/${datei}`, 'utf8')
  if (!/\bt\(['"]/.test(inhalt)) continue
  if (/import \{[^}]*\bt\b[^}]*\} from '\.\/sprache\.js'/.test(inhalt)) continue

  const zeilen = inhalt.split('\n')

  // Nur Funktionen ohne Einrueckung sind Komponenten der obersten Ebene.
  const oben = []
  zeilen.forEach((z, i) => {
    const m = z.match(/^(?:export\s+)?(?:default\s+)?function\s+(\w+)/)
    if (m) oben.push({ name: m[1], zeile: i })
  })

  const mitHook = new Set()
  zeilen.forEach((z, i) => {
    if (!/const t = useTexte\(\)/.test(z)) return
    const f = [...oben].reverse().find((f) => f.zeile < i)
    if (f) mitHook.add(f.name)
  })

  const gemeldet = new Set()
  zeilen.forEach((z, i) => {
    if (!/\bt\(['"]/.test(z) || /const t = useTexte/.test(z)) return
    const f = [...oben].reverse().find((f) => f.zeile < i)
    const name = f?.name ?? '(oberste Ebene)'
    if (mitHook.has(name) || gemeldet.has(datei + name)) return
    gemeldet.add(datei + name)
    console.log(`${datei}:${i + 1}  ${name}() benutzt t() ohne Hook`)
    probleme++
  })
}

console.log(probleme ? `\n${probleme} Komponenten ohne Hook.` : '\nAlle Komponenten haben ihren Hook.')
