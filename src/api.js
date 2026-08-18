// Die Adresse des Habloo-Servers.
//
// Drei Fälle, die sich unterscheiden:
//
// 1. Lokal beim Entwickeln → leer. Vite leitet /api an localhost:8787
//    weiter (siehe vite.config.js).
// 2. Im Browser auf habloo.de → VITE_API_URL zeigt auf den Server.
// 3. In der Android-App → hier ist eine VOLLSTÄNDIGE Adresse Pflicht.
//    Die App lädt ihre Dateien nicht von einem Webserver, sondern aus
//    dem eigenen Paket. Ein Pfad wie "/api/transcript" würde deshalb
//    ins Leere zeigen statt zum Server.

const AUS_UMGEBUNG = import.meta.env.VITE_API_URL || ''

/** Läuft die App gerade als installierte App statt im Browser? */
export const istApp =
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() ||
    ['capacitor:', 'file:'].includes(window.location?.protocol))

// Notfall-Adresse: Ohne sie stünde die App ohne Server da. Sie greift
// nur, wenn beim Bauen vergessen wurde, VITE_API_URL zu setzen.
const NOTFALL = 'https://xexf1rjcef6l3k5ec6oddpad.2.28.31.213.sslip.io'

export const API_URL = AUS_UMGEBUNG || (istApp ? NOTFALL : '')

// Beim Entwickeln früh warnen statt später rätselhafte Fehler zu suchen
if (istApp && !AUS_UMGEBUNG) {
  console.warn(
    'VITE_API_URL war beim Bauen nicht gesetzt – die App nutzt die ' +
      'hinterlegte Notfall-Adresse. Für Veröffentlichungen bitte setzen.'
  )
}
