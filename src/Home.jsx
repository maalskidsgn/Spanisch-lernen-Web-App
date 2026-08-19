import { levelFromXp, levelName, xpHeute } from './gamification.js'
import { tagesplan, planStand } from './tagesplan.js'
import { letzteWoche } from './aktivitaet.js'

// Die Startseite – im selben Sektionen-Stil wie der Vokabeltrainer:
// große Zahl, klare Ansage, ein Knopf. Kein Aufgabenzettel.
export default function Home({ progress, settings, counts, nextLesson, onNavigate }) {
  const level = levelFromXp(progress.xp)
  const heute = xpHeute(progress)
  const zielProzent = Math.min(100, Math.round((heute / settings.tagesziel) * 100))

  const plan = tagesplan({
    faellig: counts.faellig,
    lektion: nextLesson,
    woerter: counts.woerter,
    videoOffen: counts.videos > 0,
  })
  const erledigt = planStand().erledigt
  const offen = plan.schritte.filter((s) => !erledigt.includes(s.art))
  const naechster = offen[0] ?? plan.schritte[0]

  const woche = letzteWoche()
  const wochenSumme = woche.reduce((s, t) => s + t.anzahl, 0)
  const maxTag = Math.max(1, ...woche.map((t) => t.anzahl))

  return (
    <div className="trainer home">
      <h1 className="trainer-titel">
        ¡Hola! <span className="accent">👋</span>
      </h1>
      <div className="hero-row">
        <span className="hero-chip">🔥 {progress.streak} Tage</span>
        <span className="hero-chip">⭐ Level {level} · {levelName(level)}</span>
      </div>

      {/* ============ 1. HEUTE LERNEN ============ */}
      {/* Große Zahl + ein Knopf – wie "Heute wiederholen" im Trainer */}
      <section className="bereich bereich-wiederholen">
        <div className="wiederholen-zahl">
          <b>{plan.minuten}</b>
          <span>Minuten heute</span>
        </div>
        <div className="wiederholen-text">
          <h2>Heute lernen</h2>
          {/* Der Plan als drei kleine Stationen, nicht als Zettel */}
          <div className="plan-chips">
            {plan.schritte.map((s) => (
              <span
                key={s.art}
                className={'plan-chip' + (erledigt.includes(s.art) ? ' chip-fertig' : '')}
              >
                {erledigt.includes(s.art) ? '✓ ' : ''}
                {s.titel}
              </span>
            ))}
          </div>
          <div className="ziel-zeile">
            <div className="lern-balken">
              <div className="lern-balken-voll" style={{ width: zielProzent + '%' }} />
            </div>
            <span className="ziel-text">
              {zielProzent >= 100
                ? `${heute} Tages-XP · Ziel erreicht 🎉`
                : `${heute} von ${settings.tagesziel} Tages-XP`}
            </span>
          </div>
        </div>
        <button className="btn wiederholen-los" onClick={() => onNavigate(naechster.ziel)}>
          {erledigt.length === 0
            ? 'Loslegen'
            : erledigt.length >= plan.schritte.length
              ? 'Extra-Runde'
              : 'Weitermachen'}
        </button>
      </section>

      {/* ============ 2. LIVE-UNTERRICHT (Skizze) ============ */}
      <section className="bereich">
        <div className="bereich-kopf">
          <h2>Live-Unterricht</h2>
          <p>
            Einmal pro Woche Spanisch mit einer echten Lehrerin – Fragen
            stellen, sprechen üben, gemeinsam lernen.
          </p>
        </div>
        <div className="unterricht-karte">
          <div className="unterricht-avatar" aria-hidden="true">👩‍🏫</div>
          <div className="unterricht-text">
            <b>Wöchentliche Gruppenstunde</b>
            <span>Donnerstags · 18:00 Uhr · 45 Minuten</span>
            <span className="unterricht-premium">Für Premium-Mitglieder</span>
          </div>
          <button className="btn-outline" disabled title="Startet nach dem Launch">
            Bald buchbar
          </button>
        </div>
      </section>

      {/* ============ 3. DEINE WOCHE ============ */}
      <section className="bereich">
        <div className="bereich-kopf">
          <h2>Deine Woche</h2>
          <p>
            {wochenSumme === 0
              ? 'Jede fertige Lektion, Runde und jedes Spiel zählt hier.'
              : `${wochenSumme} ${wochenSumme === 1 ? 'Einheit' : 'Einheiten'} in den letzten 7 Tagen.`}
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
        <div className="spiel-paar">
          <button className="spiel-karte" onClick={() => onNavigate('lektionen')}>
            <span className="nav-emoji" aria-hidden="true">🎓</span>
            <span className="spiel-name">Lektionen</span>
            <span className="spiel-hinweis">
              {nextLesson ? `Weiter: ${nextLesson.titel}` : 'Alle geschafft ✓'}
            </span>
          </button>
          <button className="spiel-karte" onClick={() => onNavigate('trainer')}>
            <span className="nav-emoji" aria-hidden="true">🃏</span>
            <span className="spiel-name">Trainer</span>
            <span className="spiel-hinweis">
              {counts.faellig > 0 ? `${counts.faellig} Wörter fällig` : `${counts.woerter} Wörter`}
            </span>
          </button>
          <button className="spiel-karte" onClick={() => onNavigate('videos')}>
            <span className="nav-emoji" aria-hidden="true">📺</span>
            <span className="spiel-name">Mediathek</span>
            <span className="spiel-hinweis">Videos, Songs & Bücher</span>
          </button>
          <button className="spiel-karte" onClick={() => onNavigate('mehr')}>
            <span className="nav-emoji" aria-hidden="true">⚙️</span>
            <span className="spiel-name">Mehr</span>
            <span className="spiel-hinweis">Abo, Ziele & Daten</span>
          </button>
        </div>
      </section>
    </div>
  )
}
