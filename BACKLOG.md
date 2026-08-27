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

- (frei – nächsten Punkt aus der Liste wählen)

---

## 📋 Offen – wird abgearbeitet

### Inhalte & Lernen
- [x] **Vokabelgenerator: Verben/Adjektive/Nomen als Auswahl.** Chips
      im KI-Listengenerator (Gemischt/Verben/Adjektive/Nomen), Server
      steuert die Wortart. Getestet: Sport→Verben, Wetter→Adjektive.
- [x] **Unter Memory die Vokabeln auflisten, mit Beispielsätzen.**
      „Die Wörter dieser Runde" unter dem Spielfeld aller vier Spiele –
      Sätze aus den vorhandenen Daten, kein KI-Aufruf. (Sound beim
      Treffer gibt es seit den Erfolgstönen.)
- [ ] **Lektionen: die deutschen Grundlagen als Text hörbar** machen.
- [x] **Animation + 2 XP, wenn man bei Ebooks Vokabeln hinzufügt.**
      „+2 XP"-Aufsteiger + Erfolgston beim Wort-Antippen im neuen
      Leser; „Alle übernehmen" gibt 2 XP pro Wort.

### Spotify / Songs
- [x] **Song-Ablage schöner + Ladesymbol + robuste Generierung**
      (24.08.): „Deine Songs" als Karten-Grid mit großen Thumbnails,
      Play-Overlay und Dauer. Treffer-Klick prüft erst den Songtext
      (Spinner „Songtext wird geprüft …") und springt bei schlechtem
      Treffer automatisch zum nächsten – vorher landete man auf einer
      Fehlerseite (gemessen: rumänisches Kinderlied vor dem Song).
- [ ] **Spotify: Entscheidung offen.** Bereich ist für normale Nutzer
      funktionslos (Entwicklungsmodus, nur freigeschaltete Konten).
      Schalter `SPOTIFY_ZEIGEN` in Songs.jsx liegt bereit – Manuel
      entscheidet: ausblenden oder Extended-Quota beantragen.
- [ ] **Spotify funktioniert wieder nicht, Songs wandeln sich nicht um,
      nichts wird gespeichert.** (Diagnose steht: Backend ok,
      Spotify-Entwicklungsmodus ist das Problem. Empfehlung: Songs ohne
      Spotify zuverlässig machen – Weg A.)
- [ ] **Generierte Songs schöner in der Ablage**, ordentliches
      Ladesymbol, und die Generierung muss zuverlässig funktionieren.

### Ebooks
- [x] **Ebooks vorerst ausgeblendet** (24.08., Manuels Wunsch). Der
      fertige Bereich samt neuem Leser bleibt im Code –
      `EBOOKS_ZEIGEN` in `src/Library.jsx` holt ihn zurück.
- [x] **Ebook-Leser neu.** BuchView in Library.jsx komplett neu:
      ← links, Español/Deutsch-Umschalter Mitte, → rechts; seitenweise
      lesen (1 Absatz je Seite), Fortschrittsbalken, letzte Seite =
      Vokabeln, jedes spanische Wort antippbar (Wortkarte mit X).

### Onboarding & Erklärung
- [x] **Rundgang für Neulinge + Infobox pro Bereich** – EIN System
      (`src/Rundgang.jsx`): Beim ersten Betreten eines Bereichs erklärt
      eine animierte Infobox (hüpfendes Icon, Funken), was man hier
      kann – einmalig, gemerkt in localStorage. Der Rundgang (Start im
      Leitfaden) klickt dieselben Boxen durch alle 5 Bereiche, die App
      wechselt selbst die Ansicht.
- [ ] **Übersetzungen am Anfang** sollen motivieren, jeden Tag in die App
      zu schauen. (Täglicher zweisprachiger Anreiz – teils „Land & Leute".)

### Fortschritt & Zahlen
- [x] **Analytics-Balken.** Vier farbige Balken auf der Startseite
      (Wörter orange, Lektionen grün, Songs violett, Videos blau),
      normiert auf den größten Wert, Zahl daneben.

### Look & Feel
- [ ] **Button-Branding**: weg von den Icons in den Buttons, mehr
      Button-Styles. (In der Notiz schon abgehakt – gegenprüfen.)
- [ ] **Bestehende Kategorien vorausgewählt** anzeigen. (In der Notiz
      abgehakt – gegenprüfen.)

---

### Neue Punkte (Notiz vom 24.08., zweiter Schwung)
- [x] **KI-Listengenerator ohne Tippen.** Die Themen-Chips generieren
      jetzt direkt beim Antippen; das Feld bleibt für eigene Themen.
- [ ] **Onboarding-KI-Funnel erst nach E-Mail-Eingabe** – die
      KI-Generierung im Trichter soll erst laufen, wenn die Mail
      eingetippt ist (sonst zahlt man für Besucher ohne Konto).
- [x] **Ausklappbare Vokabel-Liste entfernt** („Alle deine Wörter") –
      hinter Schalter WORTLISTE_ZEIGEN, eine Zeile holt sie zurück.
- [x] **„Land & Leute" heißt jetzt „Entdecken"** – und die drei
      Start-Türen (Sprechen, Entdecken, Leitfaden) haben je eine eigene
      farbige Icon-Kachel statt dreimal derselben weißen Karte.
- [x] **Erfolgssound anders + abstellbar.** Weicherer Klang (Sinus,
      leiser, kürzer) und Schalter „Erfolgstöne" unter Mehr → Ton –
      beim Einschalten spielt er einmal zur Probe.
- [x] **Kein Vokabel-Sound im Trainer.** Lautsprecher aus den
      Trainingskarten entfernt – einheitlich ohne Ton.
- [ ] **Karten-Swipe im Training** – rechts/links wischen, wenn man es
      weiß; das Wort bleibt kurz sichtbar.
- [x] **Neue Spiele verworfen** (24.08.): Wortschub (4 Richtungen) und
      Geheimwort (Wordle) wurden gebaut, Manuel wollte beide wieder
      raus – komplett entfernt, die vier bestehenden Spiele bleiben.
- [x] **Grammatik-Nachschlagbereich.** „Zeitformen nachschlagen" im
      Grammatik-Reiter: sechs Zeitformen als Konjugationstabellen
      (Presente bis Condicional) plus die wichtigsten Unregelmäßigen,
      je mit Merksatz und Signalwörtern. Von Hand geschrieben, keine KI.
- [x] **„Lektion geschafft"-Seite modernisiert.** Feier-Bildschirm mit
      Orange-zu-dunkel-Verlauf, animiertem Ring samt hochzählender
      Prozentzahl, Konfetti-Regen (bei bestanden), Statistik-Chips,
      Kulturnotiz-Karte, Erfolgston und gestaffelten Einblendungen.
## Reihenfolge

Manuel gibt das Tempo vor. Aktuell: Kalender → Vokabelgenerator
(Verben/Adjektive) → dann weiter. Jeder Punkt wird getestet und live
gebracht, bevor der nächste beginnt.
