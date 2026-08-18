import { useState, useEffect } from 'react'
import { mischen } from './lektionen.js'
import { XP } from './gamification.js'
import { isDue, withSrsDefaults } from './srs.js'

// Mini-Spiele mit den eigenen Vokabeln: Memory und Wortpaare.
//
// Wichtig: Die Spiele sind kein Zeitvertreib neben dem Trainer, sondern
// ein Teil davon. Sie nehmen bevorzugt die Wörter, die als Nächstes
// dran wären, und stufen sie am Ende im Karteikasten hoch.

/**
 * Wählt spielbare Paare – fällige Wörter zuerst.
 * Zu lange Wörter passen nicht auf die Karten und fallen raus.
 */
function spielbareVokabeln(vocab) {
  const passend = Object.entries(vocab)
    .map(([wort, e]) => ({ wort, eintrag: withSrsDefaults(e) }))
    .filter(
      ({ wort, eintrag }) =>
        eintrag.translation && wort.length <= 16 && eintrag.translation.length <= 18
    )

  const faellig = passend.filter(({ eintrag }) => isDue(eintrag))
  const rest = passend.filter(({ eintrag }) => !isDue(eintrag))

  // Erst die fälligen, dann der Rest zum Auffüllen
  return [...mischen(faellig), ...mischen(rest)].map(({ wort, eintrag }) => ({
    es: wort,
    de: eintrag.translation,
    faellig: isDue(eintrag),
  }))
}

export default function Games({ spiel, vocab, addXp, onClose, onGespielt }) {
  // Die Auswahl EINMAL beim Öffnen festlegen. Vorher wurde sie bei
  // jedem Neuzeichnen neu gemischt – dadurch zeigte die linke Spalte
  // plötzlich andere Wörter als die rechte, und kein Paar passte mehr.
  const [paare] = useState(() => spielbareVokabeln(vocab))

  if (paare.length < 4) {
    return (
      <div className="trainer">
        <p className="empty-hint">
          Sammle erst ein paar Vokabeln (mindestens 4), dann kannst du hier spielen!
        </p>
        <button onClick={onClose}>Zurück</button>
      </div>
    )
  }

  return (
    <div className="trainer training-stage">
      <div className="player-top">
        <button className="btn-plain" onClick={onClose}>✕</button>
        <h2 className="game-title">
          {spiel === 'memory' ? 'Memory' : 'Wortpaare'}
        </h2>
      </div>
      {spiel === 'memory' && (
        <Memory paare={paare.slice(0, 6)} addXp={addXp} onClose={onClose} onGespielt={onGespielt} />
      )}
      {spiel === 'paare' && (
        <WortPaare paare={paare.slice(0, 5)} addXp={addXp} onClose={onClose} onGespielt={onGespielt} />
      )}
    </div>
  )
}

// Der gemeinsame "Geschafft!"-Bildschirm beider Spiele.
// Hier rücken die gespielten Wörter im Karteikasten eine Stufe vor –
// wer sie im Spiel wiedererkannt hat, kann sie eben.
function SpielFertig({ text, woerter = [], onGespielt, onClose }) {
  const [gemeldet, setGemeldet] = useState(false)

  useEffect(() => {
    if (gemeldet || !woerter.length) return
    onGespielt?.(woerter)
    setGemeldet(true)
  }, [gemeldet, woerter, onGespielt])

  return (
    <div className="flashcard done">
      <div className="confetti-burst" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="confetti" style={{ '--i': i }} />
        ))}
      </div>
      <h2>Geschafft! 🎉</h2>
      <p>{text}</p>
      <p className="bonus-note">
        +{XP.SPIEL} Bonus-XP
        {woerter.length > 0 && ` · ${woerter.length} Wörter eine Stufe weiter`}
      </p>
      <button onClick={onClose}>Zurück zum Trainer</button>
    </div>
  )
}

