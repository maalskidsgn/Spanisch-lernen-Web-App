// Store-Grafiken v2 (09.11.2026): abwechslungsreiche Hintergründe + Handy-Anordnungen im Toon-Look.
//   node baue2.mjs ios|play [app] [de|en] [nr]
import {chrome} from './cdp.mjs'; import fs from 'fs'
import * as IOS from './iphone.mjs'; import * as AND from './android-rahmen.mjs'
const [FORMAT='ios', nurApp, nurSprache, nurNr] = process.argv.slice(2)
const W = FORMAT === 'ios' ? 1320 : 1080, H = FORMAT === 'ios' ? 2868 : 1920, k = W / 1320, hk = H / 2868
const R = FORMAT === 'ios' ? IOS : AND
const M = {
  habloo: { p: '#ff6c00', p2: '#ff8a33', pd: '#c85400', hell: '#fdf7f1', hell2: '#ffe8d4', navy: '#000041', akz: '#fff3e0', gold: '#ffc533', name: 'Habla',
    T: [['#ffdcb2', '#ffc286', '#ffae66', '#ff9440', '#f07a22', '#cc6214']], verlauf: 'linear-gradient(150deg,#ffb062 0%,#ff6c00 45%,#ff3d7f 100%)', dunkel: 'radial-gradient(circle at 50% 58%,#2a1a6b 0%,#000041 60%)' },
  davaigo: { p: '#7c3aed', p2: '#9361f2', pd: '#5b21b6', hell: '#f5f0fc', hell2: '#ede4ff', navy: '#241338', akz: '#ffd34d', gold: '#ffd34d', name: 'Katja',
    T: [['#ece3ff', '#d8c6fd', '#c2a6f9', '#ab86f4', '#9566ee', '#7444d4']], verlauf: 'linear-gradient(150deg,#a78bfa 0%,#7c3aed 45%,#ff3d7f 100%)', dunkel: 'radial-gradient(circle at 50% 58%,#4b2a8a 0%,#1a0d2e 62%)' },
}
// [bild, zeile1, zeile2, hintergrund, anordnung, chips, zweitbild]
const S = {
 habloo: {
  de: [['anruf', 'Sprich wirklich', 'Spanisch mit Habla', 'marke', 'trommel', [['10 Minuten gratis', 'jeden Monat']]],
       ['bericht', 'Aus jedem Fehler', 'wird Können', 'marke', 'popout', [['Nach jedem Gespräch', 'deine Fehler, erklärt']]],
       ['youtube', 'Spanisch lernen', 'mit echten Videos', 'marke', 'kippL', [['Wort antippen', 'hablar → sprechen']], 'start'],
       ['modul', 'Schritt für Schritt', 'zum Sprechen', 'marke', 'trommel', [['150 Lektionen', 'in 7 Modulen']]],
       ['lektion', 'Neue Wörter', 'direkt im Satz', 'marke', 'popout', [['Mit Ton', 'jedes Wort zum Anhören']]],
       ['trainer', 'Kein Wort', 'mehr vergessen', 'marke', 'kippL', [['Karteikasten', 'wiederholt zur richtigen Zeit']]],
       ['start', 'Jeden Tag', 'ein Stück weiter', 'marke', 'popout', [['Flammen-Serie', 'so bleibst du dran']]]],
  en: [['anruf', 'Really speak', 'Spanish with Habla', 'marke', 'trommel', [['10 free minutes', 'every month']]],
       ['bericht', 'Learn from', 'every mistake', 'marke', 'popout', [['After every call', 'your mistakes, explained']]],
       ['youtube', 'Learn Spanish', 'with real videos', 'marke', 'kippL', [['Tap any word', 'hablar → to speak']], 'start'],
       ['modul', 'Step by step', 'to speaking', 'marke', 'trommel', [['150 lessons', 'in 7 modules']]],
       ['lektion', 'New words', 'right in context', 'marke', 'popout', [['With audio', 'hear every word']]],
       ['trainer', 'Never forget', 'a word again', 'marke', 'kippL', [['Smart flashcards', 'review at the right time']]],
       ['start', 'A little further', 'every day', 'marke', 'popout', [['Daily streak', 'keep your momentum']]]],
 },
 davaigo: {
  de: [['anruf', 'Sprich wirklich', 'Russisch mit Katja', 'marke', 'trommel', [['10 Minuten gratis', 'jeden Monat']]],
       ['bericht', 'Aus jedem Fehler', 'wird Können', 'marke', 'popout', [['Nach jedem Gespräch', 'deine Fehler, erklärt']]],
       ['youtube', 'Russisch lernen', 'mit echten Videos', 'marke', 'kippL', [['Wort antippen', 'говорить → sprechen']], 'lektion'],
       ['lesekurs', 'Kyrillisch lesen', 'in 16 Videos', 'marke', 'kippR', [['Lektion 1 gratis', 'von null zum ersten Text']]],
       ['modul', '180 Lektionen', 'alle vertont', 'marke', 'trommel', [['10 Module', 'vom Alphabet bis zum Gespräch']]],
       ['trainer', 'Kein Wort', 'mehr vergessen', 'marke', 'kippR', [['Karteikasten', 'wiederholt zur richtigen Zeit']]],
       ['start', 'Jeden Tag', 'ein Stück weiter', 'marke', 'popout', [['Flammen-Serie', 'so bleibst du dran']]]],
  en: [['anruf', 'Really speak', 'Russian with Katja', 'marke', 'trommel', [['10 free minutes', 'every month']]],
       ['bericht', 'Learn from', 'every mistake', 'marke', 'popout', [['After every call', 'your mistakes, explained']]],
       ['youtube', 'Learn Russian', 'with real videos', 'marke', 'kippL', [['Tap any word', 'говорить → to speak']], 'lektion'],
       ['lesekurs', 'Read Cyrillic', 'in 16 videos', 'marke', 'kippR', [['Lesson 1 free', 'from zero to your first text']]],
       ['modul', '180 lessons', 'all with audio', 'marke', 'trommel', [['10 modules', 'from the alphabet to real talk']]],
       ['trainer', 'Never forget', 'a word again', 'marke', 'kippR', [['Smart flashcards', 'review at the right time']]],
       ['start', 'A little further', 'every day', 'marke', 'popout', [['Daily streak', 'keep your momentum']]]],
 },
}

