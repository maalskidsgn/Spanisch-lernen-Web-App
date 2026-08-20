import { API_URL } from './api.js'
import { holeBibliothek, supabaseBereit, zaehleSongs } from './supabase.js'
import VideoSuche from './VideoSuche.jsx'
import Songs from './Songs.jsx'
import {
  IconAlle, IconSprache, IconGesundheit, IconSport, IconErnaehrung,
  IconProduktiv, IconStoa, IconPsyche, IconSuche,
  IconLesezeichen, IconPfeil, IconBuch,
} from './icons.jsx'

const KATEGORIE_ICONS = {
  alle: IconAlle,
  sprache: IconSprache,
  gesundheit: IconGesundheit,
  sport: IconSport,
  ernaehrung: IconErnaehrung,
  produktivitaet: IconProduktiv,
  stoizismus: IconStoa,
  psychologie: IconPsyche,
  gefunden: IconSuche,
}
import { ladeVideoFortschritt, standVon } from './App.jsx'
import { useState, useEffect } from 'react'
import Inhalte from './Inhalte.jsx'
import { holeVerzeichnis } from './inhalte.js'
import { Hero, Kopf, SuchFeld } from './MediathekUI.jsx'

// Die Niveau-Stufen der kuratierten Mediathek
// Die Themen der Mediathek – man lernt Spanisch nebenbei,
// während man etwas Interessantes schaut.
// Der Bereich soll kurz bleiben: Filter oben, vier Videos darunter,
// Nachschub nur auf Wunsch.
const SCHRITT = 4

// So viele gemerkte Videos stehen ohne "Alle anzeigen" da
const SICHTBAR_GEMERKT = 4

// Die Bereiche der Mediathek.
//
// Hoertexte sind vorerst ausgeblendet – die elf importierten Folgen
// bleiben liegen, der Bereich ist nur nicht mehr erreichbar. Diese
// eine Zeile holt ihn zurueck.
const HOERTEXTE_ZEIGEN = false

const BEREICHE = [
  { wert: 'videos', label: 'Videos' },
  { wert: 'songs', label: 'Songs' },
  ...(HOERTEXTE_ZEIGEN ? [{ wert: 'hoertexte', label: 'Hörtexte' }] : []),
  { wert: 'ebooks', label: 'Ebooks' },
]

const KATEGORIEN = [
  { wert: 'alle', label: 'Alle' },
  { wert: 'sprache', label: 'Spanisch lernen' },
  { wert: 'gesundheit', label: 'Gesundheit' },
  { wert: 'sport', label: 'Sport' },
  { wert: 'ernaehrung', label: 'Ernährung' },
  { wert: 'produktivitaet', label: 'Produktivität' },
  { wert: 'stoizismus', label: 'Stoizismus' },
  { wert: 'psychologie', label: 'Psychologie' },
  // Videos, die jemand selbst gesucht hat. Ohne eigene Reihe waeren
  // sie unsichtbar – sie tragen keine der kuratierten Kategorien.
  { wert: 'gefunden', label: 'Selbst gefunden' },
]

// Suchanfragen für "Für dich vorgeschlagen" – jeden Tag eine andere,
// damit regelmäßig frische Videos auftauchen
const EMPFEHLUNGS_SUCHEN = [
  'spanish for beginners comprehensible input',
  'easy spanish street interviews',
  'slow spanish stories for beginners',
  'español con juan learn spanish',
  'dreaming spanish superbeginner',
  'spanish listening practice beginner',
  'easy spanish conversation basics',
]

// Gespeicherte Empfehlungen aus dem Browser-Speicher laden
function ladeEmpfehlungsCache() {
  try {
    return JSON.parse(localStorage.getItem('vorschlaege2'))
  } catch {
    return null
  }
}

