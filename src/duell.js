/**
 * Duell: zu zweit gegeneinander Vokabeln raten.
 *
 * Sieben Fragen, beide bekommen dieselben, jeder spielt wann er will.
 * Wer mehr richtig hat, gewinnt – bei Gleichstand die schnellere Zeit.
 *
 * Kein Echtzeit-Spiel: Zwei Leute gleichzeitig vor dem Handy zu haben,
 * klappt in einer Lern-App praktisch nie, und eine Lobby, in der man
 * auf jemanden wartet, der nicht kommt, ist schlimmer als gar kein
 * Spiel.
 */

import { db, supabaseBereit } from './supabase.js'
import { LEKTIONEN, mischen } from './lektionen.js'
import { ladeBlockierte, ohneBlockierte } from './rangliste.js'

/** So viele Fragen hat ein Duell. */
export const FRAGEN = 7

/** So lange hat man je Frage. Danach zählt sie als falsch. */
export const SEKUNDEN = 10

/** Was es fürs Mitspielen gibt – unabhängig vom Ausgang. */
export const XP_GESPIELT = 40

/** Obendrauf für den Sieg. */
export const XP_SIEG = 60

/* ---------------------------------------------------------------- *
 *  Fragen bauen
 * ---------------------------------------------------------------- */

/**
 * Alle Vokabeln aus allen Lektionen, doppelte raus.
 *
 * Bewusst der ganze Kurs und nicht die eigenen Karteikarten: Beide
 * sollen dieselbe Chance haben. Wer nur seine eigenen fälligen Wörter
 * bekäme, hätte ein Heimspiel.
 */
function alleVokabeln() {
  const gesehen = new Set()
  const raus = []
  for (const l of LEKTIONEN) {
    for (const i of l.items || []) {
      if (!i?.es || !i?.de) continue
      // Zu lange Begriffe passen nicht auf die Antwortknöpfe
      if (i.de.length > 26 || i.es.length > 26) continue
      const schluessel = i.es.toLowerCase()
      if (gesehen.has(schluessel)) continue
      gesehen.add(schluessel)
      raus.push({ es: i.es, de: i.de })
    }
  }
  return raus
}

/**
 * Sieben Fragen mit je vier Antworten.
 *
 * Die falschen Antworten kommen aus demselben Topf – ein Wort gegen
 * drei offensichtlich unpassende zu stellen, wäre keine Frage.
 */
export function baueFragen() {
  const topf = alleVokabeln()
  if (topf.length < 10) return []

  const gewaehlt = mischen([...topf]).slice(0, FRAGEN)
  return gewaehlt.map((wort) => {
    const falsche = []
    const schonDrin = new Set([wort.de.toLowerCase()])
    // Solange ziehen, bis drei verschiedene falsche Antworten da sind.
    // Der Zähler bricht ab, falls der Topf zu einseitig ist – sonst
    // könnte das hier theoretisch ewig laufen.
    for (let versuch = 0; falsche.length < 3 && versuch < 200; versuch++) {
      const k = topf[Math.floor(Math.random() * topf.length)]
      if (schonDrin.has(k.de.toLowerCase())) continue
      schonDrin.add(k.de.toLowerCase())
      falsche.push(k.de)
    }
    return {
      es: wort.es,
      richtig: wort.de,
      antworten: mischen([wort.de, ...falsche]),
    }
  })
}

/* ---------------------------------------------------------------- *
 *  Datenbank
 * ---------------------------------------------------------------- */

/** Fordert jemanden heraus. Gibt die Duell-ID zurück. */
export async function duellStarten(gegner) {
  if (!supabaseBereit) throw new Error('Bitte zuerst anmelden.')
  const fragen = baueFragen()
  if (!fragen.length) throw new Error('Gerade keine Fragen verfügbar.')
  const { data, error } = await db.rpc('duell_starten', { gegner, fragen })
  if (error) throw new Error(error.message)
  window.dispatchEvent(new CustomEvent('duelle'))
  return data
}

