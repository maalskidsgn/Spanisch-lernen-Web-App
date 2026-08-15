import { useState, useEffect } from 'react'
import {
  MODULE,
  baueSchritte,
  baueOptionen,
  lektionenVon,
  modulFortschritt,
  modulOffen,
} from './lektionen.js'
import { XP } from './gamification.js'
import { sprich } from './sprich.js'

// Macht aus einem Text mit *Sternchen* hübsche pinke Wort-Chips:
// "Sag *hola* zu Freunden" → Sag [hola] zu Freunden
function mitChips(text) {
  return text.split('*').map((teil, i) =>
    i % 2 === 1 ? (
      <span key={i} className="wort-chip">
        {teil}
      </span>
    ) : (
      teil
    )
  )
}

// Hebt das gelernte Wort im Beispielsatz farblich hervor
function hebeHervor(satz, wort) {
  const kern = wort.replace(/[¿¡?!….]/g, '').trim()
  const idx = satz.toLowerCase().indexOf(kern.toLowerCase())
  if (idx === -1) return satz
  return (
    <>
      {satz.slice(0, idx)}
      <span className="example-hit">{satz.slice(idx, idx + kern.length)}</span>
      {satz.slice(idx + kern.length)}
    </>
  )
}

// Der Lektionen-Bereich (wie bei Babbel):
// Eine Übersicht mit freischaltbaren Lektionen und ein Player, der durch
// Einleitung → Wörter → Wissen → Dialog → Übungen → Abschluss führt.
export default function Lessons({ lessonProgress, addXp, onLessonComplete }) {
  const [modul, setModul] = useState(null) // das gerade geöffnete Modul
  const [lektion, setLektion] = useState(null) // die gerade geöffnete Lektion
  const [schritte, setSchritte] = useState([])
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState(null) // { gewaehlt, richtig } nach einer Antwort
  const [richtige, setRichtige] = useState(0)
  const [optionen, setOptionen] = useState([])
  const [fertig, setFertig] = useState(false)

  function brauchtOptionen(schritt) {
    return schritt.typ === 'quiz' || schritt.typ === 'luecke'
  }

  function starten(l) {
    const s = baueSchritte(l)
    setLektion(l)
    setSchritte(s)
    setIndex(0)
    setRichtige(0)
    setFertig(false)
    setFeedback(null)
    setOptionen(brauchtOptionen(s[0]) ? baueOptionen(s[0], l) : [])
  }

  function weiter() {
    const next = index + 1
    if (next >= schritte.length) {
      // Lektion geschafft! Bonus-XP und Wörter in den Trainer übernehmen
      addXp(XP.LEKTION)
      onLessonComplete(lektion)
      setFertig(true)
      return
    }
    setIndex(next)
    setFeedback(null)
    setOptionen(brauchtOptionen(schritte[next]) ? baueOptionen(schritte[next], lektion) : [])
  }

  // Übungs-Antwort geklickt: Feedback zeigen, XP bei richtiger Antwort,
  // dann automatisch zum nächsten Schritt
  function antworten(option, richtig) {
    if (feedback) return // schon beantwortet
    const korrekt = option === richtig
    setFeedback({ gewaehlt: option, richtig })
    if (korrekt) {
      setRichtige((r) => r + 1)
      addXp(XP.QUIZ_RICHTIG)
    }
    setTimeout(weiter, korrekt ? 700 : 1600) // bei Fehlern etwas länger zum Lesen
  }

  // ---------- Abschluss-Bildschirm ----------
  if (lektion && fertig) {
    const uebungen = schritte.filter(brauchtOptionen).length
    return (
      <div className="lessons">
        <div className="flashcard done">
          <div className="confetti-burst" aria-hidden="true">
            {Array.from({ length: 14 }, (_, i) => (
              <span key={i} className="confetti" style={{ '--i': i }} />
            ))}
          </div>
          <div className="lesson-done-emoji">{lektion.emoji}</div>
          <h2>Lektion geschafft!</h2>
          <p>
            {richtige} von {uebungen} Übungen richtig · +{XP.LEKTION} Bonus-XP
          </p>
          <p className="bonus-note">
            Die Wörter warten jetzt im Vokabeltrainer auf dich!
          </p>
          <button onClick={() => setLektion(null)}>Zurück zur Übersicht</button>
        </div>
      </div>
    )
  }

  // ---------- Lektions-Player ----------
  if (lektion) {
    const schritt = schritte[index]

    return (
      <div className="lessons">
        {/* Fortschritt oben */}
        <div className="player-top">
          <button className="btn-plain" onClick={() => setLektion(null)}>
            ✕
          </button>
          <div className="xp-bar player-bar">
            <div
              className="xp-bar-fill"
              style={{ width: (index / schritte.length) * 100 + '%' }}
            />
          </div>
        </div>

        {/* --- Einleitung: Was lernst du hier? --- */}
        {schritt.typ === 'intro' && (
          <div className="flashcard" key={'s' + index}>
            <div className="lesson-done-emoji">{lektion.emoji}</div>
            <div className="flash-word">{lektion.titel}</div>
            <p className="lesson-hint">Das lernst du in dieser Lektion</p>
            <ul className="intro-goals">
              {lektion.ziele.map((z) => (
                <li key={z}>✓ {z}</li>
              ))}
            </ul>
            <button onClick={weiter}>¡Vamos! Los geht’s</button>
          </div>
        )}

        {/* --- Neues Wort mit Ton und hervorgehobenem Beispielsatz --- */}
        {schritt.typ === 'lernen' && (
          <div className="flashcard word-step" key={'s' + index}>
            <p className="lesson-hint">📖 Neues Wort</p>
            <div className="word-row">
              <div className="flash-word">{schritt.item.es}</div>
              <button
                className="speak-btn"
                onClick={() => sprich(schritt.item.es)}
                title="Anhören"
              >
                🔊
              </button>
            </div>
            <div className="flash-translation">{schritt.item.de}</div>
            {schritt.item.beispielEs && (
              <div className="example-box">
                <div className="example-es">
                  {hebeHervor(schritt.item.beispielEs, schritt.item.es)}
                  <button
                    className="speak-btn speak-btn-mini"
                    onClick={() => sprich(schritt.item.beispielEs)}
                    title="Satz anhören"
                  >
                    🔊
                  </button>
                </div>
                <div className="example-de">{schritt.item.beispielDe}</div>
              </div>
            )}
            <button onClick={weiter}>Weiter</button>
          </div>
        )}

        {/* --- Gut zu wissen: strukturierte Tipps mit Wort-Chips --- */}
        {schritt.typ === 'info' && (
          <div className="flashcard info-card" key={'s' + index}>
            <span className="info-icon">💡</span>
            <p className="lesson-hint">Gut zu wissen</p>
            <div className="info-list">
              {lektion.wissen.map((tipp, i) => (
                <div key={i} className="info-tip" style={{ '--i': i }}>
                  <span className="info-emoji">{tipp.emoji}</span>
                  <div className="info-body">
                    <div className="info-title">{tipp.titel}</div>
                    <p className="info-text">{mitChips(tipp.text)}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={weiter}>Verstanden</button>
          </div>
        )}

        {/* --- Dialog als animierter Chat --- */}
        {schritt.typ === 'dialog' && (
          <DialogChat key={'s' + index} dialog={lektion.dialog} onWeiter={weiter} />
        )}

        {/* --- Übung: richtige Übersetzung auswählen --- */}
        {schritt.typ === 'quiz' && (
          <div className="flashcard" key={'s' + index}>
            <p className="lesson-hint">
              ✏️ {schritt.richtung === 'es-de' ? 'Was heißt…' : 'Wie sagt man…'}
            </p>
            <div className="flash-word">
              {schritt.richtung === 'es-de' ? schritt.item.es : schritt.item.de}
            </div>
            <QuizOptionen
              optionen={optionen}
              feedback={feedback}
              richtig={schritt.richtung === 'es-de' ? schritt.item.de : schritt.item.es}
              onAntwort={antworten}
            />
          </div>
        )}

        {/* --- Übung: Lückentext aus dem Beispielsatz --- */}
        {schritt.typ === 'luecke' && (
          <div className="flashcard" key={'s' + index}>
            <p className="lesson-hint">✏️ Setze das fehlende Wort ein</p>
            <div className="gap-sentence">{schritt.luecke.satz}</div>
            <p className="gap-help">{schritt.item.beispielDe}</p>
            <QuizOptionen
              optionen={optionen}
              feedback={feedback}
              richtig={schritt.luecke.loesung}
              onAntwort={antworten}
            />
          </div>
        )}
      </div>
    )
  }

  // ---------- Lektionen eines Moduls ----------
  if (modul) {
    const liste = lektionenVon(modul)
    const { fertig: modulFertig, gesamt } = modulFortschritt(modul, lessonProgress)
    return (
      <div className="lessons">
        <button className="btn-plain back-link" onClick={() => setModul(null)}>
          ← Alle Module
        </button>
        <h1>
          {modul.emoji} {modul.titel}
        </h1>
        <div className="goal-progress">
          <div className="xp-bar goal-bar">
            <div
              className="xp-bar-fill"
              style={{ width: (modulFertig / gesamt) * 100 + '%' }}
            />
          </div>
          <span className="goal-text">
            {modulFertig}/{gesamt} Lektionen
          </span>
        </div>

        <div className="lesson-list">
          {liste.map((l, i) => {
            const geschafft = lessonProgress[l.id]?.fertig
            // Die erste Lektion ist offen, danach muss die vorherige geschafft sein
            const offen = i === 0 || lessonProgress[liste[i - 1].id]?.fertig
            return (
              <button
                key={l.id}
                className={
                  'lesson-card' +
                  (geschafft ? ' lesson-done' : '') +
                  (!offen ? ' lesson-locked' : '')
                }
                disabled={!offen}
                onClick={() => starten(l)}
              >
                <span className="lesson-emoji">{offen ? l.emoji : '🔒'}</span>
                <span className="lesson-text">
                  <span className="lesson-title">
                    {i + 1}. {l.titel}
                  </span>
                  <span className="lesson-sub">
                    {geschafft ? 'Geschafft ✓ – nochmal üben?' : l.beschreibung}
                  </span>
                </span>
                {geschafft && <span className="lesson-check">✓</span>}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ---------- Modul-Übersicht: die Sprach-Reise ----------
  return (
    <div className="lessons">
      <h1>
        Deine <span className="accent">Sprach-Reise</span>
      </h1>
      <p className="intro">
        Modul für Modul zum Spanisch-Können – schließe ein Modul ab, um das
        nächste freizuschalten.
      </p>

      <div className="lesson-list">
        {MODULE.map((m, i) => {
          const offen = modulOffen(i, lessonProgress)
          const { fertig: f, gesamt } = modulFortschritt(m, lessonProgress)
          const komplett = gesamt > 0 && f === gesamt
          return (
            <button
              key={m.id}
              className={
                'lesson-card modul-card' +
                (komplett ? ' lesson-done' : '') +
                (!offen ? ' lesson-locked' : '')
              }
              disabled={!offen}
              onClick={() => setModul(m)}
            >
              <span className="lesson-emoji">{m.kommtBald ? '🔜' : offen ? m.emoji : '🔒'}</span>
              <span className="lesson-text">
                <span className="lesson-title">
                  Modul {i + 1}: {m.titel}
                </span>
                <span className="lesson-sub">
                  {m.kommtBald ? 'Kommt bald!' : m.beschreibung}
                </span>
                {!m.kommtBald && (
                  <span className="modul-bar">
                    <span className="xp-bar goal-bar">
                      <span
                        className="xp-bar-fill"
                        style={{ width: (f / gesamt) * 100 + '%', display: 'block' }}
                      />
                    </span>
                    <span className="modul-count">
                      {f}/{gesamt}
                    </span>
                  </span>
                )}
              </span>
              {komplett && <span className="lesson-check">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Der Dialog als animierter Chat: Die Sprechblasen erscheinen nacheinander
// wie in einer Messenger-App – mit "tippt gerade…"-Punkten dazwischen.
// Tippe auf eine Blase, um ihre deutsche Übersetzung zu sehen.
function DialogChat({ dialog, onWeiter }) {
  const [anzahl, setAnzahl] = useState(0) // wie viele Blasen schon sichtbar sind
  const [uebersetzt, setUebersetzt] = useState([]) // welche Blasen Deutsch zeigen
  const [alleDe, setAlleDe] = useState(false) // alle Übersetzungen eingeblendet?
  const ersterSprecher = dialog[0].sprecher
  const alleDa = anzahl >= dialog.length

  // Nach jeder neuen Blase kurz "tippen", dann erscheint die nächste
  useEffect(() => {
    if (alleDa) return
    const timer = setTimeout(() => setAnzahl((a) => a + 1), anzahl === 0 ? 700 : 1600)
    return () => clearTimeout(timer)
  }, [anzahl, alleDa])


  function toggle(i) {
    setUebersetzt((u) => (u.includes(i) ? u.filter((x) => x !== i) : [...u, i]))
  }

  // Auf welcher Seite steht der Sprecher, der als Nächstes "tippt"?
  const naechsteRechts = !alleDa && dialog[anzahl].sprecher !== ersterSprecher

  return (
    <div className="flashcard chat-card">
      <p className="lesson-hint">🗣️ Dialog – tippe auf eine Blase für die Übersetzung</p>
      <div className="chat">
        {dialog.slice(0, anzahl).map((zeile, i) => {
          const rechts = zeile.sprecher !== ersterSprecher
          return (
            <div key={i} className={'chat-row' + (rechts ? ' chat-rechts' : '')}>
              {/* Avatar-Kreis mit dem Anfangsbuchstaben des Sprechers */}
              <span className="chat-avatar">{zeile.sprecher[0]}</span>
              <button className="chat-bubble" onClick={() => toggle(i)}>
                <span className="chat-name">{zeile.sprecher}</span>
                {zeile.es}
                {(alleDe || uebersetzt.includes(i)) && (
                  <span className="chat-de">{zeile.de}</span>
                )}
              </button>
            </div>
          )
        })}

        {/* "tippt gerade…"-Anzeige für die nächste Blase */}
        {!alleDa && (
          <div className={'chat-row' + (naechsteRechts ? ' chat-rechts' : '')}>
            <span className="chat-avatar">{dialog[anzahl].sprecher[0]}</span>
            <div className="chat-bubble chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      {alleDa && (
        <div className="flash-actions dialog-actions">
          <button className="btn-plain" onClick={() => setAlleDe(!alleDe)}>
            {alleDe ? 'Übersetzung ausblenden' : 'Übersetzung zeigen'}
          </button>
          <button onClick={onWeiter}>Weiter</button>
        </div>
      )}
    </div>
  )
}

// Die vier Antwort-Knöpfe einer Übung, mit grün/rot-Feedback
function QuizOptionen({ optionen, feedback, richtig, onAntwort }) {
  return (
    <div className="quiz-options">
      {optionen.map((o) => {
        let klasse = 'quiz-option'
        if (feedback) {
          if (o === feedback.richtig) klasse += ' option-richtig'
          else if (o === feedback.gewaehlt) klasse += ' option-falsch'
          else klasse += ' option-inaktiv'
        }
        return (
          <button key={o} className={klasse} onClick={() => onAntwort(o, richtig)}>
            {o}
          </button>
        )
      })}
    </div>
  )
}
