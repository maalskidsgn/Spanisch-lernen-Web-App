import { useEffect, useState } from 'react'
import { ladeProfil, blockiere } from './rangliste.js'
import Melden from './Melden.jsx'
import { Bildnis } from './Rangliste.jsx'
import { levelFromXp } from './gamification.js'
import { useTexte, gebiet, t } from './sprache.js'
import { LevelPlakette } from './LevelEmblem.jsx'
import Flamme from './Flamme.jsx'

/** "seit 2. September 2026" – ausgeschrieben, das liest sich wärmer. */
function seit(datum) {
  if (!datum) return ''
  const d = new Date(datum + 'T12:00:00')
  return d.toLocaleDateString(gebiet(), { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Wie lange ist jemand schon dabei? Für die Zeile unter dem Datum. */
function dauer(datum) {
  if (!datum) return ''
  const tage = Math.floor((Date.now() - new Date(datum + 'T12:00:00')) / 86400000)
  if (tage < 1) return t('ps9.seitHeute')
  if (tage === 1) return t('ps9.seitGestern')
  if (tage < 31) return t('ps9.seitTagen', { zahl: tage })
  const monate = Math.floor(tage / 30.4)
  if (monate < 12)
    return t('ps9.seitMonaten', { zahl: monate, einheit: monate === 1 ? t('ps9.monat') : t('ps9.monate') })
  const jahre = Math.floor(monate / 12)
  return t('ps9.seitJahren', { zahl: jahre, einheit: jahre === 1 ? t('ps9.jahr') : t('ps9.jahre') })
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
  const t = useTexte()
  const [profil, setProfil] = useState(undefined) // undefined = lädt
  // Melden und Blockieren liegen hinter einem Klick: Sie gehören
  // nicht neben die XP-Zahlen, sondern dorthin, wo man sie sucht,
  // wenn etwas nicht stimmt.
  const [mehr, setMehr] = useState(false)
  const [meldet, setMeldet] = useState(false)

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

  if (meldet) {
    return (
      <Melden
        benutzername={benutzername}
        onSchliessen={() => setMeldet(false)}
        onFertig={onSchliessen}
      />
    )
  }

  return (
    <div className="ps-schicht" role="dialog" aria-modal="true" onClick={onSchliessen}>
      <div className="ps-karte" onClick={(e) => e.stopPropagation()}>
        <button className="ps-zu" onClick={onSchliessen} aria-label={t('app.schliessen')}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.6"
                  strokeLinecap="round" />
          </svg>
        </button>

        {profil === undefined ? (
          <p className="ps-laedt">{t('app.laedt')}</p>
        ) : profil === null ? (
          <p className="ps-laedt">{t('ps.gibtsNicht')}</p>
        ) : (
          <>
            <span className="ps-rahmen">
              <Bildnis name={profil.benutzername} bild={profil.bild} klasse="ps-bild" />
            </span>

            <h2 className="ps-name">{profil.benutzername}</h2>
            <LevelPlakette level={level} />

            <div className="ps-platz">{t('ps9.platz', { zahl: profil.platz })}</div>

            <dl className="ps-zahlen">
              <div>
                <dd>{profil.xp.toLocaleString(gebiet())}</dd>
                <dt>{t('ps9.xpGesamt')}</dt>
              </div>
              <div>
                <dd className="zahl-flamme"><Flamme an={profil.serie > 0} groesse={20} />{profil.serie}</dd>
                <dt>{t('ps.tageAmStueck')}</dt>
              </div>
              <div>
                <dd>{profil.xp_woche.toLocaleString(gebiet())}</dd>
                <dt>{t('ps.dieseWoche')}</dt>
              </div>
              <div>
                <dd>{profil.xp_monat.toLocaleString(gebiet())}</dd>
                <dt>{t('ps.dieserMonat')}</dt>
              </div>
            </dl>

            <p className="ps-seit">
              {t('ps9.dabeiSeit', { datum: seit(profil.dabei_seit) })}
              <small>{dauer(profil.dabei_seit)}</small>
            </p>

            {/* Melden und Blockieren - von Apple und Google verlangt,
                sobald Nutzer Inhalte anderer Nutzer sehen. */}
            {!mehr ? (
              <button className="ps-mehr" onClick={() => setMehr(true)}>
                {t('ps.problem')}
              </button>
            ) : (
              <div className="ps-schutz">
                <button className="ps-schutz-knopf" onClick={() => setMeldet(true)}>
                  {t('pf.melden')}
                </button>
                <button
                  className="ps-schutz-knopf"
                  onClick={async () => {
                    if (!confirm(t('ps.blockierenFrage', { name: benutzername }))) return
                    try {
                      await blockiere(benutzername)
                      onSchliessen?.()
                    } catch (f) {
                      alert(f.message)
                    }
                  }}
                >
                  {t('pf.blockieren')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
