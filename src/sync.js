/**
 * Abgleich zwischen Browser-Speicher und Datenbank.
 *
 * Grundregel: Angemeldet ist die Datenbank die Wahrheit, der Browser
 * dient nur noch als schneller Zwischenspeicher. Beim ersten Anmelden
 * werden vorhandene lokale Vokabeln übernommen, damit niemand seinen
 * bisherigen Fortschritt verliert.
 */

import { db } from './supabase.js'
import { INTERVALS_DAYS } from './srs.js'

/**
 * Der Abstand eines Eintrags in Tagen – als Mass fuer „wie weit ist
 * dieses Wort?". Bei alten Eintraegen ohne intervall die Stufe.
 */
function abstand(eintrag) {
  return eintrag?.intervall ?? INTERVALS_DAYS[eintrag?.level ?? 0] ?? 0
}

// ---------------------------------------------------------------
//  Umrechnung zwischen App-Format und Datenbank-Spalten
// ---------------------------------------------------------------

// Die App hält Vokabeln als Objekt: { "hola": { translation, level, … } }
// Die Datenbank speichert eine Zeile pro Wort. Diese beiden Funktionen
// rechnen zwischen den Formaten um.

// Kennt die Datenbank die feinen Felder schon?
//
// intervall und leichtigkeit sind erst am 20.08. dazugekommen. Bis
// die beiden Spalten in Supabase angelegt sind, wuerde jeder Schreib-
// versuch mit ihnen scheitern – und zwar der GANZE Abgleich, nicht
// nur diese zwei Werte. Deshalb faellt speichereVokabeln() beim
// ersten "Spalte gibt es nicht" auf die alte Form zurueck und merkt
// es sich fuer diese Sitzung. Die App laeuft dann wie vorher weiter,
// nur ohne feine Abstaende.
let feineFelderDa = true

/** Ein App-Eintrag → Datenbank-Zeile */
function zuDatenbank(wortEs, eintrag, nutzerId) {
  const zeile = {
    nutzer_id: nutzerId,
    wort_es: wortEs,
    uebersetzung: eintrag.translation ?? '',
    beispielsatz: eintrag.source || null,
    kategorie: eintrag.status ?? 'neu', // neu | lernen | gewusst
    stufe: eintrag.level ?? 0,
    faellig_am: new Date(eintrag.due ?? Date.now()).toISOString(),
    richtig: eintrag.richtig ?? 0,
    falsch: eintrag.falsch ?? 0,
  }
  // Der eigentliche Punkt: OHNE diese beiden faellt der Abstand beim
  // naechsten App-Start auf die grobe Leiter [0,1,3,7,14,30,90]
  // zurueck. Mit "Gut" haengt dann jedes Wort fuer immer bei
  // 2,5 Tagen – 1 mal 2,5 ergibt 2,5, das rundet auf Stufe 1 ab,
  // Stufe 1 heisst wieder 1 Tag, und das Spiel beginnt von vorn.
  if (feineFelderDa) {
    zeile.intervall = eintrag.intervall ?? null
    zeile.leichtigkeit = eintrag.leichtigkeit ?? null
  }
  return zeile
}

/** Datenbank-Zeile → App-Eintrag (Schlüssel + Wert getrennt) */
function zuApp(zeile) {
  const eintrag = {
    status: zeile.kategorie ?? 'neu',
    translation: zeile.uebersetzung,
    level: zeile.stufe ?? 0,
    due: zeile.faellig_am ? new Date(zeile.faellig_am).getTime() : Date.now(),
    addedAt: new Date(zeile.erstellt_am ?? Date.now()).getTime(),
    source: zeile.beispielsatz ?? '',
    richtig: zeile.richtig ?? 0,
    falsch: zeile.falsch ?? 0,
  }
  // Nur setzen, wenn wirklich etwas dasteht: Bei alten Zeilen sind
  // die Spalten null. Ein null im Eintrag wuerde zustand() in srs.js
  // den Rueckfall auf die Stufe verbauen – undefined nicht.
  if (zeile.intervall != null) eintrag.intervall = zeile.intervall
  if (zeile.leichtigkeit != null) eintrag.leichtigkeit = zeile.leichtigkeit
  return [zeile.wort_es, eintrag]
}

// ---------------------------------------------------------------
//  Vokabeln
// ---------------------------------------------------------------

/** Lädt alle Vokabeln des Nutzers – im App-Format { wort: {…} }. */
export async function ladeVokabeln(nutzerId) {
  const { data, error } = await db
    .from('vokabeln')
    .select('*')
    .eq('nutzer_id', nutzerId)

  if (error) throw new Error(error.message)
  return Object.fromEntries(data.map(zuApp))
}

/**
 * Schreibt Vokabeln in die Datenbank. Schon vorhandene Wörter
 * werden aktualisiert statt doppelt angelegt.
 * @param {object} vokabeln – im App-Format { wort: {…} }
 */
