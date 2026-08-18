// Kleiner Server, der das Transkript (Untertitel) eines YouTube-Videos holt.
// Er benutzt dafür das Programm "yt-dlp" (per Homebrew installiert), weil das
// zuverlässig an die YouTube-Untertitel kommt.
import express from 'express'
import { execFile } from 'child_process'
import { mkdtemp, readFile, readdir, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import Anthropic from '@anthropic-ai/sdk'
import {
  holeTranskript as holeUeberDienst,
  tubeAlfredBereit,
  merkeInBibliothek,
} from './transkripte.js'
import {
  erzeugeEbook,
  nutzerAusToken,
  anzahlDiesenMonat,
  speichereEbook,
  FREI_PRO_MONAT,
  erzeugeVokabelliste,
  erzeugeVideoVokabeln,
} from './ebooks.js'

// Beim lokalen Entwickeln die Zugangsdaten aus .env.local einlesen.
// In der Produktion (Coolify/Docker) kommen sie als echte Umgebungsvariablen.
try {
  const { readFileSync } = await import('fs')
  const datei = new URL('../.env.local', import.meta.url)
  for (const zeile of readFileSync(datei, 'utf8').split('\n')) {
    const treffer = zeile.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (treffer && !process.env[treffer[1]]) {
      process.env[treffer[1]] = treffer[2].trim()
    }
  }
} catch {
  // Keine .env.local vorhanden – das ist im Betrieb der Normalfall.
}

const app = express()
app.use(express.json({ limit: '2mb' }))
const PORT = process.env.PORT || 8787

// CORS: erlaubt dem Frontend (andere Domain, z.B. Vercel), diesen Server
// anzusprechen. Ohne diese Kopfzeilen blockt der Browser solche Anfragen.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// Gesundheits-Check: damit sieht das Hosting, dass der Server lebt
app.get('/health', (req, res) => res.json({ ok: true }))

// Claude-KI nur nutzen, wenn ein API-Schlüssel hinterlegt ist —
// sonst arbeitet der Vokabelgenerator mit Häufigkeits-Analyse + Übersetzung.
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null

// Holt aus einer YouTube-URL die Video-ID (der Teil nach "v=" oder hinter youtu.be/)
function extractVideoId(url) {
  const patterns = [
    /(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

// Führt yt-dlp aus und gibt die Ausgabe zurück (als Promise, damit man "await" nutzen kann)
function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    execFile('yt-dlp', args, { timeout: 60000 }, (err, stdout, stderr) => {
      if (err) {
        // Besser: YouTube-Blockade erkennen und verständlich erklären
        if (stderr?.includes('Sign in to confirm you\'re not a bot') || stderr?.includes('429')) {
          reject(new Error('YouTube hat diese Anfrage blockiert (zu viele Zugriffe von diesem Server). Das ist bei Rechenzentrums-IPs häufig. Lokal (auf der Mac) funktioniert es.'))
        } else {
          reject(new Error(stderr || err.message))
        }
      } else {
        resolve(stdout)
      }
    })
  })
}

app.get('/api/transcript', async (req, res) => {
  const videoId = extractVideoId(req.query.url || '')
  if (!videoId) {
    return res.status(400).json({ error: 'Das sieht nicht wie ein YouTube-Link aus.' })
  }

  // Temporärer Ordner für die Untertitel-Datei
  const dir = await mkdtemp(join(tmpdir(), 'subs-'))
  try {
    // Titel des Videos holen
    const title = (
      await runYtDlp(['--skip-download', '--print', 'title', `https://www.youtube.com/watch?v=${videoId}`])
    ).trim()

    // Untertitel herunterladen: erst echte spanische, sonst automatische
    await runYtDlp([
      '--skip-download',
      '--write-subs',
      '--write-auto-subs',
      '--sub-langs', 'es,es-ES,es-419,es-US',
      '--sub-format', 'json3',
      '-o', join(dir, 'subs.%(ext)s'),
      `https://www.youtube.com/watch?v=${videoId}`,
    ])

    const files = (await readdir(dir)).filter((f) => f.endsWith('.json3'))
    if (files.length === 0) {
      return res.status(404).json({ error: 'Für dieses Video gibt es leider keine spanischen Untertitel.' })
    }

    const captionData = JSON.parse(await readFile(join(dir, files[0]), 'utf8'))

    // YouTube liefert "events" mit Startzeit, Dauer und Text-Schnipseln
    const lines = (captionData.events || [])
      .filter((ev) => ev.segs)
      .map((ev) => ({
        text: ev.segs.map((s) => s.utf8).join('').replace(/\n/g, ' ').trim(),
        start: ev.tStartMs / 1000,
        end: (ev.tStartMs + (ev.dDurationMs || 0)) / 1000,
      }))
      .filter((l) => l.text)

    res.json({ videoId, title, lines })
  } catch (err) {
    // yt-dlp scheitert auf Servern regelmäßig an YouTubes Bot-Sperre.
    // Dann übernimmt TubeAlfred – das kostet ein Guthaben, deshalb
    // wird es bewusst erst hier versucht.
    if (tubeAlfredBereit()) {
      try {
        console.log('yt-dlp blockiert, frage TubeAlfred:', videoId)
        const ergebnis = await holeUeberDienst(videoId)
        // Gleich in die Bibliothek legen: so kostet dieses Video
        // nie wieder ein Guthaben – auch nicht bei anderen Nutzern
        merkeInBibliothek(videoId, ergebnis.title, ergebnis.lines)
        return res.json(ergebnis)
      } catch (dienstFehler) {
        console.error('TubeAlfred:', dienstFehler.message)
        return res.status(502).json({ error: dienstFehler.message })
      }
    }
    console.error(err.message)
    res.status(500).json({ error: 'Transkript konnte nicht geladen werden: ' + err.message })
  } finally {
    // Temporären Ordner wieder aufräumen
    rm(dir, { recursive: true, force: true }).catch(() => {})
  }
})

// Übersetzt ein spanisches Wort ins Deutsche über die Google-Übersetzung.
// (Die vorher genutzte MyMemory-API lieferte teils falsche/vulgäre Einträge,
// weil dort jeder Übersetzungen eintragen kann.)
app.get('/api/translate', async (req, res) => {
  const word = (req.query.q || '').trim()
  if (!word) return res.status(400).json({ error: 'Kein Wort angegeben.' })
  try {
    const r = await fetch(
      'https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=de&dt=t&q=' +
        encodeURIComponent(word)
    )
    const data = await r.json()
    // Die Antwort ist verschachtelt: data[0] enthält die Übersetzungs-Stücke
    const translation = (data?.[0] || [])
      .map((part) => part?.[0] || '')
      .join('')
      .trim()
    if (!translation) throw new Error('Leere Antwort')
    res.json({ translation })
  } catch (err) {
    console.error('Übersetzung fehlgeschlagen:', err.message)
    res.status(502).json({ error: 'Übersetzung fehlgeschlagen' })
  }
})

// Prüft, ob ein Video in fremde Seiten eingebettet werden darf.
// Manche Kanäle verbieten das – dann antwortet YouTubes oEmbed-Dienst
// mit einem Fehler, und wir sortieren das Video aus.
async function istEinbettbar(videoId) {
  try {
    const r = await fetch(
      'https://www.youtube.com/oembed?format=json&url=' +
        encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)
    )
    return r.ok
  } catch {
    return true // Netzwerkproblem? Dann im Zweifel nicht wegfiltern.
  }
}

