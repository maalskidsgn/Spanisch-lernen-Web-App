// Die Einführungs-Lektion (15.11.2026, Manuel): Wer sich neu anmeldet,
// geht einmal spielerisch durch die ganze App – und macht jeden Schritt
// selbst, statt nur zuzuschauen:
//
//   1. erste Wörter antippen               → so laufen Lektionen
//      (bewusst OHNE Ton: Wörter ohne echte Aufnahme klangen nach
//      Computerstimme – 16.11., Manuel)
//   2. zwei kurze Quizfragen
//   3. eine KI-Wortliste bauen lassen       → „liegt jetzt im Trainer“
//   4. drei Karten im Mini-Trainer
//   5. ein Memory-Spiel                     → „mehr Spiele im Trainer“
//   6. Untertitel antippen                  → „so funktioniert die Mediathek“
//   7. Überblick: Start, Profil, Flamme
//   8. Abschluss mit Fanfare und XP
//
// Nach jedem Bereich zeigt eine kleine Nachbildung der Menüleiste,
// wo man das später wiederfindet. Die KI-Liste hier zählt nicht zu den
// Gratis-Erstellungen (Server: einfuehrung, nur für neue Konten).
// Jeder Schritt lässt sich überspringen – niemand soll festhängen.
//
// Zum Ansehen jederzeit: Adresse mit ?einfuehrung

import { useEffect, useMemo, useRef, useState } from 'react'
import NavBild from './NavBild.jsx'
import { API_URL } from './api.js'
import { loginKopf } from './limits.js'
import { erfolgston, fehlerton, lektionTon } from './erfolgston.js'
import { sprache } from './sprache.js'
import { XP } from './gamification.js'

const APP = 'Habloo'

/* ------------------------------------------------------------------ *
 *  Inhalte – je App die Zielsprache, je Oberfläche Deutsch/Englisch
 * ------------------------------------------------------------------ */

const W = (wort, de, en) => ({ wort, de, en })

const WOERTER = [
  W('hola', 'Hallo', 'hello'),
  W('gracias', 'danke', 'thank you'),
  W('el agua', 'das Wasser', 'water'),
  W('el café', 'der Kaffee', 'coffee'),
]

const THEMEN = [
  { id: 'essen', bild: '🍽️', thema: 'Essen und Trinken', de: 'Essen & Trinken', en: 'Food & drink', beispiel: [
    W('el pan', 'das Brot', 'bread'), W('la leche', 'die Milch', 'milk'), W('la manzana', 'der Apfel', 'apple'),
    W('el queso', 'der Käse', 'cheese'), W('la sopa', 'die Suppe', 'soup'), W('el pollo', 'das Hähnchen', 'chicken'),
  ] },
  { id: 'reisen', bild: '✈️', thema: 'Reisen', de: 'Reisen', en: 'Travel', beispiel: [
    W('el billete', 'das Ticket', 'ticket'), W('la maleta', 'der Koffer', 'suitcase'), W('el hotel', 'das Hotel', 'hotel'),
    W('la playa', 'der Strand', 'beach'), W('el tren', 'der Zug', 'train'), W('el mapa', 'die Karte', 'map'),
  ] },
  { id: 'freizeit', bild: '🎸', thema: 'Freizeit und Hobbys', de: 'Freizeit & Hobbys', en: 'Free time & hobbies', beispiel: [
    W('la música', 'die Musik', 'music'), W('el libro', 'das Buch', 'book'), W('la película', 'der Film', 'film'),
    W('jugar', 'spielen', 'to play'), W('bailar', 'tanzen', 'to dance'), W('el fútbol', 'der Fußball', 'football'),
  ] },
]

const SATZ = {
  de: 'Ich mag Musik sehr.',
  en: 'I really like music.',
  teile: [W('Me', 'mir', 'me'), W('gusta', 'gefällt', 'like'), W('mucho', 'sehr', 'a lot'), W('la', 'die', 'the'), W('música', 'die Musik', 'music')],
}

