import { API_URL } from './api.js'
import { holeVideoMitTranskript, supabaseBereit } from './supabase.js'
import { useNutzer } from './auth.js'
import {
  zusammenfuehren,
  speichereVokabeln,
  speichereStatistik,
  speichereFortschritt,
} from './sync.js'
import Login from './Login.jsx'
import NeuesPasswort from './NeuesPasswort.jsx'
import { Impressum, Datenschutz, AGB } from './Recht.jsx'
import Willkommen from './Willkommen.jsx'
import { seitenaufruf } from './messung.js'
import Onboarding from './Onboarding.jsx'
import Logo from './Logo.jsx'
import { useState, useEffect, useRef } from 'react'

/** Zieht die YouTube-ID aus einem Link oder gibt eine reine ID zurück. */
function videoIdAusEingabe(eingabe) {
  const text = String(eingabe).trim()
  if (/^[\w-]{11}$/.test(text)) return text
  const treffer = text.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)
  return treffer ? treffer[1] : null
}
import Trainer from './Trainer.jsx'
import Library from './Library.jsx'
import VocabGenerator from './VocabGenerator.jsx'
import Settings from './Settings.jsx'
import Lessons from './Lessons.jsx'
import Home, { Leitfaden } from './Home.jsx'
import { naechsteLektion } from './lektionen.js'

// Der Name der App – an dieser einen Stelle änderbar
export const APP_NAME = 'Habloo'
import { newEntry, withSrsDefaults, isDue } from './srs.js'
import {
  XP,
  loadProgress,
  applyXp,
  levelFromXp,
  xpForLevel,
  levelName,
} from './gamification.js'
import { hakeAb } from './tagesplan.js'
import './App.css'

// Moderne Icons für die Menüleiste (schlanke SVG-Zeichnungen im Lucide-Stil)
const ICONS = {
  start: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
    </svg>
  ),
  trainer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="8" width="13" height="13" rx="2.5" />
      <path d="M8 8V6a2.5 2.5 0 0 1 2.5-2.5h8A2.5 2.5 0 0 1 21 6v8a2.5 2.5 0 0 1-2.5 2.5H16" />
    </svg>
  ),
  bibliothek: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4v16" />
      <path d="M9 4v16" />
      <path d="M13.5 5.2l4.6 1.2-3.9 14.4-4.6-1.2z" />
    </svg>
  ),
  lektionen: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 9.5L12 4.5 2 9.5l10 5 10-5z" />
      <path d="M6 11.8V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.2" />
    </svg>
  ),
  mehr: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
}

// Lektions-Fortschritt aus dem Browser-Speicher laden
function loadLessonProgress() {
  try {
    return JSON.parse(localStorage.getItem('lektionen')) || {}
  } catch {
    return {}
  }
}

// Einstellungen aus dem Browser-Speicher laden (mit sinnvollen Standardwerten)
function loadSettings() {
  try {
    return {
      tagesziel: 30,
      erinnerungen: true,
      ...JSON.parse(localStorage.getItem('einstellungen')),
    }
  } catch {
    return { tagesziel: 30, erinnerungen: true }
  }
}

// ---------------------------------------------------------------
//  Wie weit man in einem Video schon gekommen ist (in Prozent)
// ---------------------------------------------------------------
export function ladeVideoFortschritt() {
  try {
    return JSON.parse(localStorage.getItem('videoFortschritt')) || {}
  } catch {
    return {}
  }
}

// Wird beim Abspielen laufend aufgerufen – deshalb nur schreiben,
// wenn sich der Wert um mindestens einen Prozentpunkt geändert hat.
let letzterFortschritt = {}
function merkeFortschritt(videoId, prozent, sekunden) {
  if (letzterFortschritt[videoId] === prozent) return
  letzterFortschritt[videoId] = prozent
  const alle = ladeVideoFortschritt()
  // Prozent fuer die Kachel, Sekunden zum Weiterschauen. Aeltere
  // Eintraege sind nur eine Zahl – die lesen wir weiter unten ab.
  alle[videoId] = { prozent, sekunden: Math.round(sekunden) }
  localStorage.setItem('videoFortschritt', JSON.stringify(alle))
}

/** Wie weit war man in diesem Video? Versteht auch alte Eintraege. */
export function standVon(videoId) {
  const eintrag = ladeVideoFortschritt()[videoId]
  if (typeof eintrag === 'number') return { prozent: eintrag, sekunden: 0 }
  return { prozent: eintrag?.prozent ?? 0, sekunden: eintrag?.sekunden ?? 0 }
}

// Gespeicherte Videos aus dem Browser-Speicher laden
function loadSavedVideos() {
  try {
    return JSON.parse(localStorage.getItem('videos')) || []
  } catch {
    return []
  }
}

// Wörter werden im Browser gespeichert (localStorage), damit sie beim
// nächsten Besuch noch da sind. Status: "neu" (blau), "lernen" (gelb), "gewusst".
function loadVocab() {
  try {
    return JSON.parse(localStorage.getItem('vokabeln')) || {}
  } catch {
    return {}
  }
}

// Der Grammatik-Karteikasten liegt getrennt von den Vokabeln:
// { bausteinId: srsEintrag }. Getrennt, weil die Schluessel sonst
// kollidieren koennten – eine Vokabel "tener" und der Baustein
// "tener" waeren im selben Objekt dasselbe Feld.
function loadBausteine() {
  try {
    return JSON.parse(localStorage.getItem('bausteine')) || {}
  } catch {
    return {}
  }
}

// Macht aus einem Wort eine saubere Kleinschreibung ohne Satzzeichen,
// damit "Hola," und "hola" als dasselbe Wort zählen.
function cleanWord(word) {
  return word.toLowerCase().replace(/[^a-záéíóúüñ]/gi, '')
}

// Lädt die YouTube-Player-API (einmalig). Über sie erfahren wir,
// an welcher Sekunde das Video gerade ist.
let ytApiPromise = null
function loadYouTubeApi() {
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve) => {
      if (window.YT?.Player) return resolve(window.YT)
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
      window.onYouTubeIframeAPIReady = () => resolve(window.YT)
    })
  }
  return ytApiPromise
}

