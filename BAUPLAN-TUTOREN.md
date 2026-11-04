# Bauplan: Tutoren-MVP für Habloo

Stand 04.11.2026. Ziel: Eine Tutorin (Yulibeth), 1:1-Stunden, Bezahlung
über habloo.de. Zwei Wochen echt laufen lassen, dann entscheiden, ob die
Plattform-Stufe (mehrere Tutoren, Gruppen, Dashboard) gebaut wird.

## Was vorher von dir kommen muss

Ohne diese vier Antworten fange ich nicht an – sie bestimmen Preis,
Datenmodell und AGB:

1. **Yulibeths Stundensatz** und Auszahlungsweg (Wise, Rechnung).
2. **Paketpreise.** Vorschlag: 4 Std. 69 € · 8 Std. 129 €, Probestunde 9 €.
   Stunden verfallen nach 2 Monaten (steht in den AGB).
3. **Stornofrist.** Vorschlag: bis 24 h vorher kostenlos, danach verfällt
   die Stunde. Tutorin sagt ab → Stunde zurück aufs Konto.
4. **Yulibeths feste Wochenslots** für den Start (z. B. Mo–Fr 16–20 Uhr
   deutscher Zeit) – ihre Zeitzone brauche ich.

## Was schon da ist und wiederverwendet wird

| Baustein | Wo | Einsatz |
|---|---|---|
| Stripe Checkout + Webhook | `server/bezahlung.js` | Pakete als Einmalzahlung, gleicher Webhook-Pfad |
| Abo-Tabelle | Supabase `abos` | Vorbild für die neue Tabelle `stunden` |
| Mail-Rahmen zweisprachig | `server/mail.js` | Buchungs- und Erinnerungsmails |
| Sprache des Nutzers | `user_metadata.sprache` | Mails in seiner Sprache |
| Tutorin-Profil | `src/tutoren.js`, `Home.jsx` (TutorProfil) | wird zur Buchungsseite |
| Warteliste | Listmonk Liste 13 | erste Einladung zum Start |

## Datenmodell (Supabase, 3 Tabellen)

```
tutoren        id, name, zeitzone, aktiv, meet_link
slots          id, tutor_id, wochentag, von, bis         (feste Wochenslots)
buchungen      id, nutzer_id, tutor_id, beginn (UTC), dauer_min,
               status (gebucht | storniert | erledigt | no_show),
               erstellt, storniert_am
stunden        nutzer_id, guthaben_min, verfaellt_am       (das Stundenkonto)
```

Alle Zeiten in UTC. Angezeigt wird in der Zeitzone des Browsers –
Schüler in Berlin, du in Buenos Aires, Yulibeth wo auch immer sehen
denselben Termin richtig. Das ist der Teil, der am häufigsten schiefgeht.

## Die vier Abläufe

**1. Paket kaufen** (habloo.de/unterricht)
Paket wählen → Stripe Checkout (bestehender Weg, nur anderer Preis) →
Webhook schreibt Minuten ins Stundenkonto → Mail „Dein Paket ist da".

**2. Stunde buchen**
Kalender zeigt die nächsten 14 Tage aus den Wochenslots, minus bereits
gebuchte, minus Vorlauf (mindestens 12 h) → Slot antippen → Bestätigen →
Minuten werden abgezogen, Buchung angelegt → Mail an Schüler **und** an
Yulibeth mit Meet-Link und Kalenderdatei (.ics).

**3. Erinnern**
Cron auf dem Server (wie der Mail-Cron): 24 h und 1 h vorher Mail mit
Link. Danach Status automatisch „erledigt".

**4. Stornieren**
Schüler: bis 24 h vorher über die Buchungsliste, Minuten zurück.
Yulibeth: jederzeit über einen Link in ihrer Mail (Token), Minuten
zurück, Schüler bekommt Mail.

## In den Apps

- **iOS:** Tutorin-Profil + Knopf „Buchen auf habloo.de" (erlaubt, 3.1.3 d).
- **Android:** Profil + Hinweis „Buchbar auf habloo.de" – **kein Link,
  kein Knopf**, bis Googles Regel zu 1:1 geklärt ist.
- Buchungsliste und Stundenkonto in beiden Apps **anzeigen** ist ok –
  nur kaufen nicht.

## Zeitplan

| Tag | Was | Ergebnis, das du prüfen kannst |
|---|---|---|
| 1 | Tabellen, Stundenkonto, Stripe-Pakete | Paket kaufen → Minuten erscheinen im Profil |
| 2 | Kalender + Buchen + Stornieren | Stunde buchen und wieder absagen, Konto stimmt |
| 3 | Mails (DE/EN), .ics, Erinnerungs-Cron, Yulibeths Absage-Link | Mails kommen bei beiden an, Kalender-Eintrag öffnet sich |
| 4 | Buchungsseite auf habloo.de, App-Ansichten, AGB-Absatz, Testlauf mit Yulibeth | eine echte Probestunde durchgespielt |

Vier Arbeitstage, über eine Woche verteilt – du testest nach jedem Tag.

## Was bewusst NICHT im MVP ist

- Kein eigenes Video – Yulibeths fester Meet-/Jitsi-Link reicht.
- Kein Tutoren-Login – Yulibeth bekommt alles per Mail, Slots trage ich ein.
- Keine Bewertungen, kein Dashboard, keine Auszahlungsübersicht –
  du rechnest nach zwei Wochen einmal von Hand ab.
- Kein Gruppenunterricht – der gehört ins Abo „Pro + Live" über die
  Stores, das ist ein eigener Bauabschnitt.

## Offene Risiken

- **Google-Regel zu 1:1** – vor dem Android-Update prüfen.
- **§ 19 UStG:** ~15 Abos à 140 € und die Grenze ist erreicht. Preise
  dann inkl. 19 % – lieber jetzt schon so kalkulieren.
- **Beide Premium-Stände:** IAP-Abo und Stripe-Abo müssen dasselbe
  Konto freischalten. Ist heute so, muss beim Paket-Webhook so bleiben.
