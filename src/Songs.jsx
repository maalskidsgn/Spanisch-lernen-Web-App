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
import InfoKnopf from './InfoKnopf.jsx'
import { IconMusik, IconLesezeichen, IconStern } from './icons.jsx'

// Vier Einstiegspunkte, damit man nicht vor einem leeren Feld sitzt.
//
// Bewusst vier und nicht sechs: Sie stehen jetzt IN der Karte, und
// dort passt genau eine Zeile. Und bewusst diese vier – es sind die
// Stile, die zwischen zwanzig und vierzig tatsaechlich gehoert
// werden. Rock en español, Balada romántica und Flamenco waren
// vollstaendiger, aber an der Zielgruppe vorbei.
const STILE = ['Reggaetón', 'Latin Pop', 'Bachata', 'Trap latino']

// Startvorschlaege fuer den Interpreten-Bereich (Weg B, 28.08.):
// bekannte Namen quer durch die Stile, damit niemand vor einem
// leeren Feld sitzt. Ein Tipp prueft den Kuenstler sofort.
const KUENSTLER_VORSCHLAEGE = [
  'Shakira',
  'Bad Bunny',
  'Álvaro Soler',
  'Rosalía',
  'Karol G',
  'Manu Chao',
  'Juanes',
  'Enrique Iglesias',
]

