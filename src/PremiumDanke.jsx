import Logo from './Logo.jsx'
import { useTexte } from './sprache.js'

const VORTEILE = ['dk.listen', 'dk.saetze', 'dk.videos']

/**
 * Die Seite direkt nach dem Kauf, im Browser wie in der App: Sie sagt
 * Danke, zeigt, was jetzt freigeschaltet ist, und führt weiter.
 */
export default function PremiumDanke({ verzoegert = false, onWeiter }) {
  const t = useTexte()

  return (
    <div className="kassen-seite">
      <div className="danke">
        <Logo />
        <span className="danke-haken" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor"
               strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h1>{t('dk.titel')}</h1>
        <p className="danke-unter">{t('dk.unter')}</p>
        <ul className="danke-liste">
          {VORTEILE.map((v) => <li key={v}>{t(v)}</li>)}
        </ul>
        {verzoegert && <p className="danke-hinweis">{t('dk.warte')}</p>}
        <button className="kn-kaufen" onClick={onWeiter}>{t('dk.weiter')}</button>
      </div>
    </div>
  )
}
