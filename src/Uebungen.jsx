// Übungsgenerator (17.11.2026, Manuel): Übungen zu den eigenen Regeln oder zu
// jedem Thema – im Reiter „Wiederholen“ neben Grundlagen-Trainer und Verbgenerator.
//
//  • Zu jeder Regel aus den Lektionen liegt ein fertiges Set auf dem Server
//    (server/uebungen.json, einmalig erzeugt) – das kostet nichts und ist sofort da.
//  • Freie Themen erzeugt die KI (zählt als KI-Erstellung). Das Set wird
//    gespeichert: Wiederholen kostet nichts.
//  • Drei Aufgabenarten, die die App selbst prüft: Lücke, Auswahl, Satzbau.
import RundenAbschluss, { ra } from './RundenAbschluss.jsx'
import { useEffect, useMemo, useState } from 'react'
import LadeKreis from './LadeKreis.jsx'
import GratisHinweis from './GratisHinweis.jsx'
import PremiumWerbung from './PremiumWerbung.jsx'
import { API_URL } from './api.js'
import { sprache } from './sprache.js'
import { usePremium } from './premium.js'
import { useKontingent, kontingentLeer, holeKontingent, loginKopf } from './limits.js'
import { erfolgston, fehlerton, lektionTon } from './erfolgston.js'
// Spanisch braucht keine Lautschrift – dieselbe Oberfläche wie bei Davaigo, nur ohne Schalter
const useLautschrift = () => [false, () => {}]
const Laut = () => null

const EIGENE = 'uebungen-eigene' // selbst erzeugte Sets (gleicht geraeteSync.js mit dem Konto ab)
const MAX_EIGENE = 20
const XP_JE_AUFGABE = 10

const TX = {
  de: {
    titel: 'KI-Übungsgenerator',
    unter: 'Übungen zu deinen Regeln – oder zu jedem Thema, das du üben willst.',
    schritt: 'Regel wählen',
    schrittSchwach: 'Das sitzt noch nicht – Regel wählen',
    eigenes: '… oder eigenes Thema, z. B. Vergangenheit mit ser',
    los: 'Übungen erstellen',
    laedt: 'Baut deine Übungen',
    deine: 'Deine Übungen',
    wiederholen: 'kostenlos wiederholen',
    keinSet: 'Zu dieser Regel gibt es noch keine Übungen.',
    fehler: 'Das hat nicht geklappt, bitte nochmal.',
    was: 'Übungen',
    aufgabe: (a, b) => `Aufgabe ${a} von ${b}`,
    luecke: 'Setze das fehlende Wort ein',
    wahl: 'Was passt?',
    satzbau: 'Baue den Satz',
    tippe: 'Tippe die Wörter unten an',
    pruefen: 'Prüfen',
    richtig: 'Richtig!',
    falsch: 'Nicht ganz – richtig ist:',
    weiter: 'Weiter',
    fertig: 'Übungen geschafft!',
    ergebnis: (r, g) => `${r} von ${g} beim ersten Versuch richtig`,
    nochmal: 'Nochmal üben',
    zurueck: 'Fertig',
    abbrechen: 'Übungen abbrechen',
    dazu: 'Übungen dazu',
  },
  en: {
    titel: 'AI exercise generator',
    unter: 'Exercises for your rules – or for any topic you want to practise.',
    schritt: 'Pick a rule',
    schrittSchwach: 'Not solid yet – pick a rule',
    eigenes: '… or your own topic, e.g. past tense with ser',
    los: 'Create exercises',
    laedt: 'Building your exercises',
    deine: 'Your exercises',
    wiederholen: 'repeat for free',
    keinSet: 'There are no exercises for this rule yet.',
    fehler: 'That did not work, please try again.',
    was: 'exercises',
    aufgabe: (a, b) => `Exercise ${a} of ${b}`,
    luecke: 'Fill in the missing word',
    wahl: 'What fits?',
    satzbau: 'Build the sentence',
    tippe: 'Tap the words below',
    pruefen: 'Check',
    richtig: 'Correct!',
    falsch: 'Not quite – the right answer is:',
    weiter: 'Continue',
    fertig: 'Exercises done!',
    ergebnis: (r, g) => `${r} of ${g} right on the first try`,
    nochmal: 'Practise again',
    zurueck: 'Done',
    abbrechen: 'Stop exercises',
    dazu: 'Exercises for this',
  },
}
const txt = () => TX[sprache() === 'en' ? 'en' : 'de']
export const uebungenText = txt

