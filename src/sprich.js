// Liest einen Text mit der spanischen Stimme des Geräts vor.
// Kostet nichts, funktioniert offline – die Stimme kommt vom
// Betriebssystem.
//
// Warum hier ausgewählt statt dem Browser überlassen? Ein Gerät hat
// oft ein Dutzend spanische Stimmen, darunter Apples Scherzstimmen
// (Grandma, Grandpa, Rocko, Bubbles). Ohne Auswahl nimmt der Browser
// irgendeine davon – und der Nutzer lernt Aussprache von einer
// Karikatur. Deshalb suchen wir bewusst die beste und bleiben
// dann dabei.

// Bekannte gute Ansagestimmen, in dieser Reihenfolge bevorzugt.
// Mónica ist die Standard-Spanierin auf Apple-Geräten, Helena und
// Laura sind die Gegenstücke auf Windows und Android.
const GUTE = ['mónica', 'monica', 'helena', 'laura', 'elvira', 'sabina', 'paulina']

// Apples Scherz- und Effektstimmen. Sie melden sich als vollwertige
// spanische Stimmen, klingen aber verstellt.
const SCHERZ = /grandma|grandpa|rocko|flo|eddy|shelley|sandy|reed|bubbles|bells|boing|jester|organ|superstar|trinoids|whisper|wobble|zarvox|albert|bad news|good news/i

let gewaehlt // einmal gesucht, dann gemerkt

function besteStimme() {
  if (gewaehlt !== undefined) return gewaehlt

  const alle = speechSynthesis.getVoices()
  if (!alle.length) return undefined // Liste noch nicht geladen – später erneut

  const spanisch = alle.filter(
    (s) => s.lang?.toLowerCase().startsWith('es') && !SCHERZ.test(s.name)
  )
  if (!spanisch.length) return (gewaehlt = null)

  const punkte = (s) => {
    const name = s.name.toLowerCase()
    let p = 0
    const rang = GUTE.findIndex((g) => name.includes(g))
    if (rang >= 0) p += 100 - rang          // eine bekannt gute Stimme
    if (s.lang.toLowerCase().startsWith('es-es')) p += 20 // Spanien passt zum Kurs
    if (s.localService) p += 5              // lokal = kein Netz nötig
    return p
  }

  return (gewaehlt = [...spanisch].sort((a, b) => punkte(b) - punkte(a))[0])
}

// Die Stimmenliste lädt in manchen Browsern erst verzögert nach.
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.addEventListener?.('voiceschanged', () => {
    gewaehlt = undefined // neu bewerten, jetzt mit vollständiger Liste
  })
}

/** Welche Stimme spricht gerade? Für Anzeige und Diagnose. */
export function gewaehlteStimme() {
  const s = besteStimme()
  return s ? `${s.name} (${s.lang})` : null
}

export function sprich(text) {
  try {
    const u = new SpeechSynthesisUtterance(text)
    const stimme = besteStimme()
    if (stimme) u.voice = stimme
    u.lang = stimme?.lang ?? 'es-ES'
    u.rate = 0.85 // etwas langsamer, damit man gut mithört
    speechSynthesis.cancel() // falls noch etwas anderes spricht
    speechSynthesis.speak(u)
  } catch {
    // kein Ton verfügbar – halb so wild
  }
}
