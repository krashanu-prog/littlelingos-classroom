/* ================= Word of the Day ================= */
/* words live in config/wod (admin writes, everyone signed in reads); a child's completions live in
   progress/{uid}.wod[YYYY-MM-DD]; only the optional sentence recording is stored as audio. */
const WOD_STAGES=["Seeds","Sprouts","Blooms"];
const WOD_STARTER={
  Seeds:[["🍎","apple","AP-ul","A round, crunchy fruit. It can be red or green.","I eat an apple."],["⚽","ball","BAWL","A round toy you can kick or throw.","Kick the ball to me!"],["🐱","cat","KAT","A small, furry pet that says meow.","The cat is sleeping."],["☀️","sun","SUN","The big, bright light in the sky in the day.","The sun is hot."],["🐟","fish","FISH","An animal that swims in water.","The fish can swim."],["🌙","moon","MOON","The light we see in the sky at night.","I can see the moon."],["⭐","star","STAR","A tiny light that twinkles in the night sky.","Look at the star!"],["🌳","tree","TREE","A tall plant with a trunk and leaves.","The bird is in the tree."],["🦆","duck","DUK","A bird that swims and says quack.","The duck says quack."],["🥚","egg","EG","Baby birds come out of it. We can eat it too.","I like boiled eggs."],["🚌","bus","BUS","A big vehicle that carries lots of people.","I go to school by bus."],["📖","book","BOOK","Pages with words and pictures to read.","Let's read a book."],["🎩","hat","HAT","Something you wear on your head.","My hat is red."],["🥛","milk","MILK","A white drink that helps you grow.","I drink milk."]],
  Sprouts:[["🔍","curious","KYOOR-ee-us","Wanting to know or learn about something.","Pip is curious about the clouds."],["🦁","brave","BRAYV","Ready to do something even when it feels scary.","She was brave and spoke first."],["🕊️","gentle","JEN-tul","Soft and careful, not rough.","Be gentle with the puppy."],["🐘","enormous","ih-NOR-mus","Very, very big.","The elephant was enormous."],["🤫","whisper","WIS-per","To speak very softly.","We whisper in the library."],["✨","sparkle","SPAR-kul","To shine with little flashes of light.","The lights sparkle at Diwali."],["🧭","journey","JUR-nee","A trip from one place to another.","Our train journey was long."],["😋","delicious","dih-LISH-us","Tasting very, very good.","Mum's dal is delicious."],["🧩","puzzle","PUZ-ul","A game or problem you have to work out.","We finished the puzzle together."],["🗺️","explore","ik-SPLOR","To look around a new place to learn about it.","Let's explore the park."],["😆","giggle","GIG-ul","To laugh in a light, silly way.","The baby giggled at the dog."],["🌾","harvest","HAR-vist","Picking crops when they are ready.","Farmers celebrate the harvest."],["⛺","shelter","SHEL-ter","A place that keeps you safe from rain or sun.","We found shelter under a tree."],["🏘️","neighbour","NAY-bur","Someone who lives near you.","Our neighbour has a garden."]],
  Blooms:[["🗣️","persuade","per-SWAYD","To get someone to agree with you by giving good reasons.","She persuaded the class to plant more trees."],["🌱","resilient","rih-ZIL-yent","Able to recover quickly after something difficult.","Resilient learners keep trying after a mistake."],["🔭","perspective","per-SPEK-tiv","A way of seeing or thinking about something.","Try to see it from her perspective."],["🤝","collaborate","kuh-LAB-uh-rayt","To work together with others to do something.","We collaborated on the science project."],["🚀","ambitious","am-BISH-us","Having a big goal and working hard for it.","His plan is ambitious but possible."],["🎤","articulate","ar-TIK-yuh-lit","Able to say clearly what you think.","She gave an articulate answer in the debate."],["💡","innovate","IN-uh-vayt","To come up with a new idea or way of doing something.","Startups innovate to solve problems."],["💞","empathy","EM-puh-thee","Understanding how someone else feels.","Empathy helps us be better friends."],["📊","evidence","EV-ih-dents","Facts that show something is true.","Give evidence to support your point."],["✂️","concise","kun-SYS","Short and clear, with no extra words.","Keep your speech concise."],["♻️","sustainable","suh-STAY-nuh-bul","Able to continue without harming the planet.","Cloth bags are a sustainable choice."],["📚","diligent","DIL-ih-jent","Hard-working and careful.","A diligent student revises every week."],["🎙️","eloquent","EL-uh-kwent","Speaking in a clear, powerful way.","The speaker was eloquent and calm."],["🏁","initiative","ih-NISH-uh-tiv","Doing something useful without being asked.","He took the initiative to help."]]};
