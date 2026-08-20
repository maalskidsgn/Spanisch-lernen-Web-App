// Zusatzaufgaben für einen Grammatik-Baustein.
//
// Jeder Baustein hat fünf handgeschriebene Aufgaben. Die sind die
// Grundlage: Sie funktionieren ohne Netz, kosten nichts und sind
// geprüft. Was hier entsteht, kommt OBENDRAUF – damit beim vierten
// Wiedersehen nicht dieselben fünf Sätze dastehen.
//
// Das Modell bekommt die handgeschriebenen Aufgaben als Muster mit.
// Nicht, damit es sie abschreibt, sondern damit Format und
// Schwierigkeit stimmen: Ein Beispiel sagt mehr als drei Sätze
// Anweisung.
//
// WICHTIG: Was hier herauskommt, ist NICHT geprüft. Die App siebt es
// vor der Anzeige durch src/aufgabePruefen.js – dieselben Regeln, die
// auch die handgeschriebenen Aufgaben bestehen mussten.

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const MODELL = 'gpt-4o-mini'

/**
 * Das Schema.
 *
 * Alle Felder stehen in "required", weil OpenAI im strict-Modus
 * nichts anderes zulässt. Was ein Aufgabentyp nicht braucht, kommt
 * als null zurück – die App wirft die Nullen weg, bevor sie prüft.
 */
const AUFGABEN_SCHEMA = {
  type: 'object',
  properties: {
    aufgaben: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          typ: { type: 'string', enum: ['luecke', 'wahl', 'fehler', 'bauen'] },
          satz: { type: ['string', 'null'] },
          loesung: { type: ['string', 'null'] },
          optionen: { type: ['array', 'null'], items: { type: 'string' } },
          falsch: { type: ['string', 'null'] },
          richtig: { type: ['string', 'null'] },
          hilfe: { type: ['string', 'null'] },
          de: { type: 'string' },
        },
        required: ['typ', 'satz', 'loesung', 'optionen', 'falsch', 'richtig', 'hilfe', 'de'],
        additionalProperties: false,
      },
    },
  },
  required: ['aufgaben'],
  additionalProperties: false,
}

const ANWEISUNG = `Du schreibst Grammatikaufgaben für deutschsprachige Spanischlernende.

Es gibt vier Typen. Halte dich GENAU an diese Form:

luecke – ein spanischer Satz mit ___ an der Stelle, die eingetippt wird.
  Felder: satz (mit ___), loesung, hilfe (kurzer Hinweis, z.B. der Infinitiv), de.
  Die Lösung darf NICHT sonst im Satz vorkommen.

wahl – ein spanischer Satz mit ___ und zwei bis drei Optionen zum Antippen.
  Felder: satz (mit ___), optionen (Array), loesung (muss in optionen stehen), de.
  Keine Option doppelt.

fehler – ein spanischer Satz mit GENAU EINEM falschen Wort.
  Felder: satz, falsch (das falsche Wort, genau so wie im Satz), richtig
  (das eine richtige Wort), de.
  Das falsche Wort muss GENAU EINMAL im Satz stehen – sonst weiß niemand,
  welches gemeint ist. "richtig" ist ein einzelnes Wort, kein Kommentar.
  WICHTIG: Der Satz darf mit dem "falschen" Wort keine gültige Lesart
  haben. "La puerta es abierta por el viento" wäre KEINE gute Aufgabe,
  weil das ein korrektes Passiv ist. Prüfe jeden Fehlersatz darauf, ob
  er nicht doch irgendwie richtig sein könnte – wenn ja, nimm einen
  anderen.

bauen – nur ein fertiger spanischer Satz, der aus Wortkarten gebaut wird.
  Felder: loesung (der ganze Satz), de.
  Drei bis acht Wörter, KEIN Wort doppelt.

Immer:
- de ist die deutsche Bedeutung des ganzen Satzes.
- Nicht gebrauchte Felder sind null.
- Alltagsspanisch, kurze Sätze, keine seltenen Vokabeln.
- Jede Aufgabe muss die genannte Regel üben – nichts anderes.
- Erfinde NEUE Sätze. Die Muster zeigen nur Form und Schwierigkeit.`

/**
 * Erzeugt zusätzliche Aufgaben zu einem Baustein.
 *
 * @param {object} baustein – { titel, regel, aufgaben }
 * @param {number} anzahl   – wie viele neue Aufgaben
 */
export async function erzeugeBausteinAufgaben(baustein, anzahl = 5) {
  const schluessel = process.env.OPENAI_API_KEY
  if (!schluessel) throw new Error('Kein OpenAI-Schlüssel hinterlegt.')

  const muster = JSON.stringify(baustein.aufgaben ?? [], null, 1)

  const antwort = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${schluessel}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODELL,
      messages: [
        { role: 'system', content: ANWEISUNG },
        {
          role: 'user',
          content:
            `Regel: ${baustein.titel}\n` +
            `Kurzfassung: ${baustein.regel}\n\n` +
            `Muster (nicht wiederverwenden):\n${muster}\n\n` +
            `Schreibe ${anzahl} NEUE Aufgaben zu genau dieser Regel. ` +
            `Mische die Typen, so wie es in den Mustern der Fall ist.`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'bausteinaufgaben', schema: AUFGABEN_SCHEMA, strict: true },
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

  // Die Nullen raus, damit die Prüfung in der App nicht über leere
  // Felder stolpert, die es gar nicht geben sollte.
  return (ergebnis.aufgaben ?? []).map((a) => {
    const sauber = {}
    for (const [feld, wert] of Object.entries(a)) {
      if (wert !== null && wert !== undefined) sauber[feld] = wert
    }
    return sauber
  })
}
