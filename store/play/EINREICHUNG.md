# Habloo im Google Play Store – alle Antworten

Stand: 24. August 2026. Alles hier ist aus dem Quelltext erhoben, nicht
geraten. Wo eine Angabe von einer Codestelle abhängt, steht sie dabei –
wenn sich der Code ändert, muss die Angabe nachgezogen werden.

**Paket:** `de.habloo.app` · **Version:** 1.0 (versionCode 1)
**Bundle:** `android/app/build/outputs/bundle/release/app-release.aab`
**Signatur-Fingerabdruck (SHA-256):**
`42:84:57:32:8F:EC:65:94:E0:F9:A5:B4:5A:5E:C2:20:DD:4B:B5:9E:2A:67:59:43:C5:6A:D4:08:D7:6D:1D:83`
Zertifikat gültig bis 13.08.2051 (Play verlangt mindestens 2033).

---

## ✅ Erledigt am 24.08.: eigene Server-Domain

Die App ruft ihren Server jetzt unter **`https://api.habloo.de`**.

Vorher stand dort die Coolify-Behelfsadresse mit der Server-IP darin.
Bei einer Website ist das gleichgültig, die lädt bei jedem Aufruf neu.
Bei einer installierten App nicht: Die Adresse steckt fest im Paket.
Ein Serverumzug hätte jede installierte App lahmgelegt, bis der letzte
Nutzer eine neue Version aus dem Store geholt hat.

Im KAS war dafür **nichts zu tun** – der vorhandene Wildcard-Eintrag
(`* A 2.28.31.213`) deckt `api.habloo.de` bereits ab. Eingerichtet
wurde nur die Domain am Backend in Coolify; Let's-Encrypt-Zertifikat
läuft bis 22.11.2026. Die alte Adresse antwortet weiter, damit nichts
abreißt.

Nachgemessen im fertigen Paket: **kein einziges Vorkommen** von
`sslip.io` oder `2.28.31.213` mehr, weder im Programm noch in den
Ressourcen.

---

## 1. App-Inhalte → Anmeldedaten (der Bildschirm, den du offen hast)

**Ist ein Teil deiner App zugangsbeschränkt?** → **Ja**

Denn: Ohne Konto zeigt die App nur die Willkommensseite
(`src/App.jsx`, „Zugang: ohne Konto geht es nicht weiter"). Alles
andere – Lektionen, Trainer, Mediathek – liegt dahinter.

Dann „Anmeldedaten hinzufügen" und eintragen:

| Feld | Wert |
|---|---|
| Name | `Vollzugriff (E-Mail-Konto)` |
| Nutzername | `play-review@habloo.de` |
| Passwort | steht in `.env.local` unter `PLAY_REVIEW_PASS` |
| Erforderlich für | Alle Bereiche |

**Das Konto ist angelegt und getestet** (24.08.): Es ist ohne
Bestätigungsmail freigeschaltet – der Prüfer kann kein Postfach öffnen –
und die Anmeldung damit wurde erfolgreich durchgeführt (HTTP 200,
Sitzung erhalten).

Ins Feld „Weitere Anweisungen":

> Die App ist auf Deutsch für deutschsprachige Spanischlernende.
> Nach dem Start auf „Ich habe schon ein Konto" tippen und mit den
> oben genannten Daten anmelden. Danach sind alle Bereiche offen.
> Es gibt keine Zahlungsfunktion in der App.

---

## 2. App-Inhalte → Datensicherheit

Die entscheidende Angabe zuerst, weil sie fast immer falsch gemacht
wird:

> **In der Android-App läuft KEIN Google Analytics.**
> `messungMoeglich()` in `src/messung.js` gibt `!istApp && …` zurück –
> die Messung ist auf der Website aktiv, in der App abgeschaltet. Also
> **keine** Geräte-IDs, **keine** Werbe-IDs, **kein** Tracking
> deklarieren. Die Website ist für dieses Formular irrelevant.

### Erhoben wird

| Datentyp | Erhoben | Geteilt | Pflicht | Zweck |
|---|---|---|---|---|
| E-Mail-Adresse | Ja | Nein | Ja | Kontoverwaltung |
| Name (Anzeigename) | Ja | Nein | Nein | Kontoverwaltung |
| App-Aktivität (Lernfortschritt, gesammelte Vokabeln) | Ja | Nein | Ja | App-Funktionalität |
| Suchverlauf (Videosuche in der Mediathek) | Ja | Nein | Nein | App-Funktionalität |
| Sonstige nutzergenerierte Inhalte (eigene Wortlisten) | Ja | Nein | Ja | App-Funktionalität |

„Geteilt" ist überall **Nein**: Auftragsverarbeiter (Supabase, Hetzner,
OpenAI) gelten nach Googles Definition nicht als Weitergabe.