function trommel(t, w) {
  const [hell, oben, links, mitte, rechts, tief] = t
  return `<svg viewBox="0 0 120 64" width="${w}" style="display:block;overflow:visible"><path d="M8 22 V40 Q60 62 112 40 V22 Z" fill="${mitte}"/><path d="M60 51 Q90 50 112 40 V22 Q90 34 60 36 Z" fill="${rechts}"/><path d="M8 22 V40 Q22 46 30 47.5 V30 Q16 27 8 22 Z" fill="${links}"/><path d="M8 40 Q60 62 112 40 V44 Q60 66 8 44 Z" fill="${tief}"/><ellipse cx="60" cy="22" rx="52" ry="14" fill="${oben}"/><ellipse cx="55" cy="19" rx="35" ry="8" fill="${hell}"/><path d="M22 17 Q32 11 46 10.5" stroke="#fff" stroke-width="3.2" stroke-linecap="round" fill="none" opacity=".85"/></svg>`
}
const flamme = (w) => `<svg viewBox="0 0 40 48" width="${w}"><path d="M20 2C24 12 34 16 34 30a14 14 0 0 1-28 0c0-7 4-11 7-14 0 5 2 8 5 8-2-8 0-16 3-22z" fill="#ff7a12"/><path d="M20 2C24 12 34 16 34 30a14 14 0 0 1-14 14z" fill="#e85d00"/><path d="M20 22c3 5 7 7 7 12a7 7 0 0 1-14 0c0-4 3-6 4-9 1 3 2 4 3 4 0-3-1-5 0-7z" fill="#ffd34d"/></svg>`
const stern = (w, f) => `<svg viewBox="0 0 24 24" width="${w}"><path d="M12 1.5c1 6 3.5 8.5 10.5 10.5-7 2-9.5 4.5-10.5 10.5-1-6-3.5-8.5-10.5-10.5 7-2 9.5-4.5 10.5-10.5z" fill="${f}"/></svg>`

