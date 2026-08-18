/**
 * Songtext als PDF sichern.
 *
 * Bewusst ohne zusätzliche Bibliothek: Der Text wird in ein eigenes
 * Fenster geschrieben und der Druckdialog geöffnet. Dort wählt man
 * "Als PDF sichern" – das kann jeder Browser und jedes Betriebssystem,
 * und das Ergebnis ist echter Text, den man durchsuchen kann.
 *
 * @param {object} daten
 * @param {string} daten.titel    – Name des Songs
 * @param {string} daten.kanal    – Interpret oder Kanal
 * @param {string[]} daten.zeilen – der spanische Text, Zeile für Zeile
 * @param {string[]|null} daten.deutsch – die Übersetzung, falls vorhanden
 */
export function songAlsPdf({ titel, kanal, zeilen, deutsch }) {
  const fenster = window.open('', '_blank', 'width=820,height=1000')
  if (!fenster) {
    throw new Error(
      'Der Browser hat das Fenster blockiert. Bitte Pop-ups für Habloo erlauben.'
    )
  }

  // Aufeinanderfolgende Zeilen zu Strophen bündeln: Alle vier Zeilen
  // eine Lücke – so liest sich der Text wie ein Liedtext statt wie
  // eine endlose Liste.
  const strophen = []
  for (let i = 0; i < zeilen.length; i += 4) {
    strophen.push({
      es: zeilen.slice(i, i + 4),
      de: deutsch ? deutsch.slice(i, i + 4) : null,
    })
  }

  const escape = (text) =>
    String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

  const heute = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  fenster.document.write(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${escape(titel)}</title>
<style>
  @page { margin: 20mm 18mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Nunito", -apple-system, "Segoe UI", sans-serif;
    color: #191933;
    line-height: 1.55;
  }
  header {
    border-bottom: 3px solid #ff6c00;
    padding-bottom: 14px;
    margin-bottom: 26px;
  }
  .marke {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: #ff6c00;
    margin-bottom: 6px;
  }
  h1 { font-size: 24px; margin: 0 0 4px; line-height: 1.2; }
  .interpret { font-size: 14px; color: #6f6858; margin: 0; }

  .strophe { margin-bottom: 20px; break-inside: avoid; }
  .zeile { display: block; }
  .es { font-size: 15px; font-weight: 600; }
  .de { font-size: 13px; color: #6f6858; margin-bottom: 6px; }

  footer {
    margin-top: 32px;
    padding-top: 12px;
    border-top: 1px solid #e8ded0;
    font-size: 11px;
    color: #9a9182;
    display: flex;
    justify-content: space-between;
  }

  /* Beim Drucken die Hinweiszeile ausblenden */
  .hinweis {
    background: #fff3e8;
    border: 1px solid #ffd9b8;
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 13px;
    margin-bottom: 24px;
  }
  @media print { .hinweis { display: none; } }
</style>
</head>
<body>
  <div class="hinweis">
    Gleich öffnet sich der Druckdialog – wähle dort <b>„Als PDF sichern“</b>.
  </div>

  <header>
    <div class="marke">Habloo · Songtext</div>
    <h1>${escape(titel)}</h1>
    <p class="interpret">${escape(kanal || '')}</p>
  </header>

  ${strophen
    .map(
      (s) => `<div class="strophe">${s.es
        .map(
          (zeile, i) =>
            `<span class="zeile"><span class="es">${escape(zeile)}</span></span>` +
            (s.de?.[i] ? `<span class="zeile de">${escape(s.de[i])}</span>` : '')
        )
        .join('')}</div>`
    )
    .join('')}

  <footer>
    <span>habloo.de</span>
    <span>${heute}</span>
  </footer>
</body>
</html>`)

  fenster.document.close()

  // Kurz warten, bis die Schrift steht – sonst druckt Safari zu früh
  fenster.onload = () => setTimeout(() => fenster.print(), 400)
}
