// Die Embleme zu den Level-Stufen (LEVEL_STUFEN in gamification.js).
// Seit 10.11.2026 im 3D-Toon-Stil (Manuel): Medaillen am Band, ab Legende
// Kristall-Sterne, Sol als Ziel. Zeichnung + Bewegung in emblemToon.js.
import { useId, useMemo } from 'react'
import { levelName, levelStufe, LEVEL_STUFEN } from './gamification.js'
import { useTexte } from './sprache.js'
import { emblemInhalt } from './emblemToon.js'

const MARKE = 'habloo'

function ruhigGewuenscht() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}

/**
 * @param {number} level
 * @param {number} groesse – Kantenlänge in Pixeln
 * @param {string} klasse
 */
export default function LevelEmblem({ level, groesse = 48, klasse = '' }) {
  const stufe = levelStufe(level)
  const rang = Math.max(0, LEVEL_STUFEN.indexOf(stufe))
  const id = 'le' + useId().replace(/[^a-zA-Z0-9]/g, '')
  // Ganz kleine Embleme (lange Ranglisten) bleiben still – spart Akku
  const bewegt = groesse >= 32 && !ruhigGewuenscht()
  const html = useMemo(() => emblemInhalt(rang, MARKE, id, bewegt), [rang, id, bewegt])
  const name = `Level ${level} – ${levelName(level)}`
  return (
    <svg
      className={`level-emblem emblem-toon ${klasse}`.trim()}
      viewBox="-10 -8 120 120"
      width={groesse}
      height={groesse}
      role="img"
      aria-label={name}
      dangerouslySetInnerHTML={{ __html: `<title>${name.replace(/[<&>]/g, "")}</title>` + html }}
    />
  )
}

/** Emblem mit Titel und Level – so steht es in den Profilen. */
export function LevelPlakette({ level }) {
  const t = useTexte()
  const { farbe, sol } = levelStufe(level)
  return (
    <div
      className={'level-plakette' + (sol ? ' level-plakette-sol' : '')}
      style={sol ? undefined : { '--plakette-ton': farbe }}
    >
      <LevelEmblem level={level} groesse={56} />
      <span>
        <b>{levelName(level)}</b>
        <small>{t('se9.levelNr', { zahl: level })}</small>
      </span>
    </div>
  )
}
