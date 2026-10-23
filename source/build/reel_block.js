/* ================= Feature 3: Friday highlight reel (built on the device, never stored) ================= */
/* the reel week runs from last Friday to this Thursday; on Fridays it's brand new */
function reelWeek(){const d=new Date();d.setHours(0,0,0,0);const back=(d.getDay()+2)%7;const start=new Date(d.getTime()-back*864e5);return {start:start.getTime(),fresh:d.getDay()===5||d.getDay()===6||d.getDay()===0};}
function reelClips(L){if(!L||!L.uid)return [];const w=reelWeek(),since=Math.min(w.start,Date.now()-7*864e5);
  const xs=kpItems(L.uid).filter(x=>x.kind==="audio"&&x.data&&(x.at||0)>=since);
  const keep=x=>!!pipTry(()=>(pcFor(x.id)||{}).keep);
  return xs.sort((a,b)=>(keep(b)-keep(a))||((b.at||0)-(a.at||0))).slice(0,8);}
const reelCaption=x=>{const t=String(x.title||"").replace(/^Saying\s+/,"");return t||"A new recording";};
function reelCardHTML(L){if(!L||!L.uid)return "";if(!D.kp[L.uid])loadKp(L.uid);const cs=reelClips(L),f=firstOf(L.name),w=reelWeek();
  return `<section class="reelcard">${art("pip",60,"Pip")}<div class="grow"><span class="eyebrow">${w.fresh?"New this Friday":"This week"}</span><b>This week in ${esc(f)}'s garden</b>
    ${cs.length?`<span>${cs.length} clip${cs.length===1?"":"s"} from this week, up to 60 seconds.</span><div class="row adbtns"><button class="btn btn-primary btn-sm" data-act="reelPlay" data-id="${esc(L.id)}">${ic("play")}Play the reel</button></div>`
      :`<span>No recordings this week yet. Record a word with ${esc(f)} this weekend! 🎤</span>`}</div></section>`;}
let REEL=null;
A.reelPlay=lid=>{const L=learner(lid);if(!L)return;const cs=reelClips(L);if(!cs.length)return;const f=firstOf(L.name);
  REEL={i:-1,cs,f,t0:Date.now(),used:0,audio:null,timer:null,paused:false};
  openModal(`This week in ${f}'s garden`,`<div class="reel" id="reel" aria-live="polite"></div><div class="reelbar"><i id="reel-p"></i></div>`,{wide:true,noFocus:true,
    footerExtra:`<button type="button" class="btn btn-ghost" data-mact="pause" id="reel-pause">Pause</button><button type="button" class="btn btn-ghost" data-mact="skip">Next ${ic("fwd")}</button>`,
    actions:{skip:()=>reelNext(),pause:()=>{if(!REEL)return;REEL.paused=!REEL.paused;const b=document.getElementById("reel-pause");if(b)b.textContent=REEL.paused?"Play":"Pause";clearTimeout(REEL.timer);if(REEL.audio){REEL.paused?REEL.audio.pause():REEL.audio.play().catch(()=>{});}else if(!REEL.paused)REEL.timer=setTimeout(reelNext,1500);}}});
  reelScreen(`${art("pip",120,"Pip")}<h2>This week in ${esc(f)}'s garden</h2><p>Listen to ${esc(f)} grow! 🌱</p>`);REEL.timer=setTimeout(reelNext,2800);
  const obs=setInterval(()=>{if(!document.getElementById("reel")){clearInterval(obs);reelStop();}},500);};
function reelScreen(h){const el=document.getElementById("reel");if(el)el.innerHTML=h;}
function reelStop(){if(!REEL)return;clearTimeout(REEL.timer);if(REEL.audio){try{REEL.audio.pause()}catch(e){}}REEL=null;}
function reelNext(){if(!REEL)return;clearTimeout(REEL.timer);if(REEL.audio){try{REEL.audio.pause()}catch(e){}REEL.audio=null;}
  REEL.i++;const r=REEL;
  if(r.i>=r.cs.length||r.used>=60){reelScreen(`${art("bloom",110,"Bloom")}<h2>See you next week!</h2><p>${esc(r.f)} is blooming. Keep growing together. 🌸</p>`);const p=document.getElementById("reel-p");if(p)p.style.width="100%";return;}
  const x=r.cs[r.i],left=Math.max(1,60-r.used);
  reelScreen(`<div class="reelclip"><span class="pill p-sun">${r.i+1} of ${r.cs.length}</span><b class="reelcap">${esc(reelCaption(x))}</b><span class="small muted">${esc(fmtDay(new Date(x.at)))}</span><div class="reelwave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div>`);
  const a=new Audio(x.data);r.audio=a;const started=Date.now();
  const done=()=>{if(REEL!==r||r.audio!==a)return;r.used+=Math.min(left,(Date.now()-started)/1000);const p=document.getElementById("reel-p");if(p)p.style.width=Math.min(100,r.used/60*100)+"%";reelNext();};
  a.onended=done;a.onerror=()=>{r.timer=setTimeout(done,1200);};a.play().catch(()=>{r.timer=setTimeout(done,2500);});
  r.timer=setTimeout(()=>{try{a.pause()}catch(e){}done();},left*1000);}
