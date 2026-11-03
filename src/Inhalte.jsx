import { useState, useEffect } from 'react'
import { holeVerzeichnis, holeInhalt, lesedauer, teileMitVokabeln, ARTEN } from './inhalte.js'
import { spiele } from './audio.js'
import { API_URL } from './api.js'
import { IconSuche, IconPfeil, IconMediathek, IconBuch, IconLesezeichen } from './icons.jsx'
import { Hero, Kopf, SuchFeld } from './MediathekUI.jsx'
import { sprache, useTexte } from './sprache.js'

// Hörtexte und Lesetexte – zwei Bereiche, eine Anzeige.
//
// Beide sind im Kern dasselbe: spanischer Text, deutsche Fassung
// daneben, dazu markierte Vokabeln. Der Unterschied ist, dass ein
// Hörtext eine Tonspur hat und ein Lesetext in Kapitel zerfällt.
// Das rechtfertigt keine zwei Komponenten.

export default function Inhalte({ art, onAddVocab, vocab = {}, zusatz = null, ohneHero = false }) {
  const t = useTexte()
  const [verzeichnis, setVerzeichnis] = useState(null)
  const [fehler, setFehler] = useState('')
  const [offen, setOffen] = useState(null) // der gerade gelesene Text
  const [suche, setSuche] = useState('')

  useEffect(() => {
    let abgebrochen = false
    setVerzeichnis(null)
    setFehler('')
    setOffen(null)
    holeVerzeichnis(art)
      .then((v) => !abgebrochen && setVerzeichnis(v))
      .catch((f) => !abgebrochen && setFehler(f.message))
    return () => { abgebrochen = true }
  }, [art])

  if (offen) {
    return (
      <Leser
        art={art}
        eintrag={offen}
        onZurueck={() => setOffen(null)}
        onAddVocab={onAddVocab}
        vocab={vocab}
      />
    )
  }

  if (fehler) {
    return (
      <p className="inhalt-hinweis">
        {fehler} – bitte später noch einmal versuchen.
      </p>
    )
  }
  if (!verzeichnis) return <p className="inhalt-hinweis">{t('ih.wirdGeladen')}</p>

  const begriff = suche.trim().toLowerCase()
  const gefiltert = begriff
    ? verzeichnis.filter((e) => e.titel.toLowerCase().includes(begriff))
    : verzeichnis

  const hoeren = art === 'hoertexte'

  return (
    <>
      {/* Ohne eigene Hauptkarte: Dann hat der Bereich schon eine –
          bei den Ebooks ist das das Formular zum Erzeugen. Zwei
          grosse Karten uebereinander waeren eine zu viel. */}
      {!ohneHero && (
        <Hero
          symbol={hoeren ? <IconMediathek groesse={26} /> : <IconBuch groesse={26} />}
          titel={hoeren ? t('ihm.hoerDichDurch') : t('ih9.ebookFinden')}
          text={
            hoeren
              ? t('ihm.jedeFolgeMit')
              : t('ihm.jedesKapitelAuf')
          }
        >
          <SuchFeld
            wert={suche}
            onWert={setSuche}
            onAbsenden={() => {}}
            platzhalter={t('ih9.durchsuchen', { was: t(ARTEN[art].titel) })}
            knopf={t('ih9.filtern')}
          />
        </Hero>
      )}

      {zusatz}

      <section className="bereich">
      {ohneHero && (
        <label className="inhalt-suche">
          <IconSuche groesse={17} />
          <input
            type="search"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder={t('ih9.durchsuchen', { was: t(ARTEN[art].titel) })}
          />
        </label>
      )}
      <Kopf
        symbol={<IconLesezeichen groesse={19} />}
        titel={begriff ? t('ih9.trefferFuer', { suche: suche.trim() }) : t(ARTEN[art].titel)}
        text={
          begriff
            ? t('ih9.vonGesamt', { zahl: gefiltert.length, gesamt: verzeichnis.length })
            : t('ihm.zumLesenAntippen')
        }
        zahl={gefiltert.length}
      />

      <ul className="inhalt-liste">
        {gefiltert.map((e) => (
          <li key={e.slug}>
            <button className="inhalt-zeile" onClick={() => setOffen(e)}>
              <span className="inhalt-text">
                <span className="inhalt-titel">{e.titel}</span>
                <span className="inhalt-meta">
                  {e.kapitel ? `${e.kapitel} Kapitel · ` : ''}
                  {lesedauer(e.zeichen)} Min
                  {e.audio ? ' · ' + t('ih9.zumHoeren') : ''}
                </span>
              </span>
              <IconPfeil groesse={17} />
            </button>
          </li>
        ))}
      </ul>

      {gefiltert.length === 0 && (
        <p className="inhalt-hinweis">{t('ih.dazuHabenWir')}</p>
      )}
      </section>
    </>
  )
}