### Sicherheitsfragen

- Werden Daten bei der Übertragung verschlüsselt? → **Ja** (durchgehend HTTPS)
- Können Nutzer die Löschung ihrer Daten beantragen? → **Ja**
- **Adresse für Löschanfragen:** `https://habloo.de/konto-loeschen`
- Wurde die App unabhängig auf Sicherheit geprüft? → **Nein**

---

## 3. App-Inhalte → weitere Erklärungen

| Frage | Antwort | Begründung |
|---|---|---|
| Datenschutzerklärung | `https://habloo.de/datenschutz` | seit 24.08. als eigene Adresse aufrufbar |
| Werbung | **Nein**, enthält keine Werbung | Es gibt keine |
| Zielgruppe | **18 und älter** | Kein Kinderangebot; damit greift „Familienrichtlinie" nicht |
| Ads-ID | wird **nicht** verwendet | Keine Werbebibliothek im Paket |
| Regierungs-App | Nein | |
| Finanzprodukte | Nein | |
| Gesundheits-App | Nein | |
| Datensicherheit: SDK-Index | keine Drittanbieter-SDKs | Capacitor ist kein Daten-SDK |

### Inhaltsklassifizierung (IARC-Fragebogen)

Kategorie: **Bildung / Referenz**. Alle Fragen nach Gewalt, Sexualität,
Schimpfwörtern, Drogen, Glücksspiel, Angst → **Nein**.

Zwei Fragen, bei denen man aufpassen muss:

- **„Können Nutzer miteinander kommunizieren?"** → **Nein.** Es gibt
  keinen Chat, keine Kommentare, keine Freundesliste.
- **„Wird der ungefähre oder genaue Standort weitergegeben?"** → **Nein.**
- **„Enthält die App nutzergenerierte Inhalte, die andere sehen?"** →
  **Nein.** Wortlisten sieht nur der eigene Nutzer.

Erwartetes Ergebnis: **USK 0 / PEGI 3**.

---

## 4. Store-Eintrag

**App-Name** (max. 30 Zeichen)

```
Habloo – Spanisch lernen
```

**Kurzbeschreibung** (max. 80 Zeichen)

```
Spanisch lernen mit echten Videos, 150 Lektionen und einem klugen Trainer.
```

**Vollständige Beschreibung** (max. 4000 Zeichen)

```
Spanisch lernen mit dem, was du sowieso schaust.

Habloo baut deinen Spanischkurs um echte Inhalte herum: YouTube-Videos
mit mitlaufenden Untertiteln, spanische Songs mit Text – und einen
Vokabeltrainer, der sich merkt, wann du ein Wort zu vergessen drohst.

DER KURS
150 Lektionen in sieben Modulen, vom ersten „Hola" bis zum freien
Erzählen. Jede Lektion ist in wenigen Minuten geschafft und komplett
vertont – von echten Stimmen, nicht von der Vorlesestimme deines
Handys. Zwischendurch warten Prüfstationen, an denen du siehst, was
wirklich sitzt.

DER VOKABELTRAINER
Jedes Wort, das du beim Video-Schauen oder in einer Lektion anklickst,
landet in deinem Karteikasten. Der zeigt es dir genau dann wieder,
wenn du kurz davor bist, es zu vergessen – und schiebt es immer weiter
nach hinten, je sicherer du wirst.

HÖRVERSTEHEN
In „Mitgehört" hörst du echte Gespräche: im Café, beim Arzt, an der
Rezeption. Erst zuhören und Fragen beantworten, danach den Dialog
mitlesen. In dieser Reihenfolge, damit es Hören bleibt und nicht Lesen
wird.

LAND & LEUTE
Jeden Tag ein kurzes Stück über Spanien und Lateinamerika – auf
Spanisch, mit deutscher Übersetzung daneben, die du ausblenden kannst.
Die Sobremesa, der Día de Muertos, der Mate, die zwölf Weintrauben an
Silvester. Alle Wörter daraus gehen auf einen Tipp in deinen Trainer.

GRAMMATIK IN BAUSTEINEN
Kein Regelwerk zum Auswendiglernen, sondern 55 kleine Bausteine mit
Aufgaben – ser oder estar, die Vergangenheitsformen, der Subjuntivo,
Schritt für Schritt.

DEINE MEDIATHEK
Such nach einem Thema, das dich interessiert, und Habloo findet
passende spanische Videos mit Untertiteln. Unbekannte Wörter antippen,
Übersetzung sehen, in den Trainer legen. Spanische Songs mit Text
gibt es dazu.

Habloo ist auf Deutsch und für deutschsprachige Lernende gemacht.
Fragen? lernen@habloo.de
```

