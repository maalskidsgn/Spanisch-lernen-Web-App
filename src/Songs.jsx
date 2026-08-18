import { useState, useEffect } from 'react'
import { API_URL } from './api.js'
import { db, holeVideoMitTranskript } from './supabase.js'
import { songAlsPdf } from './songPdf.js'

// Ein paar Einstiegspunkte, damit man nicht vor einem leeren Feld sitzt
const STILE = [
  'Latin Pop',
  'Reggaetón',
  'Bachata',
  'Rock en español',
  'Balada romántica',
  'Flamenco',
]

/**
 * Songs: Musik mit mitlaufendem Text.
 *
 * Technisch sind Songs dasselbe wie Videos – der Songtext steckt in
 * den Untertiteln. Sie liegen deshalb in derselben Tabelle, nur unter
 * der Kategorie "musik". Wer einen Song gespeichert hat, kann den
 * Text als PDF zum Mitlesen ausdrucken.
 */
export default function Songs({ onOpenVideo, vocab = {} }) {
  const [songs, setSongs] = useState(null)
  const [suche, setSuche] = useState('')
  const [treffer, setTreffer] = useState(null)
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')
  const [pdfLaeuft, setPdfLaeuft] = useState(null)

  // Die gespeicherten Songs holen
  async function ladeSongs() {
    const { data, error } = await db
      .from('videos')
      .select('id,youtube_id,titel,kanal,dauer_sek,thumbnail')
      .eq('kategorie', 'musik')
      .eq('aktiv', true)
      .order('erstellt_am', { ascending: false })

    if (error) return setFehler(error.message)
    setSongs(data)
  }

  useEffect(() => {
    ladeSongs()
  }, [])

  /** Sucht auf YouTube – aber ausdrücklich nach Musik. */
  async function songSuchen(text) {
    const frage = (text ?? suche).trim()
    if (!frage) return

    setSuche(frage)
    setLaedt(true)
    setFehler('')
    setTreffer(null)
    try {
      const res = await fetch(
        API_URL + '/api/search?nurMusik=1&q=' + encodeURIComponent(frage)
      )
      const daten = await res.json()
      if (!res.ok) throw new Error(daten.error || 'Suche fehlgeschlagen')
      setTreffer((daten.results ?? []).slice(0, 6))
    } catch (f) {
      setFehler(f.message)
    } finally {
      setLaedt(false)
    }
  }

  /** Holt den Songtext und legt ihn als PDF zum Sichern bereit. */
  async function pdfErzeugen(song) {
    setPdfLaeuft(song.youtube_id)
    try {
      const daten = await holeVideoMitTranskript(song.youtube_id)
      if (!daten?.transkript?.length) {
        throw new Error('Für diesen Song ist kein Text gespeichert.')
      }
      songAlsPdf({
        titel: song.titel,
        kanal: song.kanal,
        zeilen: daten.transkript.map((z) => z.text),
        deutsch: daten.transkript_de ?? null,
      })
    } catch (f) {
      setFehler(f.message)
    } finally {
      setPdfLaeuft(null)
    }
  }

  function dauerText(sekunden) {
    if (!sekunden) return ''
    return `${Math.floor(sekunden / 60)}:${String(Math.round(sekunden % 60)).padStart(2, '0')}`
  }

  return (
    <>
      {/* ============ 1. SONG SUCHEN ============ */}
      <section className="bereich">
        <div className="bereich-kopf">
          <h2>Spanische Songs finden</h2>
          <p>
            Musik ist der einfachste Weg, ein Ohr für die Sprache zu bekommen –
            der Text läuft mit, unbekannte Wörter tippst du an.
          </p>
        </div>

        <form
          className="wort-form"
          onSubmit={(e) => {
            e.preventDefault()
            songSuchen()
          }}
        >
          <input
            type="text"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Künstler, Songtitel oder Stilrichtung…"
            disabled={laedt}
          />
          <div className="wort-vorschlaege">
            {STILE.map((s) => (
              <button
                key={s}
                type="button"
                className="vorschlag-chip"
                onClick={() => songSuchen(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <button type="submit" className="btn wort-los" disabled={laedt || !suche.trim()}>
            {laedt ? 'Sucht …' : 'Songs suchen'}
          </button>
        </form>

        {fehler && <p className="error">{fehler}</p>}

        {treffer?.length === 0 && (
          <p className="empty-hint">Nichts gefunden. Versuch einen anderen Namen.</p>
        )}

        {treffer?.length > 0 && (
          <div className="song-treffer">
            {treffer.map((s) => (
              <button
                key={s.videoId}
                className="treffer"
                onClick={() => onOpenVideo(s.videoId)}
              >
                <img src={s.thumbnail} alt="" />
                <span className="treffer-text">
                  <span className="treffer-titel">{s.title}</span>
                  <span className="treffer-meta">
                    {s.channel}
                    {s.duration ? ' · ' + dauerText(s.duration) : ''}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ============ 2. DEINE SONGS ============ */}
      <section className="bereich">
        <div className="bereich-kopf">
          <h2>Deine Songs</h2>
          <p>
            {songs?.length
              ? `${songs.length} gespeichert – zum Anhören antippen oder den Text als PDF sichern.`
              : 'Noch keine Songs. Such dir oben einen aus und öffne ihn.'}
          </p>
        </div>

        {songs?.length > 0 && (
          <div className="song-liste">
            {songs.map((s) => (
              <div key={s.id} className="song-zeile">
                <button className="song-oeffnen" onClick={() => onOpenVideo(s.youtube_id)}>
                  <img src={s.thumbnail} alt="" />
                  <span className="song-text">
                    <span className="song-titel">{s.titel}</span>
                    <span className="song-meta">
                      {s.kanal}
                      {s.dauer_sek ? ' · ' + dauerText(s.dauer_sek) : ''}
                    </span>
                  </span>
                </button>
                <button
                  className="song-pdf"
                  onClick={() => pdfErzeugen(s)}
                  disabled={pdfLaeuft === s.youtube_id}
                  title="Songtext als PDF sichern"
                >
                  {pdfLaeuft === s.youtube_id ? 'Erstellt …' : 'PDF'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============ 3. SPOTIFY ============ */}
      <section className="bereich">
        <div className="bereich-kopf">
          <h2>Spotify verbinden</h2>
          <p>
            Wenn du dein Spotify-Konto verbindest, schlagen wir dir spanische
            Musik vor, die zu deinem Geschmack passt.
          </p>
        </div>
        <div className="spotify-teaser">
          <span className="spotify-marke">In Vorbereitung</span>
          <p>
            Die Verbindung wird gerade eingerichtet. Bis dahin findest du über
            die Suche oben alles, was du zum Mitsingen brauchst.
          </p>
        </div>
      </section>
    </>
  )
}
