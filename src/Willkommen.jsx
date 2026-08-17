import { useEffect, useRef } from 'react'
import { APP_NAME } from './App.jsx'

/**
 * Startseite für alle, die noch nicht angemeldet sind.
 *
 * Oben der Hero mit den beiden Wegen ins Konto, darunter erklärt die
 * Seite, was die App kann – Schritte, Funktionen, Fortschritt, Preise.
 */
export default function Willkommen({ onStarten, onAnmelden }) {
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
            <span className="logo-badge wk-badge">¡</span>
            <span className="wk-name">{APP_NAME}</span>
          </div>

          <h1 className="wk-titel">
            Spanisch lernen mit dem,<br />
            was du <span className="accent">sowieso schaust</span>
          </h1>

          <p className="wk-text">
            Echte Videos mit mitlaufenden Untertiteln, ein Vokabeltrainer, der
            sich merkt, wann du wiederholen musst – und Lektionen vom ersten
            „Hola" an.
          </p>

          <div className="wk-punkte">
            <span className="wk-punkt">🎬 Videos mit Karaoke-Text</span>
            <span className="wk-punkt">🃏 Vokabeltrainer</span>
            <span className="wk-punkt">🎓 Geführte Lektionen</span>
            <span className="wk-punkt">🎮 Mini-Spiele</span>
          </div>

          <div className="wk-knoepfe">
            <button className="btn wk-start" onClick={onStarten}>
              Jetzt starten – kostenlos
            </button>
            <button className="btn-outline wk-anmelden" onClick={onAnmelden}>
              Ich habe schon ein Konto
            </button>
          </div>

          <p className="wk-fuss">
            Dein Fortschritt wird gesichert und steht auf allen Geräten bereit.
          </p>
        </div>

        <span className="wk-scroll-hinweis">Mehr entdecken ↓</span>
      </header>

      {/* ================= SO GEHT'S ================= */}
      <section className="wk-sektion">
        <div className="wk-breite">
          <div className="wk-kopf zeigt-sich">
            <span className="wk-label">In 3 Schritten</span>
            <h2>Vom Video zur Vokabel – ganz nebenbei</h2>
            <p>
              Kein Vokabelheft, kein Abtippen. Du schaust, tippst an, und der
              Rest passiert automatisch.
            </p>
          </div>

          <div className="wk-schritte">
            {[
              {
                nr: '1',
                titel: 'Video aussuchen',
                text: 'Wähle aus unserer Bibliothek oder füge einen Link ein – Musik, Podcasts, Kochvideos. Alles, was dich wirklich interessiert.',
              },
              {
                nr: '2',
                titel: 'Mitlesen & antippen',
                text: 'Die Untertitel laufen automatisch mit. Unbekanntes Wort? Einmal tippen – Übersetzung erscheint, Wort ist gespeichert.',
              },
              {
                nr: '3',
                titel: 'Behalten statt vergessen',
                text: 'Dein Trainer fragt jede Vokabel genau dann ab, wenn du sie zu vergessen drohst. Spielerisch verpackt.',
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
            <span className="wk-label">Alles drin</span>
            <h2>Eine App, dein kompletter Sprachkurs</h2>
            <p>
              Vom ersten „Hola" bis zum Podcast ohne Untertitel – {APP_NAME}{' '}
              begleitet dich auf jeder Stufe.
            </p>
          </div>

          <div className="wk-bento">
            <div className="wk-kachel wk-kachel-breit zeigt-sich">
              <span className="wk-kachel-icon">🎬</span>
              <h3>Videos, die mitlesen</h3>
              <p>
                Die Untertitel laufen synchron zum Video, die aktuelle Zeile
                leuchtet auf. Ein Klick übersetzt den ganzen Text – oder nur das
                eine Wort, das dir fehlt.
              </p>
              <div className="wk-demo">
                <span className="wk-demo-zeile">Hola, ¿qué tal?</span>
                <span className="wk-demo-zeile wk-demo-aktiv">
                  Hoy vamos a <b>cocinar</b> algo rico.
                </span>
                <span className="wk-demo-zeile">¿Te apetece probarlo?</span>
              </div>
            </div>

            <div className="wk-kachel zeigt-sich v1">
              <span className="wk-kachel-icon">🎓</span>
              <h3>Geführte Lektionen</h3>
              <p>
                Module vom Begrüßen bis Reisen: neue Wörter mit Ton, kurze
                Erklärungen, animierte Dialoge und Übungen.
              </p>
            </div>

            <div className="wk-kachel zeigt-sich">
              <span className="wk-kachel-icon">🃏</span>
              <h3>Trainer mit Gedächtnis</h3>
              <p>
                Wiederhole im richtigen Moment – von „neu" bis „sitzt für
                immer".
              </p>
              <div className="wk-stufen">
                {['Neu', '1 Tag', '3 Tage', '1 Woche', '1 Monat'].map((s, i) => (
                  <span key={s} className={'wk-stufe' + (i === 0 ? ' wk-stufe-an' : '')}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="wk-kachel wk-kachel-dunkel wk-kachel-breit zeigt-sich v1">
              <span className="wk-kachel-icon">📖</span>
              <h3>Zweisprachige E-Books</h3>
              <p>
                Kurze Sachbuch-Zusammenfassungen auf Spanisch – mit deutscher
                Fassung zum Umschalten. Oder lass dir per KI eins zu deinem
                Wunschthema schreiben.
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
              <span className="wk-label wk-label-hell">🔥 Dranbleiben leicht gemacht</span>
              <h2>Der Trick: Du willst weitermachen</h2>
              <p>
                Punkte für jedes gelernte Wort, Level mit Titeln, ein Tagesziel
                und eine Serie, die wächst. Kleine Erfolge, die aus Vorsätzen
                Gewohnheiten machen.
              </p>
            </div>
            <div className="wk-zahlen">
              {[
                { wert: '10', text: 'XP pro gewusster Vokabel' },
                { wert: '9', text: 'Level bis zur Legende' },
                { wert: '6', text: 'Stufen im Karteikasten' },
                { wert: '3', text: 'Mini-Spiele zum Üben' },
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
      <section className="wk-sektion wk-sektion-warm">
        <span className="wk-wolke wk-wolke-4" />
        <div className="wk-breite">
          <div className="wk-kopf zeigt-sich">
            <span className="wk-label">Fair &amp; flexibel</span>
            <h2>Starte kostenlos. Bleib, wenn's dir gefällt.</h2>
            <p>
              Alle Lernfunktionen sind gratis. Premium schaltet die
              KI-Werkzeuge frei.
            </p>
          </div>

          <div className="wk-tarife">
            <div className="wk-tarif zeigt-sich">
              <span className="wk-tarif-name">Kostenlos</span>
              <span className="wk-tarif-preis">0 €</span>
              <span className="wk-tarif-hinweis">Für immer</span>
              <ul>
                <li>Unbegrenzt Videos lernen</li>
                <li>Alle Lektionen &amp; Mini-Spiele</li>
                <li>Vokabeltrainer mit XP &amp; Level</li>
                <li>3 KI-E-Books pro Monat</li>
              </ul>
              <button className="btn-outline" onClick={onStarten}>
                Loslegen
              </button>
            </div>

            <div className="wk-tarif wk-tarif-beste zeigt-sich v1">
              <span className="wk-tarif-fahne">Beliebteste Wahl · 30 % sparen</span>
              <span className="wk-tarif-name">Premium Jahr</span>
              <span className="wk-tarif-preis">
                50 €<small> / Jahr</small>
              </span>
              <span className="wk-tarif-hinweis">entspricht 4,17 € pro Monat</span>
              <ul>
                <li>Alles aus Kostenlos</li>
                <li>Unbegrenzte KI-Vokabellisten</li>
                <li>Unbegrenzte E-Books</li>
                <li>Sync auf allen Geräten</li>
              </ul>
              <button className="btn" onClick={onStarten}>
                Premium holen
              </button>
            </div>

            <div className="wk-tarif zeigt-sich v2">
              <span className="wk-tarif-name">Premium Monat</span>
              <span className="wk-tarif-preis">
                5,99 €<small> / Monat</small>
              </span>
              <span className="wk-tarif-hinweis">
                Monatlich kündbar · oder 89 € einmalig
              </span>
              <ul>
                <li>Alle Premium-Funktionen</li>
                <li>Jederzeit kündbar</li>
                <li>Lifetime-Option verfügbar</li>
              </ul>
              <button className="btn-outline" onClick={onStarten}>
                Monatlich starten
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABSCHLUSS ================= */}
      <section className="wk-sektion wk-sektion-schluss">
        <div className="wk-breite">
          <div className="wk-abschluss zeigt-sich">
            <span className="wk-wolke wk-wolke-5" />
            <h2>¿Empezamos?</h2>
            <p>
              Such dir ein Video aus, das dich interessiert – den Rest übernimmt{' '}
              {APP_NAME}.
            </p>
            <button className="btn wk-start" onClick={onStarten}>
              Kostenlos loslegen
            </button>
          </div>
        </div>
      </section>

      <footer className="wk-footer">
        <span className="logo-badge wk-footer-badge">¡</span>
        <span>{APP_NAME}</span>
        <span className="wk-footer-klein">
          Mit Herz entwickelt von Klarwerk Digital
        </span>
      </footer>
    </div>
  )
}
