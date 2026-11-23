// Kurz-Einführung – ENTWURF 2 (22.11.2026, Manuel): 5 Schritte, die nicht
// nur erzählen, sondern VORSPIELEN, wie die App funktioniert:
//   1. Lektion   – lernen, wiederholen, Grundlagen; alles wandert in den Trainer
//   2. Trainer   – Vokabeln, Sätze, Texte; KI-Listen nach eigenen Interessen
//   3. Sprechen  – Gespräch mit dem KI-Sprachpartner
//   4. Mediathek – YouTube, Songs, E-Books; Wort antippen = übersetzt
//   5. Spiele & Freunde – XP-Duell mit Freunden
// Danach: „Lektion 1 starten“ oder „Frei erkunden“.
//
// Jede Bühne ist eine kleine, selbst laufende Nachbildung der App (Takt-
// Zähler + CSS-Übergänge). Stimme je Schritt aus public/einfuehrung/
// <app>-<schritt>.<de|en>.mp3 (ElevenLabs eleven_v4: DE Julia, EN Jessica).
//
// Ansehen: ?einfuehrung=kurz – Sprache erzwingen mit &sprache=de|en.

import { useEffect, useRef, useState } from 'react'
import Logo from './Logo.jsx'
import { lektionTon } from './erfolgston.js'
import { sprache } from './sprache.js'

const TX = {
  de: {
    weiter: "Weiter", zurueck: "Zurück", ueberspringen: "Überspringen", lektion: "Lektion 1 starten", erkunden: "Frei erkunden", tonAn: "Stimme an", tonAus: "Stimme aus",
    trainer: "Trainer", imTrainer: "Im Trainer", reiter: ["Vokabeln", "Sätze", "Texte"], wusste: "Wusste ich", interesse: "Was interessiert dich?", kiBaut: "Die KI baut deine Liste …",
    imGespraech: "Im Gespräch", media: ["YouTube", "Songs", "E-Books"], kapitel: "Kapitel", du: "Du", duell: "Duell der Woche", vorne: "Du liegst vorne!", einladen: "Freunde einladen",
  },
  en: {
    weiter: "Next", zurueck: "Back", ueberspringen: "Skip", lektion: "Start lesson 1", erkunden: "Explore on my own", tonAn: "Voice on", tonAus: "Voice off",
    trainer: "Trainer", imTrainer: "In your trainer", reiter: ["Words", "Sentences", "Texts"], wusste: "I knew it", interesse: "What are you into?", kiBaut: "The AI is building your list …",
    imGespraech: "In a call", media: ["YouTube", "Songs", "E-books"], kapitel: "chapters", du: "You", duell: "Duel of the week", vorne: "You’re in the lead!", einladen: "Invite friends",
  },
}

