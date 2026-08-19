// Vertont alle Lektionen mit ElevenLabs und legt die MP3s in den
// Supabase-Speicher – unter GENAU dem Namen, den auch die App
// berechnet (Prüfsumme aus Stimme + gesäubertem Text).
//
// Aufruf:
//   node scripts/vertone.mjs           → Probelauf: zeigt nur, was fehlt
//   node scripts/vertone.mjs --los     → erzeugt und lädt wirklich hoch
//   node scripts/vertone.mjs --lektion cafe --los   → nur eine Lektion
//
// Braucht in .env.local:
//   ELEVENLABS_API_KEY   (fehlt er, geht nur der Probelauf)
//   SUPABASE_URL + SUPABASE_SERVICE_KEY (vorhanden)

import { readFileSync } from 'fs'
import { createHash } from 'crypto'

for (const z of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = z.match(/^([A-Z_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}

const { LEKTIONEN } = await import('../src/lektionen.js')

// ---- MUSS mit src/audio.js übereinstimmen ----
const STIMMEN = { standard: 'es-a', rolleA: 'es-a', rolleB: 'es-b' }

function sprechText(text) {
  return String(text)
    .replace(/\s*\/\s*/g, ', ')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/…/g, '')
    .trim()
}

function audioName(text, stimme) {
  return (
    createHash('sha256')
      .update(stimme + '|' + sprechText(text))
      .digest('hex')
      .slice(0, 24) + '.mp3'
  )
}

function stimmeImDialog(dialog, sprecher) {
  return sprecher === dialog[0]?.sprecher ? STIMMEN.rolleA : STIMMEN.rolleB
}
// ---- Ende der geteilten Logik ----

// Welche echte ElevenLabs-Stimme hinter welcher Kennung steckt.
// Die IDs stammen aus der ElevenLabs-Bibliothek und werden hier
// FEST verdrahtet, damit Ana in Lektion 12 wie in Lektion 1 klingt.
const ELEVEN_STIMMEN = {
  'es-a': null, // TODO: Voice-ID eintragen, z.B. weibliche Stimme (Spanien)
  'es-b': null, // TODO: Voice-ID eintragen, z.B. männliche Stimme (Lateinamerika)
}

// ---- Alle zu vertonenden Schnipsel einsammeln ----
const nurLektion = process.argv.includes('--lektion')
  ? process.argv[process.argv.indexOf('--lektion') + 1]
  : null

const auftraege = new Map() // name -> {text, stimme}
for (const l of LEKTIONEN) {
  if (nurLektion && l.id !== nurLektion) continue
  for (const it of l.items) {
    for (const text of [it.es, it.beispielEs].filter(Boolean)) {
      const name = audioName(text, STIMMEN.standard)
      auftraege.set(name, { text: sprechText(text), stimme: STIMMEN.standard, lektion: l.id })
    }
  }
  for (const zeile of l.dialog ?? []) {
    const stimme = stimmeImDialog(l.dialog, zeile.sprecher)
    const name = audioName(zeile.es, stimme)
    auftraege.set(name, { text: sprechText(zeile.es), stimme, lektion: l.id })
  }
}

const zeichen = [...auftraege.values()].reduce((s, a) => s + a.text.length, 0)
console.log(`${auftraege.size} Schnipsel, ${zeichen} Zeichen` + (nurLektion ? ` (nur ${nurLektion})` : ''))

// ---- Was liegt schon im Speicher? ----
const ABLAGE = `${process.env.SUPABASE_URL}/storage/v1/object`
const KOPF = {
  apikey: process.env.SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
}

async function existiert(name) {
  const r = await fetch(`${ABLAGE}/audio/${name}`, { method: 'HEAD', headers: KOPF })
  return r.ok
}

const fehlend = []
for (const [name, auftrag] of auftraege) {
  if (!(await existiert(name))) fehlend.push([name, auftrag])
}
console.log(`${fehlend.length} davon fehlen noch`)

if (!process.argv.includes('--los')) {
  const kosten = fehlend.reduce((s, [, a]) => s + a.text.length, 0)
  console.log(`Probelauf beendet. Mit --los würden ${kosten} Zeichen vertont.`)
  process.exit(0)
}

// ---- Wirklich vertonen ----
if (!process.env.ELEVENLABS_API_KEY) {
  console.error('ELEVENLABS_API_KEY fehlt in .env.local – nur Probelauf möglich.')
  process.exit(1)
}
for (const [kennung, id] of Object.entries(ELEVEN_STIMMEN)) {
  if (!id) {
    console.error(`Für "${kennung}" ist noch keine ElevenLabs-Voice-ID eingetragen (oben im Skript).`)
    process.exit(1)
  }
}

let fertig = 0
for (const [name, { text, stimme }] of fehlend) {
  const antwort = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_STIMMEN[stimme]}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.55, similarity_boost: 0.8 },
      }),
    }
  )
  if (!antwort.ok) {
    console.error(`✗ ${text.slice(0, 40)} – ElevenLabs: ${antwort.status} ${await antwort.text()}`)
    continue
  }
  const mp3 = Buffer.from(await antwort.arrayBuffer())

  const hochladen = await fetch(`${ABLAGE}/audio/${name}`, {
    method: 'POST',
    headers: { ...KOPF, 'Content-Type': 'audio/mpeg' },
    body: mp3,
  })
  if (!hochladen.ok) {
    console.error(`✗ Upload ${name}: ${await hochladen.text()}`)
    continue
  }
  fertig++
  console.log(`✓ [${fertig}/${fehlend.length}] ${text.slice(0, 50)}`)
  await new Promise((f) => setTimeout(f, 350)) // ElevenLabs nicht überrennen
}
console.log(`Fertig: ${fertig} von ${fehlend.length} vertont.`)
