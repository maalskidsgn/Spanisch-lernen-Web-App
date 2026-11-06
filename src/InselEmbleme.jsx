/**
 * Die Embleme, die auf den schwebenden Inseln der Startseite stehen.
 *
 * Gleicher Stil wie die Inseln selbst: Toon ohne Kontur, flache
 * Flächen mit einer hellen und einer dunklen Seite, damit sie wie
 * kleine 3D-Figuren wirken. Die Farben kommen als Satz herein, so
 * passt dieselbe Datei in Habloo (Orange) und Davaigo (Violett).
 */

export const FARBEN_HABLOO = {
  haupt: '#ff7a12',
  dunkel: '#d95c00',
  hell: '#ffd9b3',
  creme: '#fff6ec',
  tief: '#2e3192',
  tiefDunkel: '#1f2168',
}

function Schatten() {
  return <ellipse cx="40" cy="74" rx="24" ry="4.2" fill="#000" opacity=".13" />
}

function Lektionen({ f }) {
  return (
    <>
      <Schatten />
      {/* zwei Bücher */}
      <rect x="12" y="56" width="56" height="16" rx="4" fill={f.haupt} />
      <rect x="12" y="65" width="56" height="7" rx="3.5" fill={f.dunkel} />
      <rect x="17" y="58.5" width="49" height="6" rx="2" fill={f.creme} />
      <rect x="18" y="44" width="46" height="13.5" rx="4" fill={f.tief} />
      <rect x="18" y="51.5" width="46" height="6" rx="3" fill={f.tiefDunkel} />
      <rect x="23" y="46.5" width="39" height="5" rx="2" fill={f.creme} />
      {/* Doktorhut */}
      <path d="M26 31 v10 q14 7.5 28 0 v-10 z" fill={f.tiefDunkel} />
      <path d="M40 15 L73 28 L40 41 L7 28 Z" fill={f.tief} />
      <path d="M40 15 L73 28 L40 27 L7 28 Z" fill="#fff" opacity=".16" />
      <path d="M40 28 L64 34 L64 46" stroke={f.haupt} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="64" cy="48" r="4" fill={f.haupt} />
      <circle cx="40" cy="28" r="2.8" fill={f.haupt} />
    </>
  )
}

function Trainer({ f }) {
  return (
    <>
      <Schatten />
      <rect x="15" y="22" width="38" height="48" rx="8" fill={f.haupt} transform="rotate(-14 34 46)" />
      <rect x="27" y="20" width="38" height="48" rx="8" fill={f.hell} transform="rotate(10 46 44)" />
      <rect x="19" y="20" width="42" height="52" rx="9" fill={f.creme} />
      <rect x="19" y="62" width="42" height="10" rx="5" fill={f.hell} />
      <text x="40" y="54" textAnchor="middle" fontFamily="Nunito, system-ui, sans-serif" fontWeight="900" fontSize="22" fill={f.tief}>Aa</text>
      <circle cx="58" cy="23" r="10" fill="#1fb27a" />
      <path d="M53.5 23.5 l3.2 3.2 l6.2 -6.6" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  )
}

function Youtube() {
  return (
    <>
      <Schatten />
      <rect x="9" y="25" width="62" height="45" rx="15" fill="#b8191a" />
      <rect x="9" y="17" width="62" height="45" rx="15" fill="#ff3b30" />
      <rect x="16" y="22" width="30" height="7" rx="3.5" fill="#fff" opacity=".28" />
      <path d="M35 30 L52 39.5 L35 49 Z" fill="#fff" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
    </>
  )
}

function Spiele({ f }) {
  return (
    <>
      <Schatten />
      {/* großer Würfel */}
      <path d="M36 12 L58 23 L36 34 L14 23 Z" fill={f.creme} />
      <path d="M14 23 L36 34 L36 60 L14 49 Z" fill={f.hell} />
      <path d="M36 34 L58 23 L58 49 L36 60 Z" fill={f.haupt} />
      <ellipse cx="36" cy="23" rx="3.6" ry="2.1" fill={f.haupt} />
      <ellipse cx="21" cy="35" rx="2.4" ry="3.2" fill={f.dunkel} />
      <ellipse cx="29" cy="48" rx="2.4" ry="3.2" fill={f.dunkel} />
      <ellipse cx="42" cy="47" rx="2.4" ry="3.2" fill="#fff" />
      <ellipse cx="47" cy="40.5" rx="2.4" ry="3.2" fill="#fff" />
      <ellipse cx="52.5" cy="34" rx="2.4" ry="3.2" fill="#fff" />
      {/* kleiner Würfel */}
      <path d="M60 44 L72 50 L60 56 L48 50 Z" fill={f.tief} opacity=".85" />
      <path d="M48 50 L60 56 L60 70 L48 64 Z" fill={f.tiefDunkel} />
      <path d="M60 56 L72 50 L72 64 L60 70 Z" fill={f.tief} />
      <ellipse cx="60" cy="50" rx="2.2" ry="1.3" fill="#fff" />
      <ellipse cx="66" cy="60" rx="1.7" ry="2.2" fill="#fff" />
      <ellipse cx="54" cy="60" rx="1.7" ry="2.2" fill="#fff" opacity=".8" />
    </>
  )
}

