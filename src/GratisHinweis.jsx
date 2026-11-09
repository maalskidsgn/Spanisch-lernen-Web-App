import { istApp } from './api.js'
import BILDER from './kassenBilder.js'
import { usePremium, TESTPHASE_ALLES_FREI } from './premium.js'
import { useKontingent, naechsteAuffuellung, KI_PRO_WOCHE, GRATIS_LEKTIONEN_PROZENT } from './limits.js'
import { sprache, useTexte } from './sprache.js'

/**
 * Premium-Hinweise für Gratis-Nutzer (seit 09.11.2026).
 *
 * Nur in der Web-Version: In den Store-Apps darf kein Verweis auf
 * eine Kasse außerhalb des Stores stehen. Premium-Nutzer sehen nichts.
 *
 *   <GratisHinweis art="ki" />         7 KI-Erstellungen / Woche
 *   <GratisHinweis art="video" />      eigene YouTube-Videos nur Premium
 *   <GratisHinweis art="lektionen" />  20 % der Lektionen
 *   <GratisHinweis art="sprechen" />   10 Min. Sprach-Trainer / Monat
 *   <GratisUebersicht />               alles auf einen Blick (Startseite)
 */

export function zurKasse() {
  window.history.pushState({ kasse: true }, '', '/kasse')
  window.dispatchEvent(new PopStateEvent('popstate', { state: { kasse: true } }))
  window.scrollTo(0, 0)
}

const KRONE = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
    <path d="M3 8l4.5 3.5L12 5l4.5 6.5L21 8l-2 11H5L3 8z" />
  </svg>
)

function useSichtbar() {
  useTexte() // neu zeichnen, wenn die Sprache wechselt
  const { premium, laedt } = usePremium()
  if (istApp || TESTPHASE_ALLES_FREI) return { zeigen: false, premium }
  // Während der Premium-Stand lädt: lieber nichts als falsche Werbung
  return { zeigen: !premium && !laedt, premium }
}

const TEXT = {
  de: {
    ki: (u, g) => (u > 0 ? `Noch ${u} von ${g} KI-Erstellungen diese Woche` : `Deine ${g} Gratis-Erstellungen sind aufgebraucht`),
    kiKlein: 'Wortlisten, Sätze, Texte & E-Books teilen sich den Wochentopf',
    video: () => 'Eigene YouTube-Videos mit Premium',
    videoKlein: 'Gratis: alle Videos aus der Mediathek. Suche und eigene Links schaltet Premium frei.',
    mediathek: 'Mediathek',
    lektionen: 'Alle Module und Lektionen mit Premium',
    lektionenKlein: `Gratis sind die ersten ${GRATIS_LEKTIONEN_PROZENT} % des Kurses`,
    sprechen: '120 Minuten Sprach-Trainer im Monat mit Premium',
    sprechenKlein: 'Gratis sind 10 Minuten im Monat',
    wieder: (w) => `Wieder frei ${w}`,
    knopf: 'Jetzt freischalten',
    knopfKurz: 'Unbegrenzt',
    knopfFrei: 'Freischalten',
    frei: 'frei',
    titel: 'Dein Gratis-Paket',
    unter: 'Mit Premium fallen alle Grenzen weg.',
    zeilen: {
      ki: 'KI-Erstellungen diese Woche',
      video: 'Eigene YouTube-Videos',
      lektionen: 'Lektionen frei',
      sprechen: 'Sprach-Trainer im Monat',
    },
    prem: { ki: 'unbegrenzt', video: 'unbegrenzt', lektionen: 'alle', sprechen: '120 Min.' },
    alles: 'Alles freischalten',
  },
  en: {
    ki: (u, g) => (u > 0 ? `${u} of ${g} AI creations left this week` : `You've used your ${g} free creations`),
    kiKlein: 'Lists, sentences, texts & e-books share the weekly pool',
    video: () => 'Your own YouTube videos with Premium',
    videoKlein: 'Free: every video in the library. Premium unlocks search and your own links.',
    mediathek: 'Library',
    lektionen: 'Every module and lesson with Premium',
    lektionenKlein: `The first ${GRATIS_LEKTIONEN_PROZENT}% of the course is free`,
    sprechen: '120 minutes of speaking practice a month with Premium',
    sprechenKlein: '10 minutes a month are free',
    wieder: (w) => `Free again ${w}`,
    knopf: 'Unlock now',
    knopfKurz: 'Unlimited',
    knopfFrei: 'Unlock',
    frei: 'free',
    titel: 'Your free plan',
    unter: 'Premium removes every limit.',
    zeilen: {
      ki: 'AI creations this week',
      video: 'Your own YouTube videos',
      lektionen: 'Lessons unlocked',
      sprechen: 'Speaking practice per month',
    },
    prem: { ki: 'unlimited', video: 'unlimited', lektionen: 'all', sprechen: '120 min' },
    alles: 'Unlock everything',
  },
}

