import fs from 'node:fs'
import { claudeFetch } from './ki.js'

/**
 * Übungsgenerator (17.11.2026, Manuel).
 *
 *   1. uebungen.json – zu jeder „Gut zu wissen“-Regel der Lektionen ein fertiges
 *      Set (einmalig erzeugt, scratchpad/uebungen_vorab.py). Kostet nichts.
 *   2. Freie Themen erzeugt die KI (kleines Modell, festes JSON-Schema) – zählt
 *      als KI-Erstellung. Bis zum nächsten Neustart gemerkt.
 *
 * Drei Aufgabenarten, die die App selbst prüfen kann: luecke, wahl, satzbau.
 */
const SPRACHE = 'Spanisch'

const SYSTEM = `Du schreibst Übungen für eine ${SPRACHE}-Lern-App. Die Lernenden sprechen Deutsch oder Englisch und sind meist Anfänger.
Eingabe: ein Thema, das jemand üben will (Grammatik, Situation, Wortfeld – auf Deutsch, Englisch oder ${SPRACHE}), dazu das Niveau.
Du erstellst GENAU 8 Aufgaben dazu:

3× in der Liste "luecken": satz = ein kurzer ${SPRACHE}-Satz mit GENAU einer Lücke, geschrieben als ___ (drei Unterstriche).
   optionen = 3 Möglichkeiten für die Lücke (nur der fehlende Teil), loesung = die eine richtige (wörtlich aus optionen).
   Die beiden anderen müssen eindeutig falsch sein – nicht bloß unüblich. de/en = Übersetzung des vollständigen Satzes.
3× in der Liste "wahl": frage_de und frage_en = dieselbe Frage auf Deutsch und Englisch („Wie sagt man …?“, „Welche Form passt zu …?“).
   optionen = 3 Antworten AUF ${SPRACHE.toUpperCase()}, loesung = die richtige.
2× in der Liste "satzbau": woerter = die Wörter EINES korrekten ${SPRACHE}-Satzes in der richtigen Reihenfolge (3 bis 7 Wörter,
   Satzzeichen hängt am Wort). Nur Sätze, bei denen genau diese Reihenfolge die natürliche ist. de/en = Übersetzung.

Für jede Aufgabe: warum_de und warum_en = EIN kurzer Satz (höchstens 18 Wörter), warum die Lösung stimmt.
titel_de / titel_en: kurzer Name des Sets (höchstens 5 Wörter).

Regeln:
- Alles muss sprachlich 100 % korrekt sein. Im Zweifel die einfachere Aufgabe.
- Wortschatz passend zum Niveau.
- ${SPRACHE}-Text ohne Sternchen, in normaler korrekter Rechtschreibung. Spanisch MIT allen Akzenten und Sonderzeichen (á é í ó ú ñ ü ¿ ¡) – ein fehlender Akzent ist ein Fehler.
- Keine Aufgabe doppelt, die richtige Antwort steht nicht immer an derselben Stelle.
- Hat die Eingabe nichts mit dem ${SPRACHE}-Lernen zu tun oder ist sie unverständlich: geeignet = false und alle Listen leer.`

const T = { type: 'string' }
const LISTE = { type: 'array', items: T }
const obj = (felder) => ({ type: 'object', properties: felder, required: Object.keys(felder), additionalProperties: false })
const SCHEMA = obj({
  geeignet: { type: 'boolean' },
  titel_de: T,
  titel_en: T,
  luecken: { type: 'array', items: obj({ satz: T, optionen: LISTE, loesung: T, de: T, en: T, warum_de: T, warum_en: T }) },
  wahl: { type: 'array', items: obj({ frage_de: T, frage_en: T, optionen: LISTE, loesung: T, warum_de: T, warum_en: T }) },
  satzbau: { type: 'array', items: obj({ woerter: LISTE, de: T, en: T, warum_de: T, warum_en: T }) },
})

const s = (x) => String(x ?? '').trim()

/** Nur Aufgaben, die die App sicher selbst prüfen kann – im Wechsel Lücke, Wahl, Satzbau. */
export function ordneAufgaben(e) {
  const optionen = (a) => {
    const o = (a.optionen ?? []).map(s).filter(Boolean)
    return new Set(o).size === o.length && o.length >= 3 && o.length <= 4 && o.includes(s(a.loesung)) ? o : null
  }
  const warum = (a) => (s(a.warum_de) && s(a.warum_en) ? { warum_de: s(a.warum_de), warum_en: s(a.warum_en) } : null)
  const L = (e.luecken ?? []).map((a) => {
    const o = optionen(a), w = warum(a)
    if (!o || !w || s(a.satz).split('___').length !== 2 || !s(a.de) || !s(a.en)) return null
    return { typ: 'luecke', satz: s(a.satz), optionen: o, loesung: s(a.loesung), de: s(a.de), en: s(a.en), ...w }
  }).filter(Boolean)
  const W = (e.wahl ?? []).map((a) => {
    const o = optionen(a), w = warum(a)
    if (!o || !w || !s(a.frage_de) || !s(a.frage_en)) return null
    return { typ: 'wahl', frage_de: s(a.frage_de), frage_en: s(a.frage_en), optionen: o, loesung: s(a.loesung), ...w }
  }).filter(Boolean)
  const S = (e.satzbau ?? []).map((a) => {
    const woerter = (a.woerter ?? []).map(s).filter(Boolean), w = warum(a)
    if (!w || woerter.length < 3 || woerter.length > 8 || !s(a.de) || !s(a.en)) return null
    return { typ: 'satzbau', woerter, de: s(a.de), en: s(a.en), ...w }
  }).filter(Boolean)
  const gut = []
  const quellen = [L, W, S]
  while (quellen.some((q) => q.length)) for (const q of quellen) if (q.length) gut.push(q.shift())
  return gut
}

let VORAB = {}
try {
  VORAB = JSON.parse(fs.readFileSync(new URL('./uebungen.json', import.meta.url), 'utf8'))
} catch {
  VORAB = {}
}

/** Fertiges Set zu einer Regel (z. B. „begruessung:0“) – oder null. */
export function uebungenZurRegel(id) {
  const set = VORAB[String(id || '')]
  return Array.isArray(set) && set.length ? set : null
}

const GEMERKT = new Map()
const schluessel = (thema, niveau) => `${niveau}|${String(thema).normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ')}`

export function uebungenGemerkt(thema, niveau = 'A1') {
  return GEMERKT.get(schluessel(thema, niveau)) ?? null
}

export async function uebungenErzeugen(thema, niveau = 'A1') {
  const antwort = await claudeFetch('', {
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-4o-mini', // → kleines Modell (Haiku): Übungen sind Masse und sollen wenig kosten
      temperature: 0.4,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `Thema: ${String(thema).slice(0, 120)}\nNiveau: ${niveau}` },
      ],
      response_format: { type: 'json_schema', json_schema: { name: 'uebungen', schema: SCHEMA, strict: true } },
    }),
  })
  if (!antwort.ok) throw new Error('KI antwortet mit ' + antwort.status)
  const daten = JSON.parse((await antwort.json()).choices[0].message.content)
  if (!daten.geeignet) return null
  const aufgaben = ordneAufgaben(daten)
  if (aufgaben.length < 5) return null
  const set = { titel: { de: s(daten.titel_de) || String(thema), en: s(daten.titel_en) || String(thema) }, aufgaben }
  GEMERKT.set(schluessel(thema, niveau), set)
  if (GEMERKT.size > 2000) GEMERKT.clear()
  return set
}
