import { Sockel } from './StartInseln.jsx'
import { FARBEN_HABLOO as F } from './InselEmbleme.jsx'

/**
 * Kopfbild der KI-Generatoren (06.11., Entwurf A): auf der Trommel
 * wird gezaubert – je nach Generator Wortkarten, eine Sprechblase
 * oder eine Textseite, umschwirrt von Funken. So sieht man sofort,
 * was hier entsteht.
 */
function Funken() {
  return (
    <>
      <path d="M62 4l2.6 6.4 6.4 2.6-6.4 2.6L62 22l-2.6-6.4L53 13l6.4-2.6z" fill="#ffd34d" />
      <path d="M62 4l2.6 6.4 6.4 2.6L62 13z" fill="#fff" opacity=".5" />
      <path d="M14 14l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#7d8bff" />
      <circle cx="72" cy="30" r="2.4" fill="#ff7aa2" />
      <circle cx="9" cy="36" r="1.8" fill="#ffd34d" />
    </>
  )
}

const BILDER = {
  woerter: (
    <>
      <g transform="rotate(-12 28 42)">
        <rect x="12" y="26" width="30" height="36" rx="7" fill={F.dunkel} />
        <rect x="12" y="23" width="30" height="36" rx="7" fill={F.haupt} />
        <text x="27" y="46" textAnchor="middle" fontFamily="Nunito, system-ui, sans-serif" fontWeight="900" fontSize="14" fill="#fff">Aa</text>
      </g>
      <g transform="rotate(10 50 44)">
        <rect x="36" y="28" width="30" height="36" rx="7" fill={F.hell} />
        <rect x="36" y="25" width="30" height="36" rx="7" fill="#fff" />
        <rect x="42" y="36" width="18" height="4" rx="2" fill={F.hell} />
        <rect x="42" y="44" width="12" height="4" rx="2" fill={F.hell} />
        <path d="M41 30q4-3 9-3" stroke={F.creme} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </g>
    </>
  ),
  saetze: (
    <>
      <rect x="10" y="22" width="56" height="34" rx="13" fill={F.dunkel} transform="translate(0 4)" />
      <rect x="10" y="22" width="56" height="34" rx="13" fill={F.haupt} />
      <path d="M22 54l-5 12 15-9z" fill={F.haupt} />
      <rect x="19" y="32" width="34" height="5" rx="2.5" fill="#fff" />
      <rect x="19" y="41" width="24" height="5" rx="2.5" fill="#fff" opacity=".75" />
      <path d="M17 27q5-3 12-3" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity=".6" />
    </>
  ),
  texte: (
    <>
      <path d="M8 34Q40 28 72 34L72 66Q40 59 8 66Z" fill={F.dunkel} />
      <path d="M8 31Q40 25 72 31L72 63Q40 56 8 63Z" fill={F.haupt} />
      <path d="M12 26Q26 19 39 26L39 58Q26 51 12 58Z" fill={F.creme} />
      <path d="M41 26Q54 19 68 26L68 58Q54 51 41 58Z" fill="#fff" />
      <path d="M17 32Q26 28 34 32M17 39Q26 35 34 39M17 46Q26 42 31 45" stroke={F.hell} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M46 32Q54 28 63 32M46 39Q54 35 63 39M46 46Q54 42 58 44" stroke={F.hell} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </>
  ),
  // Übungsgenerator (17.11.2026): Aufgabenblatt mit Häkchen, davor ein goldener Stern
  uebungen: (
    <>
      <rect x="14" y="20" width="46" height="46" rx="9" fill={F.dunkel} />
      <rect x="14" y="17" width="46" height="46" rx="9" fill="#fff" />
      <rect x="28" y="12" width="18" height="10" rx="5" fill={F.haupt} />
      <circle cx="24" cy="32" r="4.5" fill="#2aae5f" />
      <path d="M21.8 32l1.7 1.8 3-3.4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="32" y="29.5" width="22" height="5" rx="2.5" fill={F.hell} />
      <circle cx="24" cy="43" r="4.5" fill="#2aae5f" />
      <path d="M21.8 43l1.7 1.8 3-3.4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="32" y="40.5" width="17" height="5" rx="2.5" fill={F.hell} />
      <circle cx="24" cy="54" r="4.5" fill="none" stroke={F.haupt} strokeWidth="2" />
      <rect x="32" y="51.5" width="20" height="5" rx="2.5" fill={F.haupt} opacity=".45" />
      <path d="M61 42l3.5 7.6 8.3 1-6.1 5.7 1.6 8.2-7.3-4.1-7.3 4.1 1.6-8.2-6.1-5.7 8.3-1z" fill="#d19b00" transform="translate(0 2.5)" />
      <path d="M61 42l3.5 7.6 8.3 1-6.1 5.7 1.6 8.2-7.3-4.1-7.3 4.1 1.6-8.2-6.1-5.7 8.3-1z" fill="#ffd34d" />
    </>
  ),
  // Verb-Generator (16.11.2026): Tabellenkarte mit Personen und Formen,
  // davor die goldene „Wechsel“-Münze – hier wird durchkonjugiert
  verben: (
    <>
      <rect x="12" y="24" width="50" height="42" rx="9" fill={F.dunkel} />
      <rect x="12" y="21" width="50" height="42" rx="9" fill="#fff" />
      <path d="M12 30a9 9 0 0 1 9-9h32a9 9 0 0 1 9 9v5H12z" fill={F.haupt} />
      <text x="37" y="31.5" textAnchor="middle" fontFamily="Nunito, system-ui, sans-serif" fontWeight="900" fontSize="8.5" fill="#fff">yo · tú</text>
      <rect x="17" y="39.5" width="11" height="5.5" rx="2.75" fill={F.haupt} />
      <rect x="31" y="39.5" width="24" height="5.5" rx="2.75" fill={F.hell} />
      <rect x="17" y="48" width="11" height="5.5" rx="2.75" fill={F.haupt} opacity=".65" />
      <rect x="31" y="48" width="18" height="5.5" rx="2.75" fill={F.hell} />
      <rect x="17" y="56.5" width="11" height="4" rx="2" fill={F.haupt} opacity=".35" />
      <circle cx="61" cy="56" r="12.5" fill="#d19b00" />
      <circle cx="61" cy="53.5" r="12.5" fill="#ffd34d" />
      <path d="M54.6 52.6a6.6 6.6 0 0 1 11.3-3.4" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M67.9 45.6l-.3 5.4-5-1.9z" fill="#fff" />
      <path d="M67.4 54.4a6.6 6.6 0 0 1-11.3 3.4" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M54.1 61.4l.3-5.4 5 1.9z" fill="#fff" />
    </>
  ),
}

export default function ZauberBild({ art }) {
  return (
    <span className="zauber-bild" aria-hidden="true">
      <Sockel />
      <svg className="zauber-figur" viewBox="0 0 80 72">
        {BILDER[art]}
        <Funken />
      </svg>
    </span>
  )
}
