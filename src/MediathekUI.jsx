// Die gemeinsamen Bausteine der Mediathek.
//
// Videos, Songs, Hörtexte und Lesetexte sehen gleich aus – deshalb
// steht das Aussehen hier einmal statt viermal. Genau daran ist die
// Hauptkarte des Trainers schon einmal auseinandergelaufen: Sie war
// auf einen Bereich beschränkt, und der zweite bekam still eine
// ältere Fassung.

/**
 * Die Hauptkarte oben: rundes Symbol, Ansage, rechts die eine
 * Aktion. Was rechts steht, entscheidet der Bereich selbst –
 * ein Suchfeld, ein Knopf, ein Hinweis.
 */
export function Hero({ symbol, titel, text, children }) {
  return (
    <section className="video-hero">
      <span className="video-hero-symbol" aria-hidden="true">{symbol}</span>
      <div className="video-hero-text">
        <h2>{titel}</h2>
        {text && <p>{text}</p>}
      </div>
      {children}
    </section>
  )
}

/**
 * Ein Abschnittskopf: Symbol und Titel links, optional eine Aktion
 * oder eine Zahl rechts.
 */
export function Kopf({ symbol, titel, text, aktion, zahl }) {
  return (
    <div className="mediathek-kopf">
      <div className="mediathek-kopf-links">
        <h2>
          {symbol}
          {titel}
        </h2>
        {text && <p>{text}</p>}
      </div>
      {aktion}
      {zahl != null && <span className="kopf-zahl">{zahl}</span>}
    </div>
  )
}

/**
 * Ein Suchfeld im Stil der Hauptkarte.
 *
 * Mit rund={true} wird aus dem beschrifteten Knopf ein runder Pfeil.
 * Das passt ueberall dort, wo das Feld wirklich SUCHT – die
 * Beschriftung sagt dann nichts, was der Platzhalter nicht schon
 * sagt. Wo der Knopf etwas anderes tut (etwa "Filtern"), bleibt die
 * Beschriftung stehen: Ein Pfeil, der filtert, waere eine Luege.
 */
export function SuchFeld({ wert, onWert, onAbsenden, platzhalter, knopf = 'Suchen', laedt, rund }) {
  return (
    <form
      className={'video-hero-form' + (rund ? ' hero-form-rund' : '')}
      onSubmit={(e) => {
        e.preventDefault()
        onAbsenden()
      }}
    >
      <input
        type="search"
        value={wert}
        onChange={(e) => onWert(e.target.value)}
        placeholder={platzhalter}
        aria-label={platzhalter}
        disabled={laedt}
      />
      {rund ? (
        <button type="submit" className="hero-rund" disabled={laedt || !wert.trim()} aria-label={knopf}>
          <svg viewBox="0 0 24 24" width="19" height="19">
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
      ) : (
        <button type="submit" className="btn" disabled={laedt || !wert.trim()}>
          {laedt ? 'Sucht …' : knopf}
        </button>
      )}
    </form>
  )
}
