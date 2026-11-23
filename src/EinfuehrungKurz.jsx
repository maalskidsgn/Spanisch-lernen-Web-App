// Kurz-Einführung (23.11.2026, Manuel): die Mitte aus „ruhig“ und
// „lebendig“. Aufbau wie Stil A – oben EIN Bild, darunter Überschrift
// und ein Satz –, aber das Bild ist ein echtes App-Element, das vorspielt,
// wie es funktioniert (ein Finger zeigt, wo getippt wird). Kein Rahmen,
// keine Menüs, keine Listen drumherum: immer nur ein Element zur Zeit.
//
//   1. Lektion   – Wort antippen → Grundlage → Quiz → fliegt in den Trainer
//   2. Trainer   – Vokabel, Satz, Text → KI-Liste zum eigenen Interesse
//   3. Sprechen  – Anruf beim KI-Gesprächspartner, mit sanftem Tipp
//   4. Mediathek – YouTube (Wort antippen), Song, E-Book
//   5. Freunde   – Spiel bringt XP → Freundin einladen → Duell auf den Inseln
//   danach: „Lektion 1 starten“ oder „Erst mal umschauen“
//
// Stimme je Schritt: public/einfuehrung/<app>-<schritt>.<de|en>.mp3
// (ElevenLabs eleven_v4: DE Julia, EN Jessica). Ansehen: ?einfuehrung=kurz,
// Sprache erzwingen mit &sprache=de|en.

import { useEffect, useRef, useState } from 'react'
import Logo from './Logo.jsx'
import NavBild from './NavBild.jsx'
import ZauberBild from './ZauberBild.jsx'
import SpielBild from './SpielBild.jsx'
import { Insel } from './Rangliste.jsx'
import { lektionTon } from './erfolgston.js'
import { sprache } from './sprache.js'

const TX = {
  de: {
    weiter: "Weiter", zurueck: "Zurück", ueberspringen: "Überspringen", lektion: "Lektion 1 starten", erkunden: "Erst mal umschauen", tonAn: "Stimme an", tonAus: "Stimme aus",
    nav: ["Start", "Lektionen", "Trainer", "Mediathek", "Mehr"],
    neuesWort: "Neues Wort", antippen: "antippen", gutZuWissen: "Gut zu wissen", gelernt: "Gelernt in dieser Lektion", inTrainer: "ab in deinen Trainer",
    kartenArt: ["Vokabel", "Satz", "Text"], nochmal: "Nochmal", gewusst: "Gewusst",
    kiListe: "KI-Wortliste", interesse: "Was interessiert dich?", kiBaut: "Die KI baut deine Liste …",
    bereit: "Bereit für ein Gespräch", anrufen: "Anrufen", imGespraech: "Im Gespräch",
    media: ["YouTube", "Song", "E-Book"], trainer: "Trainer", imTrainer: "im Trainer",
    spiel: "Spiel", du: "Du", einladenTitel: "Lernt zusammen", einladen: "Freunde einladen", istDabei: (n) => `${n} ist dabei!`,
    duell: "Duell der Woche", vorne: "Du liegst vorne!", geschenk: "Dein Startgeschenk wartet schon",
  },
  en: {
    weiter: "Next", zurueck: "Back", ueberspringen: "Skip", lektion: "Start lesson 1", erkunden: "Look around first", tonAn: "Voice on", tonAus: "Voice off",
    nav: ["Home", "Lessons", "Trainer", "Media", "More"],
    neuesWort: "New word", antippen: "tap", gutZuWissen: "Good to know", gelernt: "Learned in this lesson", inTrainer: "straight into your trainer",
    kartenArt: ["Word", "Sentence", "Text"], nochmal: "Again", gewusst: "Got it",
    kiListe: "AI word list", interesse: "What are you into?", kiBaut: "The AI is building your list …",
    bereit: "Ready for a chat", anrufen: "Call", imGespraech: "In a call",
    media: ["YouTube", "Song", "E-book"], trainer: "Trainer", imTrainer: "in your trainer",
    spiel: "Game", du: "You", einladenTitel: "Learn together", einladen: "Invite friends", istDabei: (n) => `${n} joined!`,
    duell: "Duel of the week", vorne: "You’re in the lead!", geschenk: "Your welcome gift is waiting",
  },
}

