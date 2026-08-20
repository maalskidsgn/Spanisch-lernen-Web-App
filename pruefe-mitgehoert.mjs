// Prüft die Hörverstehens-Szenen.
//
// Verstehensfragen sind die Aufgabenart, bei der am meisten schiefgeht
// – und zwar auf eine Weise, die man beim Durchlesen nicht bemerkt.
// Die zwei Fehler, die wirklich passieren:
//
//   1. Die richtige Antwort ist die einzige, deren Wörter im Dialog
//      vorkommen. Dann rät man nach Stichwort und muss gar nichts
//      verstanden haben. Das ist der klassische Fehler in
//      maschinell erzeugten Hörverstehens-Aufgaben.
//
//   2. Die richtige Antwort ist die längste. Wer Prüfungen kennt,
//      weiß das – und kreuzt sie an, ohne zugehört zu haben. Beim
//      Schreiben passiert es fast von selbst: Die richtige Antwort
//      braucht die Einschränkung, die sie richtig macht.
//
// Beides lässt sich messen. Ob eine falsche Antwort inhaltlich doch
// stimmt, lässt sich NICHT messen – das bleibt Handarbeit.
//
// Läuft vor jedem Build. WICHTIG: Beim Verketten mit && nicht durch
// head oder grep leiten – head beendet sich mit 0 und verdeckt einen
// echten Fehlschlag.

import { SZENEN, FRAGEN_MINDESTENS, baueSchritteSzene, modulVonSzene } from './src/mitgehoert.js'
import { LEKTIONEN, MODULE } from './src/lektionen.js'
import { PRUEFSTATIONEN } from './src/pruefstationen.js'
import { BESETZUNG } from './src/stimmen.js'

const fehler = []
const meckern = (s, text) => fehler.push(`[${s?.id ?? '???'}] ${text}`)

// --- Kennungen zuerst --------------------------------------------
// Fortschritt wird unter der id gespeichert. Zwei gleiche Kennungen
// heißt: Eine Lektion gilt als erledigt, die niemand gemacht hat.
const belegt = new Set([
  ...LEKTIONEN.map((l) => l.id),
  ...PRUEFSTATIONEN.map((s) => s.id),
])
const gesehen = new Set()
for (const s of SZENEN) {
  if (gesehen.has(s.id)) meckern(s, 'diese Kennung gibt es doppelt')
  if (belegt.has(s.id)) meckern(s, 'diese Kennung gehört schon einer Lektion oder Station')
  gesehen.add(s.id)
}
if (fehler.length > 0) {
  console.error('Doppelte Kennungen – erst die beheben:')
  for (const f of fehler) console.error('  ' + f)
  process.exit(1)
}

// --- Jedes Modul hat genau eine Szene ----------------------------
for (const modul of MODULE) {
  const treffer = SZENEN.filter((s) => s.modul === modul.id)
  if (treffer.length === 0) fehler.push(`[${modul.id}] dieses Modul hat keine Szene`)
  else if (treffer.length > 1) fehler.push(`[${modul.id}] dieses Modul hat ${treffer.length} Szenen`)
}

/** Wörter eines Textes, ohne die, die überall vorkommen. */
const FUELLWOERTER = new Set([
  'que', 'para', 'como', 'porque', 'pero', 'con', 'una', 'uno', 'los', 'las',
  'del', 'por', 'más', 'muy', 'todo', 'toda', 'todos', 'todas', 'este', 'esta',
  'eso', 'esa', 'ese', 'sus', 'año', 'años', 'cuando', 'donde', 'desde', 'hasta',
  'aquí', 'allí', 'allá', 'nada', 'algo', 'bien', 'mal', 'poco', 'mucho', 'mucha',
  'otro', 'otra', 'ya', 'sin', 'sobre', 'entre', 'hay', 'ser', 'estar', 'tener',
])

function inhaltsWoerter(text) {
  return (text.toLowerCase().match(/[\p{L}ñáéíóúü]+/gu) ?? []).filter(
    (w) => w.length > 3 && !FUELLWOERTER.has(w)
  )
}

