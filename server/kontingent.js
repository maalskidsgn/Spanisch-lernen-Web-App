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

/**
 * Gratis-Grenzen pro WOCHE (seit 09.11.2026, Manuel):
 *  - 7 KI-Erstellungen (Wortlisten, Wörter aus Video, Sätze,
 *    Lesetexte, E-Books) – ein gemeinsamer Topf
 *  - eigene YouTube-Videos: keine (nur Premium); die Mediathek ist frei
 * Die Woche beginnt montags. Premium hat keine Grenze.
 * Gleiche Werte in src/limits.js (nur Anzeige) und in der anderen App.
 */
export const KI_PRO_WOCHE = 7
// 09.11.2026: eigene Videos nur mit Premium – gratis 0, Mediathek frei
export const VIDEOS_PRO_WOCHE = 0
// Alte Namen, damit bestehender Code weiterläuft
export const VIDEOS_PRO_TAG = VIDEOS_PRO_WOCHE

function supabaseKopf() {
  return {
    apikey: process.env.SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
  }
}

const BASIS = () => `${process.env.SUPABASE_URL}/rest/v1`

/**
 * Der Schlüssel des Zeitraums als YYYY-MM-TT (Server-Ortszeit).
 * Seit 09.11.2026 zählt alles wochenweise: Schlüssel ist der Montag
 * der laufenden Woche. Die Spalte heißt weiter `tag`.
 */
function heuteTag() {
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
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

/** Wann füllt sich das Kontingent wieder auf? Nächster Montag 0 Uhr. */
export function naechsterMontag() {
  const d = new Date()
  d.setDate(d.getDate() + (7 - ((d.getDay() + 6) % 7)))
  d.setHours(0, 0, 0, 0)
  return d
}
export function naechsteAuffuellung(en = false) {
  const tage = Math.ceil((naechsterMontag() - Date.now()) / 86400000)
  if (en) return tage <= 1 ? 'tomorrow (Monday)' : `on Monday (in ${tage} days)`
  return tage <= 1 ? 'morgen (Montag)' : `am Montag (in ${tage} Tagen)`
}

/** Stand für die Anzeige: { ki: {genutzt, gesamt}, video: {…}, auffuellung } */
export async function wochenStand(nutzerId) {
  const [ki, video] = await Promise.all([nutzungHeute(nutzerId, 'ki'), videosDieseWoche(nutzerId)])
  return {
    ki: { genutzt: ki, gesamt: KI_PRO_WOCHE },
    video: { genutzt: video, gesamt: VIDEOS_PRO_WOCHE },
    auffuellung: naechsterMontag().toISOString(),
  }
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

// ---------------------------------------------------------------
//  Videos: 1 neues pro Woche (seit 09.11.2026, Manuel: „nur 1 Video“)
// ---------------------------------------------------------------
//
// Gezählt wird jedes Video, das jemand zum ERSTEN Mal öffnet – auch
// wenn es schon in der Mediathek liegt. Ein Video, das man schon
// einmal geöffnet hat, bleibt für immer frei (Zeile art = "v:<id>").

function wochenMontag() {
  return heuteTag()
}

/** Wie viele verschiedene Videos hat der Nutzer diese Woche neu geöffnet? */
export async function videosDieseWoche(nutzerId) {
  try {
    const r = await fetch(
      `${BASIS()}/nutzung?select=art&nutzer_id=eq.${nutzerId}&tag=eq.${wochenMontag()}&art=like.v:*`,
      { headers: supabaseKopf() }
    )
    if (r.ok) return (await r.json()).length
  } catch { /* unten */ }
  return 0
}

/**
 * Darf dieser Nutzer das Video öffnen? Verbucht es beim ersten Mal.
 * @returns {Promise<{ok: boolean, neu?: boolean}>}
 */
export async function videoFreigabe(nutzerId, videoId) {
  const art = 'v:' + String(videoId).slice(0, 20)
  try {
    const schon = await fetch(
      `${BASIS()}/nutzung?select=tag&nutzer_id=eq.${nutzerId}&art=eq.${encodeURIComponent(art)}&limit=1`,
      { headers: supabaseKopf() }
    )
    if (schon.ok && (await schon.json()).length) return { ok: true }
    if ((await videosDieseWoche(nutzerId)) >= VIDEOS_PRO_WOCHE) return { ok: false }
    await fetch(`${BASIS()}/nutzung`, {
      method: 'POST',
      headers: supabaseKopf(),
      body: JSON.stringify({ nutzer_id: nutzerId, tag: wochenMontag(), art, anzahl: 1 }),
    })
    return { ok: true, neu: true }
  } catch {
    // Datenbank weg: lieber durchlassen als Lernende aussperren
    return { ok: true }
  }
}
