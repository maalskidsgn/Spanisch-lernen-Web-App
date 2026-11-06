import { INSEL_TOENE } from './Rangliste.jsx'

/**
 * Die Modul-Bilder: je Modul ein Toon-Emblem auf einer Trommel, im
 * selben Comic-3D-Stil wie die Start-Karten (StartInseln.jsx).
 *
 * Die Embleme liegen als fertiges SVG-Markup vor (eigene Zeichnungen,
 * keine Nutzereingaben) – deshalb dangerouslySetInnerHTML. Gezeichnet
 * im Entwurf vom 06.11.2026; Habloo-Farben schon eingesetzt.
 * Fehlt ein Bild, bleibt das Emoji des Moduls stehen.
 */
const BILDER = {
  "m1": "<ellipse cx=\"40\" cy=\"74\" rx=\"24\" ry=\"4.2\" fill=\"#000\" opacity=\".13\"/><path d=\"M22 50 h36 l-4 20 a4 4 0 0 1 -4 3 h-20 a4 4 0 0 1 -4 -3 z\" fill=\"#ff7a12\"/><path d=\"M40 50 h18 l-4 20 a4 4 0 0 1 -4 3 h-10 z\" fill=\"#d95c00\"/><rect x=\"19\" y=\"45\" width=\"42\" height=\"9\" rx=\"4\" fill=\"#d95c00\"/><rect x=\"19\" y=\"44\" width=\"42\" height=\"7\" rx=\"3.5\" fill=\"#ff7a12\"/><rect x=\"23\" y=\"45.5\" width=\"16\" height=\"3\" rx=\"1.5\" fill=\"#fff\" opacity=\".35\"/> <path d=\"M40 45 V30\" stroke=\"#d95c00\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M40 33 C28 33 20 26 20 15 C32 15 40 22 40 33 Z\" fill=\"#ffb062\"/><path d=\"M40 33 C28 33 20 26 20 15 C26 22 34 27 40 33 Z\" fill=\"#d95c00\"/><path d=\"M40 30 C50 30 60 24 61 12 C49 12 41 19 40 30 Z\" fill=\"#ffd09a\"/><path d=\"M40 30 C47 24 54 18 61 12 C60 22 52 29 40 30 Z\" fill=\"#ffb062\"/>",
  "m2": "<ellipse cx=\"40\" cy=\"74\" rx=\"24\" ry=\"4.2\" fill=\"#000\" opacity=\".13\"/><path d=\"M30 12 q-4 5 0 10 q4 5 0 10 M40 9 q-4 5 0 10 q4 5 0 10\" stroke=\"#ffd9b3\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"38\" cy=\"68\" rx=\"28\" ry=\"6\" fill=\"#d95c00\"/><ellipse cx=\"38\" cy=\"66\" rx=\"28\" ry=\"6\" fill=\"#fff6ec\"/> <path d=\"M58 42 a10 10 0 1 1 0 16\" stroke=\"#d95c00\" stroke-width=\"5\" fill=\"none\"/><path d=\"M18 36 h40 v18 a14 14 0 0 1 -14 14 h-12 a14 14 0 0 1 -14 -14 z\" fill=\"#ff7a12\"/><path d=\"M38 36 h20 v18 a14 14 0 0 1 -14 14 h-6 z\" fill=\"#d95c00\"/><ellipse cx=\"38\" cy=\"36\" rx=\"20\" ry=\"5\" fill=\"#6b3a1e\"/><ellipse cx=\"34\" cy=\"35\" rx=\"9\" ry=\"2\" fill=\"#a0602e\"/><rect x=\"22\" y=\"42\" width=\"5\" height=\"16\" rx=\"2.5\" fill=\"#fff\" opacity=\".35\"/>",
  "m3": "<ellipse cx=\"40\" cy=\"74\" rx=\"24\" ry=\"4.2\" fill=\"#000\" opacity=\".13\"/><g transform=\"rotate(-12 28 46)\"><path d=\"M16 22 h22 l-3 30 a6 6 0 0 1 -6 5 h-4 a6 6 0 0 1 -6 -5 z\" fill=\"#fff6ec\"/><path d=\"M18 34 h18 l-1.8 17 a5 5 0 0 1 -5 4 h-4 a5 5 0 0 1 -5 -4 z\" fill=\"#ff7a12\"/><rect x=\"25\" y=\"56\" width=\"4\" height=\"10\" fill=\"#ffd9b3\"/><rect x=\"19\" y=\"65\" width=\"16\" height=\"4\" rx=\"2\" fill=\"#ffd9b3\"/><rect x=\"19\" y=\"24\" width=\"4\" height=\"12\" rx=\"2\" fill=\"#fff\" opacity=\".7\"/></g> <g transform=\"rotate(12 52 46)\"><path d=\"M41 22 h22 l-3 30 a6 6 0 0 1 -6 5 h-4 a6 6 0 0 1 -6 -5 z\" fill=\"#fff6ec\"/><path d=\"M43 34 h18 l-1.8 17 a5 5 0 0 1 -5 4 h-4 a5 5 0 0 1 -5 -4 z\" fill=\"#2e3192\"/><rect x=\"50\" y=\"56\" width=\"4\" height=\"10\" fill=\"#ffd9b3\"/><rect x=\"44\" y=\"65\" width=\"16\" height=\"4\" rx=\"2\" fill=\"#ffd9b3\"/><rect x=\"44\" y=\"24\" width=\"4\" height=\"12\" rx=\"2\" fill=\"#fff\" opacity=\".7\"/></g> <path d=\"M40 8 v7 M33 11 l3 5 M47 11 l-3 5\" stroke=\"#ffc93c\" stroke-width=\"3\" stroke-linecap=\"round\"/>",
  "m4": "<ellipse cx=\"40\" cy=\"74\" rx=\"24\" ry=\"4.2\" fill=\"#000\" opacity=\".13\"/><path d=\"M30 22 v-5 a5 5 0 0 1 5 -5 h10 a5 5 0 0 1 5 5 v5\" stroke=\"#1f2168\" stroke-width=\"4.5\" fill=\"none\"/><rect x=\"12\" y=\"24\" width=\"56\" height=\"46\" rx=\"9\" fill=\"#d95c00\"/><rect x=\"12\" y=\"22\" width=\"56\" height=\"44\" rx=\"9\" fill=\"#ff7a12\"/><rect x=\"40\" y=\"22\" width=\"28\" height=\"44\" rx=\"9\" fill=\"#d95c00\" opacity=\".35\"/> <rect x=\"22\" y=\"22\" width=\"6\" height=\"44\" fill=\"#2e3192\"/><rect x=\"52\" y=\"22\" width=\"6\" height=\"44\" fill=\"#2e3192\"/><rect x=\"16\" y=\"26\" width=\"18\" height=\"5\" rx=\"2.5\" fill=\"#fff\" opacity=\".35\"/><circle cx=\"40\" cy=\"44\" r=\"7\" fill=\"#fff6ec\"/><path d=\"M36.5 44 l2.5 2.5 l4.5 -5\" stroke=\"#ff7a12\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>",
  "m5": "<ellipse cx=\"40\" cy=\"74\" rx=\"24\" ry=\"4.2\" fill=\"#000\" opacity=\".13\"/><g transform=\"rotate(-10 34 42)\"><rect x=\"12\" y=\"16\" width=\"36\" height=\"42\" rx=\"4\" fill=\"#ffd9b3\"/><rect x=\"16\" y=\"20\" width=\"28\" height=\"26\" rx=\"2\" fill=\"#2e3192\"/></g> <g transform=\"rotate(8 46 42)\"><rect x=\"28\" y=\"18\" width=\"38\" height=\"46\" rx=\"4\" fill=\"#fff\"/><rect x=\"32\" y=\"22\" width=\"30\" height=\"28\" rx=\"2\" fill=\"#ffd9b3\"/><circle cx=\"54\" cy=\"30\" r=\"5\" fill=\"#ffd34d\"/><path d=\"M32 50 l9 -12 l7 8 l5 -5 l9 9 z\" fill=\"#ff7a12\"/><path d=\"M32 50 l9 -12 l4 5 l-6 7 z\" fill=\"#d95c00\"/><rect x=\"36\" y=\"54\" width=\"18\" height=\"3.5\" rx=\"1.75\" fill=\"#ffd9b3\"/></g>",
  "m6": "<ellipse cx=\"40\" cy=\"74\" rx=\"24\" ry=\"4.2\" fill=\"#000\" opacity=\".13\"/><path d=\"M8 70 Q22 60 40 63 Q58 60 72 70 Z\" fill=\"#ffd98a\"/><path d=\"M8 70 Q40 64 72 70 Z\" fill=\"#f5c460\"/> <path d=\"M14 64 q6 -5 12 0 q6 5 12 0\" stroke=\"#2e3192\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M42 30 L36 68\" stroke=\"#1f2168\" stroke-width=\"3.5\" stroke-linecap=\"round\"/> <path d=\"M14 30 Q42 4 70 30 Z\" fill=\"#ff7a12\"/><path d=\"M14 30 Q24 22 28 30 Q36 20 42 30 Q50 20 56 30 Q62 22 70 30 Z\" fill=\"#d95c00\"/><path d=\"M28 30 Q34 10 42 8 Q38 18 42 30 Z\" fill=\"#fff6ec\"/><path d=\"M56 30 Q52 12 42 8 Q50 16 56 30 Z\" fill=\"#fff6ec\"/><circle cx=\"64\" cy=\"12\" r=\"6\" fill=\"#ffd34d\"/>",
  "m7": "<ellipse cx=\"40\" cy=\"74\" rx=\"24\" ry=\"4.2\" fill=\"#000\" opacity=\".13\"/><path d=\"M30 24 v-6 a4 4 0 0 1 4 -4 h12 a4 4 0 0 1 4 4 v6\" stroke=\"#1f2168\" stroke-width=\"4.5\" fill=\"none\"/><rect x=\"10\" y=\"26\" width=\"60\" height=\"44\" rx=\"8\" fill=\"#1f2168\"/><rect x=\"10\" y=\"24\" width=\"60\" height=\"42\" rx=\"8\" fill=\"#2e3192\"/> <path d=\"M10 40 h60\" stroke=\"#1f2168\" stroke-width=\"3\"/><rect x=\"34\" y=\"36\" width=\"12\" height=\"9\" rx=\"2.5\" fill=\"#ff7a12\"/><rect x=\"14\" y=\"27\" width=\"20\" height=\"5\" rx=\"2.5\" fill=\"#fff\" opacity=\".25\"/> <g transform=\"rotate(10 58 22)\"><rect x=\"46\" y=\"8\" width=\"24\" height=\"24\" rx=\"4\" fill=\"#fff\"/><rect x=\"46\" y=\"8\" width=\"24\" height=\"7\" rx=\"3\" fill=\"#ff7a12\"/><path d=\"M52 23 l3.5 3.5 l7 -7\" stroke=\"#1fb27a\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g>"
}

