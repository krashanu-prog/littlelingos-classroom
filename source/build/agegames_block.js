/* ================= Games for each age group =================
   Seeds (3.5–6): pictures and sounds, everything read aloud. Sprouts (7–10): reading and building.
   Blooms (11–15): thinking, typing and speed. All use the same game engine (S.game). */
const agStage=()=>{const L=myLearner();return (L&&L.stage)||"Seeds";};
const pickN=(arr,n,r)=>shuffle(arr.slice(),r).slice(0,n);
const AG_TITLE={pic:"Picture hunt",sound:"Animal friends",colour:"Colour pop",count:"Count with Pip",build:"Sentence builder",miss:"Missing letter",
  odd:"Odd one out",cloze:"Fill the gap",fix:"Fix the sentence",bee:"Spelling bee",speed:"Speed round",daily:"Daily challenge",quiz:"Word quiz",listen:"Listen and pick",revise:"Practise again"};
/* ---------- Seeds ---------- */
function qPic(r){const ws=Object.keys(AG.pic),w=ws[Math.floor(r()*ws.length)],o=pickN(ws.filter(x=>x!==w),2,r);
  const opts=shuffle([w,...o],r).map(x=>AG.pic[x]);return {k:"pic",say:`Find the ${w}`,wk:w,auto:1,big:1,prompt:`Find the ${w}!`,opts,ans:AG.pic[w]};}
function qSound(r){const pick=r();const em=w=>AG.pic[w];
  if(pick<0.22){const [a,snd]=AG.sounds[Math.floor(r()*AG.sounds.length)],o=pickN(AG.sounds.filter(x=>x[0]!==a),2,r).map(x=>x[0]);
    return {k:"sound",say:`Who says ${snd}?`,wk:a,auto:1,big:1,prompt:`Who says “${snd}”?`,opts:shuffle([a,...o],r).map(em),ans:em(a)};}
  if(pick<0.4){const [a,snd]=AG.sounds[Math.floor(r()*AG.sounds.length)],o=pickN(AG.sounds.filter(x=>x[0]!==a),2,r).map(x=>x[1]);
    return {k:"sound",say:`What does the ${a} say?`,wk:a,auto:1,prompt:`What does the ${a} say? ${em(a)}`,opts:shuffle([snd,...o],r),ans:snd};}
  if(pick<0.68){const [q,a]=AG.facts[Math.floor(r()*AG.facts.length)],o=pickN(AG.facts.map(x=>x[1]).filter(x=>x!==a),2,r);
    return {k:"sound",say:q,wk:a,auto:1,big:1,prompt:q,opts:shuffle([a,...o],r).map(em),ans:em(a)};}
  if(pick<0.84){const hs=Object.keys(AG.homes),h=hs[Math.floor(r()*hs.length)],a=AG.homes[h][Math.floor(r()*AG.homes[h].length)];
    const others=hs.filter(x=>x!==h).flatMap(x=>AG.homes[x]).filter(x=>!AG.homes[h].includes(x)&&!(h==="sky"&&["duck","hen"].includes(x)));
    return {k:"sound",say:AG.homeQ[h],wk:a,auto:1,big:1,prompt:AG.homeQ[h],opts:shuffle([a,...pickN(others,2,r)],r).map(em),ans:em(a)};}
  const ks=Object.keys(AG.legs),a=ks[Math.floor(r()*ks.length)],n=AG.legs[a],word=n?AG.nums[n-1]:"none",pool=["none","two","four","six","eight"].filter(x=>x!==word);
  return {k:"sound",say:`How many legs does a ${a} have?`,wk:a,auto:1,prompt:`How many legs does a ${a} have? ${em(a)}`,opts:shuffle([word,...pickN(pool,2,r)],r),ans:word};}
