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
import { merkeEinheit } from './aktivitaet.js'
import Games from './Games.jsx'
import ListGenerator from './ListGenerator.jsx'
import {
  ARTEN,
  LEKTION_GROESSE,
  baueLektion,
  artFuer,
  baueAuswahl,
  buchstabenMischen,
  stimmtUeberein,
} from './uebungen.js'

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
  const [spiel, setSpiel] = useState(null) // laufendes Mini-Spiel
  const [artWahl, setArtWahl] = useState(false) // Auswahl der Uebungsart offen?
  const [art, setArt] = useState('karten')      // gewaehlte Uebungsart
  const [position, setPosition] = useState(0)   // fuer "gemischt": welcher Durchgang
  const [eingabe, setEingabe] = useState('')    // Schreiben: getippter Text
  const [tippStufe, setTippStufe] = useState(0) // 0 = kein Tipp, 1 = gemischt, 2 = Loesung
  const [tippText, setTippText] = useState('')  // die einmal gewuerfelten Buchstaben
  const [gewaehlt, setGewaehlt] = useState(null) // Multiple Choice: angetippte Antwort

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

  function startTraining(gewaehlteArt) {
    setArt(gewaehlteArt)
    // Eine Lektion sind 20 Woerter: erst die faelligen, dann
    // auffuellen – so ist die Runde immer gleich lang und ueberschaubar.
    setQueue(baueLektion(entries, trainable))
    setPosition(0)
    setRevealed(false)
    setEingabe('')
    setTippStufe(0)
    setGewaehlt(null)
    setResult({ richtig: 0, falsch: 0 })
    setArtWahl(false)
  }

  /**
   * Eine Antwort aus Auswahl oder Schreiben verbuchen.
   *
   * WICHTIG: Auch diese Arten laufen ueber dieselbe answer()-Funktion
   * und damit ueber review() – die Wörter wandern also genauso durch
   * den Karteikasten wie bei den Karten. Nur die Bewertung wird
   * automatisch gesetzt, statt dass der Nutzer sie selbst waehlt.
   *
   * Wer einen Tipp gebraucht hat, bekommt hoechstens "schwer" –
   * sonst wuerde ein erratenes Wort zu weit nach hinten rutschen.
   */
  function autoAntwort(richtigGetippt) {
    if (!richtigGetippt) return answer('nochmal')
    return answer(tippStufe > 0 ? 'schwer' : 'gut')
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
        merkeEinheit() // zaehlt im Wochendiagramm
      }
      addXp(earned)
      setXpPopup({ amount: earned, key: Date.now() }) // key sorgt dafür, dass die Animation neu startet
      setQueue(nextQueue)
      setRevealed(false)
      setEingabe('')
      setTippStufe(0)
      setTippText('')
      setGewaehlt(null)
      setPosition((p) => p + 1)
      setExiting(null)
    }, 420) // so lange fliegt die Karte
  }

  /**
   * Nach einem gewonnenen Spiel: die gespielten Wörter rücken eine
   * Stufe vor. Wer sie im Spiel wiedererkannt hat, kann sie – deshalb
   * zählt das wie ein "Gut" im Training.
   */
  function nachSpiel(woerter) {
    merkeEinheit() // ein fertiges Spiel zaehlt im Wochendiagramm
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
    const wort = queue[0]
    const current = withSrsDefaults(vocab[wort] ?? {})
    const loesung = current.translation || '(keine Übersetzung gespeichert)'
    const dieseArt = artFuer(art, position)

    return (
      <div className="trainer training-stage">
        {xpPopup && (
          <span key={xpPopup.key} className="xp-popup">
            +{xpPopup.amount} XP
          </span>
        )}
        <div className="lern-fortschritt">
          <div className="lern-balken">
            <div
              className="lern-balken-voll"
              style={{ width: (result.richtig / LEKTION_GROESSE) * 100 + '%' }}
            />
          </div>
          <p className="training-progress">
            {ARTEN.find((a) => a.id === art)?.emoji} {result.richtig} von {LEKTION_GROESSE} geschafft
          </p>
        </div>

        {/* ---------- Art 1: Karteikarten ---------- */}
        {dieseArt === 'karten' && (
          <div
            className={'flashcard' + (exiting ? ' fliegt-' + exiting : '')}
            key={wort + queue.length}
          >
            <div className="flash-word">{wort}</div>
            {revealed ? (
              <div className="flash-back">
                <div className="flash-translation">{loesung}</div>
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
                      <span className="bewertung-zeit">{vorschau(current, b.wert)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button onClick={() => setRevealed(true)}>Übersetzung zeigen</button>
            )}
          </div>
        )}

        {/* ---------- Art 2: Multiple Choice ---------- */}
        {dieseArt === 'auswahl' && (
          <div
            className={'flashcard' + (exiting ? ' fliegt-' + exiting : '')}
            key={wort + queue.length}
          >
            <p className="lesson-hint">Was heißt …</p>
            <div className="flash-word">{wort}</div>
            <AuswahlKnoepfe
              key={wort}
              loesung={loesung}
              entries={entries}
              gewaehlt={gewaehlt}
              onWahl={(antwort) => {
                if (gewaehlt) return
                setGewaehlt(antwort)
                // Kurz stehen lassen, damit man Grün/Rot sieht
                setTimeout(() => autoAntwort(antwort === loesung), 750)
              }}
            />
          </div>
        )}

        {/* ---------- Art 3: Schreiben ---------- */}
        {dieseArt === 'schreiben' && (
          <div
            className={'flashcard' + (exiting ? ' fliegt-' + exiting : '')}
            key={wort + queue.length}
          >
            <p className="lesson-hint">Wie sagt man …</p>
            <div className="flash-word">{loesung}</div>

            {/* Der Tipp: erst die Buchstaben durcheinander, beim
                zweiten Antippen das ganze Wort. */}
            {tippStufe > 0 && (
              <div className={'tipp-feld' + (tippStufe === 2 ? ' tipp-loesung' : '')}>
                {tippStufe === 1 ? tippText : wort}
              </div>
            )}

            <form
              className="schreib-form"
              onSubmit={(e) => {
                e.preventDefault()
                if (!eingabe.trim() || exiting) return
                autoAntwort(stimmtUeberein(eingabe, wort))
              }}
            >
              <input
                className="schreib-feld"
                value={eingabe}
                onChange={(e) => setEingabe(e.target.value)}
                placeholder="Auf Spanisch tippen …"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
                autoFocus
              />
              <div className="schreib-knoepfe">
                <button
                  type="button"
                  className="btn-plain"
                  onClick={() => {
                    // Beim ersten Tipp die Buchstaben EINMAL wuerfeln und
                    // festhalten - sonst wuerfelt jeder Tastendruck neu
                    if (tippStufe === 0) setTippText(buchstabenMischen(wort))
                    setTippStufe((s) => Math.min(2, s + 1))
                  }}
                  disabled={tippStufe >= 2}
                >
                  {tippStufe === 0 ? '💡 Tipp' : tippStufe === 1 ? '💡 Ganzes Wort' : '💡 Aufgedeckt'}
                </button>
                <button type="submit" disabled={!eingabe.trim()}>
                  Prüfen
                </button>
              </div>
            </form>
          </div>
        )}

        <button className="btn-plain" onClick={() => setQueue(null)}>
          Runde abbrechen
        </button>
      </div>
    )
  }

  // ---------- Auswahl der Übungsart ----------
  if (artWahl) {
    const anzahl = Math.min(LEKTION_GROESSE, entries.length)
    return (
      <div className="trainer">
        <div className="art-kopf">
          <button className="btn-plain" onClick={() => setArtWahl(false)}>
            ← Zurück
          </button>
          <h1 className="trainer-titel">
            Wie willst du <span className="accent">üben?</span>
          </h1>
          <p className="art-unterzeile">
            {anzahl} Wörter · {trainable.length > 0 && `${Math.min(trainable.length, anzahl)} davon fällig`}
          </p>
        </div>

        <div className="art-liste">
          {ARTEN.map((a) => (
            <button key={a.id} className="art-karte" onClick={() => startTraining(a.id)}>
              <span className="art-emoji" aria-hidden="true">{a.emoji}</span>
              <span className="art-text">
                <span className="art-titel">{a.titel}</span>
                <span className="art-beschreibung">{a.text}</span>
                <span className="art-hinweis">{a.hinweis}</span>
              </span>
              <span className="art-pfeil" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
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
          onClick={() => setArtWahl(true)}
          disabled={entries.length === 0}
        >
          {trainable.length > 0 ? 'Üben' : 'Nichts fällig'}
        </button>
      </section>

      {/* ============ 2. SPIELEN ============ */}
      <section className="bereich">
        <div className="bereich-kopf">
          <h2>Spielerisch üben</h2>
          <p>
            Alle vier Spiele nehmen die Wörter, die als Nächstes dran sind. Wer
            sie wiedererkennt, schiebt sie eine Stufe weiter.
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
          <button className="spiel-karte" onClick={() => setSpiel('suche')}>
            <span className="spiel-bild spiel-bild-gitter" aria-hidden="true">
              <i /><i /><i /><i /><i /><i /><i /><i /><i />
            </span>
            <span className="spiel-name">Wortsuche</span>
            <span className="spiel-hinweis">5 Wörter im Gitter</span>
          </button>
          <button className="spiel-karte" onClick={() => setSpiel('fang')}>
            <span className="spiel-bild spiel-bild-fang" aria-hidden="true">
              <i /><i /><i />
            </span>
            <span className="spiel-name">Wortfang</span>
            <span className="spiel-hinweis">Richtige antippen</span>
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

/**
 * Die fünf Antwortmöglichkeiten bei Multiple Choice.
 *
 * Die Auswahl wird EINMAL pro Wort festgelegt (useState mit
 * Startfunktion) – sonst würden die Knöpfe bei jedem Neuzeichnen
 * neu gemischt und man könnte nicht zielen.
 */
function AuswahlKnoepfe({ loesung, entries, gewaehlt, onWahl }) {
  const [optionen] = useState(() => baueAuswahl(loesung, entries))

  return (
    <div className="quiz-options auswahl-fuenf">
      {optionen.map((o) => {
        let klasse = 'quiz-option'
        if (gewaehlt) {
          if (o === loesung) klasse += ' option-richtig'
          else if (o === gewaehlt) klasse += ' option-falsch'
          else klasse += ' option-inaktiv'
        }
        return (
          <button
            key={o}
            className={klasse}
            onClick={(e) => {
              e.currentTarget.blur() // kein Fokus-Rest auf dem Touchscreen
              onWahl(o)
            }}
            disabled={Boolean(gewaehlt)}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}
