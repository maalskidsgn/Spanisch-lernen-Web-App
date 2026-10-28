// Alle übrigen Lerndaten mit dem Konto abgleichen.
//
// Vokabeln, XP, Lektionen, Sätze, Lesetexte und gemerkte Videos haben
// eigene Wege (sync.js, videoSync.js). Was bis 28.10. NUR im Browser lag,
// steht in SCHLUESSEL – auf einem neuen Gerät fehlte das alles, und bei
// den "schon belohnt"-Listen gab es XP sogar doppelt.
//
// Abgelegt in statistik.ki_nutzung.geraete (JSON-Spalte, keine
// Datenbank-Änderung nötig). Abgleich als Drei-Wege-Vergleich: Wir merken
// uns den zuletzt abgeglichenen Stand ('sync:stand'). Hat sich nur eine
// Seite seitdem geändert, gewinnt sie. Haben sich beide geändert, werden
// Listen vereinigt und Objekte zusammengelegt (lokal gewinnt im Detail).
import { db } from './supabase.js'

export const SCHLUESSEL = [
  'einstellungen', // Tagesziel, Erinnerungen …
  'bausteine', // Grammatik-Karteikasten
  'videoFortschritt', // wo man in welchem Video war
  'buecher', // Buchzusammenfassungen in der Bibliothek
  'landUndLeute', // gelesene Stücke (XP nur einmal)
  'feedGesehen', // gesehene Feed-Karten
  'meilensteine-belohnt', // Abzeichen-XP nur einmal
  'duelle-belohnt', // Duell-XP nur einmal
  'tagesplan',
  'spotify_interpreten', // gewählte Künstler bei Songs
  'bausteinVarianten',
]

// Diese Werte hält die App im React-Zustand – sie muss sie nach einem
// Abgleich neu einlesen (Ereignis 'geraetedaten').
const STAND = 'sync:stand'

function lies(k) {
  const roh = localStorage.getItem(k)
  if (roh === null) return undefined
  try {
    return JSON.parse(roh)
  } catch {
    return undefined
  }
}

const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b)

function vereine(lokal, entfernt) {
  if (Array.isArray(lokal) && Array.isArray(entfernt)) {
    const gesehen = new Set()
    return [...entfernt, ...lokal].filter((x) => {
      const s = JSON.stringify(x)
      if (gesehen.has(s)) return false
      gesehen.add(s)
      return true
    })
  }
  if (lokal && entfernt && typeof lokal === 'object' && typeof entfernt === 'object') {
    const zusammen = { ...entfernt, ...lokal }
    // { gelesen: [...] } & Co.: Listen eine Ebene tiefer ebenfalls vereinen
    for (const k of Object.keys(zusammen)) {
      if (Array.isArray(lokal[k]) && Array.isArray(entfernt[k])) zusammen[k] = vereine(lokal[k], entfernt[k])
    }
    return zusammen
  }
  return lokal ?? entfernt
}

let laeuft = null

/**
 * Abgleich in beide Richtungen. Liefert die Liste der Schlüssel, die
 * vom Konto her lokal geändert wurden.
 */
export function gleicheGeraetedatenAb(nutzerId) {
  if (!nutzerId) return Promise.resolve([])
  // Nie zwei Abgleiche gleichzeitig – sonst überschreiben sie sich
  if (laeuft) return laeuft
  laeuft = abgleich(nutzerId).finally(() => {
    laeuft = null
  })
  return laeuft
}

async function abgleich(nutzerId) {
  const { data, error } = await db
    .from('statistik')
    .select('ki_nutzung')
    .eq('nutzer_id', nutzerId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  const ki = data?.ki_nutzung ?? {}
  const entfernt = ki.geraete ?? {}

  let basis = {}
  try {
    const s = JSON.parse(localStorage.getItem(STAND)) || {}
    if (s.nutzer === nutzerId) basis = s.werte || {}
  } catch { /* kein Stand – erster Abgleich */ }

  const neu = {}
  const lokalGeaendert = []
  let hochladen = false

  for (const k of SCHLUESSEL) {
    const l = lies(k)
    const e = entfernt[k]
    const b = basis[k]
    let ergebnis
    if (gleich(l, e)) ergebnis = l
    else if (gleich(l, b)) ergebnis = e // nur das Konto hat sich geändert
    else if (gleich(e, b) || e === undefined) ergebnis = l // nur dieses Gerät
    // Erster Abgleich auf diesem Gerät: Das Konto gewinnt im Detail –
    // sonst würden frische Standardwerte (Tagesziel 30 …) den echten
    // Stand vom anderen Gerät überschreiben.
    else if (b === undefined) ergebnis = vereine(e, l)
    else ergebnis = vereine(l, e) // beide geändert – zusammenlegen

    if (ergebnis === undefined) continue
    neu[k] = ergebnis
    if (!gleich(ergebnis, l)) {
      localStorage.setItem(k, JSON.stringify(ergebnis))
      lokalGeaendert.push(k)
    }
    if (!gleich(ergebnis, e)) hochladen = true
  }

  if (hochladen) {
    const { error: f } = await db
      .from('statistik')
      .upsert({ nutzer_id: nutzerId, ki_nutzung: { ...ki, geraete: neu } }, { onConflict: 'nutzer_id' })
    if (f) throw new Error(f.message)
  }
  try {
    localStorage.setItem(STAND, JSON.stringify({ nutzer: nutzerId, werte: neu }))
  } catch { /* Speicher voll */ }

  if (lokalGeaendert.length) {
    window.dispatchEvent(new CustomEvent('geraetedaten', { detail: lokalGeaendert }))
  }
  return lokalGeaendert
}
