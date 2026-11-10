// Level-Embleme im 3D-Toon-Stil (Manuel, 10.11.2026): flache Farben,
// dunkle Unterkante, Glanzstrich – keine Verläufe, keine Schatten.
// Neuling–Großmeister: Medaille am Band (Champagner → Bronze → Silber → Gold),
// ab Legende Kristall-Stern mit Flügeln, Sol als Ziel ganz oben.
// Bewegung steckt als SMIL im SVG und wächst mit der Stufe:
// Lichtstreif → Funkeln → drehender Strahlenkranz → Schweben → Puls (Sol).
// Erzeugt als Text, damit LevelEmblem.jsx es pro Level nur einmal baut.
// Idee A im 3D-Toon-Stil (10.11.2026): flache Farben, dunkle Unterkante, Glanzstrich – keine Verläufe.
const STUFEN = [
  [1, 'Neuling', 'keim'], [3, 'Anfänger', 'blatt'], [5, 'Entdecker', 'kompass'], [8, 'Lerner', 'buch'],
  [12, 'Kenner', 'stern'], [16, 'Könner', 'blitz'], [20, 'Profi', 'haken'], [25, 'Experte', 'diamant'],
  [30, 'Meister', 'krone'], [40, 'Großmeister', 'grosseKrone'], [50, 'Legende', 'fluegel'], [60, 'Mythos', 'komet'],
  [70, 'Titan', 'berg'], [85, 'Unsterblich', 'unendlich'], [100, 'SOL', 'sol'],
]
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
  kompass: ['M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18z', 'M15.8 8.2l-2.3 5.3-5.3 2.3 2.3-5.3z'],
  haken: ['M5 12.5l4.5 4.5L19 7'],
  unendlich: ['M7.5 8.3a3.7 3.7 0 0 0 0 7.4c3.6 0 5.4-7.4 9-7.4a3.7 3.7 0 0 1 0 7.4c-3.6 0-5.4-7.4-9-7.4z'],
}
// Symbol mit eigener Unterkante (Toon)
function sym(name, farbe, kante, x = 50, y = 50, s = 1.3) {
  const t = (dy) => `translate(${x - 12 * s} ${y - 12 * s + dy}) scale(${s})`
  const einmal = (f, dy) => LINIE[name]
    ? `<g transform="${t(dy)}" fill="none" stroke="${f}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${LINIE[name].map((d, i) => `<path d="${d}"${name === 'kompass' && i === 1 ? ` fill="${f}" stroke="none"` : ''}/>`).join('')}</g>`
    : `<path transform="${t(dy)}" d="${FLAECHE[name]}" fill="${f}" stroke="${f}" stroke-width="1.2" stroke-linejoin="round"/>`
  return einmal(kante, 1.6) + einmal(farbe, 0)
}
// ---------- Bewegung (SMIL, steckt im SVG selbst – keine CSS nötig) ----------
let funkeNr = 0, glanzNr = 0
const funkeln_ = () => { const d = ((funkeNr++ * 0.53) % 2.1).toFixed(2); return `<animateTransform attributeName="transform" type="scale" values=".55;1.2;.55" dur="2.1s" begin="-${d}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.5;1" keySplines=".45 0 .55 1;.45 0 .55 1"/><animate attributeName="opacity" values=".55;1;.55" dur="2.1s" begin="-${d}s" repeatCount="indefinite"/>` }
const drehen = (dauer, cy = 50) => dauer ? `<animateTransform attributeName="transform" type="rotate" from="0 50 ${cy}" to="360 50 ${cy}" dur="${dauer}s" repeatCount="indefinite"/>` : ''
// Lichtstreif, der über den Körper zieht (auf die Form zugeschnitten)
function lichtstreif(form, dauer, staerke) {
  const id = aktId + 'g' + (glanzNr++)
  return `<clipPath id="${id}">${form}</clipPath><g clip-path="url(#${id})"><g transform="skewX(-22)"><rect x="-10" y="-20" width="13" height="150" fill="#fff" opacity="${staerke}"><animateTransform attributeName="transform" type="translate" values="-30 0;150 0;150 0" keyTimes="0;.28;1" dur="${dauer}s" repeatCount="indefinite" calcMode="spline" keySplines=".5 0 .5 1;0 0 1 1"/></rect><rect x="8" y="-20" width="4" height="150" fill="#fff" opacity="${staerke * .7}"><animateTransform attributeName="transform" type="translate" values="-30 0;150 0;150 0" keyTimes="0;.28;1" dur="${dauer}s" repeatCount="indefinite" calcMode="spline" keySplines=".5 0 .5 1;0 0 1 1"/></rect></g></g>`
}
// Lebendigkeit je Stufe (0 Neuling … 14 Sol): je höher, desto öfter und heller
const LEBEN = (i) => ({
  streif: i < 4 ? [9, .28] : i < 7 ? [6.5, .42] : i < 10 ? [4.8, .55] : i < 14 ? [3.8, .65] : [3, .75],
  dreh: i < 7 ? 0 : i < 10 ? 46 - (i - 7) * 4 : i < 14 ? 30 : 20,
  schweben: i >= 10,
})
const schweben = (inhalt, hub, dauer) => `<g>${inhalt}<animateTransform attributeName="transform" type="translate" values="0 0;0 -${hub};0 0" dur="${dauer}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.5;1" keySplines=".45 0 .55 1;.45 0 .55 1"/></g>`

