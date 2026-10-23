/* ================= Feature 6: Sound pairs (listen, tap the picture, then say it) ================= */
/* real, child-friendly words only; each pair is [word A, picture A, word B, picture B] */
const SP=[
  {id:"pf",label:"p / f",tip:"For p, pop your lips together. For f, rest your top teeth on your bottom lip and blow.",seeds:1,pairs:[["pan","🍳","fan","💨"],["pin","📌","fin","🦈"],["pear","🍐","fair","🎡"]]},
  {id:"ssh",label:"s / sh",tip:"For s, smile and hiss like a snake: sss. For sh, push your lips forward: shhh!",seeds:1,pairs:[["sip","🥤","ship","🚢"],["sea","🌊","she","👧"],["sock","🧦","shock","⚡"]]},
  {id:"ii",label:"short i / long ee",tip:"Short i is quick: ship. Long ee is a long, big smile: sheeep.",seeds:1,pairs:[["ship","🚢","sheep","🐑"],["bin","🗑️","bean","🫘"],["hill","⛰️","heel","👠"]]},
  {id:"vw",label:"v / w",tip:"For v, top teeth gently touch your bottom lip and buzz. For w, make your lips round like a little o.",pairs:[["vet","🩺","wet","💦"],["vest","🎽","west","🧭"],["veil","👰","whale","🐋"]]},
  {id:"thd",label:"th / d",tip:"For th, put the tip of your tongue softly between your teeth. For d, tap your tongue just behind your top teeth.",pairs:[["they","👫","day","☀️"],["those","👉","doze","😴"],["then","⏭️","den","🦁"]]},
  {id:"zj",label:"z / j",tip:"For z, buzz like a bee: zzz. For j, it's one quick jump: j!",pairs:[["zoo","🦓","juice","🧃"],["zip","🤐","jeep","🚙"],["zero","0️⃣","jelly","🍮"]]}];
const spGroups=L=>(L&&(L.stage||"Seeds")==="Seeds")?SP.filter(g=>g.seeds):SP;
const spStats=uid=>progOf(uid).sp||{};
const spMiss=o=>o&&o.t?(+o.m||0)/o.t:0;
/* hard pairs come up more often */
function spRounds(L,n){const gs=spGroups(L),st=spStats(L.uid),out=[];let last="";
  for(let i=0;i<n;i++){const w=gs.map(g=>1+3*spMiss(st[g.id])+(st[g.id]?0:1));let r=Math.random()*w.reduce((a,b)=>a+b,0),g=gs[0];
    for(let k=0;k<gs.length;k++){r-=w[k];if(r<=0){g=gs[k];break}}
    let p=g.pairs[Math.floor(Math.random()*g.pairs.length)];if(p[0]===last)p=g.pairs[(g.pairs.indexOf(p)+1)%g.pairs.length];last=p[0];
    const side=Math.random()<.5?0:1,swap=Math.random()<.5;out.push({g,p,side,swap});}
  return out;}
function spTricky(L,min){const st=spStats(L&&L.uid);return spGroups(L).map(g=>({g,o:st[g.id]})).filter(x=>x.o&&x.o.t>=(min||3)&&spMiss(x.o)>=.34).sort((a,b)=>spMiss(b.o)-spMiss(a.o));}
let SPG=null;
const spSpeak=(w,slow)=>{if(!canSpeak())return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(w);u.lang="en-IN";u.rate=slow?.6:.8;speechSynthesis.speak(u);}catch(e){}};
A.soundPairs=()=>{const L=myLearner();if(!L)return;if(timeUp()){render();return}
  SPG={L,rs:spRounds(L,6),i:0,score:0,pick:null,heard:null,stars:0,recording:false,said:false,clip:null,reveal:false,miss:{}};spDraw(true);};
