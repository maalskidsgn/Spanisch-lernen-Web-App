// Das Freemium-Modell: Im kostenlosen Modus gibt es eine begrenzte Anzahl
// KI-Generierungen. Die Nutzung wird im Browser gezählt.
// Arten: 'videoGen' (Vokabeln aus Video) und 'listeGen' (Themen-Listen).

export const FREE_LIMIT = 10

export function nutzung() {
  try {
    return { videoGen: 0, listeGen: 0, ...JSON.parse(localStorage.getItem('nutzung')) }
  } catch {
    return { videoGen: 0, listeGen: 0 }
  }
}

// Eine Nutzung verbuchen (nach erfolgreicher Generierung aufrufen)
export function zaehleNutzung(art) {
  const n = nutzung()
  n[art] = (n[art] || 0) + 1
  localStorage.setItem('nutzung', JSON.stringify(n))
  return n[art]
}

// Wie viele kostenlose Generierungen sind noch übrig?
export function verbleibend(art) {
  return Math.max(0, FREE_LIMIT - (nutzung()[art] || 0))
}
