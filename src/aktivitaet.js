// Zählt abgeschlossene Lerneinheiten pro Tag – Lektionen,
// Wiederholungsrunden und Spiele gleichermaßen. Grundlage für das
// Wochendiagramm auf der Startseite.

const SCHLUESSEL = 'aktivitaet'

function heute() {
  return new Date().toISOString().slice(0, 10)
}

function lade() {
  try {
    return JSON.parse(localStorage.getItem(SCHLUESSEL)) ?? {}
  } catch {
    return {}
  }
}

/** Eine abgeschlossene Einheit verbuchen. */
export function merkeEinheit() {
  const daten = lade()
  daten[heute()] = (daten[heute()] ?? 0) + 1

  // Nur die letzten 60 Tage behalten – mehr zeigt niemand an
  const grenze = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10)
  for (const tag of Object.keys(daten)) {
    if (tag < grenze) delete daten[tag]
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
    const schluessel = d.toISOString().slice(0, 10)
    tage.push({
      label: d.toLocaleDateString('de-DE', { weekday: 'short' }),
      anzahl: daten[schluessel] ?? 0,
      istHeute: i === 0,
    })
  }
  return tage
}
