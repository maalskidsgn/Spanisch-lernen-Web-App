import { useState, useEffect } from 'react'
import {
  MODULE,
  baueSchritte,
  baueOptionen,
  lektionenVon,
  modulFortschritt,
  modulOffen,
  kommtBald,
  ALLES_OFFEN,
  LUECKE_MARKE,
} from './lektionen.js'
import { XP } from './gamification.js'
import { hakeAb } from './tagesplan.js'
import { merkeEinheit } from './aktivitaet.js'
import { spiele, dialogAbspielen, stimmeImDialog, gibtEsAufnahme } from './audio.js'
import Reiseroute from './Reiseroute.jsx'
import { IconLandkarte, IconListe } from './icons.jsx'
import {
  stationVon,
  stationOffen,
  stationGeschafft,
  stationAlsLektion,
  baueSchritteStation,
  nochOffen,
} from './pruefstationen.js'

// Macht aus einem Text mit *Sternchen* hübsche pinke Wort-Chips:
// "Sag *hola* zu Freunden" → Sag [hola] zu Freunden
function mitChips(text) {
  return text.split('*').map((teil, i) =>
    i % 2 === 1 ? (
      <span key={i} className="wort-chip">
        {teil}
      </span>
    ) : (
      teil
    )
  )
}

/**
 * Hebt das gelernte Wort im Beispielsatz farblich hervor.
 *
 * Ein reiner Textvergleich reichte nicht: Von 198 Woertern blieben 63
 * ohne Hervorhebung, weil das Wort im Satz anders aussieht als in der
 * Liste. Drei Gruende, alle normal im Spanischen:
 *
 *   hablar   → "Hablo español"        (Verb gebeugt)
 *   contento → "Está contenta"        (Adjektiv angepasst)
 *   el libro → "El libro está aquí"   (Artikel gehoert zum Eintrag)
 *
 * Deshalb wird nicht auf Gleichheit geprueft, sondern auf einen
 * gemeinsamen Wortstamm.
 */
const ARTIKEL = /^(el|la|los|las|un|una|unos|unas)\s+/i

function glaetten(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Glaettet den Satz und merkt sich, wo jedes Zeichen im Original
 * stand. Ohne diese Karte koennten wir eine Fundstelle im geglaetteten
 * Text nicht zurueckuebersetzen – Akzente aendern beim Zerlegen die
 * Laenge, "días" wird zu "dias" plus einem unsichtbaren Zeichen.
 */
function mitPositionen(satz) {
  let flach = ''
  const stellen = []
  for (let i = 0; i < satz.length; i++) {
    const z = glaetten(satz[i])
    for (const einzeln of z) {
      flach += einzeln
      stellen.push(i)
    }
  }
  return { flach, stellen }
}

export function hebeHervor(satz, wort) {
  // Manche Eintraege nennen mehrere Formen: "alemán / alemana" oder
  // "la eñe (ñ)". Im Satz steht immer nur EINE davon – also der Reihe
  // nach probieren, statt am ganzen Eintrag zu scheitern.
  const varianten = [
    wort,
    ...wort.split('/'),
    wort.replace(/\([^)]*\)/g, ''),
    // Reflexive Verben stehen im Eintrag mit -se, im Satz ohne:
    // "levantarse" wird zu "me levanto". Ohne das Abschneiden ist der
    // gemeinsame Stamm zu kurz und die Hervorhebung faellt aus.
    wort.replace(/se$/, ''),
    // Adjektive wechseln das Geschlecht: "rojo" steht im Satz als
    // "roja". Bei vier Buchstaben ist der gemeinsame Stamm sonst zu
    // kurz, um als Treffer zu zaehlen.
    wort.replace(/o$/, 'a'),
    wort.replace(/a$/, 'o'),
    // Wortgruppen mit Verb: "tener miedo" steht im Satz als "tengo
    // miedo". Die ganze Gruppe findet sich nicht, das Substantiv
    // schon – es ist der Teil, der sich nicht veraendert.
    ...wort.split(/\s+/).filter((w) => w.length > 3),
    // Beides zusammen: "encargarse de" steht im Satz als "me encargaba
    // del equipo". Erst das Wort aus der Gruppe loesen, dann das -se
    // abschneiden – einzeln reicht keiner der beiden Schritte.
    ...wort
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .map((w) => w.replace(/se$/, '')),
  ]
    .map((v) => v.replace(/[¿¡?!….]/g, '').replace(ARTIKEL, '').trim())
    .filter(Boolean)

  for (const kandidat of [...new Set(varianten)]) {
    const gefunden = suchStelle(satz, glaetten(kandidat))
    if (gefunden) {
      return (
        <>
          {satz.slice(0, gefunden.a)}
          <span className="example-hit">{satz.slice(gefunden.a, gefunden.e)}</span>
          {satz.slice(gefunden.e)}
        </>
      )
    }
  }
  return satz
}