// Sucht Videos auf YouTube (über yt-dlp, ohne API-Schlüssel).
// Nicht-einbettbare Videos werden direkt herausgefiltert.
// Wie ein Niveau die Suche beeinflusst.
// YouTube kennt keine Sprachniveaus – wir steuern über Suchwörter und
// Videolänge. Für Anfänger sucht man gezielt nach langsam gesprochenen
// Lernvideos, für Fortgeschrittene nach echten Podcasts und Gesprächen.
// Die Zusätze sind bewusst knapp gehalten: zu viele Schlagwörter
// verschieben das Thema (z. B. führte "lento" zu Meditationsvideos).
const NIVEAU_SUCHE = {
  A1: { zusatz: 'explicado fácil', maxSek: 900 },
  A2: { zusatz: 'explicado sencillo', maxSek: 1200 },
  B1: { zusatz: 'explicado', maxSek: 1800 },
  B2: { zusatz: '', maxSek: 2700 },
  C1: { zusatz: 'podcast', maxSek: 4500 },
  C2: { zusatz: 'podcast análisis', maxSek: 7200 },
}

// Die drei Längen zur Auswahl (in Sekunden)
const LAENGEN = {
  kurz: { min: 240, max: 660 },     // ~5–10 Minuten
  mittel: { min: 600, max: 960 },   // ~10–15 Minuten
  lang: { min: 900, max: 7200 },    // über 15 Minuten
}

