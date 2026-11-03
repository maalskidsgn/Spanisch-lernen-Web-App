/**
 * Schreibt die fertigen Übersetzungen als Modul in die App.
 *
 * Läuft nach jedem Übersetzungsdurchgang erneut - das Ergebnis ist
 * reine Ausgabe, nichts davon wird von Hand bearbeitet.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ORDNER = '/private/tmp/claude-501/-Users-manuelkillert/b4100586-ee84-4775-9f8d-4efb903b3423/scratchpad'
const ZIEL = '/Users/manuelkillert/Projekte/spanisch-app/src/texte/inhalte-en.js'

const d = JSON.parse(readFileSync(`${ORDNER}/uebersetzt.json`, 'utf8'))

function alsObjekt(map) {
  const zeilen = Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
  return `{\n${zeilen.join('\n')}\n}`
}

const inhalt = `/**
 * Die englischen Fassungen der Lerninhalte.
 *
 * ERZEUGT - nicht von Hand ändern. Diese Datei entsteht aus den
 * deutschen Lektionen und wird bei jedem Übersetzungslauf neu
 * geschrieben. Wer hier etwas korrigiert, verliert es beim nächsten
 * Durchgang; die Korrektur gehört in die Quelle.
 *
 * Nachgeschlagen wird über das Spanische (eindeutig), nur die reinen
 * Erklärtexte ohne spanisches Gegenstück über das Deutsche.
 *
 * Stand: ${new Date().toISOString().slice(0, 10)}
 * Vokabeln: ${Object.keys(d.vokabeln).length}
 * Sätze:    ${Object.keys(d.saetze).length}
 * Texte:    ${Object.keys(d.texte).length}
 */

/** Spanisches Wort -> englische Übersetzung */
export const VOKABELN = ${alsObjekt(d.vokabeln)}

/** Spanischer Satz -> englische Übersetzung */
export const SAETZE = ${alsObjekt(d.saetze)}

/** Deutscher Text -> englische Fassung */
export const TEXTE = ${alsObjekt(d.texte)}
`

writeFileSync(ZIEL, inhalt)
console.log(`geschrieben: ${(inhalt.length / 1024).toFixed(0)} KB`)
console.log(`  Vokabeln ${Object.keys(d.vokabeln).length}`)
console.log(`  Sätze    ${Object.keys(d.saetze).length}`)
console.log(`  Texte    ${Object.keys(d.texte).length}`)
