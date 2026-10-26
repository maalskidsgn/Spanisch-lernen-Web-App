#!/usr/bin/env python3
"""Habloo-Blog: baut statische, suchmaschinenfreundliche Seiten nach public/blog/ (Vite kopiert sie 1:1 nach dist/).

  python3 scripts/blog/baue.py

Warum statisch: Die App ist eine Single-Page-App ohne Router – Google sieht dort nur leeres HTML.
Blogseiten sind deshalb fertiges HTML im Habloo-Look (Creme, weiße Karten, Orange, Nunito).
Caddy liefert /blog/xyz/ über die Regel {path}/index.html aus.

Neuer Beitrag: Funktion schreiben, die (slug, titel, beschreibung, html_inhalt, extra_head) liefert, und in BEITRAEGE eintragen.
"""
import html
import json
import os
import shutil
from datetime import date

HIER = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(os.path.dirname(HIER))
PUBLIC = os.path.join(APP, "public")
BLOG = os.path.join(PUBLIC, "blog")
SOCIAL = os.path.expanduser("~/habloo-social")
DOMAIN = "https://habloo.de"
e = html.escape

LOGO = ('<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'
        '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10c1.5-1.6 3-1.6 4 0s2.5 1.6 4 0"/></svg>')

CSS = """
:root{--primary:#ff6c00;--dunkel:#d65a00;--navy:#000041;--gruen:#1f9450;--bg:#fdf7f1;--card:#fff;--flaeche:#f5f1ea;--line:#eee8e0;--muted:#6b6053;--zart:#fff1e6;
--schatten:0 18px 48px -28px rgba(31,26,60,.25)}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--navy);font-family:Nunito,'Segoe UI',Arial,sans-serif;font-size:18px;line-height:1.7}
a{color:var(--dunkel)}
.kopf{position:sticky;top:0;z-index:5;background:rgba(253,247,241,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.kopf-in{max-width:1080px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.logo{display:flex;align-items:center;gap:10px;font-weight:900;font-size:24px;letter-spacing:-.03em;color:var(--navy);text-decoration:none}
.logo i{width:40px;height:40px;border-radius:12px;background:var(--primary);display:grid;place-items:center;box-shadow:0 8px 18px -8px rgba(255,108,0,.7)}
.logo svg{width:24px;height:24px}
.nav{display:flex;align-items:center;gap:18px;font-weight:800;font-size:16px}
.nav a{color:var(--navy);text-decoration:none}
.btn{display:inline-block;background:var(--primary);color:#fff!important;font-weight:800;text-decoration:none;padding:12px 24px;border-radius:999px;
 box-shadow:0 12px 26px -12px rgba(255,108,0,.75)}
.btn:hover{transform:translateY(-1px)}
main{max-width:820px;margin:0 auto;padding:40px 20px 80px}
.brot{font-size:15px;font-weight:700;color:var(--muted);margin-bottom:18px}.brot a{color:var(--muted)}
h1{font-size:clamp(34px,6vw,52px);line-height:1.1;letter-spacing:-.03em;font-weight:900;margin:0 0 18px;text-wrap:balance}
h2{font-size:clamp(26px,4vw,34px);line-height:1.2;letter-spacing:-.02em;font-weight:900;margin:56px 0 14px}
h3{font-size:22px;font-weight:900;margin:32px 0 10px;scroll-margin-top:90px}
.lead{font-size:21px;color:var(--muted);font-weight:600}
.meta{font-size:15px;color:var(--muted);font-weight:700;margin-bottom:30px}
.karte{background:var(--card);border:1px solid var(--line);border-radius:24px;box-shadow:var(--schatten);padding:24px 26px;margin:22px 0}
.video{border-radius:24px;overflow:hidden;box-shadow:var(--schatten);background:#05051f;aspect-ratio:16/9}
.video video,.video iframe{width:100%;height:100%;display:block;border:0}
.hinweis{background:var(--zart);border-radius:18px;padding:18px 22px;font-weight:600}
.schritte{counter-reset:s;list-style:none;padding:0}
.schritte li{counter-increment:s;position:relative;padding-left:52px;margin:14px 0}
.schritte li::before{content:counter(s);position:absolute;left:0;top:0;width:36px;height:36px;border-radius:50%;background:var(--primary);color:#fff;font-weight:900;display:grid;place-items:center}
table{width:100%;border-collapse:collapse;font-size:17px}
th{text-align:left;font-size:14px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding:6px 10px}
td{padding:9px 10px;border-top:1px solid var(--line)}
td.es{font-weight:900}
td.play{width:46px}
.abspielen{width:36px;height:36px;border-radius:50%;border:0;background:var(--zart);color:var(--dunkel);font-size:15px;cursor:pointer;display:grid;place-items:center}
.abspielen.an{background:var(--primary);color:#fff}
.inhalt-nav{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}
.inhalt-nav a{background:#fff;border:1.5px solid var(--line);border-radius:999px;padding:6px 14px;font-weight:800;font-size:15px;text-decoration:none;color:var(--navy)}
details{background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 22px;margin:12px 0}
summary{font-weight:900;cursor:pointer}
.cta{background:var(--navy);color:#fff;border-radius:28px;padding:34px 30px;margin-top:56px;text-align:center}
.cta h2{color:#fff;margin-top:0}.cta p{color:rgba(255,255,255,.8)}
.liste{display:grid;gap:20px;margin-top:30px}
.liste a.karte{display:block;text-decoration:none;color:var(--navy);margin:0}
.liste a.karte:hover{border-color:#ffc9a1}
.liste .tag{font-size:14px;font-weight:800;color:var(--dunkel);letter-spacing:.06em;text-transform:uppercase}
.liste h2{margin:6px 0 8px;font-size:26px}
.liste p{margin:0;color:var(--muted)}
.fuss{border-top:1px solid var(--line);padding:30px 20px;text-align:center;font-size:15px;color:var(--muted)}
.fuss a{color:var(--muted);margin:0 10px}
@media(max-width:600px){.nav .weg{display:none}body{font-size:17px}.karte{padding:18px}td{padding:8px 6px}}
"""


