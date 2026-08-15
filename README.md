# ¡Vamigo! – Spanisch lernen mit YouTube

Eine Spanisch-Lern-App im Stil von LingQ, Babbel und Duolingo – gebaut mit React.
Lerne mit echten YouTube-Videos, geführten Lektionen, einem Spaced-Repetition-Vokabeltrainer
und Gamification (XP, Level, Streaks).

**Branding "Sol y Noche":** Orange `#FF6C00` + Nachtblau `#000041` · Erfolgs-Smaragd `#2AAE5F` · Nunito

## Features

- 📺 **Videos**: YouTube-Link einfügen oder Videos entdecken → spanisches Transkript
  läuft als Karaoke mit, Wörter anklicken für Übersetzung, ganzes Transkript per
  Klick auf Deutsch. Nicht-einbettbare Videos werden automatisch ausgefiltert
- 🎓 **Lektionen**: Sprach-Reise in Modulen – Einleitung, neue Wörter mit Ton (🔊),
  "Gut zu wissen"-Tipps, animierte Chat-Dialoge, Multiple-Choice- und Lückentext-Übungen
- 🃏 **Vokabeltrainer**: Spaced Repetition (Karteikasten-Stufen von "Neu" bis "3 Monate"),
  Filter nach Fälligkeit, Mini-Spiele (Memory, Wortpaare, Kreuzworträtsel)
- ✨ **KI-Funktionen**: Vokabeln aus Videos generieren, Themen-Vokabellisten,
  Buchzusammenfassungen à la Blinkist (mit `ANTHROPIC_API_KEY`, sonst Freemium/Premium-Teaser)
- 🏆 **Gamification**: XP, Level mit Titeln, Tagesziel, Tagesserie (Streak),
  Level-Up-Feier, Konfetti
- ⚙️ **Einstellungen**: Abo-Bereich (Free/Premium), Tagesziel, Backup-Export/-Import

## Voraussetzungen

- [Node.js](https://nodejs.org) (Version 20+)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) für die YouTube-Transkripte:
  `brew install yt-dlp` (macOS) bzw. `pip install yt-dlp`

## Starten

```bash
npm install
npm run dev:all
```

Das startet den Transkript-Server (Port 8787) und die App (Port 5173).

Optional für die KI-Funktionen: `export ANTHROPIC_API_KEY=...` vor dem Start setzen.

## Technik

- **Frontend**: React + Vite, reines CSS (keine UI-Bibliothek), alle Daten in `localStorage`
- **Backend**: kleiner Express-Server (`server/index.js`) – holt Transkripte via yt-dlp,
  übersetzt über Google Translate, KI-Endpunkte über die Claude API (claude-opus-5)
- **Lerninhalte**: Lektionen und Module als einfache Daten in `src/lektionen.js` –
  neue Lektionen brauchen keinen Code, nur einen Eintrag

---

Mit Herz entwickelt von Klarwerk Digital
