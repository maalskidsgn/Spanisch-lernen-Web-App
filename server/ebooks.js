/**
 * Bilinguale E-Books für Habloo.
 *
 * Ein E-Book besteht aus Absatzpaaren: links der spanische Text,
 * rechts die deutsche Übersetzung. So kann man lesen und bei jedem
 * Satz nachschauen, ohne das Wörterbuch zu bemühen.
 *
 * Erzeugt werden sie von OpenAI. Der Server ist bewusst die einzige
 * Stelle, die Bücher anlegen darf – sonst könnte man das Monatslimit
 * im Browser einfach umgehen.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const MODELL = 'gpt-4o-mini'

/** Wie viele Bücher darf ein kostenloser Zugang pro Monat erzeugen? */
export const FREI_PRO_MONAT = 3

// ---------------------------------------------------------------
//  Aufbau der Antwort, den wir von OpenAI erwarten
// ---------------------------------------------------------------
const SCHEMA = {
  type: 'object',
  properties: {
    titel: { type: 'string', description: 'Spanischer Titel des Buches' },
    autor: { type: 'string', description: 'Erfundener Autorenname' },
    kapitel: {
      type: 'array',
      description: 'Die Absätze der Geschichte, jeweils spanisch und deutsch',
      items: {
        type: 'object',
        properties: {
          es: { type: 'string', description: 'Ein Absatz auf Spanisch' },
          de: { type: 'string', description: 'Die deutsche Übersetzung desselben Absatzes' },
        },
        required: ['es', 'de'],
        additionalProperties: false,
      },
    },
    vokabeln: {
      type: 'array',
      description: 'Die 10 wichtigsten Wörter aus dem Text',
      items: {
        type: 'object',
        properties: {
          es: { type: 'string' },
          de: { type: 'string' },
        },
        required: ['es', 'de'],
        additionalProperties: false,
      },
    },
  },
  required: ['titel', 'autor', 'kapitel', 'vokabeln'],
  additionalProperties: false,
}

// ---------------------------------------------------------------
//  Erzeugen
// ---------------------------------------------------------------

/**
 * Lässt OpenAI ein bilinguales E-Book schreiben.
 * @param {string} thema  – worum es gehen soll, z. B. "Ein Tag in Barcelona"
 * @param {string} niveau – A1 | A2 | B1 | B2
 */
export async function erzeugeEbook(thema, niveau = 'A2') {
  const schluessel = process.env.OPENAI_API_KEY
  if (!schluessel) throw new Error('Kein OpenAI-Schlüssel hinterlegt.')

  const vorgaben = {
    A1: 'sehr einfache Sätze, Präsens, Grundwortschatz, 6 kurze Absätze',
    A2: 'einfache Sätze, Präsens und Vergangenheit, Alltagswortschatz, 8 Absätze',
    B1: 'natürliche Sprache, verschiedene Zeiten, 10 Absätze',
    B2: 'anspruchsvolle Sprache, Redewendungen, 10 längere Absätze',
  }[niveau] ?? 'einfache Sätze, 8 Absätze'

  const antwort = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${schluessel}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODELL,
      messages: [
        {
          role: 'system',
          content:
            'Du schreibst zweisprachige Lesetexte für deutschsprachige Spanischlernende. ' +
            'Der spanische Text steht im Mittelpunkt; die deutsche Übersetzung ist ' +
            'natürlich formuliert, nicht Wort für Wort. Jeder Absatz erscheint genau ' +
            'einmal auf Spanisch und einmal auf Deutsch.',
        },
        {
          role: 'user',
          content:
            `Schreibe eine zusammenhängende Geschichte zum Thema "${thema}" ` +
            `für Niveau ${niveau}: ${vorgaben}. ` +
            'Wähle zum Schluss die 10 nützlichsten Vokabeln aus dem Text aus.',
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'ebook', schema: SCHEMA, strict: true },
      },
    }),
  })

  if (!antwort.ok) {
    const text = await antwort.text()
    // Häufigste Fälle verständlich machen
    if (antwort.status === 401) throw new Error('Der OpenAI-Schlüssel wird nicht akzeptiert.')
    if (antwort.status === 429) throw new Error('OpenAI-Kontingent erschöpft. Bitte später erneut versuchen.')
    throw new Error(`OpenAI antwortet mit ${antwort.status}: ${text.slice(0, 200)}`)
  }

  const daten = await antwort.json()
  const inhalt = daten.choices?.[0]?.message?.content
  if (!inhalt) throw new Error('OpenAI hat keinen Text geliefert.')

  const buch = JSON.parse(inhalt)
  return { ...buch, niveau, thema }
}

// ---------------------------------------------------------------
//  Zugriff auf die Datenbank (mit service_role, umgeht RLS)
// ---------------------------------------------------------------

function supabaseKopf() {
  const key = process.env.SUPABASE_SERVICE_KEY
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

/** Prüft anhand des Anmelde-Tokens, wer gerade fragt. */
export async function nutzerAusToken(token) {
  if (!token) return null

  const antwort = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  })
  if (!antwort.ok) return null

  const nutzer = await antwort.json()
  return nutzer?.id ? nutzer : null
}

/** Zählt, wie viele Bücher dieser Nutzer im laufenden Monat erzeugt hat. */
export async function anzahlDiesenMonat(nutzerId) {
  const monatsAnfang = new Date()
  monatsAnfang.setDate(1)
  monatsAnfang.setHours(0, 0, 0, 0)

  const antwort = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/ebooks` +
      `?select=id&nutzer_id=eq.${nutzerId}` +
      `&erstellt_am=gte.${monatsAnfang.toISOString()}`,
    { headers: { ...supabaseKopf(), Prefer: 'count=exact' } }
  )

  if (!antwort.ok) return 0
  return (await antwort.json()).length
}

/** Legt ein erzeugtes Buch für den Nutzer ab. */
export async function speichereEbook(nutzerId, buch) {
  const antwort = await fetch(`${process.env.SUPABASE_URL}/rest/v1/ebooks`, {
    method: 'POST',
    headers: { ...supabaseKopf(), Prefer: 'return=representation' },
    body: JSON.stringify({
      nutzer_id: nutzerId,
      titel: buch.titel,
      autor: buch.autor,
      thema: buch.thema,
      niveau: buch.niveau,
      kapitel: buch.kapitel,
      vokabeln: buch.vokabeln,
      ist_beispiel: false,
    }),
  })

  if (!antwort.ok) {
    throw new Error('Buch konnte nicht gespeichert werden: ' + (await antwort.text()).slice(0, 200))
  }
  return (await antwort.json())[0]
}
