/* ================= Phase 3: Daily challenge (one small task a day) ================= */
const EMO={apple:"🍎",banana:"🍌",mango:"🥭",grape:"🍇",grapes:"🍇",orange:"🍊",lemon:"🍋",pear:"🍐",peach:"🍑",cherry:"🍒",strawberry:"🍓",watermelon:"🍉",pineapple:"🍍",coconut:"🥥",carrot:"🥕",corn:"🌽",potato:"🥔",tomato:"🍅",onion:"🧅",egg:"🥚",milk:"🥛",bread:"🍞",cake:"🍰",rice:"🍚",ice:"🧊",icecream:"🍦","ice cream":"🍦",cheese:"🧀",pizza:"🍕",tea:"🍵",water:"💧",
  cat:"🐱",dog:"🐶",cow:"🐄",hen:"🐔",chicken:"🐔",duck:"🦆",pig:"🐷",horse:"🐴",sheep:"🐑",goat:"🐐",rabbit:"🐰",mouse:"🐭",lion:"🦁",tiger:"🐯",elephant:"🐘",monkey:"🐒",bear:"🐻",fish:"🐟",bird:"🐦",frog:"🐸",snake:"🐍",turtle:"🐢",bee:"🐝",ant:"🐜",butterfly:"🦋",owl:"🦉",parrot:"🦜",peacock:"🦚",camel:"🐫",giraffe:"🦒",zebra:"🦓",fox:"🦊",whale:"🐳",dolphin:"🐬",octopus:"🐙",snail:"🐌",ladybird:"🐞",
  sun:"☀️",moon:"🌙",star:"⭐",cloud:"☁️",rain:"🌧️",rainbow:"🌈",snow:"❄️",tree:"🌳",flower:"🌸",leaf:"🍃",seed:"🌱",plant:"🪴",mountain:"⛰️",sea:"🌊",ocean:"🌊",fire:"🔥",planet:"🪐",earth:"🌍",
  ball:"⚽",book:"📖",pen:"🖊️",pencil:"✏️",bag:"🎒",car:"🚗",bus:"🚌",train:"🚆",plane:"✈️",boat:"⛵",bike:"🚲",bicycle:"🚲",house:"🏠",home:"🏠",school:"🏫",door:"🚪",chair:"🪑",bed:"🛏️",clock:"🕰️",phone:"📱",key:"🔑",cup:"☕",hat:"🎩",shoe:"👟",shirt:"👕",kite:"🪁",drum:"🥁",guitar:"🎸",gift:"🎁",balloon:"🎈",umbrella:"☂️",
  eye:"👁️",ear:"👂",nose:"👃",mouth:"👄",hand:"✋",foot:"🦶",tooth:"🦷",baby:"👶",girl:"👧",boy:"👦",mother:"👩",father:"👨",family:"👪",teacher:"🧑‍🏫",doctor:"🧑‍⚕️",happy:"😊",sad:"😢",sleep:"😴",
  red:"🔴",blue:"🔵",green:"🟢",yellow:"🟡",orange_colour:"🟠",purple:"🟣",black:"⚫",white:"⚪",brown:"🟤",circle:"⭕",square:"🟥",triangle:"🔺",heart:"❤️"};
const STARTER={Seeds:[["cat","a pet that says meow"],["dog","a pet that barks"],["apple","a red fruit"],["ball","a round toy"],["sun","it shines in the sky"],["fish","it swims in water"],["tree","it has leaves and branches"],["car","we ride in it on the road"]],
  Sprouts:[["rabbit","a small animal with long ears"],["banana","a long yellow fruit"],["flower","a pretty part of a plant"],["school","where we go to learn"],["rainbow","colours in the sky after rain"],["garden","where plants grow"],["happy","feeling good"],["friend","someone you like to play with"]],
  Blooms:[["journey","a long trip"],["curious","wanting to know more"],["brave","not afraid"],["planet","a big world that goes round the sun"],["ocean","a very big sea"],["imagine","to make a picture in your mind"],["gentle","soft and kind"],["discover","to find something new"]]};
