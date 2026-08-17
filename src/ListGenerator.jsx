import { API_URL } from './api.js'
import { useState } from 'react'
import { newEntry } from './srs.js'
import { FREE_LIMIT, verbleibend, zaehleNutzung } from './limits.js'

// Vokabellisten mit KI erstellen: Thema eingeben (z.B. "Restaurant" oder
// "Fußball"), die KI schlägt 12 passende Vokabeln vor, du wählst aus.
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
        // Die schon gesammelten Wörter mitschicken: so kommen keine
        // Dopplungen zurück und die Liste passt zum eigenen Stand.
        body: JSON.stringify({
          thema: thema.trim(),
          bekannt: Object.keys(vocab),
        }),
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
      {/* Die Mini-App: Thema rein, fertige Liste raus */}
      <div className="studio">
        <div className="studio-kopf">
          <span className="studio-icon">🪄</span>
          <div className="studio-titel">
            <b>KI-Vokabelliste</b>
            <span>Dein Thema → 12 Wörter mit Beispielsätzen</span>
          </div>
          <span className="studio-zaehler" title="Kostenlose Generierungen diesen Monat">
            {uebrig}/{FREE_LIMIT}
          </span>
        </div>

        <form className="studio-form" onSubmit={generieren}>
          <label className="studio-feld">
            <span>Worüber möchtest du Vokabeln lernen?</span>
            <input
              type="text"
              value={thema}
              onChange={(e) => setThema(e.target.value)}
              placeholder="z.B. Restaurant, Fußball, Arztbesuch…"
              disabled={laden}
              required
            />
          </label>

          <div className="studio-vorschlaege">
            {['🍽 Restaurant', '✈️ Reisen', '💼 Arbeit', '🛒 Einkaufen'].map((v) => (
              <button
                key={v}
                type="button"
                className="chip"
                onClick={() => setThema(v.slice(v.indexOf(' ') + 1))}
              >
                {v}
              </button>
            ))}
          </div>

          <button type="submit" className="btn studio-los" disabled={laden}>
            {laden ? (
              <>Stellt deine Liste zusammen<span className="studio-punkte" /></>
            ) : (
              '✨ Liste erstellen'
            )}
          </button>
        </form>
      </div>

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