const FUNKE = (x, y, s = 1, f = '#ffd54a', k = '#d39500') => `<g transform="translate(${x} ${y}) scale(${s})"><g>${funkeln_()}<path d="M0-6c1 3.8 2.2 5 6 6-3.8 1-5 2.2-6 6-1-3.8-2.2-5-6-6 3.8-1 5-2.2 6-6z" fill="${k}" transform="translate(0 1.2)"/><path d="M0-6c1 3.8 2.2 5 6 6-3.8 1-5 2.2-6 6-1-3.8-2.2-5-6-6 3.8-1 5-2.2 6-6z" fill="${f}"/></g></g>`
const poly = (n, r, cx = 50, cy = 50, dreh = -90) => Array.from({ length: n }, (_, i) => { const a = (dreh + i * 360 / n) * Math.PI / 180; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}` }).join(' ')
const stern = (z, ra, ri, cx = 50, cy = 50, dreh = 0) => Array.from({ length: z * 2 }, (_, i) => { const a = (-90 + dreh + i * 180 / z) * Math.PI / 180; const r = i % 2 ? ri : ra; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}` }).join(' ')
const nach = (pts, dy) => pts.split(' ').map((p) => { const [x, y] = p.split(','); return `${x},${(+y + dy).toFixed(1)}` }).join(' ')
// Toon-Körper: Unterkante (dunkel, nach unten versetzt) + Fläche + innere Fläche + Glanzstrich
function toonPoly(pts, haupt, kante, innen, innenPts, glanz = true, tiefe = 5) {
  return `<polygon points="${nach(pts, tiefe)}" fill="${kante}" stroke="${kante}" stroke-width="3" stroke-linejoin="round"/>` +
    `<polygon points="${pts}" fill="${haupt}" stroke="${haupt}" stroke-width="3" stroke-linejoin="round"/>` +
    (innenPts ? `<polygon points="${innenPts}" fill="${innen}" stroke="${innen}" stroke-width="2" stroke-linejoin="round"/>` : '')
}
const glanzstrich = (d) => `<path d="${d}" stroke="#fff" stroke-width="3.6" stroke-linecap="round" fill="none" opacity=".85"/>`

