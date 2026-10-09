/**
 * Der Satz-Karteikasten.
 *
 * Aufgebaut wie der Vokabelspeicher: ein Objekt, dessen Schlüssel der
 * spanische Satz ist. Dadurch kann derselbe Satz nicht zweimal
 * hineinrutschen, und die Wiederhol-Logik aus srs.js passt ohne
 * Änderung – sie rechnet nur mit level, intervall und due, nicht mit
 * dem Inhalt der Karte.
 *
 * {
 *   "me gustaría visitar españa": {
 *     translation: 'Ich würde gerne Spanien besuchen.',
 *     schluessel:  'gustaría',        // worauf es im Satz ankommt
 *     anzeige:     'Me gustaría …',   // der Satz mit Original-Schreibung
 *     thema:       'Reisen',
 *     zeitform:    'condicional',
 *     level, intervall, leichtigkeit, due, status …   (aus srs.js)
 *   }
 * }
 *
 * Warum klein geschrieben als Schlüssel? Damit "Me gustaría…" und
 * "me gustaría…" derselbe Satz sind. Die Originalschreibung steht in
 * `anzeige` und wird angezeigt.
 */

import { db } from './supabase.js'
import { newEntry } from './srs.js'

const SPEICHER = 'saetze'

/** Aus einem Satz den Schlüssel machen, unter dem er abgelegt wird. */
export function satzSchluessel(satz) {
  return String(satz).toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Die gemerkten Sätze aus dem Browser lesen. */
export function ladeSaetzeLokal() {
  try {
    return JSON.parse(localStorage.getItem(SPEICHER)) ?? {}
  } catch {
    return {}
  }
}

/** Und wieder hineinschreiben. */
export function speichereSaetzeLokal(saetze) {
  try {
    localStorage.setItem(SPEICHER, JSON.stringify(saetze))
  } catch {
    // Voller oder gesperrter Speicher: lieber nichts tun als abstürzen
  }
}

/**
 * Einen frischen Satz anlegen – mit allen Feldern, die srs.js braucht.
 *
 * @param {object} s – { satz, uebersetzung, schluessel }
 * @param {object} herkunft – { thema, zeitform }
 */
export function neuerSatz(s, herkunft = {}) {
  return {
    ...newEntry(s.uebersetzung, herkunft.thema ? 'Sätze: ' + herkunft.thema : ''),
    status: 'lernen',
    anzeige: s.satz,
    schluessel: s.schluessel ?? '',
    thema: herkunft.thema ?? '',
    zeitform: herkunft.zeitform ?? '',
  }
}

// ---------------------------------------------------------------
//  Abgleich mit der Datenbank
// ---------------------------------------------------------------
//
// Die Tabelle `saetze` gibt es in Supabase noch nicht – sie wird
// einmalig per SQL angelegt (siehe datenbank/saetze.sql). Solange sie
// fehlt, antwortet Supabase mit einem Fehler, und beide Funktionen
// hier geben still auf: Der Satz-Trainer läuft dann nur im Browser
// weiter, statt mit einer roten Meldung stehenzubleiben. Sobald die
// Tabelle da ist, synchronisiert er von selbst – ohne Code-Änderung.

let tabelleDa = true

/** Ein App-Eintrag → eine Datenbank-Zeile */
function zuDatenbank(satz, e, nutzerId) {
  return {
    nutzer_id: nutzerId,
    satz_es: satz,
    anzeige: e.anzeige ?? satz,
    uebersetzung: e.translation ?? '',
    schluesselwort: e.schluessel ?? '',
    thema: e.thema ?? '',
    zeitform: e.zeitform ?? '',
    kategorie: e.status ?? 'lernen',
    stufe: e.level ?? 0,
    intervall: e.intervall ?? null,
    leichtigkeit: e.leichtigkeit ?? null,
    faellig_am: new Date(e.due ?? Date.now()).toISOString(),
    richtig: e.richtig ?? 0,
    falsch: e.falsch ?? 0,
  }
}

/** Eine Datenbank-Zeile → App-Eintrag */
function zuApp(z) {
  return [
    z.satz_es,
    {
      translation: z.uebersetzung ?? '',
      anzeige: z.anzeige ?? z.satz_es,
      schluessel: z.schluesselwort ?? '',
      thema: z.thema ?? '',
      zeitform: z.zeitform ?? '',
      status: z.kategorie ?? 'lernen',
      level: z.stufe ?? 0,
      intervall: z.intervall ?? undefined,
      leichtigkeit: z.leichtigkeit ?? undefined,
      due: z.faellig_am ? new Date(z.faellig_am).getTime() : Date.now(),
      richtig: z.richtig ?? 0,
      falsch: z.falsch ?? 0,
    },
  ]
}

/** Alle Sätze eines Nutzers holen. Gibt null zurück, wenn es sie nicht gibt. */
export async function ladeSaetze(nutzerId) {
  if (!tabelleDa || !nutzerId) return null
  const { data, error } = await db.from('saetze').select('*').eq('nutzer_id', nutzerId)
  if (error) {
    tabelleDa = false
    return null
  }
  return Object.fromEntries(data.map(zuApp))
}

/** Alle Sätze speichern. Still wirkungslos, solange die Tabelle fehlt. */
export async function speichereSaetze(nutzerId, saetze) {
  if (!tabelleDa || !nutzerId) return
  const zeilen = Object.entries(saetze).map(([satz, e]) => zuDatenbank(satz, e, nutzerId))
  if (!zeilen.length) return
  const { error } = await db.from('saetze').upsert(zeilen, { onConflict: 'nutzer_id,satz_es' })
  if (error) tabelleDa = false
}

/** Einen Satz löschen. */
export async function loescheSatz(nutzerId, satz) {
  if (!tabelleDa || !nutzerId) return
  await db.from('saetze').delete().eq('nutzer_id', nutzerId).eq('satz_es', satz)
}
