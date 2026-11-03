import { createPortal } from 'react-dom'
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
import { uebersetzungsAdresse } from './satzUmfeld.js'
import { API_URL, istApp } from './api.js'
import { db, supabaseBereit } from './supabase.js'
import { IconSprache, IconPfeil } from './icons.jsx'
import { erfolgston } from './erfolgston.js'
import { useTexte, sprache } from './sprache.js'

const NIVEAU_SPEICHER = 'gespraechNiveau'
const DEUTSCH_SPEICHER = 'gespraechDeutsch'

// Wort auf seine Grundform für den Trainer-Abgleich – gleiche Regel
// wie in Ebooks.jsx, damit ein Wort in Buch und Chat als dasselbe gilt.
function schluessel(wort) {
  return wort.toLowerCase().replace(/[^a-záéíóúüñ]/gi, '')
}

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
  { text: 'gs.gesundheitErnaehrung', schick: 'Hola Habla. Quiero aprender sobre la salud y comer bien. ¿Me cuentas algo, con palabras fáciles?' },
  { text: 'gs.technik', schick: 'Me interesa la tecnología. ¿Hablamos de eso con palabras sencillas?' },
  { text: 'gs.naturUmwelt', schick: 'Me gusta la naturaleza y los animales. ¿Me enseñas algo sobre eso?' },
  { text: 'gs.sport', schick: 'Me gusta el deporte. ¿Hablamos de deportes?' },
  { text: 'gs.musik', schick: 'Hablemos de música en español. ¿Qué me recomiendas escuchar?' },
  { text: 'gs.essen', schick: 'Hablemos de la comida española y latina. ¿Qué platos me recomiendas?' },
  { text: 'gs.kulturFeste', schick: 'Cuéntame algo interesante sobre la cultura y las fiestas de España o Latinoamérica.' },
  { text: 'gs.alltagNeuigkeiten', schick: 'Hablemos de la vida cotidiana. ¿Qué haces normalmente en un día?' },
]

const SITUATIONEN = [
  { text: 'gs.imCafBestellen', schick: 'Vamos a practicar: estoy en un café y quiero pedir algo.' },
  { text: 'gs.beimArzt', schick: 'Practiquemos: estoy en el médico y no me siento bien.' },
  { text: 'gs.nachDemWeg', schick: 'Practiquemos: estoy perdido en la ciudad y pregunto por el camino.' },
  { text: 'gs.einfachPlaudern', schick: 'Hola Habla, ¿cómo estás?' },
]

