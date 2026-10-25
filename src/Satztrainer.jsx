import { useMemo, useState } from 'react'
import { review, isDue, formatDue, withSrsDefaults, vorschau, LEVEL_LABELS } from './srs.js'
import { XP } from './gamification.js'
import { merkeEinheit } from './aktivitaet.js'
import { merkeGelernt } from './lernkurve.js'
import SatzGenerator from './SatzGenerator.jsx'
import { IconKarten, IconAuswahl, IconListe } from './icons.jsx'

/** Wie viele Sätze stecken in einer Runde? */
const RUNDE = 10

// Nur zwei Übungsarten – Schreiben und Gemischt gibt es hier
// bewusst nicht: Einen ganzen Satz fehlerfrei abzutippen ist
// Fleißarbeit, kein Lernfortschritt.
const ARTEN = [
  {
    id: 'karten',
    titel: 'Karten',
    icon: IconKarten,
    text: 'Satz lesen, Übersetzung aufdecken, selbst einschätzen',
  },
  {
    id: 'auswahl',
    titel: 'Auswahl',
    icon: IconAuswahl,
    text: 'Vier Übersetzungen – welche passt?',
  },
]

/** Vier falsche Übersetzungen dazumischen. */
function baueAuswahl(richtig, alle, anzahl = 4) {
  const andere = [...new Set(alle.map((e) => e.translation).filter((t) => t && t !== richtig))]
  const gemischt = andere.sort(() => Math.random() - 0.5).slice(0, anzahl - 1)
  return [richtig, ...gemischt].sort(() => Math.random() - 0.5)
}

/**
 * Der Satz-Karteikasten.
 *
 * Derselbe Spaced-Repetition-Kern wie beim Vokabeltrainer (srs.js) –
 * nur steht auf der Karte ein ganzer Satz. Deshalb keine Spiele:
 * Memory oder Wortpaare brauchen kurze Begriffe, Sätze nicht.
 */
