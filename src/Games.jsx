import { useState, useEffect, useRef } from 'react'
import { mischen } from './lektionen.js'
import { XP } from './gamification.js'
import { isDue, withSrsDefaults } from './srs.js'

// Mini-Spiele mit den eigenen Vokabeln: Memory, Wortpaare,
// Wortsuche und Wortfang.
//
// Wichtig: Die Spiele sind kein Zeitvertreib neben dem Trainer, sondern
// ein Teil davon. Sie nehmen bevorzugt die Wörter, die als Nächstes
// dran wären, und stufen sie am Ende im Karteikasten hoch.

/**
 * Schwebende "+10 XP"-Anzeige fuer die Spiele.
 *
 * Belohnung muss man SEHEN, sonst wirkt sie nicht. Bisher wanderten
 * die Punkte still ins Konto – jetzt poppt bei jedem Treffer eine
 * Zahl auf.
 */
function useXpMeldung(addXp) {
  const [meldung, setMeldung] = useState(null)

  function belohne(punkte, text) {
    addXp(punkte)
    // key sorgt dafuer, dass die Animation bei jedem Treffer neu startet
    setMeldung({ punkte, text, key: Date.now() + Math.random() })
  }

  const anzeige = meldung ? (
    <span key={meldung.key} className="spiel-xp" onAnimationEnd={() => setMeldung(null)}>
      +{meldung.punkte} XP{meldung.text ? ' · ' + meldung.text : ''}
    </span>
  ) : null

  return [anzeige, belohne]
}

/**
 * Wählt spielbare Paare – fällige Wörter zuerst.
 * Zu lange Wörter passen nicht auf die Karten und fallen raus.
 */
function spielbareVokabeln(vocab) {
  const passend = Object.entries(vocab)
    .map(([wort, e]) => ({ wort, eintrag: withSrsDefaults(e) }))
    .filter(
      ({ wort, eintrag }) =>
        eintrag.translation && wort.length <= 16 && eintrag.translation.length <= 18
    )

  const faellig = passend.filter(({ eintrag }) => isDue(eintrag))
  const rest = passend.filter(({ eintrag }) => !isDue(eintrag))

  // Erst die fälligen, dann der Rest zum Auffüllen
  return [...mischen(faellig), ...mischen(rest)].map(({ wort, eintrag }) => ({
    es: wort,
    de: eintrag.translation,
    faellig: isDue(eintrag),
  }))
}

export default function Games({ spiel, vocab, addXp, onClose, onGespielt }) {
  // Die Auswahl EINMAL beim Öffnen festlegen. Vorher wurde sie bei
  // jedem Neuzeichnen neu gemischt – dadurch zeigte die linke Spalte
  // plötzlich andere Wörter als die rechte, und kein Paar passte mehr.
  const [paare] = useState(() => spielbareVokabeln(vocab))

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
          {{ memory: 'Memory', paare: 'Wortpaare', suche: 'Wortsuche', fang: 'Wortfang' }[spiel]}
        </h2>
      </div>
      {spiel === 'memory' && (
        <Memory paare={paare.slice(0, 6)} addXp={addXp} onClose={onClose} onGespielt={onGespielt} />
      )}
      {spiel === 'paare' && (
        <WortPaare paare={paare.slice(0, 10)} addXp={addXp} onClose={onClose} onGespielt={onGespielt} />
      )}
      {spiel === 'suche' && (
        <Wortsuche paare={paare} addXp={addXp} onClose={onClose} onGespielt={onGespielt} />
      )}
      {spiel === 'fang' && (
        <Wortfang paare={paare} addXp={addXp} onClose={onClose} onGespielt={onGespielt} />
      )}
    </div>
  )
}

// Der gemeinsame "Geschafft!"-Bildschirm beider Spiele.
// Hier rücken die gespielten Wörter im Karteikasten eine Stufe vor –
// wer sie im Spiel wiedererkannt hat, kann sie eben.
function SpielFertig({ text, woerter = [], onGespielt, onClose }) {
  const [gemeldet, setGemeldet] = useState(false)

  useEffect(() => {
    if (gemeldet || !woerter.length) return
    onGespielt?.(woerter)
    setGemeldet(true)
  }, [gemeldet, woerter, onGespielt])

  return (
    <div className="flashcard done">
      <div className="confetti-burst" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="confetti" style={{ '--i': i }} />
        ))}
      </div>
      <h2>Geschafft! 🎉</h2>
      <p>{text}</p>
      <p className="bonus-note">
        +{XP.SPIEL} Bonus-XP
        {woerter.length > 0 && ` · ${woerter.length} Wörter eine Stufe weiter`}
      </p>
      <button onClick={onClose}>Zurück zum Trainer</button>
    </div>
  )
}

