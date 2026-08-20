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

// Wörter eines Satzes ohne Satzzeichen – für die Fehler-Aufgaben
const woerter = (satz) =>
  String(satz)
    .split(/\s+/)
    .map((w) => w.replace(/[.,;:¿?¡!«»"'()]/g, ''))
    .filter(Boolean)

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

  // Jede Aufgabe braucht die deutsche Bedeutung – sonst steht der
  // Lernende vor einem spanischen Satz, den er nicht einordnen kann.
  b.aufgaben.forEach((a, i) => {
    const wo = `Aufgabe ${i + 1}`
    if (!a.de) meckern(b, `${wo}: die deutsche Bedeutung fehlt`)

    if (a.typ === 'luecke') {
      if (!a.satz?.includes('___')) meckern(b, `${wo}: im Satz fehlt die Lücke ___`)
      if (!a.loesung) meckern(b, `${wo}: die Lösung fehlt`)
      // Eine Lücke, die schon im Satz steht, ist keine Aufgabe
      if (a.satz?.includes(a.loesung) && a.loesung.length > 2) {
        meckern(b, `${wo}: die Lösung "${a.loesung}" steht schon im Satz`)
      }
    } else if (a.typ === 'wahl') {
      if (!a.satz?.includes('___')) meckern(b, `${wo}: im Satz fehlt die Lücke ___`)
      if (!Array.isArray(a.optionen) || a.optionen.length < 2) {
        meckern(b, `${wo}: braucht mindestens zwei Optionen`)
      } else {
        if (!a.optionen.includes(a.loesung)) {
          meckern(b, `${wo}: die Lösung "${a.loesung}" steht nicht unter den Optionen`)
        }
        if (new Set(a.optionen).size !== a.optionen.length) {
          meckern(b, `${wo}: eine Option kommt doppelt vor`)
        }
      }
    } else if (a.typ === 'fehler') {
      if (!a.satz) meckern(b, `${wo}: der Satz fehlt`)
      if (!a.falsch || !a.richtig) meckern(b, `${wo}: falsch oder richtig fehlt`)
      // Das gesuchte Wort muss als ganzes Wort dastehen, sonst kann
      // man es in der App nicht antippen.
      else {
        const treffer = woerter(a.satz).filter((w) => w === a.falsch).length
        if (treffer === 0) {
          meckern(b, `${wo}: "${a.falsch}" steht so nicht als Wort im Satz`)
        } else if (treffer > 1) {
          // Steht das gesuchte Wort zweimal da, weiss niemand, welches
          // gemeint ist – und die App kann die Antwort nicht bewerten.
          meckern(b, `${wo}: "${a.falsch}" kommt ${treffer}× vor, das ist nicht eindeutig`)
        }
      }
      if (a.falsch === a.richtig) meckern(b, `${wo}: falsch und richtig sind identisch`)
      // Die Verbesserung ist ein Wort, kein Kommentar
      else if (a.richtig && /\s/.test(a.richtig.trim())) {
        meckern(b, `${wo}: "${a.richtig}" ist keine einzelne Verbesserung`)
      }
    } else if (a.typ === 'bauen') {
      const teile = woerter(a.loesung ?? '')
      if (teile.length < 3) meckern(b, `${wo}: zum Bauen braucht es mindestens drei Wörter`)
      if (teile.length > 8) meckern(b, `${wo}: ${teile.length} Wörter sind zu viele zum Sortieren`)
      // Zweimal dasselbe Wort macht die Reihenfolge mehrdeutig
      if (new Set(teile.map((w) => w.toLowerCase())).size !== teile.length) {
        meckern(b, `${wo}: ein Wort kommt doppelt vor, die Reihenfolge wäre nicht eindeutig`)
      }
    } else {
      meckern(b, `${wo}: unbekannter Aufgabentyp "${a.typ}"`)
    }
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