// Flache Farbtöne: [hell(innen), haupt, kante]
const FARBEN = {
  habloo: [
    ['#ffcfae', '#ff9a5c', '#d96b2c'], ['#bff0cf', '#4ccb7f', '#2a9a5a'], ['#bdf0e4', '#33c2a3', '#1d8f78'], ['#cfe5ff', '#4d9cf5', '#2a6fc4'],
    ['#d6d9ff', '#6f7cf7', '#4650c9'], ['#ffd2e4', '#f06aa0', '#c24277'], ['#ffd9b3', '#ff8a2b', '#cc5f0a'],
    ['#cdeefc', '#3fa6d8', '#24779f'], ['#fff0b0', '#ffc72e', '#d99a00'], ['#ffd0c7', '#f2604a', '#c23a26'],
    ['#e4dbff', '#8a6cf5', '#5f43c9'], ['#d6dcff', '#5566e0', '#3542ad'], ['#ffd3ea', '#e85aa8', '#b8357c'], ['#c9f5ea', '#2fbf9c', '#1c8a70'],
  ],
}
FARBEN.davaigo = [['#e2dbff', '#8a6cf5', '#5f43c9'], ...FARBEN.habloo.slice(1)]
const METALL = { bronze: ['#f3b483', '#d98a4e', '#a85f2c'], silber: ['#f4f7fb', '#c9d2de', '#8d99ab'], gold: ['#fff0a6', '#ffcb2e', '#d39500'] }

const lorbeer = (seite) => {
  const s = seite === 'l' ? -1 : 1, out = []
  for (let k = 0; k < 5; k++) {
    const a = (115 + k * 26) * Math.PI / 180
    const x = 50 + s * 40 * Math.sin(a), y = 54 - 40 * Math.cos(a)
    const r = (s * (k * 26 + 25)).toFixed(0)
    out.push(`<ellipse cx="${x.toFixed(1)}" cy="${(y + 1.6).toFixed(1)}" rx="7" ry="3.4" transform="rotate(${r} ${x.toFixed(1)} ${(y + 1.6).toFixed(1)})" fill="#2a9a5a"/><ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7" ry="3.4" transform="rotate(${r} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#5fd38a"/>`)
  }
  return out.join('')
}
const krone = (y = 0, g = METALL.gold) => {
  const pts = `33,${21 + y} 37,${8 + y} 44,${15 + y} 50,${4 + y} 56,${15 + y} 63,${8 + y} 67,${21 + y}`
  return `<polygon points="${nach(pts, 3)}" fill="${g[2]}" stroke="${g[2]}" stroke-width="3" stroke-linejoin="round"/><polygon points="${pts}" fill="${g[1]}" stroke="${g[1]}" stroke-width="3" stroke-linejoin="round"/><rect x="34" y="${16 + y}" width="32" height="5" rx="2" fill="${g[0]}"/><circle cx="50" cy="${5 + y}" r="3" fill="#ff5c8a"/><circle cx="37" cy="${9 + y}" r="2.3" fill="#5ab8ff"/><circle cx="63" cy="${9 + y}" r="2.3" fill="#5ab8ff"/>`
}
const fluegel = (haupt, kante, gross = 1) => {
  const d = 'M32 46 C20 42 9 34 3 22 C5 34 6 44 12 52 C8 52 5 51 2 49 C7 58 15 63 23 61 C21 64 18 65 15 65 C23 70 32 66 37 58 Z'
  const f = (s, dy, fill) => `<path transform="translate(50 ${50 + dy}) scale(${s * gross} ${gross}) translate(-50 -50)" d="${d}" fill="${fill}" stroke="${fill}" stroke-width="2.5" stroke-linejoin="round"/>`
  const feder = (s) => `<path transform="translate(50 50) scale(${s * gross} ${gross}) translate(-50 -50)" d="M10 36 C16 42 24 45 31 47 M10 48 C16 52 23 54 30 54" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".75"/>`
  return f(1, 4, kante) + f(-1, 4, kante) + f(1, 0, haupt) + f(-1, 0, haupt) + feder(1) + feder(-1)
}
const strahlen = (a, b, kante, z = 16, ra = 50, ri = 35, cy = 50, dauer = 0) => {
  const pts = stern(z, ra, ri, 50, cy)
  // abwechselnd zwei Farben: einzelne Zacken als Dreiecke
  const teile = []
  for (let i = 0; i < z; i++) {
    const w = (k) => (-90 + k * 180 / z) * Math.PI / 180
    const p = (k, r) => `${(50 + r * Math.cos(w(k))).toFixed(1)},${(cy + r * Math.sin(w(k))).toFixed(1)}`
    teile.push(`<polygon points="50,${cy} ${p(2 * i - 1, ri)} ${p(2 * i, ra)} ${p(2 * i + 1, ri)}" fill="${i % 2 ? b : a}"/>`)
  }
  return `<g transform="translate(0 4)"><g><polygon points="${pts}" fill="${kante}"/>${drehen(dauer, cy)}</g></g><g>${teile.join('')}${drehen(dauer, cy)}</g>`
}

