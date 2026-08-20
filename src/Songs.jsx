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
import { Hero, Kopf, SuchFeld } from './MediathekUI.jsx'
import { IconMusik, IconLesezeichen, IconStern } from './icons.jsx'

// Vier Einstiegspunkte, damit man nicht vor einem leeren Feld sitzt.
//
// Bewusst vier und nicht sechs: Sie stehen jetzt IN der Karte, und
// dort passt genau eine Zeile. Und bewusst diese vier – es sind die
// Stile, die zwischen zwanzig und vierzig tatsaechlich gehoert
// werden. Rock en español, Balada romántica und Flamenco waren
// vollstaendiger, aber an der Zielgruppe vorbei.
const STILE = ['Reggaetón', 'Latin Pop', 'Bachata', 'Trap latino']

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
  const [laeuft, setLaeuft] = useState(null) // welcher Song gerade geholt wird
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

  // Zurück von Spotify? Dann den Code einlösen und gleich auswerten.
  // OHNE diesen Schritt passiert nach der Anmeldung gar nichts.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).get('code')) return
    schliesseAnmeldungAb()
      .then((ok) => {
        window.history.replaceState({}, '', '/')
        if (ok) {
          setVerbunden(true)
          interpretenPruefen()
        }
      })
      .catch((f) => setSpotifyFehler(f.message))
    // Nur einmal beim Laden – deshalb keine Abhängigkeiten
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  /**
   * Song antippen: suchen und den besten Treffer gleich oeffnen.
   *
   * Vorher wurde nur die Suche oben gefuellt – weit ausserhalb des
   * Sichtfelds. Es sah aus, als passiere nichts.
   */
  async function songOeffnen(kuenstler, titel) {
    const schluessel = kuenstler + '|' + titel
    if (laeuft) return
    setLaeuft(schluessel)
    setSpotifyFehler('')
    try {
      const res = await fetch(
        API_URL + '/api/search?nurMusik=1&q=' + encodeURIComponent(`${kuenstler} ${titel}`)
      )
      const daten = await res.json()
      if (!res.ok) throw new Error(daten.error || 'Suche fehlgeschlagen')

      const treffer = daten.results ?? []
      if (!treffer.length) {
        throw new Error(`Zu „${titel}" gibt es leider kein Video mit Text.`)
      }

      // Der Server siebt Songs ohne Untertitel bereits aus. Falls
      // seine Pruefung nicht greift (z. B. weil der YouTube-Schluessel
      // beschraenkt ist), probieren wir den naechsten Treffer, statt
      // in einer Sackgasse zu enden.
      for (const [i, kandidat] of treffer.slice(0, 3).entries()) {
        try {
          const pruefung = await fetch(
            API_URL + '/api/transcript?url=' + kandidat.videoId + '&art=musik'
          )
          if (pruefung.ok) {
            onOpenVideo(kandidat.videoId, 'musik')
            return
          }
          if (i < 2) setSpotifyFehler('Suche eine Fassung mit Text …')
        } catch {
          // naechsten Treffer versuchen
        }
      }
      throw new Error(
        `Zu „${titel}" habe ich keine Fassung mit Songtext gefunden. ` +
          'Versuch es über die Suche oben mit „Letra" im Suchbegriff.'
      )
    } catch (f) {
      setSpotifyFehler(f.message)
    } finally {
      setLaeuft(null)
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
      <Hero
        symbol={<IconMusik groesse={26} />}
        titel="Spanische Songs finden"
        text="Der Text läuft mit – unbekannte Wörter tippst du an."
      >
        <SuchFeld
          wert={suche}
          onWert={setSuche}
          onAbsenden={() => songSuchen()}
          platzhalter="Künstler, Songtitel oder Stilrichtung…"
          knopf="Songs suchen"
          laedt={laedt}
        />

        {/* Die Stilrichtungen gehoeren in die Karte: Sie beantworten
            genau die Frage, die das Feld darueber stellt. Unter der
            Karte sahen sie aus wie ein eigener Bereich. */}
        <div className="stil-vorschlaege">
          {STILE.map((s) => (
            <button key={s} type="button" className="vorschlag-chip" onClick={() => songSuchen(s)}>
              {s}
            </button>
          ))}
        </div>
      </Hero>

      {/* Nur zeigen, wenn es etwas zu zeigen gibt.
          Seit jeder Abschnitt eine Karte ist, stand hier sonst ein
          leerer weisser Kasten – vorher war er unsichtbar, weil
          Abschnitte keinen Hintergrund hatten. */}
      {(fehler || treffer) && (
      <section className="bereich">
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
      )}

      {/* ============ 2. DEINE SONGS ============ */}
      <section className="bereich">
        <Kopf
          symbol={<IconLesezeichen groesse={19} />}
          titel="Deine Songs"
          text={
            songs?.length
              ? `${songs.length} gespeichert – zum Anhören antippen oder den Text als PDF sichern.`
              : 'Noch keine Songs. Such dir oben einen aus und öffne ihn.'
          }
          zahl={songs?.length || null}
        />

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
        <Kopf
          symbol={<IconStern groesse={19} />}
          titel="Deine spanischen Interpreten"
        />
        <div className="bereich-kopf bereich-kopf-rest">
          <h2 hidden>Deine spanischen Interpreten</h2>
          <p>Deine spanischsprachigen Künstler aus Spotify, mit ihren Songs.</p>
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
                                className={
                                  'song-vorschlag' +
                                  (laeuft === k.name + '|' + s.titel ? ' song-laedt' : '')
                                }
                                onClick={() => songOeffnen(k.name, s.titel)}
                                disabled={Boolean(laeuft)}
                              >
                                <span className="song-play" aria-hidden="true">
                                  {laeuft === k.name + '|' + s.titel ? '◌' : '▶'}
                                </span>
                                <span className="song-vorschlag-titel">{s.titel}</span>
                                <span className="song-vorschlag-dauer">
                                  {laeuft === k.name + '|' + s.titel ? 'Öffnet …' : 'Mitlesen'}
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
