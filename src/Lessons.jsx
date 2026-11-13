import GratisHinweis from './GratisHinweis.jsx'
import { Fragment, useState, useEffect } from 'react'
import {
  MODULE,
  KURSFOLGE,
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
import { merkeGelernt } from './lernkurve.js'
import { erfolgston, fehlerton } from './erfolgston.js'
import { spiele, vorladen, dialogAbspielen, stimmeImDialog, tonVonSelbst } from './audio.js'
import HoerKnopf, { VonSelbst } from './HoerKnopf.jsx'
import Reiseroute from './Reiseroute.jsx'
import ModulBild from './ModulBild.jsx'
import { IconLandkarte, IconListe, IconLautsprecher } from './icons.jsx'
import {
  stationVon,
  stationOffen,
  stationGeschafft,
  stationAlsLektion,
  baueSchritteStation,
  nochOffen,
} from './pruefstationen.js'
import {
  szeneVon,
  szeneOffen,
  szeneGeschafft,
  szeneAlsLektion,
  baueSchritteSzene,
  nochBisSzene,
} from './mitgehoert.js'

import { useTexte, vokabel, satz, text as uebersetzt } from './sprache.js'
import { GRATIS_LEKTIONEN, istPremiumModul } from './gratisModule.js'
import { usePremium, LEKTIONEN_SPERRE, TESTPHASE_ALLES_FREI } from './premium.js'
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
// Die Lektionen, die ohne Premium offen bleiben (siehe premium.js)
// Seit 13.11.2026 ganze Module (gratisModule.js): die ersten 2.
const GRATIS = GRATIS_LEKTIONEN

// Krone für Premium-Module (13.11.2026)
const KRONE = (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor">
    <path d="M3 8l4.5 3.5L12 5l4.5 6.5L21 8l-2 11H5L3 8z" />
  </svg>
)

export default function Lessons({ lessonProgress, addXp, onLessonComplete, onKasse }) {
  const t = useTexte()
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
  const { premium } = usePremium()
  // Gilt erst, wenn LEKTIONEN_SPERRE an ist – bis zum offiziellen Start aus.
  const sperreAn = LEKTIONEN_SPERRE && !TESTPHASE_ALLES_FREI && !premium
  // Gratis: die ersten Module (gratisModule.js); Station/Szene nur, wenn
  // ihr ganzes Modul gratis ist.
  function gesperrt(l, station = null) {
    if (!sperreAn) return false
    if (station) return lektionenVon(modul).some((x) => !GRATIS.has(x.id))
    return !GRATIS.has(l.id)
  }
  // Ganzes Modul hinter Premium? Nur für Gratis-Nutzer sichtbar markiert.
  const modulGesperrt = (m) => sperreAn && istPremiumModul(m)

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
      schritt.typ === 'rueckblick' ||
      schritt.typ === 'verstehen'
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
    if (gesperrt(l, station)) {
      onKasse?.()
      return
    }
    vorladen(l) // alle Aufnahmen der Lektion schon mal holen
    setLaufendeStation(station)
    // Szene, Station oder gewoehnliche Lektion – drei Bauplaene, ein
    // Ablauf. Was laeuft, kommt immer als zweites Argument mit, damit
    // "Noch einmal" denselben Bauplan noch einmal nimmt.
    const s = l.istSzene
      ? baueSchritteSzene(station)
      : station
        ? baueSchritteStation(station)
        : baueSchritte(l)
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

  // Eine Hoerszene laeuft durch denselben Ablauf wie eine Lektion.
  // Die Szene selbst reist in laufendeStation mit – "Noch einmal"
  // baut den Ablauf sonst aus dem Lektions-Objekt neu, und das hat
  // weder Fragen noch Abschrift.
  function startenSzene(szene) {
    starten({ ...szeneAlsLektion(szene), szene }, szene)
  }

  function weiter() {
    const next = index + 1
    if (next >= schritte.length) {
      // Lektion geschafft! Bonus-XP und Wörter in den Trainer übernehmen
      addXp(XP.LEKTION)
      erfolgston() // die Lektion ist geschafft – das darf man hoeren
      hakeAb('lektion') // Schritt im Tagesplan erledigt
      merkeEinheit('lektion') // zaehlt als Lektion
      merkeGelernt('lektionen')
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
    if (korrekt) erfolgston()
    else fehlerton()
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

    const titel = sitzt
      ? lektion.istStation
        ? t('ls3.stationBestanden')
        : lektion.istSzene
          ? '¡Muy bien!'
          : '¡Excelente!'
      : t('ls3.fastGeschafft')

    const untertitel = lektion.istSzene
      ? sitzt
        ? t('ls3.szeneGut')
        : t('ls3.szeneNochmal')
      : lektion.istStation
        ? sitzt
          ? t('ls3.stationGut')
          : t('ls3.stationNochmal')
        : sitzt
          ? t('ls.neueWoerterWarten')
          : t('ls3.lektionNochmal')

    return (
      <div className="lessons abschluss-seite">
        {/* Der obere, farbige Teil: Ring, Titel, Konfetti */}
        <div className={'abschluss-held' + (sitzt ? '' : ' held-uebung')}>
          {sitzt && (
            <div className="konfetti-regen" aria-hidden="true">
              {Array.from({ length: 22 }, (_, i) => (
                <span key={i} className="konfetti" style={{ '--i': i }} />
              ))}
            </div>
          )}

          <div
            className={'abschluss-ring' + (sitzt ? ' ring-gut' : ' ring-uebung')}
            style={{ '--ziel': (quote / 100) * 264 }}
          >
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle className="ring-grund" cx="50" cy="50" r="42" />
              <circle className="ring-voll" cx="50" cy="50" r="42" />
            </svg>
            <ZaehlZahl bis={quote} />
          </div>

          <h1 className="abschluss-titel">{titel}</h1>
          <p className="abschluss-lektion">{lektion.emoji} {uebersetzt(lektion.titel)}</p>
        </div>

        {/* Der untere, ruhige Teil: Zahlen, Notiz, Knoepfe */}
        <div className="abschluss-blatt">
          <div className="abschluss-chips">
            <div className="abschluss-chip">
              <b>{richtige}/{uebungen}</b>
              <span>{t('ls.aufgabenRichtig')}</span>
            </div>
            <div className="abschluss-chip chip-xp">
              <b>+{XP.LEKTION}</b>
              <span>{t('ls.bonusXp')}</span>
            </div>
          </div>

          {lektion.kulturnotiz && (
            <div className="abschluss-notiz">
              <span className="start-marke">{t('ls.gutZuWissen')}</span>
              <p>{uebersetzt(lektion.kulturnotiz)}</p>
            </div>
          )}

          <p className="abschluss-text">{untertitel}</p>

          <div className="abschluss-knoepfe">
            {!sitzt && (
              <button className="btn" onClick={() => starten(lektion, laufendeStation)}>{t('ls2.nochEinmal')}</button>
            )}
            <button
              className={sitzt ? 'btn abschluss-weiter' : 'btn-outline'}
              onClick={() => setLektion(null)}
            >
              {sitzt ? t('ls9.weiterGehtS') : t('ls9.zurueckZurUebersicht')}
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
      <div className="lessons lk-toon">
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
            <div className="flash-word">{uebersetzt(lektion.titel)}</div>
            <p className="lesson-hint">
              {lektion.istStation || lektion.istSzene
                ? t('lsm.wasHierAuf')
                : t('lsm.dasLernstDu')}
            </p>
            <ul className="intro-goals">
              {lektion.ziele.map((z) => (
                <li key={z}>✓ {uebersetzt(z)}</li>
              ))}
            </ul>
            <button onClick={weiter}>{t('ls.vamosLosGeht')}</button>
          </div>
        )}

        {/* --- Neues Wort mit Ton und hervorgehobenem Beispielsatz --- */}
        {schritt.typ === 'lernen' && (
          <div className="flashcard word-step" key={'s' + index}>
            <p className="lesson-hint">{t('ls.neuesWort').replace(/^\S+\s+/, '')}</p>
            <div className="word-row">
              <div className="flash-word">{schritt.item.es}</div>
              {/* vonSelbst: Das Wort erklingt, sobald die Karte da
                  ist. Wer erst tippen muss, liest es vorher still –
                  und merkt sich eine Aussprache, die er sich selbst
                  ausgedacht hat. Der Satz bleibt auf Tipp: Zwei
                  Aufnahmen hintereinander wuerden sich abwuergen. */}
              <HoerKnopf text={schritt.item.es} titel={t('ls9.anhoeren')} vonSelbst />
            </div>
            <div className="flash-translation">{vokabel(schritt.item)}</div>
            {schritt.item.beispielEs && (
              <div className="example-box">
                <div className="example-es">
                  {hebeHervor(schritt.item.beispielEs, schritt.item.es)}
                  <HoerKnopf
                    text={schritt.item.beispielEs}
                    titel={t('ls9.satzAnhoeren')}
                    klein
                  />
                </div>
                <div className="example-de">{satz(schritt.item)}</div>
              </div>
            )}
            <button onClick={weiter}>{t('ls.weiter')}</button>
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
              {schritt.richtung === 'es-de' ? t('ls9.wasHeisst') : t('ls9.wieSagtMan')}
            </p>
            <div className="flash-word">
              {schritt.richtung === 'es-de' ? schritt.item.es : vokabel(schritt.item)}
            </div>
            <QuizOptionen
              runde={index}
              optionen={optionen}
              feedback={feedback}
              richtig={schritt.richtung === 'es-de' ? vokabel(schritt.item) : schritt.item.es}
              onAntwort={antworten}
            />
          </div>
        )}

        {/* --- Wiederholung aus früheren Lektionen --- */}
        {schritt.typ === 'rueckblick' && (
          <div className="flashcard" key={'s' + index}>
            <p className="lesson-hint rueckblick-hinweis">{t('ls2.kurzeWiederholungKennst')}</p>
            <div className="flash-word">{schritt.item.es}</div>
            <QuizOptionen
              runde={index}
              optionen={optionen}
              feedback={feedback}
              richtig={vokabel(schritt.item)}
              onAntwort={antworten}
            />
          </div>
        )}

        {/* --- Hörverstehen: erst hören, dann Bedeutung wählen --- */}
        {schritt.typ === 'hoeren' && (
          <div className="flashcard" key={'s' + index}>
            <p className="lesson-hint">{t('ls.hoerZuWas')}</p>
            <VonSelbst
              text={schritt.zeile.es}
              stimme={stimmeImDialog(schritt.dialog, schritt.zeile.sprecher)}
            />
            <button
              className="hoeren-knopf"
              onClick={() => spiele(schritt.zeile.es, { stimme: stimmeImDialog(schritt.dialog, schritt.zeile.sprecher) })}
            >
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a9 9 0 0 1 0 12" />
              </svg>
              {t('ls9.anhoeren')}
            </button>
            <QuizOptionen
              runde={index}
              optionen={optionen}
              feedback={feedback}
              richtig={satz(schritt.zeile, 'es', 'de')}
              onAntwort={antworten}
            />
          </div>
        )}

        {/* --- Mitgehört: das Gespräch, einmal ohne Text --- */}
        {schritt.typ === 'hoerszene' && (
          <HoerSzene key={'s' + index} szene={schritt.szene} onWeiter={weiter} />
        )}

        {/* --- Mitgehört: eine Frage zum Inhalt --- */}
        {schritt.typ === 'verstehen' && (
          <div className="flashcard" key={'s' + index}>
            <p className="lesson-hint">
              {schritt.szene.fragenAuf === 'es' ? '🎧 Comprensión' : t('ls4.zumInhalt')}
            </p>
            <div className="verstehen-frage">{uebersetzt(schritt.frage.frage)}</div>
            {/* Nochmal hören, so oft man will. Zuhören ist die Übung,
                nicht Auswendiglernen – und wer beim ersten Mal etwas
                verpasst hat, soll nicht raten müssen. */}
            <NochmalHoeren dialog={schritt.szene.dialog} />
            <QuizOptionen
              runde={index}
              optionen={optionen}
              feedback={feedback}
              richtig={uebersetzt(schritt.frage.loesung)}
              onAntwort={antworten}
            />
          </div>
        )}

        {/* --- Mitgehört: die Abschrift, ganz zum Schluss --- */}
        {schritt.typ === 'abschrift' && (
          <Abschrift key={'s' + index} szene={schritt.szene} onWeiter={weiter} />
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
            <p className="lesson-hint">{t('ls.vertiefungWasBedeutet')}</p>
            <div className="gap-sentence">{schritt.zeile.es}</div>
            <QuizOptionen
              runde={index}
              optionen={optionen}
              feedback={feedback}
              richtig={satz(schritt.zeile, 'es', 'de')}
              onAntwort={antworten}
            />
          </div>
        )}

        {/* --- Übung: Lückentext aus dem Beispielsatz --- */}
        {schritt.typ === 'luecke' && (
          <div className="flashcard" key={'s' + index}>
            <p className="lesson-hint">{t('ls.setzeDasFehlende')}</p>
            <div className="gap-sentence">
              {schritt.luecke.satz.split(LUECKE_MARKE).map((teil, i, alle) => (
                <span key={i}>
                  {teil}
                  {i < alle.length - 1 && <span className="luecke-linie" />}
                </span>
              ))}
            </div>
            <p className="gap-help">{satz(schritt.item)}</p>
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
    const szene = szeneVon(modul)
    const { fertig: modulFertig, gesamt } = modulFortschritt(modul, lessonProgress)
    // Die erste noch nicht geschaffte Lektion – und NUR sie ist "dran".
    // Vorher galt jede offene als aktuell; mit ALLES_OFFEN waren das
    // alle, weshalb mehrere "Los geht's!" gleichzeitig standen.
    const naechsteId = liste.find((l) => !lessonProgress[l.id]?.fertig)?.id ?? null
    return (
      <div className="lessons">
        <button className="btn-plain back-link" onClick={() => setModul(null)}>
          ← {t('lek.alleModule')}
        </button>
        <div className="modul-kopf">
          <span className="modul-kopf-ring" aria-hidden="true">
            <ModulBild modul={modul} />
          </span>
          <div className="modul-kopf-text">
            {modulGesperrt(modul) && (
              <span className="modul-premium-chip">{KRONE} {t('lek.premium')}</span>
            )}
            <h1>{uebersetzt(modul.titel)}</h1>
            <p>{uebersetzt(modul.beschreibung)}</p>
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
            {t('lek.lektionenZahl', { fertig: modulFertig, gesamt })}
          </span>
          <span className={'modul-stand-chip' + (modulFertig === gesamt ? ' chip-fertig' : '')}>
            {modulFertig === gesamt ? t('ls4.allesGeschafft') : t('lek.geschafft', { zahl: modulFertig })}
          </span>
        </div>

        {liste.some((l) => gesperrt(l)) && <GratisHinweis art="lektionen" />}

        <div className="ansicht-schalter" role="tablist">
          <button
            role="tab"
            aria-selected={ansicht === 'karte'}
            className={ansicht === 'karte' ? 'aktiv' : ''}
            onClick={() => setAnsicht('karte')}
          >
            <IconLandkarte groesse={18} />
            {t('lek.karte')}
          </button>
          <button
            role="tab"
            aria-selected={ansicht === 'liste'}
            className={ansicht === 'liste' ? 'aktiv' : ''}
            onClick={() => setAnsicht('liste')}
          >
            <IconListe groesse={18} />
            {t('lek.liste')}
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
        <ol className="kursplan kursplan-toon">
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
                    {geschafft ? '✓' : !offen ? <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7.5 11V8.5a4.5 4.5 0 0 1 9 0V11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /><rect x="6" y="11" width="12" height="9" rx="2.5" fill="currentColor" /></svg> : String(l.kursNr ?? '').padStart(2, '0')}
                  </span>
                  <span className="plan-text">
                    <span className="plan-titel">{uebersetzt(l.titel)}</span>
                    <span className="plan-lernst">
                      {uebersetzt(l.grammatik?.[0] ?? l.beschreibung)} · {t('ls.woerterZahl', { zahl: l.items.length })}
                    </span>
                  </span>
                  {gesperrt(l) && !geschafft ? (
                    <span className="lek-premium">{t('lek.premium')}</span>
                  ) : geschafft ? (
                    <span className="plan-pille">{t('rr.geschafft')}</span>
                  ) : dran ? (
                    <span className="plan-knopf">{t('ls.start')} ▶</span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ol>
        </>
        )}

        </div>

        {/* Mitgehört – die Hoerpause in der Mitte des Moduls.
            Sie steht ueber der Pruefstation, weil sie frueher
            aufgeht: nach der Haelfte der Lektionen, nicht am Ende. */}
        {szene && (
          <Szenenkarte
            szene={szene}
            offen={szeneOffen(szene, lessonProgress)}
            geschafft={szeneGeschafft(szene, lessonProgress)}
            fehlend={nochBisSzene(szene, lessonProgress)}
            onStart={() => startenSzene(szene)}
          />
        )}

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
        {t('lek.titel1')} <span className="accent accent-strich">{t('ls.sprachReise')}</span>
      </h1>
      <p className="intro">
{t('ls.lerneSchrittFuer')}
      </p>

      <GratisHinweis art="lektionen" />

      {laufendesModul && (
        <WeiterlernenKarte
          modul={laufendesModul}
          nummer={MODULE.indexOf(laufendesModul) + 1}
          fortschritt={modulFortschritt(laufendesModul, lessonProgress)}
          onOeffnen={() => setModul(laufendesModul)}
        />
      )}

      <h2 className="reise-abschnitt">
        <span aria-hidden="true">📖</span> {t('lek.alleModule')}
      </h2>

      <div className="modul-liste">
        {MODULE.map((m, i) => {
          if (m === laufendesModul) return null
          const premiumModul = modulGesperrt(m)
          // Vor dem ersten Premium-Modul eine Trennlinie: ab hier Premium
          const ersterPremium = premiumModul && MODULE.findIndex((x) => x !== laufendesModul && modulGesperrt(x)) === i
          const offen = modulOffen(i, lessonProgress)
          const { fertig: f, gesamt } = modulFortschritt(m, lessonProgress)
          const komplett = gesamt > 0 && f === gesamt
          const bald = kommtBald(m)
          return (
            <Fragment key={m.id}>
            {ersterPremium && (
              <div className="modul-premium-trenner">
                {KRONE} <span>{t('lek.premiumAb')}</span>
              </div>
            )}
            <button
              className={
                'modul-kachel' +
                (komplett ? ' modul-fertig' : '') +
                (!offen ? ' modul-zu' : '') +
                (premiumModul ? ' modul-premium' : '')
              }
              disabled={!offen}
              onClick={() => setModul(m)}
            >
              <span className="modul-ring" aria-hidden="true">
                {bald ? '🔜' : offen ? <ModulBild modul={m} /> : '🔒'}
              </span>

              <span className="modul-text">
                <span className="modul-titel">
                  {t('ls.modulNr', { nr: i + 1 })}: {uebersetzt(m.titel)}
                </span>
                {premiumModul && <span className="modul-premium-chip">{KRONE} {t('lek.premium')}</span>}
                <span className="modul-sub">{bald ? t('ls.kommtBald') : uebersetzt(m.beschreibung)}</span>
                {!bald && (
                  <span className="modul-bar">
                    <span className="xp-bar goal-bar">
                      <span
                        className="xp-bar-fill"
                        style={{ width: (f / gesamt) * 100 + '%', display: 'block' }}
                      />
                    </span>
                    <span className="modul-count">
                      {t('lek.lektionenZahl', { fertig: f, gesamt })}
                    </span>
                  </span>
                )}
              </span>

              {!bald && (
                <span className={'modul-zahl' + (komplett ? ' modul-zahl-fertig' : '')}>
                  <b>{f}</b>
                  <i>/{gesamt}</i>
                  <em>{t('ls.lektionen')}</em>
                </span>
              )}
            </button>
            </Fragment>
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
  const t = useTexte()
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
      <p className="lesson-hint">{t('ls.dialogTippeAuf')}</p>
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
                  <span className="chat-de">{satz(zeile, 'es', 'de')}</span>
                )}
              </button>
              <button
                className="chat-ton"
                title={t('ls.dieseZeileAnhoeren')}
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
            {laeuft ? t('ls9.stopp') : t('ls9.gespraechAnhoeren')}
          </button>
          <button className="btn-plain" onClick={() => setAlleDe(!alleDe)}>
            {alleDe ? t('ls9.uebersetzungAusblenden') : t('ls9.uebersetzungZeigen')}
          </button>
          <button onClick={onWeiter}>{t('ls.weiter')}</button>
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
  const t = useTexte()
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
      <p className="lesson-hint">{t('ls.verbindeDiePaare')}</p>
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
          <button onClick={onWeiter}>{t('ls.weiter')}</button>
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
  const t = useTexte()
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
      <p className="lesson-hint">{t('ls.baueDenSatz')}</p>
      <p className="satzbau-deutsch">{satzbau.uebersetzung}</p>

      {/* Der entstehende Satz */}
      <div className={'satzbau-ablage' + (geprueft === true ? ' ablage-richtig' : geprueft === false ? ' ablage-falsch' : '')}>
        {gewaehlt.length === 0 && <span className="ablage-leer">{t('ls.tippeDieWoerter')}</span>}
        {gewaehlt.map((i) => (
          <button key={i} className="satz-baustein baustein-gesetzt" onClick={() => tippe(i)}>
            {satzbau.woerter[i]}
          </button>
        ))}
      </div>
      {geprueft === false && (
        <p className="satzbau-loesung">{t('ls.richtigWaere')} <b>{satzbau.loesung}</b></p>
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
          {t('ls9.pruefen')}
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
  const t = useTexte()
  if (!offen) {
    return (
      <div className="station station-zu">
        <span className="station-emoji" aria-hidden="true">🔒</span>
        <div className="station-text">
          <span className="station-marke">{t('ls.pruefstation')}</span>
          <h3>{uebersetzt(station.titel).replace(/^(Prüfstation|Checkpoint): /, '')}</h3>
          <p>
{t('ls4.nochLektionenPruefung', { zahl: fehlend, einheit: fehlend === 1 ? t('ms.lektion') : t('ms.lektionen') })}
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
        <span className="station-marke">{geschafft ? t('ls4.bestanden') : t('ls.pruefstation')}</span>
        <h3>{uebersetzt(station.titel).replace(/^(Prüfstation|Checkpoint): /, '')}</h3>
        <p>{t('ls2.rueckblickUndRund')}</p>
      </div>
      <span className="station-knopf">{geschafft ? t('ls4.nochmal') : t('ls4.start')}</span>
    </button>
  )
}

/**
 * Mitgehört – die Hoerpause in der Mitte des Moduls.
 *
 * Bewusst dieselbe Bauform wie die Pruefstation, nur in anderer
 * Farbe: Beides sind Haltepunkte auf der Route, keine Lektionen.
 * Eine dritte Kartenform waere eine dritte Sache zum Lernen.
 */
function Szenenkarte({ szene, offen, geschafft, fehlend, onStart }) {
  const t = useTexte()
  const name = uebersetzt(szene.titel).replace(/^(Mitgehört|Overheard): /, '')

  if (!offen) {
    return (
      <div className="station szene-karte station-zu">
        <span className="station-emoji" aria-hidden="true">🔒</span>
        <div className="station-text">
          <span className="station-marke">{t('ls.mitgehoert')}</span>
          <h3>{name}</h3>
          <p>
{t('ls4.nochLektionenHoeren', { zahl: fehlend, einheit: fehlend === 1 ? t('ms.lektion') : t('ms.lektionen') })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <button
      className={'station szene-karte' + (geschafft ? ' station-fertig' : '')}
      onClick={onStart}
    >
      <span className="station-emoji" aria-hidden="true">
        {geschafft ? '✓' : szene.emoji}
      </span>
      <div className="station-text">
        <span className="station-marke">{geschafft ? t('ls4.gehoert') : t('ls.mitgehoert')}</span>
        <h3>{name}</h3>
        <p>
{t('ls4.szeneHinweis', { zeilen: szene.dialog.length, fragen: szene.fragen.length })}
        </p>
      </div>
      <span className="station-knopf">{geschafft ? t('ls4.nochmal') : t('hk.anhoeren')}</span>
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
  const t = useTexte()
  const tipp = karten[nummer]
  const letzte = nummer === karten.length - 1

  return (
    <div className="flashcard info-card">
      <span className="info-icon">{tipp.emoji}</span>
      <p className="lesson-hint">{istStation ? t('ls5.rueckblick') : t('ls.gutZuWissen')}</p>

      <div className="info-einzeln">
        <h3 className="info-title">{uebersetzt(tipp.titel)}</h3>
        <p className="info-text">{mitChips(uebersetzt(tipp.text))}</p>
      </div>

      {karten.length > 1 && (
        <div className="info-punkte" aria-label={t('ls5.karteVon', { nr: nummer + 1, gesamt: karten.length })}>
          {karten.map((_, i) => (
            <i key={i} className={i === nummer ? 'punkt-aktiv' : ''} />
          ))}
        </div>
      )}

      <button onClick={onWeiter}>{letzte ? t('ls5.verstanden') : t('app.weiter')}</button>
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
  const t = useTexte()
  const { fertig, gesamt } = fortschritt
  return (
    <button className="weiterlernen" onClick={onOeffnen}>
      <span className="weiterlernen-ring" aria-hidden="true">
        <ModulBild modul={modul} />
      </span>
      <span className="weiterlernen-text">
        <span className="weiterlernen-marke">{t('ls.weiterlernen')}</span>
        <span className="weiterlernen-titel">
          {t('ls.modulNr', { nr: nummer })}: {uebersetzt(modul.titel)}
        </span>
        <span className="weiterlernen-sub">{uebersetzt(modul.beschreibung)}</span>
        <span className="modul-bar">
          <span className="xp-bar goal-bar">
            <span
              className="xp-bar-fill"
              style={{ width: (fertig / gesamt) * 100 + '%', display: 'block' }}
            />
          </span>
          <span className="modul-count">
            {t('lek.lektionenZahl', { fertig: fertig, gesamt })}
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
 * Mitgehört: das Gespräch, einmal ohne Text.
 *
 * Der Ton startet von selbst, sobald die Karte da ist – wie auf der
 * Wortkarte. Sichtbar ist nur, WER gerade spricht, und wie weit das
 * Gespräch ist. Kein Wort steht da.
 *
 * Der Sprechername ist kein Zugestaendnis: In einem echten Gespraech
 * sieht man auch, wer redet. Ohne ihn ist es kein Hoerverstehen,
 * sondern ein Stimmen-Ratespiel.
 *
 * "Weiter" gibt es erst, wenn es einmal durchgelaufen ist. Wer sofort
 * weiterklickt, sitzt danach vor Fragen zu einem Gespraech, das er
 * nicht gehoert hat – und haelt die Uebung fuer kaputt.
 */
function HoerSzene({ szene, onWeiter }) {
  const t = useTexte()
  const [laeuft, setLaeuft] = useState(null)
  const [zeile, setZeile] = useState(-1)
  // Wie weit ist das Gespraech schon gelaufen – ueber alle Anlaeufe
  // hinweg. Nicht der aktuelle Stand: Wer bei Zeile 25 anhaelt und
  // neu startet, faengt zwar vorn an, hat aber schon zugehoert.
  const [weiteste, setWeiteste] = useState(-1)

  // Drei Viertel reichen. Der volle Durchlauf als Bedingung war eine
  // Falle: Wer einmal anhaelt – Tuerklingel, falsche Stelle – kaeme
  // sonst nur weiter, indem er alle dreissig Zeilen am Stueck noch
  // einmal aussitzt.
  const genugGehoert = weiteste >= szene.dialog.length * 0.75 - 1

  function merkeZeile(i) {
    setZeile(i)
    setWeiteste((w) => Math.max(w, i))
  }

  function starten() {
    if (laeuft) {
      laeuft.stop()
      setLaeuft(null)
      return
    }
    const steuerung = dialogAbspielen(szene.dialog, { beiZeile: merkeZeile })
    setLaeuft(steuerung)
    steuerung.fertig.then(() => {
      setLaeuft(null)
      setWeiteste(szene.dialog.length)
    })
  }

  // Von selbst losspielen – aber nur beim ersten Mal, und nur wenn
  // der Nutzer das will. Der Schalter in den Einstellungen ist fuer
  // "unterwegs oder im Buero" gedacht; dort ist ein anderthalb
  // Minuten langes Gespraech noch unangenehmer als ein einzelnes
  // Wort. Wer ihn aus hat, tippt hier auf "Anhören".
  useEffect(() => {
    if (!tonVonSelbst()) return
    const timer = setTimeout(starten, 600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Beim Verlassen nicht weiterreden
  useEffect(() => () => laeuft?.stop(), [laeuft])

  const spricht = zeile >= 0 ? szene.dialog[zeile]?.sprecher : null
  const anteil = zeile >= 0 ? ((zeile + 1) / szene.dialog.length) * 100 : 0

  return (
    <div className="flashcard hoerszene">
      <p className="lesson-hint">{t('ls.hoerZuDer')}</p>
      <p className="hoerszene-ort">{szene.ort}</p>

      <div className="hoerszene-buehne">
        <div className={'hoerszene-welle' + (laeuft ? ' welle-an' : '')} aria-hidden="true">
          <span />
          <span />
        </div>
        <div className="hoerszene-sprecher">
          {spricht ? <><b>{spricht}</b> spricht</> : genugGehoert ? t('ls9.gespraechZuEnde') : t('lsm.gleichGehtEs')}
        </div>
      </div>

      <div className="hoerszene-balken">
        <div className="hoerszene-balken-voll" style={{ width: anteil + '%' }} />
      </div>

      <div className="hoerszene-knoepfe">
        <button className="hoeren-knopf" onClick={starten}>
          <IconLautsprecher groesse={22} />
          {laeuft ? t('ls9.anhalten') : weiteste >= 0 ? t('ls9.nochEinmal') : t('ls9.anhoeren')}
        </button>
        <button onClick={onWeiter} disabled={!genugGehoert}>
          {genugGehoert ? t('ls9.zuDenFragen') : t('ls9.erstZuhoeren')}
        </button>
      </div>
    </div>
  )
}

/**
 * Der Knopf zum Nochmalhoeren waehrend der Fragen.
 *
 * Bewusst ohne Begrenzung. Ein Zaehler ("noch 2 Mal") macht aus einer
 * Uebung eine Pruefung, und wer sich beim Hoeren unsicher ist, lernt
 * unter Druck nichts dazu.
 */
function NochmalHoeren({ dialog }) {
  const t = useTexte()
  const [laeuft, setLaeuft] = useState(null)

  useEffect(() => () => laeuft?.stop(), [laeuft])

  function schalten() {
    if (laeuft) {
      laeuft.stop()
      setLaeuft(null)
      return
    }
    const steuerung = dialogAbspielen(dialog)
    setLaeuft(steuerung)
    steuerung.fertig.then(() => setLaeuft(null))
  }

  return (
    <button className="nochmal-hoeren" onClick={schalten}>
      <IconLautsprecher groesse={16} />
      {laeuft ? t('ls9.anhalten') : t('lsm.nochEinmalHoeren')}
    </button>
  )
}

/**
 * Die Abschrift – erst ganz zum Schluss.
 *
 * Jetzt darf alles dastehen: Spanisch, Deutsch, jede Zeile einzeln
 * nachhoerbar. Wer eine Stelle nicht verstanden hat, findet hier,
 * woran es lag – und das ist der Moment, in dem man am meisten
 * mitnimmt.
 */
function Abschrift({ szene, onWeiter }) {
  const t = useTexte()
  const [alleDe, setAlleDe] = useState(false)

  return (
    <div className="flashcard abschrift">
      <p className="lesson-hint">{t('ls.dieAbschriftJetzt')}</p>
      <button className="abschrift-schalter" onClick={() => setAlleDe((a) => !a)}>
        {alleDe ? t('ls9.uebersetzungAusblenden') : t('ls9.uebersetzungEinblenden')}
      </button>

      <ol className="abschrift-liste">
        {szene.dialog.map((z, i) => (
          <li key={i}>
            <span className="abschrift-name">{z.sprecher}</span>
            <div className="abschrift-text">
              <p className="abschrift-es">
                {z.es}
                <HoerKnopf
                  text={z.es}
                  stimme={stimmeImDialog(szene.dialog, z.sprecher)}
                  titel={t('ls9.zeileAnhoeren')}
                  klein
                />
              </p>
              {alleDe && <p className="abschrift-de">{satz(z, 'es', 'de')}</p>}
            </div>
          </li>
        ))}
      </ol>

      <button onClick={onWeiter}>{t('ls.fertig')}</button>
    </div>
  )
}


/**
 * Die Prozentzahl im Abschluss-Ring zaehlt von 0 hoch – im selben
 * Tempo, in dem sich der Ring fuellt. Eine Zahl, die sich bewegt,
 * fuehlt sich verdient an; eine, die einfach dasteht, nicht.
 */
function ZaehlZahl({ bis }) {
  const [wert, setWert] = useState(0)
  useEffect(() => {
    if (bis <= 0) return
    const dauer = 900
    const start = performance.now()
    let laeuft = true
    const tick = (t) => {
      if (!laeuft) return
      const anteil = Math.min(1, (t - start) / dauer)
      // Gleiche Kurve wie der Ring (ease-out), damit beide zusammen ankommen
      setWert(Math.round(bis * (1 - Math.pow(1 - anteil, 2))))
      if (anteil < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    return () => { laeuft = false }
  }, [bis])
  return <span className="quote-zahl">{wert}<i>%</i></span>
}
