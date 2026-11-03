/**
 * Sammelt alles, was in den Lerninhalten übersetzt werden muss.
 *
 * Die Inhaltsdateien bleiben unangetastet - wir lesen sie nur und
 * schreiben eine Liste der Texte heraus. Übersetzt wird danach in
 * eigene Nachschlagedateien.
 */
import { LEKTIONEN } from '/Users/manuelkillert/Projekte/spanisch-app/src/lektionen.js'
import { writeFileSync } from 'node:fs'

// Vokabeln und Sätze schlagen wir über das Spanische nach - das ist
// eindeutig. "der Bank" und "die Bank" wären auf Deutsch dasselbe
// Wort, im Spanischen sind es zwei.
const vokabeln = new Map()   // es -> de
const saetze = new Map()     // es -> de
const texte = new Map()      // de -> (kein spanisches Gegenstück)

let lektionen = 0

for (const l of LEKTIONEN) {
  lektionen++
  if (l.titel) texte.set(l.titel, 'titel')
  if (l.untertitel) texte.set(l.untertitel, 'untertitel')
  if (l.ziel) texte.set(l.ziel, 'ziel')

  for (const i of l.items || []) {
    if (i.es && i.de) vokabeln.set(i.es, i.de)
    if (i.beispielEs && i.beispielDe) saetze.set(i.beispielEs, i.beispielDe)
  }
  for (const w of l.wissen || []) {
    if (w.titel) texte.set(w.titel, 'wissen-titel')
    if (w.text) texte.set(w.text, 'wissen-text')
  }
  for (const d of l.dialog || []) {
    if (d.es && d.de) saetze.set(d.es, d.de)
  }
  for (const u of l.uebungen || l.aufgaben || []) {
    for (const feld of ['frage', 'hinweis', 'erklaerung', 'titel']) {
      if (u[feld]) texte.set(u[feld], feld)
    }
  }
}

const raus = {
  vokabeln: [...vokabeln.entries()],
  saetze: [...saetze.entries()],
  texte: [...texte.keys()],
}

writeFileSync(
  '/private/tmp/claude-501/-Users-manuelkillert/b4100586-ee84-4775-9f8d-4efb903b3423/scratchpad/zu-uebersetzen.json',
  JSON.stringify(raus, null, 1),
)

console.log(`Lektionen:  ${lektionen}`)
console.log(`Vokabeln:   ${raus.vokabeln.length}`)
console.log(`Sätze:      ${raus.saetze.length}`)
console.log(`Texte:      ${raus.texte.length}`)
console.log(`Zeichen gesamt: ${JSON.stringify(raus).length.toLocaleString('de')}`)
