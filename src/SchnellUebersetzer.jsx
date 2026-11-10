import { useState, useRef, useEffect } from 'react'
import { API_URL } from './api.js'
import { loginKopf } from './limits.js'
import { sprache } from './sprache.js'

/**
 * Schnell-Übersetzer auf der Startseite (09.11.2026).
 *
 * Wort in beliebiger Richtung eintippen (Muttersprache oder Spanisch),
 * Treffer mit Regionshinweis + Beispielsatz, ein Tipp legt das Wort in
 * den Vokabeltrainer. Ersetzt das Nachschlagen bei Google.
 * Server: /api/schnell (server/schnelluebersetzer.js).
 * Aufruf mit #uebersetzen in der Adresse setzt den Cursor gleich ins Feld.
 */
const TEXT = {
  de: {
    titel: 'Wort nachschlagen',
    unter: 'Deutsch oder Spanisch eintippen – ein Tipp, und es liegt im Trainer.',
    platz: 'z. B. Strohhalm oder la pileta',
    los: 'Übersetzen',
    rein: 'In den Trainer',
    drin: 'Im Trainer',
    neu: 'Neues Wort',
  },
  en: {
    titel: 'Look up a word',
    unter: 'Type English or Spanish – one tap and it’s in your trainer.',
    platz: 'e.g. straw or la pileta',
    los: 'Translate',
    rein: 'Add to trainer',
    drin: 'In trainer',
    neu: 'New word',
  },
}

const LUPE = (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.6" />
    <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
)

export default function SchnellUebersetzer({ vocab = {}, onAddVocab }) {
  const T = TEXT[sprache() === 'en' ? 'en' : 'de']
  const [q, setQ] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')
  const [daten, setDaten] = useState(null)
  const [frisch, setFrisch] = useState(() => new Set()) // gerade hinzugefügt
  const feld = useRef(null)

  useEffect(() => {
    if (window.location.hash === '#uebersetzen') {
      feld.current?.scrollIntoView({ block: 'center' })
      feld.current?.focus()
    }
  }, [])

  async function suchen(e) {
    e?.preventDefault()
    const wort = q.trim()
    if (!wort || laedt) return
    setLaedt(true)
    setFehler('')
    try {
      const res = await fetch(API_URL + '/api/schnell?q=' + encodeURIComponent(wort) + '&sprache=' + sprache(), { headers: await loginKopf() })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Fehler')
      setDaten(d)
    } catch (f) {
      setDaten(null)
      setFehler(f.message)
    } finally {
      setLaedt(false)
    }
  }

  function hinzufuegen(t) {
    const uebersetzung = t.hinweis ? `${t.uebersetzung} (${t.hinweis})` : t.uebersetzung
    onAddVocab?.([{ wort: t.wort, uebersetzung, quelle: sprache() === 'en' ? 'Looked up' : 'Nachgeschlagen' }])
    setFrisch((s) => new Set(s).add(t.wort.toLowerCase()))
  }

  function neu() {
    setQ('')
    setDaten(null)
    setFehler('')
    feld.current?.focus()
  }

  return (
    <section className="schnell" aria-label={T.titel}>
      <div className="schnell-kopf">
        <span className="schnell-symbol" aria-hidden="true">{LUPE}</span>
        <div>
          <h2>{T.titel}</h2>
          <p>{T.unter}</p>
        </div>
      </div>

      <form className="schnell-form" onSubmit={suchen}>
        <input
          ref={feld}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={T.platz}
          maxLength={60}
          enterKeyHint="search"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <button type="submit" className="schnell-los" disabled={!q.trim() || laedt}>
          {laedt ? <span className="schnell-punkte" aria-label="…" /> : T.los}
        </button>
      </form>

      {fehler && <p className="schnell-fehler">{fehler}</p>}

      {daten && (
        <div className="schnell-ergebnis">
          <ul>
            {daten.treffer.map((t) => {
              const drin = Boolean(vocab[t.wort.toLowerCase()]) || frisch.has(t.wort.toLowerCase())
              return (
                <li key={t.wort}>
                  <div className="schnell-wort">
                    <b>{t.wort}</b>
                    <span>{t.uebersetzung}</span>
                    {t.hinweis && <small>{t.hinweis}</small>}
                  </div>
                  <button
                    type="button"
                    className={'schnell-rein' + (drin ? ' ist-drin' : '')}
                    disabled={drin}
                    onClick={() => hinzufuegen(t)}
                  >
                    {drin ? '✓ ' + T.drin : '+ ' + T.rein}
                  </button>
                </li>
              )
            })}
          </ul>
          {daten.beispiel && (
            <p className="schnell-beispiel">
              <b>{daten.beispiel}</b>
              <span>{daten.beispiel_uebersetzung}</span>
            </p>
          )}
          <button type="button" className="schnell-neu" onClick={neu}>{T.neu}</button>
        </div>
      )}
    </section>
  )
}