// Spotify ausgeblendet (28.08., Manuels Entscheidung): Spotify laesst
// nur noch 5 freigeschaltete Testkonten in Apps im Entwicklungsmodus –
// fuer echte Nutzer ist der Login wertlos. Die Interpreten laufen
// jetzt komplett ueber Weg B (selbst eintragen + KI-Pruefung), der
// ohne Spotify funktioniert. Diese eine Zeile holt den Login zurueck.
const SPOTIFY_ZEIGEN = false

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
  const [prueft, setPrueft] = useState(null) // videoId, deren Text gerade geprueft wird
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
  const [eingabe, setEingabe] = useState('') // Künstler-Eingabefeld
  const [hinweis, setHinweis] = useState('') // "singt nicht auf Spanisch"-Meldung
  // Status/Fehler beim Song-Oeffnen – angezeigt DIREKT am Interpreten,
  // nicht irgendwo unten auf der Seite, wo es keiner sieht.
  const [songMeldung, setSongMeldung] = useState(null) // {name, text, fehler}

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
    // Die Interpreten bleiben stehen – sie koennen inzwischen auch
    // von Hand eingetragen sein, nicht nur aus Spotify.
    trenneSpotify()
    setVerbunden(false)
  }

  /**
   * Weg B (28.08.): Kuenstler von Hand eintragen statt ueber Spotify.
   *
   * Spotify laesst seit 2026 nur noch 5 freigeschaltete Testkonten in
   * Apps im Entwicklungsmodus – fuer echte Nutzer war der Bereich
   * damit tot. Hier tippt der Nutzer seine Lieblingskuenstler selbst
   * ein (oder nimmt einen Vorschlag), die KI prueft, wer auf Spanisch
   * singt, und ergaenzt die Songs. Ab da laeuft alles ueber die
   * YouTube-Suche, die zuverlaessig funktioniert.
   */
  async function kuenstlerPruefen(text) {
    const schonDa = (name) =>
      interpreten.some((k) => k.name.toLowerCase() === name.toLowerCase())
    const namen = String(text)
      .split(',')
      .map((t) => t.trim())
      .filter((n) => n && !schonDa(n))

    setEingabe('')
    if (namen.length === 0) return

    setSpotifyFehler('')
    setHinweis('')
    setAnalyse(
      namen.length === 1
        ? `${namen[0]} wird geprüft …`
        : `${namen.length} Künstler werden geprüft …`
    )
    try {
      const res = await fetch(API_URL + '/api/spotify/interpreten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kuenstler: namen.map((name) => ({ name, songs: [] })),
        }),
      })
      const daten = await res.json()
      if (!res.ok) throw new Error(daten.error || 'Prüfung fehlgeschlagen')

      const gefunden = daten.interpreten ?? []
      const abgelehnt = namen.filter(
        (n) => !gefunden.some((g) => g.name.toLowerCase() === n.toLowerCase())
      )

      if (gefunden.length) {
        const zusammen = [...interpreten, ...gefunden.filter((g) => !schonDa(g.name))]
        setInterpreten(zusammen)
        merkeInterpreten(zusammen)
        setOffenerInterpret(gefunden[0].name)
      }
      if (abgelehnt.length) {
        setHinweis(
          abgelehnt.join(', ') +
            (abgelehnt.length === 1 ? ' singt' : ' singen') +
            ' überwiegend nicht auf Spanisch – zum Mitlesen bringt das leider nichts.'
        )
      }
    } catch (f) {
      setSpotifyFehler(f.message)
    } finally {
      setAnalyse('')
    }
  }

  /** Einen Interpreten wieder aus der Liste nehmen. */
  function interpretEntfernen(name) {
    const rest = interpreten.filter((k) => k.name !== name)
    setInterpreten(rest)
    merkeInterpreten(rest)
    if (offenerInterpret === name) setOffenerInterpret(null)
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
    const status = (text) => setSongMeldung({ name: kuenstler, text })
    try {
      status('Suche das Video …')
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
          status('Songtext wird geholt – das kann eine halbe Minute dauern …')
          const pruefung = await fetch(
            API_URL + '/api/transcript?url=' + kandidat.videoId + '&art=musik'
          )
          if (pruefung.ok) {
            setSongMeldung(null)
            onOpenVideo(kandidat.videoId, 'musik')
            return
          }
          // Hat der Songtext-Dienst selbst eine Stoerung, ist jeder
          // weitere Versuch sinnlos – sofort ehrlich Bescheid geben,
          // statt minutenlang scheinbar zu haengen.
          const antwort = await pruefung.json().catch(() => ({}))
          if (antwort.stoerung) {
            throw new Error(
              'Der Songtext-Dienst hat gerade eine Störung. Deine ' +
                'gespeicherten Songs oben funktionieren weiter – neue ' +
                'bitte später noch einmal versuchen.'
            )
          }
          if (i < 2) status('Der Treffer hatte keinen Text – prüfe den nächsten …')
        } catch (f) {
          if (f.message.includes('Störung')) throw f
          // sonst: naechsten Treffer versuchen
        }
      }
      throw new Error(
        `Zu „${titel}" habe ich keine Fassung mit Songtext gefunden. ` +
          'Versuch es über die Suche oben mit „Letra" im Suchbegriff.'
      )
    } catch (f) {
      setSongMeldung({ name: kuenstler, text: f.message, fehler: true })
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

  /**
   * Einen Suchtreffer öffnen – aber erst prüfen, ob es wirklich einen
   * spanischen Text gibt.
   *
   * Ohne die Prüfung landete man auf einer Fehlerseite, sobald der
   * oberste Treffer danebenlag (am 24.08. gemessen: ein rumänisches
   * Kinderlied vor dem echten Song). YouTubes "hat Untertitel"-Flag
   * sagt nämlich nicht, in WELCHER Sprache. Deshalb: den geklickten
   * Treffer prüfen, bei Fehlschlag still die nächsten zwei versuchen –
   * mit sichtbarem Spinner auf der Karte, damit klar ist, dass etwas
   * passiert.
   */
  async function trefferOeffnen(startIndex) {
    if (prueft) return
    const kandidaten = (treffer ?? []).slice(startIndex, startIndex + 3)
    setFehler('')
    for (const k of kandidaten) {
      setPrueft(k.videoId)
      try {
        const res = await fetch(API_URL + '/api/transcript?url=' + k.videoId + '&art=musik')
        if (res.ok) {
          setPrueft(null)
          onOpenVideo(k.videoId, 'musik')
          return
        }
      } catch {
        // naechsten Kandidaten versuchen
      }
    }
    setPrueft(null)
    setFehler(
      'Zu diesem Treffer habe ich keine Fassung mit spanischem Text gefunden – ' +
        'probier einen anderen oder such mit „Letra" im Namen.'
    )
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
            {treffer.map((s, i) => (
              <button
                key={s.videoId}
                className={'treffer' + (prueft === s.videoId ? ' treffer-prueft' : '')}
                onClick={() => trefferOeffnen(i)}
                disabled={Boolean(prueft)}
              >
                <img src={s.thumbnail} alt="" />
                <span className="treffer-text">
                  <span className="treffer-titel">{s.title}</span>
                  <span className="treffer-meta">
                    {prueft === s.videoId
                      ? 'Songtext wird geprüft …'
                      : s.channel + (s.duration ? ' · ' + dauerText(s.duration) : '')}
                  </span>
                </span>
                {prueft === s.videoId && <span className="treffer-spinner" aria-hidden="true" />}
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
          <div className="song-grid">
            {songs.map((s) => (
              <div key={s.id} className="song-karte">
                <button
                  className="song-bild"
                  onClick={() => onOpenVideo(s.youtube_id, 'musik')}
                  aria-label={'Song öffnen: ' + s.titel}
                >
                  <img src={s.thumbnail} alt="" loading="lazy" />
                  <span className="song-play-overlay" aria-hidden="true">▶</span>
                  {s.dauer_sek > 0 && (
                    <span className="song-dauer">{dauerText(s.dauer_sek)}</span>
                  )}
                </button>
                <div className="song-karte-fuss">
                  <button
                    className="song-karte-text"
                    onClick={() => onOpenVideo(s.youtube_id, 'musik')}
                  >
                    <span className="song-titel">{s.titel}</span>
                    <span className="song-meta">{s.kanal}</span>
                  </button>
                  <button
                    className="song-pdf"
                    onClick={() => pdfErzeugen(s)}
                    disabled={pdfLaeuft === s.youtube_id}
                    title="Songtext als PDF sichern"
                  >
                    {pdfLaeuft === s.youtube_id ? '…' : 'PDF'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============ 3. DEINE INTERPRETEN (Weg B, ohne Spotify-Zwang) ============ */}
      <section className="bereich">
        <Kopf
          symbol={<IconStern groesse={19} />}
          titel="Deine spanischen Interpreten"
        />
        <div className="bereich-kopf bereich-kopf-rest">
          <h2 hidden>Deine spanischen Interpreten</h2>
          <p>
            Sag uns, wen du gern hörst – die KI prüft, wer auf Spanisch
            singt, und schlägt Songs zum Mitlesen vor.
          </p>
        </div>

        <form
          className="interpret-eingabe"
          onSubmit={(e) => {
            e.preventDefault()
            kuenstlerPruefen(eingabe)
          }}
        >
          <input
            className="interpret-feld"
            type="text"
            value={eingabe}
            onChange={(e) => setEingabe(e.target.value)}
            placeholder="Künstler eintippen, z. B. Shakira"
            disabled={Boolean(analyse)}
          />
          <button className="btn" disabled={Boolean(analyse) || !eingabe.trim()}>
            Prüfen
          </button>
        </form>

        <div className="interpret-vorschlaege">
          {KUENSTLER_VORSCHLAEGE.filter(
            (n) =>
              !interpreten.some((k) => k.name.toLowerCase() === n.toLowerCase())
          ).map((n) => (
            <button
              key={n}
              className="filter-knopf"
              onClick={() => kuenstlerPruefen(n)}
              disabled={Boolean(analyse)}
            >
              + {n}
            </button>
          ))}
        </div>

        {analyse && <p className="suche-hinweis">{analyse}</p>}
        {hinweis && <p className="suche-hinweis">{hinweis}</p>}

        {interpreten.length > 0 && (
          <>
            <p className="suche-hinweis">
              {interpreten.length} in deiner Liste – tippe einen an, um seine
              Songs zu sehen. Ein Klick auf einen Song öffnet ihn zum Mitlesen.
            </p>
            <div className="interpreten-liste">
              {interpreten.map((k) => {
                const offen = offenerInterpret === k.name
                return (
                  <div
                    key={k.name}
                    className={'interpret-block' + (offen ? ' block-offen' : '')}
                  >
                    <button
                      className="interpret-weg"
                      title={k.name + ' entfernen'}
                      onClick={() => interpretEntfernen(k.name)}
                    >
                      ✕
                    </button>
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
                              (laeuft === k.name + '|' + s.titel
                                ? ' song-laedt'
                                : '')
                            }
                            onClick={() => songOeffnen(k.name, s.titel)}
                            disabled={Boolean(laeuft)}
                          >
                            <span className="song-play" aria-hidden="true">
                              {laeuft === k.name + '|' + s.titel ? '◌' : '▶'}
                            </span>
                            <span className="song-vorschlag-titel">{s.titel}</span>
                            <span className="song-vorschlag-dauer">
                              {laeuft === k.name + '|' + s.titel
                                ? 'Öffnet …'
                                : 'Mitlesen'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {songMeldung?.name === k.name && (
                      <p
                        className={
                          'song-meldung' +
                          (songMeldung.fehler ? ' song-meldung-fehler' : '')
                        }
                      >
                        {songMeldung.text}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {SPOTIFY_ZEIGEN && spotifyBereit && !verbunden && (
          <div className="spotify-box">
            <p className="spotify-erklaerung">
              {/* Ehrlich bleiben: Spotify laesst nur von uns freigeschaltete
                  Konten herein – fuer alle anderen bringt der Knopf nichts. */}
              Bonus für freigeschaltete Test-Konten: Spotify verbinden, dann
              lesen wir deine gespeicherten Titel, Playlists und meist­gehörten
              Künstler automatisch aus.
            </p>
            <InfoKnopf thema="spotify" />
            <button className="btn spotify-los" onClick={starteAnmeldung}>
              Mit Spotify verbinden
            </button>
          </div>
        )}

        {SPOTIFY_ZEIGEN && spotifyBereit && verbunden && (
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
        )}

        {spotifyFehler && <p className="error">{spotifyFehler}</p>}
      </section>
    </>
  )
}
