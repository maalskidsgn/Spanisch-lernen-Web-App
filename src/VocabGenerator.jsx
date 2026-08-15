import { API_URL } from './api.js'
import { useState } from 'react'
import { newEntry } from './srs.js'
import { FREE_LIMIT, verbleibend, zaehleNutzung } from './limits.js'

// Macht aus einem Wort eine saubere Kleinschreibung ohne Satzzeichen
function cleanWord(word) {
  return word.toLowerCase().replace(/[^a-záéíóúüñ]/gi, '')
}

// Der Vokabelgenerator: schickt das Transkript an den Server, bekommt
// Vokabel-Vorschläge zurück und lässt dich auswählen, welche in den Trainer sollen.
export default function VocabGenerator({ video, vocab, setVocab }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState(null) // [{wort, uebersetzung, beispiel, checked}]
  const [added, setAdded] = useState(false)
  const [uebrig, setUebrig] = useState(() => verbleibend('videoGen')) // freie Generierungen

  async function generate() {
    if (uebrig <= 0) return
    setLoading(true)
    setError('')
    setAdded(false)
    try {
      const res = await fetch(API_URL + '/api/generate-vocab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: video.lines.map((l) => l.text).join('\n'),
          exclude: Object.keys(vocab),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuggestions(data.vokabeln.map((v) => ({ ...v, checked: true })))
      zaehleNutzung('videoGen') // eine kostenlose Generierung verbrauchen
      setUebrig(verbleibend('videoGen'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function toggle(i) {
    setSuggestions((s) =>
      s.map((v, j) => (j === i ? { ...v, checked: !v.checked } : v))
    )
  }

  // Ausgewählte Vokabeln in den Trainer übernehmen
  function addToTrainer() {
    setVocab((v) => {
      const copy = { ...v }
      for (const s of suggestions) {
        const word = cleanWord(s.wort)
        if (!s.checked || !word || copy[word]) continue
        copy[word] = { ...newEntry(s.uebersetzung, video.title), beispiel: s.beispiel }
      }
      return copy
    })
    setAdded(true)
    setSuggestions(null)
  }

  // Kostenloses Kontingent aufgebraucht: Premium-Hinweis statt Knopf
  if (uebrig <= 0 && !suggestions) {
    return (
      <div className="vocab-gen">
        <div className="plan-card plan-premium premium-teaser">
          <div className="plan-name">
            Premium <span className="plan-badge badge-soon">Bald verfügbar</span>
          </div>
          <p className="row-hint">
            Deine {FREE_LIMIT} kostenlosen Generierungen sind aufgebraucht –
            unbegrenzte Vokabel-Generierung kommt mit dem Premium-Abo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="vocab-gen">
      {!suggestions && (
        <>
          <button onClick={generate} disabled={loading}>
            {loading ? 'Analysiere Text…' : '✨ Vokabeln generieren'}
          </button>
          <p className="free-hint">
            Noch {uebrig} von {FREE_LIMIT} kostenlos
          </p>
        </>
      )}
      {added && <p className="gen-success">Vokabeln wurden in den Trainer übernommen! ✓</p>}
      {error && <p className="error">{error}</p>}

      {suggestions && (
        <div className="gen-list">
          <p className="gen-hint">
            Wähle aus, welche Vokabeln in deinen Trainer sollen:
          </p>
          {suggestions.map((s, i) => (
            <label key={i} className="gen-item">
              <input
                type="checkbox"
                checked={s.checked}
                onChange={() => toggle(i)}
              />
              <span className="gen-word">{s.wort}</span>
              <span className="gen-translation">{s.uebersetzung}</span>
              {s.beispiel && <span className="gen-example">"{s.beispiel}"</span>}
            </label>
          ))}
          <div className="gen-actions">
            <button onClick={addToTrainer}>
              {suggestions.filter((s) => s.checked).length} Vokabeln übernehmen
            </button>
            <button className="btn-plain" onClick={() => setSuggestions(null)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
