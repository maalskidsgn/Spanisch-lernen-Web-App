// Prüft die Prüfstationen.
//
// Sie sind fast vollständig aus den Lektionen abgeleitet – und genau
// darum lohnt das Prüfen: Wenn eine Lektion umzieht oder Wörter
// verliert, merkt man es hier, nicht erst beim Nutzer. Geprüft wird
// deshalb nicht nur der geschriebene Teil, sondern das FERTIGE
// Ergebnis: die Schritte, die die App am Ende wirklich zeigt.
//
// WICHTIG: Beim Verketten mit && nicht durch head oder grep leiten –
// head beendet sich mit 0 und verdeckt einen echten Fehlschlag.

import {
  PRUEFSTATIONEN,
  STATION_AUFGABEN,
  baueSchritteStation,
  modulVon,
  stationAlsLektion,
  woerterVon,
  LEKTIONS_IDS,
} from './src/pruefstationen.js'
import { MODULE, baueOptionen, lektionenVon } from './src/lektionen.js'

const fehler = []
const meckern = (s, text) => fehler.push(`[${s?.id ?? '???'}] ${text}`)

// --- Jedes Modul hat genau eine Station -------------------------
for (const modul of MODULE) {
  const treffer = PRUEFSTATIONEN.filter((s) => s.modul === modul.id)
  if (treffer.length === 0) {
    fehler.push(`[${modul.id}] dieses Modul hat keine Prüfstation`)
  } else if (treffer.length > 1) {
    fehler.push(`[${modul.id}] dieses Modul hat ${treffer.length} Prüfstationen`)
  }
}

const gesehen = new Set()
for (const station of PRUEFSTATIONEN) {
  if (gesehen.has(station.id)) meckern(station, 'diese Kennung gibt es doppelt')
  gesehen.add(station.id)

  // Die Kennung darf keiner Lektion gehören: Beide landen im selben
  // Fortschritts-Objekt, eine Kollision würde stillschweigend eine
  // Lektion als erledigt markieren.
  if (LEKTIONS_IDS.has(station.id)) {
    meckern(station, 'diese Kennung gehört schon einer Lektion')
  }

  if (!modulVon(station)) {
    meckern(station, `das Modul "${station.modul}" gibt es nicht`)
    continue
  }

  // --- Der handgeschriebene Teil ---------------------------------
  if (!Array.isArray(station.rueckblick) || station.rueckblick.length !== 3) {
    meckern(station, `braucht genau drei Rückblick-Karten, hat ${station.rueckblick?.length ?? 0}`)
  } else {
    station.rueckblick.forEach((k, i) => {
      if (!k.titel || !k.text || !k.emoji) {
        meckern(station, `Rückblick-Karte ${i + 1}: emoji, titel oder text fehlt`)
      }
      if (k.text && k.text.length < 120) {
        meckern(station, `Rückblick-Karte ${i + 1}: der Text ist zu knapp für einen Rückblick`)
      }
    })
  }

  // --- Kein neuer Wortschatz -------------------------------------
  // Der ganze Sinn der Station. Jedes Wort muss aus dem Modul kommen.
  const ausDemModul = new Set(
    lektionenVon(modulVon(station)).flatMap((l) => l.items.map((i) => i.es))
  )
  const fremd = woerterVon(station).filter((i) => !ausDemModul.has(i.es))
  if (fremd.length > 0) {
    meckern(station, `${fremd.length} Wörter stammen nicht aus dem Modul, z. B. "${fremd[0].es}"`)
  }

  // --- Das fertige Ergebnis --------------------------------------
  // baueSchritteStation() wuerfelt. Ein einziger Durchlauf beweist
  // also nichts: Eine Aufgabe mit doppelten Antworten kaeme nur ab
  // und zu heraus – und genau solche Fehler sind die schlimmsten,
  // weil sie sich beim Nachstellen nicht zeigen. Deshalb 25 Zuege.
  const lektion = stationAlsLektion(station)
  const schritte = baueSchritteStation(station)

  const bewertet = schritte.filter((s) =>
    ['quiz', 'luecke', 'dialogquiz', 'hoeren', 'rueckblick', 'satzbau'].includes(s.typ)
  )
  // Zu wenige Aufgaben waeren keine Pruefung. Etwas Luft nach unten,
  // weil nicht jedes Wort einen brauchbaren Lueckensatz hergibt.
  if (bewertet.length < STATION_AUFGABEN - 8) {
    meckern(station, `nur ${bewertet.length} bewertete Aufgaben, erwartet werden rund ${STATION_AUFGABEN}`)
  }

  // Keine "lernen"-Schritte: hier wird nichts mehr vorgestellt
  if (schritte.some((s) => s.typ === 'lernen')) {
    meckern(station, 'enthält Vorstell-Schritte – eine Station fragt nur ab')
  }

  // --- Jede Aufgabe muss lösbar sein ------------------------------
  const gemeldet = new Set()
  for (let zug = 0; zug < 25; zug++) {
    for (const schritt of zug === 0 ? schritte : baueSchritteStation(station)) {
      if (!['quiz', 'luecke', 'dialogquiz', 'hoeren', 'rueckblick'].includes(schritt.typ)) continue
      // Auch die Optionen werden gewuerfelt – mehrfach ziehen
      for (let versuch = 0; versuch < 3; versuch++) {
        const optionen = baueOptionen(schritt, lektion)
        let klage = null
        if (optionen.length < 2) {
          klage = `eine ${schritt.typ}-Aufgabe hat nur ${optionen.length} Antwortmöglichkeit(en)`
        } else if (new Set(optionen).size !== optionen.length) {
          // Steht dieselbe Antwort zweimal da, ist die Aufgabe nicht
          // eindeutig – das passiert, wenn zwei Lektionen eines
          // Moduls dieselbe Übersetzung benutzen.
          klage = `eine ${schritt.typ}-Aufgabe hat doppelte Antworten: ${optionen.join(' / ')}`
        }
        if (klage && !gemeldet.has(klage)) {
          gemeldet.add(klage)
          meckern(station, klage)
        }
      }
    }
  }
}

if (fehler.length > 0) {
  console.error(`${fehler.length} Problem(e) in den Prüfstationen:`)
  for (const f of fehler) console.error('  ' + f)
  process.exit(1)
}

console.log(
  `Prüfstationen in Ordnung – ${PRUEFSTATIONEN.length} Stationen, ` +
    `${PRUEFSTATIONEN.reduce((s, st) => s + woerterVon(st).length, 0)} Wörter geprüft.`
)
