import { t } from './sprache.js'

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
  WORT_NEU: 20, // ein neues Wort in den Trainer aufgenommen (angeklickt oder hinzugefügt, je Wort nur einmal)
  LISTE_ERSTELLT: 50, // KI-Liste/Satzliste/Text erstellt und übernommen – pauschal (09.11.2026)
  SAMMELN: 2, // ein Wort bewusst auf "Lernen" gesetzt
  SCHON_GEWUSST: 5, // ein Wort direkt als "Gewusst" markiert
  RICHTIG: 10, // eine Vokabel im Training gewusst
  FALSCH: 2, // Karte nicht gewusst (Üben zählt trotzdem!)
  RUNDE: 20, // Bonus für eine komplett geschaffte Trainingsrunde
  QUIZ_RICHTIG: 20, // richtige Antwort in einer Lektion oder einem Spiel (12.11.2026: 2 -> 20, Manuel)
  LEKTION: 30, // eine ganze Lektion geschafft – die längste Einheit
  SPIEL: 10, // Bonus für ein durchgespieltes Mini-Spiel
  SATZ_RICHTIG: 15, // ein Satz im Satz-Trainer gewusst
  TEXT_RICHTIG: 20, // ein Lesetext durchgearbeitet
  FEED_RICHTIG: 10, // eine Karte im Feed – kurz wie eine Vokabel
  VIDEO_MINUTE: 10, // je volle Minute, die ein Video wirklich läuft
  LAND: 10, // ein Stück "Land & Leute" gelesen (nur beim ersten Mal)

  // Alter Name, den es überall gab: zeigt jetzt auf den Satzwert.
  // Bleibt stehen, damit nichts bricht, was ihn noch benutzt.
  WORT_RICHTIG: 15,
}

// Die Stufen: Ab Level `ab` gilt Titel und Emblem (LevelEmblem.jsx), bis
// die nächste Stufe beginnt. Legende erst ab 50, Sol Eterno ab 100 – da
// bleibt man dann.
// Die Farben sind Pastell und laufen als Regenbogen durch; `farbe` ist
// der dunklere Ton derselben Farbe. `funken` sind die Rangzeichen.
// Schluessel, nicht Namen: uebersetzt wird beim Anzeigen (levelName).
export const LEVEL_STUFEN = [
  { ab: 1, name: 'lv.neuling', symbol: 'keim', verlauf: ['#ffeadb', '#ffd2b5'], farbe: '#df8450', funken: 0 },
  { ab: 3, name: 'lv.anfaenger', symbol: 'blatt', verlauf: ['#def6e6', '#b4e8c9'], farbe: '#3fa372', funken: 0 },
  { ab: 5, name: 'lv.entdecker', symbol: 'kompass', verlauf: ['#d8f4f1', '#a9e3de'], farbe: '#2f9a96', funken: 0 },
  { ab: 8, name: 'lv.lerner', symbol: 'buch', verlauf: ['#deedff', '#b6d5fb'], farbe: '#4a84d6', funken: 0 },
  { ab: 12, name: 'lv.kenner', symbol: 'stern', verlauf: ['#eae5ff', '#cbc2fa'], farbe: '#7866d4', funken: 0 },
  { ab: 16, name: 'lv.koenner', symbol: 'blitz', verlauf: ['#ffe5ef', '#fbc2d7'], farbe: '#d6648d', funken: 0 },
  { ab: 20, name: 'lv.profi', symbol: 'haken', verlauf: ['#ffe6cc', '#ffc592'], farbe: '#d6762b', funken: 1 },
  { ab: 25, name: 'lv.experte', symbol: 'diamant', verlauf: ['#ebf0f7', '#c8d3e6'], farbe: '#627499', funken: 1 },
  { ab: 30, name: 'lv.meister', symbol: 'krone', verlauf: ['#fff3c9', '#ffdb85'], farbe: '#c58e0e', funken: 2 },
  { ab: 40, name: 'lv.grossmeister', symbol: 'grosseKrone', verlauf: ['#ffdfd5', '#ffb29d'], farbe: '#d65d44', funken: 2 },
  { ab: 50, name: 'lv.legende', symbol: 'fluegel', verlauf: ['#f3e0ff', '#d4b2f8'], farbe: '#8850cc', funken: 3 },
  { ab: 60, name: 'lv.mythos', symbol: 'komet', verlauf: ['#cfe6ff', '#e6caff'], farbe: '#6b5bd2', funken: 3 },
  { ab: 70, name: 'lv.titan', symbol: 'berg', verlauf: ['#ffdcb8', '#ffb2c6'], farbe: '#d2566f', funken: 3 },
  { ab: 85, name: 'lv.unsterblich', symbol: 'unendlich', verlauf: ['#c8f2ea', '#cfd8ff', '#f6caee'], farbe: '#6a5fc8', funken: 3 },
  { ab: 100, name: 'lv.solEterno', sol: true },
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

export function levelStufe(level) {
  return LEVEL_STUFEN.findLast((s) => level >= s.ab) ?? LEVEL_STUFEN[0]
}

export function levelName(level) {
  return t(levelStufe(level).name)
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

// Serie nur zeigen, solange sie lebt (12.11.2026): War der letzte
// Lerntag weder heute noch gestern, ist die Serie gerissen -> 0.
// Vorher blieb die alte Zahl stehen, bis man wieder lernte.
export function serieAufraeumen(progress) {
  if (!progress || !(progress.streak > 0)) return progress
  const zuletzt = progress.lastActive
  if (zuletzt === dateString(0) || zuletzt === dateString(1)) return progress
  return { ...progress, streak: 0 }
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
