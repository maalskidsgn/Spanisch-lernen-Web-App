import {server,chrome} from './cdp.mjs'
const nur=process.argv[2]
const s=await server(process.cwd()+'/app/habloo',5801),s2=await server(process.cwd()+'/app/davaigo',5802)
const c=await chrome();await c.groesse(440,892)
const tab=async(de,en)=>{await c.js(`(()=>{const e=[...document.querySelectorAll('button,a')].find(x=>{const z=x.innerText.trim().split('\\n').pop();return x.innerText.length<24&&[${JSON.stringify(de)},${JSON.stringify(en)}].includes(z)&&x.offsetParent});if(e)e.click()})()`);await c.warte(800);await c.js(`(()=>{const e=[...document.querySelectorAll('button')].find(x=>['Alles klar','All right','Got it','OK','Später','Later'].includes(x.innerText.trim())&&x.offsetParent);if(e)e.click()})()`);await c.warte(500)}
const WO={habloo:['hola','gracias','casa','comer','amigo','agua','tiempo','hablar','ciudad','trabajo','familia','libro','noche','viajar','bueno','grande'],davaigo:['привет','спасибо','дом','есть','друг','вода','время','говорить','город','работа','семья','книга','ночь','ехать','хороший','большой']}
for(const [n,port] of [['habloo',5801],['davaigo',5802]]){ if(nur&&nur!==n)continue
 for(const l of ['de','en']){
  await c.gehe(`http://127.0.0.1:${port}/`,1200)
  await c.js(`(()=>{localStorage.clear();localStorage.setItem('oberflaeche-sprache','${l}');const d=new Date().toLocaleDateString('sv-SE');localStorage.setItem('fortschritt',JSON.stringify({xp:1840,xpToday:90,streak:12,lastActive:d}));const v={};for(const w of ${JSON.stringify(WO[n])})v[w]={status:'lernen',uebersetzung:'–',srs:{faellig:0}};localStorage.setItem('vokabeln',JSON.stringify(v))})()`)
  await c.gehe(`http://127.0.0.1:${port}/`,2500)
  await c.klick(l==='de'?'Später':'Later');await c.warte(300)
  await tab('Start','Home');await c.foto(`roh/${n}-${l}-start.png`)
  await tab('Lektionen','Lessons');await c.foto(`roh/${n}-${l}-lektionen.png`)
  await tab('Trainer',n==='habloo'?'Practice':'Trainer');await c.foto(`roh/${n}-${l}-trainer.png`)
  await tab('YouTube','YouTube');await c.foto(`roh/${n}-${l}-youtube.png`)
  await tab('Lektionen','Lessons');if(n==='davaigo'){await c.klick(l==='de'?'Kyrillisch lesen in 16':'Read Cyrillic in 16');await c.warte(1200);await tab('zzz','zzz');await c.foto(`roh/${n}-${l}-lesekurs.png`);await c.gehe(`http://127.0.0.1:${port}/`,1800);await tab('Lektionen','Lessons')};await c.klick(l==='de'?'Weiterlernen':(n==='habloo'?'Keep learning':'Continue learning'));await c.warte(800);await tab('zzz','zzz');await c.foto(`roh/${n}-${l}-modul.png`)
  await c.js(`(()=>{const e=[...document.querySelectorAll('button,a')].find(x=>/(ALS NÄCHSTES|Als Nächstes|NEXT UP|Next up|Up next)/i.test(x.innerText)&&x.offsetParent);if(e)e.click()})()`);await c.warte(1200);await tab('zzz','zzz');await c.klick(l==='de'?'Los geht':"Let's go");await c.warte(1500);await tab('zzz','zzz');await c.foto(`roh/${n}-${l}-lektion.png`)
  console.log(n,l,(await c.js('document.body.innerText')).slice(0,300).replace(/\n+/g,' | '))
 }}
c.ende();s.close();s2.close();process.exit(0)
