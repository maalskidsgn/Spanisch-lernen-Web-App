// Obergrenzen pro Nutzer (Manuel, 10.11.2026) – damit ein Premium-Konto
// höchstens ca. 7 $ im Monat kostet. Öffentlich erklärt auf /obergrenzen.
// In Habloo und Davaigo gleich.
//
// Monatswerte zählen in der Tabelle nutzung (tag = Monatserster).
// Tageswerte und alles ohne Anmeldung zählen im Speicher (Schlüssel:
// Nutzer-ID, sonst IP) – nach einem Neustart beginnt der Tag neu, das ist
// für eine Kostenbremse genau genug.
export const GRENZEN = {
  kiPremiumMonat: 300, // Wortlisten, Sätze, Texte, Wörter aus Videos (Gratis: 10)
  buecherPremiumMonat: 50,
  buchtextZeichen: 100000, // eingefügter Buchtext (~50 Seiten)
  schnellFreiMonat: 20,
  schnellPremiumMonat: 300,
  tutorFreiTag: 15,
  tutorPremiumTag: 100,
  wortTag: 500, // Wort antippen
  untertitelMonat: 100, // Videos, deren Untertitel übersetzt werden
  sprechPremiumMinuten: 120,
  sprechFreiMinuten: 10,
}

const SPEICHER = new Map() // "name|zeitraum|schlüssel" → anzahl
const heute = () => new Date().toISOString().slice(0, 10)
const monat = () => new Date().toISOString().slice(0, 7)

/** Wer fragt? Nutzer-ID, sonst die IP (hinter Traefik aus X-Forwarded-For). */
export function anfrager(req, nutzerId) {
  if (nutzerId) return 'u:' + nutzerId
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || 'unbekannt'
  return 'ip:' + ip
}

/**
 * Zähler im Speicher: true, solange die Grenze nicht erreicht ist – und
 * zählt dabei gleich mit. zeitraum: 'tag' | 'monat'.
 */
export function imSpeicherErlaubt(name, schluessel, max, zeitraum = 'tag') {
  if (SPEICHER.size > 50000) SPEICHER.clear()
  const k = `${name}|${zeitraum === 'tag' ? heute() : monat()}|${schluessel}`
  const n = (SPEICHER.get(k) ?? 0) + 1
  if (n > max) return false
  SPEICHER.set(k, n)
  return true
}

export const GRENZE_TEXT = {
  de: (was, wann) => `Du hast die Obergrenze für ${was} erreicht. ${wann === 'tag' ? 'Morgen' : 'Nächsten Monat'} geht es weiter.`,
  en: (was, wann) => `You've reached the limit for ${was}. It resets ${wann === 'tag' ? 'tomorrow' : 'next month'}.`,
}
