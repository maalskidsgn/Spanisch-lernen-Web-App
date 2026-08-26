// Land & Leute – das Stück des Tages und alle vorherigen.
//
// Die Seite hat eine Eigenheit, die Absicht ist: Das Deutsche steht
// zwar da, aber man kann es ausblenden. Wer die deutsche Zeile immer
// unter der spanischen sieht, liest sie zuerst – und danach die
// spanische nur noch zur Kontrolle. Dann hat er nichts gelesen,
// sondern eine Übersetzung überflogen.
//
// Deshalb: erst versuchen, dann nachsehen. Der Schalter merkt sich
// die Entscheidung, damit man ihn nicht jeden Tag neu umlegt.

import { useState, useEffect, useRef } from 'react'
import { STUECKE } from './landUndLeute.js'
import { stueckDesTages, reihenfolgeAbHeute } from './landUndLeute.js'
import { IconPfeil, IconLandkarte } from './icons.jsx'
import { XP } from './gamification.js'
import { merkeEinheit } from './aktivitaet.js'

const SPEICHER = 'landUndLeute' // { gelesen: [ids] }

export function ladeGelesen() {
  try {
    const roh = JSON.parse(localStorage.getItem(SPEICHER))
    return new Set(Array.isArray(roh?.gelesen) ? roh.gelesen : [])
  } catch {
    return new Set()
  }
}

function speichereGelesen(menge) {
  try {
    localStorage.setItem(SPEICHER, JSON.stringify({ gelesen: [...menge] }))
  } catch {
    // Kein Speicher (privates Fenster, voller Speicher) – dann merkt
    // sich die App eben nichts. Das ist kein Grund, das Lesen
    // abzubrechen.
  }
}

const DEUTSCH_SCHALTER = 'landUndLeuteDeutsch'

