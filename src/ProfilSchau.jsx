import { useEffect, useState } from 'react'
import { ladeProfil } from './rangliste.js'
import { levelFromXp, levelName } from './gamification.js'

/** "seit 2. September 2026" – ausgeschrieben, das liest sich wärmer. */
function seit(datum) {
  if (!datum) return ''
  const d = new Date(datum + 'T12:00:00')
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Wie lange ist jemand schon dabei? Für die Zeile unter dem Datum. */
function dauer(datum) {
  if (!datum) return ''
  const tage = Math.floor((Date.now() - new Date(datum + 'T12:00:00')) / 86400000)
  if (tage < 1) return 'seit heute'
  if (tage === 1) return 'seit gestern'
  if (tage < 31) return `seit ${tage} Tagen`
  const monate = Math.floor(tage / 30.4)
  if (monate < 12) return `seit ${monate} ${monate === 1 ? 'Monat' : 'Monaten'}`
  const jahre = Math.floor(monate / 12)
  return `seit ${jahre} ${jahre === 1 ? 'Jahr' : 'Jahren'}`
}

/**
 * Das Profil einer Person aus der Rangliste.
 *
 * Aufbau wie der eigene Profilkopf, damit man sich zurechtfindet:
 * Bild, Name, Rang, darunter die Zahlen. Es gibt bewusst nichts zu
 * tun – kein Folgen, kein Anschreiben. Die Rangliste soll anspornen,
 * nicht zu einem weiteren Netzwerk werden.
 */
export default function ProfilSchau({ benutzername, onSchliessen }) {
  const [profil, setProfil] = useState(undefined) // undefined = lädt

  useEffect(() => {
    let aktiv = true
    setProfil(undefined)
    ladeProfil(benutzername).then((p) => { if (aktiv) setProfil(p) })
    return () => { aktiv = false }
  }, [benutzername])

  // Mit Escape schließen – auf dem Rechner erwartet man das
  useEffect(() => {
    const taste = (e) => { if (e.key === 'Escape') onSchliessen?.() }
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [onSchliessen])

  if (!benutzername) return null

  const level = profil ? levelFromXp(profil.xp) : 1

  return (
    <div className="ps-schicht" role="dialog" aria-modal="true" onClick={onSchliessen}>
      <div className="ps-karte" onClick={(e) => e.stopPropagation()}>
        <button className="ps-zu" onClick={onSchliessen} aria-label="Schließen">×</button>

        {profil === undefined ? (
          <p className="ps-laedt">Lädt …</p>
        ) : profil === null ? (
          <p className="ps-laedt">Dieses Profil gibt es nicht mehr.</p>
        ) : (
          <>
            <span className="ps-bild" aria-hidden="true">
              {profil.benutzername.charAt(0).toUpperCase()}
              <span className="ps-level">{level}</span>
            </span>

            <h2 className="ps-name">{profil.benutzername}</h2>
            <p className="ps-rang">{levelName(level)}</p>

            <div className="ps-platz">Platz {profil.platz}</div>

            <dl className="ps-zahlen">
              <div>
                <dd>{profil.xp.toLocaleString('de-DE')}</dd>
                <dt>XP gesamt</dt>
              </div>
              <div>
                <dd>{profil.serie}</dd>
                <dt>Tage am Stück</dt>
              </div>
              <div>
                <dd>{profil.xp_woche.toLocaleString('de-DE')}</dd>
                <dt>Diese Woche</dt>
              </div>
              <div>
                <dd>{profil.xp_monat.toLocaleString('de-DE')}</dd>
                <dt>Dieser Monat</dt>
              </div>
            </dl>

            <p className="ps-seit">
              Dabei seit {seit(profil.dabei_seit)}
              <small>{dauer(profil.dabei_seit)}</small>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
