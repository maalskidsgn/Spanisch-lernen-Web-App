import {server,chrome} from './cdp.mjs'; import fs from 'fs'
const D={habloo:[['a','¡Hola! ¿Qué hiciste este fin de semana?'],['u','Fui en la playa con mis amigos.'],['a','¡Qué bien! ¿Y el agua, estaba fría?'],['u','Sí, estaba muy frío, pero me gustó.'],['a','Muy bien. Se dice: estaba muy fría, porque el agua es femenina. ¿Nadaste mucho?']],
davaigo:[['a','Привет! Что ты делал на выходных?'],['u','Я ходил в пляж с друзьями.'],['a','Здорово! А вода была холодная?'],['u','Да, вода был очень холодный.'],['a','Хорошо. Правильно так: вода была очень холодная. Ты долго плавал?']]}
const c=await chrome(9336); await c.groesse(440,892)
const kopf=fs.readFileSync('mock-head.js','utf8'); await c.vorab(kopf)
for(const [a,port] of [['habloo',5811],['davaigo',5812]]){const s=await server(process.cwd()+'/app/s-'+a,port)
 for(const l of ['de','en']){
  await c.gehe(`http://127.0.0.1:${port}/sprechen?a=${a}&l=${l}`,800)
  await c.js(`localStorage.clear();localStorage.setItem('oberflaeche-sprache','${l}');localStorage.setItem('sprechen-einwilligung-2','ja');localStorage.setItem('sb-'+({habloo:'okwegzwsjrxusmznohis',davaigo:'rojsuzwhqcopdbpapwou'})['${a}']+'-auth-token',JSON.stringify({access_token:'test',refresh_token:'test',token_type:'bearer',expires_in:999999,expires_at:Math.floor(Date.now()/1000)+999999,user:{id:'00000000-0000-0000-0000-000000000001',email:'test@example.com',user_metadata:{},app_metadata:{}}}))`)
  await c.gehe(`http://127.0.0.1:${port}/sprechen?a=${a}&l=${l}`,1800)
  await c.js(`(()=>{const k=document.querySelector('.spr-einwilligung input');if(k&&!k.checked)k.click()})()`);await c.warte(200)
  await c.foto(`roh/${a}-${l}-start2.png`)
  await c.js(`document.querySelector('.spr-los').click()`);await c.warte(900)
  let n=0;for(const [w,t] of D[a]){const id='i'+(n++);const ev=w==='a'?[{type:'response.output_audio_transcript.done',item_id:id,transcript:t}]:[{type:'conversation.item.input_audio_transcription.completed',item_id:id,transcript:t}];for(const e of ev)await c.js(`window.__spiel(${JSON.stringify(e)})`)}
  await c.js(`window.__spiel({type:'output_audio_buffer.started'})`);await c.warte(7300)
  await c.js(`(()=>{const v=document.querySelector('.spr-verlauf');if(v)v.scrollTop=v.scrollHeight;window.scrollTo(0,0)})()`);await c.warte(300)
  await c.foto(`roh/${a}-${l}-anruf.png`)
  await c.js(`document.querySelector('.spr-auflegen').click()`);await c.warte(1500);await c.js(`window.scrollTo(0,0)`);await c.warte(200)
  await c.foto(`roh/${a}-${l}-bericht.png`)
  console.log(a,l,(await c.js(`document.querySelector('.spr-inhalt').innerText`)).slice(0,120).replace(/\n+/g,' | '))
 } s.close()}
c.ende();process.exit(0)
