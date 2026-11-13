// Welche Module sind ohne Premium offen? (13.11.2026, Manuel)
//
// Gratis sind GANZE Module: die ersten GRATIS_MODULE_ANZAHL (2). Alle
// Module danach – samt Hörszene und Prüfstation – gehören zu Premium.
// Vorher galt die Grenze mitten im Modul (20 % nach Kursnummer).
//
// Abgeleitet aus MODULE, damit Anzeige (GratisHinweis, Kasse) und
// Sperre (Lessons.jsx) nie auseinanderlaufen.
import { MODULE, lektionenVon, kommtBald } from './lektionen.js'
import { GRATIS_MODULE_ANZAHL } from './premium.js'

const mitInhalt = MODULE.filter((m) => !kommtBald(m))

export const GRATIS_MODULE = new Set(mitInhalt.slice(0, GRATIS_MODULE_ANZAHL).map((m) => m.id))

/** Kennungen aller Lektionen in den Gratis-Modulen */
export const GRATIS_LEKTIONEN = new Set(
  mitInhalt.filter((m) => GRATIS_MODULE.has(m.id)).flatMap((m) => lektionenVon(m).map((l) => l.id))
)

export const GRATIS_MODULE_ZAHL = GRATIS_MODULE.size
export const MODULE_ZAHL = mitInhalt.length

/** Gehört dieses Modul zu Premium? (unabhängig davon, ob jemand Premium hat) */
export function istPremiumModul(m) {
  return !kommtBald(m) && !GRATIS_MODULE.has(m.id)
}
