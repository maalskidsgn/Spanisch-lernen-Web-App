/**
 * Stellt eine Datei auf die Sprachdateien um.
 *
 * Sammelt die deutschen Texte, vergibt Schlüssel, lässt übersetzen,
 * trägt beides in de.js und en.js ein und ersetzt die Stellen im
 * Code.
 *
 * Was NICHT automatisch geht und deshalb gemeldet statt angefasst
 * wird: Texte, die über mehrere Zeilen laufen. Die erwischt die
 * zeilenweise Suche nicht sauber, und ein halb ersetzter Satz ist
 * schlimmer als ein deutscher.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { basename } from 'node:path'

const SRC = '/Users/manuelkillert/Projekte/spanisch-app/src'
const SCHLUESSEL = process.env.OPENAI_API_KEY

const datei = process.argv[2]
const praefix = process.argv[3]
if (!datei || !praefix) {
  console.error('Aufruf: node stelle-um.mjs <Datei.jsx> <praefix>')
  process.exit(1)
}

const pfad = `${SRC}/${datei}`
let inhalt = readFileSync(pfad, 'utf8')
const zeilen = inhalt.split('\n')

/* ------------------------------------------------------------------ *
 *  1. Sammeln
 * ------------------------------------------------------------------ */

const gefunden = new Map()   // Text -> { art }

function merke(text, art) {
  const s = text.trim()
  if (s.length < 4) return
  if (!/[a-zäöüß]/.test(s)) return
  if (!/[A-ZÄÖÜ]/.test(s) && !/\s/.test(s)) return
  if (/[{}=<>/\\|`$]/.test(s)) return
  if (/^(https?:|\.|#|[a-z-]+$)/.test(s)) return
  if (/^[a-z]+\.[a-zA-Z]+$/.test(s)) return
  if (!gefunden.has(s)) gefunden.set(s, { art })
}

zeilen.forEach((z) => {
  if (/^\s*(\/\/|\*|\/\*)/.test(z)) return
  for (const m of z.matchAll(/>([^<>{}]+)</g)) merke(m[1], 'jsx')
  for (const m of z.matchAll(/(?:placeholder|aria-label|title|alt)=["']([^"']+)["']/g)) merke(m[1], 'attr')
  for (const m of z.matchAll(/\b(?:titel|text|hinweis|label|name|frage|antwort|beschreibung|unterzeile)\s*:\s*'([^']+)'/g)) merke(m[1], 'prop')
})

if (!gefunden.size) {
  console.log(`${datei}: nichts zu tun`)
  process.exit(0)
}

/* ------------------------------------------------------------------ *
 *  2. Schlüssel vergeben
 * ------------------------------------------------------------------ */

function schluesselAus(text, n) {
  const wort = text
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/).filter(Boolean).slice(0, 3)
    .map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w))
    .join('')
  return `${praefix}.${wort || 'text' + n}`
}

const eintraege = [...gefunden.keys()].map((text, i) => ({
  text,
  schluessel: schluesselAus(text, i),
}))
// Doppelte Schlüssel durchnummerieren
const gesehen = new Map()
for (const e of eintraege) {
  const n = (gesehen.get(e.schluessel) ?? 0) + 1
  gesehen.set(e.schluessel, n)
  if (n > 1) e.schluessel += n
}

/* ------------------------------------------------------------------ *
 *  3. Übersetzen
 * ------------------------------------------------------------------ */

async function uebersetze(texte) {
  const antwort = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SCHLUESSEL}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You translate interface texts for Habloo, an app that teaches Spanish, now also for ENGLISH speakers. ' +
            'The German original speaks to the learner directly and informally ("du") — keep that: plain, warm, no corporate voice. ' +
            'Where the German compares Spanish to GERMAN, rewrite the comparison for ENGLISH speakers so it is actually true. ' +
            'Keep *asterisk emphasis*, emoji and placeholders like {name} exactly as they are. ' +
            'Keep roughly the same length — these sit in buttons and headings.',
        },
        {
          role: 'user',
          content:
            `Translate all ${texte.length} entries.\nReturn JSON: {"out":[{"i":0,"en":"..."}]} with the same i.\n\n` +
            JSON.stringify(texte.map((t, i) => ({ i, de: t.text }))),
        },
      ],
    }),
  })
  if (!antwort.ok) throw new Error(`HTTP ${antwort.status}: ${(await antwort.text()).slice(0, 200)}`)
  const daten = await antwort.json()
  const liste = JSON.parse(daten.choices[0].message.content).out || []
  for (const e of liste) if (texte[e.i] && e.en) texte[e.i].en = e.en
}

for (let i = 0; i < eintraege.length; i += 25) {
  await uebersetze(eintraege.slice(i, i + 25))
}

/* ------------------------------------------------------------------ *
 *  4. In die Sprachdateien eintragen
 * ------------------------------------------------------------------ */

function trageEin(sprachdatei, feld, ueberschrift) {
  const p = `${SRC}/texte/${sprachdatei}`
  let s = readFileSync(p, 'utf8').trimEnd()
  if (!s.endsWith('}')) throw new Error(`${sprachdatei} endet unerwartet`)
  const neu = eintraege
    .filter((e) => e[feld])
    .map((e) => `  ${JSON.stringify(e.schluessel)}: ${JSON.stringify(e[feld])},`)
    .join('\n')
  s = s.slice(0, -1).trimEnd()
  if (!s.endsWith(',')) s += ','
  writeFileSync(p, `${s}\n\n  /* ---------------- ${ueberschrift} ---------------- */\n${neu}\n}\n`)
}

trageEin('de.js', 'text', basename(datei, '.jsx'))
trageEin('en.js', 'en', basename(datei, '.jsx'))

/* ------------------------------------------------------------------ *
 *  5. Den Code umschreiben
 * ------------------------------------------------------------------ */

let ersetzt = 0
for (const e of eintraege) {
  const vorher = inhalt
  const q = e.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // >Text<  ->  >{t('schluessel')}<
  inhalt = inhalt.replace(new RegExp(`>(\\s*)${q}(\\s*)<`, 'g'), `>$1{t('${e.schluessel}')}$2<`)
  // attr="Text"  ->  attr={t('schluessel')}
  inhalt = inhalt.replace(
    new RegExp(`((?:placeholder|aria-label|title|alt)=)["']${q}["']`, 'g'),
    `$1{t('${e.schluessel}')}`
  )
  // feld: 'Text'  ->  feld: t('schluessel')
  inhalt = inhalt.replace(
    new RegExp(`(\\b(?:titel|text|hinweis|label|name|frage|antwort|beschreibung|unterzeile)\\s*:\\s*)'${q}'`, 'g'),
    `$1t('${e.schluessel}')`
  )
  if (inhalt !== vorher) ersetzt++
}

writeFileSync(pfad, inhalt)
console.log(`${datei}: ${ersetzt}/${eintraege.length} ersetzt, Schlüssel ${praefix}.*`)
const offen = eintraege.filter((e) => inhalt.includes(`'${e.text}'`) || inhalt.includes(`>${e.text}<`))
if (offen.length) {
  console.log(`  noch offen: ${offen.map((e) => e.text.slice(0, 30)).join(' | ')}`)
}
