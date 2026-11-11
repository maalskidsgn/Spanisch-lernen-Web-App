import { istApp } from './api.js'
import BILDER from './kassenBilder.js'
import { usePremium, TESTPHASE_ALLES_FREI } from './premium.js'
import { useKontingent, naechsteAuffuellung, KI_PRO_MONAT, GRATIS_LEKTIONEN_PROZENT, MAX_VOKABELN, MAX_SAETZE, MAX_TEXTE } from './limits.js'
import { sprache, useTexte } from './sprache.js'

/**
 * Premium-Hinweise für Gratis-Nutzer (seit 09.11.2026).
 *
 * Nur in der Web-Version: In den Store-Apps darf kein Verweis auf
 * eine Kasse außerhalb des Stores stehen. Premium-Nutzer sehen nichts.
 *
 *   <GratisHinweis art="ki" />         10 KI-Erstellungen / Monat
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
  // Gemerkter Stand „kein Premium“: sofort zeigen, nicht erst nach der Abfrage
  let gemerktGratis = false
  try { gemerktGratis = localStorage.getItem('premium-stand') === 'nein' } catch { /* egal */ }
  return { zeigen: !premium && (!laedt || gemerktGratis), premium }
}

const TEXT = {
  de: {
    ki: (u, g) => (u > 0 ? `Noch ${u} von ${g} KI-Erstellungen diesen Monat` : `Deine ${g} Gratis-Erstellungen sind aufgebraucht`),
    kiKlein: 'Wortlisten, Sätze, Texte & E-Books teilen sich den Monatstopf',
    video: () => 'Eigene YouTube-Videos mit Premium',
    buecher: 'Alle E-Books mit Premium',
    buecherKlein: 'Gratis: die 6 Bücher der Bibliothek. Premium: alle 95 E-Books lesen und eigene Bücher erstellen – bis zu 50 im Monat.',
    buecherFrei: '6 Bücher',
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
      ki: 'KI-Erstellungen diesen Monat',
      video: 'Eigene YouTube-Videos',
      lektionen: 'Lektionen frei',
      sprechen: 'Sprach-Trainer im Monat',
      vokabeln: 'Vokabeln im Trainer',
      saetze: 'Sätze im Trainer',
      texte: 'Texte im Trainer',
    },
    prem: { ki: 'unbegrenzt', video: 'unbegrenzt', lektionen: 'alle', sprechen: '120 Min.', vokabeln: 'unbegrenzt', saetze: 'unbegrenzt', texte: 'unbegrenzt' },
    alles: 'Alles freischalten',
  },
  en: {
    ki: (u, g) => (u > 0 ? `${u} of ${g} AI creations left this month` : `You've used your ${g} free creations`),
    kiKlein: 'Lists, sentences, texts & e-books share the monthly pool',
    video: () => 'Your own YouTube videos with Premium',
    buecher: 'All e-books with Premium',
    buecherKlein: 'Free: the 6 library books. Premium: read all 95 e-books and create your own – up to 50 a month.',
    buecherFrei: '6 books',
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
      ki: 'AI creations this month',
      video: 'Your own YouTube videos',
      lektionen: 'Lessons unlocked',
      sprechen: 'Speaking practice per month',
      vokabeln: 'Words in your trainer',
      saetze: 'Sentences in your trainer',
      texte: 'Texts in your trainer',
    },
    prem: { ki: 'unlimited', video: 'unlimited', lektionen: 'all', sprechen: '120 min', vokabeln: 'unlimited', saetze: 'unlimited', texte: 'unlimited' },
    alles: 'Unlock everything',
  },
}

// Symbol je Bereich – Toon-Bild auf Podest (Leiste A3, 09.11.2026)
const SYMBOL = { ki: 'zauber', video: 'video', buecher: 'buch', lektionen: 'lektion', sprechen: 'mikro', vokabeln: 'buch', saetze: 'zauber', texte: 'buch' }

