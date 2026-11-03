import { useState } from 'react'
import { MELDE_GRUENDE, melde } from './rangliste.js'
import { useTexte } from './sprache.js'

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
  const t = useTexte()
  const [grund, setGrund] = useState('')
  const [bemerkung, setBemerkung] = useState('')
  const [laeuft, setLaeuft] = useState(false)
  const [fehler, setFehler] = useState('')
  const [fertig, setFertig] = useState(false)

  async function absenden() {
    if (!grund) return setFehler(t('md.grundAuswaehlen'))
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
          <h2 className="md-titel">{t('md.dankeTitel')}</h2>
          <p className="md-text">
{t('md.dankeText', { name: benutzername })}
          </p>
          <button className="btn md-knopf" onClick={() => { onFertig?.(); onSchliessen?.() }}>
            {t('app.allesKlar')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="md-schicht" role="dialog" aria-modal="true" onClick={onSchliessen}>
      <div className="md-karte" onClick={(e) => e.stopPropagation()}>
        <h2 className="md-titel">{t('md.titel', { name: benutzername })}</h2>
        <p className="md-text">
          {t('md.frage')}
        </p>

        <div className="md-gruende" role="radiogroup" aria-label={t('md.grundLabel')}>
          {MELDE_GRUENDE.map(([wert, text]) => (
            <button
              key={wert}
              role="radio"
              aria-checked={grund === wert}
              className={'md-grund' + (grund === wert ? ' ist-aktiv' : '')}
              onClick={() => setGrund(wert)}
              disabled={laeuft}
            >
              {t(text)}
            </button>
          ))}
        </div>

        <textarea
          className="md-feld"
          value={bemerkung}
          onChange={(e) => setBemerkung(e.target.value.slice(0, 500))}
          placeholder={t('md.platzhalter')}
          rows={3}
          disabled={laeuft}
        />

        {fehler && <p className="md-fehler">{fehler}</p>}

        <p className="md-hinweis">
{t('md.hinweisLang', { name: benutzername })}
        </p>

        <div className="md-knoepfe">
          <button className="btn-plain" onClick={onSchliessen} disabled={laeuft}>
            {t('app.abbrechen')}
          </button>
          <button className="btn md-senden" onClick={absenden} disabled={laeuft || !grund}>
            {laeuft ? t('md.wirdGesendet') : t('md.senden')}
          </button>
        </div>
      </div>
    </div>
  )
}