/* ---------- Spiel 1: Memory ---------- */
// Karten liegen verdeckt. Decke zwei auf – gehören Wort und
// Übersetzung zusammen, bleiben sie offen liegen.
function Memory({ paare, addXp, onClose, onGespielt }) {
  const [karten] = useState(() =>
    mischen(
      paare.flatMap((p, i) => [
        { id: i + '-es', pairId: i, text: p.es },
        { id: i + '-de', pairId: i, text: p.de },
      ])
    )
  )
  const [offen, setOffen] = useState([]) // ids der gerade aufgedeckten Karten
  const [gefunden, setGefunden] = useState([]) // pairIds der gefundenen Paare
  const [versuche, setVersuche] = useState(0)
  const [sperre, setSperre] = useState(false) // kurz warten, wenn zwei falsche offen sind
  const [fertig, setFertig] = useState(false)

  function klick(karte) {
    if (sperre || offen.includes(karte.id) || gefunden.includes(karte.pairId)) return
    const neu = [...offen, karte.id]
    setOffen(neu)
    if (neu.length < 2) return

    setVersuche((v) => v + 1)
    const [a, b] = neu.map((id) => karten.find((k) => k.id === id))
    if (a.pairId === b.pairId) {
      // Paar gefunden!
      const alle = [...gefunden, a.pairId]
      setGefunden(alle)
      setOffen([])
      addXp(XP.QUIZ_RICHTIG)
      if (alle.length === paare.length) {
        addXp(XP.SPIEL)
        setFertig(true)
      }
    } else {
      // kein Paar: kurz zeigen, dann wieder zudecken
      setSperre(true)
      setTimeout(() => {
        setOffen([])
        setSperre(false)
      }, 900)
    }
  }

  if (fertig) {
    return (
      <SpielFertig
        text={`Alle ${paare.length} Paare in ${versuche} Versuchen gefunden!`}
        woerter={paare.map((p) => p.es)}
        onGespielt={onGespielt}
        onClose={onClose}
      />
    )
  }

  return (
    <>
      <p className="training-progress">
        {gefunden.length}/{paare.length} Paare · {versuche} Versuche
      </p>
      <div className="memory-grid">
        {karten.map((k) => {
          const istOffen = offen.includes(k.id) || gefunden.includes(k.pairId)
          return (
            <button
              key={k.id}
              className={
                'memory-card' +
                (istOffen ? ' memory-offen' : '') +
                (gefunden.includes(k.pairId) ? ' memory-gefunden' : '')
              }
              onClick={() => klick(k)}
            >
              {istOffen ? k.text : '?'}
            </button>
          )
        })}
      </div>
    </>
  )
}

/* ---------- Spiel 2: Wortpaare finden ---------- */
// Links Spanisch, rechts Deutsch (gemischt). Tippe die zusammen-
// gehörenden Wörter an, bis alle Paare verbunden sind.
function WortPaare({ paare, addXp, onClose, onGespielt }) {
  const [rechts] = useState(() => mischen(paare))
  const [wahlLinks, setWahlLinks] = useState(null) // angetipptes spanisches Wort
  const [geloest, setGeloest] = useState([]) // die es-Wörter der gelösten Paare
  const [fehler, setFehler] = useState(null) // kurz rot aufblinken
  const [fertig, setFertig] = useState(false)

  function klickRechts(p) {
    if (!wahlLinks || geloest.includes(p.es)) return
    if (p.es === wahlLinks.es) {
      const alle = [...geloest, p.es]
      setGeloest(alle)
      setWahlLinks(null)
      addXp(XP.QUIZ_RICHTIG)
      if (alle.length === paare.length) {
        addXp(XP.SPIEL)
        setFertig(true)
      }
    } else {
      setFehler(p.es)
      setTimeout(() => {
        setFehler(null)
        setWahlLinks(null)
      }, 600)
    }
  }

  if (fertig) {
    return (
      <SpielFertig
        text={`Alle ${paare.length} Wortpaare verbunden!`}
        woerter={paare.map((p) => p.es)}
        onGespielt={onGespielt}
        onClose={onClose}
      />
    )
  }

  return (
    <>
      <p className="training-progress">
        Tippe links ein Wort an und dann rechts die passende Übersetzung
      </p>
      <div className="pairs-grid">
        <div className="pairs-col">
          {paare.map((p) => (
            <button
              key={p.es}
              className={
                'quiz-option' +
                (geloest.includes(p.es) ? ' option-richtig' : '') +
                (wahlLinks?.es === p.es ? ' pair-gewaehlt' : '')
              }
              disabled={geloest.includes(p.es)}
              onClick={() => setWahlLinks(p)}
            >
              {p.es}
            </button>
          ))}
        </div>
        <div className="pairs-col">
          {rechts.map((p) => (
            <button
              key={p.es}
              className={
                'quiz-option' +
                (geloest.includes(p.es) ? ' option-richtig' : '') +
                (fehler === p.es ? ' option-falsch' : '')
              }
              disabled={geloest.includes(p.es)}
              onClick={() => klickRechts(p)}
            >
              {p.de}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
