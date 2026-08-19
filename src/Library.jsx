import { API_URL } from './api.js'
import { holeBibliothek, supabaseBereit } from './supabase.js'
import Ebooks from './Ebooks.jsx'
import VideoSuche from './VideoSuche.jsx'
import Songs from './Songs.jsx'
import {
  IconAlle, IconSprache, IconGesundheit, IconSport, IconErnaehrung,
  IconProduktiv, IconStoa, IconPsyche, IconSuche,
  IconLesezeichen, IconStern, IconPfeil,
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
import { Hero, Kopf, SuchFeld } from './MediathekUI.jsx'

// Die Niveau-Stufen der kuratierten Mediathek
// Die Themen der Mediathek – man lernt Spanisch nebenbei,
// während man etwas Interessantes schaut.
// Der Bereich soll kurz bleiben: Filter oben, vier Videos darunter,
// Nachschub nur auf Wunsch.
const SCHRITT = 4

// So viele gemerkte Videos stehen ohne "Alle anzeigen" da
const SICHTBAR_GEMERKT = 4

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
  ) // 'videos', 'songs' oder 'buecher'
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
    e.preventDefault()
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

      {/* Umschalter: Videos, Songs oder Bücher */}
      <div className="chips bereich-schalter">
        {[
          { wert: 'videos', label: 'Videos' },
          { wert: 'songs', label: 'Songs' },
          { wert: 'hoertexte', label: 'Hörtexte' },
          { wert: 'lesetexte', label: 'Lesetexte' },
        ].map((b) => (
          <button
            key={b.wert}
            className={'chip ' + (bereich === b.wert ? 'chip-active' : '')}
            onClick={() => setBereich(b.wert)}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* ---------- Songs: Musik mit mitlaufendem Text ---------- */}
      {bereich === 'songs' && <Songs onOpenVideo={onOpenVideo} vocab={vocab} />}

      {/* ---------- Hörtexte und Lesetexte ----------
          Die beiden Bereiche, in denen nichts erzeugt wird: fertige
          Inhalte von spanisch-lernen.com. Videos und Songs bleiben
          die generativen Bereiche. */}
      {bereich === 'hoertexte' && (
        <Inhalte art="hoertexte" onAddVocab={onAddVocab} vocab={vocab} />
      )}
      {bereich === 'lesetexte' && (
        <Inhalte art="lesetexte" onAddVocab={onAddVocab} vocab={vocab} />
      )}

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
        titel="Finde dein nächstes Video"
        text="Gib auf Deutsch ein, worüber du etwas schauen willst – wir suchen passende spanische Videos dazu."
      >
        <SuchFeld
          wert={suchFeld}
          onWert={setSuchFeld}
          onAbsenden={() => {
            setStartBegriff(suchFeld.trim())
            setSucheOffen(true)
          }}
          platzhalter="z.B. gesunde Ernährung, Schlaf …"
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
            symbol={<IconStern groesse={19} />}
            titel="Ausgewählte Videos"
            zahl={bibliothek ? bibliothek.length : null}
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
                <div className="video-grid">
                  {sichtbar.map((v) => (
                    <div key={v.videoId} className="biblio-karte">
                      <span className={'niveau-badge niveau-' + v.niveau}>{v.niveau}</span>
                      <VideoKarte
                        video={v}
                        onOpen={onOpenVideo}
                        fortschritt={fortschritt[v.videoId] ?? 0}
                      />
                    </div>
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
