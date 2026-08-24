// Der Sprach-Tutor als Chat.
//
// Erster Schritt der Sprechen-Funktion: reines Tippen. Die Stimme
// (Mikrofon rein, Vorlesen raus) kommt als zweiter Schritt obendrauf –
// diese Datei ist bewusst so gebaut, dass sie das später aufnehmen
// kann, ohne umgebaut zu werden: Eine Nachricht abschicken ist eine
// Funktion (sende), egal ob der Text getippt oder gesprochen wurde.
//
// Die deutsche Zeile unter jeder spanischen Antwort lässt sich
// ausblenden – dieselbe Idee wie bei „Land & Leute": Wer sie immer
// sieht, liest sie zuerst und übt nicht.

import { useState, useRef, useEffect } from 'react'
import { API_URL } from './api.js'
import { IconSprache, IconPfeil } from './icons.jsx'

const NIVEAU_SPEICHER = 'gespraechNiveau'
const DEUTSCH_SPEICHER = 'gespraechDeutsch'

// Ein paar Startthemen, damit niemand vor einem leeren Feld sitzt.
// Es sind Situationen, keine Grammatikthemen – gesprochen wird über
// etwas, nicht über die Sprache.
const EINSTIEGE = [
  { text: 'Erzähl mir von deinem Tag', schick: 'Hola, ¿qué tal tu día?' },
  { text: 'Im Café bestellen', schick: 'Vamos a practicar: estoy en un café y quiero pedir algo.' },
  { text: 'Über Reisen reden', schick: 'Me gusta viajar. ¿Hablamos de viajes?' },
  { text: 'Einfach plaudern', schick: 'Hola Habla, ¿cómo estás?' },
]

export default function Gespraech({ onZurueck }) {
  const [verlauf, setVerlauf] = useState([]) // { rolle:'ich'|'tutor', es, de, korrektur }
  const [eingabe, setEingabe] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')
  const [deutschAn, setDeutschAn] = useState(
    () => localStorage.getItem(DEUTSCH_SPEICHER) !== 'aus'
  )
  const niveau = localStorage.getItem(NIVEAU_SPEICHER) || 'Anfänger'

  const endeRef = useRef(null)
  useEffect(() => {
    endeRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [verlauf, laedt])

  function schalteDeutsch() {
    setDeutschAn((an) => {
      localStorage.setItem(DEUTSCH_SPEICHER, an ? 'aus' : 'an')
      return !an
    })
  }

  /**
   * Eine Nachricht abschicken. Getrennt von der Eingabe, damit später
   * die Spracheingabe genau hier andocken kann.
   */
  async function sende(text) {
    const sauber = text.trim()
    if (!sauber || laedt) return

    // Optimistisch: die eigene Nachricht sofort zeigen, nicht erst
    // wenn die Antwort da ist.
    const meins = { rolle: 'ich', es: sauber, de: '', korrektur: '' }
    const naechster = [...verlauf, meins]
    setVerlauf(naechster)
    setEingabe('')
    setLaedt(true)
    setFehler('')

    try {
      const res = await fetch(API_URL + '/api/gespraech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niveau,
          // Nur Rolle + Text zum Server – der Tutor braucht nicht die
          // ganze Anzeige-Struktur.
          verlauf: naechster.map((z) => ({ rolle: z.rolle, text: z.es })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(
          data.error === 'premium'
            ? 'Der Sprach-Tutor ist Teil von Premium.'
            : data.error || 'Der Tutor antwortet gerade nicht.'
        )
      }
      setVerlauf((v) => [
        ...v,
        { rolle: 'tutor', es: data.es, de: data.de, korrektur: data.korrektur || '' },
      ])
    } catch (err) {
      setFehler(err.message)
      // Die eigene Nachricht stehen lassen, damit man sie nicht neu
      // tippen muss – nur der Tutor fehlt.
    } finally {
      setLaedt(false)
    }
  }

  const leer = verlauf.length === 0

  return (
    <div className="trainer gespraech">
      <button className="recht-zurueck" onClick={onZurueck}>← Zurück</button>

      <div className="gespr-kopf">
        <IconSprache groesse={22} />
        <div>
          <h1 className="trainer-titel">Sprechen mit Habla</h1>
          <p className="gespr-unter">
            Rede auf Spanisch über das, was du willst. Habla antwortet einfach –
            und übersetzt, falls du hängst.
          </p>
        </div>
      </div>

      {!leer && (
        <button className="lul-schalter gespr-schalter" onClick={schalteDeutsch}>
          {deutschAn ? 'Deutsch ausblenden' : 'Deutsch einblenden'}
        </button>
      )}

      {/* ---------- Der Gesprächsverlauf ---------- */}
      <div className="gespr-verlauf">
        {leer && (
          <div className="gespr-start">
            <p className="gespr-start-titel">Womit fangen wir an?</p>
            <div className="gespr-einstiege">
              {EINSTIEGE.map((e) => (
                <button key={e.text} className="gespr-chip" onClick={() => sende(e.schick)}>
                  {e.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {verlauf.map((z, i) => (
          <div key={i} className={'gespr-blase gespr-' + z.rolle}>
            <p className="gespr-es">{z.es}</p>
            {z.rolle === 'tutor' && deutschAn && z.de && (
              <p className="gespr-de">{z.de}</p>
            )}
            {z.rolle === 'tutor' && z.korrektur && (
              <p className="gespr-korrektur">💡 {z.korrektur}</p>
            )}
          </div>
        ))}

        {laedt && (
          <div className="gespr-blase gespr-tutor gespr-tippt">
            <span></span><span></span><span></span>
          </div>
        )}

        {fehler && <p className="gespr-fehler">{fehler}</p>}
        <div ref={endeRef} />
      </div>

      {/* ---------- Eingabe ---------- */}
      <form
        className="gespr-eingabe"
        onSubmit={(e) => {
          e.preventDefault()
          sende(eingabe)
        }}
      >
        <input
          type="text"
          value={eingabe}
          onChange={(e) => setEingabe(e.target.value)}
          placeholder="Auf Spanisch schreiben …"
          autoComplete="off"
          disabled={laedt}
        />
        <button type="submit" className="gespr-senden" disabled={laedt || !eingabe.trim()}>
          <IconPfeil groesse={20} />
        </button>
      </form>
    </div>
  )
}
