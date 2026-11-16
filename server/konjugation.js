import fs from 'node:fs'
import { claudeFetch } from './ki.js'

/**
 * KI-Konjugationstabellen (16.11.2026, Manuel).
 *
 * Reihenfolge beim Nachschlagen:
 *   1. konjugationen.json – die 100 häufigsten Verben, vorab erzeugt und geprüft
 *   2. Zwischenspeicher – einmal erzeugte Verben bis zum nächsten Neustart
 *   3. KI (Claude über claudeFetch) mit festem JSON-Schema – zählt als KI-Erstellung
 * Dieselbe Vorgabe wie scratchpad/konjugation_prompt.py (Vorab-Erzeugung).
 */

const SYSTEM = "Du erstellst Konjugationstabellen für eine Spanisch-Lern-App (Lernende mit Deutsch oder Englisch als Muttersprache).\nEingabe: ein spanisches Verb (Infinitiv, evtl. mit Tippfehler oder konjugiert) ODER ein deutsches bzw. englisches Verb – dann nimm das gebräuchlichste spanische Verb dafür (z. B. „sprechen“ oder „to speak“ → hablar). Ist es kein Verb: ist_verb = false und sonst leere Felder.\nLiefere den korrekten Infinitiv, die Bedeutung (de/en) und einen kurzen Hinweis (de/en, max. 15 Wörter, z. B. „stark unregelmäßig“, „Stammwechsel e→ie“, „regelmäßig auf -ar“).\nZeiten in GENAU dieser Reihenfolge und mit diesen ids: presente, indefinido, imperfecto, perfecto, futuro, condicional, subjuntivo (Presente de subjuntivo), imperativo (bejaht).\nPersonen (außer imperativo): „yo“, „tú“, „él/ella/usted“, „nosotros/as“, „vosotros/as“, „ellos/ellas/ustedes“.\nimperativo: „tú“, „usted“, „nosotros/as“, „vosotros/as“, „ustedes“.\nname: deutscher und englischer Zeitname (z. B. „Präsens (presente)“ / „Present (presente)“).\nunregelmaessig = true, wenn die Form NICHT dem Muster eines regelmäßigen Verbs ihrer Gruppe folgt (auch Stammwechsel, Akzent-/Schreibänderung).\nbeispiel: ein kurzer Alltagssatz mit einer Form dieser Zeit + Übersetzung de/en.\nAlles muss zu 100 % korrekt sein (Akzente!)."

const ZWEI = { type: 'object', properties: { de: { type: 'string' }, en: { type: 'string' } }, required: ['de', 'en'], additionalProperties: false }
const SCHEMA = {
  type: 'object',
  properties: {
    ist_verb: { type: 'boolean' },
    verb: { type: 'string' },
    bedeutung: ZWEI,
    hinweis: ZWEI,
    zeiten: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: ZWEI,
          formen: {
            type: 'array',
            items: {
              type: 'object',
              properties: { person: { type: 'string' }, form: { type: 'string' }, unregelmaessig: { type: 'boolean' } },
              required: ['person', 'form', 'unregelmaessig'],
              additionalProperties: false,
            },
          },
          beispiel: { type: 'object', properties: { ziel: { type: 'string' }, de: { type: 'string' }, en: { type: 'string' } }, required: ['ziel', 'de', 'en'], additionalProperties: false },
        },
        required: ['id', 'name', 'formen', 'beispiel'],
        additionalProperties: false,
      },
    },
  },
  required: ['ist_verb', 'verb', 'bedeutung', 'hinweis', 'zeiten'],
  additionalProperties: false,
}

/** Schlüssel ohne Betonungszeichen und Großschreibung */
export const verbSchluessel = (v) => String(v || '').normalize('NFD').replace(/\u0301/g, '').normalize('NFC').trim().toLowerCase()

let VORAB = {}
try {
  const roh = JSON.parse(fs.readFileSync(new URL('./konjugationen.json', import.meta.url), 'utf8'))
  for (const e of Object.values(roh)) VORAB[verbSchluessel(e.verb)] = e
} catch {
  VORAB = {}
}
const GEMERKT = new Map()

// Anfänger tippen das Verb in ihrer Sprache (16.11.2026, Manuel): „sprechen“
// oder „to speak“ findet dasselbe Verb. Das häufigere Verb gewinnt bei
// gleicher Bedeutung (die Datei ist nach Häufigkeit sortiert).
const ohneKlammern = (text) => String(text || '').replace(/\(.*?\)/g, '')
const erste = (text) => ohneKlammern(text).split(/[,;/]/)[0].trim()
const NACH_BEDEUTUNG = new Map()
{
  // Rang: Hauptbedeutung vor Nebenbedeutung, Grundform (imperfektiv) vor Aspektpartner
  const rang = new Map()
  for (const e of Object.values(VORAB)) {
    const grundform = /^imperfe[ck]tiv/i.test(e.hinweis?.de || '') ? 0 : 1
    const namen = [
      ...ohneKlammern(e.bedeutung?.de).split(/[,;]/).map((t, i) => [t, i]),
      ...ohneKlammern(e.bedeutung?.en).split(/[,;]/).map((t, i) => [t.trim().replace(/^to\s+/i, ''), i]),
    ]
    for (const [n, stelle] of namen) {
      const k = verbSchluessel(n)
      const r = Math.min(stelle, 1) * 2 + grundform
      if (k && !VORAB[k] && (rang.get(k) ?? 9) > r) {
        rang.set(k, r)
        NACH_BEDEUTUNG.set(k, e)
      }
    }
  }
}

export function konjugationNachschlagen(verb) {
  const k = verbSchluessel(verb)
  return VORAB[k] ?? GEMERKT.get(k) ?? NACH_BEDEUTUNG.get(k) ?? NACH_BEDEUTUNG.get(k.replace(/^to\s+/, '')) ?? null
}

/** Vorschläge mit Bedeutung – die App zeigt sie in der Sprache des Lernenden. */
export function vorschlagsVerben() {
  return Object.values(VORAB).map((e) => ({ verb: e.verb, de: erste(e.bedeutung?.de), en: erste(e.bedeutung?.en) }))
}

export async function konjugationErzeugen(verb) {
  const eingabe = String(verb || '').trim().slice(0, 40)
  const antwort = await claudeFetch('', {
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: eingabe },
      ],
      response_format: { type: 'json_schema', json_schema: { name: 'konjugation', schema: SCHEMA, strict: true } },
    }),
  })
  if (!antwort.ok) throw new Error('KI antwortet mit ' + antwort.status)
  const daten = JSON.parse((await antwort.json()).choices[0].message.content)
  if (!daten.ist_verb || !daten.zeiten?.length) return null
  GEMERKT.set(verbSchluessel(daten.verb), daten)
  GEMERKT.set(verbSchluessel(eingabe), daten)
  if (GEMERKT.size > 3000) GEMERKT.clear()
  return daten
}