/** Wo im Satz steht dieses Ziel? Gibt Start und Ende im Original. */
function suchStelle(satz, ziel) {
  if (!ziel) return null

  // Wortgruppen wie "buenos días" am Stueck suchen – sie stehen im
  // Satz genauso da, nur der Vergleich Wort fuer Wort findet sie nicht.
  if (ziel.includes(' ')) {
    const { flach, stellen } = mitPositionen(satz)
    const treffer = flach.indexOf(ziel)
    if (treffer !== -1) {
      return { a: stellen[treffer], e: stellen[treffer + ziel.length - 1] + 1 }
    }
  }

  // Jedes Wort des Satzes mit seiner Position merken
  let bestes = null
  const muster = /[\p{L}\u00f1\u00d1]+/gu
  for (const treffer of satz.matchAll(muster)) {
    const kandidat = glaetten(treffer[0])
    let gleich = 0
    while (gleich < kandidat.length && gleich < ziel.length && kandidat[gleich] === ziel[gleich]) gleich++

    // Der Stamm muss lang genug sein, sonst passt "casa" zu "cansado".
    // Bei kurzen Woertern verlangen wir fast alles, bei langen den Stamm.
    // Verben im Infinitiv duerfen kuerzer sein: "tomar" wird im Satz zu
    // "tomo", gemeinsam ist nur "tom".
    const istVerb = /(ar|er|ir)$/.test(ziel) && ziel.length >= 4
    const noetig = istVerb
      ? Math.max(3, ziel.length - 2)
      : ziel.length <= 4
        ? ziel.length
        : Math.max(4, ziel.length - 3)
    if (gleich >= noetig && (!bestes || gleich > bestes.gleich)) {
      bestes = { a: treffer.index, e: treffer.index + treffer[0].length, gleich }
    }
  }
  return bestes
}