const APP_KEY = "habloo"
const APP_NAME = "Habloo"
const D = {
  lektion: {
    wort: { w: "hola", de: "Hallo", en: "Hello" },
    grund: { titel: { de: "Der Artikel", en: "The article" }, zeilen: [["el", { de: "der", en: "the (masc.)" }], ["la", { de: "die", en: "the (fem.)" }]] },
    frage: { de: "Was heißt „gracias“?", en: "What does “gracias” mean?" },
    optionen: [{ de: "bitte", en: "please" }, { de: "danke", en: "thank you", ok: true }, { de: "tschüss", en: "bye" }],
    chips: ["hola", "gracias", "el · la"],
  },
  trainer: {
    karten: [{ w: "gracias", de: "danke", en: "thank you" }, { w: "¿Dónde está la playa?", de: "Wo ist der Strand?", en: "Where is the beach?" }, { w: "Mi día en Madrid" }],
    interessen: [{ de: "⚽ Fußball", en: "⚽ Football" }, { de: "🍳 Kochen", en: "🍳 Cooking" }, { de: "✈️ Reisen", en: "✈️ Travel" }],
    liste: [{ w: "el gol", de: "das Tor", en: "goal" }, { w: "el partido", de: "das Spiel", en: "match" }, { w: "el equipo", de: "die Mannschaft", en: "team" }],
  },
  sprechen: {
    name: { de: "Habla", en: "Habla" },
    zeilen: [
      { ab: 2, wer: "ki", s: "¡Hola! ¿Qué tal tu día?" },
      { ab: 5, wer: "du", s: "Hoy jugo al fútbol." },
      { ab: 7, wer: "ki", s: "¡Qué bien! ¿Con quién?" },
      { ab: 8, wer: "tipp", de: "Besser: „jugué“ – ich habe gespielt", en: "Better: “jugué” – I played" },
    ],
  },
  media: {
    video: { de: "Un día en Madrid", en: "Un día en Madrid" },
    satz: ["Me", "gusta", "mucho", "la", "música"], tipp: 4, bed: { de: "die Musik", en: "music" },
    song: { titel: "Canción del sol", von: "Habloo Radio", zeilen: ["Hoy es un buen día", "Canto bajo el sol", "Bailamos sin parar"] },
    buch: { titel: { de: "Ein Tag in Madrid", en: "A day in Madrid" }, satz: ["Hoy", "es", "un", "día", "bonito", "en", "Madrid."], tipp: 4, bed: { de: "schön", en: "beautiful" } },
  },
  freunde: { name: { de: "Lena", en: "Emma" }, kacheln: ["hola", "", "", "", { de: "Hallo", en: "Hello" }, ""] },
}
const TEXTE = {
  lektion: { de: { titel: "Lektionen, die hängen bleiben", satz: "Wörter, Sätze und Grundlagen lernen, direkt üben – alles landet in deinem Trainer." }, en: { titel: "Lessons that stick", satz: "Learn words, sentences and the basics, practise right away – it all goes into your trainer." } },
  trainer: { de: { titel: "Dein Trainer – mit deinen Themen", satz: "Wiederhole Vokabeln, Sätze und Texte. Die KI baut sie zu dem, was dich interessiert." }, en: { titel: "Your trainer – with your topics", satz: "Review words, sentences and texts. The AI builds them around what interests you." } },
  sprechen: { de: { titel: "Sprich mit Habla", satz: "Ruf einfach an und führe echte Gespräche auf Spanisch – mit sanften Tipps." }, en: { titel: "Talk with Habla", satz: "Just call and have real conversations in Spanish – with gentle tips." } },
  mediathek: { de: { titel: "Lebe in der Sprache", satz: "YouTube, Songs und E-Books: Wort antippen, schon ist es übersetzt." }, en: { titel: "Live the language", satz: "YouTube, songs and e-books: tap a word and it’s translated." } },
  freunde: { de: { titel: "Spielen und mit Freunden lernen", satz: "Sammle XP in Spielen, lade Freunde ein – wer spricht zuerst fließend?" }, en: { titel: "Play and learn with friends", satz: "Earn XP in games, invite friends – who gets fluent first?" } },
  los: { de: { titel: "Bereit für Lektion 1?", satz: "Sie dauert nur 3 Minuten." }, en: { titel: "Ready for lesson 1?", satz: "It only takes 3 minutes." } },
}


