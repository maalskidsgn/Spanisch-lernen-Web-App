import { useEffect, useState } from 'react'
import { istApp } from './api.js'
import { bezahlungBereit } from './premium.js'
import { LISTEN_PRO_TAG, naechsteAuffuellung } from './limits.js'

import { useTexte, sprache } from './sprache.js'
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
  const t = useTexte()
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
            <p className="pw-ueber">{t('pw.fuerHeute')}</p>
            <h3 className="pw-titel">{t('pwk.morgenGehtS')}</h3>
          </div>
        </div>
        <p className="pw-text">
          {sprache() === 'en'
            ? `You've used this month's free creations. New ${was} ${naechsteAuffuellung()} – until then, practise with what you've collected.`
            : `Deine Gratis-Erstellungen für diesen Monat sind aufgebraucht. Neue ${was} gibt es ${naechsteAuffuellung()} – bis dahin kannst du mit dem Gesammelten üben.`}
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
          <p className="pw-ueber">{t('pwk.tageslimitErreicht')}</p>
          <h3 className="pw-titel">
            Mehr lernen mit <span className="accent">{t('pwk.premium')}</span>
          </h3>
        </div>
      </div>

      <p className="pw-text">
        {sprache() === 'en'
          ? `You've used your ${LISTEN_PRO_TAG} free AI creations this month. New ${was} ${naechsteAuffuellung()} – or right now and without limits with Premium.`
          : `Deine ${LISTEN_PRO_TAG} Gratis-Erstellungen für diesen Monat sind aufgebraucht. Neue ${was} gibt es ${naechsteAuffuellung()} – oder sofort und ohne Grenze mit Premium.`}
      </p>

      <ul className="pw-vorteile">
        <li>{t('pw.unbegrenzt')}</li>
        <li>{t('pwk.unbegrenztEigeneYoutube')}</li>
        <li>{t('pwk.zweisprachigeEBooks')}</li>
      </ul>

      {!istApp &&
        (bezahlbar ? (
          <button className="pw-knopf" onClick={zurKasse}>
            {sprache() === 'en' ? 'Unlock Premium' : 'Premium freischalten'}
          </button>
        ) : (
          <p className="pw-bald">{t('pwk.premiumIstBald')}</p>
        ))}
    </div>
  )
}
