/* ================= Phase 2: Adaptive lesson path (practise again / jump ahead) ================= */
const wkKey=w=>String(w||"").toLowerCase().normalize("NFKC").replace(/[^\p{L}\p{N} '\-]/gu,"").trim().slice(0,40);
let wkPend={},wkT=null;
/* word results from games and "Say it", kept in the learner's own progress doc */
function wkLog(w,ok){try{if(realRole()!=="student"||!S.uid)return;const k=wkKey(w);if(!k)return;
  const p=D.progress[S.uid]=D.progress[S.uid]||{};const wk=p.wk=p.wk||{};const o=wk[k]||{};
  const n={r:(+o.r||0)+(ok?1:0),m:(+o.m||0)+(ok?0:1),l:ok?1:0,t:Date.now()};
  if(ok&&o.l===1&&n.m>0)n.m--; /* two right in a row: the word is growing back */
  wk[k]=n;wkPend[k]=n;clearTimeout(wkT);wkT=setTimeout(wkFlush,1200);}catch(e){}}
function wkFlush(){const p=wkPend;wkPend={};if(!Object.keys(p).length||!S.db||!S.uid)return;upsert("progress/"+S.uid,{wk:p}).catch(()=>{});}
addEventListener("pagehide",wkFlush);
const lessonById=id=>id&&D.lessons[id]?{...D.lessons[id],id}:null;
const tsOf=k=>{const n=parseInt(String(k).slice(1),36);return n>1.5e12&&n<4e12?n:0;};
function adaptVocab(L){const m={};for(const cid of learnerCourses(L)){const c=D.courses[cid];for(const l of lessonsOf(cid))for(const [w,mean] of parseVocab(l.vocab)){const k=wkKey(w);if(k&&!m[k])m[k]={w,m:mean,lang:langOf(c),lid:l.id};}}return m;}
function adaptOverride(L){let best=null;for(const x of txAll("adapt"))if(x.lid===L.id&&(!best||(x.at||0)>(best.at||0)))best=x;return best&&best.mode&&best.mode!=="auto"?best:null;}
function adaptAuto(L){
  const uid=L.uid, first=firstOf(L.name), out={mode:"new",words:[],lesson:null,ahead:null,why:"",stat:{}};
  if(!uid)return out;
  const p=progOf(uid), wk=p.wk||{}, voc=adaptVocab(L), now=Date.now(), D14=14*864e5, D45=45*864e5;
  /* 1. words that were tricky in games or "Say it" */
  const weak=Object.entries(wk).filter(([k,o])=>o&&(+o.m||0)>=1&&(o.l===0||(+o.m||0)>(+o.r||0))&&now-(o.t||0)<60*864e5)
    .sort((a,b)=>(b[1].m-a[1].m)||((b[1].t||0)-(a[1].t||0))).map(([k])=>voc[k]||{w:k,m:"",lang:"en-IN",lid:null});
  /* 2. accuracy over the last two weeks */
  let r=0,m=0;for(const o of Object.values(wk))if(o&&now-(o.t||0)<D14){r+=+o.r||0;m+=+o.m||0;}
  const games=Object.entries(p.pts||{}).filter(([k])=>k[0]==="g"||k[0]==="m").map(([k,v])=>({t:tsOf(k),s:+v||0})).filter(g=>g.t&&now-g.t<D14).sort((a,b)=>b.t-a.t).slice(0,5);
  const daily=Object.entries(p.daily||{}).filter(([d])=>now-new Date(d+"T12:00").getTime()<D14).map(([,v])=>(+v||0)/5*3);
  const gs=[...games.map(g=>g.s),...daily];const gAvg=gs.length?gs.reduce((a,b)=>a+b,0)/gs.length:null;
  /* 3. homework stars and the teacher's speaking scores */
  const hwLow=[],hwHigh=[];for(const h of pipTry(()=>hwFor(L))||[]){const f=replyOf(L,h);if(f&&f.stars&&now-(f.at||0)<D45){if(+f.stars<=1)hwLow.push(h);else if(+f.stars>=3)hwHigh.push(h);}}
  const spLow=txAll("pc").filter(c=>c.lid===L.id&&c.score&&+c.score<=2&&now-(c.at||0)<D45).length;
  out.stat={r,m,n:r+m,acc:r+m?r/(r+m):null,gAvg,games:gs.length,hwLow:hwLow.length,hwHigh:hwHigh.length,spLow};
  /* which finished lesson needs the most sunshine */
  const done=doneList(uid);const byL={};for(const x of weak)if(x.lid&&isDone(uid,x.lid))byL[x.lid]=(byL[x.lid]||0)+1;
  const weakLid=Object.keys(byL).sort((a,b)=>byL[b]-byL[a])[0]||null;
  const cids=learnerCourses(L), nx=nextLesson(uid,cids);
  if(nx){const ls=lessonsOf(nx.courseId);const i=ls.findIndex(l=>l.id===nx.id);out.next=nx;out.ahead=ls.slice(i+1).find(l=>!isDone(uid,l.id))||null;}
  if(weak.length>=2||(weak.length&&weakLid)||hwLow.length>=2||spLow>=2){
    out.mode="revise";out.words=weak.slice(0,6);
    out.lesson=weakLid?lessonById(weakLid):(hwLow.length>=2||spLow>=2)&&done[0]?lessonById(done[0].lid):null;
    const bits=[];if(weak.length)bits.push(`found ${weak.length===1?"one word":"a few words"} tricky in games and speaking practice (${weak.slice(0,4).map(x=>x.w).join(", ")})`);
    if(hwLow.length>=2)bits.push(`had ${hwLow.length} recent homework tasks that need another go`);if(spLow>=2)bits.push("is still working on saying some words clearly");
    out.why=`${first} ${bits.join(", and ")}. Pip suggests a short “practise again” activity so these words stick${out.lesson?`, starting with the lesson “${out.lesson.title}”`:""}.`;
    return out;}
  if(out.stat.n>=10&&out.stat.acc>=.9&&(gAvg==null||gAvg>=2.5)&&!hwLow.length&&out.ahead){
    out.mode="ahead";out.lesson=out.ahead;
    out.why=`${first} got ${r} of ${r+m} answers right in the last two weeks${gAvg!=null?` and is earning lots of stars in games`:""}. Pip suggests trying “${out.ahead.title}” a little early. ${first} can always come back to “${nx.title}”.`;return out;}
  if(out.stat.n||gs.length||done.length){out.mode="steady";out.why=`${first} is moving through lessons at a comfortable pace. Pip suggests extra practice or a jump ahead when it would help.`;}
  else out.why=`Suggestions appear after ${first} plays a few word games or practises speaking.`;
  return out;}
function adaptFor(L){const a=adaptAuto(L), o=adaptOverride(L);if(!o)return {...a,auto:a};
  const first=firstOf(L.name), who=byWho(o.uid);
  if(o.mode==="off")return {...a,mode:"off",auto:a,over:o,why:`${who} has paused suggestions for ${first} for now.`};
  if(o.mode==="revise"){const voc=adaptVocab(L);const ws=(o.words||[]).map(w=>voc[wkKey(w)]||{w,m:"",lang:"en-IN"});const l=lessonById(o.lessonId);
    return {...a,mode:"revise",auto:a,over:o,words:ws.length?ws:a.words,lesson:l||a.lesson,why:`${who} would like ${first} to practise ${l?`“${l.title}”`:"some words"} again${ws.length?` (${ws.slice(0,4).map(x=>x.w).join(", ")})`:""}.`};}
  if(o.mode==="ahead"){const l=lessonById(o.lessonId)||a.ahead;return {...a,mode:l?"ahead":"steady",auto:a,over:o,lesson:l,why:l?`${who} thinks ${first} is ready to jump ahead to “${l.title}”.`:a.why};}
  return {...a,auto:a};}
const ADM={revise:["Practise again","p-sun"],ahead:["Jump ahead","p-good"],steady:["On track","p-info"],new:["Not enough yet","p-mute"],off:["Paused","p-mute"]};
const adaptPill=L=>{const a=pipTry(()=>adaptFor(L));if(!a)return "";const d=ADM[a.mode]||ADM.new;return `<span class="pill ${d[1]}">${d[0]}${a.over?" ✎":""}</span>`;};

/* ---------- kid: cards on the garden page ---------- */
function adaptKidHTML(L){
  const a=pipTry(()=>adaptFor(L));if(!a)return "";
  if(S.adaptLater===ymd(new Date())+a.mode)return "";
  if(a.mode==="revise"&&(a.words.length||a.lesson)){const ws=a.words.slice(0,4);
    return `<section class="adapt rev">${art("drizzle",64,"Drizzle the cloud")}<div class="grow"><b>Let's practise again</b><span>${ws.length?`These words want a little more sunshine: <i>${ws.map(x=>esc(x.w)).join(", ")}</i>`:`Let's visit “${esc(a.lesson.title)}” again.`}</span>
      <div class="row adbtns">${ws.length?`<button class="btn btn-sun btn-sm" data-act="startGame" data-id="revise">🎲 Play</button>${canSpeak()||canRecord()?`<button class="btn btn-ghost btn-sm" data-act="reviseSay">🎤 Say them</button>`:""}`:""}${a.lesson?`<button class="btn btn-ghost btn-sm" data-go="lesson:${esc(a.lesson.id)}">${ic("leaf")}Open lesson</button>`:""}</div></div></section>`;}
  if(a.mode==="ahead"&&a.lesson)return `<section class="adapt ahd">${art("bloom",64,"Bloom the flower")}<div class="grow"><b>Ready to jump ahead?</b><span>You're blooming! Want to try “${esc(a.lesson.title)}”?</span>
      <div class="row adbtns"><button class="btn btn-leaf btn-sm" data-go="lesson:${esc(a.lesson.id)}">Let's go! ${ic("fwd")}</button><button class="btn btn-ghost btn-sm" data-act="adaptLater" data-id="${esc(a.mode)}">Not now</button></div></div></section>`;
  return "";}
A.adaptLater=m=>{S.adaptLater=ymd(new Date())+m;render();};
A.reviseSay=()=>{const L=myLearner();if(!L)return;const a=adaptFor(L);const ws=a.words.slice(0,6).map(x=>({w:x.w,m:x.m||"",lang:x.lang||"en-IN"}));
  if(!ws.length){toast("No words to practise right now.",true);return}S.drill={ws,i:0,clip:null,heard:null,keep:false,recording:false};drillModal();};
function reviseGame(L){const a=adaptFor(L), pool=gamePool(L), focus=a.words.filter(x=>x.m);
  if(!focus.length||pool.length<4)return null;const qs=[];const n=Math.min(6,Math.max(4,focus.length*2));
  for(let i=0;i<n;i++){const x=focus[i%focus.length];const others=shuffle(pool.filter(y=>wkKey(y.w)!==wkKey(x.w)&&y.m!==x.m)).slice(0,3);if(others.length<3)continue;
    if(i%2===0)qs.push({k:"mean",say:x.w,lang:x.lang,prompt:`What does “${x.w}” mean?`,opts:shuffle([x,...others]).map(o=>o.m),ans:x.m});
    else qs.push({k:"listen",say:x.w,lang:x.lang,prompt:"Listen! Which word did Pip say?",opts:shuffle([x,...others]).map(o=>o.w),ans:x.w});}
  return qs.length?qs:null;}

/* ---------- parents: the reason in simple words ---------- */
function adaptParentHTML(L){const a=pipTry(()=>adaptFor(L));if(!a||!L.uid)return "";const d=ADM[a.mode]||ADM.new;
  return `<section class="card panel adparent"><div class="ph"><h2>Learning path</h2><span class="pill ${d[1]}">${d[0]}</span></div><p>${esc(a.why)}</p>${a.over&&a.over.note?`<p class="small"><b>${esc(byWho(a.over.uid))}:</b> “${esc(a.over.note)}”</p>`:""}
    ${a.mode==="revise"&&a.words.length?`<div class="row" style="gap:6px">${a.words.slice(0,6).map(x=>`<span class="pill p-mute">${esc(x.w)}</span>`).join("")}</div><p class="small muted">You can help at home: say these words together a few times this week.</p>`:""}${dtWeek(L.uid)?`<p class="small muted">Daily challenges done this week: ${dtWeek(L.uid)}</p>`:""}</section>`;}

/* ---------- teachers: see and override ---------- */
function adaptStaffHTML(L){if(!L.uid)return "";const a=pipTry(()=>adaptFor(L));if(!a)return "";const d=ADM[a.mode]||ADM.new;const s=a.auto.stat||{};
  return `<p class="section-title">Lesson path</p><div class="adstaff"><div class="row" style="gap:6px"><span class="pill ${d[1]}">${d[0]}</span>${a.over?`<span class="small muted">Set by ${esc(byWho(a.over.uid))}</span>`:`<span class="small muted">Pip's suggestion</span>`}</div>
    <p class="small">${esc(a.why)}</p><p class="small muted">Last 2 weeks: ${s.n?`${s.r}/${s.n} word answers right`:"no word games yet"}${s.gAvg!=null?` · games ${s.gAvg.toFixed(1)}/3 stars`:""}${s.hwLow?` · ${s.hwLow} low homework`:""}${s.spLow?` · ${s.spLow} low speaking scores`:""} · daily challenges this week: ${dtWeek(L.uid)}</p>
    <button type="button" class="btn btn-ghost btn-sm" data-mact="adapt">${ic("edit")}Change suggestion</button></div>`;}
A.adaptEdit=lid=>{const L=learner(lid);if(!L)return;const a=adaptFor(L), cur=a.over?a.over.mode:"auto", uid=L.uid;
  const done=doneList(uid).map(x=>lessonById(x.lid)).filter(Boolean), todo=learnerCourses(L).flatMap(lessonsOf).filter(l=>!isDone(uid,l.id));
  const rvL=a.over&&a.over.mode==="revise"?a.over.lessonId:(a.auto.mode==="revise"&&a.auto.lesson?a.auto.lesson.id:"");
  const ahL=a.over&&a.over.mode==="ahead"?a.over.lessonId:(a.auto.ahead?a.auto.ahead.id:"");
  const words=(a.over&&a.over.mode==="revise"?a.over.words||[]:a.auto.words.map(x=>x.w)).join(", ");
  const R=(v,t,s)=>`<label class="adopt"><input type="radio" name="mode" value="${v}" ${cur===v?"checked":""}><span><b>${t}</b><small>${s}</small></span></label>`;
  openModal(`Lesson path · ${firstOf(L.name)}`,`<p class="small"><b>Pip suggests:</b> ${esc((ADM[a.auto.mode]||ADM.new)[0])}. ${esc(a.auto.why)}</p>
    <fieldset class="adfs"><legend class="sr">Suggestion</legend>${R("auto","Follow Pip's suggestion","Updates by itself from games, “Say it” and homework.")}${R("revise","Practise again","Show a revision card for a lesson and words you choose.")}${R("ahead","Jump ahead","Offer a later lesson early.")}${R("off","No suggestions for now","Hide the practise and jump-ahead cards.")}</fieldset>
    <div class="two"><div class="field"><label for="ad-rl">Lesson to practise</label><select id="ad-rl" name="rl">${opt("","Pick a finished lesson",!rvL)}${done.map(l=>opt(l.id,l.title,l.id===rvL)).join("")}</select></div>
    <div class="field"><label for="ad-al">Lesson to jump to</label><select id="ad-al" name="al">${opt("","Pick a lesson",!ahL)}${todo.map(l=>opt(l.id,l.title,l.id===ahL)).join("")}</select></div></div>
    <div class="field"><label for="ad-w">Words to practise (comma separated)</label><input type="text" id="ad-w" name="w" maxlength="300" value="${esc(words)}" placeholder="apple, ball, cat"></div>
    <div class="field"><label for="ad-n">Note for the family (optional)</label><input type="text" id="ad-n" name="n" maxlength="200" value="${esc(a.over&&a.over.note||"")}" placeholder="Let's practise animal words together this week."></div>`,
   {wide:true,submitLabel:"Save",done:"Saved. The learner and family see it now.",onSubmit:async f=>{const mode=f.mode.value||"auto";
     const ws=f.w.value.split(",").map(x=>x.trim()).filter(Boolean).slice(0,10);
     if(mode==="revise"&&!f.rl.value&&!ws.length)throw userErr("Pick a lesson or add some words to practise.");
     if(mode==="ahead"&&!f.al.value)throw userErr("Pick the lesson to jump to.");
     await S.db.doc(`tw/${S.uid}/x/adapt-${lid}`).set({kind:"adapt",lid,mode,lessonId:mode==="revise"?f.rl.value||null:mode==="ahead"?f.al.value:null,words:mode==="revise"?ws:[],note:f.n.value.trim(),at:Date.now()});}});};