// kopf: Wird der Chat als Reiter IM Trainer gezeigt, kommt hier die
// Reiter-Leiste rein (wie bei Bausteine.jsx) – dann steht oben kein
// „Zurück", sondern die Umschalter. Als eigene Seite (vom Start aus)
// bleibt onZurueck und der Zurück-Knopf.
export default function Gespraech({ onZurueck, kopf, onAddVocab, vocab = {} }) {
  const t = useTexte()
  const [verlauf, setVerlauf] = useState([]) // { rolle:'ich'|'tutor', es, de, korrektur }
  const [eingabe, setEingabe] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')
  // Angetipptes Wort aus einer Habla-Antwort: { text, de, laedt }
  const [wort, setWort] = useState(null)
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

  // ---------- Wörter aus Hablas Antworten sammeln ----------

  /** Ein angetipptes Wort übersetzen und die Wortkarte öffnen. */
  async function wortAntippen(rohesWort, umfeld) {
    const sauber = rohesWort.replace(/[«».,;:¿?¡!()"—…]/g, '').trim()
    if (!sauber) return
    setWort({ text: sauber, de: '', laedt: true })
    try {
      const res = await fetch(uebersetzungsAdresse(API_URL, sauber, umfeld))
      const daten = await res.json()
      setWort({ text: sauber, de: daten.translation || '', laedt: false })
    } catch {
      setWort({ text: sauber, de: '', laedt: false })
    }
  }

  /**
   * Ins Trainer übernehmen – als „lernen" oder gleich als „gewusst".
   * Beides gibt den Erfolgston, damit sich das Sammeln gut anfühlt.
   */
  function wortSammeln(status) {
    if (!wort?.text || !onAddVocab) return setWort(null)
    onAddVocab(
      [{ wort: wort.text, uebersetzung: wort.de, quelle: t('gs9.gespraechMitHabla') }],
      status
    )
    erfolgston()
    setWort(null)
  }

  /** Macht aus Hablas spanischer Antwort einzeln antippbare Wörter. */
  function alsWoerter(text) {
    return text.split(/(\s+)/).map((teil, i) => {
      if (!teil.trim()) return teil
      const status = vocab[schluessel(teil)]?.status
      return (
        <span
          key={i}
          className={'lese-wort' + (status ? ' lese-wort-' + status : '')}
          onClick={() => wortAntippen(teil, text)}
        >
          {teil}
        </span>
      )
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
          sprache: sprache(),
          // Nur Rolle + Text zum Server – der Tutor braucht nicht die
          // ganze Anzeige-Struktur.
          verlauf: naechster.map((z) => ({ rolle: z.rolle, text: z.es })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'limit') throw new Error(data.nachricht)
        throw new Error(data.error || t('gsm.derTutorAntwortet'))
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
        <button className="btn-zurueck" onClick={onZurueck}><span className="zurueck-pfeil" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></span>{t('gs.zurueck')}</button>
      )}

      {/* Als Reiter im Trainer gibt schon die Reiter-Leiste den Titel
          („Dein KI-Trainer") – dann wäre dieser Kopf doppelt. Nur als
          eigene Seite zeigen. */}
      {!kopf && (
        <div className="gespr-kopf">
          <IconSprache groesse={22} />
          <div>
            <h1 className="trainer-titel">{t('gs.sprechenMitHabla')}</h1>
            <p className="gespr-unter">{t('gesX.redeAufSpanisch')}</p>
          </div>
        </div>
      )}

      {!leer && (
        <button className="lul-schalter gespr-schalter" onClick={schalteDeutsch}>
          {deutschAn ? t('gs9.deutschAusblenden') : t('gs9.deutschEinblenden')}
        </button>
      )}

      {/* ---------- Der Gesprächsverlauf ---------- */}
      <div className="gespr-verlauf">
        {leer && (
          <div className="gespr-start">
            <p className="gespr-start-titel">{t('gs.worueberMoechtestDu')}</p>
            <div className="gespr-einstiege">
              {THEMEN.map((e) => (
                <button key={e.text} className="gespr-chip" onClick={() => sende(e.schick)}>
                  {t(e.text)}
                </button>
              ))}
            </div>

            <p className="gespr-start-titel gespr-start-zwei">{t('gs.oderEineSituation')}</p>
            <div className="gespr-einstiege">
              {SITUATIONEN.map((e) => (
                <button
                  key={e.text}
                  className="gespr-chip gespr-chip-situation"
                  onClick={() => sende(e.schick)}
                >
                  {t(e.text)}
                </button>
              ))}
            </div>
          </div>
        )}

        {verlauf.map((z, i) => (
          <div key={i} className={'gespr-blase gespr-' + z.rolle}>
            {/* Nur Hablas Antworten sind antippbar – die eigene
                Nachricht braucht man nicht zu übersetzen. */}
            <p className="gespr-es">
              {z.rolle === 'tutor' && onAddVocab ? alsWoerter(z.es) : z.es}
            </p>
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
            {t('gs9.nochNachrichten', { zahl: frei, einheit: frei === 1 ? t('gs9.nachricht') : t('gs9.nachrichten') })}
            {!istApp && ' · ' + t('gs9.unbegrenztPremium')}
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
          placeholder={t('gs.aufSpanischSchreiben')}
          autoComplete="off"
          disabled={laedt}
        />
        <button type="submit" className="gespr-senden" disabled={laedt || !eingabe.trim()}>
          <IconPfeil groesse={20} />
        </button>
      </form>

      {/* ---------- Angetipptes Wort ---------- */}
      {wort && createPortal(
        <div className="wortkarte-hintergrund" onClick={() => setWort(null)}>
          <div className="wortkarte" onClick={(e) => e.stopPropagation()}>
            {/* X zum einfachen Wegklicken, ohne etwas zu sammeln. */}
            <button
              className="wortkarte-schliessen"
              aria-label={t('gs.schliessen')}
              onClick={() => setWort(null)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              </svg>
            </button>
            <div className="wortkarte-wort">
              {wort.text}
              {vocab[schluessel(wort.text)] && (
                <span className="wortkarte-marke">{t('gs.imTrainer')}</span>
              )}
            </div>
            <div className="wortkarte-de">
              {wort.laedt ? t('gs9.uebersetze') : wort.de || t('gsm.keineUebersetzungGefunden')}
            </div>
            <div className="wortkarte-knoepfe">
              <button
                className="btn-outline"
                onClick={() => wortSammeln('gewusst')}
                disabled={wort.laedt}
              >
                Kenne ich
              </button>
              <button className="btn" onClick={() => wortSammeln('lernen')} disabled={wort.laedt}>
                ＋ Lernen
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
