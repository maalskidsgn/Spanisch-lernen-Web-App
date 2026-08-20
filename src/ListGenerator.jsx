import { API_URL } from './api.js'
import { useState, useEffect } from 'react'
import { newEntry } from './srs.js'
import { LISTEN_PRO_TAG, verbleibend, zaehleNutzung, naechsteAuffuellung } from './limits.js'
import { usePremium } from './premium.js'
import { IconFunken } from './icons.jsx'

// Vokabellisten mit KI erstellen: Thema eingeben (z.B. "Restaurant" oder
// "Fußball"), die KI schlägt 12 passende Vokabeln vor, du wählst aus.
export default function ListGenerator({ vocab, setVocab }) {
  const [thema, setThema] = useState('')
  const [fertigThema, setFertigThema] = useState('') // Thema der fertigen Liste
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState('')
  const [liste, setListe] = useState(null) // Vorschläge mit Häkchen
  const [erfolg, setErfolg] = useState(false)
  const { premium } = usePremium()
  const [uebrig, setUebrig] = useState(() => verbleibend())
  // Unter fuenf gesammelten Woertern kann die KI nichts erkennen –
  // dann bleibt der KI-Gen-Knopf gesperrt.
  const zuWenige = Object.keys(vocab).length < 5

  // Der Premium-Status kommt erst nach einer kurzen Abfrage an –
  // sobald er da ist, den Rest neu berechnen (Premium = unbegrenzt).
  useEffect(() => {
    setUebrig(verbleibend(premium))
  }, [premium]) // freie Generierungen
  const [begruendung, setBegruendung] = useState('') // warum die KI diese Wörter wählte
  const [infoOffen, setInfoOffen] = useState(false) // Erklärung der Automatik

  /**
   * Holt eine Liste. Ohne Thema übernimmt die KI die Auswahl und
   * richtet sich nach dem, was schon im Trainer liegt.
   */
  async function generieren(e, automatisch = false) {
    // Das Ereignis ist freiwillig: Der runde Pfeil im Feld hat
    // preventDefault() schon selbst erledigt.
    e?.preventDefault()
    const gefragt = thema.trim()
    if ((!automatisch && !gefragt) || uebrig <= 0) return
    setLaden(true)
    setFehler('')
    setErfolg(false)
    setBegruendung('')
    try {
      const res = await fetch(API_URL + '/api/vokabelliste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Die schon gesammelten Wörter mitschicken: so kommen keine
        // Dopplungen zurück und die Liste passt zum eigenen Stand.
        body: JSON.stringify({
          thema: automatisch ? '' : gefragt,
          bekannt: Object.keys(vocab),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setListe(data.vokabeln.map((v) => ({ ...v, checked: true })))
      setBegruendung(data.begruendung || '')
      setFertigThema(data.thema || gefragt)
      zaehleNutzung() // eine Generierung aus dem gemeinsamen Tageskontingent
      setUebrig(verbleibend(premium))
    } catch (err) {
      setFehler(err.message)
    } finally {
      setLaden(false)
    }
  }

  // Ausgewählte Vokabeln in den Trainer übernehmen
  function uebernehmen() {
    setVocab((v) => {
      const copy = { ...v }
      for (const s of liste) {
        const key = s.wort.toLowerCase()
        if (!s.checked || copy[key]) continue
        copy[key] = {
          ...newEntry(s.uebersetzung, 'Liste: ' + fertigThema),
          status: 'lernen',
          beispiel: s.beispiel,
        }
      }
      return copy
    })
    setErfolg(true)
    setListe(null)
    setThema('')
  }

  // Kostenloses Kontingent aufgebraucht: Premium-Hinweis statt Formular
  if (uebrig <= 0 && !liste) {
    return (
      <div className="list-gen">
        <div className="plan-card plan-premium premium-teaser">
          <div className="plan-name">
            Premium <span className="plan-badge badge-soon">Bald verfügbar</span>
          </div>
          <p className="row-hint">
            Deine {LISTEN_PRO_TAG} kostenlosen Listen sind aufgebraucht – unbegrenzte
            KI-Vokabellisten kommen mit dem Premium-Abo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="list-gen">
      {/* Gleicher Aufbau wie die anderen Bereiche: Überschrift,
          ein Satz zur Einordnung, dann der Inhalt */}
      <div className="gen-kopf">
        <span className="gen-symbol" aria-hidden="true">
          <IconFunken groesse={24} />
        </span>
        <div className="gen-text">
          <h2>KI-Listengenerator</h2>
          <p>Erstelle neue Wortlisten zu jedem Thema.</p>
        </div>
        {/* Der Zaehler steht nur da, wenn er etwas zu sagen hat.
            Bei vollem Kontingent ist er nur Zierde – kurz vor dem
            Ende ist er die einzige Vorwarnung. */}
        {uebrig <= 2 && (
          <span className="rest-zaehler" title="Kostenlose Listen diesen Monat">
            {uebrig}/{LISTEN_PRO_TAG}
          </span>
        )}
      </div>

      <form className="wort-form" onSubmit={generieren}>
        <div className="gen-feld">
          <input
            type="text"
            value={thema}
            onChange={(e) => setThema(e.target.value)}
            placeholder="z. B. Restaurant, Reisen, Arztbesuch …"
            disabled={laden}
            required
          />
          <button
            type="submit"
            className="gen-pfeil"
            disabled={laden || !thema.trim()}
            aria-label="Liste erstellen"
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

        <div className="wort-vorschlaege">
          {['Restaurant', 'Reisen', 'Arbeit', 'Einkaufen'].map((v) => (
            <button
              key={v}
              type="button"
              className="vorschlag-chip"
              onClick={() => setThema(v)}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="gen-knoepfe">
          <button type="submit" className="btn gen-los" disabled={laden || !thema.trim()}>
            {laden ? (
              <>Stellt zusammen<span className="studio-punkte" /></>
            ) : (
              'Liste erstellen'
            )}
          </button>

          {/* Derselbe Aufruf, nur ohne Thema: Dann sucht die KI
              selbst aus, was zum bisherigen Stand passt. */}
          <button
            type="button"
            className="btn-outline gen-ki"
            onClick={(e) => generieren(e, true)}
            disabled={laden || zuWenige}
            title={zuWenige ? 'Dafür brauchst du erst 5 gesammelte Wörter' : undefined}
          >
            KI-Gen
          </button>

          <button
            type="button"
            className="gen-info"
            onClick={() => setInfoOffen(!infoOffen)}
            aria-expanded={infoOffen}
            title="Was ist der Unterschied?"
          >
            {infoOffen ? '×' : '?'}
          </button>
        </div>

        {infoOffen && (
          <div className="gen-erklaerung">
            <p>
              <b>Liste erstellen</b> nimmt dein Thema. Du sagst „Restaurant“,
              und die KI stellt zwölf Wörter dazu zusammen – ohne die, die du
              schon hast.
            </p>
            <p>
              <b>KI-Gen</b> braucht kein Thema. Die KI sieht sich deine
              gesammelten Wörter an, erkennt, worum es dir bisher ging, und
              schlägt vor, was als Nächstes fehlt – etwa passende Verben zu
              Wörtern, die du schon kennst. Warum sie genau diese Auswahl
              getroffen hat, schreibt sie über die Liste.
            </p>
            <p className="gen-klein">
              Für KI-Gen brauchst du mindestens 5 gesammelte Wörter. Du hast{' '}
              {Object.keys(vocab).length}.
            </p>
          </div>
        )}
      </form>


      {erfolg && <p className="gen-success">Liste ist im Trainer! ✓</p>}

      {fehler === 'premium' ? (
        <div className="plan-card plan-premium premium-teaser">
          <div className="plan-name">
            Premium-Funktion <span className="plan-badge badge-soon">Bald verfügbar</span>
          </div>
          <p className="row-hint">
            Themen-Vokabellisten erstellt die KI – diese Funktion wird
            mit dem Premium-Abo freigeschaltet.
          </p>
        </div>
      ) : (
        fehler && <p className="error">{fehler}</p>
      )}

      {liste && (
        <div className="gen-list">
          {begruendung && (
            <div className="gen-begruendung">
              <span className="gen-begruendung-marke">Warum diese Wörter?</span>
              <p>{begruendung}</p>
            </div>
          )}
          <p className="gen-hint">
            Deine Liste zu „{fertigThema}“ – wähle aus, was in den Trainer soll:
          </p>
          {liste.map((s, i) => (
            <label key={i} className="gen-item">
              <input
                type="checkbox"
                checked={s.checked}
                onChange={() =>
                  setListe((l) =>
                    l.map((v, j) => (j === i ? { ...v, checked: !v.checked } : v))
                  )
                }
              />
              <span className="gen-word">{s.wort}</span>
              <span className="gen-translation">{s.uebersetzung}</span>
              {s.beispiel && <span className="gen-example">„{s.beispiel}“</span>}
            </label>
          ))}
          <div className="gen-actions">
            <button onClick={uebernehmen}>
              {liste.filter((s) => s.checked).length} Vokabeln übernehmen
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