const WOD_TIP={Seeds:w=>`Point to something at home that matches “${w}” and say the word together.`,Sprouts:w=>`At dinner, ask your child to use “${w}” in a sentence about their day.`,Blooms:w=>`Ask your child to use “${w}” when they tell you about school today.`};
let wodSub=0;
function wodLoad(){if(wodSub||!S.db)return;wodSub=1;try{S.db.doc("config/wod").onSnapshot(d=>{D.wod=(d.exists&&d.data())||{};schedule();},()=>{wodSub=0;});}catch(e){wodSub=0;}}
const wodStageOf=L=>WOD_STAGES.includes(L&&L.stage)?L.stage:"Seeds";
function wodItems(stage){wodLoad();const it=(D.wod&&D.wod.items)||{};return Object.entries(it).filter(([,v])=>v&&v.word&&(!stage||v.stage===stage)).map(([id,v])=>({id,...v}));}
const wodDayNo=ds=>Math.floor(Date.UTC(+ds.slice(0,4),+ds.slice(5,7)-1,+ds.slice(8,10))/864e5);
const wodStarterItems=stage=>(WOD_STARTER[stage]||WOD_STARTER.Seeds).map(([emo,word,phon,mean,ex],i)=>({id:"starter-"+i,stage,emo,word,phon,mean,ex}));
/* the day's word; a day with no word rotates an earlier one, never a blank */
function wodFor(stage,ds){ds=ds||ymd(new Date());const all=wodItems(stage);const exact=all.find(x=>x.date===ds);if(exact)return {...exact,ds,rot:false};
  let pool=all.filter(x=>!x.date||x.date<ds).sort((a,b)=>String(a.date||"").localeCompare(String(b.date||""))||String(a.word).localeCompare(String(b.word)));let src="list";
  if(!pool.length){pool=wodStarterItems(stage);src="starter";}else if(pool.length<7){pool=pool.concat(wodStarterItems(stage).filter(s=>!pool.some(x=>String(x.word).toLowerCase()===s.word)));src="mixed";}
  const x=pool[((wodDayNo(ds)%pool.length)+pool.length)%pool.length];return {...x,ds,rot:true,src};}
const wodRec=(uid,ds)=>((progOf(uid).wod||{})[ds||ymd(new Date())])||null;
const wodGold=uid=>Object.values(progOf(uid).wod||{}).filter(r=>r&&r.w).length;
const wodSay=(w,slow)=>{if(!canSpeak())return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(w);u.lang="en-IN";u.rate=slow?.65:.8;speechSynthesis.speak(u);}catch(e){}};
/* ---------- student: card at the top of home ---------- */
function wodCardHTML(L){if(!L||!L.uid)return "";const st=wodStageOf(L),r=wodRec(L.uid),x0=wodFor(st),x=r&&r.w&&r.w!==x0.word?{...x0,word:r.w,mean:r.m,emo:r.e,phon:"",ex:""}:x0,seeds=st==="Seeds",sr=!!SR,ui=S.wodUI||{};
  return `<section class="wodcard ${r?"done":""}" aria-label="Word of the Day">
    <div class="wodtop"><span class="eyebrow">Word of the Day</span>${r?`<span class="pill p-sun">🌼 Golden flower planted</span>`:""}</div>
    <div class="wodbody"><span class="wodemo" aria-hidden="true">${esc(x.emo||"🌱")}</span><div class="grow"><b class="wodword">${esc(x.word)}</b>${!seeds&&x.phon?`<span class="wodphon">${esc(x.phon)}</span>`:""}<p class="wodmean">${esc(x.mean||"")}</p>${x.ex?`<p class="wodex">“${esc(x.ex)}”</p>`:""}</div></div>
    ${ui.msg?`<p class="wodmsg" aria-live="polite">${ui.msg}</p>`:""}
    <div class="row wodbtns">${canSpeak()?`<button class="btn btn-ghost" data-act="wodHear">${ic("sound")}Hear it</button>`:""}
      ${r?"":sr?`<button class="btn btn-leaf" data-act="wodSayIt" ${ui.listening?"disabled":""}>${ui.listening?"Listening…":"🎤 Say it with me!"}</button>${ui.tries?`<button class="btn btn-ghost" data-act="wodLearned">${ic("check")}I learned it!</button>`:""}`:`<button class="btn btn-leaf" data-act="wodLearned">${ic("check")}I learned it!</button>`}
      ${r&&!seeds?`<button class="btn btn-ghost" data-act="wodSentence">✏️ ${r.s||r.a?"My sentence":"Use it in a sentence"}</button>`:""}</div>
    ${!sr&&!r?`<p class="small muted" style="margin:0">Say it out loud with a grown-up, then tap “I learned it!”.</p>`:""}</section>`;}
A.wodHear=()=>{const L=myLearner();if(!L)return;const word=wodFor(wodStageOf(L)).word,day=ymd(new Date());
  if(S.wodIntro===day){wodSay(word,true);return}S.wodIntro=day;pipPlay("seed").then(ok=>{if(ok!=="stop")setTimeout(()=>wodSay(word,true),150);});};
A.wodSayIt=()=>{const L=myLearner();if(!L||!SR)return;if(timeUp()){render();return}const x=wodFor(wodStageOf(L));const ui=S.wodUI=S.wodUI||{};if(ui.listening)return;ui.listening=true;ui.msg="";render(true);
  const fail=m=>{ui.listening=false;ui.tries=(ui.tries||0)+1;ui.msg=m;render(true);};
  try{const r=new SR();r.lang="en-IN";r.maxAlternatives=5;let got=false;
    r.onresult=e=>{got=true;const alts=[...e.results[0]].map(a=>a.transcript);const sc=sayScore(x.word,alts);
      if(sc.stars>=2){ui.listening=false;wodDone(L,x,"said");}else fail(sc.heard?`Nice try! Pip heard “${esc(sc.heard)}”. Tap Hear it, then say it once more.`:"Pip couldn't hear you. Try a little louder, close to the phone.");};
    r.onerror=()=>{if(!got)fail("Pip couldn't hear you that time. Try again, or tap “I learned it!”.");};
    r.onend=()=>{if(!got&&ui.listening)fail("Pip couldn't hear you. Try a little louder, close to the phone.");};
    pipPlay("sayit").then(ok=>ok==="stop"?"stop":pipSpeak(x.word)).then(ok=>ok==="stop"?"stop":pipPlay("turn")).then(()=>{try{r.start();setTimeout(()=>{try{r.stop()}catch(e){}},6000);}catch(e){fail("Pip can't listen on this phone. Say it out loud, then tap “I learned it!”.");}});}catch(e){fail("Pip can't listen on this phone. Say it out loud, then tap “I learned it!”.");}};
