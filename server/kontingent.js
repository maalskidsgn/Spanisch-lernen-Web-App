/**
 * Tageskontingente – serverseitig gezählt.
 *
 * Warum hier und nicht im Browser: Ein Zähler in localStorage ist
 * keine Grenze, sondern eine Bitte. Konsole auf, Eintrag löschen,
 * weiter geht's – und jeder Abruf kostet uns echtes Geld (OpenAI,
 * Transkript-Dienst). Deshalb liegt die Zählung in der Datenbank
 * und wird vom Server geprüft, bevor etwas erzeugt wird.
 *
 * Die Tabelle `nutzung` ist bewusst allgemein gehalten
 * (nutzer_id, tag, art, anzahl): Jede weitere Begrenzung bekommt
 * einfach eine neue `art`, ohne dass eine Tabelle dazukommt.
 */

/** Wie viele Videos darf ein kostenloser Zugang pro Tag erzeugen? */
export const VIDEOS_PRO_TAG = 1

function supabaseKopf() {
  return {
    apikey: process.env.SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
  }
}

const BASIS = () => `${process.env.SUPABASE_URL}/rest/v1`

/** Das heutige Datum als YYYY-MM-TT (Server-Ortszeit). */
function heuteTag() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

// ---------------------------------------------------------------
//  Rückfall, solange die Tabelle `nutzung` fehlt
// ---------------------------------------------------------------
//
// Die Tabelle wird einmalig per SQL angelegt (supabase-nutzung.sql).
// Bis dahin zählt der Server im Arbeitsspeicher weiter. Das ist
// nicht so gut – ein Neustart setzt die Zähler zurück –, aber es
// ist immer noch serverseitig und damit vom Browser aus nicht zu
// umgehen. Sobald die Tabelle da ist, schaltet die Zählung von
// selbst darauf um, ohne Code-Änderung.
let tabelleDa = true
const imSpeicher = new Map() // "nutzerId|tag|art" -> anzahl

function speicherSchluessel(nutzerId, art) {
  return `${nutzerId}|${heuteTag()}|${art}`
}

/**
 * Wie oft hat dieser Nutzer heute schon etwas dieser Art erzeugt?
 */
export async function nutzungHeute(nutzerId, art) {
  if (tabelleDa) {
    try {
      const antwort = await fetch(
        `${BASIS()}/nutzung?select=anzahl&nutzer_id=eq.${nutzerId}` +
          `&tag=eq.${heuteTag()}&art=eq.${art}`,
        { headers: supabaseKopf() }
      )
      if (antwort.ok) return (await antwort.json())[0]?.anzahl ?? 0
      // 404 = Tabelle gibt es nicht. Einmal merken, dann nicht mehr fragen.
      if (antwort.status === 404) tabelleDa = false
    } catch {
      // Netzproblem: unten im Speicher nachsehen
    }
  }
  return imSpeicher.get(speicherSchluessel(nutzerId, art)) ?? 0
}

/**
 * Einen Abruf verbuchen. Erst NACH Erfolg aufrufen – ein
 * Fehlversuch soll nicht aufs Kontingent gehen.
 */
export async function zaehleNutzung(nutzerId, art) {
  const jetzt = await nutzungHeute(nutzerId, art)
  const neu = jetzt + 1

  // Im Speicher immer mitführen – er ist der Rückfall, wenn die
  // Datenbank gerade nicht antwortet.
  imSpeicher.set(speicherSchluessel(nutzerId, art), neu)

  if (tabelleDa) {
    try {
      const antwort = await fetch(`${BASIS()}/nutzung`, {
        method: 'POST',
        headers: { ...supabaseKopf(), Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({
          nutzer_id: nutzerId,
          tag: heuteTag(),
          art,
          anzahl: neu,
        }),
      })
      if (antwort.status === 404) tabelleDa = false
    } catch {
      // Bleibt im Speicher stehen
    }
  }
  return neu
}

/** Wann füllt sich das Kontingent wieder auf? Für die Meldung. */
export function naechsteAuffuellung() {
  const morgen = new Date()
  morgen.setDate(morgen.getDate() + 1)
  morgen.setHours(0, 0, 0, 0)
  const stunden = Math.ceil((morgen - Date.now()) / 3600000)
  return stunden <= 1 ? 'in einer Stunde' : `in ${stunden} Stunden`
}

/**
 * Einen Abruf wieder gutschreiben.
 *
 * Gezählt wird VOR dem Holen – sonst kämen bei zwei offenen
 * Fenstern beide durch, bevor das erste fertig ist. Scheitert der
 * Abruf dann (kein Untertitel, Dienst gestört), wäre das Kontingent
 * für nichts weg. Deshalb hier zurücknehmen.
 */
export async function gibNutzungZurueck(nutzerId, art) {
  const jetzt = await nutzungHeute(nutzerId, art)
  const neu = Math.max(0, jetzt - 1)
  imSpeicher.set(speicherSchluessel(nutzerId, art), neu)

  if (tabelleDa) {
    try {
      await fetch(`${BASIS()}/nutzung`, {
        method: 'POST',
        headers: { ...supabaseKopf(), Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({ nutzer_id: nutzerId, tag: heuteTag(), art, anzahl: neu }),
      })
    } catch {
      // Speicherstand bleibt – besser als gar nichts
    }
  }
  return neu
}
