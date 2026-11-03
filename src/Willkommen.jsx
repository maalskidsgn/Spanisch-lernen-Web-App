import { useEffect, useRef } from 'react'
import { istApp } from './api.js'
import { APP_NAME } from './App.jsx'
import Logo from './Logo.jsx'
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
      <header className="wk-hero">
        <span className="wk-wolke wk-wolke-1" />
        <span className="wk-wolke wk-wolke-2" />

        <div className="wk-inhalt">
          <div className="wk-marke">
            <Logo klasse="wk-badge" />
            <span className="wk-name">{APP_NAME}</span>
          </div>

          <h1 className="wk-titel">
            {t('wk.titel1')}<br />
            {t('wk.titel2')} <span className="accent">{t('wk.titelAkzent')}</span>
          </h1>

          <p className="wk-text">
{t('wk.text')}
          </p>

          <div className="wk-punkte">
            <span className="wk-punkt">{t('wk.punkt1')}</span>
            <span className="wk-punkt">{t('wk.punkt2')}</span>
            <span className="wk-punkt">{t('wk.punkt3')}</span>
            <span className="wk-punkt">{t('wk.punkt4')}</span>
          </div>

          <div className="wk-knoepfe">
            <button className="btn wk-start" onClick={onStarten}>
              {t('wk.starten')}
            </button>
            <button className="btn-outline wk-anmelden" onClick={onAnmelden}>
              {t('wk.anmelden')}
            </button>
          </div>

          <p className="wk-fuss">
            {t('wk.fuss')}
          </p>
        </div>

        {/* In der App gibt es nichts zum Entdecken - da endet die
            Seite hier. */}
        {!istApp && <span className="wk-scroll-hinweis">{t('wk.mehr')}</span>}
      </header>

      {/* Der Rest ist Werbung fuer Leute, die Habloo noch nicht
          kennen - sinnvoll auf habloo.de, wo man zufaellig landet.
          Wer die App geladen hat, ist schon ueberzeugt und will sich
          anmelden, nicht durch eine Verkaufsseite scrollen. */}
      {!istApp && (
      <>

      {/* ================= SO GEHT'S ================= */}
      <section className="wk-sektion">
        <div className="wk-breite">
          <div className="wk-kopf zeigt-sich">
            <span className="wk-label">{t('wk.schritteLabel')}</span>
            <h2>{t('wk.schritteTitel')}</h2>
            <p>
{t('wk.schritteText')}
            </p>
          </div>

          <div className="wk-schritte">
            {[
              {
                nr: '1',
                titel: t('wk.schritt1Titel'),
                text: t('wk.schritt1Text'),
              },
              {
                nr: '2',
                titel: t('wk.schritt2Titel'),
                text: t('wk.schritt2Text'),
              },
              {
                nr: '3',
                titel: t('wk.schritt3Titel'),
                text: t('wk.schritt3Text'),
              },
            ].map((s, i) => (
              <div key={s.nr} className={`wk-schritt zeigt-sich v${i}`}>
                <span className="wk-schritt-nr">{s.nr}</span>
                <h3>{s.titel}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FUNKTIONEN ================= */}
      <section className="wk-sektion wk-sektion-warm">
        <span className="wk-wolke wk-wolke-3" />
        <div className="wk-breite">
          <div className="wk-kopf zeigt-sich">
            <span className="wk-label">{t('wk.allesLabel')}</span>
            <h2>{t('wk.allesTitel')}</h2>
            <p>
{t('wk.allesText', { app: APP_NAME })}
            </p>
          </div>

          <div className="wk-bento">
            <div className="wk-kachel wk-kachel-breit zeigt-sich">
              <span className="wk-kachel-icon">🎬</span>
              <h3>{t('wk.videoTitel')}</h3>
              <p>
{t('wk.videoText')}
              </p>
              <div className="wk-demo">
                <span className="wk-demo-zeile">{t('wkk.holaQuTal')}</span>
                <span className="wk-demo-zeile wk-demo-aktiv">
                  Hoy vamos a <b>cocinar</b> algo rico.
                </span>
                <span className="wk-demo-zeile">{t('wkk.teApeteceProbarlo')}</span>
              </div>
            </div>

            <div className="wk-kachel zeigt-sich v1">
              <span className="wk-kachel-icon">🎓</span>
              <h3>{t('wk.lektionenTitel')}</h3>
              <p>
{t('wk.lektionenText')}
              </p>
            </div>

            <div className="wk-kachel zeigt-sich">
              <span className="wk-kachel-icon">🃏</span>
              <h3>{t('wk.trainerTitel')}</h3>
              <p>
{t('wk.trainerText')}
              </p>
              <div className="wk-stufen">
                {[t('wk.stufeNeu'), t('wk.stufe1Tag'), t('wk.stufe3Tage'), t('wk.stufe1Woche'), t('wk.stufe1Monat')].map((s, i) => (
                  <span key={s} className={'wk-stufe' + (i === 0 ? ' wk-stufe-an' : '')}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="wk-kachel wk-kachel-dunkel wk-kachel-breit zeigt-sich v1">
              <span className="wk-kachel-icon">📖</span>
              <h3>{t('wk.ebooksTitel')}</h3>
              <p>
{t('wk.ebooksText')}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= DRANBLEIBEN ================= */}
      <section className="wk-sektion">
        <div className="wk-breite">
          <div className="wk-band zeigt-sich">
            <div className="wk-band-text">
              <span className="wk-label wk-label-hell">{t('wk.dranLabel')}</span>
              <h2>{t('wk.dranTitel')}</h2>
              <p>
{t('wk.dranText')}
              </p>
            </div>
            <div className="wk-zahlen">
              {[
                { wert: '10', text: t('wk.zahl1') },
                { wert: '9', text: t('wk.zahl2') },
                { wert: '6', text: t('wk.zahl3') },
                { wert: '3', text: t('wk.zahl4') },
              ].map((z) => (
                <div key={z.text} className="wk-zahl">
                  <b>{z.wert}</b>
                  <span>{z.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
                50 €<small>{t('wk.proJahr')}</small>
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
                5,99 €<small>{t('wk.proMonat')}</small>
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

      {/* ================= ABSCHLUSS ================= */}
      <section className="wk-sektion wk-sektion-schluss">
        <div className="wk-breite">
          <div className="wk-abschluss zeigt-sich">
            <span className="wk-wolke wk-wolke-5" />
            <h2>{t('wkk.empezamos')}</h2>
            <p>
{t('wk.schlussText', { app: APP_NAME })}
            </p>
            <button className="btn wk-start" onClick={onStarten}>
              {t('wk.schlussKnopf')}
            </button>
          </div>
        </div>
      </section>

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
