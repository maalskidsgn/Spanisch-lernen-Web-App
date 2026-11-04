// Die Embleme zu den Level-Stufen (LEVEL_STUFEN in gamification.js).
//
// Jedes Emblem ist das Habloo-Logo: abgerundete Kachel, weiße Sprechblase
// mit Spitze unten links. Statt des Funkens steht das Symbol der Stufe in
// der Blase, die Funken wandern als Rangzeichen auf die Kachel.
// Alles SVG, damit es in der Kopfleiste genauso scharf ist wie im Profil.
import { useId } from 'react'
import { levelName, levelStufe } from './gamification.js'

// Auf der goldenen Kachel von Unsterblich wären weiße Funken unsichtbar
const NAVY_KANTE = '#000041'
const BLASE = 'M14 9h36a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H29l-11 9.5V47h-4a8 8 0 0 1-8-8V17a8 8 0 0 1 8-8z'
const FUNKE = 'M0-5c.8 3.2 1.8 4.2 5 5-3.2.8-4.2 1.8-5 5-.8-3.2-1.8-4.2-5-5 3.2-.8 4.2-1.8 5-5z'

// Zwölf Zacken um die Kachel-Mitte – nur Sol Eterno bekommt den Strahlenkranz
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
}

const LINIE = {
  keim: ['M12 21v-9', 'M12 12.5C12 8.5 9 6 4.5 6c0 4.5 3 6.5 7.5 6.5z', 'M12 15c0-3.5 3-5.5 7.5-5.5 0 4-3 5.5-7.5 5.5z'],
  kompass: ['M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18z'],
  haken: ['M5 12.5l4.5 4.5L19 7'],
  sonne: ['M12 7a5 5 0 1 1 0 10a5 5 0 1 1 0-10z', 'M12 2.5V4', 'M12 20v1.5', 'M2.5 12H4', 'M20 12h1.5', 'M5.3 5.3l1 1', 'M17.7 17.7l1 1', 'M18.7 5.3l-1 1', 'M6.3 17.7l-1 1'],
  unendlich: ['M7.5 8.3a3.7 3.7 0 0 0 0 7.4c3.6 0 5.4-7.4 9-7.4a3.7 3.7 0 0 1 0 7.4c-3.6 0-5.4-7.4-9-7.4z'],
}

function Symbol({ name, farbe }) {
  if (LINIE[name]) {
    return (
      <g fill="none" stroke={farbe} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {LINIE[name].map((d) => <path key={d} d={d} />)}
        {name === 'kompass' && <path d="M15.8 8.2l-2.3 5.3-5.3 2.3 2.3-5.3z" fill={farbe} stroke="none" />}
        {name === 'sonne' && <circle cx="12" cy="12" r="5" fill={farbe} stroke="none" />}
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
  const { von, bis, kante, blase, farbe, symbol, funken, strahlen } = stufe
  const inhalt = (
    <>
      <path d={BLASE} fill={blase} />
      <g transform="translate(17.6 13.6) scale(1.2)">
        <Symbol name={symbol} farbe={farbe} />
      </g>
    </>
  )

  return (
    <svg
      className={`level-emblem ${klasse}`.trim()}
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
      {strahlen ? (
        <>
          <polygon className="level-emblem-strahlen" points={STRAHLEN} fill={kante} />
          <circle cx="32" cy="32" r="22" fill={`url(#${id}f)`} stroke="#fff" strokeWidth="1.5" />
          <g transform="translate(32 33) scale(.68) translate(-32 -33)">{inhalt}</g>
        </>
      ) : (
        <>
          <rect x="1.5" y="1.5" width="61" height="61" rx="15" fill={`url(#${id}f)`} stroke={kante} strokeWidth="3" />
          {inhalt}
          {Array.from({ length: funken }, (_, i) => (
            <path key={i} d={FUNKE} fill={kante === NAVY_KANTE ? NAVY_KANTE : '#fff'} transform={`translate(${52 - i * 10} 54.5)`} />
          ))}
        </>
      )}
    </svg>
  )
}
