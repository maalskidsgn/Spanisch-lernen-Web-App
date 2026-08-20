// Prüft die Bausteine, bevor sie jemand zu sehen bekommt.
//
// Warum es das gibt: Bei den 150 Lektionen hat der gleichnamige
// Prüfer jeden echten Fehler gefunden, den ich gemacht habe –
// doppelte Kennungen, Aufgaben ohne Lösung, Verweise ins Leere.
// Grammatikaufgaben sind noch anfälliger: Eine Multiple-Choice-Frage,
// bei der die Lösung nicht unter den Optionen steht, sieht im Code
// völlig normal aus und ist in der App unlösbar.
//
// Läuft vor jedem Build. WICHTIG: Beim Verketten mit && NICHT durch
// head oder grep leiten – head beendet sich mit 0 und verdeckt damit
// einen echten Fehlschlag.

import { BAUSTEINE, FAMILIEN, RUNDE_GROESSE } from './src/bausteine.js'
import { LEKTIONEN } from './src/lektionen.js'
// Die Regeln stehen in src/aufgabePruefen.js, nicht hier: Die App
// prueft die KI-Varianten zur Laufzeit nach genau denselben. Zwei
// Kopien waeren zwei Wahrheiten.
import { pruefeAufgabe } from './src/aufgabePruefen.js'

const fehler = []
const meckern = (b, text) => fehler.push(`[${b?.id ?? '???'}] ${text}`)

// --- Doppelte Kennungen zuerst -----------------------------------
// Zuerst, weil jede andere Meldung in die Irre führt, solange zwei
// Bausteine dieselbe id tragen: Der Speicher des Nutzers kann sie
// nicht auseinanderhalten, und Fortschritt landet auf dem falschen.
const gesehen = new Set()
for (const b of BAUSTEINE) {
  if (gesehen.has(b.id)) meckern(b, 'diese Kennung gibt es doppelt')
  gesehen.add(b.id)
}
if (fehler.length > 0) {
  console.error('Doppelte Kennungen – erst die beheben:')
  for (const f of fehler) console.error('  ' + f)
  process.exit(1)
}

const familienIds = new Set(FAMILIEN.map((f) => f.id))
const lektionenIds = new Set(LEKTIONEN.map((l) => l.id))

for (const b of BAUSTEINE) {
  // --- Die Pflichtfelder ------------------------------------------
  for (const feld of ['id', 'titel', 'familie', 'lektion', 'regel']) {
    if (!b[feld]) meckern(b, `das Feld "${feld}" fehlt`)
  }
  if (!familienIds.has(b.familie)) {
    meckern(b, `die Familie "${b.familie}" steht nicht in FAMILIEN`)
  }
  if (!lektionenIds.has(b.lektion)) {
    meckern(b, `die Lektion "${b.lektion}" gibt es nicht`)
  }
  // Die Regel ist die Kurzfassung auf der Karte. Ein Absatz passt
  // dort nicht hin.
  if (b.regel && b.regel.length > 120) {
    meckern(b, `die Regel ist zu lang (${b.regel.length} Zeichen, erlaubt sind 120)`)
  }

  // --- Genug Aufgaben ---------------------------------------------
  if (!Array.isArray(b.aufgaben) || b.aufgaben.length < RUNDE_GROESSE) {
    meckern(b, `braucht mindestens ${RUNDE_GROESSE} Aufgaben, hat ${b.aufgaben?.length ?? 0}`)
    continue
  }

  b.aufgaben.forEach((a, i) => {
    const klage = pruefeAufgabe(a)
    if (klage) meckern(b, `Aufgabe ${i + 1}: ${klage}`)
  })

  // --- Abwechslung ------------------------------------------------
  // Fünfmal derselbe Typ hintereinander ist eine Übung, kein Baustein.
  const typen = new Set(b.aufgaben.map((a) => a.typ))
  if (typen.size < 2) {
    meckern(b, 'alle Aufgaben haben denselben Typ – das wird schnell langweilig')
  }
}

// --- Jede Familie hat Bausteine ----------------------------------
for (const f of FAMILIEN) {
  if (!BAUSTEINE.some((b) => b.familie === f.id)) {
    fehler.push(`[${f.id}] diese Familie ist leer – sie erscheint als leerer Kasten`)
  }
}

if (fehler.length > 0) {
  console.error(`${fehler.length} Problem(e) in den Bausteinen:`)
  for (const f of fehler) console.error('  ' + f)
  process.exit(1)
}

console.log(
  `Bausteine in Ordnung – ${BAUSTEINE.length} Bausteine, ` +
    `${BAUSTEINE.reduce((s, b) => s + b.aufgaben.length, 0)} Aufgaben geprüft.`
)
