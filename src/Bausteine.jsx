import { useState } from 'react'
import {
  BAUSTEINE,
  FAMILIEN,
  RUNDE_GROESSE,
  bausteineVon,
  bausteinDesTages,
  faelligeBausteine,
  istOffen,
  lektionZu,
  baueRunde,
} from './bausteine.js'
import {
  anDerLuecke,
  bauWoerter,
  bewertungAusRunde,
  istRichtig,
  loesungsText,
  nurWort,
  satzWoerter,
} from './uebungenGrammatik.js'
import { review, withSrsDefaults, isDue, formatDue } from './srs.js'
import { XP } from './gamification.js'
import { merkeEinheit } from './aktivitaet.js'

// Der Grammatik-Trainer.
//
// Er teilt sich den kompletten Karteikasten mit dem Vokabeltrainer:
// dieselbe review()-Funktion, dieselben Stufen, dieselben Abstände.
// Nur der Inhalt einer Karte ist ein anderer – eine Regel statt eines
// Wortes, fünf Aufgaben statt einer Übersetzung.
export default function Bausteine({ kopf, stand, setStand, lessonProgress, addXp }) {
  const [runde, setRunde] = useState(null) // { baustein, aufgaben }
  const [schritt, setSchritt] = useState(0)
  const [ergebnis, setErgebnis] = useState({ richtig: 0, falsch: 0 })
  const [rueckmeldung, setRueckmeldung] = useState(null) // 'richtig' | 'falsch'
  const [offeneFamilie, setOffeneFamilie] = useState(null)
  const [xpPopup, setXpPopup] = useState(null)

  const heute = bausteinDesTages(stand, lessonProgress)
  const faellig = faelligeBausteine(stand, lessonProgress)

  function starte(baustein) {
    setRunde({ baustein, aufgaben: baueRunde(baustein) })
    setSchritt(0)
    setErgebnis({ richtig: 0, falsch: 0 })
    setRueckmeldung(null)
  }

  /**
   * Eine Antwort verbuchen.
   *
   * Der Karteikasten wird erst am Ende der Runde angefasst – siehe
   * bewertungAusRunde(). Hier zählen wir nur mit und geben XP fürs
   * Mitmachen, wie im Vokabeltrainer auch.
   */
  function antworte(richtig) {
    if (rueckmeldung) return // die Rückmeldung läuft noch
    setRueckmeldung(richtig ? 'richtig' : 'falsch')
    const verdient = richtig ? XP.RICHTIG : XP.FALSCH
    addXp(verdient)
    setXpPopup({ amount: verdient, key: Date.now() })

    const neu = {
      richtig: ergebnis.richtig + (richtig ? 1 : 0),
      falsch: ergebnis.falsch + (richtig ? 0 : 1),
    }
    setErgebnis(neu)

    // Falsche Antworten stehen länger, damit man die Lösung liest
    setTimeout(() => {
      setRueckmeldung(null)
      if (schritt + 1 >= runde.aufgaben.length) beendeRunde(neu)
      else setSchritt(schritt + 1)
    }, richtig ? 800 : 1900)
  }

  function beendeRunde(zaehlung) {
    const bewertung = bewertungAusRunde(zaehlung.richtig, runde.aufgaben.length)
    const id = runde.baustein.id
    setStand((s) => ({ ...s, [id]: review(withSrsDefaults(s[id] ?? {}), bewertung) }))
    addXp(XP.RUNDE)
    merkeEinheit() // zählt im Wochendiagramm wie eine Trainingsrunde
    setSchritt(runde.aufgaben.length) // schaltet auf die Abschlussseite
  }

  // ---------- Abschluss einer Runde ----------
  if (runde && schritt >= runde.aufgaben.length) {
    const bewertung = bewertungAusRunde(ergebnis.richtig, runde.aufgaben.length)
    const eintrag = withSrsDefaults(stand[runde.baustein.id] ?? {})
    return (
      <div className="trainer">
        <div className="flashcard done">
          <div className="confetti-burst" aria-hidden="true">
            {Array.from({ length: 14 }, (_, i) => (
              <span key={i} className="confetti" style={{ '--i': i }} />
            ))}
          </div>
          <h2>{ergebnis.falsch === 0 ? 'Alles richtig! 🎉' : 'Runde geschafft!'}</h2>
          <p>
            {ergebnis.richtig} von {runde.aufgaben.length} bei „{runde.baustein.titel}“
          </p>
          <p className="gram-naechster">
            {bewertung === 'nochmal'
              ? 'Der Baustein kommt gleich noch einmal.'
              : `Nächste Wiederholung: ${formatDue(eintrag)}`}
          </p>
          <p className="bonus-note">+{XP.RUNDE} Bonus-XP für die volle Runde!</p>
          <button onClick={() => setRunde(null)}>Zurück zur Übersicht</button>
        </div>
      </div>
    )
  }

  // ---------- Eine laufende Runde ----------
  if (runde) {
    const aufgabe = runde.aufgaben[schritt]
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
              style={{ width: (schritt / runde.aufgaben.length) * 100 + '%' }}
            />
          </div>
          <p className="training-progress">
            {runde.baustein.titel} · Aufgabe {schritt + 1} von {runde.aufgaben.length}
          </p>
        </div>

        <Aufgabe
          key={schritt}
          aufgabe={aufgabe}
          rueckmeldung={rueckmeldung}
          onAntwort={antworte}
        />

        <button className="gram-abbrechen" onClick={() => setRunde(null)}>
          Runde abbrechen
        </button>
      </div>
    )
  }

  // ---------- Übersicht ----------
  return (
    <div className="trainer">
      {kopf}

      {/* ============ 1. DER BAUSTEIN DES TAGES ============ */}
      {/* Das Wichtigste zuerst – genau wie "Heute wiederholen"
          im Vokabeltrainer. */}
      <section className="bereich bereich-wiederholen">
        <div className="wiederholen-zahl">
          <b>{faellig.length}</b>
          <span>{faellig.length === 1 ? 'Baustein wartet' : 'Bausteine warten'}</span>
        </div>
        <div className="wiederholen-text">
          <h2>{heute ? 'Baustein des Tages' : 'Noch nichts freigeschaltet'}</h2>
          {heute ? (
            <>
              <p className="gram-heute-titel">{heute.titel}</p>
              <p>{heute.regel}</p>
            </>
          ) : (
            <p>Schließe eine Lektion ab – dann wird die passende Regel hier zum Üben frei.</p>
          )}
        </div>
        <button className="btn wiederholen-los" onClick={() => starte(heute)} disabled={!heute}>
          {RUNDE_GROESSE} Aufgaben
        </button>
      </section>

      {/* ============ 2. ALLE BAUSTEINE ============ */}
      {FAMILIEN.map((familie) => {
        const liste = bausteineVon(familie)
        const offen = liste.filter((b) => istOffen(b, lessonProgress))
        const aufgeklappt = offeneFamilie === familie.id
        return (
          <section className="bereich" key={familie.id}>
            <button
              className="liste-kopf"
              onClick={() => setOffeneFamilie(aufgeklappt ? null : familie.id)}
              aria-expanded={aufgeklappt}
            >
              <span className="liste-kopf-text">
                <span className="liste-titel">{familie.titel}</span>
                <span className="liste-sub">
                  {familie.text} · {offen.length} von {liste.length} frei
                </span>
              </span>
              <span className={'liste-pfeil' + (aufgeklappt ? ' liste-pfeil-auf' : '')}>▾</span>
            </button>

            {aufgeklappt && (
              <div className="gram-liste">
                {liste.map((b) => {
                  const frei = istOffen(b, lessonProgress)
                  const eintrag = stand[b.id] ? withSrsDefaults(stand[b.id]) : null
                  const lektion = lektionZu(b)
                  return (
                    <button
                      key={b.id}
                      className={'gram-karte' + (frei ? '' : ' gram-karte-zu')}
                      disabled={!frei}
                      onClick={() => starte(b)}
                    >
                      <span className="gram-karte-text">
                        <span className="gram-karte-titel">{b.titel}</span>
                        <span className="gram-karte-regel">
                          {frei
                            ? b.regel
                            : `Wird mit Lektion ${lektion?.kursNr ?? '?'} frei.`}
                        </span>
                      </span>
                      {frei && (
                        <span
                          className={
                            'gram-stand' + (eintrag && isDue(eintrag) ? ' gram-stand-faellig' : '')
                          }
                        >
                          {/* Nicht die Stufe anzeigen: Stufe 0 heisst
                              "Neu", und das stand nach dem ersten Ueben
                              faelschlich da. Der Termin ist ehrlicher. */}
                          {!eintrag ? 'neu' : isDue(eintrag) ? 'fällig' : formatDue(eintrag)}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}

      <p className="gram-fuss">
        {BAUSTEINE.length} Bausteine · jede Regel erklärt die Lektion, aus der sie stammt.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------
//  Die vier Aufgabentypen
// ---------------------------------------------------------------

function Aufgabe({ aufgabe, rueckmeldung, onAntwort }) {
  if (aufgabe.typ === 'bauen') {
    return <SatzBauen aufgabe={aufgabe} rueckmeldung={rueckmeldung} onAntwort={onAntwort} />
  }
  if (aufgabe.typ === 'fehler') {
    return <FehlerSuchen aufgabe={aufgabe} rueckmeldung={rueckmeldung} onAntwort={onAntwort} />
  }
  if (aufgabe.typ === 'wahl') {
    return <AuswahlAufgabe aufgabe={aufgabe} rueckmeldung={rueckmeldung} onAntwort={onAntwort} />
  }
  return <LueckeTippen aufgabe={aufgabe} rueckmeldung={rueckmeldung} onAntwort={onAntwort} />
}

/** Die Lösung nach einer falschen Antwort – überall gleich. */
function Aufloesung({ aufgabe, rueckmeldung }) {
  if (rueckmeldung !== 'falsch') return null
  return (
    <p className="gram-aufloesung">
      Richtig wäre: <b>{loesungsText(aufgabe)}</b>
    </p>
  )
}

function LueckeTippen({ aufgabe, rueckmeldung, onAntwort }) {
  const [eingabe, setEingabe] = useState('')
  const [vorn, hinten] = anDerLuecke(aufgabe.satz)
  const gesperrt = rueckmeldung !== null

  return (
    <div className={'flashcard' + (rueckmeldung ? ' gram-' + rueckmeldung : '')}>
      <p className="lesson-hint">Ergänze</p>
      <p className="gram-deutsch">{aufgabe.de}</p>
      <p className="gram-satz">
        {vorn}
        <span className="gram-luecke">{gesperrt ? eingabe || '…' : '…'}</span>
        {hinten}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!gesperrt && eingabe.trim()) onAntwort(istRichtig(aufgabe, eingabe))
        }}
      >
        <input
          className="gram-eingabe"
          value={eingabe}
          onChange={(e) => setEingabe(e.target.value)}
          disabled={gesperrt}
          placeholder="Deine Antwort"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />
        {aufgabe.hilfe && <p className="gram-hilfe">{aufgabe.hilfe}</p>}
        <Aufloesung aufgabe={aufgabe} rueckmeldung={rueckmeldung} />
        <div className="flash-actions">
          <button type="submit" disabled={gesperrt || !eingabe.trim()}>
            Prüfen
          </button>
        </div>
      </form>
    </div>
  )
}

function AuswahlAufgabe({ aufgabe, rueckmeldung, onAntwort }) {
  const [gewaehlt, setGewaehlt] = useState(null)
  const [vorn, hinten] = anDerLuecke(aufgabe.satz)
  const gesperrt = rueckmeldung !== null

  return (
    <div className={'flashcard' + (rueckmeldung ? ' gram-' + rueckmeldung : '')}>
      <p className="lesson-hint">Was passt?</p>
      <p className="gram-deutsch">{aufgabe.de}</p>
      <p className="gram-satz">
        {vorn}
        <span className="gram-luecke">{gewaehlt ?? '…'}</span>
        {hinten}
      </p>
      <div className="gram-optionen">
        {aufgabe.optionen.map((o) => (
          <button
            key={o}
            className={
              'gram-option' +
              (gesperrt && o === aufgabe.loesung ? ' gram-option-richtig' : '') +
              (gesperrt && o === gewaehlt && o !== aufgabe.loesung ? ' gram-option-falsch' : '')
            }
            disabled={gesperrt}
            onClick={() => {
              setGewaehlt(o)
              onAntwort(istRichtig(aufgabe, o))
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

function FehlerSuchen({ aufgabe, rueckmeldung, onAntwort }) {
  const [getippt, setGetippt] = useState(null)
  const gesperrt = rueckmeldung !== null
  const woerter = satzWoerter(aufgabe.satz)

  return (
    <div className={'flashcard' + (rueckmeldung ? ' gram-' + rueckmeldung : '')}>
      <p className="lesson-hint">Ein Wort ist falsch – tippe es an</p>
      <p className="gram-deutsch">{aufgabe.de}</p>
      <div className="gram-woerter">
        {woerter.map((w, i) => (
          <button
            key={i}
            className={
              'gram-wort' +
              (gesperrt && nurWort(w) === aufgabe.falsch ? ' gram-wort-treffer' : '') +
              (gesperrt && i === getippt && nurWort(w) !== aufgabe.falsch ? ' gram-wort-daneben' : '')
            }
            disabled={gesperrt}
            onClick={() => {
              setGetippt(i)
              onAntwort(istRichtig(aufgabe, w))
            }}
          >
            {w}
          </button>
        ))}
      </div>
      {gesperrt && (
        <p className="gram-aufloesung">
          Richtig wäre: <b>{aufgabe.richtig}</b> statt <b>{aufgabe.falsch}</b>
        </p>
      )}
    </div>
  )
}

function SatzBauen({ aufgabe, rueckmeldung, onAntwort }) {
  // Einmal würfeln und liegen lassen – sonst springt die Reihenfolge
  // bei jedem Neuzeichnen.
  const [woerter] = useState(() => bauWoerter(aufgabe.loesung))
  const [gewaehlt, setGewaehlt] = useState([])
  const gesperrt = rueckmeldung !== null
  const fertig = gewaehlt.length === woerter.length

  function tippe(i) {
    if (gesperrt) return
    setGewaehlt((g) => (g.includes(i) ? g.filter((x) => x !== i) : [...g, i]))
  }

  return (
    <div className={'flashcard' + (rueckmeldung ? ' gram-' + rueckmeldung : '')}>
      <p className="lesson-hint">Baue den Satz</p>
      <p className="satzbau-deutsch">{aufgabe.de}</p>

      <div className="satzbau-ablage">
        {gewaehlt.length === 0 && <span className="ablage-leer">Tippe die Wörter unten an</span>}
        {gewaehlt.map((i) => (
          <button key={i} className="satz-baustein baustein-gesetzt" onClick={() => tippe(i)}>
            {woerter[i]}
          </button>
        ))}
      </div>

      <Aufloesung aufgabe={aufgabe} rueckmeldung={rueckmeldung} />

      <div className="satzbau-vorrat">
        {woerter.map((w, i) => (
          <button
            key={i}
            className={'satz-baustein' + (gewaehlt.includes(i) ? ' baustein-weg' : '')}
            disabled={gewaehlt.includes(i) || gesperrt}
            onClick={() => tippe(i)}
          >
            {w}
          </button>
        ))}
      </div>

      <div className="flash-actions">
        <button
          disabled={!fertig || gesperrt}
          onClick={() => onAntwort(istRichtig(aufgabe, gewaehlt.map((i) => woerter[i]).join(' ')))}
        >
          Prüfen
        </button>
      </div>
    </div>
  )
}
