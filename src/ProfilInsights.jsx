import { useEffect, useMemo, useState } from 'react'
import { db, supabaseBereit } from './supabase.js'
import { sprache, gebiet } from './sprache.js'

/**
 * Lern-Insights im Profil einer anderen Person (12.11.2026).
 *
 * Die Datenbank-Funktion profil_insights(name) gibt nur Summen pro Tag
 * heraus (Wörter, Sätze, Lektionen, Texte, Video- und Sprech-Minuten,
 * Lernzeit, XP) – keine einzelnen Wörter, nichts Privates. Daraus wird
 * hier alles berechnet. Fehlt die Funktion (oder es gibt keine Daten),
 * bleibt der Bereich einfach weg.
 */

const TEXT = {
  de: {
    woche: 'Woche', monat: 'Monat', jahr: 'Jahr',
    xp: 'XP gesammelt', woerter: 'Wörter wiederholt', zeit: 'Lernzeit', serie: 'längste Serie',
    tage: (n) => `${n} ${n === 1 ? 'Tag' : 'Tage'}`,
    wann: (n) => `Wann ${n} lernt`, was: (n) => `Was ${n} lernt`, letzte: 'Letzte 30 Tage',
    staerkster: 'Stärkster Tag:', amLiebsten: 'Am liebsten:',
    aktiv: (b) => `von ${b} Tagen aktiv`, schnitt: (m) => `Ø ${m} Min pro Lerntag`,
    heute: 'heute', neu: 'neu', leer: (n) => `${n} hat in diesem Zeitraum noch nichts gelernt.`,
    tageKurz: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    tageLang: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
    bereiche: { woerter: 'Vokabeln', saetze: 'Sätze', lektionen: 'Lektionen', texte: 'Texte', video: 'Videos', habla: 'Sprechen' },
  },
  en: {
    woche: 'Week', monat: 'Month', jahr: 'Year',
    xp: 'XP earned', woerter: 'words reviewed', zeit: 'study time', serie: 'longest streak',
    tage: (n) => `${n} ${n === 1 ? 'day' : 'days'}`,
    wann: (n) => `When ${n} studies`, was: (n) => `What ${n} studies`, letzte: 'Last 30 days',
    staerkster: 'Strongest day:', amLiebsten: 'Favourite:',
    aktiv: (b) => `of ${b} days active`, schnitt: (m) => `Ø ${m} min per study day`,
    heute: 'today', neu: 'new', leer: (n) => `${n} hasn't studied in this period yet.`,
    tageKurz: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    tageLang: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    bereiche: { woerter: 'Vocabulary', saetze: 'Sentences', lektionen: 'Lessons', texte: 'Texts', video: 'Videos', habla: 'Speaking' },
  },
}
const FARBEN = { woerter: 'var(--primary)', saetze: '#4fa8ff', lektionen: '#2bb6a3', texte: '#8b5cf6', video: '#ff7aa2', habla: '#ffc43d' }
// Aufwand je Einheit in Minuten – so werden Wörter, Lektionen und Video vergleichbar
const GEWICHT = { woerter: 0.2, saetze: 0.4, lektionen: 4, texte: 3, video: 1, habla: 1 }
const TAGE_ZEITRAUM = { woche: 7, monat: 30, jahr: 365 }

const tag = (d) => d.toLocaleDateString('sv-SE')
const vor = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d }
const zahl = (n) => Math.round(n).toLocaleString(gebiet())

function minutenVonTag(e = {}) {
  if (e.minuten) return e.minuten
  return Object.entries(GEWICHT).reduce((s, [k, g]) => s + (e[k] ?? 0) * g, 0)
}

/** Summen über die letzten n Tage, ab Versatz (für den Vergleich davor). */
function summe(daten, n, versatz = 0) {
  const s = { xp: 0, woerter: 0, minuten: 0, aktiv: 0 }
  for (let i = versatz; i < versatz + n; i++) {
    const k = tag(vor(i))
    const e = daten.lernkurve[k]
    s.xp += Number(daten.xp[k]) || 0
    if (e) {
      s.woerter += e.woerter ?? 0
      const m = minutenVonTag(e)
      s.minuten += m
      if (m > 0 || daten.aktiv.has(k)) s.aktiv++
    } else if (daten.aktiv.has(k)) s.aktiv++
  }
  return s
}

function laengsteSerie(daten) {
  const tage = new Set([...daten.aktiv, ...Object.keys(daten.lernkurve).filter((k) => minutenVonTag(daten.lernkurve[k]) > 0)])
  let best = 0
  let lauf = 0
  let vorher = null
  for (const k of [...tage].sort()) {
    const d = new Date(k + 'T12:00:00')
    lauf = vorher && (d - vorher) / 86400000 < 1.5 ? lauf + 1 : 1
    best = Math.max(best, lauf)
    vorher = d
  }
  return best
}

