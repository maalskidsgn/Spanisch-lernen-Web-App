// „Melden“ für KI-Inhalte (10.11.2026) – Google Play verlangt bei Apps mit
// generierten Inhalten, dass man anstößige oder falsche Ergebnisse direkt
// in der App melden kann. Die Meldung geht über /api/feedback (art 'ki')
// als Mail ins Postfach, mit Bereich und dem gemeldeten Ausschnitt.
// In Habloo und Davaigo gleich.
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { API_URL, istApp } from './api.js'
import { loginKopf } from './limits.js'
import { plattform } from './kauf.js'
import { sprache } from './sprache.js'

const T = {
  de: {
    knopf: 'Melden', titel: 'KI-Inhalt melden',
    unter: 'Dieser Inhalt wurde von einer KI erstellt. Stimmt etwas nicht oder ist er unangemessen? Sag uns Bescheid – wir prüfen jede Meldung.',
    gruende: [['anstoessig', 'Anstößig oder unangemessen'], ['falsch', 'Falsch oder irreführend'], ['sonst', 'Etwas anderes']],
    platz: 'Was ist dir aufgefallen? (optional)',
    senden: 'Meldung senden', abbrechen: 'Abbrechen', laedt: 'Wird gesendet …',
    danke: 'Danke! Wir schauen uns das an.', fehler: 'Senden hat nicht geklappt. Versuch es bitte nochmal.',
  },
  en: {
    knopf: 'Report', titel: 'Report AI content',
    unter: 'This content was created by AI. Is something wrong or inappropriate? Let us know – we review every report.',
    gruende: [['anstoessig', 'Offensive or inappropriate'], ['falsch', 'Wrong or misleading'], ['sonst', 'Something else']],
    platz: 'What did you notice? (optional)',
    senden: 'Send report', abbrechen: 'Cancel', laedt: 'Sending …',
    danke: 'Thanks! We’ll take a look.', fehler: 'Sending failed. Please try again.',
  },
}

/**
 * @param {string} bereich  z. B. 'buch', 'tutor', 'wortliste'
 * @param {string} inhalt   der gemeldete Ausschnitt (wird gekürzt)
 */
export default function KiMelden({ bereich, inhalt = '', className = '' }) {
  const L = T[sprache() === 'en' ? 'en' : 'de']
  const [offen, setOffen] = useState(false)
  const [grund, setGrund] = useState('anstoessig')
  const [text, setText] = useState('')
  const [stand, setStand] = useState('') // '' | 'laedt' | 'danke' | 'fehler'

  async function senden(e) {
    e.preventDefault()
    setStand('laedt')
    try {
      const grundText = L.gruende.find(([w]) => w === grund)?.[1] ?? grund
      const r = await fetch(API_URL + '/api/feedback', {
        method: 'POST',
        headers: await loginKopf({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          art: 'ki',
          text: `Grund: ${grundText}${text.trim() ? '\n' + text.trim() : ''}`,
          bereich,
          inhalt: String(inhalt).slice(0, 2000),
          quelle: istApp ? plattform() : 'web',
          sprache: sprache(),
          geraet: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        }),
      })
      setStand(r.ok ? 'danke' : 'fehler')
      if (r.ok) setTimeout(() => { setOffen(false); setStand(''); setText('') }, 1800)
    } catch {
      setStand('fehler')
    }
  }

  return (
    <>
      <button type="button" className={'ki-melden ' + className} onClick={() => setOffen(true)} title={L.titel}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></svg>
        {L.knopf}
      </button>
      {offen && createPortal(
        <div className="ki-melden-schleier" onClick={() => stand !== 'laedt' && setOffen(false)}>
          <form className="ki-melden-karte" onSubmit={senden} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={L.titel}>
            <h3>{L.titel}</h3>
            <p>{L.unter}</p>
            {stand === 'danke' ? (
              <p className="ki-melden-danke">{L.danke}</p>
            ) : (
              <>
                <div className="ki-melden-gruende" role="radiogroup">
                  {L.gruende.map(([w, n]) => (
                    <label key={w} className={grund === w ? 'an' : ''}>
                      <input type="radio" name="ki-grund" value={w} checked={grund === w} onChange={() => setGrund(w)} />
                      {n}
                    </label>
                  ))}
                </div>
                <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 1000))} placeholder={L.platz} rows={3} />
                {stand === 'fehler' && <p className="error">{L.fehler}</p>}
                <div className="ki-melden-knoepfe">
                  <button type="button" className="btn-outline" onClick={() => setOffen(false)} disabled={stand === 'laedt'}>{L.abbrechen}</button>
                  <button type="submit" className="btn" disabled={stand === 'laedt'}>{stand === 'laedt' ? L.laedt : L.senden}</button>
                </div>
              </>
            )}
          </form>
        </div>,
        document.body,
      )}
    </>
  )
}
