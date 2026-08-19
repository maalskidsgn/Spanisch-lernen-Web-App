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

// Die Modulzuordnung wird aus der Kursnummer abgeleitet. Damit das
// traegt, muessen die Bereiche lueckenlos aneinanderstossen und
// jede Lektion in genau einen fallen.
let letztes = 0
for (const m of MODULE) {
  if (typeof m.von !== 'number' || typeof m.bis !== 'number')
    fehler.push(`Modul "${m.titel}": von/bis fehlt`)
  else {
    if (m.von !== letztes + 1)
      fehler.push(`Modul "${m.titel}": beginnt bei ${m.von}, erwartet ${letztes + 1}`)
    if (m.bis < m.von) fehler.push(`Modul "${m.titel}": bis liegt vor von`)
    letztes = m.bis
  }
}
if (letztes !== 150) fehler.push(`Die Module enden bei ${letztes}, der Kurs hat 150 Lektionen`)

for (const l of LEKTIONEN) {
  const passend = MODULE.filter((m) => l.kursNr >= m.von && l.kursNr <= m.bis)
  if (passend.length !== 1)
    fehler.push(`"${l.id}" (Nr. ${l.kursNr}) faellt in ${passend.length} Module statt in genau eines`)
}

// Wird jede Lektion spaeter noch einmal aufgegriffen? Wer nie
// wiederholt wird, ist nach zwei Wochen weg – genau das soll der
// Kursaufbau verhindern.
//
// Gemessen wird nur, wo genug Stoff danach liegt: Solange auf eine
// Lektion weniger als drei weitere folgen, gibt es schlicht niemanden,
// der sie aufgreifen koennte. Sonst meldete der Pruefer bei jedem
// neuen Modulende einen Fehler, der sich beim Weiterschreiben von
// selbst erledigt.
// Umgekehrt: Holt jede Lektion selbst etwas zurueck? Ohne Eintrag in
// "wiederholt" entstehen gar keine Rueckblick-Aufgaben, und die
// Lektion steht fuer sich allein.
for (const l of LEKTIONEN) {
  const davor = LEKTIONEN.filter((x) => x.kursNr < l.kursNr).length
  if (davor >= 3 && (l.wiederholt ?? []).length === 0)
    fehler.push(`"${l.id}" (Nr. ${l.kursNr}) wiederholt nichts, obwohl ${davor} Lektionen davor liegen`)
}

for (const l of LEKTIONEN) {
  const danach = LEKTIONEN.filter((x) => x.kursNr > l.kursNr).length
  if (danach < 3) continue
  const spaeter = LEKTIONEN.some((x) => (x.wiederholt ?? []).includes(l.id))
  if (!spaeter)
    fehler.push(`"${l.id}" (Nr. ${l.kursNr}) wird von keiner spaeteren Lektion wiederholt`)
}

if (fehler.length) {
  console.error('\nKursaufbau fehlerhaft:\n' + fehler.map((f) => '  • ' + f).join('\n') + '\n')
  process.exit(1)
}
console.log(`Kursaufbau in Ordnung – ${LEKTIONEN.length} Lektionen geprüft.`)
