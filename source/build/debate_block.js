/* ================= Debate with Pip =================
   Sprouts and Blooms: pick a side of a motion, Pip argues the other side, three rounds, then feedback.
   Seeds: "Pip's choice", a which-do-you-like-more game that builds "I like … because …".
   Pip answers the child's actual argument using Ask Pip's free AI (same child-safety checks; debate chats
   are kept 30 days for admin safety review, like Ask Pip). Without AI it falls back to scripted replies. */
const DB_ROUNDS=3;
const DB_TARGET={Sprouts:10,Blooms:20};
const DB_STARTERS={
  Sprouts:["I think … because …","For example, …","But …","I don't agree because …","Also, …"],
  Blooms:["In my opinion, …","Firstly, …","For instance, …","However, …","I see your point, but …","On the other hand, …","Therefore, …"]};
const DB_CHECKS=[
  ["opinion","Said what you think",/\b(i think|i believe|in my opinion|i feel|i agree|i disagree|i don'?t agree|my view)\b/],
  ["reason","Gave a reason",/\b(because|since|so that|that'?s why|as a result|therefore|so)\b/],
  ["example","Gave an example",/\b(for example|for instance|such as|like when|e\.?g\.?|imagine)\b/],
  ["answer","Answered Pip's point",/\b(but|however|although|on the other hand|i see your point|that may be true|even though|yet)\b/],
  ["linked","Linked your ideas",/\b(also|firstly|secondly|finally|moreover|furthermore|in addition|another|to sum up|overall)\b/]];
const DB_TIP={opinion:"Start with “I think…” or “In my opinion…” so everyone knows your side.",reason:"Add “because…” after each idea to give a reason.",
  example:"Back up a point with “For example…”.",answer:"Reply to Pip's point with “But…” or “However…” before giving yours.",
  linked:"Join your ideas with “Also…”, “Firstly…” or “Finally…”.",long:"Say a little more each time: two or three sentences."};
const dbWords=t=>String(t||"").trim().split(/\s+/).filter(Boolean).length;
function dbScore(t,st){const s=" "+String(t||"").toLowerCase().replace(/[“”"]/g," ")+" ",hit=DB_CHECKS.filter(([,,r])=>r.test(s)).map(([k])=>k);
  if(dbWords(t)>=(DB_TARGET[st]||10))hit.push("long");return hit;}
function dbQuote(t){const w=String(t||"").replace(/\s+/g," ").trim().replace(/^(i think|in my opinion|i believe|firstly|however|but|well)[, ]+/i,"").split(/[.!?;]/)[0].split(" ");
  const q=w.slice(0,9).join(" ").replace(/[,:]+$/,"");return q+(w.length>9?"…":"");}
const dbPick=a=>a[Math.floor(Math.random()*a.length)];
/* Pip's scripted lines, built from whole sentences so every fixed sentence can be pre-recorded in Pip's voice */
const DB_L={
  ackS:[q=>[`You said “${q}”.`,"Good point!"],q=>[`Hmm, “${q}”.`,"I see what you mean."],q=>[`Ooh, “${q}”.`,"Nice one!"]],
  ackB:[q=>[`You argue that “${q}”.`,"That's a fair point."],q=>[`I hear you: “${q}”.`],q=>[`Interesting: “${q}”.`]],
  praise:{Sprouts:{example:["I like your example!"],reason:["You gave a reason.","Well done!"]},Blooms:{example:["Your example makes it stronger."],reason:["You backed it up with a reason."]}},
  turn:{Sprouts:["But listen!","Here's my next point.","But I still disagree."],Blooms:["But consider this.","However, there's another side.","On the other hand, think about this."]},
  ask:{Sprouts:{example:"Can you give me an example?",reason:"Why do you think that?",more:"What do you say to that?"},Blooms:{example:"Can you give me a real example?",reason:"Why do you think that?",more:"How would you answer that?"}},
  agree:["Ooh, you agree with me?","Good debaters can change their mind!","But let's keep going."],agreeAsk:"Can you find a point for your side?",
  close:["You argued really well!","Now give your closing statement: why should everyone agree with you?"],
  open:{Sprouts:{for:["I don't agree!"],against:["I agree!"],ask:"What do you think?"},Blooms:{for:["I'll argue against the motion."],against:["I'll argue for the motion."],ask:"What's your opening argument?"}},
  nudge:["Tell me a bit more!"],nudgeB:"Give a reason and an example.",nudgeS:"Try adding “because…”.",
  end:{3:["Wow, what a debate!","You argued like a champion.","I think the audience is on your side!"],2:["Great debate!","You made some strong points.","Next time, add even more reasons and examples."],1:["Well done for debating with me!","Every debate makes you a stronger speaker."]},
  seedQ:"Which do you like more?",seedNow:"Now you say it!",seedGreat:"Great reason!",seedEnd:["You've bloomed!","You gave great reasons."]};
const dbCap=t=>t.charAt(0).toUpperCase()+t.slice(1);
const dbOr=t=>`${dbCap(t[1])} or ${t[3]}?`;
const dbSeedLine=(t,pick,r)=>`I like ${pick?t[3]:t[1]} because ${/^I /.test(r)?r:r.charAt(0).toLowerCase()+r.slice(1)}.`;
function dbPipReply(d,txt,closing){const st=d.st,hit=dbScore(txt,st),q=dbQuote(txt),lc=txt.toLowerCase(),next=d.pip[d.round%d.pip.length]||"";
  if(!closing&&/\b(you'?re right|you are right|i agree with you|i changed my mind)\b/.test(lc))return [...DB_L.agree,next,DB_L.agreeAsk].join(" ");
  const ack=dbPick(st==="Blooms"?DB_L.ackB:DB_L.ackS)(q);
  const pr=DB_L.praise[st]||DB_L.praise.Sprouts,praise=hit.includes("example")?pr.example:hit.includes("reason")?pr.reason:[];
  if(closing)return [...ack,...praise,...DB_L.close].join(" ");
  const ak=DB_L.ask[st]||DB_L.ask.Sprouts,ask=!hit.includes("example")?ak.example:!hit.includes("reason")?ak.reason:ak.more;
  return [...ack,...praise,dbPick(DB_L.turn[st]||DB_L.turn.Sprouts),next,ask].join(" ");}
/* every fixed sentence Pip can say in these games (used to pre-record them; see tr/debate_voice.py) */
function dbFixedLines(){const o=[],add=x=>{for(const y of [].concat(x))if(typeof y==="string")o.push(y);};
  for(const st of ["Sprouts","Blooms"]){for(const t of DEBATE[st]){add(t[1]);add(t[2]);}add(DB_L.turn[st]);add(Object.values(DB_L.ask[st]));add(Object.values(DB_L.praise[st]).flat());
    const op=DB_L.open[st];add(op.for);add(op.against);add(op.ask);}
  add(DB_L.ackS.map(f=>f("")[1]));add(DB_L.ackB.map(f=>f("")[1]));add(DB_L.agree);add(DB_L.agreeAsk);add(DB_L.close);add(DB_L.nudge);add(DB_L.nudgeB);add(DB_L.nudgeS);
  add(Object.values(DB_L.end).flat());add([DB_L.seedQ,DB_L.seedNow,DB_L.seedGreat,...DB_L.seedEnd]);
  for(const t of DEBATE.Seeds){add(dbOr(t));add(`I like ${t[1]}.`);add(`I like ${t[3]}.`);add(t[4]);add(t[5]);add(`Why do you like ${t[1]}?`);add(`Why do you like ${t[3]}?`);
    for(const r of t[6])add(dbSeedLine(t,0,r));for(const r of t[7])add(dbSeedLine(t,1,r));}
  return [...new Set(o)];}
/* ================= app ================= */
const dbMotionTxt=m=>m.replace(/\.$/,"");
/* ---------- Pip's voice for the debate ----------
   Every fixed sentence plays from Pip's pre-recorded voice library (pv/, made with tr/debate_voice.py).
   The AI's brand-new sentences can't be pre-recorded: making them on the device with Pip's voice model was
   tested and took about 45 seconds per sentence on a desktop (and longer on phones), so they use the device
   voice, set up to match Pip as closely as it can (warm US English voice, Pip's speed). The child's own
   quoted words in scripted replies are not read out, so scripted lines stay fully in Pip's voice. */
const DB_SENT=t=>String(t||"").replace(/\s+/g," ").trim().split(/(?<=[.!?…”])\s+(?=[A-Z“"'])/).filter(x=>pvNorm(x));
let DBQ=0;
function dbDevice(text){return new Promise(res=>{try{if(!canSpeak())return res();const u=new SpeechSynthesisUtterance(text);u.lang="en-IN";u.onend=()=>res();u.onerror=()=>res();speechSynthesis.speak(u);setTimeout(res,Math.min(20000,1500+text.length*90));}catch(e){res();}});}
function dbHush(){DBQ++;try{pipStop();}catch(e){}try{const c=speechSynthesis.__origCancel||speechSynthesis.cancel.bind(speechSynthesis);c();}catch(e){}}
/* say a Pip line sentence by sentence; ai = the whole line is new (read with the device voice) */
async function dbSay(text,ai){dbHush();const my=DBQ;const ss=DB_SENT(text);if(!ss.length)return;
  await Promise.race([pvsP,new Promise(r=>setTimeout(r,1500))]).catch(()=>{});
  const plan=ss.map(s=>{const url=pvAny(pvKey(s));return url?{s,url}:ai?{s}:null;}).filter(Boolean);
  for(const x of plan){if(my!==DBQ)return;let r=false;
    if(x.url)r=await pipAudioPlay(x.url,false);
    if(my!==DBQ||r==="stop")return;if(r!==true)await dbDevice(x.s);}}
/* start */
A.debate=()=>{const L=myLearner();if(!L)return;const st=L.stage||"Seeds";
  if(st==="Seeds"){const ts=shuffle(DEBATE.Seeds.slice()).slice(0,3);S.debate={st,seeds:1,ts,i:0,pick:null,reason:null,heard:"",pts:0};render(true);setTimeout(()=>dbSay(DB_L.seedQ+" "+dbOr(ts[0])),300);return;}
  const order=shuffle(DEBATE[st].map((_,i)=>i));S.debate={st,order,ti:0,side:null,round:0,log:[],draft:"",hits:{},words:0,turns:0,talk:true,nudged:false};render(true);};
const dbTopic=d=>DEBATE[d.st][d.order[d.ti%d.order.length]];
A.dbNext=()=>{const d=S.debate;if(!d)return;d.ti++;render(true);};
A.dbSide=side=>{const d=S.debate;if(!d)return;const t=dbTopic(d);d.side=side;d.pip=(side==="for"?t[2]:t[1]).slice();d.mine=(side==="for"?t[1]:t[2]).slice();d.round=0;
  const op=DB_L.open[d.st]||DB_L.open.Sprouts,open=[...op[side],d.pip[0],op.ask].join(" ");
  d.round=1;dbPip(d,open);render(true);};
function dbPip(d,t,ai){d.log.push({who:"pip",t,ai:!!ai});if(d.talk)dbSay(t,ai);}
A.dbTalk=()=>{const d=S.debate;if(!d)return;d.talk=!d.talk;if(!d.talk)dbHush();render(true);};
A.dbHear=i=>{const d=S.debate;if(!d)return;const x=d.log[+i];if(x)dbSay(x.t,x.ai);};
A.dbStarter=i=>{const d=S.debate;if(!d)return;const s=(DB_STARTERS[d.st]||[])[+i];if(!s)return;const ta=document.getElementById("dbtext");const cur=ta?ta.value:d.draft;
  d.draft=(cur.trim()?cur.trim()+" ":"")+s.replace(/ …$/,"").replace(/…/g,"").trim()+" ";render(true);setTimeout(()=>{const t=document.getElementById("dbtext");if(t){t.focus();t.setSelectionRange(t.value.length,t.value.length);}},50);};
A.dbIdea=()=>{const d=S.debate;if(!d||!d.mine)return;const idea=d.mine[(d.round-1)%d.mine.length];toast("Idea: "+idea);d.ideas=(d.ideas||0)+1;};
A.dbMic=()=>{const d=S.debate;if(!d||!SR||d.listening)return;try{const r=new SR();r.lang="en-IN";r.interimResults=false;r.maxAlternatives=1;d.listening=true;render(true);
  const ta=document.getElementById("dbtext");const base=ta?ta.value:d.draft;
  r.onresult=e=>{const t=[...e.results].map(x=>x[0].transcript).join(" ").trim();if(t)d.draft=(base.trim()?base.trim()+" ":"")+t.charAt(0).toUpperCase()+t.slice(1)+(/[.!?]$/.test(t)?"":".");};
  r.onerror=()=>{};r.onend=()=>{d.listening=false;if(S.debate===d)render(true);};r.start();setTimeout(()=>{try{r.stop()}catch{}},15000);}catch{d.listening=false;render(true);}};
/* Pip's AI reply (Ask Pip's free AI, same child-safety checks). Falls back to the scripted reply. */
let DB_AIOFF=false;
async function dbAI(d,phase){if(DB_AIOFF||!window.LL_sb||!navigator.onLine)return null;
  const messages=d.log.filter(x=>!x.nudge).map(x=>({role:x.who==="pip"?"assistant":"user",content:x.t}));
  try{const call=window.LL_sb.functions.invoke("ask-pip",{body:{mode:"debate",messages,debate:{motion:dbTopic(d)[0],side:d.side,stage:d.st,phase}}});
    const {data,error}=await Promise.race([call,new Promise(r=>setTimeout(()=>r({error:{timeout:1}}),15000))]);
    if(error){const st=error.context&&error.context.status;if(st===503||st===404||error.name==="FunctionsFetchError"||error.name==="FunctionsRelayError")DB_AIOFF=true;return null;}
    return data&&data.reply?{t:String(data.reply).slice(0,700),blocked:!!data.blocked}:null;}catch(e){return null;}}
A.dbSend=async()=>{const d=S.debate;if(!d||d.done||d.busy)return;const ta=document.getElementById("dbtext");const txt=String(ta?ta.value:d.draft).trim();
  if(dbWords(txt)<3){toast("Say a little more first: try “I think … because …”.",true);return;}
  if(dbWords(txt)<5&&!d.nudged){d.nudged=true;d.draft=txt;d.log.push({who:"pip",t:[...DB_L.nudge,d.st==="Blooms"?DB_L.nudgeB:DB_L.nudgeS].join(" "),nudge:1});if(d.talk)dbSay(d.log[d.log.length-1].t);render(true);return;}
  d.nudged=false;d.log.push({who:"me",t:txt});d.draft="";
  const phase=d.closing?"final":d.round>=DB_ROUNDS?"closing":"rebut";
  d.busy=true;render(true);const ai=await dbAI(d,phase);d.busy=false;if(S.debate!==d)return;
  if(ai&&ai.blocked){d.log[d.log.length-1].off=1;dbPip(d,ai.t);render(true);return;}
  d.turns++;d.words+=dbWords(txt);for(const k of dbScore(txt,d.st))d.hits[k]=(d.hits[k]||0)+1;if(ai)d.ai=(d.ai||0)+1;
  if(phase==="final"){dbFinish(d,ai&&ai.t);return;}
  if(phase==="closing"){d.closing=true;dbPip(d,ai?ai.t:dbPipReply(d,txt,true),!!ai);render(true);return;}
  dbPip(d,ai?ai.t:dbPipReply(d,txt),!!ai);d.round++;render(true);setTimeout(()=>{const c=document.querySelector(".dbinput");if(c)c.scrollIntoView({block:"nearest"});},60);};
function dbFinish(d,verdict){d.done=true;const max=(DB_ROUNDS+1)*6;let pts=0;for(const v of Object.values(d.hits))pts+=v;
  d.pts=pts;d.stars=pts>=max*0.55?3:pts>=max*0.3?2:1;d.verdict=verdict||"";
  dbPip(d,verdict||DB_L.end[d.stars].join(" "),!!verdict);
  const t=dbTopic(d)[0];actLog("debate","Debate: "+t,pts,max);save(()=>earn({pts:{["d"+Date.now().toString(36)]:d.stars}}));render(true);}
A.dbStop=()=>{dbHush();S.debate=null;render(true);};
document.addEventListener("input",e=>{if(e.target&&e.target.id==="dbtext"&&S.debate)S.debate.draft=e.target.value;});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)&&e.target&&e.target.id==="dbtext"){e.preventDefault();A.dbSend();}});
/* Seeds: Pip's choice */
A.dbSeedPick=side=>{const d=S.debate;if(!d||!d.seeds)return;const t=d.ts[d.i];d.pick=+side;d.reason=null;d.heard="";
  const other=d.pick?t[1]:t[3],pipWhy=d.pick?t[4]:t[5];render(true);setTimeout(()=>dbSay(`I like ${other}. ${pipWhy} Why do you like ${d.pick?t[3]:t[1]}?`),250);};
A.dbSeedWhy=i=>{const d=S.debate;if(!d||d.pick==null)return;const t=d.ts[d.i],rs=d.pick?t[7]:t[6];d.reason=rs[+i];render(true);setTimeout(()=>dbSay(dbSeedLine(t,d.pick,d.reason)+" "+DB_L.seedNow),200);};
A.dbSeedSay=()=>{const d=S.debate;if(!d||!d.reason)return;dbSay(dbSeedLine(d.ts[d.i],d.pick,d.reason));};
A.dbSeedMic=()=>{const d=S.debate;if(!d||!SR||d.listening)return;try{const r=new SR();r.lang="en-IN";r.maxAlternatives=1;d.listening=true;render(true);
  r.onresult=e=>{d.heard=e.results[0][0].transcript||"";};r.onerror=()=>{};r.onend=()=>{d.listening=false;if(d.heard)d.pts++;if(S.debate===d)render(true);if(d.heard)dbSay(DB_L.seedGreat);};r.start();setTimeout(()=>{try{r.stop()}catch{}},7000);}catch{d.listening=false;}};
A.dbSeedNext=()=>{const d=S.debate;if(!d||!d.reason)return;d.pts++;d.i++;d.pick=null;d.reason=null;d.heard="";
  if(d.i>=d.ts.length){d.done=true;d.stars=3;actLog("debate","Pip's choice",d.pts,d.ts.length*2);save(()=>earn({pts:{["d"+Date.now().toString(36)]:3}}));render(true);setTimeout(()=>dbSay(DB_L.seedEnd.join(" ")),250);return;}
  render(true);const t=d.ts[d.i];setTimeout(()=>dbSay(DB_L.seedQ+" "+dbOr(t)),300);};
/* the screens */
function debateSeedsHTML(d){const head=`<div class="head"><div><h1>Pip's choice</h1><p class="lede">Pick one and tell Pip why · ${Math.min(d.i+1,d.ts.length)} of ${d.ts.length}</p></div><button class="btn btn-ghost btn-sm" data-act="dbStop">Stop</button></div>`;
  if(d.done)return `<div class="center"><div class="card" style="align-items:center;text-align:center">${art("bloom",110,"Bloom")}<h1>You've bloomed!</h1><p class="bigstars">⭐⭐⭐</p><p class="lede">You gave Pip ${d.ts.length} great reasons with “because”.</p><div class="row" style="justify-content:center"><button class="btn btn-primary" data-act="debate">Play again</button><button class="btn btn-ghost" data-act="dbStop">More games</button></div></div></div>`;
  const t=d.ts[d.i];
  if(d.pick==null)return head+`<section class="quiz dbseed"><div class="dbpip">${art("pip",64,"Pip")}<p class="bubble static">Which do you like more?</p></div>
    <div class="dbchoose"><button class="dbbig" data-act="dbSeedPick" data-id="0"><span>${t[0]}</span><b>${esc(t[1])}</b></button><span class="dbor">or</span><button class="dbbig" data-act="dbSeedPick" data-id="1"><span>${t[2]}</span><b>${esc(t[3])}</b></button></div></section>`;
  const mine=d.pick?t[3]:t[1],other=d.pick?t[1]:t[3],pipWhy=d.pick?t[4]:t[5],rs=d.pick?t[7]:t[6];
  return head+`<section class="quiz dbseed"><div class="dbpip">${art("pip",64,"Pip")}<p class="bubble static">I like ${esc(other)} ${esc(d.pick?t[0]:t[2])}! ${esc(pipWhy)} Why do you like ${esc(mine)}?</p></div>
    ${!d.reason?`<h2>Why do you like ${esc(mine)} ${d.pick?t[2]:t[0]}?</h2><div class="qopts">${rs.map((r,i)=>`<button class="qopt qlong" data-act="dbSeedWhy" data-id="${i}">${esc(r)}</button>`).join("")}</div>`
    :`<p class="dbline">${esc(dbSeedLine(t,d.pick,d.reason))}</p><div class="row" style="justify-content:center"><button class="btn btn-sun btn-big" data-act="dbSeedSay">${ic("sound",22)}Hear it</button>${SR?`<button class="btn btn-ghost btn-big" data-act="dbSeedMic" ${d.listening?"disabled":""}>🎤 ${d.listening?"Listening…":"Say it"}</button>`:""}</div>
      ${d.heard?`<p class="small" style="text-align:center">Pip heard: “${esc(d.heard)}” 🌟</p>`:""}<button class="btn btn-primary btn-big" data-act="dbSeedNext" style="align-self:center">${d.i+1<d.ts.length?"Next":"Finish"}</button>`}</section>`;}
function debateHTML(){const d=S.debate;if(d.seeds)return debateSeedsHTML(d);const t=dbTopic(d),st=d.st;
  const head=`<div class="head"><div><h1>Debate with Pip</h1><p class="lede">${d.side?(d.done?"Debate over":d.closing?"Closing statement":`Round ${d.round} of ${DB_ROUNDS}`)+` · You are ${d.side==="for"?"for":"against"} the motion`:"Pick a side. Pip will argue the other side."}</p></div>
    <div class="row">${d.side?`<button class="btn btn-ghost btn-sm" data-act="dbTalk" aria-pressed="${d.talk}">${ic("sound",18)}${d.talk?"Pip talks: on":"Pip talks: off"}</button>`:""}<button class="btn btn-ghost btn-sm" data-act="dbStop">Stop</button></div></div>`;
  if(!d.side)return head+`<section class="quiz dbmotion"><span class="pill p-mute">The motion</span><h2>“${esc(dbMotionTxt(t[0]))}”</h2>
    <p class="small">${st==="Blooms"?"Choose your side. You'll give an opening argument, answer Pip's points, then make a closing statement.":"Do you agree? Choose your side, then tell Pip your reasons."}</p>
    <div class="dbsides"><button class="btn btn-primary btn-big" data-act="dbSide" data-id="for">👍 I agree</button><button class="btn btn-sun btn-big" data-act="dbSide" data-id="against">👎 I disagree</button></div>
    <button class="btn btn-ghost btn-sm" data-act="dbNext" style="align-self:center">${ic("refresh",18)}Another topic</button></section>`;
  const chat=`<div class="dbchat" aria-live="polite">${d.log.map((x,i)=>x.who==="pip"?`<div class="dbmsg pip">${art("pip",40,"Pip")}<p>${esc(x.t)} <button class="iconbtn dbhear" data-act="dbHear" data-id="${i}" aria-label="Hear Pip">${ic("sound",18)}</button></p></div>`:`<div class="dbmsg me"><p>${esc(x.t)}</p></div>`).join("")}${d.busy?`<div class="dbmsg pip">${art("pip",40,"Pip")}<p class="dbtyping" role="status">Pip is thinking about your argument<i>.</i><i>.</i><i>.</i></p></div>`:""}</div>`;
  if(d.done){const max=(DB_ROUNDS+1)*6,rows=[...DB_CHECKS.map(([k,l])=>[k,l]),["long","Said enough each time"]];
    const miss=rows.filter(([k])=>!d.hits[k]).map(([k])=>DB_TIP[k]).slice(0,3);
    return head+`<div class="card dbres" style="align-items:center;text-align:center">${art("bloom",96,"Bloom")}<h2>${d.stars===3?"Debate champion!":d.stars===2?"Strong debater!":"Brave debater!"}</h2><p class="bigstars">${"⭐".repeat(d.stars)}${"☆".repeat(3-d.stars)}</p>
      ${d.verdict?`<div class="dbverdict">${art("pip",40,"Pip")}<p><b>Pip's verdict:</b> ${esc(d.verdict)}</p></div>`:""}<p class="lede">${d.pts} of ${max} debate points · ${d.words} words in ${d.turns} turns</p>
      <ul class="dbchecks">${rows.map(([k,l])=>`<li class="${d.hits[k]?"ok":""}">${d.hits[k]?"✅":"⬜"} ${esc(l)}${d.hits[k]?` <span class="small muted">×${d.hits[k]}</span>`:""}</li>`).join("")}</ul>
      ${miss.length?`<div class="dbtips"><b>Next time</b><ul>${miss.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`:""}
      <div class="row" style="justify-content:center"><button class="btn btn-primary" data-act="debate">New debate</button><button class="btn btn-ghost" data-act="dbStop">More games</button></div></div>
      <details class="dbtrans"><summary>Read the whole debate</summary>${chat}</details>`;}
  const target=DB_TARGET[st]||10,w=dbWords(d.draft);
  return head+`<p class="dbmot small"><b>Motion:</b> ${esc(dbMotionTxt(t[0]))}</p>${chat}
    <section class="dbinput"><label for="dbtext" class="small"><b>${d.closing?"Your closing statement":"Your turn"}</b> <span class="muted">(aim for ${target}+ words${SR?", type or tap 🎤 to speak":""})</span></label>
      <div class="dbstarters" role="group" aria-label="Sentence starters">${(DB_STARTERS[st]||[]).map((s,i)=>`<button type="button" class="chip" data-act="dbStarter" data-id="${i}">${esc(s)}</button>`).join("")}</div>
      <textarea id="dbtext" rows="3" maxlength="600" placeholder="${st==="Blooms"?"Make your argument. Give a reason and an example.":"I think … because …"}">${esc(d.draft)}</textarea>
      <div class="row dbbtns">${SR?`<button type="button" class="btn btn-ghost" data-act="dbMic" ${d.listening?"disabled":""}>🎤 ${d.listening?"Listening…":"Speak"}</button>`:""}<button type="button" class="btn btn-ghost" data-act="dbIdea">💡 Need an idea?</button><button type="button" class="btn btn-primary" data-act="dbSend" ${d.busy?"disabled":""}>${d.closing?"Finish debate":"Send"}</button></div>
      <span class="small muted" id="dbcount">${w} word${w===1?"":"s"}</span></section>`;}
document.addEventListener("input",e=>{if(e.target&&e.target.id==="dbtext"){const c=document.getElementById("dbcount");if(c){const w=dbWords(e.target.value);c.textContent=`${w} word${w===1?"":"s"}`;}}});
/* show it on the Games page */
{const f=VIEWS.play;VIEWS.play=function(){if(S.debate&&myLearner()&&role()==="student")return debateHTML();return f.apply(this,arguments);};}
{const f=A.endGame;A.endGame=()=>{if(S.debate)dbHush();S.debate=null;f();};}
AG_GAMES.Seeds.splice(6,0,["debate","🤔","Pip's choice","Pick one, tell Pip why"]);
AG_GAMES.Sprouts.splice(1,0,["debate","🎤","Debate with Pip","Pick a side and argue!"]);
AG_GAMES.Blooms.splice(1,0,["debate","🎤","Debate with Pip","Argue a motion against Pip"]);
AG_TITLE.debate="Debate with Pip";
if(typeof REP_SKILL!=="undefined")REP_SKILL.debate="speaking";
{const f=agStart;agStart=function(t){if(t==="debate"){A.debate();return true;}return f.apply(this,arguments);};}
