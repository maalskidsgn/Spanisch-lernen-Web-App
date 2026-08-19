// Der wöchentliche Gruppenunterricht.
//
// Der Videoanbieter steht bewusst NUR hier – als eine Adresse. Ob
// dahinter Zoom, Meet, Jitsi oder Daily steckt, ändert sonst nichts
// an der App. Der eigentliche Inhalt dieser Datei ist die Frage
// "wann ist der nächste Termin und darf ich rein?", und die bleibt
// bei jedem Anbieter gleich.

export const UNTERRICHT = {
  lehrerin: 'Yulibeth',
  wochentag: 4, // 0 = Sonntag, 4 = Donnerstag
  stunde: 19,
  minute: 0,
  dauerMinuten: 60,
  // Wie lange vorher der Beitreten-Knopf aufgeht. Fünf Minuten wären
  // hektisch, eine Stunde weckt falsche Erwartungen.
  vorlaufMinuten: 15,
  raum: import.meta.env.VITE_UNTERRICHT_URL || '',
}

const MINUTE = 60_000

/**
 * Wann ist der nächste Termin?
 *
 * Läuft die Stunde gerade, geben wir DIESEN Termin zurück, nicht den
 * der Folgewoche – sonst stünde während des Unterrichts "nächster
 * Termin in 7 Tagen" auf dem Bildschirm.
 */
export function naechsterTermin(jetzt = new Date()) {
  const termin = new Date(jetzt)
  termin.setHours(UNTERRICHT.stunde, UNTERRICHT.minute, 0, 0)

  const tageHin = (UNTERRICHT.wochentag - termin.getDay() + 7) % 7
  termin.setDate(termin.getDate() + tageHin)

  // Termin heute, aber schon vorbei? Dann die nächste Woche.
  // "<=" statt "<": Genau im Endmoment ist die Stunde vorbei. Mit "<"
  // hielt die App den gerade beendeten Termin fest und lud zum
  // Beitreten ein – "gleich, in 0 Min." um Punkt 20:00.
  const ende = termin.getTime() + UNTERRICHT.dauerMinuten * MINUTE
  if (ende <= jetzt.getTime()) termin.setDate(termin.getDate() + 7)

  return termin
}

/** Läuft die Stunde gerade oder steht sie unmittelbar bevor? */
export function stand(jetzt = new Date()) {
  const termin = naechsterTermin(jetzt)
  const beginn = termin.getTime()
  const ende = beginn + UNTERRICHT.dauerMinuten * MINUTE
  const t = jetzt.getTime()

  if (t >= beginn && t < ende) {
    return { zustand: 'laeuft', termin, endetIn: ende - t }
  }
  if (t >= beginn - UNTERRICHT.vorlaufMinuten * MINUTE) {
    return { zustand: 'gleich', termin, beginntIn: beginn - t }
  }
  return { zustand: 'wartet', termin, beginntIn: beginn - t }
}

/** "in 2 Tagen", "in 3 Std.", "in 12 Min." – kurz und ohne Sekunden. */
export function restzeit(millisekunden) {
  const minuten = Math.max(0, Math.round(millisekunden / MINUTE))
  if (minuten < 60) return `in ${minuten} Min.`
  const stunden = Math.round(minuten / 60)
  if (stunden < 24) return `in ${stunden} Std.`
  const tage = Math.round(stunden / 24)
  return tage === 1 ? 'morgen' : `in ${tage} Tagen`
}

/** "Donnerstag, 19:00 Uhr" */
export function terminText(termin) {
  return termin.toLocaleDateString('de-DE', {
    weekday: 'long', hour: '2-digit', minute: '2-digit',
  }) + ' Uhr'
}
