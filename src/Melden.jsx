import { useState } from 'react'
import { MELDE_GRUENDE, melde } from './rangliste.js'

/**
 * Jemanden melden.
 *
 * Apple und Google verlangen das, sobald Nutzer Inhalte anderer
 * Nutzer sehen – bei Habloo sind das Benutzernamen und Profilbilder
 * in der Rangliste. Ohne eine Möglichkeit, sich zu wehren, wäre ein
 * anstößiges Bild für alle sichtbar und niemand könnte etwas tun.
 *
 * Das Melden blockiert die Person gleich mit: Wer etwas meldet, will
 * es nicht mehr sehen – und soll nicht warten müssen, bis jemand die
 * Meldung bearbeitet hat.
 */
export default function Melden({ benutzername, onSchliessen, onFertig }) {
  const [grund, setGrund] = useState('')
  const [bemerkung, setBemerkung] = useState('')
  const [laeuft, setLaeuft] = useState(false)
  const [fehler, setFehler] = useState('')
  const [fertig, setFertig] = useState(false)

  async function absenden() {
    if (!grund) return setFehler('Bitte wähl einen Grund aus.')
    setFehler('')
    setLaeuft(true)
    try {
      await melde(benutzername, grund, bemerkung)
      setFertig(true)
    } catch (f) {
      setFehler(f.message)
      setLaeuft(false)
    }
  }

  if (fertig) {
    return (
      <div className="md-schicht" role="dialog" aria-modal="true" onClick={onSchliessen}>
        <div className="md-karte" onClick={(e) => e.stopPropagation()}>
          <span className="md-haken" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.6"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h2 className="md-titel">Danke für den Hinweis</h2>
          <p className="md-text">
            Wir schauen uns das an. <b>{benutzername}</b> ist für dich blockiert – ihr
            seht euch gegenseitig nicht mehr in Rangliste, Suche und Duellen.
          </p>
          <button className="btn md-knopf" onClick={() => { onFertig?.(); onSchliessen?.() }}>
            Alles klar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="md-schicht" role="dialog" aria-modal="true" onClick={onSchliessen}>
      <div className="md-karte" onClick={(e) => e.stopPropagation()}>
        <h2 className="md-titel">{benutzername} melden</h2>
        <p className="md-text">
          Was stimmt hier nicht? Wir sehen uns jede Meldung an.
        </p>

        <div className="md-gruende" role="radiogroup" aria-label="Grund">
          {MELDE_GRUENDE.map(([wert, text]) => (
            <button
              key={wert}
              role="radio"
              aria-checked={grund === wert}
              className={'md-grund' + (grund === wert ? ' ist-aktiv' : '')}
              onClick={() => setGrund(wert)}
              disabled={laeuft}
            >
              {text}
            </button>
          ))}
        </div>

        <textarea
          className="md-feld"
          value={bemerkung}
          onChange={(e) => setBemerkung(e.target.value.slice(0, 500))}
          placeholder="Magst du kurz sagen, was los ist? (freiwillig)"
          rows={3}
          disabled={laeuft}
        />

        {fehler && <p className="md-fehler">{fehler}</p>}

        <p className="md-hinweis">
          Mit dem Melden blockierst du {benutzername} auch. Das lässt sich im Profil
          wieder rückgängig machen.
        </p>

        <div className="md-knoepfe">
          <button className="btn-plain" onClick={onSchliessen} disabled={laeuft}>
            Abbrechen
          </button>
          <button className="btn md-senden" onClick={absenden} disabled={laeuft || !grund}>
            {laeuft ? 'Wird gesendet …' : 'Melden'}
          </button>
        </div>
      </div>
    </div>
  )
}
