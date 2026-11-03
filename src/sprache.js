/**
 * Die Sprache der Oberfläche.
 *
 * Habloo bringt Leuten Spanisch bei – aber in welcher Sprache erklärt
 * wird, ist eine andere Frage. Bisher war das immer Deutsch, fest im
 * Code. Das hier zieht die Texte heraus, damit daneben Englisch
 * stehen kann.
 *
 * Das Gesprochene bleibt davon unberührt: Vorgelesen wird immer
 * Spanisch (siehe sprich.js). Nur die Übersetzungen und die
 * Beschriftungen wechseln.
 *
 * Bewusst ohne Bibliothek. Wir brauchen kein Plural-Regelwerk und
 * keine Datumsformate aus 40 Ländern - zwei Sprachen und ein paar
 * Platzhalter. Eine Abhängigkeit, die zehnmal mehr kann als nötig,
 * wäre hier nur Ballast.
 */

import { useEffect, useState } from 'react'
import de from './texte/de.js'
import en from './texte/en.js'
import { VOKABELN, SAETZE, TEXTE } from './texte/inhalte-en.js'

const OBERFLAECHE = { de, en }

/** Welche Sprachen die Oberfläche kann. */
export const SPRACHEN = [
  ['de', 'Deutsch'],
  ['en', 'English'],
]

const SCHLUESSEL = 'oberflaeche-sprache'

/**
 * Welche Sprache soll es sein?
 *
 * Erst die eigene Wahl, sonst die des Geräts, sonst Deutsch. Ein
 * Franzose landet also auf Englisch - das versteht er eher als
 * Deutsch, und eine dritte Sprache haben wir (noch) nicht.
 */
function ermittle() {
  try {
    const gewaehlt = localStorage.getItem(SCHLUESSEL)
    if (gewaehlt && OBERFLAECHE[gewaehlt]) return gewaehlt
  } catch {
    /* privater Modus - dann eben die Gerätesprache */
  }
  const geraet = (navigator.language || 'de').toLowerCase()
  if (geraet.startsWith('de')) return 'de'
  return 'en'
}

let aktuell = ermittle()

/** Das Kürzel der laufenden Sprache: 'de' oder 'en'. */
export function sprache() {
  return aktuell
}

/**
 * Umschalten.
 *
 * Alle angemeldeten Teile der Oberfläche zeichnen sich danach neu -
 * ein Neuladen der Seite wäre unnötig grob, und mitten im Lernen
 * verliert man dabei seinen Platz.
 */
export function setzeSprache(neu) {
  if (!OBERFLAECHE[neu] || neu === aktuell) return
  aktuell = neu
  try {
    localStorage.setItem(SCHLUESSEL, neu)
  } catch {
    /* dann gilt die Wahl eben nur für diese Sitzung */
  }
  setzeLangAttribut(neu)
  window.dispatchEvent(new CustomEvent('sprache'))
}

/**
 * Ein Text zu seinem Schlüssel.
 *
 * Fehlt er auf Englisch, kommt der deutsche - eine halb übersetzte
 * App ist unschön, aber immer noch besser als ein Knopf, auf dem
 * "start.knopf" steht.
 *
 * Platzhalter stehen in geschweiften Klammern:
 *   t('rang.platz', { platz: 3 })  ->  "Platz 3"
 */
export function t(schluessel, werte) {
  const text =
    OBERFLAECHE[aktuell]?.[schluessel] ?? OBERFLAECHE.de[schluessel] ?? schluessel
  if (!werte) return text
  return text.replace(/\{(\w+)\}/g, (ganz, name) =>
    name in werte ? String(werte[name]) : ganz,
  )
}

/**
 * Dasselbe für React: zeichnet die Komponente neu, wenn jemand die
 * Sprache wechselt.
 *
 *   const t = useTexte()
 *   <button>{t('start.knopf')}</button>
 */
export function useTexte() {
  const [, neuZeichnen] = useState(0)
  useEffect(() => {
    const auf = () => neuZeichnen((n) => n + 1)
    window.addEventListener('sprache', auf)
    return () => window.removeEventListener('sprache', auf)
  }, [])
  return t
}

/**
 * Das Gebietsschema für Datums- und Zahlenangaben.
 *
 * Stand überall als 'de-DE' im Code – damit hieße der Wochentag
 * auch in der englischen App "Mo" und der Monat "November" statt
 * "Nov". Ein englischer Nutzer bekommt 'en-GB': Tag vor Monat wie
 * im Deutschen, nur eben auf Englisch. 'en-US' würde die Reihenfolge
 * umdrehen und damit alle Datumszeilen anders umbrechen lassen.
 */
export function gebiet() {
  return aktuell === 'en' ? 'en-GB' : 'de-DE'
}

/**
 * Die Übersetzung eines Lerninhalts.
 *
 * Die 150 Lektionen stehen weiterhin so im Code, wie sie immer
 * standen – auf Deutsch, 9.000 Zeilen. Sie anzufassen wäre riskant
 * gewesen: ein verrutschtes Komma in einer Datei dieser Größe findet
 * man nicht wieder. Stattdessen liegt das Englische daneben, in
 * Nachschlagetabellen.
 *
 * Nachgeschlagen wird über das SPANISCHE, nicht über das Deutsche.
 * "die Bank" und "die Bank" sind auf Deutsch dasselbe Wort, auf
 * Spanisch sind es "el banco" und "el escaño" - über das Spanische
 * ist die Zuordnung eindeutig.
 */
export function vokabel(objekt) {
  if (!objekt) return ''
  if (aktuell === 'de') return objekt.de ?? ''
  return VOKABELN[objekt.es] ?? objekt.de ?? ''
}

/** Dasselbe für Beispielsätze und Dialogzeilen. */
export function satz(objekt, spanischFeld = 'beispielEs', deutschFeld = 'beispielDe') {
  if (!objekt) return ''
  if (aktuell === 'de') return objekt[deutschFeld] ?? ''
  return SAETZE[objekt[spanischFeld]] ?? objekt[deutschFeld] ?? ''
}

/**
 * Ein Text ohne spanisches Gegenstück – Lektionstitel,
 * Erklärkästen, Übungsfragen. Hier ist der deutsche Text selbst
 * der Schlüssel.
 */
export function text(deutsch) {
  if (!deutsch || aktuell === 'de') return deutsch ?? ''
  return TEXTE[deutsch] ?? deutsch
}

/**
 * Das lang-Attribut am <html>, damit Vorleseprogramme und der
 * Browser wissen, woran sie sind.
 *
 * Mit Absicherung: Diese Datei wird auch von den Pruefskripten
 * importiert, und die laufen in Node - dort gibt es kein document.
 * Ohne die Pruefung bricht `npm run build` ab, bevor Vite ueberhaupt
 * anfaengt.
 */
function setzeLangAttribut(wert) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = wert
}

// Beim Laden einmal setzen
setzeLangAttribut(aktuell)
