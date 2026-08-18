import { useState, useEffect, useRef } from 'react'
import { API_URL } from './api.js'

// Ein paar Themen zum Antippen, damit man nicht vor einem leeren Feld sitzt
const IDEEN = [
  'Gesunde Ernährung',
  'Schlaf verbessern',
  'Stoizismus',
  'Sport für Anfänger',
  'Produktivität',
  'Reisen in Spanien',
]

/**
 * Video-Suche als Overlay.
 *
 * Man gibt ein Thema auf Deutsch ein, der Server übersetzt es ins
 * Spanische und sucht damit auf YouTube. Das Suchen selbst kostet
 * nichts – erst das Öffnen eines Treffers holt das Transkript.
 */
export default function VideoSuche({ onSchliessen, onVideoWaehlen }) {
  const [begriff, setBegriff] = useState('')
  const [treffer, setTreffer] = useState(null)
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')
  const feldRef = useRef(null)

  // Beim Öffnen direkt ins Suchfeld springen, Escape schließt
  useEffect(() => {
    feldRef.current?.focus()
    const beiTaste = (e) => e.key === 'Escape' && onSchliessen()
    window.addEventListener('keydown', beiTaste)
    return () => window.removeEventListener('keydown', beiTaste)
  }, [onSchliessen])

  async function suchen(text) {
    const frage = (text ?? begriff).trim()
    if (!frage) return

    setBegriff(frage)
    setLaedt(true)
    setFehler('')
    setTreffer(null)
    try {
      const res = await fetch(API_URL + '/api/search?q=' + encodeURIComponent(frage))
      const daten = await res.json()
      if (!res.ok) throw new Error(daten.error || 'Suche fehlgeschlagen')
      setTreffer((daten.results ?? []).slice(0, 6))
    } catch (f) {
      setFehler(f.message)
    } finally {
      setLaedt(false)
    }
  }

  function dauerText(sekunden) {
    if (!sekunden) return ''
    const min = Math.floor(sekunden / 60)
    const sek = Math.round(sekunden % 60)
    return `${min}:${String(sek).padStart(2, '0')}`
  }

  return (
    <div className="suche-hintergrund" onClick={onSchliessen}>
      <div className="suche-fenster" onClick={(e) => e.stopPropagation()}>
        <div className="suche-kopf">
          <div>
            <b>Video finden</b>
            <span>Thema auf Deutsch eingeben – wir suchen spanische Videos dazu</span>
          </div>
          <button className="suche-schliessen" onClick={onSchliessen} aria-label="Schließen">
            ×
          </button>
        </div>

        <form
          className="suche-form"
          onSubmit={(e) => {
            e.preventDefault()
            suchen()
          }}
        >
          <input
            ref={feldRef}
            type="text"
            value={begriff}
            onChange={(e) => setBegriff(e.target.value)}
            placeholder="z.B. gesunde Ernährung, Schlaf, Motivation…"
          />
          <button type="submit" className="btn" disabled={laedt || !begriff.trim()}>
            {laedt ? 'Sucht …' : 'Suchen'}
          </button>
        </form>

        {/* Vorschläge, solange noch nichts gesucht wurde */}
        {!treffer && !laedt && !fehler && (
          <div className="suche-ideen">
            {IDEEN.map((idee) => (
              <button key={idee} className="chip" onClick={() => suchen(idee)}>
                {idee}
              </button>
            ))}
          </div>
        )}

        {laedt && <p className="suche-hinweis">Suche spanische Videos zu „{begriff}“ …</p>}
        {fehler && <p className="error">{fehler}</p>}
        {treffer?.length === 0 && (
          <p className="suche-hinweis">
            Nichts gefunden. Versuch es mit einem anderen Wort.
          </p>
        )}

        {treffer?.length > 0 && (
          <>
            <p className="suche-hinweis">
              {treffer.length} Videos gefunden – tippe eins an, um es zu öffnen.
            </p>
            <div className="suche-treffer">
              {treffer.map((v) => (
                <button
                  key={v.videoId}
                  className="treffer"
                  onClick={() => {
                    onVideoWaehlen(v.videoId)
                    onSchliessen()
                  }}
                >
                  <img src={v.thumbnail} alt="" />
                  <span className="treffer-text">
                    <span className="treffer-titel">{v.title}</span>
                    <span className="treffer-meta">
                      {v.channel}
                      {v.duration ? ' · ' + dauerText(v.duration) : ''}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
