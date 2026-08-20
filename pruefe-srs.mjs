// Prüft den Karteikasten – und zwar über die Datenbank hinweg.
//
// Warum es das gibt: Am 20.08. fiel auf, dass Wörter mit „Gut" für
// immer bei 2,5 Tagen hängen blieben. Der Algorithmus in srs.js war
// dabei völlig in Ordnung – jeder Blick auf review() hätte gesagt
// „stimmt doch". Der Fehler saß woanders: sync.js speicherte
// intervall und leichtigkeit nicht mit, und beim nächsten App-Start
// fiel der Abstand auf die grobe Leiter zurück.
//
// Genau deshalb prüft diese Datei nicht review() allein, sondern die
// RUNDREISE: rechnen → in die Datenbankform → zurück → weiterrechnen.
// Ein Fehler, der erst beim zweiten Durchlauf sichtbar wird, ist mit
// einem Blick auf eine einzelne Funktion nicht zu finden.
//
// Läuft vor jedem Build. WICHTIG: Beim Verketten mit && nicht durch
// head oder grep leiten – head beendet sich mit 0 und verdeckt einen
// echten Fehlschlag.

import { review, vorschau, INTERVALS_DAYS, MAX_LEVEL } from './src/srs.js'

const fehler = []
const meckern = (text) => fehler.push(text)

// Die Datenbank speichert nicht das ganze Objekt, sondern Spalten.
// Diese Funktion bildet genau das nach, was sync.js hin- und
// zurückrechnet – inklusive der Rundreise durch ISO-Datum und Zahl.
function ueberDieDatenbank(eintrag) {
  const zeile = {
    kategorie: eintrag.status ?? 'neu',
    uebersetzung: eintrag.translation ?? '',
    stufe: eintrag.level ?? 0,
    faellig_am: new Date(eintrag.due ?? Date.now()).toISOString(),
    richtig: eintrag.richtig ?? 0,
    falsch: eintrag.falsch ?? 0,
    intervall: eintrag.intervall ?? null,
    leichtigkeit: eintrag.leichtigkeit ?? null,
  }
  const zurueck = {
    status: zeile.kategorie,
    translation: zeile.uebersetzung,
    level: zeile.stufe,
    due: new Date(zeile.faellig_am).getTime(),
    richtig: zeile.richtig,
    falsch: zeile.falsch,
  }
  if (zeile.intervall != null) zurueck.intervall = zeile.intervall
  if (zeile.leichtigkeit != null) zurueck.leichtigkeit = zeile.leichtigkeit
  return zurueck
}

const frisch = () => ({ status: 'neu', translation: 'x', level: 0, due: Date.now() })

/** Zwölfmal dieselbe Bewertung – einmal mit und einmal ohne Rundreise. */
function verlauf(bewertung, mitDatenbank) {
  let e = frisch()
  const weg = []
  for (let n = 0; n < 12; n++) {
    e = review(e, bewertung)
    weg.push(e.intervall)
    if (mitDatenbank) e = ueberDieDatenbank(e)
  }
  return weg
}

// --- Der eigentliche Fehler: der Abstand muss wachsen -------------
//
// „Gut" ist der Knopf, den man am häufigsten drückt. Wenn dabei
// nichts wächst, ist der ganze Karteikasten wirkungslos: Dieselben
// Wörter kämen für immer alle paar Tage wieder.
for (const bewertung of ['gut', 'einfach']) {
  const weg = verlauf(bewertung, true)
  const stehtStill = weg.slice(1).every((tage, i) => tage <= weg[i])
  if (stehtStill) {
    meckern(
      `"${bewertung}" waechst nicht ueber die Datenbank hinweg: ${weg.join(' → ')}. ` +
        `Vermutlich fehlen intervall/leichtigkeit in sync.js.`
    )
    continue
  }
  // Nach zwölf guten Antworten muss ein Wort in echter Ruhe sein.
  // Zwei Monate sind die Untergrenze dessen, was man „gelernt" nennt.
  const ende = weg[weg.length - 1]
  if (ende < 60) {
    meckern(`"${bewertung}" landet nach zwoelf Antworten erst bei ${ende} Tagen – zu wenig.`)
  }
}