A.wodLearned=()=>{const L=myLearner();if(!L)return;wodDone(L,wodFor(wodStageOf(L)),"tap");};
async function wodDone(L,x,how){const ds=ymd(new Date());if(wodRec(L.uid,ds))return;
  if(realRole()!=="student"){S.wodUI={msg:"This is a preview, so nothing is saved."};render(true);return}
  const rec={w:x.word,m:x.mean||"",e:x.emo||"",how,at:Date.now()};
  const p=D.progress[S.uid]=D.progress[S.uid]||{};p.wod={...(p.wod||{}),[ds]:rec};p.days={...(p.days||{}),[ds]:1};
  S.wodUI={msg:`${how==="said"?`Yay! You said <b>${esc(x.word)}</b>!`:`Well done for learning <b>${esc(x.word)}</b>!`} A golden flower is growing in your garden. 🌼`};
  render(true);toast("🌼 Golden flower planted!");pipPlay("yay");try{await earn({wod:{[ds]:rec}});wkLog(x.word,true);}catch(e){toast("That didn't save. Check your internet and try again.",true);}}
A.wodSentence=()=>{const L=myLearner();if(!L||wodStageOf(L)==="Seeds")return;if(timeUp()){render();return}const ds=ymd(new Date()),r=wodRec(L.uid,ds);if(!r)return;
  const lim=recLimit(L);let clip=null,rec=false;S.wodDraft=r.s||"";
  const draw=()=>openModal("Use it in a sentence",`<p style="margin:0">Write or say your own sentence with <b>${esc(r.w)}</b>.</p>
    <div class="field"><label for="ws-t">My sentence</label><textarea id="ws-t" name="t" rows="3" maxlength="200" placeholder="Write your sentence here">${esc(S.wodDraft||"")}</textarea></div>
    ${canRecord()?`<div class="row"><button type="button" class="btn ${rec?"btn-danger":"btn-sun"}" data-mact="rec">${rec?"■ Stop":clip?"🎤 Record again":"🎤 Or record it"}</button><span class="small muted">Up to ${lim} seconds</span></div>${clip?`<audio controls src="${esc(clip)}"></audio>`:""}`:""}
    <p class="small muted" style="margin:0">Your teacher can read or listen to it and may send you a star.</p>`,
   {noFocus:true,submitLabel:"Send to my teacher",done:"Sent!",
    actions:{rec:async(_,b,f)=>{if(f&&f.t)S.wodDraft=f.t.value;if(rec){stopRec();return}const ok=await startRec(lim,u=>{rec=false;clip=u;draw();});if(ok){rec=true;draw();}}},
    onSubmit:async f=>{const t=f.t.value.trim().slice(0,200);if(!t&&!clip)throw userErr("Write a sentence or record one first.");
      if(realRole()!=="student")throw userErr("This is a preview, so nothing is saved.");
      const patch={at2:Date.now()};if(t)patch.s=t;
      if(clip){const ref=S.db.collection(`kp/${S.uid}/x`).doc();await ref.set({kind:"audio",title:`Sentence with “${r.w}”`,data:clip,at:Date.now(),act:"wod",word:r.w,day:ds});patch.a=ref.id;prunePractice(S.uid,"wod");}
      await earn({wod:{[ds]:patch}});S.wodDraft=null;}});
  draw();};
/* golden flowers in the garden */
function wodGoldHTML(g){const n=Math.min(g||0,5);let h="";const xs=[36,60,29,67,43];for(let i=0;i<n;i++)h+=`<span class="fl gold" style="left:${xs[i]}%">${flowerSvg("#E0A100",46+((i*13)%14))}<i aria-hidden="true">✨</i></span>`;return h;}
/* My words: past days */
function wodPastHTML(L){if(!L||!L.uid)return "";const st=wodStageOf(L),days=[];const d=new Date();for(let i=0;i<14;i++){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()-i);days.push(ymd(x));}
  return `<section class="card panel"><h2>Word of the Day</h2><p class="small muted">Tap a day to see its word again. 🌼 means you learned it.</p><div class="wodpast">${days.map((ds,i)=>{const x=wodFor(st,ds),r=wodRec(L.uid,ds);
    return `<button class="wodchip ${r?"on":""}" data-act="wodDay" data-id="${ds}"><span aria-hidden="true">${esc(x.emo||"🌱")}</span><b>${esc(x.word)}</b><i>${i===0?"Today":esc(fmtDay(new Date(ds+"T12:00")))}${r?" · 🌼":""}</i></button>`;}).join("")}</div></section>`;}
