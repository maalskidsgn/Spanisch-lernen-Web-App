// Gratis-Grenzen – seit 09.11.2026 pro WOCHE (Manuel):
//
//   - 7 KI-Erstellungen: Wortlisten, Wörter aus Video, Sätze,
//     Lesetexte und E-Books teilen sich EINEN Topf
//   - eigene YouTube-Videos nur mit Premium, die Mediathek ist frei
//   - 20 % der Lektionen (siehe premium.js)
//
// Die Woche beginnt montags. Die GRENZE zieht der Server
// (server/kontingent.js) – der Zähler hier ist nur für die Anzeige
// und wird mit dem Server abgeglichen (holeKontingent).

import { useEffect, useState } from 'react'
import { tagesSchluessel } from './datum.js'
import { API_URL } from './api.js'
import { db, supabaseBereit } from './supabase.js'
import { sprache } from './sprache.js'

export const KI_PRO_WOCHE = 7
export const VIDEOS_PRO_WOCHE = 0 // eigene Videos nur mit Premium (09.11.)
export const GRATIS_LEKTIONEN_PROZENT = 20

/** Montag der laufenden Woche als "JJJJ-MM-TT" – Schlüssel des Zeitraums. */
export function wochenSchluessel(d = new Date()) {
  const m = new Date(d)
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7))
  return tagesSchluessel(m)
}

function lies() {
  try {
    const g = JSON.parse(localStorage.getItem('nutzung')) ?? {}
    if (g.woche !== wochenSchluessel()) return { woche: wochenSchluessel(), listen: 0, video: 0 }
    return { woche: g.woche, listen: g.listen ?? 0, video: g.video ?? 0 }
  } catch {
    return { woche: wochenSchluessel(), listen: 0, video: 0 }
  }
}

function schreib(stand) {
  try { localStorage.setItem('nutzung', JSON.stringify(stand)) } catch { /* privater Modus */ }
  window.dispatchEvent(new Event('kontingent'))
}

/** Der Zählerstand dieser Woche. */
export function nutzung() {
  return lies()
}

/** Eine KI-Erstellung verbuchen – nach erfolgreichem Abruf aufrufen. */
export function zaehleNutzung() {
  const stand = lies()
  stand.listen += 1
  schreib(stand)
  return stand.listen
}

/** Ein neues YouTube-Video verbuchen. */
export function zaehleVideo() {
  const stand = lies()
  stand.video += 1
  schreib(stand)
}

/** Server meldet „aufgebraucht“ – Anzeige sofort angleichen. */
export function kontingentLeer(art = 'ki') {
  const stand = lies()
  if (art === 'video') stand.video = VIDEOS_PRO_WOCHE
  else stand.listen = KI_PRO_WOCHE
  schreib(stand)
}

/** Wie viele KI-Erstellungen sind diese Woche noch übrig? */
export function verbleibend(premium = false) {
  if (premium) return Infinity
  return Math.max(0, KI_PRO_WOCHE - lies().listen)
}

/** Wie viele neue Videos sind diese Woche noch übrig? */
export function videosUebrig(premium = false) {
  if (premium) return Infinity
  return Math.max(0, VIDEOS_PRO_WOCHE - lies().video)
}

/** Nächster Montag 0 Uhr. */
export function naechsterMontag() {
  const d = new Date()
  d.setDate(d.getDate() + (7 - ((d.getDay() + 6) % 7)))
  d.setHours(0, 0, 0, 0)
  return d
}

/** Wann füllt sich das Kontingent wieder auf? Für die Anzeige. */
export function naechsteAuffuellung() {
  const tage = Math.ceil((naechsterMontag() - Date.now()) / 86400000)
  const en = sprache() === 'en'
  if (en) return tage <= 1 ? 'tomorrow (Monday)' : `on Monday (in ${tage} days)`
  return tage <= 1 ? 'morgen (Montag)' : `am Montag (in ${tage} Tagen)`
}

/** Kopfzeile mit Anmeldung – für alle Abrufe, die das Kontingent betreffen. */
export async function loginKopf(extra = {}) {
  try {
    if (!supabaseBereit) return extra
    const { data } = await db.auth.getSession()
    const token = data?.session?.access_token
    return token ? { ...extra, Authorization: 'Bearer ' + token } : extra
  } catch {
    return extra
  }
}

/** Stand vom Server holen und die Anzeige angleichen. */
export async function holeKontingent() {
  try {
    const headers = await loginKopf()
    if (!headers.Authorization) return
    const res = await fetch(API_URL + '/api/kontingent', { headers })
    if (!res.ok) return
    const d = await res.json()
    if (d.premium) return
    schreib({ woche: wochenSchluessel(), listen: d.ki?.genutzt ?? 0, video: d.video?.genutzt ?? 0 })
  } catch {
    /* offline – lokaler Stand bleibt */
  }
}

/** Live-Stand für die Anzeige; aktualisiert sich bei jeder Buchung. */
export function useKontingent(premium = false) {
  const [stand, setStand] = useState(lies)
  useEffect(() => {
    const neu = () => setStand(lies())
    window.addEventListener('kontingent', neu)
    holeKontingent()
    return () => window.removeEventListener('kontingent', neu)
  }, [])
  return {
    ki: { uebrig: premium ? Infinity : Math.max(0, KI_PRO_WOCHE - stand.listen), gesamt: KI_PRO_WOCHE },
    video: { uebrig: premium ? Infinity : Math.max(0, VIDEOS_PRO_WOCHE - stand.video), gesamt: VIDEOS_PRO_WOCHE },
  }
}

// Alte Namen, damit bestehender Code weiterläuft
export const LISTEN_PRO_TAG = KI_PRO_WOCHE
export const FREE_LIMIT = KI_PRO_WOCHE

