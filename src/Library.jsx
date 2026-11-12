import GratisHinweis, { zurKasse } from './GratisHinweis.jsx'
import { usePremium, TESTPHASE_ALLES_FREI } from './premium.js'
import { API_URL, istApp } from './api.js'
import { ladeListen, neueListe } from './videoListen.js'
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

// Mediathek: weniger Kategorien und Videos (Manuel, 09.11.2026).
// Die alten Kategorien in der Datenbank bleiben – hier werden sie zu
// drei Gruppen zusammengefasst und je Gruppe auf MAX_JE_GRUPPE gekürzt.
// "gefunden" (von Nutzern geholte Videos) erscheint nicht mehr.
const MAX_JE_GRUPPE = 4
const GRUPPEN = [
  { wert: 'sprache', de: 'Spanisch lernen', en: 'Learn Spanish', kat: ['sprache'], icon: 'sprache' },
  { wert: 'koerper', de: 'Gesundheit & Sport', en: 'Health & sport', kat: ['gesundheit', 'sport', 'ernaehrung'], icon: 'gesundheit' },
  { wert: 'kopf', de: 'Kopf & Alltag', en: 'Mind & everyday life', kat: ['psychologie', 'stoizismus', 'produktivitaet'], icon: 'psychologie' },
]
// Feste Auswahl: je Gruppe abwechselnd aus jeder Unter-Kategorie (älteste
// zuerst), bis MAX_JE_GRUPPE erreicht sind. Dieselbe Regel nutzt das
// Übersetzungs-Skript – nur diese 12 Videos haben fertige Übersetzungen.
function gruppiere(bibliothek) {
  const alt = (a, b) => String(a.erstelltAm ?? a.erstellt_am ?? '').localeCompare(String(b.erstelltAm ?? b.erstellt_am ?? '')) || String(a.videoId ?? a.youtube_id).localeCompare(String(b.videoId ?? b.youtube_id))
  return GRUPPEN.map((g) => {
    const toepfe = g.kat.map((k) => bibliothek.filter((v) => v.kategorie === k).sort(alt))
    const videos = []
    for (let i = 0; videos.length < MAX_JE_GRUPPE && toepfe.some((t) => t[i]); i++) {
      for (const t of toepfe) if (t[i] && videos.length < MAX_JE_GRUPPE) videos.push(t[i])
    }
    return { ...g, videos }
  }).filter((g) => g.videos.length)
}
import { ladeVideoFortschritt, standVon } from './App.jsx'
import { useState, useEffect } from 'react'
import Inhalte from './Inhalte.jsx'
import { holeVerzeichnis } from './inhalte.js'
import { Kopf } from './MediathekUI.jsx'
import { BuchFormular, BuchZeilen, NiveauFilter, BuchLeser, BIBLIOTHEK, ladeBibliotheksbuch } from './Buecher.jsx'
import { sprache, useTexte } from './sprache.js'

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

// Ebooks vorerst ausgeblendet (24.08., Manuels Wunsch). Der ganze
// Bereich samt neuem Leser bleibt fertig im Code – diese eine Zeile
// holt ihn zurueck.
// Buch-Generator + Bibliothek seit 10.11.2026 für alle sichtbar
const EBOOKS_ZEIGEN = true

// Songs vorerst raus (16.10., Manuels Wunsch): In der Mediathek
// soll es nur um Videos gehen. Der ganze Songs-Bereich bleibt
// fertig im Code – diese eine Zeile holt ihn zurueck.
const SONGS_ZEIGEN = false

const BEREICHE = [
  { wert: 'videos', label: 'kat.videos' },
  ...(SONGS_ZEIGEN ? [{ wert: 'songs', label: 'kat.songs' }] : []),
  ...(HOERTEXTE_ZEIGEN ? [{ wert: 'hoertexte', label: 'kat.hoertexte' }] : []),
  ...(EBOOKS_ZEIGEN ? [{ wert: 'ebooks', label: 'kat.ebooks' }] : []),
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
    return JSON.parse(localStorage.getItem('vorschlaege3'))
  } catch {
    return null
  }
}

