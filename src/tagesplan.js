import { heute } from './datum.js'
// Der Tagesplan: aus allem, was ansteht, eine überschaubare Session bauen.
//
// Das Problem ohne ihn: Wer 88 fällige Vokabeln sieht, sieht einen
// vollen Posteingang und schiebt ihn auf. Wer "10 Vokabeln, eine
// Lektion, ein Video – zusammen 12 Minuten" sieht, fängt an.
//
// Der Plan begrenzt deshalb bewusst. Die restlichen fälligen Wörter
// verschwinden nicht, sie sind nur nicht die Aufgabe für jetzt.

// Wie viel in eine Session passt, ohne zu erschlagen
const WOERTER_PRO_SESSION = 10
const MAX_WOERTER = 15 // auch bei riesigem Rückstand nicht mehr

// Erfahrungswerte für die Zeitschätzung (in Sekunden)
const SEK_PRO_WORT = 8
const SEK_PRO_LEKTION = 240
const SEK_PRO_VIDEO = 180

/**
 * Baut den Plan für heute.
 *
 * @param {object} daten
 * @param {number} daten.faellig       – wie viele Vokabeln fällig sind
 * @param {object|null} daten.lektion  – die nächste offene Lektion
 * @param {number} daten.woerter       – Wörter insgesamt in der Sammlung
 * @param {boolean} daten.videoOffen   – gibt es ein angefangenes Video?
 * @returns {{schritte: object[], minuten: number, rest: number, fertig: boolean}}
 */
export function tagesplan({ faellig = 0, lektion = null, woerter = 0, videoOffen = false }) {
  const schritte = []

  // 1. Wiederholen kommt zuerst – vergessene Wörter sind teurer als
  //    neue. Aber gedeckelt, damit der Berg nicht abschreckt.
  const zuUeben = Math.min(faellig, faellig > 40 ? MAX_WOERTER : WOERTER_PRO_SESSION)
  if (zuUeben > 0) {
    schritte.push({
      art: 'wiederholen',
      anzahl: zuUeben,
      titel: `${zuUeben} Vokabeln wiederholen`,
      hinweis: faellig > zuUeben ? `von ${faellig} fälligen` : 'alle fälligen',
      ziel: 'trainer',
      sekunden: zuUeben * SEK_PRO_WORT,
    })
  }

  // 2. Eine Lektion bringt neue Struktur rein
  if (lektion) {
    schritte.push({
      art: 'lektion',
      titel: `Lektion „${lektion.titel}“`,
      hinweis: 'weitermachen',
      ziel: 'lektionen',
      sekunden: SEK_PRO_LEKTION,
    })
  }

  // 3. Etwas Echtes zum Abschluss – das ist der Grund, warum jemand
  //    Habloo statt einer reinen Karteikarten-App nimmt.
  schritte.push({
    art: 'video',
    titel: videoOffen ? 'Video weiterschauen' : 'Ein kurzes Video ansehen',
    hinweis: woerter > 0 ? 'neue Wörter sammeln' : 'mit echten Inhalten lernen',
    ziel: 'videos',
    sekunden: SEK_PRO_VIDEO,
  })

  const sekunden = schritte.reduce((s, x) => s + x.sekunden, 0)

  return {
    schritte,
    minuten: Math.max(1, Math.round(sekunden / 60)),
    rest: Math.max(0, faellig - zuUeben),
    fertig: false,
  }
}

/**
 * Wie weit ist der Plan heute schon abgearbeitet?
 * Wird im localStorage vermerkt und beginnt jeden Tag neu.
 */


export function planStand() {
  try {
    const g = JSON.parse(localStorage.getItem('tagesplan')) ?? {}
    if (g.tag !== heute()) return { tag: heute(), erledigt: [] }
    return { tag: heute(), erledigt: g.erledigt ?? [] }
  } catch {
    return { tag: heute(), erledigt: [] }
  }
}

/** Einen Schritt als erledigt vermerken. */
export function hakeAb(art) {
  const stand = planStand()
  if (!stand.erledigt.includes(art)) stand.erledigt.push(art)
  localStorage.setItem('tagesplan', JSON.stringify(stand))
  return stand.erledigt
}