function emblem(i, symbol, F) {
  if (symbol === 'sol') return sol(F)
  const [hell, haupt, kante] = F[i]
  let hinten = '', koerper = '', vorne = '', sy = 50
  if (i < 4) { // Toon-Münze
    koerper = `<circle cx="50" cy="55" r="31" fill="${kante}"/><circle cx="50" cy="50" r="31" fill="${haupt}"/><circle cx="50" cy="50" r="23" fill="${hell}" opacity=".5"/>` + glanzstrich('M28 34 A26 26 0 0 1 44 22')
  } else if (i < 7) { // Bronze/Silber-Sechseck
    const m = METALL[i < 6 ? 'bronze' : 'silber']
    koerper = toonPoly(poly(6, 38), m[1], m[2], null, null) + `<polygon points="${poly(6, 30)}" fill="${haupt}" stroke="${haupt}" stroke-width="2" stroke-linejoin="round"/><polygon points="${nach(poly(6, 30), -0)}" fill="none"/>` +
      `<polygon points="50,20 76,35 76,50 50,50" fill="${kante}" opacity=".35"/>` + glanzstrich('M24 34 L46 21')
    if (i === 6) vorne = FUNKE(82, 16, .9)
  } else if (i < 10) { // Gold-Wappen
    const g = METALL.gold
    if (i >= 8) hinten = lorbeer('l') + lorbeer('r')
    const aussen = 'M50 10 L84 20 L80 54 Q76 74 50 90 Q24 74 20 54 L16 20 Z'
    const innen = 'M50 18 L76 26 L73 53 Q70 68 50 81 Q30 68 27 53 L24 26 Z'
    koerper = `<path d="${aussen}" fill="${g[2]}" transform="translate(0 5)"/><path d="${aussen}" fill="${g[1]}" stroke="${g[1]}" stroke-width="2" stroke-linejoin="round"/><path d="${innen}" fill="${haupt}"/><path d="M50 18 L76 26 L73 53 Q70 68 50 81 Z" fill="${kante}" opacity=".3"/>` + glanzstrich('M28 30 L46 24')
    vorne = (i === 9 ? krone(-2) : `<circle cx="50" cy="15" r="5" fill="#c2335e"/><circle cx="50" cy="13.5" r="5" fill="#ff5c8a"/>`) + FUNKE(86, 14, .9) + (i === 9 ? FUNKE(14, 30, .75) : '')
    sy = 50
  } else { // Kristall-Stern mit Extras, flach in Facetten
    if (i === 10) hinten += fluegel('#e4dbff', '#8a6cf5')
    if (i === 11) hinten += `<ellipse cx="50" cy="55" rx="48" ry="15" fill="none" stroke="#5566e0" stroke-width="5" transform="rotate(-22 50 55)"/><ellipse cx="50" cy="51" rx="48" ry="15" fill="none" stroke="#b9c2ff" stroke-width="5" transform="rotate(-22 50 51)"/>`
    if (i === 12) hinten += fluegel('#ffcb2e', '#d39500', 1.08)
    if (i === 13) hinten += fluegel('#c9f5ea', '#1c8a70', 1.1) + `<circle cx="50" cy="50" r="49" fill="none" stroke="${hell}" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/>`
    hinten += strahlen('#ffcb2e', '#fff0a6', '#d39500', 12, 49, 36, 50, LEBEN(i).dreh)
    const st = stern(8, 37, 29)
    koerper = `<polygon points="${nach(st, 5)}" fill="${kante}" stroke="${kante}" stroke-width="3" stroke-linejoin="round"/><polygon points="${st}" fill="${haupt}" stroke="${haupt}" stroke-width="3" stroke-linejoin="round"/>` +
      // Facetten: flache helle Dreiecke
      Array.from({ length: 8 }, (_, k) => { const p = st.split(' '); return k % 2 ? '' : `<polygon points="50,50 ${p[2 * k]} ${p[(2 * k + 1) % 16]}" fill="${hell}" opacity=".55"/>` }).join('') +
      `<circle cx="50" cy="55" r="22" fill="${kante}"/><circle cx="50" cy="51" r="22" fill="${hell}"/><circle cx="50" cy="51" r="22" fill="none" stroke="#fff" stroke-width="3"/>` + glanzstrich('M33 42 A18 18 0 0 1 42 33')
    vorne = (i >= 12 ? krone(-3) : '') + FUNKE(87, 14, 1) + FUNKE(13, 84, .85) + (i >= 11 ? FUNKE(88, 82, .75) : '')
    sy = 51
    const [sd, ss] = LEBEN(i).streif
    return `${hinten}${koerper}${sym(symbol, haupt, kante, 50, sy, 1.05)}${lichtstreif(`<polygon points="${st}"/>`, sd, ss)}${vorne}`
  }
  return `${hinten}${koerper}${sym(symbol, '#fff', kante, 50, sy, i < 4 ? 1.3 : 1.2)}${vorne}`
}

