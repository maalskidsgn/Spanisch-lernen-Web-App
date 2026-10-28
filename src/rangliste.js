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
  ['woche', 'Woche'],
  ['monat', 'Monat'],
  ['jahr', 'Jahr'],
  ['gesamt', 'Gesamt'],
]

/**
 * Top 10 plus der eigene Platz, falls man nicht drin ist.
 *
 * @param {string} zeitraum – 'gesamt' | 'monat' | 'jahr'
 * @returns {Promise<Array<{platz:number, benutzername:string, xp:number, ich:boolean}>|null>}
 *   null = nicht verfügbar
 */
export async function ladeRangliste(anzahl = 10, zeitraum = 'gesamt', nurFreunde = false) {
  if (!supabaseBereit) return null
  const { data, error } = await db.rpc('rangliste_zeitraum', {
    zeitraum, anzahl, nur_freunde: nurFreunde,
  })
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

/**
 * Das öffentliche Profil einer Person aus der Rangliste.
 *
 * Gibt nur heraus, was öffentlich sein soll – keine E-Mail, keine
 * Nutzer-ID. Die Datenbank-Funktion sorgt dafür, nicht der Browser:
 * Was hier nicht ankommt, kann auch niemand abfangen.
 *
 * @returns {Promise<object|null>} null = nicht gefunden oder nicht verfügbar
 */
export async function ladeProfil(benutzername) {
  if (!supabaseBereit || !benutzername) return null
  const { data, error } = await db.rpc('profil_oeffentlich', { name: benutzername })
  if (error || !data?.length) return null
  const p = data[0]
  return { ...p, platz: Number(p.platz) }
}

// ---------------------------------------------------------------
//  Profilbild
// ---------------------------------------------------------------

const EIMER = 'profilbilder'

/** Öffentliche Adresse eines Bildes – oder null. */
export function bildAdresse(pfad) {
  if (!pfad || !supabaseBereit) return null
  const { data } = db.storage.from(EIMER).getPublicUrl(pfad)
  return data?.publicUrl ?? null
}

/**
 * Verkleinert ein Bild auf 400 × 400 und schneidet es mittig quadratisch.
 *
 * Warum im Browser und nicht auf dem Server: Ein Handyfoto hat
 * schnell 4 MB. Das hochzuladen dauert im Mobilfunk spürbar, und
 * gebraucht werden am Ende 80 Kilobyte.
 */
function verkleinern(datei, kante = 400) {
  return new Promise((fertig, fehler) => {
    const bild = new Image()
    const adresse = URL.createObjectURL(datei)
    bild.onload = () => {
      URL.revokeObjectURL(adresse)
      const seite = Math.min(bild.width, bild.height)
      const x = (bild.width - seite) / 2
      const y = (bild.height - seite) / 2
      const c = document.createElement('canvas')
      c.width = c.height = kante
      const g = c.getContext('2d')
      g.drawImage(bild, x, y, seite, seite, 0, 0, kante, kante)
      c.toBlob((b) => (b ? fertig(b) : fehler(new Error('Bild ließ sich nicht umwandeln.'))),
        'image/jpeg', 0.86)
    }
    bild.onerror = () => {
      URL.revokeObjectURL(adresse)
      fehler(new Error('Das ist kein Bild, das wir lesen können.'))
    }
    bild.src = adresse
  })
}

/**
 * Lädt ein Profilbild hoch und merkt den Pfad im Profil.
 * @returns {Promise<string>} die öffentliche Adresse
 */
export async function setzeProfilbild(nutzerId, datei) {
  if (!supabaseBereit || !nutzerId) throw new Error('Bitte zuerst anmelden.')
  if (!datei.type.startsWith('image/')) throw new Error('Bitte ein Bild auswählen.')

  const klein = await verkleinern(datei)
  // Der Name wechselt bei jedem Mal, sonst zeigt der Browser noch
  // tagelang das alte Bild aus seinem Zwischenspeicher.
  const pfad = `${nutzerId}/${Date.now()}.jpg`

  const hoch = await db.storage.from(EIMER).upload(pfad, klein, {
    contentType: 'image/jpeg',
    upsert: true,
  })
  if (hoch.error) throw new Error('Hochladen fehlgeschlagen: ' + hoch.error.message)

  // Das alte Bild wegräumen, damit der Speicher nicht zuwächst
  const { data: vorher } = await db.from('profile').select('bild').eq('id', nutzerId).maybeSingle()
  const { error } = await db.from('profile').upsert({ id: nutzerId, bild: pfad }, { onConflict: 'id' })
  if (error) throw new Error('Speichern fehlgeschlagen: ' + error.message)
  if (vorher?.bild && vorher.bild !== pfad) {
    db.storage.from(EIMER).remove([vorher.bild]).catch(() => {})
  }

  window.dispatchEvent(new CustomEvent('profilbild', { detail: pfad }))
  return bildAdresse(pfad)
}

/** Entfernt das Profilbild wieder. */
export async function loescheProfilbild(nutzerId) {
  if (!supabaseBereit || !nutzerId) return
  const { data } = await db.from('profile').select('bild').eq('id', nutzerId).maybeSingle()
  await db.from('profile').upsert({ id: nutzerId, bild: null }, { onConflict: 'id' })
  if (data?.bild) db.storage.from(EIMER).remove([data.bild]).catch(() => {})
  window.dispatchEvent(new CustomEvent('profilbild', { detail: '' }))
}

/** Der eigene Bildpfad – für den Profilkopf. */
export async function ladeProfilbild(nutzerId) {
  if (!supabaseBereit || !nutzerId) return null
  const { data, error } = await db.from('profile').select('bild').eq('id', nutzerId).maybeSingle()
  if (error) return null
  return data?.bild ?? null
}

// ---------------------------------------------------------------
//  Freunde
// ---------------------------------------------------------------

/**
 * Sucht nach Benutzernamen. Ab zwei Zeichen, höchstens 20 Treffer.
 * Jeder Treffer sagt mit, wie man zueinander steht:
 * 'ich' | 'freund' | 'gesendet' | 'wartet' | 'fremd'
 */
export async function sucheNutzer(was) {
  if (!supabaseBereit || (was || '').trim().length < 2) return []
  const { data, error } = await db.rpc('nutzer_suchen', { was })
  return error ? [] : data
}

/** Meine Freunde und alle offenen Anfragen in einer Liste. */
export async function ladeFreunde() {
  if (!supabaseBereit) return []
  const { data, error } = await db.rpc('meine_freunde')
  return error ? [] : data
}

/**
 * Freundschaft anfragen.
 * @returns {Promise<string>} 'gesendet' | 'freund' | 'unbekannt' | 'ich'
 *   'freund' heisst: Die andere Seite hatte schon angefragt – damit
 *   ist die Freundschaft sofort geschlossen.
 */
export async function frageFreund(benutzername) {
  if (!supabaseBereit) throw new Error('Bitte zuerst anmelden.')
  const { data, error } = await db.rpc('freund_anfragen', { name: benutzername })
  if (error) throw new Error(error.message)
  window.dispatchEvent(new CustomEvent('freunde'))
  return data
}

/** Eine Anfrage annehmen. */
export async function nimmAn(anfrageId) {
  const { error } = await db.from('freunde').update({ status: 'angenommen' }).eq('id', anfrageId)
  if (error) throw new Error(error.message)
  window.dispatchEvent(new CustomEvent('freunde'))
}

/** Anfrage ablehnen, zurückziehen oder Freundschaft beenden – alles dasselbe. */
export async function beende(anfrageId) {
  const { error } = await db.from('freunde').delete().eq('id', anfrageId)
  if (error) throw new Error(error.message)
  window.dispatchEvent(new CustomEvent('freunde'))
}