// Fertige Suchvorschläge zum Entdecken neuer Spanisch-Videos
const VORSCHLAEGE = [
  { label: '🎵 Musik', query: 'canciones en español con letra' },
  { label: 'ytm.fuerAnfaenger', query: 'spanish for beginners comprehensible input' },
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
export default function Library({ savedVideos: alleGemerkten, setSavedVideos, onOpenVideo, onLoadUrl, onAddVocab, vocab = {}, addXp }) {
  // Eigene YouTube-Videos: nur Premium (09.11.).
  const { premium: istPremium } = usePremium()
  // Gesperrt schon während des Ladens (Stand aus dem Speicher) – sonst blitzt das Formular auf
  const videosGesperrt = !istPremium && !TESTPHASE_ALLES_FREI
  const t = useTexte()
  // Songs werden im Songs-Bereich angezeigt, nicht hier.
  // Ältere Einträge haben noch kein "art" – die gelten als Video.
  const savedVideos = alleGemerkten.filter((v) => v.art !== 'musik')
  // Kommt der Nutzer von Spotify zurueck, gehoert er direkt zu den Songs –
  // dort wird der Code eingeloest und die Auswertung gestartet.
  const [bereich, setBereich] = useState(() =>
    SONGS_ZEIGEN && new URLSearchParams(window.location.search).get('code')
      ? 'songs'
      : 'videos'
  ) // 'videos', 'songs' oder 'ebooks'
  const [buecher, setBuecher] = useState(ladeBuecher)
  // Bücher vom anderen Gerät übernehmen, sobald der Abgleich sie bringt
  useEffect(() => {
    const neu = (e) => e.detail.includes('buecher') && setBuecher(ladeBuecher())
    window.addEventListener('geraetedaten', neu)
    return () => window.removeEventListener('geraetedaten', neu)
  }, [])
  const [buchNiveau, setBuchNiveau] = useState('alle') // Filter der Bibliothek
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
  // eslint-disable-next-line no-unused-vars

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
            erstelltAm: v.erstellt_am,
          }))
        )
      })
      .catch((f) => {
        if (!abgebrochen) setbibliothekFehler(f.message)
      })

    return () => { abgebrochen = true }
  }, [])

  // Ein neues Buch aus dem Generator (Buecher.jsx) ablegen und öffnen
  function buchFertig(buch) {
    const neu = [buch, ...buecher]
    setBuecher(neu)
    try { localStorage.setItem('buecher', JSON.stringify(neu)) } catch { /* voll */ }
    setOffenesBuch(buch)
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
        localStorage.setItem('vorschlaege3', JSON.stringify({ zeit: Date.now(), videos }))
      }
    } catch {
      // klappt es nicht, bleibt der Bereich einfach leer
    } finally {
      setEmpfehlungenLaden(false)
    }
  }

  // Alle Kategorien, die in den gespeicherten Videos vorkommen
  const [eigeneListen, setEigeneListen] = useState(ladeListen)
  const [neuOffen, setNeuOffen] = useState(false)
  const [neuName, setNeuName] = useState('')
  const categories = [...new Set([...eigeneListen, ...savedVideos.map((v) => v.category).filter(Boolean)])]

  function listeAnlegen(e) {
    e.preventDefault()
    const name = neuName.trim()
    if (!name) return
    setEigeneListen(neueListe(name))
    setFilter(name)
    setNeuName('')
    setNeuOffen(false)
  }

  // Ein gemerktes Video in eine andere Liste legen
  function verschiebe(videoId, liste) {
    setSavedVideos((alle) => alle.map((v) => (v.videoId === videoId ? { ...v, category: liste } : v)))
  }

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
      <BuchLeser
        buch={offenesBuch}
        onClose={() => setOffenesBuch(null)}
        onAddVocab={onAddVocab}
        addXp={addXp}
        vocab={vocab}
      />
    )
  }

  return (
    <div className="library">
      {/* Überschrift in jedem Bereich (10.11.: seit die Leiste „Mediathek“ heißt, braucht es sie auch bei den Videos) */}
      {(
        <>
        <h1 className="lib-kopf">
          {bereich === 'ebooks'
            ? <>{t('yt.buchTitel1')} <span className="accent">{t('yt.buchTitel2')}</span></>
            : <>{t('yt.titel1')} <span className="accent">{t('yt.titel2')}</span></>}
        </h1>
        <p className="lib-unter">
          {{
            videos: t('yt.untertitel'),
            songs: t('yt.songs'),
            hoertexte: t('yt.hoertexte'),
            ebooks: t('yt.ebooks'),
          }[bereich]}
        </p>
        </>
      )}

      {/* Der Umschalter – dieselbe Bauart wie Vokabeln|Grammatik im
          Trainer, damit die App an beiden Stellen gleich umschaltet. */}
      {/* Nur ein Bereich übrig? Dann braucht es keine Reiter. */}
      {BEREICHE.length > 1 && (
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
              {t(b.label)}
              {zahl != null && <span className="deck-zahl">{zahl}</span>}
            </button>
          )
        })}
      </div>
      )}

      {/* Der Schluessel ist Absicht: Wechselt der Bereich, baut React
          den Block neu auf – und die Einblend-Animation laeuft von
          vorn. Ohne ihn wuerde nur der Inhalt getauscht, und der
          Wechsel saehe aus wie ein Sprung. */}
      <div className="wechsel" key={bereich}>

      {/* ---------- Songs: Musik mit mitlaufendem Text ---------- */}
      {SONGS_ZEIGEN && bereich === 'songs' && (
        <Songs onOpenVideo={onOpenVideo} vocab={vocab} />
      )}

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
          <BuchFormular onFertig={buchFertig} />

          {/* Wie bei den Videos: erst die eigenen, dann die Bibliothek mit Filter */}
          {buecher.length > 0 && (
            <section className="bereich">
              <Kopf symbol={<IconLesezeichen groesse={19} />} titel={t('yt.eigeneBuecher')} text={t('yt.eigeneBuecherText')} zahl={buecher.length} />
              <BuchZeilen buecher={buecher} onOeffnen={setOffenesBuch} onLoeschen={loescheBuch} />
            </section>
          )}
          <section className="bereich">
            <Kopf symbol={<IconBuch groesse={19} />} titel={t('yt.bibliothek')} text={t('yt.bibliothekText')} zahl={BIBLIOTHEK.length} />
            <NiveauFilter buecher={BIBLIOTHEK} wert={buchNiveau} onWert={setBuchNiveau} />
            <BuchZeilen buecher={buchNiveau === 'alle' ? BIBLIOTHEK : BIBLIOTHEK.filter((b) => b.niveau === buchNiveau)} onOeffnen={(b) => ladeBibliotheksbuch(b).then(setOffenesBuch).catch(() => {})} />
          </section>

          {/* Die 89 älteren E-Books (spanisch-lernen.com): nur Premium – gratis gibt es die 6 der Bibliothek */}
          {(istPremium || TESTPHASE_ALLES_FREI) && <Inhalte art="lesetexte" onAddVocab={onAddVocab} vocab={vocab} ohneHero />}
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
      <VideoEngine
        gesperrt={videosGesperrt}
        bilder={savedVideos.slice(-5).reverse().map((v) => v.videoId)}
        wert={suchFeld}
        onWert={setSuchFeld}
        onSuche={(begriff) => {
          setStartBegriff(begriff.trim())
          setSucheOffen(true)
        }}
      />

      {/* ============ 2. GEMERKTE VIDEOS ============ */}
      {true && (
        <section className="bereich">
          <Kopf
            symbol={<IconLesezeichen groesse={19} />}
            titel={t('yt.deineListen')}
            text={t('lb9.gespeichertWeiter', { zahl: savedVideos.length })}
            aktion={
              savedVideos.length > SICHTBAR_GEMERKT ? (
                <button className="kopf-aktion" onClick={() => setAlleGemerkt((a) => !a)}>
                  {alleGemerkt ? t('lb9.weniger') : t('lb9.alleAnzeigen')}
                  <IconPfeil groesse={15} />
                </button>
              ) : null
            }
          />
          {/* Listen als Mappen (06.11.): antippen filtert, „Neue Liste“ legt eine an */}
          <div className="yt-regal">
            {neuOffen ? (
              <form className="mappe mappe-form" onSubmit={listeAnlegen}>
                <input autoFocus value={neuName} onChange={(e) => setNeuName(e.target.value)} placeholder={t('yt.listeName')} />
                <button type="submit" disabled={!neuName.trim()}>{t('yt.anlegen')}</button>
              </form>
            ) : (
              <button className="mappe mappe-neu" onClick={() => setNeuOffen(true)}>
                <span className="mappe-reiter" />
                <span className="mappe-koerper"><b>+</b><small>{t('yt.neueListe')}</small></span>
              </button>
            )}
            {['alle', ...categories].map((c, i) => {
              const videos = c === 'alle' ? savedVideos : savedVideos.filter((v) => v.category === c)
              const bild = videos[videos.length - 1]?.videoId
              return (
                <button
                  key={c}
                  className={'mappe mappe-f' + (i % 6) + (filter === c ? ' mappe-an' : '')}
                  onClick={() => setFilter(c)}
                >
                  <span className="mappe-reiter" />
                  {bild && <img className="mappe-blatt" src={`https://i.ytimg.com/vi/${bild}/mqdefault.jpg`} alt="" />}
                  <span className="mappe-koerper">
                    <b>{c === 'alle' ? t('yt.alleListe') : c}</b>
                    <small>{t('yt.videosZahl', { zahl: videos.length })}</small>
                  </span>
                </button>
              )
            })}
          </div>
          {filtered.length === 0 && <p className="row-hint yt-leer">{t('yt.listeLeer')}</p>}

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
                    <select
                      className="liste-wahl"
                      value={v.category || ''}
                      onChange={(e) => verschiebe(v.videoId, e.target.value)}
                    >
                      <option value="">{t('yt.ohneListe')}</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button
                      className="btn-delete"
                      title={t('ytk.ausDerMediathek')}
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
            titel={t('yt.fuerDich')}
            aktion={
              kategorie !== 'alle' ? (
                <button
                  className="kopf-aktion"
                  onClick={() => {
                    setKategorie('alle')
                    setSichtbareVideos(SCHRITT)
                  }}
                >
                  {t('yt3.alleAnsehen')} <IconPfeil groesse={15} />
                </button>
              ) : null
            }
            zahl={bibliothek && kategorie === 'alle' ? gruppiere(bibliothek).reduce((n, g) => n + g.videos.length, 0) : null}
          />

          {bibliothek && gruppiere(bibliothek).length > 1 && (
            <div className="themen-leiste">
              {[{ wert: 'alle', de: 'Alle', en: 'All', icon: 'alle' }, ...gruppiere(bibliothek)].map((k) => (
                <button
                  key={k.wert}
                  className={'thema' + (kategorie === k.wert ? ' thema-aktiv' : '')}
                  onClick={() => {
                    setKategorie(k.wert)
                    setSichtbareVideos(SCHRITT) // bei neuem Filter wieder oben anfangen
                  }}
                >
                  {(() => { const I = KATEGORIE_ICONS[k.icon]; return I ? <I groesse={15} /> : null })()}
                  {sprache() === 'en' ? k.en : k.de}
                </button>
              ))}
            </div>
          )}

          {bibliothekFehler && <p className="error">{bibliothekFehler}</p>}
          {!bibliothek && !bibliothekFehler && (
            <p className="intro">{t('ytk.ladeMediathek')}</p>
          )}

          {bibliothek && (() => {
            const gruppen = gruppiere(bibliothek)
            const gefiltert =
              kategorie === 'alle'
                ? gruppen.flatMap((g) => g.videos)
                : gruppen.find((g) => g.wert === kategorie)?.videos ?? []

            if (gefiltert.length === 0) {
              return <p className="intro">{t('yt3.nichtsDabei')}</p>
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
                    {t('yt.mehrAnzeigen', { zahl: rest })}
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


// ===============================================================
//  Die Video-Engine: Einstieg in die YouTube-Suche
// ===============================================================

const ENGINE_THEMEN = [
  ['Fußball', 'thema.fussball'],
  ['Kochen', 'thema.kochen'],
  ['Reisen', 'thema.reisen'],
  ['Musik', 'thema.musik'],
  ['Vlogs', 'thema.vlogs'],
  ['Psychologie', 'thema.psychologie'],
]

/**
 * Kein Formular, sondern das Aushängeschild der Mediathek: dunkle
 * Bühne mit Glühen, großem Suchfeld und Themen zum Antippen.
 */
function VideoEngine({ wert, onWert, onSuche, bilder = [], gesperrt = false }) {
  const t = useTexte()
  function absenden(e) {
    e.preventDefault()
    if (wert.trim()) onSuche(wert)
  }

  return (
    <section className="engine engine-toon">
      {/* Toon-Kopf (06.11., Mix aus V1 + H3): schwebende Vorschaubilder –
          die eigenen gemerkten Videos, sonst bunte Platzhalter */}
      <div className="et-flug" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={'et-bild et-b' + i}
            style={bilder[i] ? { backgroundImage: `url(https://i.ytimg.com/vi/${bilder[i]}/mqdefault.jpg)` } : undefined}
          >
            <i>▶</i>
          </span>
        ))}
        <i className="et-funke et-f1">✦</i>
        <i className="et-funke et-f2">✦</i>
      </div>


      <h2 className="engine-titel">
        {t('yt.heroTitel1')} <span>{t('yt.heroTitel2')}</span>
      </h2>
      <p className="engine-text">
{t('yt.heroText', { app: 'Habloo' })}
      </p>

      <ul className="engine-features">
        <li><b>{t('ytk.es')}</b> {t('yt.merkmal1')}</li>
        <li><b>↻</b> {t('yt.merkmal2')}</li>
        <li><b>✦</b> {t('yt.merkmal3')}</li>
      </ul>

      <GratisHinweis art="video" />

      {/* Eigene YouTube-Videos nur mit Premium (Manuel, 09.11.): Gratis
          gibt es die Mediathek, Suche und Link sind gesperrt. */}
      {gesperrt ? (
        <button type="button" className="engine-suche engine-zu" onClick={() => !istApp && zurKasse()} disabled={istApp}>
          <svg className="engine-lupe" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <rect x="5" y="10" width="14" height="10" rx="3" fill="currentColor" />
            <path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="2.6" fill="none" />
          </svg>
          <span>{sprache() === 'en' ? 'Search your own YouTube videos – with Premium' : 'Eigene YouTube-Videos suchen – mit Premium'}</span>
        </button>
      ) : (
        <>
        <form className="engine-suche" onSubmit={absenden}>
          <svg className="engine-lupe" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.4" />
            <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <input
            value={wert}
            onChange={(e) => onWert(e.target.value)}
            placeholder={t('yt.suchePlatzhalter')}
            enterKeyHint="search"
          />
          </form>
        <button type="button" className="engine-los" disabled={!wert.trim()} onClick={() => onSuche(wert)}>
          ✦ {t('yt.findenKnopf')}
        </button>
  
        <div className="engine-themen">
          {ENGINE_THEMEN.map(([wert, schluessel]) => (
            <button key={wert} type="button" onClick={() => { onWert(wert); onSuche(wert) }}>
              {t(schluessel)}
            </button>
          ))}
        </div>
        </>
      )}
    </section>
  )
}