**Kategorie:** Bildung
**Tags:** Sprachenlernen, Spanisch, Vokabeln
**E-Mail:** `lernen@habloo.de`
**Website:** `https://habloo.de`

### Grafiken (liegen alle in diesem Ordner, Maße geprüft)

| Datei | Maße | wofür |
|---|---|---|
| `symbol-512.png` | 512 × 512 | App-Symbol |
| `feature-1024x500.png` | 1024 × 500 | Feature-Grafik |
| `1-start.png` | 1080 × 1920 | Startseite |
| `2-land-und-leute.png` | 1080 × 1920 | Land & Leute |
| `3-sprach-reise.png` | 1080 × 1920 | Modulübersicht |
| `4-lektion.png` | 1080 × 1920 | Lektion |
| `5-trainer.png` | 1080 × 1920 | Vokabeltrainer |

Das Symbol ist aus `public/favicon.svg` in 512 px **neu gerendert**,
nicht aus dem 192er hochskaliert. Die Bildschirmfotos sind echte
Aufnahmen der laufenden App bei 1080 × 1920.

---

## 5. Was ich NICHT gemacht habe – und warum

**Die Einreichung selbst.** Ich melde mich nicht in deinem
Google-Konto an, akzeptiere keine Nutzungsbedingungen in deinem Namen
und drücke nicht auf „Veröffentlichen". Das sind Erklärungen, für die
du haftest, keine Programmierarbeit. Die Antworten oben kannst du
abtippen oder hineinkopieren; das dauert eine knappe halbe Stunde.

**Zahlungen.** Habloo verkauft die Abos über Stripe. In der App ist
jeder Kauf und jeder Link nach draußen ausgeblendet – siehe `istApp`
in `src/Settings.jsx`, dort steht nur der neutrale Satz „Ein
bestehendes Premium-Abo wird nach der Anmeldung automatisch erkannt."
**Das ist die Voraussetzung dafür, dass Google die Stripe-Abos nicht
als Umgehung der Play-Abrechnung wertet.** Wenn du in der App je einen
Kaufknopf oder einen Link zur Website einbaust, verstößt sie gegen die
Zahlungsrichtlinie und fliegt raus. Wer in der App bezahlen können
soll, braucht Google Play Billing – das ist ein eigenes Projekt.

**Rechtstexte.** Impressum, Datenschutz und AGB sind Entwürfe von mir.
Für ein kostenpflichtiges Verbraucher-Abo gehört das einmal über einen
Anwalt, bevor die App öffentlich ist.

---

## 6. Reihenfolge

1. In der Play Console: **Testen und veröffentlichen → Interner Test**
   – erst dorthin, nicht direkt in die Produktion
2. Bundle hochladen, Abschnitte 1–4 dieser Datei abarbeiten
3. Selbst auf deinem Handy installieren und durchklicken
4. Erst dann Produktion beantragen

Google prüft bei einem neuen Entwicklerkonto oft mehrere Tage bis zwei
Wochen. Rechne nicht damit, dass es heute noch live geht.
