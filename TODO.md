# Habloo – was noch offen ist

Stand: 23. August 2026, nachmittags

**Was jetzt läuft:** 150 Lektionen komplett vertont (4.728 Aufnahmen,
0 fehlen), Frontend + Backend auf Coolify mit Auto-Deploy, Karteikasten
repariert, Mailversand über lernen@habloo.de im Habloo-Design,
Google Analytics mit Einwilligung, Onboarding-Trichter vor der
Anmeldung, Hörverstehen „Mitgehört".

**Der einzige echte Blocker vor dem Start:** Stripe steht noch im
Testmodus. Die Rechtstexte stehen seit dem 23.08. (Entwürfe – siehe
unten, juristische Prüfung offen).

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

### ✅ Rechtstexte stehen (23.08.)
`src/Recht.jsx` enthält Impressum, Datenschutzerklärung und AGB samt
Widerrufsbelehrung. Erreichbar ohne Konto: Fuß der Startseite, im
Cookie-Banner (Link auf die Datenschutzerklärung) und unter „Mehr →
Rechtliches".

Impressum aus klarwerk-digital.com übernommen. Die zehn Datenempfänger
sind aus dem Quelltext **erhoben**, nicht abgeschrieben – Supabase,
Hetzner, OpenAI, Anthropic (nur Premium), Google/YouTube, Google
Analytics, Stripe, Spotify, TubeAlfred, ALL-INKL. ElevenLabs steht
bewusst NICHT drin: Die Stimmen sind vorab erzeugt, im Betrieb geht
dorthin kein Nutzerdatum. Nachprüfen:
`grep -rhoE "https://[a-z0-9.-]+\.[a-z]{2,}" src/ server/ | sort -u`

**Wichtig:** Das sind Entwürfe. Die Empfängerliste ist belegbar
richtig, die juristische Bewertung kann Claude nicht liefern – für ein
kostenpflichtiges Verbraucher-Abo in Deutschland gehört das einmal
über einen Anwalt. Offen bleibt außerdem:
- [ ] Preise in den AGB gegen Stripe prüfen, sobald live geschaltet
      (aktuell 5,99 €/Monat, 50 €/Jahr, 89 € einmalig).
- [ ] Wer einen neuen Dienst einbaut, muss die Liste in `Recht.jsx`
      nachziehen – sonst stimmt die Erklärung nicht mehr.

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

### ✅ Tägliche zweisprachige Inhalte: „Land & Leute" (24.08.)
Manuels Idee vom 20.08., umgesetzt als **Weg B**: 28 geschriebene
Stücke über Spanien und Lateinamerika, jeden Tag ein anderes, auf
Spanisch mit deutscher Zeile daneben. Vier Wochen ohne Wiederholung,
danach von vorn.

Warum nicht Weg A (echte Nachrichten): Für Nachrichten hätte eine KI
täglich schreiben müssen, und eine KI, die Nachrichten schreiben soll,
erfindet Nachrichten. Das wäre Desinformation unter deinem Namen auf
deiner eigenen Startseite. Die 28 Stücke kosten nichts im Betrieb,
funktionieren offline und können nicht danebengreifen.

- `src/landUndLeute.js` – die Stücke plus Tagesrotation (dieselbe
  Rechnung wie bei den Zitaten: ab festem Tag, nicht Tag im Jahr).
- `src/LandUndLeute.jsx` – die Seite. Der Deutsch-Schalter ist der
  Kern: Wer die Übersetzung immer sieht, liest sie zuerst und die
  spanische Zeile nur zur Kontrolle.
- Karte auf der Startseite, über der Wochenübersicht.
- Die sechs Wörter je Stück gehen auf Knopfdruck in den Karteikasten.
  Der Knopf zählt nur die, die noch nicht drin sind.
- 10 XP beim ersten Öffnen, zählt für die Tagesserie.
- `pruefe-landundleute.mjs` (sechster Validator) prüft unter anderem,
  dass jedes der sechs Wörter im Text wirklich vorkommt.

Offen, falls gewünscht:
- [ ] **Vertonung.** Die Stücke sind bewusst nicht vertont – auf die
      Gerätestimme zurückzufallen wäre falsch (siehe `HoerKnopf.jsx`).
      Richtig wäre `scripts/vertone.mjs`: 84 Absätze, grob 15–20k
      ElevenLabs-Credits.
- [ ] Weitere Stücke schreiben. Die Regeln stehen im Kopf von
      `src/landUndLeute.js`, der Prüfer erzwingt sie.

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
- **Keine automatisierten Tests der Oberfläche.** Die sechs Validatoren
  decken die Inhalte ab (150 Lektionen, 275 Aufgaben, 7 Stationen,
  7 Hörszenen, 28 Stücke, plus der Karteikasten) und laufen vor jedem
  Build. Die Oberfläche deckt nichts ab.
- **Alte Aufnahmen aufräumen:** Mit `BESETZUNG_STAND = 2` sind die
  32 Dateien der ersten Vertonung Waisen im Supabase-Speicher.
  Schaden richten sie keinen.