export async function speichereVokabeln(nutzerId, vokabeln) {
  if (!Object.keys(vokabeln).length) return

  const schreiben = () =>
    db
      .from('vokabeln')
      .upsert(
        Object.entries(vokabeln).map(([wort, eintrag]) => zuDatenbank(wort, eintrag, nutzerId)),
        { onConflict: 'nutzer_id,wort_es' }
      )

  let { error } = await schreiben()

  // Fehlen die neuen Spalten noch, einmal ohne sie versuchen. Sonst
  // koennte niemand mehr Vokabeln sichern, nur weil in Supabase ein
  // ALTER TABLE aussteht.
  if (error && fehltSpalte(error)) {
    feineFelderDa = false
    console.warn(
      'Die Spalten intervall/leichtigkeit fehlen in der Tabelle vokabeln. ' +
        'Der Abgleich laeuft ohne sie weiter – die Abstaende bleiben dann grob. ' +
        'SQL zum Nachruesten steht in TODO.md.'
    )
    ;({ error } = await schreiben())
  }

  if (error) throw new Error(error.message)
}

/** Meckert PostgREST ueber eine Spalte, die es nicht gibt? */
function fehltSpalte(error) {
  if (error.code === 'PGRST204') return true
  // Der Guertel zum Hosentraeger, falls eine andere PostgREST-Version
  // denselben Fall ohne eigenen Code meldet. NICHT nach "column <name>"
  // suchen: Die echte Meldung lautet "Could not find the 'intervall'
  // column of 'vokabeln' in the schema cache" – dort steht der Name
  // VOR dem Wort column. Am 20.08. nachgemessen.
  const text = error.message ?? ''
  return /intervall|leichtigkeit/i.test(text) && /column|schema/i.test(text)
}

/** Löscht eine Vokabel. */
export async function loescheVokabel(nutzerId, wortEs) {
  const { error } = await db
    .from('vokabeln')
    .delete()
    .eq('nutzer_id', nutzerId)
    .eq('wort_es', wortEs)

  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------
//  Statistik (XP, Level, Serie)
// ---------------------------------------------------------------

export async function ladeStatistik(nutzerId) {
  const { data, error } = await db
    .from('statistik')
    .select('*')
    .eq('nutzer_id', nutzerId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  return {
    xp: data.xp,
    level: data.level,
    streak: data.serie,
    lastDay: data.letzter_tag,
    xpToday: data.xp_heute,
  }
}

export async function speichereStatistik(nutzerId, stats) {
  const { error } = await db.from('statistik').upsert(
    {
      nutzer_id: nutzerId,
      xp: stats.xp ?? 0,
      level: stats.level ?? 1,
      serie: stats.streak ?? 0,
      letzter_tag: stats.lastDay ?? null,
      xp_heute: stats.xpToday ?? 0,
      aktualisiert_am: new Date().toISOString(),
    },
    { onConflict: 'nutzer_id' }
  )

  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------
//  Lektions-Fortschritt
// ---------------------------------------------------------------

export async function ladeFortschritt(nutzerId) {
  const { data, error } = await db
    .from('lektion_fortschritt')
    .select('lektion_id')
    .eq('nutzer_id', nutzerId)

  if (error) throw new Error(error.message)

  // Ins App-Format: { begruessung: { fertig: true }, … }
  return Object.fromEntries(data.map((z) => [z.lektion_id, { fertig: true }]))
}

export async function speichereFortschritt(nutzerId, lektionId) {
  const { error } = await db
    .from('lektion_fortschritt')
    .upsert(
      { nutzer_id: nutzerId, lektion_id: lektionId },
      { onConflict: 'nutzer_id,lektion_id' }
    )

  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------
//  Erstes Anmelden: lokale Daten übernehmen
// ---------------------------------------------------------------

/**
 * Führt lokale und gespeicherte Daten zusammen und gibt den
 * gemeinsamen Stand zurück. Bei Vokabeln, die es doppelt gibt,
 * gewinnt der weitere Abstand.
 *
 * Verglichen wird der Abstand in Tagen, nicht die Stufe: Die Stufe
 * ist nur eine grobe Einordnung, und zwei Woerter mit 1 und mit
 * 39 Tagen liegen beide auf Stufe 1. Bei Gleichstand gewann bisher
 * die Datenbankfassung – und mit ihr der kleinere Abstand.
 */
export async function zusammenfuehren(nutzerId, lokal) {
  const ausDb = await ladeVokabeln(nutzerId)
  const vereint = { ...ausDb }

  for (const [wort, eintrag] of Object.entries(lokal.vokabeln ?? {})) {
    const vorhanden = vereint[wort]
    if (!vorhanden || abstand(eintrag) > abstand(vorhanden)) {
      vereint[wort] = eintrag
    }
  }

  // Alles zurückschreiben, damit beide Seiten denselben Stand haben
  await speichereVokabeln(nutzerId, vereint)

  // Statistik: der höhere XP-Stand gewinnt
  const dbStats = await ladeStatistik(nutzerId)
  const lokaleStats = lokal.stats ?? {}
  const stats =
    (dbStats?.xp ?? 0) >= (lokaleStats.xp ?? 0) ? (dbStats ?? lokaleStats) : lokaleStats
  await speichereStatistik(nutzerId, stats)

  // Lektionen: alles zusammen, was irgendwo erledigt ist
  const dbFortschritt = await ladeFortschritt(nutzerId)
  const fortschritt = { ...(lokal.fortschritt ?? {}), ...dbFortschritt }
  const neueLektionen = Object.keys(fortschritt).filter((id) => !dbFortschritt[id])
  for (const id of neueLektionen) await speichereFortschritt(nutzerId, id)

  return { vokabeln: vereint, stats, fortschritt }
}
