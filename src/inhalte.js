// Die fertigen Inhalte: Hörtexte (Podcasts) und Lesetexte (Bücher).
//
// Anders als Videos und Songs wird hier nichts erzeugt – die Texte
// stammen von spanisch-lernen.com und liegen im Supabase-Speicher.
// Sie kommen NICHT mit der App mit: Zusammen sind es über zwei
// Megabyte, die sonst jeder Nutzer beim ersten Aufruf lädt, auch
// wenn er nie einen Text öffnet.

const ABLAGE = 'https://okwegzwsjrxusmznohis.supabase.co/storage/v1/object/public'

export const ARTEN = {
  hoertexte: { titel: 'Hörtexte', einzahl: 'Hörtext' },
  // Die 89 importierten Buchzusammenfassungen. Sie hiessen frueher
  // "Lesetexte" – der Schluessel bleibt, weil er den Ablageort
  // bestimmt, nur die Beschriftung wurde umbenannt.
  lesetexte: { titel: 'Ebooks', einzahl: 'Ebook' },
}

// Einmal geholt, für die Sitzung gemerkt – das Verzeichnis ändert
// sich nicht, während jemand die App benutzt.
const gemerkt = new Map()

async function hole(pfad) {
  if (gemerkt.has(pfad)) return gemerkt.get(pfad)
  const versprechen = fetch(`${ABLAGE}/${pfad}`).then((r) => {
    if (!r.ok) throw new Error('Inhalt nicht erreichbar (' + r.status + ')')
    return r.json()
  })
  // Das Versprechen selbst merken, nicht erst das Ergebnis: Sonst
  // laufen zwei gleichzeitige Aufrufe zweimal übers Netz.
  gemerkt.set(pfad, versprechen)
  versprechen.catch(() => gemerkt.delete(pfad))
  return versprechen
}

export function holeVerzeichnis(art) {
  return hole(`${art}/index.json`)
}

export function holeInhalt(art, slug) {
  return hole(`${art}/${slug}.json`)
}

/**
 * Wie lange liest man daran? Rund 130 Wörter je Minute – bewusst
 * langsamer als die üblichen 200, weil hier in einer Fremdsprache
 * gelesen wird.
 */
export function lesedauer(zeichen) {
  return Math.max(1, Math.round(zeichen / 5.5 / 130))
}

/**
 * Hebt die Lernvokabeln in einem Absatz hervor.
 *
 * Gibt Stücke zurück statt HTML: So kann die Anzeige jedes Wort
 * antippbar machen, ohne dass wir fremden Text als Markup einsetzen.
 */
export function teileMitVokabeln(text, vokabeln) {
  if (!vokabeln?.length) return [{ text, vokabel: false }]

  // Längste zuerst, damit "cambio climático" nicht von "cambio"
  // zerschnitten wird.
  const sortiert = [...vokabeln].sort((a, b) => b.length - a.length)
  const muster = new RegExp(
    '(' + sortiert.map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')',
    'gi'
  )

  return text
    .split(muster)
    .filter(Boolean)
    .map((stueck) => ({
      text: stueck,
      vokabel: sortiert.some((v) => v.toLowerCase() === stueck.toLowerCase()),
    }))
}
