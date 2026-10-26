// Lernverlauf geräteübergreifend: Kalender (aktivitaet) und
// Lernkurve (lernkurve) lagen früher NUR im Browser des jeweiligen
// Geräts. Auf dem iPad fehlte deshalb alles, was am Handy gelernt
// wurde. Jetzt reisen beide mit dem Konto mit – gespeichert in der
// JSON-Spalte statistik.ki_nutzung (unter "verlauf"), damit keine
// Datenbank-Änderung nötig war.
//
// Zusammenführen: je Tag und Feld gewinnt der HÖHERE Wert. So geht
// nichts verloren, egal auf welchem Gerät zuletzt gelernt wurde.

const SCHLUESSEL = { aktivitaet: 'aktivitaet', lernkurve: 'lernkurve' }

function lies(name) {
  try {
    return JSON.parse(localStorage.getItem(SCHLUESSEL[name])) ?? {}
  } catch {
    return {}
  }
}

/** Kalender-Eintrag in eine einheitliche Form bringen (alt: nur Zahl). */
function alsObjekt(eintrag) {
  if (typeof eintrag === 'number') return { l: 0, w: eintrag }
  return eintrag && typeof eintrag === 'object' ? eintrag : {}
}

function vereineTage(a = {}, b = {}, normal = (x) => x ?? {}) {
  const aus = {}
  for (const tag of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = normal(a[tag])
    const y = normal(b[tag])
    const tagAus = {}
    for (const feld of new Set([...Object.keys(x), ...Object.keys(y)])) {
      tagAus[feld] = Math.max(Number(x[feld]) || 0, Number(y[feld]) || 0)
    }
    aus[tag] = tagAus
  }
  return aus
}

/** Der Verlauf dieses Geräts. */
export function lokalerVerlauf() {
  return { aktivitaet: lies('aktivitaet'), lernkurve: lies('lernkurve') }
}

/** Zwei Verläufe zusammenlegen – der höhere Wert je Tag gewinnt. */
export function vereineVerlauf(a = {}, b = {}) {
  return {
    aktivitaet: vereineTage(a.aktivitaet, b.aktivitaet, alsObjekt),
    lernkurve: vereineTage(a.lernkurve, b.lernkurve),
  }
}

/** Einen Verlauf auf diesem Gerät übernehmen und die Anzeige auffrischen. */
export function uebernimmVerlauf(v) {
  if (!v) return
  localStorage.setItem(SCHLUESSEL.aktivitaet, JSON.stringify(v.aktivitaet ?? {}))
  localStorage.setItem(SCHLUESSEL.lernkurve, JSON.stringify(v.lernkurve ?? {}))
  window.dispatchEvent(new Event('lernkurve'))
  window.dispatchEvent(new Event('aktivitaet'))
}