def seite(titel, beschreibung, pfad, inhalt, extra_head=""):
    url = f"{DOMAIN}{pfad}"
    return f"""<!doctype html>
<html lang="de"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(titel)}</title>
<meta name="description" content="{e(beschreibung)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article"><meta property="og:title" content="{e(titel)}">
<meta property="og:description" content="{e(beschreibung)}"><meta property="og:url" content="{url}">
<meta property="og:site_name" content="Habloo"><meta property="og:locale" content="de_DE">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>{CSS}</style>{extra_head}
</head><body>
<header class="kopf"><div class="kopf-in"><a class="logo" href="/"><i>{LOGO}</i>Habloo</a>
<nav class="nav"><a class="weg" href="/blog/">Ratgeber</a><a class="btn" href="/">Kostenlos starten</a></nav></div></header>
{inhalt}
<footer class="fuss">© {date.today().year} Habloo · <a href="/blog/">Ratgeber</a><a href="/impressum">Impressum</a><a href="/datenschutz">Datenschutz</a><a href="/agb">AGB</a></footer>
</body></html>"""


# ───────────────────────── Beitrag: Spanisch lernen im Schlaf ─────────────────────────
def schlaf():
    slug = "spanisch-lernen-im-schlaf"
    ordner = os.path.join(BLOG, slug)
    os.makedirs(os.path.join(ordner, "audio"), exist_ok=True)
    themen = json.load(open(os.path.join(HIER, "inhalte", "schlaf-vokabeln.json"), encoding="utf-8"))
    # Medien aus ~/habloo-social übernehmen (spanische Aussprache je Wort, 90-s-Vorschau, Vorschaubild)
    n = 0
    for t, liste in themen.items():
        for es, de in liste:
            quelle = os.path.join(SOCIAL, "schlaf", "stimme", f"es{n:03d}.mp3")
            if os.path.exists(quelle):
                shutil.copy(quelle, os.path.join(ordner, "audio", f"{n:03d}.mp3"))
            n += 1
    for q, z in [("schlaf/ausgabe/vorschau-90s.mp4", "vorschau.mp4"), ("schlaf/bilder/intro.png", "titelbild.png")]:
        if os.path.exists(os.path.join(SOCIAL, q)):
            shutil.copy(os.path.join(SOCIAL, q), os.path.join(ordner, z))
    youtube_id = ""   # nach dem YouTube-Upload eintragen → dann wird statt der Vorschau die ganze Stunde eingebettet

    titel = "Spanisch lernen im Schlaf: 150 Vokabeln zum Einschlafen (mit Audio)"
    beschreibung = ("150 spanische Grundwörter für Anfänger – ruhig gesprochen, mit Übersetzung und Audio zu jedem Wort. "
                    "Plus: Was die Forschung über Lernen im Schlaf wirklich sagt.")

    tabellen, nav, n = "", "", 0
    for t, liste in themen.items():
        anker = t.lower().replace(" & ", "-").replace(" ", "-").replace("ä", "ae").replace("ö", "oe").replace("ü", "ue")
        nav += f'<a href="#{anker}">{e(t)}</a>'
        zeilen = ""
        for es, de in liste:
            zeilen += (f'<tr><td class="play"><button class="abspielen" data-a="audio/{n:03d}.mp3" aria-label="{e(es)} anhören">▶</button></td>'
                       f'<td class="es" lang="es">{e(es)}</td><td>{e(de)}</td></tr>')
            n += 1
        tabellen += f'<h3 id="{anker}">{e(t)}</h3><div class="karte"><table><thead><tr><th></th><th>Spanisch</th><th>Deutsch</th></tr></thead><tbody>{zeilen}</tbody></table></div>'

    if youtube_id:
        video = (f'<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/{youtube_id}" title="{e(titel)}" loading="lazy" '
                 f'allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>')
    else:
        video = ('<div class="video"><video controls preload="none" poster="titelbild.png" src="vorschau.mp4"></video></div>'
                 '<p class="meta" style="margin-top:10px">Hier hörst du die ersten 90 Sekunden. Die ganze Stunde erscheint auf unserem YouTube-Kanal.</p>')

    faq = [
        ("Kann man im Schlaf eine Sprache lernen?",
         "Ganz neue Wörter lernt das Gehirn im Tiefschlaf kaum. Was du aber kurz vor dem Einschlafen gehört hast, wird im Schlaf gefestigt. "
         "In Laborstudien half es Teilnehmenden sogar, wenn ihnen kurz zuvor gelernte Wörter im Schlaf leise noch einmal vorgespielt wurden."),
        ("Wie nutze ich das Video am besten?",
         "Hör die ersten Minuten bewusst zu und sprich leise mit. Danach darfst du einfach entspannen und einschlafen – die Wiederholung im Hintergrund schadet nicht."),
        ("Für welches Niveau sind die Vokabeln?",
         "Für Anfänger (Niveau A1): Begrüßung, Familie, Zuhause, Essen, Natur, Zeit, Gefühle, Unterwegs, wichtige Verben sowie Körper und Farben."),
        ("Welches Spanisch hört man?",
         "Die Aussprache ist kastilisch, also so, wie man in Spanien spricht. Die Stimmen sind KI-generiert."),
    ]
    faq_html = "".join(f"<details><summary>{e(f)}</summary><p>{e(a)}</p></details>" for f, a in faq)
    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "Article", "headline": titel, "description": beschreibung, "inLanguage": "de",
             "image": f"{DOMAIN}/blog/{slug}/titelbild.png", "author": {"@type": "Organization", "name": "Habloo"},
             "publisher": {"@type": "Organization", "name": "Habloo", "logo": {"@type": "ImageObject", "url": f"{DOMAIN}/apple-touch-icon.png"}},
             "datePublished": date.today().isoformat(), "mainEntityOfPage": f"{DOMAIN}/blog/{slug}/"},
            {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": f, "acceptedAnswer": {"@type": "Answer", "text": a}} for f, a in faq]},
            {"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Habloo", "item": f"{DOMAIN}/"},
                {"@type": "ListItem", "position": 2, "name": "Ratgeber", "item": f"{DOMAIN}/blog/"},
                {"@type": "ListItem", "position": 3, "name": "Spanisch lernen im Schlaf", "item": f"{DOMAIN}/blog/{slug}/"}]},
        ]}
    extra = f'<meta property="og:image" content="{DOMAIN}/blog/{slug}/titelbild.png"><script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>'

    inhalt = f"""<main>
<div class="brot"><a href="/">Habloo</a> › <a href="/blog/">Ratgeber</a> › Spanisch lernen im Schlaf</div>
<h1>{e(titel)}</h1>
<p class="lead">Leg dich hin, mach das Licht aus und hör einfach zu: 150 spanische Grundwörter, ruhig gesprochen und jeweils ins Deutsche übersetzt. Unten findest du alle Vokabeln zum Nachlesen – jede mit Audio.</p>
{video}

<h2>Kann man im Schlaf wirklich Spanisch lernen?</h2>
<p>Die ehrliche Antwort: <strong>Ganz neue Wörter lernst du im Tiefschlaf kaum.</strong> Das Gehirn schaltet nachts weitgehend ab, was von außen kommt – sonst würdest du bei jedem Geräusch aufwachen.</p>
<p>Spannend ist aber etwas anderes. Im Schlaf sortiert und festigt das Gehirn, was du am Tag gelernt hast. Besonders gut bleibt hängen, was du <strong>kurz vor dem Einschlafen</strong> gehört hast. In Laborstudien hat es Teilnehmenden sogar geholfen, wenn ihnen zuvor gelernte Vokabeln im Schlaf noch einmal leise vorgespielt wurden.</p>
<p class="hinweis">Kurz gesagt: Hör die ersten Minuten bewusst zu – und lass dich danach ruhig in den Schlaf begleiten. Die Wiederholung im Hintergrund festigt, was du gerade gehört hast.</p>

<h2>So nutzt du die Vokabel-Stunde</h2>
<ol class="schritte">
<li><strong>Kopfhörer oder leiser Lautsprecher:</strong> Stell die Lautstärke so ein, dass du die Stimmen gerade gut verstehst.</li>
<li><strong>Die ersten 10 Minuten mitsprechen:</strong> Sprich jedes spanische Wort leise nach. Das ist der Teil, in dem du wirklich lernst.</li>
<li><strong>Dann einfach entspannen:</strong> Jedes Wort kommt auf Spanisch, auf Deutsch und noch einmal auf Spanisch. Alle 150 Wörter laufen zweimal durch.</li>
<li><strong>Am nächsten Morgen prüfen:</strong> Schau dir die Liste unten an. Welche Wörter weißt du schon?</li>
</ol>

<h2>Die 150 Vokabeln zum Nachlesen</h2>
<p>Tipp: Tippe auf ▶, um die spanische Aussprache zu hören. Die Wörter sind nach Themen sortiert.</p>
<div class="inhalt-nav">{nav}</div>
{tabellen}

<h2>Häufige Fragen</h2>
{faq_html}

<div class="cta"><h2>Vokabeln behalten – nicht nur hören</h2>
<p>Mit dem Vokabeltrainer von Habloo kommt jedes Wort genau dann wieder, wenn du es fast vergessen hättest – nach 1, 3, 7, 14, 30 und 90 Tagen.</p>
<a class="btn" href="/">Kostenlos mit Habloo lernen</a></div>
</main>
<script>
/* Ein Audio zur Zeit: Knopf zeigt, was gerade läuft */
var spieler=new Audio(),aktiv=null;
document.querySelectorAll('.abspielen').forEach(function(b){{b.addEventListener('click',function(){{
  if(aktiv)aktiv.classList.remove('an');spieler.src=b.dataset.a;spieler.play();aktiv=b;b.classList.add('an');}});}});
spieler.addEventListener('ended',function(){{if(aktiv)aktiv.classList.remove('an');}});
</script>"""
    return slug, titel, beschreibung, inhalt, extra, "Vokabeln · A1"


