/**
 * Die Kassenseite – eine eigene Seite auf habloo.de.
 *
 * Vorher wurde der Nutzer auf checkout.stripe.com weitergeleitet:
 * fremde Adresse in der Leiste, fremdes Design, Habloo nur als
 * kleines Logo. Jetzt liegt die Kasse unter habloo.de/kasse und
 * sieht aus wie der Rest der App.
 *
 * Aufbau wie bei jeder Kasse: links steht, was man kauft und was es
 * kostet, rechts bezahlt man. Auf dem Handy untereinander.
 *
 * Wie das geht, ohne dass wir Kartendaten anfassen: Stripe liefert
 * die Eingabefelder in einem abgeschirmten Rahmen (iframe) zu. Die
 * Kartennummer wandert von dort direkt zu Stripe – unser Server
 * bekommt sie nie zu sehen. Nur das Aussehen dieser Felder geben
 * wir vor, über das `appearance`-Objekt unten.
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
import Logo from './Logo.jsx'

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

// Was Premium kann – dieselbe Liste wie in den Einstellungen.
const LEISTUNGEN = [
  'Unbegrenzte KI-Vokabellisten',
  'Unbegrenzte Sätze und zweisprachige E-Books',
  'Eigene Videos ohne Begrenzung',
  'KI-Trainer ohne Tageslimit',
]

// Stripe.js wird einmal geladen und dann wiederverwendet. Der
// Schlüssel kommt vom Server (/api/bezahlung/status), damit
// derselbe Build für Test- und Echtbetrieb passt.
let stripeLader = null
function stripeHolen(schluessel) {
  if (!stripeLader) {
    stripeLader = loadStripe(schluessel, {
      // Stripes "Testing Assistant" abschalten: ein schwarzes
      // Entwickler-Fenster unten rechts, das Stripe von sich aus
      // einblendet, solange der Testmodus läuft. Es erscheint nicht
      // nur bei uns, sondern bei JEDEM Besucher der Kasse – und
      // verdeckt dort die halbe Zahlungsspalte.
      developerTools: { assistant: { enabled: false } },
    })
  }
  return stripeLader
}

/**
 * Die Kassenseite.
 *
 * @param {Function} onFertig    – nach erfolgreicher Zahlung
 * @param {Function} onAbbrechen – zurück in die App
 */
