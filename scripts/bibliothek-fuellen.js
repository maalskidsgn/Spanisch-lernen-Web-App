#!/usr/bin/env node
/**
 * Füllt die Habloo-Video-Bibliothek in Supabase.
 *
 * Läuft auf Manuels Mac (dort funktioniert yt-dlp), NICHT auf dem Server.
 * Holt zu jedem Video die Metadaten + das spanische Transkript und legt
 * beides in der Tabelle "videos" ab. Von dort lesen später alle Nutzer.
 *
 * Aufruf:  node scripts/bibliothek-fuellen.js
 *          node scripts/bibliothek-fuellen.js --neu    (vorhandene überschreiben)
 */

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readdir, rm, mkdtemp } from 'node:fs/promises'

const ausfuehren = promisify(execFile)

// ---------------------------------------------------------------
// Zugangsdaten aus .env.local lesen
// ---------------------------------------------------------------
const env = {}
for (const zeile of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const treffer = zeile.match(/^([A-Z_]+)=(.*)$/)
  if (treffer) env[treffer[1]] = treffer[2].trim()
}
const SUPABASE_URL = env.SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Fehlt: SUPABASE_URL / SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

const ueberschreiben = process.argv.includes('--neu')

// ---------------------------------------------------------------
// Die kuratierte Auswahl
// ---------------------------------------------------------------
// Bewusst nach Niveau sortiert: A1 = ganz langsam, B1 = normales Tempo.
// Neue Videos einfach unten anhängen und Skript erneut laufen lassen.
const AUSWAHL = [
  // A1 – ganz langsam gesprochen, für den Anfang
  { id: 'QkbiqHmFnXQ', niveau: 'A1', kategorie: 'geschichten' }, // Start With This Story
  { id: '5EIlaOWF5fw', niveau: 'A1', kategorie: 'alltag' },      // Survive a Long Flight
  { id: 'Hbu8HvhYj98', niveau: 'A1', kategorie: 'grundlagen' },  // Basic Conversation Practice
  { id: 'DAp_v7EH9AA', niveau: 'A1', kategorie: 'grundlagen' },  // 70 Basic Phrases

  // A2 – Straßeninterviews, natürliches Tempo
  { id: 'SCS1dJ35lig', niveau: 'A2', kategorie: 'gespraech' },   // What are you doing today?
  { id: '-J9IL3Evx5c', niveau: 'A2', kategorie: 'kultur' },      // Typical Spanish City Centre
  { id: 'Irhfx_Zj9sQ', niveau: 'A2', kategorie: 'grundlagen' },  // Talk About Yourself

  // B1 – längere Gespräche
  { id: 'mECAxJYzj0Y', niveau: 'B1', kategorie: 'gespraech' },   // Most Important Thing in Life
  { id: '5FYGP2Jd1XA', niveau: 'B1', kategorie: 'kultur' },      // Languages in Barcelona
  { id: 'nks_p67MAns', niveau: 'B1', kategorie: 'podcast' },     // Cómo aprender español
]

// ---------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------

/** Ruft die Supabase-REST-API auf (mit service_role, umgeht RLS). */
async function supabase(pfad, optionen = {}) {
  const antwort = await fetch(`${SUPABASE_URL}/rest/v1/${pfad}`, {
    ...optionen,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...optionen.headers,
    },
  })
  const text = await antwort.text()
  if (!antwort.ok) throw new Error(`Supabase ${antwort.status}: ${text.slice(0, 300)}`)
  return text ? JSON.parse(text) : null
}

/**
 * Prüft, ob das Video außerhalb von YouTube abgespielt werden darf.
 * Manche Kanäle verbieten das – der Player zeigt dann nur
 * "Video nicht verfügbar". Solche Videos gehören nicht in die Bibliothek.
 */
async function istEinbettbar(youtubeId) {
  const antwort = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`
  )
  return antwort.ok
}

/** Holt Titel, Kanal, Dauer und Vorschaubild. */
async function holeMetadaten(youtubeId) {
  const { stdout } = await ausfuehren('yt-dlp', [
    '--dump-json',
    '--no-warnings',
    '--skip-download',
    `https://www.youtube.com/watch?v=${youtubeId}`,
  ], { maxBuffer: 40 * 1024 * 1024 })

  const d = JSON.parse(stdout)
  return {
    titel: d.title,
    kanal: d.uploader ?? d.channel ?? null,
    dauer_sek: d.duration ?? null,
    thumbnail: d.thumbnail ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
  }
}

