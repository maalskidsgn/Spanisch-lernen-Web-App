/**
 * Der Sprach-Tutor: ein Gespräch auf Spanisch, mit deutscher Hilfe.
 *
 * Das Herz der Funktion ist NICHT die Technik, sondern die Anweisung
 * an das Modell. Ein Sprachlern-Gespräch geht auf drei Arten schief,
 * und gegen jede steht hier ein Satz:
 *
 *   1. Die KI antwortet zu schwer. Wer bei Lektion 20 steht, versteht
 *      keinen Nebensatz mit Subjuntivo. Deshalb: kurze Sätze,
 *      Grundwortschatz, am Niveau des Nutzers.
 *
 *   2. Die KI redet einen Monolog. Ein Gespräch lebt davon, dass
 *      zurückgefragt wird. Deshalb endet jede Antwort mit einer
 *      Frage, die weitergeht.
 *
 *   3. Die KI korrigiert wie ein Lehrer mit Rotstift – oder gar
 *      nicht. Beides ist falsch. Ein Fehler wird kurz und freundlich
 *      aufgegriffen, aber das Gespräch stockt deswegen nicht.
 *
 * Die deutsche Zeile steht IMMER dabei, als Sicherheitsnetz. Wer die
 * spanische Antwort versteht, überliest sie; wer nicht, ist nicht
 * verloren und bricht nicht ab.
 *
 * Bewusst gpt-4o-mini und nicht das große Modell: Ein Gespräch sind
 * viele kurze Antworten hintereinander. Das summiert sich, und ein
 * Tutor, der pro Satz Geld kostet, wird nie freigeschaltet.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const MODELL = 'gpt-4o-mini'

// Gratis pro Tag. Bewusst nicht zu knapp: Ein echtes Gespräch braucht
// mehrere Züge, sonst spürt niemand den Wert. gpt-4o-mini ist billig
// genug, dass das kein Kostenproblem ist – der serverseitige Zähler
// verhindert nur den Missbrauch. Premium hat kein Limit.
export const GESPRAECHE_PRO_TAG = 15

function supabaseKopf() {
  return {
    apikey: process.env.SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
  }
}

const BASIS = () => `${process.env.SUPABASE_URL}/rest/v1`

/**
 * Hat der Nutzer ein gültiges Premium-Abo?
 *
 * Dieselbe Regel wie im Frontend (premium.js): nicht abgelaufen und
 * entweder unbegrenzt (laeuft_ab leer) oder das Datum liegt in der
 * Zukunft. Serverseitig geprüft, damit das Limit nicht über den
 * Client umgangen werden kann.
 */
export async function istPremium(nutzerId) {
  const antwort = await fetch(
    `${BASIS()}/abos?select=status,laeuft_ab&nutzer_id=eq.${nutzerId}`,
    { headers: supabaseKopf() }
  )
  if (!antwort.ok) return false
  const abo = (await antwort.json())[0]
  if (!abo || abo.status === 'abgelaufen') return false
  return abo.laeuft_ab === null || new Date(abo.laeuft_ab) > new Date()
}

/** Das heutige Datum als YYYY-MM-TT (Server-Ortszeit). */
function heuteTag() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Wie viele Nachrichten hat dieser Nutzer heute schon geschickt? */
export async function tutorNutzungHeute(nutzerId) {
  const antwort = await fetch(
    `${BASIS()}/tutor_nutzung?select=anzahl&nutzer_id=eq.${nutzerId}&tag=eq.${heuteTag()}`,
    { headers: supabaseKopf() }
  )
  if (!antwort.ok) return 0
  return (await antwort.json())[0]?.anzahl ?? 0
}

/**
 * Eine Nachricht verbuchen. Erst nach erfolgreicher Antwort aufrufen –
 * ein Fehlversuch soll nicht aufs Kontingent gehen.
 *
 * Upsert mit merge-duplicates: Gibt es die Zeile (Nutzer+Tag) noch
 * nicht, wird sie mit anzahl=1 angelegt; sonst um eins erhöht. Der
 * neue Wert wird aus dem alten gelesen und +1 geschrieben – bei einem
 * einzelnen Server ohne parallele Anfragen desselben Nutzers reicht
 * das.
 */
export async function zaehleTutorNutzung(nutzerId) {
  const jetzt = await tutorNutzungHeute(nutzerId)
  await fetch(`${BASIS()}/tutor_nutzung`, {
    method: 'POST',
    headers: { ...supabaseKopf(), Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ nutzer_id: nutzerId, tag: heuteTag(), anzahl: jetzt + 1 }),
  })
  return jetzt + 1
}

