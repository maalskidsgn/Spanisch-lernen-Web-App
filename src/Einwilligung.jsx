import { useState, useEffect } from 'react'
import { einwilligungsStand, messungMoeglich, setzeEinwilligung, messungFortsetzen } from './messung.js'

/**
 * Der Einwilligungs-Hinweis für die Reichweitenmessung.
 *
 * Er ist die Bedingung dafür, dass Google Analytics überhaupt laufen
 * darf (§ 25 TTDSG). Ohne ihn dürfte gar nicht gemessen werden.
 *
 * Der Text ist BEWUSST der Standardtext, den jeder schon hundertmal
 * gesehen hat. Ein eigener, gesprächiger Ton wäre hier ein Fehler:
 * Was ungewohnt klingt, wird gelesen – und wer liest, zögert. Ein
 * Cookie-Hinweis soll aber nicht überzeugen, sondern erkannt und
 * weggeklickt werden. Die Aufmerksamkeit gehört der App, nicht dem
 * Banner.
 *
 * Was NICHT 0815 sein darf: Beide Knöpfe bleiben gleich groß und
 * gleich auffällig. Das kleine graue "Ablehnen" neben dem großen
 * grünen "Alle akzeptieren", das man von überall kennt, ist keine
 * freiwillige Entscheidung – und damit keine wirksame Einwilligung.
 * Genau dafür gibt es die Abmahnungen.
 *
 * Vorher läuft nichts: Solange hier nicht geklickt wurde, ist kein
 * Google-Skript geladen und kein Cookie gesetzt. Nachgemessen am
 * 23.08. – vor dem Klick keine Anfrage, nach dem Klick genau eine.
 *
 * Seit 23.08. verlinkt der Text auf die Datenschutzerklärung – die
 * gehört dort hin, damit die Einwilligung informiert erfolgt.
 */
export default function Einwilligung({ onRecht }) {
  const [zeigen, setZeigen] = useState(false)

  useEffect(() => {
    // Wo gar nicht gemessen wird (Store-App, localhost, Vorschau),
    // gibt es auch nichts zu fragen.
    if (!messungMoeglich()) return
    const stand = einwilligungsStand()
    if (stand === 'ja') messungFortsetzen()
    else if (stand === null) setZeigen(true)
  }, [])

  if (!zeigen) return null

  function entscheide(ja) {
    setzeEinwilligung(ja)
    setZeigen(false)
  }

  return (
    <div className="ew" role="dialog" aria-label="Hinweis zur Reichweitenmessung">
      <div className="ew-karte">
        <p className="ew-titel">Wir verwenden Cookies</p>
        <p className="ew-text">
          Diese Website verwendet Cookies und ähnliche Technologien, um die Nutzung
          zu analysieren und unser Angebot zu verbessern. Einzelheiten stehen in
          der <button className="ew-link" onClick={() => onRecht('datenschutz')}>
          Datenschutzerklärung</button>. Du kannst deine Auswahl jederzeit unter
          „Mehr" ändern.
        </p>
        <div className="ew-knoepfe">
          <button className="ew-knopf" onClick={() => entscheide(false)}>
            Ablehnen
          </button>
          <button className="ew-knopf" onClick={() => entscheide(true)}>
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  )
}
