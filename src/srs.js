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

// Das Herzstück: Was passiert nach einer Antwort im Training?
export function review(entry, known) {
  if (!known) {
    // Falsch: zurück auf Stufe 0, in 10 Minuten wieder fällig
    return { ...entry, level: 0, due: Date.now() + 10 * 60 * 1000, status: 'neu' }
  }
  const nextLevel = (entry.level ?? 0) + 1
  if (nextLevel > MAX_LEVEL) {
    // Auch die letzte Stufe (3 Monate) bestanden -> gilt als gewusst
    return { ...entry, level: MAX_LEVEL, status: 'gewusst' }
  }
  return {
    ...entry,
    level: nextLevel,
    due: Date.now() + INTERVALS_DAYS[nextLevel] * DAY_MS,
    status: 'lernen',
  }
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
