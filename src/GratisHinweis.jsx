import { ohneKasse } from './kauf.js'
import BILDER from './kassenBilder.js'
import { usePremium, TESTPHASE_ALLES_FREI } from './premium.js'
import { useKontingent, naechsteAuffuellung, KI_PRO_MONAT, MAX_VOKABELN, MAX_SAETZE, MAX_TEXTE } from './limits.js'
import { GRATIS_MODULE_ZAHL, MODULE_ZAHL } from './gratisModule.js'
import { sprache, useTexte } from './sprache.js'

/**
 * Premium-Hinweise für Gratis-Nutzer (seit 09.11.2026).
 *
 * Überall, wo es eine Kasse gibt: im Web Stripe, in der Store-App der
 * Kauf über Apple/Google (ohneKasse in kauf.js, seit 15.11.2026). Premium-Nutzer sehen nichts.
 *
 *   <GratisHinweis art="ki" />         12 KI-Erstellungen / Monat
 *   <GratisHinweis art="video" />      1 eigenes YouTube-Video / Monat
 *   <GratisHinweis art="lektionen" />  die ersten Module gratis (gratisModule.js)
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
  if (ohneKasse() || TESTPHASE_ALLES_FREI) return { zeigen: false, premium }
  // Während der Premium-Stand lädt: lieber nichts als falsche Werbung
  // Gemerkter Stand „kein Premium“: sofort zeigen, nicht erst nach der Abfrage
  let gemerktGratis = false
  try { gemerktGratis = localStorage.getItem('premium-stand') === 'nein' } catch { /* egal */ }
  return { zeigen: !premium && (!laedt || gemerktGratis), premium }
}

const TEXT = {
  de: {
    ki: (u, g) => (u > 0 ? `Noch ${u} von ${g} KI-Erstellungen diesen Monat` : `Deine ${g} Gratis-Erstellungen sind aufgebraucht`),
    kiKlein: 'Wortlisten, Sätze, Texte & Verb-Tabellen teilen sich den Monatstopf',
    video: (u) => (u > 0 ? '1 eigenes YouTube-Video gratis diesen Monat' : 'Gratis-Video für diesen Monat verbraucht'),
    buecher: (u) => (u > 0 ? '1 eigenes E-Book gratis diesen Monat' : 'Gratis-E-Book für diesen Monat verbraucht'),
    buecherKlein: 'Gratis: die 6 Bücher der Bibliothek und 1 eigenes Buch im Monat. Premium: alle E-Books und bis zu 50 eigene im Monat.',
    buecherFrei: '6 Bücher',
    videoKlein: 'Gratis: alle Videos der Mediathek plus 1 eigenes Video im Monat. Premium: bis zu 100 eigene im Monat.',
    mediathek: 'Mediathek',
    lektionen: 'Alle weiteren Module mit Premium',
    lektionenKlein: `Gratis sind die ersten ${GRATIS_MODULE_ZAHL} von ${MODULE_ZAHL} Modulen`,
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
      lektionen: 'Module frei',
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
    kiKlein: 'Lists, sentences, texts & verb tables share the monthly pool',
    video: (u) => (u > 0 ? '1 free YouTube video of your own this month' : "This month's free video is used"),
    buecher: (u) => (u > 0 ? '1 free e-book of your own this month' : "This month's free e-book is used"),
    buecherKlein: 'Free: the 6 library books and 1 book of your own a month. Premium: all e-books and up to 50 of your own a month.',
    buecherFrei: '6 books',
    videoKlein: 'Free: every library video plus 1 of your own a month. Premium: up to 100 of your own a month.',
    mediathek: 'Library',
    lektionen: 'Every other module with Premium',
    lektionenKlein: `The first ${GRATIS_MODULE_ZAHL} of ${MODULE_ZAHL} modules are free`,
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
      lektionen: 'Modules unlocked',
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
    // Seit 16.11.: 1 eigenes Buch pro Monat gratis, dazu die 6 der Bibliothek
    leer = k.buch.uebrig <= 0
    titel = T.buecher(k.buch.uebrig)
    klein = leer ? T.wieder(naechsteAuffuellung()) : T.buecherKlein
    zahl = <><b>{k.buch.uebrig}</b>/1 {T.frei}</>
  } else if (art === 'video') {
    // Seit 09.11.: eigene Videos nur Premium, die Mediathek ist frei
    // Seit 16.11.: 1 eigenes Video pro Monat gratis, die Mediathek sowieso
    leer = k.video.uebrig <= 0
    titel = T.video(k.video.uebrig)
    klein = leer ? T.wieder(naechsteAuffuellung()) : T.videoKlein
    zahl = <><b>{k.video.uebrig}</b>/1 {T.frei}</>
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
    zahl = <><b>{GRATIS_MODULE_ZAHL}/{MODULE_ZAHL}</b> {T.frei}</>
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
 * Obergrenze im Trainer, in der Karte „Heute wiederholen“ (11.11.2026).
 * Ein kleiner gelber Kasten: „473 / 500 im Trainer“, Balken, Premium-Knopf.
 * Über dem Limit (z. B. nach Kündigung mit 2000 Wörtern): „1500 pausiert“.
 * Wer den Kasten nicht sieht (Premium, Store-App), bekommt `children` –
 * im Wort-Trainer ist das die Tagesziel-Zeile, die der Kasten sonst ersetzt.
 */
export function TrainerGrenze({ art, gesamt = 0, children = null }) {
  const { zeigen } = useSichtbar()
  if (!zeigen || gesamt === 0) return children
  const en = sprache() === 'en'
  const max = { vokabeln: MAX_VOKABELN, saetze: MAX_SAETZE, texte: MAX_TEXTE }[art]
  const was = en
    ? { vokabeln: 'words', saetze: 'sentences', texte: 'texts' }[art]
    : { vokabeln: 'Vokabeln', saetze: 'Sätze', texte: 'Texte' }[art]
  const imTraining = Math.min(gesamt, max)
  const pausiert = gesamt - imTraining
  return (
    <div className={'trainer-grenze' + (pausiert > 0 ? ' tg-voll' : '')}>
      <div className="tg-oben">
        <span className="tg-zahl">
          <b>{imTraining}</b>/{max} <span>{en ? 'in trainer' : 'im Trainer'}</span>
        </span>
        <button type="button" className="tg-knopf" onClick={zurKasse}>
          {KRONE}
          <span>Premium</span>
        </button>
      </div>
      <span className="tg-balken"><span style={{ width: (imTraining / max) * 100 + '%' }} /></span>
      <small>
        {pausiert > 0
          ? (en ? `${pausiert} ${was} paused – Premium brings them all back` : `${pausiert} ${was} pausiert – mit Premium wieder alle im Training`)
          : (en ? `Free: up to ${max} ${was} · Premium: unlimited` : `Gratis bis ${max} ${was} · Premium unbegrenzt`)}
      </small>
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
    ['video', `${k.video.uebrig} / 1`, k.video.uebrig],
    ['lektionen', `${GRATIS_MODULE_ZAHL} / ${MODULE_ZAHL}`, GRATIS_MODULE_ZAHL / MODULE_ZAHL],
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
