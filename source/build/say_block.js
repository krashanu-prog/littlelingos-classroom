/* ================= Phase 7: "Say it" upgrade (what Pip heard, 1-3 practice stars, listen again) ================= */
function lev(a,b){if(a===b)return 0;const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=Array.from({length:n+1},(_,i)=>i);
  for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c;}return p[n];}
/* 3 = Pip heard the word, 2 = very close, 1 = Pip heard something (a good try), 0 = nothing heard */
function sayScore(target,alts){const t=norm(target);if(!t)return {stars:0,heard:""};let best={stars:0,heard:(alts||[])[0]||""};
  for(const a of alts||[]){const h=norm(a);if(!h)continue;const words=h.split(" ");let s=1;
    if(h===t||words.includes(t)||(t.includes(" ")&&h.includes(t)))s=3;
    else{const cands=[h,...words];const sim=Math.max(...cands.map(w=>1-lev(w,t)/Math.max(w.length,t.length)));if(sim>=.6)s=2;}
    if(s>best.stars)best={stars:s,heard:a};}
  if(!best.heard&&alts&&alts.length)best.heard=alts[0];return best;}
const SAYMSG=["Pip couldn't hear you. Try a little louder, close to the phone.","Good try! Listen to Pip and have another go.","So close! Listen again and try once more.","Perfect! You said it beautifully!"];
function sayStarsHTML(n){return `<span class="saystars" aria-label="${n} of 3 stars">${[1,2,3].map(i=>`<span class="${i<=n?"on":""}">★</span>`).join("")}</span>`;}
function drillModal(){const d=S.drill;if(!d)return;const x=d.ws[d.i];const rec=canRecord(),sr=!!SR;
  const res=d.said?`<div class="sayres s3" aria-live="polite"><p class="saymsg">Well done for saying it out loud! 🌱</p></div>`:d.heard!=null?`<div class="sayres s${d.stars||0}" aria-live="polite">${sayStarsHTML(d.stars||0)}<p class="sayheard">${d.heard?`Pip heard: <b>“${esc(d.heard)}”</b>`:"Pip didn't hear anything."}</p><p class="saymsg">${SAYMSG[d.stars||0]}</p></div>`:"";
  openModal("Repeat after me",`<div class="drill"><span class="pill p-mute">Word ${d.i+1} of ${d.ws.length}</span><b class="dword">${esc(x.w)}</b><span class="dmean">${esc(x.m||"")}</span>
    <div class="drow"><button type="button" class="btn ${d.heard!=null&&d.stars<3?"btn-sun":"btn-ghost"} btn-big" data-mact="listen">${ic("sound",22)}${d.heard!=null?"Listen again":"Listen"}</button>
    ${rec||sr?`<button type="button" class="btn ${d.recording?"btn-danger":"btn-primary"} btn-big" data-mact="rec">${d.recording?(rec?"■ Stop":"Listening…"):(d.heard!=null?"🎤 Try again":"🎤 Say it")}</button>`:""}</div>
    ${res}
    ${d.clip?`<audio controls src="${esc(d.clip)}"></audio>`:""}
    ${d.clip?`<label class="row" style="font-weight:700"><input type="checkbox" data-mact="keep" ${d.keep?"checked":""} style="width:22px;height:22px;accent-color:var(--leafMid)"> Keep this in my portfolio</label>`:""}
    ${!sr?`<p class="small muted">${rec?"Pip can't listen for words on this browser, but you can record yourself and play it back.":"This device can't record here, so just say the word out loud after Pip."}</p>${!rec?`<button type="button" class="btn btn-ghost" data-mact="said">I said it!</button>`:""}`:""}
    <p class="small muted">Pip's stars are for practice. Your teacher gives your real speaking score.</p></div>`,
  {noFocus:true,footerExtra:`${d.i>0?`<button type="button" class="btn btn-ghost" data-mact="prev">${ic("back")}Back</button>`:""}<button type="button" class="btn btn-leaf" data-mact="next">${d.i<d.ws.length-1?"Next word":"Finish"} ${ic("fwd")}</button>`,
  actions:{listen:()=>{if(canSpeak()){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(x.w);u.lang=x.lang||"en-IN";u.rate=d.heard!=null?.65:.8;speechSynthesis.speak(u);}catch(e){}}},
    said:()=>{d.said=true;drillModal();},
    rec:async()=>{if(d.recording){if(rec)stopRec();return}
      d.clip=null;d.heard=null;d.stars=0;
      const listen=()=>{if(!SR)return;try{const r=new SR();r.lang=x.lang||"en-IN";r.maxAlternatives=5;let got=false;
        r.onresult=e=>{got=true;const alts=[...e.results[0]].map(a=>a.transcript);const sc=sayScore(x.w,alts);d.heard=sc.heard;d.stars=sc.stars;wkLog(x.w,sc.stars>=2);d.best=Math.max(d.best||0,sc.stars);if(!rec)d.recording=false;if(!d.recording)drillModal();};
        r.onerror=()=>{if(!rec){d.recording=false;d.heard=d.heard??"";drillModal();}};r.onend=()=>{if(!rec&&d.recording){d.recording=false;if(!got)d.heard="";drillModal();}};
        r.start();setTimeout(()=>{try{r.stop()}catch{}},6000);}catch(e){}};
      if(rec){const ok=await startRec(6,async(url,size)=>{d.recording=false;d.clip=url;d.size=size;if(d.heard==null&&SR)d.heard="";drillModal();earn({recs:(+progOf(S.uid).recs||0)+1}).catch(()=>{});});
        if(!ok)return;d.recording=true;drillModal();listen();}
      else{d.recording=true;drillModal();listen();}},
    keep:()=>{d.keep=!d.keep;drillModal();},
    prev:()=>{saveDrillClip();d.i--;Object.assign(d,{clip:null,heard:null,stars:0,keep:false,said:false});drillModal();},
    next:()=>{saveDrillClip();if(d.i<d.ws.length-1){d.i++;Object.assign(d,{clip:null,heard:null,stars:0,keep:false,said:false});drillModal();}else{S.drill=null;closeModal();toast("Great speaking! 🎤");}}}});}