/**
 * Holt die spanischen Untertitel als Liste mit Zeitstempeln.
 * Format: [{ start: 1.2, dauer: 2.4, text: "Hola, ¿qué tal?" }, …]
 * Genau dieses Format braucht der Karaoke-Effekt in der App.
 */
async function holeTranskript(youtubeId) {
  const ordner = await mkdtemp(join(tmpdir(), 'habloo-'))
  try {
    await ausfuehren('yt-dlp', [
      '--write-sub', '--write-auto-sub',
      '--sub-lang', 'es,es-ES,es-419,es-MX',
      '--sub-format', 'json3',
      '--skip-download',
      '--no-warnings',
      '-o', join(ordner, '%(id)s.%(ext)s'),
      `https://www.youtube.com/watch?v=${youtubeId}`,
    ], { maxBuffer: 40 * 1024 * 1024 })

    const dateien = (await readdir(ordner)).filter((f) => f.endsWith('.json3'))
    if (!dateien.length) return []

    const roh = JSON.parse(readFileSync(join(ordner, dateien[0]), 'utf8'))

    return (roh.events ?? [])
      .filter((e) => e.segs)
      .map((e) => ({
        start: (e.tStartMs ?? 0) / 1000,
        dauer: (e.dDurationMs ?? 0) / 1000,
        text: e.segs.map((s) => s.utf8).join('').replace(/\s+/g, ' ').trim(),
      }))
      .filter((z) => z.text.length > 0)
  } finally {
    await rm(ordner, { recursive: true, force: true })
  }
}

// ---------------------------------------------------------------
// Hauptablauf
// ---------------------------------------------------------------
console.log(`\n📚 Habloo-Bibliothek füllen – ${AUSWAHL.length} Videos\n`)

// Was liegt schon in der Datenbank?
const vorhanden = new Set(
  (await supabase('videos?select=youtube_id')).map((v) => v.youtube_id)
)

let neu = 0, uebersprungen = 0, fehler = 0

for (const [i, video] of AUSWAHL.entries()) {
  const nr = `[${String(i + 1).padStart(2)}/${AUSWAHL.length}]`

  if (vorhanden.has(video.id) && !ueberschreiben) {
    console.log(`${nr} ⏭  ${video.id} – schon vorhanden`)
    uebersprungen++
    continue
  }

  try {
    process.stdout.write(`${nr} ⏳ ${video.id} … `)

    if (!(await istEinbettbar(video.id))) {
      console.log(`⚠️  Einbettung vom Kanal gesperrt – übersprungen`)
      uebersprungen++
      continue
    }

    const meta = await holeMetadaten(video.id)
    const transkript = await holeTranskript(video.id)

    if (transkript.length === 0) {
      console.log(`⚠️  kein spanisches Transkript – übersprungen`)
      uebersprungen++
      continue
    }

    await supabase('videos?on_conflict=youtube_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        youtube_id: video.id,
        niveau: video.niveau,
        kategorie: video.kategorie,
        transkript,
        ...meta,
      }),
    })

    const min = Math.round((meta.dauer_sek ?? 0) / 60)
    console.log(`✅ ${meta.titel.slice(0, 45)} · ${transkript.length} Zeilen · ${min} Min`)
    neu++
  } catch (fehlerObjekt) {
    console.log(`❌ ${String(fehlerObjekt.message).split('\n')[0].slice(0, 120)}`)
    fehler++
  }
}

console.log(`\n── Fertig: ${neu} neu · ${uebersprungen} übersprungen · ${fehler} Fehler`)

const gesamt = await supabase('videos?select=youtube_id,niveau&aktiv=eq.true')
console.log(`   Bibliothek enthält jetzt ${gesamt.length} Videos`)
const proNiveau = gesamt.reduce((acc, v) => ({ ...acc, [v.niveau]: (acc[v.niveau] ?? 0) + 1 }), {})
console.log(`   Verteilung: ${JSON.stringify(proNiveau)}\n`)
