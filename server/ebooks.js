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
    titel_es: { type: 'string', description: 'Spanischer Titel' },
    titel_de: { type: 'string', description: 'Deutscher Titel' },
    autor: { type: 'string', description: 'Name der Autorin oder des Autors' },
    untertitel_es: { type: 'string', description: 'Kurzer spanischer Untertitel, ein Satz' },
    untertitel_de: { type: 'string', description: 'Derselbe Untertitel auf Deutsch' },
    kapitel: {
      type: 'array',
      description: 'Die Kapitel – jedes kurz und in sich abgeschlossen',
      items: {
        type: 'object',
        properties: {
          label_es: {
            type: 'string',
            description: 'Kurze Einordnung, z. B. "Introducción", "Capítulo 1", "Conclusión"',
          },
          label_de: { type: 'string', description: 'Dieselbe Einordnung auf Deutsch' },
          titel_es: {
            type: 'string',
            description:
              'Die Kernaussage des Kapitels als Überschrift auf Spanisch – eine Aussage, kein Etikett',
          },
          titel_de: { type: 'string', description: 'Dieselbe Überschrift auf Deutsch' },
          text_es: {
            type: 'string',
            description: 'Der Kapiteltext auf Spanisch, 100–150 Wörter, 2–3 Absätze mit \\n\\n getrennt',
          },
          text_de: {
            type: 'string',
            description: 'Derselbe Text auf Deutsch, natürlich formuliert, gleiche Absatzaufteilung',
          },
        },
        required: ['label_es', 'label_de', 'titel_es', 'titel_de', 'text_es', 'text_de'],
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
  required: [
    'titel_es', 'titel_de', 'autor', 'untertitel_es', 'untertitel_de', 'kapitel', 'vokabeln',
  ],
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
    A1: 'sehr einfache Sätze, nur Präsens, Grundwortschatz; 4 Kapitel',
    A2: 'einfache Sätze, Präsens und einfache Vergangenheit, Alltagswortschatz; 5 Kapitel',
    B1: 'natürliche Sprache, verschiedene Zeiten; 5 Kapitel',
    B2: 'anspruchsvolle Sprache mit Redewendungen; 6 Kapitel',
  }[niveau] ?? 'einfache Sätze; 5 Kapitel'

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
            'Du schreibst kurze Sachbuch-Zusammenfassungen im Stil von Blinkist für ' +
            'deutschsprachige Spanischlernende – Lesedauer insgesamt etwa 10 Minuten. ' +
            'Aufbau: eine Einführung ("Introducción"), dann Kapitel, zum Schluss eine ' +
            'knappe Schlussfolgerung ("Conclusión"). Jede Kapitelüberschrift ist eine ' +
            'Kernaussage, kein Etikett. Alles liegt vollständig auf Spanisch UND ' +
            'Deutsch vor; die deutsche Fassung ist natürlich formuliert, nicht Wort ' +
            'für Wort übersetzt.',
        },
        {
          role: 'user',
          content:
            `Schreibe eine solche Zusammenfassung zum Thema "${thema}" ` +
            `für Sprachniveau ${niveau}: ${vorgaben}, je Kapitel 100–150 Wörter. ` +
            'Existiert zum Thema ein bekanntes Sachbuch, fasse dessen Kernideen ' +
            'zusammen und nenne den echten Autor. Sonst schreibe einen eigenen ' +
            'Ratgebertext und erfinde einen passenden Autorennamen. ' +
            'Wähle zum Schluss die 10 nützlichsten Vokabeln aus dem Text.',
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
//  Themen-Vokabellisten (für den Trainer)
// ---------------------------------------------------------------

const LISTEN_SCHEMA = {
  type: 'object',
  properties: {
    begruendung: {
      type: 'string',
      description:
        'Ein bis zwei Sätze auf Deutsch: Was fiel am bisherigen Wortschatz auf, ' +
        'und warum passen genau diese Wörter als nächster Schritt? ' +
        'Persönlich formuliert, direkte Anrede.',
    },
    thema: {
      type: 'string',
      description: 'Kurzer Name für diese Liste, z. B. "Im Restaurant bestellen"',
    },
    vokabeln: {
      type: 'array',
      description: '12 nützliche Vokabeln zum Thema',
      items: {
        type: 'object',
        properties: {
          wort: { type: 'string', description: 'Das spanische Wort, bei Nomen mit Artikel' },
          uebersetzung: { type: 'string', description: 'Die deutsche Übersetzung' },
          beispiel: { type: 'string', description: 'Ein kurzer spanischer Beispielsatz' },
        },
        required: ['wort', 'uebersetzung', 'beispiel'],
        additionalProperties: false,
      },
    },
  },
  required: ['begruendung', 'thema', 'vokabeln'],
  additionalProperties: false,
}

/**
 * Vergleichbare Form eines Wortes: klein geschrieben, ohne Artikel
 * und Satzzeichen. So gilt "el menú" als dasselbe Wort wie "Menú".
 */
function wortKern(wort) {
  return String(wort)
    .toLowerCase()
    .replace(/^(el|la|los|las|un|una|unos|unas)\s+/, '')
    .replace(/[¿?¡!.,;:()"]/g, '')
    .trim()
}

/**
 * Beschreibt dem Modell, was die Person schon kann.
 * Die Liste wird gekürzt, damit die Anfrage nicht unnötig groß wird.
 */
function bekanntesAlsHinweis(bekannt) {
  const woerter = [...new Set((bekannt ?? []).map(wortKern).filter(Boolean))]
  if (!woerter.length) return ''

  // Die zuletzt gesammelten Wörter sagen am meisten über den Stand aus
  const auswahl = woerter.slice(-600)
  return (
    `\n\nDiese ${woerter.length} Wörter kennt die Person bereits – nimm KEINES davon ` +
    `noch einmal auf, sondern wähle Wörter, die inhaltlich darauf aufbauen ` +
    `und etwas anspruchsvoller sind:\n${auswahl.join(', ')}`
  )
}

/** Entfernt Vorschläge, die die Person schon kennt oder die doppelt sind. */
function ohneBekannte(vorschlaege, bekannt) {
  const gesperrt = new Set((bekannt ?? []).map(wortKern))
  const gesehen = new Set()

  return (vorschlaege ?? []).filter((v) => {
    const kern = wortKern(v.wort)
    if (!kern || gesperrt.has(kern) || gesehen.has(kern)) return false
    gesehen.add(kern)
    return true
  })
}

/**
 * Lässt OpenAI eine Themen-Vokabelliste zusammenstellen.
 * @param {string}   thema   – z. B. "Restaurant"
 * @param {string[]} bekannt – Wörter, die die Person schon gesammelt hat
 */
// Wortart-Vorgaben für den Generator. 'alle' = gemischt wie bisher.
const WORTART_REGEL = {
  verben:
    'Wähle AUSSCHLIESSLICH Verben, immer im Infinitiv (z. B. "hablar"). ' +
    'Keine Artikel. Nimm die im Alltag nützlichsten.',
  adjektive:
    'Wähle AUSSCHLIESSLICH Adjektive (z. B. "rápido"). Keine Artikel. ' +
    'Nimm häufige, alltagstaugliche.',
  nomen: 'Wähle AUSSCHLIESSLICH Nomen (Substantive), jedes mit seinem Artikel (el/la).',
  alle: 'Mische sinnvoll Nomen (mit Artikel el/la), Verben und Adjektive.',
}

export async function erzeugeVokabelliste(thema, bekannt = [], wortart = 'alle') {
  const schluessel = process.env.OPENAI_API_KEY
  if (!schluessel) throw new Error('Kein OpenAI-Schlüssel hinterlegt.')

  // Ohne Thema übernimmt die KI die Auswahl: sie schaut sich den
  // bisherigen Wortschatz an und schlägt den nächsten sinnvollen
  // Schritt vor – etwa passende Verben zu vorhandenen Nomen.
  const automatisch = !thema?.trim()
  const wortartRegel = WORTART_REGEL[wortart] ?? WORTART_REGEL.alle

  const auftrag =
    (automatisch
      ? 'Schau dir den bisherigen Wortschatz an und wähle selbst aus, was als ' +
        'Nächstes am meisten bringt. Achte darauf: Welche Themen tauchen auf? ' +
        'Fehlen zu vorhandenen Nomen die passenden Verben? Fehlen Wörter, die ' +
        'man im Alltag ständig braucht? Wähle ein zusammenhängendes Thema statt ' +
        'wahlloser Einzelwörter.'
      : `Thema: ${thema}`) +
    '\n' + wortartRegel +
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
            'Du stellst Vokabellisten für deutschsprachige Spanischlernende zusammen: ' +
            'die 12 nützlichsten Wörter auf Alltagsniveau, jedes mit einem einfachen ' +
            'Beispielsatz. Halte dich an die vorgegebene Wortart. Erkläre in der ' +
            'Begründung kurz und persönlich, warum du gerade diese Auswahl getroffen hast.',
        },
        { role: 'user', content: auftrag },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'vokabelliste', schema: LISTEN_SCHEMA, strict: true },
      },
    }),
  })

  if (!antwort.ok) {
    if (antwort.status === 429) throw new Error('OpenAI-Kontingent erschöpft. Bitte später erneut versuchen.')
    throw new Error(`OpenAI antwortet mit ${antwort.status}`)
  }

  const daten = await antwort.json()
  const ergebnis = JSON.parse(daten.choices[0].message.content)
  return {
    // Sicherheitsnetz: das Modell hält sich nicht immer an die Vorgabe
    vokabeln: ohneBekannte(ergebnis.vokabeln, bekannt),
    begruendung: ergebnis.begruendung ?? '',
    thema: ergebnis.thema ?? thema ?? '',
  }
}

