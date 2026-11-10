import { t, gebiet, sprache } from './sprache.js'

// Spaced Repetition = "verteiltes Wiederholen".
// Jede Vokabel steckt in einer Stufe (wie Fächer in einem Karteikasten).
// Richtig beantwortet -> eine Stufe höher, das Wort kommt seltener dran.
// Falsch beantwortet  -> zurück auf Stufe 0, das Wort kommt bald wieder.

// Wartezeit pro Stufe in Tagen (Stufe 0 = sofort fällig)
export const INTERVALS_DAYS = [0, 1, 3, 7, 14, 30, 90]

// Lesbare Namen für die Stufen (gleiche Reihenfolge wie oben)
// Schluessel, nicht Texte - angezeigt wird mit t(), sonst friert die Sprache ein
export const LEVEL_LABELS = ['srs.neu', 'srs.1tag', 'srs.3tage', 'srs.1woche', 'srs.2wochen', 'srs.1monat', 'srs.3monate']

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
const MAX_TAGE = 120             // 4 Monate = letzte Stufe der Monatsleiter (10.11.2026)

// Monatsleiter (Manuel, 10.11.2026): Ab 2 Monaten Abstand geht es in festen
// Monatsschritten weiter – 2 → 3 → 4 Monate (letzte Stufe). Wer bei 3 Monaten
// ist, kann auch zurück: Schlecht = 1 Monat, Mittel = ein Monat weniger.
// Vorher rechnete die Leichtigkeit krumme Werte (52 und 68 Tage), beides
// stand als „2 Mon.“ auf den Knöpfen und es sah aus, als hinge es fest.
const MONAT = 30
const MAX_MONATE = 4
const LEITER_AB = 45 // ab hier zählt der Abstand als „Monate“

/** Auf welcher Monatsstufe steht die Karte? 0 = noch nicht auf der Leiter. */
export function monatsStufe(entry) {
  const { intervall } = zustand(entry)
  if (intervall < LEITER_AB) return 0
  return Math.min(MAX_MONATE, Math.max(2, Math.round(intervall / MONAT)))
}

/** Tage bis zur nächsten Abfrage für eine Bewertung (ohne „nochmal“). */
function naechsteTage(entry, bewertung) {
  const { intervall, leichtigkeit } = zustand(entry)
  const m = monatsStufe(entry)
  if (m) {
    if (bewertung === 'schwer') return MONAT
    if (bewertung === 'gut') return Math.max(2, m - 1) * MONAT
    return Math.min(MAX_MONATE, m + 1) * MONAT // einfach = „Gut“ auf der Leiter
  }
  if (bewertung === 'schwer') return intervall === 0 ? 0.5 : intervall * 1.2
  const gut = intervall === 0 ? ERSTES_INTERVALL : intervall * leichtigkeit
  if (bewertung === 'gut') return gut >= LEITER_AB ? 2 * MONAT : gut
  const einfach = intervall === 0 ? ERSTES_INTERVALL * 3 : intervall * leichtigkeit * 1.3
  // Einstieg in die Leiter: Gut → 2 Monate, Einfach → 3 Monate (nie beide gleich)
  if (gut >= LEITER_AB) return 3 * MONAT
  return einfach >= LEITER_AB ? 2 * MONAT : einfach
}

/** Auf der Monatsleiter heißen die Knöpfe anders: Schlecht / Mittel / Gut. */
export function leiterName(entry, bewertung) {
  if (!monatsStufe(entry) || bewertung === 'nochmal') return null
  const namen = { schwer: ['Schlecht', 'Poor'], gut: ['Mittel', 'Okay'], einfach: ['Gut', 'Good'] }[bewertung]
  return namen ? namen[sprache() === 'en' ? 1 : 0] : null
}

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

  const tage = naechsteTage(entry, bewertung)
  if (bewertung === 'schwer') return fertig(entry, tage, Math.max(MIN_LEICHTIGKEIT, leichtigkeit - 0.15))
  if (bewertung === 'einfach') return fertig(entry, tage, leichtigkeit + 0.15)
  return fertig(entry, tage, leichtigkeit) // 'gut'
}

/** Wie lange dauert es bei dieser Bewertung bis zur Wiederholung? Für die Knöpfe. */
export function vorschau(entry, bewertung) {
  if (bewertung === 'nochmal') return '15 Min'

  const tage = Math.min(naechsteTage(entry, bewertung), MAX_TAGE)
  if (tage < 1) return Math.round(tage * 24) + ' Std'
  // Unter einer Woche mit Nachkommastelle. Sonst stuenden auf zwei
  // Knoepfen dieselben "3 Tage" – 2,5 und 3,25 runden beide dorthin –
  // und es saehe aus, als taeten sie dasselbe.
  if (tage < 7) {
    const gerundet = Math.round(tage * 10) / 10
    if (gerundet === 1) return '1 Tag'
    return String(gerundet).replace('.', ',') + ' Tage'
  }
  if (tage < 30) return Math.round(tage) + ' Tage'
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
  if (diff <= 0) return t('srs.jetztFaellig')
  if (diff < DAY_MS) return t('srs.heute')
  const days = Math.round(diff / DAY_MS)
  if (days === 1) return t('srs.morgen')
  if (days < 31) return t('srs.inTagen', { zahl: days })
  return new Date(entry.due).toLocaleDateString(gebiet())
}

/**
 * Reihenfolge beim Wiederholen (09.11.2026, Manuel): die Karten mit dem
 * längsten Abstand zuerst – wer 2 Monate gehalten hat, kommt vor der
 * 2-Wochen- und der 1-Tag-Karte. Gleicher Abstand: die länger fällige zuerst.
 * Vorher wurde gemischt, die Reihenfolge sprang wild hin und her.
 */
export function intervallVon(entry) {
  return entry.intervall ?? INTERVALS_DAYS[entry.level ?? 0] ?? 0
}
export function wiederholReihenfolge(a, b) {
  return intervallVon(b) - intervallVon(a) || (a.due ?? 0) - (b.due ?? 0)
}
