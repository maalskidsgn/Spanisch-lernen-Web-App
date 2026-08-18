import { useRef, useState, useEffect } from 'react'
import { API_URL } from './api.js'
import { usePremium, zurKasse, aboVerwalten, bezahlungBereit } from './premium.js'
import { levelFromXp, levelName, xpHeute } from './gamification.js'
import { supabaseBereit, db } from './supabase.js'
import { abmelden, anzeigename } from './auth.js'

// Der Einstellungsbereich ("Mehr"): Profil-Übersicht, Abo, Lernziele,
// Benachrichtigungen, Daten-Sicherung und App-Infos.
// Preis und Status kommen aus Stripe bzw. der Datenbank – hier steht
// bewusst keine Zahl fest verdrahtet, sonst weicht die Anzeige
// irgendwann von dem ab, was tatsaechlich abgebucht wird.
export default function Settings({
  progress,
  settings,
  setSettings,
  counts,
  nutzer,
  syncStatus,
  onLoginOeffnen,
}) {
  const { premium, bis, status: aboStatus, neuLaden } = usePremium()
  const [bezahlbar, setBezahlbar] = useState(false)
  const [preis, setPreis] = useState(null)
  const [laedt, setLaedt] = useState(false)
  const [kaufFehler, setKaufFehler] = useState('')
  const [loeschLaeuft, setLoeschLaeuft] = useState(false)

  // Steht die Bezahlung bereit, und was kostet es?
  useEffect(() => {
    fetch(API_URL + '/api/bezahlung/status')
      .then((r) => r.json())
      .then((d) => {
        setBezahlbar(Boolean(d.bereit))
        setPreis(d.preis ?? null)
      })
      .catch(() => setBezahlbar(false))
  }, [])

  // Nach der Rueckkehr von Stripe kann die Meldung noch unterwegs
  // sein – deshalb kurz warten und dann erneut nachsehen.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('bezahlt') !== 'ja') return
    window.history.replaceState({}, '', '/')
    const timer = setTimeout(neuLaden, 2500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const gueltigBis = bis ? bis.toLocaleDateString('de-DE') : ''

  async function kaufen() {
    setLaedt(true); setKaufFehler('')
    try { await zurKasse() } catch (f) { setKaufFehler(f.message); setLaedt(false) }
  }

  async function verwalten() {
    setLaedt(true); setKaufFehler('')
    try { await aboVerwalten() } catch (f) { setKaufFehler(f.message); setLaedt(false) }
  }

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

  // Konto endgueltig loeschen – Pflicht fuer App Store und Play Store.
  // Zweimal nachfragen, beim zweiten Mal muss der Nutzer tippen.
  async function kontoLoeschen() {
    if (!confirm('Dein Konto und ALLE Daten werden unwiderruflich gelöscht. Ein laufendes Abo wird gekündigt. Fortfahren?')) return
    const bestaetigung = prompt('Zum Bestätigen bitte LÖSCHEN eintippen:')
    if (bestaetigung !== 'LÖSCHEN') return

    setLoeschLaeuft(true)
    try {
      const { data: sitzung } = await db.auth.getSession()
      const token = sitzung?.session?.access_token
      if (!token) throw new Error('Bitte zuerst anmelden.')

      const res = await fetch(API_URL + '/api/konto/loeschen', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
      })
      const daten = await res.json()
      if (!res.ok) throw new Error(daten.error || 'Löschen fehlgeschlagen.')

      localStorage.clear()
      await db.auth.signOut()
      window.location.href = '/'
    } catch (f) {
      alert(f.message)
      setLoeschLaeuft(false)
    }
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
            Kostenlos{' '}
            {!premium && <span className="plan-badge">Aktueller Plan</span>}
          </div>
          <ul className="plan-features">
            <li>Unbegrenzt Videos lesen</li>
            <li>Vokabeltrainer mit Spaced Repetition</li>
            <li>XP, Level & Tagesserie</li>
          </ul>
        </div>
        <div className="plan-card plan-premium">
          <div className="plan-name">
            Premium{' '}
            {premium ? (
              <span className="plan-badge">Dein Plan</span>
            ) : !bezahlbar ? (
              <span className="plan-badge badge-soon">Bald verfügbar</span>
            ) : null}
          </div>
          <ul className="plan-features">
            <li>Unbegrenzte KI-Vokabellisten</li>
            <li>Unbegrenzte zweisprachige E-Books</li>
            <li>Eigene Videos ohne Begrenzung</li>
            <li>Offline-Modus & Erinnerungen</li>
          </ul>

          {preis && !premium && (
            <div className="price-options">
              <div className="price-row price-best">
                <span>{preis.zeitraum === 'year' ? 'Jährlich' : 'Monatlich'}</span>
                <b>
                  {preis.betrag.toLocaleString('de-DE', {
                    style: 'currency',
                    currency: preis.waehrung,
                  })}
                </b>
              </div>
            </div>
          )}

          {premium ? (
            <>
              <p className="abo-status">
                {!gueltigBis
                  ? 'Aktiv – unbegrenzt'
                  : aboStatus === 'gekuendigt'
                    ? `Gekündigt – läuft noch bis ${gueltigBis}`
                    : `Aktiv – verlängert sich am ${gueltigBis}`}
              </p>
              <button onClick={verwalten} disabled={laedt}>
                {laedt ? 'Öffnet …' : 'Abo verwalten'}
              </button>
            </>
          ) : bezahlbar ? (
            <button onClick={kaufen} disabled={laedt}>
              {laedt ? 'Weiterleitung …' : 'Premium holen'}
            </button>
          ) : (
            <button disabled title="Bezahlung wird gerade eingerichtet">
              Demnächst
            </button>
          )}

          {kaufFehler && <p className="error">{kaufFehler}</p>}
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
            <div className="row-hint">
              Leert diese App – dein Konto bleibt bestehen
            </div>
          </div>
          <button className="btn-small btn-danger" onClick={resetData}>
            Zurücksetzen
          </button>
        </div>

        <div className="settings-row">
          <div>
            <div className="row-title">Konto löschen</div>
            <div className="row-hint">
              Entfernt dein Konto und alle Daten endgültig. Ein laufendes Abo
              wird dabei gekündigt.
            </div>
          </div>
          <button
            className="btn-small btn-danger"
            onClick={kontoLoeschen}
            disabled={loeschLaeuft}
          >
            {loeschLaeuft ? 'Löscht …' : 'Konto löschen'}
          </button>
        </div>
      </div>

      {/* ---------- Über ---------- */}
      <p className="about-note">Mit Herz entwickelt von Klarwerk Digital</p>
    </div>
  )
}
