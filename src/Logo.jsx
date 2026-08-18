/**
 * Das Habloo-Zeichen: eine Sprechblase mit einem Funken darin.
 *
 * Die Sprechblase steht fürs Sprechen und Lernen, der Funke für die
 * KI, die dabei hilft. Als Zeichnung statt als Schriftzeichen, damit
 * es auf jedem Gerät gleich aussieht.
 *
 * @param {string} klasse – zusätzliche CSS-Klasse für die Größe
 */
export default function Logo({ klasse = '' }) {
  return (
    <span className={'logo-badge ' + klasse}>
      <svg viewBox="0 0 44 44" aria-hidden="true" focusable="false">
        {/* Sprechblase mit Spitze unten links */}
        <path
          d="M8 5h28a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H19l-8 7v-7H8a6 6 0 0 1-6-6V11a6 6 0 0 1 6-6z"
          fill="currentColor"
        />
        {/* Vierzackiger Funke – das Zeichen für KI */}
        <path
          d="M22 9.5c1 4 2.1 5.1 6.1 6.1-4 1-5.1 2.1-6.1 6.1-1-4-2.1-5.1-6.1-6.1 4-1 5.1-2.1 6.1-6.1z"
          fill="var(--primary)"
        />
        <circle cx="32.5" cy="12" r="2.1" fill="var(--primary-light, #ff9a40)" />
      </svg>
    </span>
  )
}
