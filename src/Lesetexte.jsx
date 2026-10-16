import { useMemo, useState } from 'react'
import { review, isDue, formatDue, withSrsDefaults, vorschau, LEVEL_LABELS } from './srs.js'
import { XP } from './gamification.js'
import { merkeEinheit } from './aktivitaet.js'
import { API_URL } from './api.js'
import { neuerText, textSchluessel } from './lesetexte.js'
import { LISTEN_PRO_TAG, verbleibend, zaehleNutzung } from './limits.js'
import { usePremium } from './premium.js'
import { IconFunken, IconListe, IconPfeil } from './icons.jsx'

// Dieselben Gebiete wie auf dem Server (server/lesetexte.js).
const GEBIETE = [
  ['natur', 'Natur & Tiere'],
  ['wissenschaft', 'Wissenschaft'],
  ['geschichte', 'Geschichte'],
  ['koerper', 'Körper & Gesundheit'],
  ['weltall', 'Weltall'],
  ['kultur', 'Kunst & Kultur'],
  ['laender', 'Länder & Leute'],
  ['alltag', 'Erstaunliches'],
]

const STUFEN = [
  ['a2', 'A2', 'kurze Sätze'],
  ['b1', 'B1', 'Alltagssprache'],
  ['b2', 'B2', 'anspruchsvoll'],
]

/**
 * Wissenstexte lesen – und wiederlesen.
 *
 * Der Unterschied zu Vokabeln und Sätzen: Hier wird nichts abgefragt.
 * Man liest, schaltet bei Bedarf auf Deutsch um, und sagt am Ende,
 * wie gut man zurechtkam. Daraus errechnet dieselbe Logik wie bei den
 * Karten (srs.js), wann der Text wieder dran ist.
 */
