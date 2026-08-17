/**
 * Zugriff auf die Habloo-Datenbank (Supabase).
 *
 * Der "anon"-Schlüssel darf offen im Browser stehen: die Datenbank
 * erlaubt damit nur, was die Sicherheitsregeln (RLS) zulassen –
 * also die öffentliche Video-Bibliothek lesen.
 */

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseBereit = Boolean(URL && KEY)

/** Ruft die Datenbank auf und gibt das Ergebnis als Liste zurück. */
async function abfrage(pfad) {
  if (!supabaseBereit) throw new Error('Supabase ist nicht konfiguriert.')

  const antwort = await fetch(`${URL}/rest/v1/${pfad}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  })

  if (!antwort.ok) {
    throw new Error(`Datenbank antwortet mit ${antwort.status}`)
  }
  return antwort.json()
}

/**
 * Holt die kuratierte Video-Bibliothek.
 * @param {string} [niveau] – optional auf "A1" | "A2" | "B1" einschränken
 */
export async function holeBibliothek(niveau) {
  const felder = 'id,youtube_id,titel,kanal,dauer_sek,thumbnail,niveau,kategorie'
  const filter = niveau && niveau !== 'alle' ? `&niveau=eq.${niveau}` : ''
  return abfrage(`videos?select=${felder}&aktiv=eq.true${filter}&order=niveau.asc`)
}

/** Holt ein einzelnes Video samt fertigem Transkript. */
export async function holeVideoMitTranskript(youtubeId) {
  const treffer = await abfrage(
    `videos?select=*&youtube_id=eq.${encodeURIComponent(youtubeId)}&limit=1`
  )
  return treffer[0] ?? null
}