BEITRAEGE = [schlaf]


def main():
    os.makedirs(BLOG, exist_ok=True)
    karten, urls = "", ["/", "/blog/"]
    for f in BEITRAEGE:
        slug, titel, beschreibung, inhalt, extra, tag = f()
        pfad = f"/blog/{slug}/"
        open(os.path.join(BLOG, slug, "index.html"), "w", encoding="utf-8").write(seite(titel, beschreibung, pfad, inhalt, extra))
        karten += f'<a class="karte" href="{pfad}"><div class="tag">{e(tag)}</div><h2>{e(titel)}</h2><p>{e(beschreibung)}</p></a>'
        urls.append(pfad)
    index = f"""<main><h1>Spanisch-Ratgeber</h1>
<p class="lead">Vokabellisten, Grammatik kurz erklärt und Tipps, wie du Spanisch wirklich behältst – vom Habloo-Team.</p>
<div class="liste">{karten}</div></main>"""
    open(os.path.join(BLOG, "index.html"), "w", encoding="utf-8").write(
        seite("Spanisch-Ratgeber: Vokabeln, Grammatik & Lerntipps | Habloo",
              "Vokabellisten, Grammatik kurz erklärt und Lerntipps für Spanisch-Anfänger – kostenlos von Habloo.", "/blog/", index))
    heute = date.today().isoformat()
    open(os.path.join(PUBLIC, "sitemap.xml"), "w").write(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "".join(f"  <url><loc>{DOMAIN}{u}</loc><lastmod>{heute}</lastmod></url>\n" for u in urls) + "</urlset>\n")
    open(os.path.join(PUBLIC, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\nSitemap: {DOMAIN}/sitemap.xml\n")
    print(f"✓ {len(BEITRAEGE)} Beitrag/Beiträge, Übersicht, sitemap.xml, robots.txt → public/")


if __name__ == "__main__":
    main()
