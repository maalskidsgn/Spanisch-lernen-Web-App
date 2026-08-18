// Das Freemium-Modell für KI-Vokabellisten.
//
// Ein gemeinsames Tageskontingent für alle Wege, auf denen die KI
// Vokabeln erzeugt: Themen-Listen und Wörter aus einem Video. Zehn
// Listen am Tag – egal, wie sie zustande kommen. Am nächsten Tag
// füllt sich das Kontingent von selbst wieder auf.
//
// Bewusst nicht "zehn pro Video": Sonst könnte man beliebig viele
// Videos öffnen und das Kontingent wäre praktisch unbegrenzt.

export const LISTEN_PRO_TAG = 10

/** Heutiges Datum als Schlüssel, z. B. "2026-08-18". */
function heute() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Der Zählerstand von heute. Ist der gespeicherte Tag ein anderer,
 * beginnt automatisch ein neuer Tag bei null.
 */
export function nutzung() {
  try {
    const gespeichert = JSON.parse(localStorage.getItem('nutzung')) ?? {}
    if (gespeichert.tag !== heute()) return { tag: heute(), listen: 0 }
    return { tag: heute(), listen: gespeichert.listen ?? 0 }
  } catch {
    return { tag: heute(), listen: 0 }
  }
}

/** Eine Generierung verbuchen – nach erfolgreichem Abruf aufrufen. */
export function zaehleNutzung() {
  const stand = nutzung()
  stand.listen += 1
  localStorage.setItem('nutzung', JSON.stringify(stand))
  return stand.listen
}

/** Wie viele Listen sind heute noch übrig? */
export function verbleibend() {
  return Math.max(0, LISTEN_PRO_TAG - nutzung().listen)
}

/** Wann füllt sich das Kontingent wieder auf? Für die Anzeige. */
export function naechsteAuffuellung() {
  const morgen = new Date()
  morgen.setDate(morgen.getDate() + 1)
  morgen.setHours(0, 0, 0, 0)
  const stunden = Math.ceil((morgen - Date.now()) / 3600000)
  return stunden <= 1 ? 'in einer Stunde' : `in ${stunden} Stunden`
}

// Alte Namen, damit bestehender Code weiterläuft
export const FREE_LIMIT = LISTEN_PRO_TAG
