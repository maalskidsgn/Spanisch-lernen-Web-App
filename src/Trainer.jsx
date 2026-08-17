import { useState } from 'react'
import {
  LEVEL_LABELS,
  INTERVALS_DAYS,
  review,
  isDue,
  formatDue,
  withSrsDefaults,
} from './srs.js'
import { XP } from './gamification.js'
import Games from './Games.jsx'
import ListGenerator from './ListGenerator.jsx'

// Der Vokabeltrainer: Übersicht aller Wörter mit Filter nach Stufen
// und ein Karteikarten-Training für die fälligen Wörter.
export default function Trainer({ vocab, setVocab, addXp }) {
  const [filter, setFilter] = useState('faellig') // 'alle' | 'faellig' | 'gewusst' | Stufen-Nummer
  const [queue, setQueue] = useState(null) // Wörter der laufenden Übungsrunde (null = keine Runde)
  const [revealed, setRevealed] = useState(false) // Übersetzung schon aufgedeckt?
  const [result, setResult] = useState({ richtig: 0, falsch: 0 })
  const [xpPopup, setXpPopup] = useState(null) // schwebende "+10 XP"-Anzeige
  const [exiting, setExiting] = useState(null) // 'richtig' | 'falsch' – für die Karten-Animation
  const [spiel, setSpiel] = useState(null) // 'memory' | 'paare' | 'kreuz' – laufendes Mini-Spiel

  // Alle Vokabeln als Liste, fehlende Felder ergänzen
  const entries = Object.entries(vocab).map(([word, e]) => ({
    word,
    ...withSrsDefaults(e),
  }))

  const dueEntries = entries.filter(isDue)

  // Wie viele Wörter stecken in jeder Stufe? (für die Filter-Knöpfe)
  const levelCounts = LEVEL_LABELS.map(
    (_, lvl) => entries.filter((e) => e.level === lvl && e.status !== 'gewusst').length
  )
  const knownCount = entries.filter((e) => e.status === 'gewusst').length

  // Die Liste, die gerade angezeigt wird (je nach Filter)
  const filtered = entries
    .filter((e) => {
      if (filter === 'alle') return true
      if (filter === 'faellig') return isDue(e)
      if (filter === 'gewusst') return e.status === 'gewusst'
      return e.level === filter && e.status !== 'gewusst'
    })
    .sort((a, b) => (a.due ?? 0) - (b.due ?? 0))

  const trainable = filtered.filter(isDue)

  function startTraining() {
    setQueue(trainable.map((e) => e.word))
    setRevealed(false)
    setResult({ richtig: 0, falsch: 0 })
  }

  // Antwort im Training: erst die Karten-Animation abspielen (wegfliegen bzw.
  // wackeln), dann Vokabel neu einstufen, XP gutschreiben und zur nächsten Karte
  function answer(known) {
    if (exiting) return // nicht doppelt klicken, während die Karte animiert
    setExiting(known ? 'richtig' : 'falsch')

    setTimeout(() => {
      const word = queue[0]
      setVocab((v) => ({ ...v, [word]: review(withSrsDefaults(v[word]), known) }))
      setResult((r) => ({
        richtig: r.richtig + (known ? 1 : 0),
        falsch: r.falsch + (known ? 0 : 1),
      }))
      // Falsche Wörter kommen ans Ende der Runde und werden gleich nochmal gefragt
      const nextQueue = known ? queue.slice(1) : [...queue.slice(1), word]
      // XP: fürs Antworten – und Bonus, wenn damit die Runde geschafft ist
      let earned = known ? XP.RICHTIG : XP.FALSCH
      if (nextQueue.length === 0) earned += XP.RUNDE
      addXp(earned)
      setXpPopup({ amount: earned, key: Date.now() }) // key sorgt dafür, dass die Animation neu startet
      setQueue(nextQueue)
      setRevealed(false)
      setExiting(null)
    }, 380) // so lange dauert die Karten-Animation
  }

  function removeWord(word) {
    setVocab((v) => {
      const copy = { ...v }
      delete copy[word]
      return copy
    })
  }

  // ---------- Mini-Spiel-Ansicht ----------
  if (spiel !== null) {
    return (
      <Games spiel={spiel} vocab={vocab} addXp={addXp} onClose={() => setSpiel(null)} />
    )
  }

  // ---------- Trainings-Ansicht (Karteikarten) ----------
  if (queue !== null) {
    if (queue.length === 0) {
      return (
        <div className="trainer">
          <div className="flashcard done">
            {/* Konfetti-Regen für die geschaffte Runde */}
            <div className="confetti-burst" aria-hidden="true">
              {Array.from({ length: 14 }, (_, i) => (
                <span key={i} className="confetti" style={{ '--i': i }} />
              ))}
            </div>
            <h2>Runde geschafft! 🎉</h2>
            <p>
              {result.richtig}× gewusst · {result.falsch}× nicht gewusst
            </p>
            <p className="bonus-note">+{XP.RUNDE} Bonus-XP für die volle Runde!</p>
            <button onClick={() => setQueue(null)}>Zurück zur Übersicht</button>
          </div>
        </div>
      )
    }
    const current = vocab[queue[0]]
    return (
      <div className="trainer training-stage">
        {xpPopup && (
          <span key={xpPopup.key} className="xp-popup">
            +{xpPopup.amount} XP
          </span>
        )}
        <p className="training-progress">Noch {queue.length} Karten</p>
        <div
          className={
            'flashcard ' +
            (exiting === 'richtig' ? 'card-richtig' : exiting === 'falsch' ? 'card-falsch' : '')
          }
          key={queue[0] + queue.length}
        >
          <div className="flash-word">{queue[0]}</div>
          {revealed ? (
            <div className="flash-back">
              <div className="flash-translation">{current?.translation || '(keine Übersetzung gespeichert)'}</div>
              <div className="flash-actions">
                <button className="btn-wrong" onClick={() => answer(false)}>
                  Nicht gewusst
                </button>
                <button className="btn-right" onClick={() => answer(true)}>
                  Gewusst ✓
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setRevealed(true)}>Übersetzung zeigen</button>
          )}
        </div>
        <button className="btn-plain" onClick={() => setQueue(null)}>
          Runde abbrechen
        </button>
      </div>
    )
  }

  // ---------- Übersichts-Ansicht ----------
  return (
    <div className="trainer">
      <div className="trainer-head">
        <h1>
          Dein <span className="accent">Vokabeltrainer</span>
        </h1>
        <button onClick={startTraining} disabled={trainable.length === 0}>
          Üben ({trainable.length})
        </button>
      </div>
      <p className="intro">
        {entries.length} Wörter gesamt · {dueEntries.length} jetzt fällig. Richtig
        beantwortete Wörter rücken eine Stufe hoch und kommen seltener dran –
        falsche fallen zurück auf "Neu".
      </p>

      {/* Mini-Spiele mit den eigenen Vokabeln */}
      <h2 className="settings-heading">Spiele mit deinen Vokabeln</h2>
      <div className="game-grid">
        <button className="game-card" onClick={() => setSpiel('memory')}>
          <span className="home-emoji">🧠</span>
          <span className="home-title">Memory</span>
          <span className="home-sub">Paare aufdecken</span>
        </button>
        <button className="game-card" onClick={() => setSpiel('paare')}>
          <span className="home-emoji">🔗</span>
          <span className="home-title">Wortpaare</span>
          <span className="home-sub">Wort & Übersetzung verbinden</span>
        </button>
        <button className="game-card" onClick={() => setSpiel('kreuz')}>
          <span className="home-emoji">✏️</span>
          <span className="home-title">Kreuzworträtsel</span>
          <span className="home-sub">Wörter eintragen</span>
        </button>
      </div>

      {/* Vokabelliste zu einem Wunsch-Thema mit KI erstellen */}
      <ListGenerator vocab={vocab} setVocab={setVocab} />

      {/* Filter: die drei wichtigsten als Knöpfe, die sieben
          Karteikasten-Stufen zusammengefasst in einem Auswahlfeld */}
      <div className="filter-zeile">
        <div className="filter-haupt">
          <Chip active={filter === 'faellig'} onClick={() => setFilter('faellig')}>
            Fällig ({dueEntries.length})
          </Chip>
          <Chip active={filter === 'alle'} onClick={() => setFilter('alle')}>
            Alle ({entries.length})
          </Chip>
          <Chip active={filter === 'gewusst'} onClick={() => setFilter('gewusst')}>
            Gewusst ({knownCount})
          </Chip>
        </div>

        <select
          className={'filter-stufe' + (typeof filter === 'number' ? ' filter-stufe-aktiv' : '')}
          value={typeof filter === 'number' ? filter : ''}
          onChange={(e) =>
            setFilter(e.target.value === '' ? 'alle' : Number(e.target.value))
          }
        >
          <option value="">Stufe wählen …</option>
          {LEVEL_LABELS.map((label, lvl) => (
            <option key={lvl} value={lvl}>
              {label} ({levelCounts[lvl]})
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="empty-hint">
          Keine Wörter in dieser Ansicht. Klicke im Lese-Modus Wörter an, um sie
          hier zu sammeln.
        </p>
      ) : (
        <table className="vocab-table">
          <thead>
            <tr>
              <th>Wort</th>
              <th>Übersetzung</th>
              <th>Stufe</th>
              <th>Fällig</th>
              <th>Aus Video</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.word}>
                <td className="cell-word">{e.word}</td>
                <td>{e.translation || '–'}</td>
                <td>
                  <span className={'level-badge lvl-' + e.level}>
                    {e.status === 'gewusst' ? 'Gewusst ✓' : LEVEL_LABELS[e.level]}
                  </span>
                </td>
                <td>{formatDue(e)}</td>
                <td className="cell-source">{e.source || '–'}</td>
                <td>
                  <button
                    className="btn-delete"
                    title="Wort löschen"
                    onClick={() => removeWord(e.word)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button className={'chip ' + (active ? 'chip-active' : '')} onClick={onClick}>
      {children}
    </button>
  )
}