function spDraw(auto){const G=SPG;if(!G)return;if(G.i>=G.rs.length)return spEnd();const R=G.rs[G.i],w=R.p[R.side*2],seeds=(G.L.stage||"Seeds")==="Seeds";
  const opts=[[R.p[0],R.p[1]],[R.p[2],R.p[3]]];if(R.swap)opts.reverse();const sr=!!SR,rec=canRecord(),tts=canSpeak();
  const res=G.pick==null?"":G.pick===w?`<div class="sayres s3" aria-live="polite"><p class="saymsg">Yes! You heard <b>${esc(w)}</b>. 🌱</p></div>`
    :`<div class="sayres s1" aria-live="polite"><p class="saymsg">Good listening! This one was <b>${esc(w)}</b>, not ${esc(G.pick)}. Listen again.</p><p class="small" style="margin:0">${esc(R.g.tip)}</p></div>`;
  const sayRes=G.said?`<p class="saymsg">Well done for saying it out loud! 🎤</p>`:G.heard!=null?`<div class="sayres s${G.stars||0}">${sayStarsHTML(G.stars||0)}<p class="sayheard">${G.heard?`Pip heard: <b>“${esc(G.heard)}”</b>`:"Pip didn't hear anything."}</p><p class="saymsg">${SAYMSG[G.stars||0]}</p></div>`:"";
  openModal("Sound pairs",`<div class="drill sp"><div class="row" style="justify-content:center;gap:8px"><span class="pill p-mute">Round ${G.i+1} of ${G.rs.length}</span><span class="pill p-sun">${esc(R.g.label)}</span></div>
    ${G.pick==null?`<p class="lede" style="margin:0">Listen, then tap the picture you hear.</p>
      ${tts?`<button type="button" class="btn btn-sun btn-big" data-mact="hear">${ic("sound",22)}Listen</button>`
        :`<p class="small muted" style="margin:0">This device can't read aloud. Grown-up, please say the word for your child.</p><button type="button" class="btn btn-ghost btn-sm" data-mact="reveal">${G.reveal?`The word is: <b>${esc(w)}</b>`:"Grown-up: show me the word"}</button>`}`
    :`${res}`}
    <div class="sppick">${opts.map(([ow,oe])=>`<button type="button" class="spbtn${G.pick!=null&&ow===w?" ok":""}${G.pick===ow&&ow!==w?" no":""}" data-mact="pick" data-v="${esc(ow)}" ${G.pick!=null?"disabled":""} aria-label="${esc(ow)}"><span class="spemo" aria-hidden="true">${oe}</span><b class="${seeds?"small":""}">${esc(ow)}</b></button>`).join("")}</div>
    ${G.pick!=null?`<div class="drow">${tts?`<button type="button" class="btn btn-ghost" data-mact="hear">${ic("sound")}Hear it again</button>`:""}
      ${rec||sr?`<button type="button" class="btn ${G.recording?"btn-danger":"btn-primary"}" data-mact="say">${G.recording?(rec?"■ Stop":"Listening…"):(G.heard!=null||G.clip?"🎤 Try again":"🎤 Now say it")}</button>`:`<button type="button" class="btn btn-ghost" data-mact="said">I said it!</button>`}</div>
      ${sayRes}${G.clip&&!sr?`<audio controls src="${esc(G.clip)}"></audio>`:""}<p class="small muted" style="margin:0">Pip's stars are for practice. Your teacher gives your real speaking score.</p>`:""}</div>`,
  {noFocus:true,footerExtra:G.pick!=null?`<button type="button" class="btn btn-leaf" data-mact="next">${G.i<G.rs.length-1?"Next round":"Finish"} ${ic("fwd")}</button>`:"",
   actions:{hear:()=>spSpeak(w,G.pick!=null&&G.pick!==w),reveal:()=>{G.reveal=!G.reveal;spDraw();},
    pick:(v,el)=>{const val=(el&&el.dataset&&el.dataset.v)||v;if(G.pick!=null||!val)return;G.pick=val;const ok=val===w;if(ok)G.score++;else G.miss[R.g.id]=(G.miss[R.g.id]||0)+1;
      const o=spStats(S.uid)[R.g.id]||{};earn({sp:{[R.g.id]:{t:(+o.t||0)+1,m:(+o.m||0)+(ok?0:1),at:Date.now()}}}).catch(()=>{});
      spDraw();if(!ok)setTimeout(()=>spSpeak(w,true),400);},
    said:()=>{G.said=true;spDraw();},
    say:async()=>{if(G.recording){if(rec)stopRec();return}G.heard=null;G.stars=0;G.clip=null;
      const listen=()=>{if(!sr)return;try{const r=new SR();r.lang="en-IN";r.maxAlternatives=5;let got=false;
        r.onresult=e=>{got=true;const alts=[...e.results[0]].map(a=>a.transcript);const sc=sayScore(w,alts);G.heard=sc.heard;G.stars=sc.stars;wkLog(w,sc.stars>=2);if(!rec)G.recording=false;if(!G.recording)spDraw();};
        r.onerror=()=>{if(!rec){G.recording=false;G.heard=G.heard??"";spDraw();}};r.onend=()=>{if(!rec&&G.recording){G.recording=false;if(!got)G.heard="";spDraw();}};
        r.start();setTimeout(()=>{try{r.stop()}catch{}},5000);}catch(e){}};
      if(rec){const ok=await startRec(5,url=>{G.recording=false;G.clip=url;if(G.heard==null&&sr)G.heard="";spDraw();});if(!ok)return;G.recording=true;spDraw();listen();}
      else{G.recording=true;spDraw();listen();}},
    next:()=>{if(G.recording&&canRecord())try{stopRec()}catch(e){}if(timeUp()){SPG=null;closeModal();render();return}
      G.i++;Object.assign(G,{pick:null,heard:null,stars:0,recording:false,said:false,clip:null,reveal:false});spDraw(true);}}});
  if(auto&&G.pick==null&&canSpeak())setTimeout(()=>{if(SPG===G&&G.pick==null)spSpeak(w);},500);}
