/**
 * Wie viel deutscher Text steht noch im Code?
 *
 * Zaehlt zusammenhaengenden JSX-Text, auch ueber mehrere Zeilen -
 * genau die Faelle, die das zeilenweise Werkzeug nicht erwischt.
 */
import { readFileSync, readdirSync } from 'node:fs'
const SRC = '/Users/manuelkillert/Projekte/spanisch-app/src'
const DEUTSCH = /\b(der|die|das|und|nicht|für|dein|deine|dich|mit|auf|von|zum|zur|wenn|dann|kannst|wird|werden|einen|eine|schon|noch|alle|jeder)\b/i

const rest = []
for (const datei of readdirSync(SRC).filter((f) => f.endsWith('.jsx'))) {
  const inhalt = readFileSync(`${SRC}/${datei}`, 'utf8')
  // Text zwischen zwei Tags, auch mehrzeilig
  for (const m of inhalt.matchAll(/>\s*([^<>{}]{12,}?)\s*</gs)) {
    const text = m[1].replace(/\s+/g, ' ').trim()
    if (!DEUTSCH.test(text)) continue
    if (/^[a-z]+\.[a-zA-Z]/.test(text)) continue
    rest.push({ datei, text: text.slice(0, 70) })
  }
}
const proDatei = {}
for (const r of rest) proDatei[r.datei] = (proDatei[r.datei] ?? 0) + 1
console.log('Noch deutscher Text:', rest.length, 'Stellen\n')
for (const [d, n] of Object.entries(proDatei).sort((a, b) => b[1] - a[1])) console.log(`  ${n.toString().padStart(3)}  ${d}`)
