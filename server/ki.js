// Claude statt OpenAI für alle Text-Generierungen (Manuel, 10.11.2026).
// Die Stimme (Sprach-Trainer, Realtime) bleibt bei OpenAI – siehe sprechen.js.
//
// Modellwahl „gemischt“:
//   HAIKU  – Masse: Wortlisten, Sätze, Übersetzen, Chat, Auswertungen
//   SONNET – Texte: Lesetexte, E-Books, Buch-Zusammenfassung, Schnell-Übersetzer
//
// kiChat() nimmt bewusst noch den alten OpenAI-Aufbau entgegen
// ({ messages, response_format }), damit die einzelnen Module kaum
// geändert werden mussten, und gibt { choices: [{ message: { content } }] }
// zurück. So bleibt der Umbau klein und überprüfbar.

import Anthropic from '@anthropic-ai/sdk'

export const HAIKU = 'claude-haiku-5-5'
export const SONNET = 'claude-sonnet-5-5'

let kunde = null
const client = () => (kunde ??= new Anthropic()) // liest ANTHROPIC_API_KEY

export const kiBereit = () => Boolean(process.env.ANTHROPIC_API_KEY)

// Structured Outputs verlangen additionalProperties: false und kennen keine
// Längen-/Zahlengrenzen – die streichen wir aus den alten Schemas.
const OHNE = new Set(['minLength', 'maxLength', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf', 'minItems', 'maxItems', 'uniqueItems', 'pattern'])
export function claudeSchema(s) {
  if (Array.isArray(s)) return s.map(claudeSchema)
  if (!s || typeof s !== 'object') return s
  const neu = {}
  for (const [k, v] of Object.entries(s)) {
    if (OHNE.has(k)) continue
    neu[k] = (k === 'properties' || k === '$defs' || k === 'definitions')
      ? Object.fromEntries(Object.entries(v).map(([n, t]) => [n, claudeSchema(t)]))
      : claudeSchema(v)
  }
  if (Array.isArray(neu.type)) {
    const { type, ...rest } = neu
    return { anyOf: type.map((t) => (t === 'null' ? { type: 'null' } : claudeSchema({ ...rest, type: t }))) }
  }
  const istObjekt = neu.type === 'object' || (Array.isArray(neu.type) && neu.type.includes('object'))
  if (istObjekt && neu.properties) neu.additionalProperties = false
  return neu
}

function inhalt(c) {
  if (typeof c === 'string') return c
  if (Array.isArray(c)) return c.map((t) => (typeof t === 'string' ? t : t.text ?? '')).join('\n')
  return String(c ?? '')
}

/**
 * Ein Aufruf im alten OpenAI-Format → Claude.
 * @param {object} body   { messages, response_format?, max_tokens? }
 * @param {string} modell HAIKU | SONNET
 * @param {object} opt    { maxTokens, aufwand }
 */
export async function kiChat(body, modell = HAIKU, opt = {}) {
  if (!kiBereit()) throw new Error('Kein Anthropic-Schlüssel hinterlegt.')
  const system = body.messages.filter((m) => m.role === 'system').map((m) => inhalt(m.content)).join('\n\n')
  const messages = body.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: inhalt(m.content) || '…' }))
  // Claude verlangt, dass das Gespräch mit dem Nutzer beginnt
  if (!messages.length || messages[0].role !== 'user') messages.unshift({ role: 'user', content: '(Start)' })

  const schema = body.response_format?.json_schema?.schema
  const params = {
    model: modell,
    // Großzügig: Claude denkt vorher kurz nach, das zählt mit. Bezahlt wird nur, was entsteht.
    max_tokens: opt.maxTokens ?? 16000,
    ...(system ? { system } : {}),
    messages,
    output_config: {
      effort: opt.aufwand ?? 'low', // schnell antworten – Nutzer warten am Bildschirm
      ...(schema ? { format: { type: 'json_schema', schema: claudeSchema(schema) } } : {}),
    },
  }

  let r
  try {
    r = modell === SONNET
      // Lehnt Sonnet aus Sicherheitsgründen ab, springt Anthropic selbst auf ein Ersatzmodell
      ? await client().beta.messages.create({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' })
      : await client().messages.create(params)
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) throw new Error('KI-Kontingent gerade erschöpft. Bitte gleich noch einmal versuchen.')
    if (e instanceof Anthropic.APIError) throw new Error(`Claude antwortet mit ${e.status}: ${e.message}`)
    throw e
  }
  if (r.stop_reason === 'refusal') throw new Error('Die KI hat diese Anfrage abgelehnt.')
  if (r.stop_reason === 'max_tokens') throw new Error('Die Antwort der KI war zu lang und wurde abgeschnitten.')
  const text = r.content.filter((b) => b.type === 'text').map((b) => b.text).join('')
  return { choices: [{ message: { content: text } }], usage: r.usage }
}

/**
 * Drop-in für die alten OpenAI-Aufrufe: fetch(OPENAI_URL, { body }) →
 * claudeFetch(OPENAI_URL, { body }). Gibt ein Response-ähnliches Objekt
 * zurück ({ ok, status, json(), text() }), damit die Module unverändert
 * weiterlesen können. gpt-4o → Sonnet, alles andere (gpt-4o-mini) → Haiku.
 */
export async function claudeFetch(_url, optionen = {}) {
  const body = JSON.parse(optionen.body || '{}')
  const modell = String(body.model || '').startsWith('gpt-4o') && !String(body.model).includes('mini') ? SONNET : HAIKU
  try {
    const daten = await kiChat(body, modell)
    return { ok: true, status: 200, json: async () => daten, text: async () => JSON.stringify(daten) }
  } catch (e) {
    const status = /Kontingent/.test(e.message) ? 429 : 502
    console.error('Claude:', e.message)
    return { ok: false, status, json: async () => ({ error: { message: e.message } }), text: async () => e.message }
  }
}
