/**
 * Sammelt ALLE Texte aus den Lerninhalten - ohne zu raten, wie die
 * Felder heissen.
 *
 * Die erste Fassung suchte nach 'titel', 'untertitel' und 'ziel'.
 * Tatsaechlich heissen sie 'beschreibung', 'ziele' (Mehrzahl!),
 * 'grammatik' und 'kulturnotiz'. Was nicht in der Liste stand, wurde
 * nie uebersetzt - und fiel erst auf, als es auf dem Bildschirm
 * stand.
 *
 * Deshalb jetzt andersherum: durch jedes Objekt laufen und jede
 * Zeichenkette mitnehmen, die deutsch aussieht. Spanisch und
 * technische Werte (ids, Emojis, Farben) fallen raus.
 */
import { LEKTIONEN, MODULE } from '/Users/manuelkillert/Projekte/spanisch-app/src/lektionen.js'
import { writeFileSync } from 'node:fs'

// Felder, die niemals Anzeigetext sind
const TECHNISCH = new Set([
  'id', 'niveau', 'kursNr', 'emoji', 'farbe', 'pfad', 'symbol', 'von', 'bis',
  'wiederholt', 'vorher', 'es', 'beispielEs', 'sprecher', 'ziele_es',
])

// Spanische Inhalte erkennt man am Feldnamen (…Es) oder daran, dass
// sie spanische Sonderzeichen tragen und keine deutschen.
function istDeutsch(text) {
  if (!/[a-zäöüß]/i.test(text)) return false
  if (/[¿¡]/.test(text)) return false
  if (text.length < 3) return false
  return true
}

const texte = new Set()

function durchlaufe(wert, feld = '') {
  if (typeof wert === 'string') {
    if (TECHNISCH.has(feld) || /Es$/.test(feld)) return
    if (istDeutsch(wert)) texte.add(wert)
    return
  }
  if (Array.isArray(wert)) {
    for (const x of wert) durchlaufe(x, feld)
    return
  }
  if (wert && typeof wert === 'object') {
    for (const [k, v] of Object.entries(wert)) durchlaufe(v, k)
  }
}

// Vokabeln und Beispielsätze laufen über eigene Tabellen (nach dem
// spanischen Wort). Hier nur alles andere.
for (const l of LEKTIONEN) {
  const { items, dialog, ...rest } = l
  durchlaufe(rest)
  // Aus Dialogen nur die deutsche Seite; die spanische ist der Schlüssel
  for (const d of dialog || []) if (d.de) texte.add(d.de)
}
for (const m of MODULE) durchlaufe(m)

const liste = [...texte]
writeFileSync(
  '/private/tmp/claude-501/-Users-manuelkillert/b4100586-ee84-4775-9f8d-4efb903b3423/scratchpad/alle-texte.json',
  JSON.stringify(liste, null, 1),
)
console.log('Texte gesamt:', liste.length)