// --- Die Rundreise darf nichts verschlucken ----------------------
//
// Das ist der Kern: Mit und ohne Datenbank muss dasselbe herauskommen.
for (const bewertung of ['gut', 'einfach', 'schwer']) {
  const ohne = verlauf(bewertung, false)
  const mit = verlauf(bewertung, true)
  if (JSON.stringify(ohne) !== JSON.stringify(mit)) {
    meckern(
      `"${bewertung}" rechnet nach der Datenbank anders:\n` +
        `      ohne: ${ohne.join(' → ')}\n` +
        `      mit:  ${mit.join(' → ')}`
    )
  }
}

// --- "nochmal" muss zurücksetzen ---------------------------------
{
  let e = frisch()
  for (let n = 0; n < 5; n++) e = ueberDieDatenbank(review(e, 'gut'))
  const danach = review(e, 'nochmal')
  if (danach.intervall !== 0) meckern(`"nochmal" setzt den Abstand nicht zurueck (${danach.intervall}).`)
  if (danach.due - Date.now() > 60 * 60 * 1000) meckern('"nochmal" zeigt das Wort nicht binnen einer Stunde wieder.')
}

// --- Die Knopfbeschriftungen müssen sich unterscheiden ------------
//
// Auf dem Bildschirm stand zweimal „3 Tage" – 2,5 und 3,25 runden
// beide dorthin. Wer zwei Knöpfe mit derselben Zahl sieht, glaubt,
// der Kasten sei am Ende.
{
  let e = frisch()
  for (let n = 0; n < 6; n++) {
    const gesehen = new Map()
    for (const b of ['nochmal', 'schwer', 'gut', 'einfach']) {
      const text = vorschau(e, b)
      if (gesehen.has(text)) {
        meckern(
          `Nach ${n} Antworten steht auf "${gesehen.get(text)}" und "${b}" dasselbe: "${text}".`
        )
      }
      gesehen.set(text, b)
    }
    e = ueberDieDatenbank(review(e, 'gut'))
  }
}

// --- Der Deckel hält --------------------------------------------
{
  let e = frisch()
  for (let n = 0; n < 40; n++) e = ueberDieDatenbank(review(e, 'einfach'))
  if (e.intervall > 365) meckern(`Der Abstand laeuft ueber die Jahresgrenze: ${e.intervall} Tage.`)
  if (e.level > MAX_LEVEL) meckern(`Die Stufe laeuft ueber das Maximum: ${e.level} > ${MAX_LEVEL}.`)
  if (e.status === 'gewusst') {
    meckern('Ein Wort setzt sich selbst auf "gewusst" – dann faellt es aus der Wiederholung heraus.')
  }
}

// --- Alte Einträge ohne intervall dürfen nicht stolpern ----------
//
// Alles, was vor dem 20.08. gelernt wurde, hat nur eine Stufe.
for (let stufe = 0; stufe <= MAX_LEVEL; stufe++) {
  const alt = { status: 'lernen', translation: 'x', level: stufe, due: Date.now() }
  const danach = review(alt, 'gut')
  if (!(danach.intervall > 0)) {
    meckern(`Ein alter Eintrag auf Stufe ${stufe} bekommt keinen Abstand (${danach.intervall}).`)
  }
  if (stufe > 0 && danach.intervall <= INTERVALS_DAYS[stufe]) {
    meckern(
      `Ein alter Eintrag auf Stufe ${stufe} waechst nicht: ` +
        `${INTERVALS_DAYS[stufe]} → ${danach.intervall} Tage.`
    )
  }
}

if (fehler.length > 0) {
  console.error(`${fehler.length} Problem(e) im Karteikasten:`)
  for (const f of fehler) console.error('  ' + f)
  process.exit(1)
}

console.log(
  'Karteikasten in Ordnung – Abstaende wachsen auch ueber die Datenbank hinweg ' +
    `(gut: ${verlauf('gut', true).join(' → ')}).`
)
