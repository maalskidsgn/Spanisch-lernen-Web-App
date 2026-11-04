import { useEffect, useRef, useState } from 'react'
import {
  ladeBenutzername, ladeRangliste, setzeBenutzername, istNameFrei, nameFehler, ZEITRAEUME,
  bildAdresse, einladungsLink, loeseEinladungEin, ladeGesamtXp,
} from './rangliste.js'
import { levelFromXp } from './gamification.js'
import LevelEmblem from './LevelEmblem.jsx'
import Logo from './Logo.jsx'
import ProfilSchau from './ProfilSchau.jsx'
import { useTexte, gebiet } from './sprache.js'

/**
 * Die Rangliste auf der Startseite: die zehn Lernenden mit den meisten
 * XP. Ohne Benutzernamen steht man nicht drin – dann zeigt die Karte
 * gleich das Feld, um sich einen auszusuchen.
 *
 * Fehlt die Datenbank-Migration (supabase-rangliste.sql), bleibt die
 * Karte unsichtbar statt kaputt.
 */
// Letzter Stand der Rangliste im Browser – damit die Karte sofort
// steht und nicht erst nach 2–3 s Datenbank-Antwort aufploppt.
// Die frische Liste ersetzt den Stand still, sobald sie da ist.
function cacheSchluessel(nutzerId, z, f) {
  return 'rangliste:' + (nutzerId || '-') + ':' + z + ':' + (f ? 'freunde' : 'alle')
}
function ausCache(nutzerId, z, f) {
  try {
    return JSON.parse(localStorage.getItem(cacheSchluessel(nutzerId, z, f))) || {}
  } catch {
    return {}
  }
}

