import { useState, useEffect, useRef } from 'react'
import { API_URL } from './api.js'

// Ein paar Themen zum Antippen, damit man nicht vor einem leeren Feld sitzt
// Die Längen zur Auswahl
const LAENGEN = [
  { wert: '', label: 'Egal' },
  { wert: 'kurz', label: '5–10 Min' },
  { wert: 'mittel', label: '10–15 Min' },
  { wert: 'lang', label: 'Über 15 Min' },
]

// Sprachniveaus. Die Beschreibung sagt, was einen erwartet –
// YouTube kennt keine Niveaus, wir steuern über Suchwörter und Länge.
const NIVEAUS = [
  { wert: '', label: 'Egal', hilfe: 'Alles gemischt' },
  { wert: 'A1', label: 'A1', hilfe: 'Kurze Erklärvideos, einfache Sprache' },
  { wert: 'A2', label: 'A2', hilfe: 'Einfach erklärt, überschaubare Länge' },
  { wert: 'B1', label: 'B1', hilfe: 'Normale Erklärvideos' },
  { wert: 'B2', label: 'B2', hilfe: 'Alltagssprache, längere Beiträge' },
  { wert: 'C1', label: 'C1', hilfe: 'Podcasts und Interviews' },
  { wert: 'C2', label: 'C2', hilfe: 'Debatten und Analysen, volles Tempo' },
]

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
export default function VideoSuche({ onSchliessen, onVideoWaehlen, startBegriff = '' }) {
  const [begriff, setBegriff] = useState(startBegriff)
  const [laenge, setLaenge] = useState('')
  const [niveau, setNiveau] = useState('')
  const [treffer, setTreffer] = useState(null)
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')
  const feldRef = useRef(null)

  // Kam der Nutzer ueber das Feld in der Mediathek, ist die Frage
  // schon gestellt – dann sofort suchen statt ihn erneut tippen zu
  // lassen. Nur beim ersten Zeichnen, sonst laeuft die Suche in einer
  // Schleife.
  const gestartet = useRef(false)
  useEffect(() => {
    if (startBegriff && !gestartet.current) {
      gestartet.current = true
      suchen(startBegriff)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startBegriff])

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
      const adresse =
        API_URL +
        '/api/search?q=' + encodeURIComponent(frage) +
        (laenge ? '&laenge=' + laenge : '') +
        (niveau ? '&niveau=' + niveau : '')
      const res = await fetch(adresse)
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
            placeholder="z.B. gesunde Ernährung, Schlaf …"
          />
          <button type="submit" className="btn" disabled={laedt || !begriff.trim()}>
            {laedt ? 'Sucht …' : 'Suchen'}
          </button>
        </form>

        {/* Länge und Niveau vor der Suche wählen */}
        <div className="suche-filter">
          <div className="filter-gruppe">
            <span className="filter-label">Länge</span>
            <div className="filter-knoepfe">
              {LAENGEN.map((l) => (
                <button
                  key={l.wert}
                  className={'filter-knopf' + (laenge === l.wert ? ' filter-an' : '')}
                  onClick={() => setLaenge(l.wert)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-gruppe">
            <span className="filter-label">
              Niveau
              {niveau && (
                <em className="filter-hilfe">
                  {NIVEAUS.find((n) => n.wert === niveau)?.hilfe}
                </em>
              )}
            </span>
            <div className="filter-knoepfe">
              {NIVEAUS.map((n) => (
                <button
                  key={n.wert}
                  className={'filter-knopf' + (niveau === n.wert ? ' filter-an' : '')}
                  onClick={() => setNiveau(n.wert)}
                  title={n.hilfe}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>
        </div>

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
