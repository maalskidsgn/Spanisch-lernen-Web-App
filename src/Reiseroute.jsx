// Die Reiseroute: der Lernpfad eines Moduls.
//
// Ein durchgehender, weicher Weg mit runden Etappen, die sanft hin
// und her pendeln. Oben steht die aktuelle Lektion als eigene Karte –
// so behaelt jede Zeile ihre feste Hoehe und der Weg trifft die
// Knoepfe genau. Beschriftungen stehen neben dem Knopf, nicht darunter.

import { ALLES_OFFEN, dauerMinuten } from './lektionen.js'

const WELLE = [0, 40, 64, 40, 0, -40, -64, -40] // Versatz in px
const ZEILE = 96 // feste Zeilenhoehe
const BREITE = 320 // Zeichenflaeche des Weges

function Haken() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path d="M5 12.5l5 5L19 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function Schloss() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M7.5 11V8.5a4.5 4.5 0 0 1 9 0V11M6.5 11h11v8.5h-11z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}
function Pfeil() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Reiseroute({ lektionen, fortschritt, naechsteId, onStart }) {
  const fertigAnzahl = lektionen.filter((l) => fortschritt[l.id]?.fertig).length
  const dran = lektionen.find((l) => l.id === naechsteId)
  const dranNr = lektionen.findIndex((l) => l.id === naechsteId)

  // Punkte des Weges, Mitte der Zeichenflaeche = x 0
  const punkte = lektionen.map((_, i) => ({ x: BREITE / 2 + WELLE[i % WELLE.length], y: i * ZEILE + ZEILE / 2 }))
  const weg = punkte.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const v = punkte[i - 1]
    const b = (p.y - v.y) * 0.5
    return d + ` C ${v.x} ${v.y + b}, ${p.x} ${p.y - b}, ${p.x} ${p.y}`
  }, '')
  // geschaffter Teil des Weges
  const letzterFertig = lektionen.reduce((n, l, i) => (fortschritt[l.id]?.fertig ? i : n), -1)
  const bis = Math.max(letzterFertig, dranNr)
  const anteil = lektionen.length > 1 ? Math.max(0, bis) / (lektionen.length - 1) : 0

  return (
    <div className="pfad">
      <div className="pfad-kopf">
        <span className="pfad-fortschritt">
          <span style={{ width: (lektionen.length ? (fertigAnzahl / lektionen.length) * 100 : 0) + '%' }} />
        </span>
        <b>
          {fertigAnzahl} von {lektionen.length}
        </b>
      </div>

      {dran && (
        <button type="button" className="pfad-jetzt" onClick={() => onStart(dran)}>
          <span className="pfad-jetzt-nr">{dranNr + 1}</span>
          <span className="pfad-jetzt-text">
            <span className="pfad-jetzt-marke">Als Nächstes</span>
            <b>{dran.titel}</b>
            <span>
              {dran.grammatik?.[0] ?? dran.beschreibung} · {dauerMinuten(dran).von}–{dauerMinuten(dran).bis} Min.
            </span>
          </span>
          <span className="pfad-jetzt-pfeil">
            <Pfeil />
          </span>
        </button>
      )}

      <div className="pfad-buehne" style={{ height: lektionen.length * ZEILE + 'px' }}>
        <svg
          className="pfad-weg"
          viewBox={`0 0 ${BREITE} ${lektionen.length * ZEILE}`}
          width={BREITE}
          height={lektionen.length * ZEILE}
          aria-hidden="true"
        >
          <path d={weg} className="pfad-weg-grund" />
          {anteil > 0 && (
            <path d={weg} className="pfad-weg-voll" pathLength="1" strokeDasharray={`${anteil} 1`} />
          )}
        </svg>

        <ol className="pfad-liste">
          {lektionen.map((l, i) => {
            const fertig = fortschritt[l.id]?.fertig
            const istDran = l.id === naechsteId
            const zu = !ALLES_OFFEN && !fertig && !istDran
            const versatz = WELLE[i % WELLE.length]
            // Beschriftung auf die Seite mit mehr Platz
            const seite = versatz > 0 ? 'links' : 'rechts'

            return (
              <li
                key={l.id}
                className={'pfad-etappe pfad-' + seite}
                style={{ '--versatz': versatz + 'px', height: ZEILE + 'px' }}
              >
                <button
                  type="button"
                  className={
                    'pfad-knopf' +
                    (fertig ? ' ist-fertig' : '') +
                    (istDran ? ' ist-dran' : '') +
                    (zu ? ' ist-zu' : '')
                  }
                  disabled={zu}
                  onClick={() => onStart(l)}
                  aria-label={l.titel + (fertig ? ' – geschafft' : zu ? ' – gesperrt' : '')}
                >
                  {fertig ? <Haken /> : zu ? <Schloss /> : <span className="pfad-nr">{i + 1}</span>}
                </button>
                <span className={'pfad-titel' + (zu ? ' ist-zu' : '') + (istDran ? ' ist-dran' : '')}>
                  {l.titel}
                  <small>{fertig ? 'Geschafft' : `${dauerMinuten(l).von}–${dauerMinuten(l).bis} Min.`}</small>
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