A.wodDay=ds=>{const L=myLearner()||curKid();if(!L)return;const st=wodStageOf(L),x=wodFor(st,ds),r=L.uid&&wodRec(L.uid,ds);
  openModal(ds===ymd(new Date())?"Today's word":`Word for ${fmtDay(new Date(ds+"T12:00"))}`,`<div class="wodbody"><span class="wodemo" aria-hidden="true">${esc(x.emo||"🌱")}</span><div class="grow"><b class="wodword">${esc(x.word)}</b>${st!=="Seeds"&&x.phon?`<span class="wodphon">${esc(x.phon)}</span>`:""}<p class="wodmean">${esc(x.mean||"")}</p>${x.ex?`<p class="wodex">“${esc(x.ex)}”</p>`:""}</div></div>${r?`<p class="pill p-sun" style="align-self:flex-start">🌼 You learned this word!</p>`:""}${r&&r.s?`<p class="small"><b>My sentence:</b> ${esc(r.s)}</p>`:""}`,
   {noFocus:true,submitLabel:"Done",footerExtra:canSpeak()?`<button type="button" class="btn btn-ghost" data-mact="hear">${ic("sound")}Hear it</button>`:"",actions:{hear:()=>wodSay(x.word,true)}});};
/* merge learned words into My words */
function wodMerge(uid,out){const seen=new Set(out.map(x=>String(x.w).toLowerCase()));for(const [ds,r] of Object.entries(progOf(uid).wod||{})){if(!r||!r.w)continue;const k=r.w.toLowerCase();if(seen.has(k))continue;seen.add(k);out.push({w:r.w,m:r.m||"",lang:"en-IN",ts:r.at||Date.parse(ds),lesson:"Word of the Day"});}return out;}
/* ---------- parent home ---------- */
function wodParentHTML(kids){kids=(kids||[]).filter(Boolean);if(!kids.length)return "";const stages=[...new Set(kids.map(wodStageOf))];
  return `<section class="wodparent"><span class="eyebrow">Word of the Day</span><div class="wodpgrid">${stages.map(st=>{const x=wodFor(st),ks=kids.filter(L=>wodStageOf(L)===st);
    return `<div class="wodp"><div class="wodbody"><span class="wodemo sm" aria-hidden="true">${esc(x.emo||"🌱")}</span><div class="grow"><b class="wodword sm">${esc(x.word)}</b>${st!=="Seeds"&&x.phon?`<span class="wodphon">${esc(x.phon)}</span>`:""}<p class="wodmean">${esc(x.mean||"")}</p></div>${canSpeak()?`<button class="iconbtn" data-act="say" data-w="${esc(x.word)}" data-l="en-IN" aria-label="Hear ${esc(x.word)}">${ic("sound")}</button>`:""}</div>
      <p class="wodtip"><b>Try at home:</b> ${esc(x.tip||WOD_TIP[st](x.word))}</p>
      <p class="small muted" style="margin:0">${ks.map(L=>`${esc(firstOf(L.name))}: ${L.uid&&wodRec(L.uid)?"learned it today 🌼":"not yet today"}`).join(" · ")}</p></div>`;}).join("")}</div></section>`;}
/* ---------- staff ---------- */
function wodWeek(stage,offset){const d=new Date();const back=(d.getDay()+6)%7;const out=[];for(let i=0;i<7;i++){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()-back+offset*7+i);const ds=ymd(x);out.push({x,ds,w:wodFor(stage,ds)});}return out;}
function wodWeekHTML(stage){const today=ymd(new Date());const wk=(o,t)=>`<div class="wodwk"><h3>${t}</h3><div class="wodweek">${wodWeek(stage,o).map(d=>`<div class="wodday ${d.ds===today?"today":""}"><span class="small muted">${esc(d.x.toLocaleDateString(undefined,{weekday:"short",day:"numeric"}))}</span><b>${esc(d.w.emo||"")} ${esc(d.w.word)}</b>${d.w.rot?`<i class="small muted">repeat</i>`:""}</div>`).join("")}</div></div>`;
  return `<section class="card panel"><h2>${esc(stage)}</h2>${wk(0,"This week")}${wk(1,"Next week")}</section>`;}
