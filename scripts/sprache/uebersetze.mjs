/**
 * Übersetzt die Lerninhalte ins Englische.
 *
 * Arbeitet in Blöcken und merkt sich den Stand. Bricht etwas ab -
 * Netz weg, Schlüssel leer, Rechner zu - läuft das Skript beim
 * nächsten Start dort weiter, wo es aufgehört hat. Bei 5.500
 * Einträgen will man nicht von vorne anfangen.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const ORDNER = '/private/tmp/claude-501/-Users-manuelkillert/b4100586-ee84-4775-9f8d-4efb903b3423/scratchpad'
const QUELLE = `${ORDNER}/zu-uebersetzen.json`
const STAND = `${ORDNER}/uebersetzt.json`

const SCHLUESSEL = process.env.OPENAI_API_KEY
if (!SCHLUESSEL) {
  console.error('OPENAI_API_KEY fehlt.')
  process.exit(1)
}

const roh = JSON.parse(readFileSync(QUELLE, 'utf8'))
const fertig = existsSync(STAND)
  ? JSON.parse(readFileSync(STAND, 'utf8'))
  : { vokabeln: {}, saetze: {}, texte: {} }

/* ---------------------------------------------------------------- *
 *  Die Anweisungen je Sorte
 * ---------------------------------------------------------------- */

const ANWEISUNG = {
  vokabeln: `You translate vocabulary for an app that teaches Spanish to ENGLISH speakers.
You get Spanish words with their German translation (the German is only there to disambiguate — e.g. which meaning of a word is meant).
Return the ENGLISH translation of the SPANISH word.
Keep articles natural for English: "la casa" -> "the house", "el hotel" -> "the hotel".
Keep it short — this is a vocabulary card, not a definition.`,

  saetze: `You translate example sentences for an app that teaches Spanish to ENGLISH speakers.
You get a Spanish sentence with its German translation (German only for context).
Return a natural ENGLISH translation of the SPANISH sentence.
Match the register: casual stays casual. Keep punctuation style of English (no inverted ¿¡ in the English).`,

  texte: `You translate UI and explanatory texts for an app that teaches Spanish, now aimed at ENGLISH speakers.
The German originals often compare Spanish TO GERMAN ("im Spanischen steht das Adjektiv anders als im Deutschen").
Those comparisons must be REWRITTEN to compare Spanish to ENGLISH instead, and must be TRUE for English.
If a German-specific comparison makes no sense for English speakers, replace it with the equivalent insight an English speaker needs.
Keep *asterisk emphasis* exactly as in the original. Keep the same tone: warm, direct, informal "you".
Keep it roughly the same length.`,
}

/* ---------------------------------------------------------------- *
 *  Ein Block an die API
 * ---------------------------------------------------------------- */

async function uebersetzeBlock(sorte, eintraege) {
  // Durchnummeriert hin, durchnummeriert zurück - so lässt sich die
  // Antwort sicher wieder zuordnen, auch wenn das Modell die
  // Reihenfolge durcheinanderbrächte.
  const eingabe = eintraege.map(([schluessel, hilfe], i) =>
    sorte === 'texte'
      ? { i, text: schluessel }
      : { i, spanish: schluessel, german: hilfe },
  )

  const antwort = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SCHLUESSEL}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: ANWEISUNG[sorte] },
        {
          role: 'user',
          content:
            `Translate all ${eingabe.length} entries.\n` +
            `Return JSON: {"out":[{"i":0,"en":"..."}, ...]} with one entry per input, same i.\n\n` +
            JSON.stringify(eingabe),
        },
      ],
    }),
  })

  if (!antwort.ok) {
    throw new Error(`HTTP ${antwort.status}: ${(await antwort.text()).slice(0, 300)}`)
  }

  const daten = await antwort.json()
  const geparst = JSON.parse(daten.choices[0].message.content)
  const liste = geparst.out || geparst.entries || geparst.translations || []

  const raus = {}
  for (const e of liste) {
    const quelle = eintraege[e.i]
    if (quelle && e.en) raus[quelle[0]] = e.en
  }
  return raus
}

/* ---------------------------------------------------------------- *
 *  Durchlauf
 * ---------------------------------------------------------------- */

// Kurze Einträge in größeren Blöcken, lange Texte in kleineren -
// sonst läuft die Antwort ins Längenlimit.
const BLOCK = { vokabeln: 60, saetze: 40, texte: 15 }

for (const sorte of ['vokabeln', 'saetze', 'texte']) {
  const alle =
    sorte === 'texte'
      ? roh.texte.map((t) => [t, null])
      : roh[sorte]

  const offen = alle.filter(([k]) => !fertig[sorte][k])
  if (!offen.length) {
    console.log(`${sorte}: schon fertig (${alle.length})`)
    continue
  }
  console.log(`${sorte}: ${offen.length} von ${alle.length} offen`)

  for (let i = 0; i < offen.length; i += BLOCK[sorte]) {
    const block = offen.slice(i, i + BLOCK[sorte])
    try {
      Object.assign(fertig[sorte], await uebersetzeBlock(sorte, block))
      writeFileSync(STAND, JSON.stringify(fertig, null, 1))
      const fertigZahl = Object.keys(fertig[sorte]).length
      console.log(`  ${sorte}: ${fertigZahl}/${alle.length}`)
    } catch (f) {
      console.error(`  Block ab ${i} fehlgeschlagen: ${f.message}`)
      // Weitermachen statt abbrechen: Ein hängengebliebener Block
      // soll nicht die restlichen 5.000 Einträge aufhalten. Beim
      // nächsten Lauf wird er erneut versucht.
      await new Promise((r) => setTimeout(r, 3000))
    }
  }
}

console.log('\nFertig:')
for (const sorte of ['vokabeln', 'saetze', 'texte']) {
  console.log(`  ${sorte}: ${Object.keys(fertig[sorte]).length}`)
}
