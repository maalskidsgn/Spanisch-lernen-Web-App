// Die KI-Varianten für die Grammatik-Bausteine.
//
// Warum es sie gibt: Jeder Baustein hat fünf handgeschriebene
// Aufgaben. Beim vierten Wiedersehen sind das dieselben fünf Sätze,
// und man erinnert sich an die Antwort statt an die Regel.
//
// Warum die handgeschriebenen trotzdem bleiben: Ein Modell schreibt
// spanische Grammatikaufgaben, die oft FAST richtig sind – eine Form,
// die es gibt, aber im Kontext falsch ist. Bei Vokabeln fällt das
// auf, bei Subjuntivo-Auslösern nicht. Die geprüfte Basis ist das
// Sicherheitsnetz, nicht der Sparmodus.
//
// Ablauf:
//   1. gemerkte Varianten liefern (sofort, ohne Netz)
//   2. im Hintergrund nachfüllen, höchstens einmal am Tag je Baustein
//   3. was durch aufgabePruefen.js fällt, wird still verworfen
//
// Fällt alles aus – kein Netz, kein Schlüssel, Unsinn im Ergebnis –
// bekommt der Nutzer die fünf handgeschriebenen. Er merkt nichts.

import { API_URL } from './api.js'
import { nurGueltige } from './aufgabePruefen.js'
import { heute } from './datum.js'

const SPEICHER = 'bausteinVarianten'

// Höchstens so viele Varianten je Baustein aufheben. Mehr braucht
// niemand: Eine Runde zieht fünf aus Basis UND Varianten zusammen.
const MAX_JE_BAUSTEIN = 10

function laden() {
  try {
    return JSON.parse(localStorage.getItem(SPEICHER)) || {}
  } catch {
    return {}
  }
}

function sichern(alles) {
  try {
    localStorage.setItem(SPEICHER, JSON.stringify(alles))
  } catch {
    // Speicher voll: Dann eben ohne Varianten weiter.
  }
}

/** Die gemerkten Varianten eines Bausteins – sofort, ohne Netz. */
export function gemerkteVarianten(bausteinId) {
  return laden()[bausteinId]?.aufgaben ?? []
}

/**
 * Soll für diesen Baustein nachgeladen werden?
 *
 * Zwei Bedingungen, beide aus Sparsamkeit:
 *
 * Beim ERSTEN Mal nicht. Wer einen Baustein zum ersten Mal übt, sieht
 * ohnehin fünf neue Sätze – da bringen Varianten nichts und kosten
 * nur eine Anfrage.
 *
 * Und höchstens einmal am Tag je Baustein. Sonst liefe bei jeder
 * Runde eine Anfrage los, für einen Nutzen, den man erst nach Wochen
 * bemerkt.
 */
export function brauchtNachschub(bausteinId, schonGeuebt) {
  if (!schonGeuebt) return false
  const eintrag = laden()[bausteinId]
  if (!eintrag) return true
  if (eintrag.aufgaben.length >= MAX_JE_BAUSTEIN) return false
  return eintrag.geholt !== heute()
}

/**
 * Holt Varianten und legt sie zu den vorhandenen.
 *
 * Wirft nie: Ein Fehler bedeutet nur, dass es diesmal keine neuen
 * Aufgaben gibt. Die Runde läuft trotzdem.
 */
export async function holeVarianten(baustein) {
  try {
    const res = await fetch(API_URL + '/api/baustein-uebungen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baustein: {
          titel: baustein.titel,
          regel: baustein.regel,
          aufgaben: baustein.aufgaben,
        },
        anzahl: 5,
      }),
    })
    if (!res.ok) return []

    const daten = await res.json()
    // HIER wird gesiebt – nach denselben Regeln wie beim Build.
    const gute = nurGueltige(daten.aufgaben).map((a) => ({ ...a, ki: true }))

    const alles = laden()
    const vorher = alles[baustein.id]?.aufgaben ?? []
    // Doppelte Sätze raus: Das Modell wiederholt sich gern.
    const gesehen = new Set(vorher.map(kennung))
    const neue = gute.filter((a) => !gesehen.has(kennung(a)))

    alles[baustein.id] = {
      geholt: heute(),
      aufgaben: [...vorher, ...neue].slice(-MAX_JE_BAUSTEIN),
    }
    sichern(alles)
    return neue
  } catch {
    return []
  }
}

/** Woran erkennt man dieselbe Aufgabe wieder? Am Satz. */
function kennung(a) {
  return (a.satz ?? a.loesung ?? '').toLowerCase().trim()
}

/** Alles vergessen – für die Einstellungen und zum Aufräumen. */
export function vergissVarianten() {
  try {
    localStorage.removeItem(SPEICHER)
  } catch {
    // dann bleibt es eben stehen
  }
}
