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
import { useTexte, sprache } from './sprache.js'
import Logo from './Logo.jsx'

const EINWILLIGUNG = 'sprechen-einwilligung'
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

export default function Sprechen({ onZurueck }) {
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

  const leitung = useRef(null) // { pc, stream, audio, id, max }
  const zeilenRef = useRef([])
  const ende = useRef(null)

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

  useEffect(() => { ende.current?.scrollIntoView({ block: 'end' }) }, [zeilen])

  // Die Uhr, und bei Erreichen der Grenze wird aufgelegt.
  useEffect(() => {
    if (phase !== 'laeuft') return
    const beginn = Date.now()
    const uhr = setInterval(() => {
      const s = Math.floor((Date.now() - beginn) / 1000)
      setSekunden(s)
      if (s >= (leitung.current?.max ?? 10) * 60) auflegen()
    }, 500)
    return () => clearInterval(uhr)
  }, [phase])

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
        break
      case 'input_audio_buffer.speech_stopped':
        setWer('hoert')
        break
      case 'output_audio_buffer.started':
        setWer('habla')
        break
      case 'output_audio_buffer.stopped':
        setWer('hoert')
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
      kanal.onmessage = (m) => {
        try { aufEreignis(JSON.parse(m.data)) } catch { /* ein kaputtes Ereignis stoert das Gespraech nicht */ }
      }
      // Habla faengt an: Vor einem stummen Hoerer sitzt sonst jeder
      // und wartet, wer zuerst etwas sagt.
      kanal.onopen = () => {
        kanal.send(JSON.stringify({ type: "response.create" }))
        setPhase('laeuft')
      }

      const sitzung = await api('/api/sprechen/start', { akzent, niveau, sprache: sprache() })
      leitung.current.id = sitzung.id
      leitung.current.max = sitzung.maxMinuten

      const angebot = await pc.createOffer()
      await pc.setLocalDescription(angebot)
      const r = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + sitzung.schluessel, 'Content-Type': 'application/sdp' },
        body: angebot.sdp,
      })
      if (!r.ok) throw new Error(t('spr.verbindungFehlgeschlagen'))
      await pc.setRemoteDescription({ type: 'answer', sdp: await r.text() })
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
    trenne()
    setPhase('wertet')
    try {
      const a = await api('/api/sprechen/ende', {
        id,
        sprache: sprache(),
        verlauf: zeilenRef.current.map(({ von, text }) => ({ von, text })),
      })
      setErgebnis(a)
    } catch (f) {
      setFehler(f.message)
    }
    setPhase('fertig')
    ladeStand()
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
                {stand.restMinuten > 0 ? t('spr.anrufen') : t('spr.limitErreicht')}
              </button>
              <p className="spr-klein spr-mitte">{t('spr.minutenHeute', { zahl: stand.restMinuten, max: stand.maxMinuten })}</p>
            </section>

            <section className="spr-karte">
              <h2>{t('spr.gedaechtnis')}</h2>
              {!g?.gespraeche ? (
                <p className="spr-klein">{t('spr.gedaechtnisLeer')}</p>
              ) : (
                <>
                  <p className="spr-klein">{g.gespraeche === 1 ? t('spr.einGespraech') : t('spr.gespraecheBisher', { zahl: g.gespraeche })}{g.zuletzt ? ' · ' + g.zuletzt : ''}</p>
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

            <div className="spr-verlauf">
              {zeigeZeilen.map((z) => (
                <p key={z.id} className={'spr-zeile' + (z.von === 'ich' ? ' ist-ich' : '')}>{z.text}</p>
              ))}
              <div ref={ende} />
            </div>

            {phase === 'laeuft' && <button className="spr-auflegen" onClick={auflegen}>{t('spr.auflegen')}</button>}
          </section>
        )}
      </main>
    </div>
  )
}