let SPIEGEL = false
function hintergrund(art, m) {
  const kreis = (x, y, d, f, o = 1) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${d}px;height:${d}px;border-radius:50%;background:${f};opacity:${o}"></div>`
  if (art === 'marke') return SPIEGEL ? `<div class=bg style="background:${m.p}"></div>${kreis(W - 920 * k, 980 * hk, 1300 * k, m.p2)}${kreis(-340 * k, 2250 * hk, 640 * k, m.pd, .35)}` : `<div class=bg style="background:${m.p}"></div>${kreis(-380 * k, 980 * hk, 1300 * k, m.p2)}${kreis(W - 300 * k, 2250 * hk, 640 * k, m.pd, .35)}`
  if (art === 'hell') return `<div class=bg style="background:${m.hell};background-image:radial-gradient(${m.hell2} ${7 * k}px,transparent ${8 * k}px);background-size:${70 * k}px ${70 * k}px"></div>${kreis(W - 560 * k, 760 * hk, 980 * k, m.hell2, .9)}`
  if (art === 'verlauf') return `<div class=bg style="background:${m.verlauf}"></div>${[[90, 1500, 70], [1150, 1100, 54], [180, 2500, 46], [1180, 2300, 80]].map(([x, y, s]) => `<div style="position:absolute;left:${x * k}px;top:${y * hk}px;opacity:.85">${stern(s * k, '#fff')}</div>`).join('')}`
  if (art === 'dunkel') return `<div class=bg style="background:${m.dunkel}"></div>${Array.from({ length: 34 }, (_, i) => `<i style="position:absolute;left:${(i * 397) % W}px;top:${((i * 613) % (H - 200)) + 60}px;width:${(3 + (i % 3) * 2) * k}px;height:${(3 + (i % 3) * 2) * k}px;border-radius:50%;background:#fff;opacity:${.25 + (i % 4) * .15}"></i>`).join('')}<div style="position:absolute;left:50%;top:${1050 * hk}px;width:${1200 * k}px;height:${1200 * k}px;margin-left:${-600 * k}px;border-radius:50%;background:${m.p};opacity:.35;filter:blur(${160 * k}px)"></div>`
  if (art === 'geteilt') return `<div class=bg style="background:${m.hell}"></div><svg style="position:absolute;left:0;top:0" width="${W}" height="${H * .55}" viewBox="0 0 100 55" preserveAspectRatio="none"><path d="M0 0H100V44Q75 55 50 47T0 48Z" fill="${m.p}"/></svg>`
  if (art === 'konfetti') return `<div class=bg style="background:${m.hell2}"></div>${[[60, 1400, 30, m.p, -20], [1180, 1250, 26, m.gold, 25], [140, 2350, 22, '#2bb673', 40], [1150, 2450, 30, m.p2, -10], [1000, 760, 20, '#3d8bfd', 15], [240, 860, 18, m.gold, -35]].map(([x, y, s, f, r]) => `<div style="position:absolute;left:${x * k}px;top:${y * hk}px;width:${s * k}px;height:${s * 1.7 * k}px;border-radius:${6 * k}px;background:${f};transform:rotate(${r}deg)"></div>`).join('')}`
  if (art === 'streifen') return `<div class=bg style="background:${m.p};background-image:repeating-linear-gradient(115deg,rgba(255,255,255,.09) 0 ${90 * k}px,transparent ${90 * k}px ${200 * k}px)"></div>${[[110, 2420], [1120, 1500]].map(([x, y]) => `<div style="position:absolute;left:${x * k}px;top:${y * hk}px;opacity:.9">${flamme(110 * k)}</div>`).join('')}`
}
const textFarbe = (art, m) => ['hell', 'konfetti', 'geteilt'].includes(art) && art !== 'geteilt' ? [m.navy, m.p] : ['#fff', art === 'dunkel' ? m.gold : m.akz]

function handy(bild, kipp, breite, x, y) {
  return `<div style="position:absolute;left:${x}px;top:${y}px">${R.iphone({ bild, kipp, breite })}</div>`
}
function chip([b, t], x, y, m, dreh = 0) {
  return `<div class=chip style="left:${x}px;top:${y}px;transform:rotate(${dreh}deg)"><b style="color:${m.p}">${b}</b><i>${t}</i></div>`
}

function anordnung(art, a, l, bild, zweit, chips, m) {
  const roh = (n) => `file://${process.cwd()}/roh/${a}-${l}-${n}.png`
  const pw = (FORMAT === 'ios' ? 900 : 640) * (W / (FORMAT === 'ios' ? 1320 : 1080))
  const ph = pw * 2.166, top = (FORMAT === 'ios' ? 640 : 455)
  const cy = Math.min(top + ph - 300 * k, H - 330 * k)
  if (art === 'gerade') return handy(roh(bild), 0, pw, (W - pw) / 2, top + 30 * k) + chip(chips[0], W - 560 * k, cy, m, -3)
  if (art === 'kippR') return handy(roh(bild), 5, pw, (W - pw) / 2 - 20 * k, top) + chip(chips[0], 70 * k, cy, m, 3)
  if (art === 'kippL') return handy(roh(bild), -5, pw, (W - pw) / 2 + 20 * k, top) + chip(chips[0], W - 620 * k, cy, m, -3)
  if (art === 'zwei') {
    const p2 = pw * .82
    return handy(roh(zweit), -6, p2, 40 * k, top + 170 * k) + handy(roh(bild), 5, pw * .9, W - pw * .9 - 30 * k, top - 10 * k) + chip(chips[0], 60 * k, cy, m, 3)
  }
  if (art === 'trommel') {
    const tw = pw * 1.55, p = pw * .92
    const ty = Math.min(top + p * 2.166 - 130 * k, H - tw * .42)
    return `<div style="position:absolute;left:${(W - tw) / 2}px;top:${ty}px">${trommel(m.T[0], tw)}</div>` + handy(roh(bild), 0, p, (W - p) / 2, ty - p * 2.166 + 140 * k) + chip(chips[0], W - 600 * k, top + 260 * k, m, -4)
  }
  if (art === 'popout') {
    const pop = `file://${process.cwd()}/roh/pop-${a}-${l}-${bild}.png`
    const bw = W * .86
    return handy(roh(bild), -5, pw, (W - pw) / 2 + 60 * k, top + 60 * k) +
      `<div class=pop style="left:${(W - bw) / 2 - 20 * k}px;top:${top + ph * .42}px;width:${bw}px"><img src="${pop}" style="width:100%;display:block;border-radius:${46 * k}px"></div>` +
      chip(chips[0], 70 * k, Math.min(top + ph * .42 + bw * .78 + 40 * k, H - 300 * k), m, 3)
  }
}