const TEXT = {
  de: {
    titel: `Willkommen bei ${APP}!`,
    unter: 'In drei Minuten kennst du die ganze App. Du probierst alles selbst aus – Schritt für Schritt.',
    los: 'Los geht’s',
    weiter: 'Weiter',
    ueberspringen: 'Überspringen',
    ganzUeberspringen: 'Einführung überspringen',
    woerterTitel: 'Deine ersten Wörter',
    woerterUnter: 'Tippe jede Karte an und sieh dir die Bedeutung an.',
    woerterHinweis: 'Genau so starten alle Lektionen.',
    quizTitel: 'Kurzer Check',
    quizFrage: (w) => `Was heißt „${w}“?`,
    richtig: 'Richtig!',
    falsch: 'Fast – schau noch mal hin.',
    lektionenWo: 'Lektionen findest du unten unter',
    listeTitel: 'Lass die KI eine Liste bauen',
    listeUnter: 'Wähle ein Thema – die KI stellt dir passende Wörter zusammen.',
    listeLaedt: 'Die KI sucht passende Wörter …',
    listeBeispiel: 'Die KI ist gerade nicht erreichbar – hier eine Beispielliste.',
    listeUebernehmen: 'In meinen Trainer übernehmen',
    listeFertig: 'Deine Liste liegt jetzt im Trainer.',
    listeWo: 'Neue Listen erstellst du jederzeit im',
    trainerTitel: 'So übst du im Trainer',
    trainerUnter: 'Weißt du, was das heißt? Deck die Karte auf.',
    aufdecken: 'Aufdecken',
    wusste: 'Wusste ich',
    nochNicht: 'Noch üben',
    trainerHinweis: 'Der Trainer fragt jedes Wort genau dann ab, wenn du es zu vergessen drohst.',
    spielTitel: 'Jetzt ein Spiel',
    spielUnter: 'Finde die Paare: Wort und Bedeutung.',
    spielFertig: 'Alle Paare gefunden!',
    spielWo: 'Weitere Spiele findest du im Trainer unter „Spiele“.',
    mediaTitel: 'Lernen mit Videos und Songs',
    mediaUnter: 'Tippe ein Wort im Untertitel an.',
    mediaHinweis: 'In der Mediathek laufen Videos und Songs mit solchen Untertiteln. Ein Tipp aufs Wort genügt – es landet in deinem Trainer.',
    mediaWo: 'Videos und Songs findest du unter',
    ueberblickTitel: 'Noch drei Dinge',
    start: 'Auf dem Start siehst du deinen Tagesplan und sprichst mit dem KI-Sprach-Trainer.',
    profil: 'Unter dem letzten Punkt findest du Liga, Freunde und Einstellungen.',
    flamme: 'Lern jeden Tag ein bisschen – dann wächst deine Flamme.',
    fertigTitel: 'Geschafft!',
    fertigUnter: 'Du kennst jetzt die ganze App. Gleich packen wir dir dein Startgeschenk ein – dann geht es mit der ersten echten Lektion los.',
    fertigRundgang: 'Du kennst jetzt die ganze App. Viel Spaß beim Lernen!',
    xp: 'Einführung geschafft',
  },
  en: {
    titel: `Welcome to ${APP}!`,
    unter: 'In three minutes you’ll know the whole app. You try everything yourself – step by step.',
    los: 'Let’s go',
    weiter: 'Next',
    ueberspringen: 'Skip',
    ganzUeberspringen: 'Skip the tour',
    woerterTitel: 'Your first words',
    woerterUnter: 'Tap each card to see what it means.',
    woerterHinweis: 'Every lesson starts just like this.',
    quizTitel: 'Quick check',
    quizFrage: (w) => `What does “${w}” mean?`,
    richtig: 'Correct!',
    falsch: 'Almost – have another look.',
    lektionenWo: 'You’ll find lessons down here under',
    listeTitel: 'Let the AI build a list',
    listeUnter: 'Pick a topic – the AI puts together matching words for you.',
    listeLaedt: 'The AI is picking words …',
    listeBeispiel: 'The AI can’t be reached right now – here is a sample list.',
    listeUebernehmen: 'Add to my trainer',
    listeFertig: 'Your list is now in the trainer.',
    listeWo: 'Create new lists any time in the',
    trainerTitel: 'Practising in the trainer',
    trainerUnter: 'Do you know what this means? Reveal the card.',
    aufdecken: 'Reveal',
    wusste: 'I knew it',
    nochNicht: 'Keep practising',
    trainerHinweis: 'The trainer asks each word right when you’re about to forget it.',
    spielTitel: 'Time for a game',
    spielUnter: 'Find the pairs: word and meaning.',
    spielFertig: 'All pairs found!',
    spielWo: 'More games are in the trainer under “Games”.',
    mediaTitel: 'Learn with videos and songs',
    mediaUnter: 'Tap a word in the subtitle.',
    mediaHinweis: 'The media library plays videos and songs with subtitles like these. One tap on a word – and it goes into your trainer.',
    mediaWo: 'Videos and songs are under',
    ueberblickTitel: 'Three more things',
    start: 'Home shows your daily plan – and that’s where you talk to the AI speaking coach.',
    profil: 'The last tab holds your league, friends and settings.',
    flamme: 'Learn a little every day – and your streak flame grows.',
    fertigTitel: 'Done!',
    fertigUnter: 'You now know the whole app. Next we’ll pack your welcome gift – then your first real lesson starts.',
    fertigRundgang: 'You now know the whole app. Have fun learning!',
    xp: 'Tour completed',
  },
}

