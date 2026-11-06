/**
 * Der Abspann im Profil: wer die App gebaut hat.
 *
 * Klarwerk-v3-Marke (drei abgerundete Parallelogramme, #4f5bff) und
 * Wortmarke „klarwerk“ in Kleinbuchstaben – wie auf klarwerk-digital.com.
 * Ein schlichter Link nach außen; die Stores erlauben das, solange
 * darüber nichts innerhalb der App verkauft wird.
 */
export default function KlarwerkAbspann({ zeile, unter }) {
  return (
    <a className="kw-abspann" href="https://klarwerk-digital.com" target="_blank" rel="noopener noreferrer">
      <span className="kw-zeile">{zeile}</span>
      <span className="kw-logo">
        <svg viewBox="0 0 64 64" width="26" height="26" aria-hidden="true">
          <path d="M8 14 q0-4 4-4 l14 6 q3 1.5 3 5 v30 q0 4-4 4 l-14-6 q-3-1.5-3-5z" fill="#4f5bff" />
          <path d="M33 26 l19-13 q4-2.5 4 2 v13 q0 3-2.5 4.5 L36 41 q-3 2-3-1.5z" fill="#4f5bff" />
          <path d="M33 44 l17 8 q3 1.5 3 5 v-14 q0-4-4-3 l-16 7z" fill="#4f5bff" />
        </svg>
        <b>klarwerk</b>
      </span>
      <small>{unter}</small>
    </a>
  )
}
