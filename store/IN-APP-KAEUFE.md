# In-App-Käufe einrichten (Apple + Google)

Stand: 29. Oktober 2026. Der Code ist fertig und eingebaut, aber noch
**ungetestet** – es fehlen die Konten. Diese Datei sagt, was wo
anzulegen ist und in welcher Reihenfolge.

## Warum überhaupt

Apple und Google verlangen für digitale Inhalte ihre eigene Kasse
(Apple-Richtlinie 3.1.1). Stripe in der App wäre ein Ablehnungsgrund.
Im Browser auf habloo.de bleibt Stripe erlaubt – deshalb gibt es jetzt
beide Wege nebeneinander:

| Wo | Kasse | Datei |
|---|---|---|
| habloo.de im Browser | Stripe | `src/Bezahlen.jsx` |
| iOS-App | App Store | `src/KaufNativ.jsx` |
| Android-App | Google Play | `src/KaufNativ.jsx` |

Die Weiche steht in `src/App.jsx` und fragt nur eines ab: Läuft das
hier als echte App? Dann native Kasse.

**Wichtig:** Beide Wege schreiben in dieselbe Tabelle `abos`. Wer im
Browser per Stripe kauft, hat Premium auch in der App. Das ist
erlaubt. Umgekehrt genauso.

## Der Weg eines Kaufs

```
Nutzer tippt "Jetzt holen"
  → Apple/Google wickelt die Zahlung ab
  → RevenueCat bekommt den Beleg und prüft ihn
  → RevenueCat ruft POST /api/kauf/melden auf unserem Server
  → Server schreibt in "abos" (quelle: 'apple' / 'google')
  → premium.js liest "abos" – Premium ist da
```

Die App wartet nach dem Kauf bis zu 12 Sekunden darauf, dass die Zeile
auftaucht (`warteAufFreischaltung`). Ohne das sähe man direkt nach dem
Bezahlen noch die Premium-Werbung.

---

## Schritt 1: Apple Developer Program

<https://developer.apple.com/programs/> – 99 €/Jahr. Bei Neuanmeldung
dauert die Freischaltung teils mehrere Tage. **Damit anfangen**, der
Rest hängt daran.

## Schritt 2: Produkte in App Store Connect

App Store Connect → deine App → **Monetarisierung → Abonnements**.

Erst eine Abo-Gruppe anlegen (z. B. „Habloo Premium"), dann darin:

| Produkt-ID | Art | Preis |
|---|---|---|
| `habloo_premium_monat` | Auto-renewable, 1 Monat | wie bei Stripe |
| `habloo_premium_jahr` | Auto-renewable, 1 Jahr | wie bei Stripe |

Lifetime ist **kein** Abo, sondern unter **In-App-Käufe** als
*Non-Consumable* anzulegen:

| Produkt-ID | Art |
|---|---|
| `habloo_premium_lifetime` | Non-Consumable |

> Die Namen sind nicht beliebig: Der Server liest den Tarif aus der
> Produkt-ID (`tarifVon` in `server/kauf.js`). Enthält sie „jahr",
> wird daraus `jaehrlich`, bei „lifetime" wird daraus `lifetime`.
> Alles andere gilt als monatlich. Wer andere Namen nimmt, muss dort
> nachziehen.

Jedes Produkt braucht ausserdem einen Anzeigenamen, eine Beschreibung
und ein Screenshot zur Prüfung – sonst bleibt es „fehlende
Metadaten" und ist nicht kaufbar.

## Schritt 3: Google Play

Play Console → **Monetarisierung → Produkte**. Dieselben drei IDs
anlegen, Lifetime als Einmalkauf. Kann warten, bis iOS steht.

## Schritt 4: RevenueCat

<https://app.revenuecat.com> – kostenlos bis 2.500 $ Umsatz im Monat.

1. Projekt „Habloo" anlegen.
2. App hinzufügen → **App Store**. Dort braucht RevenueCat den
   *In-App Purchase Key* (App Store Connect → Benutzer und Zugriff →
   Integrationen → In-App-Kauf) und die *App-spezifische gemeinsame
   Geheimnis*.
3. **Products**: die drei Produkt-IDs von oben eintragen.
4. **Entitlements**: eines anlegen mit der Kennung **`premium`** –
   genau so geschrieben, der Code prüft darauf (`BERECHTIGUNG` in
   `src/kauf.js`). Alle drei Produkte dort zuordnen.
5. **Offerings**: ein Offering als *Current* markieren, darin die
   Pakete `$rc_monthly`, `$rc_annual`, `$rc_lifetime`. Aus diesen
   Paketen baut `ladeAngebote()` die Auswahl – Preis und Währung
   kommen vom Store, nicht von uns.
6. **API Keys** (Project Settings → API Keys): den *Public SDK Key*
   für Apple (`appl_…`) und später für Google (`goog_…`) kopieren.
7. **Integrations → Webhooks**: URL `https://api.habloo.de/api/kauf/melden`,
   als *Authorization header* einen selbst ausgedachten langen Text
   eintragen – denselben, der unten in `REVENUECAT_WEBHOOK_SECRET`
   steht.

## Schritt 5: Umgebungsvariablen

Im Coolify-Dienst der App (Hetzner) eintragen und neu ausrollen:

```
VITE_REVENUECAT_APPLE_KEY=appl_…      # Public SDK Key von RevenueCat
VITE_REVENUECAT_GOOGLE_KEY=goog_…     # erst wenn Android dran ist
REVENUECAT_WEBHOOK_SECRET=…           # derselbe Text wie im Webhook
```

Ohne `VITE_REVENUECAT_APPLE_KEY` zeigt die App weiter die
Stripe-Kasse – `kaufMoeglich()` ist dann schlicht `false`. Es geht
also nichts kaputt, solange die Schlüssel fehlen.

## Schritt 6: Testen

Noch **vor** dem Einreichen, im Sandbox-Modus:

1. App Store Connect → Benutzer und Zugriff → **Sandbox-Tester**
   anlegen (eine E-Mail-Adresse, die noch keine Apple-ID ist).
2. Auf dem Testgerät: Einstellungen → App Store → Sandbox-Konto
   → mit diesem Tester anmelden.
3. App über Xcode installieren, Premium kaufen.
4. Prüfen: Kommt in Supabase eine Zeile in `abos` mit
   `quelle = 'apple'` an? Falls nicht, liegt es fast immer am
   Webhook – RevenueCat zeigt unter *Integrations → Webhooks* jede
   Zustellung samt Antwort unseres Servers.
5. „Käufe wiederherstellen" ebenfalls durchspielen. Apple prüft das
   und lehnt Apps ab, bei denen es fehlt.

Sandbox-Abos laufen beschleunigt: Ein Monatsabo erneuert sich alle
fünf Minuten und läuft nach sechs Erneuerungen aus. Gut, um
`RENEWAL` und `EXPIRATION` zu sehen, ohne zu warten.

---

## Was noch offen ist

- [ ] `TESTPHASE_ALLES_FREI` in `src/premium.js` **und**
      `server/gespraech.js` auf `false` – solange beide `true` sind,
      hat jeder Premium geschenkt und die Kasse bekommt niemand zu
      sehen. Zum Ausprobieren gibt es `habloo.de/?testkauf=1`.
- [ ] `npx cap sync ios` nach dem nächsten Build – sonst fehlt das
      RevenueCat-Plugin im Xcode-Projekt.
- [ ] Datenschutzangaben in App Store Connect: RevenueCat zählt als
      Drittanbieter und muss dort genannt werden.