export default function ProfilInsights({ benutzername }) {
  const T = TEXT[sprache() === 'en' ? 'en' : 'de']
  const [roh, setRoh] = useState(undefined) // undefined = lädt, null = nicht verfügbar
  const [zeitraum, setZeitraum] = useState('woche')

  useEffect(() => {
    let aktiv = true
    if (!supabaseBereit || !benutzername) { setRoh(null); return }
    db.rpc('profil_insights', { name: benutzername }).then(({ data, error }) => {
      if (aktiv) setRoh(error || !data ? null : data)
    }, () => aktiv && setRoh(null))
    return () => { aktiv = false }
  }, [benutzername])

  const daten = useMemo(() => roh && {
    lernkurve: roh.lernkurve ?? {},
    xp: roh.xp ?? {},
    aktiv: new Set(roh.aktiv ?? []),
  }, [roh])

  const auswertung = useMemo(() => {
    if (!daten) return null
    const n = TAGE_ZEITRAUM[zeitraum]
    const jetzt = summe(daten, n)
    const davor = summe(daten, n, n)
    const trend = davor.xp > 0 ? Math.round(((jetzt.xp - davor.xp) / davor.xp) * 100) : null
    // Wochentage + Bereiche im Zeitraum
    const wochentage = Array(7).fill(0)
    const bereiche = Object.fromEntries(Object.keys(GEWICHT).map((k) => [k, 0]))
    for (let i = 0; i < n; i++) {
      const d = vor(i)
      const e = daten.lernkurve[tag(d)]
      if (!e) continue
      wochentage[(d.getDay() + 6) % 7] += minutenVonTag(e)
      for (const [k, g] of Object.entries(GEWICHT)) bereiche[k] += (e[k] ?? 0) * g
    }
    const gesamt = Object.values(bereiche).reduce((a, b) => a + b, 0)
    const mix = Object.entries(bereiche)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => [k, Math.max(1, Math.round((v / gesamt) * 100))])
      .sort((a, b) => b[1] - a[1])
    // Letzte 30 Tage (älteste zuerst)
    const monat = Array.from({ length: 30 }, (_, i) => minutenVonTag(daten.lernkurve[tag(vor(29 - i))]))
    const aktiv30 = summe(daten, 30).aktiv
    const min30 = monat.reduce((a, b) => a + b, 0)
    return {
      jetzt, trend, wochentage, mix, monat, aktiv30,
      schnitt: aktiv30 ? Math.round(min30 / aktiv30) : 0,
      serie: laengsteSerie(daten),
      leer: jetzt.minuten === 0 && jetzt.xp === 0,
    }
  }, [daten, zeitraum])

  if (!auswertung) return null
  const a = auswertung
  const maxTag = Math.max(...a.wochentage, 1)
  const besterTag = a.wochentage.indexOf(Math.max(...a.wochentage))
  const maxMonat = Math.max(...a.monat, 1)
  const stunden = a.jetzt.minuten >= 60 ? `${Math.floor(a.jetzt.minuten / 60)} h ${Math.round(a.jetzt.minuten % 60)} min` : `${Math.round(a.jetzt.minuten)} min`

  return (
    <section className="pi" aria-label="Insights">
      <div className="pi-zeitraum" role="tablist">
        {['woche', 'monat', 'jahr'].map((z) => (
          <button key={z} type="button" role="tab" aria-selected={zeitraum === z} className={zeitraum === z ? 'an' : ''} onClick={() => setZeitraum(z)}>
            {T[z]}
          </button>
        ))}
      </div>

      {a.leer ? (
        <p className="pi-leer">{T.leer(benutzername)}</p>
      ) : (
        <>
          <div className="pi-zahlen">
            <div className="pi-karte">
              <b>{zahl(a.jetzt.xp)}</b><small>{T.xp}</small>
              {a.trend !== null && a.trend !== 0 && (
                <span className={'pi-trend' + (a.trend < 0 ? ' runter' : '')}>{a.trend > 0 ? '+' : ''}{a.trend} %</span>
              )}
            </div>
            <div className="pi-karte"><b>{zahl(a.jetzt.woerter)}</b><small>{T.woerter}</small></div>
            <div className="pi-karte"><b>{stunden}</b><small>{T.zeit}</small></div>
            <div className="pi-karte"><b>{T.tage(a.serie)}</b><small>{T.serie}</small></div>
          </div>

          <div className="pi-block">
            <h3>{T.wann(benutzername)}</h3>
            <div className="pi-woche">
              {a.wochentage.map((m, i) => (
                <div key={i} className={i === besterTag ? 'top' : ''}>
                  <i style={{ height: Math.max(6, (m / maxTag) * 100) + '%' }} />
                  <span>{T.tageKurz[i]}</span>
                </div>
              ))}
            </div>
            <p className="pi-fuss">{T.staerkster} <b>{T.tageLang[besterTag]}</b></p>
          </div>

          {a.mix.length > 0 && (
            <div className="pi-block">
              <h3>{T.was(benutzername)}</h3>
              <p className="pi-liebling">{T.amLiebsten} <b>{T.bereiche[a.mix[0][0]]}</b> ({a.mix[0][1]} %)</p>
              <div className="pi-stapel">
                {a.mix.map(([k, p]) => <i key={k} style={{ flexGrow: p, background: FARBEN[k] }} title={T.bereiche[k]} />)}
              </div>
              <div className="pi-mix">
                {a.mix.map(([k, p]) => (
                  <div key={k}><i style={{ background: FARBEN[k] }} />{T.bereiche[k]}<span>{p} %</span></div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="pi-block">
        <h3>{T.letzte}</h3>
        <div className="pi-monat">
          {a.monat.map((m, i) => (
            <i key={i} className={(m === 0 ? 'leer' : '') + (i === 29 ? ' heute' : '')} style={{ height: m === 0 ? '5%' : Math.max(10, (m / maxMonat) * 100) + '%' }} />
          ))}
        </div>
        <div className="pi-achse">
          <span>{vor(29).toLocaleDateString(gebiet(), { day: 'numeric', month: 'short' })}</span>
          <span>{T.heute}</span>
        </div>
        <div className="pi-pillen">
          <span><b>{a.aktiv30}</b> {T.aktiv(30)}</span>
          {a.schnitt > 0 && <span>{T.schnitt(a.schnitt)}</span>}
        </div>
      </div>
    </section>
  )
}