function qColour(r){const pick=r(),cw=AG.colours.map(x=>x[0]);
  if(pick<0.25){const [c,hex]=AG.colours[Math.floor(r()*AG.colours.length)],o=pickN(cw.filter(x=>x!==c),2,r);
    return {k:"colour",say:"What colour is this?",wk:c,auto:1,prompt:"What colour is this?",vis:`<div class="agswatch" style="background:${hex}" role="img" aria-label="A colour"></div>`,opts:shuffle([c,...o],r),ans:c};}
  const objs=Object.entries(AG.objc);
  if(pick<0.6){const [e,c]=objs[Math.floor(r()*objs.length)],o=pickN(cw.filter(x=>x!==c),2,r);
    return {k:"colour",say:"What colour is this?",wk:c,auto:1,prompt:"What colour is this?",vis:`<div class="agcount" role="img" aria-label="A picture">${e}</div>`,opts:shuffle([c,...o],r),ans:c};}
  if(pick<0.93){const [e,c]=objs[Math.floor(r()*objs.length)],o=pickN(objs.filter(x=>x[1]!==c).map(x=>x[0]),2,r);
    return {k:"colour",say:`Which one is ${c}?`,wk:c,auto:1,big:1,prompt:`Which one is ${c}?`,opts:shuffle([e,...o],r),ans:e};}
  const [a,b,c]=AG.mix[Math.floor(r()*AG.mix.length)],o=pickN(cw.filter(x=>x!==c&&x!==a&&x!==b),2,r);
  return {k:"colour",say:`Mix ${a} and ${b}. What colour do you get?`,wk:c,auto:1,prompt:`Mix ${a} and ${b}. What colour do you get?`,opts:shuffle([c,...o],r),ans:c};}
function qCount(r){const n=1+Math.floor(r()*10),t=AG.things[Math.floor(r()*AG.things.length)];
  const near=shuffle([n-2,n-1,n+1,n+2].filter(x=>x>=1&&x<=10),r).slice(0,2);
  return {k:"count",say:"How many can you count?",wk:AG.nums[n-1],auto:1,prompt:"How many can you count?",vis:`<div class="agcount" role="img" aria-label="Some pictures to count">${t.repeat(n)}</div>`,opts:shuffle([n,...near],r).map(x=>AG.nums[x-1]),ans:AG.nums[n-1]};}
/* ---------- Sprouts ---------- */
const agSentences=()=>[...AG.sent,...(typeof PACKS!=="undefined"?PACKS.flatMap(p=>p.w.filter(x=>x[3]===2).map(x=>x[2])):[])].filter(s=>s.split(" ").length>=3&&s.split(" ").length<=9);
function qBuild(r){const all=agSentences(),s=all[Math.floor(r()*all.length)],words=s.split(" ");let tiles=shuffle(words.map((w,i)=>({w,i})),r);
  if(tiles.every((t,i)=>t.i===i))tiles=tiles.reverse();
  return {k:"build",say:s,wk:"",prompt:"Tap the words in the right order.",tiles,ans:s,opts:[s,"__"],chosen:[],nospeak:1};}
function qMiss(pool,r){const ws=pool.filter(x=>/^[a-z]{3,12}$/i.test(x.w));if(!ws.length)return null;const x=ws[Math.floor(r()*ws.length)],w=x.w.toLowerCase();
  const i=1+Math.floor(r()*(w.length-2)),c=w[i],L="aeiourstlnmbcdgp".split("").filter(y=>y!==c),o=pickN(L,2,r);
  return {k:"miss",say:w,wk:w,prompt:`Which letter is missing? (${meanFor(x.w,x.m)})`,vis:`<p class="agword">${esc(w.slice(0,i))}<span class="agblank">_</span>${esc(w.slice(i+1))}</p>`,opts:shuffle([c,...o],r),ans:c,big:1,nospeak:1};}
function qOdd(r){const cats=Object.keys(AG.odd),a=cats[Math.floor(r()*cats.length)];let b=a;while(b===a)b=cats[Math.floor(r()*cats.length)];
  const three=pickN(AG.odd[a],3,r),odd=AG.odd[b][Math.floor(r()*AG.odd[b].length)];
  return {k:"odd",say:odd,wk:odd,prompt:"Which word does not belong?",opts:shuffle([...three,odd],r),ans:odd,why:`The others are all ${AG.oddLabel[a]}.`,nospeak:1};}
