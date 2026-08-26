# Habloo – Feature-Backlog

Manuels Wunschliste (aus der Notiz vom 24.08.2026), plus was daraus
schon erledigt ist. Wir arbeiten das komplett ab.

Stand: 24. August 2026.

---

## ✅ Schon erledigt (heute)

- [x] **Tutor wie bei Praktika integrieren** → KI-Trainer als Sprach-Chat
      (`src/Gespraech.jsx`, dritter Reiter im Trainer). Live.
- [x] **Chatbot DE/ES, Wörter anklickbar in den Trainer, Themen wählbar,
      passt sich dem Niveau an** → alles gebaut. Themen-Buttons
      (Gesundheit, Technik …), Wörter antippbar → Lernen/Kenne ich.
- [x] **Beim Wort-Antippen im Video wegklicken mit (x)** → X in der
      Wortkarte, im Chat UND im Video/Song-Popup.
- [x] **Erfolgstöne (ganz wichtig)** → `src/erfolgston.js`, Babbel-Stil,
      beim Sammeln eines Worts und bei richtiger Antwort im Trainer.

- [x] **Kalenderansicht: wie viele Tage / Lektionen / Wiederholungen.**
      Kalender-Raster auf der Startseite mit Kreuzen; Antippen zeigt die
      Aufschlüsselung. Zählung jetzt nach Lektion vs. Wiederholung
      getrennt (`aktivitaet.js`).

## 🔨 Gerade in Arbeit

- (frei – nächster Punkt: Vokabelgenerator mit Verben/Adjektiven)

---

## 📋 Offen – wird abgearbeitet

### Inhalte & Lernen
- [ ] **Vokabelgenerator: Adjektive, Verben etc. als Auswahl** für
      vorausgewählte Generierungen. (KI-Listengenerator erweitern.)
- [ ] **Weitere Spiele** (Wordle-artig etc.) für die Vokabelwiederholung.
- [ ] **Unter Memory die Vokabeln auflisten**, evtl. mit Beispielsätzen.
      Sound wäre auch nice.
- [ ] **Lektionen: die deutschen Grundlagen als Text hörbar** machen.
- [ ] **Animation + 2 XP, wenn man bei Ebooks Vokabeln hinzufügt.**

### Spotify / Songs
- [ ] **Spotify funktioniert wieder nicht, Songs wandeln sich nicht um,
      nichts wird gespeichert.** (Diagnose steht: Backend ok,
      Spotify-Entwicklungsmodus ist das Problem. Empfehlung: Songs ohne
      Spotify zuverlässig machen – Weg A.)
- [ ] **Generierte Songs schöner in der Ablage**, ordentliches
      Ladesymbol, und die Generierung muss zuverlässig funktionieren.

### Ebooks
- [ ] **Ebook-Leser neu: Zurück-Knopf ganz links, in der Mitte DE/ES-
      Umschalter, rechts weiterklicken. Eigener Bereich, modern & clean.
      Vokabeln anklickbar.** (Anklickbar ist da – Layout modernisieren.)

### Onboarding & Erklärung
- [ ] **Rundgang für Neulinge**: durch alle Funktionen klicken, mit
      Animationen.
- [ ] **Jeder Bereich beim ersten Betreten**: Infobox-Erklärung + coole
      Animation.
- [ ] **Übersetzungen am Anfang** sollen motivieren, jeden Tag in die App
      zu schauen. (Täglicher zweisprachiger Anreiz – teils „Land & Leute".)

### Fortschritt & Zahlen
- [ ] **Analytics-Graphen** für Wörter / Lektionen / Songs / Videos –
      verschiedene Farben als Balken.

### Look & Feel
- [ ] **Button-Branding**: weg von den Icons in den Buttons, mehr
      Button-Styles. (In der Notiz schon abgehakt – gegenprüfen.)
- [ ] **Bestehende Kategorien vorausgewählt** anzeigen. (In der Notiz
      abgehakt – gegenprüfen.)

---

## Reihenfolge

Manuel gibt das Tempo vor. Aktuell: Kalender → Vokabelgenerator
(Verben/Adjektive) → dann weiter. Jeder Punkt wird getestet und live
gebracht, bevor der nächste beginnt.
