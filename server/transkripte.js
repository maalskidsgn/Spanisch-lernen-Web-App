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

  // kind=auto liefert die HOCHGELADENEN Untertitel, wenn es welche
  // gibt, und sonst die automatischen. Genau das wollen wir – und
  // zwar in EINEM Aufruf, denn jeder kostet ein Guthaben.
  //
  // Ich hatte hier kurzzeitig "standard" stehen, ein Wert, den es
  // gar nicht gibt (gueltig sind auto, manual, asr). Der Dienst
  // antwortete daraufhin mit 404 und keine Songs liessen sich mehr
  // oeffnen.
  const adresse =
    `${BASIS}/video/${videoId}/transcript?language=es&kind=auto`

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
    // 5xx heisst: der Dienst selbst hat eine Stoerung. Das Kennzeichen
    // erlaubt der App, weitere sinnlose Versuche gleich zu sparen.
    const fehler = new Error(`Transkript-Dienst antwortet mit ${antwort.status}.`)
    if (antwort.status >= 500) fehler.stoerung = true
    throw fehler
  }

  const { data } = await antwort.json()
  return { ...(await formeErgebnis(data, videoId)), automatisch: false }
}

/**
 * Bringt die Antwort des Dienstes in die Form, die die App erwartet.
 * Wird von beiden Wegen genutzt – manuelle und automatische Untertitel.
 */
async function formeErgebnis(data, videoId) {
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


/**
 * Legt ein neu geholtes Video in der Bibliothek ab.
 *
 * Der Sinn: Jedes Video kostet nur beim allerersten Mal ein Guthaben.
 * Danach liest es die App aus der Datenbank – für alle Nutzer.
 */
export async function merkeInBibliothek(videoId, titel, zeilen, kategorie = 'gefunden') {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return

  try {
    const antwort = await fetch(`${url}/rest/v1/videos?on_conflict=youtube_id`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        youtube_id: videoId,
        titel,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        niveau: 'B1',
        // "musik" für Songs, sonst "gefunden" – so bleiben die
        // Bereiche in der Mediathek sauber getrennt
        kategorie,
        transkript: zeilen.map((z) => ({
          text: z.text,
          start: z.start,
          dauer: Math.max(0, z.end - z.start),
        })),
      }),
    })
    if (!antwort.ok) {
      console.error('Video nicht gespeichert:', (await antwort.text()).slice(0, 150))
    }
  } catch (fehler) {
    // Nicht schlimm: der Nutzer bekommt sein Transkript trotzdem
    console.error('Video nicht gespeichert:', fehler.message)
  }
}

/**
 * Liegt dieses Video schon mit Transkript in unserer Datenbank?
 *
 * Muss VOR dem Bezahl-Dienst gefragt werden: Jeder Abruf dort
 * kostet ein Guthaben – auch für ein Video, das wir längst haben.
 * Die App prüft das zwar schon selbst, aber der Server darf sich
 * darauf nicht verlassen; er ist die Stelle, die das Geld ausgibt.
 */
export async function ausBibliothek(videoId) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null

  try {
    const antwort = await fetch(
      `${url}/rest/v1/videos?youtube_id=eq.${encodeURIComponent(videoId)}` +
        `&select=youtube_id,titel,transkript&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    )
    if (!antwort.ok) return null

    const [treffer] = await antwort.json()
    if (!treffer?.transkript?.length) return null

    return {
      videoId: treffer.youtube_id,
      title: treffer.titel,
      lines: treffer.transkript.map((z) => ({
        text: z.text,
        start: z.start,
        end: z.start + (z.dauer ?? 0),
      })),
      ausDatenbank: true,
    }
  } catch {
    return null
  }
}