/* ---------- Blooms ---------- */
const agWholeWord=(w,s)=>new RegExp("(^|[^a-z])"+String(w).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"([^a-z]|$)","i").test(s);
const agCloze=()=>[...AG.cloze,...(typeof PACKS!=="undefined"?PACKS.flatMap(p=>p.w.filter(x=>x[3]===3).map(x=>[x[1],x[2]])):[])].filter(([w,s])=>agWholeWord(w,s));
function qCloze(r){const all=agCloze(),[w,s]=all[Math.floor(r()*all.length)],re=new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i");
  const o=pickN([...new Set(all.map(x=>x[0]).filter(y=>y.toLowerCase()!==w.toLowerCase()))],3,r);
  return {k:"cloze",say:w,wk:w,prompt:"Choose the word that fits the gap.",vis:`<p class="agsent">${esc(s.replace(re,"_____"))}</p>`,opts:shuffle([w,...o],r),ans:w,nospeak:1,full:s};}
function qFix(r){const [ok,bad]=AG.fix[Math.floor(r()*AG.fix.length)];return {k:"fix",say:ok,wk:"",prompt:"Which sentence is correct?",opts:shuffle([ok,...bad],r),ans:ok,nospeak:1,long:1};}
function qBee(pool,r){const ws=pool.filter(x=>/^[a-z]{4,15}$/i.test(x.w));if(!ws.length)return null;const x=ws[Math.floor(r()*ws.length)];
  return {k:"bee",say:x.w,wk:x.w,auto:1,prompt:`Spell the word that means “${pMean(x)}”.`,ans:x.w.toLowerCase(),opts:[x.w.toLowerCase(),"__"],typed:""};}
/* ---------- which games each age group gets ---------- */
const AG_GAMES={
  Seeds:[["daily","🎯","Daily challenge","5 picture questions"],["pic","🔍","Picture hunt","Hear a word, find the picture"],["sound","🐮","Animal friends","Sounds, homes and fun facts"],["colour","🎨","Colour pop","Name the colour"],["count","🔢","Count with Pip","How many can you see?"],["memory","🃏","Picture memory","Match pictures and words"],["drill","🎤","Repeat after me","Listen, say it, hear yourself"]],
  Sprouts:[["daily","🎯","Daily challenge","5 mixed questions"],["build","🧱","Sentence builder","Put the words in order"],["miss","🔡","Missing letter","Find the letter that's gone"],["odd","🕵️","Odd one out","Which word doesn't belong?"],["quiz","❓","Word quiz","Meanings, both ways"],["listen","👂","Listen and pick","Hear a word, find it"],["memory","🃏","Memory pairs","Match words and meanings"],["drill","🎤","Repeat after me","Listen, say it, hear yourself"]],
  Blooms:[["daily","🎯","Daily challenge","5 tough questions"],["speed","⚡","Speed round","60 seconds. How many can you get?"],["bee","🐝","Spelling bee","Hear it, type it"],["cloze","🧩","Fill the gap","Pick the word that fits"],["fix","🛠️","Fix the sentence","Spot the correct grammar"],["quiz","❓","Word quiz","Meanings, synonyms, spelling"],["memory","🃏","Memory pairs","8 pairs: words and meanings"],["drill","🎤","Repeat after me","Listen, say it, hear yourself"]]};