// Der Lektionen-Bereich (wie bei Babbel):
// Eine Übersicht mit freischaltbaren Lektionen und ein Player, der durch
// Einleitung → Wörter → Wissen → Dialog → Übungen → Abschluss führt.
export default function Lessons({ lessonProgress, addXp, onLessonComplete }) {
  const [modul, setModul] = useState(null) // das gerade geöffnete Modul
  // Laeuft gerade eine Pruefstation? Das muss die App sich merken:
  // Sonst baut "Noch einmal" am Ende den Lektions-Ablauf ueber das
  // Stations-Objekt – mit 226 Vorstell-Schritten statt 25 Aufgaben.
  const [laufendeStation, setLaufendeStation] = useState(null)
  const [lektion, setLektion] = useState(null) // die gerade geöffnete Lektion
  const [schritte, setSchritte] = useState([])
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState(null) // { gewaehlt, richtig } nach einer Antwort
  const [richtige, setRichtige] = useState(0)
  const [optionen, setOptionen] = useState([])
  const [fertig, setFertig] = useState(false)
  // Karte oder Liste? Die Karte macht Freude, die Liste laesst einen
  // in einem langen Modul schnell etwas wiederfinden.
  const [ansicht, setAnsicht] = useState('karte')

  // Waehrend einer laufenden Lektion ist die untere Menueleiste weg.
  // Vorher lag sie direkt unter den Antwortknoepfen: ein Fehltipp
  // sprang aus der Lektion heraus, und der Fortschritt war weg.
  useEffect(() => {
    document.body.classList.toggle('lektion-laeuft', Boolean(lektion))
    return () => document.body.classList.remove('lektion-laeuft')
  }, [lektion])

  function brauchtOptionen(schritt) {
    return (
      schritt.typ === 'quiz' ||
      schritt.typ === 'luecke' ||
      schritt.typ === 'dialogquiz' ||
      schritt.typ === 'hoeren' ||
      schritt.typ === 'rueckblick'
    )
  }

  /**
   * Zaehlt als bewertete Aufgabe – auch der Satzbau, der seine
   * Loesung selbst prueft und keine Auswahl-Optionen braucht.
   * Ohne ihn kaeme am Ende "22 von 20 richtig" heraus.
   */
  function zaehltAlsUebung(schritt) {
    return brauchtOptionen(schritt) || schritt.typ === 'satzbau'
  }

  /**
   * Eine Lektion starten – oder eine Pruefstation.
   *
   * Die Station kommt als fertiges Lektions-Objekt herein und
   * bringt ihren eigenen Bauplan mit. Dadurch laeuft sie durch
   * genau diesen Ablauf: dieselben Quiz-Knoepfe, derselbe Satzbau,
   * derselbe Abschluss mit der 80-Prozent-Marke. Eine zweite
   * Oberflaeche waere eine zweite Stelle zum Kaputtgehen.
   */
  function starten(l, station = null) {
    setLaufendeStation(station)
    const s = station ? baueSchritteStation(station) : baueSchritte(l)
    setLektion(l)
    setSchritte(s)
    setIndex(0)
    setRichtige(0)
    setFertig(false)
    setFeedback(null)
    setOptionen(brauchtOptionen(s[0]) ? baueOptionen(s[0], l) : [])
  }

  function startenStation(station) {
    starten(stationAlsLektion(station), station)
  }

  function weiter() {
    const next = index + 1
    if (next >= schritte.length) {
      // Lektion geschafft! Bonus-XP und Wörter in den Trainer übernehmen
      addXp(XP.LEKTION)
      hakeAb('lektion') // Schritt im Tagesplan erledigt
      merkeEinheit() // zaehlt im Wochendiagramm
      onLessonComplete(lektion)
      setFertig(true)
      return
    }
    setIndex(next)
    setFeedback(null)
    setOptionen(brauchtOptionen(schritte[next]) ? baueOptionen(schritte[next], lektion) : [])
  }

  // Übungs-Antwort geklickt: Feedback zeigen, XP bei richtiger Antwort,
  // dann automatisch zum nächsten Schritt
  function antworten(option, richtig) {
    if (feedback) return // schon beantwortet
    const korrekt = option === richtig
    setFeedback({ gewaehlt: option, richtig })
    if (korrekt) {
      setRichtige((r) => r + 1)
      addXp(XP.QUIZ_RICHTIG)
    }
    setTimeout(weiter, korrekt ? 700 : 1600) // bei Fehlern etwas länger zum Lesen
  }

  // ---------- Abschluss-Bildschirm ----------
  if (lektion && fertig) {
    const uebungen = schritte.filter(zaehltAlsUebung).length
    const quote = uebungen > 0 ? Math.round((richtige / uebungen) * 100) : 100
    // Bewusst WEICH: Unter 80 % empfiehlt die App die Wiederholung
    // deutlich, blockiert aber nicht. Eine harte Sperre wuerde
    // Gelegenheitslerner vertreiben – und widerspraeche dem
    // offenen Aufbau der Sprach-Reise.
    const sitzt = quote >= 80

    return (
      <div className="lessons">
        <div className="flashcard done">
          {sitzt && (
            <div className="confetti-burst" aria-hidden="true">
              {Array.from({ length: 14 }, (_, i) => (
                <span key={i} className="confetti" style={{ '--i': i }} />
              ))}
            </div>
          )}

          {/* Die Quote als Ring – eine Zahl sagt mehr als ein Balken */}
          <div className={'quote-ring' + (sitzt ? ' ring-gut' : ' ring-uebung')}>
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle className="ring-grund" cx="50" cy="50" r="42" />
              <circle
                className="ring-voll"
                cx="50" cy="50" r="42"
                strokeDasharray={`${(quote / 100) * 264} 264`}
              />
            </svg>
            <span className="quote-zahl">{quote}<i>%</i></span>
          </div>

          <h2>
            {sitzt
              ? lektion.istStation
                ? 'Prüfstation bestanden!'
                : 'Lektion geschafft!'
              : 'Fast geschafft'}
          </h2>
          <p>
            {richtige} von {uebungen} Aufgaben richtig · +{XP.LEKTION} Bonus-XP
          </p>
          {lektion.kulturnotiz && (
            <p className="kulturnotiz">
              <b>Gut zu wissen:</b> {lektion.kulturnotiz}
            </p>
          )}
          <p className="bonus-note">
            {lektion.istStation
              ? sitzt
                ? 'Das Modul sitzt. Die Grammatik daraus kannst du im Trainer wachhalten.'
                : 'Ab 80 % gilt das Modul als bestanden. Nichts geht verloren – geh die schwachen Stellen in Ruhe noch einmal durch.'
              : sitzt
                ? 'Die neuen Wörter warten jetzt im Vokabeltrainer auf dich.'
                : 'Ab 80 % sitzt eine Lektion erfahrungsgemäß. Eine zweite Runde lohnt sich – die Wörter sind trotzdem schon im Trainer.'}
          </p>

          <div className="abschluss-knoepfe">
            {!sitzt && (
              <button onClick={() => starten(lektion, laufendeStation)}>Noch einmal</button>
            )}
            <button
              className={sitzt ? '' : 'btn-outline'}
              onClick={() => setLektion(null)}
            >
              Zurück zur Übersicht
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------- Lektions-Player ----------
  if (lektion) {
    const schritt = schritte[index]

    return (
      <div className="lessons">
        {/* Fortschritt oben */}
        <div className="player-top">
          <button className="btn-plain" onClick={() => setLektion(null)}>
            ✕
          </button>
          <div className="xp-bar player-bar">
            <div
              className="xp-bar-fill"
              style={{ width: (index / schritte.length) * 100 + '%' }}
            />
          </div>
        </div>

        {/* --- Einleitung: Was lernst du hier? --- */}
        {schritt.typ === 'intro' && (
          <div className="flashcard" key={'s' + index}>
            <div className="lesson-done-emoji">{lektion.emoji}</div>
            <div className="flash-word">{lektion.titel}</div>
            <p className="lesson-hint">
              {lektion.istStation ? 'Was hier auf dich zukommt' : 'Das lernst du in dieser Lektion'}
            </p>
            <ul className="intro-goals">
              {lektion.ziele.map((z) => (
                <li key={z}>✓ {z}</li>
              ))}
            </ul>
            <button onClick={weiter}>¡Vamos! Los geht’s</button>
          </div>
        )}

        {/* --- Neues Wort mit Ton und hervorgehobenem Beispielsatz --- */}
        {schritt.typ === 'lernen' && (
          <div className="flashcard word-step" key={'s' + index}>
            <p className="lesson-hint">📖 Neues Wort</p>
            <div className="word-row">
              <div className="flash-word">{schritt.item.es}</div>
              <HoerKnopf text={schritt.item.es} titel="Anhören" />
            </div>
            <div className="flash-translation">{schritt.item.de}</div>
            {schritt.item.beispielEs && (
              <div className="example-box">
                <div className="example-es">
                  {hebeHervor(schritt.item.beispielEs, schritt.item.es)}
                  <HoerKnopf
                    text={schritt.item.beispielEs}
                    titel="Satz anhören"
                    klein
                  />
                </div>
                <div className="example-de">{schritt.item.beispielDe}</div>
              </div>
            )}
            <button onClick={weiter}>Weiter</button>
          </div>
        )}

        {/* --- Gut zu wissen: strukturierte Tipps mit Wort-Chips --- */}
        {schritt.typ === 'info' && (
          <WissensKarte
            key={'s' + index}
            karten={lektion.wissen}
            nummer={schritt.karte ?? 0}
            istStation={lektion.istStation}
            onWeiter={weiter}
          />
        )}

        {/* --- Dialog als animierter Chat --- */}
        {schritt.typ === 'dialog' && (
          <DialogChat key={'s' + index} dialog={lektion.dialog} onWeiter={weiter} />
        )}

        {/* --- Übung: richtige Übersetzung auswählen --- */}
        {schritt.typ === 'quiz' && (
          <div className="flashcard" key={'s' + index}>
            <p className="lesson-hint">
              ✏️ {schritt.richtung === 'es-de' ? 'Was heißt…' : 'Wie sagt man…'}
            </p>
            <div className="flash-word">
              {schritt.richtung === 'es-de' ? schritt.item.es : schritt.item.de}
            </div>
            <QuizOptionen
              runde={index}
              optionen={optionen}
              feedback={feedback}
              richtig={schritt.richtung === 'es-de' ? schritt.item.de : schritt.item.es}
              onAntwort={antworten}
            />
          </div>
        )}

        {/* --- Wiederholung aus früheren Lektionen --- */}
        {schritt.typ === 'rueckblick' && (
          <div className="flashcard" key={'s' + index}>
            <p className="lesson-hint rueckblick-hinweis">
              Kurze Wiederholung – kennst du das noch?
            </p>
            <div className="flash-word">{schritt.item.es}</div>
            <QuizOptionen
              runde={index}
              optionen={optionen}
              feedback={feedback}
              richtig={schritt.item.de}
              onAntwort={antworten}
            />
          </div>
        )}

        {/* --- Hörverstehen: erst hören, dann Bedeutung wählen --- */}
        {schritt.typ === 'hoeren' && (
          <div className="flashcard" key={'s' + index}>
            <p className="lesson-hint">Hör zu – was bedeutet der Satz?</p>
            <button
              className="hoeren-knopf"
              onClick={() => spiele(schritt.zeile.es, { stimme: stimmeImDialog(schritt.dialog, schritt.zeile.sprecher) })}
            >
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a9 9 0 0 1 0 12" />
              </svg>
              Anhören
            </button>
            <QuizOptionen
              runde={index}
              optionen={optionen}
              feedback={feedback}
              richtig={schritt.zeile.de}
              onAntwort={antworten}
            />
          </div>
        )}

        {/* --- Satzbau: Wörter in die richtige Reihenfolge --- */}
        {schritt.typ === 'satzbau' && (
          <SatzbauUebung
            key={'s' + index}
            satzbau={schritt.satzbau}
            onErgebnis={(richtig) => antworten(richtig ? schritt.satzbau.loesung : '×', schritt.satzbau.loesung)}
          />
        )}

        {/* --- Übung: Wortpaare der Lektion verbinden --- */}
        {schritt.typ === 'paare' && (
          <LektionsPaare key={'s' + index} paare={schritt.paare} onWeiter={weiter} />
        )}

        {/* --- Abschlussfrage: einen ganzen Satz verstehen --- */}
        {schritt.typ === 'dialogquiz' && (
          <div className="flashcard" key={'s' + index}>
            <p className="lesson-hint">🎓 Vertiefung: Was bedeutet dieser Satz?</p>
            <div className="gap-sentence">{schritt.zeile.es}</div>
            <QuizOptionen
              runde={index}
              optionen={optionen}
              feedback={feedback}
              richtig={schritt.zeile.de}
              onAntwort={antworten}
            />
          </div>
        )}

        {/* --- Übung: Lückentext aus dem Beispielsatz --- */}
        {schritt.typ === 'luecke' && (
          <div className="flashcard" key={'s' + index}>
            <p className="lesson-hint">✏️ Setze das fehlende Wort ein</p>
            <div className="gap-sentence">
              {schritt.luecke.satz.split(LUECKE_MARKE).map((teil, i, alle) => (
                <span key={i}>
                  {teil}
                  {i < alle.length - 1 && <span className="luecke-linie" />}
                </span>
              ))}
            </div>
            <p className="gap-help">{schritt.item.beispielDe}</p>
            <QuizOptionen
              runde={index}
              optionen={optionen}
              feedback={feedback}
              richtig={schritt.luecke.loesung}
              onAntwort={antworten}
            />
          </div>
        )}
      </div>
    )
  }

  // ---------- Lektionen eines Moduls ----------
  if (modul) {
    const liste = lektionenVon(modul)
    const station = stationVon(modul)
    const { fertig: modulFertig, gesamt } = modulFortschritt(modul, lessonProgress)
    // Die erste noch nicht geschaffte Lektion – und NUR sie ist "dran".
    // Vorher galt jede offene als aktuell; mit ALLES_OFFEN waren das
    // alle, weshalb mehrere "Los geht's!" gleichzeitig standen.
    const naechsteId = liste.find((l) => !lessonProgress[l.id]?.fertig)?.id ?? null
    return (
      <div className="lessons">
        <button className="btn-plain back-link" onClick={() => setModul(null)}>
          ← Alle Module
        </button>
        <div className="modul-kopf">
          <span className="modul-kopf-ring" aria-hidden="true">
            {modul.emoji}
          </span>
          <div className="modul-kopf-text">
            <h1>{modul.titel}</h1>
            <p>{modul.beschreibung}</p>
          </div>
        </div>

        <div className="modul-stand">
          <span className="xp-bar goal-bar">
            <span
              className="xp-bar-fill"
              style={{ width: (modulFertig / gesamt) * 100 + '%', display: 'block' }}
            />
          </span>
          <span className="modul-stand-text">
            {modulFertig} / {gesamt} Lektionen
          </span>
          <span className={'modul-stand-chip' + (modulFertig === gesamt ? ' chip-fertig' : '')}>
            {modulFertig === gesamt ? 'Alles geschafft' : `${modulFertig} geschafft`}
          </span>
        </div>

        <div className="ansicht-schalter" role="tablist">
          <button
            role="tab"
            aria-selected={ansicht === 'karte'}
            className={ansicht === 'karte' ? 'aktiv' : ''}
            onClick={() => setAnsicht('karte')}
          >
            <IconLandkarte groesse={18} />
            Karte
          </button>
          <button
            role="tab"
            aria-selected={ansicht === 'liste'}
            className={ansicht === 'liste' ? 'aktiv' : ''}
            onClick={() => setAnsicht('liste')}
          >
            <IconListe groesse={18} />
            Liste
          </button>
        </div>

        {/* Der Schluessel laesst React den Block neu aufbauen, sobald
            man zwischen Karte und Liste wechselt – erst dadurch
            laeuft die Einblend-Animation los. Dieselbe Bauart wie
            beim Umschalter der Mediathek und des Trainers. */}
        <div className="wechsel" key={ansicht}>

        {ansicht === 'karte' && (
          <Reiseroute
            lektionen={liste}
            fortschritt={lessonProgress}
            naechsteId={naechsteId}
            onStart={(l) => {
              // Gesperrte Etappen nicht starten
              if (ALLES_OFFEN || l.id === naechsteId || lessonProgress[l.id]?.fertig) {
                starten(l)
              }
            }}
          />
        )}

        {ansicht === 'liste' && (
        <>
        {/* Der Kursplan: eine Zeile je Lektion.
            Jede sagt, WAS man dort lernt – diese Angabe steht laengst in
            den Lektionsdaten (grammatik), wurde aber nirgends gezeigt.
            Genau EINE Zeile ist die naechste: siehe naechsteId. */}
        <ol className="kursplan">
          {liste.map((l) => {
            const geschafft = lessonProgress[l.id]?.fertig
            const offen = ALLES_OFFEN || l.id === naechsteId || geschafft
            const dran = l.id === naechsteId

            return (
              <li key={l.id}>
                <button
                  className={
                    'plan-zeile' +
                    (geschafft ? ' plan-fertig' : '') +
                    (dran ? ' plan-dran' : '') +
                    (!offen ? ' plan-zu' : '')
                  }
                  disabled={!offen}
                  onClick={() => starten(l)}
                >
                  <span className="plan-nr">
                    {String(l.kursNr ?? '').padStart(2, '0')}
                  </span>
                  <span className="plan-text">
                    <span className="plan-titel">{l.titel}</span>
                    <span className="plan-lernst">
                      {l.grammatik?.[0] ?? l.beschreibung} · {l.items.length} Wörter
                    </span>
                  </span>
                  {geschafft ? (
                    <span className="plan-haken">✓</span>
                  ) : dran ? (
                    <span className="plan-knopf">Start</span>
                  ) : (
                    <span className="plan-schloss" aria-label="noch zu" />
                  )}
                </button>
              </li>
            )
          })}
        </ol>
        </>
        )}

        </div>

        {/* Die Pruefstation am Ende des Moduls.
            Sie steht bewusst UNTER beiden Ansichten statt in der
            Reiseroute: Die Route rechnet ihren Pfad aus der Anzahl
            der Lektionen aus – ein Sonderpunkt darin haette diese
            Rechnung verbogen, und in der Liste haette er gefehlt. */}
        {station && (
          <Stationskarte
            station={station}
            offen={stationOffen(station, lessonProgress)}
            geschafft={stationGeschafft(station, lessonProgress)}
            fehlend={nochOffen(station, lessonProgress)}
            onStart={() => startenStation(station)}
          />
        )}
      </div>
    )
  }

  // ---------- Modul-Übersicht: die Sprach-Reise ----------
  // Das laufende Modul steht oben als eigene Karte und taucht in der
  // Liste darunter NICHT noch einmal auf. Sonst muesste man beim
  // Oeffnen der App erst suchen, wo man stehengeblieben ist – und
  // genau das ist die eine Frage, die diese Seite beantworten soll.
  const laufendesModul = MODULE.find((m, i) => {
    if (!modulOffen(i, lessonProgress) || kommtBald(m)) return false
    const { fertig: f, gesamt } = modulFortschritt(m, lessonProgress)
    return gesamt > 0 && f < gesamt
  })

  return (
    <div className="lessons">
      <h1 className="reise-titel">
        Deine <span className="accent accent-strich">Sprach-Reise</span>
      </h1>
      <p className="intro">
        Lerne Schritt für Schritt Spanisch –<br />
        mit kurzen Videos, Übungen und echten Erfolgserlebnissen.
      </p>

      {laufendesModul && (
        <WeiterlernenKarte
          modul={laufendesModul}
          nummer={MODULE.indexOf(laufendesModul) + 1}
          fortschritt={modulFortschritt(laufendesModul, lessonProgress)}
          onOeffnen={() => setModul(laufendesModul)}
        />
      )}

      <h2 className="reise-abschnitt">
        <span aria-hidden="true">📖</span> Alle Module
      </h2>

      <div className="modul-liste">
        {MODULE.map((m, i) => {
          if (m === laufendesModul) return null
          const offen = modulOffen(i, lessonProgress)
          const { fertig: f, gesamt } = modulFortschritt(m, lessonProgress)
          const komplett = gesamt > 0 && f === gesamt
          const bald = kommtBald(m)
          return (
            <button
              key={m.id}
              className={
                'modul-kachel' +
                (komplett ? ' modul-fertig' : '') +
                (!offen ? ' modul-zu' : '')
              }
              disabled={!offen}
              onClick={() => setModul(m)}
            >
              <span className="modul-ring" aria-hidden="true">
                {bald ? '🔜' : offen ? m.emoji : '🔒'}
              </span>

              <span className="modul-text">
                <span className="modul-titel">
                  Modul {i + 1}: {m.titel}
                </span>
                <span className="modul-sub">{bald ? 'Kommt bald!' : m.beschreibung}</span>
                {!bald && (
                  <span className="modul-bar">
                    <span className="xp-bar goal-bar">
                      <span
                        className="xp-bar-fill"
                        style={{ width: (f / gesamt) * 100 + '%', display: 'block' }}
                      />
                    </span>
                    <span className="modul-count">
                      {f} / {gesamt} Lektionen
                    </span>
                  </span>
                )}
              </span>

              {!bald && (
                <span className={'modul-zahl' + (komplett ? ' modul-zahl-fertig' : '')}>
                  <b>{f}</b>
                  <i>/{gesamt}</i>
                  <em>Lektionen</em>
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Der Dialog als animierter Chat: Die Sprechblasen erscheinen nacheinander
// wie in einer Messenger-App – mit "tippt gerade…"-Punkten dazwischen.
// Tippe auf eine Blase, um ihre deutsche Übersetzung zu sehen.
function DialogChat({ dialog, onWeiter }) {
  const [anzahl, setAnzahl] = useState(0) // wie viele Blasen schon sichtbar sind
  const [laeuft, setLaeuft] = useState(null) // laufende Gespraechs-Wiedergabe
  const [uebersetzt, setUebersetzt] = useState([]) // welche Blasen Deutsch zeigen
  const [alleDe, setAlleDe] = useState(false) // alle Übersetzungen eingeblendet?
  const ersterSprecher = dialog[0].sprecher
  const alleDa = anzahl >= dialog.length

  // Nach jeder neuen Blase kurz "tippen", dann erscheint die nächste.
  // Laeuft gerade eine Wiedergabe, uebernimmt sie das Blaettern – der
  // Takt wuerde ihr sonst vorauseilen.
  useEffect(() => {
    if (alleDa || laeuft) return
    const timer = setTimeout(() => setAnzahl((a) => a + 1), anzahl === 0 ? 700 : 1600)
    return () => clearTimeout(timer)
  }, [anzahl, alleDa, laeuft])


  function toggle(i) {
    setUebersetzt((u) => (u.includes(i) ? u.filter((x) => x !== i) : [...u, i]))
  }

  // Den ganzen Dialog als Gespraech abspielen – jede Rolle mit
  // eigener Stimme, mit Atempausen dazwischen.
  function gespraech() {
    if (laeuft) {
      laeuft.stop()
      setLaeuft(null)
      return
    }
    // Waehrend der Wiedergabe fuehrt der Ton die Anzeige: Jede Blase
    // erscheint genau dann, wenn ihre Zeile erklingt. Ohne das lief
    // die Anzeige im festen 1,6-Sekunden-Takt weiter, waehrend eine
    // laengere Zeile noch gesprochen wurde.
    const steuerung = dialogAbspielen(dialog, {
      beiZeile: (i) => setAnzahl(i + 1),
    })
    setLaeuft(steuerung)
    steuerung.fertig.then(() => setLaeuft(null))
  }

  // Beim Verlassen der Lektion nicht weiterreden
  useEffect(() => () => laeuft?.stop(), [laeuft])

  // Auf welcher Seite steht der Sprecher, der als Nächstes "tippt"?
  const naechsteRechts = !alleDa && dialog[anzahl].sprecher !== ersterSprecher

  return (
    <div className="flashcard chat-card">
      <p className="lesson-hint">🗣️ Dialog – tippe auf eine Blase für die Übersetzung</p>
      <div className="chat">
        {dialog.slice(0, anzahl).map((zeile, i) => {
          const rechts = zeile.sprecher !== ersterSprecher
          return (
            <div key={i} className={'chat-row' + (rechts ? ' chat-rechts' : '')}>
              {/* Avatar-Kreis mit dem Anfangsbuchstaben des Sprechers */}
              <span className="chat-avatar">{zeile.sprecher[0]}</span>
              <button className="chat-bubble" onClick={() => toggle(i)}>
                <span className="chat-name">{zeile.sprecher}</span>
                {zeile.es}
                {(alleDe || uebersetzt.includes(i)) && (
                  <span className="chat-de">{zeile.de}</span>
                )}
              </button>
              <button
                className="chat-ton"
                title="Diese Zeile anhören"
                onClick={() => spiele(zeile.es, { stimme: stimmeImDialog(dialog, zeile.sprecher) })}
              >
                🔊
              </button>
            </div>
          )
        })}

        {/* "tippt gerade…"-Anzeige für die nächste Blase */}
        {!alleDa && (
          <div className={'chat-row' + (naechsteRechts ? ' chat-rechts' : '')}>
            <span className="chat-avatar">{dialog[anzahl].sprecher[0]}</span>
            <div className="chat-bubble chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      {alleDa && (
        <div className="flash-actions dialog-actions">
          <button className="btn-plain" onClick={gespraech}>
            {laeuft ? '⏹ Stopp' : '▶ Gespräch anhören'}
          </button>
          <button className="btn-plain" onClick={() => setAlleDe(!alleDe)}>
            {alleDe ? 'Übersetzung ausblenden' : 'Übersetzung zeigen'}
          </button>
          <button onClick={onWeiter}>Weiter</button>
        </div>
      )}
    </div>
  )
}

// Die vier Antwort-Knöpfe einer Übung, mit grün/rot-Feedback
function QuizOptionen({ optionen, feedback, richtig, onAntwort, runde = 0 }) {
  return (
    <div className="quiz-options">
      {optionen.map((o) => {
        let klasse = 'quiz-option'
        if (feedback) {
          if (o === feedback.richtig) klasse += ' option-richtig'
          else if (o === feedback.gewaehlt) klasse += ' option-falsch'
          else klasse += ' option-inaktiv'
        }
        return (
          // Der Rundenzähler MUSS in den key: Ohne ihn erkennt React
          // zwei Runden mit derselben Antwort als denselben Knopf,
          // behält ihn samt Fokus – und er sieht auf dem Handy aus,
          // als wäre er schon ausgewählt.
          <button
            key={runde + '-' + o}
            className={klasse}
            onClick={(e) => {
              e.currentTarget.blur()
              onAntwort(o, richtig)
            }}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Wortpaare innerhalb einer Lektion: links Spanisch, rechts Deutsch,
 * Paar antippen. Bewusst ohne Strafen – hier wird gefestigt, nicht
 * geprüft.
 */
function LektionsPaare({ paare, onWeiter }) {
  const [links, setLinks] = useState(null)
  const [geloest, setGeloest] = useState([])
  // Rechte Spalte deterministisch sortiert – nicht zufällig, damit
  // beim Neuzeichnen nichts springt
  const rechts = [...paare].sort((a, b) => a.de.localeCompare(b.de, 'de'))
  const fertig = geloest.length === paare.length

  function rechtsTipp(p) {
    if (!links || geloest.includes(p.es)) return
    if (p.es === links.es) setGeloest((g) => [...g, p.es])
    setLinks(null)
  }

  return (
    <div className="flashcard">
      <p className="lesson-hint">🔗 Verbinde die Paare</p>
      <div className="pairs-grid">
        <div className="pairs-col">
          {paare.map((p) => (
            <button
              key={p.es}
              className={
                'quiz-option' +
                (geloest.includes(p.es) ? ' option-richtig' : '') +
                (links?.es === p.es ? ' pair-gewaehlt' : '')
              }
              disabled={geloest.includes(p.es)}
              onClick={() => setLinks(p)}
            >
              {p.es}
            </button>
          ))}
        </div>
        <div className="pairs-col">
          {rechts.map((p) => (
            <button
              key={p.de}
              className={'quiz-option' + (geloest.includes(p.es) ? ' option-richtig' : '')}
              disabled={geloest.includes(p.es)}
              onClick={() => rechtsTipp(p)}
            >
              {p.de}
            </button>
          ))}
        </div>
      </div>
      {fertig && (
        <div className="flash-actions">
          <button onClick={onWeiter}>Weiter</button>
        </div>
      )}
    </div>
  )
}

/**
 * Satzbau: Die Wörter des Satzes liegen gemischt als Bausteine da,
 * Antippen setzt sie zusammen. Ein falscher Baustein lässt sich
 * durch erneutes Antippen wieder zurücklegen.
 */
function SatzbauUebung({ satzbau, onErgebnis }) {
  const [gewaehlt, setGewaehlt] = useState([]) // Indizes in Reihenfolge
  const [geprueft, setGeprueft] = useState(null) // true/false nach Pruefen
  const fertig = gewaehlt.length === satzbau.woerter.length

  function tippe(i) {
    if (geprueft !== null) return
    setGewaehlt((g) => (g.includes(i) ? g.filter((x) => x !== i) : [...g, i]))
  }

  function pruefen() {
    const satz = gewaehlt.map((i) => satzbau.woerter[i]).join(' ')
    const richtig = satz === satzbau.loesung
    setGeprueft(richtig)
    setTimeout(() => onErgebnis(richtig), richtig ? 900 : 1600)
  }

  return (
    <div className="flashcard">
      <p className="lesson-hint">Baue den Satz</p>
      <p className="satzbau-deutsch">{satzbau.uebersetzung}</p>

      {/* Der entstehende Satz */}
      <div className={'satzbau-ablage' + (geprueft === true ? ' ablage-richtig' : geprueft === false ? ' ablage-falsch' : '')}>
        {gewaehlt.length === 0 && <span className="ablage-leer">Tippe die Wörter unten an</span>}
        {gewaehlt.map((i) => (
          <button key={i} className="satz-baustein baustein-gesetzt" onClick={() => tippe(i)}>
            {satzbau.woerter[i]}
          </button>
        ))}
      </div>
      {geprueft === false && (
        <p className="satzbau-loesung">Richtig wäre: <b>{satzbau.loesung}</b></p>
      )}

      {/* Der Vorrat */}
      <div className="satzbau-vorrat">
        {satzbau.woerter.map((w, i) => (
          <button
            key={i}
            className={'satz-baustein' + (gewaehlt.includes(i) ? ' baustein-weg' : '')}
            disabled={gewaehlt.includes(i) || geprueft !== null}
            onClick={() => tippe(i)}
          >
            {w}
          </button>
        ))}
      </div>

      <div className="flash-actions">
        <button onClick={pruefen} disabled={!fertig || geprueft !== null}>
          Prüfen
        </button>
      </div>
    </div>
  )
}

/**
 * Die Pruefstation am Ende eines Moduls.
 *
 * Drei Zustaende, bewusst getrennt gehalten statt in verschachtelten
 * Fragezeichen: zu, offen, geschafft. Eine geschaffte Station bleibt
 * anklickbar – Wiederholen ist der ganze Zweck.
 */
function Stationskarte({ station, offen, geschafft, fehlend, onStart }) {
  if (!offen) {
    return (
      <div className="station station-zu">
        <span className="station-emoji" aria-hidden="true">🔒</span>
        <div className="station-text">
          <span className="station-marke">Prüfstation</span>
          <h3>{station.titel.replace('Prüfstation: ', '')}</h3>
          <p>
            Noch {fehlend} {fehlend === 1 ? 'Lektion' : 'Lektionen'} – dann kannst du das
            ganze Modul am Stück prüfen.
          </p>
        </div>
      </div>
    )
  }

  return (
    <button className={'station' + (geschafft ? ' station-fertig' : '')} onClick={onStart}>
      <span className="station-emoji" aria-hidden="true">
        {geschafft ? '✓' : station.emoji}
      </span>
      <div className="station-text">
        <span className="station-marke">{geschafft ? 'Bestanden' : 'Prüfstation'}</span>
        <h3>{station.titel.replace('Prüfstation: ', '')}</h3>
        <p>
          Rückblick und rund 25 Aufgaben aus dem ganzen Modul – ohne neue Wörter.
        </p>
      </div>
      <span className="station-knopf">{geschafft ? 'Nochmal' : 'Start'}</span>
    </button>
  )
}

/**
 * Eine einzelne Wissenskarte.
 *
 * Frueher standen alle drei untereinander auf einem Bildschirm. Das
 * war der Punkt, an dem eine Lektion sich nach Lehrbuch anfuehlte:
 * drei Erklaerungen am Stueck, bevor es weitergeht. Jetzt bekommt
 * jede ihren eigenen Schritt – und damit Platz, ein eigenes Symbol
 * und einen sichtbaren Fortschritt.
 *
 * Die Punkte unten sind nicht nur Zierde: Ohne sie wuesste niemand,
 * ob nach dieser Karte noch zwei kommen oder ob es weitergeht.
 */
function WissensKarte({ karten, nummer, istStation, onWeiter }) {
  const tipp = karten[nummer]
  const letzte = nummer === karten.length - 1

  return (
    <div className="flashcard info-card">
      <span className="info-icon">{tipp.emoji}</span>
      <p className="lesson-hint">{istStation ? 'Rückblick' : 'Gut zu wissen'}</p>

      <div className="info-einzeln">
        <h3 className="info-title">{tipp.titel}</h3>
        <p className="info-text">{mitChips(tipp.text)}</p>
      </div>

      {karten.length > 1 && (
        <div className="info-punkte" aria-label={`Karte ${nummer + 1} von ${karten.length}`}>
          {karten.map((_, i) => (
            <i key={i} className={i === nummer ? 'punkt-aktiv' : ''} />
          ))}
        </div>
      )}

      <button onClick={onWeiter}>{letzte ? 'Verstanden' : 'Weiter'}</button>
    </div>
  )
}

/**
 * Die Karte "Weiterlernen" ganz oben.
 *
 * Sie beantwortet die einzige Frage, mit der jemand diese Seite
 * oeffnet: Wo war ich? Deshalb steht sie ueber der Liste und nicht
 * darin – und deshalb faellt sie in der Liste darunter weg.
 */
function WeiterlernenKarte({ modul, nummer, fortschritt, onOeffnen }) {
  const { fertig, gesamt } = fortschritt
  return (
    <button className="weiterlernen" onClick={onOeffnen}>
      <span className="weiterlernen-ring" aria-hidden="true">
        {modul.emoji}
      </span>
      <span className="weiterlernen-text">
        <span className="weiterlernen-marke">Weiterlernen</span>
        <span className="weiterlernen-titel">
          Modul {nummer}: {modul.titel}
        </span>
        <span className="weiterlernen-sub">{modul.beschreibung}</span>
        <span className="modul-bar">
          <span className="xp-bar goal-bar">
            <span
              className="xp-bar-fill"
              style={{ width: (fertig / gesamt) * 100 + '%', display: 'block' }}
            />
          </span>
          <span className="modul-count">
            {fertig} / {gesamt} Lektionen
          </span>
        </span>
      </span>
      {/* Als Grafik, nicht als Schriftzeichen: Das "›" ist in Nunito
          winzig und sitzt zu hoch in seiner Zeile. */}
      <span className="weiterlernen-pfeil" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M9 5l7 7-7 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  )
}

/**
 * Ein Lautsprecher – aber nur, wenn es wirklich etwas zu hoeren gibt.
 *
 * Frueher stand der Knopf immer da und fiel auf die Browser-Stimme
 * zurueck, wenn keine Aufnahme existierte. In einem Aussprachekurs
 * ist das schlimmer als kein Knopf: Wer "La eñe es una letra
 * española" von der Blechstimme hoert, lernt eine Aussprache, die es
 * so nicht gibt.
 *
 * Der Platz bleibt NICHT reserviert – der Knopf verschwindet ganz.
 * Sobald das Vertonungsskript den Satz nachliefert, ist er wieder da,
 * ohne dass hier etwas geaendert werden muesste.
 */
function HoerKnopf({ text, titel, klein = false, stimme }) {
  const [gibtEs, setGibtEs] = useState(null) // null = wird noch geprueft

  useEffect(() => {
    let abgebrochen = false
    gibtEsAufnahme(text, stimme).then((da) => !abgebrochen && setGibtEs(da))
    return () => { abgebrochen = true }
  }, [text, stimme])

  if (!gibtEs) return null

  return (
    <button
      className={'speak-btn' + (klein ? ' speak-btn-mini' : '')}
      onClick={() => spiele(text, stimme ? { stimme } : undefined)}
      title={titel}
    >
      🔊
    </button>
  )
}
