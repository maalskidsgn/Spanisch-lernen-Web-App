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
      <StartPostkarten onStarten={onStarten} onAnmelden={onAnmelden} />

      {/* Der Rest ist Werbung fuer Leute, die Habloo noch nicht
          kennen - sinnvoll auf habloo.de, wo man zufaellig landet.
          Wer die App geladen hat, ist schon ueberzeugt und will sich
          anmelden, nicht durch eine Verkaufsseite scrollen. */}
      {!istApp && (
      <>

      {/* Startseite B (09.11.2026): Videobereich + Toon-Bento */}
      <StartseiteB teil="oben" onStarten={onStarten} onAnmelden={onAnmelden} />

      {/* ================= PREISE ================= */}
      {!istApp && (
<section className="wk-sektion wk-sektion-warm">
        <span className="wk-wolke wk-wolke-4" />
        <div className="wk-breite">
          <div className="wk-kopf zeigt-sich">
            <span className="wk-label">{t('wk.preiseLabel')}</span>
            <h2>{t('wk.preiseTitel')}</h2>
            <p>
{t('wk.preiseText')}
            </p>
          </div>

          <div className="wk-tarife">
            <div className="wk-tarif zeigt-sich">
              <span className="wk-tarif-name">{t('wk.tarifFrei')}</span>
              <span className="wk-tarif-preis">0 €</span>
              <span className="wk-tarif-hinweis">{t('wk.tarifFreiHinweis')}</span>
              <ul>
                <li>{t('wk.tarifFrei1')}</li>
                <li>{t('wk.tarifFrei2')}</li>
                <li>{t('wk.tarifFrei3')}</li>
                <li>{t('wk.tarifFrei4')}</li>
              </ul>
              <button className="btn-outline" onClick={onStarten}>
                {t('wk.tarifFreiKnopf')}
              </button>
            </div>

            <div className="wk-tarif wk-tarif-beste zeigt-sich v1">
              <span className="wk-tarif-fahne">{t('wk.tarifFahne')}</span>
              <span className="wk-tarif-name">{t('wk.tarifJahr')}</span>
              <span className="wk-tarif-preis">
                89,99 €<small>{t('wk.proJahr')}</small>
              </span>
              <span className="wk-tarif-hinweis">{t('wk.tarifJahrHinweis')}</span>
              <ul>
                <li>{t('wk.tarifJahr1')}</li>
                <li>{t('wk.tarifJahr2')}</li>
                <li>{t('wk.tarifJahr3')}</li>
                <li>{t('wk.tarifJahr4')}</li>
              </ul>
              <button className="btn" onClick={onStarten}>
                {t('wk.tarifJahrKnopf')}
              </button>
            </div>

            <div className="wk-tarif zeigt-sich v2">
              <span className="wk-tarif-name">{t('wk.tarifMonat')}</span>
              <span className="wk-tarif-preis">
                9,99 €<small>{t('wk.proMonat')}</small>
              </span>
              <span className="wk-tarif-hinweis">
{t('wk.tarifMonatHinweis')}
              </span>
              <ul>
                <li>{t('wk.tarifMonat1')}</li>
                <li>{t('wk.tarifMonat2')}</li>
                <li>{t('wk.tarifMonat3')}</li>
              </ul>
              <button className="btn-outline" onClick={onStarten}>
                {t('wk.tarifMonatKnopf')}
              </button>
            </div>
          </div>
        </div>
      </section>
      )}

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
        <footer className="wk-footer">
          <Logo klasse="wk-footer-badge" />
          <span>{APP_NAME}</span>
          <span className="wk-footer-klein">
{t('wk.footerKlein')}
          </span>
          <span className="wk-footer-recht">
            <a href="/blog/">{t('wk.ratgeber')}</a>
            <button onClick={() => onRecht('impressum')}>{t('wk.impressum')}</button>
            <button onClick={() => onRecht('datenschutz')}>{t('wk.datenschutz')}</button>
            <button onClick={() => onRecht('agb')}>{t('wk.agb')}</button>
          </span>
        </footer>
      )}
    </div>
  )
}
