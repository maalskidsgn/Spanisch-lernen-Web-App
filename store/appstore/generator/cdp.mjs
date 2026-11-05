import http from 'http'; import fs from 'fs'; import path from 'path'; import {spawn} from 'child_process'
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.woff2':'font/woff2','.mp3':'audio/mpeg','.mp4':'video/mp4'}
export function server(root,port){return new Promise(ok=>{const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);let f=path.join(root,p);if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,'index.html');r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});s.listen(port,()=>ok(s))})}
export async function chrome(port=9333){
 const p=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run','--mute-audio',`--remote-debugging-port=${port}`,`--user-data-dir=/tmp/cdp-store-${port}`,'about:blank'],{stdio:'ignore'})
 let list; for(let i=0;i<40;i++){try{list=await (await fetch(`http://127.0.0.1:${port}/json`)).json();if(list.find(x=>x.type==='page'))break}catch{};await new Promise(r=>setTimeout(r,250))}
 const ws=new WebSocket(list.find(x=>x.type==='page').webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r)
 let n=0;const w=new Map();ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&w.has(d.id)){w.get(d.id)(d);w.delete(d.id)}}
 const send=(method,params={})=>new Promise(r=>{const id=++n;w.set(id,r);ws.send(JSON.stringify({id,method,params}))})
 await send('Page.enable');await send('Runtime.enable')
 const warte=ms=>new Promise(r=>setTimeout(r,ms))
 const api={send,warte,
  groesse:(width,height,dpr=3)=>send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile:true}),
  vorab:(source)=>send('Page.addScriptToEvaluateOnNewDocument',{source}),
  gehe:async(url,ms=2500)=>{await send('Page.navigate',{url});await warte(ms)},
  js:async(e)=>{const r=await send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true});if(r.result?.exceptionDetails)throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0,400));return r.result?.result?.value},
  klick:(t)=>api.js(`(()=>{const t=${JSON.stringify(t)};const e=[...document.querySelectorAll('button,a,[role=button],[role=tab],.card,summary')].find(x=>x.innerText&&x.innerText.trim().toLowerCase().includes(t.toLowerCase())&&x.offsetParent);if(e){e.click();return e.innerText.slice(0,40)}return null})()`),
  foto:async(f)=>{const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(f,Buffer.from(r.result.data,'base64'))},
  ende:()=>{ws.close();p.kill()}}
 return api}