const APP_KEY = "habloo"
const SCHRITTE = [
  { id: "lektion",
    de: { titel: "Lektionen, die hängen bleiben", text: "Willkommen bei Habloo! In kurzen Lektionen lernst du Wörter, Sätze und die Grundlagen – und wiederholst alles direkt. Was du lernst, wandert automatisch in deinen Trainer." },
    en: { titel: "Lessons that stick", text: "Welcome to Habloo! In short lessons you learn words, sentences and the basics – and review everything right away. Everything you learn goes straight into your trainer." } },
  { id: "trainer",
    de: { titel: "Dein Trainer – mit deinen Interessen", text: "Im Trainer wiederholst du alles genau dann, wenn du es sonst vergessen würdest: Vokabeln, Sätze und ganze Texte. Und mit der KI lernst du mit deinen eigenen Interessen – zum Beispiel Fußball." },
    en: { titel: "Your trainer – with your interests", text: "Your trainer brings everything back right before you’d forget it: words, sentences and whole texts. And with the AI you learn with your own interests – football, for example." } },
  { id: "sprechen",
    de: { titel: "Sprich mit Habla", text: "Dann wird gesprochen! Habla ist dein KI-Gesprächspartner. Mit ihm führst du echte Gespräche auf Spanisch – ganz ohne Hemmungen." },
    en: { titel: "Talk with Habla", text: "Then it’s time to talk! Habla is your AI conversation partner. Have real conversations in Spanish – no pressure at all." } },
  { id: "mediathek",
    de: { titel: "Lebe in der Sprache", text: "In der Mediathek lernst du mit dem, was dich wirklich interessiert: YouTube-Videos, Songs und E-Books. Tipp ein Wort an – schon ist es übersetzt." },
    en: { titel: "Live the language", text: "In the media library you learn with what really interests you: YouTube videos, songs and e-books. Tap a word – and it’s translated instantly." } },
  { id: "freunde",
    de: { titel: "Spiel mit Freunden", text: "Zwischendurch spielst du Spiele – und mit Freunden macht alles mehr Spaß. Lade sie ein und tretet gegeneinander an: Wer sammelt mehr XP und spricht zuerst fließend Spanisch?" },
    en: { titel: "Play with friends", text: "In between you play games – and everything’s more fun with friends. Invite them and compete: who collects more XP and speaks fluent Spanish first?" } },
  { id: "los",
    de: { titel: "Bereit?", text: "Jetzt bist du dran! Starte direkt mit Lektion eins – oder schau dich erst in Ruhe um." },
    en: { titel: "Ready?", text: "Now it’s your turn! Jump straight into lesson one – or take a look around first." } },
]
const DATEN = {
  lektion: {
    titel: { de: "Lektion 1 · Begrüßung", en: "Lesson 1 · Greetings" },
    wort: "hola", laut: null, bed: { de: "Hallo", en: "Hello" },
    frage: { de: "Was heißt „gracias“?", en: "What does “gracias” mean?" },
    optionen: [{ de: "bitte", en: "please" }, { de: "danke", en: "thank you", ok: true }, { de: "tschüss", en: "bye" }],
    chips: ["hola", "gracias", { de: "Grundlage: Artikel", en: "Basics: articles" }],
  },
  trainer: {
    inhalt: [
      { ziel: "gracias", de: "danke", en: "thank you" },
      { ziel: "¿Dónde está la playa?", de: "Wo ist der Strand?", en: "Where is the beach?" },
      { ziel: "Mi día en Madrid", de: "Mein Tag in Madrid", en: "My day in Madrid" },
    ],
    interessen: [{ de: "⚽ Fußball", en: "⚽ Football" }, { de: "🍳 Kochen", en: "🍳 Cooking" }, { de: "✈️ Reisen", en: "✈️ Travel" }],
    liste: [["el gol", "das Tor", "goal"], ["el partido", "das Spiel", "match"], ["el equipo", "die Mannschaft", "team"]],
  },
  partner: { de: "Habla · KI-Gesprächspartner", en: "Habla · AI conversation partner" },
  gespraech: [
    ["ki", "¡Hola! ¿Qué tal tu día?"],
    ["du", "¡Muy bien! Hoy jugué al fútbol."],
    ["ki", "¡Genial! ¿Con quién jugaste?", { de: "Tipp: „jugué“ = ich habe gespielt", en: "Tip: “jugué” = I played" }],
    ["du", "Con mis amigos. ⚽"],
  ],
  media: {
    satz: ["Me", "gusta", "mucho", "la", "música"], tipp: 4, bed: { de: "die Musik", en: "music" },
    buch: { de: "Ein Tag in Madrid", en: "A day in Madrid" },
    buchSatz: ["Hoy", "es", "un", "día", "bonito", "en", "Madrid."], buchTipp: 4, buchBed: { de: "schön", en: "beautiful" },
  },
  freunde: {
    name: { de: "Lena", en: "Emma" }, gegner: 330,
    kacheln: ["hola", { de: "danke", en: "thanks" }, "agua", { de: "Hallo", en: "Hello" }, "gracias", { de: "Wasser", en: "water" }],
  },
}


/* ------------------------------------------------------------------ *
 *  Takt: zählt 0 … ende hoch (alle ms), hält kurz und beginnt von vorn
 * ------------------------------------------------------------------ */
function useTakt(ende, ms = 850, pause = 2600) {
  const [t, setT] = useState(0)
  useEffect(() => {
    let id
    const tick = (n) => {
      id = setTimeout(() => {
        if (n >= ende) { setT(0); tick(0) } else { setT(n + 1); tick(n + 1) }
      }, n >= ende ? pause : ms)
    }
    tick(0)
    return () => clearTimeout(id)
  }, [ende, ms, pause])
  return t
}