const emoOf=w=>EMO[wkKey(w)]||null;
const dtKinds={say:"Say a word",picture:"Match a picture",spell:"Spell a word",question:"One question"};
function dtPool(L){const uid=L.uid,cids=learnerCourses(L),seen=new Set(),out=[];
  const add=(w,m,lang)=>{const k=wkKey(w);if(!k||seen.has(k)||!m)return;seen.add(k);out.push({w:w.trim(),m,lang:lang||"en-IN"});};
  const nx=nextLesson(uid,cids);const recent=doneList(uid).slice(0,2).map(x=>lessonById(x.lid)).filter(Boolean);
  for(const l of [nx,...recent].filter(Boolean)){const c=D.courses[l.courseId];for(const [w,m] of parseVocab(l.vocab))add(w,m,langOf(c));}
  if(out.length<4)for(const x of courseVocab(L))add(x.w,x.m,x.lang);
  if(out.length<4)for(const [w,m] of STARTER[L.stage]||STARTER.Seeds)add(w,m,"en-IN");
  return out;}
function dtPlan(L){const day=ymd(new Date());if(S.dtPlan&&S.dtPlan.day===day&&S.dtPlan.lid===L.id)return S.dtPlan;
  const r=rng(day+"|dt|"+(L.uid||L.id)), pool=shuffle(dtPool(L),r), stage=L.stage||"Seeds";
  const order=["say","picture","spell","question"];const start=Math.floor(r()*4);let plan=null;
  const spellable=x=>/^[A-Za-z]+$/.test(x.w)&&x.w.length>=3&&x.w.length<=(stage==="Seeds"?5:9);
  for(let i=0;i<4&&!plan;i++){const k=order[(start+i)%4];
    if(k==="say"&&pool.length)plan={k,x:pool[0]};
    else if(k==="picture"){const x=pool.find(y=>emoOf(y.w));if(x){const others=shuffle(Object.entries(EMO).filter(([w,e])=>e!==emoOf(x.w)&&!w.includes("_")),r).slice(0,2).map(([,e])=>e);plan={k,x,opts:shuffle([emoOf(x.w),...others],r),ans:emoOf(x.w)};}}
    else if(k==="spell"){const x=pool.find(spellable);if(x)plan={k,x,tiles:stage!=="Blooms",letters:shuffle(x.w.toLowerCase().split(""),r)};}
    else if(k==="question"&&pool.length>=3){const x=pool[0];const others=pool.slice(1).filter(y=>y.m!==x.m).slice(0,2);
      if(stage==="Seeds"&&emoOf(x.w)){const em=shuffle(Object.values(EMO).filter(e=>e!==emoOf(x.w)),r).slice(0,2);plan={k,x,listen:true,opts:shuffle([emoOf(x.w),...em],r),ans:emoOf(x.w),pics:true};}
      else if(others.length===2)plan={k,x,opts:shuffle([x.m,...others.map(o=>o.m)],r),ans:x.m};}}
  S.dtPlan=plan?{...plan,day,lid:L.id,tries:0,built:[],heard:null,msg:""}:{day,lid:L.id,k:null};return S.dtPlan;}
