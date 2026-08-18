import { useRef } from 'react'
import { levelFromXp, levelName, xpHeute } from './gamification.js'
import { supabaseBereit } from './supabase.js'
import { abmelden, anzeigename } from './auth.js'

// Der Einstellungsbereich ("Mehr"): Profil-Übersicht, Abo, Lernziele,
// Benachrichtigungen, Daten-Sicherung und App-Infos.
export default function Settings({
  progress,
  settings,
  setSettings,
  counts,
  nutzer,
  syncStatus,
  onLoginOeffnen,
}) {
  // Abmelden – die lokalen Daten bleiben erhalten
  async function abmeldenKlick() {
    if (!confirm('Wirklich abmelden? Deine Daten bleiben gesichert.')) return
    try {
      await abmelden()
    } catch (f) {
      alert('Abmelden hat nicht geklappt: ' + f.message)
    }
  }

  const fileInputRef = useRef(null)

  const level = levelFromXp(progress.xp)
  const heutigeXp = xpHeute(progress)
  const zielProzent = Math.min(100, Math.round((heutigeXp / settings.tagesziel) * 100))

  // Alle Lerndaten als Datei herunterladen (Backup)
  function exportData() {
    const backup = {
      app: 'spanisch-lernen',
      exportiertAm: new Date().toISOString(),
      vokabeln: JSON.parse(localStorage.getItem('vokabeln') || '{}'),
      videos: JSON.parse(localStorage.getItem('videos') || '[]'),
      fortschritt: JSON.parse(localStorage.getItem('fortschritt') || '{}'),
      einstellungen: JSON.parse(localStorage.getItem('einstellungen') || '{}'),
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'spanisch-lernen-backup.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  // Backup-Datei wieder einlesen
  function importData(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (data.app !== 'spanisch-lernen') throw new Error('Falsche Datei')
        if (data.vokabeln) localStorage.setItem('vokabeln', JSON.stringify(data.vokabeln))
        if (data.videos) localStorage.setItem('videos', JSON.stringify(data.videos))
        if (data.fortschritt) localStorage.setItem('fortschritt', JSON.stringify(data.fortschritt))
        if (data.einstellungen) localStorage.setItem('einstellungen', JSON.stringify(data.einstellungen))
        window.location.reload() // App mit den importierten Daten neu laden
      } catch {
        alert('Das ist leider keine gültige Backup-Datei.')
      }
    }
    reader.readAsText(file)
  }

  // Alles auf null zurücksetzen (mit doppelter Nachfrage!)
  function resetData() {
    if (!confirm('Wirklich ALLE Vokabeln, Videos und deinen Fortschritt löschen?')) return
    if (!confirm('Ganz sicher? Das kann nicht rückgängig gemacht werden!')) return
    localStorage.removeItem('vokabeln')
    localStorage.removeItem('videos')
    localStorage.removeItem('fortschritt')
    localStorage.removeItem('einstellungen')
    window.location.reload()
  }

  return (
    <div className="settings">
      {/* ---------- Profil-Übersicht ---------- */}
      <div className="profile-card">
        <div className="profile-level">{level}</div>
        <div className="profile-info">
          <div className="profile-name">{levelName(level)}</div>
          <div className="profile-stats">
            {progress.xp} XP · 🔥 {progress.streak} Tage · {counts.woerter} Wörter ·{' '}
            {counts.videos} Videos
          </div>
        </div>
      </div>

      {/* ---------- Konto ---------- */}
      {supabaseBereit && (
        <>
          <h2 className="settings-heading">Dein Konto</h2>
          {nutzer ? (
            <>
              <div className="konto-karte">
                <div className="konto-avatar">
                  {anzeigename(nutzer).charAt(0).toUpperCase()}
                </div>
                <div className="konto-text">
                  <div className="konto-name">{anzeigename(nutzer)}</div>
                  <div className="konto-mail">{nutzer.email}</div>
                </div>
                <span className="konto-sync">
                  {syncStatus === 'laeuft' ? '⏳ Gleicht ab…' : '✓ Gesichert'}
                </span>
              </div>
              <p className="settings-hint">
                Dein Fortschritt wird automatisch gesichert und steht auf allen
                Geräten zur Verfügung.
              </p>
              <button className="btn-outline" onClick={abmeldenKlick}>
                Abmelden
              </button>
            </>
          ) : (
            <>
              <p className="settings-hint">
                Ohne Konto liegen deine Vokabeln nur auf diesem Gerät. Mit Konto
                sind sie gesichert und du lernst auf Handy und Rechner am
                gleichen Stand weiter.
              </p>
              <button className="btn" onClick={onLoginOeffnen}>
                Anmelden oder Konto anlegen
              </button>
            </>
          )}
        </>
      )}

      {/* ---------- Abo ---------- */}
      <h2 className="settings-heading">Dein Abo</h2>
      <div className="plan-grid">
        <div className="plan-card plan-active">
          <div className="plan-name">
            Kostenlos <span className="plan-badge">Aktueller Plan</span>
          </div>
          <ul className="plan-features">
            <li>Unbegrenzt Videos lesen</li>
            <li>Vokabeltrainer mit Spaced Repetition</li>
            <li>XP, Level & Tagesserie</li>
          </ul>
        </div>
        <div className="plan-card plan-premium">
          <div className="plan-name">
            Premium <span className="plan-badge badge-soon">Bald verfügbar</span>
          </div>
          <ul className="plan-features">
            <li>Unbegrenzte KI-Vokabellisten</li>
            <li>Unbegrenzte zweisprachige E-Books</li>
            <li>Eigene Videos ohne Begrenzung</li>
            <li>Offline-Modus & Erinnerungen</li>
          </ul>
          {/* Die drei Preis-Optionen */}
          <div className="price-options">
            <div className="price-row">
              <span>Monatlich</span>
              <b>5,99 €</b>
            </div>
            <div className="price-row price-best">
              <span>
                Jährlich <em className="spar-badge">Spare 30 %</em>
              </span>
              <b>50 €</b>
            </div>
            <div className="price-row">
              <span>Lifetime · einmal zahlen</span>
              <b>89 €</b>
            </div>
          </div>
          <button disabled title="Kommt mit der App-Version">
            Demnächst
          </button>
        </div>
      </div>

      {/* ---------- Lernziel ---------- */}
      <h2 className="settings-heading">Tagesziel</h2>
      <div className="settings-card">
        <div className="goal-row">
          {[10, 20, 30, 50].map((ziel) => (
            <button
              key={ziel}
              className={'chip ' + (settings.tagesziel === ziel ? 'chip-active' : '')}
              onClick={() => setSettings((s) => ({ ...s, tagesziel: ziel }))}
            >
              {ziel} XP
            </button>
          ))}
        </div>
        <div className="goal-progress">
          <div className="xp-bar goal-bar">
            <div className="xp-bar-fill" style={{ width: zielProzent + '%' }} />
          </div>
          <span className="goal-text">
            {heutigeXp}/{settings.tagesziel} XP heute {zielProzent >= 100 && '– geschafft! 🎉'}
          </span>
        </div>
      </div>

      {/* ---------- Benachrichtigungen ---------- */}
      <h2 className="settings-heading">Benachrichtigungen</h2>
      <div className="settings-card">
        <label className="settings-row">
          <div>
            <div className="row-title">Lern-Erinnerungen</div>
            <div className="row-hint">
              Erinnert dich an fällige Vokabeln (als Push-Nachricht ab der App-Version)
            </div>
          </div>
          <span className="switch">
            <input
              type="checkbox"
              checked={settings.erinnerungen}
              onChange={(e) =>
                setSettings((s) => ({ ...s, erinnerungen: e.target.checked }))
              }
            />
            <span className="slider" />
          </span>
        </label>
      </div>

      {/* ---------- Konto (kommt mit der Cloud-Version) ---------- */}
      <h2 className="settings-heading">Konto</h2>
      <div className="settings-card">
        <div className="settings-row">
          <div>
            <div className="row-title">Anmeldung & Cloud-Sync</div>
            <div className="row-hint">
              Kommt mit dem nächsten großen Update – dann bleiben deine Daten auf
              allen Geräten synchron.
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Daten ---------- */}
      <h2 className="settings-heading">Deine Daten</h2>
      <div className="settings-card">
        <div className="settings-row">
          <div>
            <div className="row-title">Backup erstellen</div>
            <div className="row-hint">Lädt alle Vokabeln & Fortschritte als Datei herunter</div>
          </div>
          <button className="btn-small" onClick={exportData}>
            Exportieren
          </button>
        </div>
        <div className="settings-row">
          <div>
            <div className="row-title">Backup einspielen</div>
            <div className="row-hint">Stellt Daten aus einer Backup-Datei wieder her</div>
          </div>
          <button className="btn-small" onClick={() => fileInputRef.current.click()}>
            Importieren
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={importData}
          />
        </div>
        <div className="settings-row">
          <div>
            <div className="row-title">Alles zurücksetzen</div>
            <div className="row-hint">Löscht sämtliche Daten unwiderruflich</div>
          </div>
          <button className="btn-small btn-danger" onClick={resetData}>
            Löschen
          </button>
        </div>
      </div>

      {/* ---------- Über ---------- */}
      <p className="about-note">Mit Herz entwickelt von Klarwerk Digital</p>
    </div>
  )
}
