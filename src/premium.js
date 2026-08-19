// Die eine Wahrheit darüber, ob jemand Premium hat.
//
// Alles im Programm fragt hier – nie irgendwo selbst nach. Sobald
// zwei Stellen unterschiedlich prüfen, gibt es früher oder später
// einen Nutzer, der auf einem Gerät Premium hat und auf dem anderen
// nicht.
//
// Wichtig: Das hier ist nur für die Anzeige. Ein geübter Nutzer
// kann im Browser jeden Wert verbiegen. Die echte Absicherung
// passiert auf dem Server und in den Zugriffsregeln der Datenbank.

import { useState, useEffect } from 'react'
import { db, supabaseBereit } from './supabase.js'
import { API_URL } from './api.js'

/**
 * Liest die Berechtigung des angemeldeten Nutzers.
 * @returns {Promise<{premium: boolean, bis: Date|null, status: string|null}>}
 */
export async function holeBerechtigung() {
  // Ohne eingerichtete Datenbank gibt es keine Abos – und vor allem
  // keinen Absturz: db ist dann null.
  if (!supabaseBereit) return { premium: false, bis: null, status: null }
  const { data: sitzung } = await db.auth.getSession()
  const nutzer = sitzung?.session?.user
  if (!nutzer) return { premium: false, bis: null, status: null }

  // Die Zugriffsregel lässt nur das eigene Abo durch – eine
  // zusätzliche Einschränkung auf die Nutzer-Kennung wäre doppelt.
  const { data, error } = await db
    .from('abos')
    .select('status, laeuft_ab, tarif')
    .maybeSingle()

  if (error || !data) return { premium: false, bis: null, status: null }

  // laeuft_ab ist leer bei "lifetime" – das gilt unbegrenzt.
  const unbegrenzt = data.laeuft_ab === null
  const bis = unbegrenzt ? null : new Date(data.laeuft_ab)

  return {
    // Entscheidend ist das Datum, nicht der Status: Wer gekündigt
    // hat, behält Premium bis zum Ende des bezahlten Zeitraums.
    premium: data.status !== 'abgelaufen' && (unbegrenzt || bis > new Date()),
    bis,
    status: data.status,
  }
}

/** Für Komponenten: liefert die Berechtigung und lädt sie nach. */
export function usePremium() {
  const [stand, setStand] = useState({ premium: false, bis: null, status: null, laedt: true })

  async function neuLaden() {
    const b = await holeBerechtigung()
    setStand({ ...b, laedt: false })
  }

  useEffect(() => {
    neuLaden()
    if (!supabaseBereit) return
    // Nach einer Anmeldung erneut fragen
    const { data } = db.auth.onAuthStateChange(() => neuLaden())
    return () => data?.subscription?.unsubscribe()
  }, [])

  return { ...stand, neuLaden }
}

/** Schickt den Nutzer zur Bezahlseite von Stripe. */
export async function zurKasse() {
  if (!supabaseBereit) throw new Error('Bitte zuerst anmelden.')
  const { data: sitzung } = await db.auth.getSession()
  const token = sitzung?.session?.access_token
  if (!token) throw new Error('Bitte zuerst anmelden.')

  const res = await fetch(API_URL + '/api/bezahlung/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ herkunft: window.location.origin }),
  })
  const daten = await res.json()
  if (!res.ok) throw new Error(daten.error || 'Bezahlung konnte nicht gestartet werden.')
  window.location.href = daten.url
}

/** Öffnet Stripes Verwaltungsseite zum Kündigen oder Kartenwechsel. */
export async function aboVerwalten() {
  if (!supabaseBereit) throw new Error('Bitte zuerst anmelden.')
  const { data: sitzung } = await db.auth.getSession()
  const token = sitzung?.session?.access_token
  if (!token) throw new Error('Bitte zuerst anmelden.')

  const res = await fetch(API_URL + '/api/bezahlung/verwalten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ herkunft: window.location.origin }),
  })
  const daten = await res.json()
  if (!res.ok) throw new Error(daten.error || 'Verwaltung konnte nicht geöffnet werden.')
  window.location.href = daten.url
}

/** Ist Bezahlen auf dem Server überhaupt eingerichtet? */
export async function bezahlungBereit() {
  try {
    const res = await fetch(API_URL + '/api/bezahlung/status')
    const daten = await res.json()
    return Boolean(daten.bereit)
  } catch {
    return false
  }
}
