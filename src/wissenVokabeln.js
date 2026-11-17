// Beispielwörter aus den „Gut zu wissen“-Karten für den Vokabeltrainer (17.11.2026, Manuel).
//
// Die Wortliste (wissenWoerter.js, rund 2.100 Einträge) wird erst geladen, wenn sie
// gebraucht wird – beim Abschluss einer Lektion oder in der Grundlagen-Liste.
// In den Vokabeltrainer kommen nur Wörter und kurze Wendungen (höchstens drei Wörter);
// ganze Sätze gehören in den Satztrainer und bleiben draußen.
import { sprache } from './sprache.js'

let geladen = null
function liste() {
  geladen ??= import('./wissenWoerter.js').then((m) => m.default).catch(() => ({}))
  return geladen
}

const sauber = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/\u0301/g, '').normalize('NFC').replace(/[¿?¡!.,;:«»"“”„]/g, '').replace(/\s+/g, ' ').trim()
const istWort = (w) => {
  const t = String(w || '').trim()
  return t.length > 0 && t.split(/\s+/).length <= 3 && !/[.?!…]$/.test(t)
}

/** Wörter einer Karte („lektionId:nummer“), die noch nicht im Trainer stehen: [{ wort, uebersetzung }] */
export async function neueWoerterZurKarte(kartenId, vocab = {}) {
  const alle = (await liste())[kartenId] ?? []
  const vorhanden = new Set(Object.keys(vocab).map(sauber))
  const sp = sprache() === 'en' ? 'en' : 'de'
  const neu = []
  for (const w of alle) {
    const schluessel = sauber(w.wort)
    if (!istWort(w.wort) || !schluessel || vorhanden.has(schluessel)) continue
    vorhanden.add(schluessel)
    neu.push({ wort: w.wort.trim(), uebersetzung: w[sp] || w.de })
  }
  return neu
}

/** Alle neuen Wörter einer Lektion – aus jeder ihrer „Gut zu wissen“-Karten. */
export async function neueWoerterZurLektion(lektion, vocab = {}) {
  const neu = []
  const zwischenstand = { ...vocab }
  for (let i = 0; i < (lektion.wissen ?? []).length; i++) {
    for (const w of await neueWoerterZurKarte(`${lektion.id}:${i}`, zwischenstand)) {
      neu.push(w)
      zwischenstand[w.wort.toLowerCase()] = true
    }
  }
  return neu
}
