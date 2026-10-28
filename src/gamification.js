// Punkte- und Levelsystem wie bei Duolingo:
// Für Lernaktionen gibt es XP (Erfahrungspunkte). Mit genug XP steigt man
// ein Level auf, und wer jeden Tag lernt, baut eine Tagesserie (Streak) auf.

// Wie viele XP es für welche Aktion gibt
//
// Die Staffelung folgt dem Aufwand: Je länger und schwerer eine
// Einheit ist, desto mehr bringt sie.
//
//   Lektion (30) > Lesetext (20) > Satz (15) > Wort (10)
//
// Eine Lektion dauert Minuten, ein Lesetext kostet Konzentration,
// ein Satz ist mehr als ein Wort – vorher gab es für alles gleich
// viel, und Lektionen lohnten sich kaum.
export const XP = {
  WORT_NEU: 2, // ein neues Wort im Text oder Video angeklickt
  SAMMELN: 2, // ein Wort bewusst auf "Lernen" gesetzt
  SCHON_GEWUSST: 5, // ein Wort direkt als "Gewusst" markiert
  RICHTIG: 10, // eine Vokabel im Training gewusst
  FALSCH: 2, // Karte nicht gewusst (Üben zählt trotzdem!)
  RUNDE: 20, // Bonus für eine komplett geschaffte Trainingsrunde
  QUIZ_RICHTIG: 2, // richtige Antwort in einer Lektion oder einem Spiel
  LEKTION: 30, // eine ganze Lektion geschafft – die längste Einheit
  SPIEL: 10, // Bonus für ein durchgespieltes Mini-Spiel
  SATZ_RICHTIG: 15, // ein Satz im Satz-Trainer gewusst
  TEXT_RICHTIG: 20, // ein Lesetext durchgearbeitet
  FEED_RICHTIG: 10, // eine Karte im Feed – kurz wie eine Vokabel
  LAND: 10, // ein Stück "Land & Leute" gelesen (nur beim ersten Mal)

  // Alter Name, den es überall gab: zeigt jetzt auf den Satzwert.
  // Bleibt stehen, damit nichts bricht, was ihn noch benutzt.
  WORT_RICHTIG: 15,
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
    const p = {
      xp: 0,
      xpToday: 0,
      streak: 0,
      lastActive: null,
      ...JSON.parse(localStorage.getItem('fortschritt')),
    }
    // Ein kaputter Stand (NaN wird als null gespeichert) darf nicht ewig kleben
    if (!Number.isFinite(p.xp)) p.xp = 0
    if (!Number.isFinite(p.xpToday)) p.xpToday = 0
    return p
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
  if (!Number.isFinite(amount)) amount = 0
  const today = dateString(0)
  const isNewDay = progress.lastActive !== today
  let streak = progress.streak || 0
  if (isNewDay) {
    streak = progress.lastActive === dateString(1) ? streak + 1 : 1
  }
  return {
    xp: (Number.isFinite(progress.xp) ? progress.xp : 0) + amount,
    xpToday: (isNewDay ? 0 : progress.xpToday || 0) + amount,
    streak,
    lastActive: today,
  }
}

// Wie viele XP wurden heute gesammelt? (0, wenn heute noch nicht gelernt wurde)
export function xpHeute(progress) {
  return progress.lastActive === dateString(0) ? progress.xpToday || 0 : 0
}
