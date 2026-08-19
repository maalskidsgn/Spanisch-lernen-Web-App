// Prüft den Kursaufbau. Läuft bei jedem Build mit (npm run build).
//
// Der wichtigste Test ist die Reihenfolge: Eine Lektion darf nur
// wiederholen, was WIRKLICH schon dran war. Ein Vorwärtsverweis
// würde den Lernenden nach Wörtern fragen, die er nie gesehen hat.

import { LEKTIONEN, MODULE, baueSchritte, baueOptionen } from './src/lektionen.js'

const fehler = []
const ids = LEKTIONEN.map((l) => l.id)
const nr = new Map(LEKTIONEN.map((l) => [l.id, l.kursNr]))

for (const l of LEKTIONEN) {
  const melde = (m) => fehler.push(`${l.id}: ${m}`)

  for (const f of ['titel', 'niveau', 'kursNr', 'grammatik', 'kulturnotiz'])
    if (l[f] == null) melde(`Feld "${f}" fehlt`)
  if ((l.grammatik ?? []).length > 1) melde('mehr als EIN Grammatikschwerpunkt')

  for (const v of [...(l.vorher ?? []), ...(l.wiederholt ?? [])]) {
    if (!ids.includes(v)) melde(`unbekannter Verweis "${v}"`)
    else if (v === l.id) melde('verweist auf sich selbst')
    else if (nr.get(v) >= l.kursNr) melde(`verweist auf "${v}" (Nr. ${nr.get(v)}), das später kommt`)
  }

  const des = l.items.map((i) => i.de)
  if (new Set(des).size !== des.length) melde('doppelte Übersetzung – Multiple Choice wäre nicht lösbar')
  for (const i of l.items)
    if (!i.es || !i.de || !i.beispielEs || !i.beispielDe) melde(`unvollständiges Wort "${i.es}"`)

  // Jede bewertete Aufgabe braucht lösbare Optionen
  for (const s of baueSchritte(l)) {
    if (!['quiz', 'hoeren', 'dialogquiz', 'rueckblick'].includes(s.typ)) continue
    const o = baueOptionen(s, l) ?? []
    const feld = s.richtung === 'de-es' ? 'es' : 'de'
    const loesung = s.item?.[feld] ?? s.zeile?.de
    if (o.length < 2) melde(`Schritt "${s.typ}" hat zu wenige Optionen`)
    if (loesung && !o.includes(loesung)) melde(`Schritt "${s.typ}": Lösung fehlt in den Optionen`)
    if (new Set(o).size !== o.length) melde(`Schritt "${s.typ}": doppelte Optionen`)
  }
}

const nrs = LEKTIONEN.map((l) => l.kursNr)
if (new Set(nrs).size !== nrs.length) fehler.push('kursNr doppelt vergeben')
for (const m of MODULE)
  for (const id of m.lektionen)
    if (!ids.includes(id)) fehler.push(`Modul "${m.titel}": Lektion "${id}" gibt es nicht`)

if (fehler.length) {
  console.error('\nKursaufbau fehlerhaft:\n' + fehler.map((f) => '  • ' + f).join('\n') + '\n')
  process.exit(1)
}
console.log(`Kursaufbau in Ordnung – ${LEKTIONEN.length} Lektionen geprüft.`)
