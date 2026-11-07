import { useState, useEffect } from 'react'
import ZauberBild from './ZauberBild.jsx'
import ThemaBild from './ThemaBild.jsx'
import PremiumWerbung from './PremiumWerbung.jsx'
import { API_URL } from './api.js'
import { neuerSatz, satzSchluessel } from './saetze.js'
import { LISTEN_PRO_TAG, verbleibend, zaehleNutzung } from './limits.js'
import { usePremium } from './premium.js'
import { IconFunken } from './icons.jsx'
import { useTexte } from './sprache.js'

// Themen wie beim Vokabelgenerator – dieselbe Sprache, dieselbe
// Bedienung. Ein Tipp erzeugt sofort, ohne erst ein Feld zu füllen.
const THEMEN = [
  ['Reisen', 'thema.reisen'],
  ['Arbeit', 'thema.arbeit'],
  ['Restaurant', 'thema.restaurant'],
  ['Einkaufen', 'thema.einkaufen'],
  ['Gesundheit', 'thema.gesundheit'],
  ['Familie', 'thema.familie'],
]

// Die Zeitformen, die der Server kennt (server/saetze.js). Hier
// stehen sie mit ihrem Alltagsnamen daneben: "Condicional" sagt
// Anfängern wenig, "würde …" sofort etwas.
const ZEITFORMEN = [
  ['', 'wortart.gemischt', 'sg2.alleZeiten'],
  ['presente', 'Presente', 'sg9.gegenwart'],
  ['perfecto', 'Perfecto', 'he hablado'],
  ['indefinido', 'Indefinido', 'hablé'],
  ['imperfecto', 'Imperfecto', 'hablaba'],
  ['futuro', 'Futuro', 'hablaré'],
  ['condicional', 'Condicional', 'sg9.wuerdeForm'],
  ['subjuntivo', 'Subjuntivo', 'que hable'],
]

/**
 * Sätze mit KI erzeugen und in den Satz-Trainer übernehmen.
 *
 * Zwei Vorgaben lassen sich frei kombinieren: ein Thema und eine
 * Zeitform. "Reisen" + "Condicional" ergibt genau die Sätze, die man
 * für eine höfliche Anfrage im Hotel braucht.
 */
