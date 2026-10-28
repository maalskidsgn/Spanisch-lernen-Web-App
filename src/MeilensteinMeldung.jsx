import { useEffect, useState } from 'react'
import { MEILENSTEIN_XP, STUFEN_NAMEN } from './meilensteine.js'

/**
 * Die Meldung, wenn ein Abzeichen dazukommt.
 *
 * Sie legt sich über die Seite, weil ein Meilenstein ein Moment sein
 * soll – ein Hinweis am Rand ginge unter. Mehrere auf einmal werden
 * nacheinander gezeigt, nicht gestapelt.
 */
export default function MeilensteinMeldung({ liste, onFertig }) {
  const [i, setI] = useState(0)

  // Neue Liste: wieder von vorn anfangen
  useEffect(() => {
    setI(0)
  }, [liste])

  if (!liste?.length || i >= liste.length) return null
  const m = liste[i]

  function weiter() {
    if (i + 1 < liste.length) setI(i + 1)
    else onFertig?.()
  }

  return (
    <div className="ms-schicht" role="dialog" aria-modal="true" onClick={weiter}>
      <div className="ms-karte" onClick={(e) => e.stopPropagation()}>
        <div className="ms-konfetti" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, n) => (
            <span key={n} className="ms-schnipsel" style={{ '--n': n }} />
          ))}
        </div>

        <span className="ms-abzeichen" aria-hidden="true">
          <b>{STUFEN_NAMEN[m.stufe]?.charAt(0)}</b>
        </span>

        <p className="ms-stufe">{STUFEN_NAMEN[m.stufe]}</p>
        <h2 className="ms-titel">{m.titel}</h2>
        <p className="ms-text">
          {m.ziel.toLocaleString('de-DE')} {m.einheit} geschafft
        </p>

        <div className="ms-xp">+{MEILENSTEIN_XP} XP</div>

        <button className="btn ms-knopf" onClick={weiter}>
          {i + 1 < liste.length ? `Weiter (${liste.length - i - 1} mehr)` : 'Stark!'}
        </button>
      </div>
    </div>
  )
}