const Finger = ({ an, style }) => <span className={'efs-finger' + (an ? ' an' : '')} style={style} aria-hidden="true">👆</span>

/* ---------------- 1. Lektion ---------------- */
function BuehneLektion({ sp }) {
  const t = useTakt(11)
  const L = DATEN.lektion
  const offen = t >= 2
  const quiz = t >= 4
  const gewaehlt = t >= 6
  const fliegt = t >= 8
  return (
    <div className="efs efs-lektion">
      <div className="efs-leiste"><span>✕</span><i><b style={{ width: Math.min(100, 12 + t * 8) + '%' }} /></i></div>
      <small className="efs-marke">{L.titel[sp]}</small>
      {!quiz ? (
        <div className={'efs-wortkarte' + (offen ? ' offen' : '')}>
          <b>{L.wort}</b>
          {L.laut && <em>{L.laut[sp]}</em>}
          <span>{offen ? L.bed[sp] : '?'}</span>
          <Finger an={t === 1} style={{ right: 22, bottom: 8 }} />
        </div>
      ) : (
        <div className="efs-quiz">
          <p>{L.frage[sp]}</p>
          {L.optionen.map((o, i) => (
            <span key={i} className={'efs-option' + (gewaehlt && o.ok ? ' richtig' : '')}>
              {o[sp]}
              {o.ok && <Finger an={t === 5} style={{ right: 10, top: 6 }} />}
            </span>
          ))}
        </div>
      )}
      <div className="efs-flug">
        {L.chips.map((c, i) => (
          <span key={i} className={'efs-chip' + (fliegt ? ' fliegt' : '')} style={{ animationDelay: i * 200 + 'ms' }}>{typeof c === 'string' ? c : c[sp]}</span>
        ))}
      </div>
      <div className={'efs-ablage' + (t >= 10 ? ' voll' : '')}>
        <span className="efs-ablage-bild">🧠</span>
        <b>{TX[sp].trainer}</b>
        <span className="efs-zahl">{t >= 10 ? '+3' : '+0'}</span>
      </div>
    </div>
  )
}

/* ---------------- 2. Trainer ---------------- */
function BuehneTrainer({ sp }) {
  const t = useTakt(13)
  const T = DATEN.trainer
  const reiter = t < 3 ? 0 : t < 5 ? 1 : t < 7 ? 2 : 0
  const ki = t >= 8
  return (
    <div className="efs efs-trainer">
      <div className="efs-reiter">
        {TX[sp].reiter.map((r, i) => <span key={r} className={i === reiter && !ki ? 'an' : ''}>{r}</span>)}
      </div>
      {!ki ? (
        <div className="efs-karte-trainer" key={reiter}>
          <b>{T.inhalt[reiter].ziel}</b>
          {t % 2 === 0 ? <span className="efs-zu">?</span> : <span className="efs-loesung">{T.inhalt[reiter][sp]}</span>}
          <div className="efs-bewerten"><i className={t % 2 === 1 ? 'druck' : ''}>{TX[sp].wusste}</i></div>
        </div>
      ) : (
        <div className="efs-ki">
          <p className="efs-ki-frage">{TX[sp].interesse}</p>
          <div className="efs-interessen">
            {T.interessen.map((x, i) => (
              <span key={i} className={i === 0 && t >= 9 ? 'an' : ''}>{x[sp]}{i === 0 && <Finger an={t === 8} style={{ right: -6, top: 8 }} />}</span>
            ))}
          </div>
          {t >= 10 && (
            <ul className="efs-liste">
              {T.liste.map((w, i) => (
                <li key={w[0]} style={{ animationDelay: i * 220 + 'ms' }}><b>{w[0]}</b><span>{sp === 'en' ? w[2] : w[1]}</span></li>
              ))}
            </ul>
          )}
          {t === 9 && <p className="efs-zauber">✨ {TX[sp].kiBaut}</p>}
        </div>
      )}
    </div>
  )
}

