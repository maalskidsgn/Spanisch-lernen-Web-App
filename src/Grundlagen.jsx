import { useEffect, useMemo, useRef, useState } from 'react'
import ZauberBild from './ZauberBild.jsx'
import LadeKreis from './LadeKreis.jsx'
import { LEKTIONEN } from './lektionen.js'
import WISSEN_TABELLEN from './wissenTabellen.js'
import { sprache } from './sprache.js'
import { erfolgston, fehlerton } from './erfolgston.js'
import { newEntry, review, vorschau, isDue, withSrsDefaults } from './srs.js'
import { API_URL } from './api.js'
import { loginKopf, useKontingent, kontingentLeer, holeKontingent } from './limits.js'
import { usePremium } from './premium.js'
import GratisHinweis from './GratisHinweis.jsx'
import PremiumWerbung from './PremiumWerbung.jsx'

// Spanisch braucht keine Lautschrift – dieselbe Oberfläche wie bei Davaigo, nur ohne Schalter
const MIT_LAUT = false
const useLautschrift = () => [false, () => {}]
const LautSchalter = () => null
const lautschrift = (t) => t
const hatLaut = () => false

/**
 * Grundlagen-Trainer (16.11.2026): Die „Gut zu wissen“-Karten aus
 * abgeschlossenen Lektionen – und eigene Konjugationstabellen – werden hier
 * wiederholt wie Vokabeln (dieselbe Wiederholungslogik aus srs.js).
 *
 * Abgefragt wird aus der Lerntabelle heraus (Zeile wählen, zweite Spalte
 * erraten), danach steht die ganze Karte samt Tabelle zum Nachlesen da.
 *
 * Konjugator: Verb eingeben → Tabelle je Zeit (Server /api/konjugation:
 * häufige Verben vorab erzeugt, neue per KI). „In meine Grundlagen“ legt
 * jede Zeit als eigene Karte an.
 *
 * Stand im Browser: localStorage „grundlagen-stand“ (Wiederholung) und
 * „grundlagen-eigene“ (gespeicherte Konjugationen).
 */

const SPEICHER = 'grundlagen-stand'
const EIGENE = 'grundlagen-eigene'
const RUNDE = 8
const ZIEL_ENDUNG = /(ar|er|ir|ír|arse|erse|irse)$/ // woran man Verben im Vokabeltrainer erkennt

const EN = {
  'Regel {0} von {1}': 'Rule {0} of {1}',
  'Erinnerst du dich?': 'Do you remember?',
  'Nochmal': 'Again', 'Schwer': 'Hard', 'Gut': 'Good', 'Einfach': 'Easy',
  'Runde abbrechen': 'Stop round',
  'Regeln fällig': 'rules due',
  'Grundlagen wiederholen': 'Review the basics',
  'Alles aus „Gut zu wissen“ deiner Lektionen – genau dann wieder, wenn du es zu vergessen drohst.': 'Everything from “Good to know” in your lessons – right when you’re about to forget it.',
  '{0} Regeln üben': 'Practise {0} rules',
  'Alles wiederholt': 'All reviewed',
  'Alle deine Grundlagen': 'All your basics',
  '{0} gesammelt · {1} sitzen schon fest': '{0} collected · {1} already stick',
  'Alle Grundlagen aus den Lektionen landen hier, um sie nochmal zu wiederholen.': 'All the basics from your lessons land here so you can review them again.',
  'Schließ deine erste Lektion ab – dann landen ihre Grundlagen hier.': 'Finish your first lesson – its basics will land here.',
  'neu': 'new', 'fällig': 'due', 'Stufe {0}': 'Level {0}',
  'Verb konjugieren': 'Conjugate a verb',
  'Tippe ein Verb ein – auf Deutsch oder Spanisch. Du bekommst alle wichtigen Zeiten als Tabelle.': 'Type a verb – in English or Spanish. You get all the important tenses as tables.',
  'z. B. {0}': 'e.g. {0}',
  'KI-Verbgenerator': 'AI verb generator',
  'Verb-Tabellen': 'verb tables',
  'Alle wichtigen Zeiten eines Verbs als Tabelle.': 'All the important tenses of a verb as tables.',
  'Verb aus deinem Trainer wählen': 'Pick a verb from your trainer',
  'Häufiges Verb wählen': 'Pick a common verb',
  '… oder eigenes Verb, z. B. {0}': '… or your own verb, e.g. {0}',
  'Erstellt die Tabelle': 'Building the table',
  'Tabelle zeigen': 'Show table',
  'Zeigen': 'Show',
  'Aus deinem Trainer': 'From your trainer',
  'Häufige Verben': 'Common verbs',
  'Person': 'Person', 'Form': 'Form',
  'unregelmäßig': 'irregular',
  'In meine Grundlagen': 'Add to my basics',
  'In deinen Grundlagen ✓': 'In your basics ✓',
  'Konjugation': 'Conjugation',
  'Einen Moment …': 'One moment …',
}
const tx = (de, ...w) => (sprache() === 'en' ? EN[de] ?? de : de).replace(/\{(\d+)\}/g, (_, n) => w[n] ?? '')

