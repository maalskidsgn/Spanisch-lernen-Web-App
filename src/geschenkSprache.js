// Das Startgeschenk folgt der App-Sprache.
//
// Bis zum 13.11.2026 kamen Wörter, Sätze und der Text immer mit der
// deutschen Übersetzung in den Trainer – auch bei allen, die die App
// auf Englisch nutzen. Jetzt wird in der laufenden Sprache eingeräumt,
// und was schon eingeräumt ist, wird umgestellt (auch später, wenn
// jemand die Sprache wechselt).
//
// Angefasst wird nur, was noch wörtlich die Übersetzung aus dem
// Geschenk trägt: Wer selbst etwas geändert hat, behält es. Der
// Lernstand (Stufe, Fälligkeit) bleibt, wie er ist.

import { GRUNDPAKET_WOERTER, STARTGESCHENK_WOERTER, GRUNDPAKET_SAETZE, GRUNDPAKET_TEXT } from './grundpaket.js'
import { satzSchluessel } from './saetze.js'

// So hieß die Herkunft früher (Grundpaket, 100 Wörter) und heute.
const QUELLEN = new Set(['Grundpaket', 'Startgeschenk'])
const TEXT_ID = 't-grundpaket'

const fuer = (eintrag, sp) => (sp === 'en' ? eintrag.en : eintrag.uebersetzung)
const andere = (sp) => (sp === 'en' ? 'de' : 'en')

/** Die 50 Wörter des Geschenks, übersetzt in die Sprache der App. */
export function geschenkWoerter(sp) {
  return STARTGESCHENK_WOERTER.map((w) => ({ wort: w.wort, uebersetzung: fuer(w, sp) }))
}

/** Die Sätze des Geschenks, übersetzt in die Sprache der App. */
export function geschenkSaetze(sp) {
  return GRUNDPAKET_SAETZE.map((s) => ({ satz: s.satz, uebersetzung: fuer(s, sp), schluessel: s.schluessel }))
}

/**
 * Der Text des Geschenks. Die Übersetzung steht – wie bei allen
 * Lesetexten – in den Feldern mit „de“, auch wenn sie englisch ist.
 */
export function geschenkText(sp) {
  const en = sp === 'en'
  return {
    ...GRUNDPAKET_TEXT,
    titel_de: en ? GRUNDPAKET_TEXT.titel_en : GRUNDPAKET_TEXT.titel_de,
    absaetze: GRUNDPAKET_TEXT.absaetze.map((a) => ({ es: a.es, de: en ? a.en : a.de })),
    woerter: GRUNDPAKET_TEXT.woerter.map((w) => ({ wort: w.wort, uebersetzung: fuer(w, sp) })),
  }
}

/**
 * Stellt geschenkte Einträge auf die Sprache der App um. Gibt dasselbe
 * Objekt zurück, wenn es nichts zu tun gab – so löst der Aufruf weder
 * ein Neuzeichnen noch einen Abgleich aus.
 */
function umstellen(bestand, liste, sp, schluessel, istGeschenk) {
  let neu = null
  for (const vorlage of liste) {
    const key = schluessel(vorlage)
    const eintrag = bestand[key]
    if (!eintrag || !istGeschenk(eintrag)) continue
    const soll = fuer(vorlage, sp)
    if (eintrag.translation === soll || eintrag.translation !== fuer(vorlage, andere(sp))) continue
    neu ??= { ...bestand }
    neu[key] = { ...eintrag, translation: soll }
  }
  return neu ?? bestand
}

export function woerterInSprache(vokabeln, sp) {
  return umstellen(vokabeln, GRUNDPAKET_WOERTER, sp, (w) => w.wort.toLowerCase(), (e) => QUELLEN.has(e.source))
}

export function saetzeInSprache(saetze, sp) {
  return umstellen(saetze, GRUNDPAKET_SAETZE, sp, (s) => satzSchluessel(s.satz), (e) => QUELLEN.has(e.thema))
}

export function textInSprache(texte, sp) {
  const eintrag = texte[TEXT_ID]
  if (!eintrag) return texte
  const soll = geschenkText(sp)
  if (eintrag.titelDe === soll.titel_de || eintrag.titelDe !== geschenkText(andere(sp)).titel_de) return texte
  return {
    ...texte,
    [TEXT_ID]: { ...eintrag, translation: soll.titel_de, titelDe: soll.titel_de, absaetze: soll.absaetze, woerter: soll.woerter },
  }
}
