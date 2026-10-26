import { useEffect, useState } from 'react'
import { istApp } from './api.js'
import { bezahlungBereit } from './premium.js'
import { LISTEN_PRO_TAG, naechsteAuffuellung } from './limits.js'

/**
 * Hinweis, wenn die kostenlosen Generierungen fuer heute aufgebraucht
 * sind – zugleich die Werbung fuer Premium.
 *
 * In der Store-App gibt es keinen Kaufknopf: Ein Verweis auf die
 * Web-Kasse wuerde gegen die Play-Billing-Regeln verstossen.
 *
 * @param {string} was – z. B. "Vokabellisten", "Texte", "Sätze"
 */
export default function PremiumWerbung({ was = 'Generierungen' }) {
  const [bezahlbar, setBezahlbar] = useState(false)

  useEffect(() => {
    if (istApp) return
    bezahlungBereit().then(setBezahlbar).catch(() => setBezahlbar(false))
  }, [])

  // In der Store-App kein Wort über Premium: Apple und Google werten
  // das als Hinweis, ausserhalb des Stores zu kaufen.
  if (istApp) {
    return (
      <div className="premium-werbung">
        <div className="pw-kopf">
          <span className="pw-symbol" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5V12l3 2" />
            </svg>
          </span>
          <div>
            <p className="pw-ueber">Für heute geschafft</p>
            <h3 className="pw-titel">Morgen geht's weiter</h3>
          </div>
        </div>
        <p className="pw-text">
          Deine Generierungen für heute sind aufgebraucht. Neue {was} gibt es{' '}
          {naechsteAuffuellung()} – bis dahin kannst du mit dem Gesammelten üben.
        </p>
      </div>
    )
  }

  function zurKasse() {
    window.history.pushState({ kasse: true }, '', '/kasse')
    window.dispatchEvent(new PopStateEvent('popstate', { state: { kasse: true } }))
    window.scrollTo(0, 0)
  }

  return (
    <div className="premium-werbung">
      <div className="pw-kopf">
        <span className="pw-symbol" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
            <path d="M3 8l4.5 3.5L12 5l4.5 6.5L21 8l-2 11H5L3 8z" />
          </svg>
        </span>
        <div>
          <p className="pw-ueber">Tageslimit erreicht</p>
          <h3 className="pw-titel">
            Mehr lernen mit <span className="accent">Premium</span>
          </h3>
        </div>
      </div>

      <p className="pw-text">
        Deine {LISTEN_PRO_TAG} kostenlosen Generierungen für heute sind aufgebraucht.
        Neue {was} gibt es {naechsteAuffuellung()} – oder sofort und ohne Grenze mit Premium.
      </p>

      <ul className="pw-vorteile">
        <li>Unbegrenzt Vokabellisten, Wörter und Texte</li>
        <li>Unbegrenzt eigene YouTube-Videos</li>
        <li>Zweisprachige E-Books ohne Limit</li>
      </ul>

      {!istApp &&
        (bezahlbar ? (
          <button className="pw-knopf" onClick={zurKasse}>
            Premium freischalten
          </button>
        ) : (
          <p className="pw-bald">Premium ist bald verfügbar</p>
        ))}
    </div>
  )
}
