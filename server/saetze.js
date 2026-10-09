/**
 * Sätze mit KI erzeugen – das Gegenstück zur Vokabelliste.
 *
 * Der Unterschied zum Wortschatz: Ein Satz trainiert nicht nur die
 * Bedeutung, sondern auch den Satzbau und die Zeitform. Deshalb kann
 * man hier zweierlei vorgeben – ein Thema ("Im Restaurant") UND eine
 * Zeitform ("Condicional"). Beides zusammen ergibt gezielte Übung:
 * "Sätze zum Condicional rund ums Reisen".
 *
 * Erzeugt wird auf dem Server, nicht im Browser: Der Schlüssel bleibt
 * hier, und das Tageskontingent lässt sich nicht umgehen.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const MODELL = 'gpt-4o-mini'

/** Wie viele Sätze liefert eine Anfrage? */
export const SAETZE_PRO_LISTE = 10

// ---------------------------------------------------------------
//  Die Zeitformen, die man vorgeben kann
// ---------------------------------------------------------------
//
// Dieselben sechs wie im Nachschlagewerk der App (Nachschlag.jsx),
// damit Üben und Nachschlagen zusammenpassen. Der Text hinter dem
// Schlüssel geht WÖRTLICH an das Modell – er muss die Form also
// eindeutig benennen, nicht nur ihren deutschen Namen.
export const ZEITFORMEN = {
  presente: 'Alle Sätze stehen im Presente (Gegenwart).',
  perfecto:
    'Alle Sätze stehen im Pretérito perfecto (he hablado) – also haber im ' +
    'Presente plus Partizip.',
  indefinido:
    'Alle Sätze stehen im Pretérito indefinido (hablé) – abgeschlossene ' +
    'Vergangenheit mit klarem Zeitpunkt.',
  imperfecto:
    'Alle Sätze stehen im Imperfecto (hablaba) – Gewohnheiten, Zustände und ' +
    'Hintergrund in der Vergangenheit.',
  futuro: 'Alle Sätze stehen im Futuro simple (hablaré).',
  condicional:
    'Alle Sätze stehen im Condicional (hablaría) – Höflichkeit, Wünsche, ' +
    'hypothetische Aussagen.',
  subjuntivo:
    'Alle Sätze enthalten den Subjuntivo Presente (que hable) – nach ' +
    'Ausdrücken wie "espero que", "quiero que", "es importante que".',
}

/** Menschenlesbare Namen – die App zeigt sie auf den Chips. */
export const ZEITFORM_NAMEN = {
  presente: 'Presente',
  perfecto: 'Pretérito perfecto',
  indefinido: 'Pretérito indefinido',
  imperfecto: 'Imperfecto',
  futuro: 'Futuro',
  condicional: 'Condicional',
  subjuntivo: 'Subjuntivo',
}

// ---------------------------------------------------------------
//  Aufbau der erwarteten Antwort
// ---------------------------------------------------------------
const SATZ_SCHEMA = {
  type: 'object',
  properties: {
    thema: {
      type: 'string',
      description: 'Kurzer Name für diese Satzliste, z. B. "Im Restaurant bestellen"',
    },
    hinweis: {
      type: 'string',
      description:
        'Ein bis zwei Sätze auf Deutsch: Was ist an diesen Sätzen das ' +
        'Lernenswerte? Bei vorgegebener Zeitform: woran erkennt man sie? ' +
        'Persönlich formuliert, direkte Anrede.',
    },
    saetze: {
      type: 'array',
      description: `${SAETZE_PRO_LISTE} Sätze zum Thema`,
      items: {
        type: 'object',
        properties: {
          satz: {
            type: 'string',
            description:
              'Der spanische Satz. Vollständig, natürlich gesprochen, ' +
              'höchstens zwölf Wörter.',
          },
          uebersetzung: {
            type: 'string',
            description: 'Die deutsche Übersetzung – natürliches Deutsch, keine Wort-für-Wort-Übertragung',
          },
          schluessel: {
            type: 'string',
            description:
              'Das eine Wort oder die eine Wendung aus dem Satz, auf die es ' +
              'ankommt – etwa die konjugierte Verbform bei einer Zeitform.',
          },
        },
        required: ['satz', 'uebersetzung', 'schluessel'],
        additionalProperties: false,
      },
    },
  },
  required: ['thema', 'hinweis', 'saetze'],
  additionalProperties: false,
}

/** Schon gesammelte Sätze als Hinweis – verhindert Dopplungen. */
function bekanntesAlsHinweis(bekannt) {
  const liste = (bekannt ?? []).filter(Boolean).slice(0, 60)
  if (!liste.length) return ''
  return (
    '\n\nDiese Sätze hat die Person schon – nimm sie NICHT noch einmal und ' +
    'auch nichts, was ihnen fast gleicht:\n' +
    liste.map((s) => '- ' + s).join('\n')
  )
}

/** Sicherheitsnetz: Dopplungen rausfiltern, falls das Modell sich nicht hält. */
function ohneBekannte(saetze, bekannt) {
  const schonDa = new Set((bekannt ?? []).map((s) => String(s).toLowerCase().trim()))
  return (saetze ?? []).filter((s) => s?.satz && !schonDa.has(s.satz.toLowerCase().trim()))
}

/**
 * Stellt eine Satzliste zusammen.
 *
 * @param {string}   thema    – z. B. "Reisen"; leer = die KI wählt selbst
 * @param {string}   zeitform – Schlüssel aus ZEITFORMEN, oder '' für gemischt
 * @param {string[]} bekannt  – schon gesammelte Sätze
 */
export async function erzeugeSatzliste(thema, zeitform = '', bekannt = []) {
  const schluessel = process.env.OPENAI_API_KEY
  if (!schluessel) throw new Error('Kein OpenAI-Schlüssel hinterlegt.')

  const zeitformRegel = ZEITFORMEN[zeitform]
  const automatisch = !thema?.trim()

  // Ohne Thema UND ohne Zeitform bräuchte das Modell etwas, woran es
  // sich orientiert – dann schaut es auf die bisherigen Sätze.
  const auftrag =
    (automatisch
      ? 'Wähle selbst ein zusammenhängendes Alltagsthema, das zu den bisherigen ' +
        'Sätzen passt und sie sinnvoll ergänzt.'
      : `Thema: ${thema}`) +
    (zeitformRegel ? '\n' + zeitformRegel : '\nMische die Zeitformen natürlich, wie im Alltag.') +
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
            'Du schreibst Übungssätze für deutschsprachige Spanischlernende auf ' +
            `Alltagsniveau (A2–B1). Genau ${SAETZE_PRO_LISTE} Sätze. Regeln: ` +
            'Jeder Satz muss für sich allein verständlich sein, ohne Zusammenhang ' +
            'davor. Natürliches gesprochenes Spanisch, keine Lehrbuchsätze wie ' +
            '"Der Füller liegt auf dem Tisch". Höchstens zwölf Wörter. Keine ' +
            'Eigennamen erfundener Personen in jedem zweiten Satz. Halte dich ' +
            'strikt an die vorgegebene Zeitform, wenn eine genannt ist – lieber ' +
            'ein einfacherer Satz als eine falsche Form.',
        },
        { role: 'user', content: auftrag },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'satzliste', schema: SATZ_SCHEMA, strict: true },
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
  const ergebnis = JSON.parse(daten.choices[0].message.content)

  return {
    saetze: ohneBekannte(ergebnis.saetze, bekannt),
    hinweis: ergebnis.hinweis ?? '',
    thema: ergebnis.thema ?? thema ?? '',
    zeitform: zeitform || '',
  }
}
