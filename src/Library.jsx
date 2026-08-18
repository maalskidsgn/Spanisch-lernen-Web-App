import { API_URL } from './api.js'
import { holeBibliothek, supabaseBereit } from './supabase.js'
import Ebooks from './Ebooks.jsx'
import { ladeVideoFortschritt } from './App.jsx'
import { useState, useEffect } from 'react'

// Die Niveau-Stufen der kuratierten Bibliothek
// Die Themen der Bibliothek – man lernt Spanisch nebenbei,
// während man etwas Interessantes schaut.
const KATEGORIEN = [
  { wert: 'alle', label: 'Alle', emoji: '✨' },
  { wert: 'sprache', label: 'Spanisch lernen', emoji: '🎓' },
  { wert: 'gesundheit', label: 'Gesundheit', emoji: '🩺' },
  { wert: 'sport', label: 'Sport', emoji: '🏃' },
  { wert: 'ernaehrung', label: 'Ernährung', emoji: '🥗' },
  { wert: 'produktivitaet', label: 'Produktivität', emoji: '⚡' },
  { wert: 'stoizismus', label: 'Stoizismus', emoji: '🏛' },
  { wert: 'psychologie', label: 'Psychologie', emoji: '🧠' },
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

// Die Bibliothek: Videos (Link laden, gespeichert, entdecken) und
// Bücher (KI-Zusammenfassungen wie bei Blinkist)
export default function Library({ savedVideos, setSavedVideos, onOpenVideo, onLoadUrl, onAddVocab, vocab = {} }) {
  const [bereich, setBereich] = useState('videos') // 'videos' oder 'buecher'
  const [buecher, setBuecher] = useState(ladeBuecher)
  const [buchTitel, setBuchTitel] = useState('')
  const [buchLaden, setBuchLaden] = useState(false)
  const [buchFehler, setBuchFehler] = useState('')
  const [offenesBuch, setOffenesBuch] = useState(null) // gerade geöffnete Zusammenfassung

  // ---------- Kuratierte Bibliothek aus der Datenbank ----------
  const [bibliothek, setBibliothek] = useState(null)
  const [fortschritt] = useState(ladeVideoFortschritt) // wie weit pro Video
  const [kategorie, setKategorie] = useState('alle')
  const [bibliothekFehler, setBibliothekFehler] = useState('')

  useEffect(() => {
    if (!supabaseBereit) return
    let abgebrochen = false

    setBibliothekFehler('')
    holeBibliothek(kategorie)
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
        if (!abgebrochen) setBibliothekFehler(f.message)
      })

    return () => { abgebrochen = true }
  }, [kategorie])

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
        Deine <span className="accent">Bibliothek</span>
      </h1>

      {/* Umschalter: Videos oder Bücher */}
      <div className="chips bereich-schalter">
        <button
          className={'chip ' + (bereich === 'videos' ? 'chip-active' : '')}
          onClick={() => setBereich('videos')}
        >
          🎬 Videos
        </button>
        <button
          className={'chip ' + (bereich === 'buecher' ? 'chip-active' : '')}
          onClick={() => setBereich('buecher')}
        >
          📚 Bücher
        </button>
      </div>

      {/* ---------- Bücher: Zusammenfassungen wie bei Blinkist ---------- */}
      {bereich === 'buecher' && <Ebooks onAddVocab={onAddVocab} vocab={vocab} />}

      {bereich === 'videos' && (
      <>
      {/* Eigenes Video laden – Transkripte holt der Server notfalls
          über einen Dienst, wenn YouTube ihn selbst abweist */}
      <form
        className="url-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (link.trim()) onLoadUrl(link.trim())
        }}
      >
        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="YouTube-Link einfügen…"
          required
        />
        <button type="submit">Laden</button>
      </form>

      {/* ---------- Gespeicherte Videos ---------- */}
      {savedVideos.length === 0 ? (
        <p className="intro">
          Noch keine Videos gemerkt. Öffne unten ein Video aus der Bibliothek
          und speichere es dort, um es hier wiederzufinden.
        </p>
      ) : (
        <>
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

          <div className="video-grid">
            {filtered.map((v) => (
              <div key={v.videoId} className="video-card">
                <img
                  src={`https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`}
                  alt=""
                  onClick={() => onOpenVideo(v.videoId)}
                />
                <div className="video-card-body">
                  <div className="video-card-title" onClick={() => onOpenVideo(v.videoId)}>
                    {v.title}
                  </div>
                  <div className="video-card-meta">
                    {v.category && <span className="category-badge">{v.category}</span>}
                    <button
                      className="btn-delete"
                      title="Aus der Bibliothek entfernen"
                      onClick={() => removeVideo(v.videoId)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------- Kuratierte Habloo-Bibliothek ---------- */}
      {supabaseBereit && (
        <>
          <div className="section-row">
            <h2 className="discover-title">
              Habloo-<span className="accent">Bibliothek</span>
            </h2>
            {bibliothek && (
              <span className="biblio-anzahl">{bibliothek.length} Videos</span>
            )}
          </div>
          <p className="intro">
            Spanisch lernen, während du etwas Spannendes schaust – jedes Video
            mit fertigem Transkript, ohne Wartezeit.
          </p>

          <div className="themen-leiste">
            {KATEGORIEN.map((k) => (
              <button
                key={k.wert}
                className={'thema' + (kategorie === k.wert ? ' thema-aktiv' : '')}
                onClick={() => setKategorie(k.wert)}
              >
                <span className="thema-emoji">{k.emoji}</span>
                {k.label}
              </button>
            ))}
          </div>

          {bibliothekFehler && <p className="error">{bibliothekFehler}</p>}
          {!bibliothek && !bibliothekFehler && (
            <p className="intro">Lade Bibliothek…</p>
          )}
          {bibliothek && bibliothek.length === 0 && (
            <p className="intro">Zu diesem Thema ist noch nichts dabei.</p>
          )}
          {bibliothek && bibliothek.length > 0 && (
            <div className="video-grid">
              {bibliothek.map((v) => (
                <div key={v.videoId} className="biblio-karte">
                  <span className={'niveau-badge niveau-' + v.niveau}>{v.niveau}</span>
                  {/* fortschritt zeigt, wie weit man im Video schon ist */}
                  <VideoKarte
                    video={v}
                    onOpen={onOpenVideo}
                    fortschritt={fortschritt[v.videoId] ?? 0}
                  />
                </div>
              ))}
            </div>
          )}
        </>
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
        ← Zur Bibliothek
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
