import { levelFromXp, levelName, xpHeute } from './gamification.js'
import { MODULE, modulFortschritt } from './lektionen.js'
import { tagesplan, planStand } from './tagesplan.js'

// Der Start-Bereich: begrüßt dich, zeigt Tagesziel, Streak und deine
// Sprach-Reise und führt mit einem Klick in die einzelnen Bereiche.
export default function Home({ progress, settings, counts, nextLesson, lessonProgress, onNavigate }) {
  const level = levelFromXp(progress.xp)
  const heute = xpHeute(progress)
  const zielErreicht = heute >= settings.tagesziel
  const prozent = Math.min(100, Math.round((heute / settings.tagesziel) * 100))

  // Der Plan für heute – statt einer erschlagenden Gesamtzahl
  const plan = tagesplan({
    faellig: counts.faellig,
    lektion: nextLesson,
    woerter: counts.woerter,
    videoOffen: counts.videos > 0,
  })
  const erledigt = planStand().erledigt

  return (
    <div className="home">
      <h1>
        ¡Hola! <span className="accent">👋</span>
      </h1>
      <p className="intro">Schön, dass du wieder da bist. Weiter geht’s!</p>

      {/* Der Plan für heute: drei Schritte, eine klare Zeitangabe */}
      <div className="home-hero">
        <div className="hero-row">
          <span className="hero-chip">🔥 {progress.streak} Tage</span>
          <span className="hero-chip">
            ⭐ Level {level} · {levelName(level)}
          </span>
        </div>

        <div className="plan-kopf">
          <h2 className="plan-titel">Dein Plan für heute</h2>
          <span className="plan-dauer">ca. {plan.minuten} Minuten</span>
        </div>

        <ol className="plan-liste">
          {plan.schritte.map((s) => {
            const fertig = erledigt.includes(s.art)
            return (
              <li
                key={s.art}
                className={'plan-schritt' + (fertig ? ' plan-fertig' : '')}
              >
                <span className="plan-haken" aria-hidden="true">
                  {fertig ? '✓' : ''}
                </span>
                <span className="plan-text">
                  <span className="plan-name">{s.titel}</span>
                  <span className="plan-hinweis">{s.hinweis}</span>
                </span>
              </li>
            )
          })}
        </ol>

        <button
          className="hero-cta"
          onClick={() => {
            const offen = plan.schritte.find((s) => !erledigt.includes(s.art))
            onNavigate((offen ?? plan.schritte[0]).ziel)
          }}
        >
          {erledigt.length === 0
            ? 'Tageslektion starten'
            : erledigt.length >= plan.schritte.length
              ? 'Noch eine Runde'
              : 'Weitermachen'}
        </button>

        {plan.rest > 0 && (
          <p className="plan-rest">
            Danach warten noch {plan.rest} weitere fällige Vokabeln – die
            laufen dir nicht weg.
          </p>
        )}

        {/* Tagesfortschritt, klar als solcher benannt */}
        <div className="goal-progress">
          <div className="xp-bar goal-bar">
            <div className="xp-bar-fill" style={{ width: prozent + '%' }} />
          </div>
          <span className="goal-text">
            {zielErreicht
              ? `${heute} Tages-XP · Ziel erreicht 🎉`
              : `${heute} von ${settings.tagesziel} Tages-XP`}
          </span>
        </div>
      </div>

      {/* Die Sprach-Reise: Fortschritt pro Modul – Motivation pur! */}
      <h2 className="settings-heading">Deine Sprach-Reise</h2>
      <div className="journey-card" onClick={() => onNavigate('lektionen')}>
        {MODULE.filter((m) => !m.kommtBald).map((m, i) => {
          const { fertig, gesamt } = modulFortschritt(m, lessonProgress)
          return (
            <div key={m.id} className="journey-row">
              <span className="journey-emoji">{m.emoji}</span>
              <span className="journey-name">
                Modul {i + 1}: {m.titel}
              </span>
              <span className="xp-bar journey-bar">
                <span
                  className="xp-bar-fill"
                  style={{ width: (fertig / gesamt) * 100 + '%', display: 'block' }}
                />
              </span>
              <span className="journey-count">
                {fertig === gesamt ? '✓' : `${fertig}/${gesamt}`}
              </span>
            </div>
          )
        })}
      </div>

      {/* Schnellzugriff auf alle Bereiche */}
      <h2 className="settings-heading">Deine Bereiche</h2>
      <div className="home-grid">
        <button className="home-card" onClick={() => onNavigate('lektionen')}>
          <span className="home-emoji">🎓</span>
          <span className="home-title">Lektionen</span>
          <span className="home-sub">
            {nextLesson ? `Als Nächstes: ${nextLesson.titel}` : 'Alle geschafft ✓'}
          </span>
        </button>
        <button className="home-card" onClick={() => onNavigate('trainer')}>
          <span className="home-emoji">🃏</span>
          <span className="home-title">Vokabeltrainer</span>
          <span className="home-sub">
            {counts.faellig > 0
              ? `${counts.faellig} Vokabeln fällig`
              : `${counts.woerter} Wörter gesammelt`}
          </span>
        </button>
        <button className="home-card" onClick={() => onNavigate('videos')}>
          <span className="home-emoji">📺</span>
          <span className="home-title">Videos</span>
          <span className="home-sub">
            {counts.videos > 0
              ? `${counts.videos} gespeichert`
              : 'Mit YouTube lernen'}
          </span>
        </button>
        <button className="home-card" onClick={() => onNavigate('mehr')}>
          <span className="home-emoji">⚙️</span>
          <span className="home-title">Mehr</span>
          <span className="home-sub">Ziel, Abo & Daten</span>
        </button>
      </div>
    </div>
  )
}
