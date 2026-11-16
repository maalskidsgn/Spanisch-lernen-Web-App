// Dialog-Szene (16.11.2026, Manuel: „Dialoge gefallen mir noch nicht“)
//
// Statt schlichtem Chat eine kleine Toon-Bühne:
//  1. Hören   – zwei Figuren, große Blasen, die gerade gesprochene Zeile
//               leuchtet und markiert Wort für Wort mit (Karaoke).
//               Übersetzung steht direkt darunter.
//  2. Du bist dran – Rollenspiel: Man übernimmt die zweite Rolle und wählt
//               die passende Antwort. Die richtige Zeile erklingt danach.
//
// Ton: nur echte Aufnahmen (spieleZeile), vorab geladen. Tempo umschaltbar
// (normal / langsam). Fehlt eine Aufnahme, läuft die Markierung still mit.
import { useEffect, useMemo, useRef, useState } from 'react'
import { spieleZeile, vorladen, stimmeImDialog } from './audio.js'
import { erfolgston, fehlerton } from './erfolgston.js'
import { sprache, satz } from './sprache.js'

const TX = {
  de: {
    szene: 'Dialog',
    hoeren: 'Anhören',
    stopp: 'Stopp',
    nochmal: 'Nochmal',
    langsam: 'Langsam',
    uebersetzung: 'Übersetzung',
    tippe: 'Tippe eine Blase an, um sie nochmal zu hören.',
    rolleStart: (n) => `Jetzt du: Spiel ${n}`,
    rolleFrage: (n) => `Was antwortet ${n}?`,
    rolleTitel: (n) => `Du bist ${n}`,
    richtig: 'Genau so!',
    falsch: 'Fast – so wäre es richtig:',
    weiter: 'Weiter',
    ueberspringen: 'Überspringen',
    ergebnis: (r, g) => `${r} von ${g} Antworten richtig`,
    lob: (r, g) => (r === g ? 'Perfekt gespielt!' : r > 0 ? 'Gut gemacht!' : 'Beim nächsten Mal klappt’s!'),
  },
  en: {
    szene: 'Dialogue',
    hoeren: 'Listen',
    stopp: 'Stop',
    nochmal: 'Again',
    langsam: 'Slow',
    uebersetzung: 'Translation',
    tippe: 'Tap a bubble to hear it again.',
    rolleStart: (n) => `Your turn: play ${n}`,
    rolleFrage: (n) => `What does ${n} reply?`,
    rolleTitel: (n) => `You are ${n}`,
    richtig: 'Exactly!',
    falsch: 'Almost – this is right:',
    weiter: 'Continue',
    ueberspringen: 'Skip',
    ergebnis: (r, g) => `${r} of ${g} replies correct`,
    lob: (r, g) => (r === g ? 'Perfectly played!' : r > 0 ? 'Well done!' : 'You’ll get it next time!'),
  },
}

function lies(schluessel, standard) {
  try {
    const w = localStorage.getItem(schluessel)
    return w == null ? standard : w === '1'
  } catch {
    return standard
  }
}
function merke(schluessel, wert) {
  try { localStorage.setItem(schluessel, wert ? '1' : '0') } catch { /* privat */ }
}

