/**
 * Die dritte Sorte: Text in Zuweisungen statt im Markup.
 *
 * Fehlermeldungen, Ladehinweise, Auswahllisten - sie stehen als
 * Zeichenkette im Code, nicht zwischen zwei Tags. Die ersten beiden
 * Werkzeuge suchen nach `>Text<` und finden sie deshalb nicht.
 *
 * Vorsichtiger Filter: mindestens 15 Zeichen, mindestens ein
 * deutsches Fuellwort, keine Klammern oder Pfade. Technische
 * Zeichenketten ("application/json", "border-box") fallen damit
 * durch, deutscher Fliesstext nicht.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { basename } from 'node:path'

const SRC = '/Users/manuelkillert/Projekte/spanisch-app/src'
const datei = process.argv[2]
const praefix = process.argv[3]
const pfad = `${SRC}/${datei}`
let inhalt = readFileSync(pfad, 'utf8')

const DEUTSCH = /\b(der|die|das|und|nicht|für|dein|deine|dich|kannst|wird|sitzt|geht|lohnt|einen|eine|schon|noch|alle|du|wurde|werden|keine|kein|ist|sind)\b/i

const gefunden = []
const gesehen = new Set()
for (const zeile of inhalt.split('\n')) {
  if (/^\s*(\/\/|\*|\/\*)/.test(zeile)) continue
  for (const m of zeile.matchAll(/'((?:[^'\\]|\\.){15,})'/g)) {
    const text = m[1]
    if (!DEUTSCH.test(text)) continue
    if (/^[a-z]+\.[a-zA-Z]/.test(text)) continue
    if (/[{}<>]/.test(text)) continue
    if (gesehen.has(text)) continue
    gesehen.add(text)
    gefunden.push({ text })
  }
}

if (!gefunden.length) {
  console.log(`${datei}: nichts`)
  process.exit(0)
}

const zaehler = new Map()
for (const [i, e] of gefunden.entries()) {
  const w = e.text.toLowerCase()
    .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
    .replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 3)
    .map((x, n) => (n ? x[0].toUpperCase() + x.slice(1) : x)).join('')
  let k = `${praefix}.${w || 'text' + i}`
  const n = (zaehler.get(k) ?? 0) + 1
  zaehler.set(k, n)
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
          'You translate UI strings for Habloo, a Spanish-learning app, now for ENGLISH speakers. ' +
          'These are error messages, loading hints and menu options. Informal, warm, direct address. ' +
          'Where the German says the second language is German, say English. ' +
          'Keep \\n, „quotes" and placeholders exactly as they are. Same length.' },
        { role: 'user', content:
          `Return JSON {"out":[{"i":0,"en":"..."}]} for all ${teil.length}.\n` +
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
  writeFileSync(p, `${s}\n\n  /* ---------------- ${basename(datei, '.jsx')} (Meldungen) ---------------- */\n${neu}\n}\n`)
}
trageEin('de.js', 'text')
trageEin('en.js', 'en')

let n = 0
for (const e of gefunden) {
  const vorher = inhalt
  inhalt = inhalt.split(`'${e.text}'`).join(`t('${e.schluessel}')`)
  if (inhalt !== vorher) n++
}
writeFileSync(pfad, inhalt)
console.log(`${datei}: ${n}/${gefunden.length} Meldungen ersetzt`)
