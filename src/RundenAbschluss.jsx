// Abschluss-Bildschirm für Übungsrunden (17.11.2026, Manuel: „die
// Vokabel-, Satz- und Wiederholungsrunden auch so“ wie „Lektion geschafft“).
// Oben die farbige Bühne mit Ring (oder Haken), darunter Zahlen-Kacheln,
// ein Satz und die Knöpfe: zuerst „weiter“ (nächste Runde / nächster
// Text), dann zurück dorthin, wo man gestartet ist.

import { useEffect, useState } from 'react'
import { sprache } from './sprache.js'

const TX = {
  de: {
    rundeGeschafft: 'Runde geschafft!',
    vokabeln: 'Vokabeltrainer',
    saetze: 'Satztrainer',
    satzpaare: 'Satzpaare',
    grundlagen: 'Grundlagen',
    gewusst: 'gewusst',
    nichtGewusst: 'nicht gewusst',
    richtig: 'richtig',
    ersterVersuch: 'beim ersten Versuch',
    bonusXp: 'Bonus-XP',
    aufAnhieb: 'auf Anhieb',
    zweiterVersuch: 'mit 2. Versuch',
    naechsteRunde: 'Nächste Runde',
    nochmalUeben: 'Nochmal üben',
    zurueckVokabeln: 'Zurück zur Vokabelübersicht',
    zurueckSaetze: 'Zurück zur Satzübersicht',
    zurueckGrammatik: 'Zurück zur Grammatik',
    zurueckWiederholen: 'Zurück zum Wiederholen',
    alleWiederholt: 'Alles wiederholt – die nächsten Regeln kommen von selbst wieder.',
    nochRegeln: (n) => (n === 1 ? 'Eine Regel wartet noch auf dich.' : `${n} Regeln warten noch auf dich.`),
    textGelesen: 'Text gelesen!',
    naechsterText: 'Nächster Text',
    zurueckTexte: 'Zurück zur Textübersicht',
    deinUrteil: 'dein Urteil',
    urteil_nochmal: 'Kaum',
    urteil_schwer: 'Mit Mühe',
    urteil_gut: 'Gut',
    urteil_einfach: 'Mühelos',
    nochTexte: (n) => (n === 1 ? 'Ein Text wartet noch auf dich.' : `${n} Texte warten noch auf dich.`),
    alleGelesen: 'Alle fälligen Texte gelesen – der nächste kommt von selbst wieder.',
  },
  en: {
    rundeGeschafft: 'Round complete!',
    vokabeln: 'Vocabulary trainer',
    saetze: 'Sentence trainer',
    satzpaare: 'Sentence pairs',
    grundlagen: 'Basics',
    gewusst: 'known',
    nichtGewusst: 'not known',
    richtig: 'correct',
    ersterVersuch: 'on the first try',
    bonusXp: 'bonus XP',
    aufAnhieb: 'first try',
    zweiterVersuch: 'second try',
    naechsteRunde: 'Next round',
    nochmalUeben: 'Practise again',
    zurueckVokabeln: 'Back to vocabulary',
    zurueckSaetze: 'Back to sentences',
    zurueckGrammatik: 'Back to grammar',
    zurueckWiederholen: 'Back to review',
    alleWiederholt: 'All reviewed – the next rules come back on their own.',
    nochRegeln: (n) => (n === 1 ? 'One more rule is waiting for you.' : `${n} more rules are waiting for you.`),
    textGelesen: 'Text read!',
    naechsterText: 'Next text',
    zurueckTexte: 'Back to texts',
    deinUrteil: 'your rating',
    urteil_nochmal: 'Barely',
    urteil_schwer: 'With effort',
    urteil_gut: 'Good',
    urteil_einfach: 'Easily',
    nochTexte: (n) => (n === 1 ? 'One more text is waiting for you.' : `${n} more texts are waiting for you.`),
    alleGelesen: 'All due texts read – the next one comes back on its own.',
  },
}

/** Text für den Abschluss in der Oberflächensprache. */
export function ra(schluessel, ...werte) {
  const t = TX[sprache() === 'en' ? 'en' : 'de'][schluessel] ?? TX.de[schluessel] ?? schluessel
  return typeof t === 'function' ? t(...werte) : t
}

/** Zählt die Quote beim Erscheinen hoch – läuft mit dem Ring zusammen ein. */
function ZaehlZahl({ bis }) {
  const [wert, setWert] = useState(0)
  useEffect(() => {
    if (bis <= 0) return
    const dauer = 900
    const start = performance.now()
    let laeuft = true
    const tick = (t) => {
      if (!laeuft) return
      const anteil = Math.min(1, (t - start) / dauer)
      setWert(Math.round(bis * (1 - Math.pow(1 - anteil, 2))))
      if (anteil < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    return () => { laeuft = false }
  }, [bis])
  return <span className="quote-zahl">{wert}<i>%</i></span>
}

/**
 * quote: 0–100 für den Ring (null = Haken statt Ring)
 * chips: [{ wert, text, xp? }] · knoepfe: [{ text, onClick, zweit? } | false]
 */
export default function RundenAbschluss({ quote = null, titel, unter, chips = [], text, knoepfe = [] }) {
  return (
    <div className="abschluss-seite runden-abschluss">
      <div className="abschluss-held">
        <div className="konfetti-regen" aria-hidden="true">
          {Array.from({ length: 22 }, (_, i) => (
            <span key={i} className="konfetti" style={{ '--i': i }} />
          ))}
        </div>
        {quote === null ? (
          <div className="abschluss-haken" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5 10 17.5 19 7" />
            </svg>
          </div>
        ) : (
          <div className="abschluss-ring" style={{ '--ziel': (quote / 100) * 264 }}>
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle className="ring-grund" cx="50" cy="50" r="42" />
              <circle className="ring-voll" cx="50" cy="50" r="42" />
            </svg>
            <ZaehlZahl bis={quote} />
          </div>
        )}
        <h1 className="abschluss-titel">{titel}</h1>
        {unter && <p className="abschluss-lektion">{unter}</p>}
      </div>

      <div className="abschluss-blatt">
        <div className="abschluss-chips">
          {chips.map((c, i) => (
            <div key={i} className={'abschluss-chip' + (c.xp ? ' chip-xp' : '')}>
              <b>{c.wert}</b>
              <span>{c.text}</span>
            </div>
          ))}
        </div>
        {text && <p className="abschluss-text">{text}</p>}
        <div className="abschluss-knoepfe">
          {knoepfe.filter(Boolean).map((k, i) => (
            <button key={i} type="button" className={k.zweit ? 'abschluss-zweit' : ''} onClick={k.onClick}>
              {k.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
