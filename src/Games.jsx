import { useState, useEffect, useRef } from 'react'
import { mischen } from './lektionen.js'
import { XP } from './gamification.js'
import { isDue, withSrsDefaults } from './srs.js'

// Mini-Spiele mit den eigenen Vokabeln: Memory, Wortpaare, Wortsuche,
// Blitzrunde, Galgenmännchen und Buchstabensalat.
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
export function spielbareVokabeln(vocab) {
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
    beispiel: eintrag.beispiel || '',
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
        <div className="spiel-leer">
          <span className="spiel-leer-icon" aria-hidden="true">🃏</span>
          <h2>Noch zu wenige Wörter</h2>
          <p>
            Ab vier gesammelten Wörtern mit Übersetzung geht es los. Wörter
            kommen aus den Lektionen, aus Videos oder von der KI-Wortliste.
          </p>
          <button className="btn" onClick={onClose}>
            Zurück zum Trainer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="trainer training-stage">
      <div className="player-top">
        <button className="btn-plain" onClick={onClose}>✕</button>
        <h2 className="game-title">
          {{ memory: 'Memory', paare: 'Wortpaare', suche: 'Wortsuche', blitz: 'Blitzrunde', galgen: 'Galgenmännchen', salat: 'Buchstabensalat' }[spiel]}
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
      {spiel === 'blitz' && (
        <Blitzrunde paare={paare} addXp={addXp} onClose={onClose} onGespielt={onGespielt} />
      )}
      {spiel === 'galgen' && (
        <Galgenmaennchen paare={paare} addXp={addXp} onClose={onClose} onGespielt={onGespielt} />
      )}
      {spiel === 'salat' && (
        <Buchstabensalat paare={paare} addXp={addXp} onClose={onClose} onGespielt={onGespielt} />
      )}
    </div>
  )
}

/**
 * Die Vokabeln der laufenden Runde, unter dem Spielfeld – mit
 * Beispielsatz, wo einer gespeichert ist. Kein KI-Aufruf: die Sätze
 * kommen aus dem Listengenerator und den Lektionen mit.
 */
function RundenWoerter({ woerter, gefunden }) {
  if (!woerter?.length) return null
  return (
    <div className="runden-woerter">
      <p className="runden-woerter-titel">Die Wörter dieser Runde</p>
      <ul>
        {woerter.map((w) => (
          <li
            key={w.es}
            className={'spielwort' + (gefunden?.includes(w.es) ? ' spielwort-gefunden' : '')}
          >
            <div className="spielwort-kopf">
              <b>{w.es}</b>
              <span>{w.de}</span>
              {gefunden?.includes(w.es) && <i className="spielwort-haken" aria-hidden="true">✓</i>}
            </div>
            {w.beispiel && <p className="spielwort-satz">{w.beispiel}</p>}
          </li>
        ))}
      </ul>
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
      // Das letzte Paar NICHT sofort wegblenden: Erst soll man es in
      // Ruhe lesen können – weiter geht es über den Knopf unten.
      if (alle.length === paare.length) belohne(XP.SPIEL, 'Geschafft!')
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
      {gefunden.length === anzahl && (
        <button className="btn memory-weiter" onClick={() => setFertig(true)}>
          Alle gefunden – weiter
        </button>
      )}
      <RundenWoerter woerter={paare} gefunden={gefunden.map((i) => paare[i].es)} />
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
      <RundenWoerter woerter={paare} />
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

      <RundenWoerter woerter={platziert} />

      <button className="btn-plain spiel-abbrechen" onClick={onClose}>
        Abbrechen
      </button>
    </div>
  )
}

/** Buchstabe ohne Akzent, klein – "á" zählt beim Raten wie "a" */
const grundbuchstabe = (z) =>
  z.toLocaleLowerCase('es') === 'ñ' ? 'ñ' : z.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const istBuchstabe = (z) => /\p{L}/u.test(z)

/* ---------- Spiel 4: Blitzrunde ---------- */
// 60 Sekunden: Wort + Übersetzung – passt das oder nicht? Jede richtige
// Antwort in Folge erhöht die Serie, ab 3 gibt es doppelte Punkte.
const BLITZ_SEKUNDEN = 60
const BLITZ_REKORD = 'blitz-rekord'

