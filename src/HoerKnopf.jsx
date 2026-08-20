// Der Lautsprecher – und das Abspielen von selbst.
//
// Steht hier und nicht in Lessons.jsx, weil der Trainer dieselben
// Aufnahmen braucht. Zwei Kopien waeren zwei Wahrheiten darueber,
// wann ein Lautsprecher erscheint und wann er schweigt.

import { useState, useEffect } from 'react'
import { spiele, spieleVonSelbst, gibtEsAufnahme } from './audio.js'

/**
 * Ein Lautsprecher – aber nur, wenn es wirklich etwas zu hoeren gibt.
 *
 * Frueher stand der Knopf immer da und fiel auf die Browser-Stimme
 * zurueck, wenn keine Aufnahme existierte. In einem Aussprachekurs
 * ist das schlimmer als kein Knopf: Wer "La eñe es una letra
 * española" von der Blechstimme hoert, lernt eine Aussprache, die es
 * so nicht gibt.
 *
 * Der Platz bleibt NICHT reserviert – der Knopf verschwindet ganz.
 * Sobald das Vertonungsskript den Satz nachliefert, ist er wieder da,
 * ohne dass hier etwas geaendert werden muesste.
 *
 * vonSelbst: Die Aufnahme startet, sobald der Knopf erscheint. Wer
 * das Wort erst liest und dann hoert, hat sich in der Zwischenzeit
 * schon eine Aussprache zurechtgelegt – und die haelt sich.
 */
export default function HoerKnopf({
  text,
  titel = 'Anhören',
  klein = false,
  stimme,
  vonSelbst = false,
}) {
  const [gibtEs, setGibtEs] = useState(null) // null = wird noch geprueft

  useEffect(() => {
    if (!text) return
    let abgebrochen = false
    gibtEsAufnahme(text, stimme).then((da) => {
      if (abgebrochen) return
      setGibtEs(da)
      // Von selbst nur, wenn es auch eine echte Aufnahme gibt. Die
      // Browser-Stimme ungefragt loszuschicken waere das Gegenteil
      // von dem, wofuer der Knopf ueberhaupt verschwindet.
      if (da && vonSelbst) spieleVonSelbst(text, stimme ? { stimme } : undefined)
    })
    return () => {
      abgebrochen = true
    }
  }, [text, stimme, vonSelbst])

  if (!gibtEs) return null

  return (
    <button
      className={'speak-btn' + (klein ? ' speak-btn-mini' : '')}
      onClick={() => spiele(text, stimme ? { stimme } : undefined)}
      title={titel}
    >
      🔊
    </button>
  )
}

/**
 * Spielt eine Aufnahme, sobald sie auf dem Bildschirm erscheint –
 * und zeigt selbst nichts an.
 *
 * Fuer die Hoerverstehen-Aufgabe: Dort IST das Zuhoeren die Aufgabe.
 * Erst auf einen Knopf warten zu muessen, ist ein Umweg ohne Zweck.
 * Der "Anhören"-Knopf bleibt daneben stehen – zum Nochmalhoeren.
 */
export function VonSelbst({ text, stimme }) {
  useEffect(() => {
    if (!text) return
    let abgebrochen = false
    gibtEsAufnahme(text, stimme).then((da) => {
      if (da && !abgebrochen) spieleVonSelbst(text, stimme ? { stimme } : undefined)
    })
    return () => {
      abgebrochen = true
    }
  }, [text, stimme])
  return null
}
