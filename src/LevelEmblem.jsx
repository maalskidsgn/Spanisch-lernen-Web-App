// Die Embleme zu den Level-Stufen (LEVEL_STUFEN in gamification.js):
// Toon-Wappen im Stil der Podest-Inseln, siehe TOENE weiter unten.
// Sol Eterno bricht bewusst damit: Das Ziel soll man von weitem erkennen.
// Alles SVG, damit es in der Kopfleiste genauso scharf ist wie im Profil.
import { useId } from 'react'
import { levelName, levelStufe, LEVEL_STUFEN } from './gamification.js'
import { useTexte } from './sprache.js'

const FUNKE = 'M0-5c.8 3.2 1.8 4.2 5 5-3.2.8-4.2 1.8-5 5-.8-3.2-1.8-4.2-5-5 3.2-.8 4.2-1.8 5-5z'

/** Ein Strahlenkranz als Stern: abwechselnd außen und innen. */
function kranz(zacken, aussen, innen) {
  return Array.from({ length: zacken * 2 }, (_, i) => {
    const winkel = (i * Math.PI) / zacken
    const r = i % 2 ? innen : aussen
    return `${(32 + r * Math.sin(winkel)).toFixed(2)} ${(32 - r * Math.cos(winkel)).toFixed(2)}`
  }).join(' ')
}
const KRANZ_LANG = kranz(16, 32, 20)
const KRANZ_KURZ = kranz(16, 26, 19)

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
  unendlich: ['M7.5 8.3a3.7 3.7 0 0 0 0 7.4c3.6 0 5.4-7.4 9-7.4a3.7 3.7 0 0 1 0 7.4c-3.6 0-5.4-7.4-9-7.4z'],
}

function Symbol({ name, farbe }) {
  if (LINIE[name]) {
    return (
      <g fill="none" stroke={farbe} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {LINIE[name].map((d) => <path key={d} d={d} />)}
        {name === 'kompass' && <path d="M15.8 8.2l-2.3 5.3-5.3 2.3 2.3-5.3z" fill={farbe} stroke="none" />}
      </g>
    )
  }
  return <path d={FLAECHE[name]} fill={farbe} stroke={farbe} strokeWidth="1.2" strokeLinejoin="round" />
}

function SolEterno({ id }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}s`}>
          <stop offset="55%" stopColor="#ffc800" stopOpacity=".65" />
          <stop offset="100%" stopColor="#ff5fa2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff3a8" />
          <stop offset="50%" stopColor="#ffb300" />
          <stop offset="100%" stopColor="#ff6c00" />
        </linearGradient>
        <radialGradient id={`${id}k`} cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#fffbe0" />
          <stop offset="38%" stopColor="#ffd23c" />
          <stop offset="72%" stopColor="#ff6c00" />
          <stop offset="100%" stopColor="#c81e73" />
        </radialGradient>
      </defs>
      <circle className="sol-schein" cx="32" cy="32" r="32" fill={`url(#${id}s)`} />
      <polygon className="sol-kranz-lang" points={KRANZ_LANG} fill={`url(#${id}l)`} />
      <polygon className="sol-kranz-kurz" points={KRANZ_KURZ} fill="#ff5fa2" opacity=".75" />
      <circle cx="32" cy="32" r="19" fill={`url(#${id}k)`} stroke="#fff6c9" strokeWidth="2" />
      <path className="sol-funke" d={FUNKE} fill="#fff" transform="translate(32 32) scale(2.5)" />
      <g className="sol-bahn">
        <path d={FUNKE} fill="#fff" transform="translate(32 3) scale(.75)" />
        <path d={FUNKE} fill="#fff3a8" transform="translate(57 46) scale(.6)" />
        <path d={FUNKE} fill="#fff" transform="translate(7 46) scale(.6)" />
      </g>
    </>
  )
}