export default function GratisHinweis({ art = 'ki', gesamt = 0 }) {
  const { zeigen } = useSichtbar()
  const k = useKontingent(false)
  if (!zeigen) return null
  const T = TEXT[sprache() === 'en' ? 'en' : 'de']

  let titel, klein, zahl, leer = false, zaehlt = true
  if (art === 'ki') {
    leer = k.ki.uebrig <= 0
    titel = T.ki(k.ki.uebrig, KI_PRO_MONAT)
    klein = leer ? T.wieder(naechsteAuffuellung()) : T.kiKlein
    zahl = <><b>{k.ki.uebrig}</b>/{KI_PRO_MONAT} {T.frei}</>
  } else if (art === 'buecher') {
    // Seit 10.11.: eigene Bücher nur Premium, die 6 der Bibliothek sind frei
    zaehlt = false
    titel = T.buecher
    klein = T.buecherKlein
    zahl = <><b>{T.buecherFrei}</b> {T.frei}</>
  } else if (art === 'video') {
    // Seit 09.11.: eigene Videos nur Premium, die Mediathek ist frei
    zaehlt = false
    titel = T.video()
    klein = T.videoKlein
    zahl = <><b>{T.mediathek}</b> {T.frei}</>
  } else if (art === 'vokabeln' || art === 'saetze' || art === 'texte') {
    // Feste Obergrenze im Trainer (gratis): immer sichtbar, nicht erst kurz vor Schluss
    const max = { vokabeln: MAX_VOKABELN, saetze: MAX_SAETZE, texte: MAX_TEXTE }[art]
    const en = sprache() === 'en'
    const was = en ? { vokabeln: 'words', saetze: 'sentences', texte: 'texts' }[art] : { vokabeln: 'Vokabeln', saetze: 'Sätze', texte: 'Texte' }[art]
    zaehlt = false
    leer = gesamt > max
    titel = leer
      ? (en ? `${gesamt - max} ${was} paused – Premium brings them all back` : `${gesamt - max} ${was} pausiert – mit Premium wieder alle im Training`)
      : (en ? `${gesamt} of ${max} ${was} in your trainer` : `${gesamt} von ${max} ${was} im Trainer`)
    klein = en ? `Free: up to ${max} ${was} are trained. Premium: unlimited.` : `Gratis werden bis zu ${max} ${was} abgefragt. Premium: unbegrenzt.`
    zahl = <><b>{Math.min(gesamt, max)}</b>/{max}</>
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

/**
 * Obergrenze im Trainer, direkt in der Karte „Heute wiederholen“ (11.11.2026).
 * Zwei Zeilen: was gratis im Training ist (mit „heute fällig“) und – wenn es
 * mehr sind als erlaubt – was pausiert ist und erst mit Premium wieder kommt.
 * Fall: Premium mit 2000 Vokabeln kündigt → 500 lernen weiter, 1500 pausiert.
 */
export function TrainerGrenze({ art, gesamt = 0, faellig = 0 }) {
  const { zeigen } = useSichtbar()
  if (!zeigen || gesamt === 0) return null
  const en = sprache() === 'en'
  const max = { vokabeln: MAX_VOKABELN, saetze: MAX_SAETZE, texte: MAX_TEXTE }[art]
  const was = en
    ? { vokabeln: 'words', saetze: 'sentences', texte: 'texts' }[art]
    : { vokabeln: 'Vokabeln', saetze: 'Sätze', texte: 'Texte' }[art]
  const imTraining = Math.min(gesamt, max)
  const pausiert = gesamt - imTraining
  return (
    <div className={'trainer-grenze' + (pausiert > 0 ? ' tg-voll' : '')}>
      <div className="tg-zeile tg-frei">
        <div className="tg-text">
          <b>{en ? `${imTraining} of ${max} ${was} in training` : `${imTraining} von ${max} ${was} im Training`}</b>
          <small>
            {en ? `${faellig} due today` : `davon heute ${faellig} zu lernen`}
            {pausiert > 0 ? (en ? ' · free limit reached' : ' · Gratis-Limit erreicht') : ''}
          </small>
        </div>
        <span className="tg-balken"><span style={{ width: (imTraining / max) * 100 + '%' }} /></span>
      </div>
      {pausiert > 0 ? (
        <div className="tg-zeile tg-pausiert">
          <div className="tg-text">
            <b>{en ? `${pausiert} ${was} paused` : `${pausiert} ${was} pausiert`}</b>
            <small>{en ? 'Saved, but not practised. Premium brings them all back.' : 'Gespeichert, aber nicht im Training. Mit Premium wieder alle.'}</small>
          </div>
          <button type="button" className="tg-knopf" onClick={zurKasse}>
            {KRONE}
            <span>{en ? 'Unlock' : 'Freischalten'}</span>
          </button>
        </div>
      ) : (
        <small className="tg-hinweis">
          {en ? `Free: up to ${max} ${was} are practised. Premium: unlimited.` : `Gratis werden bis zu ${max} ${was} abgefragt. Premium: unbegrenzt.`}
        </small>
      )}
    </div>
  )
}

/** Übersicht aller Gratis-Grenzen – für die Startseite. */
export function GratisUebersicht({ trainer = null }) {
  const { zeigen } = useSichtbar()
  const k = useKontingent(false)
  if (!zeigen) return null
  const T = TEXT[sprache() === 'en' ? 'en' : 'de']
  const zeilen = [
    ['ki', `${k.ki.uebrig} / ${KI_PRO_MONAT}`, k.ki.uebrig / KI_PRO_MONAT],
    ['video', '–', 0, true],
    ['lektionen', `${GRATIS_LEKTIONEN_PROZENT} %`, GRATIS_LEKTIONEN_PROZENT / 100],
    ['sprechen', sprache() === 'en' ? '10 min' : '10 Min.', 10 / 120],
    ...(trainer ? [
      ['vokabeln', `${Math.min(trainer.woerter, MAX_VOKABELN)} / ${MAX_VOKABELN}`, Math.min(1, trainer.woerter / MAX_VOKABELN)],
      ['saetze', `${Math.min(trainer.saetze, MAX_SAETZE)} / ${MAX_SAETZE}`, Math.min(1, trainer.saetze / MAX_SAETZE)],
      ['texte', `${Math.min(trainer.texte, MAX_TEXTE)} / ${MAX_TEXTE}`, Math.min(1, trainer.texte / MAX_TEXTE)],
    ] : []),
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
