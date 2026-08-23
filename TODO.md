# Habloo – was noch offen ist

Stand: 20. August 2026

---

## 🔴 Blockiert die Veröffentlichung

### Rechtstexte fehlen vollständig
Kein Impressum, keine Datenschutzerklärung, keine AGB, keine
Widerrufsbelehrung — und nirgends ein Link darauf. habloo.de ist
bereits öffentlich erreichbar.

Die App verarbeitet Daten über: Supabase (Konto, Fortschritt),
OpenAI (Wortlisten, Baustein-Varianten), Anthropic (Ebooks),
ElevenLabs (Audio), YouTube (eingebettete Videos), Spotify (OAuth,
liest gespeicherte Titel, Playlists und meistgehörte Künstler),
Stripe (Zahlung), **Google Analytics** (Reichweitenmessung, seit
23.08., nur nach Einwilligung).

Zu Google Analytics gehören zwei Dinge in die Datenschutzerklärung:
Google Ireland Ltd. als Empfänger samt Übermittlung in die USA, und
ein Hinweis, wie man die Einwilligung widerruft (Mehr → Messung).
Außerdem gehört der Banner dann auf die Datenschutzerklärung
verlinkt – die Stelle ist in `src/Einwilligung.jsx` als TODO
markiert. Solange die Seite fehlt, steht dort bewusst kein Link.

Für ein kostenpflichtiges Abo an Verbraucher in Deutschland führt
daran kein Weg vorbei. Claude kann die vollständige Liste der
Datenempfänger aus dem Code zusammenstellen — welcher Dienst, welche
Daten, wofür, welcher Endpunkt. Die juristische Bewertung nicht.

### ⚠️ Karteikasten: Der SQL-Befehl fehlt noch
**Code ist fertig (20.08.), die Datenbank noch nicht.**

Das hier ist das Einzige, was Manuel selbst tun muss. Im Supabase-
Dashboard unter „SQL Editor" ausführen:

```sql
alter table vokabeln
  add column if not exists intervall real,
  add column if not exists leichtigkeit real;
```

**Solange das nicht läuft, bleibt der Fehler bestehen.** Die App
merkt es und arbeitet weiter wie bisher – sie stürzt nicht ab –, aber
die Abstände bleiben grob. In der Browser-Konsole steht dann ein
Hinweis. Nach dem SQL: nichts weiter zu tun, es greift beim nächsten
Abgleich von selbst.

<details><summary>Was der Fehler war</summary>

`src/srs.js` rechnete richtig. `src/sync.js` speicherte aber nur
`stufe` und `faellig_am` – `intervall` und `leichtigkeit`, von denen
die Rechnung lebt, fielen weg. Beim nächsten App-Start fiel der
Abstand auf die grobe Leiter `[0,1,3,7,14,30,90]` zurück:

```
ohne Sync:  1 → 2,5 → 6,3 → 15,8 → 39,5 → 98,8 → 247 → 365
mit Sync:   1 → 2,5 → 2,5 → 2,5 → 2,5 → 2,5 → 2,5 → 2,5
```

2,5 Tage runden auf Stufe 1 ab, Stufe 1 heißt wieder 1 Tag, mal 2,5
sind wieder 2,5 – ein Kreis. Bei „Schwer" dasselbe bei 0,5 Tagen.

Behoben in `sync.js` (beide Felder werden mitgespeichert, die
Zusammenführung vergleicht jetzt den Abstand statt der groben Stufe)
und in `srs.js` (unter einer Woche mit Nachkommastelle, sonst stand
auf zwei Knöpfen dasselbe). `pruefe-srs.mjs` prüft die Rundreise vor
jedem Build und wurde gegen den alten Stand gegengeprüft – er schlägt
an.
</details>

### Stripe steht im Testmodus
`STRIPE_SECRET_KEY` beginnt mit `sk_test`. Die Premium-Karte trägt
„Bald verfügbar". Es kann niemand bezahlen — die Mechanik ist fertig,
sie ist nur nicht scharf.

---

## 🟡 Inhalt

### Beispielsätze vertonen
1.724 Sätze, **47.624 Credits**. Der größte verbleibende Posten —
mehr als Dialoge und Vokabeln zusammen. Dialoge (42.673) und
Vokabeln (17.642) sind seit dem 20.08. erledigt.