const AG_N={pic:6,sound:6,colour:6,count:6,build:5,miss:8,odd:8,cloze:8,fix:8,bee:8};
function agBuild(type,pool,r,n){const out=[],seen=new Set();let tries=0;const mk={pic:qPic,sound:qSound,colour:qColour,count:qCount,build:qBuild,odd:qOdd,cloze:qCloze,fix:qFix,miss:r=>qMiss(pool,r),bee:r=>qBee(pool,r)};
  const kinds=type==="speed"?["cloze","fix","rev","spell"]:[type];
  while(out.length<n&&tries++<n*12){const k=kinds[out.length%kinds.length];let q;
    if(k==="rev"||k==="spell"){q=buildQs(pool,1,r,[k])[0];}else q=mk[k](r);
    if(!q)continue;const key=q.k+"|"+(q.wk||q.ans);if(seen.has(key))continue;seen.add(key);out.push(q);}
  return out;}
function agDaily(L,pool,r){const k={Seeds:["pic","count","colour","sound","pic"],Sprouts:["miss","odd","rev","mean","miss"],Blooms:["cloze","fix","spell","rev","cloze"]}[L.stage||"Seeds"]||["mean","listen","rev","mean","listen"];
  return k.map(t=>t==="mean"||t==="rev"||t==="spell"||t==="listen"?buildQs(pool,1,r,[t])[0]:agBuild(t,pool,r,1)[0]).filter(Boolean);}
const speedBestKey=()=>"ll-speedbest-"+(S.uid||"");
const speedBest=()=>{try{return +localStorage.getItem(speedBestKey())||0}catch{return 0}};
function agStart(type){const L=myLearner();if(!L)return false;const pool=gamePool(L);
  if(type==="daily"&&(progOf(S.uid).daily||{})[ymd(new Date())]!=null){toast("You've done today's challenge! 🎉");return true;}
  if(typeof AD_TYPES!=="undefined"&&AD_TYPES.has(type)){const ad=adStartGame(type,pool,type==="daily"?rng(ymd(new Date())+S.uid):Math.random);
    if(ad){S.game={type,qs:[],i:0,score:0,pick:null,ad};if(type==="speed"){S.game.end=Date.now()+60000;}S.game.qs.push(adNext(S.game));if(type==="speed")agTick();
      if(S.view!=="play")go("play");else render(true);agAuto();return true;}}
  if(type==="daily"){S.game={type,qs:agDaily(L,pool,rng(ymd(new Date())+S.uid)),i:0,score:0,pick:null};}
  else if(type==="memory"&&(L.stage||"Seeds")==="Seeds"){const ws=pickN(Object.keys(AG.pic),4,Math.random);
    S.game={type,cards:shuffle(ws.flatMap((w,i)=>[{t:AG.pic[w],k:i},{t:w,k:i,w:1}])),open:[],done:new Set(),moves:0};}
  else if(type==="speed"){S.game={type,qs:agBuild("speed",pool,Math.random,60),i:0,score:0,pick:null,end:Date.now()+60000};agTick();}
  else if(AG_N[type]){S.game={type,qs:agBuild(type,pool,Math.random,AG_N[type]),i:0,score:0,pick:null};}
  else return false;
  if(S.view!=="play")go("play");else render(true);agAuto();return true;}
function agAuto(){const g=S.game,q=g&&g.qs&&g.qs[g.i];if(q&&(q.auto||q.k==="listen"))setTimeout(()=>say(q.say,q.lang),350);}
/* speed round clock */
let agT=null;
function agTick(){clearInterval(agT);agT=setInterval(()=>{const g=S.game;if(!g||g.type!=="speed"||g.over){clearInterval(agT);return;}
  if(Date.now()>=g.end){clearInterval(agT);g.qs=g.qs.slice(0,g.pick!=null?g.i+1:g.i);if(!g.qs.length){S.game=null;render(true);return;}g.i=g.qs.length-1;g.pick=g.pick??-1;A.nextQ();
    try{if(g.score>speedBest())localStorage.setItem(speedBestKey(),String(g.score));}catch{}return;}
  const el=document.getElementById("agclock");if(el)el.textContent=Math.ceil((g.end-Date.now())/1000)+"s";},250);}
