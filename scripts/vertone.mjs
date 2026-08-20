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
const { SZENEN } = await import('../src/mitgehoert.js')

// Prüfsummen-Logik und Besetzung kommen aus dem gemeinsamen Modul –
// so KANN das Skript gar nicht auf einen anderen Dateinamen kommen
// als die App.
const { STIMMEN, sprechText, stimmeImDialog, dateiName, pruefsummeQuelle, BESETZUNG_STAND } =
  await import('../src/stimmen.js')

function audioName(text, stimme) {
  return dateiName(
    createHash('sha256').update(pruefsummeQuelle(text, stimme)).digest('hex')
  )
}

// Welche echte Stimme hinter welcher Rolle steckt, steht in
// scripts/besetzung.json – nicht hier im Code. So ist ein
// Rollenwechsel eine Datenaenderung, kein Eingriff ins Skript.
const BESETZUNG = JSON.parse(readFileSync('scripts/besetzung.json', 'utf8'))

// Erinnerung an die Regel aus src/stimmen.js: Wer die Besetzung
// aendert, MUSS dort BESETZUNG_STAND erhoehen - sonst behaelt jede
// Aufnahme ihren alten Dateinamen und wird nie neu erzeugt.
console.log(`Besetzungsstand ${BESETZUNG_STAND}: ` +
  Object.entries(BESETZUNG).filter(([k]) => !k.startsWith('_'))
    .map(([k, v]) => `${k}=${v.wer.split(' – ')[0]}`).join(', '))
const ELEVEN_STIMMEN = Object.fromEntries(
  Object.entries(BESETZUNG)
    .filter(([k]) => !k.startsWith('_'))
    .map(([k, v]) => [k, v.id])
)

// ---- Alle zu vertonenden Schnipsel einsammeln ----
const nurLektion = process.argv.includes('--lektion')
  ? process.argv[process.argv.indexOf('--lektion') + 1]
  : null

// Die Beispielsaetze sind mit Abstand der groesste Posten: 1.724
// Saetze, rund 47.600 Zeichen – mehr als Dialoge und Vokabeln
// zusammen. Mit --ohne-saetze bleiben sie erst mal die Geraetestimme.
const ohneSaetze = process.argv.includes('--ohne-saetze')

