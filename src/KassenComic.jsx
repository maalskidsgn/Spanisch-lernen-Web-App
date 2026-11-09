import './KassenComic.css'
// Kasse im Comic-Look (09.11.2026, Manuel: „verspielter, soll mehr zum
// Kauf anregen durch Vorteile, die man sieht“). Steht links neben dem
// Stripe-Formular: Sprechblase, Rabatt-Stern, Vergleich Gratis → Premium
// und Vertrauens-Sticker. Gleiche Datei in Habloo und Davaigo – nur die
// Zeile MARKE unterscheidet sich.
const MARKE = { name: 'Habloo', sprache: { de: 'Spanisch', en: 'Spanish' }, gruss: '¡Vamos!' }

const T = {
  de: {
    blase: (s) => `Mit Premium lernst du ${s} ohne Bremse.`,
    titel: `${MARKE.name} Premium`,
    unter: 'Alles freigeschaltet – sofort nach der Zahlung.',
    gratis: 'Gratis',
    premium: 'Premium',
    zeilen: [
      ['lektion', 'Lektionen', '20 %', 'alle'],
      ['mikro', 'Sprach-Trainer', '10 Min.', '120 Min.'],
      ['zauber', 'KI-Vokabellisten', 'begrenzt', 'unbegrenzt'],
      ['buch', 'Sätze & E-Books', '3 / Monat', 'unbegrenzt'],
      ['video', 'Eigene Videos', '–', 'unbegrenzt'],
    ],
    vertrauen: ['Jederzeit kündbar', 'Sichere Zahlung', 'Sofort freigeschaltet'],
    spar: 'sparen',
  },
  en: {
    blase: (s) => `With Premium you learn ${s} without limits.`,
    titel: `${MARKE.name} Premium`,
    unter: 'Everything unlocked – right after payment.',
    gratis: 'Free',
    premium: 'Premium',
    zeilen: [
      ['lektion', 'Lessons', '20 %', 'all'],
      ['mikro', 'Voice trainer', '10 min', '120 min'],
      ['zauber', 'AI vocab lists', 'limited', 'unlimited'],
      ['buch', 'Sentences & e-books', '3 / month', 'unlimited'],
      ['video', 'Your own videos', '–', 'unlimited'],
    ],
    vertrauen: ['Cancel anytime', 'Secure payment', 'Instant access'],
    spar: 'off',
  },
}

const ICONS = {
  lektion: <path d="M3 9l9-5 9 5-9 5-9-5zm4 2.5V16c0 1.7 2.2 3 5 3s5-1.3 5-3v-4.5" />,
  mikro: <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zm-6 9a6 6 0 0 0 12 0M12 18v3" />,
  zauber: <path d="M5 19L15 9m2-5l.8 2.2L20 7l-2.2.8L17 10l-.8-2.2L14 7l2.2-.8zM8 4l.5 1.5L10 6l-1.5.5L8 8l-.5-1.5L6 6l1.5-.5z" />,
  buch: <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5c.8 0 1.5-.7 1.5-1.5z" />,
  video: <path d="M4 6h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm12 4l5-3v10l-5-3z" />,
  text: <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7" />,
  haken: <path d="M5 12.5l4.5 4.5L19 7" />,
}
const Icon = ({ n }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[n]}</svg>
)

export function KassenComicKopf({ en, ersparnis }) {
  const x = T[en ? 'en' : 'de']
  return (
    <div className="kc-held">
      <div className="kc-blase">
        <b>{MARKE.gruss}</b> {x.blase(MARKE.sprache[en ? 'en' : 'de'])}
      </div>
      <h1 className="kc-titel">{x.titel}</h1>
      <p className="kc-unter">{x.unter}</p>
      {ersparnis > 0 && (
        <span className="kc-stern" aria-label={`−${ersparnis} % ${x.spar}`}>
          <span>−{ersparnis}%</span>
        </span>
      )}
    </div>
  )
}

export function KassenComicVorteile({ en }) {
  const x = T[en ? 'en' : 'de']
  return (
    <>
      <div className="kc-vergleich" role="table">
        <div className="kc-zeile kc-kopfzeile" role="row">
          <span role="columnheader" />
          <span role="columnheader">{x.gratis}</span>
          <span role="columnheader" className="kc-prem">{x.premium}</span>
        </div>
        {x.zeilen.map(([icon, name, frei, prem], i) => (
          <div className="kc-zeile" role="row" key={icon} style={{ '--i': i }}>
            <span role="cell" className="kc-was">
              <span className={'kc-icon kc-icon-' + icon}><Icon n={icon} /></span>
              {name}
            </span>
            <span role="cell" className="kc-frei">{frei}</span>
            <span role="cell" className="kc-prem"><b>{prem}</b></span>
          </div>
        ))}
      </div>
      <ul className="kc-vertrauen">
        {x.vertrauen.map((v) => (
          <li key={v}><Icon n="haken" />{v}</li>
        ))}
      </ul>
    </>
  )
}