/* sentence builder and spelling bee */
A.agTile=v=>{const g=S.game,q=g&&g.qs[g.i];if(!q||g.pick!=null)return;const i=+v;if(q.chosen.includes(i))q.chosen=q.chosen.filter(x=>x!==i);else q.chosen.push(i);render(true);};
A.agClear=()=>{const g=S.game,q=g&&g.qs[g.i];if(!q||g.pick!=null)return;q.chosen=[];render(true);};
A.agCheck=()=>{const g=S.game,q=g&&g.qs[g.i];if(!q||g.pick!=null)return;let got;
  if(q.k==="build")got=q.chosen.map(i=>q.tiles[i].w).join(" ");
  else{const f=document.getElementById("agtype");got=String(f&&f.value||"").trim().toLowerCase();q.typed=got;}
  A.answer(got===q.ans?0:1);};
function agQuestionHTML(g,q){
  if(q.k==="build"){const done=g.pick!=null,ok=done&&g.pick===0;
    return `<section class="quiz"><h2>${esc(q.prompt)}</h2><div class="agline" aria-live="polite">${q.chosen.length?q.chosen.map(i=>`<button class="agtile on" data-act="agTile" data-id="${i}" ${done?"disabled":""}>${esc(q.tiles[i].w)}</button>`).join(""):`<span class="muted small">Tap the words below…</span>`}</div>
      <div class="agbank">${q.tiles.map((t,i)=>q.chosen.includes(i)?"":`<button class="agtile" data-act="agTile" data-id="${i}" ${done?"disabled":""}>${esc(t.w)}</button>`).join("")}</div>
      ${done?`<div class="qfb ${ok?"ok":""}">${ok?"🎉 Perfect sentence!":`The sentence is: “${esc(q.ans)}”`}${adFbHTML(g)}<button class="btn btn-primary" data-act="nextQ">${agMore(g)?"Next":"Finish"} ${ic("fwd")}</button></div>`
      :`<div class="row"><button class="btn btn-ghost" data-act="agClear">Start again</button><button class="btn btn-primary" data-act="agCheck" ${q.chosen.length===q.tiles.length?"":"disabled"}>Check</button></div>`}</section>`;}
  if(q.k==="bee"){const done=g.pick!=null,ok=done&&g.pick===0;
    return `<section class="quiz"><h2>${esc(q.prompt)}</h2>${canSpeak()?`<button class="btn btn-sun btn-big" data-act="sayQ" style="align-self:center">${ic("sound",24)}Hear the word</button>`:""}
      <div class="field"><label for="agtype">Type the spelling</label><input id="agtype" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="30" value="${esc(q.typed||"")}" ${done?"disabled":""} data-enter="agCheck"></div>
      ${done?`<div class="qfb ${ok?"ok":""}">${ok?"🎉 Spot on!":`It's spelled “${esc(q.ans)}”.`}${adFbHTML(g)}${mt(q.wk)?` <span class="mtline">“${esc(q.wk)}” = ${mtHTML(q.wk)}</span>`:""}<button class="btn btn-primary" data-act="nextQ">${agMore(g)?"Next":"Finish"} ${ic("fwd")}</button></div>`
      :`<button class="btn btn-primary" data-act="agCheck">Check</button>`}</section>`;}
  return "";}
/* the Games page grid for this child's age group */
function stageGamesHTML(L,n,dDone){const st=L.stage||"Seeds",list=AG_GAMES[st]||AG_GAMES.Sprouts,best=speedBest();
  const needWords=t=>["quiz","listen","miss","bee","memory"].includes(t)&&!(st==="Seeds"&&t==="memory");
  return `<div class="gamegrid">${list.map(([t,e,ttl,sub],i)=>{
    if(t==="drill")return `<button class="gamecard g4" data-act="drill" ${n<1?"disabled":""}><span>${e}</span><b>${esc(ttl)}</b><i>${esc(sub)}</i></button>`;
    const dis=(needWords(t)&&n<4)||(t==="listen"&&!canSpeak());
    const s2=t==="daily"&&dDone?"Done today!":t==="speed"&&best?`Your best: ${best}`:sub;
    return `<button class="gamecard g${i%4}" data-act="startGame" data-id="${t}" ${dis?"disabled":""}><span>${t==="daily"&&dDone?"✅":e}</span><b>${esc(ttl)}</b><i>${esc(s2)}</i></button>`;}).join("")}
    <button class="gamecard g1" data-act="goQuiz" data-id="en"><span>🔤</span><b>Word power</b><i>English quiz, always open</i></button>
    <button class="gamecard g2" data-act="goQuiz" data-id="gk"><span>🌍</span><b>GK quiz</b><i>Questions about our world</i></button></div>`;}
