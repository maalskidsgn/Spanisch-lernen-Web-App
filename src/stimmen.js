// Die Besetzung – und die Regeln, nach denen ein Audio-Dateiname
// entsteht.
//
// Diese Datei benutzen ZWEI Seiten: die App (src/audio.js) beim
// Suchen einer Aufnahme und das Vertonungs-Skript
// (scripts/vertone.mjs) beim Erzeugen. Beide müssen zwingend auf
// denselben Dateinamen kommen – deshalb steht die Logik hier
// einmal statt zweimal.
//
// Darum enthält diese Datei KEINE Browser-Befehle: Sie muss auch
// in Node laufen.

/**
 * Die Sprechrollen.
 *
 * Die Kennungen sind bewusst neutral ("es-w1"), nicht "Ana": Welche
 * ElevenLabs-Stimme dahintersteckt, entscheidet allein die
 * Besetzungsliste in scripts/stimmen.mjs. Würde die Kennung den
 * Namen enthalten, müssten wir bei einem Rollenwechsel alle
 * Aufnahmen neu erzeugen.
 */
export const STIMMEN = {
  standard: 'es-w1', // Vokabeln und Beispielsätze
  rolleA: 'es-w1',   // erste Person in einem Dialog ohne feste Rolle
  rolleB: 'es-m1',   // zweite Person
}

/**
 * Die feste Besetzung des Kurses.
 *
 * Ana klingt in Lektion 120 wie in Lektion 3 – das ist der ganze
 * Zweck. Sprecher, die hier nicht stehen (Kellner, Verkäuferin und
 * andere Nebenrollen der älteren Lektionen), bekommen weiter eine
 * Stimme nach ihrer Position im Dialog.
 */
export const BESETZUNG = {
  Ana: 'es-w1',   // Spanierin aus Madrid, ruhig und deutlich
  Tom: 'es-m1',   // der Lernende – hier identifiziert sich der Nutzer
  Luis: 'es-m2',  // Spanier aus Valencia, lockerer Ton
  Carmen: 'es-w2',// Anas Mitbewohnerin
}

/**
 * Der Stand der Besetzung.
 *
 * Diese Zahl geht in JEDE Prüfsumme ein. Warum? Die Prüfsumme kennt
 * sonst nur Rolle und Text – nicht, welche Stimme tatsächlich
 * gesprochen hat. Tauschten wir Ana gegen eine andere Stimme,
 * blieben alle Dateinamen gleich: Das Vertonungs-Skript sähe "ist
 * schon da" und überspränge alles, und die App spielte ewig die
 * alte Stimme weiter.
 *
 * Also: Bei JEDER Änderung an scripts/besetzung.json diese Zahl um
 * eins erhöhen. Dann ändern sich alle Dateinamen, die App fällt so
 * lange auf die Gerätestimme zurück, bis neu vertont ist – und es
 * kann nie eine Aufnahme laufen, die nicht zur Besetzung passt.
 *
 * 1 = Alice und Eric (premade, englischer Akzent)
 */
export const BESETZUNG_STAND = 1

/**
 * Text vor dem Vertonen säubern.
 * "alemán / alemana" soll nicht als "alemán Schrägstrich…" enden.
 */
export function sprechText(text) {
  return String(text)
    .replace(/\s*\/\s*/g, ', ')   // "a / b" -> "a, b"
    .replace(/\s*\([^)]*\)/g, '') // "(m/w)" u.ä. entfernen
    .replace(/…/g, '')
    .trim()
}

/**
 * Welche Rolle spricht diese Dialogzeile?
 *
 * Erst die feste Besetzung, sonst die Position: Wer zuerst redet,
 * ist Rolle A. Das ist deterministisch – App und Skript kommen ohne
 * Absprache zum selben Ergebnis.
 */
export function stimmeImDialog(dialog, sprecher) {
  if (BESETZUNG[sprecher]) return BESETZUNG[sprecher]
  return sprecher === dialog[0]?.sprecher ? STIMMEN.rolleA : STIMMEN.rolleB
}

/**
 * Der Dateiname: eine Prüfsumme aus Stimme und gesäubertem Text.
 *
 * Ändern wir eine Lektionszeile, ändert sich automatisch der Name.
 * Die App findet dann keine veraltete Aufnahme mehr und nimmt die
 * Browser-Stimme, bis das Skript die neue Datei erzeugt hat. Es kann
 * also nie ein Audio laufen, das nicht zum Text passt.
 *
 * Beide Seiten reichen ihre eigene SHA-256-Funktion herein – der
 * Browser rechnet asynchron, Node synchron.
 */
export function dateiName(hexPruefsumme) {
  return hexPruefsumme.slice(0, 24) + '.mp3'
}

/** Was in die Prüfsumme eingeht – für beide Seiten identisch. */
export function pruefsummeQuelle(text, stimme) {
  return BESETZUNG_STAND + '|' + stimme + '|' + sprechText(text)
}
