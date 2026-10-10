/**
 * Das Bezahlformular – in der App, nicht auf einer Stripe-Seite.
 *
 * Vorher wurde der Nutzer auf checkout.stripe.com weitergeleitet:
 * fremde Adresse in der Leiste, fremdes Design, Habloo nur als
 * kleines Logo. Jetzt bleibt er auf habloo.de, und das Formular
 * sieht aus wie der Rest der App.
 *
 * Wie das geht, ohne dass wir Kartendaten anfassen: Stripe liefert
 * die Eingabefelder in einem abgeschirmten Rahmen (iframe) zu. Die
 * Kartennummer wandert von dort direkt zu Stripe – unser Server
 * bekommt sie nie zu sehen, genau wie vorher. Nur das Aussehen
 * dieser Felder geben wir vor: über das `appearance`-Objekt unten,
 * das die Habloo-Farben und -Schrift hineinreicht.
 */

import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from '@stripe/react-stripe-js/checkout'
import { API_URL } from './api.js'
import { db, supabaseBereit } from './supabase.js'

// ---------------------------------------------------------------
//  Habloo-Aussehen für die Stripe-Felder
// ---------------------------------------------------------------
//
// Dieselben Werte wie in App.css – nur müssen sie hier als feste
// Zeichenketten stehen: Das Formular läuft in einem eigenen Rahmen
// und kommt an unsere CSS-Variablen nicht heran.
const AUSSEHEN = {
  theme: 'flat',
  variables: {
    colorPrimary: '#ff6c00',      // Sol – Habloos Orange
    colorBackground: '#ffffff',
    colorText: '#000041',         // Navy
    colorDanger: '#ff4b4b',
    colorTextSecondary: '#756a5c',
    colorTextPlaceholder: '#a79b8c',
    fontFamily: "'Nunito', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    fontSizeBase: '15px',
    borderRadius: '14px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1px solid #eee8e0',
      boxShadow: 'none',
      padding: '12px 14px',
      backgroundColor: '#ffffff',
    },
    '.Input:focus': {
      border: '1px solid #ff6c00',
      boxShadow: '0 0 0 3px rgba(255, 108, 0, .12)',
      outline: 'none',
    },
    '.Input--invalid': { border: '1px solid #ff4b4b', boxShadow: 'none' },
    '.Label': {
      fontWeight: '700',
      fontSize: '13px',
      color: '#756a5c',
      marginBottom: '6px',
    },
    '.Tab': {
      border: '1px solid #eee8e0',
      boxShadow: 'none',
      backgroundColor: '#ffffff',
    },
    '.Tab:hover': { border: '1px solid #ff6c00', color: '#ff6c00' },
    '.Tab--selected': {
      border: '1px solid #ff6c00',
      backgroundColor: '#fff3e8',
      color: '#ff6c00',
      boxShadow: 'none',
    },
    '.Error': { fontSize: '13px', fontWeight: '600' },
  },
}

// Stripe.js wird einmal geladen und dann wiederverwendet. Der
// Schlüssel kommt vom Server (siehe /api/bezahlung/status), damit
// derselbe Build für Test- und Echtbetrieb passt.
let stripeLader = null
function stripeHolen(schluessel) {
  if (!stripeLader) stripeLader = loadStripe(schluessel)
  return stripeLader
}

/**
 * Öffnet das Bezahlformular.
 *
 * @param {Function} onFertig    – nach erfolgreicher Zahlung
 * @param {Function} onAbbrechen – Nutzer will doch nicht
 * @param {string}   preis       – fertig formatiert, z. B. "4,99 € / Monat"
 */