export default function LandUndLeute({ onZurueck, onAddVocab, addXp, vocab = {} }) {
  const [offen, setOffen] = useState(() => stueckDesTages().id)
  const [gelesen, setGelesen] = useState(ladeGelesen)
  const [deutschAn, setDeutschAn] = useState(
    () => localStorage.getItem(DEUTSCH_SCHALTER) !== 'aus'
  )

  const stueck = STUECKE.find((s) => s.id === offen) ?? stueckDesTages()
  const heute = stueckDesTages()

  // Gelesen wird beim Öffnen vermerkt, nicht beim Verlassen: Wer
  // oben anfängt und dann weggeht, hat es trotzdem gesehen. Den
  // Punkt gibt es nur beim ersten Mal.
  //
  // ZWEI Vorkehrungen, und beide sind nötig – nachgemessen am 23.08.:
  //
  //   Der Riegel (useRef). React ruft Effekte in der Entwicklung
  //   absichtlich zweimal auf. Ohne ihn gab es für EIN Öffnen 20 XP
  //   und zwei Einträge in der Tagesaktivität. Derselbe Fehler wie
  //   damals beim doppelten Abspielen der Aufnahmen.
  //
  //   Das Nachlesen aus dem Speicher statt aus `gelesen`. Der
  //   Zustand aus dem letzten Durchlauf ist beim zweiten Aufruf noch
  //   der alte – die Prüfung "schon gelesen?" hätte also auch beim
  //   zweiten Mal nein gesagt.
  const vergeben = useRef(new Set())

  useEffect(() => {
    if (vergeben.current.has(stueck.id)) return
    vergeben.current.add(stueck.id)

    const bisher = ladeGelesen()
    if (bisher.has(stueck.id)) return

    bisher.add(stueck.id)
    speichereGelesen(bisher)
    setGelesen(bisher)
    addXp?.(XP.LAND)
    merkeEinheit('lektion')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stueck.id])

  function schalteDeutsch() {
    setDeutschAn((an) => {
      localStorage.setItem(DEUTSCH_SCHALTER, an ? 'aus' : 'an')
      return !an
    })
  }

  // Welche der sechs Wörter kennt der Trainer schon? Sonst verspricht
  // der Knopf sechs Wörter und legt zwei an, weil vier schon drin
  // waren – und man sucht den Fehler in der App statt im Karteikasten.
  const neueWoerter = stueck.woerter.filter((w) => !vocab[w.es.toLowerCase()])

  function inDenTrainer() {
    if (!neueWoerter.length) return
    onAddVocab(
      neueWoerter.map((w) => ({
        wort: w.es,
        uebersetzung: w.de,
        quelle: `Land & Leute – ${stueck.titel}`,
      }))
    )
  }

  return (
    <div className="trainer lul">
      <button className="recht-zurueck" onClick={onZurueck}>← Zurück</button>

      <div className="lul-kopf">
        <IconLandkarte groesse={22} />
        <div>
          <h1 className="trainer-titel">Land & Leute</h1>
          <p className="lul-unter">
            Jeden Tag ein kurzes Stück über Spanien und Lateinamerika – auf
            Spanisch und Deutsch.
          </p>
        </div>
      </div>

      {/* ---------- Das Stück ---------- */}
      <article className="start-karte lul-stueck">
        <span className="start-marke">
          {stueck.id === heute.id ? 'Heute · ' : ''}{stueck.region}
        </span>
        <h2 className="lul-titel">{stueck.titel}</h2>
        <p className="lul-titel-de">{stueck.titelDe}</p>
        <p className="lul-vorspann">{stueck.vorspann}</p>

        <button className="lul-schalter" onClick={schalteDeutsch}>
          {deutschAn ? 'Deutsch ausblenden' : 'Deutsch einblenden'}
        </button>

        {stueck.absaetze.map((a, i) => (
          <div className="lul-absatz" key={i}>
            <p className="lul-es">{a.es}</p>
            {deutschAn && <p className="lul-de">{a.de}</p>}
          </div>
        ))}

        <div className="lul-wusstest">
          <span className="start-marke">Wusstest du?</span>
          <p>{stueck.wusstest}</p>
        </div>
      </article>

      {/* ---------- Die sechs Wörter ---------- */}
      <section className="start-karte">
        <h2 className="start-abschnitt">Wörter aus dem Text</h2>
        <p className="start-abschnitt-sub">
          Alle sechs kommen oben wirklich vor.
        </p>

        <ul className="lul-woerter">
          {stueck.woerter.map((w) => {
            const drin = Boolean(vocab[w.es.toLowerCase()])
            return (
              <li key={w.es} className={drin ? 'lul-wort lul-wort-drin' : 'lul-wort'}>
                <b>{w.es}</b>
                <span>{w.de}</span>
                {drin && <em>im Trainer</em>}
              </li>
            )
          })}
        </ul>

        <button
          className="start-weiter"
          onClick={inDenTrainer}
          disabled={neueWoerter.length === 0}
        >
          {neueWoerter.length === 0
            ? 'Alle sechs sind schon im Trainer'
            : `${neueWoerter.length} ${neueWoerter.length === 1 ? 'Wort' : 'Wörter'} in den Trainer`}
          {neueWoerter.length > 0 && <IconPfeil groesse={18} />}
        </button>
      </section>

      {/* ---------- Die anderen Stücke ---------- */}
      <section className="start-karte">
        <h2 className="start-abschnitt">Alle Stücke</h2>
        <p className="start-abschnitt-sub">
          {gelesen.size} von {STUECKE.length} gelesen
        </p>

        <div className="lul-liste">
          {reihenfolgeAbHeute().map((s) => (
            <button
              key={s.id}
              className={'leitfaden-zeile' + (s.id === stueck.id ? ' lul-aktiv' : '')}
              onClick={() => {
                setOffen(s.id)
                window.scrollTo(0, 0)
              }}
            >
              {/* leitfaden-zeile-text gibt dem Text flex:1. Ohne die
                  Klasse steht der Pfeil direkt hinter dem Titel statt
                  am rechten Rand – genau so sah es zuerst aus. */}
              <span className="leitfaden-zeile-text">
                <b>{s.titel}</b>
                <span>
                  {s.region}
                  {gelesen.has(s.id) && <em className="lul-haken"> · gelesen</em>}
                </span>
              </span>
              <IconPfeil groesse={17} />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
