import { useState } from 'react'
import { mischen } from './lektionen.js'
import { XP } from './gamification.js'

// Mini-Spiele mit den eigenen Vokabeln: Memory, Wortpaare und Kreuzworträtsel.
// Alle Spiele holen sich die Wörter aus dem Vokabeltrainer.

// Macht aus dem Vokabel-Speicher spielbare Paare (Wort + Übersetzung)
function spielbareVokabeln(vocab) {
  return Object.entries(vocab)
    .filter(([wort, e]) => e.translation && wort.length <= 16 && e.translation.length <= 18)
    .map(([wort, e]) => ({ es: wort, de: e.translation }))
}

// Entfernt Akzente fürs einfache Tippen im Kreuzworträtsel (ñ -> n, á -> a)
function vereinfachen(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export default function Games({ spiel, vocab, addXp, onClose }) {
  const paare = mischen(spielbareVokabeln(vocab))

  if (paare.length < 4) {
    return (
      <div className="trainer">
        <p className="empty-hint">
          Sammle erst ein paar Vokabeln (mindestens 4), dann kannst du hier spielen!
        </p>
        <button onClick={onClose}>Zurück</button>
      </div>
    )
  }

  return (
    <div className="trainer training-stage">
      <div className="player-top">
        <button className="btn-plain" onClick={onClose}>✕</button>
        <h2 className="game-title">
          {spiel === 'memory' && '🧠 Memory'}
          {spiel === 'paare' && '🔗 Wortpaare'}
          {spiel === 'kreuz' && '✏️ Kreuzworträtsel'}
        </h2>
      </div>
      {spiel === 'memory' && <Memory paare={paare.slice(0, 6)} addXp={addXp} onClose={onClose} />}
      {spiel === 'paare' && <WortPaare paare={paare.slice(0, 5)} addXp={addXp} onClose={onClose} />}
      {spiel === 'kreuz' && <Kreuzwort paare={paare} addXp={addXp} onClose={onClose} />}
    </div>
  )
}

// Der gemeinsame "Geschafft!"-Bildschirm aller Spiele
function SpielFertig({ text, onClose }) {
  return (
    <div className="flashcard done">
      <div className="confetti-burst" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="confetti" style={{ '--i': i }} />
        ))}
      </div>
      <h2>Geschafft! 🎉</h2>
      <p>{text}</p>
      <p className="bonus-note">+{XP.SPIEL} Bonus-XP</p>
      <button onClick={onClose}>Zurück zum Trainer</button>
    </div>
  )
}

/* ---------- Spiel 1: Memory ---------- */
// Karten liegen verdeckt. Decke zwei auf – gehören Wort und
// Übersetzung zusammen, bleiben sie offen liegen.
function Memory({ paare, addXp, onClose }) {
  const [karten] = useState(() =>
    mischen(
      paare.flatMap((p, i) => [
        { id: i + '-es', pairId: i, text: p.es },
        { id: i + '-de', pairId: i, text: p.de },
      ])
    )
  )
  const [offen, setOffen] = useState([]) // ids der gerade aufgedeckten Karten
  const [gefunden, setGefunden] = useState([]) // pairIds der gefundenen Paare
  const [versuche, setVersuche] = useState(0)
  const [sperre, setSperre] = useState(false) // kurz warten, wenn zwei falsche offen sind
  const [fertig, setFertig] = useState(false)

  function klick(karte) {
    if (sperre || offen.includes(karte.id) || gefunden.includes(karte.pairId)) return
    const neu = [...offen, karte.id]
    setOffen(neu)
    if (neu.length < 2) return

    setVersuche((v) => v + 1)
    const [a, b] = neu.map((id) => karten.find((k) => k.id === id))
    if (a.pairId === b.pairId) {
      // Paar gefunden!
      const alle = [...gefunden, a.pairId]
      setGefunden(alle)
      setOffen([])
      addXp(XP.QUIZ_RICHTIG)
      if (alle.length === paare.length) {
        addXp(XP.SPIEL)
        setFertig(true)
      }
    } else {
      // kein Paar: kurz zeigen, dann wieder zudecken
      setSperre(true)
      setTimeout(() => {
        setOffen([])
        setSperre(false)
      }, 900)
    }
  }

  if (fertig) {
    return <SpielFertig text={`Alle ${paare.length} Paare in ${versuche} Versuchen gefunden!`} onClose={onClose} />
  }

  return (
    <>
      <p className="training-progress">
        {gefunden.length}/{paare.length} Paare · {versuche} Versuche
      </p>
      <div className="memory-grid">
        {karten.map((k) => {
          const istOffen = offen.includes(k.id) || gefunden.includes(k.pairId)
          return (
            <button
              key={k.id}
              className={
                'memory-card' +
                (istOffen ? ' memory-offen' : '') +
                (gefunden.includes(k.pairId) ? ' memory-gefunden' : '')
              }
              onClick={() => klick(k)}
            >
              {istOffen ? k.text : '?'}
            </button>
          )
        })}
      </div>
    </>
  )
}

