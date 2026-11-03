/**
 * Wie stelle-um.mjs, aber für Text, der über mehrere Zeilen läuft.
 *
 * Das zeilenweise Werkzeug sieht nur, was zwischen > und < in
 * DERSELBEN Zeile steht. Umbrochener Fliesstext - und davon ist in
 * dieser App viel - faellt dort durch.
 *
 * Recht.jsx bleibt aussen vor: AGB und Datenschutzerklaerung sind
 * keine Oberflaechentexte. Die gehoeren von einem Menschen
 * uebersetzt, der dafuer geradesteht.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { basename } from 'node:path'

const SRC = '/Users/manuelkillert/Projekte/spanisch-app/src'

/**
 * Was wie Text aussieht, aber Code ist.
 *
 * `a > 10 && b < 95` trifft das Muster >…< genau so gut wie ein
 * Absatz. Viermal hat dieses Werkzeug deshalb Code zerschossen -
 * einmal pro Durchlauf, bis diese Regel stand. Klammern und
 * Operatoren kommen in Oberflaechentexten praktisch nicht vor,
 * in JavaScript dauernd.
 */
const KEIN_TEXT = /[(){}<>=\\|`$]|&&|\|\||\?\.|=>|\b(return|const|let|var|function|length|filter|map)\b/
const datei = process.argv[2]
const praefix = process.argv[3]
const pfad = `${SRC}/${datei}`
let inhalt = readFileSync(pfad, 'utf8')

const DEUTSCH = /\b(der|die|das|und|nicht|für|dein|deine|dich|mit|auf|von|zum|zur|wenn|dann|kannst|wird|werden|einen|eine|schon|noch|alle|jeder|ist|sind|hast|habe)\b/i

// Mehrzeiliger Text zwischen zwei Tags
const gefunden = []
for (const m of inhalt.matchAll(/>(\s*\n[^<>{}]{12,}?\n\s*)</gs)) {
  const roh = m[1]
  const text = roh.replace(/\s+/g, ' ').trim()
  if (!DEUTSCH.test(text)) continue
  if (/^[a-z]+\.[a-zA-Z]/.test(text)) continue
  gefunden.push({ roh, text })
}

if (!gefunden.length) {
  console.log(`${datei}: nichts Mehrzeiliges`)
  process.exit(0)
}

function schluesselAus(text, n) {
  const w = text.toLowerCase()
    .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
    .replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 3)
    .map((x, i) => (i ? x[0].toUpperCase() + x.slice(1) : x)).join('')
  return `${praefix}.${w || 'text' + n}`
}

const gesehen = new Map()
for (const [i, e] of gefunden.entries()) {
  let k = schluesselAus(e.text, i)
  const n = (gesehen.get(k) ?? 0) + 1
  gesehen.set(k, n)
  e.schluessel = n > 1 ? k + n : k
}

async function uebersetze(teil) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o', temperature: 0.2, response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content:
          'You translate German legal texts (Impressum, privacy policy, terms of service) for the English version of a language-learning app. ' +
          'Use established legal English; GDPR terms must match the official English wording (Verantwortlicher = controller, Auftragsverarbeiter = processor, ' +
          'Einwilligung = consent, berechtigtes Interesse = legitimate interest, Widerruf = withdrawal, Löschung = erasure, Datenübertragbarkeit = data portability). ' +
          'Keep German law references as they are ("§ 5 DDG", "Art. 6 Abs. 1 lit. f DSGVO"). Keep names, addresses, e-mails, URLs, numbers and amounts exactly. ' +
          'Formal register, second person "you". Same structure, same length - add nothing, omit nothing.' },
        { role: 'user', content:
          `Return JSON {"out":[{"i":0,"en":"..."}]} for all ${teil.length} entries.\n` +
          JSON.stringify(teil.map((e, i) => ({ i, de: e.text }))) },
      ],
    }),
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const liste = JSON.parse((await r.json()).choices[0].message.content).out || []
  for (const e of liste) if (teil[e.i] && e.en) teil[e.i].en = e.en
}

for (let i = 0; i < gefunden.length; i += 20) await uebersetze(gefunden.slice(i, i + 20))

function trageEin(sprachdatei, feld) {
  const p = `${SRC}/texte/${sprachdatei}`
  let s = readFileSync(p, 'utf8').trimEnd()
  const neu = gefunden.filter((e) => e[feld])
    .map((e) => `  ${JSON.stringify(e.schluessel)}: ${JSON.stringify(e[feld])},`).join('\n')
  s = s.slice(0, -1).trimEnd()
  if (!s.endsWith(',')) s += ','
  writeFileSync(p, `${s}\n\n  /* ---------------- ${basename(datei, '.jsx')} (mehrzeilig) ---------------- */\n${neu}\n}\n`)
}
trageEin('de.js', 'text')
trageEin('en.js', 'en')

let n = 0
for (const e of gefunden) {
  // Den Rohtext samt Umbrüchen ersetzen - so bleibt die Einrückung
  // drumherum, wie sie war.
  if (inhalt.includes(`>${e.roh}<`)) {
    inhalt = inhalt.replace(`>${e.roh}<`, `>{t('${e.schluessel}')}<`)
    n++
  }
}
writeFileSync(pfad, inhalt)
console.log(`${datei}: ${n}/${gefunden.length} mehrzeilige Texte ersetzt`)
