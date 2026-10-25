import { useState, useEffect } from 'react'
import PremiumWerbung from './PremiumWerbung.jsx'
import { API_URL } from './api.js'
import { neuerSatz, satzSchluessel } from './saetze.js'
import { LISTEN_PRO_TAG, verbleibend, zaehleNutzung } from './limits.js'
import { usePremium } from './premium.js'
import { IconFunken } from './icons.jsx'

// Themen wie beim Vokabelgenerator – dieselbe Sprache, dieselbe
// Bedienung. Ein Tipp erzeugt sofort, ohne erst ein Feld zu füllen.
const THEMEN = ['Reisen', 'Arbeit', 'Restaurant', 'Einkaufen', 'Gesundheit', 'Familie']

// Die Zeitformen, die der Server kennt (server/saetze.js). Hier
// stehen sie mit ihrem Alltagsnamen daneben: "Condicional" sagt
// Anfängern wenig, "würde …" sofort etwas.
const ZEITFORMEN = [
  ['', 'Gemischt', 'alle Zeiten'],
  ['presente', 'Presente', 'Gegenwart'],
  ['perfecto', 'Perfecto', 'he hablado'],
  ['indefinido', 'Indefinido', 'hablé'],
  ['imperfecto', 'Imperfecto', 'hablaba'],
  ['futuro', 'Futuro', 'hablaré'],
  ['condicional', 'Condicional', 'würde …'],
  ['subjuntivo', 'Subjuntivo', 'que hable'],
]

/**
 * Sätze mit KI erzeugen und in den Satz-Trainer übernehmen.
 *
 * Zwei Vorgaben lassen sich frei kombinieren: ein Thema und eine
 * Zeitform. "Reisen" + "Condicional" ergibt genau die Sätze, die man
 * für eine höfliche Anfrage im Hotel braucht.
 */