export default function Bezahlen({ onFertig, onAbbrechen, preis }) {
  const [clientSecret, setClientSecret] = useState(null)
  const [stripe, setStripe] = useState(null)
  const [fehler, setFehler] = useState('')

  useEffect(() => {
    let abgebrochen = false

    async function vorbereiten() {
      try {
        if (!supabaseBereit) throw new Error('Bitte zuerst anmelden.')
        const { data } = await db.auth.getSession()
        const token = data?.session?.access_token
        if (!token) throw new Error('Bitte zuerst anmelden.')

        // Den öffentlichen Schlüssel und den Bezahlvorgang parallel
        // holen – zusammen dauert es sonst doppelt so lang.
        const [status, start] = await Promise.all([
          fetch(API_URL + '/api/bezahlung/status').then((r) => r.json()),
          fetch(API_URL + '/api/bezahlung/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({ herkunft: window.location.origin, art: 'elements' }),
          }).then((r) => r.json()),
        ])

        if (abgebrochen) return
        if (start.error) throw new Error(start.error)
        if (!status.schluessel) {
          throw new Error(
            'Auf dem Server fehlt der öffentliche Stripe-Schlüssel (STRIPE_PUBLIC_KEY).'
          )
        }
        if (!start.clientSecret) throw new Error('Der Bezahlvorgang kam unvollständig zurück.')

        const s = await stripeHolen(status.schluessel)
        if (abgebrochen) return
        setStripe(s)
        setClientSecret(start.clientSecret)
      } catch (f) {
        if (!abgebrochen) setFehler(f.message)
      }
    }

    vorbereiten()
    return () => {
      abgebrochen = true
    }
  }, [])

  if (fehler) {
    return (
      <div className="kasse">
        <p className="error">{fehler}</p>
        <button className="btn-plain" onClick={onAbbrechen}>
          Zurück
        </button>
      </div>
    )
  }

  if (!clientSecret || !stripe) {
    return (
      <div className="kasse kasse-laedt">
        <span className="kasse-spinner" aria-hidden="true" />
        <p>Bezahlung wird vorbereitet …</p>
      </div>
    )
  }

  return (
    <div className="kasse">
      <div className="kasse-kopf">
        <h2>Habloo Premium</h2>
        {preis && <p className="kasse-preis">{preis}</p>}
      </div>

      <CheckoutElementsProvider
        stripe={stripe}
        options={{ clientSecret, elementsOptions: { appearance: AUSSEHEN } }}
      >
        <KassenFormular onFertig={onFertig} onAbbrechen={onAbbrechen} />
      </CheckoutElementsProvider>
    </div>
  )
}

/** Das eigentliche Formular – braucht den Provider darüber. */
function KassenFormular({ onFertig, onAbbrechen }) {
  const zustand = useCheckoutElements()
  const [laeuft, setLaeuft] = useState(false)
  const [fehler, setFehler] = useState('')

  if (zustand.type === 'loading') {
    return (
      <div className="kasse-laedt">
        <span className="kasse-spinner" aria-hidden="true" />
        <p>Einen Moment …</p>
      </div>
    )
  }

  if (zustand.type === 'error') {
    return <p className="error">{zustand.error.message}</p>
  }

  const kasse = zustand.checkout
  const summe = kasse.total?.total?.amount

  async function bezahlen(e) {
    e.preventDefault()
    if (laeuft) return
    setLaeuft(true)
    setFehler('')

    const ergebnis = await kasse.confirm()
    // Bei Erfolg schickt Stripe den Browser zur return_url – wir
    // landen hier also nur, wenn etwas schiefging ODER wenn keine
    // Weiterleitung nötig war.
    if (ergebnis.type === 'error') {
      setFehler(ergebnis.error.message)
      setLaeuft(false)
      return
    }
    onFertig?.()
  }

  return (
    <form className="kasse-form" onSubmit={bezahlen}>
      <PaymentElement options={{ layout: 'accordion' }} />

      {fehler && <p className="error kasse-fehler">{fehler}</p>}

      <button type="submit" className="btn kasse-los" disabled={!kasse.canConfirm || laeuft}>
        {laeuft ? (
          <>Zahlung läuft<span className="studio-punkte" /></>
        ) : summe ? (
          `${summe} bezahlen`
        ) : (
          'Jetzt bezahlen'
        )}
      </button>

      <button type="button" className="btn-plain" onClick={onAbbrechen} disabled={laeuft}>
        Abbrechen
      </button>

      <p className="kasse-hinweis">
        Die Zahlung wickelt Stripe ab. Deine Kartendaten bekommen wir nie zu
        sehen. Monatlich kündbar.
      </p>
    </form>
  )
}
