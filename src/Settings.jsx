import { useRef, useState, useEffect } from 'react'
import { API_URL, istApp } from './api.js'
import {
  usePremium, zurKasse, aboVerwalten,
  TESTPHASE_ALLES_FREI, testkaufAn, testkaufAus, testkaufLaeuft,
} from './premium.js'
import { levelFromXp, levelName, xpHeute } from './gamification.js'
import { supabaseBereit, db } from './supabase.js'
import { leereLerndaten } from './sync.js'
import { abmelden, anzeigename } from './auth.js'
import { IconPfeil } from './icons.jsx'
import { BenutzernameFeld } from './Rangliste.jsx'
import Freunde from './Freunde.jsx'
import DuellKasten from './Duell.jsx'
import {
  ladeBenutzername, ladeProfilbild, setzeProfilbild, loescheProfilbild, bildAdresse,
} from './rangliste.js'
import { tonVonSelbst, setzeTonVonSelbst } from './audio.js'
import { erfolgston, erfolgstoeneAn, setzeErfolgstoene, erfolgstoeneVerfuegbar } from './erfolgston.js'
import { einwilligungsStand, setzeEinwilligung, messungMoeglich } from './messung.js'

// Der Profilbereich (Tab "Profil"): Konto, Abo, Lernziele und
// Einstellungen. Hier kommen später die sozialen Sachen dazu –
// Benutzername, Rangliste, Freunde.
// Benachrichtigungen, Daten-Sicherung und App-Infos.
// Preis und Status kommen aus Stripe bzw. der Datenbank – hier steht
// bewusst keine Zahl fest verdrahtet, sonst weicht die Anzeige
// irgendwann von dem ab, was tatsaechlich abgebucht wird.
/**
 * Ein Abschnitt, der zugeklappt anfängt.
 *
 * Das Profil soll beim Öffnen wie ein Profil aussehen, nicht wie
 * eine Schalttafel. Wer wirklich etwas einstellen will, klappt auf –
 * alle anderen sehen nur ihre Zahlen und die Rangliste.
 */
function Klapper({ titel, hinweis, offen = false, children }) {
  const [auf, setAuf] = useState(offen)
  return (
    <section className={'pf-klapper' + (auf ? ' ist-auf' : '')}>
      <button className="pf-klapper-kopf" onClick={() => setAuf(!auf)} aria-expanded={auf}>
        <span className="pf-klapper-text">
          <b>{titel}</b>
          {hinweis && <small>{hinweis}</small>}
        </span>
        <span className="pf-klapper-pfeil" aria-hidden="true">
          <IconPfeil groesse={17} />
        </span>
      </button>
      {auf && <div className="pf-klapper-inhalt">{children}</div>}
    </section>
  )
}

