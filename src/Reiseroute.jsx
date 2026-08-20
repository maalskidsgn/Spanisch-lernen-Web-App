// Die Reiseroute: der Lernpfad eines Moduls.
//
// Frueher war alles ein einziges SVG – auch die Beschriftungen. Das
// sah aus wie eine Landkarte, hatte aber zwei Nachteile: SVG-Text
// bricht nicht um (lange Titel wurden hart abgeschnitten), und die
// Etiketten links und rechts der Strasse liessen sich schlecht als
// anfassbare Karten gestalten.
//
// Jetzt macht jedes Werkzeug das, was es kann: Der Weg bleibt ein
// SVG-Pfad in einer schmalen Spur links, die Etappen sind normale
// HTML-Karten rechts davon. Der Weg wird weiterhin BERECHNET, nicht
// gezeichnet – ein Modul mit 20 Etappen bekommt seine Kurve genauso
// wie eines mit 9.
//
// Damit der Pfad die Punkte wirklich trifft, haben die Zeilen feste
// Hoehen. Anders geht es nicht: Ein SVG kann nicht wissen, wie hoch
// eine HTML-Karte nach dem Umbruch geworden ist.

import { ALLES_OFFEN, dauerMinuten } from './lektionen.js'
import { IconUhr, IconSchloss } from './icons.jsx'

export const SPUR = 74 // Breite der Spur, in der der Weg laeuft
// Die Spur ist im Kasten eingerueckt. Der Wert steckt in BEIDEN
// Seiten – im CSS der Spur und in der Position der Punkte. Stimmt er
// nicht ueberein, laufen Punkte und Weg auseinander.
export const SPUR_LINKS = 12
export const ZEILE = 112 // Hoehe einer gewoehnlichen Etappe
export const ZEILE_DRAN = 168 // die aktuelle Etappe ist hoeher
const OBEN = 10
const LINKS = 30 // die beiden x-Werte, zwischen denen der Weg pendelt
const RECHTS = 50

/** Die Hoehe einer Zeile – die aktuelle Etappe braucht mehr Platz. */
export function zeilenHoehe(dran) {
  return dran ? ZEILE_DRAN : ZEILE
}

/**
 * Wo liegt der Punkt von Etappe i?
 *
 * Die y-Werte ergeben sich aus den Hoehen aller Zeilen darueber –
 * deshalb bekommt die Funktion die ganze Liste und nicht nur den
 * Index. Der x-Wert pendelt leicht, sonst waere der Weg eine gerade
 * Linie und keine Route.
 */
export function orte(lektionen, naechsteId) {
  let y = OBEN
  return lektionen.map((l, i) => {
    const h = zeilenHoehe(l.id === naechsteId)
    const punkt = { x: i % 2 === 0 ? LINKS : RECHTS, y: y + h / 2 }
    y += h
    return punkt
  })
}

/** Der Weg als ein einziger Pfad durch alle Punkte. */
export function baueWeg(punkte) {
  if (punkte.length === 0) return ''
  let d = `M ${punkte[0].x} ${punkte[0].y}`
  for (let i = 1; i < punkte.length; i++) {
    const v = punkte[i - 1]
    const n = punkte[i]
    const bauch = (n.y - v.y) * 0.45 // wie stark die Kurve ausholt
    d += ` C ${v.x} ${v.y + bauch}, ${n.x} ${n.y - bauch}, ${n.x} ${n.y}`
  }
  return d
}

export default function Reiseroute({ lektionen, fortschritt, naechsteId, onStart }) {
  const punkte = orte(lektionen, naechsteId)
  const hoehe =
    lektionen.reduce((s, l) => s + zeilenHoehe(l.id === naechsteId), 0) + OBEN * 2
  const weg = baueWeg(punkte)

  // Bis wohin ist der Weg geschafft? Der Anteil bezieht sich auf die
  // Abschnitte zwischen den Punkten, nicht auf die Punkte selbst.
  const letzterFertig = lektionen.reduce(
    (letzter, l, i) => (fortschritt[l.id]?.fertig ? i : letzter),
    -1
  )
  // Das halbe Stueck extra ist Absicht: Wer die erste Etappe
  // geschafft hat, steht auf Punkt 0 – und bis dorthin ist der Weg
  // null lang. Ohne den Zuschlag saehe man nach der ersten Lektion
  // gar keinen Fortschritt.
  const anteil =
    lektionen.length > 1
      ? Math.min(1, Math.max(0, letzterFertig + 0.5) / (lektionen.length - 1))
      : 0

  return (
    <div className="route">
      {/* Die Spur mit dem Weg. Sie liegt hinter den Karten und faengt
          keine Klicks ab – angefasst werden die Karten. */}
      <svg
        className="route-spur"
        viewBox={`0 0 ${SPUR} ${hoehe}`}
        style={{ height: hoehe + 'px' }}
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path d={weg} className="route-belag" />
        {letzterFertig >= 0 && (
          <path
            d={weg}
            className="route-geschafft"
            pathLength="1"
            strokeDasharray={`${anteil} 1`}
          />
        )}
      </svg>

      <ol className="etappen">
        {lektionen.map((l, i) => {
          const fertig = fortschritt[l.id]?.fertig
          const dran = l.id === naechsteId
          const zu = !ALLES_OFFEN && !fertig && !dran
          const dauer = dauerMinuten(l)

          return (
            <li
              key={l.id}
              className={'etappe' + (dran ? ' etappe-dran' : '')}
              style={{ height: zeilenHoehe(dran) + 'px' }}
            >
              <span
                className={
                  'etappe-punkt' +
                  (fertig ? ' punkt-fertig' : '') +
                  (dran ? ' punkt-dran' : '')
                }
                style={{ left: SPUR_LINKS + punkte[i].x + 'px' }}
                aria-hidden="true"
              >
                {fertig && (
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path
                      d="M5 12.5l5 5L19 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {dran && <b className="etappe-fahne">{l.kursNr}</b>}
              </span>

              <button
                className={
                  'etappe-karte' +
                  (fertig ? ' karte-fertig' : '') +
                  (dran ? ' karte-dran' : '') +
                  (zu ? ' karte-zu' : '') +
                  (i % 2 === 1 ? ' karte-versetzt' : '')
                }
                disabled={zu}
                onClick={() => onStart(l)}
              >
                {dran && <span className="karte-marke">Als Nächstes</span>}
                <span className="karte-kopf">
                  {zu && <IconSchloss groesse={16} />}
                  <span className="karte-titel">{l.titel}</span>
                </span>

                {fertig ? (
                  <span className="karte-status">Geschafft</span>
                ) : dran ? (
                  <>
                    <span className="karte-unter">{l.grammatik?.[0] ?? l.beschreibung}</span>
                    <span className="karte-los">
                      Weiterlernen
                      <svg viewBox="0 0 24 24" width="17" height="17">
                        <path
                          d="M4 12h15M13 6l6 6-6 6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </>
                ) : (
                  <span className="karte-dauer">
                    <IconUhr groesse={14} />
                    {dauer.von}–{dauer.bis} Min.
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
