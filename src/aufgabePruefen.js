// Die Regeln, nach denen eine Baustein-Aufgabe gültig ist.
//
// Diese Datei benutzen ZWEI Seiten: der Prüfer vor dem Build
// (pruefe-bausteine.mjs) für die handgeschriebenen Aufgaben, und die
// App zur Laufzeit für die von der KI erzeugten.
//
// Das ist der ganze Punkt. Die handgeschriebenen Aufgaben sehe ich
// mir an, bevor sie jemand zu Gesicht bekommt – die von der KI nicht.
// Beide müssen deshalb durch dieselbe Prüfung, und dieselbe heißt:
// derselbe Code, nicht zweimal dieselbe Absicht.
//
// Darum stehen hier KEINE Browser-Befehle: Die Datei muss auch in
// Node laufen.

/** Ein Wort von seinen Satzzeichen befreien. */
function nurWort(wort) {
  return String(wort).replace(/[.,;:¿?¡!«»"'()]/g, '')
}

/** Die Wörter eines Satzes, ohne Satzzeichen. */
function woerter(satz) {
  return String(satz)
    .split(/\s+/)
    .map(nurWort)
    .filter(Boolean)
}

/**
 * Prüft eine einzelne Aufgabe.
 *
 * @returns {string|null} Der Grund für die Ablehnung – oder null,
 *   wenn die Aufgabe in Ordnung ist.
 */
export function pruefeAufgabe(a) {
  if (!a || typeof a !== 'object') return 'keine Aufgabe'
  if (!a.de) return 'die deutsche Bedeutung fehlt'

  if (a.typ === 'luecke') {
    if (!a.satz?.includes('___')) return 'im Satz fehlt die Lücke ___'
    if (!a.loesung) return 'die Lösung fehlt'
    // Eine Lücke, deren Lösung schon im Satz steht, ist keine Aufgabe
    if (a.loesung.length > 2 && a.satz.includes(a.loesung)) {
      return `die Lösung "${a.loesung}" steht schon im Satz`
    }
    return null
  }

  if (a.typ === 'wahl') {
    if (!a.satz?.includes('___')) return 'im Satz fehlt die Lücke ___'
    if (!Array.isArray(a.optionen) || a.optionen.length < 2) {
      return 'braucht mindestens zwei Optionen'
    }
    if (!a.optionen.includes(a.loesung)) {
      return `die Lösung "${a.loesung}" steht nicht unter den Optionen`
    }
    if (new Set(a.optionen).size !== a.optionen.length) {
      return 'eine Option kommt doppelt vor'
    }
    return null
  }

  if (a.typ === 'fehler') {
    if (!a.satz) return 'der Satz fehlt'
    if (!a.falsch || !a.richtig) return 'falsch oder richtig fehlt'
    if (a.falsch === a.richtig) return 'falsch und richtig sind identisch'
    // Die Verbesserung ist ein Wort, kein Kommentar
    if (/\s/.test(String(a.richtig).trim())) {
      return `"${a.richtig}" ist keine einzelne Verbesserung`
    }
    const treffer = woerter(a.satz).filter((w) => w === a.falsch).length
    if (treffer === 0) return `"${a.falsch}" steht so nicht als Wort im Satz`
    // Steht das gesuchte Wort zweimal da, weiss niemand, welches
    // gemeint ist – und die App kann die Antwort nicht bewerten.
    if (treffer > 1) return `"${a.falsch}" kommt ${treffer}× vor, das ist nicht eindeutig`
    return null
  }

  if (a.typ === 'bauen') {
    const teile = woerter(a.loesung ?? '')
    if (teile.length < 3) return 'zum Bauen braucht es mindestens drei Wörter'
    if (teile.length > 8) return `${teile.length} Wörter sind zu viele zum Sortieren`
    // Zweimal dasselbe Wort macht die Reihenfolge mehrdeutig
    if (new Set(teile.map((w) => w.toLowerCase())).size !== teile.length) {
      return 'ein Wort kommt doppelt vor, die Reihenfolge wäre nicht eindeutig'
    }
    return null
  }

  return `unbekannter Aufgabentyp "${a.typ}"`
}

/**
 * Siebt eine Liste von Aufgaben.
 *
 * Für die KI-Varianten: Was durchfällt, wird still verworfen. Der
 * Nutzer merkt nichts davon – er bekommt dann eben eine der
 * handgeschriebenen Aufgaben. Genau dafür gibt es sie.
 */
export function nurGueltige(aufgaben) {
  if (!Array.isArray(aufgaben)) return []
  return aufgaben.filter((a) => pruefeAufgabe(a) === null)
}
