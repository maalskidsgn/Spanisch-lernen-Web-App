// Zählt abgeschlossene Lerneinheiten pro Tag – getrennt nach
// Lektionen und Wiederholungen. Grundlage für das Wochendiagramm und
// die Kalenderansicht auf der Startseite.
//
// Datenformat je Tag: { l: <Lektionen>, w: <Wiederholungen> }.
// ALT (vor der Trennung) war es nur eine Zahl. Die lesen wir weiter,
// zählen sie aber als Gesamtwert ohne Aufschlüsselung – rückwirkend
// lässt sich nicht mehr sagen, was Lektion und was Wiederholung war.

import { heute, tagesSchluessel } from './datum.js'

const SCHLUESSEL = 'aktivitaet'

function lade() {
  try {
    return JSON.parse(localStorage.getItem(SCHLUESSEL)) ?? {}
  } catch {
    return {}
  }
}

/** Gesamtzahl eines Tageseintrags – versteht altes (Zahl) und neues Format. */
function gesamtVon(eintrag) {
  if (typeof eintrag === 'number') return eintrag
  if (!eintrag) return 0
  return (eintrag.l ?? 0) + (eintrag.w ?? 0)
}

/**
 * Eine abgeschlossene Einheit verbuchen.
 * @param {'lektion'|'wiederholung'} art
 */
export function merkeEinheit(art = 'wiederholung') {
  const daten = lade()
  const tag = heute()

  // Alten Zahlenwert in das neue Format heben, ohne ihn zu verlieren:
  // Die unbekannte Vorgeschichte wandert in "w" (Wiederholung), weil
  // das der häufigste Fall war.
  let eintrag = daten[tag]
  if (typeof eintrag === 'number') eintrag = { l: 0, w: eintrag }
  if (!eintrag) eintrag = { l: 0, w: 0 }

  if (art === 'lektion') eintrag.l = (eintrag.l ?? 0) + 1
  else eintrag.w = (eintrag.w ?? 0) + 1
  daten[tag] = eintrag

  // Nur die letzten 60 Tage behalten – mehr zeigt niemand an
  const grenze = tagesSchluessel(new Date(Date.now() - 60 * 86400000))
  for (const t of Object.keys(daten)) {
    if (t < grenze) delete daten[t]
  }
  localStorage.setItem(SCHLUESSEL, JSON.stringify(daten))
}

/**
 * Die letzten 7 Tage für das Diagramm – ältester zuerst.
 * @returns {{label: string, anzahl: number, istHeute: boolean}[]}
 */
export function letzteWoche() {
  const daten = lade()
  const tage = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const schluessel = tagesSchluessel(d)
    tage.push({
      label: d.toLocaleDateString('de-DE', { weekday: 'short' }),
      anzahl: gesamtVon(daten[schluessel]),
      istHeute: i === 0,
    })
  }
  return tage
}

/**
 * Ein Kalender-Raster: `wochen` volle Wochen (Mo–So), endend mit der
 * Woche, in der heute liegt. Immer 7er-Reihen, damit die Anzeige ein
 * sauberes Gitter wird – Tage vor dem Start bzw. in der Zukunft sind
 * mit `leer`/`zukunft` markiert.
 */
export function kalenderRaster(wochen = 6) {
  const daten = lade()

  const jetzt = new Date()
  const heuteMitternacht = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate())
  const heuteSchluessel = tagesSchluessel(heuteMitternacht)

  // Montag als Wochenanfang: getDay() ist So=0..Sa=6 → auf Mo=0 drehen.
  const wochentagAbMontag = (heuteMitternacht.getDay() + 6) % 7
  const start = new Date(heuteMitternacht)
  start.setDate(start.getDate() - wochentagAbMontag - (wochen - 1) * 7)

  const zellen = []
  for (let i = 0; i < wochen * 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const schluessel = tagesSchluessel(d)
    const eintrag = daten[schluessel]
    zellen.push({
      schluessel,
      tag: d.getDate(),
      // Am Monatsersten den Monatsnamen mitgeben – für die Beschriftung.
      monatAnfang: d.getDate() === 1 ? d.toLocaleDateString('de-DE', { month: 'short' }) : null,
      lektionen: typeof eintrag === 'number' ? 0 : eintrag?.l ?? 0,
      wiederholungen: typeof eintrag === 'number' ? eintrag : eintrag?.w ?? 0,
      gesamt: gesamtVon(eintrag),
      istHeute: schluessel === heuteSchluessel,
      zukunft: schluessel > heuteSchluessel,
    })
  }
  return zellen
}
