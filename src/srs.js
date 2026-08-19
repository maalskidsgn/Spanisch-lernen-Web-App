// Spaced Repetition = "verteiltes Wiederholen".
// Jede Vokabel steckt in einer Stufe (wie Fächer in einem Karteikasten).
// Richtig beantwortet -> eine Stufe höher, das Wort kommt seltener dran.
// Falsch beantwortet  -> zurück auf Stufe 0, das Wort kommt bald wieder.

// Wartezeit pro Stufe in Tagen (Stufe 0 = sofort fällig)
export const INTERVALS_DAYS = [0, 1, 3, 7, 14, 30, 90]

// Lesbare Namen für die Stufen (gleiche Reihenfolge wie oben)
export const LEVEL_LABELS = ['Neu', '1 Tag', '3 Tage', '1 Woche', '2 Wochen', '1 Monat', '3 Monate']

export const MAX_LEVEL = INTERVALS_DAYS.length - 1

const DAY_MS = 24 * 60 * 60 * 1000

// Eine frische Vokabel: Stufe 0, sofort fällig
export function newEntry(translation, source) {
  return {
    status: 'neu',
    translation: translation || '',
    level: 0,
    due: Date.now(), // wann die Vokabel wieder abgefragt werden soll
    addedAt: Date.now(),
    source: source || '',
  }
}

// Ältere Einträge (aus früheren Versionen der App) bekommen fehlende Felder dazu
export function withSrsDefaults(entry) {
  return {
    level: entry.status === 'gewusst' ? MAX_LEVEL : 0,
    due: Date.now(),
    addedAt: Date.now(),
    source: '',
    ...entry,
  }
}

// ---------------------------------------------------------------
//  Das Herzstück: die vier Bewertungen (wie bei Anki)
// ---------------------------------------------------------------
//
// Statt fester Fächer wächst der Abstand mit jeder guten Antwort:
// aus 1 Tag werden 3, daraus 8, daraus 20 … Wie stark er wächst,
// steuert die "Leichtigkeit" – sie sinkt bei schweren Karten und
// steigt bei einfachen. Genau so arbeitet auch Anki.

export const BEWERTUNGEN = ['nochmal', 'schwer', 'gut', 'einfach']

const START_LEICHTIGKEIT = 2.5   // Standard-Multiplikator
const MIN_LEICHTIGKEIT = 1.3     // darunter wird es nicht zäher
const ERSTES_INTERVALL = 1       // erste gute Antwort: morgen wieder
const MAX_TAGE = 365             // ein Jahr ist genug

/** Leitet aus dem Abstand in Tagen die Karteikasten-Stufe ab (für Filter und Anzeige). */
export function stufeAusIntervall(tage) {
  let stufe = 0
  for (let i = 0; i < INTERVALS_DAYS.length; i++) {
    if (tage >= INTERVALS_DAYS[i]) stufe = i
  }
  return stufe
}

/** Holt Abstand und Leichtigkeit – auch bei alten Einträgen, die nur "level" haben. */
function zustand(entry) {
  return {
    intervall: entry.intervall ?? INTERVALS_DAYS[entry.level ?? 0] ?? 0,
    leichtigkeit: entry.leichtigkeit ?? START_LEICHTIGKEIT,
  }
}

function fertig(entry, intervall, leichtigkeit) {
  const tage = Math.min(Math.round(intervall * 10) / 10, MAX_TAGE)
  return {
    ...entry,
    intervall: tage,
    leichtigkeit: Math.round(leichtigkeit * 100) / 100,
    level: stufeAusIntervall(tage),
    due: Date.now() + tage * DAY_MS,
    // Bewusst immer 'lernen': "gewusst" heisst "der Nutzer hat das Wort
    // selbst abgehakt" und faellt damit aus isDue() heraus. Frueher
    // setzte diese Zeile den Status ab 90 Tagen automatisch – die
    // Vokabel kam danach nie wieder dran, und die Stufen ueber
    // 90 Tage (bis MAX_TAGE) waren unerreichbar.
    status: 'lernen',
  }
}

/**
 * Berechnet aus einer Bewertung den nächsten Termin.
 *
 * nochmal – gar nicht gewusst: in 15 Minuten erneut, Abstand zurück auf 0
 * schwer  – mit Mühe erinnert: nur wenig längerer Abstand
 * gut     – sicher gewusst: Abstand mal Leichtigkeit
 * einfach – sofort klar: noch etwas mehr Abstand
 *
 * @param {object} entry     – die Vokabel
 * @param {string} bewertung – 'nochmal' | 'schwer' | 'gut' | 'einfach'
 *   (true/false aus älteren Aufrufen werden weiter verstanden)
 */
export function review(entry, bewertung) {
  if (bewertung === true) bewertung = 'gut'
  if (bewertung === false) bewertung = 'nochmal'

  const { intervall, leichtigkeit } = zustand(entry)

  if (bewertung === 'nochmal') {
    // Von vorn anfangen und in 15 Minuten noch einmal zeigen
    return {
      ...entry,
      intervall: 0,
      leichtigkeit: Math.max(MIN_LEICHTIGKEIT, leichtigkeit - 0.2),
      level: 0,
      due: Date.now() + 15 * 60 * 1000,
      status: 'neu',
    }
  }

  if (bewertung === 'schwer') {
    // Kaum längerer Abstand, und die Karte gilt künftig als zäher
    const tage = intervall === 0 ? 0.5 : intervall * 1.2
    return fertig(entry, tage, Math.max(MIN_LEICHTIGKEIT, leichtigkeit - 0.15))
  }

  if (bewertung === 'einfach') {
    const tage = intervall === 0 ? ERSTES_INTERVALL * 3 : intervall * leichtigkeit * 1.3
    return fertig(entry, tage, leichtigkeit + 0.15)
  }

  // 'gut'
  const tage = intervall === 0 ? ERSTES_INTERVALL : intervall * leichtigkeit
  return fertig(entry, tage, leichtigkeit)
}

/** Wie lange dauert es bei dieser Bewertung bis zur Wiederholung? Für die Knöpfe. */
export function vorschau(entry, bewertung) {
  if (bewertung === 'nochmal') return '15 Min'

  const { intervall, leichtigkeit } = zustand(entry)
  let tage
  if (bewertung === 'schwer') tage = intervall === 0 ? 0.5 : intervall * 1.2
  else if (bewertung === 'einfach') tage = intervall === 0 ? 3 : intervall * leichtigkeit * 1.3
  else tage = intervall === 0 ? ERSTES_INTERVALL : intervall * leichtigkeit

  tage = Math.min(tage, MAX_TAGE)
  if (tage < 1) return Math.round(tage * 24) + ' Std'
  if (tage < 30) return Math.round(tage) + (Math.round(tage) === 1 ? ' Tag' : ' Tage')
  if (tage < 365) return Math.round(tage / 30) + ' Mon.'
  return '1 Jahr'
}

// Ist die Vokabel gerade zum Üben fällig?
export function isDue(entry) {
  return entry.status !== 'gewusst' && (entry.due ?? 0) <= Date.now()
}

// Hübsche Anzeige, wann eine Vokabel fällig ist
export function formatDue(entry) {
  if (entry.status === 'gewusst') return '—'
  const diff = (entry.due ?? 0) - Date.now()
  if (diff <= 0) return 'jetzt fällig'
  if (diff < DAY_MS) return 'heute'
  const days = Math.round(diff / DAY_MS)
  if (days === 1) return 'morgen'
  if (days < 31) return `in ${days} Tagen`
  return new Date(entry.due).toLocaleDateString('de-DE')
}
