/**
 * Rangliste + Benutzernamen.
 *
 * Die Datenbank-Seite steht in supabase-rangliste.sql: zwei Funktionen
 * (rangliste, benutzername_frei) und die Spalte profile.benutzername
 * mit eindeutigem Index ohne Groß/Klein. Fehlt die Migration noch,
 * liefern alle Aufrufe hier "nicht verfügbar" statt eines Fehlers –
 * die Startseite blendet die Karte dann einfach aus.
 */

import { db, supabaseBereit } from './supabase.js'

// Gleiche Regel wie der CHECK in der Datenbank
export const NAME_MUSTER = /^[A-Za-z0-9_.]{3,20}$/

// Namen, die nach Habloo selbst aussehen würden
const RESERVIERT = ['habloo', 'admin', 'support', 'team', 'moderator', 'mod', 'system', 'root']

/** Prüft die Form, ohne die Datenbank zu fragen. Liefert Fehlertext oder ''. */
export function nameFehler(name) {
  const n = name.trim()
  if (n.length < 3) return 'Mindestens 3 Zeichen.'
  if (n.length > 20) return 'Höchstens 20 Zeichen.'
  if (!NAME_MUSTER.test(n)) return 'Nur Buchstaben, Ziffern, Punkt und Unterstrich – ohne Leerzeichen und Umlaute.'
  if (RESERVIERT.some((r) => n.toLowerCase().includes(r))) return 'Dieser Name ist reserviert.'
  return ''
}

/** Die Migration fehlt noch: Spalte oder Funktion unbekannt. */
function fehltMigration(error) {
  return error && ['42703', '42883', 'PGRST202', 'PGRST204'].includes(error.code)
}

/**
 * Der eigene Benutzername.
 * @returns {Promise<string|null|undefined>} null = noch keiner,
 *   undefined = Rangliste (noch) nicht verfügbar
 */
export async function ladeBenutzername(nutzerId) {
  if (!supabaseBereit || !nutzerId) return undefined
  const { data, error } = await db
    .from('profile')
    .select('benutzername')
    .eq('id', nutzerId)
    .maybeSingle()
  if (error) return undefined
  return data?.benutzername ?? null
}

/** Ist der Name frei? true/false, null wenn die Prüfung nicht ging. */
export async function istNameFrei(name) {
  const { data, error } = await db.rpc('benutzername_frei', { name: name.trim() })
  if (error) return null
  return data === true
}

/**
 * Setzt den Benutzernamen. Wirft mit lesbarer Meldung.
 * Die Eindeutigkeit prüft am Ende die Datenbank selbst (Index) –
 * die Vorab-Prüfung ist nur fürs schnelle Feedback beim Tippen.
 */
export async function setzeBenutzername(nutzerId, name) {
  const n = name.trim()
  const fehler = nameFehler(n)
  if (fehler) throw new Error(fehler)

  const { error } = await db
    .from('profile')
    .upsert({ id: nutzerId, benutzername: n }, { onConflict: 'id' })

  if (!error) {
    window.dispatchEvent(new CustomEvent('benutzername', { detail: n }))
    return n
  }
  if (error.code === '23505') throw new Error('Den Namen gibt es schon – nimm einen anderen.')
  if (error.code === '23514') throw new Error('Nur Buchstaben, Ziffern, Punkt und Unterstrich (3–20 Zeichen).')
  if (fehltMigration(error)) throw new Error('Benutzernamen sind gleich verfügbar – bitte später nochmal.')
  throw new Error('Hat nicht geklappt: ' + error.message)
}

/** Die drei Zeiträume, in denen man sich vergleichen kann. */
export const ZEITRAEUME = [
  ['gesamt', 'Insgesamt'],
  ['monat', 'Dieser Monat'],
  ['jahr', 'Dieses Jahr'],
]

/**
 * Top 10 plus der eigene Platz, falls man nicht drin ist.
 *
 * @param {string} zeitraum – 'gesamt' | 'monat' | 'jahr'
 * @returns {Promise<Array<{platz:number, benutzername:string, xp:number, ich:boolean}>|null>}
 *   null = nicht verfügbar
 */
export async function ladeRangliste(anzahl = 10, zeitraum = 'gesamt') {
  if (!supabaseBereit) return null
  const { data, error } = await db.rpc('rangliste_zeitraum', { zeitraum, anzahl })
  // Solange die zweite Migration fehlt, gibt es wenigstens die
  // Gesamtliste über die ältere Funktion.
  if (error && zeitraum === 'gesamt') {
    const alt = await db.rpc('rangliste', { anzahl })
    if (alt.error) return null
    return alt.data.map((z) => ({ ...z, platz: Number(z.platz) }))
  }
  if (error) return null
  return data.map((z) => ({ ...z, platz: Number(z.platz) }))
}

/**
 * Hält fest, wie viele XP an einem Tag verdient wurden.
 *
 * Ohne das gäbe es nur den Gesamtstand – Monat und Jahr liessen
 * sich nicht berechnen. Fehlschläge sind hier bewusst still: Das
 * Lernen soll nicht an der Rangliste scheitern.
 */
export async function merkeTagesXp(tag, punkte) {
  if (!supabaseBereit || !tag) return
  try {
    await db.rpc('xp_tag_merken', { tag, punkte: Math.max(0, Math.round(punkte || 0)) })
  } catch {
    /* Migration fehlt oder offline – egal, beim nächsten Mal wieder */
  }
}
