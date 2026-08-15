// Liest einen Text mit der spanischen Computerstimme des Browsers vor.
// Kostet nichts und funktioniert offline – die Stimme kommt vom Betriebssystem.
export function sprich(text) {
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'es-ES'
    u.rate = 0.85 // etwas langsamer, damit man gut mithört
    speechSynthesis.cancel() // falls noch etwas anderes spricht
    speechSynthesis.speak(u)
  } catch {
    // kein Ton verfügbar – halb so wild
  }
}
