// Die Übungsarten der Bausteine.
//
// Beim Vokabeltrainer geht es ums Erinnern – da darf man großzügig
// sein. Hier geht es um Formen, und Formen unterscheiden sich oft
// nur in einem Zeichen. Deshalb hat diese Datei ihre eigene
// Vergleichsfunktion.

import { mischen } from './lektionen.js'

/**
 * Vergleicht Eingabe und Lösung – MIT Akzenten.
 *
 * Das ist der wichtige Unterschied zu stimmtUeberein() im
 * Vokabeltrainer. Dort werden Akzente verziehen, weil "cafe" statt
 * "café" das Wort trotzdem trifft.
 *
 * Bei Grammatik wäre genau das falsch: "hablo" ist Gegenwart,
 * "habló" ist Vergangenheit. Wer den Akzent wegließe, bekäme das
 * Indefinido durchgewinkt, obwohl er es nicht getroffen hat – und
 * ausgerechnet dieser Akzent ist das, was der Baustein übt.
 *
 * Verziehen werden nur Groß- und Kleinschreibung, Satzzeichen und
 * doppelte Leerzeichen.
 */
export function stimmtGenau(eingabe, loesung) {
  const glaetten = (s) =>
    String(s)
      .toLowerCase()
      .replace(/[.,;:¿?¡!«»"']/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  return glaetten(eingabe) === glaetten(loesung)
}

/** Ein Wort von seinen Satzzeichen befreien – zum Vergleichen. */
export function nurWort(wort) {
  return String(wort).replace(/[.,;:¿?¡!«»"'()]/g, '')
}

/**
 * Zerlegt einen Satz an der Lücke.
 * Aus "Yo ___ de Alemania." wird ["Yo ", " de Alemania."].
 */
export function anDerLuecke(satz) {
  const teile = String(satz).split('___')
  return [teile[0] ?? '', teile[1] ?? '']
}

/**
 * Die Wortkarten für eine Bau-Aufgabe.
 *
 * Deterministisch pro Aufgabe wäre schöner, ist hier aber nicht
 * nötig: Die Reihenfolge wird einmal beim Aufbau der Karte
 * gewürfelt und dann in den Zustand gelegt, nicht bei jedem
 * Neuzeichnen neu.
 *
 * Notfalls mehrmals mischen – käme die Lösung schon in der richtigen
 * Reihenfolge heraus, wäre es keine Aufgabe mehr.
 */
export function bauWoerter(loesung) {
  const teile = String(loesung).split(/\s+/).filter(Boolean)
  let versuch = mischen(teile)
  for (let i = 0; i < 8 && versuch.join(' ') === teile.join(' '); i++) {
    versuch = mischen(teile)
  }
  return versuch
}

/** Die Wörter eines Satzes – für die Fehlersuche zum Antippen. */
export function satzWoerter(satz) {
  return String(satz).split(/\s+/).filter(Boolean)
}

/**
 * Was der Karteikasten aus einer ganzen Runde macht.
 *
 * Anders als beim Vokabeltrainer wird hier NICHT jede Antwort einzeln
 * eingestuft: Der Karteikasten kennt den Baustein, nicht die einzelne
 * Aufgabe. Eine Regel kann man auch mit einem Glückstreffer richtig
 * haben – erst die Quote über fünf Aufgaben sagt etwas aus.
 *
 * Die vier Stufen entsprechen genau den vier Knöpfen im
 * Vokabeltrainer, damit review() sich gleich verhält:
 *   5 von 5 – einfach, kommt lange nicht wieder
 *   4 von 5 – gut
 *   3 von 5 – schwer, nur wenig später
 *   darunter – nochmal, gleich noch einmal
 */
export function bewertungAusRunde(richtig, gesamt) {
  if (gesamt === 0) return 'nochmal'
  if (richtig >= gesamt) return 'einfach'
  if (richtig >= gesamt - 1) return 'gut'
  if (richtig >= Math.ceil(gesamt * 0.6)) return 'schwer'
  return 'nochmal'
}

/**
 * Prüft eine Antwort gegen die Aufgabe.
 * Eine Stelle für alle vier Typen – so kann die Oberfläche nicht
 * versehentlich anders bewerten als der Rest der App.
 */
export function istRichtig(aufgabe, antwort) {
  if (aufgabe.typ === 'fehler') return nurWort(antwort) === aufgabe.falsch
  if (aufgabe.typ === 'wahl') return antwort === aufgabe.loesung
  return stimmtGenau(antwort, aufgabe.loesung)
}

/** Die Lösung als Text – für die Anzeige nach einer falschen Antwort. */
export function loesungsText(aufgabe) {
  if (aufgabe.typ === 'fehler') return `${aufgabe.falsch} → ${aufgabe.richtig}`
  return aufgabe.loesung
}