const auftraege = new Map() // name -> {text, stimme}
for (const l of LEKTIONEN) {
  if (nurLektion && l.id !== nurLektion) continue
  for (const it of l.items) {
    const teile = ohneSaetze ? [it.es] : [it.es, it.beispielEs]
    for (const text of teile.filter(Boolean)) {
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

// Die Hoerszenen. Sie stehen nicht in LEKTIONEN, brauchen aber
// dieselben Stimmen – und ohne Ton waeren sie schlicht nichts.
for (const szene of SZENEN) {
  if (nurLektion && szene.id !== nurLektion) continue
  for (const zeile of szene.dialog) {
    const stimme = stimmeImDialog(szene.dialog, zeile.sprecher)
    const name = audioName(zeile.es, stimme)
    auftraege.set(name, { text: sprechText(zeile.es), stimme, lektion: szene.id })
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

/**
 * Liegt die Datei schon im Speicher?
 *
 * Mit Wiederholung, und das ist kein Uebereifer: Der Lauf stellt
 * ueber 4.500 dieser Fragen, zwanzig gleichzeitig. Ein einziger
 * DNS-Aussetzer hat frueher den ganzen Durchlauf abgebrochen –
 * ENOTFOUND mitten in der Pruefung, nach einer Dreiviertelstunde
 * Arbeit. Ein Netzfehler ist keine Antwort, also wird nachgefragt.
 *
 * Nach drei Fehlversuchen gilt die Datei als fehlend. Das ist die
 * sichere Seite: Sie wird dann neu vertont – teurer als noetig,
 * aber nichts geht verloren.
 */
async function existiert(name, versuche = 3) {
  for (let n = 1; n <= versuche; n++) {
    try {
      const r = await fetch(`${ABLAGE}/audio/${name}`, { method: 'HEAD', headers: KOPF })
      return r.ok
    } catch (fehler) {
      if (n === versuche) {
        console.error(`\n  ! ${name}: ${fehler.cause?.code ?? fehler.message} – gilt als fehlend`)
        return false
      }
      await new Promise((f) => setTimeout(f, 500 * n))
    }
  }
}

/**
 * Was fehlt noch im Speicher?
 *
 * Nacheinander gefragt dauert das bei knapp 2.800 Schnipseln
 * mehrere Minuten – und das VOR der eigentlichen Arbeit. Zwanzig
 * Anfragen gleichzeitig sind fuer eine HEAD-Abfrage unproblematisch
 * und machen aus Minuten Sekunden.
 */
async function fehlendeFinden(alle, gleichzeitig = 20) {
  const liste = [...alle]
  const fehlt = []
  let i = 0
  async function arbeiter() {
    while (i < liste.length) {
      const [name, auftrag] = liste[i++]
      if (!(await existiert(name))) fehlt.push([name, auftrag])
    }
  }
  await Promise.all(Array.from({ length: gleichzeitig }, arbeiter))
  return fehlt
}

process.stdout.write('Pruefe, was schon im Speicher liegt … ')
const fehlend = await fehlendeFinden(auftraege)
console.log(`${fehlend.length} von ${auftraege.size} fehlen noch`)

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

/**
 * Einen Schnipsel vertonen – mit Geduld.
 *
 * Bei knapp 2.800 Aufrufen ist ein Aussetzer nicht die Ausnahme,
 * sondern sicher. Ohne Wiederholung fehlten am Ende einzelne
 * Aufnahmen, und man saehe es erst, wenn ein Nutzer auf den
 * Lautsprecher tippt. Bei 429 (zu schnell) und 5xx (Serverfehler)
 * also warten und noch einmal – bei allem anderen sofort aufgeben,
 * denn ein falscher Schluessel wird beim zweiten Mal nicht richtig.
 *
 * Ein Netzfehler (fetch failed, ENOTFOUND) zaehlt wie ein 5xx: Er
 * sagt nichts ueber die Anfrage aus, nur ueber die Leitung. Frueher
 * flog er als Ausnahme hoch und beendete den ganzen Lauf.
 */
async function vertone(text, stimmeId, versuche = 3) {
  for (let n = 1; n <= versuche; n++) {
    let antwort
    try {
      antwort = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${stimmeId}?output_format=mp3_44100_128`,
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
    } catch (fehler) {
      const grund = fehler.cause?.code ?? fehler.message
      if (n === versuche) return { fehler: `Netz: ${grund}` }
      console.log(`  … ${grund}, warte ${2 * n}s und versuche noch einmal`)
      await new Promise((f) => setTimeout(f, 2000 * n))
      continue
    }
    if (antwort.ok) return Buffer.from(await antwort.arrayBuffer())

    const wiederholbar = antwort.status === 429 || antwort.status >= 500
    if (!wiederholbar || n === versuche) {
      return { fehler: `${antwort.status} ${(await antwort.text()).slice(0, 200)}` }
    }
    const warten = 2000 * n
    console.log(`  … ${antwort.status}, warte ${warten / 1000}s und versuche noch einmal`)
    await new Promise((f) => setTimeout(f, warten))
  }
}

/**
 * Die fertige Aufnahme in den Speicher legen – ebenfalls mit Geduld.
 *
 * Hier haengt mehr dran als bei der Pruefung: Das Audio ist zu
 * diesem Zeitpunkt schon bezahlt. Geht der Upload verloren, ist das
 * Geld weg und die Datei trotzdem nicht da.
 */
async function hochladen(name, mp3, versuche = 3) {
  for (let n = 1; n <= versuche; n++) {
    try {
      const r = await fetch(`${ABLAGE}/audio/${name}`, {
        method: 'POST',
        headers: { ...KOPF, 'Content-Type': 'audio/mpeg' },
        body: mp3,
      })
      if (r.ok) return null
      if (n === versuche) return (await r.text()).slice(0, 200)
    } catch (fehler) {
      if (n === versuche) return fehler.cause?.code ?? fehler.message
    }
    await new Promise((f) => setTimeout(f, 1000 * n))
  }
}

let fertig = 0
const gescheitert = []
for (const [name, { text, stimme }] of fehlend) {
  const mp3 = await vertone(text, ELEVEN_STIMMEN[stimme])
  if (mp3?.fehler) {
    console.error(`✗ ${text.slice(0, 40)} – ElevenLabs: ${mp3.fehler}`)
    gescheitert.push(text)
    continue
  }

  const klage = await hochladen(name, mp3)
  if (klage) {
    console.error(`✗ Upload ${name}: ${klage}`)
    gescheitert.push(text)
    continue
  }
  fertig++
  console.log(`✓ [${fertig}/${fehlend.length}] ${text.slice(0, 50)}`)
  await new Promise((f) => setTimeout(f, 350)) // ElevenLabs nicht überrennen
}
console.log(`Fertig: ${fertig} von ${fehlend.length} vertont.`)
if (gescheitert.length) {
  console.log(`\n${gescheitert.length} nicht geschafft. Das Skript einfach noch einmal`)
  console.log('starten – was schon im Speicher liegt, wird uebersprungen.')
  for (const t of gescheitert.slice(0, 10)) console.log('  ' + t.slice(0, 60))
}