/* ---------------- 3. Sprechen ---------------- */
function BuehneSprechen({ sp }) {
  const t = useTakt(9, 1100)
  const G = DATEN.gespraech
  return (
    <div className="efs efs-sprechen">
      <div className="efs-anruf">
        <span className={'efs-ava' + (t % 2 === 0 ? ' spricht' : '')}><Logo /></span>
        <div>
          <b>{DATEN.partner[sp]}</b>
          <small>{TX[sp].imGespraech} · 0:{String(4 + t * 3).padStart(2, '0')}</small>
        </div>
      </div>
      <div className="efs-blasen">
        {G.slice(0, Math.min(G.length, 1 + Math.floor(t / 2))).map((z, i) => (
          <p key={i} className={'efs-blase ' + z[0]}>
            {z[1]}
            {z[2] && <small>{z[2][sp]}</small>}
          </p>
        ))}
      </div>
      <div className="efs-welle" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => <i key={i} style={{ animationDelay: i * 70 + 'ms' }} />)}
        <span className="efs-mikro">🎙️</span>
      </div>
    </div>
  )
}

/* ---------------- 4. Mediathek ---------------- */
function BuehneMediathek({ sp }) {
  const t = useTakt(11)
  const M = DATEN.media
  const buch = t >= 7
  return (
    <div className="efs efs-media">
      <div className="efs-reiter klein">
        {TX[sp].media.map((r, i) => <span key={r} className={(buch ? i === 2 : i === 0) ? 'an' : ''}>{r}</span>)}
      </div>
      {!buch ? (
        <div className="efs-video">
          <div className="efs-bild"><span>▶</span><i style={{ width: 10 + t * 9 + '%' }} /></div>
          <p className="efs-untertitel">
            {M.satz.map((w, i) => (
              <span key={i} className={i === M.tipp && t >= 3 ? 'an' : ''}>
                {w}{i === M.tipp && <Finger an={t === 2} style={{ left: '40%', top: 18 }} />}
              </span>
            ))}
          </p>
          {t >= 3 && (
            <div className="efs-pop">
              <b>{M.satz[M.tipp]}</b> = {M.bed[sp]}
              <span className={t >= 5 ? 'drin' : ''}>{t >= 5 ? '✓ ' + TX[sp].imTrainer : '+ ' + TX[sp].trainer}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="efs-buch">
          <div className="efs-cover"><span>📖</span><b>{M.buch[sp]}</b><small>A2 · 10 {TX[sp].kapitel}</small></div>
          <p className="efs-seite">{M.buchSatz.map((w, i) => <span key={i} className={i === M.buchTipp && t >= 9 ? 'an' : ''}>{w} </span>)}</p>
          {t >= 9 && <div className="efs-pop klein"><b>{M.buchSatz[M.buchTipp]}</b> = {M.buchBed[sp]}</div>}
        </div>
      )}
    </div>
  )
}

/* ---------------- 5. Spiele & Freunde ---------------- */
function BuehneFreunde({ sp }) {
  const t = useTakt(12)
  const F = DATEN.freunde
  const kacheln = F.kacheln
  const paar = t >= 3
  const xp = 280 + (t >= 5 ? 40 : 0) + (t >= 7 ? 40 : 0)
  const duVorne = xp > F.gegner
  const liste = [{ n: F.name[sp], xp: F.gegner, ich: false }, { n: TX[sp].du, xp, ich: true }].sort((a, b) => b.xp - a.xp)
  return (
    <div className="efs efs-freunde">
      <div className="efs-memory">
        {kacheln.map((k, i) => {
          const auf = (t >= 1 && i === 0) || (t >= 2 && i === 3) || (paar && (i === 0 || i === 3))
          return <span key={i} className={(auf ? 'auf' : '') + (paar && (i === 0 || i === 3) ? ' paar' : '')}>{auf ? (k[sp] ?? k) : ''}</span>
        })}
        {t >= 4 && <b className="efs-xp-flug">+40 XP</b>}
      </div>
      <div className="efs-rang">
        <small>🏆 {TX[sp].duell}</small>
        {liste.map((p, i) => (
          <div key={p.n} className={'efs-platz' + (p.ich ? ' ich' : '')} style={{ order: i }}>
            <span className="efs-nr">{i + 1}</span>
            <span className="efs-ini">{p.n[0]}</span>
            <b>{p.n}</b>
            <span className="efs-punkte">{p.xp} XP</span>
          </div>
        ))}
        {duVorne && t >= 8 && <p className="efs-jubel">🎉 {TX[sp].vorne}</p>}
        {t >= 10 && <span className="efs-einladen">＋ {TX[sp].einladen}</span>}
      </div>
    </div>
  )
}

const BUEHNEN = { lektion: BuehneLektion, trainer: BuehneTrainer, sprechen: BuehneSprechen, mediathek: BuehneMediathek, freunde: BuehneFreunde }

function Lautsprecher({ an }) {
  return an ? (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" /><path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
  )
}

/** @param {(ziel: 'lektion'|'erkunden') => void} props.onFertig */
export default function EinfuehrungKurz({ onFertig }) {
  // Zum Testen: &sprache=de|en erzwingt die Sprache der Einführung
  const sp = (() => {
    try { const s = new URLSearchParams(window.location.search).get('sprache'); if (s === 'de' || s === 'en') return s } catch { /* egal */ }
    return sprache() === 'en' ? 'en' : 'de'
  })()
  const [spFest] = useState(sp)
  const tx = TX[spFest]
  const [nr, setNr] = useState(0)
  const schritt = SCHRITTE[nr]
  const letzter = nr === SCHRITTE.length - 1
  const [ton, setTon] = useState(() => { try { return localStorage.getItem('ef-ton') !== 'aus' } catch { return true } })
  const audio = useRef(null)

  useEffect(() => {
    document.body.classList.add('lektion-laeuft')
    return () => { document.body.classList.remove('lektion-laeuft'); audio.current?.pause() }
  }, [])

  const spiele = () => {
    audio.current?.pause()
    const a = new Audio(`/einfuehrung/${APP_KEY}-${schritt.id}.${spFest}.mp3`)
    audio.current = a
    a.play().catch(() => {})
  }
  useEffect(() => {
    window.scrollTo(0, 0)
    if (ton) spiele(); else audio.current?.pause()
    if (letzter) lektionTon()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nr])

  function tonUmschalten() {
    const neu = !ton
    setTon(neu)
    try { localStorage.setItem('ef-ton', neu ? 'an' : 'aus') } catch { /* egal */ }
    if (neu) spiele(); else audio.current?.pause()
  }

  const Buehne = BUEHNEN[schritt.id]
  const text = schritt[spFest]

  return (
    <div className="ef efk efk2">
      <div className="efk-kopf">
        <button className="btn-plain" onClick={() => onFertig('erkunden')} aria-label={tx.ueberspringen}>✕</button>
        <div className="efk-punkte" aria-hidden="true">
          {SCHRITTE.map((s, i) => <span key={s.id} className={i === nr ? 'an' : i < nr ? 'war' : ''} />)}
        </div>
        <button className={'efk-ton' + (ton ? ' an' : '')} onClick={tonUmschalten} aria-label={ton ? tx.tonAus : tx.tonAn}><Lautsprecher an={ton} /></button>
      </div>

      <div className="efk2-mitte" key={'s' + nr}>
        {!letzter && <small className="efk2-nr">{nr + 1} / {SCHRITTE.length - 1}</small>}
        <h1 className="efk-titel">{text.titel}</h1>
        {Buehne ? <div className="efk2-buehne"><Buehne sp={spFest} /></div> : (
          <div className="efk2-ende"><span className="efk2-pokal">🚀</span></div>
        )}
        <div className="ef-coach efk2-coach">
          <span className="ef-coach-bild" aria-hidden="true"><Logo /></span>
          <p className="ef-coach-blase">
            {text.text.split(' ').map((w, i) => <span key={i} style={{ animationDelay: 120 + i * 28 + 'ms' }}>{w} </span>)}
          </p>
        </div>
      </div>

      <div className="efk-unten">
        {!letzter ? (
          <>
            <button className="ef-knopf" onClick={() => setNr(nr + 1)}>{tx.weiter}</button>
            {nr > 0 ? <button className="ef-leise" onClick={() => setNr(nr - 1)}>{tx.zurueck}</button> : <button className="ef-leise" onClick={() => onFertig('erkunden')}>{tx.ueberspringen}</button>}
          </>
        ) : (
          <>
            <button className="ef-knopf efk-gross" onClick={() => onFertig('lektion')}>{tx.lektion}</button>
            <button className="ef-knopf ef-knopf-hell" onClick={() => onFertig('erkunden')}>{tx.erkunden}</button>
          </>
        )}
      </div>
    </div>
  )
}
