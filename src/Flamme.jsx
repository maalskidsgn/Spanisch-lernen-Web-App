// Die Streak-Flamme im Habloo-Orange: drei Schichten, die unabhängig
// voneinander flackern, dazu Schein und Funken. Ohne Serie ist sie aus.
import { useId } from 'react'

export default function Flamme({ an = true, groesse = 40, klasse = '' }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg
      className={`flamme${an ? ' flamme-an' : ''} ${klasse}`.trim()}
      viewBox="0 0 48 64"
      width={(groesse * 3) / 4}
      height={groesse}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9a40" />
          <stop offset="55%" stopColor="#ff6c00" />
          <stop offset="100%" stopColor="#d63f00" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffb347" />
          <stop offset="100%" stopColor="#ff8a1a" />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff0b8" />
          <stop offset="100%" stopColor="#ffd25e" />
        </linearGradient>
      </defs>
      <ellipse className="flamme-schein" cx="24" cy="58" rx="17" ry="4" fill="#ff6c00" opacity=".25" />
      <path className="flamme-aussen" fill={`url(#${id}a)`}
        d="M24 2c2 10 9 14 14 22 3.5 5.5 5 10 5 15 0 12.5-8.5 22-19 22S5 51.5 5 39c0-8 4-14 9-19 .5 5 2.5 8 6 10-1.5-10 .5-19 4-28z" />
      <path className="flamme-mitte" fill={`url(#${id}b)`}
        d="M24.5 18c1.5 7 6 10 9 15 2 3.2 3 6 3 9 0 9-5.6 15.5-12.5 15.5S11.5 51 11.5 42.5c0-5 2.5-8.5 5.5-11.5.4 3 1.6 5 3.6 6.2-.8-7 .8-13.5 3.9-19.2z" />
      <path className="flamme-kern" fill={`url(#${id}c)`}
        d="M24 36c1 3.5 3.5 5 5.2 7.6 1 1.6 1.6 3 1.6 4.4 0 5-3 8.5-6.8 8.5s-6.8-3.5-6.8-8c0-3 1.6-5 3.2-6.8.4 1.5 1 2.4 2 3-.2-3 .5-6 1.6-8.7z" />
      {an && (
        <>
          <circle className="flamme-funke flamme-funke-1" cx="13" cy="18" r="1.5" fill="#ff9a40" />
          <circle className="flamme-funke flamme-funke-2" cx="36" cy="14" r="1.2" fill="#ffb347" />
        </>
      )}
    </svg>
  )
}
