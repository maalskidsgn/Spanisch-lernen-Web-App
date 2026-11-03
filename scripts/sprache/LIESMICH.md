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

## Was die Werkzeuge NICHT finden

Die Skripte oben suchen nach `>Text<`, nach Attributen wie
`placeholder=` und nach Zuweisungen. Vier Formen fallen durch, und
genau dort stand nach dem ersten Durchgang noch alles auf Deutsch:

```jsx
{laeuft ? 'Wird gesucht …' : 'Käufe wiederherstellen'}   // Ternär
<HoerKnopf titel="Anhören" />                            // eigenes Prop
<p>
  Mehrzeiliger Satz, der im Quelltext umbrochen ist.
</p>
`${n} Vokabeln wiederholen`                              // Template
```

Deshalb vor jedem Abschluss ein Vollscan über **alle** Stringliterale,
nicht nur über die Muster. Und `src/*.js` nicht vergessen: Die
Fehlermeldungen der Anmeldung (`auth.js`), die Kaufmeldungen
(`kauf.js`), die Level-Namen (`gamification.js`) und die Termine
(`srs.js`) sind genauso sichtbar wie alles in den Komponenten.

## Zwei Fallen, die stillschweigend vorbeigehen

**Eine Datei fehlt in `DATEIEN`.** `zitate.js` und `feed.js` standen
nicht in der Liste von `sammle-inhalte.mjs`. 171 Lerntexte waren
deshalb nie übersetzt – ohne Fehlermeldung, denn `text()` gibt den
deutschen Text zurück, wenn er keine Übersetzung findet. Kommt eine
Inhaltsdatei dazu, gehört sie in diese Liste.

**Eine Übersetzung für zwei Wörter.** `conocer` und `saber` hiessen
beide "to know", `ser` und `estar` beide "to be". Beim Multiple
Choice standen dann zwei gleiche Antworten da – oder, schlimmer, die
richtige fehlte ganz, weil sie zur anderen zusammenfiel. Das sind
oft genau die Paare, die eine Lektion erklärt; die englische
Fassung muss sie auseinanderhalten ("to know (a fact)" /
"to know (be familiar with)").

`pruefe-lektionen.mjs` läuft seit diesem Durchgang **in beiden
Sprachen** und fängt beides. Vorher prüfte es nur die Sprache, in
der Node gerade stand – und das war wegen `navigator.language`
Englisch, während es deutsche Lösungen erwartete.

## Die Zwischenstände liegen jetzt im Projekt

`uebersetzt.json` und die Sammel-Dateien lagen im Sitzungsordner
unter `/private/tmp/…/scratchpad`. Der wird aufgeräumt – mit ihm
wären alle 8.000 Übersetzungen weg gewesen, und der nächste Lauf
hätte sie neu bezahlt. Alle Skripte lesen und schreiben jetzt
neben sich selbst in `scripts/sprache/`.