const SCHRITTE = ['lektion', 'trainer', 'sprechen', 'mediathek', 'freunde', 'los']
// Takte je Szene (ein Takt = 800 ms)
const TAKTE = { lektion: 13, trainer: 14, sprechen: 11, mediathek: 14, freunde: 13 }
const MS = 800

/** Zählt 0 … ende hoch, hält am Ende kurz und beginnt von vorn. */
function useTakt(ende, aktiv) {
  const [t, setT] = useState(0)
  const [runden, setRunden] = useState(0)
  useEffect(() => {
    if (!aktiv) return
    let id
    const tick = (n) => {
      id = setTimeout(() => {
        if (n >= ende) { setRunden((r) => r + 1); setT(0); tick(0) } else { setT(n + 1); tick(n + 1) }
      }, n >= ende ? 2400 : MS)
    }
    tick(0)
    return () => clearTimeout(id)
  }, [ende, aktiv])
  return [t, runden]
}

const Finger = ({ an, x, y }) => (
  <span className={'efn-finger' + (an ? ' an' : '')} style={{ left: x, top: y }} aria-hidden="true"><i />👆</span>
)
const Haken = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
const Play = ({ g = 20 }) => <svg width={g} height={g} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
const Laut = ({ wort, sp }) => (wort.laut ? <em className="efn-laut">{wort.laut[sp] ?? wort.laut}</em> : null)

