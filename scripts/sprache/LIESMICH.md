# Werkzeuge für die Zweisprachigkeit

Habloo spricht Deutsch und Englisch. Diese Skripte haben die
Umstellung gemacht und helfen beim Nachziehen.

Alle brauchen `OPENAI_API_KEY` aus `.env.local`:

```bash
set -a && . ./.env.local && set +a
```

## Wenn neue Lektionen oder Inhalte dazugekommen sind

```bash
node scripts/sprache/sammle-inhalte.mjs   # liest ALLE Inhaltsdateien
node scripts/sprache/uebersetze.mjs       # übersetzt nur das Neue
node scripts/sprache/baue-inhalte.mjs     # schreibt src/texte/inhalte-en.js
```

`uebersetzt.json` ist der Zwischenstand. Nicht löschen – sonst wird
alles noch einmal übersetzt und kostet unnötig.

**Warum `sammle-inhalte.mjs` und nicht `sammle.mjs`:** Die erste
Fassung las nur `lektionen.js` und suchte nach den Feldern `titel`,
`untertitel` und `ziel`. Tatsächlich heißen sie `beschreibung` und
`ziele`, und die Prüfstationen, Hörszenen, Bausteine und die
Landeskunde liegen in eigenen Dateien. Über 3.600 Texte waren
deshalb nie übersetzt und standen auf Englisch deutsch da.
`sammle-inhalte.mjs` läuft stattdessen durch jedes Objekt und nimmt
jede Zeichenkette mit – es rät nicht, wie die Felder heißen.

## Wenn neue Oberflächentexte dazugekommen sind

```bash
node scripts/sprache/kurz.mjs Datei.jsx praefix              # alle Texte, ohne Mindestlänge
node scripts/sprache/stelle-um-mehrzeilig.mjs Datei.jsx p    # umbrochener Fließtext
node scripts/sprache/stelle-um-strings.mjs Datei.jsx p       # Meldungen in Zuweisungen
```

`kurz.mjs` ist der Nachfolger von `stelle-um.mjs`: Letzteres verlangte
15 Zeichen Mindestlänge, und genau die kurzen Beschriftungen
("Einkaufen", "Karte", "Merken") sind auf dem Bildschirm am
sichtbarsten.

### Nach jedem Lauf – ohne Ausnahme

```bash
npm run build    # fängt Syntaxfehler UND die Inhaltsprüfungen
git diff         # fängt den Rest
```

Die Werkzeuge arbeiten mit Mustern, nicht mit Grammatik. Vier Mal
haben sie Code zerschossen, der wie Text aussah:

```js
if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5)
//                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ sieht aus wie >Text<
```

Seitdem steht in jedem Werkzeug die Regel `KEIN_TEXT`, die Klammern,
Operatoren und JS-Schlüsselwörter ausschließt. Verlass dich trotzdem
nicht darauf – der Build ist die Absicherung.

## Immer prüfen

```bash
node scripts/sprache/pruefe-hooks.mjs   # t() ohne useTexte() in der Komponente
node scripts/sprache/pruefe-modul.mjs   # t() in Konstanten auf Modulebene
```

Beides findet der Build **nicht**. Fehlender Hook heißt weißer
Bildschirm; `t()` in einer Modulkonstante heißt, der Text friert beim
Sprachwechsel ein.

## Die eigentliche Prüfung läuft im Browser

Alles oben prüft den Code. Ob auf dem **Bildschirm** noch Deutsch
steht, zeigt nur der Browser. Die zuverlässige Methode:

1. Dev-Server starten, Sprache auf Englisch stellen.
2. `de.js` und `inhalte-en.js` laden und eine Menge aller deutschen
   Werte bilden, zu denen es eine abweichende englische Fassung gibt.
3. Mit einem `TreeWalker` jeden sichtbaren Textknoten durchgehen und
   melden, was in dieser Menge steht.

Eine frühere Prüfung suchte stattdessen nach deutschen Füllwörtern
(der, die, das, und). "Einkaufen", "Kleidung" und "7–9 Min." enthalten
keins davon – sie galten als übersetzt und waren es nicht. Diese
Prüfung meldete fünf saubere Bildschirme, während der Lernpfad
komplett deutsch war.
