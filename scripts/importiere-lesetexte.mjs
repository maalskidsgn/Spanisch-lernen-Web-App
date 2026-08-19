// Holt die zweisprachigen Lesetexte von spanisch-lernen.com und legt
// sie als JSON unter public/lesetexte ab.
//
// Warum einzelne JSON-Dateien im Supabase-Speicher?
//
// Erstens die Groesse: Die Texte sind zusammen 2,1 MB. In die App
// gebuendelt wuerden sie bei JEDEM Seitenaufruf mitgeladen, auch
// wenn niemand einen Text liest. So holt der Browser genau den
// einen, den jemand oeffnet.
//
// Zweitens der Ort: Das GitHub-Repo ist oeffentlich. 920.000 Zeichen
// Buchzusammenfassungen dorthin zu legen hiesse, sie ein zweites Mal
// zu veroeffentlichen - bei ungeklaerter Rechtslage keine gute Idee.
// public/lesetexte steht deshalb in .gitignore; das Skript laedt
// nach dem Holen direkt in den Speicher hoch.
//
// Aufruf:
//   node scripts/importiere-lesetexte.mjs          Probelauf (5 Stueck)
//   node scripts/importiere-lesetexte.mjs --alle   alle 108

import { writeFileSync, mkdirSync, existsSync } from 'fs'

const ZIEL = 'public/lesetexte'
const QUELLE = 'https://spanisch-lernen.com/wp-json/wp/v2/spanische-texte'
const ALLE = process.argv.includes('--alle')

/** HTML-Entitaeten und Tags aus einem Textstueck entfernen. */
function nurText(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&(l|r)dquo;/g, '"')
    .replace(/&(l|r)squo;/g, '’')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Ist das Deutsch oder Spanisch?
 *
 * Wir zaehlen typische Funktionswoerter. Auf die Reihenfolge der
 * Reiter zu bauen waere zerbrechlich – wenn jemand die Seite einmal
 * umbaut, landet stillschweigend Deutsch im spanischen Feld.
 */
function sprache(text) {
  const t = ' ' + text.toLowerCase() + ' '
  const zaehle = (woerter) =>
    woerter.reduce((s, w) => s + (t.split(' ' + w + ' ').length - 1), 0)
  const de = zaehle(['der', 'die', 'das', 'und', 'ist', 'nicht', 'für', 'sich', 'ein', 'werden'])
  const es = zaehle(['el', 'la', 'los', 'las', 'que', 'para', 'con', 'una', 'más', 'como'])
  return es > de ? 'es' : 'de'
}

/** Alle Kapitelbloecke einer Seite herausloesen. */
function holeKapitel(html) {
  const bloecke = [...html.matchAll(
    /<section class="kapitel-block">([\s\S]*?)<\/section>/g
  )].map((m) => m[1])

  return bloecke.map((b) => {
    const label = b.match(/class="kapitel-label">([\s\S]*?)</)?.[1] ?? ''
    const titel = b.match(/class="kapitel-heading">([\s\S]*?)<\/h\d>/)?.[1] ?? ''
    const absaetze = [...b.matchAll(/class="kapitel-text">([\s\S]*?)<\/p>/g)]
      .map((m) => nurText(m[1]))
      .filter(Boolean)
    return { label: nurText(label), titel: nurText(titel), absaetze }
  })
}

async function hole(eintrag) {
  const res = await fetch(eintrag.link, { headers: { 'User-Agent': 'Habloo-Import' } })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const html = await res.text()

  const kapitel = holeKapitel(html)
  if (!kapitel.length) throw new Error('keine Kapitel gefunden')

  // Nach Sprache trennen und Doppelungen (Handy-/Desktop-Fassung)
  // ueber die Ueberschrift entfernen
  const nach = { es: [], de: [] }
  const gesehen = { es: new Set(), de: new Set() }
  for (const k of kapitel) {
    const sp = sprache(k.absaetze.join(' ') || k.titel)
    if (gesehen[sp].has(k.titel)) continue
    gesehen[sp].add(k.titel)
    nach[sp].push(k)
  }

  // Kapitel paaren: spanisch i gehoert zu deutsch i
  const paare = nach.es.map((es, i) => ({
    label: es.label,
    titel: es.titel,
    titelDe: nach.de[i]?.titel ?? '',
    absaetze: es.absaetze,
    absaetzeDe: nach.de[i]?.absaetze ?? [],
  }))

  return {
    slug: eintrag.slug,
    // Der Titel kommt spaeter aus titel.json, damit er sich aendern
    // laesst, ohne alles neu zu holen.
    titelOriginal: nurText(eintrag.title.rendered),
    quelle: eintrag.link,
    kapitel: paare,
    zeichen: paare.reduce((s, k) => s + k.absaetze.join(' ').length, 0),
  }
}

// ---- Los ----
const liste = []
for (const versatz of [0, 100]) {
  const r = await fetch(`${QUELLE}?per_page=100&offset=${versatz}&_fields=id,slug,link,title`)
  const teil = await r.json()
  if (Array.isArray(teil)) liste.push(...teil)
}
console.log(`${liste.length} Lesetexte gefunden`)

const arbeit = ALLE ? liste : liste.slice(0, 5)
if (!ALLE) console.log('Probelauf mit 5 – für alle: --alle\n')

mkdirSync(ZIEL, { recursive: true })
const index = []
let fehler = 0

for (const [i, e] of arbeit.entries()) {
  try {
    const daten = await hole(e)
    const ohneDe = daten.kapitel.filter((k) => !k.absaetzeDe.length).length
    writeFileSync(`${ZIEL}/${daten.slug}.json`, JSON.stringify(daten))
    index.push({
      slug: daten.slug,
      titel: daten.titelOriginal,
      kapitel: daten.kapitel.length,
      zeichen: daten.zeichen,
    })
    console.log(
      `✓ [${i + 1}/${arbeit.length}] ${daten.titelOriginal.slice(0, 42).padEnd(42)} ` +
      `${daten.kapitel.length} Kapitel` + (ohneDe ? `  (${ohneDe} ohne Deutsch)` : '')
    )
  } catch (f) {
    fehler++
    console.error(`✗ ${e.slug}: ${f.message}`)
  }
  await new Promise((w) => setTimeout(w, 250)) // die Seite nicht überrennen
}

if (ALLE) {
  writeFileSync(`${ZIEL}/index.json`, JSON.stringify(index, null, 1))
  console.log(`\nindex.json geschrieben: ${index.length} Texte, ${fehler} Fehler`)
}

// ---- In den Supabase-Speicher legen ----
// Nur mit --hochladen, damit ein Probelauf nichts veraendert.
if (ALLE && process.argv.includes('--hochladen')) {
  const { readFileSync, readdirSync } = await import('fs')
  for (const z of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = z.match(/^([A-Z_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
  const ziel = `${process.env.SUPABASE_URL}/storage/v1/object/lesetexte`
  const kopf = {
    apikey: process.env.SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'x-upsert': 'true',
  }
  let hoch = 0
  for (const f of readdirSync(ZIEL).filter((f) => f.endsWith('.json'))) {
    const r = await fetch(`${ziel}/${f}`, {
      method: 'POST', headers: kopf, body: readFileSync(`${ZIEL}/${f}`),
    })
    if (r.ok) hoch++
    else console.error(`✗ Upload ${f}: ${(await r.text()).slice(0, 90)}`)
  }
  console.log(`${hoch} Dateien im Speicher.`)
}
