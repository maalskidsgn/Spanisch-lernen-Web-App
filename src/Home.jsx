import { levelFromXp, levelName, xpHeute } from './gamification.js'
import { MODULE, LEKTIONEN, lektionenVon, baueSchritte } from './lektionen.js'
import { letzteWoche } from './aktivitaet.js'
import {
  IconLektion, IconKarten, IconMediathek, IconMehr,
  IconSerie, IconLevel, IconPfeil,
} from './icons.jsx'

// Die Startseite – im selben Sektionen-Stil wie der Vokabeltrainer:
// große Zahl, klare Ansage, ein Knopf. Kein Aufgabenzettel.
export default function Home({ progress, settings, counts, nextLesson, lessonProgress = {}, onNavigate }) {
  const level = levelFromXp(progress.xp)
  const heute = xpHeute(progress)
  const zielProzent = Math.min(100, Math.round((heute / settings.tagesziel) * 100))

  // Alles, was die Heute-Karte zeigt, aus der Lektion selbst ableiten –
  // damit die Karte nicht luegt, wenn sich die Lektion aendert.
  const heuteKarte = nextLesson ? beschreibeLektion(nextLesson) : null
  const modul = nextLesson
    ? MODULE.find((m) => m.lektionen.includes(nextLesson.id))
    : null
  const modulListe = modul ? lektionenVon(modul) : []

  const woche = letzteWoche()
  const wochenSumme = woche.reduce((s, t) => s + t.anzahl, 0)
  const maxTag = Math.max(1, ...woche.map((t) => t.anzahl))

  return (
    <div className="trainer home">
      <h1 className="trainer-titel">
        ¡<span className="accent">Hola</span>!
      </h1>
      <div className="hero-row">
        <span className="hero-chip"><IconSerie groesse={15} /> {progress.streak} Tage</span>
        <span className="hero-chip"><IconLevel groesse={15} /> Level {level} · {levelName(level)}</span>
      </div>

      {/* ============ 1. ZWEI KLARE WEGE ============ */}
      {/* Kein Plan, keine Liste: zwei grosse Knoepfe. */}
      {/* ============ 1. HEUTE ============ */}
      {/* Eine Karte statt einer Karte voller Punkte: Der Startbildschirm
          hat genau eine Aufgabe – in die naechste Lektion bringen. Was
          gleich passiert, steht drauf. */}
      {heuteKarte ? (
        <button className="heute" onClick={() => onNavigate('lektionen')}>
          <span className="heute-kopf">
            <span className="heute-marke">
              Lektion {nextLesson.kursNr} · {nextLesson.niveau}
            </span>
            <span className="heute-dauer">ca. {heuteKarte.minuten} Min</span>
          </span>
          <span className="heute-titel">{nextLesson.titel}</span>
          <span className="heute-lernst">{heuteKarte.lernst}</span>

          <span className="heute-zeilen">
            {heuteKarte.zeilen.map((z) => (
              <span className="heute-zeile" key={z}>
                <i className="heute-punkt" aria-hidden="true" />
                {z}
              </span>
            ))}
          </span>

          <span className="heute-los">Los geht’s</span>
        </button>
      ) : (
        <button className="heute heute-fertig" onClick={() => onNavigate('lektionen')}>
          <span className="heute-titel">Alle Lektionen geschafft</span>
          <span className="heute-lernst">
            Neue kommen laufend dazu – bis dahin halten dich die Wörter fit.
          </span>
        </button>
      )}

      {/* Der Modulfortschritt als schmaler Streifen: Uebersicht ohne
          eigene Bildschirmflaeche */}
      {modul && (
        <button className="streifen" onClick={() => onNavigate('lektionen')}>
          <span className="streifen-titel">{modul.titel}</span>
          <span className="streifen-punkte">
            {modulListe.map((l) => (
              <i
                key={l.id}
                className={
                  lessonProgress[l.id]?.fertig
                    ? 'pkt pkt-fertig'
                    : l.id === nextLesson?.id
                      ? 'pkt pkt-dran'
                      : 'pkt'
                }
              />
            ))}
          </span>
          <span className="streifen-alle">
            Alle {modulListe.length} Lektionen ansehen <IconPfeil groesse={13} />
          </span>
        </button>
      )}

      <div className="start-aktionen start-aktionen-schmal">
        <button className="start-aktion start-aktion-zweit" onClick={() => onNavigate('trainer')}>
          <span className="start-aktion-icon" aria-hidden="true"><IconKarten groesse={26} /></span>
          <span className="start-aktion-titel">Vokabeln wiederholen</span>
          <span className="start-aktion-sub">
            {counts.faellig > 0 ? `${counts.faellig} Wörter fällig` : 'Nichts fällig – stark!'}
          </span>
        </button>
      </div>

      {/* Tagesziel als schmale Zeile darunter */}
      <div className="ziel-zeile start-ziel">
        <div className="lern-balken">
          <div className="lern-balken-voll" style={{ width: zielProzent + '%' }} />
        </div>
        <span className="ziel-text">
          {zielProzent >= 100
            ? `${heute} Tages-XP · Ziel erreicht`
            : `${heute} von ${settings.tagesziel} Tages-XP`}
        </span>
      </div>

      {/* ============ 2. UNTERRICHT MIT TUTORIN ============ */}
      <section className="tutor-karte">
        <div className="tutor-bild">
          {/* Bis ein Foto da ist: die Anfangsbuchstaben als Platzhalter */}
          <span className="tutor-initialen" aria-hidden="true">Y</span>
        </div>
        <h2 className="tutor-titel">
          Lerne in der <span className="accent">Praxis!</span>
        </h2>
        <p className="tutor-text">
          Lerne jeden Donnerstag in Gruppenunterricht mit{' '}
          <b className="accent">Yulibeth</b>!
        </p>
        <div className="tutor-knoepfe">
          <button className="tutor-knopf" onClick={() => onNavigate('mehr')}>
            Lets go <IconPfeil groesse={16} />
          </button>
          <button className="tutor-knopf tutor-knopf-zweit" onClick={() => onNavigate('trainer')}>
            KI Hilfe
          </button>
        </div>
      </section>

      {/* ============ 3. DEINE WOCHE ============ */}
      <section className="bereich">
        <div className="bereich-kopf">
          <h2>Deine Woche</h2>
          <p>
            {wochenSumme === 0
              ? 'Jede fertige Einheit zählt hier.'
              : `${wochenSumme} ${wochenSumme === 1 ? 'Einheit' : 'Einheiten'} diese Woche`}
          </p>
        </div>
        <div
          className="woche-diagramm"
          role="img"
          aria-label={`Lerneinheiten der letzten 7 Tage, insgesamt ${wochenSumme}`}
        >
          {woche.map((t, i) => (
            <div key={i} className="woche-tag">
              <span className="woche-wert">{t.anzahl > 0 ? t.anzahl : ''}</span>
              <div
                className={'woche-balken' + (t.istHeute ? ' balken-heute' : '')}
                style={{ height: Math.max(6, (t.anzahl / maxTag) * 100) + '%' }}
              />
              <span className={'woche-label' + (t.istHeute ? ' label-heute' : '')}>
                {t.istHeute ? 'Heute' : t.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 4. ENTDECKEN ============ */}
      <section className="bereich">
        <div className="bereich-kopf">
          <h2>Entdecken</h2>
        </div>
        <div className="start-aktionen">
          <button className="start-aktion start-aktion-zweit" onClick={() => onNavigate('lektionen')}>
            <span className="start-aktion-icon" aria-hidden="true"><IconLektion groesse={24} /></span>
            <span className="start-aktion-titel">Lektionen</span>
            <span className="start-aktion-sub">
              {nextLesson ? `Weiter: ${nextLesson.titel}` : 'Alle geschafft ✓'}
            </span>
          </button>
          <button className="start-aktion start-aktion-zweit" onClick={() => onNavigate('trainer')}>
            <span className="start-aktion-icon" aria-hidden="true"><IconKarten groesse={24} /></span>
            <span className="start-aktion-titel">Trainer</span>
            <span className="start-aktion-sub">
              {counts.faellig > 0 ? `${counts.faellig} Wörter fällig` : `${counts.woerter} Wörter`}
            </span>
          </button>
          <button className="start-aktion start-aktion-zweit" onClick={() => onNavigate('videos')}>
            <span className="start-aktion-icon" aria-hidden="true"><IconMediathek groesse={24} /></span>
            <span className="start-aktion-titel">Mediathek</span>
            <span className="start-aktion-sub">Videos, Songs & Bücher</span>
          </button>
          <button className="start-aktion start-aktion-zweit" onClick={() => onNavigate('mehr')}>
            <span className="start-aktion-icon" aria-hidden="true"><IconMehr groesse={24} /></span>
            <span className="start-aktion-titel">Mehr</span>
            <span className="start-aktion-sub">Abo, Ziele & Daten</span>
          </button>
        </div>
      </section>
    </div>
  )
}

/**
 * Was steht auf der Heute-Karte?
 *
 * Alles wird aus der Lektion berechnet, nichts gepflegt: So kann die
 * Karte nicht veralten, wenn sich eine Lektion aendert.
 */
function beschreibeLektion(l) {
  const schritte = baueSchritte(l)
  // Grob gemessen: ein Schritt braucht rund 15 Sekunden.
  const minuten = Math.max(3, Math.round((schritte.length * 15) / 60))

  const zeilen = [`${l.items.length} neue Wörter`]

  const sprecher = [...new Set((l.dialog ?? []).map((z) => z.sprecher))]
  if (sprecher.length === 2) zeilen.push(`Dialog mit ${sprecher[0]} und ${sprecher[1]}`)
  else if (sprecher.length > 2) zeilen.push(`Dialog mit ${sprecher.length} Personen`)

  // Die Wiederholung sichtbar machen – sie ist der Grund, warum der
  // Kurs ein Kurs ist und nicht 150 Einzelstuecke.
  const quellen = (l.wiederholt ?? [])
    .map((id) => LEKTIONEN.find((x) => x.id === id)?.titel)
    .filter(Boolean)
  if (quellen.length) zeilen.push(`Wiederholung aus: ${quellen.join(', ')}`)

  return { minuten, lernst: l.grammatik?.[0] ?? l.beschreibung, zeilen }
}