/** Der Lesebereich: spanischer Text, deutsche Fassung auf Tippen. */
function Leser({ art, eintrag, onZurueck, onAddVocab, vocab }) {
  const t = useTexte()
  // Welches Wort wird gerade uebersetzt? Ohne Rueckmeldung wirkt der
  // Tipp folgenlos, waehrend im Hintergrund die Uebersetzung laeuft.
  const [holt, setHolt] = useState(null)
  const [wortFehler, setWortFehler] = useState('')

  /**
   * Ein markiertes Wort in den Trainer legen.
   *
   * Die Uebersetzung steht auf der Website NICHT bei den markierten
   * Woertern – sie muss geholt werden. Und addVocabWords erwartet
   * Objekte, keine blossen Woerter: Eine Zeichenkette laeuft dort in
   * eine Schleife ueber ihre Buchstaben und stuerzt ab.
   */
  async function wortUebernehmen(wort) {
    if (holt || vocab[wort.toLowerCase()]) return
    setHolt(wort)
    setWortFehler('')
    try {
      const r = await fetch(API_URL + '/api/translate?q=' + encodeURIComponent(wort) + '&sprache=' + sprache())
      const d = await r.json()
      if (!r.ok || !d.translation) throw new Error(d.error || t('ihm.keineUebersetzungGefunden'))
      onAddVocab?.([{
        wort,
        uebersetzung: d.translation,
        quelle: (art === 'hoertexte' ? t('ih9.hoertextQuelle') + ' ' : 'Ebook: ') + eintrag.titel,
      }])
    } catch (f) {
      setWortFehler(t('ih9.nichtUebernommen', { wort, fehler: f.message }))
    } finally {
      setHolt(null)
    }
  }

  const [daten, setDaten] = useState(null)
  const [fehler, setFehler] = useState('')
  const [kapitel, setKapitel] = useState(0)
  const [uebersetzt, setUebersetzt] = useState([]) // welche Absätze Deutsch zeigen

  useEffect(() => {
    let abgebrochen = false
    holeInhalt(art, eintrag.slug)
      .then((d) => !abgebrochen && setDaten(d))
      .catch((f) => !abgebrochen && setFehler(f.message))
    return () => { abgebrochen = true }
  }, [art, eintrag.slug])

  // Beim Kapitelwechsel die aufgedeckten Übersetzungen zurücksetzen –
  // sonst wäre im neuen Kapitel willkürlich Absatz 3 aufgeklappt.
  useEffect(() => setUebersetzt([]), [kapitel])

  if (fehler) return <p className="inhalt-hinweis">{fehler}</p>
  if (!daten) return <p className="inhalt-hinweis">{t('ih.wirdGeladen')}</p>

  const hatKapitel = Array.isArray(daten.kapitel) && daten.kapitel.length > 0
  const teil = hatKapitel ? daten.kapitel[kapitel] : daten
  const absaetze = teil.absaetze ?? []
  const deutsch = teil.absaetzeDe ?? []

  const umschalten = (i) =>
    setUebersetzt((u) => (u.includes(i) ? u.filter((x) => x !== i) : [...u, i]))

  return (
    <section className="lesetext">
      <button className="btn-plain back-link" onClick={onZurueck}>
        ← {t(ARTEN[art].titel)}
      </button>

      <h2 className="lesetext-titel">{daten.titelOriginal}</h2>

      {daten.audio && (
        <audio className="lesetext-ton" controls preload="none" src={daten.audio}>{t('ih2.deinBrowserKann')}</audio>
      )}

      {hatKapitel && (
        <div className="lesetext-kapitel">
          <button
            className="btn-plain"
            disabled={kapitel === 0}
            onClick={() => setKapitel((k) => k - 1)}
            aria-label={t('ih.vorherigesKapitel')}
          >
            ←
          </button>
          <span>
            {teil.label || t('ih9.kapitelNr', { zahl: kapitel + 1 })} · {t('ih9.nrVon', { nr: kapitel + 1, gesamt: daten.kapitel.length })}
          </span>
          <button
            className="btn-plain"
            disabled={kapitel >= daten.kapitel.length - 1}
            onClick={() => setKapitel((k) => k + 1)}
            aria-label={t('ih.naechstesKapitel')}
          >
            →
          </button>
        </div>
      )}

      {teil.titel && <h3 className="lesetext-kapitel-titel">{teil.titel}</h3>}

      <div className="lesetext-koerper">
        {absaetze.map((absatz, i) => (
          <div className="lesetext-absatz" key={i}>
            <p onClick={() => umschalten(i)}>
              {teileMitVokabeln(absatz, daten.vokabeln).map((stueck, k) =>
                stueck.vokabel ? (
                  <button
                    key={k}
                    className={
                      'lesetext-vokabel' +
                      (vocab[stueck.text.toLowerCase()] ? ' schon-da' : '') +
                      (holt === stueck.text ? ' laedt' : '')
                    }
                    onClick={(e) => {
                      e.stopPropagation() // nicht zugleich den Absatz übersetzen
                      spiele(stueck.text)
                      wortUebernehmen(stueck.text)
                    }}
                    title={t('ih.anhoerenUndIn')}
                  >
                    {stueck.text}
                  </button>
                ) : (
                  <span key={k}>{stueck.text}</span>
                )
              )}
            </p>
            {uebersetzt.includes(i) && deutsch[i] && (
              <p className="lesetext-deutsch">{deutsch[i]}</p>
            )}
          </div>
        ))}
      </div>

      {wortFehler && <p className="lesetext-wortfehler">{wortFehler}</p>}

      <p className="lesetext-hinweis">{t('ih2.tippeEinenAbsatz')}</p>
    </section>
  )
}
