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
// Testphase: keine Premium-Schranken.
//
// Dasselbe wie der Schalter in server/gespraech.js – beide gehören
// zusammen. Der Server entscheidet über die teuren Abrufe, diese
// Zeile hier sorgt dafür, dass die Oberfläche auch gar nicht erst
// eine Schranke zeigt. Zum Zurückdrehen beide auf false setzen.
export const TESTPHASE_ALLES_FREI = true

/**
 * Ausnahme von der Testphase – nur für dieses eine Gerät.
 *
 * Solange alle Premium geschenkt bekommen, lässt sich der Bezahlweg
 * nicht ausprobieren: Wer schon Premium hat, bekommt keine Kasse zu
 * sehen. Wer hier einschaltet, wird für sich selbst wieder zum
 * Gratis-Nutzer und kann eine echte Zahlung durchspielen. Alle
 * anderen merken davon nichts.
 *
 * Der Merker liegt im Browser, nicht auf dem Konto: Auf einem anderen
 * Gerät ist wieder alles frei.
 */
export function testkaufAn() {
  try { localStorage.setItem('testkauf', 'ja') } catch { /* privater Modus */ }
}
export function testkaufAus() {
  try { localStorage.removeItem('testkauf') } catch { /* egal */ }
}
export function testkaufLaeuft() {
  try {
    return localStorage.getItem('testkauf') === 'ja'
  } catch {
    return false
  }
}

// Die Adresse wird EINMAL beim Laden ausgewertet, nicht erst wenn
// zufällig jemand nach dem Premium-Stand fragt. Vorher hing es davon
// ab, ob gerade eine Abfrage lief – mal klappte es, mal nicht.
//   habloo.de/?testkauf=1  schaltet ein
//   habloo.de/?testkauf=0  schaltet wieder aus
try {
  const wunsch = new URLSearchParams(location.search).get('testkauf')
  if (wunsch === '1') testkaufAn()
  if (wunsch === '0') testkaufAus()
} catch {
  /* kein Browser (Tests) – dann gibt es auch keine Adresse */
}

export async function holeBerechtigung() {
  if (TESTPHASE_ALLES_FREI && !testkaufLaeuft()) {
    return { premium: true, bis: null, status: 'testphase' }
  }
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
// Der letzte bekannte Stand liegt im Browser. So weiss die App schon
// beim Start, ob jemand Premium hat – sonst blitzt kurz die
// Premium-Werbung auf, bis die Datenbank antwortet.
function gemerkterStand() {
  try {
    return localStorage.getItem('premium-stand') === 'ja'
  } catch {
    return false
  }
}

export function usePremium() {
  const [stand, setStand] = useState(() => ({
    premium: gemerkterStand(),
    bis: null,
    status: null,
    laedt: true,
  }))

  async function neuLaden() {
    const b = await holeBerechtigung()
    try {
      localStorage.setItem('premium-stand', b.premium ? 'ja' : 'nein')
    } catch {
      /* privater Modus – dann eben ohne Merken */
    }
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

/**
 * Der alte Weg: Weiterleitung auf checkout.stripe.com.
 *
 * Wird nicht mehr benutzt – das Bezahlformular läuft seit 10.10.
 * in der App (Bezahlen.jsx), auf habloo.de und im Habloo-Design.
 * Die Funktion bleibt als Rückfall stehen, falls das Formular
 * einmal klemmt: Ein Aufruf von hier führt wieder zu Stripe.
 */
export async function zurKasse() {
  if (!supabaseBereit) throw new Error('Bitte zuerst anmelden.')
  const { data: sitzung } = await db.auth.getSession()
  const token = sitzung?.session?.access_token
  if (!token) throw new Error('Bitte zuerst anmelden.')

  const res = await fetch(API_URL + '/api/bezahlung/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ herkunft: window.location.origin, art: 'hosted' }),
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
