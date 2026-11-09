import { useEffect, useRef } from 'react'
import { istApp } from './api.js'
import { APP_NAME } from './App.jsx'
import Logo from './Logo.jsx'
import StartseiteB from './StartseiteB.jsx'
import StartPostkarten from './StartPostkarten.jsx'
import { useTexte } from './sprache.js'

/**
 * Startseite für alle, die noch nicht angemeldet sind.
 *
 * Oben der Hero mit den beiden Wegen ins Konto, darunter erklärt die
 * Seite, was die App kann – Schritte, Funktionen, Fortschritt, Preise.
 */
export default function Willkommen({ onStarten, onAnmelden, onRecht }) {
  const t = useTexte()
  const seite = useRef(null)

  // Alles mit der Klasse "zeigt-sich" gleitet herein, sobald es
  // in den sichtbaren Bereich scrollt.
  useEffect(() => {
    const elemente = seite.current?.querySelectorAll('.zeigt-sich') ?? []
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          if (e.isIntersecting) {
            e.target.classList.add('sichtbar')
            beobachter.unobserve(e.target)
          }
        }
      },
      { threshold: 0.15 }
    )
    elemente.forEach((el) => beobachter.observe(el))
    return () => beobachter.disconnect()
  }, [])

  return (
    <div className="wk" ref={seite}>
      {/* ================= HERO ================= */}
      {/* Startbildschirm mit Postkarten (09.11., Entwurf C1) */}
      {/* Web: Hero aus Startseite B (09.11.); in der App bleibt der Postkarten-Startbildschirm */}
      {istApp
        ? <StartPostkarten onStarten={onStarten} onAnmelden={onAnmelden} />
        : <StartseiteB teil="hero" onStarten={onStarten} onAnmelden={onAnmelden} />}

      {/* Der Rest ist Werbung fuer Leute, die Habloo noch nicht
          kennen - sinnvoll auf habloo.de, wo man zufaellig landet.
          Wer die App geladen hat, ist schon ueberzeugt und will sich
          anmelden, nicht durch eine Verkaufsseite scrollen. */}
      {!istApp && (
      <>

      {/* Startseite B (09.11.2026): Videobereich + Toon-Bento */}
      <StartseiteB teil="oben" onStarten={onStarten} onAnmelden={onAnmelden} />

      {/* ================= ABSCHLUSS (Startseite B) ================= */}
      <StartseiteB teil="schluss" onStarten={onStarten} onAnmelden={onAnmelden} />

      </>
      )}

      {/* Pflichtangaben – muessen von jeder Seite aus in zwei Klicks
          erreichbar sein, deshalb hier im Fuss der Startseite.
          In der App bleibt nur das Noetige: Markenzeile und ein Link
          auf den Ratgeber gehoeren auf eine Website, nicht in eine
          App, die man gerade geladen hat. */}
      {istApp ? (
        <footer className="wk-footer wk-footer-app">
          <button onClick={() => onRecht('datenschutz')}>{t('wk.datenschutz')}</button>
          <button onClick={() => onRecht('agb')}>{t('wk.agb')}</button>
          <button onClick={() => onRecht('impressum')}>{t('wk.impressum')}</button>
        </footer>
      ) : (
        <StartseiteB teil="fuss" onStarten={onStarten} onAnmelden={onAnmelden} onRecht={onRecht} />
      )}
    </div>
  )
}
