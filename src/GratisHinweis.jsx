import { istApp } from './api.js'
import { usePremium, TESTPHASE_ALLES_FREI } from './premium.js'
import { useKontingent, naechsteAuffuellung, KI_PRO_WOCHE, VIDEOS_PRO_WOCHE, GRATIS_LEKTIONEN_PROZENT } from './limits.js'
import { sprache, useTexte } from './sprache.js'

/**
 * Premium-Hinweise für Gratis-Nutzer (seit 09.11.2026).
 *
 * Nur in der Web-Version: In den Store-Apps darf kein Verweis auf
 * eine Kasse außerhalb des Stores stehen. Premium-Nutzer sehen nichts.
 *
 *   <GratisHinweis art="ki" />         7 KI-Erstellungen / Woche
 *   <GratisHinweis art="video" />      1 neues YouTube-Video / Woche
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

function Punkte({ uebrig, gesamt }) {
  return (
    <span className="gh-punkte" aria-hidden="true">
      {Array.from({ length: gesamt }, (_, i) => (
        <i key={i} className={i < uebrig ? 'voll' : ''} />
      ))}
    </span>
  )
}

const TEXT = {
  de: {
    ki: (u, g) => (u > 0 ? `Gratis: noch ${u} von ${g} KI-Erstellungen diese Woche` : `Deine ${g} Gratis-Erstellungen sind aufgebraucht`),
    kiKlein: 'Wortlisten, Sätze, Texte & E-Books teilen sich den Wochentopf',
    video: (u) => (u > 0 ? 'Gratis: 1 neues Video pro Woche' : 'Dein Gratis-Video für diese Woche ist verbraucht'),
    videoKlein: 'Schon geöffnete Videos bleiben frei',
    lektionen: `Gratis: ${GRATIS_LEKTIONEN_PROZENT} % der Lektionen`,
    lektionenKlein: 'Mit Premium sind alle Module und Lektionen offen',
    sprechen: 'Gratis: 10 Min. Sprach-Trainer im Monat',
    sprechenKlein: 'Mit Premium 120 Minuten jeden Monat',
    wieder: (w) => `Wieder frei ${w}`,
    knopf: 'Unbegrenzt mit Premium',
    knopfKurz: 'Premium',
    titel: 'Dein Gratis-Paket',
    unter: 'Mit Premium fallen alle Grenzen weg.',
    zeilen: {
      ki: 'KI-Erstellungen diese Woche',
      video: 'Neues YouTube-Video diese Woche',
      lektionen: 'Lektionen frei',
      sprechen: 'Sprach-Trainer im Monat',
    },
    prem: { ki: 'unbegrenzt', video: 'unbegrenzt', lektionen: 'alle', sprechen: '120 Min.' },
    alles: 'Alles freischalten',
  },
  en: {
    ki: (u, g) => (u > 0 ? `Free: ${u} of ${g} AI creations left this week` : `You've used your ${g} free creations`),
    kiKlein: 'Lists, sentences, texts & e-books share the weekly pool',
    video: (u) => (u > 0 ? 'Free: 1 new YouTube video per week' : "You've used this week's free video"),
    videoKlein: "Videos you've opened before stay free",
    lektionen: `Free: ${GRATIS_LEKTIONEN_PROZENT}% of the lessons`,
    lektionenKlein: 'Premium unlocks every module and lesson',
    sprechen: 'Free: 10 min of speaking practice per month',
    sprechenKlein: 'Premium: 120 minutes every month',
    wieder: (w) => `Free again ${w}`,
    knopf: 'Unlimited with Premium',
    knopfKurz: 'Premium',
    titel: 'Your free plan',
    unter: 'Premium removes every limit.',
    zeilen: {
      ki: 'AI creations this week',
      video: 'New YouTube video this week',
      lektionen: 'Lessons unlocked',
      sprechen: 'Speaking practice per month',
    },
    prem: { ki: 'unlimited', video: 'unlimited', lektionen: 'all', sprechen: '120 min' },
    alles: 'Unlock everything',
  },
}

export default function GratisHinweis({ art = 'ki' }) {
  const { zeigen } = useSichtbar()
  const k = useKontingent(false)
  if (!zeigen) return null
  const T = TEXT[sprache() === 'en' ? 'en' : 'de']

  let titel, klein, leer = false, punkte = null
  if (art === 'ki') {
    leer = k.ki.uebrig <= 0
    titel = T.ki(k.ki.uebrig, KI_PRO_WOCHE)
    klein = leer ? T.wieder(naechsteAuffuellung()) : T.kiKlein
    punkte = <Punkte uebrig={k.ki.uebrig} gesamt={KI_PRO_WOCHE} />
  } else if (art === 'video') {
    leer = k.video.uebrig <= 0
    titel = T.video(k.video.uebrig)
    klein = leer ? T.wieder(naechsteAuffuellung()) : T.videoKlein
    punkte = <Punkte uebrig={k.video.uebrig} gesamt={VIDEOS_PRO_WOCHE} />
  } else if (art === 'lektionen') {
    titel = T.lektionen
    klein = T.lektionenKlein
  } else {
    titel = T.sprechen
    klein = T.sprechenKlein
  }

  return (
    <div className={'gratis-hinweis' + (leer ? ' gh-leer' : '')}>
      <div className="gh-text">
        <b>{titel}</b>
        <small>{klein}</small>
      </div>
      {punkte}
      <button type="button" className="gh-knopf" onClick={zurKasse}>
        {KRONE}
        <span>{leer ? T.knopf : T.knopfKurz}</span>
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
    ['video', `${k.video.uebrig} / ${VIDEOS_PRO_WOCHE}`, k.video.uebrig / VIDEOS_PRO_WOCHE],
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
        {zeilen.map(([art, wert, anteil]) => (
          <li key={art} className={anteil <= 0 ? 'gu-leer' : ''}>
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