const dtDone=uid=>(progOf(uid).dt||{})[ymd(new Date())]||null;
function dtHTML(L){
  if(!L||!L.uid&&!L.preview)return "";const done=dtDone(S.uid);
  if(done)return `<section class="dtask done">${art("bloom",56,"Bloom")}<div class="grow"><span class="eyebrow">Daily challenge</span><b>${done.ok?"You did it!":"Good try!"}</b><span>${"⭐".repeat(done.s||1)} Your garden grew a little today. A new challenge comes tomorrow.</span></div></section>`;
  const p=dtPlan(L);if(!p.k)return "";const x=p.x;const sp=canSpeak();
  const head=`<div class="row dth">${art("buzz",48,"Buzz the ladybird")}<div class="grow"><span class="eyebrow">Daily challenge</span><b>${dtKinds[p.k]}</b></div><span class="pill p-sun">⭐⭐</span></div>`;
  let body="";
  if(p.k==="say"){body=`<p class="dtq">Can you say this word?</p><div class="dtword">${emoOf(x.w)?`<span class="dtemo" aria-hidden="true">${emoOf(x.w)}</span>`:""}<b>${esc(x.w)}</b>${x.m?`<small>${esc(x.m)}</small>`:""}</div>
    <div class="row dtbtns">${sp?`<button class="btn btn-ghost" data-act="dtListen">${ic("sound",20)}Listen</button>`:""}${SR?`<button class="btn btn-primary" data-act="dtRec">${p.rec?"Listening…":"🎤 Say it"}</button>`:""}<button class="btn ${SR?"btn-ghost":"btn-primary"}" data-act="dtSaid">I said it!</button></div>
    ${p.heard!=null?`<p class="dtmsg">Pip heard “${esc(p.heard||"…")}”. ${p.msg}</p>`:""}`;}
  else if(p.k==="picture"||(p.k==="question"&&p.pics)){body=`<p class="dtq">${p.listen?`Listen to Pip. Which picture is it?`:`Which picture is <b>${esc(x.w)}</b>?`}</p>${sp?`<button class="btn btn-ghost btn-sm" data-act="dtListen">${ic("sound")}${p.listen?"Hear the word":"Hear it"}</button>`:p.listen?`<p class="small"><b>${esc(x.w)}</b></p>`:""}
    <div class="dtpics">${p.opts.map((o,i)=>`<button class="dtpic ${p.wrong===i?"no":""}" data-act="dtPick" data-id="${i}" aria-label="Picture ${i+1}">${o}</button>`).join("")}</div>${p.msg?`<p class="dtmsg">${p.msg}</p>`:""}`;}
  else if(p.k==="question"){body=`<p class="dtq">What does <b>${esc(x.w)}</b> mean?</p>${sp?`<button class="btn btn-ghost btn-sm" data-act="dtListen">${ic("sound")}Hear it</button>`:""}
    <div class="dtopts">${p.opts.map((o,i)=>`<button class="dtopt ${p.wrong===i?"no":""}" data-act="dtPick" data-id="${i}">${esc(o)}</button>`).join("")}</div>${p.msg?`<p class="dtmsg">${p.msg}</p>`:""}`;}
  else if(p.k==="spell"){const hint=emoOf(x.w);
    body=`<p class="dtq">Listen and spell the word.${hint?` <span class="dtemo sm" aria-hidden="true">${hint}</span>`:""}</p>${sp?`<button class="btn btn-ghost btn-sm" data-act="dtListen">${ic("sound")}Hear the word</button>`:`<p class="small">The word means: ${esc(x.m)}</p>`}
    ${p.tiles?`<div class="dtslots" aria-live="polite">${x.w.split("").map((_,i)=>`<span class="dtslot">${esc(p.built[i]!=null?p.letters[p.built[i]]:"")}</span>`).join("")}</div>
      <div class="dttiles">${p.letters.map((c,i)=>`<button class="dttile" data-act="dtTile" data-id="${i}" ${p.built.includes(i)?"disabled":""} aria-label="Letter ${esc(c)}">${esc(c)}</button>`).join("")}</div>
      <div class="row dtbtns"><button class="btn btn-ghost btn-sm" data-act="dtBack" ${p.built.length?"":"disabled"}>${ic("back")}Undo</button><button class="btn btn-primary" data-act="dtCheck" ${p.built.length===x.w.length?"":"disabled"}>Check</button></div>`
     :`<div class="row dtbtns"><label for="dt-in" class="sr">Type the word</label><input id="dt-in" class="dtin" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="20" value="${esc(p.typed||"")}"><button class="btn btn-primary" data-act="dtCheck">Check</button></div>`}
    ${p.msg?`<p class="dtmsg">${p.msg}</p>`:""}`;}
  return `<section class="dtask">${head}${body}</section>`;}
