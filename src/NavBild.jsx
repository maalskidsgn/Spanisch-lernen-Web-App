/**
 * Bunte Toon-Bildchen für die untere App-Leiste (06.11., Entwurf A).
 * Auf dem Handy ersetzen sie die Strich-Symbole; am Desktop bleibt die
 * obere Leiste wie sie ist (dort blendet das CSS sie aus).
 */
const O = '#ff7a12'
const OD = '#d95c00'
const OH = '#ffd9b3'
const CR = '#fff6ec'
const T = '#2e3192'
const TD = '#1f2168'

const BILDER = {
  start: (
    <>
      <path d="M6 19L20 7l14 12v14a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill={O} />
      <path d="M20 7l14 12v14a3 3 0 0 1-3 3H20z" fill={OD} />
      <path d="M3 20L20 5l17 15" stroke={T} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="16" y="24" width="8" height="12" rx="2" fill={CR} />
      <path d="M10 16q3-3 6-5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".7" />
    </>
  ),
  lektionen: (
    <>
      <rect x="7" y="26" width="26" height="9" rx="3" fill={O} />
      <rect x="9" y="27.5" width="23" height="4" rx="1.5" fill={CR} />
      <path d="M13 16v8q7 4 14 0v-8z" fill={TD} />
      <path d="M20 6L37 13L20 20L3 13Z" fill={T} />
      <path d="M20 13L30 16v7" stroke={O} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="30" cy="24" r="2.4" fill={O} />
    </>
  ),
  trainer: (
    <>
      <rect x="6" y="9" width="20" height="26" rx="5" fill={O} transform="rotate(-12 16 22)" />
      <rect x="13" y="7" width="21" height="27" rx="5" fill="#fff" stroke={OH} strokeWidth="2" />
      <text x="23.5" y="25" textAnchor="middle" fontFamily="Nunito, system-ui, sans-serif" fontWeight="900" fontSize="11" fill={T}>Aa</text>
    </>
  ),
  youtube: (
    <>
      <rect x="4" y="11" width="32" height="23" rx="8" fill="#b8191a" />
      <rect x="4" y="8" width="32" height="23" rx="8" fill="#ff3b30" />
      <path d="M17 14l9 5.5-9 5.5z" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <rect x="8" y="11" width="12" height="3" rx="1.5" fill="#fff" opacity=".3" />
    </>
  ),
  profil: (
    <>
      <circle cx="20" cy="20" r="16" fill={OH} />
      <circle cx="20" cy="16" r="6.5" fill={O} />
      <path d="M8.5 31a13 13 0 0 1 23 0A16 16 0 0 1 8.5 31z" fill={O} />
    </>
  ),
}

export default function NavBild({ art }) {
  return (
    <svg className="nav-bild" viewBox="0 0 40 40" aria-hidden="true">
      {BILDER[art]}
    </svg>
  )
}
