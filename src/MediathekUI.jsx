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

/** Ein Suchfeld im Stil der Hauptkarte. */
export function SuchFeld({ wert, onWert, onAbsenden, platzhalter, knopf = 'Suchen', laedt }) {
  return (
    <form
      className="video-hero-form"
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
      <button type="submit" className="btn" disabled={laedt || !wert.trim()}>
        {laedt ? 'Sucht …' : knopf}
      </button>
    </form>
  )
}
