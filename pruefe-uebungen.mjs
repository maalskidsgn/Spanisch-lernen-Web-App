// Prüft, was in den Übungen tatsächlich auf dem Bildschirm landet.
//
// pruefe-lektionen.mjs prüft, ob die Lösung unter den Optionen steht.
// Das sagt nichts darüber, ob der Text in der richtigen Sprache ist:
// Stehen Frage UND Antworten auf Deutsch, ist die Aufgabe lösbar und
// trotzdem falsch, sobald jemand die App auf Englisch liest.
//
// Zwei Fehlerbilder, beide schon dagewesen:
//
//   1. Deutscher Inhalt, obwohl eine Übersetzung existiert. Der
//      Satzbau zeigte "Seitdem habe ich ihn nicht gesehen.", die
//      Wortpaare die deutschen Vokabeln.
//   2. Ein Schlüssel statt des Textes. Die Meilenstein-Meldung zeigte
//      wörtlich "ms.wortschatz" und "500 ms.woerter geschafft" - der
//      Wert war nie durch t() gelaufen.

import { readFileSync } from 'node:fs'
import { LEKTIONEN, baueSchritte } from './src/lektionen.js'
import { setzeSprache, vokabel, satz, text, t } from './src/sprache.js'
import de from './src/texte/de.js'
import en from './src/texte/en.js'
import { TEXTE } from './src/texte/inhalte-en.js'

const fehler = []

// Alle deutschen Werte, zu denen es eine abweichende englische
// Fassung gibt. Steht einer davon auf einem englischen Bildschirm,
// wurde er nicht übersetzt.
//
// Die Lerninhalte gehoeren dazu, nicht nur die Oberflaeche: Der
// Satzbau zeigte einen deutschen Beispielsatz, und der steht in
// TEXTE, nicht in de.js. Ohne diese Zeile meldete die Pruefung
// genau zwei Vokabeln und liess den ganzen Satz durch.
const DEUTSCH = new Set()
for (const k of Object.keys(de)) if (en[k] && en[k] !== de[k]) DEUTSCH.add(de[k].trim())
for (const [d, e] of Object.entries(TEXTE)) if (e && e !== d) DEUTSCH.add(d.trim())

// Fehlt ein Schluessel in en.js, faellt t() still auf das Deutsche
// zurueck. Auf dem Bildschirm sieht das aus wie eine vergessene
// Uebersetzung, im Code wie ein Tippfehler - gemeldet wird es nur
// hier.
const nurDe = Object.keys(de).filter((k) => !(k in en))
const nurEn = Object.keys(en).filter((k) => !(k in de))
if (nurDe.length) fehler.push(`${nurDe.length} Schlüssel fehlen in en.js: ${nurDe.slice(0, 5).join(', ')}`)
if (nurEn.length) fehler.push(`${nurEn.length} Schlüssel fehlen in de.js: ${nurEn.slice(0, 5).join(', ')}`)

// Sieht aus wie ein Schlüssel: "ms.wortschatz", "ls3.fastGeschafft"
const SCHLUESSEL = /^[a-z][a-z0-9]*[0-9]?\.[a-zA-Z][\w.]*$/

function pruefe(wert, wo) {
  if (typeof wert !== 'string' || !wert.trim()) return
  const s = wert.trim()
  if (SCHLUESSEL.test(s)) fehler.push(`${wo}: zeigt den Schlüssel "${s}" statt des Textes`)
  else if (DEUTSCH.has(s)) fehler.push(`${wo}: steht auf Deutsch – "${s.slice(0, 50)}"`)
}

setzeSprache('en')

for (const l of LEKTIONEN) {
  for (const s of baueSchritte(l)) {
    const wo = `${l.id} ${s.typ}`
    // Genau die Felder, die Lessons.jsx anzeigt
    if (s.typ === 'satzbau') {
      pruefe(s.satzbau?.uebersetzung, wo + ' (Vorgabe)')
      // Haerter als die Wortliste: Was angezeigt wird, muss genau das
      // sein, was satz() liefert. Ein durchgereichter Rohwert faellt
      // hier auf, auch wenn der Satz zufaellig nicht in TEXTE steht.
      const soll = satz(s.item)
      if (soll && s.satzbau?.uebersetzung !== soll)
        fehler.push(`${wo} (Vorgabe): zeigt "${String(s.satzbau?.uebersetzung).slice(0, 40)}", erwartet "${soll.slice(0, 40)}"`)
    }
    if (s.typ === 'paare') for (const p of s.paare ?? []) {
      pruefe(p.de, wo + ' (Paar)')
      const soll = vokabel({ es: p.es, de: p.de })
      if (soll && p.de !== soll)
        fehler.push(`${wo} (Paar): zeigt "${p.de}", erwartet "${soll}"`)
    }
    if (s.typ === 'quiz' && s.richtung === 'es-de') pruefe(vokabel(s.item), wo + ' (Wort)')
    if (s.typ === 'luecke') pruefe(satz(s.item), wo + ' (Hilfe)')
    if (s.typ === 'rueckblick') pruefe(vokabel(s.item), wo + ' (Wort)')
    if (s.zeile) pruefe(satz(s.zeile, 'es', 'de'), wo + ' (Zeile)')
    if (s.frage) {
      pruefe(text(s.frage.frage), wo + ' (Frage)')
      for (const o of s.frage.optionen ?? []) pruefe(text(o), wo + ' (Option)')
    }
  }
  pruefe(text(l.titel), `${l.id} (Titel)`)
  pruefe(text(l.beschreibung), `${l.id} (Beschreibung)`)
}

// Die Meilenstein-Meldung zeigt Titel, Einheit und Stufe direkt an.
//
// Gelesen wird die Datei als Text: Sie enthaelt JSX, und das laedt
// Node nicht. Ein `await import(...).catch(...)` sah hier zuerst
// aus wie eine Pruefung, uebersprang aber in Wahrheit immer alles -
// und genau diese Meldung war es, die "ms.wortschatz" anzeigte.
const quelle = readFileSync(new URL('./src/Meilensteine.jsx', import.meta.url), 'utf8')
for (const m of quelle.matchAll(/titel: '([^']+)'/g)) pruefe(t(m[1]), 'Meilenstein (Titel)')
for (const m of quelle.matchAll(/einheit: \['([^']+)', '([^']+)'\]/g)) {
  pruefe(t(m[1]), 'Meilenstein (Einzahl)')
  pruefe(t(m[2]), 'Meilenstein (Mehrzahl)')
}
// Auch meilensteine.js laesst sich hier nicht importieren: Es holt
// sich KATEGORIEN aus der .jsx zurueck.
const stufen = readFileSync(new URL('./src/meilensteine.js', import.meta.url), 'utf8')
  .match(/STUFEN_NAMEN = \[([^\]]+)\]/)?.[1] ?? ''
for (const m of stufen.matchAll(/'([^']+)'/g)) pruefe(t(m[1]), 'Meilenstein (Stufe)')

setzeSprache('de')

if (fehler.length) {
  const gezeigt = [...new Set(fehler)]
  console.error(`${gezeigt.length} Stelle(n) in den Übungen stehen nicht auf Englisch:`)
  for (const f of gezeigt.slice(0, 40)) console.error('  •', f)
  if (gezeigt.length > 40) console.error(`  … und ${gezeigt.length - 40} weitere`)
  process.exit(1)
}

console.log('Übungen in Ordnung – Vorgaben, Paare und Meldungen kommen übersetzt an.')
