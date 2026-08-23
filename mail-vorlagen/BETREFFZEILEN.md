# Betreffzeilen für die Supabase-Mail-Vorlagen

In Supabase: Authentication → Emails → Templates. Für jede Vorlage
oben den Betreff (Subject heading) eintragen und unten den HTML-Quelltext
aus der passenden Datei hier einfügen (Message body, Source-Ansicht).

| Vorlage in Supabase | Datei | Betreff |
|---|---|---|
| Confirm signup | confirm-signup.html | `Willkommen bei Habloo – bitte bestätige deine E-Mail` |
| Reset password | reset-password.html | `Habloo – dein Link zum neuen Passwort` |
| Magic Link | magic-link.html | `Dein Anmelde-Link für Habloo` |
| Change Email Address | change-email.html | `Habloo – neue E-Mail-Adresse bestätigen` |

Die Platzhalter ({{ .ConfirmationURL }}, {{ .Email }}, {{ .NewEmail }})
füllt Supabase beim Versand aus – NICHT ersetzen.

Warum Tabellen und Inline-Styles statt schönem CSS: Mailprogramme
sind keine Browser. Outlook, Gmail und Apple Mail werfen Stylesheets,
Flexbox, Webfonts und SVG unterschiedlich weg. Tabellen mit
Inline-Styles sind das Einzige, was überall gleich aussieht. Das Logo
ist deshalb eine orange Kachel mit dem Funken ✦ statt des SVG aus
der App – es erkennt jeder, und es bricht nirgends.
