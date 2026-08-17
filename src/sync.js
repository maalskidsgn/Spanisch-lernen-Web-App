/**
 * Abgleich zwischen Browser-Speicher und Datenbank.
 *
 * Grundregel: Angemeldet ist die Datenbank die Wahrheit, der Browser
 * dient nur noch als schneller Zwischenspeicher. Beim ersten Anmelden
 * werden vorhandene lokale Vokabeln übernommen, damit niemand seinen
 * bisherigen Fortschritt verliert.
 */

import { db } from './supabase.js'

// ---------------------------------------------------------------
//  Umrechnung zwischen App-Format und Datenbank-Spalten
// ---------------------------------------------------------------

// Die App hält Vokabeln als Objekt: { "hola": { translation, level, … } }
// Die Datenbank speichert eine Zeile pro Wort. Diese beiden Funktionen
// rechnen zwischen den Formaten um.

/** Ein App-Eintrag → Datenbank-Zeile */
function zuDatenbank(wortEs, eintrag, nutzerId) {
  return {
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
}

/** Datenbank-Zeile → App-Eintrag (Schlüssel + Wert getrennt) */
function zuApp(zeile) {
  return [
    zeile.wort_es,
    {
      status: zeile.kategorie ?? 'neu',
      translation: zeile.uebersetzung,
      level: zeile.stufe ?? 0,
      due: zeile.faellig_am ? new Date(zeile.faellig_am).getTime() : Date.now(),
      addedAt: new Date(zeile.erstellt_am ?? Date.now()).getTime(),
      source: zeile.beispielsatz ?? '',
      richtig: zeile.richtig ?? 0,
      falsch: zeile.falsch ?? 0,
    },
  ]
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
  const zeilen = Object.entries(vokabeln).map(([wort, eintrag]) =>
    zuDatenbank(wort, eintrag, nutzerId)
  )
  if (!zeilen.length) return

  const { error } = await db
    .from('vokabeln')
    .upsert(zeilen, { onConflict: 'nutzer_id,wort_es' })

  if (error) throw new Error(error.message)
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
 * gewinnt die weiter fortgeschrittene Karteikasten-Stufe.
 */
export async function zusammenfuehren(nutzerId, lokal) {
  const ausDb = await ladeVokabeln(nutzerId)
  const vereint = { ...ausDb }

  for (const [wort, eintrag] of Object.entries(lokal.vokabeln ?? {})) {
    const vorhanden = vereint[wort]
    if (!vorhanden || (eintrag.level ?? 0) > (vorhanden.level ?? 0)) {
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
