// Die Reiseroute: der Lernpfad eines Moduls.
//
// Toon-Fassung (07.11., Entwurf A): Jede Lektion ist eine kleine
// Trommel auf einem geschwungenen, gestrichelten Weg. Geschafft = grün
// mit Haken, dran = orange mit START-Blase, gesperrt = grau mit
// Schloss. Oben steht die nächste Lektion als dicke Toon-Karte.

import { ALLES_OFFEN, dauerMinuten } from './lektionen.js'
import { useTexte, text as uebersetzt } from './sprache.js'

const WELLE = [0, 46, 72, 46, 0, -46, -72, -46] // Versatz in px
const ZEILE = 104 // feste Zeilenhoehe – der Weg trifft so jede Trommel
const BREITE = 320

function Haken() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M5 12.5l5 5L19 7" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function Schloss() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      <path d="M7.5 11V8.5a4.5 4.5 0 0 1 9 0V11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="6" y="11" width="12" height="9" rx="2.5" fill="currentColor" />
    </svg>
  )
}
function Trommel() {
  return (
    <svg className="tp-trommel" viewBox="0 0 120 64" aria-hidden="true">
      <path className="tp-mitte" d="M8 22 V40 Q60 62 112 40 V22 Z" />
      <path className="tp-rechts" d="M60 51 Q90 50 112 40 V22 Q90 34 60 36 Z" />
      <path className="tp-tief" d="M8 40 Q60 62 112 40 V44 Q60 66 8 44 Z" />
      <ellipse className="tp-oben" cx="60" cy="22" rx="52" ry="14" />
      <path d="M22 17 Q32 11 46 10.5" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity=".75" />
    </svg>
  )
}

export default function Reiseroute({ lektionen, fortschritt, naechsteId, onStart }) {
  const t = useTexte()
  const fertigAnzahl = lektionen.filter((l) => fortschritt[l.id]?.fertig).length
  const dran = lektionen.find((l) => l.id === naechsteId)
  const dranNr = lektionen.findIndex((l) => l.id === naechsteId)

  const punkte = lektionen.map((_, i) => ({ x: BREITE / 2 + WELLE[i % WELLE.length], y: i * ZEILE + ZEILE / 2 }))
  const weg = punkte.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const v = punkte[i - 1]
    const b = (p.y - v.y) * 0.5
    return d + ` C ${v.x} ${v.y + b}, ${p.x} ${p.y - b}, ${p.x} ${p.y}`
  }, '')
  const letzterFertig = lektionen.reduce((n, l, i) => (fortschritt[l.id]?.fertig ? i : n), -1)
  const bis = Math.max(letzterFertig, dranNr)
  const anteil = lektionen.length > 1 ? Math.max(0, bis) / (lektionen.length - 1) : 0

  return (
    <div className="tpfad">
      <div className="tp-kopf">
        <span className="tp-balken">
          <span style={{ width: (lektionen.length ? (fertigAnzahl / lektionen.length) * 100 : 0) + '%' }} />
        </span>
        <b>{t('lek.vonZahl', { fertig: fertigAnzahl, gesamt: lektionen.length })}</b>
      </div>

      {dran && (
        <button type="button" className="tp-jetzt" onClick={() => onStart(dran)}>
          <span className="tp-jetzt-nr">{dranNr + 1}</span>
          <span className="tp-jetzt-text">
            <small>{t('lek.alsNaechstes')}</small>
            <b>{uebersetzt(dran.titel)}</b>
            <span>{uebersetzt(dran.grammatik?.[0] ?? dran.beschreibung)} · {t('lek.minuten', { von: dauerMinuten(dran).von, bis: dauerMinuten(dran).bis })}</span>
          </span>
          <span className="tp-jetzt-play" aria-hidden="true">▶</span>
        </button>
      )}

      <div className="tp-buehne" style={{ height: lektionen.length * ZEILE + 30 + 'px' }}>
        <svg
          className="tp-weg"
          viewBox={`0 0 ${BREITE} ${lektionen.length * ZEILE}`}
          width={BREITE}
          height={lektionen.length * ZEILE}
          aria-hidden="true"
        >
          <path d={weg} className="tp-weg-grund" />
          {anteil > 0 && <path d={weg} className="tp-weg-voll" pathLength="1" strokeDasharray={`${anteil} 1`} />}
        </svg>

        <ol className="tp-liste">
          {lektionen.map((l, i) => {
            const fertig = fortschritt[l.id]?.fertig
            const istDran = l.id === naechsteId
            const zu = !ALLES_OFFEN && !fertig && !istDran
            const versatz = WELLE[i % WELLE.length]
            const seite = versatz > 0 ? 'links' : 'rechts'
            const tit = uebersetzt(l.titel)
            return (
              <li
                key={l.id}
                className={'tp-etappe tp-' + seite}
                style={{ '--versatz': versatz + 'px', height: ZEILE + 'px' }}
              >
                <button
                  type="button"
                  className={'tp-knopf' + (fertig ? ' ist-fertig' : '') + (istDran ? ' ist-dran' : '') + (zu ? ' ist-zu' : '')}
                  disabled={zu}
                  onClick={() => onStart(l)}
                  aria-label={tit + (fertig ? t('rr.geschafftZusatz') : zu ? t('rr.gesperrtZusatz') : '')}
                >
                  <Trommel />
                  <span className="tp-kugel">
                    {fertig ? <Haken /> : zu ? <Schloss /> : i + 1}
                  </span>
                  {istDran && <span className="tp-start">{t('ls.start')}</span>}
                </button>
                <span className={'tp-titel' + (zu ? ' ist-zu' : '') + (istDran ? ' ist-dran' : '')}>
                  {tit}
                  <small>{fertig ? t('rr.geschafft') : t('lek.minuten', { von: dauerMinuten(l).von, bis: dauerMinuten(l).bis })}</small>
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
