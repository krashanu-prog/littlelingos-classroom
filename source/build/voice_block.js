/* ================= Pip's voice: the same voice everywhere ================= */
/* Pip's real voice is Kokoro "af_heart" at speed 0.88 (US English, natural pitch), processed with an
   80 Hz high-pass, +2.5 dB at 3 kHz, light compression and -16 LUFS loudness (the academy's own recordings).
   1) The academy's recordings (pip-*.mp3) play for Pip's own lines and words.
   2) Every other word the app reads aloud plays from Pip's built-in voice library (pv/*.mp3, listed in
      pv.json), made with the same voice and the same processing.
   3) Words added later can be recorded by the admin (Pip's voice page, config/pv + file store).
   4) Only a line nobody has recorded yet (or a non-English word) uses the device voice. */
const PIP_VOICE={rate:.88,pitch:1};
const PIP_CLIP_FILES={hi:"pip-hi.mp3",plant:"pip-plant.mp3",sayit:"pip-sayit.mp3",yay:"pip-yay.mp3",seed:"pip-seed.mp3",turn:"pip-turn.mp3",curious:"pip-curious.mp3","curious-syl":"pip-curious-syl.mp3",giant:"pip-giant.mp3"};
const PIP_PHRASES={"hi friends im pip":"hi","hi im pip":"hi","let us plant a new word today":"plant","lets plant a new word today":"plant","say it with me":"sayit","yay you planted a new word today":"yay","todays word seed is":"seed","now your turn say it out loud":"turn","curious":"curious","giant":"giant"};
const pipNorm=t=>String(t||"").toLowerCase().replace(/[’']/g,"").replace(/[^a-z ]+/g," ").replace(/\s+/g," ").trim();
let pipAudio=null;const pipCache=new Map();
function pipStop(){if(pipAudio){pipAudio.__stopped=1;try{pipAudio.pause();}catch(e){}pipAudio=null;}}
/* play one sound file; resolves true when it ends, "stop" if something else interrupted it, false if it could not play */
function pipAudioPlay(src,slow){if(!src)return Promise.resolve(false);pipStop();try{window.speechSynthesis&&window.speechSynthesis.__origCancel&&window.speechSynthesis.__origCancel();}catch(e){}
  return new Promise(res=>{try{let a=pipCache.get(src);if(!a||!a.paused){a=new Audio(src);a.preload="auto";if(pipCache.size>80)pipCache.delete(pipCache.keys().next().value);pipCache.set(src,a);}
    a.currentTime=0;a.playbackRate=slow?.8:1;try{a.preservesPitch=true;}catch(e){}pipAudio=a;let done=false;a.__stopped=0;
    const fin=ok=>{if(done)return;done=true;if(ok!==true&&a.__stopped)ok="stop";if(pipAudio===a)pipAudio=null;res(ok);};
    a.onended=()=>fin(true);a.onerror=()=>fin(false);const p=a.play();if(p&&p.catch)p.catch(()=>fin(false));
    const wd=()=>{if(done)return;if(a.paused&&!a.__stopped&&a.currentTime===0&&a.readyState<2)fin(false);else if(!a.paused)setTimeout(wd,1000);};setTimeout(wd,6000);setTimeout(()=>fin(a.__stopped?"stop":true),20000);}catch(e){res(false);}});}
function pipPlay(key){const f=PIP_CLIP_FILES[key];return f?pipAudioPlay(f,false):Promise.resolve(false);}
const pipClipFor=(text,slow)=>{const k=PIP_PHRASES[pipNorm(text)];if(!k)return null;if(slow&&PIP_CLIP_FILES[k+"-syl"])return k+"-syl";return k;};

/* ---------- Pip's voice library (config/pv: {k:{key:version}, x:{key:"extra line"}}) ---------- */
const pvNorm=t=>String(t||"").toLowerCase().replace(/[’‘`]/g,"'").replace(/[^a-z0-9' ]+/g," ").replace(/\s+/g," ").trim();
const pvKey=t=>{const s=pvNorm(t);if(!s)return "";let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h.toString(36)+s.length.toString(36);};
let pvSub=0,pvWaiters=[];
function pvLoad(){if(pvSub||!S.db||!S.uid)return;pvSub=1;
  try{S.db.doc("config/pv").onSnapshot(d=>{D.pv=(d.exists&&d.data())||{};const w=pvWaiters;pvWaiters=[];w.forEach(f=>f());if(S.view==="pipvoice"||role()==="admin")schedule();},()=>{pvSub=0;});}catch(e){pvSub=0;}}
const pvWait=ms=>D.pv!==undefined?Promise.resolve():new Promise(r=>{pvWaiters.push(r);setTimeout(r,ms);});
setInterval(()=>{if(D.pv===undefined)pvLoad();},2000);
const pvIdx=()=>{pvLoad();return (D.pv&&D.pv.k)||{};};
const pvUrl=k=>{const v=k&&pvIdx()[k];return v&&window.LL_assetUrl?window.LL_assetUrl("pv/"+k+".mp3")+"?v="+v:"";};
const PV_MISS=new Map();
/* the built-in library that ships with the app */
let PVS=null;const pvsP=fetch("pv.json",{cache:"no-cache"}).then(r=>r.ok?r.json():{}).catch(()=>({})).then(j=>{PVS=(j&&j.k)||{};return PVS;});
const pvsUrl=k=>PVS&&k&&PVS[k]?"pv/"+k+".mp3?v="+PVS[k]:"";
const pvAny=k=>pvsUrl(k)||pvUrl(k);
/* say one line in Pip's voice and wait until it has finished */
function pipSpeak(text,slow){return new Promise(res=>{if(!canSpeak())return res(false);let done=false;const fin=()=>{if(!done){done=true;res(true);}};
  try{const u=new SpeechSynthesisUtterance(text);u.lang="en-IN";u.rate=slow?.65:.8;u.onend=fin;u.onerror=fin;speechSynthesis.speak(u);setTimeout(fin,6000);}catch(e){res(false);}});}

(function(){const synth=window.speechSynthesis;if(!synth||synth.__pipVoice)return;let voices=[];
  const load=()=>{try{voices=synth.getVoices()||[];}catch(e){voices=[];}};load();
  try{synth.addEventListener("voiceschanged",load);}catch(e){try{synth.onvoiceschanged=load;}catch(e2){}}
  const WARM=/(Samantha|Ava|Allison|Susan|Aria|Jenny|Michelle|Emma|Zira|Google US English|Female)/i;
  const pick=lang=>{const l=String(lang||"en-US"),base=l.slice(0,2).toLowerCase();if(!voices.length)load();
    if(base==="en"){const us=voices.filter(x=>/^en[-_]US/i.test(x.lang));return us.find(x=>WARM.test(x.name))||us[0]||voices.find(x=>/^en[-_](GB|AU|IN)/i.test(x.lang)&&WARM.test(x.name))||voices.find(x=>/^en/i.test(x.lang))||null;}
    return voices.find(x=>x.lang&&x.lang.toLowerCase().replace("_","-")===l.toLowerCase())||voices.find(x=>x.lang&&x.lang.toLowerCase().startsWith(base))||null;};
  const orig=synth.speak.bind(synth),origCancel=synth.cancel.bind(synth);
  const device=u=>{try{const slow=u.rate&&u.rate<.7;const v=pick(u.lang);if(v){u.voice=v;if(!u.lang||/^en/i.test(u.lang))u.lang=v.lang;}u.pitch=PIP_VOICE.pitch;u.rate=slow?u.rate:PIP_VOICE.rate;}catch(e){}try{orig(u);}catch(e){}};
  try{synth.__origCancel=origCancel;
    synth.cancel=()=>{pipStop();return origCancel();};
    synth.speak=u=>{if(!u||u.__pipDone)return orig(u);u.__pipDone=1;
      try{const en=!u.lang||/^en/i.test(u.lang),slow=!!(u.rate&&u.rate<.7);
        if(en){const fin=ok=>{if(ok===true){try{u.onend&&u.onend(new Event("end"));}catch(e){}}else if(!ok)device(u);};
          const clip=pipClipFor(u.text,slow);if(clip){pipPlay(clip).then(fin);return;}
          const k=pvKey(u.text);
          const go=()=>{const url=pvAny(k);if(url){pipAudioPlay(url,slow).then(fin);return true;}if(k)PV_MISS.set(k,String(u.text).trim().slice(0,120));return false;};
          if(PVS===null||(!pvsUrl(k)&&D.pv===undefined&&S.db)){Promise.race([pvsP,new Promise(r=>setTimeout(r,1500))]).then(()=>pvsUrl(k)?0:pvWait(1200)).then(()=>{if(!go())device(u);});return;}
          if(go())return;}
      }catch(e){}
      device(u);};
    synth.__pipVoice=1;}catch(e){}})();
/* tap Pip in the garden to hear him say hello */
document.addEventListener("click",e=>{const p=e.target.closest&&e.target.closest(".garden .pip,.garden .pipbtn");if(!p)return;pipPlay("hi").then(ok=>{if(ok===true)setTimeout(()=>pipPlay("plant"),250);});});

/* ---------- admin: every line the app can read aloud ---------- */
function pvGather(){const out=new Map();
  const add=(t,lang)=>{if(lang&&!/^en/i.test(lang))return;t=String(t||"").replace(/\s+/g," ").trim();if(!t||t.length>120||pipClipFor(t))return;const k=pvKey(t);if(k&&!out.has(k))out.set(k,t);};
  try{for(const l of Object.values(D.lessons||{})){if(!l)continue;const c=D.courses[l.courseId];for(const [w] of parseVocab(l.vocab))add(w,langOf(c));}}catch(e){}
  try{for(const s of Object.values(D.sessions||{})){if(!s||!s.vocab)continue;const c=D.courses[s.courseId];for(const [w] of parseVocab(s.vocab))add(w,langOf(c));}}catch(e){}
  try{for(const st of Object.keys(STARTER))for(const [w] of STARTER[st])add(w);}catch(e){}
  try{for(const x of wodItems())add(x.word);for(const st of WOD_STAGES)for(const x of wodStarterItems(st))add(x.word);}catch(e){}
  try{for(const g of SP)for(const p of g.pairs){add(p[0]);add(p[2]);}}catch(e){}
  try{for(const pk of PACKS)for(const x of pk.w)add(x[1]);}catch(e){}
  for(const t of Object.values((D.pv&&D.pv.x)||{}))add(t);
  for(const t of PV_MISS.values())add(t);
  return out;}
const pvHas=k=>!!(pvsUrl(k)||pvIdx()[k]);
const pvMissing=()=>{if(D.pv===undefined||PVS===null)return [];return [...pvGather()].filter(([k])=>!pvHas(k));};

/* recording happens on the admin's own computer, in this browser tab */
let PVE=null;
const PV_MODEL="onnx-community/Kokoro-82M-v1.0-ONNX";
const pvLame=()=>window.lamejs?Promise.resolve():new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js";s.onload=()=>res();s.onerror=()=>rej(new Error("the MP3 maker did not load"));document.head.appendChild(s);});
async function pvEngine(note){if(PVE)return PVE;
  const pc=p=>{if(p&&p.status==="progress"&&/onnx/.test(p.file||"")&&p.total)note(`Downloading Pip's voice to this computer… ${Math.round(p.loaded/p.total*100)}% (only the first time)`);};
  note("Loading Pip's voice…");await pvLame();
  const m=await import("https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm");let tts=null;
  if(navigator.gpu){try{tts=await m.KokoroTTS.from_pretrained(PV_MODEL,{dtype:"fp32",device:"webgpu",progress_callback:pc});await tts.generate("Hi",{voice:"af_heart",speed:PIP_VOICE.rate});}catch(e){tts=null;}}
  if(!tts)tts=await m.KokoroTTS.from_pretrained(PV_MODEL,{dtype:"fp32",device:"wasm",progress_callback:pc});
  PVE=tts;return tts;}
/* the same finishing as the academy's recordings: 80 Hz high-pass, +2.5 dB at 3 kHz, light compression,
   loudness matched to the recordings (about -16 dB), peaks kept under -1.5 dB */
async function pvProcess(f32,sr){let i=0,j=f32.length-1;while(i<j&&Math.abs(f32[i])<.01)i++;while(j>i&&Math.abs(f32[j])<.01)j--;
  i=Math.max(0,i-Math.round(sr*.04));j=Math.min(f32.length-1,j+Math.round(sr*.12));const x=f32.slice(i,j+1);
  const ctx=new OfflineAudioContext(1,x.length,sr),buf=ctx.createBuffer(1,x.length,sr);buf.copyToChannel(x,0);const src=ctx.createBufferSource();src.buffer=buf;
  const hp=ctx.createBiquadFilter();hp.type="highpass";hp.frequency.value=80;hp.Q.value=.707;
  const pk=ctx.createBiquadFilter();pk.type="peaking";pk.frequency.value=3000;pk.Q.value=.9;pk.gain.value=2.5;
  const cp=ctx.createDynamicsCompressor();cp.threshold.value=-20;cp.knee.value=6;cp.ratio.value=2.5;cp.attack.value=.005;cp.release.value=.12;
  src.connect(hp);hp.connect(pk);pk.connect(cp);cp.connect(ctx.destination);src.start();const out=(await ctx.startRendering()).getChannelData(0);
  let pk0=0;for(const v of out)pk0=Math.max(pk0,Math.abs(v));const th=pk0*.03;let sum=0,n=0;for(const v of out){if(Math.abs(v)>th){sum+=v*v;n++;}}
  const g=Math.pow(10,-16.3/20)/(Math.sqrt(sum/Math.max(1,n))||1e-4),lim=Math.pow(10,-1.5/20),knee=lim*.8,y=new Float32Array(out.length);
  for(let q=0;q<out.length;q++){let v=out[q]*g;const m=Math.abs(v);if(m>knee)v=Math.sign(v)*(knee+(lim-knee)*Math.tanh((m-knee)/(lim-knee)));y[q]=v;}
  return y;}
function pvMp3(f32,sr){let i=0,j=f32.length-1;while(i<j&&Math.abs(f32[i])<.01)i++;while(j>i&&Math.abs(f32[j])<.01)j--;
  i=Math.max(0,i-Math.round(sr*.04));j=Math.min(f32.length-1,j+Math.round(sr*.1));const n=Math.max(1,j-i+1),pcm=new Int16Array(n);
  for(let q=0;q<n;q++){const v=Math.max(-1,Math.min(1,f32[i+q]||0));pcm[q]=v<0?v*32768:v*32767;}
  const enc=new lamejs.Mp3Encoder(1,sr,48),parts=[];for(let q=0;q<n;q+=1152){const b=enc.encodeBuffer(pcm.subarray(q,q+1152));if(b.length)parts.push(new Uint8Array(b));}
  const e=enc.flush();if(e.length)parts.push(new Uint8Array(e));return new Blob(parts,{type:"audio/mpeg"});}
async function pvUpload(k,blob){const st=window.LL_sb.storage.from("assets"),path="pv/"+k+".mp3";
  let r=await st.upload(path,blob,{contentType:"audio/mpeg",upsert:false,cacheControl:"31536000"});
  if(r.error&&/exist|duplicate|409/i.test(String(r.error.message||r.error.statusCode||r.error.error||""))){await st.remove([path]);r=await st.upload(path,blob,{contentType:"audio/mpeg",upsert:false,cacheControl:"31536000"});}
  if(r.error)throw new Error(r.error.message||"upload failed");}
function pvProgHTML(){const J=S.pvJob;if(!J)return "";const pct=J.n?Math.round(J.i/J.n*100):0;
  return `<div class="pvprog" role="status" aria-live="polite"><div class="pvbar"><i style="width:${pct}%"></i></div><p class="small"><b class="num">${J.i} of ${J.n}</b> · ${esc(J.msg||"")}${J.err?` · <span class="muted">${J.err} could not be saved, press Record again to retry</span>`:""}</p>${J.run?`<button class="btn btn-ghost btn-sm" data-act="pvStop">Stop</button>`:""}</div>`;}
const pvDraw=()=>{const el=document.getElementById("pv-prog");if(el)el.innerHTML=pvProgHTML();};
A.pvRecord=async()=>{if(role()!=="admin"||(S.pvJob&&S.pvJob.run))return;const miss=pvMissing();if(!miss.length){toast("Every line is already in Pip's voice");return}
  const J=S.pvJob={run:true,i:0,n:miss.length,msg:"Getting ready…",err:0,stop:false};render(true);
  try{const tts=await pvEngine(m=>{J.msg=m;pvDraw();});let batch={};
    for(const [k,t] of miss){if(J.stop)break;J.msg=`Recording “${t}”`;pvDraw();
      try{const a=await tts.generate(t,{voice:"af_heart",speed:PIP_VOICE.rate});await pvUpload(k,pvMp3(await pvProcess(a.audio,a.sampling_rate),a.sampling_rate));batch[k]=Date.now().toString(36);}catch(e){J.err++;console.warn("Pip's voice:",t,e);}
      J.i++;pvDraw();if(Object.keys(batch).length>=10){await upsert("config/pv",{k:batch});batch={};}}
    if(Object.keys(batch).length)await upsert("config/pv",{k:batch});
    J.msg=J.stop?"Stopped. Press Record to carry on where you left off.":"Done! These lines now play in Pip's voice on every device.";
  }catch(e){J.msg="Pip's voice could not load on this computer ("+(e&&e.message||e)+"). Use Chrome or Edge on a laptop or desktop and try again.";}
  J.run=false;render(true);};
A.pvStop=()=>{if(S.pvJob)S.pvJob.stop=true;};
A.pvHear=k=>{const url=pvAny(k);if(url)pipAudioPlay(url,false);};
A.pvAdd=()=>{if(role()!=="admin")return;openModal("Add a line for Pip",`<p class="small muted">Type a word or a short sentence the app reads aloud, for example a word from a class. It is added to the list to record.</p><div class="field"><label for="pv-t">Word or line</label><input id="pv-t" name="t" maxlength="120" required></div>`,
  {submitLabel:"Add",done:"Added. Press Record to say it in Pip's voice.",onSubmit:async f=>{const t=f.t.value.replace(/\s+/g," ").trim();if(!t)throw new Error("Type a word or line first");const k=pvKey(t);if(!k)throw new Error("Use English letters for Pip's voice");await upsert("config/pv",{x:{[k]:t}});}});};
function pipvoiceView(){if(role()!=="admin")return pendingHTML();
  if(D.pv===undefined||PVS===null){pvLoad();pvsP.then(()=>schedule());return `<div class="head"><div><h1>Pip's voice</h1></div></div><p class="muted">Loading…</p>`;}
  const all=[...pvGather()],done=all.filter(([k])=>pvHas(k)),miss=all.filter(([k])=>!pvHas(k)),J=S.pvJob,run=J&&J.run;
  const pct=all.length?Math.round(done.length/all.length*100):100;
  return `<div class="head"><div><h1>Pip's voice</h1><p class="lede">Every word the app reads aloud plays in Pip's own voice, the same on every phone. After you add lessons or Word of the Day words, record the new ones here.</p></div><button class="btn btn-ghost" data-act="pvAdd">${ic("plus")}Add a line</button></div>
  <section class="card panel"><div class="ph"><h2>Pip's voice library</h2><span class="pill ${miss.length?"p-sun":"p-good"} num">${pct}% recorded</span></div>
    <div class="pvstats"><div><b class="num">${all.length}</b><span>words and lines</span></div><div><b class="num">${done.length}</b><span>in Pip's voice</span></div><div><b class="num">${miss.length}</b><span>still to record</span></div></div>
    ${miss.length&&!run?`<button class="btn btn-primary" data-act="pvRecord">${ic("sound")}Record ${miss.length} ${miss.length===1?"line":"lines"} in Pip's voice</button>
      <p class="small muted">Keep this tab open while Pip records. The first time, this computer downloads Pip's voice (about 330 MB, once), then each line takes about a second. Use Chrome or Edge on a laptop or desktop.</p>`:""}
    ${!miss.length&&!run?`<p class="small">All set. Every word and line plays in Pip's voice.</p>`:""}
    <div id="pv-prog">${pvProgHTML()}</div></section>
  ${miss.length?`<section class="card panel"><div class="ph"><h2>Still to record <span class="pill p-mute num">${miss.length}</span></h2></div><div class="pvchips">${miss.slice(0,120).map(([,t])=>`<span class="pvchip">${esc(t)}</span>`).join("")}${miss.length>120?`<span class="small muted">and ${miss.length-120} more</span>`:""}</div></section>`:""}
  <section class="card panel"><div class="ph"><h2>Recorded <span class="pill p-mute num">${done.length}</span></h2></div>${done.length?(()=>{const chips=`<div class="pvchips">${done.map(([k,t])=>`<button type="button" class="pvchip on" data-act="pvHear" data-id="${esc(k)}" aria-label="Hear ${esc(t)}">${ic("sound")}${esc(t)}</button>`).join("")}</div>`;return done.length>24?`<details class="pvmore"><summary>Show all ${done.length} and tap one to hear it</summary>${chips}</details>`:chips;})():`<p class="muted">Nothing recorded yet.</p>`}
    <p class="small muted">Words in other languages (for example a Hindi course) use the device's voice for that language, because Pip speaks English.</p></section>`;}