// Die Antwort MUSS diese Form haben – sonst kann die Oberfläche die
// spanische von der deutschen Zeile nicht trennen.
const SCHEMA = {
  type: 'object',
  properties: {
    es: { type: 'string', description: 'Die Antwort auf Spanisch, 1–3 kurze Sätze.' },
    de: { type: 'string', description: 'Dieselbe Antwort auf Deutsch.' },
    korrektur: {
      type: 'string',
      description:
        'Wenn der Nutzer auf Spanisch schrieb und einen Fehler machte: ' +
        'eine kurze, freundliche Korrektur auf Deutsch. Sonst leerer String.',
    },
  },
  required: ['es', 'de', 'korrektur'],
  additionalProperties: false,
}

function anweisung(niveau) {
  return (
    'Du bist Habla, eine geduldige, herzliche Spanisch-Tutorin für ' +
    'deutschsprachige Lernende. Ihr führt ein echtes Gespräch – kein ' +
    'Unterricht, kein Vortrag.\n\n' +
    'Regeln, die du IMMER einhältst:\n' +
    `- Sprich EINFACHES Spanisch, passend zum Niveau des Lernenden (${niveau}). ` +
    'Kurze Sätze, Grundwortschatz. Lieber zu leicht als zu schwer.\n' +
    '- Antworte mit höchstens drei Sätzen. Ein Gespräch besteht aus ' +
    'kurzen Zügen, nicht aus Absätzen.\n' +
    '- Beende deine Antwort fast immer mit einer Frage, damit das ' +
    'Gespräch weitergeht.\n' +
    '- Wenn der Lernende auf Spanisch schreibt und einen Fehler macht, ' +
    'greif ihn kurz und freundlich in der "korrektur" auf – aber mach ' +
    'im Gespräch normal weiter, als wäre nichts. Kein Rotstift.\n' +
    '- Wenn er auf Deutsch schreibt oder eine Frage zur Sprache stellt ' +
    '("wie sagt man …?"), antworte hilfreich und leite sanft zurück ins ' +
    'Spanische.\n' +
    '- Bleib beim Thema, das der Lernende vorgibt. Spielt er eine ' +
    'Situation (Café, Flughafen, Arzt), bleib in der Rolle.\n' +
    '- Du bist auch Tutorin, nicht nur Gesprächspartnerin: Fragt der ' +
    'Lernende nach Wissen, Kultur oder der Bedeutung eines Wortes oder ' +
    'Satzes, erklär es geduldig – trotzdem kurz und in einfachem ' +
    'Spanisch, mit deutscher Übersetzung. Hilf beim Verstehen von ' +
    'Texten, wenn er darum bittet.\n' +
    '- Bei Wissensfragen: erfinde NIEMALS genaue Zahlen, Daten oder ' +
    'Namen, bei denen du unsicher bist. Sag lieber einfach, dass du es ' +
    'nicht genau weißt. Ein falscher Fakt ist schlimmer als eine ' +
    'ehrliche Lücke.\n' +
    '- Gib in "de" immer die getreue deutsche Übersetzung deiner ' +
    'spanischen Antwort. Halte jede Antwort kurz – nie mehr als drei ' +
    'kurze Sätze, egal wie groß die Frage ist.'
  )
}

/**
 * Eine Antwort im Gespräch erzeugen.
 * @param {Array<{rolle:'ich'|'tutor', text:string}>} verlauf
 * @param {string} niveau – grobe Selbsteinschätzung, z. B. "Anfänger"
 */
export async function antworte(verlauf, niveau = 'Anfänger') {
  const schluessel = process.env.OPENAI_API_KEY
  if (!schluessel) throw new Error('Kein OpenAI-Schlüssel hinterlegt.')

  // Nur die letzten 20 Züge mitschicken. Ein Gespräch kann lang
  // werden; die ganze Geschichte jedes Mal zu senden, kostet unnötig
  // und bringt für den nächsten Satz nichts.
  const nachrichten = [
    { role: 'system', content: anweisung(niveau) },
    ...verlauf.slice(-20).map((z) => ({
      role: z.rolle === 'ich' ? 'user' : 'assistant',
      content: z.text,
    })),
  ]

  const antwort = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${schluessel}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODELL,
      temperature: 0.7, // ein Gespräch darf lebendig sein, nicht schematisch
      messages: nachrichten,
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'tutorantwort', schema: SCHEMA, strict: true },
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
  return JSON.parse(daten.choices[0].message.content)
}
