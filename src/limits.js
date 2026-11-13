// Gratis-Grenzen – seit 09.11.2026 (Manuel), KI pro MONAT:
//
//   - 10 KI-Erstellungen im Monat: Wortlisten, Wörter aus Video, Sätze,
//     Lesetexte und E-Books teilen sich EINEN Topf
//   - eigene YouTube-Videos nur mit Premium, die Mediathek ist frei
//   - die ersten Module, zusammen höchstens 80 % der Lektionen (gratisModule.js)
//
// Der Monat beginnt am 1. Die GRENZE zieht der Server
// (server/kontingent.js) – der Zähler hier ist nur für die Anzeige
// und wird mit dem Server abgeglichen (holeKontingent).

import { useEffect, useState } from 'react'
import { tagesSchluessel } from './datum.js'
import { API_URL } from './api.js'
import { db, supabaseBereit } from './supabase.js'
import { sprache } from './sprache.js'

export const KI_PRO_MONAT = 10
export const VIDEOS_PRO_WOCHE = 0 // eigene Videos nur mit Premium (09.11.)
export const GRATIS_LEKTIONEN_PROZENT = 80 // ganze Module, siehe gratisModule.js

/** Der 1. des laufenden Monats als "JJJJ-MM-TT" – Schlüssel des Zeitraums. */
export function monatsSchluessel(d = new Date()) {
  return tagesSchluessel(new Date(d.getFullYear(), d.getMonth(), 1))
}

function lies() {
  try {
    const g = JSON.parse(localStorage.getItem('nutzung')) ?? {}
    if (g.woche !== monatsSchluessel()) return { woche: monatsSchluessel(), listen: 0, video: 0 }
    return { woche: g.woche, listen: g.listen ?? 0, video: g.video ?? 0 }
  } catch {
    return { woche: monatsSchluessel(), listen: 0, video: 0 }
  }
}

function schreib(stand) {
  try { localStorage.setItem('nutzung', JSON.stringify(stand)) } catch { /* privater Modus */ }
  window.dispatchEvent(new Event('kontingent'))
}

/** Der Zählerstand dieses Monats. */
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
  else stand.listen = KI_PRO_MONAT
  schreib(stand)
}

/** Wie viele KI-Erstellungen sind diesen Monat noch übrig? */
export function verbleibend(premium = false) {
  if (premium) return Infinity
  return Math.max(0, KI_PRO_MONAT - lies().listen)
}

/** Wie viele neue Videos sind diesen Monat noch übrig? */
export function videosUebrig(premium = false) {
  if (premium) return Infinity
  return Math.max(0, VIDEOS_PRO_WOCHE - lies().video)
}

/** Der 1. des nächsten Monats. */
export function naechsterMonat() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 1)
}

/** Wann füllt sich das Kontingent wieder auf? Für die Anzeige. */
export function naechsteAuffuellung() {
  const n = naechsterMonat()
  return sprache() === 'en'
    ? 'on ' + n.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
    : 'am ' + n.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })
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
    schreib({ woche: monatsSchluessel(), listen: d.ki?.genutzt ?? 0, video: d.video?.genutzt ?? 0 })
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
    ki: { uebrig: premium ? Infinity : Math.max(0, KI_PRO_MONAT - stand.listen), gesamt: KI_PRO_MONAT },
    video: { uebrig: premium ? Infinity : Math.max(0, VIDEOS_PRO_WOCHE - stand.video), gesamt: VIDEOS_PRO_WOCHE },
  }
}

// Alte Namen, damit bestehender Code weiterläuft
export const LISTEN_PRO_TAG = KI_PRO_MONAT
export const FREE_LIMIT = KI_PRO_MONAT

// ---------------------------------------------------------------
//  Obergrenzen im Trainer für Gratis-Nutzer (09.11.2026, Manuel)
// ---------------------------------------------------------------
// Gespeichert wird weiter alles – auch wer Premium gekündigt hat, verliert
// nichts. Im Training (Algorithmus, Fällig-Zahlen) sind aber nur die
// ERSTEN 500 Vokabeln / 50 Sätze / 10 Texte (nach Hinzufüge-Datum).
// Der Rest ist als „Pausiert · Premium“ gekennzeichnet.
export const MAX_VOKABELN = 500
export const MAX_SAETZE = 50
export const MAX_TEXTE = 10

/** Schlüssel, die für Gratis-Nutzer pausiert sind. Premium: leer. */
export function pausierteSchluessel(objekt, max, premium, datumFeld) {
  if (premium) return new Set()
  const keys = Object.keys(objekt || {})
  if (keys.length <= max) return new Set()
  keys.sort((a, b) => (objekt[a]?.[datumFeld] ?? 0) - (objekt[b]?.[datumFeld] ?? 0) || a.localeCompare(b))
  return new Set(keys.slice(max))
}