function mische(liste) {
  const a = [...liste]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Zeile in Wörter teilen; jedes Wort weiß, bei welchem Anteil es beginnt. */
function woerter(text) {
  const teile = String(text).split(/(\s+)/)
  const gesamt = String(text).length || 1
  let pos = 0
  return teile.map((t) => {
    const start = pos / gesamt
    pos += t.length
    return { t, start, leer: /^\s+$/.test(t) }
  })
}

function Figur({ name, seite, spricht, du }) {
  return (
    <div className={'dlg-figur dlg-' + seite + (spricht ? ' spricht' : '') + (du ? ' du' : '')}>
      {/* Ohne Gesichter (Manuel, 16.11.: „hässliche Smileys raus“) – nur Namensschild,
          beim Sprechen farbig mit kleinen Schallwellen */}
      <b className="dlg-name">
        {name}
        <span className="dlg-wellen" aria-hidden="true"><i /><i /><i /></span>
      </b>
    </div>
  )
}

function ZeilenText({ text, anteil = null }) {
  if (anteil == null) return <span className="dlg-text">{text}</span>
  return (
    <span className="dlg-text">
      {woerter(text).map((w, i) =>
        w.leer ? w.t : <span key={i} className={w.start <= anteil ? 'an' : ''}>{w.t}</span>
      )}
    </span>
  )
}

function Blase({ zeile, rechts, anteil, mitDe, laut, onTap }) {
  return (
    <button
      type="button"
      className={'dlg-zeile' + (rechts ? ' rechts' : '') + (anteil != null ? ' aktiv' : '')}
      onClick={onTap}
    >
      <span className="dlg-wer">{zeile.sprecher}</span>
      <ZeilenText text={zeile.es} anteil={anteil} />
      
      {mitDe && <span className="dlg-de">{satz(zeile, 'es', 'de')}</span>}
    </button>
  )
}

export default function DialogSzene({ dialog, onWeiter, titel = '' }) {
  const T = TX[sprache() === 'en' ? 'en' : 'de']
  const a = dialog[0].sprecher
  const b = dialog.find((z) => z.sprecher !== a)?.sprecher ?? a
  const laut = false

  const [phase, setPhase] = useState('hoeren') // 'hoeren' | 'rolle' | 'ende'
  const [anzahl, setAnzahl] = useState(0) // sichtbare Blasen
  const [aktiv, setAktiv] = useState(null) // { i, anteil } – die gerade gesprochene Zeile
  const [spielt, setSpielt] = useState(false)
  const [langsam, setLangsam] = useState(() => lies('dialog-langsam', false))
  const [mitDe, setMitDe] = useState(() => lies('dialog-uebersetzung', true))
  const lauf = useRef(0)
  const wiedergabe = useRef(null)
  const lebt = useRef(true) // Szene noch offen? Danach darf nichts mehr sprechen
  const spaeter = useRef(0) // verzögert geplante Zeile (Rollenspiel)
  const chatRef = useRef(null)

  const tempo = langsam ? 0.75 : 1

  // Alle Aufnahmen des Dialogs sofort holen – kein Stocken zwischen den Zeilen
  useEffect(() => { vorladen(dialog) }, [dialog])

  async function abspielen(ab = 0, nurEine = false) {
    if (!lebt.current) return
    clearTimeout(spaeter.current)
    const token = ++lauf.current
    wiedergabe.current?.stop()
    setSpielt(true)
    for (let i = ab; i < dialog.length; i++) {
      if (lauf.current !== token) return
      setAnzahl((n) => Math.max(n, i + 1))
      setAktiv({ i, anteil: 0 })
      let zuletzt = -1
      const w = await spieleZeile(dialog[i].es, {
        stimme: stimmeImDialog(dialog, dialog[i].sprecher),
        tempo,
        beiFortschritt: (x) => {
          const stufe = Math.round(x * 40) / 40
          if (stufe !== zuletzt && lauf.current === token) {
            zuletzt = stufe
            setAktiv({ i, anteil: stufe })
          }
        },
      })
      if (lauf.current !== token) { w.stop(); return }
      wiedergabe.current = w
      const grund = await w.fertig
      if (lauf.current !== token) return
      // Ein anderer Ton hat übernommen: Anzeige zurücksetzen, nicht weiterreden
      if (grund === 'unterbrochen') { setAktiv(null); setSpielt(false); return }
      if (nurEine) break
      await new Promise((f) => setTimeout(f, 520 / tempo))
    }
    if (lauf.current === token) {
      setAktiv(null)
      setSpielt(false)
      setAnzahl(dialog.length)
    }
  }

  function stoppen() {
    clearTimeout(spaeter.current)
    lauf.current++
    wiedergabe.current?.stop()
    setAktiv(null)
    setSpielt(false)
  }

  // Von selbst starten (Manuel, 16.11.) – blockt das Gerät den Ton, läuft
  // die Markierung still im Lesetempo
  useEffect(() => {
    lebt.current = true
    const zeit = setTimeout(() => abspielen(0), 500)
    // Beim Verlassen: alles aus – auch Zeilen, die erst noch geplant waren.
    // Sonst sprach die Szene nach dem Weiterklicken noch weiter (Manuel, 16.11.).
    return () => {
      lebt.current = false
      clearTimeout(zeit)
      clearTimeout(spaeter.current)
      lauf.current++
      wiedergabe.current?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Neue Blase ins Bild holen
  useEffect(() => {
    const el = chatRef.current?.querySelector('.dlg-zeile:last-of-type')
    el?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
  }, [anzahl])

  const sprichtGerade = aktiv ? dialog[aktiv.i].sprecher : null
  const alleDa = anzahl >= dialog.length

  // ---------- Rollenspiel ----------
  const runden = useMemo(() => {
    const idx = dialog.map((z, i) => i).filter((i) => i > 0 && dialog[i].sprecher === b && dialog[i - 1].sprecher !== b)
    return idx.slice(0, 3).map((i) => {
      const andere = dialog.map((z, j) => j).filter((j) => j !== i && j !== i - 1 && dialog[j].es !== dialog[i].es)
      const bevorzugt = mische(andere.filter((j) => dialog[j].sprecher === b))
      const rest = mische(andere.filter((j) => dialog[j].sprecher !== b))
      const falsche = [...bevorzugt, ...rest].slice(0, 2)
      return { i, optionen: mische([i, ...falsche]) }
    })
  }, [dialog, b])
  const [runde, setRunde] = useState(0)
  const [wahl, setWahl] = useState(null)
  const [punkte, setPunkte] = useState(0)

  function rolleStarten() {
    stoppen()
    setRunde(0)
    setWahl(null)
    setPunkte(0)
    setPhase('rolle')
  }

  // Zu Beginn jeder Runde spricht das Gegenüber seine Zeile
  useEffect(() => {
    if (phase !== 'rolle' || !runden[runde]) return
    const zeit = setTimeout(() => abspielen(runden[runde].i - 1, true), 350)
    return () => clearTimeout(zeit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, runde])

  function waehle(j) {
    if (wahl != null) return
    const r = runden[runde]
    setWahl(j)
    if (j === r.i) {
      setPunkte((p) => p + 1)
      erfolgston()
    } else {
      fehlerton()
    }
    clearTimeout(spaeter.current)
    spaeter.current = setTimeout(() => abspielen(r.i, true), 450)
  }

  function naechsteRunde() {
    stoppen()
    if (runde + 1 >= runden.length) setPhase('ende')
    else {
      setRunde(runde + 1)
      setWahl(null)
    }
  }

  const blase = (zeile, i) => (
    <Blase
      key={i}
      zeile={zeile}
      rechts={zeile.sprecher !== a}
      anteil={aktiv?.i === i ? aktiv.anteil : null}
      mitDe={mitDe}
      laut={laut}
      onTap={() => abspielen(i, true)}
    />
  )

  return (
    <div className={'flashcard dlg-szene' + (phase === 'rolle' ? ' ist-rolle' : '')}>
      {/* Bühne: zwei Figuren, wer spricht, hüpft */}
      <div className="dlg-buehne">
        <Figur name={a} seite="links" spricht={sprichtGerade === a} />
        <div className="dlg-schild">
          <span>{phase === 'rolle' ? T.rolleTitel(b) : T.szene}</span>
          {titel && phase !== 'rolle' && <small>{titel}</small>}
        </div>
        <Figur name={b} seite="rechts" spricht={sprichtGerade === b} du={phase === 'rolle'} />
      </div>

      {/* Steuerleiste */}
      <div className="dlg-leiste">
        {phase === 'hoeren' && (
          <button type="button" className={'dlg-play' + (spielt ? ' an' : '')} onClick={() => (spielt ? stoppen() : abspielen(0))}>
            {spielt ? (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor" /><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor" /></svg>
            )}
            {spielt ? T.stopp : alleDa ? T.nochmal : T.hoeren}
          </button>
        )}
        <button
          type="button"
          className={'dlg-chip' + (langsam ? ' an' : '')}
          aria-pressed={langsam}
          onClick={() => { setLangsam(!langsam); merke('dialog-langsam', !langsam) }}
        >
          🐢 {T.langsam}
        </button>
        <button
          type="button"
          className={'dlg-chip' + (mitDe ? ' an' : '')}
          aria-pressed={mitDe}
          onClick={() => { setMitDe(!mitDe); merke('dialog-uebersetzung', !mitDe) }}
        >
          <b className="dlg-flagge">{sprache() === 'en' ? 'EN' : 'DE'}</b> {T.uebersetzung}
        </button>
        
      </div>

      {/* ---------- 1. Hören ---------- */}
      {phase === 'hoeren' && (
        <>
          <div className="dlg-chat" ref={chatRef}>
            {dialog.slice(0, anzahl).map((zeile, i) => blase(zeile, i))}
            {!alleDa && (
              <div className={'dlg-tippt' + (dialog[anzahl].sprecher !== a ? ' rechts' : '')}>
                <i /><i /><i />
              </div>
            )}
          </div>
          {alleDa && (
            <div className="dlg-weiter">
              <p className="dlg-tipp">{T.tippe}</p>
              {runden.length > 0 ? (
                <>
                  <button type="button" className="dlg-los" onClick={rolleStarten}>{T.rolleStart(b)} →</button>
                  <button type="button" className="dlg-link" onClick={onWeiter}>{T.ueberspringen}</button>
                </>
              ) : (
                <button type="button" className="dlg-los" onClick={onWeiter}>{T.weiter}</button>
              )}
            </div>
          )}
        </>
      )}

      {/* ---------- 2. Rollenspiel ---------- */}
      {phase === 'rolle' && runden[runde] && (() => {
        const r = runden[runde]
        return (
          <div className="dlg-rolle" key={runde}>
            <div className="dlg-fortschritt" aria-hidden="true">
              {runden.map((_, k) => <i key={k} className={k < runde ? 'fertig' : k === runde ? 'jetzt' : ''} />)}
            </div>
            <div className="dlg-chat">
              {blase(dialog[r.i - 1], r.i - 1)}
              {wahl != null && blase(dialog[r.i], r.i)}
            </div>
            {wahl == null ? (
              <>
                <p className="dlg-frage">{T.rolleFrage(b)}</p>
                <div className="dlg-optionen">
                  {r.optionen.map((j) => (
                    <button type="button" key={j} className="dlg-option" onClick={() => waehle(j)}>
                      <span className="dlg-text">{dialog[j].es}</span>
                      
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className={'dlg-urteil ' + (wahl === r.i ? 'gut' : 'schlecht')}>
                <b>{wahl === r.i ? '✓ ' + T.richtig : T.falsch}</b>
                <button type="button" className="dlg-los" onClick={naechsteRunde}>{T.weiter} →</button>
              </div>
            )}
            <button type="button" className="dlg-link" onClick={onWeiter}>{T.ueberspringen}</button>
          </div>
        )
      })()}

      {/* ---------- 3. Ergebnis ---------- */}
      {phase === 'ende' && (
        <div className="dlg-ende">
          <div className="dlg-sterne" aria-hidden="true">
            {runden.map((_, k) => <i key={k} className={k < punkte ? 'an' : ''}>★</i>)}
          </div>
          <b>{T.lob(punkte, runden.length)}</b>
          <span>{T.ergebnis(punkte, runden.length)}</span>
          <div className="dlg-ende-knoepfe">
            <button type="button" className="dlg-link" onClick={() => { setPhase('hoeren'); setAnzahl(dialog.length) }}>{T.nochmal}</button>
            <button type="button" className="dlg-los" onClick={onWeiter}>{T.weiter} →</button>
          </div>
        </div>
      )}
    </div>
  )
}