function Trommel() {
  const [hell, oben, links, mitte, rechts, tief] = INSEL_TOENE.zweiter
  return (
    <svg className="mb-sockel" viewBox="0 0 120 64" aria-hidden="true">
      <path d="M8 22 V40 Q60 62 112 40 V22 Z" fill={mitte} />
      <path d="M60 51 Q90 50 112 40 V22 Q90 34 60 36 Z" fill={rechts} />
      <path d="M8 22 V40 Q22 46 30 47.5 V30 Q16 27 8 22 Z" fill={links} />
      <path d="M8 40 Q60 62 112 40 V44 Q60 66 8 44 Z" fill={tief} />
      <ellipse cx="60" cy="22" rx="52" ry="14" fill={oben} />
      <ellipse cx="55" cy="19" rx="35" ry="8" fill={hell} />
      <path d="M22 17 Q32 11 46 10.5" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity=".85" />
    </svg>
  )
}

export default function ModulBild({ modul }) {
  const bild = BILDER[modul?.id]
  if (!bild) return modul?.emoji ?? null
  return (
    <span className="mb">
      <Trommel />
      <svg className="mb-emblem" viewBox="0 0 80 80" aria-hidden="true" dangerouslySetInnerHTML={{ __html: bild }} />
    </span>
  )
}
