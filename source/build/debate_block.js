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
/* Pip's reply to the child's turn */
function dbPipReply(d,txt,closing){const st=d.st,hit=dbScore(txt,st),q=dbQuote(txt),lc=txt.toLowerCase(),next=d.pip[d.round%d.pip.length]||"";
  if(!closing&&/\b(you'?re right|you are right|i agree with you|i changed my mind)\b/.test(lc))
    return `Ooh, you agree with me? Good debaters can change their mind! But let's keep going. ${next} Can you find a point for your side?`;
  const ack=st==="Blooms"
    ?dbPick([`You argue that “${q}”. That's a fair point.`,`I hear you: “${q}”.`,`Interesting: “${q}”.`])
    :dbPick([`You said “${q}”. Good point!`,`Hmm, “${q}”. I see what you mean.`,`Ooh, “${q}”. Nice one!`]);
  const praise=hit.includes("example")?(st==="Blooms"?" Your example makes it stronger.":" I like your example!"):hit.includes("reason")?(st==="Blooms"?" You backed it up with a reason.":" You gave a reason. Well done!"):"";
  const turn=st==="Blooms"?dbPick(["But consider this:","However,","On the other hand,"]):dbPick(["But I still think","But listen:","Here's my next point:"]);
  if(closing)return `${ack}${praise} You argued really well! Now give your closing statement: why should everyone agree with you?`;
  const ask=!hit.includes("example")?(st==="Blooms"?"Can you give me a real example?":"Can you give me an example?"):!hit.includes("reason")?"Why do you think that?":st==="Blooms"?"How would you answer that?":"What do you say to that?";
  return `${ack}${praise} ${turn} ${/(think|,)$/.test(turn)&&/^[A-Z][a-z]/.test(next)?next.charAt(0).toLowerCase()+next.slice(1):next} ${ask}`;}
const dbMotionTxt=m=>m.replace(/\.$/,"");
/* start */
A.debate=()=>{const L=myLearner();if(!L)return;const st=L.stage||"Seeds";
  if(st==="Seeds"){const ts=shuffle(DEBATE.Seeds.slice()).slice(0,3);S.debate={st,seeds:1,ts,i:0,pick:null,reason:null,heard:"",pts:0};render(true);setTimeout(()=>say("Which do you like more? "+ts[0][1]+" or "+ts[0][3]+"?"),300);return;}
  const order=shuffle(DEBATE[st].map((_,i)=>i));S.debate={st,order,ti:0,side:null,round:0,log:[],draft:"",hits:{},words:0,turns:0,talk:canSpeak(),nudged:false};render(true);};
const dbTopic=d=>DEBATE[d.st][d.order[d.ti%d.order.length]];
A.dbNext=()=>{const d=S.debate;if(!d)return;d.ti++;render(true);};
A.dbSide=side=>{const d=S.debate;if(!d)return;const t=dbTopic(d);d.side=side;d.pip=(side==="for"?t[2]:t[1]).slice();d.mine=(side==="for"?t[1]:t[2]).slice();d.round=0;
  const open=d.st==="Blooms"?`I'll argue ${side==="for"?"against":"for"} the motion. ${d.pip[0]} What's your opening argument?`:`I ${side==="for"?"don't agree":"agree"}! ${d.pip[0]} What do you think?`;
  d.round=1;dbPip(d,open);render(true);};
function dbPip(d,t){d.log.push({who:"pip",t});if(d.talk)setTimeout(()=>say(t),250);}
A.dbTalk=()=>{const d=S.debate;if(!d)return;d.talk=!d.talk;if(!d.talk)try{speechSynthesis.cancel()}catch{}render(true);};
A.dbHear=i=>{const d=S.debate;if(!d)return;const x=d.log[+i];if(x)say(x.t);};
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
  if(dbWords(txt)<5&&!d.nudged){d.nudged=true;d.draft=txt;d.log.push({who:"pip",t:`Tell me a bit more! ${d.st==="Blooms"?"Give a reason and an example.":"Try adding “because…”."}`,nudge:1});if(d.talk)say(d.log[d.log.length-1].t);render(true);return;}
  d.nudged=false;d.log.push({who:"me",t:txt});d.draft="";
  const phase=d.closing?"final":d.round>=DB_ROUNDS?"closing":"rebut";
  d.busy=true;render(true);const ai=await dbAI(d,phase);d.busy=false;if(S.debate!==d)return;
  if(ai&&ai.blocked){d.log[d.log.length-1].off=1;dbPip(d,ai.t);render(true);return;}
  d.turns++;d.words+=dbWords(txt);for(const k of dbScore(txt,d.st))d.hits[k]=(d.hits[k]||0)+1;if(ai)d.ai=(d.ai||0)+1;
  if(phase==="final"){dbFinish(d,ai&&ai.t);return;}
  if(phase==="closing"){d.closing=true;dbPip(d,ai?ai.t:dbPipReply(d,txt,true));render(true);return;}
  dbPip(d,ai?ai.t:dbPipReply(d,txt));d.round++;render(true);setTimeout(()=>{const c=document.querySelector(".dbinput");if(c)c.scrollIntoView({block:"nearest"});},60);};
function dbFinish(d,verdict){d.done=true;const max=(DB_ROUNDS+1)*6;let pts=0;for(const v of Object.values(d.hits))pts+=v;
  d.pts=pts;d.stars=pts>=max*0.55?3:pts>=max*0.3?2:1;d.verdict=verdict||"";
  dbPip(d,verdict||(d.stars===3?"Wow, what a debate! You argued like a champion. I think the audience is on your side!":d.stars===2?"Great debate! You made some strong points. Next time, add even more reasons and examples.":"Well done for debating with me! Every debate makes you a stronger speaker."));
  const t=dbTopic(d)[0];actLog("debate","Debate: "+t,pts,max);save(()=>earn({pts:{["d"+Date.now().toString(36)]:d.stars}}));render(true);}
A.dbStop=()=>{try{speechSynthesis.cancel()}catch{}S.debate=null;render(true);};
document.addEventListener("input",e=>{if(e.target&&e.target.id==="dbtext"&&S.debate)S.debate.draft=e.target.value;});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)&&e.target&&e.target.id==="dbtext"){e.preventDefault();A.dbSend();}});
/* Seeds: Pip's choice */
A.dbSeedPick=side=>{const d=S.debate;if(!d||!d.seeds)return;const t=d.ts[d.i];d.pick=+side;d.reason=null;d.heard="";
  const other=d.pick?t[1]:t[3],pipWhy=d.pick?t[4]:t[5];render(true);setTimeout(()=>say(`I like ${other}. ${pipWhy} Why do you like ${d.pick?t[3]:t[1]}?`),250);};