/* ---------- Spiel 2: Wortpaare finden ---------- */
// Links Spanisch, rechts Deutsch (gemischt). Tippe die zusammen-
// gehörenden Wörter an, bis alle Paare verbunden sind.
function WortPaare({ paare, addXp, onClose }) {
  const [rechts] = useState(() => mischen(paare))
  const [wahlLinks, setWahlLinks] = useState(null) // angetipptes spanisches Wort
  const [geloest, setGeloest] = useState([]) // die es-Wörter der gelösten Paare
  const [fehler, setFehler] = useState(null) // kurz rot aufblinken
  const [fertig, setFertig] = useState(false)

  function klickRechts(p) {
    if (!wahlLinks || geloest.includes(p.es)) return
    if (p.es === wahlLinks.es) {
      const alle = [...geloest, p.es]
      setGeloest(alle)
      setWahlLinks(null)
      addXp(XP.QUIZ_RICHTIG)
      if (alle.length === paare.length) {
        addXp(XP.SPIEL)
        setFertig(true)
      }
    } else {
      setFehler(p.es)
      setTimeout(() => {
        setFehler(null)
        setWahlLinks(null)
      }, 600)
    }
  }

  if (fertig) {
    return <SpielFertig text={`Alle ${paare.length} Wortpaare verbunden!`} onClose={onClose} />
  }

  return (
    <>
      <p className="training-progress">
        Tippe links ein Wort an und dann rechts die passende Übersetzung
      </p>
      <div className="pairs-grid">
        <div className="pairs-col">
          {paare.map((p) => (
            <button
              key={p.es}
              className={
                'quiz-option' +
                (geloest.includes(p.es) ? ' option-richtig' : '') +
                (wahlLinks?.es === p.es ? ' pair-gewaehlt' : '')
              }
              disabled={geloest.includes(p.es)}
              onClick={() => setWahlLinks(p)}
            >
              {p.es}
            </button>
          ))}
        </div>
        <div className="pairs-col">
          {rechts.map((p) => (
            <button
              key={p.es}
              className={
                'quiz-option' +
                (geloest.includes(p.es) ? ' option-richtig' : '') +
                (fehler === p.es ? ' option-falsch' : '')
              }
              disabled={geloest.includes(p.es)}
              onClick={() => klickRechts(p)}
            >
              {p.de}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

/* ---------- Spiel 3: Kreuzworträtsel ---------- */

// Baut aus einzelnen Wörtern ein kleines Kreuzworträtsel:
// Das erste Wort liegt waagerecht, weitere Wörter werden an
// gemeinsamen Buchstaben senkrecht/waagerecht angedockt.
function baueKreuzwort(kandidaten) {
  const woerter = kandidaten
    .filter((p) => /^[a-záéíóúüñ]{3,10}$/i.test(p.es))
    .slice(0, 6)
    .map((p) => ({ wort: vereinfachen(p.es), anzeige: p.es, hinweis: p.de }))
  if (woerter.length < 3) return null

  const zellen = {} // "reihe,spalte" -> Buchstabe
  const platziert = []

  function passt(wort, r, c, senkrecht) {
    for (let i = 0; i < wort.length; i++) {
      const key = senkrecht ? `${r + i},${c}` : `${r},${c + i}`
      if (zellen[key] && zellen[key] !== wort[i]) return false
    }
    return true
  }

  function setze(eintrag, r, c, senkrecht) {
    for (let i = 0; i < eintrag.wort.length; i++) {
      const key = senkrecht ? `${r + i},${c}` : `${r},${c + i}`
      zellen[key] = eintrag.wort[i]
    }
    platziert.push({ ...eintrag, r, c, senkrecht })
  }

  setze(woerter[0], 0, 0, false)
  for (const eintrag of woerter.slice(1)) {
    let gesetzt = false
    // einen gemeinsamen Buchstaben mit einem platzierten Wort suchen
    for (const p of platziert) {
      if (gesetzt) break
      for (let i = 0; i < p.wort.length && !gesetzt; i++) {
        const j = eintrag.wort.indexOf(p.wort[i])
        if (j === -1) continue
        // Kreuzungspunkt: neues Wort senkrecht, wenn das alte waagerecht liegt
        const senkrecht = !p.senkrecht
        const r = senkrecht ? p.r - j : p.r + i
        const c = senkrecht ? p.c + i : p.c - j
        if (passt(eintrag.wort, r, c, senkrecht)) {
          setze(eintrag, r, c, senkrecht)
          gesetzt = true
        }
      }
    }
  }

  // Koordinaten so verschieben, dass alles bei 0 beginnt
  const reihen = Object.keys(zellen).map((k) => Number(k.split(',')[0]))
  const spalten = Object.keys(zellen).map((k) => Number(k.split(',')[1]))
  const minR = Math.min(...reihen)
  const minC = Math.min(...spalten)
  const breite = Math.max(...spalten) - minC + 1
  const hoehe = Math.max(...reihen) - minR + 1
  for (const p of platziert) {
    p.r -= minR
    p.c -= minC
  }
  return { platziert, breite, hoehe }
}

function Kreuzwort({ paare, addXp, onClose }) {
  const [raetsel] = useState(() => baueKreuzwort(paare))
  const [eingaben, setEingaben] = useState({}) // "r,c" -> getippter Buchstabe
  const [geloest, setGeloest] = useState([]) // Index der gelösten Wörter
  const [fertig, setFertig] = useState(false)

  if (!raetsel) {
    return (
      <p className="empty-hint">
        Für ein Kreuzworträtsel brauchst du mindestens 3 einzelne Wörter (keine
        Sätze) im Trainer. Sammle noch ein paar!
      </p>
    )
  }

  // Nach jeder Eingabe prüfen, ob ein Wort komplett richtig ist
  function tippe(key, wert) {
    const neu = { ...eingaben, [key]: vereinfachen(wert).slice(-1) }
    setEingaben(neu)

    const jetztGeloest = [...geloest]
    raetsel.platziert.forEach((p, index) => {
      if (jetztGeloest.includes(index)) return
      const komplett = [...p.wort].every((buchstabe, i) => {
        const k = p.senkrecht ? `${p.r + i},${p.c}` : `${p.r},${p.c + i}`
        return neu[k] === buchstabe
      })
      if (komplett) {
        jetztGeloest.push(index)
        addXp(XP.QUIZ_RICHTIG)
      }
    })
    if (jetztGeloest.length !== geloest.length) setGeloest(jetztGeloest)
    if (jetztGeloest.length === raetsel.platziert.length) {
      addXp(XP.SPIEL)
      setFertig(true)
    }
  }

  function istGeloest(r, c) {
    return raetsel.platziert.some(
      (p, index) =>
        geloest.includes(index) &&
        (p.senkrecht
          ? c === p.c && r >= p.r && r < p.r + p.wort.length
          : r === p.r && c >= p.c && c < p.c + p.wort.length)
    )
  }

  if (fertig) {
    return <SpielFertig text={`Alle ${raetsel.platziert.length} Wörter gelöst!`} onClose={onClose} />
  }

  return (
    <>
      <div className="kw-scroll">
        <div
          className="kw-grid"
          style={{ gridTemplateColumns: `repeat(${raetsel.breite}, 36px)` }}
        >
          {Array.from({ length: raetsel.hoehe }, (_, r) =>
            Array.from({ length: raetsel.breite }, (_, c) => {
              const key = `${r},${c}`
              const gehoertZuWort = raetsel.platziert.some((p) =>
                p.senkrecht
                  ? c === p.c && r >= p.r && r < p.r + p.wort.length
                  : r === p.r && c >= p.c && c < p.c + p.wort.length
              )
              if (!gehoertZuWort) return <span key={key} className="kw-leer" />
              const nummer = raetsel.platziert.findIndex((p) => p.r === r && p.c === c)
              return (
                <span key={key} className={'kw-zelle' + (istGeloest(r, c) ? ' kw-geloest' : '')}>
                  {nummer !== -1 && <i className="kw-nummer">{nummer + 1}</i>}
                  <input
                    type="text"
                    maxLength={2}
                    value={eingaben[key] || ''}
                    onChange={(e) => tippe(key, e.target.value)}
                    disabled={istGeloest(r, c)}
                  />
                </span>
              )
            })
          )}
        </div>
      </div>
      <ol className="kw-hinweise">
        {raetsel.platziert.map((p, i) => (
          <li key={i} className={geloest.includes(i) ? 'kw-hinweis-geloest' : ''}>
            <b>{i + 1} {p.senkrecht ? '↓' : '→'}</b> {p.hinweis}
            {geloest.includes(i) && ` = ${p.anzeige} ✓`}
          </li>
        ))}
      </ol>
    </>
  )
}
