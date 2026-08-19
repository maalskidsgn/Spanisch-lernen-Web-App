import { useState, useEffect } from 'react'
import { API_URL } from './api.js'
import { db, holeVideoMitTranskript } from './supabase.js'
import { songAlsPdf } from './songPdf.js'
import {
  spotifyBereit,
  starteAnmeldung,
  schliesseAnmeldungAb,
  zugang,
  istVerbunden,
  trenneSpotify,
  sammleKuenstler,
  gemerkteInterpreten,
  merkeInterpreten,
} from './spotify.js'

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

  // --- Spotify ---
  // istVerbunden() prueft, ob ein Erneuerungs-Schluessel da ist –
  // nicht, ob der Zugang gerade gueltig ist. Sonst waere die
  // Verbindung nach einer Stunde scheinbar weg.
  const [verbunden, setVerbunden] = useState(istVerbunden)
  const [offenerInterpret, setOffenerInterpret] = useState(null)
  const [interpreten, setInterpreten] = useState(gemerkteInterpreten)
  const [analyse, setAnalyse] = useState('') // Text während der Prüfung
  const [spotifyFehler, setSpotifyFehler] = useState('')

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

  // Interpreten aus alten Auswertungen haben noch keine Songs.
  // Einmal still neu auswerten, statt den Nutzer mit "keine Songs
  // gefunden" stehenzulassen.
  useEffect(() => {
    if (!verbunden || interpreten.length === 0) return
    if (interpreten.some((k) => k.songs?.length)) return
    interpretenPruefen()
    // bewusst nur einmal beim Laden
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Liest die Musik des Nutzers aus und lässt die KI heraussuchen,
   * welche seiner Künstler auf Spanisch singen.
   */
  async function interpretenPruefen() {
    const token = await zugang()
    if (!token) return setSpotifyFehler('Bitte zuerst mit Spotify verbinden.')

    setSpotifyFehler('')
    try {
      setAnalyse('Deine Musik wird gelesen …')
      const kuenstler = await sammleKuenstler(token)

      setAnalyse(`${kuenstler.length} Künstler gefunden – die KI prüft die Sprache …`)
      const res = await fetch(API_URL + '/api/spotify/interpreten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kuenstler }),
      })
      const daten = await res.json()
      if (!res.ok) throw new Error(daten.error || 'Auswertung fehlgeschlagen')

      // Die Songs kommen schon mit: aus deiner Bibliothek, wo
      // vorhanden, sonst von der KI ergaenzt.
      setInterpreten(daten.interpreten)
      merkeInterpreten(daten.interpreten)
    } catch (f) {
      setSpotifyFehler(f.message)
    } finally {
      setAnalyse('')
    }
  }

  function spotifyTrennen() {
    trenneSpotify()
    setVerbunden(false)
    setInterpreten([])
  }

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
                onClick={() => onOpenVideo(s.videoId, 'musik')}
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
                <button className="song-oeffnen" onClick={() => onOpenVideo(s.youtube_id, 'musik')}>
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
          <h2>Deine spanischen Interpreten</h2>
          <p>
            Verbinde Spotify – eine KI schaut deine Playlists durch und merkt
            sich, welche deiner Künstler auf Spanisch singen.
          </p>
        </div>

        {!spotifyBereit && (
          <div className="spotify-teaser">
            <span className="spotify-marke">Noch einzurichten</span>
            <p>
              Für die Verbindung fehlt noch die Spotify-Client-ID. Sobald sie
              hinterlegt ist, erscheint hier der Verbinden-Knopf.
            </p>
          </div>
        )}

        {spotifyBereit && !verbunden && (
          <div className="spotify-box">
            <p className="spotify-erklaerung">
              Wir lesen ausschließlich deine gespeicherten Titel und Playlists.
              Nichts wird abgespielt, geändert oder geteilt.
            </p>
            <button className="btn spotify-los" onClick={starteAnmeldung}>
              Mit Spotify verbinden
            </button>
          </div>
        )}

        {spotifyBereit && verbunden && (
          <>
            <div className="spotify-leiste">
              <span className="spotify-status">Spotify verbunden</span>
              <div className="spotify-aktionen">
                <button
                  className="filter-knopf"
                  onClick={interpretenPruefen}
                  disabled={Boolean(analyse)}
                >
                  {analyse ? 'Läuft …' : 'Neu auswerten'}
                </button>
                <button className="filter-knopf" onClick={spotifyTrennen}>
                  Trennen
                </button>
              </div>
            </div>

            {analyse && <p className="suche-hinweis">{analyse}</p>}

            {!analyse && interpreten.length === 0 && (
              <p className="empty-hint">
                In deiner Musik war noch nichts Spanischsprachiges dabei. Sobald
                du welche hörst, taucht es hier nach einer neuen Auswertung auf.
              </p>
            )}

            {interpreten.length > 0 && (
              <>
                <p className="suche-hinweis">
                  {interpreten.length} gefunden – tippe einen an, um seine Songs
                  zu sehen. Ein Klick auf einen Song sucht ihn direkt.
                </p>
                <div className="interpreten-liste">
                  {interpreten.map((k) => {
                    const offen = offenerInterpret === k.name
                    return (
                      <div key={k.name} className={'interpret-block' + (offen ? ' block-offen' : '')}>
                        <button
                          className="interpret-karte"
                          onClick={() => setOffenerInterpret(offen ? null : k.name)}
                        >
                          <span className="interpret-name">{k.name}</span>
                          <span className="interpret-meta">
                            {k.herkunft} · {k.stil}
                          </span>
                          {!k.sicher && (
                            <span className="interpret-hinweis">singt gemischt</span>
                          )}
                          <span className="interpret-anzahl">
                            {k.songs?.length
                              ? `${k.songs.length} Songs ${offen ? '▴' : '▾'}`
                              : 'keine Songs gefunden'}
                          </span>
                        </button>

                        {offen && k.songs?.length > 0 && (
                          <div className="interpret-songs">
                            {k.songs.map((s) => (
                              <button
                                key={s.titel}
                                className="song-vorschlag"
                                onClick={() => songSuchen(`${k.name} ${s.titel}`)}
                              >
                                <span className="song-vorschlag-titel">{s.titel}</span>
                                <span className="song-vorschlag-dauer">
                                  {s.ausKi ? 'Vorschlag' : dauerText(s.dauer)}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}

        {spotifyFehler && <p className="error">{spotifyFehler}</p>}
      </section>

    </>
  )
}