const dbSeedLine=(t,pick,r)=>`I like ${pick?t[3]:t[1]} because ${/^I /.test(r)?r:r.charAt(0).toLowerCase()+r.slice(1)}.`;
A.dbSeedWhy=i=>{const d=S.debate;if(!d||d.pick==null)return;const t=d.ts[d.i],rs=d.pick?t[7]:t[6];d.reason=rs[+i];render(true);setTimeout(()=>say(dbSeedLine(t,d.pick,d.reason)+" Now you say it!"),200);};
A.dbSeedSay=()=>{const d=S.debate;if(!d||!d.reason)return;say(dbSeedLine(d.ts[d.i],d.pick,d.reason));};
A.dbSeedMic=()=>{const d=S.debate;if(!d||!SR||d.listening)return;try{const r=new SR();r.lang="en-IN";r.maxAlternatives=1;d.listening=true;render(true);
  r.onresult=e=>{d.heard=e.results[0][0].transcript||"";};r.onerror=()=>{};r.onend=()=>{d.listening=false;if(d.heard)d.pts++;if(S.debate===d)render(true);if(d.heard)say("Great reason!");};r.start();setTimeout(()=>{try{r.stop()}catch{}},7000);}catch{d.listening=false;}};
A.dbSeedNext=()=>{const d=S.debate;if(!d||!d.reason)return;d.pts++;d.i++;d.pick=null;d.reason=null;d.heard="";
  if(d.i>=d.ts.length){d.done=true;d.stars=3;actLog("debate","Pip's choice",d.pts,d.ts.length*2);save(()=>earn({pts:{["d"+Date.now().toString(36)]:3}}));render(true);setTimeout(()=>say("You've bloomed! You gave great reasons."),250);return;}
  render(true);const t=d.ts[d.i];setTimeout(()=>say("Which do you like more? "+t[1]+" or "+t[3]+"?"),300);};
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
    <div class="row">${canSpeak()&&d.side?`<button class="btn btn-ghost btn-sm" data-act="dbTalk" aria-pressed="${d.talk}">${ic("sound",18)}${d.talk?"Pip talks: on":"Pip talks: off"}</button>`:""}<button class="btn btn-ghost btn-sm" data-act="dbStop">Stop</button></div></div>`;
  if(!d.side)return head+`<section class="quiz dbmotion"><span class="pill p-mute">The motion</span><h2>“${esc(dbMotionTxt(t[0]))}”</h2>
    <p class="small">${st==="Blooms"?"Choose your side. You'll give an opening argument, answer Pip's points, then make a closing statement.":"Do you agree? Choose your side, then tell Pip your reasons."}</p>
    <div class="dbsides"><button class="btn btn-primary btn-big" data-act="dbSide" data-id="for">👍 I agree</button><button class="btn btn-sun btn-big" data-act="dbSide" data-id="against">👎 I disagree</button></div>
    <button class="btn btn-ghost btn-sm" data-act="dbNext" style="align-self:center">${ic("refresh",18)}Another topic</button></section>`;
  const chat=`<div class="dbchat" aria-live="polite">${d.log.map((x,i)=>x.who==="pip"?`<div class="dbmsg pip">${art("pip",40,"Pip")}<p>${esc(x.t)}${canSpeak()?` <button class="iconbtn dbhear" data-act="dbHear" data-id="${i}" aria-label="Hear Pip">${ic("sound",18)}</button>`:""}</p></div>`:`<div class="dbmsg me"><p>${esc(x.t)}</p></div>`).join("")}${d.busy?`<div class="dbmsg pip">${art("pip",40,"Pip")}<p class="dbtyping" role="status">Pip is thinking about your argument<i>.</i><i>.</i><i>.</i></p></div>`:""}</div>`;
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
{const f=A.endGame;A.endGame=()=>{S.debate=null;f();};}
AG_GAMES.Seeds.splice(6,0,["debate","🤔","Pip's choice","Pick one, tell Pip why"]);
AG_GAMES.Sprouts.splice(1,0,["debate","🎤","Debate with Pip","Pick a side and argue!"]);
AG_GAMES.Blooms.splice(1,0,["debate","🎤","Debate with Pip","Argue a motion against Pip"]);
AG_TITLE.debate="Debate with Pip";
if(typeof REP_SKILL!=="undefined")REP_SKILL.debate="speaking";
{const f=agStart;agStart=function(t){if(t==="debate"){A.debate();return true;}return f.apply(this,arguments);};}
