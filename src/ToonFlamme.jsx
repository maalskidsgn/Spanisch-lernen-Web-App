/**
 * Die Streak-Flamme im Toon-Stil (06.11.): zwei Orangetöne, gelber
 * Kern, weißer Glanzstrich. `weiss` macht daraus die helle Variante
 * für farbige Sticker und Kalenderkacheln.
 */
export default function ToonFlamme({ klasse = '', weiss = false }) {
  const [a, b, kern] = weiss ? ['#fff', '#ffe6d1', '#ffd34d'] : ['#ff7a12', '#e85d00', '#ffd34d']
  return (
    <svg className={'toon-flamme ' + klasse} viewBox="0 0 40 48" aria-hidden="true">
      <path d="M20 2C24 12 34 16 34 30a14 14 0 0 1-28 0c0-7 4-11 7-14 0 5 2 8 5 8-2-8 0-16 3-22z" fill={a} />
      <path d="M20 2C24 12 34 16 34 30a14 14 0 0 1-14 14z" fill={b} />
      <path d="M20 22c3 5 7 7 7 12a7 7 0 0 1-14 0c0-4 3-6 4-9 1 3 2 4 3 4 0-3-1-5 0-7z" fill={kern} />
      {!weiss && <path d="M12 24q1-5 4-8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".75" />}
    </svg>
  )
}