/** Alle eigenen Duelle – offene zuerst. */
export async function ladeDuelle() {
  if (!supabaseBereit) return []
  // Laufende Duelle gegen Blockierte loescht die Datenbank beim
  // Blockieren; abgeschlossene bleiben stehen und werden hier
  // ausgeblendet.
  await ladeBlockierte()
  const { data, error } = await db.rpc('meine_duelle')
  return error ? [] : ohneBlockierte(data || [], 'gegner')
}

/** Das eigene Ergebnis eintragen. Geht je Duell nur einmal. */
export async function duellAbgeben(id, punkte, zeit) {
  const { error } = await db.rpc('duell_abgeben', {
    duell: id,
    punkte,
    // Millisekunden, aber gedeckelt: Wer die App zwischendurch
    // weglegt, soll keine absurde Zahl in der Tabelle hinterlassen.
    zeit: Math.min(zeit, FRAGEN * SEKUNDEN * 1000),
  })
  if (error) throw new Error(error.message)
  window.dispatchEvent(new CustomEvent('duelle'))
}

/** Ein angefangenes Duell wegräumen oder ein fertiges ausblenden. */
export async function duellLoeschen(id) {
  const { error } = await db.from('duelle').delete().eq('id', id)
  if (error) throw new Error(error.message)
  window.dispatchEvent(new CustomEvent('duelle'))
}

/* ---------------------------------------------------------------- *
 *  Auswerten
 * ---------------------------------------------------------------- */

/**
 * In welchem Zustand ist ein Duell?
 * 'ich_dran' | 'er_dran' | 'gewonnen' | 'verloren' | 'unentschieden'
 */
export function stand(d) {
  if (d.punkte_ich === null || d.punkte_ich === undefined) return 'ich_dran'
  if (d.punkte_gegner === null || d.punkte_gegner === undefined) return 'er_dran'
  if (d.punkte_ich > d.punkte_gegner) return 'gewonnen'
  if (d.punkte_ich < d.punkte_gegner) return 'verloren'
  // Gleich viele Treffer: Die schnellere Zeit entscheidet. Fehlt sie
  // (alte Zeilen), bleibt es ehrlich beim Unentschieden.
  if (d.zeit_ich == null || d.zeit_gegner == null) return 'unentschieden'
  if (d.zeit_ich < d.zeit_gegner) return 'gewonnen'
  if (d.zeit_ich > d.zeit_gegner) return 'verloren'
  return 'unentschieden'
}

/* ---------------------------------------------------------------- *
 *  Siegbonus
 * ---------------------------------------------------------------- */

const BELOHNT = 'duelle-belohnt'

function schonBelohnt() {
  try {
    const roh = JSON.parse(localStorage.getItem(BELOHNT))
    return Array.isArray(roh) ? new Set(roh) : new Set()
  } catch {
    return new Set()
  }
}

/**
 * Wie viele XP für frisch gewonnene Duelle fällig sind.
 *
 * Der Sieg steht erst fest, wenn beide gespielt haben – also kann der
 * Bonus nicht am Ende des eigenen Spiels vergeben werden. Stattdessen
 * wird beim Laden der Liste nachgeschaut, was neu gewonnen ist.
 *
 * Welche Duelle schon belohnt wurden, liegt im Browser. Auf einem
 * zweiten Gerät gäbe es den Bonus nochmal – verschmerzbar, und
 * besser, als dafür eine weitere Spalte zu pflegen.
 */
export function neueSiege(duelle) {
  const schon = schonBelohnt()
  const neu = duelle.filter((d) => stand(d) === 'gewonnen' && !schon.has(d.id))
  if (!neu.length) return []
  for (const d of neu) schon.add(d.id)
  try {
    // Die Liste nicht endlos wachsen lassen
    localStorage.setItem(BELOHNT, JSON.stringify([...schon].slice(-200)))
  } catch {
    /* privater Modus – dann eben nur für diese Sitzung */
  }
  return neu
}

/** "12,4 s" – für die Ergebniszeile. */
export function zeitText(ms) {
  if (ms == null) return '–'
  return (ms / 1000).toFixed(1).replace('.', ',') + ' s'
}
