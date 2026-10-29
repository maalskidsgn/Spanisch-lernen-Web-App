import { useEffect, useState } from 'react'
import { sucheNutzer, ladeFreunde, frageFreund, nimmAn, beende } from './rangliste.js'
import { Bildnis } from './Rangliste.jsx'
import ProfilSchau from './ProfilSchau.jsx'
import { useAnwesend } from './praesenz.js'

/**
 * Leute finden und Freundschaften verwalten.
 *
 * Liegt im Profil, nicht als eigener Reiter: Das Soziale gehört zum
 * eigenen Konto, und eine App mit fünf Reitern unten wird unübersichtlich.
 */
export default function Freunde() {
  const [was, setWas] = useState('')
  const [treffer, setTreffer] = useState([])
  const [liste, setListe] = useState([])
  const [laeuft, setLaeuft] = useState(false)
  const [schau, setSchau] = useState('')

  async function neuLaden() {
    setListe(await ladeFreunde())
  }

  useEffect(() => {
    neuLaden()
    const neu = () => neuLaden()
    window.addEventListener('freunde', neu)
    return () => window.removeEventListener('freunde', neu)
  }, [])

  // Suche erst nach kurzer Pause – sonst eine Abfrage je Tastendruck
  useEffect(() => {
    if (was.trim().length < 2) return setTreffer([])
    const zeit = setTimeout(async () => {
      setLaeuft(true)
      setTreffer(await sucheNutzer(was))
      setLaeuft(false)
    }, 320)
    return () => clearTimeout(zeit)
  }, [was])

  const anfragen = liste.filter((f) => f.stand === 'wartet')
  const freunde = liste.filter((f) => f.stand === 'freund')
  const gesendet = liste.filter((f) => f.stand === 'gesendet')

  return (
    <div className="fr">
      {schau && <ProfilSchau benutzername={schau} onSchliessen={() => setSchau('')} />}

      {/* ---------- Suchen ---------- */}
      <div className="fr-suche">
        <input
          type="search"
          value={was}
          onChange={(e) => setWas(e.target.value)}
          placeholder="Benutzername suchen …"
          aria-label="Leute suchen"
        />
      </div>

      {was.trim().length >= 2 && (
        <div className="fr-treffer">
          {laeuft && !treffer.length ? (
            <p className="fr-leer">Sucht …</p>
          ) : !treffer.length ? (
            <p className="fr-leer">Niemanden gefunden.</p>
          ) : (
            treffer.map((t) => (
              <Zeile key={t.benutzername} p={t} onSchau={setSchau} onFertig={neuLaden} />
            ))
          )}
        </div>
      )}

      {/* ---------- Offene Anfragen ---------- */}
      {anfragen.length > 0 && (
        <section className="fr-block">
          <h3 className="fr-titel">
            Anfragen <span className="fr-zahl">{anfragen.length}</span>
          </h3>
          {anfragen.map((f) => (
            <Zeile key={f.anfrage_id} p={f} onSchau={setSchau} onFertig={neuLaden} />
          ))}
        </section>
      )}

      {/* ---------- Freunde ---------- */}
      <section className="fr-block">
        <h3 className="fr-titel">
          Freunde {freunde.length > 0 && <span className="fr-zahl">{freunde.length}</span>}
        </h3>
        {freunde.length ? (
          freunde.map((f) => (
            <Zeile key={f.anfrage_id} p={f} onSchau={setSchau} onFertig={neuLaden} />
          ))
        ) : (
          <p className="fr-leer">
            Noch niemand. Such jemanden über den Namen – oder schau in der Rangliste, wer
            gerade fleißig ist.
          </p>
        )}
      </section>

      {/* ---------- Gesendet ---------- */}
      {gesendet.length > 0 && (
        <section className="fr-block">
          <h3 className="fr-titel">Gesendet</h3>
          {gesendet.map((f) => (
            <Zeile key={f.anfrage_id} p={f} onSchau={setSchau} onFertig={neuLaden} />
          ))}
        </section>
      )}
    </div>
  )
}

/** Eine Person mit dem Knopf, der gerade passt. */
function Zeile({ p, onSchau, onFertig }) {
  const [laeuft, setLaeuft] = useState(false)
  const da = useAnwesend()

  async function tu(was) {
    setLaeuft(true)
    try {
      if (was === 'anfragen') await frageFreund(p.benutzername)
      if (was === 'annehmen') await nimmAn(p.anfrage_id)
      if (was === 'beenden') await beende(p.anfrage_id)
      await onFertig?.()
    } catch (f) {
      alert(f.message)
    } finally {
      setLaeuft(false)
    }
  }

  return (
    <div className="fr-zeile">
      <button className="fr-person" onClick={() => onSchau(p.benutzername)}>
        {/* Der Punkt sitzt am Bild, nicht hinter dem Namen: So bleibt
            er auch bei langen Namen sichtbar. */}
        <span className="fr-bildfeld">
          <Bildnis name={p.benutzername} bild={p.bild} klasse="fr-bild" />
          {da(p.benutzername) && <span className="ist-da" title="gerade online" />}
        </span>
        <span className="fr-text">
          <b>{p.benutzername}</b>
          <small>
            {da(p.benutzername)
              ? 'gerade online'
              : (p.xp ?? 0).toLocaleString('de-DE') + ' XP'}
          </small>
        </span>
      </button>

      <span className="fr-tun">
        {p.stand === 'ich' && <span className="fr-marke">du</span>}

        {p.stand === 'fremd' && (
          <button className="btn-small" disabled={laeuft} onClick={() => tu('anfragen')}>
            {laeuft ? '…' : 'Hinzufügen'}
          </button>
        )}

        {p.stand === 'wartet' && (
          <>
            <button className="btn-small" disabled={laeuft} onClick={() => tu('annehmen')}>
              Annehmen
            </button>
            {p.anfrage_id && (
              <button className="btn-plain fr-nein" disabled={laeuft} onClick={() => tu('beenden')}>
                Nein
              </button>
            )}
          </>
        )}

        {p.stand === 'gesendet' && (
          <>
            <span className="fr-marke">gefragt</span>
            {p.anfrage_id && (
              <button className="btn-plain fr-nein" disabled={laeuft} onClick={() => tu('beenden')}>
                Zurück
              </button>
            )}
          </>
        )}

        {p.stand === 'freund' && (
          <>
            <span className="fr-marke fr-ist">Freund</span>
            {p.anfrage_id && (
              <button className="btn-plain fr-nein" disabled={laeuft} onClick={() => tu('beenden')}>
                Entfernen
              </button>
            )}
          </>
        )}
      </span>
    </div>
  )
}
