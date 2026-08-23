# Habloo – was noch offen ist

Stand: 23. August 2026, nachmittags

**Was jetzt läuft:** 150 Lektionen komplett vertont (4.728 Aufnahmen,
0 fehlen), Frontend + Backend auf Coolify mit Auto-Deploy, Karteikasten
repariert, Mailversand über lernen@habloo.de im Habloo-Design,
Google Analytics mit Einwilligung, Onboarding-Trichter vor der
Anmeldung, Hörverstehen „Mitgehört".

**Der einzige echte Blocker vor dem Start:** Rechtstexte.

---

## 🔴 Blockiert die Veröffentlichung

### ✅ Erledigt am 23.08.: Umzug von Vercel zu Coolify
Frontend und Backend liegen jetzt beide auf dem Hetzner-Server
(2.28.31.213) in Coolify. habloo.de, www.habloo.de und
coolify.habloo.de zeigen per DNS (All-Inkl) dorthin, Let's-Encrypt-
Zertifikate sind gezogen, http leitet auf https.

- Frontend: App `habloo-web`, baut aus `Dockerfile.web` + `Caddyfile`,
  Build-Variablen (VITE_*) in Coolify hinterlegt. Identischer Build
  wie vorher auf Vercel (gleiche `index-*.js`, nachgemessen).
- Backend: App `habloo-backend`, unverändert.
- Auto-Deploy: `/usr/local/bin/coolify-autodeploy.sh` läuft als
  systemd-Timer alle 2 Minuten, vergleicht GitHub mit dem
  ausgelieferten Commit und stößt bei Bedarf Coolifys eigenen
  Deploy-Vorgang an. Protokoll: `/var/log/coolify-autodeploy.log`.
  Gilt für ALLE Apps auf dem Server (auch Davaigo). Abschalten:
  `systemctl disable --now coolify-autodeploy.timer`.
- Coolify-Oberfläche: https://coolify.habloo.de (Port 8000 bleibt
  als Rückfall offen).

**Noch zu tun (Manuel):**
- [ ] **Vercel-Projekt löschen** – DNS ist durch (`habloo.de` →
      2.28.31.213, geprüft 23.08. nachmittags). Unter vercel.com das
      Projekt entfernen, sonst baut es bei jedem Push weiter und
      kostet Build-Minuten.
- [ ] **Chrome-Erweiterung freigeben** für `coolify.habloo.de` und
      `habloo.de` (Claude-Symbol in der Werkzeugleiste), damit Claude
      die Oberfläche bedienen kann. Nur diese Domains, keine
      Pauschalfreigabe – im selben Chrome hängen Bank, GitHub, Stripe.
- [ ] **Coolify-Anmeldedaten** liegen bei Manuel; Claude hat keine und
      legt keine an. Zugang zur Kommandozeile weiterhin über
      `ssh -i ~/.ssh/hetzner_vamigo root@2.28.31.213`.

### ✅ E-Mail: Supabase sendet über lernen@habloo.de (23.08.)
Per Management-API gesetzt (`scripts/supabase-mail-einrichten.mjs`):
SMTP über All-Inkl (587), vier Vorlagen im Habloo-Design auf Deutsch,
Site URL + Redirect URLs auf habloo.de, **Mail-Bestätigung bei
Registrierung jetzt AN** (vorher: jeder sofort bestätigt, ohne Mail).

Bewiesen 23.08. (aus einem Bounce-Original gelesen): Supabase
rendert die neue Vorlage, Betreff „Habloo – dein Link zum neuen
Passwort". Frühere englische Mails waren vor dem Schreiben erzeugt.
Web.de kennt KEINE Plus-Adressen (`name+tag@web.de` → 550) – für
Tests Gmail nehmen oder eine echte zweite Adresse.

Noch prüfen (Manuel):
- [ ] In der neuen Mail auf den Knopf: muss auf habloo.de landen und
      das Formular „Neues Passwort" öffnen.
- [ ] Frisches Konto anlegen: Bestätigungsmail muss kommen, Klick
      bestätigt das Konto.
- [ ] Später DMARC von `p=none` auf `p=quarantine`, sobald der Versand
      eine Woche sauber läuft.
- [ ] Mail-Passwort im KAS einmal neu setzen (stand mehrfach im Chat).

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

### Stripe steht im Testmodus
`STRIPE_SECRET_KEY` beginnt mit `sk_test`. Die Premium-Karte trägt
„Bald verfügbar". Es kann niemand bezahlen — die Mechanik ist fertig,
sie ist nur nicht scharf.

---

## 🟡 Inhalt

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

- **`src/Songs.jsx`**: Der ursprünglich notierte fehlende Guard ist
  am 23.08. nicht mehr auffindbar (kein `db.from()` in der Datei).
  Vermutlich beim Umbau miterledigt. Beim nächsten Anfassen kurz
  gegenprüfen, dann diesen Punkt streichen.
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