export default function SatzGenerator({ saetze, setSaetze }) {
  const t = useTexte()
  const [thema, setThema] = useState('')
  const [zeitform, setZeitform] = useState('')
  const [liste, setListe] = useState(null)
  const [fertig, setFertig] = useState({ thema: '', zeitform: '', hinweis: '' })
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState('')
  const [erfolg, setErfolg] = useState(0) // wie viele gerade übernommen wurden
  const { premium, laedt: premiumLaedt } = usePremium()
  const [uebrig, setUebrig] = useState(() => verbleibend(premium))
  // Premium kommt erst nach dem Laden – dann das Kontingent neu setzen
  useEffect(() => {
    setUebrig(verbleibend(premium))
  }, [premium])

  const bekannt = Object.values(saetze).map((s) => s.anzeige ?? '')

  async function generieren(e, direktThema = null) {
    e?.preventDefault()
    const gefragt = (direktThema ?? thema).trim()
    // Ohne Thema geht es nur, wenn wenigstens eine Zeitform gewählt
    // ist – sonst wüsste die KI nicht, worüber sie schreiben soll.
    if (!gefragt && !zeitform && bekannt.length < 5) return
    if (uebrig <= 0) return

    setLaden(true)
    setFehler('')
    setErfolg(0)
    try {
      const res = await fetch(API_URL + '/api/saetze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thema: gefragt, zeitform, bekannt }),
      })
      const daten = await res.json()
      if (!res.ok) throw new Error(daten.error || t('sgnm.dasHatNicht'))

      setListe(daten.saetze.map((s) => ({ ...s, checked: true })))
      setFertig({
        thema: daten.thema || gefragt,
        zeitform: daten.zeitform || '',
        hinweis: daten.hinweis || '',
      })
      zaehleNutzung()
      setUebrig(verbleibend(premium))
    } catch (f) {
      setFehler(f.message)
    } finally {
      setLaden(false)
    }
  }

  /** Die angehakten Sätze in den Karteikasten legen. */
  function uebernehmen() {
    let gezaehlt = 0
    setSaetze((alt) => {
      const neu = { ...alt }
      for (const s of liste) {
        const key = satzSchluessel(s.satz)
        if (!s.checked || neu[key]) continue
        neu[key] = neuerSatz(s, { thema: fertig.thema, zeitform: fertig.zeitform })
        gezaehlt++
      }
      return neu
    })
    setErfolg(liste.filter((s) => s.checked).length)
    setListe(null)
    setThema('')
  }

  // Durch t(): Der erste Eintrag ist ein Schluessel, die anderen bleiben
  // unveraendert - unbekannte Texte gibt t() so zurueck, wie sie sind.
  const zeitformName = t(ZEITFORMEN.find(([w]) => w === fertig.zeitform)?.[1] ?? '')

  // Kontingent aufgebraucht
  if (uebrig <= 0 && !liste) {
    // Solange der Premium-Stand noch geladen wird: nichts zeigen statt Werbung
    if (premiumLaedt && !premium) return null
    return (
      <div className="list-gen">
        <PremiumWerbung was={t('sg9.wasSaetze')} />
      </div>
    )
  }

  return (
    <div className="list-gen satz-gen">
      <div className="gen-kopf">
        <ZauberBild art="saetze" />
        <div className="gen-text">
          <h2>{t('sgn.saetzeErzeugen')}</h2>
          <p>{t('sgn.waehleEinThema')}</p>
        </div>
        {uebrig <= 2 && (
          <span className="rest-zaehler" title={t('sgn.kostenloseGenerierungenHeute')}>
            {uebrig}/{LISTEN_PRO_TAG}
          </span>
        )}
      </div>

      <form className="wort-form" onSubmit={generieren}>
        {/* Schritt 1: Thema – nur auswählen, erzeugt wird unten */}
        <p className="sg-schritt"><span>1</span> {t('sgn.themaWaehlen')}</p>
        <div className="sg-themen">
          {THEMEN.map(([wert, schluessel]) => (
            <button
              key={wert}
              type="button"
              className={'sg-thema' + (thema === wert ? ' ist-aktiv' : '')}
              disabled={laden}
              onClick={() => setThema(thema === wert ? '' : wert)}
            >
              <ThemaBild name={wert} />
              {t(schluessel)}
            </button>
          ))}
        </div>

        {/* Schritt 2: Zeitform – bleibt gewählt */}
        <p className="sg-schritt"><span>2</span> {t('sgn.zeitform')} <small>{t('lt.optional')}</small></p>
        <div className="sg-formen">
          {ZEITFORMEN.map(([wert, name, hilfe]) => (
            <button
              key={wert || 'alle'}
              type="button"
              className={'sg-form' + (zeitform === wert ? ' ist-aktiv' : '')}
              onClick={() => setZeitform(wert)}
            >
              <b>{t(name)}</b>
              <span>{t(hilfe)}</span>
            </button>
          ))}
        </div>

        <div className="gen-feld">
          <input
            type="text"
            value={thema}
            onChange={(e) => setThema(e.target.value)}
            placeholder={t('sgn.eigenesThema')}
            disabled={laden}
          />
          <button
            type="submit"
            className="gen-pfeil"
            disabled={laden || (!thema.trim() && !zeitform)}
            aria-label={t('sgn.saetzeErzeugen')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M4 12h15M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="gen-knoepfe">
          <button
            type="submit"
            className="btn gen-los"
            disabled={laden || (!thema.trim() && !zeitform)}
          >
            {laden ? (
              <>{t('sgn.schreibtSaetze')}<span className="studio-punkte" /></>
            ) : zeitform && !thema.trim() ? (
              t('sg9.saetzeZum', { zeitform: t(ZEITFORMEN.find(([w]) => w === zeitform)?.[1] ?? '') })
            ) : (
              t('sg9.saetzeErzeugen')
            )}
          </button>
        </div>
      </form>

      {erfolg > 0 && (
        <p className="gen-success">
          {erfolg} {erfolg === 1 ? t('sg9.satz') : t('sg9.saetze')} im Trainer! ✓
        </p>
      )}
      {fehler && <p className="error">{fehler}</p>}

      {/* Die Übersicht: alles ankreuzbar, dann übernehmen */}
      {liste && (
        <div className="gen-list">
          {fertig.hinweis && (
            <div className="gen-begruendung">
              <span className="gen-begruendung-marke">{t('sgn.woraufDuAchten')}</span>
              <p>{fertig.hinweis}</p>
            </div>
          )}
          <p className="gen-hint">
            {t('sg9.saetzeZuWaehle', { thema: fertig.thema, zeitform: zeitformName ? ` · ${zeitformName}` : '' })}
          </p>
          {liste.map((s, i) => (
            <label key={i} className="gen-item satz-item">
              <input
                type="checkbox"
                checked={s.checked}
                onChange={() =>
                  setListe((l) => l.map((v, j) => (j === i ? { ...v, checked: !v.checked } : v)))
                }
              />
              <span className="satz-es">{s.satz}</span>
              <span className="satz-de">{s.uebersetzung}</span>
              {s.schluessel && <span className="satz-schluessel">{s.schluessel}</span>}
            </label>
          ))}
          <div className="gen-actions">
            <button onClick={uebernehmen} disabled={!liste.some((s) => s.checked)}>
              {liste.filter((s) => s.checked).length} Sätze übernehmen
            </button>
            <button className="btn-plain" onClick={() => setListe(null)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
