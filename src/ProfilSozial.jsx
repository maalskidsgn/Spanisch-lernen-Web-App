import { useEffect, useState } from 'react'
import { ladeFreunde, einladungsLink } from './rangliste.js'
import { Bildnis } from './Rangliste.jsx'
import ProfilSchau from './ProfilSchau.jsx'
import { useAnwesend } from './praesenz.js'
import { ladeDuelle, stand } from './duell.js'
import InselEmblem from './InselEmbleme.jsx'
import { useTexte } from './sprache.js'
import { SprechenTuer } from './Sprechen.jsx'

/**
 * Der soziale Teil des Profils (06.11.): wie bei Instagram & Co.
 * Freunde als Bilderleiste, die Spiele als Raster, darunter die
 * Duell-Bilanz. Verwalten (suchen, annehmen, Duell starten) bleibt in
 * den ausführlichen Kästen darunter – hier geht es ums Zeigen.
 */
const SPIELE = [
  ['memory', 'trk.memory', '#ff9a3d'],
  ['paare', 'trk.wortpaare', '#4fd1b5'],
  ['suche', 'trk.wortsuche', '#7d8bff'],
  ['blitz', 'trk.blitzrunde', '#ffc43d'],
  ['galgen', 'trk.galgenmaennchen', '#ff7aa2'],
  ['salat', 'trk.buchstabensalat', '#5fd38a'],
]

// Lange Spielnamen sauber trennen statt mitten im Wort umzubrechen
const weich = (w) => w.replace('Galgenmännchen', 'Galgen\u00admännchen').replace('Buchstabensalat', 'Buchstaben\u00adsalat')

/** Kleines Spielbild aus einfachen Formen, wie die Memory-Grafik im Trainer */
function SpielBild({ id }) {
  if (id === 'memory') return <span className="ps-g ps-g-memory"><i /><i /><i /><i /></span>
  if (id === 'paare') return <span className="ps-g ps-g-paare"><i /><i /><i /></span>
  if (id === 'suche') return <span className="ps-g ps-g-suche">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</span>
  if (id === 'blitz') return <span className="ps-g ps-g-text">⚡</span>
  if (id === 'galgen') return <span className="ps-g ps-g-text">A_C</span>
  return <span className="ps-g ps-g-text">ABC</span>
}

export default function ProfilSozial({ nutzerName, onSpiel, onAlleFreunde, onDuell }) {
  const t = useTexte()
  const da = useAnwesend()
  const [freunde, setFreunde] = useState(null)
  const [schau, setSchau] = useState('')
  const [bilanz, setBilanz] = useState(null)
  const [kopiert, setKopiert] = useState(false)

  useEffect(() => {
    ladeFreunde().then((l) => setFreunde(l.filter((f) => f.stand === 'freund'))).catch(() => setFreunde([]))
    ladeDuelle()
      .then((liste) => {
        const z = { gewonnen: 0, verloren: 0, gespielt: 0 }
        for (const d of liste ?? []) {
          const s = stand(d)
          if (s === 'gewonnen' || s === 'verloren' || s === 'unentschieden') z.gespielt++
          if (s === 'gewonnen') z.gewonnen++
          if (s === 'verloren') z.verloren++
        }
        setBilanz(z)
      })
      .catch(() => setBilanz(null))
  }, [])

  async function einladen() {
    const link = einladungsLink(nutzerName)
    try {
      if (navigator.share) await navigator.share({ url: link })
      else {
        await navigator.clipboard.writeText(link)
        setKopiert(true)
        setTimeout(() => setKopiert(false), 2200)
      }
    } catch { /* abgebrochen */ }
  }

  const rekord = Number(localStorage.getItem('blitz-rekord')) || 0

  return (
    <>
      {schau && <ProfilSchau benutzername={schau} onSchliessen={() => setSchau('')} />}

      {/* ---------- Freunde als Bilderleiste ---------- */}
      <section className="ps-kasten">
        <div className="ps-kopf">
          <h2>{t('st2.freunde')} {freunde?.length > 0 && <span className="ps-zahl">{freunde.length}</span>}</h2>
          <button className="ps-mehr" onClick={onAlleFreunde}>{t('ps.verwalten')}</button>
        </div>
        <div className="ps-leiste">
          <button className="ps-person ps-einladen" onClick={einladen}>
            <span className="ps-bild ps-plus" aria-hidden="true">+</span>
            <small>{kopiert ? t('ps.kopiert') : t('ps.einladen')}</small>
          </button>
          {(freunde ?? []).map((f) => (
            <button key={f.benutzername} className="ps-person" onClick={() => setSchau(f.benutzername)}>
              <span className="ps-bildfeld">
                <Bildnis name={f.benutzername} bild={f.bild} klasse="ps-bild" />
                {da(f.benutzername) && <span className="ps-da" aria-label={t('frk.geradeOnline')} />}
              </span>
              <small>{f.benutzername}</small>
            </button>
          ))}
          {freunde?.length === 0 && <p className="ps-leer">{t('ps.nochKeine')}</p>}
        </div>
      </section>

      {/* ---------- Spiele als Raster ---------- */}
      <section className="ps-kasten">
        <div className="ps-kopf">
          <h2>{t('ps.spiele')}</h2>
          <span className="ps-sub">{rekord > 0 ? t('ps.blitzRekord', { zahl: rekord }) : t('ps.sechsSpiele')}</span>
        </div>
        <div className="ps-raster">
          {SPIELE.map(([id, name, farbe]) => (
            <button key={id} className="ps-spiel" style={{ '--sf': farbe }} onClick={() => onSpiel(id)}>
              <SpielBild id={id} />
              <b>{weich(t(name))}</b>
            </button>
          ))}
        </div>
      </section>

      {/* ---------- Sprechen mit der KI-Trainerin (seit 11.11. hier statt im Trainer) ---------- */}
      <SprechenTuer />

      {/* ---------- Duell-Bilanz ---------- */}
      <section className="ps-kasten ps-duell">
        <InselEmblem art="duell" klasse="ps-duell-bild" />
        <div className="ps-duell-text">
          <h2>{t('st2.duell')}</h2>
          {bilanz && bilanz.gespielt > 0 ? (
            <p>
              <b>{bilanz.gewonnen}</b> {t('ps.siege')} · <b>{bilanz.verloren}</b> {t('ps.niederlagen')}
            </p>
          ) : (
            <p>{t('ps.nochKeinDuell')}</p>
          )}
        </div>
        <button className="ps-duell-knopf" onClick={onDuell}>{t('ps.fordern')}</button>
      </section>
    </>
  )
}