/**
 * Wählt aus einem Video-Transkript die lernenswertesten Wörter aus.
 * @param {string}   text    – das Transkript
 * @param {string[]} bekannt – schon gesammelte Wörter
 */
export async function erzeugeVideoVokabeln(text, bekannt = []) {
  const schluessel = process.env.OPENAI_API_KEY
  if (!schluessel) throw new Error('Kein OpenAI-Schlüssel hinterlegt.')

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
            'Du wählst aus einem spanischen Video-Transkript die 12 Wörter aus, ' +
            'die sich für deutschsprachige Lernende am meisten zu lernen lohnen: ' +
            'häufig gebraucht, alltagstauglich, keine Eigennamen und keine ' +
            'Allerweltswörter wie "y", "de" oder "que". Nomen mit Artikel, ' +
            'Verben im Infinitiv. Der Beispielsatz stammt möglichst aus dem Text.',
        },
        {
          role: 'user',
          content: `Transkript:\n${text.slice(0, 8000)}` + bekanntesAlsHinweis(bekannt),
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'vokabelliste', schema: LISTEN_SCHEMA, strict: true },
      },
    }),
  })

  if (!antwort.ok) {
    if (antwort.status === 429) throw new Error('OpenAI-Kontingent erschöpft. Bitte später erneut versuchen.')
    throw new Error(`OpenAI antwortet mit ${antwort.status}`)
  }

  const daten = await antwort.json()
  const vorschlaege = JSON.parse(daten.choices[0].message.content).vokabeln
  return ohneBekannte(vorschlaege, bekannt)
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
      titel: buch.titel_es,
      titel_de: buch.titel_de,
      untertitel_es: buch.untertitel_es,
      untertitel_de: buch.untertitel_de,
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