function neueBlitzFrage(paare, letzte) {
  let p
  do p = paare[Math.floor(Math.random() * paare.length)]
  while (paare.length > 1 && p.es === letzte)
  const passt = Math.random() < 0.5
  let de = p.de
  if (!passt) {
    const andere = paare.filter((x) => x.de !== p.de)
    de = andere[Math.floor(Math.random() * andere.length)].de
  }
  return { es: p.es, de, passt, key: Math.random() }
}

function Blitzrunde({ paare, addXp, onClose, onGespielt }) {
  const [xpAnzeige, belohne] = useXpMeldung(addXp)
  const [laeuft, setLaeuft] = useState(false)
  const [rest, setRest] = useState(BLITZ_SEKUNDEN)
  const [frage, setFrage] = useState(() => neueBlitzFrage(paare))
  const [punkte, setPunkte] = useState(0)
  const [serie, setSerie] = useState(0)
  const [richtig, setRichtig] = useState(0)
  const [falsch, setFalsch] = useState(0)
  const [blitz, setBlitz] = useState(null) // kurzes Grün/Rot
  const gewusst = useRef(new Set())
  const daneben = useRef(new Set())
  const [rekordVorher] = useState(() => Number(localStorage.getItem(BLITZ_REKORD)) || 0)

  useEffect(() => {
    if (!laeuft) return
    const takt = setInterval(() => setRest((r) => r - 1), 1000)
    return () => clearInterval(takt)
  }, [laeuft])

  const vorbei = rest <= 0
  useEffect(() => {
    if (!vorbei) return
    if (punkte > rekordVorher) localStorage.setItem(BLITZ_REKORD, String(punkte))
    if (richtig > 0) belohne(XP.SPIEL, 'Zeit um!')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vorbei])

  function antworte(sagtPasst) {
    if (vorbei) return
    if (!laeuft) setLaeuft(true)
    const ok = sagtPasst === frage.passt
    if (ok) {
      const plus = serie + 1 >= 3 ? 2 : 1
      setPunkte((x) => x + plus)
      setSerie((x) => x + 1)
      setRichtig((x) => x + 1)
      gewusst.current.add(frage.es)
      addXp(XP.QUIZ_RICHTIG)
    } else {
      setSerie(0)
      setFalsch((x) => x + 1)
      daneben.current.add(frage.es)
    }
    setBlitz(ok ? 'richtig' : 'falsch')
    setTimeout(() => setBlitz(null), 250)
    setFrage(neueBlitzFrage(paare, frage.es))
  }

  if (vorbei) {
    // Hochgestuft wird nur, was nie danebenging
    const woerter = [...gewusst.current].filter((w) => !daneben.current.has(w))
    const neuerRekord = punkte > rekordVorher
    return (
      <>
        {xpAnzeige}
        <SpielFertig
          text={`${punkte} Punkte · ${richtig} richtig, ${falsch} falsch` +
            (neuerRekord ? ' · Neuer Rekord!' : rekordVorher ? ` · Rekord ${rekordVorher}` : '')}
          woerter={woerter}
          onGespielt={onGespielt}
          onClose={onClose}
        />
      </>
    )
  }

  return (
    <>
      {xpAnzeige}
      <div className="blitz-kopf">
        <div className="blitz-zeit">
          <div className="blitz-zeit-balken" style={{ width: (rest / BLITZ_SEKUNDEN) * 100 + '%' }} />
        </div>
        <div className="blitz-werte">
          <span><b>{rest}</b> s</span>
          <span><b>{punkte}</b> Punkte</span>
          <span className={serie >= 3 ? 'blitz-serie heiss' : 'blitz-serie'}>
            {serie >= 3 ? `${serie}er-Serie · ×2` : `Serie ${serie}`}
          </span>
        </div>
      </div>
      <div className={'blitz-karte' + (blitz ? ' blitz-' + blitz : '')} key={frage.key}>
        <span className="blitz-es">{frage.es}</span>
        <span className="blitz-gleich" aria-hidden="true">=</span>
        <span className="blitz-de">{frage.de}</span>
      </div>
      {!laeuft && <p className="training-progress">Die Zeit läuft ab der ersten Antwort. Ab 3 richtigen in Folge zählt jede doppelt.</p>}
      <div className="blitz-knoepfe">
        <button className="blitz-knopf nein" onClick={() => antworte(false)}>Passt nicht</button>
        <button className="blitz-knopf ja" onClick={() => antworte(true)}>Passt</button>
      </div>
    </>
  )
}