function lies(k, leer) {
  try { return JSON.parse(localStorage.getItem(k)) ?? leer } catch { return leer }
}
function schreib(k, wert) {
  try { localStorage.setItem(k, JSON.stringify(wert)) } catch { /* egal */ }
  // Im Konto sichern (geraeteSync.js) und Zähler im Trainer auffrischen
  try { window.dispatchEvent(new CustomEvent('grundlagen-geaendert')) } catch { /* egal */ }
}

/** Ruft `neu` auf, wenn der Abgleich Grundlagen-Daten vom Konto geholt hat. */
function beiAbgleich(neu) {
  const horcher = (e) => {
    if ((e.detail || []).some((k) => k === SPEICHER || k === EIGENE)) neu()
  }
  window.addEventListener('geraetedaten', horcher)
  return () => window.removeEventListener('geraetedaten', horcher)
}

/** *Wörter* als Chips – auf Wunsch mit Lautschrift darunter. */
function chips(text = '', laut = false) {
  return String(text).split('*').map((t, i) => {
    if (!(i % 2)) return t
    if (!laut || !hatLaut(t)) return <span key={i} className="wort-chip">{t}</span>
    return (
      <span key={i} className="gl-chip-laut">
        <span className="wort-chip">{t}</span>
        <small>{lautschrift(t, sprache())}</small>
      </span>
    )
  })
}
function zelle(text, laut) {
  const [wort, bedeutung] = String(text).split(' – ')
  if (!bedeutung) return chips(text, laut)
  return <span className="info-zelle"><span>{chips(wort, laut)}</span><small>{bedeutung}</small></span>
}

/** Alle Karten: „Gut zu wissen“ aus abgeschlossenen Lektionen + eigene Konjugationen. */
export function grundlagenKarten(lessonProgress = {}) {
  const sp = sprache() === 'en' ? 'en' : 'de'
  const karten = []
  for (const l of LEKTIONEN) {
    if (!lessonProgress[l.id]?.fertig) continue
    ;(l.wissen ?? []).forEach((k, i) => {
      const tabelle = WISSEN_TABELLEN[`${l.id}:${i}`]?.[sp]
      if (tabelle) karten.push({ id: `${l.id}:${i}`, lektion: l.titel, emoji: k.emoji, titel: k.titel, text: k.text, tabelle })
    })
  }
  for (const k of lies(EIGENE, [])) karten.push(eigeneKarte(k, sp))
  return karten
}

/** Gespeicherte Konjugation → Karte in der App-Sprache */
function eigeneKarte(k, sp) {
  return {
    id: k.id,
    lektion: tx('Konjugation'),
    emoji: '🔁',
    titel: `${k.verb} – ${k.zeit.name[sp] ?? k.zeit.name.de}`,
    text: `*${k.verb}* – ${k.bedeutung[sp] ?? k.bedeutung.de}. ${k.hinweis[sp] ?? k.hinweis.de}`,
    tabelle: {
      kopf: [tx('Person'), tx('Form')],
      zeilen: k.zeit.formen.map((f) => [f.person, `*${f.form}*`]),
    },
  }
}

const eintrag = (stand, id) => withSrsDefaults(stand[id] ?? newEntry('', 'Grundlagen'))

export function faelligeGrundlagen(lessonProgress) {
  const stand = lies(SPEICHER, {})
  return grundlagenKarten(lessonProgress).filter((k) => isDue(eintrag(stand, k.id)))
}