function spEnd(){const G=SPG;if(!G)return;SPG=null;const ts=Date.now();
  if(G.score>=4)earn({pts:{["p"+ts.toString(36)]:1}}).catch(()=>{});
  const hard=Object.keys(G.miss).sort((a,b)=>G.miss[b]-G.miss[a]).map(id=>SP.find(g=>g.id===id)).filter(Boolean)[0];
  openModal("Sound pairs",`<div class="drill">${art(G.score>=4?"bloom":"pip",110,G.score>=4?"Bloom":"Pip")}<p class="lede" style="margin:0">You got <b>${G.score} of ${G.rs.length}</b>! ${G.score>=5?"Super listening ears! 👂":G.score>=3?"Great listening!":"Good try! Listening gets easier every time."}</p>
    ${G.score>=4?`<p class="bigstars">⭐</p><p class="small muted" style="margin:0">You earned a star.</p>`:""}
    ${hard?`<div class="sptip"><b>Tricky one: ${esc(hard.label)}</b><span>${esc(hard.tip)}</span></div>`:""}</div>`,
   {footerExtra:`<button type="button" class="btn btn-leaf" data-mact="again">Play again</button>`,actions:{again:()=>{closeModal();setTimeout(A.soundPairs,200);}}});}
function spBars(L){const st=spStats(L.uid);return `<div class="spbars">${spGroups(L).map(g=>{const o=st[g.id];const pct=o&&o.t?Math.round(100*(1-spMiss(o))):null;
  return `<div class="spbar"><b>${esc(g.label)}</b><div class="sptrack" aria-hidden="true"><i style="width:${pct==null?0:pct}%"></i></div><span class="small muted">${pct==null?"Not tried yet":`${pct}% heard right · ${o.t} tr${o.t===1?"y":"ies"}`}</span></div>`;}).join("")}</div>`;}
/* parent: tricky sounds card on Progress */
function spParentHTML(L){if(!L||!L.uid)return "";const st=spStats(L.uid);if(!Object.keys(st).length)return "";const tk=spTricky(L,3).slice(0,2);const f=firstOf(L.name);
  return `<section class="card panel"><h2>Sound pairs</h2><p class="small muted">The listening game for sounds that are easy to mix up. ${esc(f)} plays it from the home screen.</p>${spBars(L)}
    ${tk.length?`<div class="sptips">${tk.map(x=>`<div class="sptip"><b>Practise together: ${esc(x.g.label)}</b><span>${esc(x.g.tip)} Try: ${x.g.pairs.map(p=>`${esc(p[0])} / ${esc(p[2])}`).join(", ")}.</span></div>`).join("")}</div>`:`<p class="small">No tricky pairs right now. Lovely listening!</p>`}</section>`;}