function lies() {
  try { return JSON.parse(localStorage.getItem(EIGENE)) ?? [] } catch { return [] }
}
function merke(liste) {
  try { localStorage.setItem(EIGENE, JSON.stringify(liste.slice(0, MAX_EIGENE))) } catch { /* Speicher voll */ }
  try { window.dispatchEvent(new CustomEvent('grundlagen-geaendert')) } catch { /* egal */ }
}

function mische(liste) {
  const a = [...liste]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Fertiges Übungsset zu einer Regel aus den Lektionen (kostenlos). null = keins vorhanden. */
export async function ladeRegelUebungen(regelId) {
  const r = await fetch(`${API_URL}/api/uebungen?regel=${encodeURIComponent(regelId)}`)
  if (r.status === 404) return null
  if (!r.ok) throw new Error(txt().fehler)
  const d = await r.json()
  return d.aufgaben?.length ? d.aufgaben : null
}

/* ------------------------------------------------------------------ *
 *  Die Karte im Reiter „Wiederholen“
 * ------------------------------------------------------------------ */
export function UebungsGenerator({ regeln = [], schwach = false, onStart }) {
  const T = txt()
  const sp = sprache() === 'en' ? 'en' : 'de'
  const [thema, setThema] = useState('')
  const [laedt, setLaedt] = useState(null) // 'ki' oder die Regel-ID, die gerade lädt
  const [fehler, setFehler] = useState('')
  const [eigene, setEigene] = useState(lies)
  const { premium, laedt: premiumLaedt } = usePremium()
  const kontingent = useKontingent(premium)
  const aufgebraucht = !premium && kontingent.ki.uebrig <= 0

  useEffect(() => {
    const neu = (e) => { if ((e.detail || []).includes(EIGENE)) setEigene(lies()) }
    window.addEventListener('geraetedaten', neu)
    return () => window.removeEventListener('geraetedaten', neu)
  }, [])

  async function regelStarten(regel) {
    if (laedt) return
    setLaedt(regel.id)
    setFehler('')
    try {
      const aufgaben = await ladeRegelUebungen(regel.id)
      if (!aufgaben) setFehler(T.keinSet)
      else onStart({ titel: regel.titel, aufgaben })
    } catch (f) {
      setFehler(f.message)
    } finally {
      setLaedt(null)
    }
  }

  async function erstellen(e) {
    e.preventDefault()
    const t = thema.trim()
    if (t.length < 2 || laedt) return
    setLaedt('ki')
    setFehler('')
    try {
      const res = await fetch(`${API_URL}/api/uebungen`, {
        method: 'POST',
        headers: await loginKopf({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ thema: t, sprache: sp }),
      })
      const d = await res.json().catch(() => ({}))
      if (res.status === 402) kontingentLeer()
      if (!res.ok) throw new Error(d.nachricht || (d.error && d.error !== 'limit' ? d.error : T.fehler))
      holeKontingent()
      const set = { id: 'u' + Date.now(), titel: d.titel?.[sp] || d.titel?.de || t, aufgaben: d.aufgaben, erstellt: Date.now() }
      const neu = [set, ...lies().filter((s) => s.titel !== set.titel)]
      merke(neu)
      setEigene(neu.slice(0, MAX_EIGENE))
      setThema('')
      onStart(set)
    } catch (f) {
      setFehler(f.message)
    } finally {
      setLaedt(null)
    }
  }

  return (
    <section className="bereich gl-konj ub-gen">
      <div className="list-gen">
        <p className="gl-gen-unter">{T.unter}</p>

        <GratisHinweis art="ki" />

        <div className="wort-form">
          {regeln.length > 0 && (
            <>
              <p className="sg-schritt"><span>1</span> {schwach ? T.schrittSchwach : T.schritt}</p>
              <div className="sg-themen gl-verben">
                {regeln.map((r) => (
                  <button key={r.id} type="button" className="sg-thema gl-verb" disabled={Boolean(laedt)} onClick={() => regelStarten(r)}>
                    <b>{r.emoji} {r.titel}</b>
                    <i>{laedt === r.id ? '…' : r.lektion}</i>
                  </button>
                ))}
              </div>
            </>
          )}

          {aufgebraucht ? (
            premiumLaedt ? null : <PremiumWerbung was={T.was} />
          ) : (
            <form onSubmit={erstellen} className="ub-eigenes">
              <div className="gen-feld sg-eigenes">
                <input type="text" value={thema} onChange={(e) => setThema(e.target.value)} placeholder={T.eigenes} maxLength={120} disabled={Boolean(laedt)} />
              </div>
              <div className="gen-knoepfe">
                <button type="submit" className="btn gen-los" disabled={thema.trim().length < 2 || Boolean(laedt)}>
                  {laedt === 'ki' ? <>{T.laedt}<LadeKreis art="uebungen" /></> : T.los}
                </button>
              </div>
            </form>
          )}

          {eigene.length > 0 && (
            <div className="ub-eigene">
              <small>{T.deine} · {T.wiederholen}</small>
              <div className="engine-themen">
                {eigene.slice(0, 8).map((s) => (
                  <button key={s.id} type="button" disabled={Boolean(laedt)} onClick={() => onStart(s)}>{s.titel}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {fehler && <p className="schnell-fehler">{fehler}</p>}
    </section>
  )
}

/* ------------------------------------------------------------------ *
 *  Eine Übungsrunde
 * ------------------------------------------------------------------ */
function Satzbau({ aufgabe, laut, onErgebnis, T }) {
  const gemischt = useMemo(() => {
    const idx = aufgabe.woerter.map((_, i) => i)
    let m = mische(idx)
    // nie schon in der richtigen Reihenfolge anbieten
    if (idx.length > 1 && m.every((x, i) => x === i)) m = [...idx.slice(1), idx[0]]
    return m
  }, [aufgabe])
  const [gewaehlt, setGewaehlt] = useState([])
  const [geprueft, setGeprueft] = useState(false)
  const fertig = gewaehlt.length === aufgabe.woerter.length

  function tippe(i) {
    if (geprueft) return
    setGewaehlt((g) => (g.includes(i) ? g.filter((x) => x !== i) : [...g, i]))
  }
  function pruefen() {
    const richtig = gewaehlt.every((x, i) => x === i)
    setGeprueft(true)
    onErgebnis(richtig)
  }

  return (
    <>
      <p className="satzbau-deutsch">{aufgabe[sprache() === 'en' ? 'en' : 'de']}</p>
      <div className={'satzbau-ablage' + (geprueft ? (gewaehlt.every((x, i) => x === i) ? ' ablage-richtig' : ' ablage-falsch') : '')}>
        {gewaehlt.length === 0 && <span className="ablage-leer">{T.tippe}</span>}
        {gewaehlt.map((i) => (
          <button key={i} type="button" className="satz-baustein baustein-gesetzt" onClick={() => tippe(i)}>
            {aufgabe.woerter[i]}
            <Laut text={aufgabe.woerter[i]} an={laut} art="klein" />
          </button>
        ))}
      </div>
      <div className="satzbau-vorrat">
        {gemischt.map((i) => (
          <button key={i} type="button" className={'satz-baustein' + (gewaehlt.includes(i) ? ' baustein-weg' : '')} disabled={gewaehlt.includes(i) || geprueft} onClick={() => tippe(i)}>
            {aufgabe.woerter[i]}
            <Laut text={aufgabe.woerter[i]} an={laut} art="klein" />
          </button>
        ))}
      </div>
      {!geprueft && (
        <div className="flash-actions">
          <button type="button" onClick={pruefen} disabled={!fertig}>{T.pruefen}</button>
        </div>
      )}
    </>
  )
}

export function UebungsRunde({ titel, aufgaben, addXp, onEnde }) {
  const T = txt()
  const sp = sprache() === 'en' ? 'en' : 'de'
  const [laut, lautUmschalten] = useLautschrift()
  // Falsch gelöste Aufgaben kommen am Ende noch einmal dran (jede höchstens einmal)
  const [reihe, setReihe] = useState(() => aufgaben.map((a, i) => ({ a, i, nochmal: false })))
  const [nr, setNr] = useState(0)
  const [antwort, setAntwort] = useState(null) // { richtig, gewaehlt }
  const [richtige, setRichtige] = useState(0)
  const [xp, setXp] = useState(null)
  const [fertig, setFertig] = useState(false)
  const eintrag = reihe[nr]
  const aufgabe = eintrag?.a
  const optionen = useMemo(() => (aufgabe?.optionen ? mische(aufgabe.optionen) : []), [aufgabe, nr])
  const loesung = aufgabe?.typ === 'satzbau' ? aufgabe.woerter.join(' ') : aufgabe?.loesung

  function ergebnis(richtig, gewaehlt = null) {
    if (antwort) return
    setAntwort({ richtig, gewaehlt })
    if (richtig) {
      erfolgston()
      if (!eintrag.nochmal) {
        setRichtige((r) => r + 1)
        addXp?.(XP_JE_AUFGABE)
        setXp({ key: Date.now() })
      }
    } else {
      fehlerton()
      if (!eintrag.nochmal) setReihe((r) => [...r, { ...eintrag, nochmal: true }])
    }
  }

  function weiter() {
    if (nr + 1 >= reihe.length) {
      lektionTon()
      setFertig(true)
      return
    }
    setNr(nr + 1)
    setAntwort(null)
  }

  function neuStart() {
    setReihe(aufgaben.map((a, i) => ({ a, i, nochmal: false })))
    setNr(0)
    setAntwort(null)
    setRichtige(0)
    setFertig(false)
  }

  if (fertig) {
    return (
      <div className="lessons">
        <RundenAbschluss
          quote={Math.round((richtige / aufgaben.length) * 100)}
          titel={T.fertig}
          unter={titel}
          chips={[
            { wert: `${richtige}/${aufgaben.length}`, text: ra('ersterVersuch') },
            { wert: '+' + richtige * XP_JE_AUFGABE, text: 'XP', xp: true },
          ]}
          knoepfe={[
            { text: T.nochmal, onClick: neuStart },
            { text: ra('zurueckWiederholen'), onClick: onEnde, zweit: true },
          ]}
        />
      </div>
    )
  }

  return (
    <div className="lessons lk-toon ub-runde">
      {xp && <span key={xp.key} className="xp-popup">+{XP_JE_AUFGABE} XP</span>}
      <div className="player-top">
        <button type="button" className="btn-plain" onClick={onEnde} aria-label={T.abbrechen}>✕</button>
        <div className="xp-bar player-bar">
          <div className="xp-bar-fill" style={{ width: (nr / reihe.length) * 100 + '%' }} />
        </div>
      </div>

      <p className="ub-kopf">{titel} · {T.aufgabe(Math.min(nr + 1, reihe.length), reihe.length)}</p>
      <div className="flashcard ub-karte" key={nr}>
        <p className="lesson-hint">{aufgabe.typ === 'luecke' ? T.luecke : aufgabe.typ === 'wahl' ? T.wahl : T.satzbau}</p>

        {aufgabe.typ === 'luecke' && (
          <>
            <div className="gap-sentence">
              {aufgabe.satz.split('___').map((teil, i, alle) => (
                <span key={i}>
                  {teil}
                  {i < alle.length - 1 && (antwort ? <b className="ub-eingesetzt">{aufgabe.loesung}</b> : <span className="luecke-linie" />)}
                </span>
              ))}
            </div>
            <Laut text={aufgabe.satz.replace('___', antwort ? aufgabe.loesung : '…')} an={laut} art="satz" />
            <p className="gap-help">{aufgabe[sp] ?? aufgabe.de}</p>
          </>
        )}

        {/* flash-word: so sitzt die Frage wie in den Lektionen in der weißen Fragekarte */}
        {aufgabe.typ === 'wahl' && <div className="flash-word ub-frage">{aufgabe['frage_' + sp] ?? aufgabe.frage_de}</div>}

        {aufgabe.typ !== 'satzbau' && (
          <div className="quiz-options">
            {optionen.map((o) => {
              let klasse = 'quiz-option'
              if (antwort) klasse += o === aufgabe.loesung ? ' option-richtig' : o === antwort.gewaehlt ? ' option-falsch' : ' option-inaktiv'
              return (
                <button key={nr + '-' + o} type="button" className={klasse} disabled={Boolean(antwort)} onClick={(e) => { e.currentTarget.blur(); ergebnis(o === aufgabe.loesung, o) }}>
                  {o}
                  <Laut text={o} an={laut} art="klein" />
                </button>
              )
            })}
          </div>
        )}

        {aufgabe.typ === 'satzbau' && <Satzbau aufgabe={aufgabe} laut={laut} T={T} onErgebnis={(r) => ergebnis(r)} />}

        {antwort && (
          <div className={'ub-urteil ' + (antwort.richtig ? 'gut' : 'schlecht')}>
            <b>{antwort.richtig ? '✓ ' + T.richtig : T.falsch}</b>
            {!antwort.richtig && (
              <span className="ub-loesung">
                {loesung}
                <Laut text={loesung} an={laut} art="klein" />
              </span>
            )}
            <span className="ub-warum">{aufgabe['warum_' + sp] ?? aufgabe.warum_de}</span>
            <button type="button" className="ub-weiter" onClick={weiter}>{T.weiter}</button>
          </div>
        )}
      </div>

      <button type="button" className="btn-plain ub-abbrechen" onClick={onEnde}>{T.abbrechen}</button>
    </div>
  )
}
