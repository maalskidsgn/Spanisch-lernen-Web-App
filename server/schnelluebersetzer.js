import { claudeFetch } from './ki.js'
/**
 * Schnell-Übersetzer der Startseite (09.11.2026).
 *
 * Manuel: „Mir fällt in Argentinien ein Wort nicht ein – statt Google
 * soll das die App machen, dann liegt es gleich im Trainer.“
 *
 * Nimmt EIN Wort oder eine kurze Wendung in beliebiger Richtung:
 * Muttersprache → Spanisch oder Spanisch → Muttersprache. Liefert bis zu drei
 * Treffer plus einen Beispielsatz. Kein Teil des KI-Monatstopfs – es ist
 * ein Wörterbuch –, aber pro Nutzer und Tag begrenzt.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
// gpt-4o statt mini: Regionalwörter (pileta, colectivo …) kamen bei mini oft falsch zugeordnet
const MODELL = 'gpt-4o'
const PRO_TAG = 150

const SCHEMA = {
  type: 'object',
  properties: {
    treffer: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          wort: { type: 'string', description: 'Das Wort auf Spanisch (Nomen mit Artikel, falls die Sprache einen hat)' },
          uebersetzung: { type: 'string', description: 'Die Bedeutung in der Sprache des Lernenden, kurz' },
          hinweis: { type: 'string', description: 'Kurzer Hinweis (Region, Umgangssprache, Gebrauch) oder leer' },
        },
        required: ['wort', 'uebersetzung', 'hinweis'],
        additionalProperties: false,
      },
    },
    beispiel: { type: 'string', description: 'Ein kurzer, alltäglicher Beispielsatz auf Spanisch mit dem ersten Treffer' },
    beispiel_uebersetzung: { type: 'string' },
  },
  required: ['treffer', 'beispiel', 'beispiel_uebersetzung'],
  additionalProperties: false,
}

const GEMERKT = new Map()
const ZAEHLER = new Map() // "nutzerId|tag" -> anzahl

/** Darf der Nutzer heute noch nachschlagen? Zählt mit. */
export function nachschlagenErlaubt(nutzerId) {
  const s = nutzerId + '|' + new Date().toISOString().slice(0, 10)
  const n = (ZAEHLER.get(s) ?? 0) + 1
  ZAEHLER.set(s, n)
  if (ZAEHLER.size > 20000) ZAEHLER.clear()
  return n <= PRO_TAG
}

/**
 * @param {string} text   – Wort/Wendung, beliebige Richtung
 * @param {'de'|'en'} sprache – Sprache des Lernenden
 */
export async function schnellUebersetzen(text, sprache = 'de') {
  const sauber = String(text || '').trim().slice(0, 60)
  if (!sauber) return null
  const mutter = sprache === 'en' ? 'Englisch' : 'Deutsch'
  const schluessel = `${sprache}|${sauber.toLowerCase()}`
  if (GEMERKT.has(schluessel)) return GEMERKT.get(schluessel)
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('Kein KI-Schlüssel hinterlegt.')

  const antwort = await claudeFetch(OPENAI_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.ANTHROPIC_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODELL,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            `Du bist ein kompaktes Wörterbuch für Lernende. Muttersprache: ${mutter}. Zielsprache: Spanisch. ` +
            `Die Eingabe ist ein Wort oder eine kurze Wendung – entweder auf ${mutter} (dann suche das passende Spanische Wort) ` +
            `oder auf Spanisch (dann erkläre es auf ${mutter}). Tippfehler stillschweigend korrigieren. ` +
            `Gib 1 bis 3 Treffer, den gebräuchlichsten zuerst; "wort" ist IMMER das Spanische Wort, "uebersetzung" IMMER ${mutter}. ` +
            `Nomen IMMER mit bestimmtem Artikel (el/la). Zuerst das Wort, das überall verstanden wird. Nur wenn ein Wort in einer Region wirklich anders heißt, nenne diese Variante als eigenen Treffer mit der richtigen Region in \"hinweis\" (z. B. Argentinien: el colectivo, la pileta, la frutilla). Erfinde keine Regionen – im Zweifel weglassen. ` +
            `"hinweis" auf ${mutter}, höchstens 8 Wörter, sonst leer. Beispielsatz kurz und alltäglich, Übersetzung auf ${mutter}.`,
        },
        { role: 'user', content: sauber },
      ],
      response_format: { type: 'json_schema', json_schema: { name: 'nachschlagen', schema: SCHEMA, strict: true } },
    }),
  })
  if (!antwort.ok) throw new Error(`OpenAI antwortet mit ${antwort.status}`)
  const daten = JSON.parse((await antwort.json()).choices[0].message.content)
  daten.treffer = (daten.treffer || []).slice(0, 3)
  if (GEMERKT.size > 5000) GEMERKT.clear()
  GEMERKT.set(schluessel, daten)
  return daten
}
