import {chrome} from './cdp.mjs'; import fs from 'fs'; import {iphone,iphoneCss} from './android-rahmen.mjs'
const nurApp=process.argv[2], nurSprache=process.argv[3], nurNr=process.argv[4]
const MARKE={habloo:{bg:'#ff6c00',bg2:'#ff8a33',tief:'#c85400',akz:'#fff3e6',txt:'#1f1147',dunkel:'#7a2f06',land:'Spanisch',icon:'public/icon-512-1.png'},davaigo:{bg:'#7c3aed',bg2:'#9361f2',tief:'#5b21b6',akz:'#ffd34d',txt:'#1f1147',dunkel:'#3b1a85',icon:'public/icon-512-2.png'}}
const T={
 habloo:{de:[
  ['anruf','Sprich wirklich','Spanisch mit Habla',-6,[['10 Minuten gratis','jeden Monat',700,2600]]],
  ['bericht','Aus jedem Fehler','wird Können',5,[['Nach jedem Gespräch','deine Fehler, erklärt',470,2600]]],
  ['youtube','Spanisch lernen','mit echten Videos',-6,[['Wort antippen','hablar → sprechen',100,2030],['Untertitel','zum Mitlesen',720,2360]]],
  ['modul','Schritt für Schritt','zum Sprechen',5,[['150 Lektionen','in 7 Modulen',760,2610]]],
  ['lektion','Neue Wörter','direkt im Satz',-5,[['Mit Ton','jedes Wort zum Anhören',560,2610]]],
  ['trainer','Kein Wort','mehr vergessen',5,[['Karteikasten','wiederholt zur richtigen Zeit',470,2610]]],
  ['lektionen','Jeden Tag','ein Stück weiter',-5,[['XP, Level & Serien','so bleibst du dran',640,2610]]],
 ],en:[
  ['anruf','Really speak','Spanish with Habla',-6,[['10 free minutes','every month',720,2600]]],
  ['bericht','Learn from','every mistake',5,[['After every call','your mistakes, explained',470,2600]]],
  ['youtube','Learn Spanish','with real videos',-6,[['Tap any word','hablar → to speak',100,2030],['Subtitles','to read along',760,2360]]],
  ['modul','Step by step','to speaking',5,[['150 lessons','in 7 modules',800,2610]]],
  ['lektion','New words','right in context',-5,[['With audio','hear every word',720,2610]]],
  ['trainer','Never forget','a word again',5,[['Smart flashcards','review at the right time',560,2610]]],
  ['lektionen','A little further','every day',-5,[['XP, levels & streaks','keep your momentum',600,2610]]],
 ]},
 davaigo:{de:[
  ['anruf','Sprich wirklich','Russisch mit Katja',-6,[['10 Minuten gratis','jeden Monat',700,2600]]],
  ['bericht','Aus jedem Fehler','wird Können',5,[['Nach jedem Gespräch','deine Fehler, erklärt',470,2600]]],
  ['youtube','Russisch lernen','mit echten Videos',-6,[['Wort antippen','говорить → sprechen',70,2030],['Untertitel','zum Mitlesen',720,2360]]],
  ['lesekurs','Kyrillisch lesen','in 16 Videos',5,[['Lektion 1 gratis','von null zum ersten Text',500,2610]]],
  ['modul','180 Lektionen','alle vertont',-5,[['10 Module','vom Alphabet bis zum Gespräch',390,2610]]],
  ['trainer','Kein Wort','mehr vergessen',5,[['Karteikasten','wiederholt zur richtigen Zeit',470,2610]]],
  ['lektion','Neue Wörter','direkt im Satz',-5,[['Mit Ton','jedes Wort zum Anhören',560,2610]]],
 ],en:[
  ['anruf','Really speak','Russian with Katja',-6,[['10 free minutes','every month',720,2600]]],
  ['bericht','Learn from','every mistake',5,[['After every call','your mistakes, explained',470,2600]]],
  ['youtube','Learn Russian','with real videos',-6,[['Tap any word','говорить → to speak',70,2030],['Subtitles','to read along',760,2360]]],
  ['lesekurs','Read Cyrillic','in 16 videos',5,[['Lesson 1 free','from zero to your first text',430,2610]]],
  ['modul','180 lessons','all with audio',-5,[['10 modules','from the alphabet to real talk',420,2610]]],
  ['trainer','Never forget','a word again',5,[['Smart flashcards','review at the right time',560,2610]]],
  ['lektion','New words','right in context',-5,[['With audio','hear every word',720,2610]]],
 ]}}