/* ================= 1. Lektion ================= */
function SzeneLektion({ t, sp }) {
  const L = D.lektion
  const fliegt = t >= 9
  return (
    <div className="efn-szene">
      {t < 3 && (
        <div className="efn-block" key="wort">
          <small className="efn-marke">{TX[sp].neuesWort}</small>
          <div className={'efn-wortkarte' + (t >= 1 ? ' offen' : '')}>
            <b>{L.wort.w}</b><Laut wort={L.wort} sp={sp} />
            <span className="efn-bed">{t >= 1 ? L.wort[sp] : TX[sp].antippen}</span>
          </div>
          <Finger an={t === 0} x="62%" y="58%" />
        </div>
      )}
      {t >= 3 && t < 6 && (
        <div className="efn-block" key="grund">
          <small className="efn-marke">{TX[sp].gutZuWissen}</small>
          <div className="efn-grund">
            <span className="efn-birne">💡</span>
            <b>{L.grund.titel[sp]}</b>
            <div className="efn-tabelle">
              {L.grund.zeilen.map((z, i) => (
                <div key={i} style={{ animationDelay: 150 + i * 220 + 'ms' }}><b>{z[0]}</b><span>{z[1][sp] ?? z[1]}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}
      {t >= 6 && t < 9 && (
        <div className="efn-block" key="quiz">
          <small className="efn-marke">{L.frage[sp]}</small>
          <div className="efn-optionen">
            {L.optionen.map((o, i) => (
              <span key={i} className={'efn-option' + (t >= 8 && o.ok ? ' richtig' : '')}>{o[sp]}{t >= 8 && o.ok && <Haken />}</span>
            ))}
          </div>
          <Finger an={t === 7} x="70%" y="60%" />
          {t >= 8 && <b className="efn-xpflug">+10 XP</b>}
        </div>
      )}
      {fliegt && (
        <div className="efn-block efn-flug" key="flug">
          <div className="efn-chips">
            {L.chips.map((c, i) => (
              <span key={i} className="efn-chip efn-fall" style={{ animationDelay: 150 + i * 480 + 'ms' }}>{c[sp] ?? c}</span>
            ))}
          </div>
          <span className={'efn-ziel' + (t >= 10 ? ' kommt' : '')}>
            <span className="efn-zielbild"><NavBild art="trainer" />{t >= 10 && <b className="efn-badge" key={t}>{Math.min(3, t - 9)}</b>}</span>
            <small>{TX[sp].trainer}</small>
          </span>
        </div>
      )}
    </div>
  )
}

/* ================= 2. Trainer ================= */
function SzeneTrainer({ t, sp }) {
  const T = D.trainer
  const reiter = t < 4 ? 0 : t < 6 ? 1 : t < 8 ? 2 : -1
  const ki = t >= 8
  const k = T.karten[Math.max(0, reiter)]
  const offen = reiter === 0 ? t >= 1 : true
  return (
    <div className="efn-szene">
      {!ki ? (
        <>
          <div className="efn-block" key={'r' + reiter}>
            <small className="efn-marke">{TX[sp].kartenArt[reiter]}</small>
            <div className={'efn-lernkarte' + (reiter === 2 ? ' text' : '')}>
              <b>{k.w}</b>{reiter === 0 && <Laut wort={k} sp={sp} />}
              {reiter === 2 ? <span className="efn-zeilen"><i /><i /><i /></span>
                : offen ? <span className="efn-loesung">{k[sp]}</span> : <span className="efn-frage">?</span>}
            </div>
            {reiter === 0 && (
              <div className="efn-bewerten">
                <span className="rot">{TX[sp].nochmal}</span>
                <span className={'gruen' + (t >= 3 ? ' druck' : '')}>{TX[sp].gewusst}</span>
              </div>
            )}
            <Finger an={reiter === 0 && t === 2} x="72%" y="78%" />
          </div>
        </>
      ) : (
        <div className="efn-block efn-kiblock" key="ki">
          <div className="efn-kikopf"><span className="efn-zauber"><ZauberBild art="woerter" /></span><div><small className="efn-marke">{TX[sp].kiListe}</small><b>{TX[sp].interesse}</b></div></div>
          <div className="efn-interessen">
            {T.interessen.map((x, i) => <span key={i} className={i === 0 && t >= 10 ? 'an' : ''}>{x[sp]}</span>)}
          </div>
          <Finger an={t === 9} x="14%" y="118px" />
          {t === 10 && <p className="efn-baut">✨ {TX[sp].kiBaut}</p>}
          {t >= 11 && (
            <ul className="efn-liste">
              {T.liste.map((w, i) => <li key={w.w} style={{ animationDelay: i * 240 + 'ms' }}><b>{w.w}</b><span>{w[sp]}</span></li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

/* ================= 3. Sprechen ================= */
function SzeneSprechen({ t, sp }) {
  const G = D.sprechen
  const anruf = t >= 2
  const zeilen = G.zeilen.filter((z) => t >= z.ab)
  const duSpricht = t === 4 || t === 5
  return (
    <div className="efn-szene">
      {!anruf ? (
        <div className="efn-block efn-mitte" key="tuer">
          <div className="efn-tuer">
            <span className="efn-avatar gross"><Logo /></span>
            <b>{G.name[sp]}</b>
            <small>{TX[sp].bereit}</small>
            <span className={'efn-anruf' + (t >= 1 ? ' druck' : '')}>📞 {TX[sp].anrufen}</span>
          </div>
          <Finger an={t === 0 || t === 1} x="60%" y="76%" />
        </div>
      ) : (
        <div className="efn-block" key="call">
          <div className="efn-callkopf">
            <span className={'efn-avatar' + (!duSpricht ? ' spricht' : '')}><Logo /></span>
            <div><b>{G.name[sp]}</b><small className="efn-live">● {TX[sp].imGespraech} · 0:{String(3 + t * 2).padStart(2, '0')}</small></div>
          </div>
          <div className="efn-blasen">
            {zeilen.slice(-3).map((z) => (
              <p key={z.ab} className={'efn-blase ' + z.wer}>{z.wer === 'tipp' ? <>💡 {z[sp]}</> : z.s}</p>
            ))}
          </div>
          <div className={'efn-mikroleiste' + (duSpricht ? ' an' : '')} aria-hidden="true">
            <span className="efn-welle">{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ animationDelay: i * 70 + 'ms' }} />)}</span>
            <span className="efn-mikro"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg></span>
            <span className="efn-welle">{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ animationDelay: (8 - i) * 70 + 'ms' }} />)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================= 4. Mediathek ================= */
function SzeneMediathek({ t, sp }) {
  const M = D.media
  const r = t < 6 ? 0 : t < 10 ? 1 : 2
  return (
    <div className="efn-szene">
      {r === 0 && (
        <div className="efn-block" key="yt">
          <small className="efn-marke">{TX[sp].media[0]}</small>
          <div className="efn-video"><span className="efn-playknopf"><Play /></span><small>{M.video[sp]}</small><i style={{ width: 12 + t * 9 + '%' }} /></div>
          <div className="efn-untertitelbox">
            <p className="efn-untertitel">
              {M.satz.map((w, i) => <span key={i} className={i === M.tipp && t >= 3 ? 'an' : ''}>{w}</span>)}
            </p>
            {t >= 3 && <div className="efn-pop"><b>{M.satz[M.tipp]}</b> = {M.bed[sp]}<span className={t >= 4 ? 'drin' : ''}>{t >= 4 ? '✓ ' + TX[sp].imTrainer : '+ ' + TX[sp].trainer}</span></div>}
            <Finger an={t === 2} x="78%" y="40%" />
          </div>
        </div>
      )}
      {r === 1 && (
        <div className="efn-block" key="song">
          <small className="efn-marke">{TX[sp].media[1]}</small>
          <div className="efn-song">
            <span className="efn-platte"><i /></span>
            <div><b>{M.song.titel}</b><small>{M.song.von}</small></div>
            <span className="efn-eq" aria-hidden="true"><i /><i /><i /><i /></span>
          </div>
          <div className="efn-lyrics">
            {M.song.zeilen.map((z, i) => <p key={i} className={i === Math.min(2, t - 6) ? 'an' : ''}>{z}</p>)}
          </div>
        </div>
      )}
      {r === 2 && (
        <div className="efn-block" key="buch">
          <small className="efn-marke">{TX[sp].media[2]}</small>
          <div className="efn-buch">
            <span className="efn-cover"><b>{M.buch.titel[sp]}</b><small>A2</small></span>
            <p className="efn-seite">{M.buch.satz.map((w, i) => <span key={i} className={i === M.buch.tipp && t >= 12 ? 'an' : ''}>{w} </span>)}</p>
          </div>
          <Finger an={t === 11} x="66%" y="50%" />
          {t >= 12 && <div className="efn-pop"><b>{M.buch.satz[M.buch.tipp]}</b> = {M.buch.bed[sp]}</div>}
        </div>
      )}
    </div>
  )
}

/* ================= 5. Spiele & Freunde ================= */
function SzeneFreunde({ t, sp }) {
  const F = D.freunde
  const teil = t < 4 ? 0 : t < 7 ? 1 : 2
  const duXp = t >= 10 ? 370 : t >= 9 ? 340 : 290
  const vorne = t >= 11
  return (
    <div className="efn-szene">
      {teil === 0 && (
        <div className="efn-block" key="spiel">
          <div className="efn-spielkopf"><span className="efn-spielbild"><SpielBild id="memory" /></span><div><small className="efn-marke">{TX[sp].spiel}</small><b>Memory</b></div></div>
          <div className="efn-memory">
            {F.kacheln.map((k, i) => {
              const auf = (t >= 1 && i === 0) || (t >= 2 && i === 4)
              const paar = t >= 3 && (i === 0 || i === 4)
              return <span key={i} className={(auf ? 'auf' : '') + (paar ? ' paar' : '')}>{auf ? (k[sp] ?? k) : ''}</span>
            })}
          </div>
          <Finger an={t === 1} x="60%" y="80%" />
          {t >= 3 && <b className="efn-xpflug">+40 XP</b>}
        </div>
      )}
      {teil === 1 && (
        <div className="efn-block efn-mitte" key="einladen">
          <div className="efn-einladen">
            <div className="efn-koepfe"><span className="efn-person du">{TX[sp].du}</span><span className={'efn-person freund' + (t >= 6 ? ' da' : '')}>{F.name[sp][0]}</span></div>
            <b>{t >= 6 ? TX[sp].istDabei(F.name[sp]) : TX[sp].einladenTitel}</b>
            <span className={'efn-anruf' + (t >= 5 ? ' druck' : '')}>+ {TX[sp].einladen}</span>
          </div>
          <Finger an={t === 4 || t === 5} x="62%" y="78%" />
        </div>
      )}
      {teil === 2 && (
        <div className="efn-block" key="duell">
          <div className="efn-duellkopf"><small className="efn-marke">🏆 {TX[sp].duell}</small>{vorne && <b className="efn-jubel">{TX[sp].vorne}</b>}</div>
          <div className={'efn-podest' + (vorne ? ' getauscht' : '')}>
            <div className="efn-saeule links"><span className="efn-insel"><Insel stufe="zweiter" /><b>2</b></span></div>
            <div className="efn-saeule mitte"><span className="efn-insel"><Insel stufe="erster" /><b>1</b></span></div>
            <div className="efn-spieler du"><span className="efn-person du">{TX[sp].du}</span><b>{duXp} XP</b></div>
            <div className="efn-spieler freund"><span className="efn-person freund da">{F.name[sp][0]}</span><b>330 XP</b></div>
            {vorne && <span className="efn-krone">👑</span>}
          </div>
        </div>
      )}
    </div>
  )
}

const SZENEN = { lektion: SzeneLektion, trainer: SzeneTrainer, sprechen: SzeneSprechen, mediathek: SzeneMediathek, freunde: SzeneFreunde }

function Lautsprecher({ an }) {
  return an ? (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" /><path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
  )
}

/** @param {(ziel: 'lektion'|'erkunden') => void} props.onFertig */
export default function EinfuehrungKurz({ onFertig }) {
  const [sp] = useState(() => {
    try { const s = new URLSearchParams(window.location.search).get('sprache'); if (s === 'de' || s === 'en') return s } catch { /* egal */ }
    return sprache() === 'en' ? 'en' : 'de'
  })
  const tx = TX[sp]
  const [nr, setNr] = useState(0)
  const id = SCHRITTE[nr]
  const ende = id === 'los'
  const [t, runden] = useTakt(TAKTE[id] ?? 1, !ende)
  const [ton, setTon] = useState(() => { try { return localStorage.getItem('ef-ton') !== 'aus' } catch { return true } })
  const audio = useRef(null)

  useEffect(() => {
    document.body.classList.add('lektion-laeuft')
    return () => { document.body.classList.remove('lektion-laeuft'); audio.current?.pause() }
  }, [])

  const spiele = () => {
    audio.current?.pause()
    const a = new Audio(`/einfuehrung/${APP_KEY}-${id}.${sp}.mp3`)
    audio.current = a
    a.play().catch(() => {})
  }
  useEffect(() => {
    window.scrollTo(0, 0)
    if (ton) spiele(); else audio.current?.pause()
    if (ende) lektionTon()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nr])

  function tonUmschalten() {
    const neu = !ton
    setTon(neu)
    try { localStorage.setItem('ef-ton', neu ? 'an' : 'aus') } catch { /* egal */ }
    if (neu) spiele(); else audio.current?.pause()
  }

  const text = TEXTE[id][sp]
  const Szene = SZENEN[id]

  return (
    <div className={'efn' + (ende ? ' efn-schluss' : '')}>
      <div className="efn-kopf">
        <div className="efn-striche" aria-hidden="true">
          {SCHRITTE.slice(0, 5).map((x, i) => (
            <span key={x}><i style={{ width: i < nr || ende ? '100%' : i === nr ? (runden > 0 ? 100 : Math.round((t / TAKTE[id]) * 100)) + '%' : '0%' }} /></span>
          ))}
        </div>
        <button className={'efn-ton' + (ton ? ' an' : '')} onClick={tonUmschalten} aria-label={ton ? tx.tonAus : tx.tonAn}><Lautsprecher an={ton} /></button>
        {!ende && <button className="efn-leise" onClick={() => setNr(SCHRITTE.length - 1)}>{tx.ueberspringen}</button>}
      </div>

      {!ende ? (
        <div className="efn-haupt">
          <div className="efn-buehne" key={id} aria-hidden="true"><Szene t={t} sp={sp} /></div>
          <div className="efn-text" key={'t' + id}>
            <h1>{text.titel}</h1>
            <p>{text.satz}</p>
          </div>
          <div className="efn-fuss">
            <button className={'efn-knopf' + (runden > 0 ? ' puls' : '')} onClick={() => setNr(nr + 1)}>{tx.weiter}</button>
            {nr > 0 && <button className="efn-leise efn-zurueck" onClick={() => setNr(nr - 1)}>{tx.zurueck}</button>}
          </div>
        </div>
      ) : (
        <div className="efn-ende">
          <div className="efn-konfetti" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ left: 6 + i * 6.6 + '%', animationDelay: (i % 5) * 120 + 'ms' }} />)}</div>
          <div className="efn-bogen" aria-hidden="true">
            {['lektionen', 'trainer', 'start', 'youtube', 'profil'].map((art, i) => <span key={art} style={{ animationDelay: 150 + i * 110 + 'ms' }}><NavBild art={art} /><b><Haken /></b></span>)}
          </div>
          <h1>{text.titel}</h1>
          <p>{text.satz}</p>
          <span className="efn-geschenk">🎁 {tx.geschenk}</span>
          <div className="efn-fuss">
            <button className="efn-knopf puls" onClick={() => onFertig('lektion')}>{tx.lektion}</button>
            <button className="efn-leise efn-gross" onClick={() => onFertig('erkunden')}>{tx.erkunden}</button>
          </div>
        </div>
      )}
    </div>
  )
}
