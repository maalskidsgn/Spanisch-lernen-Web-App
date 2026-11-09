import { useEffect, useState } from 'react'
import { istApp } from './api.js'
import { APP_NAME } from './App.jsx'
import Logo from './Logo.jsx'
import { mitAnbieter, aktiveAnbieter } from './auth.js'
import BILDER from './postkartenBilder.js'
import { useTexte } from './sprache.js'

/**
 * Startbildschirm für Abgemeldete (09.11., Entwurf C1): drei schräge
 * Postkarten mit den ersten Wörtern – jede mit eigener kleinen Szene –
 * und darunter die Wege ins Konto. Apple/Google erscheinen nur, wenn
 * der Anbieter in Supabase eingeschaltet ist (und nicht in der
 * Store-App, die bräuchte einen eigenen Rückweg).
 */
const KARTEN = [
  { wort: '¡Hola!', ort: 'Plaza', de: 'sp.hallo' },
  { wort: 'la playa', ort: 'Playa', de: 'sp.strand' },
  { wort: 'las tapas', ort: 'Tapas', de: 'sp.tapas' },
]

function Ton() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff" />
      <path d="M16 8q3 4 0 8M18.5 5.5q5 6.5 0 13" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default function StartPostkarten({ onStarten, onAnmelden }) {
  const t = useTexte()
  const [anbieter, setAnbieter] = useState([])
  const [fehler, setFehler] = useState('')
  useEffect(() => {
    if (!istApp) aktiveAnbieter().then(setAnbieter)
  }, [])

  async function mit(a) {
    setFehler('')
    try {
      await mitAnbieter(a)
    } catch (f) {
      setFehler(f.message)
    }
  }

  return (
    <header className="sp-start">
      <div className="sp-marke">
        <Logo klasse="sp-logo" />
        <b>{APP_NAME}</b>
      </div>
      <h1 className="sp-titel">{t('sp.titel1')} <em>{t('sp.titel2')}</em> {t('sp.titel3')}</h1>

      <div className="sp-stapel" aria-hidden="true">
        {KARTEN.map((k, i) => (
          <div key={k.wort} className={'sp-karte sp-karte-' + i}>
            <svg className="sp-bild" viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice" dangerouslySetInnerHTML={{ __html: BILDER[i] }} />
            <div className="sp-text">
              <span className="sp-ort">{k.ort}</span>
              <b>{k.wort}</b>
              <small>{t(k.de)}</small>
            </div>
            <span className="sp-ton"><Ton /></span>
            <span className="sp-marke-stempel">ES</span>
          </div>
        ))}
      </div>

      <div className="sp-knoepfe">
        {anbieter.includes('apple') && (
          <button type="button" className="sp-k sp-apple" onClick={() => mit('apple')}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.2 1-4 2.5-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.5-4.1zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z" /></svg>
            {t('sp.apple')}
          </button>
        )}
        {anbieter.includes('google') && (
          <button type="button" className="sp-k sp-google" onClick={() => mit('google')}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.5c2.1-1.9 3.4-4.7 3.4-8z" /><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8C3.9 20.5 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.7 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7.1H2.1C1.4 8.6 1 10.2 1 12s.4 3.4 1.1 4.9l3.6-2.8z" /><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2C17.5 2.1 15 1 12 1 7.7 1 3.9 3.5 2.1 7.1l3.6 2.8C6.6 7.4 9.1 5.4 12 5.4z" /></svg>
            {t('sp.google')}
          </button>
        )}
        <button type="button" className="sp-k sp-mail" onClick={onStarten}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></svg>
          {t('sp.mail')}
        </button>
        {fehler && <p className="sp-fehler">{fehler}</p>}
        <p className="sp-schon">
          {t('sp.schon')} <button type="button" onClick={onAnmelden}>{t('sp.einloggen')}</button>
        </p>
      </div>
    </header>
  )
}