/* admin learner preview: choose the age group */
function setPvStage(st,quiet){if(!STAGES.some(s=>s.v===st))return;S.previewStage=st;S.game=null;try{sessionStorage.setItem("ll-pvstage",st)}catch{}if(!quiet)render(true);}
try{const v=sessionStorage.getItem("ll-pvstage");if(v)S.previewStage=v;}catch{}
A.pvStage=st=>{setPvStage(st);};
const viewAsOpts=cur=>{const st=S.previewStage||"Seeds";return [["admin","Admin"],["teacher","Trainer"],...STAGES.map(s=>["student:"+s.v,`Learner · ${s.v} (${s.ages.replace("Ages ","")})`]),["parent","Parent"]]
  .map(([v,l])=>opt(v,l,v===(cur==="student"?"student:"+st:cur))).join("");};
function pvStageChips(){const st=S.previewStage||"Seeds";return `<div class="pvages" role="group" aria-label="Preview age group"><span class="small"><b>Age group:</b></span>${STAGES.map(s=>`<button class="pvchip ${s.v===st?"on":""}" data-act="pvStage" data-id="${s.v}" aria-pressed="${s.v===st}">${esc(s.v)}</button>`).join("")}</div>`;}
/* hook the new games into the existing engine */
{const f=A.startGame;A.startGame=t=>{if(agStart(t))return;f(t);};}
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target&&e.target.id==="agtype"){e.preventDefault();A.agCheck();}});
/* class form: choose the course from the age group of the children picked */
function sessAutoCourse(form){const sel=form&&form.querySelector("#s-course");if(!sel)return;
  const ids=[...form.querySelectorAll('input[name="sl"]:checked')].map(x=>x.value).filter(id=>D.learners[id]);
  let h=form.querySelector("#s-cauto");if(!h){h=document.createElement("span");h.id="s-cauto";h.className="hint";h.setAttribute("aria-live","polite");sel.insertAdjacentElement("afterend",h);}
  const sts=[...new Set(ids.map(id=>D.learners[id].stage).filter(Boolean))];
  if(!ids.length||!sts.length){h.textContent="";return;}
  if(sts.length>1){h.textContent=`These children are in different age groups (${sts.join(", ")}). Pick the course yourself, or schedule a class for each group.`;return;}
  const st=sts[0],cs=courseList().filter(c=>c.level===st);
  if(!cs.length){h.textContent=`No course is set up for ${st} yet.`;return;}
  if(D.courses[sel.value]&&D.courses[sel.value].level===st){h.textContent=`✓ Matches the children's age group (${st}).`;return;}
  const tr=form.querySelector("#s-trainer"),tid=tr&&tr.value,pick=cs.find(c=>tid&&c.teacherId===tid)||cs[0];
  sel.value=pick.id;sel.dispatchEvent(new Event("change",{bubbles:true}));h.textContent=`Course set to “${pick.title}” because these children are ${st}.`;}
document.addEventListener("change",e=>{const t=e.target;if(t&&t.name==="sl"&&t.form)sessAutoCourse(t.form);});
document.addEventListener("click",e=>{const b=e.target&&e.target.closest&&e.target.closest("[data-kp]");const f=b&&b.closest("form");if(f&&f.querySelector("#s-course"))setTimeout(()=>sessAutoCourse(f),0);});
