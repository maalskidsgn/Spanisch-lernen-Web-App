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
    // Nach einem "Trennen" soll man das Konto wirklich neu waehlen
    // koennen. Ohne show_dialog winkt Spotify die alte Freigabe
    // still durch und verbindet wieder dasselbe Konto.
    show_dialog: 'true',
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
  merkeZugang(daten)
  return true
}

/**
 * Zugang speichern – inklusive Erneuerungs-Schlüssel.
 *
 * Der Zugang selbst gilt nur eine Stunde. Ohne den
 * Erneuerungs-Schlüssel wäre die Verbindung danach weg und man
 * müsste sich immer wieder neu anmelden. Mit ihm holt die App
 * still einen neuen Zugang, solange der Nutzer nicht trennt.
 */
function merkeZugang(daten) {
  const alt = gespeichert()
  localStorage.setItem(
    'spotify_zugang',
    JSON.stringify({
      token: daten.access_token,
      // Spotify schickt den Erneuerungs-Schlüssel nicht immer erneut
      erneuern: daten.refresh_token ?? alt?.erneuern ?? null,
      laeuftAb: Date.now() + daten.expires_in * 1000,
    })
  )
}

function gespeichert() {
  try {
    return JSON.parse(localStorage.getItem('spotify_zugang'))
  } catch {
    return null
  }
}

/**
 * Ist eine nutzbare Verbindung da? Entweder ein Erneuerungs-Schlüssel
 * (dann können wir jederzeit einen frischen Zugang holen) oder ein
 * noch gültiger Zugang. Alte Daten ohne beides zählen als getrennt –
 * dann soll der Nutzer den Verbinden-Knopf sehen, nicht einen
 * scheinbar verbundenen Zustand, der bei der ersten Aktion scheitert.
 */
export function istVerbunden() {
  const g = gespeichert()
  if (!g) return false
  return Boolean(g.erneuern || (g.token && g.laeuftAb > Date.now()))
}

/**
 * Ein gültiger Zugang – erneuert sich bei Bedarf von selbst.
 * Gibt null zurück, wenn gar keine Verbindung besteht.
 */
export async function zugang() {
  const g = gespeichert()
  if (!g?.token) return null

  // Noch mindestens eine Minute gültig? Dann direkt nehmen.
  if (g.laeuftAb - 60000 > Date.now()) return g.token

  if (!g.erneuern) return null
  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: g.erneuern,
      }),
    })
    if (!res.ok) return null
    const daten = await res.json()
    merkeZugang(daten)
    return daten.access_token
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
  const zaehler = new Map()  // Name -> Gewicht
  const songs = new Map()    // Name -> Set von Songtiteln

  const merke = (name, gewicht = 1, titel = null) => {
    if (!name) return
    zaehler.set(name, (zaehler.get(name) ?? 0) + gewicht)
    if (titel) {
      if (!songs.has(name)) songs.set(name, new Set())
      songs.get(name).add(titel)
    }
  }

  // 1. Lieblingskünstler – die deutlichste Aussage
  try {
    const top = await hole('/me/top/artists?limit=50&time_range=medium_term', token)
    for (const k of top.items ?? []) merke(k.name, 3)
  } catch {
    // Neue Konten haben noch keine Statistik – kein Grund abzubrechen
  }

  // 2. Meistgehörte Titel – liefert Künstler UND Songnamen
  try {
    const topTitel = await hole('/me/top/tracks?limit=50&time_range=medium_term', token)
    for (const s of topTitel.items ?? []) {
      for (const k of s.artists ?? []) merke(k.name, 2, s.name)
    }
  } catch {
    // ebenfalls optional
  }

  // 3. Gespeicherte Titel
  try {
    const gespeicherteTitel = await hole('/me/tracks?limit=50', token)
    for (const eintrag of gespeicherteTitel.items ?? []) {
      for (const k of eintrag.track?.artists ?? []) merke(k.name, 1, eintrag.track.name)
    }
  } catch {
    // optional
  }

  // 4. Die ersten Titel aus den eigenen Playlists
  try {
    const listen = await hole('/me/playlists?limit=10', token)
    for (const liste of listen.items ?? []) {
      try {
        const titel = await hole(`/playlists/${liste.id}/tracks?limit=50`, token)
        for (const eintrag of titel.items ?? []) {
          for (const k of eintrag.track?.artists ?? []) merke(k.name, 1, eintrag.track.name)
        }
      } catch {
        // Eine unlesbare Playlist soll den Rest nicht kippen
      }
    }
  } catch {
    // optional
  }

  return [...zaehler.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 120)
    .map(([name, punkte]) => ({
      name,
      punkte,
      // Songs aus DEINER Bibliothek – passender als irgendwelche
      // Charts, und die einzige Quelle, die uns noch offensteht:
      // Spotify hat die Katalog-Abfragen (Suche, Top-Tracks) für
      // Apps im Entwicklungsmodus im Februar 2026 abgeschaltet.
      songs: [...(songs.get(name) ?? [])].slice(0, 5).map((titel) => ({ titel })),
    }))
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