/** Eine Frage aus der Tabelle: erste Spalte zeigen, zweite erraten. */
function frageAus(karte) {
  const { kopf, zeilen } = karte.tabelle
  const brauchbar = zeilen.filter((z) => z[0] && z[1])
  const werte = [...new Set(brauchbar.map((z) => z[1]))]
  if (brauchbar.length < 2 || werte.length < 2) return null
  const zeile = brauchbar[Math.floor(Math.random() * brauchbar.length)]
  const falsch = werte.filter((w) => w !== zeile[1]).sort(() => Math.random() - 0.5).slice(0, 3)
  return { vorne: zeile[0], spalte: kopf[1], richtig: zeile[1], optionen: [zeile[1], ...falsch].sort(() => Math.random() - 0.5) }
}

function Tabelle({ tabelle, laut }) {
  return (
    <div className="info-tabelle-rahmen">
      <table className="info-tabelle">
        <thead><tr>{tabelle.kopf.map((k) => <th key={k}>{k}</th>)}</tr></thead>
        <tbody>
          {tabelle.zeilen.map((z, i) => (
            <tr key={i}>{z.map((c, j) => <td key={j}>{zelle(c, laut)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 *  Konjugator
 * ------------------------------------------------------------------ */

function Konjugator({ vocab = {}, laut, onGespeichert }) {
  const sp = sprache() === 'en' ? 'en' : 'de'
  const [eingabe, setEingabe] = useState('')
  const [daten, setDaten] = useState(null)
  const [zeitNr, setZeitNr] = useState(0)
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')
  const [haeufig, setHaeufig] = useState([])
  const ergebnisRef = useRef(null)
  // Zählt zum KI-Kontingent wie die anderen Generatoren (16.11.2026, Manuel)
  const { premium, laedt: premiumLaedt } = usePremium()
  const kontingent = useKontingent(premium)
  const aufgebraucht = !premium && kontingent.ki.uebrig <= 0
  const [gespeichert, setGespeichert] = useState(() => new Set(lies(EIGENE, []).map((k) => k.verb)))

  useEffect(() => beiAbgleich(() => setGespeichert(new Set(lies(EIGENE, []).map((k) => k.verb)))), [])

  useEffect(() => {
    fetch(API_URL + '/api/konjugation/vorschlaege').then((r) => r.json()).then((d) => setHaeufig((d.verben ?? []).slice(0, 12))).catch(() => {})
  }, [])

  // Verben aus dem eigenen Vokabeltrainer (die neuesten zuerst)
  const ausTrainer = useMemo(
    () => Object.entries(vocab)
      .filter(([w]) => ZIEL_ENDUNG.test(w.trim()) && !w.includes(' '))
      .sort((a, b) => (b[1]?.addedAt ?? 0) - (a[1]?.addedAt ?? 0))
      .slice(0, 8)
      .map(([w, e]) => ({ verb: w, name: String(e?.translation || '').split(/[,;(/]/)[0].trim() })),
    [vocab],
  )

  // `anzeige`: was im Feld stehen soll – bei Vorschlägen das Wort in der eigenen Sprache
  async function holen(verb, anzeige) {
    const v = String(verb ?? eingabe).trim()
    if (!v || laedt) return
    setEingabe(anzeige || v)
    setLaedt(true)
    setFehler('')
    try {
      const res = await fetch(`${API_URL}/api/konjugation?verb=${encodeURIComponent(v)}&sprache=${sp}`, { headers: await loginKopf() })
      const d = await res.json().catch(() => ({}))
      if (res.status === 402) kontingentLeer()
      if (!res.ok) throw new Error(d.error || 'Fehler')
      holeKontingent() // Zähler angleichen (dasselbe Verb zählt im Monat nur einmal)
      setDaten(d)
      setZeitNr(0)
      setTimeout(() => ergebnisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    } catch (f) {
      setDaten(null)
      setFehler(f.message)
    } finally {
      setLaedt(false)
    }
  }

  function speichern() {
    const alt = lies(EIGENE, []).filter((k) => k.verb !== daten.verb)
    const neu = daten.zeiten.map((zeit) => ({ id: `konj:${daten.verb}:${zeit.id}`, verb: daten.verb, bedeutung: daten.bedeutung, hinweis: daten.hinweis, zeit }))
    schreib(EIGENE, [...alt, ...neu])
    setGespeichert((s) => new Set(s).add(daten.verb))
    erfolgston()
    onGespeichert?.()
  }

  const zeit = daten?.zeiten?.[zeitNr]
  // Vorschläge in der Sprache des Lernenden (16.11.2026, Manuel): groß die
  // Bedeutung, klein das Verb – Anfänger können die Zielsprache noch nicht lesen
  const vorschlaege = (ausTrainer.length ? ausTrainer : haeufig.map((h) => ({ verb: h.verb, name: h[sp] || h.de })))
    .map((v) => ({ verb: v.verb, name: v.name || v.verb }))

  return (
    <section className="bereich gl-konj">
      {/* Gleicher Aufbau wie Listen-, Satz- und Textgenerator (16.11.2026, Manuel) */}
      <div className="list-gen">
        <div className="gen-kopf">
          <ZauberBild art="verben" />
          <div className="gen-text">
            <h2>{tx('KI-Verbgenerator')}</h2>
            <p>{tx('Alle wichtigen Zeiten eines Verbs als Tabelle.')}</p>
          </div>
        </div>

        <GratisHinweis art="ki" />

        {aufgebraucht && !daten ? (
          premiumLaedt ? null : <PremiumWerbung was={tx('Verb-Tabellen')} />
        ) : (
          <form className="wort-form" onSubmit={(e) => { e.preventDefault(); holen() }}>
            {vorschlaege.length > 0 && (
              <>
                <p className="sg-schritt"><span>1</span> {ausTrainer.length ? tx('Verb aus deinem Trainer wählen') : tx('Häufiges Verb wählen')}</p>
                <div className="sg-themen gl-verben">
                  {vorschlaege.map((v) => (
                    <button
                      key={v.verb}
                      type="button"
                      className={'sg-thema gl-verb' + (eingabe === v.name ? ' ist-aktiv' : '')}
                      disabled={laedt}
                      onClick={() => holen(v.verb, v.name)}
                    >
                      <b>{v.name}</b>
                      {v.name !== v.verb && <i>{v.verb}</i>}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="gen-feld sg-eigenes">
              <input
                type="text"
                value={eingabe}
                onChange={(e) => setEingabe(e.target.value)}
                placeholder={tx('… oder eigenes Verb, z. B. {0}', (sp === 'en' ? 'speak' : 'sprechen') + ' / ser')}
                maxLength={40}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                disabled={laedt}
              />
            </div>

            <div className="gen-knoepfe">
              <button type="submit" className="btn gen-los" disabled={!eingabe.trim() || laedt}>
                {laedt ? <>{tx('Erstellt die Tabelle')}<LadeKreis art="konjugation" /></> : tx('Tabelle zeigen')}
              </button>
            </div>
          </form>
        )}
      </div>
      {fehler && <p className="schnell-fehler">{fehler}</p>}

      {daten && zeit && (
        <div className="gl-konj-ergebnis" ref={ergebnisRef}>
          <div className="gl-konj-verb">
            {chips(`*${daten.verb}*`, laut)}
            <span>{daten.bedeutung[sp] ?? daten.bedeutung.de}</span>
          </div>
          <p className="gl-konj-hinweis">{daten.hinweis[sp] ?? daten.hinweis.de}</p>
          <div className="gl-konj-zeiten" role="tablist">
            {daten.zeiten.map((z, i) => (
              <button key={z.id} type="button" role="tab" aria-selected={i === zeitNr} className={i === zeitNr ? 'an' : ''} onClick={() => setZeitNr(i)}>
                {z.name[sp] ?? z.name.de}
              </button>
            ))}
          </div>
          <div className="info-tabelle-rahmen">
            <table className="info-tabelle gl-konj-tabelle">
              <thead><tr><th>{tx('Person')}</th><th>{tx('Form')}</th></tr></thead>
              <tbody>
                {zeit.formen.map((f) => (
                  <tr key={f.person} className={f.unregelmaessig ? 'gl-unregel' : ''}>
                    <td>{f.person}</td>
                    <td>{chips(`*${f.form}*`, laut)}{f.unregelmaessig && <em className="gl-unregel-marke">⚡ {tx('unregelmäßig')}</em>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="gl-konj-beispiel">
            <b>{zeit.beispiel.ziel}</b>
            {laut && hatLaut(zeit.beispiel.ziel) && <small className="gl-konj-laut">{lautschrift(zeit.beispiel.ziel, sprache())}</small>}
            <span>{zeit.beispiel[sp] ?? zeit.beispiel.de}</span>
          </p>
          <button type="button" className={'btn gl-konj-speichern' + (gespeichert.has(daten.verb) ? ' ist-drin' : '')} disabled={gespeichert.has(daten.verb)} onClick={speichern}>
            {gespeichert.has(daten.verb) ? tx('In deinen Grundlagen ✓') : tx('In meine Grundlagen')}
          </button>
        </div>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ *
 *  Grundlagen-Trainer
 * ------------------------------------------------------------------ */

export default function Grundlagen({ kopf, lessonProgress, addXp, vocab }) {
  const [version, setVersion] = useState(0) // neu zählen, wenn eine Konjugation gespeichert wurde
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const alle = useMemo(() => grundlagenKarten(lessonProgress), [lessonProgress, version])
  const [stand, setStand] = useState(() => lies(SPEICHER, {}))
  const [runde, setRunde] = useState(null)
  const [nr, setNr] = useState(0)
  const [frage, setFrage] = useState(null)
  const [antwort, setAntwort] = useState(null)
  const [offen, setOffen] = useState(null)
  const [listeOffen, setListeOffen] = useState(false)
  const [laut, lautUmschalten] = useLautschrift()

  // Stand vom Konto (anderes Gerät) übernehmen, sobald der Abgleich ihn bringt
  useEffect(() => beiAbgleich(() => {
    setStand(lies(SPEICHER, {}))
    setVersion((v) => v + 1)
  }), [])

  const faellig = alle.filter((k) => isDue(eintrag(stand, k.id)))
  const sitzen = alle.filter((k) => (eintrag(stand, k.id).intervall ?? 0) >= 21).length

  function starten() {
    const r = faellig.slice(0, RUNDE)
    setRunde(r)
    setNr(0)
    setAntwort(null)
    setFrage(frageAus(r[0]))
  }

  function waehlen(o) {
    if (antwort) return
    const richtig = o === frage.richtig
    setAntwort({ o, richtig })
    if (richtig) { erfolgston(); addXp?.(5) } else fehlerton()
  }

  function bewerten(wert) {
    const karte = runde[nr]
    // `am`: wann bewertet – damit beim Abgleich zweier Geräte der neuere Stand gewinnt
    const neu = { ...lies(SPEICHER, stand), [karte.id]: { ...review(eintrag(stand, karte.id), wert), am: Date.now() } }
    setStand(neu)
    schreib(SPEICHER, neu)
    if (nr + 1 >= runde.length) { setRunde(null); return }
    setNr(nr + 1)
    setAntwort(null)
    setFrage(frageAus(runde[nr + 1]))
  }

  // ---------- Laufende Runde ----------
  if (runde) {
    const karte = runde[nr]
    const aufgedeckt = !frage || antwort
    return (
      <div className="training-stage gl-runde">
        <div className="lern-balken"><div className="lern-balken-voll" style={{ width: (nr / runde.length) * 100 + '%' }} /></div>
        <p className="training-progress">{tx('Regel {0} von {1}', nr + 1, runde.length)}</p>
        {MIT_LAUT && <div className="laut-zeile laut-oben"><LautSchalter an={laut} onClick={lautUmschalten} /></div>}

        <div className="flashcard karte-toon gl-karte">
          <p className="gl-herkunft">{karte.emoji} {karte.lektion}</p>
          {frage ? (
            <>
              <p className="gl-frage">{chips(frage.vorne, laut)}</p>
              <p className="lesson-hint">{frage.spalte}?</p>
              <div className="gl-optionen">
                {frage.optionen.map((o) => (
                  <button
                    key={o}
                    className={'quiz-option' + (antwort && o === frage.richtig ? ' option-richtig' : '') + (antwort?.o === o && !antwort.richtig ? ' option-falsch' : '')}
                    onClick={() => waehlen(o)}
                  >
                    {zelle(o, laut)}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="gl-frage gl-frage-klein">{tx('Erinnerst du dich?')} <b>{karte.titel}</b></p>
          )}

          {aufgedeckt && (
            <div className="gl-loesung">
              <h3 className="info-title">{karte.titel}</h3>
              <p className="info-text">{chips(karte.text, laut)}</p>
              <Tabelle tabelle={karte.tabelle} laut={laut} />
              <div className="bewertungen">
                {['nochmal', 'schwer', 'gut', 'einfach'].map((w) => (
                  <button key={w} className={'bewertung bewertung-' + w} onClick={() => bewerten(w)}>
                    <span className="bewertung-text">{tx(w[0].toUpperCase() + w.slice(1))}</span>
                    <span className="bewertung-zeit">{vorschau(eintrag(stand, karte.id), w)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button className="btn-plain" onClick={() => setRunde(null)}>{tx('Runde abbrechen')}</button>
      </div>
    )
  }

  // ---------- Übersicht ----------
  return (
    <div className="trainer gl">
      {kopf}

      <div className="gl-held">
        <div className="gl-held-zahl">
          <b>{faellig.length}</b>
          <span>{tx('Regeln fällig')}</span>
        </div>
        <div className="gl-held-text">
          <h2>{tx('Grundlagen wiederholen')}</h2>
          <p>{tx('Alles aus „Gut zu wissen“ deiner Lektionen – genau dann wieder, wenn du es zu vergessen drohst.')}</p>
        </div>
        <button className="btn gl-los" disabled={!faellig.length} onClick={starten}>
          {faellig.length ? tx('{0} Regeln üben', Math.min(RUNDE, faellig.length)) : tx('Alles wiederholt')}
        </button>
      </div>

      <Konjugator vocab={vocab} laut={laut} onGespeichert={() => setVersion((v) => v + 1)} />

      {/* Alle Grundlagen – aufklappbar wie „Alle deine Wörter“ im Vokabeltrainer */}
      <section className="bereich">
        <button className="liste-kopf" onClick={() => setListeOffen((o) => !o)} aria-expanded={listeOffen}>
          <span className="liste-kopf-text">
            <span className="liste-titel">{tx('Alle deine Grundlagen')}</span>
            <span className="liste-sub">{tx('{0} gesammelt · {1} sitzen schon fest', alle.length, sitzen)}</span>
          </span>
          <span className={'liste-pfeil' + (listeOffen ? ' liste-pfeil-auf' : '')}>▾</span>
        </button>
        <p className="gl-liste-hinweis">{tx('Alle Grundlagen aus den Lektionen landen hier, um sie nochmal zu wiederholen.')}</p>

        {listeOffen && (
          alle.length === 0 ? (
            <p className="intro">{tx('Schließ deine erste Lektion ab – dann landen ihre Grundlagen hier.')}</p>
          ) : (
            <>
              {MIT_LAUT && <div className="liste-werkzeuge"><LautSchalter an={laut} onClick={lautUmschalten} className="laut-liste" /></div>}
              <ul className="gl-liste">
                {alle.map((k) => {
                  const e = eintrag(stand, k.id)
                  const neuKarte = !stand[k.id]
                  const istFaellig = isDue(e)
                  return (
                    <li key={k.id} className={'gl-eintrag' + (offen === k.id ? ' gl-offen' : '')}>
                      <button className="gl-zeile" onClick={() => setOffen(offen === k.id ? null : k.id)}>
                        <span className="gl-emoji" aria-hidden="true">{k.emoji}</span>
                        <span className="gl-zeile-text"><b>{k.titel}</b><small>{k.lektion}</small></span>
                        <span className={'gl-stufe gl-stufe-' + Math.min(4, e.level ?? 0)}>
                          {neuKarte ? tx('neu') : istFaellig ? tx('fällig') : tx('Stufe {0}', e.level ?? 0)}
                        </span>
                      </button>
                      {offen === k.id && (
                        <div className="gl-detail">
                          <p className="info-text">{chips(k.text, laut)}</p>
                          <Tabelle tabelle={k.tabelle} laut={laut} />
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </>
          )
        )}
      </section>
    </div>
  )
}
