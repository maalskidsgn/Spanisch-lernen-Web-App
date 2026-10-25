import { useState } from 'react'

// Meilensteine: Abzeichen für gesammelte Wörter, gelesene Texte usw.
// Jede Kategorie hat Stufen – Bronze bis Diamant. Ein erreichtes
// Abzeichen laesst sich als Bild teilen (Story, WhatsApp, …).

const STUFEN = [
  { name: 'Bronze', farbe: ['#e3a26f', '#b8693a'] },
  { name: 'Silber', farbe: ['#dfe4ea', '#9aa5b1'] },
  { name: 'Gold', farbe: ['#ffd45c', '#e59b00'] },
  { name: 'Platin', farbe: ['#9be7e0', '#3aa6a0'] },
  { name: 'Diamant', farbe: ['#c9b6ff', '#6d4aff'] },
  { name: 'Legende', farbe: ['#ff9bd2', '#e0337f'] },
]

export const KATEGORIEN = [
  { id: 'woerter', symbol: '📚', titel: 'Wortschatz', einheit: ['Wort', 'Wörter'], ziele: [10, 50, 100, 250, 500, 1000] },
  { id: 'texte', symbol: '📖', titel: 'Leseratte', einheit: ['Text gelesen', 'Texte gelesen'], ziele: [1, 10, 25, 50, 100, 250] },
  { id: 'saetze', symbol: '💬', titel: 'Satzbauer', einheit: ['Satz', 'Sätze'], ziele: [10, 50, 100, 250, 500, 1000] },
  { id: 'lektionen', symbol: '🎓', titel: 'Lernweg', einheit: ['Lektion', 'Lektionen'], ziele: [1, 10, 25, 50, 100, 150] },
  { id: 'streak', symbol: '🔥', titel: 'Dranbleiben', einheit: ['Tag in Folge', 'Tage in Folge'], ziele: [3, 7, 14, 30, 100, 365] },
  { id: 'wiederholungen', symbol: '🧠', titel: 'Gedächtnis', einheit: ['Wiederholung', 'Wiederholungen'], ziele: [10, 100, 250, 500, 1000, 5000] },
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
  const marke = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#ff6c00'

  // Hintergrund
  const hg = g.createLinearGradient(0, 0, 1080, 1350)
  hg.addColorStop(0, '#fffaf4')
  hg.addColorStop(1, '#f3ecff')
  g.fillStyle = hg
  g.fillRect(0, 0, 1080, 1350)

  // Leuchten hinter der Medaille
  const gl = g.createRadialGradient(540, 560, 40, 540, 560, 460)
  gl.addColorStop(0, STUFEN[stufe].farbe[0] + 'aa')
  gl.addColorStop(1, 'transparent')
  g.fillStyle = gl
  g.fillRect(0, 0, 1080, 1350)

  // Medaille
  const [hell, dunkel] = STUFEN[stufe].farbe
  const mg = g.createLinearGradient(540, 340, 540, 780)
  mg.addColorStop(0, hell)
  mg.addColorStop(1, dunkel)
  g.fillStyle = mg
  g.beginPath()
  for (let i = 0; i < 6; i++) {
    const w = (Math.PI / 3) * i - Math.PI / 2
    const x = 540 + Math.cos(w) * 240
    const y = 560 + Math.sin(w) * 240
    i ? g.lineTo(x, y) : g.moveTo(x, y)
  }
  g.closePath()
  g.fill()
  g.lineWidth = 18
  g.strokeStyle = 'rgba(255,255,255,.55)'
  g.stroke()

  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = '200px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'
  g.fillText(k.symbol, 540, 575)

  // Texte
  g.fillStyle = marke
  g.font = '800 44px system-ui, sans-serif'
  g.fillText(STUFEN[stufe].name.toUpperCase() + ' · ' + k.titel.toUpperCase(), 540, 900)
  g.fillStyle = '#1d1330'
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
  const text = `🏅 ${STUFEN[daten.stufe].name}-Meilenstein: ${daten.ziel.toLocaleString('de-DE')} ${einheit(daten.k, daten.ziel)} mit ${daten.app}! ${daten.adresse}`
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
                <span className="ms-symbol" aria-hidden="true">{k.symbol}</span>
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
                  const [hell, dunkel] = STUFEN[i].farbe
                  return (
                    <button
                      key={ziel}
                      type="button"
                      className={'ms-medaille' + (da ? ' ist-da' : '')}
                      style={da ? { background: `linear-gradient(160deg, ${hell}, ${dunkel})` } : undefined}
                      disabled={!da}
                      onClick={() => { setMeldung(''); setOffen({ k, stufe: i, ziel }) }}
                      aria-label={`${STUFEN[i].name}: ${ziel} ${einheit(k, ziel)}${da ? '' : ' (noch gesperrt)'}`}
                    >
                      <span className="ms-medaille-symbol">{da ? k.symbol : '🔒'}</span>
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
            <div
              className="ms-gross"
              style={{ background: `linear-gradient(160deg, ${STUFEN[offen.stufe].farbe[0]}, ${STUFEN[offen.stufe].farbe[1]})` }}
            >
              <span>{offen.k.symbol}</span>
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
