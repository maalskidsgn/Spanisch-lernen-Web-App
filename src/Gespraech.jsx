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
import { db, supabaseBereit } from './supabase.js'
import { IconSprache, IconPfeil } from './icons.jsx'

const NIVEAU_SPEICHER = 'gespraechNiveau'
const DEUTSCH_SPEICHER = 'gespraechDeutsch'

// Startpunkte, damit niemand vor einem leeren Feld sitzt. Zwei Sorten:
//
//   THEMEN – hier erzählt und erklärt Habla etwas (Gesundheit,
//   Technik …). Genau das, was sich Manuel gewünscht hat: nicht nur
//   plaudern, sondern zu einem Thema etwas erfahren und dabei die
//   Wörter dazu aufschnappen.
//
//   SITUATIONEN – hier spielt Habla eine Rolle (Café, Arzt), damit
//   man das Sprechen für den Ernstfall übt.
//
// Der Spanisch-Text ist der erste Zug im Gespräch; die deutsche
// Beschriftung nur die Aufschrift des Knopfs.
const THEMEN = [
  { text: '🥗 Gesundheit & Ernährung', schick: 'Hola Habla. Quiero aprender sobre la salud y comer bien. ¿Me cuentas algo, con palabras fáciles?' },
  { text: '💻 Technik', schick: 'Me interesa la tecnología. ¿Hablamos de eso con palabras sencillas?' },
  { text: '🌍 Natur & Umwelt', schick: 'Me gusta la naturaleza y los animales. ¿Me enseñas algo sobre eso?' },
  { text: '⚽ Sport', schick: 'Me gusta el deporte. ¿Hablamos de deportes?' },
  { text: '🎵 Musik', schick: 'Hablemos de música en español. ¿Qué me recomiendas escuchar?' },
  { text: '🍲 Essen', schick: 'Hablemos de la comida española y latina. ¿Qué platos me recomiendas?' },
  { text: '🎨 Kultur & Feste', schick: 'Cuéntame algo interesante sobre la cultura y las fiestas de España o Latinoamérica.' },
  { text: '📰 Alltag & Neuigkeiten', schick: 'Hablemos de la vida cotidiana. ¿Qué haces normalmente en un día?' },
]

const SITUATIONEN = [
  { text: 'Im Café bestellen', schick: 'Vamos a practicar: estoy en un café y quiero pedir algo.' },
  { text: 'Beim Arzt', schick: 'Practiquemos: estoy en el médico y no me siento bien.' },
  { text: 'Nach dem Weg fragen', schick: 'Practiquemos: estoy perdido en la ciudad y pregunto por el camino.' },
  { text: 'Einfach plaudern', schick: 'Hola Habla, ¿cómo estás?' },
]

// kopf: Wird der Chat als Reiter IM Trainer gezeigt, kommt hier die
// Reiter-Leiste rein (wie bei Bausteine.jsx) – dann steht oben kein
// „Zurück", sondern die Umschalter. Als eigene Seite (vom Start aus)
// bleibt onZurueck und der Zurück-Knopf.
export default function Gespraech({ onZurueck, kopf }) {
  const [verlauf, setVerlauf] = useState([]) // { rolle:'ich'|'tutor', es, de, korrektur }
  const [eingabe, setEingabe] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')
  // Wie viele Gratis-Nachrichten heute noch übrig sind. null = Premium
  // (unbegrenzt) oder noch nichts geschickt.
  const [frei, setFrei] = useState(null)
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
      // Anmelde-Token mitschicken – der Server führt das Tageslimit
      // pro Konto und muss wissen, wer fragt.
      const sitzung = supabaseBereit ? (await db.auth.getSession()).data.session : null
      const token = sitzung?.access_token

      const res = await fetch(API_URL + '/api/gespraech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
        body: JSON.stringify({
          niveau,
          // Nur Rolle + Text zum Server – der Tutor braucht nicht die
          // ganze Anzeige-Struktur.
          verlauf: naechster.map((z) => ({ rolle: z.rolle, text: z.es })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'limit') throw new Error(data.nachricht)
        throw new Error(data.error || 'Der Tutor antwortet gerade nicht.')
      }
      setVerlauf((v) => [
        ...v,
        { rolle: 'tutor', es: data.es, de: data.de, korrektur: data.korrektur || '' },
      ])
      setFrei(data.frei) // null bei Premium, sonst Rest für heute
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
      {kopf ? (
        kopf
      ) : (
        <button className="recht-zurueck" onClick={onZurueck}>← Zurück</button>
      )}

      {/* Als Reiter im Trainer gibt schon die Reiter-Leiste den Titel
          („Dein KI-Trainer") – dann wäre dieser Kopf doppelt. Nur als
          eigene Seite zeigen. */}
      {!kopf && (
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
      )}

      {!leer && (
        <button className="lul-schalter gespr-schalter" onClick={schalteDeutsch}>
          {deutschAn ? 'Deutsch ausblenden' : 'Deutsch einblenden'}
        </button>
      )}

      {/* ---------- Der Gesprächsverlauf ---------- */}
      <div className="gespr-verlauf">
        {leer && (
          <div className="gespr-start">
            <p className="gespr-start-titel">Worüber möchtest du reden?</p>
            <div className="gespr-einstiege">
              {THEMEN.map((e) => (
                <button key={e.text} className="gespr-chip" onClick={() => sende(e.schick)}>
                  {e.text}
                </button>
              ))}
            </div>

            <p className="gespr-start-titel gespr-start-zwei">Oder eine Situation üben</p>
            <div className="gespr-einstiege">
              {SITUATIONEN.map((e) => (
                <button
                  key={e.text}
                  className="gespr-chip gespr-chip-situation"
                  onClick={() => sende(e.schick)}
                >
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
        {/* Rest nur zeigen, wenn es knapp wird – sonst lenkt die Zahl
            nur vom Gespräch ab. */}
        {frei !== null && frei <= 5 && !fehler && (
          <p className="gespr-rest">
            Noch {frei} {frei === 1 ? 'Nachricht' : 'Nachrichten'} heute · unbegrenzt mit Premium
          </p>
        )}
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
