/**
 * Die Textsammlung.
 *
 * Aufgebaut wie der Satz-Karteikasten (saetze.js): ein Objekt, dessen
 * Schlüssel diesmal eine erzeugte Kennung ist – zwei Texte dürfen
 * denselben Titel haben, zwei Sätze nicht.
 *
 * {
 *   "t-1760...": {
 *     titelEs, titelDe,
 *     absaetze: [{ es, de }, …],
 *     woerter:  [{ wort, uebersetzung }, …],
 *     merksatz, gebiet, stufe,
 *     gelesen: 3,                       // wie oft schon durchgelesen
 *     level, intervall, leichtigkeit, due, status   (aus srs.js)
 *   }
 * }
 *
 * Warum dieselbe Wiederhol-Logik wie bei Karten? Weil ein Text beim
 * zweiten und dritten Lesen am meisten bringt – und genau das sonst
 * nie passiert.
 */

import { db } from './supabase.js'
import { newEntry } from './srs.js'

const SPEICHER = 'lesetexte'

/** Die Texte aus dem Browser lesen. */
export function ladeTexteLokal() {
  try {
    return JSON.parse(localStorage.getItem(SPEICHER)) ?? {}
  } catch {
    return {}
  }
}

/** Und wieder hineinschreiben. */
export function speichereTexteLokal(texte) {
  try {
    localStorage.setItem(SPEICHER, JSON.stringify(texte))
  } catch {
    // Voller oder gesperrter Speicher: lieber nichts tun als abstürzen
  }
}

/** Einen frischen Text anlegen – mit allem, was srs.js braucht. */
export function neuerText(roh) {
  return {
    ...newEntry(roh.titel_de ?? '', 'Lesetext'),
    status: 'lernen',
    titelEs: roh.titel_es ?? '',
    titelDe: roh.titel_de ?? '',
    absaetze: roh.absaetze ?? [],
    woerter: roh.woerter ?? [],
    merksatz: roh.merksatz ?? '',
    gebiet: roh.gebiet ?? '',
    stufe: roh.stufe ?? 'b1',
    gelesen: 0,
    erstelltAm: Date.now(),
  }
}

/** Eine Kennung, unter der der Text abgelegt wird. */
export function textSchluessel() {
  return 't-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7)
}

// ---------------------------------------------------------------
//  Abgleich mit der Datenbank
// ---------------------------------------------------------------
//
// Wie bei den Sätzen: Die Tabelle `lesetexte` wird einmalig per SQL
// angelegt (datenbank/supabase-lesetexte.sql). Solange sie fehlt,
// geben beide Funktionen still auf, und die Texte liegen nur im
// Browser. Sobald sie da ist, synchronisiert die App von selbst.

let tabelleDa = true

function zuDatenbank(id, e, nutzerId) {
  return {
    nutzer_id: nutzerId,
    text_id: id,
    titel_es: e.titelEs ?? '',
    titel_de: e.titelDe ?? '',
    absaetze: e.absaetze ?? [],
    woerter: e.woerter ?? [],
    merksatz: e.merksatz ?? '',
    gebiet: e.gebiet ?? '',
    stufe: e.stufe ?? 'b1',
    gelesen: e.gelesen ?? 0,
    kategorie: e.status ?? 'lernen',
    kartenstufe: e.level ?? 0,
    intervall: e.intervall ?? null,
    leichtigkeit: e.leichtigkeit ?? null,
    faellig_am: new Date(e.due ?? Date.now()).toISOString(),
  }
}

function zuApp(z) {
  return [
    z.text_id,
    {
      titelEs: z.titel_es ?? '',
      titelDe: z.titel_de ?? '',
      absaetze: z.absaetze ?? [],
      woerter: z.woerter ?? [],
      merksatz: z.merksatz ?? '',
      gebiet: z.gebiet ?? '',
      stufe: z.stufe ?? 'b1',
      gelesen: z.gelesen ?? 0,
      status: z.kategorie ?? 'lernen',
      level: z.kartenstufe ?? 0,
      intervall: z.intervall ?? undefined,
      leichtigkeit: z.leichtigkeit ?? undefined,
      due: z.faellig_am ? new Date(z.faellig_am).getTime() : Date.now(),
      translation: z.titel_de ?? '',
    },
  ]
}

/** Alle Texte eines Nutzers holen. null, wenn es die Tabelle nicht gibt. */
export async function ladeTexte(nutzerId) {
  if (!tabelleDa || !nutzerId) return null
  const { data, error } = await db.from('lesetexte').select('*').eq('nutzer_id', nutzerId)
  if (error) {
    tabelleDa = false
    return null
  }
  return Object.fromEntries(data.map(zuApp))
}

/** Alle Texte speichern. Still wirkungslos, solange die Tabelle fehlt. */
export async function speichereTexte(nutzerId, texte) {
  if (!tabelleDa || !nutzerId) return
  const zeilen = Object.entries(texte).map(([id, e]) => zuDatenbank(id, e, nutzerId))
  if (!zeilen.length) return
  const { error } = await db.from('lesetexte').upsert(zeilen, { onConflict: 'nutzer_id,text_id' })
  if (error) tabelleDa = false
}
