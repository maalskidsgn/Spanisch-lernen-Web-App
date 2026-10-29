import { useEffect, useState } from 'react'
import Logo from './Logo.jsx'
import {
  ladeAngebote, kaufe, stelleWiederHer, warteAufFreischaltung, plattform,
} from './kauf.js'

/**
 * Die Kasse in der App – Apple App Store oder Google Play.
 *
 * Im Browser übernimmt Bezahlen.jsx mit Stripe. Hier geht es bewusst
 * schlichter zu: Es gibt kein Formular, keine Kartennummer und keine
 * Rechnungsadresse. Der Store fragt das alles selbst ab, sobald man
 * auf den Knopf tippt. Was bleibt, ist die Auswahl.
 */
export default function KaufNativ({ onFertig, onAbbrechen }) {
  const [angebote, setAngebote] = useState(null) // null = lädt
  const [gewaehlt, setGewaehlt] = useState('')
  const [laeuft, setLaeuft] = useState('')       // '' | 'kauf' | 'wieder'
  const [fehler, setFehler] = useState('')
  const [hinweis, setHinweis] = useState('')

  const laden = plattform() === 'ios' ? 'App Store' : 'Google Play'

  useEffect(() => {
    let aktiv = true
    ladeAngebote()
      .then((a) => {
        if (!aktiv) return
        setAngebote(a)
        // Das Jahresabo vorauswählen, sonst das erste – irgendetwas
        // soll markiert sein, damit der Knopf nicht ins Leere zeigt.
        setGewaehlt(a.find((x) => x.id.includes('annual'))?.id || a[0]?.id || '')
      })
      .catch((f) => aktiv && setFehler(f.message))
    return () => { aktiv = false }
  }, [])

  async function kaufen() {
    const a = angebote.find((x) => x.id === gewaehlt)
    if (!a) return
    setFehler('')
    setHinweis('')
    setLaeuft('kauf')
    try {
      const ergebnis = await kaufe(a.paket)
      if (ergebnis === 'abgebrochen') return setLaeuft('')
      setHinweis('Zahlung angenommen. Wird freigeschaltet …')
      // Der Store hat bezahlt, aber unsere Datenbank weiss es erst,
      // wenn die Meldung durch ist. Kurz warten statt den Nutzer mit
      // der Premium-Werbung zurückzulassen.
      await warteAufFreischaltung()
      onFertig?.()
    } catch (f) {
      setFehler(f.message)
    } finally {
      setLaeuft('')
    }
  }

  async function wiederherstellen() {
    setFehler('')
    setHinweis('')
    setLaeuft('wieder')
    try {
      const hat = await stelleWiederHer()
      if (!hat) {
        setHinweis(`Auf diesem ${laden}-Konto ist kein Kauf hinterlegt.`)
        return
      }
      setHinweis('Kauf gefunden. Wird freigeschaltet …')
      await warteAufFreischaltung()
      onFertig?.()
    } catch (f) {
      setFehler(f.message)
    } finally {
      setLaeuft('')
    }
  }

  return (
    <div className="kassen-seite">
      <header className="kassen-kopf">
        <button className="btn-zurueck" onClick={onAbbrechen}>
          <span className="zurueck-pfeil" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                 strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </span>
          Zurück
        </button>
        <Logo />
        <span className="kassen-sicher">über {laden}</span>
      </header>

      <div className="kn">
        <h1 className="kn-titel">Habloo Premium</h1>
        <p className="kn-unter">
          Alle Lektionen, der KI-Trainer, eigene Texte und Sätze – ohne Begrenzung.
        </p>

        {angebote === null ? (
          <p className="kn-laedt">Angebote werden geladen …</p>
        ) : angebote.length === 0 ? (
          <p className="kn-laedt">
            Gerade sind keine Angebote verfügbar. Versuch es später nochmal.
          </p>
        ) : (
          <>
            <div className="kn-tarife" role="radiogroup" aria-label="Tarif wählen">
              {angebote.map((a) => (
                <button
                  key={a.id}
                  role="radio"
                  aria-checked={gewaehlt === a.id}
                  className={'kn-tarif' + (gewaehlt === a.id ? ' ist-aktiv' : '')}
                  onClick={() => setGewaehlt(a.id)}
                  disabled={Boolean(laeuft)}
                >
                  <span className="kn-tarif-name">{a.name}</span>
                  <span className="kn-tarif-preis">{a.preisText}</span>
                  <span className="kn-tarif-zeit">{a.zeitraum}</span>
                </button>
              ))}
            </div>

            <button className="kn-kaufen" onClick={kaufen} disabled={Boolean(laeuft) || !gewaehlt}>
              {laeuft === 'kauf' ? 'Einen Moment …' : 'Jetzt holen'}
            </button>

            {/* Apple verlangt diesen Knopf in jeder App mit Käufen:
                Wer das Handy wechselt, muss ohne Support an seinen
                bezahlten Zugang kommen. */}
            <button className="kn-wieder" onClick={wiederherstellen} disabled={Boolean(laeuft)}>
              {laeuft === 'wieder' ? 'Wird gesucht …' : 'Käufe wiederherstellen'}
            </button>
          </>
        )}

        {hinweis && <p className="kn-hinweis">{hinweis}</p>}
        {fehler && <p className="kn-fehler">{fehler}</p>}

        <p className="kn-klein">
          Abrechnung über dein {laden}-Konto. Abos verlängern sich automatisch, bis du
          sie dort kündigst – das geht jederzeit in den Einstellungen deines Geräts.
        </p>
      </div>
    </div>
  )
}