export default function SatzGenerator({ saetze, setSaetze }) {
  const [thema, setThema] = useState('')
  const [zeitform, setZeitform] = useState('')
  const [liste, setListe] = useState(null)
  const [fertig, setFertig] = useState({ thema: '', zeitform: '', hinweis: '' })
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState('')
  const [erfolg, setErfolg] = useState(0) // wie viele gerade übernommen wurden
  const { premium, laedt: premiumLaedt } = usePremium()
  const [uebrig, setUebrig] = useState(() => verbleibend(premium))
  // Premium kommt erst nach dem Laden – dann das Kontingent neu setzen
  useEffect(() => {
    setUebrig(verbleibend(premium))
  }, [premium])

  const bekannt = Object.values(saetze).map((s) => s.anzeige ?? '')

  async function generieren(e, direktThema = null) {
    e?.preventDefault()
    const gefragt = (direktThema ?? thema).trim()
    // Ohne Thema geht es nur, wenn wenigstens eine Zeitform gewählt
    // ist – sonst wüsste die KI nicht, worüber sie schreiben soll.
    if (!gefragt && !zeitform && bekannt.length < 5) return
    if (uebrig <= 0) return

    setLaden(true)
    setFehler('')
    setErfolg(0)
    try {
      const res = await fetch(API_URL + '/api/saetze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thema: gefragt, zeitform, bekannt }),
      })
      const daten = await res.json()
      if (!res.ok) throw new Error(daten.error || 'Das hat nicht geklappt.')

      setListe(daten.saetze.map((s) => ({ ...s, checked: true })))
      setFertig({
        thema: daten.thema || gefragt,
        zeitform: daten.zeitform || '',
        hinweis: daten.hinweis || '',
      })
      zaehleNutzung()
      setUebrig(verbleibend(premium))
    } catch (f) {
      setFehler(f.message)
    } finally {
      setLaden(false)
    }
  }

  /** Die angehakten Sätze in den Karteikasten legen. */
  function uebernehmen() {
    let gezaehlt = 0
    setSaetze((alt) => {
      const neu = { ...alt }
      for (const s of liste) {
        const key = satzSchluessel(s.satz)
        if (!s.checked || neu[key]) continue
        neu[key] = neuerSatz(s, { thema: fertig.thema, zeitform: fertig.zeitform })
        gezaehlt++
      }
      return neu
    })
    setErfolg(liste.filter((s) => s.checked).length)
    setListe(null)
    setThema('')
  }

  const zeitformName = ZEITFORMEN.find(([w]) => w === fertig.zeitform)?.[1]

  // Kontingent aufgebraucht
  if (uebrig <= 0 && !liste) {
    // Solange der Premium-Stand noch geladen wird: nichts zeigen statt Werbung
    if (premiumLaedt && !premium) return null
    return (
      <div className="list-gen">
        <PremiumWerbung was="Sätze" />
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
          <h2>Sätze erzeugen</h2>
          <p>Wähle ein Thema, eine Zeitform – oder beides.</p>
        </div>
        {uebrig <= 2 && (
          <span className="rest-zaehler" title="Kostenlose Generierungen heute">
            {uebrig}/{LISTEN_PRO_TAG}
          </span>
        )}
      </div>

      <form className="wort-form" onSubmit={generieren}>
        {/* Schritt 1: Thema – nur auswählen, erzeugt wird unten */}
        <p className="sg-schritt"><span>1</span> Thema wählen</p>
        <div className="sg-themen">
          {THEMEN.map((t) => (
            <button
              key={t}
              type="button"
              className={'sg-thema' + (thema === t ? ' ist-aktiv' : '')}
              disabled={laden}
              onClick={() => setThema(thema === t ? '' : t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Schritt 2: Zeitform – bleibt gewählt */}
        <p className="sg-schritt"><span>2</span> Zeitform <small>optional</small></p>
        <div className="sg-formen">
          {ZEITFORMEN.map(([wert, name, hilfe]) => (
            <button
              key={wert || 'alle'}
              type="button"
              className={'sg-form' + (zeitform === wert ? ' ist-aktiv' : '')}
              onClick={() => setZeitform(wert)}
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
            placeholder="Eigenes Thema …"
            disabled={laden}
          />
          <button
            type="submit"
            className="gen-pfeil"
            disabled={laden || (!thema.trim() && !zeitform)}
            aria-label="Sätze erzeugen"
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
            disabled={laden || (!thema.trim() && !zeitform)}
          >
            {laden ? (
              <>Schreibt Sätze<span className="studio-punkte" /></>
            ) : zeitform && !thema.trim() ? (
              `Sätze zum ${ZEITFORMEN.find(([w]) => w === zeitform)?.[1]}`
            ) : (
              'Sätze erzeugen'
            )}
          </button>
        </div>
      </form>

      {erfolg > 0 && (
        <p className="gen-success">
          {erfolg} {erfolg === 1 ? 'Satz' : 'Sätze'} im Trainer! ✓
        </p>
      )}
      {fehler && <p className="error">{fehler}</p>}

      {/* Die Übersicht: alles ankreuzbar, dann übernehmen */}
      {liste && (
        <div className="gen-list">
          {fertig.hinweis && (
            <div className="gen-begruendung">
              <span className="gen-begruendung-marke">Worauf du achten kannst</span>
              <p>{fertig.hinweis}</p>
            </div>
          )}
          <p className="gen-hint">
            Sätze zu „{fertig.thema}“{zeitformName ? ` · ${zeitformName}` : ''} – wähle
            aus, was in den Trainer soll:
          </p>
          {liste.map((s, i) => (
            <label key={i} className="gen-item satz-item">
              <input
                type="checkbox"
                checked={s.checked}
                onChange={() =>
                  setListe((l) => l.map((v, j) => (j === i ? { ...v, checked: !v.checked } : v)))
                }
              />
              <span className="satz-es">{s.satz}</span>
              <span className="satz-de">{s.uebersetzung}</span>
              {s.schluessel && <span className="satz-schluessel">{s.schluessel}</span>}
            </label>
          ))}
          <div className="gen-actions">
            <button onClick={uebernehmen} disabled={!liste.some((s) => s.checked)}>
              {liste.filter((s) => s.checked).length} Sätze übernehmen
            </button>
            <button className="btn-plain" onClick={() => setListe(null)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