function sol(F) {
  const g = METALL.gold
  const puls = `<circle cx="50" cy="50" r="44" fill="#ffe27a"><animate attributeName="r" values="40;50;40" dur="2.6s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.5;1" keySplines=".45 0 .55 1;.45 0 .55 1"/><animate attributeName="opacity" values=".45;0;.45" dur="2.6s" repeatCount="indefinite"/></circle>`
  return puls + strahlen('#ffcb2e', '#ff8a2b', '#d36a00', 18, 50, 36, 50, LEBEN(14).dreh) +
    fluegel('#fff3b0', '#e0a800', 1.12) +
    `<circle cx="50" cy="56" r="25" fill="#c94a00"/><circle cx="50" cy="51" r="25" fill="#ff8a1e"/><circle cx="50" cy="51" r="18" fill="#ffc533"/><circle cx="50" cy="51" r="25" fill="none" stroke="#fff3b0" stroke-width="3"/>` +
    glanzstrich('M32 40 A20 20 0 0 1 42 31') + lichtstreif('<circle cx="50" cy="51" r="25"/>', ...LEBEN(14).streif) + krone(-4) +
    FUNKE(50, 51, 2.2, '#fff', '#e8a400') + FUNKE(88, 16, 1.1) + FUNKE(12, 82, .9) + FUNKE(90, 84, .8) + FUNKE(10, 18, .8)
}


// Metall je Stufe: Kenner/Könner Bronze, Profi Silber, Experte/Meister/Großmeister Gold
const metallVon = (i) => METALL[i <= 5 ? 'bronze' : i === 6 ? 'silber' : 'gold']
// Glanz-Stufe 0..5 (je höher, desto mehr Brillanz)
const glanz = (i) => i - 4

