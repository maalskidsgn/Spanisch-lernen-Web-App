/**
 * Kleine Toon-Bilder für die Themen-Chips der Generatoren (06.11.).
 * Gesucht wird über den deutschen Wert, den englischen Namen oder den
 * Schlüssel – was der jeweilige Generator gerade in der Hand hat.
 */
const B = {
  restaurant: '<ellipse cx="20" cy="25" rx="15" ry="6" fill="#e6e0d8"/><ellipse cx="20" cy="23" rx="15" ry="6" fill="#fff"/><ellipse cx="20" cy="22" rx="8" ry="3" fill="#ffc43d"/><path d="M7 5v11M4 5v6q0 3 3 3t3-3V5" stroke="#2e3192" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
  reisen: '<rect x="9" y="12" width="22" height="20" rx="5" fill="#2e3192"/><rect x="9" y="12" width="22" height="16" rx="5" fill="#7d8bff"/><path d="M15 12V8h10v4" stroke="#2e3192" stroke-width="2.6" fill="none"/><rect x="13" y="18" width="14" height="3" rx="1.5" fill="#fff" opacity=".6"/>',
  arbeit: '<rect x="7" y="14" width="26" height="18" rx="5" fill="#8a4b1f"/><rect x="7" y="14" width="26" height="14" rx="5" fill="#c97a3d"/><path d="M15 14v-4h10v4" stroke="#8a4b1f" stroke-width="2.6" fill="none"/><rect x="18" y="20" width="4" height="4" rx="1" fill="#ffd34d"/>',
  einkaufen: '<path d="M9 14h22l-2 18H11z" fill="#ffd34d"/><path d="M20 14h11l-2 18H20z" fill="#f2b500"/><path d="M14 16v-4a6 6 0 0 1 12 0v4" stroke="#2e3192" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
  familie: '<path d="M5 20L20 7l15 13z" fill="#ff5a6a"/><rect x="10" y="18" width="20" height="15" rx="2" fill="#fff"/><rect x="10" y="29" width="20" height="4" rx="2" fill="#e6e0d8"/><rect x="17" y="23" width="6" height="10" rx="1.5" fill="#ff7a12"/>',
  gesundheit: '<path d="M20 33s-13-7-13-16a7 7 0 0 1 13-4 7 7 0 0 1 13 4c0 9-13 16-13 16z" fill="#ff5a6a"/><path d="M20 33s13-7 13-16a7 7 0 0 0-13-4z" fill="#e0384a"/><path d="M20 15v10M15 20h10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
  natur: '<path d="M20 34V18" stroke="#8a4b1f" stroke-width="3" stroke-linecap="round"/><path d="M20 22C8 22 6 10 8 5c8 0 14 6 12 17z" fill="#5fd38a"/><path d="M20 22c10 0 13-9 12-14-7 0-12 5-12 14z" fill="#2f9a5f"/>',
  wissenschaft: '<path d="M15 6h10M17 6v10L8 31a3 3 0 0 0 3 4h18a3 3 0 0 0 3-4l-9-15V6" fill="#e9e3ff" stroke="#2e3192" stroke-width="2.2" stroke-linejoin="round"/><path d="M11 26h18l3 5a3 3 0 0 1-3 4H11a3 3 0 0 1-3-4z" fill="#4fd1b5"/><circle cx="18" cy="22" r="1.8" fill="#4fd1b5"/>',
  geschichte: '<rect x="7" y="31" width="26" height="4" rx="1.5" fill="#c9b8a6"/><path d="M8 13L20 5l12 8z" fill="#e6dccf"/><rect x="10" y="14" width="4" height="17" fill="#f3ece4"/><rect x="18" y="14" width="4" height="17" fill="#f3ece4"/><rect x="26" y="14" width="4" height="17" fill="#f3ece4"/><path d="M8 13L20 5l12 8z" fill="none" stroke="#c9b8a6" stroke-width="1.5"/>',
  koerper: '<rect x="15" y="5" width="10" height="30" rx="5" fill="#ff7aa2"/><rect x="5" y="15" width="30" height="10" rx="5" fill="#ff7aa2"/><rect x="15" y="5" width="5" height="30" rx="2.5" fill="#fff" opacity=".25"/>',
  weltall: '<circle cx="20" cy="20" r="11" fill="#7d8bff"/><path d="M20 9a11 11 0 0 1 0 22z" fill="#5d6af0"/><ellipse cx="20" cy="21" rx="18" ry="5" fill="none" stroke="#ffc43d" stroke-width="2.6" transform="rotate(-18 20 21)"/><circle cx="16" cy="16" r="2.4" fill="#fff" opacity=".5"/>',
  kultur: '<path d="M20 5C10 5 5 12 5 19c0 7 5 12 11 12 3 0 3-3 2-5s0-4 3-4h5c5 0 9-3 9-8C35 9 28 5 20 5z" fill="#ffd9a8"/><circle cx="13" cy="15" r="2.6" fill="#ff5a6a"/><circle cx="20" cy="11" r="2.6" fill="#7d8bff"/><circle cx="27" cy="14" r="2.6" fill="#5fd38a"/><circle cx="12" cy="22" r="2.6" fill="#ffc43d"/>',
  laender: '<circle cx="20" cy="20" r="14" fill="#4fd1b5"/><path d="M11 12c4 0 6 3 5 6s3 4 2 8-4 4-5 2-4-4-5-8 0-6 3-8zM24 8c3 2 2 5 5 6s4 5 2 8c-3 0-4-3-6-4s-3-6-1-10z" fill="#5fd38a"/><path d="M20 6a14 14 0 0 1 0 28z" fill="#000" opacity=".08"/>',
  alltag: '<path d="M8 15h20v10a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8z" fill="#ff7a12"/><path d="M28 18h3a4 4 0 0 1 0 8h-3" stroke="#ff7a12" stroke-width="3" fill="none"/><path d="M14 5q-2 3 0 6M20 4q-2 3 0 7" stroke="#c9b8a6" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="8" y="15" width="20" height="4" fill="#fff" opacity=".3"/>',
}
const NAMEN = {
  restaurant: 'restaurant', reisen: 'reisen', travel: 'reisen', arbeit: 'arbeit', work: 'arbeit',
  einkaufen: 'einkaufen', shopping: 'einkaufen', familie: 'familie', family: 'familie',
  gesundheit: 'gesundheit', health: 'gesundheit',
}

export default function ThemaBild({ name }) {
  const s = String(name ?? '').toLowerCase()
  const html = B[NAMEN[s] ?? s]
  if (!html) return null
  return <svg className="thema-bild" viewBox="0 0 40 40" aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />
}