function Saetze({ f }) {
  return (
    <>
      <Schatten />
      {/* hintere Blase */}
      <rect x="30" y="13" width="42" height="30" rx="11" fill={f.tief} />
      <path d="M58 41 l8 10 l-1 -10 z" fill={f.tief} />
      <circle cx="42" cy="28" r="3" fill="#fff" />
      <circle cx="51" cy="28" r="3" fill="#fff" />
      <circle cx="60" cy="28" r="3" fill="#fff" />
      {/* vordere Blase */}
      <rect x="8" y="34" width="48" height="32" rx="12" fill={f.dunkel} transform="translate(0 4)" />
      <rect x="8" y="34" width="48" height="32" rx="12" fill={f.haupt} />
      <path d="M18 64 l-6 10 l14 -8 z" fill={f.haupt} />
      <rect x="16" y="43" width="26" height="5.5" rx="2.75" fill={f.creme} />
      <rect x="16" y="52" width="32" height="5.5" rx="2.75" fill={f.creme} opacity=".75" />
    </>
  )
}

function Texte({ f }) {
  return (
    <>
      <Schatten />
      <path d="M8 36 Q40 30 72 36 L72 70 Q40 63 8 70 Z" fill={f.dunkel} />
      <path d="M8 33 Q40 27 72 33 L72 67 Q40 60 8 67 Z" fill={f.haupt} />
      <path d="M12 28 Q26 21 39 28 L39 62 Q26 55 12 62 Z" fill={f.creme} />
      <path d="M41 28 Q54 21 68 28 L68 62 Q54 55 41 62 Z" fill="#fff" />
      <path d="M17 34 Q26 30 34 34 M17 41 Q26 37 34 41 M17 48 Q26 44 31 47" stroke={f.hell} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M46 34 Q54 30 63 34 M46 41 Q54 37 63 41 M46 48 Q54 44 58 46" stroke={f.hell} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M55 58 v16 l3.5 -3.5 l3.5 3.5 v-17 z" fill={f.tief} />
    </>
  )
}

function Habla({ f }) {
  return (
    <>
      <Schatten />
      <path d="M13 26 q-6 10 0 20 M7 21 q-9 15 0 30" stroke={f.haupt} strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7" />
      <path d="M67 26 q6 10 0 20 M73 21 q9 15 0 30" stroke={f.haupt} strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7" />
      <path d="M22 36 a18 18 0 0 0 36 0" stroke={f.dunkel} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <rect x="37.5" y="53" width="5" height="11" rx="2" fill={f.dunkel} />
      <ellipse cx="40" cy="67" rx="14" ry="4.5" fill={f.dunkel} />
      <ellipse cx="40" cy="65" rx="14" ry="4.5" fill={f.haupt} />
      <rect x="28" y="10" width="24" height="38" rx="12" fill={f.tiefDunkel} />
      <rect x="28" y="10" width="21" height="38" rx="10.5" fill={f.tief} />
      <path d="M32 20 h14 M32 26 h14 M32 32 h14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".35" />
      <rect x="31" y="13" width="6" height="12" rx="3" fill="#fff" opacity=".3" />
    </>
  )
}

function Duell({ f }) {
  return (
    <>
      <Schatten />
      <path d="M40 10 L66 19 V38 Q66 60 40 72 Q14 60 14 38 V19 Z" fill={f.tiefDunkel} />
      <path d="M40 10 L66 19 V38 Q66 60 40 72 Z" fill={f.tief} opacity=".55" />
      <path d="M40 16 L60 23 V38 Q60 55 40 65 Q20 55 20 38 V23 Z" fill={f.tief} />
      <path d="M45 21 L30 43 H40 L35 61 L52 36 H42 L47 21 Z" fill="#c98a00" transform="translate(1.5 2)" />
      <path d="M45 21 L30 43 H40 L35 61 L52 36 H42 L47 21 Z" fill="#ffcf3f" />
      <path d="M45 21 L37 33 H41 L47 21 Z" fill="#fff" opacity=".45" />
    </>
  )
}

const ARTEN = {
  lektionen: Lektionen,
  trainer: Trainer,
  youtube: Youtube,
  spiele: Spiele,
  saetze: Saetze,
  texte: Texte,
  habla: Habla,
  duell: Duell,
}

export default function InselEmblem({ art, farben = FARBEN_HABLOO, klasse = '' }) {
  const Bild = ARTEN[art]
  if (!Bild) return null
  return (
    <svg className={'insel-emblem ' + klasse} viewBox="0 0 80 80" aria-hidden="true">
      <Bild f={farben} />
    </svg>
  )
}