function soundsView(){const r=role();
  if(r==="student"||r==="parent"){const L=r==="parent"?curKid():myLearner();if(!L)return pendingHTML();
    if(r==="parent")return `<div class="head"><div><h1>Sound pairs</h1><p class="lede">How ${esc(firstOf(L.name))} is getting on with sounds that are easy to mix up.</p></div></div>${kidBar()}${spParentHTML(L)||`<section class="card panel"><p class="muted">${esc(firstOf(L.name))} hasn't played Sound pairs yet.</p></section>`}`;
    const tk=spTricky(L,2)[0];
    return `<div class="head"><div><h1>Sound pairs</h1><p class="lede">Pip says a word. Tap the picture you hear, then say it yourself!</p></div></div>
      <section class="adapt">${art("pip",72,"Pip")}<div class="grow"><b>Ready, listening ears?</b><span>6 quick rounds. ${tk?`Pip will help you with ${esc(tk.g.label)}.`:""}</span><div class="row adbtns"><button class="btn btn-primary" data-act="soundPairs">${ic("play")}Play Sound pairs</button></div></div></section>
      <section class="card panel"><h2>My listening</h2>${spBars(L)}</section>`;}
  /* staff: class-wide tricky pairs */
  const all=(role()==="admin"?activeLearners():pipTry(()=>teacherLearners(myTid()))||[]).filter(L=>L.uid);
  const bs=(pipTry(()=>entries(D.batches))||[]).filter(b=>role()==="admin"||b.tid===myTid());const bsel=S.spBatch&&bs.find(b=>b.id===S.spBatch);
  const ls=bsel?all.filter(L=>(bsel.learners||[]).includes(L.id)):all;
  const rows=SP.map(g=>{let t=0,m=0,kids=0;const hard=[];for(const L of ls){const o=spStats(L.uid)[g.id];if(!o||!o.t)continue;kids++;t+=o.t;m+=+o.m||0;if(o.t>=3&&spMiss(o)>=.4)hard.push({L,r:spMiss(o)});}
    return {g,t,m,kids,rate:t?m/t:0,hard:hard.sort((a,b)=>b.r-a.r)};}).sort((a,b)=>b.rate-a.rate);
  const any=rows.some(x=>x.t);
  return `<div class="head"><div><h1>Sound pairs</h1><p class="lede">Which sound pairs your learners find tricky in the listening game. Use this to pick what to practise in class.</p></div></div>
    ${bs.length?`<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:12px"><label for="spb" class="small" style="font-weight:700">Batch</label><select id="spb" style="min-height:44px;width:auto;max-width:min(360px,100%)"><option value="">${role()==="admin"?"All learners":"All my learners"}</option>${bs.map(b=>`<option value="${esc(b.id)}" ${S.spBatch===b.id?"selected":""}>${esc(b.name||b.id)}</option>`).join("")}</select></div>`:""}
    <section class="card panel"><h2>Class view</h2>${any?`<div class="list">${rows.map(x=>`<div class="item spclass"><div class="grow"><div class="t">${esc(x.g.label)}</div>
      <div class="sptrack bad" aria-hidden="true"><i style="width:${Math.round(x.rate*100)}%"></i></div>
      <div class="s">${x.t?`${Math.round(x.rate*100)}% missed · ${x.t} tries · ${x.kids} learner${x.kids===1?"":"s"}`:"Not played yet"}${x.hard.length?` · Finding it tricky: ${x.hard.slice(0,4).map(h=>esc(firstOf(h.L.name))).join(", ")}${x.hard.length>4?` +${x.hard.length-4}`:""}`:""}</div></div></div>`).join("")}</div>`
      :`<p class="muted">No one has played Sound pairs yet. Learners find it on their home screen.</p>`}</section>
    <section class="card panel"><h2>The pairs</h2><div class="list">${SP.map(g=>`<div class="item"><div class="grow"><div class="t">${esc(g.label)}${g.seeds?` <span class="pill p-sun">Seeds too</span>`:""}</div><div class="s">${g.pairs.map(p=>`${p[1]} ${esc(p[0])} / ${p[3]} ${esc(p[2])}`).join(" · ")}</div><div class="s">${esc(g.tip)}</div></div></div>`).join("")}</div></section>`;}
