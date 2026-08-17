import { APP_NAME } from './App.jsx'

/**
 * Startseite für alle, die noch nicht angemeldet sind.
 *
 * Ohne Konto gibt es keinen Zugriff auf die App – von hier führen
 * zwei Wege weiter: "Jetzt starten" (Konto anlegen) oder "Anmelden".
 */
export default function Willkommen({ onStarten, onAnmelden }) {
  return (
    <div className="willkommen">
      {/* weiche Farbwolken im Hintergrund */}
      <span className="wk-wolke wk-wolke-1" />
      <span className="wk-wolke wk-wolke-2" />

      <div className="wk-inhalt">
        <div className="wk-marke">
          <span className="logo-badge wk-badge">¡</span>
          <span className="wk-name">{APP_NAME}</span>
        </div>

        <h1 className="wk-titel">
          Spanisch lernen mit dem,<br />
          was du <span className="accent">sowieso schaust</span>
        </h1>

        <p className="wk-text">
          Echte Videos mit mitlaufenden Untertiteln, ein Vokabeltrainer, der
          sich merkt, wann du wiederholen musst – und Lektionen vom ersten
          „Hola" an.
        </p>

        <div className="wk-punkte">
          <span className="wk-punkt">🎬 Videos mit Karaoke-Text</span>
          <span className="wk-punkt">🃏 Vokabeltrainer</span>
          <span className="wk-punkt">🎓 Geführte Lektionen</span>
          <span className="wk-punkt">🎮 Mini-Spiele</span>
        </div>

        <div className="wk-knoepfe">
          <button className="btn wk-start" onClick={onStarten}>
            Jetzt starten – kostenlos
          </button>
          <button className="btn-outline wk-anmelden" onClick={onAnmelden}>
            Ich habe schon ein Konto
          </button>
        </div>

        <p className="wk-fuss">
          Dein Fortschritt wird gesichert und steht auf allen Geräten bereit.
        </p>
      </div>
    </div>
  )
}
