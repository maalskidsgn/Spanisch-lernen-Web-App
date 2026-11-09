export function iphone({bild,kipp,breite=900,zeit='9:41',farbe='titan'}){
 const hoch=Math.round(breite*2.166), r=Math.round(breite*.155), rand=Math.round(breite*.016), bez=Math.round(breite*.026)
 const inR=r-rand, scrR=inR-bez, sb=Math.round((breite-2*rand-2*bez)*62/440)
 const tiefe=Math.round(breite*.075), rich=kipp<0?1:-1
 const metall='linear-gradient(135deg,#d9dade 0%,#8e9096 18%,#e6e7ea 38%,#7d7f85 62%,#cfd0d4 82%,#6f7177 100%)'
 const seite=(kipp<0?'#a8aab0':'#9b9da3')
 let lagen='';for(let i=tiefe;i>0;i-=2)lagen+=`<div style="position:absolute;inset:0;border-radius:${r}px;background:${i>tiefe-6||i<6?'#c4c6cb':seite};transform:translateZ(${-i}px)"></div>`
 const k=breite/900
 const tasten=(links)=>links?`<i class=ta style="left:${-5*k}px;top:${360*k}px;height:${62*k}px"></i><i class=ta style="left:${-5*k}px;top:${470*k}px;height:${118*k}px"></i><i class=ta style="left:${-5*k}px;top:${610*k}px;height:${118*k}px"></i>`:`<i class=ta style="right:${-5*k}px;top:${500*k}px;height:${190*k}px"></i>`
 return `<div class=szene style="width:${breite}px;height:${hoch}px;transform:perspective(${5200*k}px) rotateY(${kipp===0?0:kipp<0?16:-16}deg) rotateX(${kipp===0?0:5}deg) rotateZ(${kipp===0?0:kipp<0?-5:5}deg);transform-style:preserve-3d;">
 ${lagen}
 <div style="position:absolute;inset:0;border-radius:${r}px;background:${metall};padding:${rand}px;transform-style:preserve-3d">
  ${tasten(true)}${tasten(false)}
  <div style="width:100%;height:100%;border-radius:${inR}px;background:#07070a;padding:${bez}px;position:relative">
   <div style="width:100%;height:100%;border-radius:${scrR}px;overflow:hidden;position:relative;background:#fff">
    <div style="height:${sb}px;background:#fff;display:flex;align-items:flex-end;justify-content:space-between;padding:0 ${54*k}px ${10*k}px;font:800 ${36*k}px -apple-system,'SF Pro Display',sans-serif;color:#0b0b10"><span style="padding-left:${18*k}px">${zeit}</span>
     <span style="display:flex;gap:${9*k}px;align-items:center"><svg width="${44*k}" height="${28*k}" viewBox="0 0 22 14"><rect x="0" y="9" width="4" height="5" rx="1"/><rect x="6" y="6" width="4" height="8" rx="1"/><rect x="12" y="3" width="4" height="11" rx="1"/><rect x="18" y="0" width="4" height="14" rx="1"/></svg><svg width="${40*k}" height="${28*k}" viewBox="0 0 20 14"><path d="M10 3.2c2.7 0 5.2 1 7 2.8l1.6-1.7A12.4 12.4 0 0 0 10 .8 12.4 12.4 0 0 0 1.4 4.3L3 6a10 10 0 0 1 7-2.8zm0 4.1c1.6 0 3 .6 4.1 1.6l1.7-1.7A8.3 8.3 0 0 0 10 5a8.3 8.3 0 0 0-5.8 2.2l1.7 1.7A6 6 0 0 1 10 7.3zm0 4c-.9 0-1.6.3-2.2.8L10 14l2.2-1.9c-.6-.5-1.3-.8-2.2-.8z"/></svg><svg width="${62*k}" height="${28*k}" viewBox="0 0 31 14"><rect x=".5" y=".5" width="26" height="13" rx="3.6" fill="none" stroke="#0b0b10" opacity=".45"/><rect x="2" y="2" width="23" height="10" rx="2.2"/><path d="M28 4.6v4.8c1-.3 1.8-1.3 1.8-2.4S29 4.9 28 4.6z" opacity=".5"/></svg></span></div>
    <img src="${bild}" style="display:block;width:100%">
    <div style="position:absolute;left:50%;bottom:${10*k}px;width:${300*k}px;height:${10*k}px;margin-left:${-150*k}px;border-radius:9px;background:#0b0b10"></div>
    <div style="position:absolute;left:50%;top:${20*k}px;width:${250*k}px;height:${72*k}px;margin-left:${-125*k}px;border-radius:${40*k}px;background:#050507"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(118deg,rgba(255,255,255,.20) 0%,rgba(255,255,255,.05) 26%,rgba(255,255,255,0) 40%);pointer-events:none"></div>
   </div></div></div></div>`}
export const iphoneCss=`.szene{position:absolute;filter:drop-shadow(0 70px 70px rgba(20,8,50,.36))}.ta{position:absolute;width:${10}px;background:linear-gradient(90deg,#6e7076,#c8cacf);border-radius:4px;display:block}`
