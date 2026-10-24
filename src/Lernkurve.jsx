import { useEffect, useMemo, useState } from 'react'
import { verlauf, ARTEN } from './lernkurve.js'

/**
 * Lernkurve: wie viel man an welchem Tag wovon gelernt hat.
 * Vier Linien in vier Farben, oben antippbar zum Ein-/Ausblenden,
 * ein Punkt im Diagramm antippen zeigt die Zahlen dieses Tages.
 */

const SERIEN = {
  woerter: { name: 'Wörter', farbe: '#ff6c00' },
  saetze: { name: 'Sätze', farbe: '#7c5cff' },
  lektionen: { name: 'Lektionen', farbe: '#1e9d85' },
  texte: { name: 'Texte', farbe: '#2e8fe8' },
}

const ZEITRAEUME = [
  ['woche', 'Woche'],
  ['monat', 'Monat'],
  ['jahr', 'Jahr'],
]

// Zeichenfläche (SVG-Einheiten, skaliert mit der Breite)
const B = 340
const H = 190
const LINKS = 30
const RECHTS = 12
const OBEN = 34
const UNTEN = 26

export default function Lernkurve() {
  const [zeitraum, setZeitraum] = useState('woche')
  const [aktiv, setAktiv] = useState(() => new Set(ARTEN))
  const [stand, setStand] = useState(0) // zählt hoch, wenn neu gelernt wurde
  const punkte = useMemo(() => verlauf(zeitraum), [zeitraum, stand])
  const [gewaehlt, setGewaehlt] = useState(null)

  useEffect(() => {
    const neu = () => setStand((s) => s + 1)
    window.addEventListener('lernkurve', neu)
    window.addEventListener('focus', neu)
    return () => {
      window.removeEventListener('lernkurve', neu)
      window.removeEventListener('focus', neu)
    }
  }, [])

  // Beim Wechsel des Zeitraums wieder den jüngsten Punkt zeigen
  useEffect(() => setGewaehlt(null), [zeitraum])
  const index = gewaehlt ?? punkte.length - 1

  const summen = useMemo(() => {
    const s = {}
    for (const a of ARTEN) s[a] = punkte.reduce((n, p) => n + p.werte[a], 0)
    return s
  }, [punkte])

  const sichtbar = ARTEN.filter((a) => aktiv.has(a))
  // Jede Linie hat ihren EIGENEN Maßstab: Der beste Tag einer Kategorie
  // reicht immer bis oben – ein gelesener Text wirkt so genauso stark wie
  // 40 Wörter. Ist nur eine Linie sichtbar, gibt es eine echte Zahlenachse.
  const maxVon = {}
  for (const a of ARTEN) maxVon[a] = Math.max(1, ...punkte.map((p) => p.werte[a]))
  const nurEine = sichtbar.length === 1
  const max = nurEine ? schoeneObergrenze(maxVon[sichtbar[0]]) : 1
  const massstab = (a) => (nurEine ? max : maxVon[a])

  const innenB = B - LINKS - RECHTS
  const innenH = H - OBEN - UNTEN
  const x = (i) => LINKS + (punkte.length === 1 ? innenB / 2 : (i / (punkte.length - 1)) * innenB)
  const y = (v, a) => OBEN + innenH - (a ? v / massstab(a) : v / max) * innenH
  const boden = OBEN + innenH

  function umschalten(art) {
    setAktiv((alt) => {
      const neu = new Set(alt)
      if (neu.has(art) && neu.size > 1) neu.delete(art)
      else neu.add(art)
      return neu
    })
  }

  // Antippen/Ziehen im Diagramm: nächsten Punkt wählen
  function zeigeAuf(e) {
    const rahmen = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rahmen.left) / rahmen.width) * B
    const i = Math.round(((px - LINKS) / innenB) * (punkte.length - 1))
    setGewaehlt(Math.max(0, Math.min(punkte.length - 1, i)))
  }

  const p = punkte[index]
  const gesamtGewaehlt = sichtbar.reduce((n, a) => n + p.werte[a], 0)
  // Beschriftung der x-Achse: im Monat nur jede fünfte
  const zeigeLabel = (i) => zeitraum !== 'monat' || i % 5 === 4 || i === punkte.length - 1
  const animSchluessel = zeitraum + sichtbar.join()

  // Tooltip-Position (in Prozent, damit er mit dem SVG mitskaliert)
  const tipLinks = Math.min(80, Math.max(20, (x(index) / B) * 100))

  return (
    <div className="lernkurve">
      <div className="lk-kopf">
        <p className="start-abschnitt-sub lk-titel">Lernkurve</p>
        <div className="lk-zeitraum" role="tablist">
          {ZEITRAEUME.map(([id, name]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={zeitraum === id}
              className={'lk-zeit' + (zeitraum === id ? ' lk-zeit-aktiv' : '')}
              onClick={() => setZeitraum(id)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="lk-chips">
        {ARTEN.map((a) => (
          <button
            key={a}
            type="button"
            className={'lk-chip' + (aktiv.has(a) ? ' lk-chip-an' : '')}
            style={{ '--farbe': SERIEN[a].farbe }}
            onClick={() => umschalten(a)}
            aria-pressed={aktiv.has(a)}
          >
            <span className="lk-chip-punkt" />
            <span className="lk-chip-name">{SERIEN[a].name}</span>
            <b className="lk-chip-zahl">{summen[a]}</b>
          </button>
        ))}
      </div>

      <div className="lk-flaeche">
        <div className="lk-tip" style={{ left: tipLinks + '%' }}>
          <span className="lk-tip-datum">{p.lang}</span>
          {gesamtGewaehlt === 0 ? (
            <span className="lk-tip-leer">nichts gelernt</span>
          ) : (
            <span className="lk-tip-werte">
              {sichtbar
                .filter((a) => p.werte[a] > 0)
                .map((a) => (
                  <span key={a} style={{ color: SERIEN[a].farbe }}>
                    <b>{p.werte[a]}</b> {SERIEN[a].name}
                  </span>
                ))}
            </span>
          )}
        </div>

        <svg
          viewBox={`0 0 ${B} ${H}`}
          className="lk-svg"
          onPointerDown={zeigeAuf}
          onPointerMove={(e) => e.buttons && zeigeAuf(e)}
          role="img"
          aria-label="Lernkurve"
        >
          <defs>
            {ARTEN.map((a) => (
              <linearGradient key={a} id={'lk-verlauf-' + a} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIEN[a].farbe} stopOpacity={nurEine ? 0.38 : 0.16} />
                <stop offset="100%" stopColor={SERIEN[a].farbe} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {/* Hilfslinien + y-Achse */}
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={LINKS} x2={B - RECHTS} y1={y(max * t)} y2={y(max * t)} className="lk-raster" />
              {nurEine && (
                <text x={LINKS - 8} y={y(max * t) + 3.5} className="lk-achse" textAnchor="end">
                  {Math.round(max * t)}
                </text>
              )}
            </g>
          ))}

          {/* Senkrechte Linie am gewählten Punkt */}
          <line x1={x(index)} x2={x(index)} y1={OBEN - 6} y2={boden} className="lk-zeiger" />

          {/* Flächen zuerst, Linien darüber */}
          <g key={'f' + animSchluessel} className="lk-flaechen">
            {sichtbar.map((a) => {
              const pts = punkte.map((pt, i) => [x(i), y(pt.werte[a], a)])
              return (
                <path
                  key={a}
                  d={glatt(pts) + ` L${x(punkte.length - 1)},${boden} L${x(0)},${boden} Z`}
                  fill={`url(#lk-verlauf-${a})`}
                />
              )
            })}
          </g>
          <g key={'l' + animSchluessel}>
            {sichtbar.map((a, n) => {
              const pts = punkte.map((pt, i) => [x(i), y(pt.werte[a], a)])
              return (
                <path
                  key={a}
                  d={glatt(pts)}
                  className="lk-linie"
                  stroke={SERIEN[a].farbe}
                  pathLength="1"
                  style={{ animationDelay: n * 0.08 + 's' }}
                />
              )
            })}
          </g>

          {/* Punkte am gewählten Tag */}
          {sichtbar.map((a) => (
            <circle
              key={a + index}
              cx={x(index)}
              cy={y(p.werte[a], a)}
              r="4.5"
              className="lk-punkt"
              stroke={SERIEN[a].farbe}
            />
          ))}

          {/* x-Achse */}
          {punkte.map((pt, i) =>
            zeigeLabel(i) ? (
              <text
                key={i}
                x={x(i)}
                y={H - 6}
                textAnchor="middle"
                className={'lk-achse' + (i === index ? ' lk-achse-an' : '')}
              >
                {pt.label}
              </text>
            ) : null
          )}
        </svg>
      </div>
    </div>
  )
}

/** Runde Obergrenze für die y-Achse: 4 → 4, 7 → 8, 23 → 25, 130 → 150 … */
function schoeneObergrenze(v) {
  if (v <= 4) return 4
  const stufe = 10 ** Math.floor(Math.log10(v))
  for (const f of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (v <= f * stufe) return f * stufe
  return v
}

/**
 * Weiche Kurve durch alle Punkte (monoton, nach Fritsch–Carlson):
 * Sie schwingt nie über einen Punkt hinaus – also auch nie unter null.
 */
function glatt(pts) {
  const n = pts.length
  if (n < 2) return `M${pts[0][0]},${pts[0][1]}`
  const d = []
  const m = []
  for (let i = 0; i < n - 1; i++) d.push((pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0]))
  m.push(d[0])
  for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2)
  m.push(d[n - 2])
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0
      m[i + 1] = 0
      continue
    }
    const a = m[i] / d[i]
    const b = m[i + 1] / d[i]
    const s = a * a + b * b
    if (s > 9) {
      const t = 3 / Math.sqrt(s)
      m[i] = t * a * d[i]
      m[i + 1] = t * b * d[i]
    }
  }
  let pfad = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < n - 1; i++) {
    const h = (pts[i + 1][0] - pts[i][0]) / 3
    pfad +=
      ` C${pts[i][0] + h},${pts[i][1] + m[i] * h}` +
      ` ${pts[i + 1][0] - h},${pts[i + 1][1] - m[i + 1] * h}` +
      ` ${pts[i + 1][0]},${pts[i + 1][1]}`
  }
  return pfad
}
