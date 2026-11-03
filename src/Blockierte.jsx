import { useEffect, useState } from 'react'
import { ladeBlockierteListe, gibFrei } from './rangliste.js'
import { Bildnis } from './Rangliste.jsx'
import { useTexte } from './sprache.js'

/**
 * Wen habe ich blockiert?
 *
 * Steht im Profil und ist leer, solange niemand blockiert ist –
 * dann zeigt sich der Bereich gar nicht erst. Wer jemanden
 * blockiert hat, muss das aber auch wieder aufheben können; eine
 * Blockierung ohne Rückweg wäre eine Falle.
 */
export default function Blockierte() {
  const t = useTexte()
  const [liste, setListe] = useState([])
  const [laeuft, setLaeuft] = useState('')

  async function neuLaden() {
    setListe(await ladeBlockierteListe())
  }

  useEffect(() => {
    neuLaden()
    const neu = () => neuLaden()
    window.addEventListener('blockiert', neu)
    return () => window.removeEventListener('blockiert', neu)
  }, [])

  if (!liste.length) return null

  return (
    <section className="pf-kasten">
      <h2 className="pf-kasten-titel">{t('pf.blockiert')}</h2>
      <p className="pf-kasten-text">
{t('pf.blockiertText')}
      </p>

      <div className="bl-liste">
        {liste.map((b) => (
          <div className="bl-zeile" key={b.benutzername}>
            <Bildnis name={b.benutzername} bild={b.bild} klasse="bl-bild" />
            <b className="bl-name">{b.benutzername}</b>
            <button
              className="btn-small bl-frei"
              disabled={laeuft === b.benutzername}
              onClick={async () => {
                setLaeuft(b.benutzername)
                try {
                  await gibFrei(b.benutzername)
                  await neuLaden()
                } catch (f) {
                  alert(f.message)
                } finally {
                  setLaeuft('')
                }
              }}
            >
              {laeuft === b.benutzername ? '…' : t('pf.freigeben')}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
