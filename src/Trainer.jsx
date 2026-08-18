import { useState } from 'react'
import {
  vorschau,
  LEVEL_LABELS,
  INTERVALS_DAYS,
  review,
  isDue,
  formatDue,
  withSrsDefaults,
} from './srs.js'
import { XP } from './gamification.js'
import { hakeAb } from './tagesplan.js'
import Games from './Games.jsx'
import ListGenerator from './ListGenerator.jsx'

// Der Vokabeltrainer: Übersicht aller Wörter mit Filter nach Stufen
// und ein Karteikarten-Training für die fälligen Wörter.
export default function Trainer({ vocab, setVocab, addXp }) {
  // Die Wortliste ist Verwaltung, nicht Lernen – sie startet
  // deshalb eingeklappt und laedt nur haeppchenweise nach.
  const [listeOffen, setListeOffen] = useState(false)
  const [suche, setSuche] = useState('')
  const [sichtbar, setSichtbar] = useState(30)
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

  // Suchbegriff zusaetzlich anwenden – ueber Wort und Uebersetzung
  const suchtext = suche.trim().toLowerCase()
  const gefiltert = suchtext
    ? filtered.filter(
        (e) =>
          e.word.toLowerCase().includes(suchtext) ||
          (e.translation || '').toLowerCase().includes(suchtext)
      )
    : filtered

  const trainable = filtered.filter(isDue)

  function startTraining() {
    setQueue(trainable.map((e) => e.word))
    setRevealed(false)
    setResult({ richtig: 0, falsch: 0 })
  }

  // Antwort im Training: die Karte fliegt in die passende Richtung weg,
  // dann wird die Vokabel neu eingestuft und die nächste Karte gezeigt.
  // "nochmal" links, "schwer" schräg links, "gut" rechts, "einfach" weit rechts.
  function answer(bewertung) {
    if (exiting) return // nicht doppelt klicken, während die Karte fliegt
    setExiting(bewertung)

    setTimeout(() => {
      const word = queue[0]
      const gewusst = bewertung !== 'nochmal'

      setVocab((v) => ({ ...v, [word]: review(withSrsDefaults(v[word]), bewertung) }))
      setResult((r) => ({
        richtig: r.richtig + (gewusst ? 1 : 0),
        falsch: r.falsch + (gewusst ? 0 : 1),
      }))
      // Nicht gewusste Wörter kommen ans Ende der Runde und werden gleich nochmal gefragt
      const nextQueue = gewusst ? queue.slice(1) : [...queue.slice(1), word]
      // XP: fürs Antworten – und Bonus, wenn damit die Runde geschafft ist
      let earned = gewusst ? XP.RICHTIG : XP.FALSCH
      if (nextQueue.length === 0) {
        earned += XP.RUNDE
        hakeAb('wiederholen') // Schritt im Tagesplan erledigt
      }
      addXp(earned)
      setXpPopup({ amount: earned, key: Date.now() }) // key sorgt dafür, dass die Animation neu startet
      setQueue(nextQueue)
      setRevealed(false)
      setExiting(null)
    }, 420) // so lange fliegt die Karte
  }

  /**
   * Nach einem gewonnenen Spiel: die gespielten Wörter rücken eine
   * Stufe vor. Wer sie im Spiel wiedererkannt hat, kann sie – deshalb
   * zählt das wie ein "Gut" im Training.
   */
  function nachSpiel(woerter) {
    setVocab((v) => {
      const kopie = { ...v }
      for (const wort of woerter) {
        if (kopie[wort]) kopie[wort] = review(withSrsDefaults(kopie[wort]), 'gut')
      }
      return kopie
    })
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
      <Games
        spiel={spiel}
        vocab={vocab}
        addXp={addXp}
        onClose={() => setSpiel(null)}
        onGespielt={nachSpiel}
      />
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
          className={'flashcard' + (exiting ? ' fliegt-' + exiting : '')}
          key={queue[0] + queue.length}
        >
          <div className="flash-word">{queue[0]}</div>
          {revealed ? (
            <div className="flash-back">
              <div className="flash-translation">{current?.translation || '(keine Übersetzung gespeichert)'}</div>
              {/* Vier Bewertungen wie bei Anki – darunter steht,
                  wann die Vokabel dadurch wieder drankommt */}
              <div className="bewertungen">
                {[
                  { wert: 'nochmal', text: 'Nochmal' },
                  { wert: 'schwer', text: 'Schwer' },
                  { wert: 'gut', text: 'Gut' },
                  { wert: 'einfach', text: 'Einfach' },
                ].map((b) => (
                  <button
                    key={b.wert}
                    className={'bewertung bewertung-' + b.wert}
                    onClick={() => answer(b.wert)}
                  >
                    <span className="bewertung-text">{b.text}</span>
                    <span className="bewertung-zeit">
                      {vorschau(withSrsDefaults(current ?? {}), b.wert)}
                    </span>
                  </button>
                ))}
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
      <h1 className="trainer-titel">
        Dein <span className="accent">Vokabeltrainer</span>
      </h1>

      {/* ============ 1. WIEDERHOLEN ============ */}
      {/* Das Wichtigste zuerst: was heute dran ist */}
      <section className="bereich bereich-wiederholen">
        <div className="wiederholen-zahl">
          <b>{trainable.length}</b>
          <span>{trainable.length === 1 ? 'Wort wartet' : 'Wörter warten'}</span>
        </div>
        <div className="wiederholen-text">
          <h2>Heute wiederholen</h2>
          <p>
            {trainable.length > 0
              ? 'Diese Wörter drohst du gerade zu vergessen – jetzt sitzen sie am besten.'
              : 'Alles erledigt. Neue Wörter sammelst du beim Video-Schauen oder unten mit der KI.'}
          </p>
        </div>
        <button
          className="btn wiederholen-los"
          onClick={startTraining}
          disabled={trainable.length === 0}
        >
          {trainable.length > 0 ? 'Üben' : 'Nichts fällig'}
        </button>
      </section>

      {/* ============ 2. SPIELEN ============ */}
      <section className="bereich">
        <div className="bereich-kopf">
          <h2>Spielerisch üben</h2>
          <p>
            Beide Spiele nehmen die Wörter, die als Nächstes dran sind. Wer sie
            wiedererkennt, schiebt sie eine Stufe weiter.
          </p>
        </div>
        <div className="spiel-paar">
          <button className="spiel-karte" onClick={() => setSpiel('memory')}>
            <span className="spiel-bild" aria-hidden="true">
              <i /><i /><i /><i />
            </span>
            <span className="spiel-name">Memory</span>
            <span className="spiel-hinweis">6 Paare aufdecken</span>
          </button>
          <button className="spiel-karte" onClick={() => setSpiel('paare')}>
            <span className="spiel-bild spiel-bild-linien" aria-hidden="true">
              <i /><i /><i />
            </span>
            <span className="spiel-name">Wortpaare</span>
            <span className="spiel-hinweis">5 Wörter verbinden</span>
          </button>
        </div>
      </section>

      {/* ============ 3. NEUE WÖRTER ============ */}
      <section className="bereich">
        <ListGenerator vocab={vocab} setVocab={setVocab} />
      </section>

      {/* ============ 4. ALLE WÖRTER ============ */}
      <section className="bereich">
        <button
          className="liste-kopf"
          onClick={() => setListeOffen((o) => !o)}
          aria-expanded={listeOffen}
        >
          <span className="liste-kopf-text">
            <span className="liste-titel">Alle deine Wörter</span>
            <span className="liste-sub">
              {entries.length} gesammelt · {knownCount} sitzen schon fest
            </span>
          </span>
          <span className={'liste-pfeil' + (listeOffen ? ' liste-pfeil-auf' : '')}>
            ▾
          </span>
        </button>

        {listeOffen && (
          <>
            <div className="liste-werkzeuge">
              <input
                type="search"
                className="liste-suche"
                value={suche}
                onChange={(e) => {
                  setSuche(e.target.value)
                  setSichtbar(30) // bei neuer Suche wieder oben anfangen
                }}
                placeholder="Wort oder Übersetzung suchen…"
              />
            </div>

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
                <option value="">Nach Stufe filtern …</option>
                {LEVEL_LABELS.map((label, lvl) => (
                  <option key={lvl} value={lvl}>
                    {label} ({levelCounts[lvl]})
                  </option>
                ))}
              </select>
            </div>

            {gefiltert.length === 0 ? (
              <p className="empty-hint">
                {suchtext
                  ? `Nichts gefunden zu „${suche}“.`
                  : 'Keine Wörter in dieser Ansicht. Klicke im Lese-Modus Wörter an, um sie hier zu sammeln.'}
              </p>
            ) : (
              <>
                <table className="vocab-table">
                  <thead>
                    <tr>
                      <th>Wort</th>
                      <th>Übersetzung</th>
                      <th>Stufe</th>
                      <th>Fällig</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {gefiltert.slice(0, sichtbar).map((e) => (
                      <tr key={e.word} title={e.source ? 'Aus: ' + e.source : undefined}>
                        <td className="cell-word">{e.word}</td>
                        <td>{e.translation || '–'}</td>
                        <td>
                          <span className={'level-badge lvl-' + e.level}>
                            {e.status === 'gewusst' ? 'Gewusst ✓' : LEVEL_LABELS[e.level]}
                          </span>
                        </td>
                        <td>{formatDue(e)}</td>
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

                {gefiltert.length > sichtbar && (
                  <button
                    className="btn-outline liste-mehr"
                    onClick={() => setSichtbar((n) => n + 30)}
                  >
                    Weitere 30 anzeigen ({gefiltert.length - sichtbar} übrig)
                  </button>
                )}
              </>
            )}
          </>
        )}
      </section>
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
