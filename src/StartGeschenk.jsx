import { sprache } from './sprache.js'

/**
 * Das Startgeschenk (10.11.2026, Manuel): Wer neu ist, bekommt die 50
 * wichtigsten Wörter, Sätze und einen Text – und soll SEHEN, dass das ein
 * Geschenk ist und kein Zufall. Erscheint einmal direkt nach dem Einräumen.
 */
const GESCHENK = (
  <svg viewBox="0 0 96 96" width="96" height="96" aria-hidden="true">
    <ellipse cx="48" cy="86" rx="30" ry="5" fill="#000" opacity=".08" />
    <rect x="16" y="40" width="64" height="42" rx="10" fill="var(--primary)" />
    <rect x="16" y="40" width="64" height="12" rx="6" fill="var(--primary-dark)" opacity=".35" />
    <rect x="12" y="30" width="72" height="16" rx="7" fill="color-mix(in srgb, var(--primary) 78%, #fff)" />
    <rect x="42" y="30" width="12" height="52" fill="#ffc533" />
    <path d="M48 30c-6-14-22-16-22-6 0 6 10 6 22 6zM48 30c6-14 22-16 22-6 0 6-10 6-22 6z" fill="#ffc533" stroke="#e8a400" stroke-width="2.5" stroke-linejoin="round" />
    <circle cx="48" cy="30" r="5" fill="#e8a400" />
    <path d="M20 22l2 4 4 2-4 2-2 4-2-4-4-2 4-2zM78 14l1.5 3 3 1.5-3 1.5L78 23l-1.5-3-3-1.5 3-1.5z" fill="#ffc533" />
  </svg>
)

export default function StartGeschenk({ woerter = 50, onAnsehen, onZu }) {
  const en = sprache() === 'en'
  return (
    <div className="geschenk-schleier" role="dialog" aria-modal="true" aria-label={en ? 'Your welcome gift' : 'Dein Startgeschenk'} onClick={onZu}>
      <div className="geschenk-karte" onClick={(e) => e.stopPropagation()}>
        <span className="geschenk-bild">{GESCHENK}</span>
        <span className="geschenk-pill">{en ? 'Welcome gift' : 'Startgeschenk'}</span>
        <h2>{en ? 'A little gift to get you started' : 'Ein kleines Geschenk zum Start'}</h2>
        <p>
          {en
            ? `The ${woerter} most important Spanish words, a few useful sentences and a short text are already waiting in your trainer.`
            : `Die ${woerter} wichtigsten Wörter auf Spanisch, ein paar nützliche Sätze und ein kurzer Text liegen schon in deinem Trainer.`}
        </p>
        <button type="button" className="geschenk-los" onClick={onAnsehen}>
          {en ? 'Open my gift' : 'Geschenk auspacken'}
        </button>
        <button type="button" className="geschenk-spaeter" onClick={onZu}>
          {en ? 'Later' : 'Später'}
        </button>
      </div>
    </div>
  )
}
