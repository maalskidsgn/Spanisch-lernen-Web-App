/**
 * Tagesschlüssel nach der Uhr des Nutzers.
 *
 * Vorher stand hier überall `toISOString().slice(0, 10)`. Das ist die
 * UTC-Zeit: In Deutschland (Sommerzeit UTC+2) hätte alles, was jemand
 * zwischen 0:00 und 2:00 Uhr lernt, auf dem Vortag gezählt – die
 * Tagesserie wäre gerissen und das Wochendiagramm hätte den falschen
 * Balken gefüllt.
 */

/** Ein Datum als "JJJJ-MM-TT" in der Zeitzone des Nutzers. */
export function tagesSchluessel(datum = new Date()) {
  const jahr = datum.getFullYear()
  const monat = String(datum.getMonth() + 1).padStart(2, '0')
  const tag = String(datum.getDate()).padStart(2, '0')
  return `${jahr}-${monat}-${tag}`
}

/** Der heutige Tag als Schlüssel. */
export function heute() {
  return tagesSchluessel()
}
