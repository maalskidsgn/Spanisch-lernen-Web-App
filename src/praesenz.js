/**
 * Wer ist gerade da?
 *
 * Läuft über Supabase Presence: ein gemeinsamer Kanal, in den jede
 * offene App ihren Benutzernamen hängt. Fällt die Verbindung weg –
 * Tab zu, Handy gesperrt, Funkloch –, verschwindet der Eintrag von
 * selbst. Genau deshalb Presence und keine Spalte "zuletzt_online":
 * Die müsste jemand aufräumen, und ein vergessener Eintrag macht aus
 * "online" eine Lüge.
 *
 * Es wird nur der Benutzername übertragen, nichts weiter. Der steht
 * ohnehin in jeder Rangliste.
 */

import { useEffect, useState } from 'react'
import { db, supabaseBereit } from './supabase.js'

const KANAL = 'habloo-online'

let kanal = null
let meiner = ''
/** Alle gerade sichtbaren Benutzernamen, klein geschrieben. */
let anwesend = new Set()

function melde() {
  window.dispatchEvent(new CustomEvent('anwesend'))
}

/** Liest den aktuellen Stand aus dem Kanal in unser Set. */
function uebernehmen() {
  const stand = kanal.presenceState()
  const neu = new Set()
  for (const eintraege of Object.values(stand)) {
    for (const e of eintraege) {
      if (e?.name) neu.add(String(e.name).toLowerCase())
    }
  }
  anwesend = neu
  melde()
}

/**
 * Anmelden. Mehrfach aufrufbar – beim selben Namen passiert nichts.
 * @param {string} benutzername
 */
export function zeigeMichAn(benutzername) {
  if (!supabaseBereit || !benutzername) return
  if (kanal && meiner === benutzername) return
  verschwinde()
  meiner = benutzername

  kanal = db.channel(KANAL, { config: { presence: { key: benutzername } } })
  kanal
    .on('presence', { event: 'sync' }, uebernehmen)
    .on('presence', { event: 'join' }, uebernehmen)
    .on('presence', { event: 'leave' }, uebernehmen)
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') kanal.track({ name: benutzername })
    })
}

/** Abmelden – beim Abmelden aus dem Konto oder beim Namenswechsel. */
export function verschwinde() {
  if (!kanal) return
  try {
    db.removeChannel(kanal)
  } catch {
    /* Verbindung war schon weg */
  }
  kanal = null
  meiner = ''
  anwesend = new Set()
  melde()
}

/** Ist diese Person gerade da? */
export function istDa(benutzername) {
  if (!benutzername) return false
  return anwesend.has(String(benutzername).toLowerCase())
}

/** Wie viele sind gerade da – mich eingerechnet. */
export function anzahlDa() {
  return anwesend.size
}

/**
 * Für React: liefert eine Funktion `da(name)`, die sich erneuert,
 * sobald jemand kommt oder geht.
 */
export function useAnwesend() {
  const [, neu] = useState(0)
  useEffect(() => {
    const horch = () => neu((n) => n + 1)
    window.addEventListener('anwesend', horch)
    return () => window.removeEventListener('anwesend', horch)
  }, [])
  return istDa
}