// Symbol je Bereich – Toon-Bild auf Podest (Leiste A3, 09.11.2026)
const SYMBOL = { ki: 'zauber', video: 'video', lektionen: 'lektion', sprechen: 'mikro' }

export default function GratisHinweis({ art = 'ki' }) {
  const { zeigen } = useSichtbar()
  const k = useKontingent(false)
  if (!zeigen) return null
  const T = TEXT[sprache() === 'en' ? 'en' : 'de']

  let titel, klein, zahl, leer = false, zaehlt = true
  if (art === 'ki') {
    leer = k.ki.uebrig <= 0
    titel = T.ki(k.ki.uebrig, KI_PRO_WOCHE)
    klein = leer ? T.wieder(naechsteAuffuellung()) : T.kiKlein
    zahl = <><b>{k.ki.uebrig}</b>/{KI_PRO_WOCHE} {T.frei}</>
  } else if (art === 'video') {
    // Seit 09.11.: eigene Videos nur Premium, die Mediathek ist frei
    zaehlt = false
    titel = T.video()
    klein = T.videoKlein
    zahl = <><b>{T.mediathek}</b> {T.frei}</>
  } else if (art === 'lektionen') {
    zaehlt = false
    titel = T.lektionen
    klein = T.lektionenKlein
    zahl = <><b>{GRATIS_LEKTIONEN_PROZENT} %</b> {T.frei}</>
  } else {
    zaehlt = false
    titel = T.sprechen
    klein = T.sprechenKlein
    zahl = <><b>10 Min.</b> {T.frei}</>
  }
  const bild = '<span class="gh-halo"></span>' + BILDER.icons[SYMBOL[art] || 'zauber'] + BILDER.trommel1

  return (
    <div className={'gratis-hinweis' + (leer ? ' gh-leer' : '')}>
      <div className="gh-bild" aria-hidden="true" dangerouslySetInnerHTML={{ __html: bild }} />
      <div className="gh-text">
        <span className="gh-zahl">{zahl}</span>
        <b>{titel}</b>
        <small>{klein}</small>
      </div>
      <button type="button" className="gh-knopf" onClick={zurKasse}>
        {KRONE}
        <span>{leer ? T.knopf : zaehlt ? T.knopfKurz : T.knopfFrei}</span>
      </button>
    </div>
  )
}

/** Übersicht aller Gratis-Grenzen – für die Startseite. */
export function GratisUebersicht() {
  const { zeigen } = useSichtbar()
  const k = useKontingent(false)
  if (!zeigen) return null
  const T = TEXT[sprache() === 'en' ? 'en' : 'de']
  const zeilen = [
    ['ki', `${k.ki.uebrig} / ${KI_PRO_WOCHE}`, k.ki.uebrig / KI_PRO_WOCHE],
    ['video', '–', 0, true],
    ['lektionen', `${GRATIS_LEKTIONEN_PROZENT} %`, GRATIS_LEKTIONEN_PROZENT / 100],
    ['sprechen', sprache() === 'en' ? '10 min' : '10 Min.', 10 / 120],
  ]
  return (
    <section className="gratis-uebersicht">
      <div className="gu-kopf">
        <div>
          <h3>{T.titel}</h3>
          <p>{T.unter}</p>
        </div>
        <span className="gu-krone" aria-hidden="true">{KRONE}</span>
      </div>
      <ul>
        {zeilen.map(([art, wert, anteil, nurPremium]) => (
          <li key={art} className={anteil <= 0 && !nurPremium ? 'gu-leer' : ''}>
            <span className="gu-name">{T.zeilen[art]}</span>
            <span className="gu-balken"><i style={{ width: Math.max(4, anteil * 100) + '%' }} /></span>
            <span className="gu-wert">{wert}</span>
            <span className="gu-prem">{KRONE}{T.prem[art]}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="gh-knopf gu-knopf" onClick={zurKasse}>
        {KRONE}
        <span>{T.alles}</span>
      </button>
    </section>
  )
}