const c=await chrome(9345); await c.send('Emulation.setDeviceMetricsOverride',{width:1320,height:2347,deviceScaleFactor:1,mobile:false})
fs.mkdirSync('fertig-play',{recursive:true})
for(const a of Object.keys(T)){ if(nurApp&&nurApp!=='alle'&&nurApp!==a)continue; const m=MARKE[a]
 for(const l of ['de','en']){ if(nurSprache&&nurSprache!=='alle'&&nurSprache!==l)continue
  for(const [i,[bild,z1,z2,kipp,chips0]] of T[a][l].entries()){ if(i<2||(nurNr&&+nurNr!==i-1))continue
   const chips=chips0.map(([b,t,x,y])=>[b,t,Math.min(x,1320-560),y>=2000?y-500:y])
   const html=`<!doctype html><html><head><meta charset=utf-8><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap" rel=stylesheet><style>
   *{box-sizing:border-box}html,body{margin:0;width:1320px;height:2347px;overflow:hidden;font-family:Nunito,sans-serif}
   .bg{position:absolute;inset:0;background:${m.bg}}
   .k1{position:absolute;width:1300px;height:1300px;border-radius:50%;background:${m.bg2};right:${kipp<0?'-420px':'auto'};left:${kipp<0?'auto':'-420px'};top:900px}
   .k2{position:absolute;width:620px;height:620px;border-radius:50%;background:${m.tief};opacity:.35;left:${kipp<0?'-220px':'auto'};right:${kipp<0?'auto':'-220px'};top:2150px}
   h1{position:absolute;left:80px;right:80px;top:120px;margin:0;text-align:center;color:#fff;font-weight:900;font-size:128px;line-height:1.08;letter-spacing:-3px}
   h1 span{display:block;color:${a==='davaigo'?m.akz:'#fff3e0'}}
   ${iphoneCss}
   .platz{position:absolute;left:285px;top:530px}
   .chip{position:absolute;background:#fff;border-radius:48px;padding:38px 52px;box-shadow:0 28px 70px rgba(20,8,50,.28);}
   .chip b{display:block;font-size:58px;font-weight:900;color:${m.bg};letter-spacing:-.5px;white-space:nowrap}
   .chip i{display:block;font-style:normal;font-size:43px;font-weight:800;color:${m.txt};margin-top:6px;white-space:nowrap}
   </style></head><body><div class=bg></div><div class=k1></div><div class=k2></div><h1>${z1}<span>${z2}</span></h1>
   <div class=platz>${iphone({bild:`file://${process.cwd()}/roh/${a}-${l}-${bild}.png`,kipp,breite:750})}</div>
   ${chips.map(([b,t,x,y])=>`<div class=chip style="left:${x}px;top:${y}px"><b>${b}</b><i>${t}</i></div>`).join('')}</body></html>`
   const f=`fertig-play/_t.html`;fs.writeFileSync(f,html)
   await c.gehe('file://'+process.cwd()+'/'+f,1300)
   await c.foto(`fertig-play/${a}-${l}-${i-1}.png`)
   const br=await c.js(`[...document.querySelectorAll('.chip')].map(e=>{const r=e.getBoundingClientRect();return Math.round(r.right)}).join(',')`);if(br.split(',').some(x=>+x>1300))console.log('ZU BREIT',a,l,i+1,br)
  }}}
c.ende();process.exit(0)