for (const szene of SZENEN) {
  // --- Die Pflichtfelder ------------------------------------------
  for (const feld of ['id', 'modul', 'titel', 'emoji', 'ort', 'fragenAuf']) {
    if (!szene[feld]) meckern(szene, `das Feld "${feld}" fehlt`)
  }
  if (!modulVonSzene(szene)) {
    meckern(szene, `das Modul "${szene.modul}" gibt es nicht`)
    continue
  }
  if (!['de', 'es'].includes(szene.fragenAuf)) {
    meckern(szene, `fragenAuf muss "de" oder "es" sein, ist "${szene.fragenAuf}"`)
  }
  // Der Satz vor dem Hören muss die Lage wirklich beschreiben. Ein
  // Wort ("Café") sagt nicht, wer da spricht und worum es geht.
  if (szene.ort && szene.ort.length < 30) {
    meckern(szene, `die Ortsangabe ist zu knapp (${szene.ort.length} Zeichen) – wer hört, muss wissen, worauf er sich einstellt`)
  }

  // --- Der Dialog -------------------------------------------------
  // Unter zwanzig Zeilen ist es kein Gespräch, dem man folgen muss,
  // sondern ein Wortwechsel, den man sich merkt.
  if (!Array.isArray(szene.dialog) || szene.dialog.length < 20) {
    meckern(szene, `braucht mindestens 20 Dialogzeilen, hat ${szene.dialog?.length ?? 0}`)
    continue
  }
  szene.dialog.forEach((z, i) => {
    if (!z.sprecher || !z.es || !z.de) meckern(szene, `Zeile ${i + 1}: sprecher, es oder de fehlt`)
    if (z.sprecher && !BESETZUNG[z.sprecher]) {
      meckern(
        szene,
        `Zeile ${i + 1}: "${z.sprecher}" steht nicht in der Besetzung – ` +
          `die Stimme wuerde nach Position vergeben und klaenge wie eine andere Rolle`
      )
    }
  })

  // Mindestens zwei Sprecher, sonst ist es ein Vortrag.
  const sprecher = new Set(szene.dialog.map((z) => z.sprecher))
  if (sprecher.size < 2) meckern(szene, `nur ${sprecher.size} Sprecher – das ist kein Gespräch`)

  // --- Die Fragen -------------------------------------------------
  if (!Array.isArray(szene.fragen) || szene.fragen.length < FRAGEN_MINDESTENS) {
    meckern(szene, `braucht mindestens ${FRAGEN_MINDESTENS} Fragen, hat ${szene.fragen?.length ?? 0}`)
    continue
  }

  const dialogWoerter = new Set(szene.dialog.flatMap((z) => inhaltsWoerter(z.es)))
  let laengsteIstLoesung = 0

  szene.fragen.forEach((f, i) => {
    const nr = `Frage ${i + 1}`
    if (!f.frage) meckern(szene, `${nr}: der Fragetext fehlt`)
    if (!Array.isArray(f.optionen) || f.optionen.length < 3) {
      meckern(szene, `${nr}: braucht mindestens 3 Antwortmöglichkeiten, hat ${f.optionen?.length ?? 0}`)
      return
    }
    if (f.optionen.length > 4) meckern(szene, `${nr}: mehr als vier Antworten passen nicht auf ein Handy`)
    if (new Set(f.optionen).size !== f.optionen.length) {
      meckern(szene, `${nr}: eine Antwort steht doppelt`)
    }
    if (!f.optionen.includes(f.loesung)) {
      meckern(szene, `${nr}: die Lösung steht nicht unter den Antworten`)
      return
    }

    // Fehler 2: Ist die richtige Antwort die längste?
    const laengste = Math.max(...f.optionen.map((o) => o.length))
    if (f.loesung.length === laengste) laengsteIstLoesung++

    // Fehler 1: Verrät der Wortlaut die Antwort?
    // Nur bei spanischen Fragen sinnvoll – bei deutschen Antworten
    // gibt es keine Woerter, die sich mit dem Dialog decken koennten.
    if (szene.fragenAuf !== 'es') return
    const treffer = (o) => inhaltsWoerter(o).filter((w) => dialogWoerter.has(w)).length
    const richtig = treffer(f.loesung)
    const falsche = f.optionen.filter((o) => o !== f.loesung).map(treffer)
    if (richtig > 0 && falsche.every((n) => n === 0)) {
      meckern(
        szene,
        `${nr}: nur die richtige Antwort benutzt Wörter aus dem Dialog – ` +
          `die kreuzt man an, ohne zugehört zu haben ("${f.loesung}")`
      )
    }
  })

  // Einmal ist Zufall, bei der Mehrheit ist es ein Muster.
  if (laengsteIstLoesung > szene.fragen.length * 0.6) {
    meckern(
      szene,
      `bei ${laengsteIstLoesung} von ${szene.fragen.length} Fragen ist die richtige Antwort die längste – ` +
        `das kreuzt man an, ohne zugehört zu haben`
    )
  }

  // --- Der fertige Ablauf ------------------------------------------
  const schritte = baueSchritteSzene(szene)
  const fragenSchritte = schritte.filter((s) => s.typ === 'verstehen')
  if (fragenSchritte.length !== szene.fragen.length) {
    meckern(szene, `der Ablauf zeigt ${fragenSchritte.length} Fragen statt ${szene.fragen.length}`)
  }
  if (!schritte.some((s) => s.typ === 'hoerszene')) meckern(szene, 'im Ablauf fehlt das Hören')
  if (!schritte.some((s) => s.typ === 'abschrift')) meckern(szene, 'im Ablauf fehlt die Abschrift')
  // Die Abschrift MUSS hinten stehen. Steht sie vorn, liest man mit
  // statt zuzuhören – und dann ist die ganze Übung eine Leseübung.
  if (schritte[schritte.length - 1]?.typ !== 'abschrift') {
    meckern(szene, 'die Abschrift steht nicht am Ende – dann liest man mit, statt zuzuhören')
  }
  const hoeren = schritte.findIndex((s) => s.typ === 'hoerszene')
  const ersteFrage = schritte.findIndex((s) => s.typ === 'verstehen')
  if (hoeren > ersteFrage) meckern(szene, 'gefragt wird, bevor gehört wurde')
}

if (fehler.length > 0) {
  console.error(`${fehler.length} Problem(e) beim Hörverstehen:`)
  for (const f of fehler) console.error('  ' + f)
  process.exit(1)
}

const zeilen = SZENEN.reduce((s, z) => s + z.dialog.length, 0)
const fragen = SZENEN.reduce((s, z) => s + z.fragen.length, 0)
console.log(`Hörverstehen in Ordnung – ${SZENEN.length} Szenen, ${zeilen} Dialogzeilen, ${fragen} Fragen geprüft.`)
