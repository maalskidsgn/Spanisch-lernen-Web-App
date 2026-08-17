#!/usr/bin/env node
/**
 * Füllt die Video-Bibliothek mit Themen-Videos.
 *
 * Idee: Man lernt Spanisch nebenbei, während man etwas Interessantes
 * schaut – Gesundheit, Sport, Ernährung, Produktivität, Stoizismus.
 *
 * Das Skript sucht pro Kategorie, prüft jeden Treffer auf
 * Einbettbarkeit und spanische Untertitel und legt die brauchbaren ab.
 *
 * Aufruf:  node scripts/bibliothek-themen.js
 */

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readdir, rm, mkdtemp } from 'node:fs/promises'

const ausfuehren = promisify(execFile)

const env = {}
for (const zeile of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const t = zeile.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (t) env[t[1]] = t[2].trim()
}
const SUPABASE_URL = env.SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY

// ---------------------------------------------------------------
//  Die Kategorien mit ihren Suchanfragen
// ---------------------------------------------------------------
const KATEGORIEN = [
  {
    name: 'gesundheit',
    ziel: 5,
    suchen: [
      'beneficios de dejar el alcohol salud',
      'como mejorar tu salud habitos español',
      'dormir mejor consejos científicos español',
      'salud mental consejos psicólogo español',
    ],
  },
  {
    name: 'sport',
    ziel: 5,
    suchen: [
      'beneficios del ejercicio para el cerebro español',
      'como empezar a correr principiantes español',
      'entrenamiento fuerza explicado español',
      'deporte y salud mental español',
    ],
  },
  {
    name: 'ernaehrung',
    ziel: 5,
    suchen: [
      'alimentación saludable explicado español',
      'que comer para tener energía español',
      'azúcar efectos en el cuerpo español',
      'ayuno intermitente explicado español',
    ],
  },
  {
    name: 'produktivitaet',
    ziel: 5,
    suchen: [
      'productividad hábitos español',
      'como organizar tu día productivo español',
      'dejar de procrastinar consejos español',
      'gestión del tiempo método español',
    ],
  },
  {
    name: 'stoizismus',
    ziel: 5,
    suchen: [
      'estoicismo para principiantes español',
      'marco aurelio meditaciones lecciones español',
      'filosofía estoica vida diaria español',
      'séneca sobre la brevedad de la vida español',
    ],
  },
  {
    name: 'psychologie',
    ziel: 5,
    suchen: [
      'como crear buenos hábitos psicología español',
      'inteligencia emocional explicado español',
      'motivación y disciplina psicología español',
      'aprender más rápido técnicas español',
    ],
  },
]

const MIN_SEK = 180    // kürzer als 3 Minuten lohnt sich kaum
const MAX_SEK = 1500   // länger als 25 Minuten schreckt ab

// ---------------------------------------------------------------
//  Hilfsfunktionen
// ---------------------------------------------------------------

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
  if (!antwort.ok) throw new Error(`Supabase ${antwort.status}: ${text.slice(0, 200)}`)
  return text ? JSON.parse(text) : null
}

async function suche(anfrage, anzahl = 12) {
  const { stdout } = await ausfuehren(
    'yt-dlp',
    [`ytsearch${anzahl}:${anfrage}`, '--flat-playlist', '-J', '--no-warnings'],
    { maxBuffer: 60 * 1024 * 1024 }
  )
  return (JSON.parse(stdout).entries ?? [])
    .filter((e) => e.id && e.title && e.duration >= MIN_SEK && e.duration <= MAX_SEK)
    .map((e) => ({
      id: e.id,
      titel: e.title,
      kanal: e.channel ?? e.uploader ?? null,
      dauer_sek: Math.round(e.duration),
      thumbnail: `https://i.ytimg.com/vi/${e.id}/hqdefault.jpg`,
    }))
}

async function istEinbettbar(id) {
  try {
    const a = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
    )
    return a.ok
  } catch {
    return false
  }
}

/** Holt spanische Untertitel mit Zeitstempeln (leer = unbrauchbar). */
async function holeTranskript(id) {
  const ordner = await mkdtemp(join(tmpdir(), 'habloo-'))
  try {
    await ausfuehren(
      'yt-dlp',
      [
        '--write-sub', '--write-auto-sub',
        '--sub-lang', 'es,es-ES,es-419,es-MX',
        '--sub-format', 'json3',
        '--skip-download', '--no-warnings',
        '-o', join(ordner, '%(id)s.%(ext)s'),
        `https://www.youtube.com/watch?v=${id}`,
      ],
      { maxBuffer: 60 * 1024 * 1024 }
    )
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
  } catch {
    return []
  } finally {
    await rm(ordner, { recursive: true, force: true })
  }
}

// ---------------------------------------------------------------
//  Hauptablauf
// ---------------------------------------------------------------
console.log('\n📚 Themen-Videos für die Habloo-Bibliothek\n')

const vorhanden = new Set(
  (await supabase('videos?select=youtube_id')).map((v) => v.youtube_id)
)
console.log(`   ${vorhanden.size} Videos sind schon da\n`)

let gesamtNeu = 0

for (const kategorie of KATEGORIEN) {
  console.log(`── ${kategorie.name.toUpperCase()}`)
  let genommen = 0

  for (const anfrage of kategorie.suchen) {
    if (genommen >= kategorie.ziel) break

    let treffer = []
    try {
      treffer = await suche(anfrage)
    } catch (f) {
      console.log(`   Suche fehlgeschlagen: ${String(f.message).slice(0, 60)}`)
      continue
    }

    for (const video of treffer) {
      if (genommen >= kategorie.ziel) break
      if (vorhanden.has(video.id)) continue

      if (!(await istEinbettbar(video.id))) continue

      const transkript = await holeTranskript(video.id)
      // Zu wenige Zeilen heißt meist: nur Musik oder kaputte Untertitel
      if (transkript.length < 25) continue

      try {
        await supabase('videos?on_conflict=youtube_id', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify({
            youtube_id: video.id,
            titel: video.titel,
            kanal: video.kanal,
            dauer_sek: video.dauer_sek,
            thumbnail: video.thumbnail,
            niveau: 'B1',
            kategorie: kategorie.name,
            transkript,
          }),
        })
        vorhanden.add(video.id)
        genommen++
        gesamtNeu++
        const min = Math.round(video.dauer_sek / 60)
        console.log(`   ✅ ${video.titel.slice(0, 52)} · ${min} Min · ${transkript.length} Zeilen`)
      } catch (f) {
        console.log(`   ❌ ${String(f.message).slice(0, 70)}`)
      }
    }
  }

  if (genommen < kategorie.ziel) {
    console.log(`   (nur ${genommen} von ${kategorie.ziel} gefunden)`)
  }
  console.log()
}

// Die alten Sprachlern-Videos unter einer Kategorie zusammenfassen,
// damit die Filterleiste übersichtlich bleibt.
for (const alt of ['grundlagen', 'alltag', 'gespraech', 'kultur', 'geschichten', 'podcast']) {
  await supabase(`videos?kategorie=eq.${alt}`, {
    method: 'PATCH',
    body: JSON.stringify({ kategorie: 'sprache' }),
  }).catch(() => {})
}

const alle = await supabase('videos?select=kategorie&aktiv=eq.true')
const proKategorie = alle.reduce((a, v) => ({ ...a, [v.kategorie]: (a[v.kategorie] ?? 0) + 1 }), {})
console.log(`── Fertig: ${gesamtNeu} neu · ${alle.length} Videos gesamt`)
console.log('   ' + JSON.stringify(proKategorie) + '\n')