/* ---------- Spiel 5: Galgenmännchen ---------- */
// Die deutsche Bedeutung ist der Hinweis, das spanische Wort wird
// Buchstabe für Buchstabe geraten. 6 Fehlversuche pro Wort, 3 Wörter.
// Statt Strichmännchen: sechs Herzen, die nacheinander verblassen.
const GALGEN_WOERTER = 3
const GALGEN_LEBEN = 6
const TASTATUR = 'abcdefghijklmnñopqrstuvwxyz'.split('')

function Galgenmaennchen({ paare, addXp, onClose, onGespielt }) {
  const [xpAnzeige, belohne] = useXpMeldung(addXp)
  const [runde] = useState(() =>
    paare.filter((p) => [...p.es].filter(istBuchstabe).length >= 3).slice(0, GALGEN_WOERTER)
  )
  const [nr, setNr] = useState(0)
  const [geraten, setGeraten] = useState([])
  const [geloest, setGeloest] = useState([])
  const [ende, setEnde] = useState(null) // null | 'geloest' | 'verloren'

  const wort = runde[nr]
  if (!wort) {
    return (
      <SpielFertig
        text={`${geloest.length} von ${runde.length} Wörtern erraten`}
        woerter={geloest}
        onGespielt={onGespielt}
        onClose={onClose}
      />
    )
  }

  const zeichen = [...wort.es]
  const offen = (z) => !istBuchstabe(z) || geraten.includes(grundbuchstabe(z))
  const fehler = geraten.filter((b) => !zeichen.some((z) => istBuchstabe(z) && grundbuchstabe(z) === b)).length

  function rate(b) {
    if (ende || geraten.includes(b)) return
    const neu = [...geraten, b]
    setGeraten(neu)
    const alleOffen = zeichen.every((z) => !istBuchstabe(z) || neu.includes(grundbuchstabe(z)))
    const neueFehler = neu.filter((x) => !zeichen.some((z) => istBuchstabe(z) && grundbuchstabe(z) === x)).length
    if (alleOffen) {
      setEnde('geloest')
      setGeloest((g) => [...g, wort.es])
      belohne(XP.QUIZ_RICHTIG * 5, 'Erraten!')
    } else if (neueFehler >= GALGEN_LEBEN) {
      setEnde('verloren')
    }
  }

  function weiter() {
    if (nr + 1 >= runde.length && geloest.length > 0) belohne(XP.SPIEL, 'Geschafft!')
    setNr((n) => n + 1)
    setGeraten([])
    setEnde(null)
  }

  return (
    <>
      {xpAnzeige}
      <p className="training-progress">Wort {nr + 1} von {runde.length}</p>
      <div className="galgen-leben" aria-label={`${GALGEN_LEBEN - fehler} Versuche übrig`}>
        {Array.from({ length: GALGEN_LEBEN }, (_, i) => (
          <span key={i} className={'galgen-herz' + (i < GALGEN_LEBEN - fehler ? '' : ' weg')}>♥</span>
        ))}
      </div>
      <p className="galgen-hinweis">{wort.de}</p>
      <div className={'galgen-wort' + (ende ? ' galgen-' + ende : '')}>
        {zeichen.map((z, i) =>
          z === ' ' ? (
            <span key={i} className="galgen-luecke" />
          ) : (
            <span key={i} className={'galgen-feld' + (offen(z) ? ' offen' : '')}>
              {offen(z) || ende ? z : ''}
            </span>
          )
        )}
      </div>
      {ende ? (
        <div className="galgen-ende">
          <p>{ende === 'geloest' ? 'Richtig!' : 'Leider nicht – so heißt es richtig.'}</p>
          <button className="btn" onClick={weiter}>
            {nr + 1 >= runde.length ? 'Auswertung' : 'Nächstes Wort'}
          </button>
        </div>
      ) : (
        <div className="galgen-tastatur">
          {TASTATUR.map((b) => {
            const drin = geraten.includes(b)
            const treffer = drin && zeichen.some((z) => istBuchstabe(z) && grundbuchstabe(z) === b)
            return (
              <button
                key={b}
                className={'galgen-taste' + (drin ? (treffer ? ' treffer' : ' niete') : '')}
                disabled={drin}
                onClick={() => rate(b)}
              >
                {b}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

/* ---------- Spiel 6: Buchstabensalat ---------- */
// Die deutsche Bedeutung steht oben, darunter die Buchstaben des
// spanischen Worts gemischt. Der Reihe nach antippen – ein falscher
// Buchstabe wackelt nur kurz, man muss nichts zurücknehmen.
const SALAT_WOERTER = 5

function Buchstabensalat({ paare, addXp, onClose, onGespielt }) {
  const [xpAnzeige, belohne] = useXpMeldung(addXp)
  const [runde] = useState(() =>
    paare
      .filter((p) => {
        const n = [...p.es].filter(istBuchstabe).length
        return n >= 3 && n <= 12
      })
      .slice(0, SALAT_WOERTER)
  )
  const [nr, setNr] = useState(0)
  const [fertigWoerter, setFertigWoerter] = useState([])

  const wort = runde[nr]
  if (!wort) {
    return (
      <SpielFertig
        text={`${runde.length} Wörter richtig zusammengesetzt`}
        woerter={fertigWoerter}
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
          <div className="lern-balken-voll" style={{ width: (nr / runde.length) * 100 + '%' }} />
        </div>
        <p className="training-progress">Wort {nr + 1} von {runde.length}</p>
      </div>
      <SalatWort
        key={wort.es}
        wort={wort}
        onFertig={(ohneFehler) => {
          belohne(XP.QUIZ_RICHTIG * (ohneFehler ? 5 : 3), ohneFehler ? 'Fehlerfrei!' : 'Richtig!')
          if (ohneFehler) setFertigWoerter((f) => [...f, wort.es])
          setTimeout(() => {
            if (nr + 1 >= runde.length) belohne(XP.SPIEL, 'Geschafft!')
            setNr((n) => n + 1)
          }, 900)
        }}
      />
    </>
  )
}

function SalatWort({ wort, onFertig }) {
  const zeichen = [...wort.es]
  // Nur Buchstaben werden gemischt; Leerzeichen & Co. stehen fest
  const [kacheln] = useState(() => {
    const b = zeichen.map((z, i) => ({ z, i })).filter((k) => istBuchstabe(k.z))
    let m = mischen(b)
    if (m.length > 1 && m.every((k, j) => k.i === b[j].i)) m = [...m.slice(1), m[0]]
    return m
  })
  const [gesetzt, setGesetzt] = useState([]) // Kachel-Indizes in Reihenfolge
  const [wackelt, setWackelt] = useState(null)
  const [fehler, setFehler] = useState(0)

  const ziel = zeichen.filter(istBuchstabe)
  const fertig = gesetzt.length === ziel.length

  function tippe(n) {
    if (fertig || gesetzt.includes(n)) return
    // Gleiche Buchstaben sind austauschbar – verglichen wird der Buchstabe
    if (grundbuchstabe(kacheln[n].z) === grundbuchstabe(ziel[gesetzt.length])) {
      const neu = [...gesetzt, n]
      setGesetzt(neu)
      if (neu.length === ziel.length) onFertig(fehler === 0)
    } else {
      setFehler((f) => f + 1)
      setWackelt(n)
      setTimeout(() => setWackelt(null), 400)
    }
  }

  // Anzeige: feste Zeichen + bisher gesetzte Buchstaben (in Original-Schreibung)
  let b = 0
  return (
    <div className="salat">
      <p className="galgen-hinweis">{wort.de}</p>
      <div className={'galgen-wort' + (fertig ? ' galgen-geloest' : '')}>
        {zeichen.map((z, i) => {
          if (z === ' ') return <span key={i} className="galgen-luecke" />
          if (!istBuchstabe(z)) return <span key={i} className="galgen-feld offen">{z}</span>
          const da = b < gesetzt.length
          b++
          return (
            <span key={i} className={'galgen-feld' + (da ? ' offen' : '')}>
              {da ? z : ''}
            </span>
          )
        })}
      </div>
      <div className="salat-kacheln">
        {kacheln.map((k, n) => (
          <button
            key={n}
            className={
              'satzbau-kachel salat-kachel' +
              (gesetzt.includes(n) ? ' verbaut' : '') +
              (wackelt === n ? ' platz-falsch' : '')
            }
            disabled={gesetzt.includes(n)}
            onClick={() => tippe(n)}
          >
            {k.z.toLocaleLowerCase('es')}
          </button>
        ))}
      </div>
      {fehler > 0 && !fertig && <p className="training-progress">{fehler} {fehler === 1 ? 'Fehler' : 'Fehler'}</p>}
    </div>
  )
}
