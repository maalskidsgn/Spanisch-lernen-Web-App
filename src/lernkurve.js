// Zählt pro Tag, WAS gelernt wurde – getrennt nach Wörtern, Sätzen,
// Lektionen und Texten. Grundlage für die Lernkurve auf der Startseite.
//
// aktivitaet.js zählt nur ganze Einheiten (Lektion/Wiederholung) für
// den Kalender; hier wird feiner gezählt: jede beantwortete Karte im
// Wort- und Satztrainer, jede fertige Lektion, jeder gelesene Text.
//
// Datenformat: { "2026-10-23": { woerter: 12, saetze: 4, lektionen: 1, texte: 0, video: 7 } }
// video = geschaute Video-Minuten (nur echte Wiedergabe, siehe App.jsx)

import { tagesSchluessel } from './datum.js'

const SCHLUESSEL = 'lernkurve'
export const ARTEN = ['woerter', 'saetze', 'lektionen', 'texte', 'video']

function lade() {
  try {
    return JSON.parse(localStorage.getItem(SCHLUESSEL)) ?? {}
  } catch {
    return {}
  }
}

/**
 * Etwas Gelerntes verbuchen.
 * @param {'woerter'|'saetze'|'lektionen'|'texte'|'video'} art
 */
export function merkeGelernt(art, menge = 1) {
  if (!ARTEN.includes(art)) return
  const daten = lade()
  const tag = tagesSchluessel()
  const eintrag = daten[tag] ?? {}
  eintrag[art] = (eintrag[art] ?? 0) + menge
  daten[tag] = eintrag

  // Ein gutes Jahr reicht für die Jahresansicht
  const grenze = tagesSchluessel(new Date(Date.now() - 400 * 86400000))
  for (const t of Object.keys(daten)) if (t < grenze) delete daten[t]

  localStorage.setItem(SCHLUESSEL, JSON.stringify(daten))
  // Damit eine offene Startseite sofort nachzieht
  window.dispatchEvent(new Event('lernkurve'))
}

function leer() {
  return { woerter: 0, saetze: 0, lektionen: 0, texte: 0, video: 0 }
}

/**
 * Die Punkte für das Diagramm, ältester zuerst.
 * @param {'woche'|'monat'|'jahr'} zeitraum
 * @returns {{label: string, lang: string, werte: object, istJetzt: boolean}[]}
 */
export function verlauf(zeitraum = 'woche') {
  const daten = lade()
  const jetzt = new Date()

  if (zeitraum === 'jahr') {
    // 12 Monate, je Monat aufsummiert
    const punkte = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(jetzt.getFullYear(), jetzt.getMonth() - i, 1)
      const praefix = tagesSchluessel(d).slice(0, 7)
      const werte = leer()
      for (const [tag, e] of Object.entries(daten)) {
        if (!tag.startsWith(praefix)) continue
        for (const a of ARTEN) werte[a] += e[a] ?? 0
      }
      punkte.push({
        label: d.toLocaleDateString('de-DE', { month: 'short' }).replace('.', ''),
        lang: d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
        werte,
        istJetzt: i === 0,
      })
    }
    return punkte
  }

  const tage = zeitraum === 'monat' ? 30 : 7
  const punkte = []
  for (let i = tage - 1; i >= 0; i--) {
    const d = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate() - i)
    const e = daten[tagesSchluessel(d)] ?? {}
    const werte = leer()
    for (const a of ARTEN) werte[a] = e[a] ?? 0
    punkte.push({
      label:
        zeitraum === 'woche'
          ? d.toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', '')
          : String(d.getDate()),
      lang: d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }),
      werte,
      istJetzt: i === 0,
    })
  }
  return punkte
}