export default function Lesetexte({ kopf, texte, setTexte, addXp, onAddVocab }) {
  const [ansicht, setAnsicht] = useState('start') // 'start' | 'generator' | 'liste'
  const [offenerText, setOffenerText] = useState(null) // Kennung des Textes im Leser

  const entries = useMemo(
    () =>
      Object.entries(texte).map(([id, e]) => ({
        id,
        ...withSrsDefaults(e),
      })),
    [texte]
  )

  const faellig = entries.filter(isDue)
  const neueste = [...entries].sort((a, b) => (b.erstelltAm ?? 0) - (a.erstelltAm ?? 0))

  /** Nach dem Lesen bewerten und den nächsten Termin setzen. */
  function bewerten(id, bewertung) {
    setTexte((alt) => {
      const e = withSrsDefaults(alt[id] ?? {})
      return {
        ...alt,
        [id]: {
          ...review(e, bewertung),
          // review() kennt nur die Karteikasten-Felder – alles andere
          // müssen wir von Hand hinüberretten.
          titelEs: e.titelEs,
          titelDe: e.titelDe,
          absaetze: e.absaetze,
          woerter: e.woerter,
          merksatz: e.merksatz,
          gebiet: e.gebiet,
          stufe: e.stufe,
          erstelltAm: e.erstelltAm,
          gelesen: (e.gelesen ?? 0) + 1,
        },
      }
    })
    addXp?.(XP.WORT_RICHTIG)
    merkeEinheit('wiederholung')
    setOffenerText(null)
  }

  function entfernen(id) {
    setTexte((alt) => {
      const neu = { ...alt }
      delete neu[id]
      return neu
    })
    if (offenerText === id) setOffenerText(null)
  }

  // ---------- Der Leser ----------
  if (offenerText && texte[offenerText]) {
    return (
      <Leser
        text={withSrsDefaults(texte[offenerText])}
        onFertig={(bewertung) => bewerten(offenerText, bewertung)}
        onZurueck={() => setOffenerText(null)}
        onAddVocab={onAddVocab}
      />
    )
  }

  // ---------- Generator ----------
  if (ansicht === 'generator') {
    return (
      <div className="trainer wechsel" key="text-gen">
        {kopf}
        <button className="recht-zurueck" onClick={() => setAnsicht('start')}>
          ← Zurück
        </button>
        <TextGenerator
          texte={texte}
          setTexte={setTexte}
          onFertig={(id) => {
            setAnsicht('start')
            setOffenerText(id)
          }}
        />
      </div>
    )
  }

  // ---------- Alle Texte ----------
  if (ansicht === 'liste') {
    return (
      <div className="trainer wechsel" key="text-liste">
        {kopf}
        <button className="recht-zurueck" onClick={() => setAnsicht('start')}>
          ← Zurück
        </button>
        {neueste.length === 0 ? (
          <p className="empty-hint">Noch keine Texte.</p>
        ) : (
          <div className="text-liste">
            {neueste.map((t) => (
              <div key={t.id} className="text-zeile">
                <button className="text-zeile-text" onClick={() => setOffenerText(t.id)}>
                  <span className="text-titel">{t.titelEs}</span>
                  <span className="text-untertitel">{t.titelDe}</span>
                  <span className="text-meta">
                    {LEVEL_LABELS[t.level] ?? 'Neu'} · {formatDue(t)}
                    {t.gelesen ? ` · ${t.gelesen}× gelesen` : ''}
                  </span>
                </button>
                <button className="satz-weg" onClick={() => entfernen(t.id)} title="Text entfernen">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ---------- Übersicht ----------
  return (
    <div className="trainer wechsel" key="text-start">
      {kopf}

      {entries.length === 0 ? (
        <div className="bereich satz-leer">
          <h2>Noch keine Texte</h2>
          <p>
            Lass dir einen kurzen Text über etwas Wissenswertes schreiben – über
            Oktopusse, das Weltall oder warum Brot aufgeht. Du liest ihn auf
            Spanisch, schaltest bei Bedarf auf Deutsch um, und bekommst ihn
            später automatisch wieder vorgelegt.
          </p>
          <button className="btn" onClick={() => setAnsicht('generator')}>
            Ersten Text erzeugen
          </button>
        </div>
      ) : (
        <>
          <div className="satz-stand">
            <div className="satz-zahl">
              <b>{faellig.length}</b>
              <span>zum Lesen</span>
            </div>
            <div className="satz-zahl">
              <b>{entries.length}</b>
              <span>Texte</span>
            </div>
            <div className="satz-zahl">
              <b>{entries.reduce((s, t) => s + (t.gelesen ?? 0), 0)}</b>
              <span>gelesen</span>
            </div>
          </div>

          {/* Was heute ansteht – direkt antippbar */}
          {faellig.length > 0 ? (
            <div className="text-faellig">
              <p className="suche-hinweis">Diese Texte sind heute wieder dran:</p>
              {faellig.slice(0, 5).map((t) => (
                <button
                  key={t.id}
                  className="text-karte"
                  onClick={() => setOffenerText(t.id)}
                >
                  <span className="text-karte-inhalt">
                    <span className="text-titel">{t.titelEs}</span>
                    <span className="text-untertitel">{t.titelDe}</span>
                    {t.gelesen > 0 && (
                      <span className="text-meta">{t.gelesen}× gelesen</span>
                    )}
                  </span>
                  <IconPfeil groesse={18} />
                </button>
              ))}
            </div>
          ) : (
            <p className="empty-hint">
              Alles gelesen. Der nächste Text wird von selbst wieder fällig.
            </p>
          )}
        </>
      )}

      <button className="bereich trainer-sprechen" onClick={() => setAnsicht('generator')}>
        <span className="trainer-sprechen-icon">
          <IconFunken groesse={26} />
        </span>
        <span className="trainer-sprechen-text">
          <h2>Neuen Text erzeugen</h2>
          <p>Wissensgebiet wählen oder eigenes Thema eingeben.</p>
        </span>
      </button>

      {entries.length > 0 && (
        <button className="bereich trainer-sprechen" onClick={() => setAnsicht('liste')}>
          <span className="trainer-sprechen-icon">
            <IconListe groesse={26} />
          </span>
          <span className="trainer-sprechen-text">
            <h2>Alle Texte</h2>
            <p>{entries.length} gesammelt – noch einmal lesen oder aufräumen.</p>
          </span>
        </button>
      )}
    </div>
  )
}

// ===============================================================
//  Der Leser
// ===============================================================

/**
 * Ein Text zum Lesen, mit Umschalter zwischen Spanisch und Deutsch.
 *
 * Der Umschalter wechselt NICHT die ganze Seite, sondern nur die
 * Absätze – und man bleibt an derselben Stelle stehen. Darum liegen
 * die beiden Sprachen auch absatzweise nebeneinander in den Daten.
 */
function Leser({ text, onFertig, onZurueck, onAddVocab }) {
  const [sprache, setSprache] = useState('es')
  const [fertig, setFertig] = useState(false)
  const [gesammelt, setGesammelt] = useState([])

  function wortSammeln(w) {
    if (gesammelt.includes(w.wort)) return
    onAddVocab?.([{ wort: w.wort, uebersetzung: w.uebersetzung }], 'lernen')
    setGesammelt((g) => [...g, w.wort])
  }

  return (
    <div className="leser">
      <div className="leser-leiste">
        <button className="leser-pfeil" onClick={onZurueck} aria-label="Zurück">
          ←
        </button>
        <div className="leser-sprachen" role="tablist">
          {[
            ['es', 'Español'],
            ['de', 'Deutsch'],
          ].map(([wert, name]) => (
            <button
              key={wert}
              role="tab"
              aria-selected={sprache === wert}
              className={'leser-sprache' + (sprache === wert ? ' leser-sprache-an' : '')}
              onClick={() => setSprache(wert)}
            >
              {name}
            </button>
          ))}
        </div>
        <span className="leser-stufe">{(text.stufe ?? 'b1').toUpperCase()}</span>
      </div>

      <article className="leser-text">
        <h1 className="leser-titel">{sprache === 'es' ? text.titelEs : text.titelDe}</h1>

        {(text.absaetze ?? []).map((a, i) => (
          <p key={i} className="leser-absatz">
            {sprache === 'es' ? a.es : a.de}
          </p>
        ))}

        {/* Die Wörter zum Mitnehmen – ein Tipp legt sie in den Trainer */}
        {text.woerter?.length > 0 && (
          <div className="leser-woerter">
            <h2>Wörter aus dem Text</h2>
            <p className="leser-woerter-hinweis">Antippen, um sie zu sammeln.</p>
            <div className="leser-wortliste">
              {text.woerter.map((w) => {
                const schonDa = gesammelt.includes(w.wort)
                return (
                  <button
                    key={w.wort}
                    className={'leser-wort' + (schonDa ? ' leser-wort-da' : '')}
                    onClick={() => wortSammeln(w)}
                    disabled={schonDa}
                  >
                    <b>{w.wort}</b>
                    <span>{w.uebersetzung}</span>
                    {schonDa && <i aria-hidden="true">✓</i>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {text.merksatz && (
          <div className="leser-merksatz">
            <span className="leser-merksatz-marke">Zum Weitererzählen</span>
            <p>{text.merksatz}</p>
          </div>
        )}
      </article>

      {/* Am Ende: Wie gut kamst du zurecht? Daraus folgt der nächste Termin. */}
      {fertig ? (
        <div className="leser-bewertung">
          <p className="leser-frage">Wie gut hast du den Text verstanden?</p>
          <div className="bewertungen">
            {[
              { wert: 'nochmal', text: 'Kaum' },
              { wert: 'schwer', text: 'Mit Mühe' },
              { wert: 'gut', text: 'Gut' },
              { wert: 'einfach', text: 'Mühelos' },
            ].map((b) => (
              <button
                key={b.wert}
                className={'bewertung bewertung-' + b.wert}
                onClick={() => onFertig(b.wert)}
              >
                <span className="bewertung-text">{b.text}</span>
                <span className="bewertung-zeit">{vorschau(text, b.wert)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button className="btn leser-fertig" onClick={() => setFertig(true)}>
          Durchgelesen
        </button>
      )}
    </div>
  )
}

// ===============================================================
//  Der Generator
// ===============================================================

function TextGenerator({ texte, setTexte, onFertig }) {
  const [gebiet, setGebiet] = useState('')
  const [thema, setThema] = useState('')
  const [stufe, setStufe] = useState('b1')
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState('')
  const { premium } = usePremium()
  const [uebrig, setUebrig] = useState(() => verbleibend())

  const bekannt = Object.values(texte).map((t) => t.titelDe ?? '')

  async function erzeugen(e, direktGebiet = null) {
    e?.preventDefault()
    const g = direktGebiet ?? gebiet
    if (!g && !thema.trim()) return
    if (uebrig <= 0) return

    setLaden(true)
    setFehler('')
    try {
      const res = await fetch(API_URL + '/api/lesetext', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gebiet: g, thema: thema.trim(), stufe, bekannt }),
      })
      const daten = await res.json()
      if (!res.ok) throw new Error(daten.error || 'Das hat nicht geklappt.')

      const id = textSchluessel()
      setTexte((alt) => ({ ...alt, [id]: neuerText(daten) }))
      zaehleNutzung()
      setUebrig(verbleibend(premium))
      onFertig?.(id)
    } catch (f) {
      setFehler(f.message)
    } finally {
      setLaden(false)
    }
  }

  if (uebrig <= 0) {
    return (
      <div className="list-gen">
        <div className="plan-card plan-premium premium-teaser">
          <div className="plan-name">
            Premium <span className="plan-badge badge-soon">Bald verfügbar</span>
          </div>
          <p className="row-hint">
            Deine {LISTEN_PRO_TAG} kostenlosen Generierungen sind für heute
            aufgebraucht – unbegrenzte Texte kommen mit dem Premium-Abo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="list-gen satz-gen">
      <div className="gen-kopf">
        <span className="gen-symbol" aria-hidden="true">
          <IconFunken groesse={24} />
        </span>
        <div className="gen-text">
          <h2>Wissenstext erzeugen</h2>
          <p>Ein kurzer Text zum Lesen – und später Wiederlesen.</p>
        </div>
        {uebrig <= 2 && (
          <span className="rest-zaehler">
            {uebrig}/{LISTEN_PRO_TAG}
          </span>
        )}
      </div>

      <form className="wort-form" onSubmit={erzeugen}>
        <div className="wort-vorschlaege">
          {GEBIETE.map(([wert, name]) => (
            <button
              key={wert}
              type="button"
              className="vorschlag-chip"
              disabled={laden}
              onClick={(e) => {
                setGebiet(wert)
                erzeugen(e, wert)
              }}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="zeitform-wahl">
          <span className="zeitform-titel">Schwierigkeit</span>
          <div className="wort-vorschlaege">
            {STUFEN.map(([wert, name, hilfe]) => (
              <button
                key={wert}
                type="button"
                className={
                  'vorschlag-chip zeit-chip' + (stufe === wert ? ' vorschlag-chip-aktiv' : '')
                }
                onClick={() => setStufe(wert)}
              >
                {name}
                <small>{hilfe}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="gen-feld">
          <input
            type="text"
            value={thema}
            onChange={(e) => setThema(e.target.value)}
            placeholder="Eigenes Thema, z. B. Vulkane …"
            disabled={laden}
          />
          <button
            type="submit"
            className="gen-pfeil"
            disabled={laden || (!thema.trim() && !gebiet)}
            aria-label="Text erzeugen"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M4 12h15M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="gen-knoepfe">
          <button
            type="submit"
            className="btn gen-los"
            disabled={laden || (!thema.trim() && !gebiet)}
          >
            {laden ? (
              <>Schreibt den Text<span className="studio-punkte" /></>
            ) : (
              'Text erzeugen'
            )}
          </button>
        </div>
      </form>

      {fehler && <p className="error">{fehler}</p>}
    </div>
  )
}
