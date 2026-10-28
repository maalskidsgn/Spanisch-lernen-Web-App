/**
 * Meilensteine belohnen.
 *
 * Die Abzeichen auf der Startseite gab es schon – sie waren aber nur
 * Anzeige. Wer 500 Wörter zusammen hatte, sah ein neues Symbol und
 * sonst nichts. Jetzt gibt es dafür XP und eine Meldung.
 *
 * Welche Stufen schon belohnt wurden, liegt im Browser. Das reicht:
 * Käme jemand auf einem zweiten Gerät nochmal an dieselbe Stufe,
 * bekäme er die XP ein zweites Mal – das ist verschmerzbar und
 * besser, als bei jedem Gerätewechsel eine Datenbankabfrage zu
 * brauchen, bevor überhaupt etwas angezeigt werden kann.
 */

import { KATEGORIEN } from './Meilensteine.jsx'

/** Was es für eine erreichte Stufe gibt. */
export const MEILENSTEIN_XP = 200

const SCHLUESSEL = 'meilensteine-belohnt'

function belohnte() {
  try {
    const roh = JSON.parse(localStorage.getItem(SCHLUESSEL))
    return Array.isArray(roh) ? new Set(roh) : new Set()
  } catch {
    return new Set()
  }
}

function merke(menge) {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify([...menge]))
  } catch {
    /* privater Modus – dann eben nur für diese Sitzung */
  }
}

/**
 * Sieht nach, ob seit dem letzten Mal eine Stufe dazugekommen ist.
 *
 * @param {object} werte – {woerter, texte, saetze, lektionen, streak, wiederholungen}
 * @returns {Array<{id, titel, stufe, ziel, einheit}>} die neuen Stufen
 */
export function neueMeilensteine(werte) {
  const schon = belohnte()
  const neu = []

  for (const k of KATEGORIEN) {
    const wert = werte[k.id] ?? 0
    k.ziele.forEach((ziel, i) => {
      if (wert < ziel) return
      const kennung = `${k.id}-${i}`
      if (schon.has(kennung)) return
      schon.add(kennung)
      neu.push({
        id: kennung,
        titel: k.titel,
        stufe: i,
        ziel,
        einheit: ziel === 1 ? k.einheit[0] : k.einheit[1],
      })
    })
  }

  if (neu.length) merke(schon)
  return neu
}

/**
 * Beim allerersten Aufruf alles als belohnt eintragen, ohne XP zu geben.
 *
 * Ohne das bekäme jemand mit 490 Wörtern beim ersten Start nach dem
 * Update fünf Meilensteine auf einmal und 1000 XP geschenkt – für
 * Arbeit, die vor der Einführung lag.
 */
export function meilensteineGleichsetzen(werte) {
  try {
    if (localStorage.getItem(SCHLUESSEL) !== null) return false
  } catch {
    return false
  }
  const schon = new Set()
  for (const k of KATEGORIEN) {
    const wert = werte[k.id] ?? 0
    k.ziele.forEach((ziel, i) => {
      if (wert >= ziel) schon.add(`${k.id}-${i}`)
    })
  }
  merke(schon)
  return true
}

/** Name der Stufe (Bronze … Legende) – für die Meldung. */
export const STUFEN_NAMEN = ['Bronze', 'Silber', 'Gold', 'Platin', 'Diamant', 'Legende']
