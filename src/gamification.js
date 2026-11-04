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
  VIDEO_MINUTE: 10, // je volle Minute, die ein Video wirklich läuft
  LAND: 10, // ein Stück "Land & Leute" gelesen (nur beim ersten Mal)

  // Alter Name, den es überall gab: zeigt jetzt auf den Satzwert.
  // Bleibt stehen, damit nichts bricht, was ihn noch benutzt.
  WORT_RICHTIG: 15,
}

// Die Stufen: Ab Level `ab` gilt Titel und Emblem (LevelEmblem.jsx), bis
// die nächste Stufe beginnt. Legende erst ab 50, Sol Eterno ab 100 – da
// bleibt man dann.
// Schluessel, nicht Namen: uebersetzt wird beim Anzeigen (levelName).
export const LEVEL_STUFEN = [
  { ab: 1, name: 'lv.neuling', rahmen: 'kreis', symbol: 'keim', von: '#d9f2e0', bis: '#a5dfb8', kante: '#7cc896', farbe: '#1f9450' },
  { ab: 3, name: 'lv.anfaenger', rahmen: 'kreis', symbol: 'blatt', von: '#4cc77f', bis: '#2aae5f', kante: '#1f9450', farbe: '#fff' },
  { ab: 5, name: 'lv.entdecker', rahmen: 'kreis', symbol: 'kompass', von: '#3cc4b8', bis: '#1a9c91', kante: '#157f76', farbe: '#fff' },
  { ab: 8, name: 'lv.lerner', rahmen: 'kreis', symbol: 'buch', von: '#6aa5f7', bis: '#3a78e0', kante: '#2c60ba', farbe: '#fff' },
  { ab: 12, name: 'lv.kenner', rahmen: 'kreis', symbol: 'stern', von: '#a48cf5', bis: '#7655e0', kante: '#5d40bd', farbe: '#fff' },
  { ab: 16, name: 'lv.koenner', rahmen: 'kreis', symbol: 'blitz', von: '#ff9a40', bis: '#ff6c00', kante: '#bf5200', farbe: '#fff' },
  { ab: 20, name: 'lv.profi', rahmen: 'schild', symbol: 'haken', von: '#dc9a5f', bis: '#a7652e', kante: '#7f4a1e', farbe: '#fff' },
  { ab: 25, name: 'lv.experte', rahmen: 'schild', symbol: 'diamant', von: '#e4e9ef', bis: '#9fadbd', kante: '#74838f', farbe: '#000041' },
  { ab: 30, name: 'lv.meister', rahmen: 'schild', symbol: 'krone', von: '#ffe08a', bis: '#efa91c', kante: '#b97c07', farbe: '#000041' },
  { ab: 40, name: 'lv.grossmeister', rahmen: 'schild', symbol: 'grosseKrone', von: '#ff8a1a', bis: '#d63a00', kante: '#ffd25e', farbe: '#fff4c9' },
  { ab: 50, name: 'lv.legende', rahmen: 'sechseck', symbol: 'fluegel', von: '#1f1f7a', bis: '#000041', kante: '#ffc93c', farbe: '#ffd25e' },
  { ab: 60, name: 'lv.mythos', rahmen: 'sechseck', symbol: 'komet', von: '#5a26b8', bis: '#1c0a57', kante: '#ff9ad5', farbe: '#ffd9ef' },
  { ab: 70, name: 'lv.titan', rahmen: 'sechseck', symbol: 'berg', von: '#a11a34', bis: '#3a0713', kante: '#ffc93c', farbe: '#ffe08a' },
  { ab: 85, name: 'lv.unsterblich', rahmen: 'sechseck', symbol: 'unendlich', von: '#3a2a1c', bis: '#0d0805', kante: '#ff6c00', farbe: '#ff9a40' },
  { ab: 100, name: 'lv.solEterno', rahmen: 'strahlen', symbol: 'sonne', von: '#fff0b8', bis: '#ff8a1a', kante: '#ff6c00', farbe: '#fff' },
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
