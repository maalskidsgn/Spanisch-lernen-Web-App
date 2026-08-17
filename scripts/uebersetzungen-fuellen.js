#!/usr/bin/env node
/**
 * Übersetzt die Transkripte der Bibliotheks-Videos einmalig ins Deutsche
 * und legt sie in der Spalte "transkript_de" ab.
 *
 * Dadurch erscheint die Übersetzung in der App sofort beim Umschalten,
 * statt bei jedem Nutzer neu geladen zu werden.
 *
 * Aufruf:  node scripts/uebersetzungen-fuellen.js
 *          node scripts/uebersetzungen-fuellen.js --neu   (alle neu übersetzen)
 */

import { readFileSync } from 'node:fs'

const env = {}
for (const zeile of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const t = zeile.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (t) env[t[1]] = t[2].trim()
}
const URL_BASIS = env.SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_KEY
const alleNeu = process.argv.includes('--neu')

const kopf = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
}

const warte = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Übersetzt mehrere Zeilen auf einmal über den Google-Endpunkt.
 * Die Zeilen werden mit Zeilenumbrüchen verbunden – so bleibt der
 * Zusammenhang erhalten und es sind viel weniger Anfragen nötig.
 */
async function uebersetzePaket(zeilen) {
  const text = zeilen.join('\n')
  const antwort = await fetch(
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=de&dt=t&q=' +
      encodeURIComponent(text)
  )
  if (!antwort.ok) throw new Error('Übersetzer antwortet mit ' + antwort.status)

  const daten = await antwort.json()
  const ganz = (daten?.[0] ?? []).map((s) => s?.[0] ?? '').join('')
  const teile = ganz.split('\n').map((s) => s.trim())

  // Passt die Zeilenzahl nicht, lieber einzeln übersetzen als falsch zuordnen
  if (teile.length !== zeilen.length) return null
  return teile
}

async function uebersetzeAlle(zeilen) {
  const ergebnis = []
  const PAKET = 20

  for (let i = 0; i < zeilen.length; i += PAKET) {
    const stueck = zeilen.slice(i, i + PAKET)
    let uebersetzt = null

    try {
      uebersetzt = await uebersetzePaket(stueck)
    } catch {
      uebersetzt = null
    }

    if (!uebersetzt) {
      // Rückfall: Zeile für Zeile
      uebersetzt = []
      for (const z of stueck) {
        try {
          const einzeln = await uebersetzePaket([z])
          uebersetzt.push(einzeln?.[0] ?? '')
        } catch {
          uebersetzt.push('')
        }
        await warte(120)
      }
    }

    ergebnis.push(...uebersetzt)
    await warte(220) // freundlich zum Übersetzungsdienst bleiben
  }
  return ergebnis
}

// ---------------------------------------------------------------
console.log('\n🇩🇪 Transkripte übersetzen\n')

const filter = alleNeu ? '' : '&transkript_de=is.null'
const videos = await (
  await fetch(
    `${URL_BASIS}/rest/v1/videos?select=id,youtube_id,titel,transkript&aktiv=eq.true${filter}`,
    { headers: kopf }
  )
).json()

console.log(`   ${videos.length} Videos zu übersetzen\n`)

let fertig = 0
for (const [i, video] of videos.entries()) {
  const zeilen = (video.transkript ?? []).map((z) => z.text)
  if (!zeilen.length) continue

  const nr = `[${String(i + 1).padStart(2)}/${videos.length}]`
  process.stdout.write(`${nr} ${video.titel.slice(0, 44)} … ${zeilen.length} Zeilen `)

  const start = Date.now()
  const deutsch = await uebersetzeAlle(zeilen)
  const leer = deutsch.filter((d) => !d).length

  const antwort = await fetch(`${URL_BASIS}/rest/v1/videos?id=eq.${video.id}`, {
    method: 'PATCH',
    headers: kopf,
    body: JSON.stringify({ transkript_de: deutsch }),
  })

  if (antwort.ok) {
    fertig++
    console.log(`✅ ${Math.round((Date.now() - start) / 1000)}s${leer ? ` (${leer} leer)` : ''}`)
  } else {
    console.log(`❌ ${(await antwort.text()).slice(0, 80)}`)
  }
}

console.log(`\n── Fertig: ${fertig} Videos übersetzt\n`)
