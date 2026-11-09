import GratisHinweis from './GratisHinweis.jsx'
import { XP } from './gamification.js'
import { API_URL, istApp } from './api.js'
import PremiumWerbung from './PremiumWerbung.jsx'
import { useState, useEffect } from 'react'
import { newEntry } from './srs.js'
import { LISTEN_PRO_TAG, verbleibend, zaehleNutzung, naechsteAuffuellung, loginKopf, kontingentLeer } from './limits.js'
import { usePremium } from './premium.js'

import { useTexte } from './sprache.js'
// Macht aus einem Wort eine saubere Kleinschreibung ohne Satzzeichen
function cleanWord(word) {
  return word.toLowerCase().replace(/[^a-záéíóúüñ]/gi, '')
}

// Der Vokabelgenerator: schickt das Transkript an den Server, bekommt
// Vokabel-Vorschläge zurück und lässt dich auswählen, welche in den Trainer sollen.
export default function VocabGenerator({ video, vocab, setVocab, addXp }) {
  const t = useTexte()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState(null) // [{wort, uebersetzung, beispiel, checked}]
  const [added, setAdded] = useState(false)
  const { premium, laedt: premiumLaedt } = usePremium()
  const [uebrig, setUebrig] = useState(() => verbleibend(premium))

  // Der Premium-Status kommt erst nach einer kurzen Abfrage an –
  // sobald er da ist, den Rest neu berechnen (Premium = unbegrenzt).
  useEffect(() => {
    // Live: jede Buchung und der Abgleich mit dem Server (holeKontingent)
    const neu = () => setUebrig(verbleibend(premium))
    neu()
    window.addEventListener('kontingent', neu)
    return () => window.removeEventListener('kontingent', neu)
  }, [premium]) // freie Generierungen

  async function generate() {
    if (uebrig <= 0) return
    setLoading(true)
    setError('')
    setAdded(false)
    try {
      const res = await fetch(API_URL + '/api/generate-vocab', {
        method: 'POST',
        headers: await loginKopf({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          text: video.lines.map((l) => l.text).join('\n'),
          exclude: Object.keys(vocab),
        }),
      })
      const data = await res.json()
      if (res.status === 402) kontingentLeer()
      if (!res.ok) throw new Error(data.error)
      setSuggestions(data.vokabeln.map((v) => ({ ...v, checked: true })))
      zaehleNutzung() // eine Erstellung aus dem gemeinsamen Wochentopf
      setUebrig(verbleibend(premium))
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
    const neu = new Set(suggestions.filter((s) => s.checked).map((s) => cleanWord(s.wort)).filter((w) => w && !vocab[w]))
    if (neu.size) addXp?.(XP.LISTE_ERSTELLT, neu.size === 1 ? t('vg.wortHinzugefuegt') : t('vg.woerterHinzugefuegt', { zahl: neu.size }))
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
    // Solange der Premium-Stand noch geladen wird: nichts zeigen statt Werbung
    if (premiumLaedt && !premium) return null
    return (
      <div className="vocab-gen">
        <PremiumWerbung was={t('vg9.wasVokabeln')} />
      </div>
    )
  }

  return (
    <div className="vocab-gen">
      {!suggestions && (
        <>
          <GratisHinweis art="ki" />
          <button onClick={generate} disabled={loading}>
            {loading ? t('vg.analysiere') : t('vg.generieren')}
          </button>
          {/* Im Web zeigt GratisHinweis den Stand – hier nur in der App */}
          {istApp && !premium && (
            <p className="free-hint">
              {t('vg.nochHeute', { uebrig, gesamt: LISTEN_PRO_TAG })}
            </p>
          )}
        </>
      )}
      {added && <p className="gen-success">{t('vg.uebernommen')}</p>}
      {error && <p className="error">{error}</p>}

      {suggestions && (
        <div className="gen-list">
          <p className="gen-hint">
            {t('vg.waehleAus')}
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
              {t('app.abbrechen')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
