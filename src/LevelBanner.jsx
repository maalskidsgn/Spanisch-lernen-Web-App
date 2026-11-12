import { LEVEL_STUFEN } from './gamification.js'

/**
 * Profil-Hintergrund nach Level (12.11.2026): gleiche Pastellfarben und
 * gleiches Symbol wie das Emblem. Ab Profi funkeln Rangzeichen, ab
 * Legende zieht ein Glanz drüber, ab Unsterblich wandert der Verlauf,
 * bei Level 100 eine goldene Sonne mit Strahlen.
 * Liegt als Ebene in .pf-banner (Zahnrad bleibt darüber).
 */

const SOL = { verlauf: ['#fff3c9', '#ffd36e', '#ffa95c'], farbe: '#d98a00', funken: 3, symbol: 'sonne' }

export function stufeFuer(level) {
  const s = [...LEVEL_STUFEN].reverse().find((x) => level >= x.ab) ?? LEVEL_STUFEN[0]
  return s.sol ? { ...s, ...SOL } : s
}

/** Farbe der Stufe als CSS-Variable – für Bildrahmen und Level-Pille. */
export function stufeStil(level) {
  return { '--lv-farbe': stufeFuer(level).farbe }
}

const SYMBOLE = {
  keim: <path d="M12 21v-8M12 13c-4 0-7-3-7-7 4 0 7 3 7 7zm0 0c0-4 3-7 7-7 0 4-3 7-7 7z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />,
  blatt: <path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15zM5 19l7-7" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />,
  kompass: <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="currentColor" /></>,
  buch: <path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z" fill="currentColor" />,
  stern: <path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21.1l1.4-7L2 9.3l7-.8z" fill="currentColor" />,
  blitz: <path d="M13.5 2L5 13.5h6L10 22l9-12h-6.3z" fill="currentColor" />,
  haken: <><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  diamant: <path d="M6 3h12l4 6-10 12L2 9z" fill="currentColor" />,
  krone: <path d="M3 8l4.5 3.5L12 5l4.5 6.5L21 8l-2 11H5z" fill="currentColor" />,
  grosseKrone: <path d="M2 7l4 4 3-6 3 5 3-5 3 6 4-4-2 12H4z" fill="currentColor" />,
  fluegel: <path d="M12 18c-1-6-5-10-10-11 1 5 4 9 10 11zm0 0c1-6 5-10 10-11-1 5-4 9-10 11z" fill="currentColor" />,
  komet: <><circle cx="17" cy="7" r="4" fill="currentColor" /><path d="M14 10L3 21M15.5 11.5L7 20M12.5 8.5L4 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
  berg: <path d="M2 20l7-12 4 6 3-4 6 10z" fill="currentColor" />,
  unendlich: <path d="M7 8c-2.5 0-4 1.8-4 4s1.5 4 4 4c4 0 6-8 10-8 2.5 0 4 1.8 4 4s-1.5 4-4 4c-4 0-6-8-10-8z" fill="none" stroke="currentColor" strokeWidth="2.6" />,
}
const PLAETZE = [[6, 18, 46], [24, 52, 30], [40, 10, 38], [62, 46, 54], [80, 12, 34], [90, 58, 42], [50, 70, 26]]
const FUNKEN = [[18, 30], [72, 26], [86, 70], [34, 72], [56, 20], [10, 66]]

export default function LevelBanner({ level }) {
  const s = stufeFuer(level)
  const glanz = s.ab >= 50
  const bewegt = s.ab >= 85 && !s.sol
  const [v1, v2, v3 = v2] = s.verlauf
  return (
    <div
      className={'lvb' + (bewegt ? ' lvb-bewegt' : '')}
      style={{ '--v1': v1, '--v2': v2, '--v3': v3, '--lv-farbe': s.farbe }}
      aria-hidden="true"
    >
      <div className="lvb-grund" />
      {s.sol && <><div className="lvb-strahlen" /><div className="lvb-sonne" /></>}
      <span className="lvb-kreis lvb-k1" />
      <span className="lvb-kreis lvb-k2" />
      {!s.sol && SYMBOLE[s.symbol] && PLAETZE.map(([x, y, g], i) => (
        <svg key={i} className="lvb-motiv" viewBox="0 0 24 24" style={{ left: x + '%', top: y + '%', width: g, height: g, animationDelay: -i * 1.1 + 's' }}>
          {SYMBOLE[s.symbol]}
        </svg>
      ))}
      {FUNKEN.slice(0, (s.funken ?? 0) * 2).map(([x, y], i) => (
        <svg key={'f' + i} className="lvb-funke" viewBox="0 0 24 24" style={{ left: x + '%', top: y + '%', animationDelay: i * 0.35 + 's' }}>
          <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" fill="currentColor" />
        </svg>
      ))}
      {glanz && <div className="lvb-glanz" />}
    </div>
  )
}
