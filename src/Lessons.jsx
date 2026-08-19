import { useState, useEffect } from 'react'
import {
  MODULE,
  baueSchritte,
  baueOptionen,
  lektionenVon,
  modulFortschritt,
  modulOffen,
  ALLES_OFFEN,
  LUECKE_MARKE,
} from './lektionen.js'
import { XP } from './gamification.js'
import { hakeAb } from './tagesplan.js'
import { merkeEinheit } from './aktivitaet.js'
import { spiele, dialogAbspielen, stimmeImDialog } from './audio.js'

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
    return (
      schritt.typ === 'quiz' ||
      schritt.typ === 'luecke' ||
      schritt.typ === 'dialogquiz' ||
      schritt.typ === 'hoeren' ||
      schritt.typ === 'rueckblick'
    )
  }

  /**
   * Zaehlt als bewertete Aufgabe – auch der Satzbau, der seine
   * Loesung selbst prueft und keine Auswahl-Optionen braucht.
   * Ohne ihn kaeme am Ende "22 von 20 richtig" heraus.
   */
  function zaehltAlsUebung(schritt) {
    return brauchtOptionen(schritt) || schritt.typ === 'satzbau'
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
      hakeAb('lektion') // Schritt im Tagesplan erledigt
      merkeEinheit() // zaehlt im Wochendiagramm
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
    const uebungen = schritte.filter(zaehltAlsUebung).length
    const quote = uebungen > 0 ? Math.round((richtige / uebungen) * 100) : 100
    // Bewusst WEICH: Unter 80 % empfiehlt die App die Wiederholung
    // deutlich, blockiert aber nicht. Eine harte Sperre wuerde
    // Gelegenheitslerner vertreiben – und widerspraeche dem
    // offenen Aufbau der Sprach-Reise.
    const sitzt = quote >= 80

    return (
      <div className="lessons">
        <div className="flashcard done">
          {sitzt && (
            <div className="confetti-burst" aria-hidden="true">
              {Array.from({ length: 14 }, (_, i) => (
                <span key={i} className="confetti" style={{ '--i': i }} />
              ))}
            </div>
          )}

          {/* Die Quote als Ring – eine Zahl sagt mehr als ein Balken */}
          <div className={'quote-ring' + (sitzt ? ' ring-gut' : ' ring-uebung')}>
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle className="ring-grund" cx="50" cy="50" r="42" />
              <circle
                className="ring-voll"
                cx="50" cy="50" r="42"
                strokeDasharray={`${(quote / 100) * 264} 264`}
              />
            </svg>
            <span className="quote-zahl">{quote}<i>%</i></span>
          </div>

          <h2>{sitzt ? 'Lektion geschafft!' : 'Fast geschafft'}</h2>
          <p>
            {richtige} von {uebungen} Aufgaben richtig · +{XP.LEKTION} Bonus-XP
          </p>
          {lektion.kulturnotiz && (
            <p className="kulturnotiz">
              <b>Gut zu wissen:</b> {lektion.kulturnotiz}
            </p>
          )}
          <p className="bonus-note">
            {sitzt
              ? 'Die neuen Wörter warten jetzt im Vokabeltrainer auf dich.'
              : 'Ab 80 % sitzt eine Lektion erfahrungsgemäß. Eine zweite Runde lohnt sich – die Wörter sind trotzdem schon im Trainer.'}
          </p>

          <div className="abschluss-knoepfe">
            {!sitzt && (
              <button onClick={() => starten(lektion)}>Noch einmal</button>
            )}
            <button
              className={sitzt ? '' : 'btn-outline'}
              onClick={() => setLektion(null)}
            >
              Zurück zur Übersicht
            </button>
          </div>
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
                onClick={() => spiele(schritt.item.es)}
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
                    onClick={() => spiele(schritt.item.beispielEs)}
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
              runde={index}
              optionen={optionen}
              feedback={feedback}
              richtig={schritt.richtung === 'es-de' ? schritt.item.de : schritt.item.es}
              onAntwort={antworten}
            />
          </div>
        )}

        {/* --- Wiederholung aus früheren Lektionen --- */}
        {schritt.typ === 'rueckblick' && (
          <div className="flashcard" key={'s' + index}>
            <p className="lesson-hint rueckblick-hinweis">
              Kurze Wiederholung – kennst du das noch?
            </p>
            <div className="flash-word">{schritt.item.es}</div>
            <QuizOptionen
              runde={index}
              optionen={optionen}
              feedback={feedback}
              richtig={schritt.item.de}
              onAntwort={antworten}
            />
          </div>
        )}

        {/* --- Hörverstehen: erst hören, dann Bedeutung wählen --- */}
        {schritt.typ === 'hoeren' && (
          <div className="flashcard" key={'s' + index}>
            <p className="lesson-hint">Hör zu – was bedeutet der Satz?</p>
            <button
              className="hoeren-knopf"
              onClick={() => spiele(schritt.zeile.es, { stimme: stimmeImDialog(schritt.dialog, schritt.zeile.sprecher) })}
            >
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a9 9 0 0 1 0 12" />
              </svg>
              Anhören
            </button>
            <QuizOptionen
              runde={index}
              optionen={optionen}
              feedback={feedback}
              richtig={schritt.zeile.de}
              onAntwort={antworten}
            />
          </div>
        )}

        {/* --- Satzbau: Wörter in die richtige Reihenfolge --- */}
        {schritt.typ === 'satzbau' && (
          <SatzbauUebung
            key={'s' + index}
            satzbau={schritt.satzbau}
            onErgebnis={(richtig) => antworten(richtig ? schritt.satzbau.loesung : '×', schritt.satzbau.loesung)}
          />
        )}

        {/* --- Übung: Wortpaare der Lektion verbinden --- */}
        {schritt.typ === 'paare' && (
          <LektionsPaare key={'s' + index} paare={schritt.paare} onWeiter={weiter} />
        )}

        {/* --- Abschlussfrage: einen ganzen Satz verstehen --- */}
        {schritt.typ === 'dialogquiz' && (
          <div className="flashcard" key={'s' + index}>
            <p className="lesson-hint">🎓 Vertiefung: Was bedeutet dieser Satz?</p>
            <div className="gap-sentence">{schritt.zeile.es}</div>
            <QuizOptionen
              runde={index}
              optionen={optionen}
              feedback={feedback}
              richtig={schritt.zeile.de}
              onAntwort={antworten}
            />
          </div>
        )}

        {/* --- Übung: Lückentext aus dem Beispielsatz --- */}
        {schritt.typ === 'luecke' && (
          <div className="flashcard" key={'s' + index}>
            <p className="lesson-hint">✏️ Setze das fehlende Wort ein</p>
            <div className="gap-sentence">
              {schritt.luecke.satz.split(LUECKE_MARKE).map((teil, i, alle) => (
                <span key={i}>
                  {teil}
                  {i < alle.length - 1 && <span className="luecke-linie" />}
                </span>
              ))}
            </div>
            <p className="gap-help">{schritt.item.beispielDe}</p>
            <QuizOptionen
              runde={index}
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

        {/* Lernpfad im Duolingo-Stil: die Knoten schlängeln sich nach unten */}
        <div className="lernpfad">
          {liste.map((l, i) => {
            const geschafft = lessonProgress[l.id]?.fertig
            // Die erste Lektion ist offen, danach muss die vorherige geschafft sein
            const offen =
              ALLES_OFFEN || i === 0 || lessonProgress[liste[i - 1].id]?.fertig
            const aktuell = offen && !geschafft // hier geht es weiter
            // Sanfter Zickzack nach links und rechts
            const versatz = Math.round(Math.sin(i * 0.95) * 64)

            return (
              <div
                key={l.id}
                className="pfad-halt"
                style={{ '--versatz': `${versatz}px` }}
              >
                {aktuell && <span className="pfad-hinweis">Los geht's!</span>}

                <button
                  className={
                    'pfad-knoten' +
                    (geschafft ? ' knoten-fertig' : '') +
                    (aktuell ? ' knoten-aktuell' : '') +
                    (!offen ? ' knoten-zu' : '')
                  }
                  disabled={!offen}
                  onClick={() => starten(l)}
                  aria-label={`Lektion ${i + 1}: ${l.titel}`}
                >
                  <span className="knoten-symbol">
                    {geschafft ? '✓' : offen ? l.emoji : '🔒'}
                  </span>
                </button>

                <span className="pfad-name">{l.titel}</span>
              </div>
            )
          })}

          {/* Ziel am Ende des Pfades */}
          <div className="pfad-halt pfad-ziel" style={{ '--versatz': '0px' }}>
            <div className={'pfad-knoten knoten-ziel' + (modulFertig === gesamt ? ' knoten-fertig' : '')}>
              <span className="knoten-symbol">🏆</span>
            </div>
            <span className="pfad-name">
              {modulFertig === gesamt ? 'Modul geschafft!' : 'Modul-Abschluss'}
            </span>
          </div>
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
      {/* Solange ALLES_OFFEN gilt, waere "schalte das naechste frei"
          schlicht falsch – die Module stehen ja alle offen. */}
      <p className="intro">
        {ALLES_OFFEN
          ? 'Modul für Modul zum Spanisch-Können – alle Module stehen dir offen, fang an, wo du magst.'
          : 'Modul für Modul zum Spanisch-Können – schließe ein Modul ab, um das nächste freizuschalten.'}
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
  const [laeuft, setLaeuft] = useState(null) // laufende Gespraechs-Wiedergabe
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

  // Den ganzen Dialog als Gespraech abspielen – jede Rolle mit
  // eigener Stimme, mit Atempausen dazwischen.
  function gespraech() {
    if (laeuft) {
      laeuft.stop()
      setLaeuft(null)
      return
    }
    const steuerung = dialogAbspielen(dialog)
    setLaeuft(steuerung)
    steuerung.fertig.then(() => setLaeuft(null))
  }

  // Beim Verlassen der Lektion nicht weiterreden
  useEffect(() => () => laeuft?.stop(), [laeuft])

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
              <button
                className="chat-ton"
                title="Diese Zeile anhören"
                onClick={() => spiele(zeile.es, { stimme: stimmeImDialog(dialog, zeile.sprecher) })}
              >
                🔊
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
          <button className="btn-plain" onClick={gespraech}>
            {laeuft ? '⏹ Stopp' : '▶ Gespräch anhören'}
          </button>
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
function QuizOptionen({ optionen, feedback, richtig, onAntwort, runde = 0 }) {
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
          // Der Rundenzähler MUSS in den key: Ohne ihn erkennt React
          // zwei Runden mit derselben Antwort als denselben Knopf,
          // behält ihn samt Fokus – und er sieht auf dem Handy aus,
          // als wäre er schon ausgewählt.
          <button
            key={runde + '-' + o}
            className={klasse}
            onClick={(e) => {
              e.currentTarget.blur()
              onAntwort(o, richtig)
            }}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Wortpaare innerhalb einer Lektion: links Spanisch, rechts Deutsch,
 * Paar antippen. Bewusst ohne Strafen – hier wird gefestigt, nicht
 * geprüft.
 */
function LektionsPaare({ paare, onWeiter }) {
  const [links, setLinks] = useState(null)
  const [geloest, setGeloest] = useState([])
  // Rechte Spalte deterministisch sortiert – nicht zufällig, damit
  // beim Neuzeichnen nichts springt
  const rechts = [...paare].sort((a, b) => a.de.localeCompare(b.de, 'de'))
  const fertig = geloest.length === paare.length

  function rechtsTipp(p) {
    if (!links || geloest.includes(p.es)) return
    if (p.es === links.es) setGeloest((g) => [...g, p.es])
    setLinks(null)
  }

  return (
    <div className="flashcard">
      <p className="lesson-hint">🔗 Verbinde die Paare</p>
      <div className="pairs-grid">
        <div className="pairs-col">
          {paare.map((p) => (
            <button
              key={p.es}
              className={
                'quiz-option' +
                (geloest.includes(p.es) ? ' option-richtig' : '') +
                (links?.es === p.es ? ' pair-gewaehlt' : '')
              }
              disabled={geloest.includes(p.es)}
              onClick={() => setLinks(p)}
            >
              {p.es}
            </button>
          ))}
        </div>
        <div className="pairs-col">
          {rechts.map((p) => (
            <button
              key={p.de}
              className={'quiz-option' + (geloest.includes(p.es) ? ' option-richtig' : '')}
              disabled={geloest.includes(p.es)}
              onClick={() => rechtsTipp(p)}
            >
              {p.de}
            </button>
          ))}
        </div>
      </div>
      {fertig && (
        <div className="flash-actions">
          <button onClick={onWeiter}>Weiter</button>
        </div>
      )}
    </div>
  )
}

/**
 * Satzbau: Die Wörter des Satzes liegen gemischt als Bausteine da,
 * Antippen setzt sie zusammen. Ein falscher Baustein lässt sich
 * durch erneutes Antippen wieder zurücklegen.
 */
function SatzbauUebung({ satzbau, onErgebnis }) {
  const [gewaehlt, setGewaehlt] = useState([]) // Indizes in Reihenfolge
  const [geprueft, setGeprueft] = useState(null) // true/false nach Pruefen
  const fertig = gewaehlt.length === satzbau.woerter.length

  function tippe(i) {
    if (geprueft !== null) return
    setGewaehlt((g) => (g.includes(i) ? g.filter((x) => x !== i) : [...g, i]))
  }

  function pruefen() {
    const satz = gewaehlt.map((i) => satzbau.woerter[i]).join(' ')
    const richtig = satz === satzbau.loesung
    setGeprueft(richtig)
    setTimeout(() => onErgebnis(richtig), richtig ? 900 : 1600)
  }

  return (
    <div className="flashcard">
      <p className="lesson-hint">Baue den Satz</p>
      <p className="satzbau-deutsch">{satzbau.uebersetzung}</p>

      {/* Der entstehende Satz */}
      <div className={'satzbau-ablage' + (geprueft === true ? ' ablage-richtig' : geprueft === false ? ' ablage-falsch' : '')}>
        {gewaehlt.length === 0 && <span className="ablage-leer">Tippe die Wörter unten an</span>}
        {gewaehlt.map((i) => (
          <button key={i} className="satz-baustein baustein-gesetzt" onClick={() => tippe(i)}>
            {satzbau.woerter[i]}
          </button>
        ))}
      </div>
      {geprueft === false && (
        <p className="satzbau-loesung">Richtig wäre: <b>{satzbau.loesung}</b></p>
      )}

      {/* Der Vorrat */}
      <div className="satzbau-vorrat">
        {satzbau.woerter.map((w, i) => (
          <button
            key={i}
            className={'satz-baustein' + (gewaehlt.includes(i) ? ' baustein-weg' : '')}
            disabled={gewaehlt.includes(i) || geprueft !== null}
            onClick={() => tippe(i)}
          >
            {w}
          </button>
        ))}
      </div>

      <div className="flash-actions">
        <button onClick={pruefen} disabled={!fertig || geprueft !== null}>
          Prüfen
        </button>
      </div>
    </div>
  )
}
