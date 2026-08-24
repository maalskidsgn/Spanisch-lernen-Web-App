// Prüft die Stücke von "Land & Leute".
//
// Der Fehler, der hier wirklich passiert, ist ein leiser: Man schreibt
// den Text, sucht danach sechs schöne Vokabeln dazu – und zwei davon
// stehen gar nicht im Text. Beim Lesen fällt das niemandem auf, weil
// die Wörter zum Thema passen. Wer sie dann in den Trainer legt,
// lernt Vokabeln zu einem Text, in dem sie nicht vorkommen.
//
// Das lässt sich messen, also wird es hier gemessen.
//
// Ebenfalls geprüft: dass beide Sprachen da sind (eine leere deutsche
// Zeile fällt beim Schreiben nicht auf, beim Lesen sehr wohl), dass
// die Kennungen eindeutig sind – unter ihnen wird gespeichert, was
// schon gelesen wurde – und dass niemand versehentlich Jahreszahlen
// einbaut. Jahreszahlen sind die Stelle, an der aus "Allgemeinwissen"
// unbemerkt eine Behauptung wird, die falsch sein kann.
//
// Was NICHT geprüft werden kann: ob der Inhalt stimmt und ob das
// Spanisch richtig ist. Das bleibt Handarbeit.
//
// Läuft vor jedem Build. WICHTIG: Beim Verketten mit && nicht durch
// head oder grep leiten – head beendet sich mit 0 und verdeckt einen
// echten Fehlschlag.

import { STUECKE } from './src/landUndLeute.js'

const fehler = []
const meckern = (s, text) => fehler.push(`[${s?.id ?? '???'}] ${text}`)

// --- Kennungen ----------------------------------------------------
// Unter der id merkt sich die App, welche Stücke schon gelesen sind.
// Zwei gleiche Kennungen heißt: Ein Stück gilt als gelesen, das
// niemand geöffnet hat.
const gesehen = new Set()
for (const s of STUECKE) {
  if (!s.id) meckern(s, 'ohne Kennung')
  else if (gesehen.has(s.id)) meckern(s, 'diese Kennung gibt es doppelt')
  gesehen.add(s.id)
}

/**
 * Steht das Wort im Text?
 *
 * Nicht als Zeichenkettenvergleich: In der Wortliste steht
 * "recordar", im Text "recuerdan". "la luz" wird im Plural zu
 * "luces". Beides ist dasselbe Wort, und ein stumpfer Vergleich
 * schlägt hier zu Unrecht an – bei der ersten Fassung dieses Prüfers
 * genau elf Mal, und jedes Mal zu Unrecht.
 *
 * Deshalb werden KANDIDATEN gebildet und es genügt, wenn einer davon
 * im Text steht. Abgedeckt sind die drei Sachen, die im Spanischen
 * wirklich passieren:
 *
 *   Diphthongierung: cerrar -> cierran, perder -> pierdes,
 *   recordar -> recuerdan, conseguir -> consigue.
 *   Endungen: amargo -> amarga, ancho -> ancha.
 *   Plural auf -z: luz -> luces, disfraz -> disfraces.
 *
 * Absichtlich großzügig: Der Prüfer soll echte Ausrutscher finden,
 * nicht über spanische Formenlehre streiten. Drei Zeichen sind die
 * Untergrenze – kürzere Stämme fänden sich in irgendeinem Wort immer.
 */
