// Stimmen-Casting: Kandidaten anhören und vergleichen, BEVOR der
// ganze Kurs vertont wird.
//
// Warum ein eigenes Werkzeug? Eine Stimme, die bei "Hola" nett
// klingt, kann bei einem ganzen Dialog nerven. Und ein Wechsel
// später bedeutet: alle Aufnahmen neu erzeugen. Also erst hören,
// dann entscheiden.
//
// Aufruf:
//   node scripts/stimmen.mjs liste     → welche Stimmen gibt es?
//   node scripts/stimmen.mjs proben    → Hörproben erzeugen
//   node scripts/stimmen.mjs kosten    → was würde der Kurs kosten?

import { readFileSync, writeFileSync, mkdirSync } from 'fs'

for (const z of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = z.match(/^([A-Z_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}

const KEY = process.env.ELEVENLABS_API_KEY
if (!KEY) {
  console.error('ELEVENLABS_API_KEY fehlt in .env.local')
  process.exit(1)
}

const ORDNER = 'stimmen-proben'
const MODELL = 'eleven_multilingual_v2'

/**
 * Die Sätze, mit denen wir jede Kandidatin prüfen.
 *
 * Bewusst echte Zeilen aus dem Kurs, keine Kunstsätze: eine
 * Begrüßung, ein Satz mit den schwierigen Lauten (j, rr, ll) und
 * eine Frage – am Fragesatz hört man, ob die Betonung stimmt.
 */
const PROBEN = [
  { name: '1-begruessung', text: 'Hola, buenos días. ¿Qué tal estás?' },
  { name: '2-laute', text: 'El perro corre por la calle y el trabajo empieza a las nueve.' },
  { name: '3-frage', text: '¿De dónde eres? Yo soy de Madrid, pero vivo en Valencia.' },
  { name: '4-langsam', text: 'Re-pi-te por favor: me lla-mo Ana.' },
]

/** Fehler von ElevenLabs in verständliches Deutsch übersetzen. */
async function pruefeAntwort(r) {
  if (r.ok) return null
  let d = {}
  try { d = JSON.parse(await r.text()) } catch { /* kein JSON */ }
  const code = d?.detail?.code
  if (code === 'paid_plan_required')
    return 'Der kostenlose Tarif darf die Bibliotheks-Stimmen nicht über die\n' +
           'Schnittstelle nutzen. Dafür braucht es den Starter-Tarif (5 $/Monat).'
  if (d?.detail?.status === 'missing_permissions')
    return 'Dem Schlüssel fehlt eine Berechtigung: ' +
           (d.detail.message.match(/permission (\w+)/)?.[1] ?? '?') +
           '\nIn ElevenLabs unter Profil → API Keys den Schlüssel bearbeiten.'
  return `ElevenLabs antwortet mit ${r.status}: ${d?.detail?.message ?? ''}`
}

async function holeStimmen() {
  const r = await fetch('https://api.elevenlabs.io/v2/voices?page_size=100', {
    headers: { 'xi-api-key': KEY },
  })
  const fehler = await pruefeAntwort(r)
  if (fehler) { console.error('\n' + fehler + '\n'); process.exit(1) }
  return (await r.json()).voices ?? []
}

/** Klingt diese Stimme nach Spanisch? */
function istSpanisch(v) {
  const l = v.labels ?? {}
  const text = JSON.stringify(l).toLowerCase() + ' ' + (v.name ?? '').toLowerCase()
  return /spanish|espa|castil|latin|mexic|colomb|argent/.test(text) ||
    v.verified_languages?.some((s) => s.language === 'es')
}

const befehl = process.argv[2] ?? 'liste'

// ---------------------------------------------------------------
if (befehl === 'liste') {
  const alle = await holeStimmen()
  const spanisch = alle.filter(istSpanisch)
  console.log(`\n${alle.length} Stimmen im Konto, davon ${spanisch.length} spanischsprachig.\n`)
  for (const v of (spanisch.length ? spanisch : alle)) {
    const l = v.labels ?? {}
    console.log(
      `  ${v.voice_id}  ${(v.name ?? '').padEnd(18)} ` +
      `${(l.gender ?? '?').padEnd(8)} ${(l.accent ?? l.descriptive ?? '').padEnd(14)} ${l.age ?? ''}`
    )
  }
  console.log('\nZum Anhören:  node scripts/stimmen.mjs proben\n')
}

// ---------------------------------------------------------------
if (befehl === 'proben') {
  const alle = await holeStimmen()
  const kandidaten = alle.filter(istSpanisch).slice(0, 8)
  if (!kandidaten.length) {
    console.error('Keine spanischen Stimmen gefunden.')
    process.exit(1)
  }

  mkdirSync(ORDNER, { recursive: true })
  const zeichen = PROBEN.reduce((s, p) => s + p.text.length, 0) * kandidaten.length
  console.log(`${kandidaten.length} Stimmen × ${PROBEN.length} Sätze = ${zeichen} Zeichen\n`)

  const fertig = []
  for (const v of kandidaten) {
    const dateien = []
    for (const probe of PROBEN) {
      const r = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${v.voice_id}?output_format=mp3_44100_128`,
        {
          method: 'POST',
          headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: probe.text,
            model_id: MODELL,
            voice_settings: { stability: 0.55, similarity_boost: 0.8 },
          }),
        }
      )
      const fehler = await pruefeAntwort(r)
      if (fehler) { console.error('\n' + fehler + '\n'); process.exit(1) }
      const datei = `${v.voice_id}_${probe.name}.mp3`
      writeFileSync(`${ORDNER}/${datei}`, Buffer.from(await r.arrayBuffer()))
      dateien.push({ ...probe, datei })
      await new Promise((f) => setTimeout(f, 300))
    }
    fertig.push({ v, dateien })
    console.log(`✓ ${v.name}`)
  }

  writeFileSync(`${ORDNER}/index.html`, baueSeite(fertig))
  console.log(`\nFertig. Zum Anhören öffnen:  ${ORDNER}/index.html\n`)
}

// ---------------------------------------------------------------
if (befehl === 'kosten') {
  const { LEKTIONEN } = await import('../src/lektionen.js')
  const { sprechText } = await import('../src/stimmen.js')
  let zeichen = 0, schnipsel = 0
  const gesehen = new Set()
  for (const l of LEKTIONEN) {
    for (const it of l.items)
      for (const t of [it.es, it.beispielEs].filter(Boolean)) {
        if (gesehen.has(t)) continue
        gesehen.add(t); zeichen += sprechText(t).length; schnipsel++
      }
    for (const z of l.dialog ?? []) {
      if (gesehen.has(z.es)) continue
      gesehen.add(z.es); zeichen += sprechText(z.es).length; schnipsel++
    }
  }
  const proLektion = Math.round(zeichen / LEKTIONEN.length)
  console.log(`
  ${LEKTIONEN.length} Lektionen
  ${schnipsel} Schnipsel, ${zeichen.toLocaleString('de')} Zeichen
  ≈ ${proLektion.toLocaleString('de')} Zeichen je Lektion

  Hochgerechnet auf 150 Lektionen: ${(proLektion * 150).toLocaleString('de')} Zeichen.

  Tarife (Stand heute):
    Free     10.000 Zeichen/Monat – Bibliotheks-Stimmen NICHT über die API
    Starter   30.000 Zeichen/Monat   5 $
    Creator  100.000 Zeichen/Monat  22 $
`)
}

function baueSeite(fertig) {
  return `<!doctype html><meta charset="utf-8">
<title>Stimmen-Casting</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 60rem; margin: 3rem auto;
         padding: 0 1.5rem; line-height: 1.6; color: #1c1b1a; }
  h1 { font-size: 1.6rem; margin-bottom: .3rem; }
  p.hin { color: #756a5c; margin-top: 0; }
  .stimme { border: 1px solid #e6e1d8; border-radius: 14px;
            padding: 1.1rem 1.3rem; margin: 1rem 0; }
  .kopf { display: flex; align-items: baseline; gap: .8rem; flex-wrap: wrap; }
  .kopf b { font-size: 1.1rem; }
  .kopf span { color: #756a5c; font-size: .85rem; }
  code { background: #f5f2ec; padding: .15rem .45rem; border-radius: 5px;
         font-size: .8rem; }
  .zeile { display: grid; grid-template-columns: 9rem 1fr; gap: .8rem;
           align-items: center; margin-top: .6rem; }
  .zeile small { color: #756a5c; }
  audio { width: 100%; }
</style>
<h1>Stimmen-Casting</h1>
<p class="hin">Vier echte Kurssätze je Stimme. Achte auf Satz 2 (die
schwierigen Laute) und Satz 3 (Fragebetonung).</p>
${fertig.map(({ v, dateien }) => `
<div class="stimme">
  <div class="kopf">
    <b>${v.name}</b>
    <span>${v.labels?.gender ?? ''} · ${v.labels?.accent ?? v.labels?.descriptive ?? ''} · ${v.labels?.age ?? ''}</span>
    <code>${v.voice_id}</code>
  </div>
  ${dateien.map((d) => `
  <div class="zeile">
    <small>${d.text.slice(0, 34)}…</small>
    <audio controls preload="none" src="${d.datei}"></audio>
  </div>`).join('')}
</div>`).join('')}
`
}
