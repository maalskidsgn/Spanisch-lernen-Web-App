// Anmeldung bei Spotify – nach dem PKCE-Verfahren.
//
// Warum PKCE? Der übliche Weg verlangt ein "Client Secret". Das
// dürfte niemals in den Browser, weil dort jeder es auslesen kann.
// PKCE löst das anders: Wir würfeln bei jeder Anmeldung ein Geheimnis
// aus, schicken nur dessen Prüfsumme zu Spotify und erst beim
// Eintauschen das Geheimnis selbst. Wer den Rückweg abfängt, hat
// nichts davon – ihm fehlt das Original.
//
// Wir lesen ausschließlich: gespeicherte Titel und Playlists.
// Es wird nichts abgespielt, geändert oder gepostet.

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID ?? ''
const RECHTE = 'user-library-read playlist-read-private user-top-read'

export const spotifyBereit = Boolean(CLIENT_ID)

function weiterleitung() {
  return window.location.origin + '/spotify'
}

/** Zufälliges Geheimnis, das nur dieser Browser kennt. */
function wuerfelGeheimnis() {
  const bytes = crypto.getRandomValues(new Uint8Array(64))
  return Array.from(bytes, (b) => ('0' + b.toString(16)).slice(-2)).join('')
}

/** Die Prüfsumme dazu – daraus lässt sich das Original nicht zurückrechnen. */
async function pruefsumme(geheimnis) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(geheimnis))
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/** Schickt den Nutzer zu Spotify, damit er die Freigabe erteilt. */
export async function starteAnmeldung() {
  const geheimnis = wuerfelGeheimnis()
  sessionStorage.setItem('spotify_geheimnis', geheimnis)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: weiterleitung(),
    scope: RECHTE,
    code_challenge_method: 'S256',
    code_challenge: await pruefsumme(geheimnis),
  })
  window.location.href = 'https://accounts.spotify.com/authorize?' + params
}

/**
 * Zurück von Spotify: den Code gegen einen Zugangsschlüssel tauschen.
 * Gibt true zurück, wenn es geklappt hat.
 */
export async function schliesseAnmeldungAb() {
  const code = new URLSearchParams(window.location.search).get('code')
  const geheimnis = sessionStorage.getItem('spotify_geheimnis')
  if (!code || !geheimnis) return false

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: weiterleitung(),
      code_verifier: geheimnis,
    }),
  })
  const daten = await res.json()
  if (!res.ok) throw new Error(daten.error_description || 'Anmeldung fehlgeschlagen')

  sessionStorage.removeItem('spotify_geheimnis')
  localStorage.setItem(
    'spotify_zugang',
    JSON.stringify({ token: daten.access_token, laeuftAb: Date.now() + daten.expires_in * 1000 })
  )
  return true
}

/** Der gespeicherte Zugang – oder null, wenn keiner da bzw. abgelaufen ist. */
export function zugang() {
  try {
    const g = JSON.parse(localStorage.getItem('spotify_zugang'))
    if (!g?.token || g.laeuftAb < Date.now()) return null
    return g.token
  } catch {
    return null
  }
}

export function trenneSpotify() {
  localStorage.removeItem('spotify_zugang')
  localStorage.removeItem('spotify_interpreten')
}

async function hole(pfad, token) {
  const res = await fetch('https://api.spotify.com/v1' + pfad, {
    headers: { Authorization: 'Bearer ' + token },
  })
  if (res.status === 401) {
    trenneSpotify()
    throw new Error('Die Verbindung zu Spotify ist abgelaufen. Bitte neu verbinden.')
  }
  if (!res.ok) throw new Error('Spotify antwortet nicht (' + res.status + ')')
  return res.json()
}

/**
 * Sammelt die Künstler aus der Musik des Nutzers.
 *
 * Drei Quellen, damit auch neue Konten etwas hergeben: die meist-
 * gehörten Künstler, die gespeicherten Titel und die eigenen
 * Playlists. Jeder Künstler wird gezählt – wer öfter vorkommt, ist
 * wichtiger.
 */
export async function sammleKuenstler(token) {
  const zaehler = new Map()
  const merke = (name) => {
    if (name) zaehler.set(name, (zaehler.get(name) ?? 0) + 1)
  }

  // 1. Lieblingskünstler – die deutlichste Aussage
  try {
    const top = await hole('/me/top/artists?limit=50&time_range=medium_term', token)
    for (const k of top.items ?? []) {
      zaehler.set(k.name, (zaehler.get(k.name) ?? 0) + 3) // zählt dreifach
    }
  } catch {
    // Neue Konten haben noch keine Statistik – kein Grund abzubrechen
  }

  // 2. Gespeicherte Titel
  const gespeichert = await hole('/me/tracks?limit=50', token)
  for (const eintrag of gespeichert.items ?? []) {
    for (const k of eintrag.track?.artists ?? []) merke(k.name)
  }

  // 3. Die ersten Titel aus den eigenen Playlists
  const listen = await hole('/me/playlists?limit=10', token)
  for (const liste of listen.items ?? []) {
    try {
      const titel = await hole(`/playlists/${liste.id}/tracks?limit=50`, token)
      for (const eintrag of titel.items ?? []) {
        for (const k of eintrag.track?.artists ?? []) merke(k.name)
      }
    } catch {
      // Eine unlesbare Playlist soll den Rest nicht kippen
    }
  }

  return [...zaehler.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 120)
    .map(([name, punkte]) => ({ name, punkte }))
}

/** Die gemerkten spanischsprachigen Interpreten aus dem Dashboard. */
export function gemerkteInterpreten() {
  try {
    return JSON.parse(localStorage.getItem('spotify_interpreten')) ?? []
  } catch {
    return []
  }
}

export function merkeInterpreten(liste) {
  localStorage.setItem('spotify_interpreten', JSON.stringify(liste))
}
