// Die Bereichs-Einführungen – und der Rundgang, der sie verbindet.
//
// Zwei Wünsche, ein System:
//
//   1. Betritt jemand einen Bereich zum ERSTEN Mal, erklärt eine
//      Infobox in zwei, drei Sätzen, was er hier kann. Einmal
//      weggeklickt, kommt sie nie wieder (localStorage).
//
//   2. Der RUNDGANG für Neulinge klickt genau diese Boxen der Reihe
//      nach durch alle Bereiche – die App wechselt selbst die
//      Ansicht, man schaut zu und tippt „Weiter". Kein zweiter
//      Satz Texte, der auseinanderlaufen könnte: Es sind dieselben.
//
// Die Animation ist bewusst EIN orchestrierter Moment (Karte federt
// hoch, das Zeichen springt hinterher, zwei Funken), nicht Dauer-
// gezappel – dieselbe Linie wie beim Hörverstehen: ruhig, nicht
// ablenkend.

import { useEffect } from 'react'
import {
  IconLektion, IconKarten, IconMediathek, IconMehr, IconSprache, IconLandkarte,
} from './icons.jsx'
import { t } from './sprache.js'

const SPEICHER = 'bereichGesehen'

export function gesehene() {
  try {
    return JSON.parse(localStorage.getItem(SPEICHER)) ?? {}
  } catch {
    return {}
  }
}

export function merkeGesehen(bereich) {
  try {
    localStorage.setItem(SPEICHER, JSON.stringify({ ...gesehene(), [bereich]: true }))
  } catch {
    // Kein Speicher – dann kommt die Box eben noch einmal.
  }
}

/**
 * Die Texte je Bereich. Der Schlüssel ist der view-Name aus App.jsx.
 * „start" steht nur im Rundgang – die Startseite erklärt sich beim
 * ersten Öffnen nicht selbst, direkt nach dem Onboarding wäre eine
 * weitere Box zu viel.
 */
export const BEREICHE = {
  start:     { icon: IconLandkarte, titel: 'rund.startTitel',     text: 'rund.startText' },
  lektionen: { icon: IconLektion,   titel: 'rund.lektionenTitel', text: 'rund.lektionenText' },
  trainer:   { icon: IconKarten,    titel: 'rund.trainerTitel',   text: 'rund.trainerText' },
  videos:    { icon: IconMediathek, titel: 'rund.mediathekTitel', text: 'rund.mediathekText' },
  gespraech: { icon: IconSprache,   titel: 'rund.gespraechTitel', text: 'rund.gespraechText' },
  mehr:      { icon: IconMehr,      titel: 'rund.mehrTitel',      text: 'rund.mehrText' },
}

/** Die Stationen des Rundgangs, in Lauf-Reihenfolge. */
export const RUNDGANG_REIHE = ['start', 'lektionen', 'trainer', 'videos', 'mehr']

/**
 * Die Infobox selbst – als Overlay über dem Bereich.
 *
 * @param bereich   Schlüssel aus BEREICHE
 * @param rundgang  { nr, von } wenn Teil des Rundgangs, sonst null
 * @param onWeiter  Rundgang: nächste Station. Sonst ungenutzt.
 * @param onFertig  Schließen (Einzelbox) bzw. Rundgang beenden.
 */
export default function BereichsIntro({ bereich, rundgang, onWeiter, onFertig }) {
  const info = BEREICHE[bereich]

  // Gesehen wird beim ANZEIGEN gemerkt, nicht beim Schließen: Wer die
  // Box einmal vor sich hatte, braucht sie kein zweites Mal.
  useEffect(() => {
    merkeGesehen(bereich)
  }, [bereich])

  if (!info) return null
  const Icon = info.icon
  const letzte = rundgang && rundgang.nr >= rundgang.von

  return (
    <div className="intro-hintergrund" onClick={rundgang ? undefined : onFertig}>
      <div className="intro-karte" onClick={(e) => e.stopPropagation()} key={bereich}>
        <span className="intro-funke intro-funke-a" aria-hidden="true" />
        <span className="intro-funke intro-funke-b" aria-hidden="true" />

        <span className="intro-icon">
          <Icon groesse={30} />
        </span>

        {rundgang && (
          <span className="intro-schritt">
            {t('ih9.nrVon', { nr: rundgang.nr, gesamt: rundgang.von })}
          </span>
        )}

        <h2>{t(info.titel)}</h2>
        <p>{t(info.text)}</p>

        <div className="intro-knoepfe">
          {rundgang ? (
            <>
              <button className="btn-outline" onClick={onFertig}>
                Rundgang beenden
              </button>
              <button className="btn" onClick={letzte ? onFertig : onWeiter}>
                {letzte ? t('rum.fertigLosGeht') : t('rg9.weiter')}
              </button>
            </>
          ) : (
            <button className="btn intro-alles-klar" onClick={onFertig}>
              Alles klar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
