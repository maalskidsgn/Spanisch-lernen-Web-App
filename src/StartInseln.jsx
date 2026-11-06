import { useRef, useState } from 'react'
import InselEmblem from './InselEmbleme.jsx'
import { INSEL_TOENE } from './Rangliste.jsx'
import { IconPfeil } from './icons.jsx'

/**
 * Der Sockel unter dem Emblem: eine runde Trommel im Toon-Stil der
 * Podest-Inseln (Manuel, 06.11.).
 */
function Sockel() {
  const [hell, oben, links, mitte, rechts, tief] = INSEL_TOENE.zweiter
  return (
    <svg className="si-sockel" viewBox="0 0 120 64" aria-hidden="true">
      <path d="M8 22 V40 Q60 62 112 40 V22 Z" fill={mitte} />
      <path d="M60 51 Q90 50 112 40 V22 Q90 34 60 36 Z" fill={rechts} />
      <path d="M8 22 V40 Q22 46 30 47.5 V30 Q16 27 8 22 Z" fill={links} />
      <path d="M8 40 Q60 62 112 40 V44 Q60 66 8 44 Z" fill={tief} />
      <ellipse cx="60" cy="22" rx="52" ry="14" fill={oben} />
      <ellipse cx="55" cy="19" rx="35" ry="8" fill={hell} />
      <path d="M22 17 Q32 11 46 10.5" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity=".85" />
      <path d="M17 33 V41" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".5" />
    </svg>
  )
}

/**
 * Die Funktionen der App als Karten zum Durchwischen.
 *
 * Je Funktion ein Emblem im Toon-Stil der Podest-Inseln. Wer die App
 * öffnet, sieht so auf einen Blick, was es alles gibt – und tippt
 * direkt hinein. Das kleine „i“ oben rechts erklärt die Funktion,
 * ohne sie zu öffnen.
 *
 * @param {{ id: string, titel: string, unter: string, info: string, onClick: () => void }[]} eintraege
 */
export default function StartInseln({ eintraege, farben, schliessenText = '×' }) {
  const leiste = useRef(null)
  const [offen, setOffen] = useState(null) // id der Karte mit offener Erklärung

  function blaettern(richtung) {
    const el = leiste.current
    if (!el) return
    el.scrollBy({ left: richtung * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className="si">
      <button type="button" className="si-pfeil si-pfeil-links" onClick={() => blaettern(-1)} aria-label="‹">
        <IconPfeil groesse={18} />
      </button>
      <div className="si-leiste" ref={leiste}>
        {eintraege.map((e, i) => (
          <div key={e.id} className="si-karte" style={{ '--verzug': (i % 3) * -1.3 + 's' }}>
            <button type="button" className="si-haupt" onClick={e.onClick}>
              <span className="si-bild">
                <Sockel />
                <InselEmblem art={e.id} farben={farben} klasse="si-emblem" />
              </span>
              <b className="si-titel">{e.titel}</b>
              <small className="si-unter">{e.unter}</small>
            </button>
            <button
              type="button"
              className="si-info"
              aria-label={e.titel + ': Info'}
              aria-expanded={offen === e.id}
              onClick={() => setOffen(offen === e.id ? null : e.id)}
            >
              i
            </button>
            {offen === e.id && (
              <div className="si-erklaerung" role="note">
                <b>{e.titel}</b>
                <p>{e.info}</p>
                <button type="button" className="si-zu" onClick={() => setOffen(null)} aria-label={schliessenText}>
                  ×
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <button type="button" className="si-pfeil si-pfeil-rechts" onClick={() => blaettern(1)} aria-label="›">
        <IconPfeil groesse={18} />
      </button>
    </div>
  )
}
