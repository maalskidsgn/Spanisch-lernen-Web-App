// Die Reiseroute: der Lernpfad eines Moduls.
//
// Runde Etappen-Knoepfe in der Mitte, die sanft hin und her pendeln –
// wie ein Weg, den man entlanggeht. Geschafft = gefuellt mit Haken,
// die aktuelle Etappe ist groesser, pulsiert und traegt eine
// Sprechblase mit Titel und Start-Knopf. Gesperrte sind grau.

import { ALLES_OFFEN, dauerMinuten } from './lektionen.js'

// Versatz der Knoepfe in px: eine weiche Welle statt starrem Zickzack
const WELLE = [0, 46, 70, 46, 0, -46, -70, -46]

function IconHaken() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <path d="M5 12.5l5 5L19 7" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconStern() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5z" fill="currentColor" />
    </svg>
  )
}
function IconSchloss() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  )
}

export default function Reiseroute({ lektionen, fortschritt, naechsteId, onStart }) {
  const fertigAnzahl = lektionen.filter((l) => fortschritt[l.id]?.fertig).length

  return (
    <div className="pfad">
      <div className="pfad-kopf">
        <span className="pfad-fortschritt">
          <span style={{ width: (lektionen.length ? (fertigAnzahl / lektionen.length) * 100 : 0) + '%' }} />
        </span>
        <b>
          {fertigAnzahl}/{lektionen.length}
        </b>
      </div>

      <ol className="pfad-liste">
        {lektionen.map((l, i) => {
          const fertig = fortschritt[l.id]?.fertig
          const dran = l.id === naechsteId
          const zu = !ALLES_OFFEN && !fertig && !dran
          const dauer = dauerMinuten(l)
          const versatz = WELLE[i % WELLE.length]

          return (
            <li
              key={l.id}
              className={'pfad-etappe' + (dran ? ' ist-dran' : '')}
              style={{ '--versatz': versatz + 'px' }}
            >
              {dran && (
                <div className="pfad-blase">
                  <span className="pfad-blase-marke">Lektion {l.kursNr ?? i + 1}</span>
                  <b>{l.titel}</b>
                  <span className="pfad-blase-unter">
                    {l.grammatik?.[0] ?? l.beschreibung} · {dauer.von}–{dauer.bis} Min.
                  </span>
                  <button type="button" className="btn pfad-start" onClick={() => onStart(l)}>
                    {fortschritt[l.id] ? 'Weiterlernen' : 'Starten'}
                  </button>
                </div>
              )}

              <button
                type="button"
                className={
                  'pfad-knopf' +
                  (fertig ? ' ist-fertig' : '') +
                  (dran ? ' ist-dran' : '') +
                  (zu ? ' ist-zu' : '') +
                  (!fertig && !dran && !zu ? ' ist-offen' : '')
                }
                disabled={zu}
                onClick={() => onStart(l)}
                aria-label={l.titel + (fertig ? ' – geschafft' : zu ? ' – gesperrt' : '')}
              >
                {fertig ? <IconHaken /> : zu ? <IconSchloss /> : <IconStern />}
              </button>

              {!dran && (
                <span className={'pfad-titel' + (zu ? ' ist-zu' : '')}>{l.titel}</span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
