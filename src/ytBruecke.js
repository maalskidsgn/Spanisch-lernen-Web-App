/**
 * Der YouTube-Player für die App – über eine Seite auf habloo.de.
 *
 * YouTube weist seit Juli 2025 jede Einbettung ab, die ohne gültigen
 * HTTP-Referer ankommt ("Fehler 153"). Eine Capacitor-App lädt ihre
 * Oberfläche lokal aus dem Bundle, also gibt es dort keinen echten
 * Referer – egal, unter welchem Namen sie läuft. Weder ein anderes
 * Schema noch ein eigener Hostname noch die Angabe von `origin`
 * ändern daran etwas; das wurde alles durchprobiert.
 *
 * Was hilft: eine Seite, die wirklich auf habloo.de liegt
 * (public/ytplayer.html). Die App bindet sie ein, YouTube sieht einen
 * Referer vom Server und spielt.
 *
 * Diese Datei baut darum herum ein Objekt, das sich benimmt wie ein
 * `YT.Player` – damit der Rest der App nicht wissen muss, auf welchem
 * Weg das Video gerade läuft.
 *
 * Im Browser wird das hier NICHT gebraucht: Dort stimmt der Referer
 * ohnehin, und der direkte Weg ist einer weniger, der kaputtgehen kann.
 */

const SEITE = 'https://habloo.de/ytplayer.html'

/**
 * Baut den Player in das Element mit der übergebenen Kennung.
 *
 * @param {string} kennung – id des Platzhalter-Elements
 * @param {object} einstellungen – { videoId, events: { onReady, onStateChange } }
 * @returns {object} ein Objekt mit den Methoden, die die App benutzt
 */
export function baueBrueckenPlayer(kennung, { videoId, events = {} }) {
  const platz = document.getElementById(kennung)
  if (!platz) throw new Error('Kein Platz für den Player gefunden.')

  const rahmen = document.createElement('iframe')
  rahmen.src = SEITE + '?v=' + encodeURIComponent(videoId)
  rahmen.allow = 'autoplay; encrypted-media; picture-in-picture'
  rahmen.setAttribute('allowfullscreen', '')
  rahmen.style.cssText = 'width:100%;height:100%;border:0;display:block'
  platz.replaceChildren(rahmen)

  // Der zuletzt gemeldete Stand. Die App fragt die Zeit synchron ab
  // (alle 300 ms für die Untertitel), über postMessage kommt sie aber
  // nur asynchron – also merken wir sie uns hier.
  let zeit = 0
  let dauer = 0
  let zustand = -1
  let gemessen = 0      // wann der letzte Stand ankam
  let tot = false

  function horch(e) {
    if (e.source !== rahmen.contentWindow) return
    let n
    try {
      n = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
    } catch {
      return
    }
    if (!n?.art) return

    if (n.art === 'stand') {
      zeit = n.zeit
      dauer = n.dauer
      zustand = n.zustand
      gemessen = performance.now()
      return
    }
    if (n.art === 'bereit') {
      dauer = n.dauer || 0
      events.onReady?.({ target: api })
      return
    }
    if (n.art === 'zustand') {
      zustand = n.zustand
      events.onStateChange?.({ data: n.zustand, target: api })
      return
    }
    if (n.art === 'fehler') {
      console.warn('[yt] Fehler vom Player:', n.code)
    }
  }
  window.addEventListener('message', horch)

  function sag(tu, wert) {
    if (tot) return
    try {
      rahmen.contentWindow?.postMessage(JSON.stringify({ tu, wert }), '*')
    } catch {
      /* Rahmen schon weg */
    }
  }

  const api = {
    playVideo: () => sag('ab'),
    pauseVideo: () => sag('halt'),

    seekTo(sekunden) {
      // Sofort selbst mitziehen: Sonst springen die Untertitel erst
      // zurück, wenn die nächste Meldung ankommt – das sieht aus wie
      // ein Ruckler.
      zeit = sekunden
      gemessen = performance.now()
      sag('spring', sekunden)
    },

    setPlaybackRate: (wert) => sag('tempo', wert),
    loadVideoById: (id) => sag('laden', id),

    /**
     * Die Zeit – zwischen zwei Meldungen hochgerechnet.
     *
     * Ohne das Hochrechnen stünde die Zeit fünfmal pro Sekunde still
     * und spränge dann. Für das Mitlaufen der Untertitel reicht das
     * nicht: Man sieht das Stocken.
     */
    getCurrentTime() {
      if (zustand !== 1) return zeit // läuft nicht – dann steht sie wirklich
      return zeit + (performance.now() - gemessen) / 1000
    },

    getDuration: () => dauer,
    getPlayerState: () => zustand,
    getIframe: () => rahmen,

    destroy() {
      tot = true
      window.removeEventListener('message', horch)
      rahmen.remove()
    },
  }

  return api
}
