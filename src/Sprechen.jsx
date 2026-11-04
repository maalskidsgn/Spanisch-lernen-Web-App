/**
 * Der Sprach-Trainer: telefonieren mit Habla, der sich merkt, welche
 * Fehler man macht.
 *
 * Eigene Seite unter /sprechen, ohne Tab-Leiste: Wer spricht, soll
 * nicht aus Versehen wegtippen. Der Ton laeuft per WebRTC direkt zu
 * OpenAI, unser Server gibt nur den kurzlebigen Schluessel und wertet
 * danach das Protokoll aus.
 *
 * Zunaechst nur im Browser: In den Apps fehlt die Mikrofon-Freigabe,
 * die kommt mit dem naechsten Paket.
 */
import { useEffect, useRef, useState } from 'react'
import { API_URL, istApp } from './api.js'
import { db, supabaseBereit } from './supabase.js'
import { useTexte, sprache, gebiet } from './sprache.js'
import { spiele } from './audio.js'
import Logo from './Logo.jsx'

// -2: Seit das Protokoll gespeichert wird, braucht es eine neue Einwilligung.
const EINWILLIGUNG = 'sprechen-einwilligung-2'
const AKZENT_SPEICHER = 'sprechen-akzent'
const NIVEAU_SPEICHER = 'sprechen-niveau'
const AKZENTE = [
  { id: 'argentinien', flagge: '🇦🇷', name: 'spr.argentinien', ort: 'spr.argentinienOrt' },
  { id: 'mexiko', flagge: '🇲🇽', name: 'spr.mexiko', ort: 'spr.mexikoOrt' },
  { id: 'spanien', flagge: '🇪🇸', name: 'spr.spanien', ort: 'spr.spanienOrt' },
]
const NIVEAUS = ['A1', 'A2', 'B1', 'B2', 'C1']

