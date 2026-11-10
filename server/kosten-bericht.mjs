// KI-Kosten je Nutzer und Bereich (10.11.2026)
//
//   node server/kosten-bericht.mjs            → laufender Monat
//   node server/kosten-bericht.mjs 2026-11    → bestimmter Monat
//
// Liest die Tabelle nutzung (art 'kosten' / 'kosten:<bereich>', anzahl =
// Millionstel Dollar), geschrieben von server/ki.js. Braucht SUPABASE_URL
// und SUPABASE_SERVICE_KEY (aus .env.local).
import fs from 'node:fs'

for (const datei of ['.env.local', '../.env.local']) {
  if (!fs.existsSync(datei)) continue
  for (const zeile of fs.readFileSync(datei, 'utf8').split('\n')) {
    const m = zeile.match(/^([A-Z_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}
const URL = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_KEY
const kopf = { apikey: KEY, Authorization: `Bearer ${KEY}` }
const monat = (process.argv[2] || new Date().toISOString().slice(0, 7)) + '-01'

const zeilen = await (await fetch(`${URL}/rest/v1/nutzung?select=nutzer_id,art,anzahl&tag=eq.${monat}&art=like.kosten*`, { headers: kopf })).json()
const konten = (await (await fetch(`${URL}/auth/v1/admin/users?per_page=1000`, { headers: kopf })).json()).users ?? []
const mail = new Map(konten.map((u) => [u.id, u.email]))
const dollar = (mikro) => (mikro / 1e6).toFixed(mikro < 1e5 ? 4 : 2) + ' $'

const jeNutzer = new Map(), jeBereich = new Map()
let summe = 0
for (const z of zeilen) {
  if (z.art === 'kosten') {
    jeNutzer.set(z.nutzer_id, (jeNutzer.get(z.nutzer_id) ?? 0) + z.anzahl)
    summe += z.anzahl
  } else {
    const b = z.art.slice(7)
    jeBereich.set(b, (jeBereich.get(b) ?? 0) + z.anzahl)
  }
}
console.log(`KI-Kosten ${monat.slice(0, 7)}: ${dollar(summe)} von ${jeNutzer.size} Nutzern (nur angemeldete Aufrufe)\n`)
console.log('Teuerste Nutzer:')
for (const [id, m] of [...jeNutzer].sort((a, b) => b[1] - a[1]).slice(0, 20)) console.log(`  ${dollar(m).padStart(9)}  ${mail.get(id) ?? id}`)
console.log('\nNach Bereich:')
for (const [b, m] of [...jeBereich].sort((a, b) => b[1] - a[1])) console.log(`  ${dollar(m).padStart(9)}  ${b}`)
