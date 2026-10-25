import { createPortal } from 'react-dom'
import PremiumWerbung from './PremiumWerbung.jsx'
import { useMemo, useState, useEffect } from 'react'
import { uebersetzungsAdresse } from './satzUmfeld.js'
import { review, isDue, formatDue, withSrsDefaults, vorschau, LEVEL_LABELS } from './srs.js'
import { XP } from './gamification.js'
import { merkeEinheit } from './aktivitaet.js'
import { merkeGelernt } from './lernkurve.js'
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

/** Ein Wort auf seinen Nachschlag-Schlüssel bringen (ohne Satzzeichen). */
function wortSchluessel(wort) {
  return wort.toLowerCase().replace(/[^a-záéíóúüñ]/gi, '')
}

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
export default function Lesetexte({ kopf, texte, setTexte, addXp, onAddVocab, vocab = {} }) {
  const [ansicht, setAnsicht] = useState('start') // 'start' | 'liste'
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
    merkeGelernt('texte')
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
        vocab={vocab}
      />
    )
  }

  // ---------- Alle Texte ----------
  if (ansicht === 'liste') {
    return (
      <div className="trainer wechsel" key="text-liste">
        {kopf}
        <button className="btn-zurueck" onClick={() => setAnsicht('start')}>
          <span className="zurueck-pfeil" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></span>Zurück
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
        </div>
      ) : (
        <>
          {/* Wie beim Vokabeltrainer: eine Karte, ein Knopf –
              statt alle fälligen Texte untereinander aufzulisten. */}
          <section className="bereich bereich-wiederholen">
            <div className="wiederholen-zahl">
              <b>{faellig.length}</b>
              <span>{faellig.length === 1 ? 'Text wartet' : 'Texte warten'}</span>
            </div>
            <div className="wiederholen-text">
              <h2>Heute wiederlesen</h2>
              <p>
                {faellig.length > 0
                  ? 'Diese Texte sind wieder dran – beim zweiten Lesen bleibt am meisten hängen.'
                  : 'Alles gelesen. Der nächste Text wird von selbst wieder fällig.'}
              </p>
            </div>
            <button
              className="btn wiederholen-los"
              onClick={() => setOffenerText(faellig[0].id)}
              disabled={faellig.length === 0}
            >
              {faellig.length > 0 ? 'Lesen' : 'Nichts fällig'}
            </button>
          </section>
        </>
      )}

      {/* Der Generator steht direkt hier – genau wie beim
          Vokabeltrainer. Erst auf eine Tür zu tippen, um dann ein
          Thema zu wählen, war ein Schritt zu viel. */}
      <section className="bereich">
        <TextGenerator
          texte={texte}
          setTexte={setTexte}
          onFertig={(id) => setOffenerText(id)}
        />
      </section>

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
function Leser({ text, onFertig, onZurueck, onAddVocab, vocab = {} }) {
  const [sprache, setSprache] = useState('es')
  const [fertig, setFertig] = useState(false)
  const [gesammelt, setGesammelt] = useState([])
  const [wort, setWort] = useState(null) // angetipptes Wort: { text, de, laedt }

  /**
   * Ein Wort im Text antippen: übersetzen lassen und als Karte
   * zeigen. Dasselbe Verhalten wie im Chat und im Ebook-Leser –
   * wer es dort einmal gelernt hat, kennt es hier wieder.
   */
  async function wortAntippen(rohesWort, umfeld) {
    const sauber = rohesWort.replace(/[«».,;:¿?¡!()"—…]/g, '').trim()
    if (!sauber) return
    setWort({ text: sauber, de: '', laedt: true })
    try {
      const res = await fetch(uebersetzungsAdresse(API_URL, sauber, umfeld))
      const daten = await res.json()
      setWort({ text: sauber, de: daten.translation || '', laedt: false })
    } catch {
      setWort({ text: sauber, de: '', laedt: false })
    }
  }

  /** Das angetippte Wort in den Trainer legen. */
  function wortInTrainer(status) {
    // Ohne Übersetzung nichts sammeln: Ein Wort ohne Bedeutung im
    // Trainer ist nur eine Karte, die man nie beantworten kann.
    if (!wort?.text || !wort.de || !onAddVocab) return setWort(null)
    onAddVocab(
      [{ wort: wort.text, uebersetzung: wort.de, quelle: 'Lesetext: ' + (text.titelDe || '') }],
      status
    )
    setWort(null)
  }

  /**
   * Macht aus einem Absatz einzeln antippbare Wörter.
   *
   * Nur auf Spanisch: Im deutschen Text gibt es nichts
   * nachzuschlagen, und antippbare Wörter würden dort nur
   * verwirren.
   */
  function alsWoerter(absatz) {
    return absatz.split(/(\s+)/).map((teil, i) => {
      if (!teil.trim()) return teil
      const status = vocab[wortSchluessel(teil)]?.status
      return (
        <span
          key={i}
          className={'lese-wort' + (status ? ' lese-wort-' + status : '')}
          onClick={() => wortAntippen(teil, absatz)}
        >
          {teil}
        </span>
      )
    })
  }

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
        <span className="leser-kopf-titel">{sprache === 'es' ? 'Español' : 'Deutsch'}</span>
        <span className="leser-stufe">{(text.stufe ?? 'b1').toUpperCase()}</span>
      </div>

      <article className="leser-text">
        <h1 className="leser-titel">{sprache === 'es' ? text.titelEs : text.titelDe}</h1>

        {(text.absaetze ?? []).map((a, i) => (
          <p key={i} className="leser-absatz">
            {sprache === 'es' ? alsWoerter(a.es) : a.de}
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

      {/* Der Sprachumschalter läuft unten mit: Beim Lesen braucht man
          ihn mitten im Text, nicht am Seitenanfang – und dort unten
          ist er mit dem Daumen erreichbar, ohne hochzuscrollen. */}
      <div className="leser-schiene">
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
      </div>

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

      {/* ---------- Angetipptes Wort ---------- */}
      {wort && createPortal(
        <div className="wortkarte-hintergrund" onClick={() => setWort(null)}>
          <div className="wortkarte" onClick={(e) => e.stopPropagation()}>
            <button
              className="wortkarte-schliessen"
              aria-label="Schließen"
              onClick={() => setWort(null)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              </svg>
            </button>
            <div className="wortkarte-wort">
              {wort.text}
              {vocab[wortSchluessel(wort.text)] && (
                <span className="wortkarte-marke">✓ im Trainer</span>
              )}
            </div>
            <div className="wortkarte-de">
              {wort.laedt ? 'Übersetze …' : wort.de || 'Keine Übersetzung gefunden'}
            </div>
            <div className="wortkarte-knoepfe">
              <button
                className="btn-outline"
                onClick={() => wortInTrainer('gewusst')}
                disabled={wort.laedt || !wort.de}
              >
                Kenne ich
              </button>
              <button
                className="btn"
                onClick={() => wortInTrainer('lernen')}
                disabled={wort.laedt || !wort.de}
              >
                ＋ Lernen
              </button>
            </div>
          </div>
        </div>,
        document.body
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
  // Premium kommt erst nach dem Laden – dann das Kontingent neu setzen
  useEffect(() => {
    setUebrig(verbleibend(premium))
  }, [premium])

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
        <PremiumWerbung was="Texte" />
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
        {/* Schritt 1: Gebiet – nur auswählen, erzeugt wird unten */}
        <p className="sg-schritt"><span>1</span> Thema wählen</p>
        <div className="sg-themen">
          {GEBIETE.map(([wert, name]) => (
            <button
              key={wert}
              type="button"
              className={'sg-thema' + (gebiet === wert ? ' ist-aktiv' : '')}
              disabled={laden}
              onClick={() => setGebiet(gebiet === wert ? '' : wert)}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Schritt 2: Schwierigkeit */}
        <p className="sg-schritt"><span>2</span> Schwierigkeit</p>
        <div className="sg-formen sg-drei">
          {STUFEN.map(([wert, name, hilfe]) => (
            <button
              key={wert}
              type="button"
              className={'sg-form' + (stufe === wert ? ' ist-aktiv' : '')}
              onClick={() => setStufe(wert)}
            >
              <b>{name}</b>
              <span>{hilfe}</span>
            </button>
          ))}
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