function funkeln(g) {
  const orte = [[84, 16, .9], [16, 22, .7], [88, 78, .75], [12, 80, .65], [50, 2, .7]]
  return orte.slice(0, Math.max(0, g)).map(([x, y, s]) => FUNKE(x, y, s)).join('')
}
const strahlenkranz = (g, m, cy = 50, dauer = 0) => g >= 3 ? strahlen(m[0], '#fff7d6', m[2], g >= 5 ? 16 : 12, g >= 5 ? 50 : 46, 36, cy, dauer) : ''

// ---------- V1: Medaille am Band ----------
// Frühe Stufen (Neuling–Lerner) auch als Medaille: Rand in warmem Champagner,
// damit die Reihe einheitlich wirkt und erst ab Kenner das Metall „steigt“.
const CHAMPAGNER = ['#fff3dc', '#f5d9a8', '#cfa66a']
function v1(i, s, F) {
  const [hell, haupt, kante] = F[i], m = i < 4 ? CHAMPAGNER : metallVon(i), g = Math.max(0, glanz(i))
  const band = `<path d="M30 58 L22 92 L32 86 L38 96 L46 64 Z" fill="${kante}"/><path d="M70 58 L78 92 L68 86 L62 96 L54 64 Z" fill="${kante}"/><path d="M31 56 L24 88 L33 83 L38 92 L45 62 Z" fill="${haupt}"/><path d="M69 56 L76 88 L67 83 L62 92 L55 62 Z" fill="${haupt}"/>`
  const kerben = Array.from({ length: 24 }, (_, k) => { const a = k * 15 * Math.PI / 180; return `<circle cx="${(50 + 33 * Math.cos(a)).toFixed(1)}" cy="${(44 + 33 * Math.sin(a)).toFixed(1)}" r="1.6" fill="${m[2]}"/>` }).join('')
  return strahlenkranz(g, m, 44, LEBEN(i).dreh) + band +
    `<circle cx="50" cy="49" r="34" fill="${m[2]}"/><circle cx="50" cy="44" r="34" fill="${m[1]}"/>${kerben}<circle cx="50" cy="44" r="26" fill="${m[2]}" opacity=".35"/><circle cx="50" cy="44" r="25" fill="${haupt}"/><circle cx="50" cy="44" r="18" fill="${hell}" opacity=".45"/>` +
    glanzstrich('M27 30 A27 27 0 0 1 41 19') + (g >= 1 ? glanzstrich('M70 58 A27 27 0 0 1 61 66').replace('opacity=".85"', 'opacity=".5"') : '') +
    sym(s, '#fff', kante, 50, 44, 1.15) + lichtstreif('<circle cx="50" cy="44" r="34"/>', ...LEBEN(i).streif) + (g >= 4 ? lorbeer('l').replace(/cy="(\d+\.\d)"/g, (a, b) => `cy="${(+b - 6).toFixed(1)}"`) + lorbeer('r').replace(/cy="(\d+\.\d)"/g, (a, b) => `cy="${(+b - 6).toFixed(1)}"`) : '') +
    (g >= 5 ? krone(-10) : '') + funkeln(g)
}

let aktId = 'e'
/**
 * SVG-Inhalt (ohne <svg>) für eine Stufe 0…14.
 * @param {number} i      Index in LEVEL_STUFEN
 * @param {string} marke  'habloo' | 'davaigo'
 * @param {string} id     eindeutiges Präfix für clipPath-IDs
 * @param {boolean} bewegt  false = ganz still (kleine Größen, weniger Bewegung)
 */
export function emblemInhalt(i, marke, id, bewegt = true) {
  aktId = id; glanzNr = 0
  const s = STUFEN[i][2], F = FARBEN[marke] ?? FARBEN.habloo
  let inhalt = i <= 9 ? v1(i, s, F) : emblem(i, s, F)
  if (LEBEN(i).schweben) inhalt = schweben(inhalt, i >= 14 ? 3.5 : 2.5, i >= 14 ? 2.6 : 3.4)
  if (!bewegt) inhalt = inhalt.replace(/<animate(Transform)?[^>]*\/>/g, '')
  return inhalt
}
