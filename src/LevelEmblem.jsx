// Die Embleme zu den Level-Stufen (LEVEL_STUFEN in gamification.js).
//
// Der Rahmen zeigt die Epoche: erst Kreis, ab Level 20 Schild, ab der
// Legende Sechseck auf Dunkel, und nur Sol Eterno bekommt die Strahlen.
// Alles SVG, damit es in der Kopfleiste genauso scharf ist wie im Profil.
import { useId } from 'react'
import { levelName, levelStufe } from './gamification.js'

const RAHMEN = {
  kreis: 'M32 4a28 28 0 1 1 0 56a28 28 0 1 1 0-56z',
  schild: 'M32 3l25 8v19c0 15.5-10.5 25.5-25 31C17.5 55.5 7 45.5 7 30V11z',
  sechseck: 'M32 2l26 15v30L32 62L6 47V17z',
}

// Zwölf Zacken um die Mitte – der Strahlenkranz von Sol Eterno
const STRAHLEN = Array.from({ length: 24 }, (_, i) => {
  const winkel = (i * Math.PI) / 12
  const r = i % 2 ? 22 : 31
  return `${(32 + r * Math.sin(winkel)).toFixed(2)} ${(32 - r * Math.cos(winkel)).toFixed(2)}`
}).join(' ')

// Die Symbole, gezeichnet auf einem 24er-Raster
const FLAECHE = {
  blatt: 'M19.5 4C10 4 5 9 5 15c0 1.9.5 3.4 1.4 4.5C8 14.5 11 11.3 15 9c-3 3-5.8 6.3-6.9 11.2 1 .3 2 .5 3 .5 6.5 0 9.4-6 8.4-16.7z',
  buch: 'M3.5 5.5C6.5 4.3 9.5 4.6 11.3 6.5V19.3C9.5 17.5 6.5 17.2 3.5 18.3zM20.5 5.5C17.5 4.3 14.5 4.6 12.7 6.5V19.3C14.5 17.5 17.5 17.2 20.5 18.3z',
  stern: 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.1-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z',
  blitz: 'M13.5 2L5 13.5h6L10 22l9-12h-6.3z',
  diamant: 'M7 4h10l4.5 6L12 21.5 2.5 10z',
  krone: 'M2.5 7.5l5 4.5L12 4.5l4.5 7.5 5-4.5L19.3 19H4.7z',
  grosseKrone: 'M2.5 5.5l5 4.5L12 2.5 16.5 10l5-4.5L19.5 15h-15zM5 17h14v3H5z',
  fluegel: 'M10.3 10.5C7.2 9.7 4 7.7 1.5 4.5c-.2 4.7.9 9.6 4 12 1.5 1.1 3.2 1.3 4.8.7zM13.7 10.5c3.1-.8 6.3-2.8 8.8-6 .2 4.7-.9 9.6-4 12-1.5 1.1-3.2 1.3-4.8.7zM12 6.5l1.7 4.5L12 19.5 10.3 11z',
  komet: 'M21.5 2.5L10 9a6.5 6.5 0 1 0 5 5z',
  berg: 'M1.5 20.5L8.8 7.5l3.2 4.7L15.3 5l7.2 15.5z',
  sonne: 'M12 5.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 1 1 0-13z',
}

const LINIE = {
  keim: ['M12 21v-9', 'M12 12.5C12 8.5 9 6 4.5 6c0 4.5 3 6.5 7.5 6.5z', 'M12 15c0-3.5 3-5.5 7.5-5.5 0 4-3 5.5-7.5 5.5z'],
  kompass: ['M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18z'],
  haken: ['M5 12.5l4.5 4.5L19 7'],
  unendlich: ['M7.5 8.3a3.7 3.7 0 0 0 0 7.4c3.6 0 5.4-7.4 9-7.4a3.7 3.7 0 0 1 0 7.4c-3.6 0-5.4-7.4-9-7.4z'],
}

function Symbol({ name, farbe }) {
  if (LINIE[name]) {
    return (
      <g fill="none" stroke={farbe} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {LINIE[name].map((d) => <path key={d} d={d} />)}
        {name === 'kompass' && <path d="M15.8 8.2l-2.3 5.3-5.3 2.3 2.3-5.3z" fill={farbe} stroke="none" />}
      </g>
    )
  }
  return <path d={FLAECHE[name]} fill={farbe} />
}

/**
 * @param {number} level
 * @param {number} groesse – Kantenlänge in Pixeln
 * @param {string} klasse
 */
export default function LevelEmblem({ level, groesse = 48, klasse = '' }) {
  const stufe = levelStufe(level)
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const { rahmen, von, bis, kante, farbe, symbol } = stufe
  const istSol = rahmen === 'strahlen'
  const form = istSol ? null : RAHMEN[rahmen]

  return (
    <svg
      className={`level-emblem level-emblem-${rahmen} ${klasse}`.trim()}
      viewBox="0 0 64 64"
      width={groesse}
      height={groesse}
      role="img"
      aria-label={`Level ${level} – ${levelName(level)}`}
    >
      <title>{`Level ${level} – ${levelName(level)}`}</title>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={von} />
          <stop offset="100%" stopColor={bis} />
        </linearGradient>
      </defs>
      {istSol ? (
        <>
          <polygon className="level-emblem-strahlen" points={STRAHLEN} fill={kante} />
          <circle cx="32" cy="32" r="21" fill={`url(#${id}f)`} stroke="#fff4c9" strokeWidth="2" />
        </>
      ) : (
        <>
          <path d={form} fill={`url(#${id}f)`} stroke={kante} strokeWidth="3" strokeLinejoin="round" />
          {/* Heller Schein oben: macht aus der Fläche eine Plakette */}
          <path d={form} fill="#fff" opacity=".14" transform="translate(32 20) scale(.8 .55) translate(-32 -32)" />
        </>
      )}
      <g transform={`translate(${istSol ? 18.8 : 17.6} ${istSol ? 18.8 : 17.6}) scale(${istSol ? 1.1 : 1.2})`}>
        <Symbol name={symbol} farbe={farbe} />
      </g>
    </svg>
  )
}
