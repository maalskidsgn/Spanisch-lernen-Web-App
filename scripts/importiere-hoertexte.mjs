// Holt die Podcast-Folgen von spanisch-lernen.com – Text, deutsche
// Fassung, markierte Vokabeln und die MP3.
//
// Der Knackpunkt ist das Finden des Fliesstextes. Die Reiter der
// Seite haben wechselnde Kennungen, taugen also nicht als Anker. Was
// stabil ist: Ein Artikeltext steht in einem langen ZUSAMMENHAENGENDEN
// Block langer Absaetze, waehrend Menue, Fusszeile und Werbung
// verstreute Einzelabsaetze sind. Wir suchen deshalb den laengsten
// zusammenhaengenden Block je Sprache.
//
// Aufruf:
//   node scripts/importiere-hoertexte.mjs             Probelauf (5)
//   node scripts/importiere-hoertexte.mjs --alle       alle
//   node scripts/importiere-hoertexte.mjs --alle --hochladen

import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'fs'

const ZIEL = 'public/hoertexte'
const QUELLE = 'https://spanisch-lernen.com/wp-json/wp/v2/podcast'
const ALLE = process.argv.includes('--alle')

function nurText(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&(l|r)dquo;/g, '"').replace(/&(l|r)squo;/g, '’')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function sprache(text) {
  const t = ' ' + text.toLowerCase() + ' '
  const z = (w) => w.reduce((s, x) => s + (t.split(' ' + x + ' ').length - 1), 0)
  const de = z(['der', 'die', 'das', 'und', 'ist', 'nicht', 'für', 'sich', 'ein', 'werden'])
  const es = z(['el', 'la', 'los', 'las', 'que', 'para', 'con', 'una', 'más', 'como'])
  return es > de ? 'es' : 'de'
}

/** Der laengste zusammenhaengende Block einer Sprache – mit Startpunkt. */
function laengsterBlock(absaetze, welche, ab = 0) {
  let besterA = 0, besteLaenge = 0, a = 0, laenge = 0
  for (let i = ab; i <= absaetze.length; i++) {
    if (i < absaetze.length && absaetze[i].sprache === welche) {
      if (laenge === 0) a = i
      laenge++
    } else {
      if (laenge > besteLaenge) { besteLaenge = laenge; besterA = a }
      laenge = 0
    }
  }
  return { a: besterA, stuecke: absaetze.slice(besterA, besterA + besteLaenge) }
}

async function hole(eintrag) {
  const res = await fetch(eintrag.link, { headers: { 'User-Agent': 'Habloo-Import' } })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const html = await res.text()

  // Skripte und Stile raus, sonst landen CSS-Schnipsel im Text
  const sauber = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, '')

  const absaetze = [...sauber.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => ({ roh: m[1], text: nurText(m[1]) }))
    .filter((p) => p.text.length > 80)
    .map((p) => ({ ...p, sprache: sprache(p.text) }))

  // Doppelungen entfernen: Elementor legt den Inhalt zweimal ins
  // HTML – einmal fuer Handy, einmal fuer Desktop. Ohne das kaeme
  // jeder Absatz doppelt in den Text.
  const gesehen = new Set()
  const einmalig = absaetze.filter((p) => {
    if (gesehen.has(p.text)) return false
    gesehen.add(p.text)
    return true
  })

  const spanisch = laengsterBlock(einmalig, 'es')
  const es = spanisch.stuecke
  if (es.length < 3) throw new Error('kein spanischer Text gefunden')

  // Die deutsche Fassung steht im Reiter direkt NACH der spanischen.
  // Nur den laengsten deutschen Block zu nehmen reichte nicht: Menue
  // und Fusszeile sind ebenfalls deutsch und haengen sich an. Deshalb
  // erst ab dem Ende des spanischen Textes suchen – und hoechstens so
  // viele Absaetze, wie die Vorlage hat.
  const de = laengsterBlock(einmalig, 'de', spanisch.a + es.length)
    .stuecke.slice(0, es.length)

  // Die im Text fett markierten Woerter sind die Lernvokabeln.
  // Uebersetzungen stehen auf der Seite nicht dabei.
  const vokabeln = [...new Set(
    es.flatMap((p) => [...p.roh.matchAll(/<strong[^>]*>([\s\S]*?)<\/strong>/g)]
      .map((m) => nurText(m[1]))
      .filter((w) => w && w.length < 40 && !/^\d/.test(w)))
  )]

  const audio = sauber.match(/https:\/\/spanisch-lernen\.com\/wp-content\/uploads\/[^"'<> ]+\.mp3/)?.[0] ?? null

  return {
    slug: eintrag.slug,
    titelOriginal: nurText(eintrag.title.rendered),
    quelle: eintrag.link,
    audio,
    absaetze: es.map((p) => p.text),
    absaetzeDe: de.map((p) => p.text),
    vokabeln,
    zeichen: es.reduce((s, p) => s + p.text.length, 0),
  }
}

// ---- Los ----
const liste = []
for (const versatz of [0, 100]) {
  const r = await fetch(`${QUELLE}?per_page=100&offset=${versatz}&_fields=id,slug,link,title`)
  const teil = await r.json()
  if (Array.isArray(teil)) liste.push(...teil)
}
console.log(`${liste.length} Hörtexte gefunden`)

const arbeit = ALLE ? liste : liste.slice(0, 5)
if (!ALLE) console.log('Probelauf mit 5 – für alle: --alle\n')

mkdirSync(ZIEL, { recursive: true })
const index = []
let fehler = 0

for (const [i, e] of arbeit.entries()) {
  try {
    const d = await hole(e)
    writeFileSync(`${ZIEL}/${d.slug}.json`, JSON.stringify(d))
    index.push({
      slug: d.slug, titel: d.titelOriginal, audio: Boolean(d.audio),
      absaetze: d.absaetze.length, vokabeln: d.vokabeln.length, zeichen: d.zeichen,
    })
    console.log(
      `✓ [${i + 1}/${arbeit.length}] ${d.titelOriginal.slice(0, 40).padEnd(40)} ` +
      `${String(d.absaetze.length).padStart(2)} Abs · ${String(d.vokabeln.length).padStart(3)} Vok` +
      (d.audio ? '' : '  OHNE AUDIO') +
      (d.absaetzeDe.length !== d.absaetze.length ? `  (DE: ${d.absaetzeDe.length})` : '')
    )
  } catch (f) {
    fehler++
    console.error(`✗ ${e.slug}: ${f.message}`)
  }
  await new Promise((w) => setTimeout(w, 250))
}

if (ALLE) {
  writeFileSync(`${ZIEL}/index.json`, JSON.stringify(index, null, 1))
  console.log(`\nindex.json: ${index.length} Texte, ${fehler} Fehler`)

  if (process.argv.includes('--hochladen')) {
    for (const z of readFileSync('.env.local', 'utf8').split('\n')) {
      const m = z.match(/^([A-Z_]+)=(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
    }
    const ziel = `${process.env.SUPABASE_URL}/storage/v1/object/hoertexte`
    const kopf = {
      apikey: process.env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json', 'x-upsert': 'true',
    }
    let hoch = 0
    for (const f of readdirSync(ZIEL).filter((f) => f.endsWith('.json'))) {
      const r = await fetch(`${ziel}/${f}`, { method: 'POST', headers: kopf,
        body: readFileSync(`${ZIEL}/${f}`) })
      if (r.ok) hoch++
      else console.error(`✗ Upload ${f}: ${(await r.text()).slice(0, 90)}`)
    }
    console.log(`${hoch} Dateien im Speicher.`)
  }
}
