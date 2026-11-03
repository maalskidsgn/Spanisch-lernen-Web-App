# Werkzeuge für die Zweisprachigkeit

Habloo spricht Deutsch und Englisch. Diese Skripte haben die
Umstellung gemacht und helfen beim Nachziehen, wenn neue Texte oder
Lektionen dazukommen.

Alle brauchen `OPENAI_API_KEY` aus `.env.local`:

```bash
set -a && . ./.env.local && set +a
```

## Wenn neue Lektionen dazugekommen sind

```bash
node scripts/sprache/sammle.mjs        # sammelt, was übersetzt werden muss
node scripts/sprache/uebersetze.mjs    # übersetzt nur das Neue, merkt sich den Stand
node scripts/sprache/baue-inhalte.mjs  # schreibt src/texte/inhalte-en.js neu
```

`uebersetzt.json` ist der Zwischenstand. Nicht löschen — sonst wird
alles noch einmal übersetzt und kostet unnötig.

## Wenn neue Oberflächentexte dazugekommen sind

```bash
node scripts/sprache/zaehle-rest.mjs                      # was ist noch deutsch?
node scripts/sprache/stelle-um.mjs Datei.jsx praefix      # einzeilige Texte
node scripts/sprache/stelle-um-mehrzeilig.mjs Datei.jsx p # umbrochene Texte
```

Die beiden `stelle-um`-Skripte tragen die Schlüssel gleich in
`src/texte/de.js` und `en.js` ein und schreiben den Code um.

**Vorsicht:** Sie arbeiten mit Mustern, keiner Grammatik. Zweimal
haben sie Code erwischt, der wie Text aussah
(`Math.abs(dx) > Math.abs(dy)` sieht aus wie `>Text<`). Nach jedem
Lauf deshalb:

```bash
npx vite build        # fängt Syntaxfehler
git diff              # fängt den Rest
```

## Immer nach dem Umstellen

```bash
node scripts/sprache/pruefe-hooks.mjs   # t() ohne useTexte() in der Komponente
node scripts/sprache/pruefe-modul.mjs   # t() in Konstanten auf Modulebene
```

Beides findet der Build **nicht**, beides führt im Browser zum weißen
Bildschirm oder zu Text, der beim Sprachwechsel stehen bleibt. Diese
zwei Prüfungen sind der Grund, warum die Umstellung am Ende
funktioniert hat.
