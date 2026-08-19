// Erkennt unter den Spotify-Künstlern eines Nutzers die
// spanischsprachigen.
//
// Warum überhaupt KI? Spotify verrät nicht, in welcher Sprache ein
// Künstler singt. Es gibt zwar Genre-Etiketten, aber "pop" sagt
// nichts, und viele Künstler haben gar keine. Ein Sprachmodell
// dagegen kennt die Künstler und weiß, dass Rosalía spanisch singt
// und Adele nicht.
//
// Die Namen gehen als reine Liste raus – keine Nutzerdaten, keine
// Kennungen, kein Hörverlauf.

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const MODELL = 'gpt-4o-mini'

const SCHEMA = {
  type: 'object',
  properties: {
    interpreten: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          herkunft: {
            type: 'string',
            description: 'Land, z. B. "Kolumbien", "Spanien"',
          },
          stil: {
            type: 'string',
            description: 'Kurz, z. B. "Reggaetón", "Flamenco-Pop"',
          },
          sicher: {
            type: 'boolean',
            description: 'true, wenn zweifelsfrei spanischsprachig',
          },
        },
        required: ['name', 'herkunft', 'stil', 'sicher'],
        additionalProperties: false,
      },
    },
  },
  required: ['interpreten'],
  additionalProperties: false,
}

/**
 * @param {{name: string, punkte: number}[]} kuenstler – aus Spotify
 * @returns {Promise<{interpreten: object[], geprueft: number}>}
 */
export async function findeSpanischeInterpreten(kuenstler) {
  const schluessel = process.env.OPENAI_API_KEY
  if (!schluessel) throw new Error('Auf dem Server fehlt der OpenAI-Schlüssel.')

  const namen = (kuenstler ?? [])
    .map((k) => (typeof k === 'string' ? k : k?.name))
    .filter(Boolean)
    .slice(0, 120)

  if (namen.length === 0) return { interpreten: [], geprueft: 0 }

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
            'Du bekommst eine Liste von Musikkünstlern und gibst nur die zurück, ' +
            'deren Repertoire GRÖSSTENTEILS spanischsprachig ist. Sei sehr streng: ' +
            'Künstler, die hauptsächlich auf Deutsch, Englisch, Französisch oder ' +
            'Portugiesisch singen, lässt du IMMER weg – auch wenn sie einzelne ' +
            'spanische Wörter, Songtitel oder Latin-Einflüsse haben. Beispiele für ' +
            'FALSCHE Treffer, die du weglassen musst: RAF Camora, Gzuz, RIN ' +
            '(deutsche Rapper mit Latin-Sound, singen aber Deutsch). Künstler, die ' +
            'du nicht sicher kennst, lässt du ebenfalls weg. "sicher" auf false ' +
            'setzt du NUR bei Künstlern, deren Katalog etwa zur Hälfte wirklich ' +
            'spanischsprachige Lieder enthält (z. B. Shakira, Enrique Iglesias).',
        },
        {
          role: 'user',
          content:
            'Welche dieser Künstler singen auf Spanisch?\n\n' + namen.join(', '),
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'interpreten', strict: true, schema: SCHEMA },
      },
      temperature: 0.2,
    }),
  })

  if (!antwort.ok) {
    const text = await antwort.text()
    throw new Error('OpenAI: ' + text.slice(0, 200))
  }

  const daten = await antwort.json()
  const ergebnis = JSON.parse(daten.choices[0].message.content)

  // Reihenfolge nach der Spotify-Gewichtung: Was der Nutzer am
  // meisten hört, steht oben.
  const rang = new Map(
    (kuenstler ?? []).map((k, i) => [typeof k === 'string' ? k : k?.name, i])
  )
  ergebnis.interpreten.sort(
    (a, b) => (rang.get(a.name) ?? 999) - (rang.get(b.name) ?? 999)
  )

  return { interpreten: ergebnis.interpreten, geprueft: namen.length }
}

const SONG_SCHEMA = {
  type: 'object',
  properties: {
    interpreten: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          songs: {
            type: 'array',
            description: 'Bekannte spanischsprachige Lieder dieses Künstlers',
            items: { type: 'string' },
          },
        },
        required: ['name', 'songs'],
        additionalProperties: false,
      },
    },
  },
  required: ['interpreten'],
  additionalProperties: false,
}

/**
 * Ergänzt fehlende Songs.
 *
 * Warum die KI und nicht Spotify? Spotify hat die Katalog-Abfragen
 * (Suche, Top-Tracks) im Februar 2026 für Apps im Entwicklungsmodus
 * abgeschaltet – und die Freischaltung verlangt 250.000 monatliche
 * Nutzer. Die Lieder aus der eigenen Bibliothek des Nutzers holen
 * wir weiterhin direkt; nur wo dort zu wenige stehen, springt die
 * KI ein. Sie kennt die bekannten Lieder dieser Künstler.
 *
 * @param {string[]} namen – Künstler, denen Songs fehlen
 */
export async function ergaenzeSongs(namen) {
  const schluessel = process.env.OPENAI_API_KEY
  if (!schluessel) throw new Error('Auf dem Server fehlt der OpenAI-Schlüssel.')
  if (!namen?.length) return { interpreten: [] }

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
            'Du nennst zu jedem Künstler seine fünf bekanntesten SPANISCHSPRACHIGEN ' +
            'Lieder – nur den Titel, ohne Künstlernamen, ohne Anführungszeichen. ' +
            'Nimm nur Lieder, die es wirklich gibt und die du sicher zuordnen ' +
            'kannst. Kennst du einen Künstler nicht gut genug, gib eine leere ' +
            'Liste zurück statt zu raten.',
        },
        { role: 'user', content: namen.slice(0, 10).join(', ') },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'songs', strict: true, schema: SONG_SCHEMA },
      },
      temperature: 0.2,
    }),
  })

  if (!antwort.ok) throw new Error('OpenAI: ' + (await antwort.text()).slice(0, 200))
  const daten = await antwort.json()
  return JSON.parse(daten.choices[0].message.content)
}
