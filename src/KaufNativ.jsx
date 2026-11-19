import { useEffect, useState } from 'react'
import Logo from './Logo.jsx'
import PremiumDanke from './PremiumDanke.jsx'
import { KASSEN_TEXTE } from './Bezahlen.jsx'
import BILDER from './kassenBilder.js'
import {
  ladeAngebote, kaufe, stelleWiederHer, warteAufFreischaltung, plattform,
} from './kauf.js'
import { useTexte, sprache } from './sprache.js'

/**
 * Die Kasse in der App – Apple App Store oder Google Play.
 *
 * Im Browser übernimmt Bezahlen.jsx mit Stripe. Hier geht es bewusst
 * schlichter zu: Es gibt kein Formular, keine Kartennummer und keine
 * Rechnungsadresse. Der Store fragt das alles selbst ab, sobald man
 * auf den Knopf tippt. Was bleibt, ist die Auswahl.
 */
// Store-Pakete heißen z. B. „$rc_annual“ oder „…lifetime“ – daraus die Tarifart wie in der Web-Kasse
const artVon = (id = '') => (/annual|year|jahr/i.test(id) ? 'jahr' : /lifetime/i.test(id) ? 'lifetime' : 'monat')

export default function KaufNativ({ onFertig, onAbbrechen }) {
  const KT = KASSEN_TEXTE[sprache() === 'en' ? 'en' : 'de']
  const t = useTexte()
  const [angebote, setAngebote] = useState(null) // null = lädt
  const [gewaehlt, setGewaehlt] = useState('')
  const [laeuft, setLaeuft] = useState('')       // '' | 'kauf' | 'wieder'
  const [fehler, setFehler] = useState('')
  const [hinweis, setHinweis] = useState('')
  const [danke, setDanke] = useState(null) // null | { verzoegert }
  const [ursache, setUrsache] = useState('')

  const laden = plattform() === 'ios' ? 'App Store' : 'Google Play'

  useEffect(() => {
    let aktiv = true
    ladeAngebote()
      .then((a) => {
        if (!aktiv) return
        setAngebote(a)
        if (!a.length) setUrsache('leer')
        // Das Jahresabo vorauswählen, sonst das erste – irgendetwas
        // soll markiert sein, damit der Knopf nicht ins Leere zeigt.
        setGewaehlt(a.find((x) => x.id.includes('annual'))?.id || a[0]?.id || '')
      })
      .catch((f) => {
        // Rohe Fehlertexte des Kauf-Dienstes sind nichts für Nutzer,
        // zur Fehlersuche bleiben sie unter „Details“ aufklappbar.
        console.warn(f)
        if (!aktiv) return
        setUrsache([f.code, f.underlyingErrorMessage || f.message].filter(Boolean).join(': '))
        setAngebote([])
      })
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
      setHinweis(t('knm.zahlungAngenommenWird'))
      // Der Store hat bezahlt, aber unsere Datenbank weiss es erst,
      // wenn die Meldung durch ist. Kurz warten statt den Nutzer mit
      // der Premium-Werbung zurückzulassen.
      const frei = await warteAufFreischaltung()
      setDanke({ verzoegert: !frei })
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
        setHinweis(t('kn.keinKauf', { laden }))
        return
      }
      setHinweis(t('knm.kaufGefundenWird'))
      await warteAufFreischaltung()
      onFertig?.()
    } catch (f) {
      setFehler(f.message)
    } finally {
      setLaeuft('')
    }
  }

  if (danke) return <PremiumDanke verzoegert={danke.verzoegert} onWeiter={onFertig} />

  return (
    <div className="kassen-seite">
      <header className="kassen-kopf">
        <button className="btn-zurueck" onClick={onAbbrechen}>
          <span className="zurueck-pfeil" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                 strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </span>{t('kn2.zurueck')}</button>
        <Logo />
        <span className="kassen-sicher">über {laden}</span>
      </header>

      <div className="kn kn-a">
        {/* Entwurf A wie die Web-Kasse (18.11.2026, Manuel): Pokal-Bühne,
            Tarifkarten und die goldene Schatzkammer „Das schaltest du frei“ */}
        <div className="ka-held">
          <div className="ka-held-text">
            <span className="ka-eyebrow">{KT.marke}</span>
            <h1 className="kassen-titel">{KT.titel1} <em>{KT.titel2}</em></h1>
            <p className="ka-lead">{KT.lead}</p>
          </div>
          <div className="ka-pokal" aria-hidden="true" dangerouslySetInnerHTML={{ __html: BILDER.pokal + BILDER.buehne }} />
        </div>

        <div className="ka-karte">
        {angebote === null ? (
          <p className="kn-laedt">{t('kn.angeboteWerdenGeladen')}</p>
        ) : angebote.length === 0 ? (
          <p className="kn-laedt">{t('kn2.geradeSindKeine')}</p>
        ) : (
          <>
            <div className="kassen-tarife" role="radiogroup" aria-label={t('kn.tarifWaehlen')}>
              {angebote.map((a) => {
                const art = artVon(a.id)
                const marke = art === 'jahr' ? (sprache() === 'en' ? 'Popular' : 'Beliebt') : art === 'lifetime' ? (sprache() === 'en' ? 'Forever' : 'Für immer') : ''
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={gewaehlt === a.id}
                    className={'kassen-tarif tarif-' + art + (gewaehlt === a.id ? ' ist-aktiv' : '')}
                    onClick={() => setGewaehlt(a.id)}
                    disabled={Boolean(laeuft)}
                  >
                    {marke && <span className="kassen-tarif-marke">{marke}</span>}
                    <span className="kassen-tarif-name">{a.name}</span>
                    <b>{a.preisText}</b>
                    <span className="kassen-tarif-unter">{a.zeitraum}</span>
                  </button>
                )
              })}
            </div>

            <div className="ka-schatz">
              <span className="ka-strahlen" aria-hidden="true" />
              <div className="ka-schatz-kopf">
                <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: BILDER.krone }} />
                <b>{KT.freiTitel}</b>
                <span className="ka-pill">{KT.sofort}</span>
              </div>
              <ul className="ka-inseln">
                {KT.vorteile.map(([icon, titel, prem, gratis], n) => (
                  <li key={titel} className={'ka-insel' + (KT.vorteile.length === 5 && n > 2 ? ' ka-breit' : '')}>
                    <span className="ka-haken" aria-hidden="true" dangerouslySetInnerHTML={{ __html: BILDER.haken }} />
                    <span className="ka-bild" aria-hidden="true" dangerouslySetInnerHTML={{ __html: '<span class="ka-halo"></span>' + BILDER.icons[icon] + (n % 2 ? BILDER.trommel2 : BILDER.trommel1) }} />
                    <span className="ka-txt">
                      <b>{titel}</b>
                      <span className="ka-prem">{prem}</span>
                      <small>{KT.gratis}: {gratis}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button className="kn-kaufen" onClick={kaufen} disabled={Boolean(laeuft) || !gewaehlt}>
              {laeuft === 'kauf' ? t('kn.einenMoment') : t('kn.jetztHolen')}
            </button>

            {/* Apple verlangt diesen Knopf in jeder App mit Käufen:
                Wer das Handy wechselt, muss ohne Support an seinen
                bezahlten Zugang kommen. */}
            <button className="kn-wieder" onClick={wiederherstellen} disabled={Boolean(laeuft)}>
              {laeuft === 'wieder' ? t('kn.wirdGesucht') : t('kn.kaeufeWiederherstellen')}
            </button>
          </>
        )}
        </div>

        {ursache && (
          <details className="kn-klein">
            <summary>{t('kn2.details')}</summary>
            {ursache}
          </details>
        )}

        {hinweis && <p className="kn-hinweis">{hinweis}</p>}
        {fehler && <p className="kn-fehler">{fehler}</p>}

        <p className="kn-klein">{t('kn.abrechnung', { laden })}</p>
        <p className="kn-rechtliches">
          <a href="https://habloo.de/agb" target="_blank" rel="noreferrer">{t('kn.nutzungsbedingungen')}</a>
          <a href="https://habloo.de/datenschutz" target="_blank" rel="noreferrer">{t('kn.datenschutz')}</a>
        </p>
      </div>
    </div>
  )
}