export function RanglistenKarte({ nutzerId, eigeneXp = 0 }) {
  const t = useTexte()
  const [name, setName] = useState(() => ausCache(nutzerId, 'gesamt', false).name) // undefined = lädt/nicht verfügbar
  const [liste, setListe] = useState(() => ausCache(nutzerId, 'gesamt', false).liste ?? null)
  const [zeitraum, setZeitraum] = useState('gesamt')
  // Während ein anderer Zeitraum geladen wird, bleibt die alte Liste
  // stehen und blendet nur ab. Sie ganz zu entfernen liess die Karte
  // zusammenklappen – das sprang.
  const [wechselt, setWechselt] = useState(false)
  const [gesamtXp, setGesamtXp] = useState({}) // Name -> Gesamt-XP, für die Embleme bei Monat und Jahr
  // Wer gerade angeschaut wird – leer heisst: niemand
  const [schau, setSchau] = useState('')
  // Nur Freunde: macht die Liste persönlich – gegen Leute antreten,
  // die man kennt, zieht mehr als gegen 47 Unbekannte.
  const [nurFreunde, setNurFreunde] = useState(false)

  // Wer über eine Einladung kam, hat den Einladenden gleich als Freund
  const [eingeloest, setEingeloest] = useState('')

  async function laden(z = zeitraum, f = nurFreunde) {
    const [n, l] = await Promise.all([ladeBenutzername(nutzerId), ladeRangliste(10, z, f)])
    setName(n)
    setListe(l)
    setWechselt(false)
    if (n !== undefined && l) {
      try {
        localStorage.setItem(cacheSchluessel(nutzerId, z, f), JSON.stringify({ name: n, liste: l }))
      } catch { /* Speicher voll – dann eben ohne Vorrat */ }
    }

    // Eine gemerkte Einladung einlösen, sobald es einen Benutzernamen
    // gibt – vorher kann die Anfrage niemandem zugeordnet werden.
    if (n) {
      const wer = await loeseEinladungEin()
      if (wer) {
        setEingeloest(wer)
        setListe(await ladeRangliste(10, z, f))
      }
    }
  }

  useEffect(() => {
    // Gemerkten Stand für diesen Zeitraum sofort zeigen, dann frisch laden
    const vorrat = ausCache(nutzerId, zeitraum, nurFreunde)
    if (vorrat.liste) {
      setName(vorrat.name)
      setListe(vorrat.liste)
      setWechselt(false)
    }
    laden()
    const neu = () => laden()
    window.addEventListener('benutzername', neu)
    return () => window.removeEventListener('benutzername', neu)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nutzerId, zeitraum, nurFreunde])

  // Monat und Jahr: Für das Emblem zählen trotzdem die Gesamt-XP
  useEffect(() => {
    if (zeitraum === 'gesamt' || !liste) return
    const fehlen = liste.map((z) => z.benutzername).filter((n) => !(n in gesamtXp))
    if (!fehlen.length) return
    let aktiv = true
    ladeGesamtXp(fehlen).then((neu) => {
      if (aktiv) setGesamtXp((alt) => ({ ...alt, ...neu }))
    })
    return () => { aktiv = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zeitraum, liste])

  if (name === undefined || liste === null) return null

  // Die eigenen XP liegen lokal frischer vor als in der Datenbank
  // (die zieht 1,5 s verzögert nach) – also den höheren Wert zeigen.
  // Nur bei der Gesamtliste: Die lokalen XP sind frischer als die
  // Datenbank. Bei Monat und Jahr wäre der Gesamtstand schlicht falsch.
  const zeilen =
    zeitraum === 'gesamt'
      ? liste.map((z) => {
          const xp = z.ich ? Math.max(z.xp, eigeneXp) : z.xp
          return { ...z, xp, level: levelFromXp(xp) }
        })
      : liste.map((z) => {
          const gesamt = z.ich ? eigeneXp : gesamtXp[z.benutzername]
          return { ...z, level: gesamt === undefined ? null : levelFromXp(gesamt) }
        })
  // Bei Monat und Jahr nur zeigen, wer in dem Zeitraum wirklich XP
  // hat. Sich selbst mit 0 XP allein in der Liste zu sehen, wirkt
  // wie ein Fehler – dann lieber der Hinweis darunter.
  const echte = zeitraum === 'gesamt' ? zeilen : zeilen.filter((z) => z.xp > 0)
  const top = echte.filter((z) => z.platz <= 10)
  // Die ersten drei stehen auf dem Podest, der Rest in der Liste
  const podest = top.filter((z) => z.platz <= 3)
  const rest = top.filter((z) => z.platz > 3)
  const ichDraussen = echte.find((z) => z.ich && z.platz > 10)
  const meinPlatz = echte.find((z) => z.ich)?.platz

  return (
    <section className="start-karte rangliste">
      {/* Die Überschrift trägt die Zahl, um die es geht: wie viele
          mitmachen. Der Pokal als Emoji sah auf jedem Gerät anders
          aus – jetzt ein gezeichnetes Zeichen in Markenfarbe. */}
      <div className="rang-kopf">
        <span className="rang-zeichen" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M6 4h12v5a6 6 0 0 1-12 0V4z" fill="currentColor" />
            <path d="M6 5H4a2 2 0 0 0 0 4h2M18 5h2a2 2 0 0 1 0 4h-2"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 15v3M9 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <h2 className="rang-titel">{t('home.rangliste')}</h2>
        {/* Rechts der eigene Platz – das ist die Zahl, die einen
            wirklich interessiert, wenn man die Karte sieht. */}
        {meinPlatz && <span className="rang-meiner">{t('rang.meinPlatz', { nr: meinPlatz })}</span>}
      </div>

      {/* Alle oder nur Freunde. Gegen Leute antreten, die man kennt,
          zieht mehr als gegen siebenundvierzig Unbekannte. */}
      <div className="rang-kreis" role="tablist" aria-label={t('rang.werZaehlt')}>
        <button
          role="tab"
          aria-selected={!nurFreunde}
          className={'rang-kr' + (!nurFreunde ? ' ist-aktiv' : '')}
          onClick={() => { if (nurFreunde) { setWechselt(true); setNurFreunde(false) } }}
        >
          {t('home.alle')}
        </button>
        <button
          role="tab"
          aria-selected={nurFreunde}
          className={'rang-kr' + (nurFreunde ? ' ist-aktiv' : '')}
          onClick={() => { if (!nurFreunde) { setWechselt(true); setNurFreunde(true) } }}
        >
          {t('home.nurFreunde')}
        </button>
      </div>

      {/* Drei Zeiträume: Wer lange dabei ist, steht insgesamt vorn –
          wer gerade loslegt, hat im Monat eine faire Chance. */}
      <div className="rang-zeitraum" role="tablist" aria-label={t('rang.zeitraum')}>
        {/* Die Pille gleitet zum gewählten Knopf, statt zu springen */}
        <span
          className="rang-zr-pille"
          aria-hidden="true"
          style={{
            // Breite und Weg richten sich nach der Anzahl der Knöpfe –
            // sonst passt die Pille nicht mehr, sobald einer dazukommt.
            width: `calc((100% - 10px) / ${ZEITRAEUME.length})`,
            transform: `translateX(${ZEITRAEUME.findIndex(([w]) => w === zeitraum) * 100}%)`,
          }}
        />
        {ZEITRAEUME.map(([wert, text]) => (
          <button
            key={wert}
            role="tab"
            aria-selected={zeitraum === wert}
            className={'rang-zr' + (zeitraum === wert ? ' ist-aktiv' : '')}
            onClick={() => {
              if (wert === zeitraum) return
              setWechselt(true)
              setZeitraum(wert)
            }}
          >
            {t(text)}
          </button>
        ))}
      </div>

      {top.length === 0 ? (
        <div className="rang-leer">
          {nurFreunde ? (
            <p>
              <b>{t('rang.keineFreunde')}</b>
            </p>
          ) : zeitraum === 'gesamt' ? (
            <p>{t('rang.niemandDrin')}</p>
          ) : (
            <>
              <p>
                <b>{t('rang.wertungLaeuft')}</b>
              </p>
              <p className="rang-leer-klein">
{t('rang.wertungText', { zeitraum: zeitraum === 'monat' ? t('rang.diesesMonats') : t('rang.diesesJahres') })}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className={'rang-inhalt' + (wechselt ? ' ist-wechsel' : '')}>
          {/* Die drei Besten auf dem Podest – Gold in der Mitte und
              höher. Weniger als drei kommen in die Liste darunter,
              ein Podest mit einer Säule wäre albern. */}
          {podest.length === 3 && (
            <div className="rang-podest">
              <Saeule z={podest[1]} stufe="zweiter" onOeffnen={setSchau} />
              <Saeule z={podest[0]} stufe="erster" onOeffnen={setSchau} />
              <Saeule z={podest[2]} stufe="dritter" onOeffnen={setSchau} />
            </div>
          )}

          <ol className="rang-liste">
            {(podest.length === 3 ? rest : top).map((z, i) => (
              <RangZeile key={zeitraum + '-' + z.platz} z={z} nr={i} onOeffnen={setSchau} />
            ))}
            {ichDraussen && (
              <>
                <li className="rang-luecke" aria-hidden="true">···</li>
                <RangZeile z={ichDraussen} nr={rest.length} onOeffnen={setSchau} />
              </>
            )}
          </ol>
        </div>
      )}

      {/* Gegen Freunde antreten geht nur, wenn welche da sind. Der Link
          steht deshalb direkt unter der Freundesliste – da fällt auf,
          dass sie kurz ist. */}
      {eingeloest && (
        <p className="rang-eingeloest">
          {t('rg3.anfrageAn')} <b>{eingeloest}</b> {t('rg3.istRaus')}
        </p>
      )}

      {nurFreunde && name && <Einladen name={name} />}

      {schau && <ProfilSchau benutzername={schau} onSchliessen={() => setSchau('')} />}

      {name === null && (
        <div className="rang-mitmachen">
          <p>
            <b>{t('rang.duFehlst')}</b> {t('rl9.suchDirNamen', { xp: eigeneXp })}
          </p>
          <BenutzernameFeld nutzerId={nutzerId} knopf={t('rang.mitmachen')} />
        </div>
      )}
    </section>
  )
}

/**
 * Freunde einladen.
 *
 * Der Link trägt den eigenen Benutzernamen. Wer darüber ein Konto
 * anlegt, schickt einem automatisch eine Freundschaftsanfrage – sonst
 * müssten sich beide hinterher noch gegenseitig suchen, und genau da
 * bricht so eine Einladung ab.
 */
function Einladen({ name }) {
  const t = useTexte()
  const [stand, setStand] = useState('') // '' | 'kopiert' | 'fehler'
  const adresse = einladungsLink(name)

  async function teilen() {
    const daten = {
      title: 'Habloo',
      text: t('rl9.teilenText'),
      url: adresse,
    }
    // Auf dem Handy das Teilen-Blatt des Systems: WhatsApp, Nachrichten,
    // was auch immer da ist. Am Rechner gibt es das meist nicht.
    try {
      if (navigator.share) {
        await navigator.share(daten)
        return
      }
    } catch {
      return // abgebrochen – das ist keine Panne
    }
    try {
      await navigator.clipboard.writeText(adresse)
      setStand('kopiert')
      setTimeout(() => setStand(''), 2200)
    } catch {
      setStand('fehler')
    }
  }

  return (
    <div className="rang-einladen">
      <p className="rang-ein-titel">{t('rang.spielGegenFreunde')}</p>
      <p className="rang-ein-text">
        {t('rl9.schickDenLink')}
      </p>

      <button type="button" className="rang-ein-knopf" onClick={teilen}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 16V4M12 4 8 8M12 4l4 4" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" />
        </svg>
        {stand === 'kopiert' ? t('rang.linkKopiert') : t('rang.linkTeilen')}
      </button>

      {/* Den Link auch zum Anschauen – manche kopieren lieber selbst */}
      <p className="rang-ein-adresse">{adresse.replace('https://', '')}</p>
      {stand === 'fehler' && (
        <p className="rang-ein-fehler">{t('rang.kopierenFehlte')}</p>
      )}
    </div>
  )
}

/**
 * Das Bild einer Person – oder ihre Initiale, wenn keins da ist.
 *
 * An vier Stellen gebraucht (Podest, Liste, Profilschau, eigener
 * Kopf), deshalb ein eigener Baustein: Sonst sieht es an jeder
 * Stelle ein bisschen anders aus.
 */
export function Bildnis({ name, bild, klasse = '' }) {
  const adresse = bildAdresse(bild)
  if (adresse) {
    return <img className={klasse + ' hat-bild'} src={adresse} alt="" loading="lazy" />
  }
  return <span className={klasse} aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
}

/** Eine Säule des Podests: Bild, Name, XP und der Block mit dem Platz. */
function Saeule({ z, stufe, onOeffnen }) {
  const t = useTexte()
  return (
    <button
      type="button"
      className={'rang-saeule rang-' + stufe + (z.ich ? ' ist-ich' : '')}
      onClick={() => onOeffnen?.(z.benutzername)}
      aria-label={t('rang.profilAnsehen', { name: z.benutzername })}
    >
      <Bildnis name={z.benutzername} bild={z.bild} klasse="rs-bild" />
      <span className="rs-name">
        {z.benutzername}
        {z.ich && <small>{t('rl9.duMarke')}</small>}
      </span>
      <span className="rs-xp">{z.xp.toLocaleString(gebiet())} XP</span>
      <span className="rs-block">
        {z.level && <LevelEmblem level={z.level} groesse={{ erster: 54, zweiter: 44, dritter: 36 }[stufe]} />}
        {z.platz}
      </span>
    </button>
  )
}

/**
 * Eine Zeile der Rangliste.
 *
 * Statt Medaillen-Emojis (die auf jedem Gerät anders aussehen) trägt
 * der Platz eine eigene Farbe: Gold, Silber, Bronze, danach ruhig.
 * Der Balken darunter zeigt den Abstand zur Spitze – so sieht man
 * auf einen Blick, ob es knapp ist oder uneinholbar.
 */
function RangZeile({ z, nr = 0, onOeffnen }) {
  const t = useTexte()
  const stufe = z.platz <= 3 ? ' rang-p' + z.platz : ''
  return (
    <li style={{ '--nr': nr }} className="rang-eintrag">
      <button
        type="button"
        className={'rang-zeile' + (z.ich ? ' rang-ich' : '') + stufe}
        onClick={() => onOeffnen?.(z.benutzername)}
        aria-label={t('rang.profilAnsehen', { name: z.benutzername })}
      >
      <span className="rang-platz">{z.platz}</span>
      <Bildnis name={z.benutzername} bild={z.bild} klasse="rang-initial" />
      <span className="rang-name">
        {z.benutzername}
        {z.ich && <small>{t('rl9.duMarke')}</small>}
      </span>
        <span className="rang-emblem">
          {z.level && <LevelEmblem level={z.level} groesse={28} />}
        </span>
        <b className="rang-xp">
          {z.xp.toLocaleString(gebiet())}
          <small>XP</small>
        </b>
      </button>
    </li>
  )
}

/**
 * Eingabefeld für den Benutzernamen mit Live-Prüfung, ob er frei ist.
 * Wird auf dem Start, im Begrüßungsschritt und in den Einstellungen
 * benutzt.
 */
export function BenutzernameFeld({ nutzerId, start = '', knopf, onGespeichert }) {
  const t = useTexte()
  // Der Standardtext kann nicht im Parameter stehen: Dort gibt es den
  // Hook noch nicht, und eine feste Zeichenkette waere beim Umschalten
  // der Sprache eingefroren.
  const knopfText = knopf ?? t('app.speichern')
  const [wert, setWert] = useState(start)
  const [frei, setFrei] = useState(null) // null = unbekannt
  const [fehler, setFehler] = useState('')
  const [laeuft, setLaeuft] = useState(false)
  const pruefNr = useRef(0)

  const form = wert.trim() ? nameFehler(wert) : ''
  const unveraendert = start && wert.trim().toLowerCase() === start.toLowerCase()

  // Kurz nach dem Tippen nachfragen, ob der Name noch frei ist
  useEffect(() => {
    setFrei(null)
    if (!wert.trim() || form || unveraendert) return
    const nr = ++pruefNr.current
    const t = setTimeout(async () => {
      const ok = await istNameFrei(wert)
      if (nr === pruefNr.current) setFrei(ok)
    }, 350)
    return () => clearTimeout(t)
  }, [wert, form, unveraendert])

  async function speichern(e) {
    e.preventDefault()
    setFehler('')
    setLaeuft(true)
    try {
      const n = await setzeBenutzername(nutzerId, wert)
      onGespeichert?.(n)
    } catch (f) {
      setFehler(f.message)
    } finally {
      setLaeuft(false)
    }
  }

  let hinweis = ''
  let klasse = ''
  if (form) { hinweis = form; klasse = 'name-schlecht' }
  else if (frei === false) { hinweis = t('rang.nameVergeben'); klasse = 'name-schlecht' }
  else if (frei === true) { hinweis = t('rgm.derNameIst'); klasse = 'name-gut' }

  return (
    <form className="name-form" onSubmit={speichern}>
      <div className="name-zeile">
        <span className="name-at" aria-hidden="true">@</span>
        <input
          value={wert}
          onChange={(e) => setWert(e.target.value.replace(/\s/g, ''))}
          placeholder={t('rang.namePlatzhalter')}
          maxLength={20}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-label={t('pf.benutzername')}
        />
        <button
          className="btn name-knopf"
          disabled={laeuft || !wert.trim() || Boolean(form) || frei === false || unveraendert}
        >
          {laeuft ? '…' : knopfText}
        </button>
      </div>
      {(fehler || hinweis) && <p className={'name-hinweis ' + (fehler ? 'name-schlecht' : klasse)}>{fehler || hinweis}</p>}
    </form>
  )
}

/**
 * Einmal nach der Anmeldung: "Wie willst du heißen?"
 * Wer jetzt nicht will, tippt "Später" und findet das Feld wieder auf
 * der Startseite und in den Einstellungen.
 */
export function BenutzernameWahl({ nutzerId, onFertig }) {
  const t = useTexte()
  return (
    <div className="ob">
      <div className="ob-karte name-wahl">
        <span className="ob-maskottchen" aria-hidden="true"><Logo /></span>
        <h1>{t('rg3.wieWillstDu')} <span className="ob-akzent">{t('rg3.heissen')}</span></h1>
        <p className="ob-text">
          {t('rg3.nameErscheint')} <b>{t('home.rangliste')}</b> {t('rg3.meisteXp')}
        </p>
        <BenutzernameFeld nutzerId={nutzerId} knopf={t('rg3.losGehts')} onGespeichert={onFertig} />
        <button className="ob-skip name-spaeter" onClick={onFertig}>{t('rang.spaeter')}</button>
      </div>
    </div>
  )
}