export default function Bezahlen({ onFertig, onAbbrechen }) {
  const [clientSecret, setClientSecret] = useState(null)
  const [stripe, setStripe] = useState(null)
  const [preise, setPreise] = useState(null) // { monat, jahr, lifetime }
  const [tarif, setTarif] = useState('jahr')
  const [fehler, setFehler] = useState('')

  useEffect(() => {
    let abgebrochen = false

    async function vorbereiten() {
      setClientSecret(null)
      setFehler('')
      try {
        if (!supabaseBereit) throw new Error('Bitte zuerst anmelden.')
        const { data } = await db.auth.getSession()
        const token = data?.session?.access_token
        if (!token) throw new Error('Bitte zuerst anmelden.')

        // Preis, Schlüssel und Bezahlvorgang parallel holen –
        // nacheinander dauerte es dreimal so lang.
        const [status, start] = await Promise.all([
          fetch(API_URL + '/api/bezahlung/status').then((r) => r.json()),
          fetch(API_URL + '/api/bezahlung/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({ herkunft: window.location.origin, art: 'elements', tarif }),
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
        setPreise(status.preise ?? (status.preis ? { monat: status.preis } : null))
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
  }, [tarif]) // anderer Tarif = neuer Bezahlvorgang

  const geld = (p) =>
    p ? p.betrag.toLocaleString('de-DE', { style: 'currency', currency: p.waehrung }) : null
  const preis = preise?.[tarif] ?? null
  const preisText = geld(preis)
  const zeitraum = { monat: 'pro Monat', jahr: 'pro Jahr', lifetime: 'einmalig' }[tarif]
  const abrechnung = {
    monat: 'monatlich, jederzeit kündbar',
    jahr: 'jährlich, jederzeit kündbar',
    lifetime: 'einmal zahlen, für immer',
  }[tarif]
  // Ersparnis des Jahrestarifs gegenueber 12 Monaten
  const ersparnis =
    preise?.monat && preise?.jahr
      ? Math.round((1 - preise.jahr.betrag / (preise.monat.betrag * 12)) * 100)
      : null
  const TARIF_KARTEN = [
    { id: 'monat', name: 'Monatlich', unter: 'pro Monat' },
    {
      id: 'jahr',
      name: 'Jährlich',
      unter: preise?.jahr ? `≈ ${geld({ ...preise.jahr, betrag: preise.jahr.betrag / 12 })} / Monat` : 'pro Jahr',
      marke: ersparnis > 0 ? `−${ersparnis} %` : 'Beliebt',
    },
    { id: 'lifetime', name: 'Lifetime', unter: 'einmalig, für immer' },
  ].filter((k) => preise?.[k.id])

  return (
    <div className="kassen-seite">
      {/* Eigener Kopf statt der Tab-Leiste: Auf einer Kassenseite
          soll man bezahlen, nicht weiterklicken. */}
      <header className="kassen-kopf">
        <button className="btn-zurueck" onClick={onAbbrechen}>
          <span className="zurueck-pfeil" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></span>Zurück
        </button>
        <Logo />
        <span className="kassen-sicher" title="Verschlüsselte Verbindung">
          <SchlossIcon /> Sichere Zahlung
        </span>
      </header>

      <div className="kassen-raster">
        {/* ---------- Links: was man kauft ---------- */}
        <aside className="kassen-bestellung">
          <p className="kassen-label">{tarif === 'lifetime' ? 'Dein Zugang' : 'Dein Abo'}</p>
          <h1 className="kassen-titel">Habloo Premium</h1>
          {TARIF_KARTEN.length > 1 && (
            <div className="kassen-tarife" role="radiogroup" aria-label="Tarif wählen">
              {TARIF_KARTEN.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  role="radio"
                  aria-checked={tarif === k.id}
                  className={'kassen-tarif' + (tarif === k.id ? ' ist-aktiv' : '')}
                  onClick={() => setTarif(k.id)}
                >
                  {k.marke && <span className="kassen-tarif-marke">{k.marke}</span>}
                  <span className="kassen-tarif-name">{k.name}</span>
                  <b>{geld(preise[k.id])}</b>
                  <span className="kassen-tarif-unter">{k.unter}</span>
                </button>
              ))}
            </div>
          )}

          {preisText && (
            <p className="kassen-grosspreis">
              {preisText} <span>{zeitraum}</span>
            </p>
          )}

          <ul className="kassen-leistungen">
            {LEISTUNGEN.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>

          {preisText && (
            <div className="kassen-summe">
              <div className="kassen-zeile">
                <span>Habloo Premium</span>
                <span>{preisText}</span>
              </div>
              <div className="kassen-zeile kassen-zeile-klein">
                <span>Abrechnung</span>
                <span>{abrechnung}</span>
              </div>
              <div className="kassen-zeile kassen-gesamt">
                <span>Heute fällig</span>
                <span>{preisText}</span>
              </div>
            </div>
          )}
        </aside>

        {/* ---------- Rechts: bezahlen ---------- */}
        <section className="kassen-zahlung">
          {fehler ? (
            <>
              <p className="error">{fehler}</p>
              <button className="btn-plain" onClick={onAbbrechen}>
                Zurück zur App
              </button>
            </>
          ) : !clientSecret || !stripe ? (
            <div className="kasse-laedt">
              <span className="kasse-spinner" aria-hidden="true" />
              <p>Bezahlung wird vorbereitet …</p>
            </div>
          ) : (
            <CheckoutElementsProvider
              stripe={stripe}
              options={{ clientSecret, elementsOptions: { appearance: AUSSEHEN } }}
            >
              <KassenFormular onFertig={onFertig} onAbbrechen={onAbbrechen} />
            </CheckoutElementsProvider>
          )}
        </section>
      </div>

      <footer className="kassen-fuss">
        <p>
          Die Zahlung wickelt Stripe ab – deine Kartendaten bekommen wir nie zu
          sehen.{' '}
          {tarif === 'lifetime'
            ? 'Einmalige Zahlung – kein Abo, keine Verlängerung.'
            : 'Jederzeit kündbar in den Einstellungen.'}
        </p>
      </footer>
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
      <h2 className="kassen-abschnitt">Zahlungsart</h2>
      <PaymentElement options={{ layout: 'accordion' }} />

      {fehler && <p className="error kasse-fehler">{fehler}</p>}

      <button type="submit" className="btn kasse-los" disabled={!kasse.canConfirm || laeuft}>
        {laeuft ? (
          <>Zahlung läuft<span className="studio-punkte" /></>
        ) : summe ? (
          `${summe} zahlungspflichtig abonnieren`
        ) : (
          'Zahlungspflichtig abonnieren'
        )}
      </button>

      <button type="button" className="btn-plain" onClick={onAbbrechen} disabled={laeuft}>
        Abbrechen
      </button>
    </form>
  )
}

function SchlossIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path
        d="M6 10V7a6 6 0 0 1 12 0v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <rect x="4" y="10" width="16" height="11" rx="2.5" fill="currentColor" />
    </svg>
  )
}
