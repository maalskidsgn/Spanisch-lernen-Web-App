import { XP } from './gamification.js'
import { API_URL, istApp } from './api.js'
import PremiumWerbung from './PremiumWerbung.jsx'
import { useState, useEffect } from 'react'
import { newEntry } from './srs.js'
import { LISTEN_PRO_TAG, verbleibend, zaehleNutzung, naechsteAuffuellung } from './limits.js'
import { usePremium } from './premium.js'
import { IconFunken } from './icons.jsx'
import { useTexte } from './sprache.js'

// Vokabellisten mit KI erstellen: Thema eingeben (z.B. "Restaurant" oder
// "Fußball"), die KI schlägt 12 passende Vokabeln vor, du wählst aus.
export default function ListGenerator({ vocab, setVocab, addXp }) {
  const t = useTexte()
  const [thema, setThema] = useState('')
  const [wortart, setWortart] = useState('alle') // 'alle'|'verben'|'adjektive'|'nomen'
  const [fertigThema, setFertigThema] = useState('') // Thema der fertigen Liste
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState('')
  const [liste, setListe] = useState(null) // Vorschläge mit Häkchen
  const [erfolg, setErfolg] = useState(false)
  const { premium, laedt: premiumLaedt } = usePremium()
  const [uebrig, setUebrig] = useState(() => verbleibend(premium))
  // Unter fuenf gesammelten Woertern kann die KI nichts erkennen –
  // dann bleibt der KI-Gen-Knopf gesperrt.
  const zuWenige = Object.keys(vocab).length < 5

  // Der Premium-Status kommt erst nach einer kurzen Abfrage an –
  // sobald er da ist, den Rest neu berechnen (Premium = unbegrenzt).
  useEffect(() => {
    setUebrig(verbleibend(premium))
  }, [premium]) // freie Generierungen
  const [begruendung, setBegruendung] = useState('') // warum die KI diese Wörter wählte
  const [infoOffen, setInfoOffen] = useState(false) // Erklärung der Automatik

  /**
   * Holt eine Liste. Ohne Thema übernimmt die KI die Auswahl und
   * richtet sich nach dem, was schon im Trainer liegt.
   */
  async function generieren(e, automatisch = false, direktThema = null) {
    // Das Ereignis ist freiwillig: Der runde Pfeil im Feld hat
    // preventDefault() schon selbst erledigt.
    e?.preventDefault()
    const gefragt = (direktThema ?? thema).trim()
    if ((!automatisch && !gefragt) || uebrig <= 0) return
    setLaden(true)
    setFehler('')
    setErfolg(false)
    setBegruendung('')
    try {
      const res = await fetch(API_URL + '/api/vokabelliste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Die schon gesammelten Wörter mitschicken: so kommen keine
        // Dopplungen zurück und die Liste passt zum eigenen Stand.
        body: JSON.stringify({ sprache: sprache(),
          thema: automatisch ? '' : gefragt,
          wortart,
          bekannt: Object.keys(vocab),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setListe(data.vokabeln.map((v) => ({ ...v, checked: true })))
      setBegruendung(data.begruendung || '')
      setFertigThema(data.thema || gefragt)
      zaehleNutzung() // eine Generierung aus dem gemeinsamen Tageskontingent
      setUebrig(verbleibend(premium))
    } catch (err) {
      setFehler(err.message)
    } finally {
      setLaden(false)
    }
  }

  // Ausgewählte Vokabeln in den Trainer übernehmen
  function uebernehmen() {
    const neu = new Set(liste.filter((s) => s.checked).map((s) => s.wort.toLowerCase()).filter((k) => !vocab[k]))
    if (neu.size) addXp?.(XP.WORT_NEU * neu.size, neu.size === 1 ? 'Wort hinzugefügt' : neu.size + ' Wörter hinzugefügt')
    setVocab((v) => {
      const copy = { ...v }
      for (const s of liste) {
        const key = s.wort.toLowerCase()
        if (!s.checked || copy[key]) continue
        copy[key] = {
          ...newEntry(s.uebersetzung, 'Liste: ' + fertigThema),
          status: 'lernen',
          beispiel: s.beispiel,
        }
      }
      return copy
    })
    setErfolg(true)
    setListe(null)
    setThema('')
  }

  // Kostenloses Kontingent aufgebraucht: Premium-Hinweis statt Formular
  if (uebrig <= 0 && !liste) {
    // Solange der Premium-Stand noch geladen wird: nichts zeigen statt Werbung
    if (premiumLaedt && !premium) return null
    return (
      <div className="list-gen">
        <PremiumWerbung was="Vokabellisten" />
      </div>
    )
  }

  return (
    <div className="list-gen">
      {/* Gleicher Aufbau wie die anderen Bereiche: Überschrift,
          ein Satz zur Einordnung, dann der Inhalt */}
      <div className="gen-kopf">
        <span className="gen-symbol" aria-hidden="true">
          <IconFunken groesse={24} />
        </span>
        <div className="gen-text">
          <h2>{t('lg.kiListengenerator')}</h2>
          <p>{t('lg.erstelleNeueWortlisten')}</p>
        </div>
        {/* Der Zaehler steht nur da, wenn er etwas zu sagen hat.
            Bei vollem Kontingent ist er nur Zierde – kurz vor dem
            Ende ist er die einzige Vorwarnung. */}
        {uebrig <= 2 && (
          <span className="rest-zaehler" title={t('lg.kostenloseListenDiesen')}>
            {uebrig}/{LISTEN_PRO_TAG}
          </span>
        )}
      </div>

      <form className="wort-form" onSubmit={generieren}>
        {/* Schritt 1: Thema – nur auswählen, erzeugt wird unten */}
        <p className="sg-schritt"><span>1</span> {t('lg.themaWaehlen')}</p>
        <div className="sg-themen">
          {['Restaurant', 'Reisen', 'Arbeit', 'Einkaufen', 'Familie', 'Gesundheit'].map((v) => (
            <button
              key={v}
              type="button"
              className={'sg-thema' + (thema === v ? ' ist-aktiv' : '')}
              disabled={laden || uebrig <= 0}
              onClick={() => setThema(thema === v ? '' : v)}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Schritt 2: Wortart – gemischt oder gezielt */}
        <p className="sg-schritt"><span>2</span> {t('lg.wortart')} <small>optional</small></p>
        <div className="sg-themen sg-vier">
          {[
            ['alle', 'Gemischt'],
            ['verben', 'Verben'],
            ['adjektive', 'Adjektive'],
            ['nomen', 'Nomen'],
          ].map(([wert, text]) => (
            <button
              key={wert}
              type="button"
              className={'sg-thema' + (wortart === wert ? ' ist-aktiv' : '')}
              onClick={() => setWortart(wert)}
            >
              {text}
            </button>
          ))}
        </div>

        <div className="gen-feld">
          <input
            type="text"
            value={thema}
            onChange={(e) => setThema(e.target.value)}
            placeholder={t('lg.eigenesThema')}
            disabled={laden}
            required
          />
          <button
            type="submit"
            className="gen-pfeil"
            disabled={laden || !thema.trim()}
            aria-label={t('lg.listeErstellen')}
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
          <button type="submit" className="btn gen-los" disabled={laden || !thema.trim()}>
            {laden ? (
              <>{t('lg.stelltZusammen')}<span className="studio-punkte" /></>
            ) : (
              'Liste erstellen'
            )}
          </button>

          {/* Derselbe Aufruf, nur ohne Thema: Dann sucht die KI
              selbst aus, was zum bisherigen Stand passt. */}
          <button
            type="button"
            className="btn-outline gen-ki"
            onClick={(e) => generieren(e, true)}
            disabled={laden || zuWenige}
            title={zuWenige ? t('lgm.dafuerBrauchstDu') : undefined}
          >
            {t('lg.kiGen')}
          </button>

          <button
            type="button"
            className="gen-info"
            onClick={() => setInfoOffen(!infoOffen)}
            aria-expanded={infoOffen}
            title={t('lg.wasIstDer')}
          >
            {infoOffen ? '×' : '?'}
          </button>
        </div>

        {infoOffen && (
          <div className="gen-erklaerung">
            <p>
              <b>{t('lg.listeErstellen')}</b>{t('lisX.nimmtDeinThema')}</p>
            <p>
              <b>{t('lg.kiGen')}</b>{t('lisX.brauchtKeinThema')}</p>
            <p className="gen-klein">
              Für KI-Gen brauchst du mindestens 5 gesammelte Wörter. Du hast{' '}
              {Object.keys(vocab).length}.
            </p>
          </div>
        )}
      </form>


      {erfolg && <p className="gen-success">{t('lg.listeIstIm')}</p>}

      {fehler === 'premium' && !istApp ? (
        <div className="plan-card plan-premium premium-teaser">
          <div className="plan-name">
            Premium-Funktion <span className="plan-badge badge-soon">{t('lg.baldVerfuegbar')}</span>
          </div>
          <p className="row-hint">{t('lg2.themenVokabellistenErstellt')}</p>
        </div>
      ) : (
        fehler && <p className="error">{fehler}</p>
      )}

      {liste && (
        <div className="gen-list">
          {begruendung && (
            <div className="gen-begruendung">
              <span className="gen-begruendung-marke">{t('lg.warumDieseWoerter')}</span>
              <p>{begruendung}</p>
            </div>
          )}
          <p className="gen-hint">
            Deine Liste zu „{fertigThema}“ – wähle aus, was in den Trainer soll:
          </p>
          {liste.map((s, i) => (
            <label key={i} className="gen-item">
              <input
                type="checkbox"
                checked={s.checked}
                onChange={() =>
                  setListe((l) =>
                    l.map((v, j) => (j === i ? { ...v, checked: !v.checked } : v))
                  )
                }
              />
              <span className="gen-word">{s.wort}</span>
              <span className="gen-translation">{s.uebersetzung}</span>
              {s.beispiel && <span className="gen-example">„{s.beispiel}“</span>}
            </label>
          ))}
          <div className="gen-actions">
            <button onClick={uebernehmen}>
              {liste.filter((s) => s.checked).length} Vokabeln übernehmen
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