const SCHRITTE = ['start', 'woerter', 'quiz', 'liste', 'trainer', 'spiel', 'media', 'ueberblick', 'fertig']

function mischen(liste) {
  const a = [...liste]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Außerhalb der Komponente: Innen definiert würden sie bei jedem Tipp neu
// erzeugt – und mit der Einblend-Animation jedes Mal neu hereinfliegen.
function Knopf({ an = true, children, onClick }) {
  return <button className="ef-knopf" disabled={!an} onClick={onClick}>{children}</button>
}
function Ueberspringen({ onClick, children }) {
  return <button className="ef-leise" onClick={onClick}>{children}</button>
}

/** Kleine Nachbildung der Menüleiste: zeigt, wo etwas später liegt. */
function NavMini({ hell, labels }) {
  const punkte = [
    ['start', 'start'],
    ['lektionen', 'lektionen'],
    ['trainer', 'trainer'],
    ['mediathek', 'youtube'],
    ['profil', 'profil'],
  ]
  return (
    <div className="ef-nav" aria-hidden="true">
      {punkte.map(([id, bild]) => (
        <span key={id} className={'ef-nav-punkt' + (id === hell ? ' ef-nav-hell' : '')}>
          <NavBild art={bild} />
          <small>{labels[id]}</small>
        </span>
      ))}
    </div>
  )
}

/**
 * @param {object} props
 * @param {() => void} props.onFertig – danach entscheidet App.jsx (Einrichtung oder Start)
 * @param {(woerter: {wort, uebersetzung, quelle}[]) => void} props.onAddVocab
 * @param {(xp: number, text?: string) => void} props.addXp
 * @param {object} props.vocab – um Dopplungen zu vermeiden
 * @param {{start, lektionen, trainer, mediathek, profil}} props.navLabels
 */
export default function Einfuehrung({ onFertig, onAddVocab, addXp, vocab = {}, navLabels, rundgang = false }) {
  const sp = sprache() === 'en' ? 'en' : 'de'
  const tx = TEXT[sp]
  const bed = (w) => w[sp] ?? w.de
  const [nr, setNr] = useState(0)
  const schritt = SCHRITTE[nr]
  const weiter = () => setNr((n) => Math.min(n + 1, SCHRITTE.length - 1))

  // Während der Einführung keine Menüleiste (wie in einer Lektion)
  useEffect(() => {
    document.body.classList.add('lektion-laeuft')
    window.scrollTo(0, 0)
    return () => document.body.classList.remove('lektion-laeuft')
  }, [])
  useEffect(() => { window.scrollTo(0, 0) }, [nr])

  /* ---- 1. Wörter ---- */
  const [gesehen, setGesehen] = useState([])
  function karteAntippen(w) {
    setGesehen((g) => (g.includes(w.wort) ? g : [...g, w.wort]))
  }

  /* ---- 2. Quiz ---- */
  const fragen = useMemo(() => {
    const zwei = mischen(WOERTER).slice(0, 2)
    return zwei.map((w) => ({
      w,
      optionen: mischen([w, ...mischen(WOERTER.filter((x) => x !== w)).slice(0, 2)]),
    }))
  }, [])
  const [frageNr, setFrageNr] = useState(0)
  const [antwort, setAntwort] = useState(null)
  function antworten(o) {
    if (antwort?.richtig) return
    const richtig = o === fragen[frageNr].w
    setAntwort({ o, richtig })
    if (richtig) {
      erfolgston()
      setTimeout(() => {
        setAntwort(null)
        if (frageNr + 1 < fragen.length) setFrageNr(frageNr + 1)
        else setFrageNr(fragen.length)
      }, 800)
    } else fehlerton()
  }

  /* ---- 3. KI-Liste ---- */
  const [thema, setThema] = useState(null)
  const [liste, setListe] = useState(null)
  const [laedt, setLaedt] = useState(false)
  const [beispiel, setBeispiel] = useState(false)
  const [uebernommen, setUebernommen] = useState(false)
  async function listeHolen(t) {
    setThema(t)
    setLaedt(true)
    setBeispiel(false)
    try {
      const res = await fetch(API_URL + '/api/vokabelliste', {
        method: 'POST',
        headers: await loginKopf({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ thema: t.thema, bekannt: Object.keys(vocab), sprache: sp, anzahl: 8, einfuehrung: true }),
      })
      const data = await res.json()
      if (!res.ok || !Array.isArray(data.vokabeln) || data.vokabeln.length < 4) throw new Error('leer')
      setListe(data.vokabeln.slice(0, 8).map((v) => ({ wort: v.wort, bedeutung: v.uebersetzung })))
    } catch {
      setBeispiel(true)
      setListe(t.beispiel.map((w) => ({ wort: w.wort, bedeutung: bed(w) })))
    } finally {
      setLaedt(false)
    }
  }
  function uebernehmen() {
    onAddVocab(liste.map((w) => ({ wort: w.wort, uebersetzung: w.bedeutung, quelle: 'Einführung' })))
    setUebernommen(true)
    erfolgston()
  }
  // Mini-Trainer und Spiel üben mit genau dieser Liste
  const uebWoerter = useMemo(
    () => (liste?.length ? liste : WOERTER.map((w) => ({ wort: w.wort, bedeutung: bed(w) }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [liste],
  )

  /* ---- 4. Mini-Trainer ---- */
  const [karteNr, setKarteNr] = useState(0)
  const [offen, setOffen] = useState(false)
  const karten = uebWoerter.slice(0, 3)
  function bewerten(gewusst) {
    if (gewusst) erfolgston()
    setOffen(false)
    setKarteNr((k) => k + 1)
  }

  /* ---- 5. Memory ---- */
  const kacheln = useMemo(() => {
    const paare = uebWoerter.slice(0, 4)
    return mischen(paare.flatMap((w, i) => [
      { id: i + 'a', paar: i, text: w.wort, ziel: true },
      { id: i + 'b', paar: i, text: w.bedeutung, ziel: false },
    ]))
  }, [uebWoerter])
  const [aufgedeckt, setAufgedeckt] = useState([])
  const [gefunden, setGefunden] = useState([])
  const spielFertig = gefunden.length === kacheln.length / 2
  // Ref statt nur Zustand: Zwei sehr schnelle Tipps sehen sonst beide
  // denselben alten Stand, und das Paar würde nie erkannt.
  const aufRef = useRef([])
  const gefundenRef = useRef([])
  function kachel(k) {
    const auf = aufRef.current
    if (auf.length === 2 || auf.includes(k) || gefundenRef.current.includes(k.paar)) return
    const neu = [...auf, k]
    aufRef.current = neu
    setAufgedeckt(neu)
    if (neu.length === 2) {
      const zu = () => { aufRef.current = []; setAufgedeckt([]) }
      if (neu[0].paar === neu[1].paar) {
        erfolgston()
        gefundenRef.current = [...gefundenRef.current, k.paar]
        setGefunden(gefundenRef.current)
        setTimeout(zu, 300)
      } else {
        setTimeout(zu, 900)
      }
    }
  }

  /* ---- 6. Untertitel ---- */
  const [satzWort, setSatzWort] = useState(null)
  function satzTippen(teil) {
    setSatzWort(teil)
  }

  /* ---- Abschluss ---- */
  useEffect(() => {
    if (schritt !== 'fertig') return
    lektionTon()
    addXp?.(XP.LEKTION, tx.xp)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schritt])

  const fortschritt = (nr / (SCHRITTE.length - 1)) * 100

  return (
    <div className="ef">
      {schritt !== 'start' && schritt !== 'fertig' && (
        <div className="player-top">
          <button className="btn-plain" onClick={() => onFertig()} aria-label={tx.ganzUeberspringen}>✕</button>
          <div className="xp-bar player-bar">
            <div className="xp-bar-fill" style={{ width: fortschritt + '%' }} />
          </div>
        </div>
      )}

      {schritt === 'start' && (
        <section key={schritt} className="ef-buehne ef-start">
          <div className="ef-start-bild" aria-hidden="true">👋</div>
          <h1>{tx.titel}</h1>
          <p className="ef-unter">{tx.unter}</p>
          <Knopf onClick={weiter}>{tx.los}</Knopf>
          <button className="ef-leise" onClick={() => onFertig()}>{tx.ganzUeberspringen}</button>
        </section>
      )}

      {schritt === 'woerter' && (
        <section key={schritt} className="ef-buehne">
          <h2>{tx.woerterTitel}</h2>
          <p className="ef-unter">{tx.woerterUnter}</p>
          <div className="ef-woerter">
            {WOERTER.map((w) => {
              const da = gesehen.includes(w.wort)
              return (
                <button key={w.wort} className={'ef-wortkarte' + (da ? ' ef-gedreht' : '')} onClick={() => karteAntippen(w)}>
                  <b>{w.wort}</b>
                  
                  <span className="ef-bedeutung">{da ? bed(w) : '👆'}</span>
                </button>
              )
            })}
          </div>
          <p className="ef-hinweis">{tx.woerterHinweis}</p>
          <Knopf an={gesehen.length >= WOERTER.length} onClick={weiter}>{tx.weiter}</Knopf>
          <Ueberspringen onClick={weiter}>{tx.ueberspringen}</Ueberspringen>
        </section>
      )}

      {schritt === 'quiz' && (
        <section key={schritt} className="ef-buehne">
          <h2>{tx.quizTitel}</h2>
          {frageNr < fragen.length ? (
            <>
              <p className="ef-frage">{tx.quizFrage(fragen[frageNr].w.wort)}</p>
              <div className="ef-optionen">
                {fragen[frageNr].optionen.map((o) => (
                  <button
                    key={o.wort}
                    className={'ef-option' + (antwort?.o === o ? (antwort.richtig ? ' ef-richtig' : ' ef-falsch') : '')}
                    onClick={() => antworten(o)}
                  >
                    {bed(o)}
                  </button>
                ))}
              </div>
              {antwort && <p className={'ef-rueck' + (antwort.richtig ? ' ef-gut' : '')}>{antwort.richtig ? tx.richtig : tx.falsch}</p>}
              <Ueberspringen onClick={weiter}>{tx.ueberspringen}</Ueberspringen>
            </>
          ) : (
            <>
              <p className="ef-rueck ef-gut">✓ {tx.richtig}</p>
              <div className="ef-wo">
                <p>{tx.lektionenWo} <b>{navLabels.lektionen}</b>.</p>
                <NavMini hell="lektionen" labels={navLabels} />
              </div>
              <Knopf onClick={weiter}>{tx.weiter}</Knopf>
            </>
          )}
        </section>
      )}

      {schritt === 'liste' && (
        <section key={schritt} className="ef-buehne">
          <h2>{tx.listeTitel}</h2>
          {!liste && !laedt && (
            <>
              <p className="ef-unter">{tx.listeUnter}</p>
              <div className="ef-themen">
                {THEMEN.map((t) => (
                  <button key={t.id} className="ef-thema" onClick={() => listeHolen(t)}>
                    <span aria-hidden="true">{t.bild}</span> {t[sp]}
                  </button>
                ))}
              </div>
              <Ueberspringen onClick={weiter}>{tx.ueberspringen}</Ueberspringen>
            </>
          )}
          {laedt && (
            <div className="ef-laedt">
              <span className="ef-funke" aria-hidden="true">✨</span>
              <p>{tx.listeLaedt}</p>
            </div>
          )}
          {liste && !laedt && (
            <>
              <p className="ef-unter">{thema?.bild} {thema?.[sp]}</p>
              {beispiel && <p className="ef-hinweis">{tx.listeBeispiel}</p>}
              <ul className="ef-liste">
                {liste.map((w) => (
                  <li key={w.wort}>
                    <b>{w.wort}</b>
                    <span>{w.bedeutung}</span>
                  </li>
                ))}
              </ul>
              {!uebernommen ? (
                <Knopf onClick={uebernehmen}>{tx.listeUebernehmen}</Knopf>
              ) : (
                <>
                  <p className="ef-rueck ef-gut">✓ {tx.listeFertig}</p>
                  <div className="ef-wo">
                    <p>{tx.listeWo} <b>{navLabels.trainer}</b>.</p>
                    <NavMini hell="trainer" labels={navLabels} />
                  </div>
                  <Knopf onClick={weiter}>{tx.weiter}</Knopf>
                </>
              )}
            </>
          )}
        </section>
      )}

      {schritt === 'trainer' && (
        <section key={schritt} className="ef-buehne">
          <h2>{tx.trainerTitel}</h2>
          {karteNr < karten.length ? (
            <>
              <p className="ef-unter">{tx.trainerUnter}</p>
              <div className="ef-trainerkarte">
                <small>{karteNr + 1} / {karten.length}</small>
                <b>{karten[karteNr].wort}</b>
                
                {offen ? <span className="ef-bedeutung">{karten[karteNr].bedeutung}</span> : <span className="ef-bedeutung ef-zu">?</span>}
              </div>
              {!offen ? (
                <Knopf onClick={() => setOffen(true)}>{tx.aufdecken}</Knopf>
              ) : (
                <div className="ef-zwei">
                  <button className="ef-knopf ef-knopf-hell" onClick={() => bewerten(false)}>{tx.nochNicht}</button>
                  <button className="ef-knopf" onClick={() => bewerten(true)}>{tx.wusste}</button>
                </div>
              )}
              <Ueberspringen onClick={weiter}>{tx.ueberspringen}</Ueberspringen>
            </>
          ) : (
            <>
              <p className="ef-hinweis">{tx.trainerHinweis}</p>
              <NavMini hell="trainer" labels={navLabels} />
              <Knopf onClick={weiter}>{tx.weiter}</Knopf>
            </>
          )}
        </section>
      )}

      {schritt === 'spiel' && (
        <section key={schritt} className="ef-buehne">
          <h2>{tx.spielTitel}</h2>
          <p className="ef-unter">{spielFertig ? tx.spielFertig : tx.spielUnter}</p>
          <div className="ef-memory">
            {kacheln.map((k) => {
              const sichtbar = aufgedeckt.includes(k) || gefunden.includes(k.paar)
              return (
                <button
                  key={k.id}
                  className={'ef-kachel' + (sichtbar ? ' ef-kachel-auf' : '') + (gefunden.includes(k.paar) ? ' ef-kachel-paar' : '') + (k.ziel ? ' ef-kachel-ziel' : '')}
                  onClick={() => kachel(k)}
                >
                  {sichtbar ? k.text : ''}
                </button>
              )
            })}
          </div>
          {spielFertig ? (
            <>
              <div className="ef-wo">
                <p>{tx.spielWo}</p>
                <NavMini hell="trainer" labels={navLabels} />
              </div>
              <Knopf onClick={weiter}>{tx.weiter}</Knopf>
            </>
          ) : (
            <Ueberspringen onClick={weiter}>{tx.ueberspringen}</Ueberspringen>
          )}
        </section>
      )}

      {schritt === 'media' && (
        <section key={schritt} className="ef-buehne">
          <h2>{tx.mediaTitel}</h2>
          <p className="ef-unter">{tx.mediaUnter}</p>
          <div className="ef-video">
            <div className="ef-video-bild" aria-hidden="true">
              <span>▶</span>
            </div>
            <p className="ef-untertitel">
              {SATZ.teile.map((teil, i) => (
                <button
                  key={i}
                  className={'ef-satzwort' + (satzWort === teil ? ' ef-satzwort-an' : '')}
                  onClick={() => satzTippen(teil)}
                >
                  {teil.wort}
                </button>
              ))}
            </p>
            <p className="ef-satz-de">{satzWort ? <><b>{satzWort.wort}</b> = {bed(satzWort)}</> : bed(SATZ)}</p>
          </div>
          {satzWort && (
            <>
              <p className="ef-hinweis">{tx.mediaHinweis}</p>
              <div className="ef-wo">
                <p>{tx.mediaWo} <b>{navLabels.mediathek}</b>.</p>
                <NavMini hell="mediathek" labels={navLabels} />
              </div>
            </>
          )}
          <Knopf an={Boolean(satzWort)} onClick={weiter}>{tx.weiter}</Knopf>
          {!satzWort && <Ueberspringen onClick={weiter}>{tx.ueberspringen}</Ueberspringen>}
        </section>
      )}

      {schritt === 'ueberblick' && (
        <section key={schritt} className="ef-buehne">
          <h2>{tx.ueberblickTitel}</h2>
          <ul className="ef-ueberblick">
            <li><span aria-hidden="true">🏠</span><p>{tx.start}</p></li>
            <li><span aria-hidden="true">🏆</span><p>{tx.profil}</p></li>
            <li><span aria-hidden="true">🔥</span><p>{tx.flamme}</p></li>
          </ul>
          <NavMini hell="start" labels={navLabels} />
          <Knopf onClick={weiter}>{tx.weiter}</Knopf>
        </section>
      )}

      {schritt === 'fertig' && (
        <section key={schritt} className="ef-buehne ef-start ef-fertig">
          <div className="ef-start-bild" aria-hidden="true">🎉</div>
          <h1>{tx.fertigTitel}</h1>
          <p className="ef-unter">{rundgang ? tx.fertigRundgang : tx.fertigUnter}</p>
          <div className="ef-xp">+{XP.LEKTION} XP</div>
          <Knopf onClick={() => onFertig()}>{tx.weiter}</Knopf>
        </section>
      )}
    </div>
  )
}