function wodSentences(ls,days){const out=[];const since=Date.now()-(days||21)*864e5;for(const L of ls){if(!L||!L.uid)continue;for(const [ds,r] of Object.entries(progOf(L.uid).wod||{})){if(!r||(!r.s&&!r.a))continue;if((r.at2||r.at||0)<since)continue;out.push({L,ds,r});}}return out.sort((a,b)=>(b.r.at2||0)-(a.r.at2||0));}
const wodStarred=(lid,ds)=>txAll("award").some(a=>a.wod===lid+"|"+ds);
const wodStaffLearners=()=>role()==="admin"?activeLearners():(pipTry(()=>teacherLearners(myTid()))||[]);
const wodToReview=()=>wodSentences(wodStaffLearners()).filter(x=>!wodStarred(x.L.id,x.ds));
function wodReviewHTML(){const xs=wodSentences(wodStaffLearners());
  return `<section class="card panel"><h2>Sentences to review</h2>${xs.length?`<div class="list">${xs.slice(0,30).map(({L,ds,r})=>{if(r.a&&L.uid&&!D.kp[L.uid])loadKp(L.uid);const au=r.a&&L.uid&&(D.kp[L.uid]||{})[r.a];const done=wodStarred(L.id,ds);
    return `<div class="item"><div class="grow"><div class="t">${esc(L.name)} · “${esc(r.w)}”</div><div class="s">${esc(fmtDay(new Date(ds+"T12:00")))}</div>${r.s?`<p style="margin:6px 0 0">${esc(r.s)}</p>`:""}${au&&au.data?`<audio controls preload="none" src="${esc(au.data)}"></audio>`:r.a?`<p class="small muted" style="margin:4px 0 0">Recording no longer kept.</p>`:""}</div>${done?`<span class="pill p-good">⭐ Star sent</span>`:`<button class="btn btn-ghost btn-sm" data-act="wodStar" data-id="${esc(L.id+"|"+ds)}">⭐ Give a star</button>`}</div>`;}).join("")}</div>`:`<p class="muted">No sentences yet. Sprouts and Blooms can add one after learning the day's word.</p>`}</section>`;}
A.wodStar=async id=>{const [lid,ds]=String(id).split("|");const L=learner(lid);if(!L||!isStaff()||!/^\d{4}-\d\d-\d\d$/.test(ds||""))return;const r=L.uid&&wodRec(L.uid,ds);
  await S.db.doc(`tw/${S.uid}/x/wodstar-${lid}-${ds}`).set({kind:"award",lid,stars:1,badge:null,reason:`Great sentence with “${r?r.w:"the word of the day"}”`,wod:lid+"|"+ds,at:Date.now()});toast("Star sent ⭐");};
function wodView(){const r=role();if(!isStaff())return pendingHTML();
  if(r!=="admin"){const ls=wodStaffLearners();const stages=WOD_STAGES.filter(s=>ls.some(L=>wodStageOf(L)===s));
    return `<div class="head"><div><h1>Word of the Day</h1><p class="lede">This week's and next week's words for your learners, and their sentences to review.</p></div></div>${(stages.length?stages:["Seeds"]).map(wodWeekHTML).join("")}${wodReviewHTML()}`;}
  const st=S.wodStage||"Seeds",tab=S.wodTab||"cal";
  const tabs=`<div class="seg" role="tablist">${[["cal","Calendar"],["list","Word list"],["review","Sentences"]].map(([k,l])=>`<button class="tog ${tab===k?"on":""}" role="tab" aria-selected="${tab===k}" data-act="wodTab" data-id="${k}">${l}</button>`).join("")}</div>`;
  const stageBar=`<div class="kidbar" role="tablist" aria-label="Stage">${WOD_STAGES.map(s=>`<button class="kidchip ${s===st?"on":""}" role="tab" aria-selected="${s===st}" data-act="wodStage" data-id="${s}">${s}</button>`).join("")}</div>`;
  let body="";
  if(tab==="review")body=wodReviewHTML();
  else if(tab==="list"){const xs=wodItems(st).sort((a,b)=>(a.date?0:1)-(b.date?0:1)||String(a.date||"").localeCompare(String(b.date||""))||String(a.word).localeCompare(String(b.word)));
    body=`<section class="card panel"><div class="ph"><h2>${esc(st)} words <span class="pill p-mute num">${xs.length}</span></h2></div>${xs.length?`<div class="list">${xs.map(x=>`<div class="item"><span class="wodemo xs" aria-hidden="true">${esc(x.emo||"🌱")}</span><div class="grow"><div class="t">${esc(x.word)}${x.phon?` <span class="muted">· ${esc(x.phon)}</span>`:""}</div><div class="s">${x.date?esc(fmtDay(new Date(x.date+"T12:00"))):"No date: used when a day has no word"} · ${esc(x.mean||"")}</div></div><div class="row" style="gap:6px"><button class="btn btn-ghost btn-sm" data-act="wodPost" data-id="${esc(x.id)}">Make social post</button><button class="iconbtn" data-act="wodEdit" data-id="${esc(x.id)}" aria-label="Edit ${esc(x.word)}">${ic("edit")}</button><button class="iconbtn" data-act="wodDel" data-id="${esc(x.id)}" aria-label="Delete ${esc(x.word)}">${ic("trash")}</button></div></div>`).join("")}</div>`
      :`<p class="muted">No ${esc(st)} words yet, so the app rotates 14 built-in starter words. Add your own, import a CSV, or copy the starter words into your list to edit them.</p><button class="btn btn-ghost" data-act="wodSeed">Copy the starter words into my list</button>`}</section>`;}
  else{const m=S.wodMonth||ym(new Date());const [Y,M]=m.split("-").map(Number);const first=new Date(Y,M-1,1),days=new Date(Y,M,0).getDate(),lead=(first.getDay()+6)%7,today=ymd(new Date());
    const cells=[];for(let i=0;i<lead;i++)cells.push(`<div class="wodcell empty" aria-hidden="true"></div>`);
    for(let d=1;d<=days;d++){const ds=`${m}-${pad(d)}`,x=wodFor(st,ds);cells.push(`<button class="wodcell ${x.rot?"rot":""} ${ds===today?"today":""}" data-act="wodEditDay" data-id="${ds}" aria-label="${esc(fmtDay(new Date(ds+"T12:00")))}: ${esc(x.word)}${x.rot?" (repeat)":""}"><span class="wodd">${d}</span><span class="wodw">${esc(x.emo||"")} ${esc(x.word)}</span>${x.rot?`<i>repeat</i>`:""}</button>`);}
    const mv=k=>{const t=new Date(Y,M-1+k,1);return ym(t);};
    body=`<section class="card panel"><div class="ph"><h2>${esc(first.toLocaleDateString(undefined,{month:"long",year:"numeric"}))} · ${esc(st)}</h2><div class="row"><button class="iconbtn" data-act="wodMonth" data-id="${mv(-1)}" aria-label="Previous month">${ic("back")}</button><button class="iconbtn" data-act="wodMonth" data-id="${mv(1)}" aria-label="Next month">${ic("fwd")}</button></div></div>
      <p class="small muted">Tap a day to set its word. Days marked “repeat” have no word yet, so an earlier word is shown again.</p>
      <div class="wodcal"><div class="wodh">Mon</div><div class="wodh">Tue</div><div class="wodh">Wed</div><div class="wodh">Thu</div><div class="wodh">Fri</div><div class="wodh">Sat</div><div class="wodh">Sun</div>${cells.join("")}</div></section>`;}
  return `<div class="head"><div><h1>Word of the Day</h1><p class="lede">One word a day for each stage. Children see it at the top of their home page; parents get a tip for using it at home.</p></div><div class="row"><button class="btn btn-ghost" data-act="wodImport">${ic("up")}Import CSV</button><button class="btn btn-primary" data-act="wodEdit">${ic("plus")}Add a word</button></div></div>
    ${stageBar}<div style="margin:12px 0">${tabs}</div>${body}`;}
A.wodTab=k=>{S.wodTab=k;render(true);};A.wodStage=s=>{if(WOD_STAGES.includes(s))S.wodStage=s;render(true);};A.wodMonth=m=>{if(/^\d{4}-\d\d$/.test(m))S.wodMonth=m;render(true);};
const wodClean=(v,n)=>String(v==null?"":v).replace(/\s+/g," ").trim().slice(0,n);
A.wodEdit=(id,_,pre)=>{if(role()!=="admin")return;const it=(id&&((D.wod||{}).items||{})[id])||pre||{};const st=it.stage||S.wodStage||"Seeds";
  openModal(id?"Edit word":"Add a word",`<div class="two"><div class="field"><label for="wd-st">Stage</label><select id="wd-st" name="st">${WOD_STAGES.map(s=>opt(s,s,s===st)).join("")}</select></div><div class="field"><label for="wd-d">Date (optional)</label><input type="date" id="wd-d" name="d" value="${esc(it.date||"")}"><span class="hint">Leave empty to use it on days with no word.</span></div></div>
    <div class="two"><div class="field"><label for="wd-w">Word</label><input type="text" id="wd-w" name="w" maxlength="40" required value="${esc(it.word||"")}"></div><div class="field"><label for="wd-e">Picture (emoji)</label><input type="text" id="wd-e" name="e" maxlength="8" value="${esc(it.emo||"")}" placeholder="🍎"></div></div>
    <div class="field"><label for="wd-p">Phonetic spelling (Sprouts and Blooms)</label><input type="text" id="wd-p" name="p" maxlength="60" value="${esc(it.phon||"")}" placeholder="KYOOR-ee-us"></div>
    <div class="field"><label for="wd-m">Simple meaning</label><textarea id="wd-m" name="m" rows="2" maxlength="160" required>${esc(it.mean||"")}</textarea></div>
    <div class="field"><label for="wd-x">Example sentence</label><input type="text" id="wd-x" name="x" maxlength="160" value="${esc(it.ex||"")}"></div>
    <div class="field"><label for="wd-t">Tip for parents (optional)</label><input type="text" id="wd-t" name="t" maxlength="200" value="${esc(it.tip||"")}" placeholder="${esc(WOD_TIP[st]("word"))}"></div>`,
   {submitLabel:"Save word",done:"Saved",onSubmit:async f=>{const w=wodClean(f.w.value,40),m=wodClean(f.m.value,160);if(!w)throw userErr("Add the word.");if(!m)throw userErr("Add a simple meaning.");
     const d=f.d.value&&/^\d{4}-\d\d-\d\d$/.test(f.d.value)?f.d.value:"";const stage=WOD_STAGES.includes(f.st.value)?f.st.value:"Seeds";
     const clash=d&&wodItems(stage).find(x=>x.date===d&&x.id!==id);if(clash)throw userErr(`“${clash.word}” is already set for that day. Edit it instead, or pick another date.`);
     const nid=id||("w"+Date.now().toString(36)+Math.random().toString(36).slice(2,5));
     await upsert("config/wod",{items:{[nid]:{stage,date:d,word:w,phon:wodClean(f.p.value,60),mean:m,ex:wodClean(f.x.value,160),emo:wodClean(f.e.value,8),tip:wodClean(f.t.value,200),at:Date.now()}}});}});};
A.wodEditDay=ds=>{if(role()!=="admin"||!/^\d{4}-\d\d-\d\d$/.test(ds))return;const st=S.wodStage||"Seeds";const ex=wodItems(st).find(x=>x.date===ds);if(ex){A.wodEdit(ex.id);return}A.wodEdit(null,null,{stage:st,date:ds});};
A.wodDel=id=>{if(role()!=="admin")return;const it=((D.wod||{}).items||{})[id];if(!it)return;openModal("Delete this word?",`<p>“${esc(it.word)}” will be removed from the ${esc(it.stage)} list. Children who already learned it keep it in My words.</p>`,{danger:true,submitLabel:"Delete",done:"Deleted",onSubmit:async()=>{await upsert("config/wod",{items:{[id]:null}});}});};
A.wodSeed=async()=>{if(role()!=="admin")return;const st=S.wodStage||"Seeds";const items={};wodStarterItems(st).forEach((x,i)=>{items["s"+st[0]+i+Date.now().toString(36)]={stage:st,date:"",word:x.word,phon:x.phon,mean:x.mean,ex:x.ex,emo:x.emo,tip:"",at:Date.now()};});await upsert("config/wod",{items});toast("Starter words added");};
/* CSV: date,stage,word,phonetic,meaning,example,emoji,tip */
function wodParseCSV(txt){const rows=[];let row=[],f="",q=false;for(let i=0;i<txt.length;i++){const c=txt[i];if(q){if(c==='"'){if(txt[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}else if(c==='"')q=true;else if(c===","){row.push(f);f="";}else if(c==="\n"||c==="\r"){if(c==="\r"&&txt[i+1]==="\n")i++;row.push(f);rows.push(row);row=[];f="";}else f+=c;}
  if(f||row.length){row.push(f);rows.push(row);}return rows.filter(r=>r.some(x=>String(x).trim()));}
function wodDate(v){v=String(v||"").trim();if(!v)return "";let m=v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);if(m)return `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;m=v.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);if(m)return `${m[3]}-${pad(+m[2])}-${pad(+m[1])}`;return null;}
const WOD_COLS=["date","stage","word","phonetic","meaning","example","emoji","tip"];
A.wodImport=()=>{if(role()!=="admin")return;let parsed=null;
  const draw=(note)=>openModal("Import words from CSV",`<p class="small">Columns, in this order or with these headings: <b>${WOD_COLS.join(", ")}</b>. Dates as YYYY-MM-DD or DD/MM/YYYY; leave the date empty for words to repeat. Stage is Seeds, Sprouts or Blooms.</p>
    <div class="row"><button type="button" class="btn btn-ghost btn-sm" data-mact="tpl">${ic("down")}Download a template</button><label class="btn btn-ghost btn-sm">${ic("up")}Choose a CSV file<input type="file" accept=".csv,text/csv" data-mchange="file" hidden></label></div>
    <div class="field"><label for="wi-t">Or paste the rows here</label><textarea id="wi-t" name="t" rows="6" data-mchange="paste" placeholder="2026-11-03,Sprouts,curious,KYOOR-ee-us,Wanting to know more,Pip is curious about clouds.,🔍,"></textarea></div>
    ${note?`<p class="small" aria-live="polite">${note}</p>`:""}`,
   {wide:true,noFocus:true,submitLabel:"Import words",done:"Imported",
    actions:{tpl:()=>saveFile("word-of-the-day-template.csv","date,stage,word,phonetic,meaning,example,emoji,tip\n2026-11-03,Seeds,apple,AP-ul,A round crunchy fruit.,I eat an apple.,🍎,\n,Sprouts,curious,KYOOR-ee-us,Wanting to know or learn about something.,Pip is curious about the clouds.,🔍,\n"),
      file:(_,el)=>{const fl=el.files&&el.files[0];if(!fl)return;if(fl.size>1e6){toast("That file is too big (1MB max).",true);return}fl.text().then(t=>{parsed=wodRows(t);const ta=document.getElementById("wi-t");if(ta)ta.value=t.slice(0,20000);draw(parsed.msg);});},
      paste:v=>{parsed=wodRows(v);}},
    onSubmit:async f=>{if(!parsed||!parsed.items)parsed=wodRows(f.t.value);if(!parsed.n)throw userErr(parsed.msg||"No rows to import.");await upsert("config/wod",{items:parsed.items});toast(`${parsed.n} word${parsed.n===1?"":"s"} imported`);}});
  draw();};
function wodRows(txt){const rows=wodParseCSV(String(txt||""));if(!rows.length)return {n:0,msg:"No rows found."};let cols=WOD_COLS,start=0;
  const h=rows[0].map(x=>String(x).trim().toLowerCase());if(h.includes("word")){cols=h.map(x=>x==="phonetics"?"phonetic":x==="picture"?"emoji":x);start=1;}
  const items={},bad=[];let n=0;const taken=new Set(wodItems().filter(x=>x.date).map(x=>x.stage+"|"+x.date));
  for(let i=start;i<rows.length;i++){const o={};cols.forEach((c,j)=>o[c]=rows[i][j]);const w=wodClean(o.word,40),m=wodClean(o.meaning,160);let st=wodClean(o.stage,10);st=WOD_STAGES.find(s=>s.toLowerCase()===st.toLowerCase())||S.wodStage||"Seeds";const d=wodDate(o.date);
    if(!w||!m||d===null){bad.push(i+1);continue}if(d&&taken.has(st+"|"+d)){bad.push(i+1);continue}if(d)taken.add(st+"|"+d);
    items["c"+Date.now().toString(36)+i]={stage:st,date:d||"",word:w,phon:wodClean(o.phonetic,60),mean:m,ex:wodClean(o.example,160),emo:wodClean(o.emoji,8),tip:wodClean(o.tip,200),at:Date.now()};n++;}
  return {n,items,msg:`${n} word${n===1?"":"s"} ready to import.${bad.length?` Skipped row${bad.length===1?"":"s"} ${bad.slice(0,8).join(", ")}${bad.length>8?"…":""} (missing word or meaning, a date we couldn't read, or a day that already has a word).`:""}`};}
/* social post: Word Seed of the Week (1080x1080 PNG, made on this device) */
const WOD_PIP=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="24 12 152 186"><path d="M100 58 c-4 -26 -30 -40 -54 -30 c8 24 30 34 54 30 z" fill="#A6DB5C"/><path d="M100 58 c4 -30 32 -46 60 -34 c-10 28 -34 38 -60 34 z" fill="#7CC243"/><path d="M100 56 v14" stroke="#22703A" stroke-width="6" stroke-linecap="round"/><ellipse cx="100" cy="128" rx="70" ry="64" fill="#2F8F46"/><ellipse cx="100" cy="150" rx="46" ry="30" fill="#3FA75A"/><circle cx="76" cy="116" r="15" fill="#FFFFFF"/><circle cx="79" cy="119" r="8" fill="#2E2219"/><circle cx="82" cy="115" r="2.6" fill="#FFFFFF"/><circle cx="124" cy="116" r="15" fill="#FFFFFF"/><circle cx="127" cy="119" r="8" fill="#2E2219"/><circle cx="130" cy="115" r="2.6" fill="#FFFFFF"/><ellipse cx="58" cy="140" rx="10" ry="6" fill="#F7A8C4"/><ellipse cx="142" cy="140" rx="10" ry="6" fill="#F7A8C4"/><path d="M84 140 q16 22 32 0 z" fill="#2E2219"/><path d="M92 148 q8 8 16 0 l-4 -2 h-8 z" fill="#E8492F"/></svg>`;
function wodWrap(g,t,x,y,w,lh){const ws=String(t||"").split(/\s+/);let line="";for(const word of ws){const test=line?line+" "+word:word;if(g.measureText(test).width>w&&line){g.fillText(line,x,y);y+=lh;line=word;}else line=test;}if(line){g.fillText(line,x,y);y+=lh;}return y;}
async function wodPostCanvas(x){const c=document.createElement("canvas");c.width=1080;c.height=1080;const g=c.getContext("2d");
  try{await Promise.all(['800 120px "Baloo 2"','700 44px "Baloo 2"','400 38px "Atkinson Hyperlegible"','700 28px "Atkinson Hyperlegible"'].map(f=>document.fonts.load(f)));}catch(e){}
  g.fillStyle="#BFE3FA";g.fillRect(0,0,1080,1080);
  g.fillStyle="#FFC94A";g.beginPath();g.arc(985,95,120,0,Math.PI*2);g.fill();
  g.fillStyle="#7CC243";g.beginPath();g.ellipse(540,1190,860,330,0,0,Math.PI*2);g.fill();
  g.textBaseline="alphabetic";g.textAlign="left";
  g.fillStyle="#22703A";g.font='700 28px "Atkinson Hyperlegible", sans-serif';try{g.letterSpacing="4px";}catch(e){}g.fillText("WORD SEED OF THE WEEK",80,110);try{g.letterSpacing="0px";}catch(e){}
  let fs=170;g.font=`800 ${fs}px "Baloo 2", sans-serif`;while(g.measureText(x.word).width>720&&fs>64){fs-=6;g.font=`800 ${fs}px "Baloo 2", sans-serif`;}
  g.fillStyle="#2E2219";g.fillText(x.word,76,100+fs);let y=100+fs+16;
  if(x.phon&&x.stage!=="Seeds"){g.font='700 44px "Baloo 2", sans-serif';g.fillStyle="#22703A";g.fillText(`/ ${x.phon} /`,80,y+40);y+=74;}
  g.font='400 38px "Atkinson Hyperlegible", sans-serif';g.fillStyle="#2E2219";y=wodWrap(g,x.mean,80,y+44,700,50)+10;
  if(x.ex){g.font='italic 400 34px "Atkinson Hyperlegible", sans-serif';g.fillStyle="#5C4F45";wodWrap(g,`“${x.ex}”`,80,y+34,700,46);}
  if(x.emo){g.font='150px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';g.textAlign="center";g.fillText(x.emo,900,470);g.textAlign="left";}
  try{const img=new Image();img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(WOD_PIP);await img.decode();g.drawImage(img,70,742,230,281);}catch(e){}
  g.fillStyle="#FFFFFF";g.beginPath();if(g.roundRect)g.roundRect(320,770,420,112,56);else g.rect(320,770,420,112);g.fill();
  g.beginPath();g.moveTo(336,846);g.lineTo(292,880);g.lineTo(372,858);g.closePath();g.fill();
  g.fillStyle="#2E2219";g.font='800 48px "Baloo 2", sans-serif';g.textAlign="center";g.fillText("Say it with me!",530,842);
  g.fillStyle="#F5FAEE";g.beginPath();if(g.roundRect)g.roundRect(700,955,320,86,43);else g.rect(700,955,320,86);g.fill();
  g.textAlign="left";g.fillStyle="#2E2219";g.font='700 26px "Baloo 2", sans-serif';const lw=g.measureText("little").width;g.font='800 56px "Baloo 2", sans-serif';const gw=g.measureText("lingos").width;
  const sx=860-(lw+8+gw)/2;g.font='700 26px "Baloo 2", sans-serif';g.fillText("little",sx,1013);g.fillStyle="#22703A";g.font='800 56px "Baloo 2", sans-serif';g.fillText("lingos",sx+lw+8,1013);
  g.fillStyle="#E8492F";const lx=sx+lw+8+gw-4,ly=976;g.beginPath();g.moveTo(lx,ly+16);g.bezierCurveTo(lx+1,ly+7,lx+7,ly+1,lx+16,ly);g.bezierCurveTo(lx+15,ly+9,lx+9,ly+15,lx,ly+16);g.fill();
  return c;}
A.wodPost=async id=>{if(role()!=="admin")return;const it=((D.wod||{}).items||{})[id];if(!it)return;toast("Making your post…");
  const c=await wodPostCanvas(it);const b=await new Promise(r=>c.toBlob(r,"image/png"));if(!b){toast("Couldn't make the image on this device.",true);return}
  const url=URL.createObjectURL(b);openModal("Word Seed of the Week",`<img src="${url}" alt="Social post for ${esc(it.word)}" style="width:100%;max-width:420px;border-radius:16px;align-self:center">`,
   {noFocus:true,submitLabel:"Download PNG",done:"Downloaded",onSubmit:async()=>{await saveFile(`word-seed-${String(it.word).toLowerCase().replace(/[^a-z0-9]+/g,"-")}.png`,b);}});};
