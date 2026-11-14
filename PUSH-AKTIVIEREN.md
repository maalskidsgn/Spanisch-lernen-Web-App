# Push-Benachrichtigungen scharf schalten (Habloo)

Stand 14.11.2026: Code ist fertig, aber **aus** (`VITE_PUSH_AKTIV` nicht gesetzt).
Beim nächsten App-Update diese Schritte, dann ist Push dauerhaft da –
weitere Nachrichten brauchen nie wieder ein neues Paket.

## Einmalig einrichten
1. **Apple Developer → Identifiers → de.habloo.app → Push Notifications** einschalten.
2. **Apple Developer → Keys → neuer Schlüssel mit „Apple Push Notifications service (APNs)“**,
   .p8 herunterladen (nur einmal möglich!) → Key-ID notieren.
3. **Provisioning-Profil „Habloo App Store“** neu erzeugen (jetzt mit Push) und installieren.
4. In Xcode/pbxproj für das App-Target in Debug + Release
   `CODE_SIGN_ENTITLEMENTS = App/App.entitlements;` setzen (Datei liegt schon da).
5. **Firebase**: Projekt anlegen → Android-App `de.habloo.app` hinzufügen →
   `google-services.json` nach `android/app/` legen und committen (enthält keine Geheimnisse).
   Dienstkonto-JSON (Projekteinstellungen → Dienstkonten → Schlüssel erzeugen) für den Server.
6. **Coolify (Backend)**: `APNS_KEY_ID`, `APNS_KEY` (Inhalt der .p8, Umbrüche als \n),
   `FCM_SERVICE_ACCOUNT` (JSON in einer Zeile), `PUSH_ADMIN_SCHLUESSEL` (lange Zufallsfolge).
7. `VITE_PUSH_AKTIV=1` in die Build-Umgebung der App (`.env.production` bzw. `.env.app`).
8. App bauen, auf echtem Gerät anmelden, Mitteilungen erlauben, Testnachricht schicken.

## Nachricht schicken (nach dem Update, ohne neues Paket)
```bash
curl -X POST https://api.habloo.de/api/push/senden \
  -H "X-Push-Schluessel: $PUSH_ADMIN_SCHLUESSEL" -H "Content-Type: application/json" \
  -d '{"titel":{"de":"Neue Übung der Woche","en":"New exercise of the week"},
       "text":{"de":"5 Minuten, und du kannst …","en":"5 minutes and you can …"},
       "link":"/","ziel":{"nur":"gratis"},"probe":true}'
```
`probe: true` zählt nur die Empfänger. Ziel optional: `sprache` (de/en), `nur` (premium/gratis), `nutzer` (IDs).
Wöchentlich: n8n-Workflow „Sonntag 18 Uhr“ ruft denselben Endpunkt.

## Mindestversion
`GET /api/app/version?plattform=ios|android` → `{min, aktuell}`, Standard in `server/appVersion.js`,
überschreibbar per Coolify `APP_MIN_IOS`, `APP_AKTUELL_IOS`, `APP_MIN_ANDROID`, `APP_AKTUELL_ANDROID`.
Wirkt ab dem nächsten App-Paket (ältere Pakete fragen noch nicht).
**Erst erhöhen, wenn die neue Version im Store freigegeben ist.**
