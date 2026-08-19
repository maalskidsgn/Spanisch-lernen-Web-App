// Die Reiseroute: der Lernpfad eines Moduls als Landkarte.
//
// Der Weg wird BERECHNET, nicht gezeichnet. Das ist der ganze Punkt:
// Modul 1 hat 9 Lektionen, Modul 3 vielleicht 22 – eine von Hand
// gesetzte Kurve müsste für jede Größe neu gemalt werden. Hier
// entsteht die Serpentine aus der Anzahl der Halte.
//
// Der geschaffte Teil der Straße wird über stroke-dasharray auf
// DERSELBEN Kurve eingefärbt (pathLength="1"), statt einen zweiten
// Pfad zu berechnen. So können beide gar nicht auseinanderlaufen.

export const BREITE = 344
export const OBEN = 56 // Platz für das erste Etikett
export const ABSTAND = 118 // senkrechter Abstand zweier Halte
const LINKS = 64
const RECHTS = 280

/** Wo liegt Halt Nummer i? Gerade Halte links, ungerade rechts. */
export function ort(i) {
  return { x: i % 2 === 0 ? LINKS : RECHTS, y: OBEN + i * ABSTAND }
}

/** Die Serpentine als ein einziger Pfad. */
export function baueWeg(anzahl) {
  if (anzahl === 0) return ''
  const a = ort(0)
  let d = `M ${a.x} ${a.y}`
  for (let i = 1; i < anzahl; i++) {
    const v = ort(i - 1)
    const n = ort(i)
    const bauch = ABSTAND * 0.55 // wie stark die Kurve ausholt
    d += ` C ${v.x} ${v.y + bauch}, ${n.x} ${n.y - bauch}, ${n.x} ${n.y}`
  }
  return d
}

/**
 * Ruhige Landschaftsflecken. Ihre Lage haengt allein vom Index ab –
 * damit sie beim Neuzeichnen nicht herumspringen.
 */
function flecken(anzahl) {
  return Array.from({ length: Math.ceil(anzahl / 2) }, (_, k) => ({
    cx: k % 2 === 0 ? 268 : 58,
    cy: OBEN + k * ABSTAND * 2 + 74,
    r: 34 + (k % 3) * 9,
  }))
}

export default function Reiseroute({ lektionen, fortschritt, naechsteId, onStart }) {
  const anzahl = lektionen.length
  const hoehe = OBEN + (anzahl - 1) * ABSTAND + 92
  const weg = baueWeg(anzahl)

  // Bis wohin ist die Straße geschafft? Der Anteil bezieht sich auf
  // die Abschnitte zwischen den Halten, nicht auf die Halte selbst.
  const letzterFertig = lektionen.reduce(
    (letzter, l, i) => (fortschritt[l.id]?.fertig ? i : letzter),
    -1
  )
  const anteil = anzahl > 1 ? Math.max(0, letzterFertig) / (anzahl - 1) : 0

  return (
    <div className="route">
      <svg
        viewBox={`0 0 ${BREITE} ${hoehe}`}
        className="route-karte"
        role="img"
        aria-label={`Lernpfad mit ${anzahl} Etappen`}
      >
        {/* Landschaft */}
        <rect width={BREITE} height={hoehe} className="route-grund" />
        {flecken(anzahl).map((f, k) => (
          <circle key={k} cx={f.cx} cy={f.cy} r={f.r} className="route-fleck" />
        ))}

        {/* Die Straße: Belag, geschaffter Teil, Mittelstreifen */}
        <path d={weg} className="route-belag" />
        {letzterFertig >= 0 && (
          <path
            d={weg}
            className="route-geschafft"
            pathLength="1"
            strokeDasharray={`${anteil} 1`}
          />
        )}
        <path d={weg} className="route-streifen" />

        {/* Die Halte */}
        {lektionen.map((l, i) => {
          const { x, y } = ort(i)
          const fertig = fortschritt[l.id]?.fertig
          const dran = l.id === naechsteId
          const rechts = i % 2 === 0 // Etikett rechts der Straße?
          const tx = rechts ? x + 26 : x - 26
          const anker = rechts ? 'start' : 'end'

          return (
            <g
              key={l.id}
              className={
                'route-halt' +
                (fertig ? ' halt-fertig' : '') +
                (dran ? ' halt-dran' : '') +
                (!fertig && !dran ? ' halt-offen' : '')
              }
              onClick={() => onStart(l)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onStart(l)
                }
              }}
              aria-label={`Etappe ${l.kursNr}: ${l.titel}`}
            >
              {/* Die Fahne markiert, wo man gerade steht */}
              {dran && (
                <>
                  <circle cx={x} cy={y} r="24" className="halt-schein" />
                  <path d={`M${x} ${y} v-38`} className="halt-mast" />
                  <path
                    d={`M${x} ${y - 38} h34 l-8 9 8 9 h-34z`}
                    className="halt-fahne"
                  />
                  <text x={x + 12} y={y - 24} className="halt-nummer">
                    {l.kursNr}
                  </text>
                </>
              )}

              <circle cx={x} cy={y} r={dran ? 11 : fertig ? 13 : 10} className="halt-punkt" />
              {fertig && (
                <path
                  d={`M${x - 5} ${y} l4.5 4.5 L${x + 6} ${y - 5}`}
                  className="halt-haken"
                />
              )}

              <text x={tx} y={y - 2} textAnchor={anker} className="halt-titel">
                {l.titel}
              </text>
              <text x={tx} y={y + 13} textAnchor={anker} className="halt-unter">
                {dran
                  ? 'HIER GEHT ES WEITER'
                  : fertig
                    ? 'geschafft'
                    : kurz(l.grammatik?.[0] ?? '')}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/**
 * Kuerzt den Untertitel auf die Breite der Karte.
 *
 * Vorher wurde hart nach 30 Zeichen abgeschnitten – auf dem Schirm
 * stand dann "Betonungsregeln und der schrif". Jetzt endet der Text
 * am letzten ganzen Wort und bekommt Auslassungspunkte.
 */
function kurz(text, grenze = 30) {
  if (text.length <= grenze) return text
  const stueck = text.slice(0, grenze)
  const luecke = stueck.lastIndexOf(' ')
  return (luecke > 12 ? stueck.slice(0, luecke) : stueck).trimEnd() + '…'
}