/* ---------- Spiel 1: Memory ---------- */
// Karten liegen verdeckt. Decke zwei auf – gehören Wort und
// Übersetzung zusammen, bleiben sie offen liegen.
function Memory({ paare, addXp, onClose, onGespielt }) {
  const [xpAnzeige, belohne] = useXpMeldung(addXp)
  // Karten und Wortliste zusammen einfrieren: Beides muss vom selben
  // Stand stammen, sonst würden am Ende andere Wörter hochgestuft als
  // die tatsächlich gespielten.
  const [{ karten, woerter, anzahl }] = useState(() => ({
    karten: mischen(
      paare.flatMap((p, i) => [
        { id: i + '-es', pairId: i, text: p.es },
        { id: i + '-de', pairId: i, text: p.de },
      ])
    ),
    woerter: paare.map((p) => p.es),
    anzahl: paare.length,
  }))
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
      belohne(XP.QUIZ_RICHTIG, 'Treffer!')
      if (alle.length === paare.length) {
        belohne(XP.SPIEL, 'Geschafft!')
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
    return (
      <SpielFertig
        text={`Alle ${anzahl} Paare in ${versuche} Versuchen gefunden!`}
        woerter={woerter}
        onGespielt={onGespielt}
        onClose={onClose}
      />
    )
  }

  return (
    <>
      {xpAnzeige}
      <div className="lern-fortschritt">
        <div className="lern-balken">
          <div className="lern-balken-voll" style={{ width: (gefunden.length / anzahl) * 100 + '%' }} />
        </div>
        <p className="training-progress">{gefunden.length}/{anzahl} Paare · {versuche} Versuche</p>
      </div>
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
function WortPaare({ paare, addXp, onClose, onGespielt }) {
  const [xpAnzeige, belohne] = useXpMeldung(addXp)
  // Die rechte Spalte wird NICHT zufällig gemischt und eingefroren.
  // Grund: Wenn sich die Vokabeln während des Spiels ändern – etwa
  // weil der Abgleich mit dem Konto durchläuft – blieb die alte
  // Mischung stehen, während links neue Wörter erschienen. Dann
  // gehörte kein Paar mehr zusammen.
  //
  // Stattdessen wird nach der deutschen Übersetzung sortiert: Das
  // ergibt eine andere Reihenfolge als links (also weiterhin ein
  // Rätsel), leitet sich aber immer aus denselben Daten ab.
  const rechts = [...paare].sort((a, b) => a.de.localeCompare(b.de, 'de'))
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
      belohne(XP.QUIZ_RICHTIG, 'Treffer!')
      if (alle.length === paare.length) {
        belohne(XP.SPIEL, 'Geschafft!')
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
    return (
      <SpielFertig
        text={`Alle ${paare.length} Wortpaare verbunden!`}
        woerter={paare.map((p) => p.es)}
        onGespielt={onGespielt}
        onClose={onClose}
      />
    )
  }

  return (
    <>
      {xpAnzeige}
      <div className="lern-fortschritt">
        <div className="lern-balken">
          <div className="lern-balken-voll" style={{ width: (geloest.length / paare.length) * 100 + '%' }} />
        </div>
        <p className="training-progress">
          {geloest.length}/{paare.length} verbunden – links ein Wort, rechts die Übersetzung
        </p>
      </div>
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

/* ---------- Spiel 3: Wortsuche ---------- */
// Ein Buchstabengitter, in dem spanische Wörter versteckt sind.
// Man zieht mit dem Finger über die Buchstaben; ein gefundenes Wort
// wird in der Liste darunter durchgestrichen und zeigt die
// Übersetzung – so lernt man beim Suchen mit.

const GITTER = 8 // 8x8 Felder – uebersichtlicher als 10x10
const RICHTUNGEN = [
  [1, 0],   // waagerecht
  [0, 1],   // senkrecht
  [1, 1],   // diagonal runter
  [1, -1],  // diagonal hoch
]

/** Wort auf reine Gitter-Buchstaben reduzieren (ohne Akzente, ohne Leerzeichen). */
function nurBuchstaben(wort) {
  return wort
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u0302\u0308]/g, '') // Akzente entfernen, Ñ behalten
    .replace(/[^A-ZÑ]/g, '')
}

/** Legt die Wörter ins Gitter und füllt den Rest mit Buchstaben. */
function baueGitter(woerter) {
  const feld = Array.from({ length: GITTER }, () => Array(GITTER).fill(null))
  const platziert = []

  for (const wort of woerter) {
    const buchstaben = nurBuchstaben(wort.es)
    if (!buchstaben || buchstaben.length > GITTER) continue

    // Bis zu 60 Versuche, einen freien Platz zu finden
    let gelegt = false
    for (let versuch = 0; versuch < 60 && !gelegt; versuch++) {
      const [dx, dy] = RICHTUNGEN[Math.floor(Math.random() * RICHTUNGEN.length)]
      const maxX = dx > 0 ? GITTER - buchstaben.length : GITTER - 1
      const minY = dy < 0 ? buchstaben.length - 1 : 0
      const maxY = dy > 0 ? GITTER - buchstaben.length : GITTER - 1
      const x = Math.floor(Math.random() * (maxX + 1))
      const y = minY + Math.floor(Math.random() * (maxY - minY + 1))

      // Passt es? Überschneidungen nur bei gleichem Buchstaben
      const felder = []
      let passt = true
      for (let i = 0; i < buchstaben.length; i++) {
        const fx = x + dx * i
        const fy = y + dy * i
        const da = feld[fy]?.[fx]
        if (da !== null && da !== buchstaben[i]) { passt = false; break }
        felder.push([fx, fy])
      }
      if (!passt) continue

      felder.forEach(([fx, fy], i) => { feld[fy][fx] = buchstaben[i] })
      platziert.push({ ...wort, buchstaben, felder })
      gelegt = true
    }
  }

  // Leere Felder mit zufälligen Buchstaben auffüllen
  const alphabet = 'ABCDEFGHIJLMNOPQRSTUVZÑ'
  for (let y = 0; y < GITTER; y++) {
    for (let x = 0; x < GITTER; x++) {
      if (feld[y][x] === null) {
        feld[y][x] = alphabet[Math.floor(Math.random() * alphabet.length)]
      }
    }
  }
  return { feld, platziert }
}

function Wortsuche({ paare, addXp, onClose, onGespielt }) {
  const [xpAnzeige, belohne] = useXpMeldung(addXp)
  // Gitter EINMAL bauen – sonst springen die Buchstaben bei jedem
  // Neuzeichnen.
  // Nur Wörter nehmen, die überhaupt ins Gitter passen. Sonst
  // fallen lange wie "izquierda" (9 Buchstaben) still hinten runter
  // und man sucht plötzlich nur 3 statt 5 Wörter.
  const [{ feld, platziert }] = useState(() => {
    const passend = paare.filter((w) => nurBuchstaben(w.es).length <= GITTER - 1)
    return baueGitter(passend.slice(0, 5))
  })
  const [gefunden, setGefunden] = useState([])
  const [zug, setZug] = useState(null) // {start:[x,y], jetzt:[x,y]}

  const alleGefunden = platziert.length > 0 && gefunden.length === platziert.length

  /** Welche Felder liegen zwischen Start und aktueller Position? */
  function strecke(start, jetzt) {
    const [x1, y1] = start
    const [x2, y2] = jetzt
    const dx = Math.sign(x2 - x1)
    const dy = Math.sign(y2 - y1)
    const laenge = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))
    // Nur gerade und diagonale Linien zählen
    if (dx !== 0 && dy !== 0 && Math.abs(x2 - x1) !== Math.abs(y2 - y1)) return []
    return Array.from({ length: laenge + 1 }, (_, i) => [x1 + dx * i, y1 + dy * i])
  }

  const aktiveFelder = zug ? strecke(zug.start, zug.jetzt) : []

  // Das Ziehen laeuft ueber die POSITION des Zeigers, nicht ueber
  // "Maus betritt Feld". Grund: Auf dem Handy behaelt das zuerst
  // beruehrte Feld alle weiteren Ereignisse (Pointer Capture) – die
  // anderen Felder wuerden nie ein Enter sehen und das Spiel waere
  // auf Mobilgeraeten unbedienbar.
  function feldUnter(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY)
    const treffer = el?.closest?.('.gitter-feld')
    if (!treffer?.dataset.pos) return null
    return treffer.dataset.pos.split(',').map(Number)
  }

  function beginne(e, x, y) {
    e.preventDefault()
    setZug({ start: [x, y], jetzt: [x, y] })
  }

  function bewege(e) {
    if (!zug) return
    const feld = feldUnter(e)
    if (feld) setZug((z) => (z ? { ...z, jetzt: feld } : z))
  }

  function loslassen() {
    if (!zug) return
    const gezogen = strecke(zug.start, zug.jetzt)
    setZug(null)
    if (gezogen.length < 2) return

    // Passt die Strecke auf ein noch nicht gefundenes Wort?
    // Vorwärts UND rückwärts prüfen – die Ziehrichtung ist egal.
    const treffer = platziert.find((w) => {
      if (gefunden.includes(w.es)) return false
      if (w.felder.length !== gezogen.length) return false
      const gleich = (a, b) => a.every(([x, y], i) => b[i][0] === x && b[i][1] === y)
      return gleich(gezogen, w.felder) || gleich([...gezogen].reverse(), w.felder)
    })

    if (treffer) {
      setGefunden((g) => [...g, treffer.es])
      belohne(XP.QUIZ_RICHTIG, 'Treffer!')
    }
  }

  const gefundeneFelder = new Set(
    platziert
      .filter((w) => gefunden.includes(w.es))
      .flatMap((w) => w.felder.map(([x, y]) => x + ',' + y))
  )

  if (alleGefunden) {
    return (
      <SpielFertig
        text={`Alle ${platziert.length} Wörter im Gitter gefunden!`}
        woerter={platziert.map((w) => w.es)}
        onGespielt={onGespielt}
        onClose={onClose}
      />
    )
  }

  return (
    <div className="spiel-buehne">
      {xpAnzeige}
      <div className="spiel-kopf">
        <span className="spiel-titel">🔍 Wortsuche</span>
        <span className="spiel-stand">
          {gefunden.length} / {platziert.length}
        </span>
      </div>

      <div className="such-auftrag">
        <span className="such-label">Diese Wörter sind versteckt</span>
        <div className="such-liste">
          {platziert.map((w) => {
            const fertig = gefunden.includes(w.es)
            return (
              <span key={w.es} className={'such-wort' + (fertig ? ' wort-gefunden' : '')}>
                <b>{w.es}</b>
                {fertig && <em> – {w.de}</em>}
              </span>
            )
          })}
        </div>
      </div>

      <p className="spiel-hinweis">
        Zieh mit dem Finger über die Buchstaben – waagerecht, senkrecht oder
        diagonal.
      </p>

      <div
        className="gitter"
        onPointerMove={bewege}
        onPointerUp={loslassen}
        onPointerCancel={loslassen}
        style={{ '--spalten': GITTER }}
      >
        {feld.map((zeile, y) =>
          zeile.map((buchstabe, x) => {
            const schluessel = x + ',' + y
            const istAktiv = aktiveFelder.some(([ax, ay]) => ax === x && ay === y)
            const istGefunden = gefundeneFelder.has(schluessel)
            return (
              <button
                key={schluessel}
                className={
                  'gitter-feld' +
                  (istGefunden ? ' feld-gefunden' : '') +
                  (istAktiv ? ' feld-aktiv' : '')
                }
                data-pos={schluessel}
                onPointerDown={(e) => beginne(e, x, y)}
              >
                {buchstabe}
              </button>
            )
          })
        )}
      </div>

      <button className="btn-plain spiel-abbrechen" onClick={onClose}>
        Abbrechen
      </button>
    </div>
  )
}