async function api(pfad, body) {
  if (!supabaseBereit) throw new Error('anmelden')
  const { data } = await db.auth.getSession()
  const token = data?.session?.access_token
  if (!token) throw new Error('anmelden')
  const r = await fetch(API_URL + pfad, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: body ? JSON.stringify(body) : undefined,
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(d.error || r.statusText)
  return d
}

function lies(schluessel, ersatz) {
  try { return localStorage.getItem(schluessel) || ersatz } catch { return ersatz }
}
function merke(schluessel, wert) {
  try { localStorage.setItem(schluessel, wert) } catch { /* gilt dann nur jetzt */ }
}

// Sprechen bringt XP: je Minute, in der wirklich gesprochen wurde.
const XP_PRO_MINUTE = 90
// So lange vor dem Ende der Freiminuten kommt der Hinweis aufs Abo.
const HINWEIS_VOR_ENDE = 60

const zeit = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// Die Karte wandert mit jedem Wechsel zwischen Woertern, Saetzen und
// Texten neu in die Uebersicht. Gemerkt, damit sie dabei nicht flackert.
// Zusaetzlich gespeichert: Sonst erscheint die Karte bei jedem Start
// erst nach der Serverantwort und schiebt die Seite nach unten.
const TUER_SPEICHER = 'sprechen-tuer-frei'
let tuerFrei = lies(TUER_SPEICHER, '') === 'ja'

/** Die Karte ueber dem Trainer. Erscheint nur, wenn das Konto freigeschaltet ist. */
export function SprechenTuer() {
  const t = useTexte()
  const [erlaubt, setErlaubt] = useState(tuerFrei)
  useEffect(() => {
    if (istApp) return
    api('/api/sprechen/status')
      .then((d) => {
        tuerFrei = Boolean(d.erlaubt)
        merke(TUER_SPEICHER, tuerFrei ? 'ja' : 'nein')
        setErlaubt(tuerFrei)
      })
      .catch(() => {})
  }, [])
  if (!erlaubt || istApp) return null
  return (
    <button className="spr-tuer" onClick={() => window.dispatchEvent(new CustomEvent('sprechen-oeffnen'))}>
      <span className="spr-tuer-kreis" aria-hidden="true"><i /></span>
      <span className="spr-tuer-text">
        <small>{t('spr.tuerMarke')}</small>
        <b>{t('spr.tuerTitel')}</b>
        <span>{t('spr.tuerText')}</span>
        <span className="spr-tuer-punkte">
          <i>{t('spr.punktSprechen')}</i>
          <i>{t('spr.punktAuswertung')}</i>
          <i>{t('spr.punktLevel')}</i>
        </span>
      </span>
    </button>
  )
}


/** Die gespeicherten Gespräche: nachlesen, anhören, Wörter übernehmen. */
function Archiv({ onAddVocab, aktualisiert }) {
  const t = useTexte()
  const [liste, setListe] = useState(null)
  const [offen, setOffen] = useState(null)
  const [meldung, setMeldung] = useState('')

  useEffect(() => {
    api('/api/sprechen/gespraeche').then((d) => setListe(d.liste)).catch(() => setListe([]))
  }, [aktualisiert])

  async function oeffne(id) {
    setMeldung('')
    setOffen(await api('/api/sprechen/gespraech/' + id))
  }

  async function loesche() {
    if (!confirm(t('spr.archivFrage'))) return
    await api(`/api/sprechen/gespraech/${offen.id}/loeschen`, {})
    setListe((l) => l.filter((g) => g.id !== offen.id))
    setOffen(null)
  }

  async function nimmWort(roh, satz) {
    const wort = roh.replace(/[^\p{L}\p{M}'’-]/gu, '')
    if (!wort) return
    try {
      const d = await api(`/api/translate?q=${encodeURIComponent(wort)}&satz=${encodeURIComponent(satz.slice(0, 280))}&sprache=${sprache()}`)
      if (!d.translation) throw new Error('leer')
      onAddVocab?.([{ wort, uebersetzung: d.translation, quelle: t('spr.vokQuelle') }])
      setMeldung(t('spr.wortDa', { w0: wort, w1: d.translation }))
    } catch {
      setMeldung(t('spr.wortFehler', { w0: wort }))
    }
  }

  const datum = (x) => new Date(x).toLocaleDateString(gebiet(), { day: 'numeric', month: 'short', year: 'numeric' })

  if (offen) {
    return (
      <section className="spr-karte">
        <button className="btn-plain" onClick={() => setOffen(null)}>‹ {t('spr.archivZurueck')}</button>
        <h2 className="spr-archiv-titel">{datum(offen.beginn)}</h2>
        <p className="spr-klein">{offen.zusammenfassung}</p>
        <p className="spr-klein">{t('spr.archivHinweis')}</p>
        {meldung && <p className="spr-archiv-meldung">{meldung}</p>}
        <div className="spr-archiv-verlauf">
          {offen.verlauf.map((z, i) => (
            <div key={i} className={'spr-archiv-zeile' + (z.von === 'learner' ? ' ist-ich' : '')}>
              <button className="spr-archiv-ton" aria-label={t('spr.vorlesen')} onClick={() => spiele(z.text)}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" /><path d="M15.5 9a4 4 0 0 1 0 6" /></svg>
              </button>
              <p>
                {z.text.split(/\s+/).map((w, k) => (
                  <button key={k} className="spr-archiv-wort" onClick={() => nimmWort(w, z.text)}>{w}</button>
                ))}
              </p>
            </div>
          ))}
        </div>
        {offen.fehler?.length > 0 && (
          <ul className="spr-fehlerliste">
            {offen.fehler.map((f, i) => <li key={i}><s>{f.falsch}</s> <b>{f.richtig}</b><small>{f.erklaerung}</small></li>)}
          </ul>
        )}
        <button className="btn-plain spr-vergessen" onClick={loesche}>{t('spr.archivLoeschen')}</button>
      </section>
    )
  }

  return (
    <section className="spr-karte">
      <h2>{t('spr.archiv')}</h2>
      {!liste?.length ? (
        <p className="spr-klein">{t('spr.archivLeer')}</p>
      ) : (
        <div className="spr-archiv-liste">
          {liste.map((g) => (
            <button key={g.id} onClick={() => oeffne(g.id)}>
              <small>{datum(g.beginn)}</small>
              <span>{g.zusammenfassung}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export default function Sprechen({ onZurueck, addXp, onAddVocab }) {
  const t = useTexte()
  const [stand, setStand] = useState(null)
  const [phase, setPhase] = useState('start') // start | verbindet | laeuft | wertet | fertig
  const [fehler, setFehler] = useState('')
  const [akzent, setAkzent] = useState(() => lies(AKZENT_SPEICHER, 'argentinien'))
  const [niveau, setNiveau] = useState(() => lies(NIVEAU_SPEICHER, 'A2'))
  const [einverstanden, setEinverstanden] = useState(() => lies(EINWILLIGUNG, '') === 'ja')
  const [zeilen, setZeilen] = useState([]) // { id, von, text }
  const [wer, setWer] = useState('hoert') // hoert | ich | habla
  const [sekunden, setSekunden] = useState(0)
  const [ergebnis, setErgebnis] = useState(null)

  const [xpFlug, setXpFlug] = useState(null)
  const [xpSumme, setXpSumme] = useState(0)
  const [hinweisAbo, setHinweisAbo] = useState(false)
  const [woerterLive, setWoerterLive] = useState([]) // { wort, bedeutung }
  const [abgewaehlt, setAbgewaehlt] = useState(() => new Set())
  const [woerterGespeichert, setWoerterGespeichert] = useState(false)

  const [archivStand, setArchivStand] = useState(0)
  const leitung = useRef(null) // { pc, stream, audio, kanal, id, max, premium, gesprochen, hinweis }
  const zeilenRef = useRef([])
  const ende = useRef(null)
  const werRef = useRef('hoert')

  async function ladeStand() {
    try {
      setStand(await api('/api/sprechen/status'))
    } catch (f) {
      setFehler(f.message === 'anmelden' ? t('spr.anmelden') : f.message)
    }
  }
  useEffect(() => { ladeStand() }, [])

  // Tab zu oder Seite verlassen: Die Leitung darf nicht weiterlaufen,
  // jede offene Minute kostet Geld.
  useEffect(() => () => trenne(), [])

  // Tab zu: Der Server legt sofort auf, statt bis zur Grenze zu warten.
  useEffect(() => {
    function weg() {
      const l = leitung.current
      if (!l?.id || !l.token) return
      fetch(API_URL + '/api/sprechen/ende', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + l.token },
        body: JSON.stringify({
          id: l.id,
          sprache: sprache(),
          tokens: l.tokens,
          vokabeln: l.woerter,
          verlauf: zeilenRef.current.slice(-60).map(({ von, text }) => ({ von, text })),
        }),
      }).catch(() => {})
    }
    window.addEventListener('pagehide', weg)
    return () => window.removeEventListener('pagehide', weg)
  }, [])

  useEffect(() => { ende.current?.scrollIntoView({ block: 'end' }) }, [zeilen])

  // Die Uhr, und bei Erreichen der Grenze wird aufgelegt.
  useEffect(() => {
    if (phase !== 'laeuft') return
    const beginn = Date.now()
    let letzteMinute = 0
    const uhr = setInterval(() => {
      const s = Math.floor((Date.now() - beginn) / 1000)
      setSekunden(s)
      const l = leitung.current
      if (!l) return
      const minute = Math.floor(s / 60)
      if (minute > letzteMinute) {
        letzteMinute = minute
        // Nur wer in dieser Minute gesprochen hat, bekommt XP.
        if (l.gesprochen) {
          addXp?.(XP_PRO_MINUTE)
          setXpSumme((n) => n + XP_PRO_MINUTE)
          setXpFlug(minute)
        }
        l.gesprochen = false
      }
      if (!l.premium && !l.hinweis && s >= l.max - HINWEIS_VOR_ENDE) {
        l.hinweis = 'offen'
        setHinweisAbo(true)
        sagAboHinweis()
      }
      if (s >= l.max) auflegen()
    }, 500)
    return () => clearInterval(uhr)
  }, [phase])

  // Habla sagt selbst, dass die Freiminuten enden. Spricht sie gerade,
  // wartet der Hinweis bis zum Ende des Satzes.
  function sagAboHinweis() {
    const l = leitung.current
    if (!l || l.hinweis !== 'offen' || werRef.current === 'habla' || l.kanal?.readyState !== 'open') return
    l.hinweis = 'gesagt'
    const muttersprache = sprache() === 'en' ? 'English' : 'German'
    l.kanal.send(JSON.stringify({
      type: "response.create",
      response: {
        instructions:
          'The free minutes of this learner end in about one minute. Say warmly, in one very short Spanish sentence and then in ' + muttersprache +
          ': the free minutes for this month are almost used up, and with a Premium subscription they get two hours a month instead of ten minutes, ' +
          'so tap the button on the screen to keep going. Address the learner informally. Do not mention any price or website. Then carry on with the conversation.',
      },
    }))
  }

  // Der Knopf im Gespräch: sofort zurück in die eigene Sprache.
  function erklaeren() {
    const k = leitung.current?.kanal
    if (k?.readyState !== 'open') return
    const muttersprache = sprache() === 'en' ? 'English' : 'German'
    if (werRef.current === 'habla') {
      k.send(JSON.stringify({ type: "response.cancel" }))
      k.send(JSON.stringify({ type: "output_audio_buffer.clear" }))
    }
    setTimeout(() => {
      if (k.readyState !== 'open') return
      k.send(JSON.stringify({
        type: "response.create",
        response: { instructions: `The learner did not understand. Explain what you just said, simply and briefly, in ${muttersprache}. Then ask one easy question and continue at a level they can follow.` },
      }))
    }, 200)
  }

  // Was die KI während des Gesprächs auslöst.
  function antworteWerkzeug(callId, ergebnis) {
    leitung.current?.kanal?.send(JSON.stringify({
      type: "conversation.item.create",
      item: { type: 'function_call_output', call_id: callId, output: JSON.stringify(ergebnis) },
    }))
  }

  async function aufWerkzeug(e) {
    const l = leitung.current
    if (!l) return
    let args = {}
    try { args = JSON.parse(e.arguments || '{}') } catch { /* dann eben leer */ }
    if (e.name === 'merke_vokabel') {
      const wort = String(args.wort ?? '').trim()
      if (wort) {
        l.woerter = [...(l.woerter ?? []).filter((w) => w.wort !== wort), { wort, bedeutung: String(args.bedeutung ?? '') }]
        setWoerterLive(l.woerter)
      }
      antworteWerkzeug(e.call_id, { ok: true })
    } else if (e.name === 'suche_gespraeche') {
      l.suchen = (l.suchen ?? 0) + 1
      const ergebnis = await api('/api/sprechen/suche', { suchbegriff: args.suchbegriff }).catch(() => ({ treffer: [] }))
      l.suchen -= 1
      antworteWerkzeug(e.call_id, ergebnis)
      // Die Antwort der KI kam vor dem Suchergebnis: jetzt weitersprechen.
      if (l.schweigt) {
        l.schweigt = false
        l.kanal?.send(JSON.stringify({ type: "response.create" }))
      }
    }
  }

  function aufAntwortFertig(antwort) {
    const l = leitung.current
    if (!l || !antwort) return
    const u = antwort.usage
    if (u) {
      const d = u.input_token_details ?? {}
      const c = d.cached_tokens_details ?? {}
      const o = u.output_token_details ?? {}
      const summe = l.tokens ?? {}
      const dazu = { ein_audio: d.audio_tokens, ein_text: d.text_tokens, ein_cache_audio: c.audio_tokens, ein_cache_text: c.text_tokens, aus_audio: o.audio_tokens, aus_text: o.text_tokens }
      for (const k in dazu) summe[k] = (summe[k] ?? 0) + (dazu[k] ?? 0)
      l.tokens = summe
    }
    // Nur ein Werkzeug benutzt und nichts gesagt: sonst bliebe es still.
    const teile = antwort.output ?? []
    if (teile.length && teile.every((x) => x.type === 'function_call')) {
      if (l.suchen) l.schweigt = true
      else l.kanal?.send(JSON.stringify({ type: "response.create" }))
    }
  }

  function setzeZeilen(aenderung) {
    zeilenRef.current = aenderung(zeilenRef.current)
    setZeilen(zeilenRef.current)
  }
  // Zeilen stehen in der Reihenfolge, in der OpenAI sie anlegt. Der
  // Text kommt spaeter – beim Lernenden oft erst nach Hablas Antwort.
  function fuelle(id, von, text, dazu = false) {
    setzeZeilen((alt) => {
      const da = alt.find((z) => z.id === id)
      if (!da) return [...alt, { id, von, text }]
      return alt.map((z) => (z.id === id ? { ...z, text: dazu ? z.text + text : text } : z))
    })
  }

  function aufEreignis(e) {
    switch (e.type) {
      case 'conversation.item.added':
        if (e.item?.type === 'message' && e.item.role !== 'system') {
          fuelle(e.item.id, e.item.role === 'user' ? 'ich' : 'habla', '')
        }
        break
      case 'conversation.item.input_audio_transcription.completed':
        fuelle(e.item_id, 'ich', e.transcript || '')
        break
      case 'response.output_audio_transcript.delta':
        fuelle(e.item_id, 'habla', e.delta, true)
        break
      case 'response.output_audio_transcript.done':
        fuelle(e.item_id, 'habla', e.transcript || '')
        break
      case 'input_audio_buffer.speech_started':
        setWer('ich')
        werRef.current = 'ich'
        if (leitung.current) leitung.current.gesprochen = true
        break
      case 'input_audio_buffer.speech_stopped':
        setWer('hoert')
        werRef.current = 'hoert'
        break
      case 'output_audio_buffer.started':
        setWer('habla')
        werRef.current = 'habla'
        break
      case 'output_audio_buffer.stopped':
        setWer('hoert')
        werRef.current = 'hoert'
        sagAboHinweis()
        break
      case 'response.function_call_arguments.done':
        aufWerkzeug(e)
        break
      case "response.done":
        aufAntwortFertig(e.response)
        break
      case 'error':
        console.error('[sprechen]', e.error)
        break
      default:
    }
  }

  function trenne() {
    const l = leitung.current
    if (!l) return
    l.stream?.getTracks().forEach((spur) => spur.stop())
    l.pc?.close()
    if (l.audio) l.audio.srcObject = null
    leitung.current = null
  }

  async function anrufen() {
    setFehler('')
    setErgebnis(null)
    setSekunden(0)
    setWer('hoert')
    werRef.current = 'hoert'
    setXpSumme(0)
    setHinweisAbo(false)
    setWoerterLive([])
    setAbgewaehlt(new Set())
    setWoerterGespeichert(false)
    zeilenRef.current = []
    setZeilen([])
    setPhase('verbindet')
    merke(EINWILLIGUNG, 'ja')
    merke(AKZENT_SPEICHER, akzent)
    merke(NIVEAU_SPEICHER, niveau)

    try {
      // Erst das Mikrofon: Sagt jemand Nein, wurde noch nichts bezahlt.
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      } catch {
        throw new Error(t('spr.keinMikrofon'))
      }
      const pc = new RTCPeerConnection()
      const audio = new Audio()
      audio.autoplay = true
      leitung.current = { pc, stream, audio }
      pc.ontrack = (e) => { audio.srcObject = e.streams[0] }
      stream.getTracks().forEach((spur) => pc.addTrack(spur, stream))
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' && leitung.current?.pc === pc) {
          setFehler(t('spr.verbindungWeg'))
          auflegen()
        }
      }

      const kanal = pc.createDataChannel('oai-events')
      leitung.current.kanal = kanal
      // Der Server legt am Ende des Kontingents selbst auf.
      kanal.onclose = () => {
        if (leitung.current?.kanal === kanal) auflegen()
      }
      kanal.onmessage = (m) => {
        try { aufEreignis(JSON.parse(m.data)) } catch { /* ein kaputtes Ereignis stoert das Gespraech nicht */ }
      }
      // Habla faengt an: Vor einem stummen Hoerer sitzt sonst jeder
      // und wartet, wer zuerst etwas sagt.
      kanal.onopen = () => {
        kanal.send(JSON.stringify({ type: "response.create" }))
        setPhase('laeuft')
      }

      const angebot = await pc.createOffer()
      await pc.setLocalDescription(angebot)
      const sitzungDaten = await db.auth.getSession()
      leitung.current.token = sitzungDaten.data?.session?.access_token
      // Der Server baut die Verbindung auf: Nur so kann er am Ende des
      // Kontingents selbst auflegen.
      const sitzung = await api('/api/sprechen/start', { akzent, niveau, sprache: sprache(), sdp: angebot.sdp })
      leitung.current.id = sitzung.id
      leitung.current.max = sitzung.maxSekunden
      leitung.current.premium = sitzung.premium
      await pc.setRemoteDescription({ type: 'answer', sdp: sitzung.sdp })
    } catch (f) {
      const id = leitung.current?.id
      trenne()
      setPhase('start')
      setFehler(f.message === 'limit' ? t('spr.limitErreicht') : f.message)
      // Kam der Schluessel noch, die Leitung aber nicht: Zeit nicht anrechnen lassen.
      if (id) api('/api/sprechen/ende', { id, verlauf: [], sprache: sprache() }).catch(() => {})
      ladeStand()
    }
  }

  async function auflegen() {
    const id = leitung.current?.id
    if (!id) return
    const { tokens, woerter } = leitung.current
    trenne()
    setPhase('wertet')
    try {
      const a = await api('/api/sprechen/ende', {
        id,
        sprache: sprache(),
        verlauf: zeilenRef.current.map(({ von, text }) => ({ von, text })),
        tokens,
        vokabeln: woerter,
      })
      setErgebnis(a)
      setArchivStand((n) => n + 1)
    } catch (f) {
      setFehler(f.message)
    }
    setPhase('fertig')
    ladeStand()
  }

  async function zumAbo() {
    await auflegen()
    window.history.pushState({ kasse: true }, '', '/kasse')
    window.dispatchEvent(new PopStateEvent('popstate', { state: { kasse: true } }))
    window.scrollTo(0, 0)
  }

  async function vergessen() {
    if (!confirm(t('spr.vergessenFrage'))) return
    try {
      await api('/api/sprechen/vergessen', {})
      ladeStand()
    } catch (f) {
      setFehler(f.message)
    }
  }

  const g = stand?.gedaechtnis
  const zeigeZeilen = zeilen.filter((z) => z.text.trim())

  return (
    <div className="spr-seite">
      <header className="spr-kopf">
        <button className="btn-zurueck" disabled={phase !== 'start' && phase !== 'fertig'} onClick={onZurueck}>
          <span className="zurueck-pfeil" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></span>{t('app.zurueck')}
        </button>
        <Logo />
        <span />
      </header>

      <main className="spr-inhalt">
        {fehler && <p className="error spr-fehler">{fehler}</p>}
        {stand && !stand.erlaubt && <p className="spr-karte spr-hinweis">{t('spr.nochNichtFrei')}</p>}

        {stand?.erlaubt && (phase === 'start' || phase === 'fertig') && (
          <>
            {phase === 'fertig' && ergebnis && (
              <section className="spr-karte spr-bericht">
                <h2>{t('spr.berichtTitel')}</h2>
                {xpSumme > 0 && <p className="spr-xp-bericht">{t('spr.xpBericht', { w0: xpSumme })}</p>}
                {ergebnis.zuletzt && <p>{ergebnis.zuletzt}</p>}
                {ergebnis.fehler?.length > 0 ? (
                  <ul className="spr-fehlerliste">
                    {ergebnis.fehler.map((f, i) => (
                      <li key={i}><s>{f.falsch}</s> <b>{f.richtig}</b><small>{f.erklaerung}</small></li>
                    ))}
                  </ul>
                ) : (
                  zeigeZeilen.some((z) => z.von === 'ich') && <p className="spr-klein">{t('spr.keineFehler')}</p>
                )}
              </section>
            )}

            {phase === 'fertig' && ergebnis?.vokabeln?.length > 0 && (
              <section className="spr-karte">
                <h2>{t('spr.vokTitel')}</h2>
                {woerterGespeichert ? (
                  <p className="spr-klein">{t('spr.vokFertig')}</p>
                ) : (
                  <>
                    <p className="spr-klein">{t('spr.vokHinweis')}</p>
                    <div className="spr-vokabeln">
                      {ergebnis.vokabeln.map((v) => (
                        <label key={v.wort}>
                          <input
                            type="checkbox"
                            checked={!abgewaehlt.has(v.wort)}
                            onChange={() => setAbgewaehlt((alt) => {
                              const neu = new Set(alt)
                              if (neu.has(v.wort)) neu.delete(v.wort)
                              else neu.add(v.wort)
                              return neu
                            })}
                          />
                          <span><b>{v.wort}</b><small>{v.bedeutung}</small></span>
                        </label>
                      ))}
                    </div>
                    <button
                      className="btn spr-los"
                      disabled={ergebnis.vokabeln.every((v) => abgewaehlt.has(v.wort))}
                      onClick={() => {
                        onAddVocab?.(ergebnis.vokabeln.filter((v) => !abgewaehlt.has(v.wort)).map((v) => ({ wort: v.wort, uebersetzung: v.bedeutung, quelle: t('spr.vokQuelle') })))
                        setWoerterGespeichert(true)
                      }}
                    >
                      {t('spr.vokKnopf', { w0: ergebnis.vokabeln.filter((v) => !abgewaehlt.has(v.wort)).length })}
                    </button>
                  </>
                )}
              </section>
            )}

            {!stand.premium && (stand.restMinuten <= 0 || phase === 'fertig') && (
              <section className="spr-karte">
                {stand.restMinuten <= 0 && <p className="spr-klein">{t('spr.leer')}</p>}
                <div className="spr-abo">
                <b>{t('spr.mehrTitel')}</b>
                <span>{t('spr.mehrText')}</span>
                {!istApp && <button className="btn" onClick={zumAbo}>{t('spr.mehrKnopf')}</button>}
              </div>
              </section>
            )}

            <section className="spr-karte spr-held">
              <span className="spr-marke">{t('spr.neu')}</span>
              <h1>{t('spr.titel')}</h1>
              <p>{t('spr.untertitel')}</p>

              <p className="spr-abschnitt">{t('spr.akzentWaehlen')}</p>
              <div className="spr-akzente">
                {AKZENTE.map((a) => (
                  <button key={a.id} className={'spr-akzent' + (akzent === a.id ? ' ist-aktiv' : '')} onClick={() => setAkzent(a.id)}>
                    <span className="spr-flagge" aria-hidden="true">{a.flagge}</span>
                    <b>{t(a.name)}</b>
                    <small>{t(a.ort)}</small>
                  </button>
                ))}
              </div>

              <p className="spr-abschnitt">{t('spr.niveau')}</p>
              <div className="spr-niveaus">
                {NIVEAUS.map((n) => (
                  <button key={n} className={niveau === n ? 'ist-aktiv' : ''} onClick={() => setNiveau(n)}>{n}</button>
                ))}
              </div>

              <label className="spr-einwilligung">
                <input type="checkbox" checked={einverstanden} onChange={(e) => setEinverstanden(e.target.checked)} />
                <span>{t('spr.einwilligung')}</span>
              </label>

              <button className="btn spr-los" disabled={!einverstanden || stand.restMinuten <= 0} onClick={anrufen}>
                {stand.restMinuten > 0 ? t('spr.anrufen') : (stand.premium ? t('spr.leerPremium') : t('spr.leer'))}
              </button>
              <p className="spr-klein spr-mitte">{t('spr.rest', { w0: stand.restMinuten, w1: stand.kontingentMinuten, w2: stand.maxMinuten })}</p>
            </section>

            <section className="spr-karte">
              <h2>{t('spr.gedaechtnis')}</h2>
              {!g?.gespraeche ? (
                <p className="spr-klein">{t('spr.gedaechtnisLeer')}</p>
              ) : (
                <>
                  <p className="spr-klein">{g.gespraeche === 1 ? t('spr.einGespraech') : t('spr.gespraecheBisher', { zahl: g.gespraeche })}{g.zuletzt ? ' · ' + g.zuletzt : ''}</p>
                  {g.profil?.niveau_geschaetzt && g.profil.niveau_geschaetzt !== 'unklar' && (
                    <p className="spr-niveau-schaetzung">{t('spr.schaetzung')}: <b>{g.profil.niveau_geschaetzt}</b></p>
                  )}
                  {[[t('spr.ziele'), g.profil?.ziele], [t('spr.interessen'), g.profil?.interessen], [t('spr.schwach'), g.profil?.schwache_themen], [t('spr.kann'), g.profil?.kann_schon]].map(([titel, punkte]) => punkte?.length > 0 && (
                    <div key={titel}>
                      <p className="spr-abschnitt">{titel}</p>
                      <ul className="spr-merken">{punkte.map((m, i) => <li key={i}>{m}</li>)}</ul>
                    </div>
                  ))}
                  {g.fehler?.length > 0 && (
                    <>
                      <p className="spr-abschnitt">{t('spr.haeufigeFehler')}</p>
                      <ul className="spr-fehlerliste">
                        {g.fehler.slice(0, 8).map((f, i) => (
                          <li key={i}><s>{f.falsch}</s> <b>{f.richtig}</b>{f.anzahl > 1 && <em>{f.anzahl}×</em>}<small>{f.erklaerung}</small></li>
                        ))}
                      </ul>
                    </>
                  )}
                  {g.merken?.length > 0 && (
                    <>
                      <p className="spr-abschnitt">{t('spr.dasWeissIch')}</p>
                      <ul className="spr-merken">{g.merken.slice(-8).map((m, i) => <li key={i}>{m}</li>)}</ul>
                    </>
                  )}
                  <button className="btn-plain spr-vergessen" onClick={vergessen}>{t('spr.vergessen')}</button>
                </>
              )}
            </section>

            <Archiv onAddVocab={onAddVocab} aktualisiert={archivStand} />
          </>
        )}

        {(phase === 'verbindet' || phase === 'laeuft' || phase === 'wertet') && (
          <section className="spr-karte spr-anruf">
            <div className={'spr-kugel spr-kugel-' + (phase === 'laeuft' ? wer : 'warten')} aria-hidden="true"><i /><i /></div>
            <p className="spr-status">
              {phase === 'verbindet' && t('spr.verbindet')}
              {phase === 'wertet' && t('spr.wertet')}
              {phase === 'laeuft' && (wer === 'habla' ? t('spr.hablaSpricht') : wer === 'ich' ? t('spr.duSprichst') : t('spr.hoertZu'))}
            </p>
            {phase === 'laeuft' && <p className="spr-uhr">{zeit(sekunden)}</p>}
            {xpFlug !== null && (
              <span key={xpFlug} className="spr-xp-flug" aria-live="polite" onAnimationEnd={() => setXpFlug(null)}>+{XP_PRO_MINUTE} XP</span>
            )}

            <div className="spr-verlauf">
              {zeigeZeilen.map((z) => (
                <p key={z.id} className={'spr-zeile' + (z.von === 'ich' ? ' ist-ich' : '')}>{z.text}</p>
              ))}
              <div ref={ende} />
            </div>

            {phase === 'laeuft' && woerterLive.length > 0 && (
              <div className="spr-live-woerter">
                <small>{t('spr.vokLive')}</small>
                <div>{woerterLive.map((w) => <span key={w.wort}><b>{w.wort}</b> {w.bedeutung}</span>)}</div>
              </div>
            )}
            {phase === 'laeuft' && hinweisAbo && (
              <div className="spr-abo">
                <b>{t('spr.mehrTitel')}</b>
                <span>{t('spr.mehrText')}</span>
                {!istApp && <button className="btn" onClick={zumAbo}>{t('spr.mehrKnopf')}</button>}
              </div>
            )}
            {phase === 'laeuft' && <button className="btn-plain spr-erklaeren" onClick={erklaeren}>{t('spr.erklaer')}</button>}
            {phase === 'laeuft' && <button className="spr-auflegen" onClick={auflegen}>{t('spr.auflegen')}</button>}
          </section>
        )}
      </main>
    </div>
  )
}
