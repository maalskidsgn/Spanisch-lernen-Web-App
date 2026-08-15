import { levelFromXp, levelName, xpHeute } from './gamification.js'
import { MODULE, modulFortschritt } from './lektionen.js'

// Der Start-Bereich: begrüßt dich, zeigt Tagesziel, Streak und deine
// Sprach-Reise und führt mit einem Klick in die einzelnen Bereiche.
export default function Home({ progress, settings, counts, nextLesson, lessonProgress, onNavigate }) {
  const level = levelFromXp(progress.xp)
  const heute = xpHeute(progress)
  const prozent = Math.min(100, Math.round((heute / settings.tagesziel) * 100))

  // Was ist gerade der sinnvollste nächste Schritt?
  const cta =
    counts.faellig > 0
      ? { text: `🃏 ${counts.faellig} fällige Vokabeln üben`, ziel: 'trainer' }
      : nextLesson
        ? { text: `🎓 Weiter mit „${nextLesson.titel}“`, ziel: 'lektionen' }
        : { text: '📺 Neue Videos entdecken', ziel: 'videos' }

  return (
    <div className="home">
      <h1>
        ¡Hola! <span className="accent">👋</span>
      </h1>
      <p className="intro">Schön, dass du wieder da bist. Weiter geht’s!</p>

      {/* Tages-Übersicht mit dem wichtigsten nächsten Schritt */}
      <div className="home-hero">
        <div className="hero-row">
          <span className="hero-chip">🔥 {progress.streak} Tage</span>
          <span className="hero-chip">
            ⭐ Level {level} · {levelName(level)}
          </span>
        </div>
        <div className="goal-progress">
          <div className="xp-bar goal-bar">
            <div className="xp-bar-fill" style={{ width: prozent + '%' }} />
          </div>
          <span className="goal-text">
            {heute}/{settings.tagesziel} XP heute
            {prozent >= 100 && ' – Tagesziel geschafft! 🎉'}
          </span>
        </div>
        <button className="hero-cta" onClick={() => onNavigate(cta.ziel)}>
          {cta.text}
        </button>
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
