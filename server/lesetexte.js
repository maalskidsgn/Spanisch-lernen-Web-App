/**
 * Kurze Wissenstexte mit KI erzeugen.
 *
 * Die Idee dahinter: Vokabeln und Sätze übt man, Texte LIEST man –
 * und zwar mehrmals. Beim dritten Lesen versteht man Wendungen, die
 * beim ersten noch Rätsel waren, ohne sie je gepaukt zu haben. Damit
 * genau dieses Wiederlesen nicht vergessen wird, laufen die Texte
 * durch dieselbe Wiederhol-Logik wie die Karteikarten (srs.js).
 *
 * Deshalb Allgemeinwissen statt Lehrbuch-Dialogen: Einen Text über
 * Vulkane oder über den Schlaf liest man auch beim dritten Mal noch
 * gern. "Pedro geht zum Bäcker" nicht.
 *
 * Jeder Text kommt zweisprachig zurück – Absatz für Absatz paarweise,
 * damit die App zwischen Spanisch und Deutsch umschalten kann, ohne
 * die Stelle zu verlieren.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const MODELL = 'gpt-4o-mini'

/** Wie viele Absätze hat ein Text? */
export const ABSAETZE = 4

// ---------------------------------------------------------------
//  Die Wissensgebiete
// ---------------------------------------------------------------
//
// Bewusst breit und alltagsnah: Jedes Gebiet soll Stoff für hundert
// Texte hergeben, und man soll beim Lesen etwas mitnehmen, das man
// am Abendbrottisch erzählen kann.
export const GEBIETE = {
  natur: 'Natur und Tiere',
  wissenschaft: 'Wissenschaft und Technik',
  geschichte: 'Geschichte',
  koerper: 'Körper und Gesundheit',
  weltall: 'Weltall',
  kultur: 'Kunst, Musik und Kultur',
  laender: 'Länder und Leute',
  alltag: 'Erstaunliches aus dem Alltag',
}

// ---------------------------------------------------------------
//  Schwierigkeitsstufen
// ---------------------------------------------------------------
const STUFEN = {
  a2: 'Stufe A2: kurze Hauptsätze, Grundwortschatz, Präsens und Perfekt. Höchstens 14 Wörter pro Satz.',
  b1: 'Stufe B1: normale Alltagssprache, auch Nebensätze und Vergangenheitsformen. Höchstens 20 Wörter pro Satz.',
  b2: 'Stufe B2: natürliches Spanisch mit Subjuntivo und abwechslungsreichem Satzbau, aber ohne Fachjargon.',
}

const TEXT_SCHEMA = {
  type: 'object',
  properties: {
    titel_es: { type: 'string', description: 'Spanischer Titel, höchstens sechs Wörter' },
    titel_de: { type: 'string', description: 'Derselbe Titel auf Deutsch' },
    absaetze: {
      type: 'array',
      description: `Genau ${ABSAETZE} Absätze, jeder in beiden Sprachen`,
      items: {
        type: 'object',
        properties: {
          es: {
            type: 'string',
            description: 'Der Absatz auf Spanisch, zwei bis vier Sätze',
          },
          de: {
            type: 'string',
            description:
              'Derselbe Absatz auf Deutsch – natürliches Deutsch, keine ' +
              'Wort-für-Wort-Übertragung, aber inhaltlich deckungsgleich.',
          },
        },
        required: ['es', 'de'],
        additionalProperties: false,
      },
    },
    woerter: {
      type: 'array',
      description: 'Fünf Wörter aus dem Text, die zu lernen sich lohnt',
      items: {
        type: 'object',
        properties: {
          wort: { type: 'string', description: 'Das spanische Wort, bei Nomen mit Artikel' },
          uebersetzung: { type: 'string', description: 'Die deutsche Übersetzung' },
        },
        required: ['wort', 'uebersetzung'],
        additionalProperties: false,
      },
    },
    merksatz: {
      type: 'string',
      description:
        'Die überraschendste Tatsache aus dem Text, auf Deutsch, in einem Satz. ' +
        'Das, was man weitererzählen würde.',
    },
  },
  required: ['titel_es', 'titel_de', 'absaetze', 'woerter', 'merksatz'],
  additionalProperties: false,
}

/** Schon vorhandene Titel – damit nichts zweimal kommt. */
function bekanntesAlsHinweis(bekannt) {
  const liste = (bekannt ?? []).filter(Boolean).slice(0, 40)
  if (!liste.length) return ''
  return (
    '\n\nÜber diese Themen gibt es schon Texte – nimm ein anderes:\n' +
    liste.map((t) => '- ' + t).join('\n')
  )
}

/**
 * Schreibt einen kurzen zweisprachigen Wissenstext.
 *
 * @param {string}   gebiet  – Schlüssel aus GEBIETE, oder '' für freie Wahl
 * @param {string}   thema   – eigenes Thema; schlägt das Gebiet
 * @param {string}   stufe   – 'a2' | 'b1' | 'b2'
 * @param {string[]} bekannt – Titel schon vorhandener Texte
 */
export async function erzeugeLesetext(gebiet = '', thema = '', stufe = 'b1', bekannt = []) {
  const schluessel = process.env.OPENAI_API_KEY
  if (!schluessel) throw new Error('Kein OpenAI-Schlüssel hinterlegt.')

  const stufenRegel = STUFEN[stufe] ?? STUFEN.b1
  const gebietName = GEBIETE[gebiet]

  const auftrag =
    (thema?.trim()
      ? `Wunsch der lernenden Person (eigene Beschreibung, meist auf Deutsch): "${thema.trim()}"\n` +
        'Schreibe den Text genau zu diesem Wunsch – Inhalt, Blickwinkel und Zweck übernehmen, ' +
        'auch wenn es kein klassisches Wissensthema ist (z. B. Ratgeber, Erklärung, Geschichte).'
      : gebietName
        ? `Wissensgebiet: ${gebietName}. Wähle daraus ein konkretes, überraschendes Thema.`
        : 'Wähle selbst ein konkretes, überraschendes Allgemeinwissen-Thema.') +
    '\n' +
    stufenRegel +
    bekanntesAlsHinweis(bekannt)

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
            'Du schreibst kurze Wissenstexte auf Spanisch für deutschsprachige ' +
            `Lernende, zum mehrmaligen Lesen. Genau ${ABSAETZE} Absätze. Regeln: ` +
            'Erzähle EINE Sache richtig, statt fünf anzureißen. Fang mit dem ' +
            'Überraschenden an, nicht mit einer Definition ("Der Oktopus hat drei ' +
            'Herzen" statt "Der Oktopus ist ein Weichtier"). Nenne nur Tatsachen, ' +
            'bei denen du sicher bist – lieber eine Zahl weglassen als sie zu ' +
            'erfinden. Keine Anrede, keine Fragen an die Lesenden, keine ' +
            'Überleitungen wie "Wie wir gesehen haben". Die deutsche Fassung ist ' +
            'eine echte Übersetzung desselben Absatzes, kein eigener Text.',
        },
        { role: 'user', content: auftrag },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'lesetext', schema: TEXT_SCHEMA, strict: true },
      },
    }),
  })

  if (!antwort.ok) {
    if (antwort.status === 429) {
      throw new Error('OpenAI-Kontingent erschöpft. Bitte später erneut versuchen.')
    }
    throw new Error(`OpenAI antwortet mit ${antwort.status}`)
  }

  const daten = await antwort.json()
  const text = JSON.parse(daten.choices[0].message.content)

  return {
    ...text,
    gebiet: gebiet || '',
    stufe,
  }
}