export default function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [video, setVideo] = useState(null) // { videoId, title, lines }
  const [vocab, setVocab] = useState(loadVocab)
  const [bausteinStand, setBausteinStand] = useState(loadBausteine)
  const [selected, setSelected] = useState(null) // { word, translation, loading }
  const [cardExit, setCardExit] = useState(null) // 'lernen'|'gewusst' – Erfolgs-Animation der Wortkarte
  const [genOpen, setGenOpen] = useState(false) // Vokabelgenerator-Panel offen?
  const [saveOpen, setSaveOpen] = useState(false) // Speichern-Panel offen?
  const [showDe, setShowDe] = useState(false) // deutsche Übersetzung eingeblendet?
  const [deLines, setDeLines] = useState(null) // die übersetzten Zeilen
  const [deLoading, setDeLoading] = useState(false)
  // Warum ein Fehlerzustand: Frueher wurde ein Fehlschlag stumm
  // verschluckt. Der Schalter sprang um, es passierte nichts, und
  // niemand konnte wissen, ob der Dienst hakt oder man selbst etwas
  // falsch gemacht hat. Genau so ist der Google-Ausfall wochenlang
  // unbemerkt geblieben.
  const [deFehler, setDeFehler] = useState('')
  const [activeLine, setActiveLine] = useState(-1) // welche Zeile gerade gesprochen wird
  const [autoScroll, setAutoScroll] = useState(true)
  const [laeuft, setLaeuft] = useState(false) // spielt das Video gerade?
  const [tempo, setTempo] = useState(1) // Abspielgeschwindigkeit
  const [weiterAb, setWeiterAb] = useState(null) // Hinweis "weiter bei ..."
  const [aktuelleArt, setAktuelleArt] = useState('video') // 'video' | 'musik'
  // Kommt der Nutzer von Spotify zurueck (Adresse /spotify?code=...),
  // starten wir gleich im Songs-Bereich – sonst landet er auf der
  // Startseite und der Code wird nie eingeloest.
  const [view, setView] = useState(() =>
    new URLSearchParams(window.location.search).get('code') ? 'videos' : 'start'
  ) // 'start', 'lesen', 'lektionen', 'trainer', 'videos', 'mehr'
  const [savedVideos, setSavedVideos] = useState(loadSavedVideos)
  const [categoryInput, setCategoryInput] = useState('')
  const [progress, setProgress] = useState(loadProgress) // XP, Streak, letzter Lerntag
  const [settings, setSettings] = useState(loadSettings) // Tagesziel, Erinnerungen …
  const [lessonProgress, setLessonProgress] = useState(loadLessonProgress) // welche Lektionen geschafft sind

  const [levelUp, setLevelUp] = useState(null) // welches Level gerade erreicht wurde
  const prevLevelRef = useRef(levelFromXp(loadProgress().xp))

  // ---------- Konto & Abgleich ----------
  const { nutzer, laedt: nutzerLaedt, passwortNeuSetzen, passwortGesetzt } = useNutzer()

  // Das Onboarding laeuft genau EINMAL, und zwar je Konto. Der
  // Schluessel traegt die Nutzerkennung: Wer sich auf demselben
  // Geraet mit einem zweiten Konto anmeldet, ist ein neuer Mensch und
  // bekommt seine eigenen drei Fragen.
  const [onboardingFertig, setOnboardingFertig] = useState(false)
  // Laeuft gerade der Trichter VOR der Anmeldung?
  const [trichterOffen, setTrichterOffen] = useState(false)
  // Welche Pflichtseite ist offen? Bewusst getrennt von `view`:
  // Sie muss auch VOR der Anmeldung erreichbar sein, und dort
  // gibt es `view` noch gar nicht.
  const [rechtSeite, setRechtSeite] = useState(null)

  // Der Cookie-Banner haengt neben <App/> im Baum (App steigt fuer
  // Abgemeldete frueh aus), kann also keine Prop bekommen. Deshalb
  // meldet er sich ueber ein Fenster-Ereignis.
  useEffect(() => {
    const auf = (e) => setRechtSeite(e.detail)
    window.addEventListener('recht', auf)
    return () => window.removeEventListener('recht', auf)
  }, [])

  // Jeden Ansichtswechsel an die Messung melden.
  //
  // Ohne das zaehlte Google genau EINEN Seitenaufruf pro Sitzung:
  // Habloo hat keinen Router, die Adresse in der Leiste aendert sich
  // nie. Wer zwei Stunden durch die App geht, saehe in der Statistik
  // aus wie jemand, der sofort wieder weg ist.
  useEffect(() => {
    seitenaufruf(view)
  }, [view])

  // Das Paket aus dem Trichter überlebt die Anmeldung im Speicher des
  // Geräts. Es MUSS dort liegen und nicht im Zustand: Zwischen "Konto
  // anlegen" und der fertigen Sitzung liegt bei Supabase je nach
  // Einstellung eine Bestätigungs-Mail und ein neuer Seitenaufruf.
  const PAKET_SCHLUESSEL = 'startpaket:offen'

  function merkeOffenesPaket(antworten, paket) {
    try {
      localStorage.setItem(PAKET_SCHLUESSEL, JSON.stringify({ antworten, paket }))
    } catch { /* dann geht das Paket eben verloren, nicht die Anmeldung */ }
  }

  function holeOffenesPaket() {
    try {
      const roh = localStorage.getItem(PAKET_SCHLUESSEL)
      return roh ? JSON.parse(roh) : null
    } catch {
      return null
    }
  }


  useEffect(() => {
    if (!nutzer) return setOnboardingFertig(false)
    let schonDurch = true
    try {
      schonDurch = localStorage.getItem('onboarding:' + nutzer.id) === 'fertig'
    } catch {
      // Kein Speicher (privater Modus): dann lieber durchlassen als
      // jemanden im Onboarding einsperren.
      schonDurch = true
    }

    // Frisch angemeldet und ein Paket aus dem Trichter liegt bereit:
    // einräumen und den Trichter NICHT noch einmal zeigen.
    if (!schonDurch) {
      const offen = holeOffenesPaket()
      if (offen?.paket) {
        onboardingFertigMachen(offen.antworten, offen.paket)
        try { localStorage.removeItem(PAKET_SCHLUESSEL) } catch { /* egal */ }
        return
      }
    }
    setOnboardingFertig(schonDurch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nutzer])

  function merkeOnboarding() {
    try {
      if (nutzer) localStorage.setItem('onboarding:' + nutzer.id, 'fertig')
    } catch { /* dann gilt es nur fuer diese Sitzung */ }
    setOnboardingFertig(true)
  }

  /**
   * Das Onboarding ist durch: Tagesziel uebernehmen, das Startpaket
   * einraeumen.
   *
   * Die Woerter landen im Trainer, Video und Song in der Mediathek –
   * genau dort, wo sie hingehoeren. Wer gleich danach auf "Trainer"
   * tippt, findet etwas vor, statt einer leeren Seite.
   */
  function onboardingFertigMachen(antworten, paket) {
    if (antworten?.ziel) {
      setSettings((s) => ({ ...s, tagesziel: antworten.ziel }))
    }
    if (paket?.vokabeln?.length) {
      addVocabWords(
        paket.vokabeln.map((w) => ({
          wort: w.wort,
          uebersetzung: w.uebersetzung,
          quelle: 'Startpaket',
        }))
      )
    }
    const neueVideos = [
      paket?.video && { ...paket.video, art: 'video', category: 'Startpaket' },
      paket?.song && { ...paket.song, art: 'musik', category: 'Startpaket' },
    ].filter(Boolean)
    if (neueVideos.length) {
      setSavedVideos((liste) => [
        ...liste,
        ...neueVideos
          .filter((v) => !liste.some((x) => x.videoId === v.videoId))
          .map((v) => ({
            videoId: v.videoId,
            title: v.title,
            category: v.category,
            art: v.art,
            addedAt: Date.now(),
          })),
      ])
    }
    merkeOnboarding()
  }
  const [loginOffen, setLoginOffen] = useState(false)
  const [loginStart, setLoginStart] = useState('anmelden') // womit der Dialog aufgeht
  const [syncStatus, setSyncStatus] = useState('') // '' | 'laeuft' | 'fertig' | Fehlertext
  const angemeldetRef = useRef(null) // verhindert doppeltes Zusammenführen

  // Nach dem Anmelden: lokale und gespeicherte Daten zusammenführen
  useEffect(() => {
    if (!nutzer || angemeldetRef.current === nutzer.id) return
    angemeldetRef.current = nutzer.id

    let abgebrochen = false
    setSyncStatus('laeuft')

    zusammenfuehren(nutzer.id, {
      vokabeln: vocab,
      stats: progress,
      fortschritt: lessonProgress,
    })
      .then((vereint) => {
        if (abgebrochen) return
        setVocab(vereint.vokabeln)
        setProgress((p) => ({ ...p, ...vereint.stats }))
        setLessonProgress(vereint.fortschritt)
        setSyncStatus('fertig')
      })
      .catch((f) => {
        if (!abgebrochen) setSyncStatus(f.message)
      })

    return () => { abgebrochen = true }
  }, [nutzer])

  // Beim Abmelden wieder auf reinen Browser-Betrieb umstellen
  useEffect(() => {
    if (!nutzer) {
      angemeldetRef.current = null
      setSyncStatus('')
    }
  }, [nutzer])

  const playerRef = useRef(null) // der YouTube-Player
  const lineRefs = useRef([]) // die Zeilen-Elemente, damit wir hinscrollen können
  const textPaneRef = useRef(null) // der scrollbare Text-Kasten

  // Bei jeder Änderung die Vokabeln speichern – im Browser sofort,
  // in der Datenbank kurz verzögert (damit nicht bei jedem Tastendruck
  // eine Anfrage rausgeht)
  // Der Grammatik-Karteikasten wird nur lokal gehalten. Er haengt an
  // den Lektionen, die ohnehin schon synchronisiert werden – und ein
  // eigener Tabellen-Anbau in Supabase waere fuer 55 Zahlenpaare
  // mehr Aufwand als Nutzen.
  useEffect(() => {
    localStorage.setItem('bausteine', JSON.stringify(bausteinStand))
  }, [bausteinStand])

  useEffect(() => {
    localStorage.setItem('vokabeln', JSON.stringify(vocab))

    if (!nutzer || syncStatus === 'laeuft') return
    const timer = setTimeout(() => {
      speichereVokabeln(nutzer.id, vocab).catch((f) =>
        console.warn('Vokabeln konnten nicht gesichert werden:', f.message)
      )
    }, 1500)
    return () => clearTimeout(timer)
  }, [vocab, nutzer, syncStatus])

  // Gespeicherte Videos ebenfalls im Browser sichern
  useEffect(() => {
    localStorage.setItem('videos', JSON.stringify(savedVideos))
  }, [savedVideos])

  // Einstellungen sichern
  useEffect(() => {
    localStorage.setItem('einstellungen', JSON.stringify(settings))
  }, [settings])

  // Lektions-Fortschritt sichern
  useEffect(() => {
    localStorage.setItem('lektionen', JSON.stringify(lessonProgress))
  }, [lessonProgress])

  // Statistik (XP, Level, Serie) in der Datenbank nachziehen
  useEffect(() => {
    if (!nutzer || syncStatus === 'laeuft') return
    const timer = setTimeout(() => {
      speichereStatistik(nutzer.id, {
        xp: progress.xp,
        level: levelFromXp(progress.xp),
        streak: progress.streak,
        lastDay: progress.lastDay,
        xpToday: progress.xpToday,
      }).catch((f) => console.warn('Statistik nicht gesichert:', f.message))
    }, 1500)
    return () => clearTimeout(timer)
  }, [progress, nutzer, syncStatus])

  // Eine Lektion wurde abgeschlossen: merken und die Wörter der Lektion
  // in den Vokabeltrainer übernehmen (Status "Lernen")
  function lektionGeschafft(lektion) {
    setLessonProgress((p) => ({ ...p, [lektion.id]: { fertig: true } }))
    if (nutzer) {
      speichereFortschritt(nutzer.id, lektion.id).catch((f) =>
        console.warn('Lektion nicht gesichert:', f.message)
      )
    }
    setVocab((v) => {
      const copy = { ...v }
      for (const item of lektion.items) {
        const key = item.es.toLowerCase()
        if (!copy[key]) {
          copy[key] = {
            ...newEntry(item.de, 'Lektion: ' + lektion.titel),
            status: 'lernen',
          }
        }
      }
      return copy
    })
  }

  // Fortschritt (XP & Streak) sichern und Level-Aufstieg erkennen
  useEffect(() => {
    localStorage.setItem('fortschritt', JSON.stringify(progress))
    const level = levelFromXp(progress.xp)
    if (level > prevLevelRef.current) setLevelUp(level)
    prevLevelRef.current = level
  }, [progress])

  // Level-Up-Feier nach ein paar Sekunden automatisch ausblenden
  useEffect(() => {
    if (!levelUp) return
    const timer = setTimeout(() => setLevelUp(null), 3200)
    return () => clearTimeout(timer)
  }, [levelUp])

  // XP gutschreiben (pflegt automatisch auch die Tagesserie)
  function addXp(amount) {
    setProgress((p) => applyXp(p, amount))
  }

  // Wenn ein Video geladen wurde: YouTube-Player erstellen
  useEffect(() => {
    if (!video) return
    let cancelled = false
    loadYouTubeApi().then((YT) => {
      if (cancelled) return
      playerRef.current = new YT.Player('yt-player', {
        videoId: video.videoId,
        playerVars: { rel: 0 },
        events: {
          // Damit der Pause-Knopf immer das richtige Symbol zeigt –
          // auch wenn direkt im Player geklickt wird (1 = läuft)
          onStateChange: (e) => setLaeuft(e.data === 1),
          onReady: (e) => {
            setLaeuft(false)
            setTempo(1)
            // Dort weitermachen, wo man aufgehoert hat. Nur wenn man
            // wirklich mittendrin war: Die ersten 10 Sekunden lohnen
            // sich nicht, und ab 95 % faengt man lieber neu an.
            const { prozent, sekunden } = standVon(video.videoId)
            if (sekunden > 10 && prozent < 95) {
              e.target.seekTo(sekunden, true)
              setWeiterAb(sekunden)
              setTimeout(() => setWeiterAb(null), 4000)
            }
          },
        },
      })
    })
    return () => {
      cancelled = true
      playerRef.current?.destroy?.()
      playerRef.current = null
      setActiveLine(-1)
    }
  }, [video])

  // Alle 300ms nachschauen, wo das Video gerade ist,
  // und die passende Textzeile aktiv setzen
  useEffect(() => {
    if (!video) return
    const timer = setInterval(() => {
      const player = playerRef.current
      if (!player?.getCurrentTime) return
      const t = player.getCurrentTime()
      // Die letzte Zeile finden, die schon angefangen hat
      let idx = -1
      for (let i = 0; i < video.lines.length; i++) {
        if (video.lines[i].start <= t) idx = i
        else break
      }
      setActiveLine(idx)

      // Fortschritt merken, damit die Video-Kachel zeigt, wie weit man ist
      const dauer = player.getDuration?.() ?? 0
      if (dauer > 0) {
        merkeFortschritt(video.videoId, Math.min(100, Math.round((t / dauer) * 100)), t)
      }
    }, 300)
    return () => clearInterval(timer)
  }, [video])

  // Wenn sich die aktive Zeile ändert: den Text-Kasten sanft dorthin scrollen
  // (nur den Kasten, nicht die ganze Seite)
  useEffect(() => {
    if (!autoScroll || activeLine < 0) return
    const box = textPaneRef.current
    if (!box) return

    // Die Zeile direkt aus dem DOM holen statt über eine gespeicherte
    // Referenz: React setzt Inline-Referenzen bei jedem Neuzeichnen
    // kurz auf null, und genau dann lief dieser Effekt ins Leere.
    const el = box.children[activeLine]
    if (!el) return

    const ziel = Math.max(0, el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2)

    // Sanft hingleiten – aber selbst gesteuert. Große Sprünge (etwa beim
    // Öffnen mittendrin) macht der Code sofort, kleine Schritte von Zeile
    // zu Zeile gleiten in ~300 ms.
    const start = box.scrollTop
    const weg = ziel - start
    if (Math.abs(weg) < 2) return
    if (Math.abs(weg) > 1200) {
      box.scrollTop = ziel
      return
    }

    const beginn = performance.now()
    const dauer = 300
    let abgebrochen = false

    function schritt(jetzt) {
      if (abgebrochen) return
      const anteil = Math.min(1, (jetzt - beginn) / dauer)
      // weiches Ein- und Ausgleiten
      const weich = anteil < 0.5 ? 2 * anteil * anteil : 1 - (-2 * anteil + 2) ** 2 / 2
      box.scrollTop = start + weg * weich
      if (anteil < 1) requestAnimationFrame(schritt)
    }
    requestAnimationFrame(schritt)

    // Läuft die nächste Zeile an, bricht die alte Bewegung ab
    return () => { abgebrochen = true }
  }, [activeLine, autoScroll])

  // Holt das Transkript zu einem Link oder einer Video-ID.
  // Erst wird in der Habloo-Mediathek nachgesehen (schnell und überall
  // verfügbar); nur wenn das Video dort fehlt, wird YouTube gefragt.
  async function fetchTranscript(input, art = 'video') {
    setLoading(true)
    setError('')
    setVideo(null)
    setSelected(null)
    setDeLines(null) // Übersetzung gehört zum alten Video
    setShowDe(false)

    try {
      // 1) Mediathek
      const id = videoIdAusEingabe(input)
      if (id && supabaseBereit) {
        const treffer = await holeVideoMitTranskript(id).catch(() => null)
        if (treffer?.transkript?.length) {
          setVideo({
            videoId: treffer.youtube_id,
            title: treffer.titel,
            lines: treffer.transkript.map((z) => ({
              text: z.text,
              start: z.start,
              end: z.start + (z.dauer ?? 0),
            })),
          })
          // Die deutsche Fassung liegt fertig in der Datenbank – dadurch
          // lässt sie sich ohne Wartezeit ein- und ausblenden.
          if (treffer.transkript_de?.length === treffer.transkript.length) {
            setDeLines(treffer.transkript_de)
          }
          return
        }
      }

      // 2) Sonst direkt bei YouTube nachfragen (klappt nur lokal)
      const res = await fetch(
        API_URL +
          '/api/transcript?url=' + encodeURIComponent(input) +
          (art === 'musik' ? '&art=musik' : '')
      )
      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(
          'Dieses Video ist noch nicht in der Habloo-Mediathek und der ' +
          'Transkript-Dienst ist gerade nicht erreichbar.'
        )
      }
      if (!res.ok) throw new Error(data.error)
      setVideo(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ---------- Steuerung des YouTube-Players ----------

  /** Startet oder pausiert das Video. */
  function spielPause() {
    const p = playerRef.current
    if (!p) return
    // 1 = läuft (YouTube-Zustandscode)
    if (p.getPlayerState?.() === 1) p.pauseVideo()
    else p.playVideo()
  }

  /** Springt um einige Sekunden vor oder zurück. */
  function springe(sekunden) {
    const p = playerRef.current
    if (!p?.getCurrentTime) return
    p.seekTo(Math.max(0, p.getCurrentTime() + sekunden), true)
  }

  /** Ändert die Abspielgeschwindigkeit (langsamer = leichter zu verstehen). */
  function setzeTempo(wert) {
    playerRef.current?.setPlaybackRate?.(wert)
    setTempo(wert)
  }

  // Beim Lesen eines Videos die Navigation ausblenden
  useEffect(() => {
    const liest = view === 'lesen' && Boolean(video)
    document.body.classList.toggle('liest-video', liest)
    return () => document.body.classList.remove('liest-video')
  }, [view, video])

  // Aus der Mediathek öffnen. "art" unterscheidet Song von Video –
  // damit ein Song später auch wieder unter Songs auftaucht.
  function openVideo(videoId, art = 'video') {
    hakeAb('video') // Schritt im Tagesplan erledigt
    setView('lesen')
    setAktuelleArt(art)
    fetchTranscript('https://www.youtube.com/watch?v=' + videoId, art)
  }

  // Eingefügter YouTube-Link aus dem Videobereich
  function openUrl(link) {
    setView('lesen')
    fetchTranscript(link)
  }

  // Übersetzung ein-/ausschalten – beim ersten Mal werden alle Zeilen
  // auf einen Schlag vom Server übersetzt und dann wiederverwendet
  async function toggleUebersetzung() {
    if (showDe) { setDeFehler(''); return setShowDe(false) }
    setShowDe(true)
    if (deLines || deLoading || !video) return
    setDeLoading(true)
    setDeFehler('')
    try {
      const res = await fetch(API_URL + '/api/translate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines: video.lines.map((l) => l.text) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Server antwortet mit ${res.status}`)
      setDeLines(data.uebersetzungen)
    } catch (f) {
      setDeFehler(f.message)
    } finally {
      setDeLoading(false)
    }
  }

  // Vokabeln von außen (z.B. aus einer Buchzusammenfassung) in den Trainer legen
  function addVocabWords(woerter) {
    setVocab((v) => {
      const copy = { ...v }
      for (const w of woerter) {
        const key = w.wort.toLowerCase()
        if (!copy[key]) {
          copy[key] = { ...newEntry(w.uebersetzung, w.quelle), status: 'lernen' }
        }
      }
      return copy
    })
  }

  // Aktuelles Video mit Kategorie in der Mediathek speichern
  function saveVideo() {
    if (!video) return
    setSavedVideos((list) => [
      ...list.filter((v) => v.videoId !== video.videoId),
      {
        videoId: video.videoId,
        title: video.title,
        category: categoryInput.trim(),
        art: aktuelleArt,
        addedAt: Date.now(),
      },
    ])
  }

  const currentSaved = video && savedVideos.find((v) => v.videoId === video.videoId)

  // Wenn man ein Wort anklickt: Übersetzung holen und Wort als "neu" merken
  async function clickWord(rawWord) {
    const word = cleanWord(rawWord)
    if (!word) return
    setSelected({ word, translation: '…', loading: true })

    // Wort merken, falls es noch nicht bekannt ist – mit dem Videotitel als Quelle,
    // damit man im Trainer sieht, aus welchem Video/Song das Wort stammt.
    // Für jedes neue Wort gibt es XP!
    if (!vocab[word]) addXp(XP.WORT_NEU)
    setVocab((v) => (v[word] ? v : { ...v, [word]: newEntry('', video?.title) }))

    try {
      const res = await fetch(API_URL + '/api/translate?q=' + encodeURIComponent(word))
      const data = await res.json()
      // Fehler NICHT in eine Uebersetzung verwandeln. Bis zum 23.08.
      // stand hier `data.translation || '(keine Übersetzung gefunden)'`
      // – und dieser Satz wurde als Bedeutung GESPEICHERT. Vier Woerter
      // in Manuels Wortschatz standen deshalb mit einer Fehlermeldung
      // als Uebersetzung im Trainer.
      if (!res.ok || !data.translation) {
        throw new Error(data.error || 'Der Übersetzungsdienst antwortet nicht.')
      }
      const translation = data.translation
      setSelected({ word, translation, fehler: '', loading: false })
      setVocab((v) => ({
        ...v,
        [word]: { ...(v[word] || newEntry('', video?.title)), translation },
      }))
    } catch (f) {
      // Das Wort bleibt gemerkt – aber ohne erfundene Bedeutung. Man
      // kann sie im Trainer selbst nachtragen, und beim naechsten
      // Antippen wird es erneut versucht.
      setSelected({ word, translation: '', fehler: f.message, loading: false })
    }
  }

  // "Lernen" oder "Gewusst" geklickt: Status setzen, XP feiern,
  // Erfolgs-Animation zeigen und die Karte danach sanft ausblenden
  function setStatus(word, status) {
    if (cardExit) return // Animation läuft gerade schon
    const entry = vocab[word]
    // XP gibt es nur, wenn sich der Status wirklich ändert (kein Doppelt-Kassieren)
    let earned = 0
    if (entry && entry.status !== status) {
      setVocab((v) => ({ ...v, [word]: { ...v[word], status } }))
      earned = status === 'gewusst' ? XP.SCHON_GEWUSST : XP.SAMMELN
      addXp(earned)
    }
    setCardExit({ status, earned })
    setTimeout(() => {
      setSelected(null)
      setCardExit(null)
    }, 1100) // so lange dauert die Erfolgs-Animation
  }

  // Klick auf die Zeit einer Zeile: Video an diese Stelle springen lassen
  function jumpTo(seconds) {
    playerRef.current?.seekTo?.(seconds, true)
  }

  const gelernt = Object.values(vocab).filter((v) => v.status === 'gewusst').length
  // Wie viele Vokabeln sind gerade zum Üben fällig? (für das rote Punkt-Badge im Tab)
  const faellig = Object.values(vocab).filter((v) => isDue(withSrsDefaults(v))).length

  // Level-Fortschritt für die Anzeige oben berechnen
  const level = levelFromXp(progress.xp)
  const levelStartXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  // Alle Kategorien, die schon vergeben wurden – für die Schnellauswahl
  const vorhandeneKategorien = [
    ...new Set(savedVideos.map((v) => v.category).filter(Boolean)),
  ].sort()

  const levelPercent = Math.round(
    ((progress.xp - levelStartXp) / (nextLevelXp - levelStartXp)) * 100
  )

  // Pflichtseiten zuerst: Impressum, Datenschutz und AGB muessen auch
  // ohne Konto erreichbar sein – sonst stehen sie hinter der Anmeldung,
  // und genau das waere der Fehler.
  if (rechtSeite) {
    const zu = () => setRechtSeite(null)
    if (rechtSeite === 'impressum') return <Impressum onZurueck={zu} />
    if (rechtSeite === 'datenschutz') return <Datenschutz onZurueck={zu} />
    if (rechtSeite === 'agb') return <AGB onZurueck={zu} />
  }

  // ---------- Zugang: ohne Konto geht es nicht weiter ----------
  if (supabaseBereit && !nutzer) {
    // Solange noch geprüft wird, ob eine Sitzung besteht: nichts zeigen,
    // damit die Willkommensseite nicht kurz aufblitzt
    if (nutzerLaedt) return <div className="app app-laedt" />

    // key sorgt dafür, dass der Dialog bei jedem Öffnen frisch
    // startet – sonst bliebe der zuletzt gewählte Modus stehen.
    const anmeldung = loginOffen && (
      <Login
        key={loginStart}
        startModus={loginStart}
        onSchliessen={() => setLoginOffen(false)}
      />
    )

    // Der Trichter läuft VOR der Anmeldung. Wer die drei Fragen
    // beantwortet hat, sieht sein Startpaket und ERST DANN das
    // Anmeldefenster – über dem Paket, nicht statt seiner. Das ist
    // der ganze Trick: Man legt kein Konto "für nichts" an, sondern
    // um etwas zu behalten, das schon da ist.
    if (trichterOffen) {
      return (
        <>
          <Onboarding
            kontoNoetig
            onFertig={(antworten, paket) => {
              merkeOffenesPaket(antworten, paket)
              setLoginStart('registrieren')
              setLoginOffen(true)
            }}
            onUeberspringen={() => setTrichterOffen(false)}
          />
          {anmeldung}
        </>
      )
    }

    return (
      <>
        <Willkommen
          onRecht={setRechtSeite}
          onStarten={() => setTrichterOffen(true)}
          onAnmelden={() => { setLoginStart('anmelden'); setLoginOffen(true) }}
        />
        {anmeldung}
      </>
    )
  }

  // ---------- Das Onboarding: genau einmal, direkt nach dem Konto ----------
  // Es steht NACH dem Zugangs-Tor: Ohne Konto gaebe es niemanden, dem
  // man das Startpaket zuordnen koennte. Und vor der App, weil die
  // drei Fragen ihre Antworten sofort brauchen – das Tagesziel gilt ab
  // dem ersten Bildschirm.
  if (nutzer && !onboardingFertig) {
    return (
      <Onboarding
        onFertig={onboardingFertigMachen}
        onUeberspringen={merkeOnboarding}
      />
    )
  }

  return (
    <div className="app">
      {/* Nach dem Klick in der Passwort-Mail: erst neues Passwort, dann App */}
      {passwortNeuSetzen && <NeuesPasswort onFertig={passwortGesetzt} />}

      {/* Feier-Einblendung beim Level-Aufstieg */}
      {levelUp && (
        <div className="levelup-overlay" onClick={() => setLevelUp(null)}>
          <div className="levelup-card">
            <div className="levelup-emoji">🎉</div>
            <h2>Level {levelUp} erreicht!</h2>
            <p>Du bist jetzt: {levelName(levelUp)}</p>
          </div>
        </div>
      )}

      <header className="topbar">
        {/* Klick aufs Logo führt immer zum Start */}
        <button className="logo" onClick={() => setView('start')}>
          <Logo />
          {APP_NAME}
        </button>
        <nav className="tabs">
          <button
            className={'tab ' + (view === 'start' ? 'tab-active' : '')}
            onClick={() => setView('start')}
          >
            <span className="tab-icon">{ICONS.start}</span>
            <span className="tab-label">Start</span>
          </button>
          <button
            className={'tab ' + (view === 'lektionen' ? 'tab-active' : '')}
            onClick={() => setView('lektionen')}
          >
            <span className="tab-icon">{ICONS.lektionen}</span>
            <span className="tab-label">Lektionen</span>
          </button>
          <button
            className={'tab ' + (view === 'trainer' ? 'tab-active' : '')}
            onClick={() => setView('trainer')}
          >
            <span className="tab-icon">
              {ICONS.trainer}
              {faellig > 0 && <span className="due-badge">{faellig}</span>}
            </span>
            <span className="tab-label">Trainer</span>
          </button>
          <button
            className={'tab ' + (view === 'videos' || view === 'lesen' ? 'tab-active' : '')}
            onClick={() => setView('videos')}
          >
            <span className="tab-icon">{ICONS.bibliothek}</span>
            <span className="tab-label">Mediathek</span>
          </button>
          <button
            className={'tab ' + (view === 'mehr' ? 'tab-active' : '')}
            onClick={() => setView('mehr')}
          >
            <span className="tab-icon">{ICONS.mehr}</span>
            <span className="tab-label">Mehr</span>
          </button>
        </nav>
        <div className="stats">
          {progress.streak > 0 && (
            <span className="streak" title={`${progress.streak} Tage in Folge gelernt`}>
              🔥 {progress.streak}
            </span>
          )}
          <div
            className="level-pill"
            title={`${Object.keys(vocab).length} Wörter · ${gelernt} gewusst · ${levelName(level)}`}
            role="img"
            aria-label={`Level ${level} – noch ${nextLevelXp - progress.xp} XP bis Level ${level + 1}`}
          >
            {/* key={xp} lässt den Kreis bei jedem XP-Gewinn kurz hüpfen */}
            <span className="level-circle" key={progress.xp}>
              {level}
            </span>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: levelPercent + '%' }} />
            </div>
            {/* Ausdruecklich als Level-Fortschritt benannt – sonst
                sieht es neben den Tages-XP wie ein zweites, konkurrierendes
                Punktesystem aus. */}
            <span className="xp-text">
              Noch {nextLevelXp - progress.xp} XP bis Level {level + 1}
            </span>
            {/* Auf dem Handy ist fuer den Satz kein Platz. Statt gar
                nichts – ein leerer grauer Balken sagt nichts aus –
                steht dort die Zahl, um die es geht. */}
            <span className="xp-text-kurz">{nextLevelXp - progress.xp} XP</span>
          </div>
        </div>
      </header>

      {view === 'start' && (
        <main>
          <Home
            progress={progress}
            settings={settings}
            counts={{
              faellig,
              woerter: Object.keys(vocab).length,
              videos: savedVideos.length,
            }}
            nextLesson={naechsteLektion(lessonProgress)}
            lessonProgress={lessonProgress}
            onNavigate={setView}
            onRecht={setRechtSeite}
          />
        </main>
      )}

      {view === 'trainer' && (
        <main>
          <Trainer
            vocab={vocab}
            setVocab={setVocab}
            addXp={addXp}
            bausteinStand={bausteinStand}
            setBausteinStand={setBausteinStand}
            lessonProgress={lessonProgress}
          />
        </main>
      )}

      {view === 'videos' && (
        <main>
          <Library
            savedVideos={savedVideos}
            setSavedVideos={setSavedVideos}
            onOpenVideo={openVideo}
            onLoadUrl={openUrl}
            onAddVocab={addVocabWords}
            vocab={vocab}
          />
        </main>
      )}

      {/* Der Leitfaden: eine eigene Seite, erreichbar vom Start */}
      {view === 'leitfaden' && (
        <main>
          <Leitfaden onNavigate={setView} onZurueck={() => setView('start')} />
        </main>
      )}

      {view === 'lektionen' && (
        <main>
          <Lessons
            lessonProgress={lessonProgress}
            addXp={addXp}
            onLessonComplete={lektionGeschafft}
          />
        </main>
      )}

      {view === 'mehr' && (
        <main>
          <Settings
            progress={progress}
            settings={settings}
            setSettings={setSettings}
            counts={{
              woerter: Object.keys(vocab).length,
              gelernt,
              videos: savedVideos.length,
            }}
            nutzer={nutzer}
            syncStatus={syncStatus}
            onLoginOeffnen={() => setLoginOffen(true)}
            onNavigate={setView}
          />
        </main>
      )}

      {view === 'lesen' && (
      <main>
        <button className="zurueck-knopf" onClick={() => setView('videos')}>
          ← Zu den Videos
        </button>

        {/* Statt "Lade Transkript…" ein Geruest, das schon so
            aussieht wie das, was gleich kommt. Wartezeit fuehlt
            sich kuerzer an, wenn man sieht, WAS geladen wird. */}
        {loading && (
          <div className="lade-geruest" aria-label="Video wird geladen" role="status">
            <div className="lade-buehne">
              <div className="lade-video schimmer" />
              <div className="lade-titel schimmer" />
              <div className="lade-knoepfe">
                <span className="schimmer" />
                <span className="schimmer" />
                <span className="schimmer" />
              </div>
              {/* Dieselbe Welle wie in der fertigen Ansicht – so
                  springt beim Umschalten nichts */}
              <svg className="buehnen-welle" viewBox="0 0 1200 90" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 44 C 180 88, 340 4, 560 30 C 760 54, 900 92, 1200 46 L1200 90 L0 90 Z" />
              </svg>
            </div>
            <div className="lade-zeilen">
              {[92, 64, 84, 72, 88, 56].map((breite, i) => (
                <div
                  key={i}
                  className="lade-zeile schimmer"
                  style={{ width: breite + '%', animationDelay: i * 0.09 + 's' }}
                />
              ))}
            </div>
            <p className="lade-text">Untertitel werden geholt …</p>
          </div>
        )}
        {error && <p className="error">{error}</p>}
        {!video && !loading && !error && (
          <div className="empty-reader">
            <h1>
              Kein Video <span className="accent">geladen</span>
            </h1>
            <p className="intro">
              Such dir im Videobereich ein Video aus oder füge dort einen
              YouTube-Link ein.
            </p>
            <button onClick={() => setView('videos')}>Zu den Videos</button>
          </div>
        )}

        {video && (
          <div className="reader">
            <div className="video-pane">
              {/* Oranger Verlauf mit Wellenkante: hebt Video und Titel
                  vom Lesetext ab, ohne eine harte Linie zu ziehen */}
              <div className="video-buehne">
                <svg className="buehnen-welle" viewBox="0 0 1200 90" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 44 C 180 88, 340 4, 560 30 C 760 54, 900 92, 1200 46 L1200 90 L0 90 Z" />
                </svg>
              </div>
              <div className="player-wrap">
                <div id="yt-player" />
              </div>

              {/* Warnen, wenn YouTube nur automatische Untertitel hat.
                  Bei Musik zerfallen die in Bruchstuecke – dann ist
                  ein anderes Video die bessere Wahl. */}
              {video.qualitaet?.stufe === 'schlecht' && (
                <p className="text-warnung">
                  ⚠️ Dieser Text stammt aus YouTubes automatischer
                  Spracherkennung und ist bei Musik oft zerstückelt.
                  Such lieber eine Fassung mit „Letra" im Titel – die
                  hat meist einen sauber getippten Text.
                </p>
              )}

              {/* Kurz einblenden, damit klar ist, warum das Video
                  nicht bei null anfaengt */}
              {weiterAb !== null && (
                <p className="weiter-hinweis">
                  ⏱ Weiter bei {Math.floor(weiterAb / 60)}:
                  {String(Math.round(weiterAb % 60)).padStart(2, '0')}
                  <button className="weiter-neu" onClick={() => { playerRef.current?.seekTo?.(0, true); setWeiterAb(null) }}>
                    Von vorn
                  </button>
                </p>
              )}
              <div className="video-kopf">
                <h2 className="video-titel">{video.title}</h2>
                <div className="video-aktionen">
                  <button
                    className={'video-aktion' + (showDe ? ' aktion-an' : '')}
                    onClick={toggleUebersetzung}
                    disabled={deLoading}
                  >
                    {deLoading ? 'Übersetze …' : 'Übersetzung'}
                  </button>
                  {deFehler && (
                    <span className="de-fehler" role="alert">
                      Übersetzung geht gerade nicht: {deFehler}
                    </span>
                  )}
                  <button
                    className="video-aktion"
                    onClick={() => { setGenOpen(!genOpen); setSaveOpen(false) }}
                  >
                    Vokabeln sammeln
                  </button>
                  <button
                    className={'video-aktion' + (currentSaved ? ' aktion-fertig' : '')}
                    onClick={() => { setSaveOpen(!saveOpen); setGenOpen(false) }}
                  >
                    {currentSaved ? 'Gemerkt' : 'Merken'}
                  </button>
                </div>
              </div>


              {currentSaved?.category && (
                <p className="saved-note">
                  <span className="category-badge">{currentSaved.category}</span>
                </p>
              )}

              {selected && (
                <div className={'word-card' + (cardExit ? ' word-card-exit' : '')}>
                  {cardExit ? (
                    /* Erfolgs-Ansicht: Häkchen/Stern + XP, dann verschwindet die Karte */
                    <div className="card-success">
                      <span className="success-icon">
                        {cardExit.status === 'gewusst' ? '⭐' : '✓'}
                      </span>
                      <div>
                        <div className="success-text">
                          {cardExit.status === 'gewusst'
                            ? 'Stark, das kannst du schon!'
                            : 'Gespeichert – ab in den Trainer!'}
                        </div>
                        {cardExit.earned > 0 && (
                          <div className="success-xp">+{cardExit.earned} XP</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="word-es">{selected.word}</div>
                      {selected.fehler ? (
                        <div className="word-fehler">
                          {selected.fehler}
                          <small>Das Wort ist gemerkt – die Bedeutung kannst du im Trainer nachtragen.</small>
                        </div>
                      ) : (
                        <div className="word-de">{selected.translation}</div>
                      )}
                      <div className="word-actions">
                        <button onClick={() => setStatus(selected.word, 'lernen')}>
                          Lernen
                        </button>
                        <button
                          className="btn-right"
                          onClick={() => setStatus(selected.word, 'gewusst')}
                        >
                          Gewusst ✓
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="text-pane" ref={textPaneRef}>
              {video.lines.map((line, i) => (
                <p
                  key={i}
                  ref={(el) => (lineRefs.current[i] = el)}
                  className={'line ' + (i === activeLine ? 'active' : '')}
                >
                  <span className="time" onClick={() => jumpTo(line.start)}>
                    {Math.floor(line.start / 60)}:{String(Math.floor(line.start % 60)).padStart(2, '0')}
                  </span>
                  {line.text.split(/\s+/).map((w, j) => {
                    const status = vocab[cleanWord(w)]?.status
                    // Das gerade angeklickte Wort bekommt eine kleine Plopp-Animation
                    const isActive = selected && cleanWord(w) === selected.word
                    return (
                      <span
                        key={j}
                        className={'word ' + (status || '') + (isActive ? ' word-active' : '')}
                        onClick={() => clickWord(w)}
                      >
                        {w}{' '}
                      </span>
                    )
                  })}
                  {/* Die deutsche Übersetzung der Zeile (per Klick zuschaltbar) */}
                  {showDe && deLines?.[i] && (
                    <span className="line-de">{deLines[i]}</span>
                  )}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ---------- Fußzeile: nur Abspielen und Tempo ---------- */}
        {video && (
          <div className="reader-fuss">
            <button
              className="fuss-spiel"
              onClick={spielPause}
              title={laeuft ? 'Pause' : 'Abspielen'}
              aria-label={laeuft ? 'Pause' : 'Abspielen'}
            >
              {/* Gezeichnete Symbole statt Emoji – die sehen auf jedem
                  Gerät gleich aus und lassen sich einfärben */}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {laeuft ? (
                  <>
                    <rect x="7" y="5" width="3.6" height="14" rx="1.4" />
                    <rect x="13.4" y="5" width="3.6" height="14" rx="1.4" />
                  </>
                ) : (
                  <path d="M8.5 5.6a1 1 0 0 1 1.52-.85l8.2 5.15a1.3 1.3 0 0 1 0 2.2l-8.2 5.15A1 1 0 0 1 8.5 16.4z" />
                )}
              </svg>
            </button>

            {/* Tempo in kleinen Schritten – langsamer hilft beim Verstehen */}
            <div className="tempo-steller">
              <button
                className="tempo-schritt"
                onClick={() => setzeTempo(Math.max(0.5, Math.round((tempo - 0.25) * 100) / 100))}
                disabled={tempo <= 0.5}
                title="Langsamer"
              >
                −
              </button>
              <span className="tempo-wert">{tempo}×</span>
              <button
                className="tempo-schritt"
                onClick={() => setzeTempo(Math.min(2, Math.round((tempo + 0.25) * 100) / 100))}
                disabled={tempo >= 2}
                title="Schneller"
              >
                +
              </button>
            </div>

            <button
              className={'fuss-knopf' + (autoScroll ? ' fuss-an' : '')}
              onClick={() => setAutoScroll(!autoScroll)}
              title="Text läuft mit dem Video mit"
            >
              Mitlaufen
            </button>
          </div>
        )}

        {/* Ein- und ausklappbare Bereiche zu den Fußzeilen-Aktionen */}
        {video && (
          <>

            {saveOpen && (
              <div className="fab-panel">
                <div className="fab-panel-head">
                  <b>{currentSaved ? 'In deiner Mediathek ✓' : 'Video speichern'}</b>
                  <button className="btn-plain" onClick={() => setSaveOpen(false)}>
                    ✕
                  </button>
                </div>
                {currentSaved ? (
                  <p className="row-hint">
                    Dieses Video ist gespeichert
                    {currentSaved.category ? ` – Kategorie „${currentSaved.category}“` : ''}.
                  </p>
                ) : (
                  <div className="save-form">
                    {/* Schon benutzte Kategorien zum Antippen – schneller
                        als tippen und hält die Namen einheitlich */}
                    {vorhandeneKategorien.length > 0 && (
                      <div className="kategorie-wahl">
                        {vorhandeneKategorien.map((c) => (
                          <button
                            key={c}
                            type="button"
                            className={
                              'kategorie-chip' + (categoryInput === c ? ' kategorie-aktiv' : '')
                            }
                            onClick={() => setCategoryInput(categoryInput === c ? '' : c)}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      placeholder={
                        vorhandeneKategorien.length
                          ? 'Oder neue Kategorie eingeben…'
                          : 'Kategorie, z.B. Musik'
                      }
                    />
                    <button
                      className="btn"
                      onClick={() => {
                        saveVideo()
                        setSaveOpen(false)
                      }}
                    >
                      Speichern
                    </button>
                  </div>
                )}
              </div>
            )}

            {genOpen && (
              <div className="fab-panel">
                <div className="fab-panel-head">
                  <b>Vokabelgenerator</b>
                  <button className="btn-plain" onClick={() => setGenOpen(false)}>
                    ✕
                  </button>
                </div>
                <VocabGenerator video={video} vocab={vocab} setVocab={setVocab} />
              </div>
            )}
          </>
        )}
      </main>
      )}

      {loginOffen && <Login onSchliessen={() => setLoginOffen(false)} />}
    </div>
  )
}