app.get('/api/search', async (req, res) => {
  const q = (req.query.q || '').trim()
  const niveau = NIVEAU_SUCHE[req.query.niveau] ? req.query.niveau : null
  const laenge = LAENGEN[req.query.laenge] ?? null
  // Bei der Songsuche wollen wir Musik statt Erklärvideos
  const nurMusik = req.query.nurMusik === '1'
  if (!q) return res.status(400).json({ error: 'Kein Suchbegriff.' })
  try {
    // Deutsche Eingabe ins Spanische übersetzen, damit auch spanische
    // Videos gefunden werden ("gesunde Ernährung" -> "alimentación saludable").
    // Steht dort schon Spanisches, ändert die Übersetzung praktisch nichts.
    let suchbegriff = q
    try {
      const r = await fetch(
        'https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=es&dt=t&q=' +
          encodeURIComponent(q)
      )
      const d = await r.json()
      const spanisch = (d?.[0] || []).map((teil) => teil?.[0] || '').join('').trim()
      if (spanisch) suchbegriff = spanisch
    } catch {
      // Klappt die Übersetzung nicht, wird eben im Original gesucht
    }

    // Beim Niveau helfen zusätzliche Suchwörter: "para principiantes"
    // findet andere Videos als "podcast debate".
    if (niveau && NIVEAU_SUCHE[niveau].zusatz) {
      suchbegriff += ' ' + NIVEAU_SUCHE[niveau].zusatz
    }

    // Songsuche: "letra" (Songtext) findet die Fassungen mit
    // eingeblendetem Text – genau die, bei denen auch Untertitel
    // vorhanden sind und die sich zum Mitlesen eignen.
    if (nurMusik) suchbegriff = `${suchbegriff} canción letra español`

    // Großzügig suchen: Einbettbarkeit, Länge und Niveau sieben kräftig aus
    const out = await runYtDlp([
      `ytsearch25:${suchbegriff}`,
      '--flat-playlist',
      '-J',
      '--no-warnings',
    ])
    const data = JSON.parse(out)
    const alle = (data.entries || [])
      .filter((e) => e.id && e.title)
      // Nach gewünschter Länge sieben; ohne Auswahl gilt nur die
      // Obergrenze des Niveaus, damit nichts Endloses dabei ist
      .filter((e) => {
        const dauer = e.duration || 0
        // Songs sind kurz: alles über 10 Minuten ist eher ein Mix
        if (nurMusik) return dauer >= 60 && dauer <= 600
        if (laenge) return dauer >= laenge.min && dauer <= laenge.max
        if (niveau) return dauer > 0 && dauer <= NIVEAU_SUCHE[niveau].maxSek
        return true
      })
      .map((e) => ({
        videoId: e.id,
        title: e.title,
        channel: e.channel || e.uploader || '',
        duration: e.duration || 0,
        thumbnail: `https://i.ytimg.com/vi/${e.id}/mqdefault.jpg`,
      }))

    // Alle parallel prüfen und nur einbettbare behalten
    const checks = await Promise.all(alle.map((v) => istEinbettbar(v.videoId)))
    const results = alle.filter((_, i) => checks[i]).slice(0, 10)

    res.json({ results })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: 'Suche fehlgeschlagen.' })
  }
})

