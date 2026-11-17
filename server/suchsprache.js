// Sprache der Suchtreffer prüfen (17.11.2026, Manuel: „in der YouTube-Suche sind englische
// Videos – das darf nicht sein“).
//
// Zwei Ursachen, zwei Mittel:
//  1. YouTube zeigt je nach Oberflächensprache ÜBERSETZTE Titel. Die Suche lief als
//     „englischer“ Besucher – viele spanische Videos trugen deshalb englische Titel.
//     Gesucht wird jetzt in einer neutralen Oberflächensprache (Isländisch,
//     SUCH_SPRACHE): Dann liefert YouTube die ORIGINAL-Titel.
//  2. Große englische Kanäle laden spanische Tonspuren hoch und landen so in der Suche.
//     Am Original-Titel erkennt man sie – und, wo YouTube sie meldet, an der Tonsprache.
export const ZIEL = 'es'
export const SUCH_SPRACHE = 'youtube:lang=is'

/** Tonsprache je Video laut YouTube („es“, „en-US“ …) – leere Map, wenn die Abfrage nicht möglich ist. */
export async function audioSprachen(ids) {
  const schluessel = process.env.YOUTUBE_API_KEY
  if (!schluessel || !ids.length) return new Map()
  try {
    const antwort = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids.slice(0, 50).join(',')}&key=${schluessel}`)
    if (!antwort.ok) return new Map()
    const daten = await antwort.json()
    if (daten.error) return new Map()
    return new Map((daten.items ?? []).map((v) => [v.id, String(v.snippet?.defaultAudioLanguage || '').toLowerCase()]).filter(([, s]) => s))
  } catch {
    return new Map()
  }
}

const SPANISCH = new Set(
  ('el la los las de del al que qué y en un una unos unas por para con sin como cómo es son está están mi mis tu tus su sus lo le se te me nos más muy pero porque cuando ' +
    'todo todos toda todas este esta esto estos estas ese esa eso hay ser hacer hago hace hacen voy vamos soy eres somos tengo tiene tienen puedo puede quiero ' +
    'yo tú él ella nosotros ustedes mejor mejores peor nuevo nueva nuevos nuevas gran grande bueno buena buenos buenas fácil fáciles rápido rápida día días año años vida casa ' +
    'receta recetas cocina cocinar comida historia programa capítulo parte oficial completo completa español española latino méxico mexicana argentina colombia ' +
    'aprende aprender curso clase clases principiantes canción letra música película serie noticias viaje ciudad mundo cosas cosa gente mujer hombre niños ' +
    'así ahora siempre nunca también aquí hoy ayer mañana desde hasta entre sobre contra según quién dónde cuánto').split(' ')
)
const ENGLISCH = new Set(
  ('the and of to in is are was were be been you your i my me we our they their it its this that these those for with from on at by an or not no do does did how what why when where who which ' +
    'can could will would should have has had get got make made making every into about out up down over just like more most best new one two first vs feat official video ' +
    'cooking cook recipe recipes easy fast day days life learn learning lesson lessons beginners song lyrics music movie full episode part things people world top tried trying').split(' ')
)

/**
 * Ist der (Original-)Titel spanisch? true / false – oder null, wenn er nichts verrät
 * (Eigennamen, Emojis). `suchwoerter`: die Wörter des ins Spanische übersetzten
 * Suchbegriffs – sie entscheiden nur, wenn der Titel sonst nichts hergibt
 * („COCINAR“ allein ist ein spanischer Treffer).
 */
export function istZielsprache(titel, suchwoerter = '') {
  const text = String(titel || '').toLowerCase()
  const woerter = text.match(/[a-záéíóúüñ]+/g) ?? []
  const gesucht = new Set((String(suchwoerter).toLowerCase().match(/[a-záéíóúüñ]{4,}/g) ?? []).filter((w) => !ENGLISCH.has(w)))
  let es = 0
  let en = 0
  let treffer = 0
  for (const w of woerter) {
    if (SPANISCH.has(w)) es++
    else if (ENGLISCH.has(w)) en++
    else if (gesucht.has(w)) treffer++
    if (/[áéíóúñ]/.test(w)) es++
  }
  if (/[¿¡]/.test(text)) es += 2
  if (es !== en) return es > en
  if (es === 0 && treffer > 0) return true
  return es === 0 ? null : false
}