export default function Satztrainer({ kopf, saetze, setSaetze, addXp }) {
  const [ansicht, setAnsicht] = useState('start') // 'start' | 'liste'
  const [artWahl, setArtWahl] = useState(false)
  const [art, setArt] = useState('karten')
  const [queue, setQueue] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [gewaehlt, setGewaehlt] = useState(null)
  const [result, setResult] = useState({ richtig: 0, falsch: 0 })
  const [xpPopup, setXpPopup] = useState(null)
  const [exiting, setExiting] = useState(null)
  const [filter, setFilter] = useState('faellig')

  // Alle Sätze als Liste, fehlende SRS-Felder ergänzt
  const entries = useMemo(
    () =>
      Object.entries(saetze).map(([key, e]) => ({
        key,
        satz: e.anzeige ?? key,
        ...withSrsDefaults(e),
      })),
    [saetze]
  )

  const faellig = entries.filter(isDue)
  const gewusst = entries.filter((e) => e.status === 'gewusst')

  const gefiltert = entries
    .filter((e) => {
      if (filter === 'alle') return true
      if (filter === 'faellig') return isDue(e)
      if (filter === 'gewusst') return e.status === 'gewusst'
      return true
    })
    .sort((a, b) => (a.due ?? 0) - (b.due ?? 0))

  /** Eine Runde starten – die am längsten fälligen zuerst. */
  function starten(gewaehlteArt) {
    const liste = [...faellig].sort((a, b) => (a.due ?? 0) - (b.due ?? 0)).slice(0, RUNDE)
    setArt(gewaehlteArt)
    setQueue(liste.map((e) => e.key))
    setRevealed(false)
    setGewaehlt(null)
    setResult({ richtig: 0, falsch: 0 })
    setArtWahl(false)
  }

  /**
   * Eine Karte bewerten und zur nächsten gehen.
   * @param {string} bewertung – 'nochmal' | 'schwer' | 'gut' | 'einfach'
   */
  function antworten(bewertung) {
    if (exiting) return
    const key = queue[0]
    const richtig = bewertung !== 'nochmal'
    merkeGelernt('saetze') // für die Lernkurve

    setExiting(richtig ? 'richtig' : 'falsch')

    setSaetze((alt) => {
      const eintrag = withSrsDefaults(alt[key] ?? {})
      return {
        ...alt,
        [key]: {
          ...review(eintrag, bewertung),
          // Die Satz-eigenen Felder überleben review() nicht von
          // selbst – es kennt nur die Karteikasten-Felder.
          anzeige: eintrag.anzeige,
          schluessel: eintrag.schluessel,
          thema: eintrag.thema,
          zeitform: eintrag.zeitform,
          richtig: (eintrag.richtig ?? 0) + (richtig ? 1 : 0),
          falsch: (eintrag.falsch ?? 0) + (richtig ? 0 : 1),
        },
      }
    })

    if (richtig) {
      addXp?.(XP.WORT_RICHTIG)
      setXpPopup({ amount: XP.WORT_RICHTIG, key: Date.now() })
      setTimeout(() => setXpPopup(null), 900)
    }

    setResult((r) => ({
      richtig: r.richtig + (richtig ? 1 : 0),
      falsch: r.falsch + (richtig ? 0 : 1),
    }))

    setTimeout(() => {
      setExiting(null)
      setRevealed(false)
      setGewaehlt(null)
      setQueue((q) => {
        const rest = q.slice(1)
        // Nicht gewusst? Hinten wieder einreihen, dann kommt der
        // Satz in derselben Runde noch einmal.
        if (!richtig) rest.push(key)
        if (rest.length === 0) merkeEinheit('wiederholung')
        return rest
      })
    }, 320)
  }

  /** Einen Satz aus dem Kasten werfen. */
  function entfernen(key) {
    setSaetze((alt) => {
      const neu = { ...alt }
      delete neu[key]
      return neu
    })
  }

  // ---------- Die Satzliste zum Verwalten ----------
  if (ansicht === 'liste') {
    return (
      <div className="trainer wechsel" key="satz-liste">
        {kopf}
        <button className="btn-zurueck" onClick={() => setAnsicht('start')}>
          <span className="zurueck-pfeil" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></span>Zurück
        </button>

        <div className="satz-filter">
          {[
            ['faellig', `Fällig (${faellig.length})`],
            ['alle', `Alle (${entries.length})`],
            ['gewusst', `Sitzt (${gewusst.length})`],
          ].map(([wert, text]) => (
            <button
              key={wert}
              className={'filter-knopf' + (filter === wert ? ' filter-an' : '')}
              onClick={() => setFilter(wert)}
            >
              {text}
            </button>
          ))}
        </div>

        {gefiltert.length === 0 ? (
          <p className="empty-hint">Hier ist gerade nichts.</p>
        ) : (
          <div className="satz-liste">
            {gefiltert.map((e) => (
              <div key={e.key} className="satz-zeile">
                <div className="satz-zeile-text">
                  <span className="satz-es">{e.satz}</span>
                  <span className="satz-de">{e.translation}</span>
                  <span className="satz-meta">
                    {LEVEL_LABELS[e.level] ?? 'Neu'} · {formatDue(e)}
                    {e.thema ? ' · ' + e.thema : ''}
                  </span>
                </div>
                <button
                  className="satz-weg"
                  onClick={() => entfernen(e.key)}
                  title="Satz entfernen"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ---------- Laufende Runde ----------
  if (queue !== null) {
    if (queue.length === 0) {
      return (
        <div className="trainer">
          <div className="flashcard done">
            <div className="confetti-burst" aria-hidden="true">
              {Array.from({ length: 14 }, (_, i) => (
                <span key={i} className="confetti" style={{ '--i': i }} />
              ))}
            </div>
            <h2>Runde geschafft! 🎉</h2>
            <p>
              {result.richtig}× gewusst · {result.falsch}× nicht gewusst
            </p>
            <button onClick={() => setQueue(null)}>Fertig</button>
          </div>
        </div>
      )
    }

    const key = queue[0]
    const current = withSrsDefaults(saetze[key] ?? {})
    const satz = current.anzeige ?? key
    const loesung = current.translation || '(keine Übersetzung gespeichert)'

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
              style={{ width: (result.richtig / RUNDE) * 100 + '%' }}
            />
          </div>
          <p className="training-progress">
            {result.richtig} von {RUNDE} geschafft
          </p>
        </div>

        {/* ---------- Karten ---------- */}
        {art === 'karten' && (
          <div
            className={'flashcard satzkarte' + (exiting ? ' fliegt-' + exiting : '')}
            key={key + queue.length}
          >
            <div className="flash-satz">{satz}</div>
            {revealed ? (
              <div className="flash-back">
                <div className="flash-translation">{loesung}</div>
                {current.schluessel && (
                  <p className="satz-schluessel-hinweis">
                    Achte auf: <b>{current.schluessel}</b>
                  </p>
                )}
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
                      onClick={() => antworten(b.wert)}
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

        {/* ---------- Multiple Choice ---------- */}
        {art === 'auswahl' && (
          <div
            className={'flashcard satzkarte' + (exiting ? ' fliegt-' + exiting : '')}
            key={key + queue.length}
          >
            <p className="lesson-hint">Was heißt …</p>
            <div className="flash-satz">{satz}</div>
            <SatzAuswahl
              key={key}
              loesung={loesung}
              alle={entries}
              gewaehlt={gewaehlt}
              onWahl={(antwort) => {
                if (gewaehlt) return
                setGewaehlt(antwort)
                setTimeout(() => antworten(antwort === loesung ? 'gut' : 'nochmal'), 750)
              }}
            />
          </div>
        )}

        <button className="btn-plain" onClick={() => setQueue(null)}>
          Runde abbrechen
        </button>
      </div>
    )
  }

  // ---------- Übungsart wählen ----------
  if (artWahl) {
    return (
      <div className="trainer">
        <div className="art-kopf">
          <button className="btn-zurueck" onClick={() => setArtWahl(false)}>
            <span className="zurueck-pfeil" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></span>Zurück
          </button>
          <h1 className="trainer-titel">
            Wie willst du <span className="accent">üben?</span>
          </h1>
          <p className="art-unterzeile">
            {Math.min(RUNDE, faellig.length)} Sätze stehen an.
          </p>
        </div>
        <div className="art-liste">
          {ARTEN.map((a) => {
            const Icon = a.icon
            // Multiple Choice braucht falsche Antworten zum Danebenlegen.
            // Mit weniger als vier Sätzen gibt es die nicht.
            const gesperrt = a.id === 'auswahl' && entries.length < 4
            return (
              <button
                key={a.id}
                className="art-karte"
                onClick={() => starten(a.id)}
                disabled={gesperrt}
                title={gesperrt ? 'Dafür brauchst du mindestens vier Sätze' : undefined}
              >
                <span className="art-emoji" aria-hidden="true">
                  <Icon groesse={24} />
                </span>
                <span className="art-text">
                  <span className="art-titel">{a.titel}</span>
                  <span className="art-beschreibung">{a.text}</span>
                  {gesperrt && (
                    <span className="art-hinweis">Ab vier gesammelten Sätzen</span>
                  )}
                </span>
                <span className="art-pfeil" aria-hidden="true">›</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ---------- Übersicht ----------
  return (
    <div className="trainer wechsel" key="satz-start">
      {kopf}

      {entries.length === 0 ? (
        <div className="bereich satz-leer">
          <h2>Noch keine Sätze</h2>
          <p>
            Lass dir welche erzeugen – zu einem Thema, zu einer Zeitform oder zu
            beidem. Danach wiederholst du sie hier, bis sie sitzen.
          </p>
        </div>
      ) : (
        <>
          {/* Gleicher Aufbau wie "Heute wiederholen" im Wort-Trainer */}
          <section className="bereich bereich-wiederholen">
            <div className="wiederholen-zahl">
              <b>{faellig.length}</b>
              <span>{faellig.length === 1 ? 'Satz wartet' : 'Sätze warten'}</span>
            </div>
            <div className="wiederholen-text">
              <h2>Heute wiederholen</h2>
              <p>
                {faellig.length > 0
                  ? 'Diese Sätze drohst du gerade zu vergessen – jetzt sitzen sie am besten.'
                  : 'Alles erledigt. Neue Sätze erzeugst du unten mit der KI.'}
              </p>
              <p className="wiederholen-stand">
                {entries.length} gesammelt · {gewusst.length} sitzen
              </p>
            </div>
            <button
              className="btn wiederholen-los"
              disabled={faellig.length === 0}
              onClick={() => setArtWahl(true)}
            >
              {faellig.length > 0 ? 'Üben' : 'Nichts fällig'}
            </button>
          </section>
        </>
      )}

      {/* Der Generator steht direkt hier – wie beim Vokabeltrainer.
          Erst eine Tür antippen, um dann ein Thema zu wählen, war
          ein Schritt zu viel. */}
      <section className="bereich">
        <SatzGenerator saetze={saetze} setSaetze={setSaetze} />
      </section>

      {entries.length > 0 && (
        <button className="bereich trainer-sprechen" onClick={() => setAnsicht('liste')}>
          <span className="trainer-sprechen-icon">
            <IconListe groesse={26} />
          </span>
          <span className="trainer-sprechen-text">
            <h2>Deine Sätze</h2>
            <p>{entries.length} gesammelt – ansehen und aufräumen.</p>
          </span>
        </button>
      )}
    </div>
  )
}

/** Die Antwortknöpfe beim Multiple Choice – einmal gewürfelt, dann fest. */
function SatzAuswahl({ loesung, alle, gewaehlt, onWahl }) {
  const [optionen] = useState(() => baueAuswahl(loesung, alle))

  return (
    <div className="quiz-options satz-optionen">
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
              e.currentTarget.blur()
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