/* ---------- Spiel 4: Wortfang ---------- */
// Oben steht die deutsche Bedeutung, von oben fallen spanische
// Wörter herunter. Tippe nur die richtigen an – die falschen
// lässt du durchfallen. Wer daneben tippt, verliert ein Leben.

const FALLDAUER = 7000  // wie lange ein Wort von oben nach unten braucht
const ABSTAND = 1400    // Abstand zwischen zwei Würfen
const LEBEN = 3
const RUNDEN = 8        // so viele Wörter muss man fangen

// Drei feste Bahnen statt Zufallsposition. Vorher konnten lange
// Wörter wie "la existencia" rechts aus dem Feld ragen und zwei
// Wörter auf derselben Höhe übereinanderliegen.
const BAHNEN = [2, 28, 54] // linker Rand in Prozent

function Wortfang({ paare, addXp, onClose, onGespielt }) {
  const [xpAnzeige, belohne] = useXpMeldung(addXp)
  // Ziele einmal festlegen, damit sie nicht neu gemischt werden
  const [ziele] = useState(() => paare.slice(0, RUNDEN))
  const [runde, setRunde] = useState(0)
  const [leben, setLeben] = useState(LEBEN)
  const [fallend, setFallend] = useState([])  // {id, wort, richtig, links}
  const [gefangen, setGefangen] = useState([])
  const [blitz, setBlitz] = useState(null)    // 'gut' | 'schlecht'
  const naechsteId = useRef(0)
  const naechsteBahn = useRef(0)

  const ziel = ziele[runde]
  const vorbei = runde >= ziele.length || leben <= 0

  // Wörter losschicken: das gesuchte plus Ablenker
  useEffect(() => {
    if (vorbei || !ziel) return

    // Ablenker sind andere echte Vokabeln – nicht erfundene Wörter,
    // damit man wirklich Bedeutungen unterscheiden muss.
    const ablenker = paare
      .filter((p) => p.es !== ziel.es)
      .slice(0, 12)
    const mischung = mischen([
      { wort: ziel.es, richtig: true },
      ...mischen(ablenker).slice(0, 3).map((a) => ({ wort: a.es, richtig: false })),
    ])

    let index = 0
    const werfen = () => {
      const eintrag = mischung[index % mischung.length]
      index++
      const id = naechsteId.current++
      // Reihum durch die Bahnen – so überlappt nichts
      const bahn = BAHNEN[naechsteBahn.current++ % BAHNEN.length]
      setFallend((f) => {
        // Dasselbe Wort nie zweimal gleichzeitig zeigen
        if (f.some((x) => x.wort === eintrag.wort)) return f
        return [...f, { id, ...eintrag, links: bahn }]
      })
      // Nach der Fallzeit wieder entfernen
      setTimeout(() => {
        setFallend((f) => f.filter((x) => x.id !== id))
      }, FALLDAUER)
    }

    werfen()
    const takt = setInterval(werfen, ABSTAND)
    return () => clearInterval(takt)
  }, [runde, ziel, vorbei, paare])

  function antippen(eintrag) {
    setFallend((f) => f.filter((x) => x.id !== eintrag.id))

    if (eintrag.richtig) {
      setBlitz('gut')
      belohne(XP.QUIZ_RICHTIG, 'Treffer!')
      setGefangen((g) => [...g, ziel.es])
      setFallend([])          // Runde räumen
      setRunde((r) => r + 1)
    } else {
      setBlitz('schlecht')
      setLeben((l) => l - 1)
    }
    setTimeout(() => setBlitz(null), 320)
  }

  if (vorbei) {
    const geschafft = gefangen.length
    return (
      <SpielFertig
        text={
          leben > 0
            ? `Alle ${geschafft} Wörter gefangen – ohne alle Leben zu verlieren!`
            : `${geschafft} von ${ziele.length} gefangen. Beim nächsten Mal mehr!`
        }
        woerter={gefangen}
        onGespielt={onGespielt}
        onClose={onClose}
      />
    )
  }

  return (
    <div className="spiel-buehne">
      {xpAnzeige}
      <div className="spiel-kopf">
        <span className="spiel-titel">🎣 Wortfang</span>
        <span className="spiel-stand">
          {'❤️'.repeat(leben)}
          {'🖤'.repeat(LEBEN - leben)} · {runde}/{ziele.length}
        </span>
      </div>

      <div className="fang-auftrag">
        <span className="fang-label">Finde</span>
        <b className="fang-wort">{ziel.de}</b>
      </div>

      <div className={'fang-feld' + (blitz ? ' fang-' + blitz : '')}>
        {fallend.map((f) => (
          <button
            key={f.id}
            className="fang-tropfen"
            style={{
              left: f.links + '%',
              animationDuration: FALLDAUER + 'ms',
            }}
            onClick={() => antippen(f)}
          >
            {f.wort}
          </button>
        ))}
      </div>

      <button className="btn-plain spiel-abbrechen" onClick={onClose}>
        Abbrechen
      </button>
    </div>
  )
}