// Die häufigsten spanischen Füllwörter, die kein Lernender einzeln üben muss
const STOPWORDS = new Set(
  `el la los las un una unos unas de del a al en y o u que qué no sí se su sus le les lo me te nos os mi mis tu tus yo tú él ella ellos ellas usted ustedes nosotros es son era eran fue fueron ser estar está están estaba estaban con por para como cuando donde dónde pero más muy ya también todo toda todos todas otro otra este esta esto ese esa eso aquel aquella hay ha he has hemos han si porque entonces así cada uno dos tres bien sin sobre hasta desde entre e ni les nada algo alguien nunca siempre ahora aquí allí ay oh eh`.split(/\s+/)
)

// Erstellt Vokabel-Vorschläge aus einem Transkript.
// Mit ANTHROPIC_API_KEY: Claude wählt die nützlichsten Wörter aus.
// Ohne: Häufigkeits-Analyse + automatische Übersetzung.
app.post('/api/generate-vocab', async (req, res) => {
  const text = (req.body.text || '').slice(0, 8000)
  // "exclude" sind die Wörter, die der Nutzer schon gesammelt hat
  const bekannt = Array.isArray(req.body.exclude) ? req.body.exclude : []
  if (!text.trim()) return res.status(400).json({ error: 'Kein Text übergeben.' })

  try {
    const vokabeln = await erzeugeVideoVokabeln(text, bekannt)
    res.json({ quelle: 'ki', vokabeln })
  } catch (err) {
    console.error('Video-Vokabeln:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Übersetzt viele Transkript-Zeilen auf einmal ins Deutsche.
// Trick: 25 Zeilen pro Anfrage mit Zeilenumbrüchen verbinden – kommt die
// Antwort nicht sauber zeilenweise zurück, übersetzen wir einzeln nach.
async function uebersetzeText(text) {
  const r = await fetch(
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=de&dt=t&q=' +
      encodeURIComponent(text)
  )
  const d = await r.json()
  return (d?.[0] || []).map((p) => p?.[0] || '').join('')
}

app.post('/api/translate-batch', async (req, res) => {
  const lines = Array.isArray(req.body.lines) ? req.body.lines.slice(0, 500) : []
  if (lines.length === 0) return res.status(400).json({ error: 'Keine Zeilen übergeben.' })

  try {
    const uebersetzungen = []
    const CHUNK = 25
    for (let i = 0; i < lines.length; i += CHUNK) {
      const teil = lines.slice(i, i + CHUNK)
      const ergebnis = await uebersetzeText(teil.join('\n'))
      const zeilen = ergebnis.split('\n')
      if (zeilen.length === teil.length) {
        uebersetzungen.push(...zeilen.map((z) => z.trim()))
      } else {
        // Notlösung: dieses Paket Zeile für Zeile übersetzen
        for (const zeile of teil) {
          uebersetzungen.push((await uebersetzeText(zeile)).trim())
        }
      }
    }
    res.json({ uebersetzungen })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: 'Übersetzung fehlgeschlagen.' })
  }
})

// Erstellt eine Vokabelliste zu einem frei gewählten Thema (nur mit KI).
app.post('/api/vokabelliste', async (req, res) => {
  const thema = (req.body.thema || '').trim().slice(0, 80)
  // Die schon gesammelten Wörter: verhindern Dopplungen und verraten
  // dem Modell, auf welchem Stand die Person ist.
  const bekannt = Array.isArray(req.body.bekannt) ? req.body.bekannt : []

  // Ohne Thema wählt die KI selbst – dafür braucht sie aber Wörter,
  // an denen sie sich orientieren kann.
  if (!thema && bekannt.length < 5) {
    return res.status(400).json({
      error: 'Sammle erst ein paar Wörter, dann kann ich dir passende Vorschläge machen.',
    })
  }

  try {
    const ergebnis = await erzeugeVokabelliste(thema, bekannt)
    res.json(ergebnis)
  } catch (err) {
    console.error('Vokabelliste:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Erstellt eine Blinkist-artige Buchzusammenfassung in einfachem Spanisch.
// Braucht die Claude-KI – ohne API-Schlüssel kommt ein "Premium"-Hinweis.
app.post('/api/buch', async (req, res) => {
  const titel = (req.body.titel || '').trim().slice(0, 120)
  if (!titel) return res.status(400).json({ error: 'Kein Buchtitel angegeben.' })
  if (!anthropic) return res.status(402).json({ error: 'premium' })

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-5',
      max_tokens: 16000,
      output_config: {
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: {
              titel: { type: 'string' },
              autor: { type: 'string' },
              niveau: { type: 'string' },
              absaetze: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    es: { type: 'string' },
                    de: { type: 'string' },
                  },
                  required: ['es', 'de'],
                  additionalProperties: false,
                },
              },
              vokabeln: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    wort: { type: 'string' },
                    uebersetzung: { type: 'string' },
                  },
                  required: ['wort', 'uebersetzung'],
                  additionalProperties: false,
                },
              },
            },
            required: ['titel', 'autor', 'niveau', 'absaetze', 'vokabeln'],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: 'user',
          content:
            `Erstelle eine Blinkist-artige Zusammenfassung des Buches "${titel}" für deutschsprachige Spanisch-Anfänger (Niveau A2): ` +
            '5 bis 7 kurze Absätze in EINFACHEM Spanisch (kurze Sätze, Grundwortschatz), jeder Absatz mit deutscher Übersetzung. ' +
            'Dazu 8 nützliche spanische Vokabeln aus der Zusammenfassung mit deutscher Übersetzung. ' +
            'Kennst du das Buch nicht sicher, sage das im ersten Absatz ehrlich und fasse zusammen, wofür der Titel bekannt ist.',
        },
      ],
    })
    const textBlock = response.content.find((b) => b.type === 'text')
    res.json(JSON.parse(textBlock.text))
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: 'Zusammenfassung konnte nicht erstellt werden.' })
  }
})

