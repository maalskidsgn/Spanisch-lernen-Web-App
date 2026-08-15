// Punkte- und Levelsystem wie bei Duolingo:
// Für Lernaktionen gibt es XP (Erfahrungspunkte). Mit genug XP steigt man
// ein Level auf, und wer jeden Tag lernt, baut eine Tagesserie (Streak) auf.

// Wie viele XP es für welche Aktion gibt
export const XP = {
  WORT_NEU: 2, // ein neues Wort im Text angeklickt / in den Trainer aufgenommen
  SAMMELN: 2, // ein Wort bewusst auf "Lernen" gesetzt
  SCHON_GEWUSST: 5, // ein Wort direkt als "Gewusst" markiert
  RICHTIG: 10, // Karte im Training gewusst
  FALSCH: 2, // Karte nicht gewusst (Üben zählt trotzdem!)
  RUNDE: 20, // Bonus für eine komplett geschaffte Trainingsrunde
  QUIZ_RICHTIG: 2, // richtige Antwort in einer Lektion oder einem Spiel
  LEKTION: 15, // Bonus für eine abgeschlossene Lektion
  SPIEL: 10, // Bonus für ein durchgespieltes Mini-Spiel
}

// Titel für die Level (ab dem letzten bleibt man "Legende")
export const LEVEL_NAMES = [
  'Neuling',
  'Anfänger',
  'Entdecker',
  'Lerner',
  'Kenner',
  'Könner',
  'Profi',
  'Meister',
  'Legende',
]

// Gesamt-XP, ab denen ein Level erreicht ist.
// Jedes Level braucht 100 XP mehr als das davor:
// Level 2 ab 100 XP, Level 3 ab 300, Level 4 ab 600, Level 5 ab 1000 ...
export function xpForLevel(level) {
  return 50 * level * (level - 1)
}

export function levelFromXp(xp) {
  let level = 1
  while (xp >= xpForLevel(level + 1)) level++
  return level
}

export function levelName(level) {
  return LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)]
}

export function loadProgress() {
  try {
    return {
      xp: 0,
      xpToday: 0,
      streak: 0,
      lastActive: null,
      ...JSON.parse(localStorage.getItem('fortschritt')),
    }
  } catch {
    return { xp: 0, xpToday: 0, streak: 0, lastActive: null }
  }
}

// Datum als "JJJJ-MM-TT" (damit man Tage einfach vergleichen kann)
function dateString(daysAgo = 0) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toLocaleDateString('sv-SE')
}

// XP gutschreiben und die Tagesserie pflegen:
// heute schon aktiv -> Serie bleibt; gestern aktiv -> Serie +1; sonst -> neu bei 1.
// xpToday zählt die heute gesammelten XP (fürs Tagesziel) und startet
// an einem neuen Tag automatisch wieder bei null.
export function applyXp(progress, amount) {
  const today = dateString(0)
  const isNewDay = progress.lastActive !== today
  let streak = progress.streak || 0
  if (isNewDay) {
    streak = progress.lastActive === dateString(1) ? streak + 1 : 1
  }
  return {
    xp: (progress.xp || 0) + amount,
    xpToday: (isNewDay ? 0 : progress.xpToday || 0) + amount,
    streak,
    lastActive: today,
  }
}

// Wie viele XP wurden heute gesammelt? (0, wenn heute noch nicht gelernt wurde)
export function xpHeute(progress) {
  return progress.lastActive === dateString(0) ? progress.xpToday || 0 : 0
}