// Fertige Suchvorschläge zum Entdecken neuer Spanisch-Videos
const VORSCHLAEGE = [
  { label: '🎵 Musik', query: 'canciones en español con letra' },
  { label: '🐣 Für Anfänger', query: 'spanish for beginners comprehensible input' },
  { label: '🎙️ Podcasts', query: 'podcast en español para estudiantes' },
  { label: '📰 Langsame Nachrichten', query: 'noticias en español lento para estudiantes' },
  { label: '🍳 Kochen', query: 'receta cocina española fácil' },
  { label: '✈️ Reisen', query: 'viajar por españa vlog' },
]

function formatDuration(sec) {
  if (!sec) return ''
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// Gespeicherte Buchzusammenfassungen laden
function ladeBuecher() {
  try {
    return JSON.parse(localStorage.getItem('buecher')) || []
  } catch {
    return []
  }
}

// Die Mediathek: Videos (Link laden, gespeichert, entdecken) und
// Bücher (KI-Zusammenfassungen wie bei Blinkist)
export default function Library({ savedVideos: alleGemerkten, setSavedVideos, onOpenVideo, onLoadUrl, onAddVocab, vocab = {} }) {
  // Songs werden im Songs-Bereich angezeigt, nicht hier.
  // Ältere Einträge haben noch kein "art" – die gelten als Video.
  const savedVideos = alleGemerkten.filter((v) => v.art !== 'musik')
  // Kommt der Nutzer von Spotify zurueck, gehoert er direkt zu den Songs –
  // dort wird der Code eingeloest und die Auswertung gestartet.
  const [bereich, setBereich] = useState(() =>
    new URLSearchParams(window.location.search).get('code') ? 'songs' : 'videos'
  ) // 'videos', 'songs' oder 'ebooks'
  const [buecher, setBuecher] = useState(ladeBuecher)
  const [buchTitel, setBuchTitel] = useState('')
  const [buchLaden, setBuchLaden] = useState(false)
  const [buchFehler, setBuchFehler] = useState('')
  const [offenesBuch, setOffenesBuch] = useState(null) // gerade geöffnete Zusammenfassung

  // ---------- Kuratierte Mediathek aus der Datenbank ----------
  const [bibliothek, setBibliothek] = useState(null)
  // standVon() versteht beide Formate: alte Eintraege waren eine
  // blosse Prozentzahl, neue enthalten auch die Sekunde.
  const [fortschritt] = useState(() => {
    const roh = ladeVideoFortschritt()
    return Object.fromEntries(
      Object.keys(roh).map((id) => [id, standVon(id).prozent])
    )
  })
  const [sucheOffen, setSucheOffen] = useState(false)
  const [suchFeld, setSuchFeld] = useState('')
  const [alleGemerkt, setAlleGemerkt] = useState(false)
  const [startBegriff, setStartBegriff] = useState('')
  const [kategorie, setKategorie] = useState('alle')
  const [sichtbareVideos, setSichtbareVideos] = useState(SCHRITT)
  const [bibliothekFehler, setbibliothekFehler] = useState('')
  // Die Zahlen am Umschalter. Sie stehen bewusst hier und nicht in
  // den Bereichen selbst: Ein Bereich, den man noch nicht geoeffnet
  // hat, koennte seine eigene Zahl gar nicht kennen.
  const [songAnzahl, setSongAnzahl] = useState(null)
  const [ebookAnzahl, setEbookAnzahl] = useState(null)

  useEffect(() => {
    let abgebrochen = false
    if (supabaseBereit) {
      zaehleSongs()
        .then((n) => !abgebrochen && setSongAnzahl(n))
        .catch(() => {}) // eine fehlende Zahl ist kein Grund fuer eine Fehlermeldung
    }
    // holeVerzeichnis merkt sich das Ergebnis – der Ebooks-Bereich
    // holt es also nicht ein zweites Mal.
    holeVerzeichnis('lesetexte')
      .then((v) => !abgebrochen && setEbookAnzahl(v.length))
      .catch(() => {})
    return () => { abgebrochen = true }
  }, [])

  useEffect(() => {
    if (!supabaseBereit) return
    let abgebrochen = false

    setbibliothekFehler('')
    holeBibliothek('alle')
      .then((videos) => {
        if (abgebrochen) return
        // Auf das Format bringen, das VideoKarte erwartet
        setBibliothek(
          videos.map((v) => ({
            videoId: v.youtube_id,
            title: v.titel,
            channel: v.kanal,
            duration: v.dauer_sek,
            thumbnail: v.thumbnail,
            niveau: v.niveau,
            kategorie: v.kategorie,
          }))
        )
      })
      .catch((f) => {
        if (!abgebrochen) setbibliothekFehler(f.message)
      })

    return () => { abgebrochen = true }
  }, [])

  // Eine neue Buchzusammenfassung generieren lassen
  async function generiereBuch(e) {
    // Das Ereignis ist freiwillig: Das Suchfeld der Hauptkarte hat
    // preventDefault() schon selbst erledigt und ruft ohne Argument.
    e?.preventDefault()
    if (!buchTitel.trim()) return
    setBuchLaden(true)
    setBuchFehler('')
    try {
      const res = await fetch(API_URL + '/api/buch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titel: buchTitel.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const buch = { ...data, id: Date.now(), erstellt: Date.now() }
      const neu = [buch, ...buecher]
      setBuecher(neu)
      localStorage.setItem('buecher', JSON.stringify(neu))
      setBuchTitel('')
      setOffenesBuch(buch)
    } catch (err) {
      setBuchFehler(err.message)
    } finally {
      setBuchLaden(false)
    }
  }

  function loescheBuch(id) {
    const neu = buecher.filter((b) => b.id !== id)
    setBuecher(neu)
    localStorage.setItem('buecher', JSON.stringify(neu))
  }
  const [filter, setFilter] = useState('alle')
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [link, setLink] = useState('') // eingefügter YouTube-Link
  const [empfehlungen, setEmpfehlungen] = useState(() => ladeEmpfehlungsCache()?.videos || null)
  const [empfehlungenLaden, setEmpfehlungenLaden] = useState(false)

  // Beim Öffnen: Empfehlungen holen, falls keine da oder älter als ein Tag
  useEffect(() => {
    const cache = ladeEmpfehlungsCache()
    const frisch = cache && Date.now() - cache.zeit < 24 * 60 * 60 * 1000
    if (!frisch) holeEmpfehlungen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Holt 6 Video-Empfehlungen über die YouTube-Suche und merkt sie sich
  async function holeEmpfehlungen(zufaellig = false) {
    setEmpfehlungenLaden(true)
    try {
      const q = zufaellig
        ? EMPFEHLUNGS_SUCHEN[Math.floor(Math.random() * EMPFEHLUNGS_SUCHEN.length)]
        : EMPFEHLUNGS_SUCHEN[new Date().getDay() % EMPFEHLUNGS_SUCHEN.length]
      const res = await fetch(API_URL + '/api/search?q=' + encodeURIComponent(q))
      const data = await res.json()
      if (res.ok && data.results?.length) {
        const videos = data.results.slice(0, 6)
        setEmpfehlungen(videos)
        localStorage.setItem('vorschlaege2', JSON.stringify({ zeit: Date.now(), videos }))
      }
    } catch {
      // klappt es nicht, bleibt der Bereich einfach leer
    } finally {
      setEmpfehlungenLaden(false)
    }
  }

  // Alle Kategorien, die in den gespeicherten Videos vorkommen
  const categories = [...new Set(savedVideos.map((v) => v.category).filter(Boolean))]

  const filtered =
    filter === 'alle'
      ? savedVideos
      : savedVideos.filter((v) => v.category === filter)

  async function search(q) {
    setSearching(true)
    setError('')
    setResults(null)
    setQuery(q)
    try {
      const res = await fetch(API_URL + '/api/search?q=' + encodeURIComponent(q))
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResults(data.results)
    } catch (err) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }

  function removeVideo(videoId) {
    setSavedVideos((list) => list.filter((v) => v.videoId !== videoId))
  }

  // ---------- Geöffnete Buchzusammenfassung ----------
  if (offenesBuch) {
    return (
      <BuchView
        buch={offenesBuch}
        onClose={() => setOffenesBuch(null)}
        onAddVocab={onAddVocab}
      />
    )
  }

  return (
    <div className="library">
      <h1 className="lib-kopf">
        Deine <span className="accent">Mediathek</span>
      </h1>
      <p className="lib-unter">
        {{
          videos: 'Finde spanische Videos, die zu deinem Niveau passen.',
          songs: 'Spanische Songs mit mitlaufendem Text.',
          hoertexte: 'Hörtexte mit Tonspur und Übersetzung daneben.',
          ebooks: 'Buchzusammenfassungen auf Spanisch – oder lass dir selbst eine schreiben.',
        }[bereich]}
      </p>

      {/* Der Umschalter – dieselbe Bauart wie Vokabeln|Grammatik im
          Trainer, damit die App an beiden Stellen gleich umschaltet. */}
      <div className="deck" role="tablist">
        {BEREICHE.map((b) => {
          const zahl = {
            videos: bibliothek?.length ?? null,
            songs: songAnzahl,
            // Die fertigen Zusammenfassungen plus die selbst erzeugten
            ebooks: ebookAnzahl == null ? null : ebookAnzahl + buecher.length,
            hoertexte: null,
          }[b.wert]
          return (
            <button
              key={b.wert}
              role="tab"
              aria-selected={bereich === b.wert}
              className={bereich === b.wert ? 'deck-aktiv' : ''}
              onClick={() => setBereich(b.wert)}
            >
              {b.label}
              {zahl != null && <span className="deck-zahl">{zahl}</span>}
            </button>
          )
        })}
      </div>

      {/* Der Schluessel ist Absicht: Wechselt der Bereich, baut React
          den Block neu auf – und die Einblend-Animation laeuft von
          vorn. Ohne ihn wuerde nur der Inhalt getauscht, und der
          Wechsel saehe aus wie ein Sprung. */}
      <div className="wechsel" key={bereich}>

      {/* ---------- Songs: Musik mit mitlaufendem Text ---------- */}
      {bereich === 'songs' && <Songs onOpenVideo={onOpenVideo} vocab={vocab} />}

      {/* ---------- Hörtexte und Lesetexte ----------
          Die beiden Bereiche, in denen nichts erzeugt wird: fertige
          Inhalte von spanisch-lernen.com. Videos und Songs bleiben
          die generativen Bereiche. */}
      {bereich === 'hoertexte' && (
        <Inhalte art="hoertexte" onAddVocab={onAddVocab} vocab={vocab} />
      )}
      {bereich === 'ebooks' && (
        <>
          {/* Die Hauptkarte des Bereichs ist das Formular – genau wie
              bei den Videos die Suche. Der Filter fuer die fertigen
              Zusammenfassungen sitzt dafuer schmal ueber der Liste. */}
          <Hero
            symbol={<IconBuch groesse={26} />}
            titel="Ebook erstellen"
            text="Nenn einen Buchtitel oder ein Thema – die KI schreibt eine Zusammenfassung auf Spanisch."
          >
            <SuchFeld
              rund
              wert={buchTitel}
              onWert={setBuchTitel}
              onAbsenden={generiereBuch}
              platzhalter="z. B. „Ikigai“ oder „Besser schlafen“"
              knopf="Ebook erstellen"
              laedt={buchLaden}
            />
          </Hero>

          {buchFehler && <p className="error">{buchFehler}</p>}
          {buchLaden && (
            <p className="inhalt-hinweis">
              Das dauert einen Moment – die KI schreibt gerade beide Fassungen.
            </p>
          )}

          {buecher.length > 0 && (
            <EigeneEbooks
              buecher={buecher}
              onOeffnen={setOffenesBuch}
              onLoeschen={loescheBuch}
            />
          )}

          <Inhalte art="lesetexte" onAddVocab={onAddVocab} vocab={vocab} ohneHero />
        </>
      )}

      </div>

      {sucheOffen && (
        <VideoSuche
          startBegriff={startBegriff}
          onSchliessen={() => {
            setSucheOffen(false)
            setStartBegriff('')
          }}
          onVideoWaehlen={onOpenVideo}
        />
      )}

      {bereich === 'videos' && (
      <>
      {/* ============ 1. SELBST SUCHEN ============ */}
      {/* Das Feld steht direkt hier, nicht hinter einem Knopf: Wer
          schon weiss, wonach er sucht, soll nicht erst ein Fenster
          oeffnen muessen. */}
      <Hero
        symbol={<IconSuche groesse={26} />}
        titel="Video finden"
        text="Suche nach Themen und finde passende spanische Videos."
      >
        <SuchFeld
          rund
          wert={suchFeld}
          onWert={setSuchFeld}
          onAbsenden={() => {
            setStartBegriff(suchFeld.trim())
            setSucheOffen(true)
          }}
          platzhalter="z. B. gesunde Ernährung, Schlaf …"
        />
      </Hero>

      {/* ============ 2. GEMERKTE VIDEOS ============ */}
      {savedVideos.length > 0 && (
        <section className="bereich">
          <Kopf
            symbol={<IconLesezeichen groesse={19} />}
            titel="Deine gemerkten Videos"
            text={`${savedVideos.length} gespeichert – dort weitermachen, wo du aufgehört hast.`}
            aktion={
              savedVideos.length > SICHTBAR_GEMERKT ? (
                <button className="kopf-aktion" onClick={() => setAlleGemerkt((a) => !a)}>
                  {alleGemerkt ? 'Weniger' : 'Alle anzeigen'}
                  <IconPfeil groesse={15} />
                </button>
              ) : null
            }
          />
          <div className="chips">
            <button
              className={'chip ' + (filter === 'alle' ? 'chip-active' : '')}
              onClick={() => setFilter('alle')}
            >
              Alle ({savedVideos.length})
            </button>
            {categories.map((c) => (
              <button
                key={c}
                className={'chip ' + (filter === c ? 'chip-active' : '')}
                onClick={() => setFilter(c)}
              >
                {c} ({savedVideos.filter((v) => v.category === c).length})
              </button>
            ))}
          </div>

          <div className="quer-liste">
            {(alleGemerkt ? filtered : filtered.slice(0, SICHTBAR_GEMERKT)).map((v) => (
              <div key={v.videoId} className="quer-karte">
                <div className="quer-bild" onClick={() => onOpenVideo(v.videoId)}>
                  <img src={`https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`} alt="" />
                  {v.duration ? (
                    <span className="quer-dauer">{formatDuration(v.duration)}</span>
                  ) : null}
                  {fortschritt[v.videoId] > 0 && (
                    <div className="video-fortschritt" title={`${fortschritt[v.videoId]} % geschaut`}>
                      <div
                        className={'video-fortschritt-balken' + (fortschritt[v.videoId] >= 95 ? ' fertig' : '')}
                        style={{ width: fortschritt[v.videoId] + '%' }}
                      />
                    </div>
                  )}
                </div>
                <div className="quer-text">
                  <div className="quer-titel" onClick={() => onOpenVideo(v.videoId)}>
                    {v.title}
                  </div>
                  <div className="quer-fuss">
                    {v.category && <span className="category-badge">{v.category}</span>}
                    <button
                      className="btn-delete"
                      title="Aus der Mediathek entfernen"
                      onClick={() => removeVideo(v.videoId)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Kuratierte Habloo-Mediathek ---------- */}
      {supabaseBereit && (
        <section className="bereich">
          <Kopf
            symbol={<IconGesundheit groesse={19} />}
            titel="Für dich"
            aktion={
              kategorie !== 'alle' ? (
                <button
                  className="kopf-aktion"
                  onClick={() => {
                    setKategorie('alle')
                    setSichtbareVideos(SCHRITT)
                  }}
                >
                  Alle ansehen <IconPfeil groesse={15} />
                </button>
              ) : null
            }
            zahl={bibliothek && kategorie === 'alle' ? bibliothek.length : null}
          />

          <div className="themen-leiste">
            {KATEGORIEN.map((k) => (
              <button
                key={k.wert}
                className={'thema' + (kategorie === k.wert ? ' thema-aktiv' : '')}
                onClick={() => {
                  setKategorie(k.wert)
                  setSichtbareVideos(SCHRITT) // bei neuem Filter wieder oben anfangen
                }}
              >
                {(() => { const I = KATEGORIE_ICONS[k.wert]; return I ? <I groesse={15} /> : null })()}
                {k.label}
              </button>
            ))}
          </div>

          {bibliothekFehler && <p className="error">{bibliothekFehler}</p>}
          {!bibliothek && !bibliothekFehler && (
            <p className="intro">Lade Mediathek…</p>
          )}

          {bibliothek && (() => {
            const gefiltert =
              kategorie === 'alle'
                ? bibliothek
                : bibliothek.filter((v) => v.kategorie === kategorie)

            if (gefiltert.length === 0) {
              return <p className="intro">Zu diesem Thema ist noch nichts dabei.</p>
            }

            const sichtbar = gefiltert.slice(0, sichtbareVideos)
            const rest = gefiltert.length - sichtbar.length

            return (
              <>
                <div className="video-zeilen">
                  {sichtbar.map((v) => (
                    <VideoZeile
                      key={v.videoId}
                      video={v}
                      onOpen={onOpenVideo}
                      fortschritt={fortschritt[v.videoId] ?? 0}
                    />
                  ))}
                </div>

                {rest > 0 && (
                  <button
                    className="mehr-videos"
                    onClick={() => setSichtbareVideos((n) => n + SCHRITT)}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
                         stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
                         strokeLinejoin="round" aria-hidden="true">
                      <path d="m5 9 7 7 7-7" />
                    </svg>
                    Mehr anzeigen ({rest} weitere)
                  </button>
                )}
              </>
            )
          })()}
        </section>
      )}

      </>
      )}
    </div>
  )
}

// Die Lese-Ansicht einer Buchzusammenfassung: einfache spanische Absätze,
// Übersetzung einblendbar, Vokabeln mit einem Klick in den Trainer
/**
 * Die selbst erzeugten Ebooks.
 *
 * Sie liegen im Browser, nicht in der Bibliothek – deshalb stehen
 * sie in einem eigenen Abschnitt ueber den fertigen und tragen
 * einen Loeschknopf.
 */
function EigeneEbooks({ buecher, onOeffnen, onLoeschen }) {
  return (
    <section className="bereich">
      <Kopf
        symbol={<IconBuch groesse={19} />}
        titel="Deine eigenen Ebooks"
        text="Auf diesem Gerät gespeichert."
        zahl={buecher.length}
      />
      <ul className="inhalt-liste ebook-eigene">
        {buecher.map((b) => (
          <li key={b.id}>
            <button className="inhalt-zeile" onClick={() => onOeffnen(b)}>
              <span className="inhalt-text">
                <span className="inhalt-titel">{b.titel}</span>
                <span className="inhalt-meta">
                  selbst erstellt
                  {b.kapitel ? ` · ${b.kapitel.length} Kapitel` : ''}
                </span>
              </span>
              <IconPfeil groesse={17} />
            </button>
            <button
              className="btn-delete ebook-weg"
              title="Löschen"
              onClick={() => onLoeschen(b.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function BuchView({ buch, onClose, onAddVocab }) {
  const [zeigeDe, setZeigeDe] = useState(false)
  const [uebernommen, setUebernommen] = useState(false)

  function vokabelnUebernehmen() {
    onAddVocab(
      buch.vokabeln.map((v) => ({
        wort: v.wort,
        uebersetzung: v.uebersetzung,
        quelle: 'Buch: ' + buch.titel,
      }))
    )
    setUebernommen(true)
  }

  return (
    <div className="library buch-view">
      <button className="btn-plain back-link" onClick={onClose}>
        ← Zur Mediathek
      </button>
      <h1>{buch.titel}</h1>
      <p className="intro">
        {buch.autor} · Niveau {buch.niveau}
      </p>

      <label className="autoscroll-toggle">
        <input
          type="checkbox"
          checked={zeigeDe}
          onChange={(e) => setZeigeDe(e.target.checked)}
        />
        Deutsche Übersetzung einblenden
      </label>

      {buch.absaetze.map((a, i) => (
        <div key={i} className="buch-absatz">
          <p className="buch-es">{a.es}</p>
          {zeigeDe && <p className="buch-de">{a.de}</p>}
        </div>
      ))}

      <h2 className="settings-heading">Vokabeln aus diesem Buch</h2>
      <div className="settings-card">
        {buch.vokabeln.map((v) => (
          <div key={v.wort} className="settings-row">
            <div>
              <div className="row-title">{v.wort}</div>
              <div className="row-hint">{v.uebersetzung}</div>
            </div>
          </div>
        ))}
      </div>
      {uebernommen ? (
        <p className="gen-success">Vokabeln sind im Trainer! ✓</p>
      ) : (
        <button className="hero-cta" onClick={vokabelnUebernehmen}>
          Alle {buch.vokabeln.length} Vokabeln in den Trainer übernehmen
        </button>
      )}
    </div>
  )
}

// Eine Video-Karte mit Vorschaubild, Titel und Kanal
/**
 * Ein Video als Zeile: Vorschaubild links, Text daneben, rechts der
 * Abspielknopf.
 *
 * Frueher lagen die Videos in einem Raster mit dem Bild obenauf. Bei
 * zwei Spalten auf einem Handy blieb fuer den Titel so wenig Platz,
 * dass fast jeder abgeschnitten wurde – als Zeile bekommt er die
 * ganze Breite.
 */
function VideoZeile({ video, onOpen, fortschritt = 0 }) {
  return (
    <button className="video-zeile" onClick={() => onOpen(video.videoId)}>
      <span className="zeile-bild">
        <img src={video.thumbnail} alt="" loading="lazy" />
        {fortschritt > 0 && (
          <span className="video-fortschritt" title={`${fortschritt} % geschaut`}>
            <span
              className={'video-fortschritt-balken' + (fortschritt >= 95 ? ' fertig' : '')}
              style={{ width: fortschritt + '%' }}
            />
          </span>
        )}
      </span>

      <span className="zeile-text">
        {video.niveau && (
          <span className={'niveau-badge niveau-' + video.niveau}>{video.niveau}</span>
        )}
        <span className="zeile-titel">{video.title}</span>
        <span className="zeile-kanal">{video.channel}</span>
        {video.duration ? (
          <span className="zeile-dauer">{formatDuration(video.duration)}</span>
        ) : null}
      </span>

      <span className="zeile-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
        </svg>
      </span>
    </button>
  )
}

function VideoKarte({ video, onOpen, fortschritt = 0 }) {
  return (
    <div className="video-card">
      <div className="video-bild" onClick={() => onOpen(video.videoId)}>
        <img src={video.thumbnail} alt="" />
        {fortschritt > 0 && (
          <div className="video-fortschritt" title={`${fortschritt} % geschaut`}>
            <div
              className={'video-fortschritt-balken' + (fortschritt >= 95 ? ' fertig' : '')}
              style={{ width: fortschritt + '%' }}
            />
          </div>
        )}
      </div>
      <div className="video-card-body">
        <div className="video-card-title" onClick={() => onOpen(video.videoId)}>
          {video.title}
        </div>
        <div className="video-card-meta">
          <span className="video-card-channel">
            {video.channel}
            {video.duration ? ' · ' + formatDuration(video.duration) : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
