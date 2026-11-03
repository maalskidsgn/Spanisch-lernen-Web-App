// Prüft, dass jeder Schlüssel im Code auch in den Sprachdateien steht.
//
// Fehlt einer, gibt t() ihn unverändert zurück – und dann steht er
// wörtlich auf dem Bildschirm. Genau so kam "lv.legende" unter den
// Namen im Profil zu stehen: Die neun Level-Namen waren in der
// Umstellung zwar auf Schlüssel umgebaut, aber nie in de.js und
// en.js eingetragen worden.
//
// Der Build merkt davon nichts – für JavaScript ist 'lv.legende'
// eine gültige Zeichenkette wie jede andere.

import { readFileSync, readdirSync } from 'node:fs'

const SRC = new URL('./src/', import.meta.url)

function dateien(ordner = SRC, gesammelt = []) {
  for (const e of readdirSync(ordner, { withFileTypes: true })) {
    const pfad = new URL(e.name + (e.isDirectory() ? '/' : ''), ordner)
    if (e.isDirectory()) dateien(pfad, gesammelt)
    else if (/\.(js|jsx)$/.test(e.name) && !ordner.pathname.endsWith('/texte/')) gesammelt.push(pfad)
  }
  return gesammelt
}

/**
 * Die Schlüssel einer Sprachdatei.
 *
 * Beide Schreibweisen zählen: Die alten Einträge stehen in einfachen
 * Anführungszeichen, die nachgetragenen in doppelten. Eine Fassung
 * dieser Funktion las nur die doppelten und meldete daraufhin 527
 * fehlende Schlüssel - alle davon waren da.
 */
function schluesselVon(datei) {
  const inhalt = readFileSync(datei, 'utf8')
  const raus = new Set()
  for (const m of inhalt.matchAll(/^\s*'([^']+)'\s*:/gm)) raus.add(m[1])
  for (const m of inhalt.matchAll(/^\s*"((?:[^"\\]|\\.)+)"\s*:/gm)) raus.add(JSON.parse(`"${m[1]}"`))
  return raus
}

const de = schluesselVon(new URL('./texte/de.js', SRC))
const en = schluesselVon(new URL('./texte/en.js', SRC))

const fehler = []

// 1. Beide Sprachdateien müssen dieselben Schlüssel haben
for (const k of de) if (!en.has(k)) fehler.push(`"${k}" fehlt in en.js`)
for (const k of en) if (!de.has(k)) fehler.push(`"${k}" fehlt in de.js`)

/**
 * Was wie ein Schlüssel aussieht.
 *
 * Ein kleingeschriebenes Wort, ein Punkt, dann ein Bezeichner:
 * 'ls3.fastGeschafft', 'ms.wortschatz'. Dateinamen, Adressen und
 * Methodenaufrufe sehen ähnlich aus und fliegen unten raus.
 */
const WIE_SCHLUESSEL = /^[a-z][a-z0-9]{0,11}[0-9]?\.[a-zA-Z][\w]*$/
const KEIN_SCHLUESSEL = /\.(js|jsx|json|css|html|png|jpg|svg|mjs|map|com|de|org|net|io)$/

for (const datei of dateien()) {
  const inhalt = readFileSync(datei, 'utf8')
  const name = datei.pathname.split('/src/')[1]
  for (const [i, zeile] of inhalt.split('\n').entries()) {
    if (/^\s*(\/\/|\*|\/\*)/.test(zeile)) continue
    for (const m of zeile.matchAll(/'([^'\\\n]+)'/g)) {
      const k = m[1]
      if (!WIE_SCHLUESSEL.test(k) || KEIN_SCHLUESSEL.test(k)) continue
      if (de.has(k)) continue
      // Eigenschaftszugriffe wie `daten.stufe` stehen nie in
      // Anführungszeichen – was hier landet, ist als Text gemeint.
      fehler.push(`"${k}" steht in ${name}:${i + 1}, aber in keiner Sprachdatei`)
    }
  }
}

if (fehler.length) {
  const gezeigt = [...new Set(fehler)]
  console.error(`${gezeigt.length} Schlüssel ohne Text:`)
  for (const f of gezeigt.slice(0, 30)) console.error('  •', f)
  if (gezeigt.length > 30) console.error(`  … und ${gezeigt.length - 30} weitere`)
  process.exit(1)
}

console.log(`Schlüssel in Ordnung – ${de.size} Einträge, in beiden Sprachen vollständig.`)