// Die Toon-Wappen (Manuel, 06.11.): ein Sechseck in zwei Tönen wie die
// Podest-Inseln, weißes Symbol, Glanzstrich. Je Stufe eine eigene Farbe;
// ab Experte kommt Bewegung dazu und wird mit jeder Stufe lebendiger:
// Glanz, dann Schein, dann Schweben, dann Funkeln. Sol Eterno bleibt.
const TOENE = {
  keim: ['#ffd9bf', '#ffad7a', '#f08a4f', '#c8622a'],
  blatt: ['#d4f5dc', '#5fd38a', '#3fb26f', '#2a8a52'],
  kompass: ['#c9f2e8', '#4fd1b5', '#2fb096', '#1d8574'],
  buch: ['#d6ecff', '#5aa9ff', '#3a88e8', '#2563b8'],
  stern: ['#dfe2ff', '#7d8bff', '#5d6af0', '#3f48c4'],
  blitz: ['#effbc8', '#b8e34a', '#97c726', '#6d9615'],
  haken: ['#ffe0c2', '#ff9a3d', '#ff7a12', '#c85200'],
  diamant: ['#e3f6ff', '#7fd3f5', '#4fb6e0', '#2b86b0'],
  krone: ['#ffeaa0', '#ffc43d', '#f2a200', '#c27c00'],
  grosseKrone: ['#ffd5cc', '#ff7a66', '#ef5640', '#c2341f'],
  fluegel: ['#e2d8ff', '#9a7dff', '#7a5cf0', '#5a3fc8'],
  komet: ['#d9d6ff', '#6b5bd2', '#5446b8', '#3b2f8f'],
  berg: ['#ffd3f0', '#e45fc4', '#c940a8', '#9a2b80'],
  unendlich: ['#ffd3e6', '#ff6fa8', '#ef4f8c', '#c22d6a'],
}
const HEX = '32,4 54.5,17 54.5,43 32,56 9.5,43 9.5,17'
const HEX_UNTEN = '32,8 54.5,21 54.5,47 32,60 9.5,47 9.5,21'
const HEX_RECHTS = '32,4 54.5,17 54.5,43 32,56 32,30'
const HEX_INNEN = '32,10 49.3,20 49.3,40 32,50 14.7,40 14.7,20'
const FUNKEN_ORTE = [[56, 8], [7, 12], [57, 50]]

/**
 * @param {number} level
 * @param {number} groesse – Kantenlänge in Pixeln
 * @param {string} klasse
 */
export default function LevelEmblem({ level, groesse = 48, klasse = '' }) {
  const stufe = levelStufe(level)
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const { farbe, symbol, sol } = stufe
  const rang = LEVEL_STUFEN.indexOf(stufe)
  const [hell, haupt, dunkel, tief] = TOENE[symbol] ?? TOENE.keim
  const name = `Level ${level} – ${levelName(level)}`

  return (
    <svg
      className={`level-emblem${sol ? ' level-emblem-sol' : ''} ${klasse}`.trim()}
      style={sol ? undefined : { '--emblem-schein': farbe + '55' }}
      viewBox="0 0 64 64"
      width={groesse}
      height={groesse}
      role="img"
      aria-label={name}
    >
      <title>{name}</title>
      {sol ? (
        <SolEterno id={id} />
      ) : (
        <>
          <defs>
            <clipPath id={`${id}c`}>
              <polygon points={HEX} />
            </clipPath>
          </defs>
          {rang >= 9 && <circle className="lv-schein" cx="32" cy="31" r="31" fill={haupt} opacity=".28" />}
          <g className={rang >= 10 ? 'lv-schweben' : undefined}>
            <polygon points={HEX_UNTEN} fill={tief} />
            <polygon points={HEX} fill={haupt} />
            <polygon points={HEX_RECHTS} fill={dunkel} />
            <polygon points={HEX_INNEN} fill={hell} opacity=".35" />
            <path d="M13.5 20 L32 9" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity=".8" />
            <g transform="translate(17 16) scale(1.25)">
              <Symbol name={symbol} farbe="#fff" />
            </g>
            {rang >= 7 && (
              <g clipPath={`url(#${id}c)`}>
                <path className="lv-glanz" d="M-6 64 L14 0 H24 L4 64 Z" fill="#fff" opacity=".45" />
              </g>
            )}
          </g>
          {rang >= 11 &&
            FUNKEN_ORTE.slice(0, rang >= 13 ? 3 : 2).map(([x, y]) => (
              <path key={x + '-' + y} className="lv-funke" d={FUNKE} fill="#fff" stroke={haupt} strokeWidth=".8" transform={`translate(${x} ${y}) scale(.8)`} />
            ))}
        </>
      )}
    </svg>
  )
}

/** Emblem mit Titel und Level – so steht es in den Profilen. */
export function LevelPlakette({ level }) {
  const t = useTexte()
  const { farbe, sol } = levelStufe(level)
  return (
    <div
      className={'level-plakette' + (sol ? ' level-plakette-sol' : '')}
      style={sol ? undefined : { '--plakette-ton': farbe }}
    >
      <LevelEmblem level={level} groesse={56} />
      <span>
        <b>{levelName(level)}</b>
        <small>{t('se9.levelNr', { zahl: level })}</small>
      </span>
    </div>
  )
}
