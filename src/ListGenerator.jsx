import { API_URL } from './api.js'
import { useState } from 'react'
import { newEntry } from './srs.js'
import { FREE_LIMIT, verbleibend, zaehleNutzung } from './limits.js'

// Vokabellisten mit KI erstellen: Thema eingeben (z.B. "Restaurant" oder
// "Fußball"), Claude schlägt 12 passende Vokabeln vor, du wählst aus.
export default function ListGenerator({ vocab, setVocab }) {
  const [thema, setThema] = useState('')
  const [fertigThema, setFertigThema] = useState('') // Thema der fertigen Liste
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState('')
  const [liste, setListe] = useState(null) // Vorschläge mit Häkchen
  const [erfolg, setErfolg] = useState(false)
  const [uebrig, setUebrig] = useState(() => verbleibend('listeGen')) // freie Generierungen

  async function generieren(e) {
    e.preventDefault()
    if (!thema.trim() || uebrig <= 0) return
    setLaden(true)
    setFehler('')
    setErfolg(false)
    try {
      const res = await fetch(API_URL + '/api/vokabelliste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thema: thema.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setListe(data.vokabeln.map((v) => ({ ...v, checked: true })))
      setFertigThema(thema.trim())
      zaehleNutzung('listeGen') // eine kostenlose Generierung verbrauchen
      setUebrig(verbleibend('listeGen'))
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
            Deine {FREE_LIMIT} kostenlosen Listen sind aufgebraucht – unbegrenzte
            KI-Vokabellisten kommen mit dem Premium-Abo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="list-gen">
      <form className="url-form" onSubmit={generieren}>
        <input
          type="text"
          value={thema}
          onChange={(e) => setThema(e.target.value)}
          placeholder="Thema, z.B. 'Restaurant' oder 'Fußball'"
          required
        />
        <button type="submit" disabled={laden}>
          {laden ? 'Claude denkt…' : '✨ Erstellen'}
        </button>
      </form>
      <p className="free-hint">
        Noch {uebrig} von {FREE_LIMIT} kostenlos
      </p>

      {erfolg && <p className="gen-success">Liste ist im Trainer! ✓</p>}

      {fehler === 'premium' ? (
        <div className="plan-card plan-premium premium-teaser">
          <div className="plan-name">
            Premium-Funktion <span className="plan-badge badge-soon">Bald verfügbar</span>
          </div>
          <p className="row-hint">
            Themen-Vokabellisten erstellt die Claude-KI – diese Funktion wird
            mit dem Premium-Abo freigeschaltet. (Für Entwickler: einen
            ANTHROPIC_API_KEY am Server hinterlegen, dann läuft es sofort.)
          </p>
        </div>
      ) : (
        fehler && <p className="error">{fehler}</p>
      )}

      {liste && (
        <div className="gen-list">
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
