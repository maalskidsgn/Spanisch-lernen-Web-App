/**
 * Wie stelle-um.mjs, aber ohne Mindestlänge.
 *
 * Die 15-Zeichen-Grenze war der Grund, warum "Einkaufen", "Karte"
 * und "Merken" stehen blieben. Kurze Beschriftungen sind auf dem
 * Bildschirm am sichtbarsten - ausgerechnet die fielen durch.
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
const datei = process.argv[2], praefix = process.argv[3]
const pfad = `${SRC}/${datei}`
let inhalt = readFileSync(pfad, 'utf8')

const gefunden = [], gesehen = new Set()
function merke(text) {
  const t = text.trim()
  if (t.length < 2 || t.length > 200) return
  if (!/[a-zäöüß]/i.test(t)) return
  if (/^[a-z]+\.[a-zA-Z0-9]+$/.test(t)) return     // schon ein Schlüssel
  if (KEIN_TEXT.test(t ?? text)) return
  // Vergleiche und Verknuepfungen sehen aus wie Text zwischen Tags:
  // "sekunden > 10 && prozent < 95" trifft das Muster >…< genau.
  // Dreimal hat das Werkzeug deshalb Code zerschossen.
  if (/&&|\|\||\?\.|\breturn\b|\bconst\b|\blet\b|=>/.test(t)) return
  if (/^[\d\s.,%+*/-]+$/.test(t)) return          // reine Rechnerei
  if (/^(https?:|\.|#|\/)/.test(t)) return
  if (/^[a-z][a-z0-9-]*$/.test(t)) return          // Klassennamen, ids
  if (gesehen.has(t)) return
  gesehen.add(t); gefunden.push({ text: t })
}
for (const zeile of inhalt.split('\n')) {
  if (/^\s*(\/\/|\*|\/\*)/.test(zeile)) continue
  for (const m of zeile.matchAll(/>([^<>{}]{2,})</g)) merke(m[1])
  for (const m of zeile.matchAll(/(?:placeholder|aria-label|title|alt)=["']([^"']{2,})["']/g)) merke(m[1])
}
if (!gefunden.length) { console.log(`${datei}: nichts`); process.exit(0) }

const zaehler = new Map()
for (const [i, e] of gefunden.entries()) {
  const w = e.text.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
    .replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(Boolean).slice(0,3)
    .map((x,n)=>n?x[0].toUpperCase()+x.slice(1):x).join('')
  let k = `${praefix}.${w || 'text'+i}`
  const n = (zaehler.get(k) ?? 0) + 1; zaehler.set(k, n)
  e.schluessel = n > 1 ? k + n : k
}
async function uebersetze(teil) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},
    body: JSON.stringify({model:'gpt-4o',temperature:0.2,response_format:{type:'json_object'},
      messages:[{role:'system',content:'You translate short UI labels and messages for Habloo, a Spanish-learning app, now for ENGLISH speakers. Buttons and headings - keep them SHORT. Informal, direct. Where the German names German as the second language, say English. Spanish words stay Spanish.'},
                {role:'user',content:`Return JSON {"out":[{"i":0,"en":"..."}]} for all ${teil.length}.\n`+JSON.stringify(teil.map((e,i)=>({i,de:e.text})))}]})
  })
  if (!r.ok) throw new Error('HTTP '+r.status)
  const liste = JSON.parse((await r.json()).choices[0].message.content).out || []
  for (const e of liste) if (teil[e.i] && e.en) teil[e.i].en = e.en
}
for (let i = 0; i < gefunden.length; i += 25) await uebersetze(gefunden.slice(i, i+25))

function trageEin(sprachdatei, feld) {
  const p = `${SRC}/texte/${sprachdatei}`
  let s = readFileSync(p, 'utf8').trimEnd()
  const neu = gefunden.filter(e=>e[feld]).map(e=>`  ${JSON.stringify(e.schluessel)}: ${JSON.stringify(e[feld])},`).join('\n')
  s = s.slice(0,-1).trimEnd(); if (!s.endsWith(',')) s += ','
  writeFileSync(p, `${s}\n\n  /* ---------------- ${basename(datei,'.jsx')} (kurz) ---------------- */\n${neu}\n}\n`)
}
trageEin('de.js','text'); trageEin('en.js','en')

let n = 0
for (const e of gefunden) {
  const q = e.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), vor = inhalt
  inhalt = inhalt.replace(new RegExp(`>(\\s*)${q}(\\s*)<`, 'g'), `>$1{t('${e.schluessel}')}$2<`)
  inhalt = inhalt.replace(new RegExp(`((?:placeholder|aria-label|title|alt)=)["']${q}["']`, 'g'), `$1{t('${e.schluessel}')}`)
  if (inhalt !== vor) n++
}
writeFileSync(pfad, inhalt)
console.log(`${datei}: ${n}/${gefunden.length} kurze Texte ersetzt`)
