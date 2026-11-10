// Die Übungsarten einer Vokabellektion.
//
// Eine Lektion sind 20 Wörter. Man wählt vorher, WIE man sie üben
// will – die Wörter selbst und ihr Weg durch den Karteikasten
// bleiben in jeder Art identisch. Das ist wichtig: Egal ob man
// tippt, auswählt oder Karten dreht – am Ende landet jedes Wort
// über dieselbe review()-Funktion im Spaced-Repetition-Verfahren.

import { wiederholReihenfolge } from './srs.js'
import { mischen } from './lektionen.js'

export const LEKTION_GROESSE = 20

export const ARTEN = [
  { id: 'karten',    icon: 'karten',    titel: 'tr.karten',         text: 'tr.kartenText',         hinweis: 'tr.kartenHinweis' },
  { id: 'auswahl',   icon: 'auswahl',   titel: 'tr.multipleChoice', text: 'tr.multipleChoiceText', hinweis: 'tr.multipleChoiceHinweis' },
  { id: 'schreiben', icon: 'schreiben', titel: 'tr.schreiben',      text: 'tr.schreibenText',      hinweis: 'tr.schreibenHinweis' },
  { id: 'gemischt',  icon: 'gemischt',  titel: 'tr.gemischt',       text: 'tr.gemischtText',       hinweis: 'tr.gemischtHinweis' },
]

/**
 * Stellt die Wörter einer Lektion zusammen: fällige zuerst, danach
 * mit dem Rest auffüllen, damit auch 20 zusammenkommen.
 */
export function baueLektion(alleEintraege, faellige) {
  const rest = alleEintraege.filter((e) => !faellige.some((f) => f.word === e.word))
  // Fällige nach Abstand (längster zuerst), aufgefüllt mit gemischten übrigen
  return [...[...faellige].sort(wiederholReihenfolge), ...mischen(rest)]
    .slice(0, LEKTION_GROESSE)
    .map((e) => e.word)
}

/**
 * Welche Übungsart kommt bei diesem Wort dran?
 * Bei "gemischt" wechselt es durch – aber deterministisch nach
 * Position, damit dieselbe Runde beim Neuzeichnen nicht springt.
 */
export function artFuer(gewaehlt, position) {
  if (gewaehlt !== 'gemischt') return gewaehlt
  return ['karten', 'auswahl', 'schreiben'][position % 3]
}

/**
 * Baut die Antwortmöglichkeiten für Multiple Choice.
 * Die falschen kommen aus den echten Vokabeln des Nutzers – das
 * zwingt zum Unterscheiden statt zum Ausschließen von Unsinn.
 */
export function baueAuswahl(richtig, alleEintraege, anzahl = 5) {
  const andere = alleEintraege
    .map((e) => e.translation)
    .filter((t) => t && t !== richtig)

  // Doppelte entfernen – sonst steht dieselbe Übersetzung zweimal da
  const einzigartig = [...new Set(andere)]
  return mischen([richtig, ...mischen(einzigartig).slice(0, anzahl - 1)])
}

/**
 * Würfelt die Buchstaben eines Wortes durcheinander.
 *
 * Als erster Tipp beim Schreiben: Man sieht, aus welchen Buchstaben
 * das Wort besteht, und kommt meist von selbst darauf. Leerzeichen
 * bleiben stehen, damit die Wortgrenzen erkennbar sind.
 */
export function buchstabenMischen(wort) {
  const gemischt = wort
    .split(' ')
    .map((teil) => {
      if (teil.length < 3) return teil
      let versuch = teil
      // Notfalls mehrmals würfeln – ein unverändertes Wort wäre
      // kein Tipp, sondern die Lösung.
      for (let i = 0; i < 8 && versuch === teil; i++) {
        versuch = mischen(teil.split('')).join('')
      }
      return versuch
    })
    .join(' ')
  return gemischt.toUpperCase()
}

/**
 * Vergleicht die Eingabe mit der Lösung – großzügig, aber nicht
 * beliebig: Groß-/Kleinschreibung und Akzente werden verziehen,
 * denn wer "cafe" statt "café" tippt, kann das Wort.
 */
export function stimmtUeberein(eingabe, loesung) {
  const glaetten = (s) =>
    String(s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // Akzente weg
      .replace(/[^a-zñ ]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  return glaetten(eingabe) === glaetten(loesung)
}
