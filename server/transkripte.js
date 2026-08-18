/**
 * Transkripte über TubeAlfred beziehen.
 *
 * Hintergrund: yt-dlp funktioniert auf einem privaten Anschluss gut,
 * vom Server aus lehnt YouTube die Anfragen aber ab
 * ("Sign in to confirm you're not a bot"). TubeAlfred kümmert sich um
 * dieses Problem und liefert die Untertitel als fertige Liste.
 *
 * Der Dienst wird nur befragt, wenn das Video nicht in der eigenen
 * Bibliothek liegt – jeder Abruf kostet ein Guthaben.
 */

const BASIS = 'https://api.tubealfred.com/v1/youtube'

/** Ist ein Schlüssel hinterlegt? */
export function tubeAlfredBereit() {
  return Boolean(process.env.TUBEALFRED_API_KEY)
}

/**
 * Holt das spanische Transkript zu einem Video.
 *
 * @param {string} videoId – die 11-stellige YouTube-Kennung
 * @returns {Promise<{videoId, title, lines}>} im Format der App:
 *   lines = [{ text, start, end }] mit Sekunden
 */
export async function holeTranskript(videoId) {
  const schluessel = process.env.TUBEALFRED_API_KEY
  if (!schluessel) throw new Error('Kein TubeAlfred-Schlüssel hinterlegt.')

  const adresse =
    `${BASIS}/video/${videoId}/transcript` +
    // Spanisch bevorzugen; automatische Untertitel sind auch in Ordnung
    `?language=es&kind=any`

  const antwort = await fetch(adresse, {
    headers: { Authorization: `Bearer ${schluessel}` },
  })

  if (!antwort.ok) {
    if (antwort.status === 401) throw new Error('Der TubeAlfred-Schlüssel wird nicht akzeptiert.')
    if (antwort.status === 402 || antwort.status === 429) {
      throw new Error('Das Transkript-Guthaben ist aufgebraucht.')
    }
    if (antwort.status === 404) {
      throw new Error('Für dieses Video gibt es keine spanischen Untertitel.')
    }
    throw new Error(`Transkript-Dienst antwortet mit ${antwort.status}.`)
  }

  const { data } = await antwort.json()
  const segmente = data?.transcript ?? []

  if (!segmente.length) {
    throw new Error('Für dieses Video gibt es keine spanischen Untertitel.')
  }

  // Den Titel liefert der Transkript-Abruf nicht mit. Statt dafür ein
  // zweites Guthaben auszugeben, fragen wir YouTubes oEmbed-Dienst –
  // der ist kostenlos und auch von Servern aus erreichbar.
  const titel = data.title || (await holeTitel(videoId)) || 'Video'

  return {
    videoId,
    title: titel,
    // Der Dienst liefert Millisekunden als Zeichenkette – die App rechnet in Sekunden
    lines: segmente
      .map((s) => ({
        text: (s.text ?? '').replace(/\s+/g, ' ').trim(),
        start: Number(s.start_ms ?? 0) / 1000,
        end: Number(s.end_ms ?? 0) / 1000,
      }))
      .filter((z) => z.text),
  }
}

/** Holt nur den Titel – über YouTubes kostenlosen oEmbed-Dienst. */
async function holeTitel(videoId) {
  try {
    const antwort = await fetch(
      'https://www.youtube.com/oembed?format=json&url=' +
        encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)
    )
    if (!antwort.ok) return null
    return (await antwort.json()).title ?? null
  } catch {
    return null
  }
}

/** Titel und Eckdaten eines Videos (für die Anzeige). */
export async function holeVideoDaten(videoId) {
  const schluessel = process.env.TUBEALFRED_API_KEY
  if (!schluessel) return null

  try {
    const antwort = await fetch(`${BASIS}/video/${videoId}`, {
      headers: { Authorization: `Bearer ${schluessel}` },
    })
    if (!antwort.ok) return null
    const { data } = await antwort.json()
    return { titel: data?.title ?? null, kanal: data?.channel?.name ?? null }
  } catch {
    return null
  }
}