const c = await chrome(9339)
await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false })
fs.mkdirSync(`fertig2/${FORMAT}`, { recursive: true })
for (const a of Object.keys(S)) { if (nurApp && nurApp !== 'alle' && nurApp !== a) continue; const m = M[a]
  for (const l of ['de', 'en']) { if (nurSprache && nurSprache !== 'alle' && nurSprache !== l) continue
    for (const [i, [bild, z1, z2, hg, an, chips, zweit]] of S[a][l].entries()) { if (nurNr && +nurNr !== i + 1) continue; SPIEGEL = i % 2 === 1
      const [tf, af] = textFarbe(hg, m)
      const html = `<!doctype html><html><head><meta charset=utf-8><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap" rel=stylesheet><style>
*{box-sizing:border-box}html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;font-family:Nunito,sans-serif}
.bg{position:absolute;inset:0}
h1{position:absolute;left:${70 * k}px;right:${70 * k}px;top:${(FORMAT === 'ios' ? 170 : 105)}px;margin:0;text-align:center;color:${tf};font-weight:900;font-size:${(FORMAT === 'ios' ? 124 : 92)}px;line-height:1.06;letter-spacing:-.025em}
h1 span{display:block;color:${af}}
${R.iphoneCss}
.chip{position:absolute;background:#fff;border-radius:${44 * k}px;padding:${34 * k}px ${48 * k}px;box-shadow:0 ${14 * k}px 0 rgba(0,0,0,.13),0 ${36 * k}px ${70 * k}px rgba(20,8,50,.28);z-index:5}
.chip b{display:block;font-size:${56 * k}px;font-weight:900;letter-spacing:-.5px;white-space:nowrap}
.chip i{display:block;font-style:normal;font-size:${40 * k}px;font-weight:800;color:${m.navy};margin-top:${6 * k}px;white-space:nowrap}
.pop{position:absolute;z-index:4;padding:${16 * k}px;background:#fff;border-radius:${58 * k}px;box-shadow:0 ${18 * k}px 0 rgba(0,0,0,.12),0 ${50 * k}px ${90 * k}px rgba(20,8,50,.32);transform:rotate(-2.5deg)}
</style></head><body>${hintergrund(hg, m)}<h1>${z1}<span>${z2}</span></h1>${anordnung(an, a, l, bild, zweit, chips, m)}<script>document.fonts.ready.then(()=>document.querySelectorAll('.chip').forEach(e=>{const r=e.getBoundingClientRect(),g=${Math.round(50*1)}*${k};if(r.right>${W}-g)e.style.left=(parseFloat(e.style.left)-(r.right-(${W}-g)))+'px';if(r.left<g)e.style.left=(parseFloat(e.style.left)+(g-r.left))+'px'}))</script></body></html>`
      fs.writeFileSync('fertig2/_t.html', html)
      await c.gehe('file://' + process.cwd() + '/fertig2/_t.html', 1500)
      await c.foto(`fertig2/${FORMAT}/${a}-${l}-${i + 1}.png`)
      const br = await c.js(`[...document.querySelectorAll('.chip')].map(e=>Math.round(e.getBoundingClientRect().right)+'/'+Math.round(e.getBoundingClientRect().left)).join(',')`)
      if (br.split(',').some((x) => +x.split('/')[0] > W - 10 || +x.split('/')[1] < 10)) console.log('CHIP RAND', a, l, i + 1, br)
    }
  }
}
c.ende(); process.exit(0)