function kandidaten(wort) {
  const roh = wort
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(el|la|los|las|un|una)\s+/, '')
    .trim()

  // Mehrwortiges wie "ocuparse de" oder "parecerse a": Das lange Wort
  // traegt die Bedeutung, die Praeposition steht sowieso ueberall.
  const kern = roh.split(/\s+/).sort((x, y) => y.length - x.length)[0]

  const basen = new Set([roh, kern])

  // reflexiv weg: quedarse -> quedar
  const ohneSe = kern.replace(/se$/, '')
  basen.add(ohneSe)

  // Infinitivendung weg: quedar -> qued
  const verbstamm = ohneSe.replace(/(ar|er|ir)$/, '')
  basen.add(verbstamm)

  // Endvokal weg: amargo -> amarg, ancha -> anch
  basen.add(kern.replace(/[oae]$/, ''))

  // Diphthongierung: den LETZTEN Stammvokal aufbrechen.
  for (const stamm of [verbstamm, ohneSe]) {
    const e = stamm.lastIndexOf('e')
    if (e >= 0) {
      basen.add(stamm.slice(0, e) + 'ie' + stamm.slice(e + 1))
      basen.add(stamm.slice(0, e) + 'i' + stamm.slice(e + 1))
    }
    const o = stamm.lastIndexOf('o')
    if (o >= 0) basen.add(stamm.slice(0, o) + 'ue' + stamm.slice(o + 1))
  }

  // Plural auf -z: luz -> luces, disfraz -> disfraces
  if (kern.endsWith('z')) basen.add(kern.slice(0, -1) + 'c')

  return [...basen].filter((k) => k.length >= 3)
}

const ohneAkzente = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

for (const s of STUECKE) {
  // --- Beide Sprachen, überall -----------------------------------
  for (const feld of ['region', 'titel', 'titelDe', 'vorspann', 'wusstest']) {
    if (!s[feld]?.trim()) meckern(s, `das Feld "${feld}" ist leer`)
  }

  if (!Array.isArray(s.absaetze) || s.absaetze.length < 2) {
    meckern(s, 'weniger als zwei Absätze – zu wenig zum Lesen')
    continue
  }

  for (const [i, a] of s.absaetze.entries()) {
    if (!a.es?.trim()) meckern(s, `Absatz ${i + 1} hat keinen spanischen Text`)
    if (!a.de?.trim()) meckern(s, `Absatz ${i + 1} hat keine deutsche Zeile`)
    // Eine deutsche Zeile, die mit der spanischen identisch ist, ist
    // eine vergessene Übersetzung – nicht Absicht.
    if (a.es && a.de && a.es.trim() === a.de.trim()) {
      meckern(s, `Absatz ${i + 1}: deutsch und spanisch sind identisch`)
    }
  }

  // --- Die sechs Wörter ------------------------------------------
  if (!Array.isArray(s.woerter) || s.woerter.length !== 6) {
    meckern(s, `${s.woerter?.length ?? 0} Wörter statt sechs`)
  }

  const text = ohneAkzente(s.absaetze.map((a) => a.es).join(' '))
  const schonDa = new Set()

  for (const w of s.woerter ?? []) {
    if (!w.es?.trim() || !w.de?.trim()) {
      meckern(s, `unvollständiges Wort: ${JSON.stringify(w)}`)
      continue
    }
    if (schonDa.has(w.es)) meckern(s, `"${w.es}" steht doppelt in der Wortliste`)
    schonDa.add(w.es)

    if (!kandidaten(w.es).some((k) => text.includes(k))) {
      meckern(s, `"${w.es}" kommt im spanischen Text gar nicht vor`)
    }
  }

  // --- Keine nachschlagbaren Zahlen ------------------------------
  // Jahreszahlen und Einwohnerzahlen sind die Stelle, an der aus
  // Allgemeinwissen unbemerkt eine prüfbare Behauptung wird. Wenn
  // ein Stück eine braucht, gehört sie belegt – und dann trägt man
  // sie hier bewusst aus.
  const alles = [
    ...s.absaetze.flatMap((a) => [a.es, a.de]),
    s.vorspann,
    s.wusstest,
  ].join(' ')
  const jahr = alles.match(/\b(1[0-9]{3}|20[0-9]{2})\b/)
  if (jahr) {
    meckern(s, `enthält die Jahreszahl ${jahr[0]} – bitte belegen oder umschreiben`)
  }
}

if (fehler.length > 0) {
  console.error(`${fehler.length} Problem(e) bei Land & Leute:`)
  for (const f of fehler) console.error('  ' + f)
  process.exit(1)
}

const woerter = STUECKE.reduce((s, t) => s + t.woerter.length, 0)
const absaetze = STUECKE.reduce((s, t) => s + t.absaetze.length, 0)
console.log(
  `Land & Leute in Ordnung – ${STUECKE.length} Stücke, ${absaetze} Absätze, ${woerter} Wörter geprüft.`
)
