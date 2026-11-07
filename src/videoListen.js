/**
 * Eigene Video-Listen (06.11.). Eine Liste ist schlicht die Kategorie
 * der gemerkten Videos – hier liegen zusätzlich die Namen, die man
 * angelegt hat, bevor ein Video darin liegt. Sonst verschwände eine
 * frisch angelegte, noch leere Liste sofort wieder.
 */
const SCHLUESSEL = 'video-listen'

export function ladeListen() {
  try {
    return JSON.parse(localStorage.getItem(SCHLUESSEL)) ?? []
  } catch {
    return []
  }
}

export function neueListe(name) {
  const liste = ladeListen()
  if (name && !liste.includes(name)) {
    liste.push(name)
    try {
      localStorage.setItem(SCHLUESSEL, JSON.stringify(liste))
    } catch {
      /* dann gilt sie nur für diese Sitzung */
    }
  }
  return liste
}
