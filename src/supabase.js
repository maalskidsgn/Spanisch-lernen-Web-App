/**
 * Verbindung zur Habloo-Datenbank (Supabase).
 *
 * Der "anon"-Schlüssel darf offen im Browser stehen: die Datenbank
 * erlaubt damit nur, was die Sicherheitsregeln (RLS) zulassen –
 * die öffentliche Video-Bibliothek lesen und die eigenen Daten
 * des angemeldeten Nutzers.
 */

import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseBereit = Boolean(URL && KEY)

export const db = supabaseBereit
  ? createClient(URL, KEY, {
      auth: {
        persistSession: true,      // Anmeldung übersteht das Schließen des Tabs
        autoRefreshToken: true,    // Sitzung wird im Hintergrund verlängert
      },
    })
  : null

// ---------------------------------------------------------------
//  Video-Bibliothek (öffentlich, auch ohne Anmeldung lesbar)
// ---------------------------------------------------------------

/**
 * Holt die kuratierte Video-Bibliothek.
 * @param {string} [niveau] – optional auf "A1" | "A2" | "B1" einschränken
 */
export async function holeBibliothek(niveau) {
  let abfrage = db
    .from('videos')
    .select('id,youtube_id,titel,kanal,dauer_sek,thumbnail,niveau,kategorie')
    .eq('aktiv', true)
    .order('niveau', { ascending: true })

  if (niveau && niveau !== 'alle') abfrage = abfrage.eq('niveau', niveau)

  const { data, error } = await abfrage
  if (error) throw new Error(error.message)
  return data
}

/** Holt ein einzelnes Video samt fertigem Transkript. */
export async function holeVideoMitTranskript(youtubeId) {
  const { data, error } = await db
    .from('videos')
    .select('*')
    .eq('youtube_id', youtubeId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}
