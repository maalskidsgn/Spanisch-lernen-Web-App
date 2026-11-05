(function(){const q=new URLSearchParams(location.search);const A=window.__A=q.get('a'),L=q.get('l');
const de=L==='de';
const B={habloo:{fehler:[{falsch:'estaba muy frío',richtig:'estaba muy fría',erklaerung:de?'„Agua“ ist weiblich, das Adjektiv also auch.':'"Agua" is feminine, so the adjective is too.'},{falsch:'fui en la playa',richtig:'fui a la playa',erklaerung:de?'Bei Bewegung zu einem Ort steht „a“.':'Use "a" for movement towards a place.'}],zuletzt:de?'Du hast flüssig von deinem Wochenende erzählt.':'You talked about your weekend with ease.',vok:[['la playa',de?'der Strand':'the beach'],['nadar',de?'schwimmen':'to swim'],['frío, fría',de?'kalt':'cold']]},
davaigo:{fehler:[{falsch:'вода был холодный',richtig:'вода была холодная',erklaerung:de?'„Вода“ ist weiblich, Verb und Adjektiv also auch.':'"Вода" is feminine, so the verb and adjective are too.'},{falsch:'я ходил в пляж',richtig:'я ходил на пляж',erklaerung:de?'Beim Strand steht „на“, nicht „в“.':'Use "на" with "пляж", not "в".'}],zuletzt:de?'Du hast flüssig von deinem Wochenende erzählt.':'You talked about your weekend with ease.',vok:[['пляж',de?'der Strand':'the beach'],['плавать',de?'schwimmen':'to swim'],['холодный',de?'kalt':'cold']]}}[A];
const J=o=>new Response(JSON.stringify(o),{status:200,headers:{'Content-Type':'application/json'}});
const f0=window.fetch;window.fetch=async(u,o)=>{const s=String(u);
 if(s.includes('/api/sprechen/status'))return J({erlaubt:true,premium:true,kontingentMinuten:120,restMinuten:112,maxMinuten:10,gedaechtnis:{gespraeche:3,fehler:[],merken:[],profil:{}}});
 if(s.includes('/api/sprechen/gespraeche'))return J({liste:[]});
 if(s.includes('/api/sprechen/start'))return J({id:'x',sdp:'v=0',premium:true,maxSekunden:600});
 if(s.includes('/api/sprechen/ende'))return J({zuletzt:B.zuletzt,fehler:B.fehler,vokabeln:B.vok.map(([wort,bedeutung])=>({wort,bedeutung}))});
 return f0(u,o)};
try{Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}})}catch{}
window.RTCPeerConnection=class{constructor(){this.connectionState='connected'}createDataChannel(){return window.__kanal={send(){},close(){}}}async createOffer(){return{sdp:'x'}}async setLocalDescription(){}async setRemoteDescription(){setTimeout(()=>window.__kanal.onopen(),50)}addTrack(){}close(){}async getStats(){return new Map()}};
window.__spiel=(ev)=>window.__kanal.onmessage({data:JSON.stringify(ev)});
})();