export default function Settings({
  progress,
  settings,
  setSettings,
  counts,
  nutzer,
  syncStatus,
  onLoginOeffnen,
  onNavigate,
  onRecht,
  onKasse,
  addXp,
}) {
  const { premium, bis, status: aboStatus, neuLaden } = usePremium()
  // Der Ton-Schalter liegt nicht in settings: Er soll auch ohne
  // Konto und ohne Abgleich gelten – wer im Buero sitzt, will ihn
  // sofort aus, nicht nach der naechsten Synchronisierung.
  const [autoTon, setAutoTon] = useState(tonVonSelbst)
  const [erfolgAn, setErfolgAn] = useState(erfolgstoeneAn)
  // Die Einwilligung zur Messung – zuruecknehmen muss genauso leicht
  // sein wie zustimmen, sonst ist die Zustimmung nicht wirksam.
  const [messung, setMessung] = useState(() => einwilligungsStand() === 'ja')
  const [bezahlbar, setBezahlbar] = useState(false)
  const [preis, setPreis] = useState(null)
  const [laedt, setLaedt] = useState(false)
  const [kaufFehler, setKaufFehler] = useState('')
  const [kasseInApp, setKasseInApp] = useState(false) // Formular in der App möglich?
  const [loeschLaeuft, setLoeschLaeuft] = useState(false)
  // Der Benutzername steht im Profilkopf – er ist der Name, unter
  // dem einen die anderen in der Rangliste sehen.
  const [benutzername, setBenutzername] = useState('')
  const [bild, setBild] = useState(null)
  const [bildLaeuft, setBildLaeuft] = useState(false)
  const bildFeld = useRef(null)
  useEffect(() => {
    if (!nutzer?.id) return setBenutzername('')
    ladeBenutzername(nutzer.id).then((n) => setBenutzername(n || ''))
    ladeProfilbild(nutzer.id).then(setBild)
    const neu = (e) => setBenutzername(e.detail || '')
    window.addEventListener('benutzername', neu)
    return () => window.removeEventListener('benutzername', neu)
  }, [nutzer])
  const [resetLaeuft, setResetLaeuft] = useState(false)

  // Steht die Bezahlung bereit, und was kostet es?
  useEffect(() => {
    fetch(API_URL + '/api/bezahlung/status')
      .then((r) => r.json())
      .then((d) => {
        setBezahlbar(Boolean(d.bereit))
        setPreis(d.preis ?? null)
        // Ohne öffentlichen Schlüssel kann das Formular in der App
        // nicht laufen – dann bleibt es beim alten Weg über Stripe,
        // statt den Nutzer in eine Fehlermeldung laufen zu lassen.
        setKasseInApp(Boolean(d.schluessel))
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

  // Das Bezahlformular läuft jetzt IN der App (Bezahlen.jsx) statt
  // auf einer Stripe-Seite. Fehlt dem Server der öffentliche
  // Schlüssel, geht es wie früher zu Stripe – besser als nichts.
  async function kaufen() {
    setKaufFehler('')
    // Eigene Kassenseite (App.jsx). Fehlt dem Server der oeffentliche
    // Schluessel, geht es wie frueher zu Stripe – besser als nichts.
    if (kasseInApp) return onKasse?.()

    setLaedt(true)
    try {
      await zurKasse()
    } catch (f) {
      setKaufFehler(f.message)
      setLaedt(false)
    }
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

  // Was in ein Backup gehoert – eine Liste, damit Export und Import
  // nicht auseinanderlaufen koennen. Frueher sicherte der Export nur
  // vier Schluessel: Lektionsfortschritt, Videostaende und die
  // Tagesserie waren nach dem Einspielen weg.
  const BACKUP_SCHLUESSEL = [
    'vokabeln',
    'saetze',
    'lesetexte',
    'feedGesehen',
    'videos',
    'videoFortschritt',
    'fortschritt',
    'einstellungen',
    'lektionen',
    'aktivitaet',
    'buecher',
  ]

  // Alle Lerndaten als Datei herunterladen (Backup)
  function exportData() {
    const daten = {}
    for (const schluessel of BACKUP_SCHLUESSEL) {
      const wert = localStorage.getItem(schluessel)
      if (wert !== null) daten[schluessel] = wert
    }
    const backup = {
      app: 'spanisch-lernen',
      version: 2,
      exportiertAm: new Date().toISOString(),
      daten,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'spanisch-lernen-backup.json'
    a.click()
    // Erst freigeben, wenn der Download angestossen ist – sonst bricht
    // er in manchen Browsern ab.
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
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

        if (data.daten) {
          // Neues Format (Version 2): fertige Werte je Schluessel
          for (const schluessel of BACKUP_SCHLUESSEL) {
            if (typeof data.daten[schluessel] === 'string') {
              localStorage.setItem(schluessel, data.daten[schluessel])
            }
          }
        } else {
          // Alte Backups weiter einlesen koennen
          for (const schluessel of ['vokabeln', 'videos', 'fortschritt', 'einstellungen']) {
            if (data[schluessel]) {
              localStorage.setItem(schluessel, JSON.stringify(data[schluessel]))
            }
          }
        }
        window.location.reload() // App mit den importierten Daten neu laden
      } catch {
        alert('Das ist leider keine gültige Backup-Datei.')
      }
    }
    reader.readAsText(file)
  }

  /**
   * Alles auf null zurücksetzen.
   *
   * Zwei Fehler steckten hier drin, beide unsichtbar:
   *
   * 1. Es wurde NUR der Speicher des Geräts geleert. Beim Neuladen
   *    holte zusammenfuehren() alles aus Supabase zurück und schrieb
   *    es sogar noch einmal hin. Für jeden angemeldeten Nutzer war
   *    der Knopf damit wirkungslos – genau das ist Manuel am 23.08.
   *    aufgefallen. Deshalb jetzt zuerst die Datenbank.
   *
   * 2. Die Schlüsselliste war unvollständig. "bausteine" – der ganze
   *    Grammatik-Fortschritt – stand nicht drin und überlebte jedes
   *    Zurücksetzen. Dieselbe Sorte Fehler, die der Kommentar hier
   *    schon einmal für Lektionen und Videos beschrieben hat.
   */
  async function resetData() {
    if (!confirm('Wirklich ALLE Vokabeln, Videos und deinen Fortschritt löschen?')) return
    if (!confirm('Ganz sicher? Das kann nicht rückgängig gemacht werden!')) return

    setResetLaeuft(true)

    // ERST die Datenbank. Andersherum stünde beim Neuladen alles
    // wieder da – der alte Fehler.
    if (nutzer && supabaseBereit) {
      try {
        await leereLerndaten(nutzer.id)
      } catch (f) {
        setResetLaeuft(false)
        alert(
          'Das Zurücksetzen hat nicht geklappt: ' + f.message +
            '\n\nAuf diesem Gerät wurde nichts gelöscht. Bitte später noch einmal versuchen.'
        )
        return
      }
    }

    for (const schluessel of [
      'vokabeln',
      'videos',
      'videoFortschritt',
      'fortschritt',
      'einstellungen',
      'lektionen',
      'bausteine', // der Grammatik-Fortschritt – fehlte bis 23.08.
      'bausteinVarianten',
      'aktivitaet',
      'tagesplan',
      'nutzung',
      'buecher',
      'vorschlaege2',
      'tonVonSelbst',
      'startpaket:offen',
      'spotify_zugang',
      'spotify_interpreten',
    ]) {
      localStorage.removeItem(schluessel)
    }
    // Das Onboarding hängt an der Nutzerkennung – wer zurücksetzt,
    // fängt auch dort wieder von vorn an.
    if (nutzer) localStorage.removeItem('onboarding:' + nutzer.id)

    // NICHT geleert wird die Einwilligung zur Messung. Sie ist keine
    // Lerndatei, sondern eine Entscheidung: Wer "Ablehnen" geklickt
    // hat, hätte sie sonst mit dem Zurücksetzen widerrufen – und
    // bekäme den Banner wieder vorgelegt, als hätte er nie geantwortet.

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
      {/* ---------- Profilkopf ----------
          Wie man es von sozialen Netzen kennt: grosses Bild, Name,
          darunter die Zahlen in einer Reihe. Die Einstellungen
          liegen weiter unten und sind zugeklappt – wer sein Profil
          anschaut, will nicht zuerst Schalter sehen. */}
      <header className="pf-kopf">
        <div className="pf-bildfeld">
          <button
            className="pf-bild"
            onClick={() => bildFeld.current?.click()}
            disabled={bildLaeuft || !nutzer}
            aria-label={bild ? 'Profilbild ändern' : 'Profilbild hinzufügen'}
          >
            {bild ? (
              <img src={bildAdresse(bild)} alt="" />
            ) : (
              <span aria-hidden="true">
                {(benutzername || anzeigename(nutzer)).charAt(0).toUpperCase()}
              </span>
            )}
            <span className="pf-bild-stift" aria-hidden="true">
              {bildLaeuft ? '…' : '✎'}
            </span>
          </button>
          <span className="pf-level" title={`Level ${level}`}>{level}</span>
          <input
            ref={bildFeld}
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const datei = e.target.files?.[0]
              e.target.value = ''
              if (!datei) return
              setBildLaeuft(true)
              try {
                await setzeProfilbild(nutzer.id, datei)
                setBild(await ladeProfilbild(nutzer.id))
              } catch (f) {
                alert(f.message)
              } finally {
                setBildLaeuft(false)
              }
            }}
          />
        </div>
        <h1 className="pf-name">{benutzername || anzeigename(nutzer)}</h1>
        <p className="pf-rang">{levelName(level)}</p>
        {bild && (
          <button
            className="btn-plain pf-bild-weg"
            onClick={async () => {
              await loescheProfilbild(nutzer.id)
              setBild(null)
            }}
          >
            Bild entfernen
          </button>
        )}

        <dl className="pf-zahlen">
          <div><dt>XP</dt><dd>{progress.xp.toLocaleString('de-DE')}</dd></div>
          <div><dt>Tage am Stück</dt><dd>{progress.streak}</dd></div>
          <div><dt>Wörter</dt><dd>{counts.woerter}</dd></div>
          <div><dt>Videos</dt><dd>{counts.videos}</dd></div>
        </dl>
      </header>

      {/* ---------- Freunde ----------
          Steht oben, nicht hinter einer Klappe: Wer sein Profil
          öffnet, sucht eher Leute als Einstellungen. */}
      {supabaseBereit && nutzer && (
        <section className="pf-kasten pf-freunde">
          <h2 className="pf-kasten-titel">Freunde</h2>
          <Freunde />
        </section>
      )}

      {/* ---------- Duelle ----------
          Direkt unter den Freunden: Gegen wen man spielt, steht
          eine Kachel weiter oben. */}
      {supabaseBereit && nutzer && (
        <section className="pf-kasten pf-duelle">
          <h2 className="pf-kasten-titel">Duell</h2>
          <p className="pf-kasten-text">
            Sieben Vokabeln, zehn Sekunden pro Frage. Ihr bekommt dieselben – wer mehr
            trifft, gewinnt.
          </p>
          <DuellKasten addXp={addXp} />
        </section>
      )}

      {/* ---------- Konto und Hilfe ----------
          Stehen in einem eigenen Kasten, nicht offen auf der Seite:
          Abmelden und den Benutzernamen sucht man nicht hinter einer
          Klappe, aber sie sollen auch nicht lose herumliegen. */}
      <section className="pf-kasten">
      <button className="leitfaden-zeile" onClick={() => onNavigate('leitfaden')}>
        <span className="leitfaden-zeile-text">
          <b>So nutzt du Habloo</b>
          <span>Deine Reise durch die App – und was wir uns dabei gedacht haben.</span>
        </span>
        <IconPfeil groesse={17} />
      </button>

      {supabaseBereit && (
        <>
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
              <BenutzernameEinstellung nutzerId={nutzer.id} />
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
      </section>

      {/* ---------- Abo ---------- */}
      {/* In der Store-App nur zeigen, wenn schon Premium besteht – kein Angebot */}
      {(!istApp || premium) && (
      <>
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

          {preis && !premium && !istApp && (
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
                {TESTPHASE_ALLES_FREI
                  ? 'Testphase – alle Funktionen frei'
                  : !gueltigBis
                    ? 'Aktiv – unbegrenzt'
                    : aboStatus === 'gekuendigt'
                      ? `Gekündigt – läuft noch bis ${gueltigBis}`
                      : `Aktiv – verlängert sich am ${gueltigBis}`}
              </p>
              {/* In der Testphase gibt es nichts zu verwalten: Premium
                  kommt vom Schalter, nicht von einem bezahlten Abo. Der
                  Knopf würde bei Stripe nach einem Abo fragen, das es
                  nicht gibt – und eine Fehlermeldung zeigen. */}
              {!istApp && !TESTPHASE_ALLES_FREI && (
                <button onClick={verwalten} disabled={laedt}>
                  {laedt ? 'Öffnet …' : 'Abo verwalten'}
                </button>
              )}
              {/* Nur während der Testphase: den Bezahlweg ausprobieren,
                  ohne allen anderen das Premium wegzunehmen. */}
              {!istApp && TESTPHASE_ALLES_FREI && (
                <button
                  className="btn-plain testkauf-knopf"
                  onClick={() => {
                    testkaufAn()
                    // Den gemerkten Stand gleich mit umstellen: sonst
                    // zeigt die Oberfläche bis zur Antwort der
                    // Datenbank weiter Premium an.
                    try { localStorage.setItem('premium-stand', 'nein') } catch { /* egal */ }
                    neuLaden()
                  }}
                >
                  Bezahlung testen
                </button>
              )}
            </>
          ) : istApp ? (
            /* Kein Kauf und kein Link nach draussen – nur der neutrale
               Hinweis, dass ein bestehendes Abo hier ankommt. */
            <p className="abo-status">
              Ein bestehendes Premium-Abo wird nach der Anmeldung
              automatisch erkannt.
            </p>
          ) : bezahlbar ? (
            <button onClick={kaufen} disabled={laedt}>
              {laedt ? 'Weiterleitung …' : 'Premium holen'}
            </button>
          ) : (
            <button disabled title="Bezahlung wird gerade eingerichtet">
              Demnächst
            </button>
          )}

          {/* Der Weg zurück: Wer den Bezahlweg ausprobiert hat, soll
              sein geschenktes Premium wiederbekommen – sonst sitzt er
              bis zum Ende der Testphase auf dem Gratis-Zugang fest. */}
          {TESTPHASE_ALLES_FREI && !premium && testkaufLaeuft() && (
            <p className="testkauf-hinweis">
              Testkauf-Modus: Du siehst die App gerade als Gratis-Nutzer.{' '}
              <button
                className="btn-plain"
                onClick={() => { testkaufAus(); neuLaden() }}
              >
                Zurück zur Testphase
              </button>
            </p>
          )}

          {kaufFehler && <p className="error">{kaufFehler}</p>}
        </div>
      </div>
      </>
      )}

      {/* ---------- Lernziel ---------- */}
      <Klapper titel="Tagesziel" hinweis="Wie viel du dir am Tag vornimmst">
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

      {/* ---------- Ton ---------- */}
      </Klapper>

      <Klapper titel="Ton" hinweis="Aussprache und Erfolgstöne">
      <div className="settings-card">
        <label className="settings-row">
          <div>
            <div className="row-title">Wörter von selbst vorlesen</div>
            <div className="row-hint">
              Spielt die Aufnahme, sobald ein neues Wort erscheint – ohne
              tippen. Aus, wenn du unterwegs oder im Büro lernst.
            </div>
          </div>
          <span className="switch">
            <input
              type="checkbox"
              checked={autoTon}
              onChange={(e) => {
                setAutoTon(e.target.checked)
                setzeTonVonSelbst(e.target.checked)
              }}
            />
            <span className="slider" />
          </span>
        </label>

        {erfolgstoeneVerfuegbar() && (
        <label className="settings-row">
          <div>
            <div className="row-title">Erfolgstöne</div>
            <div className="row-hint">
              Ein kurzer Klang, wenn du etwas richtig hast oder ein Wort
              sammelst.
            </div>
          </div>
          <span className="switch">
            <input
              type="checkbox"
              checked={erfolgAn}
              onChange={(e) => {
                setErfolgAn(e.target.checked)
                setzeErfolgstoene(e.target.checked)
                // Beim Einschalten einmal vorspielen – so hoert man
                // sofort, worum es geht.
                if (e.target.checked) erfolgston()
              }}
            />
            <span className="slider" />
          </span>
        </label>
        )}
      </div>

      {/* ---------- Rechtliches ---------- */}
      </Klapper>

      <Klapper titel="Rechtliches" hinweis="Impressum, Datenschutz, AGB">
      <div className="settings-card">
        {[
          ['impressum', 'Impressum'],
          ['datenschutz', 'Datenschutzerklärung'],
          ['agb', 'AGB & Widerrufsrecht'],
        ].map(([kennung, text]) => (
          <button key={kennung} className="leitfaden-zeile" onClick={() => onRecht(kennung)}>
            {/* Die Klasse gibt dem Text flex:1 – ohne sie klebt der
                Pfeil am Wort statt am rechten Rand. */}
            <span className="leitfaden-zeile-text">
              <b>{text}</b>
            </span>
            <IconPfeil groesse={17} />
          </button>
        ))}
      </div>

      {/* ---------- Messung ----------
           Steht nur da, wo ueberhaupt gemessen wird: in der Store-App
           und auf localhost gaebe es nichts zu schalten. */}
      {messungMoeglich() && (
        <>
          <h3 className="pf-unter">Messung</h3>
          <div className="settings-card">
            <label className="settings-row">
              <div>
                <div className="row-title">Anonyme Reichweitenmessung</div>
                <div className="row-hint">
                  Zählt mit Google Analytics, wie viele Menschen Habloo benutzen. Aus
                  heißt: kein Skript, keine Cookies. Habloo funktioniert genauso.
                </div>
              </div>
              <span className="switch">
                <input
                  type="checkbox"
                  checked={messung}
                  onChange={(e) => {
                    setMessung(e.target.checked)
                    setzeEinwilligung(e.target.checked)
                  }}
                />
                <span className="slider" />
              </span>
            </label>
          </div>
        </>
      )}

      </Klapper>

      {/* ---------- Benachrichtigungen ---------- */}
      <Klapper titel="Erinnerungen" hinweis="Wenn du ans Lernen erinnert werden willst">
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
      </Klapper>

      <Klapper titel="Deine Daten" hinweis="Sichern, einspielen, Konto löschen">
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
              Löscht Vokabeln, Fortschritt und Statistik – auch auf dem Server.
              Dein Konto bleibt bestehen.
            </div>
          </div>
          <button className="btn-small btn-danger" onClick={resetData} disabled={resetLaeuft}>
            {resetLaeuft ? 'Läuft …' : 'Zurücksetzen'}
          </button>
        </div>

        {/* Ohne Konto gibt es nichts zu loeschen – der Knopf fuehrte
            sonst nach zwei Warnungen nur in eine Fehlermeldung. */}
        {nutzer && (
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
        )}
      </div>
      </Klapper>

      {/* ---------- Über ---------- */}
      <p className="about-note">Mit Herz entwickelt von Klarwerk Digital</p>
    </div>
  )
}

/** Benutzername für die Rangliste ansehen und ändern. */
function BenutzernameEinstellung({ nutzerId }) {
  const [name, setName] = useState(undefined)
  useEffect(() => {
    ladeBenutzername(nutzerId).then(setName)
  }, [nutzerId])
  if (name === undefined) return null // Rangliste noch nicht verfügbar
  return (
    <div className="name-einstellung">
      <h3>Benutzername</h3>
      <p className="settings-hint">
        So erscheinst du in der Rangliste auf der Startseite. Jeden Namen gibt es nur einmal.
      </p>
      <BenutzernameFeld
        key={name ?? ''}
        nutzerId={nutzerId}
        start={name ?? ''}
        knopf={name ? 'Ändern' : 'Speichern'}
        onGespeichert={setName}
      />
    </div>
  )
}