function dtGuard(){if(timeUp()){render();return true}return false;}
A.dtListen=()=>{const p=S.dtPlan;if(p&&p.x)say(p.x.w,p.x.lang);};
A.dtSaid=()=>{if(dtGuard())return;dtFinish(true,true);};
A.dtRec=()=>{if(dtGuard())return;const p=S.dtPlan;if(!p||!SR||p.rec)return;try{const r=new SR();r.lang=p.x.lang||"en-IN";r.maxAlternatives=3;p.rec=true;render();
  r.onresult=e=>{const alts=[...e.results[0]].map(a=>a.transcript);const sc=sayScore(p.x.w,alts);const hit=sc.stars>=2;p.heard=sc.heard||alts[0]||"";p.rec=false;
    if(hit){dtFinish(true);}else{p.tries++;p.msg=p.tries>=2?"Lovely trying! Let's count that.":"Nearly! Listen once more and try again.";render();if(p.tries>=2)setTimeout(()=>dtFinish(false),1200);}};
  r.onerror=()=>{p.rec=false;p.msg="Pip couldn't hear. You can tap “I said it!” instead.";p.heard=p.heard??"";render();};r.onend=()=>{if(p.rec){p.rec=false;render();}};r.start();setTimeout(()=>{try{r.stop()}catch{}},6000);}catch(e){p.rec=false;render();}};
A.dtPick=i=>{if(dtGuard())return;const p=S.dtPlan;if(!p||p.fin)return;i=+i;if(p.opts[i]===p.ans){p.msg="";dtFinish(true);return;}
  p.tries++;p.wrong=i;if(p.tries>=2){p.msg=`It was ${p.pics?p.ans:`“${esc(p.ans)}”`}. Good try!`;render();setTimeout(()=>dtFinish(false),1400);}else{p.msg="Not quite. Have another go!";render();}};
A.dtTile=i=>{const p=S.dtPlan;if(!p||p.built.includes(+i)||p.built.length>=p.x.w.length)return;p.built.push(+i);p.msg="";render();};
A.dtBack=()=>{const p=S.dtPlan;if(p&&p.built.length){p.built.pop();render();}};
A.dtCheck=()=>{if(dtGuard())return;const p=S.dtPlan;if(!p||p.fin)return;let got;
  if(p.tiles)got=p.built.map(i=>p.letters[i]).join("");else{const el=document.getElementById("dt-in");got=(el&&el.value||"").trim();p.typed=got;}
  if(!got){p.msg="Type the word first.";render();return;}
  if(got.toLowerCase()===p.x.w.toLowerCase()){dtFinish(true);return;}
  p.tries++;if(p.tries>=2){p.msg=`It's spelled <b>${esc(p.x.w)}</b>. Good try!`;render();setTimeout(()=>dtFinish(false),1600);}else{p.msg="Almost! Listen again and have another go.";p.built=[];render();}};
async function dtFinish(ok,honor){const p=S.dtPlan;if(!p||p.fin)return;p.fin=true;const day=ymd(new Date()), s=ok?2:1;
  if(!honor&&p.x)wkLog(p.x.w,ok);
  const rec={k:p.k,ok:!!ok,s,w:p.x?p.x.w:"",at:Date.now()};
  if(!D.progress[S.uid])D.progress[S.uid]={};D.progress[S.uid].dt={...(D.progress[S.uid].dt||{}),[day]:rec};
  await save(()=>earn({dt:{[day]:rec},pts:{["d"+Date.now().toString(36)]:s}}));render();
  toast(ok?`You did it! +${s} stars ⭐`:`Good try! +${s} star ⭐`);}
/* families and teachers: how many daily challenges this week */
function dtWeek(uid){const dt=progOf(uid).dt||{};const t=Date.now()-7*864e5;return Object.entries(dt).filter(([d])=>new Date(d+"T12:00").getTime()>=t).length;}