Aufruf: `node scripts/vertone.mjs --los` (ohne `--ohne-saetze`).
Das Skript überspringt, was schon im Speicher liegt.

### „Deine Sammlung" im Trainer
Aus dem Entwurf vom 20.08.: zwei Kennzahlen (Wörter / sicher gelernt)
und drei Wortkarten mit Status-Chips. Umgesetzt ist bisher nur der
Listengenerator darüber.

### Hörtexte
Elf importierte Folgen mit Tonspur liegen ausgeblendet.
`HOERTEXTE_ZEIGEN` in `src/Library.jsx` holt den Bereich zurück.
Entscheiden: zurückholen oder wegwerfen.

---

## 💡 Ideen

### Tägliche zweisprachige Nachrichten
**Idee (Manuel, 20.08.):** Jeden Tag etwas Frisches zum Lesen —
positive Meldungen aus Spanien, Lateinamerika und Deutschland, auf
Spanisch und Deutsch nebeneinander. Nichts Negatives.

**Das Problem:** Eine KI, die „Nachrichten" schreiben soll, erfindet
Nachrichten. Nicht vielleicht, sondern zuverlässig. Bei einem
Grammatikbeispiel ist ein Fehler ärgerlich; bei einer Nachricht ist
es Desinformation unter deinem Namen.

**Weg A — echte Quelle, KI übersetzt nur.**
RSS von RTVE, Deutsche Welle (spanische Redaktion), EFE. Die KI darf
nichts erfinden, sie kürzt und vereinfacht nur, was in der Quelle
steht: A2/B1-Spanisch plus deutsche Fassung. Fakten vom
Journalisten, Sprache von der KI.
Einmal täglich global erzeugen und in Supabase ablegen, nicht pro
Nutzer → rund 30 Cent im Monat. Aufwand: etwa ein Arbeitstag.

**Weg B — „Land & Leute" statt Nachrichten.**
Kurze zweisprachige Stücke über Spanien und Lateinamerika: Feste,
Essen, Regionen, Eigenheiten. Nicht tagesaktuell, also kein
Frischezwang. Kuratierte Liste wie die Sprichwörter: null Kosten,
null Risiko, funktioniert offline. Fügt sich in die Machart von
Ebooks und Hörtexten. Aufwand: ein paar Stunden plus Schreibarbeit.

**Empfehlung:** B zuerst. Liefert das Eigentliche — täglich etwas
Neues, Positives, Zweisprachiges — ohne dass je die Frage aufkommt,
ob da Unsinn steht. A erst, wenn echte Tagesaktualität gebraucht wird.

### KI-Varianten für die Bausteine ausbauen
Läuft seit dem 20.08. Falls einzelne Aufgaben inhaltlich danebengehen:
Die Anweisung an das Modell steht in `server/bausteine.js`, die
Formprüfung in `src/aufgabePruefen.js`. Höchstens zwei von fünf
Aufgaben je Runde stammen von der KI — das begrenzt den Schaden eines
Ausrutschers, verhindert ihn aber nicht.

---

## 🔧 Kleinigkeiten

- **`src/Songs.jsx`** ruft `db.from()` ohne Prüfung auf und stürzt ab,
  wenn die Supabase-Zugangsdaten fehlen. Die Videos prüfen vorher —
  Songs nicht. Eine Zeile.
- **`src/Ebooks.jsx`** ist ein vollständiger Ebook-Bereich mit
  Niveau-Wahl und Monatskontingent, der nirgends eingebunden ist. Die
  Tabelle `ebooks` hat 5 Einträge, der Endpunkt `/api/ebook` läuft.
  Entweder umstellen oder löschen.
- **`VITE_UNTERRICHT_URL`** ist nicht gesetzt — der Gruppenunterricht
  hat keinen Raum. Die Karte ist ohnehin vom Start verschwunden
  (`PRAXIS_ZEIGEN` in `src/Home.jsx`).
- **Keine automatisierten Tests der Oberfläche.** Die drei Validatoren
  decken die Inhalte ab (150 Lektionen, 275 Aufgaben, 7 Stationen) und
  laufen vor jedem Build. Die Oberfläche deckt nichts ab.
- **Alte Aufnahmen aufräumen:** Mit `BESETZUNG_STAND = 2` sind die
  32 Dateien der ersten Vertonung Waisen im Supabase-Speicher.
  Schaden richten sie keinen.
