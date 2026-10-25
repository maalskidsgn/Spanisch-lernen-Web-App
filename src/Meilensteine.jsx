import { useState } from 'react'

// Meilensteine: Abzeichen für gesammelte Wörter, gelesene Texte usw.
// Jede Kategorie hat Stufen – Bronze bis Diamant. Ein erreichtes
// Abzeichen laesst sich als Bild teilen (Story, WhatsApp, …).

// Stufen in der Markenfarbe: von zart bis kräftig, die letzte mit Gold.
const STUFEN = [
  { name: 'Bronze' },
  { name: 'Silber' },
  { name: 'Gold' },
  { name: 'Platin' },
  { name: 'Diamant' },
  { name: 'Legende' },
]

/** Linien-Symbol der Kategorie – gleiche Strichstärke wie die App-Icons. */
function Symbol({ k, groesse = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={groesse} height={groesse} aria-hidden="true">
      <path d={k.pfad} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function markenFarben() {
  const css = getComputedStyle(document.documentElement)
  return {
    marke: css.getPropertyValue('--primary').trim() || '#ff6c00',
    dunkel: css.getPropertyValue('--primary-dark').trim() || '#c24f00',
    schrift: css.getPropertyValue('--navy').trim() || '#1d1330',
  }
}

export const KATEGORIEN = [
  { id: 'woerter', pfad: 'M4 19.5V6a2 2 0 0 1 2-2h11v13H6a2 2 0 0 0-2 2.5zM6 17h13v3H6M9 8h5', symbol: '📚', titel: 'Wortschatz', einheit: ['Wort', 'Wörter'], ziele: [10, 50, 100, 250, 500, 1000] },
  { id: 'texte', pfad: 'M12 6.5C10 5 7 4.5 3 5v13c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5zM12 6.5V19', symbol: '📖', titel: 'Leseratte', einheit: ['Text gelesen', 'Texte gelesen'], ziele: [1, 10, 25, 50, 100, 250] },
  { id: 'saetze', pfad: 'M4 5h16v11H9l-5 4V5zM8 9h8M8 12h5', symbol: '💬', titel: 'Satzbauer', einheit: ['Satz', 'Sätze'], ziele: [10, 50, 100, 250, 500, 1000] },
  { id: 'lektionen', pfad: 'M2 9l10-5 10 5-10 5L2 9zM6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6', symbol: '🎓', titel: 'Lernweg', einheit: ['Lektion', 'Lektionen'], ziele: [1, 10, 25, 50, 100, 150] },
  { id: 'streak', pfad: 'M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.5 1 2.5 2 3 0-3 0-5.5 1-8.5z', symbol: '🔥', titel: 'Dranbleiben', einheit: ['Tag in Folge', 'Tage in Folge'], ziele: [3, 7, 14, 30, 100, 365] },
  { id: 'wiederholungen', pfad: 'M4 12a8 8 0 0 1 14-5.3M20 4v4h-4M20 12a8 8 0 0 1-14 5.3M4 20v-4h4', symbol: '🧠', titel: 'Gedächtnis', einheit: ['Wiederholung', 'Wiederholungen'], ziele: [10, 100, 250, 500, 1000, 5000] },
]

function einheit(k, n) {
  return n === 1 ? k.einheit[0] : k.einheit[1]
}

/** Wie weit ist eine Kategorie? Erreichte Stufen + naechstes Ziel. */
function standVon(k, wert) {
  const erreicht = k.ziele.filter((z) => wert >= z).length
  const naechstes = k.ziele[erreicht] ?? null
  const vorher = erreicht ? k.ziele[erreicht - 1] : 0
  const anteil = naechstes ? (wert - vorher) / (naechstes - vorher) : 1
  return { erreicht, naechstes, anteil: Math.max(0, Math.min(1, anteil)) }
}

/** Das Abzeichen als Bild – fuer Story/WhatsApp. */
async function baueBild({ k, stufe, ziel, app, adresse }) {
  const c = document.createElement('canvas')
  c.width = 1080
  c.height = 1350
  const g = c.getContext('2d')

  const { marke, dunkel, schrift } = markenFarben()

  // Hintergrund: hell, mit Markenfarbe als weichem Schein
  g.fillStyle = '#ffffff'
  g.fillRect(0, 0, 1080, 1350)
  const gl = g.createRadialGradient(540, 560, 60, 540, 560, 620)
  gl.addColorStop(0, marke + '33')
  gl.addColorStop(1, marke + '00')
  g.fillStyle = gl
  g.fillRect(0, 0, 1080, 1350)

  // Medaille: abgerundete Kachel wie das App-Logo
  const anteil = 0.35 + (stufe / 5) * 0.65
  g.save()
  g.globalAlpha = anteil
  const mg = g.createLinearGradient(340, 360, 740, 760)
  mg.addColorStop(0, marke)
  mg.addColorStop(1, dunkel)
  g.fillStyle = mg
  g.beginPath()
  g.roundRect(340, 360, 400, 400, 110)
  g.fill()
  g.restore()
  if (stufe === 5) {
    g.lineWidth = 16
    g.strokeStyle = '#ffc800'
    g.beginPath()
    g.roundRect(326, 346, 428, 428, 120)
    g.stroke()
  }

  // Linien-Symbol in Weiss
  g.save()
  g.translate(540 - 120, 560 - 120)
  g.scale(10, 10)
  g.strokeStyle = '#fff'
  g.lineWidth = 2
  g.lineCap = 'round'
  g.lineJoin = 'round'
  g.stroke(new Path2D(k.pfad))
  g.restore()

  g.textAlign = 'center'
  g.textBaseline = 'middle'

  // Texte
  g.fillStyle = marke
  g.font = '800 44px system-ui, sans-serif'
  g.fillText(STUFEN[stufe].name.toUpperCase() + ' · ' + k.titel.toUpperCase(), 540, 900)
  g.fillStyle = schrift
  g.font = '900 120px system-ui, sans-serif'
  g.fillText(ziel.toLocaleString('de-DE'), 540, 1020)
  g.font = '700 54px system-ui, sans-serif'
  g.fillText(einheit(k, ziel), 540, 1110)
  g.fillStyle = '#8a7f99'
  g.font = '600 40px system-ui, sans-serif'
  g.fillText(`Gelernt mit ${app} · ${adresse}`, 540, 1250)

  return new Promise((ok) => c.toBlob(ok, 'image/png'))
}

async function teilen(daten) {
  const text = `${STUFEN[daten.stufe].name}-Meilenstein: ${daten.ziel.toLocaleString('de-DE')} ${einheit(daten.k, daten.ziel)} mit ${daten.app}! ${daten.adresse}`
  try {
    const blob = await baueBild(daten)
    const datei = new File([blob], `meilenstein-${daten.k.id}-${daten.ziel}.png`, { type: 'image/png' })
    if (navigator.canShare?.({ files: [datei] })) {
      await navigator.share({ files: [datei], text })
      return 'geteilt'
    }
    if (navigator.share) {
      await navigator.share({ text, url: 'https://' + daten.adresse })
      return 'geteilt'
    }
    // Rueckfall Computer: Bild herunterladen
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = datei.name
    a.click()
    return 'geladen'
  } catch (f) {
    if (f?.name === 'AbortError') return null
    await navigator.clipboard?.writeText(text).catch(() => {})
    return 'kopiert'
  }
}

/**
 * @param {object} werte – { woerter, texte, saetze, lektionen, streak, wiederholungen }
 * @param {string} app – "Habloo" / "Davaigo"
 * @param {string} adresse – "habloo.de"
 */
export default function Meilensteine({ werte, app, adresse }) {
  const [offen, setOffen] = useState(null) // { k, stufe, ziel }
  const [meldung, setMeldung] = useState('')

  const gesamt = KATEGORIEN.reduce((s, k) => s + standVon(k, werte[k.id] ?? 0).erreicht, 0)
  const moeglich = KATEGORIEN.reduce((s, k) => s + k.ziele.length, 0)

  async function los() {
    setMeldung('')
    const r = await teilen({ ...offen, app, adresse })
    if (r === 'kopiert') setMeldung('Text kopiert – füg ihn ein, wo du willst.')
    if (r === 'geladen') setMeldung('Bild gespeichert.')
  }

  return (
    <section className="start-karte meilensteine">
      <div className="ms-kopf">
        <h2 className="start-abschnitt">Meilensteine</h2>
        <span className="ms-zaehler">
          {gesamt}/{moeglich}
        </span>
      </div>

      <div className="ms-liste">
        {KATEGORIEN.map((k) => {
          const wert = werte[k.id] ?? 0
          const st = standVon(k, wert)
          return (
            <div key={k.id} className="ms-kategorie">
              <div className="ms-zeile">
                <span className="ms-symbol"><Symbol k={k} /></span>
                <div className="ms-info">
                  <b>{k.titel}</b>
                  <span>
                    {wert.toLocaleString('de-DE')} {einheit(k, wert)}
                    {st.naechstes && <> · nächstes Ziel {st.naechstes.toLocaleString('de-DE')}</>}
                  </span>
                  <span className="ms-balken">
                    <span style={{ width: st.anteil * 100 + '%' }} />
                  </span>
                </div>
              </div>

              <div className="ms-abzeichen">
                {k.ziele.map((ziel, i) => {
                  const da = i < st.erreicht
                  return (
                    <button
                      key={ziel}
                      type="button"
                      className={'ms-medaille' + (da ? ' ist-da ms-stufe-' + i : '')}
                      disabled={!da}
                      onClick={() => { setMeldung(''); setOffen({ k, stufe: i, ziel }) }}
                      aria-label={`${STUFEN[i].name}: ${ziel} ${einheit(k, ziel)}${da ? '' : ' (noch gesperrt)'}`}
                    >
                      <span className="ms-medaille-symbol">
                        {da ? (
                          <Symbol k={k} groesse={18} />
                        ) : (
                          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                            <path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="ms-medaille-zahl">{ziel >= 1000 ? ziel / 1000 + 'k' : ziel}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {offen && (
        <div className="ms-schicht" onClick={() => setOffen(null)}>
          <div className="ms-dialog" onClick={(e) => e.stopPropagation()}>
            <div className={'ms-gross ms-stufe-' + offen.stufe}>
              <Symbol k={offen.k} groesse={60} />
            </div>
            <p className="ms-stufe">{STUFEN[offen.stufe].name} · {offen.k.titel}</p>
            <h3 className="ms-ziel">
              {offen.ziel.toLocaleString('de-DE')} {einheit(offen.k, offen.ziel)}
            </h3>
            <p className="ms-lob">Stark! Diesen Meilenstein hast du dir verdient.</p>
            <button type="button" className="btn ms-teilen" onClick={los}>
              Teilen
            </button>
            <button type="button" className="btn-plain ms-zu" onClick={() => setOffen(null)}>
              Schließen
            </button>
            {meldung && <p className="ms-meldung">{meldung}</p>}
          </div>
        </div>
      )}
    </section>
  )
}