// ============================================================
//  Bilinguale E-Books
// ============================================================

// Wie viele Bücher darf der Nutzer diesen Monat noch erzeugen?
app.get('/api/ebook/kontingent', async (req, res) => {
  try {
    const nutzer = await nutzerAusToken(req.headers.authorization?.replace('Bearer ', ''))
    if (!nutzer) return res.status(401).json({ error: 'Bitte zuerst anmelden.' })

    const genutzt = await anzahlDiesenMonat(nutzer.id)
    res.json({ genutzt, frei: Math.max(0, FREI_PRO_MONAT - genutzt), gesamt: FREI_PRO_MONAT })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: 'Kontingent konnte nicht geprüft werden.' })
  }
})

// Ein neues E-Book erzeugen
app.post('/api/ebook', async (req, res) => {
  const thema = (req.body?.thema || '').trim()
  const niveau = req.body?.niveau || 'A2'

  if (!thema) return res.status(400).json({ error: 'Bitte gib ein Thema an.' })

  try {
    const nutzer = await nutzerAusToken(req.headers.authorization?.replace('Bearer ', ''))
    if (!nutzer) return res.status(401).json({ error: 'Bitte zuerst anmelden.' })

    // Freemium-Grenze prüfen
    const genutzt = await anzahlDiesenMonat(nutzer.id)
    if (genutzt >= FREI_PRO_MONAT) {
      return res.status(402).json({
        error: 'premium',
        nachricht:
          `Du hast diesen Monat schon ${FREI_PRO_MONAT} E-Books erstellt. ` +
          'Mit Premium sind es unbegrenzt viele.',
      })
    }

    const buch = await erzeugeEbook(thema, niveau)
    const gespeichert = await speichereEbook(nutzer.id, buch)

    res.json({ buch: gespeichert, frei: Math.max(0, FREI_PRO_MONAT - genutzt - 1) })
  } catch (err) {
    console.error('E-Book:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => console.log(`Transkript-Server läuft auf http://localhost:${PORT}`))
