/* ================= Pip's feedback report (Debate with Pip, Pip's choice) =================
   At the end of a debate Pip writes a report: what went well, what to work on and why, a stronger version of each
   turn, and one goal. Pip's AI reads exactly what the child wrote (ask-pip, debate phase "report"); without AI the
   report is built from the debate checks. The last few reports are kept on the child's progress so they can reread them. */
const DBR_KEEP=5;
const DBR_GOOD={opinion:"You said clearly which side you are on.",reason:"You gave reasons with “because”.",example:"You used examples to back up your points.",
  answer:"You answered Pip's points instead of ignoring them.",linked:"You joined your ideas together with linking words.",long:"You said plenty in each turn."};
const DBR_WHY={opinion:"When people know your side from the first words, they follow your argument more easily.",reason:"A reason shows people WHY, and that is what changes their mind.",
  example:"An example makes your idea real, so it is harder to argue against.",answer:"In a debate you win points by showing why the other side's idea doesn't work.",
  linked:"Linking words like “Firstly” and “Also” make your argument easy to follow.",long:"Two or three sentences give you room for a point, a reason and an example."};
const DBR_TRY={opinion:"I think … because …",reason:"I think this is true because …",example:"For example, …",answer:"I see your point, but …",linked:"Firstly, … Also, … Finally, …",long:"I think … because … For example, …"};
const dbrTurns=d=>d.log.filter(x=>x.who==="me"&&!x.off).map(x=>x.t);
const dbrLabel=(i,n)=>i===0?"Opening":i===n-1?"Closing statement":"Round "+(i+1);
const dbrS=(v,n)=>String(v==null?"":v).replace(/\s+/g," ").trim().slice(0,n||300);
/* the report from the debate checks alone (also fills any gap in Pip's AI report) */
function dbrBasic(d){const ts=dbrTurns(d),keys=["opinion","reason","example","answer","linked","long"];
  const strengths=keys.filter(k=>d.hits[k]).sort((a,b)=>(d.hits[b]||0)-(d.hits[a]||0)).slice(0,3).map(k=>DBR_GOOD[k]);
  if(!strengths.length)strengths.push("You were brave and argued with Pip all the way to the end.");
  const miss=keys.filter(k=>!d.hits[k]).concat(keys.filter(k=>d.hits[k]===1));
  const improve=[...new Set(miss)].slice(0,3).map(k=>({point:DB_TIP[k],why:DBR_WHY[k],try:DBR_TRY[k]}));
  const turns=ts.map((t,i)=>{const h=dbScore(t,d.st),order=i===0?["opinion","reason","example","long","linked"]:["answer","reason","example","long","linked","opinion"];
    const m=order.find(k=>!h.includes(k));return {n:i+1,good:h.length?DBR_GOOD[h[0]]:"You kept going and gave Pip an answer.",fix:m?DB_TIP[m]:"Great turn! Keep doing this.",better:""};});
  const top=improve[0];
  return {overall:d.stars===3?"You argued really well, with clear reasons. Keep it up!":d.stars===2?"You made some strong points. A few small changes will make you even stronger.":"Well done for debating with Pip! Use the tips below to make your next debate stronger.",
    strengths,improve,turns,goal:top?"Next debate, try this in every turn: "+top.point:"Next debate, try a harder topic!"};}
function dbrClean(r,d){const b=dbrBasic(d);if(!r||typeof r!=="object")return null;const n=dbrTurns(d).length;
  const arr=(a,m)=>Array.isArray(a)?a.slice(0,m):[];
  const out={ai:1,overall:dbrS(r.overall,400)||b.overall,strengths:arr(r.strengths,3).map(x=>dbrS(x,220)).filter(Boolean),
    improve:arr(r.improve,3).map(x=>x&&typeof x==="object"?{point:dbrS(x.point,120),why:dbrS(x.why,220),try:dbrS(x.try,220)}:{point:dbrS(x,160),why:"",try:""}).filter(x=>x.point),
    turns:[],goal:dbrS(r.goal,200)||b.goal};
  const rt=arr(r.turns,8);for(let i=0;i<n;i++){const x=rt.find(y=>y&&+y.n===i+1)||rt[i]||{},f=b.turns[i];out.turns.push({n:i+1,good:dbrS(x.good,220)||f.good,fix:dbrS(x.fix,260)||f.fix,better:dbrS(x.better,320)});}
  if(!out.strengths.length)out.strengths=b.strengths;if(!out.improve.length)out.improve=b.improve;return out;}
let DBR_AIOFF=false;
async function dbrAI(d){if(DB_AIOFF||DBR_AIOFF||!window.LL_sb||!navigator.onLine)return null;
  const messages=d.log.filter(x=>!x.nudge&&!x.off).map(x=>({role:x.who==="pip"?"assistant":"user",content:x.t}));
  try{const call=window.LL_sb.functions.invoke("ask-pip",{body:{mode:"debate",messages,debate:{motion:dbTopic(d)[0],side:d.side,stage:d.st,phase:"report"}}});
    const {data,error}=await Promise.race([call,new Promise(r=>setTimeout(()=>r({error:{timeout:1}}),30000))]);
    if(error){const st=error.context&&error.context.status;if(st===503||st===404)DBR_AIOFF=true;return null;}
    return data&&data.report?dbrClean(data.report,d):null;}catch(e){return null;}}
/* keep the last few reports on the child's progress */
function dbrSave(rec){try{if(!actCanLog()||realRole()!=="student")return;const id="r"+Date.now().toString(36);const p=D.progress[S.uid]=D.progress[S.uid]||{};
  const old=Object.entries(p.dbr||{}).filter(([,x])=>x).sort((a,b)=>b[1].at-a[1].at),upd={[id]:rec};for(const [k] of old.slice(DBR_KEEP-1))upd[k]=null;
  p.dbr={...(p.dbr||{}),...upd};for(const [k,x] of Object.entries(p.dbr))if(x==null)delete p.dbr[k];
  upsert("progress/"+S.uid,{dbr:upd}).catch(()=>{});rec.id=id;}catch(e){}}
const dbrList=uid=>Object.entries((D.progress[uid]||{}).dbr||{}).filter(([,x])=>x&&x.at).map(([id,x])=>({...x,id})).sort((a,b)=>b.at-a.at);
async function dbrMake(d){const turns=dbrTurns(d);d.rep={...dbrBasic(d),loading:1};render(true);
  const ai=await dbrAI(d);if(S.debate!==d)return;d.rep=ai||dbrBasic(d);
  d.saved={at:Date.now(),kind:"debate",st:d.st,motion:dbTopic(d)[0],side:d.side,stars:d.stars,pts:d.pts,max:(DB_ROUNDS+1)*6,words:d.words,
    hits:d.hits,verdict:dbrS(d.verdict,500),turns:turns.map(t=>dbrS(t,600)),rep:d.rep};dbrSave(d.saved);render(true);}
{const f=dbFinish;dbFinish=function(d,verdict){f(d,verdict);dbrMake(d);};}
/* Seeds: keep a note of every round for the report */
{const f=A.dbSeedNext;A.dbSeedNext=()=>{const d=S.debate;if(d&&d.seeds&&d.reason){const t=d.ts[d.i];(d.recs=d.recs||[]).push({e:d.pick?t[2]:t[0],mine:d.pick?t[3]:t[1],reason:d.reason,line:dbSeedLine(t,d.pick,d.reason),heard:dbrS(d.heard,200)});}
  f();if(S.debate&&S.debate.done&&S.debate.seeds&&!S.debate.saved){const x=S.debate;x.saved={at:Date.now(),kind:"seeds",st:"Seeds",recs:x.recs||[],stars:3};dbrSave(x.saved);render(true);}};}
function dbrSeedsFeedback(recs){const said=recs.filter(r=>r.heard),because=said.filter(r=>/\bbecause\b/i.test(r.heard)),full=said.filter(r=>dbWords(r.heard)>=5);
  const good=[`You picked ${recs.length} things and told Pip why you like them.`];
  if(said.length)good.push(`You said ${said.length===recs.length?"every":said.length} sentence${said.length===1?"":"s"} out loud. Brave speaking!`);
  if(because.length)good.push("You used the magic word “because”.");
  const work=[];
  if(!said.length)work.push({point:"Say it out loud",why:"Speaking is how we get good at English.",try:SR?"Tap 🎤 Say it, then say the whole sentence.":"Read your sentence out loud to a grown-up."});
  else if(said.length<recs.length)work.push({point:"Say every sentence out loud",why:"The more you speak, the easier it gets.",try:"Tap 🎤 Say it each time."});
  if(said.length&&because.length<said.length)work.push({point:"Remember “because”",why:"“Because” tells Pip your reason.",try:"I like … because …"});
  if(said.length&&full.length<said.length)work.push({point:"Say the whole sentence",why:"A whole sentence is easy to understand.",try:recs[0]?recs[0].line:"I like … because …"});
  work.push({point:"Think of your own reason",why:"Your own ideas are the best ideas!",try:"Tell a grown-up one more reason why you like it."});
  return {good,work:work.slice(0,3)};}
/* the report itself (also used to reread a saved report) */
function dbrHTML(r,opts){opts=opts||{};const L=myLearner(),name=L&&!L.preview?L.name:"",when=fmtDay(new Date(r.at||Date.now()));
  const actions=`<div class="row dbr-acts noprint">${opts.live?`<button class="btn btn-primary" data-act="debate">${r.kind==="seeds"?"Play again":"New debate"}</button>`:""}<button class="btn btn-ghost" data-act="dbrPrint">${ic("doc",18)}Print or save as PDF</button>${opts.live?`<button class="btn btn-ghost" data-act="dbStop">More games</button>`:`<button class="btn btn-ghost" data-act="dbrClose">Back</button>`}</div>`;
  const top=(title,sub)=>`<header class="dbr-top">${art("pip",64,"Pip")}<div><span class="dbr-k">Pip's feedback report</span><h2>${esc(title)}</h2><p class="small">${esc([name,when,sub].filter(Boolean).join(" · "))}</p></div><p class="bigstars" aria-label="${r.stars} stars">${"⭐".repeat(r.stars||0)}${"☆".repeat(3-(r.stars||0))}</p></header>`;
  if(r.kind==="seeds"){const fb=dbrSeedsFeedback(r.recs||[]);
    return `<article class="card dbreport">${top("Pip's choice","Seeds")}
      <section class="dbr-sec dbr-good"><h3>🌟 What you did well</h3><ul>${fb.good.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>
      <section class="dbr-sec dbr-work"><h3>🌱 Let's grow</h3>${fb.work.map(x=>`<div class="dbr-tip"><b>${esc(x.point)}</b><span>${esc(x.why)}</span><span class="dbr-try">Try: “${esc(x.try)}”</span></div>`).join("")}</section>
      <section class="dbr-sec"><h3>Your choices</h3><ol class="dbr-turns">${(r.recs||[]).map(x=>`<li><p class="dbr-said"><span class="dbr-e">${x.e}</span> ${esc(x.line)}</p><p class="small">${x.heard?`🎤 You said: “${esc(x.heard)}”${/\bbecause\b/i.test(x.heard)?" ✅":""}`:"🎤 Not said out loud yet"}</p></li>`).join("")}</ol></section>${actions}</article>`;}
  const rep=r.rep||{},n=(r.turns||[]).length,rows=[...DB_CHECKS.map(([k,l])=>[k,l]),["long","Said enough each time"]];
  return `<article class="card dbreport">${top(dbMotionTxt(r.motion||""),`${r.st} · you argued ${r.side==="against"?"against":"for"} the motion`)}
    ${rep.loading?`<p class="dbr-wait" role="status">${art("pip",28,"Pip")} Pip is reading your debate and writing your report<i>.</i><i>.</i><i>.</i></p>`:""}
    ${rep.overall?`<p class="dbr-overall">${esc(rep.overall)}</p>`:""}
    <div class="dbr-score"><span><b>${r.pts}</b> of ${r.max} debate points</span><span><b>${r.words}</b> words</span><span><b>${n}</b> turns</span></div>
    <ul class="dbchecks">${rows.map(([k,l])=>`<li class="${(r.hits||{})[k]?"ok":""}">${(r.hits||{})[k]?"✅":"⬜"} ${esc(l)}${(r.hits||{})[k]?` <span class="small muted">×${r.hits[k]}</span>`:""}</li>`).join("")}</ul>
    <section class="dbr-sec dbr-good"><h3>🌟 What you did well</h3><ul>${(rep.strengths||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>
    <section class="dbr-sec dbr-work"><h3>🌱 What to work on</h3>${(rep.improve||[]).map(x=>`<div class="dbr-tip"><b>${esc(x.point)}</b>${x.why?`<span>${esc(x.why)}</span>`:""}${x.try?`<span class="dbr-try">Try: “${esc(x.try.replace(/^[“"]|[”"]$/g,""))}”</span>`:""}</div>`).join("")}</section>
    <section class="dbr-sec"><h3>Turn by turn</h3><ol class="dbr-turns">${(r.turns||[]).map((t,i)=>{const x=(rep.turns||[])[i]||{};return `<li><span class="pill p-mute">${dbrLabel(i,n)}</span>
      <p class="dbr-said">You said: “${esc(t)}”</p>${x.good?`<p class="dbr-ok">👍 ${esc(x.good)}</p>`:""}${x.fix?`<p class="dbr-fix">✏️ ${esc(x.fix)}</p>`:""}${x.better?`<p class="dbr-better"><b>A stronger way to say it:</b> “${esc(x.better.replace(/^[“"]|[”"]$/g,""))}”</p>`:""}</li>`;}).join("")}</ol></section>
    ${r.verdict?`<div class="dbverdict">${art("pip",40,"Pip")}<p><b>Pip's verdict:</b> ${esc(r.verdict)}</p></div>`:""}
    ${rep.goal?`<p class="dbr-goal">🎯 <b>Your goal for next time:</b> ${esc(rep.goal)}</p>`:""}
    ${rep.ai?"":rep.loading?"":`<p class="small muted">Pip made this report from your debate checks.</p>`}${actions}</article>`;}
A.dbrPrint=()=>{const el=document.querySelector(".dbreport");if(!el)return;const tr=document.querySelector(".dbtrans");if(tr)tr.open=true;el.classList.add("printdoc");
  const old=document.title;document.title="Pip's feedback report";setTimeout(()=>{try{window.print()}catch{toast("Printing isn't available here.",true)}document.title=old;setTimeout(()=>el.classList.remove("printdoc"),500);},50);};
A.dbrOpen=id=>{const L=(typeof lpvKid==="function"&&lpvKid())||myLearner();if(!L)return;const r=dbrList(L.uid).find(x=>x.id===id);if(!r)return;S.dbrView=r;render(true);window.scrollTo({top:0});};
A.dbrClose=()=>{S.dbrView=null;render(true);};
function dbrPast(){const L=myLearner();if(!L||L.preview)return "";const rs=dbrList(L.uid);if(!rs.length)return "";
  return `<section class="dbr-past"><h3>📋 My reports from Pip</h3><ul>${rs.map(r=>`<li><button class="btn btn-ghost btn-sm" data-act="dbrOpen" data-id="${esc(r.id)}">${r.kind==="seeds"?"Pip's choice":esc(dbMotionTxt(r.motion||"Debate"))} · ${esc(fmtDay(new Date(r.at)))} · ${"⭐".repeat(r.stars||0)}</button></li>`).join("")}</ul></section>`;}
/* the end screens become the report; the start screens list past reports */
{const f=debateSeedsHTML;debateSeedsHTML=function(d){if(d.done){const r=d.saved||{at:Date.now(),kind:"seeds",recs:d.recs||[],stars:3};
    return `<div class="dbr-wrap"><div class="dbr-cheer">${art("bloom",90,"Bloom")}<h1>You've bloomed!</h1><p class="lede">You gave Pip ${d.ts.length} great reasons with “because”.</p></div>${dbrHTML(r,{live:1})}</div>`;}
  const h=f.apply(this,arguments);return d.i===0&&d.pick==null?h+dbrPast():h;};}
{const f=debateHTML;debateHTML=function(){const d=S.debate;if(!d||d.seeds||!d.done||!d.rep){const h=f.apply(this,arguments);return d&&!d.seeds&&!d.side?h+dbrPast():h;}
  const r=d.saved||{at:Date.now(),kind:"debate",st:d.st,motion:dbTopic(d)[0],side:d.side,stars:d.stars,pts:d.pts,max:(DB_ROUNDS+1)*6,words:d.words,hits:d.hits,verdict:d.verdict,turns:dbrTurns(d),rep:d.rep};
  const chat=`<div class="dbchat">${d.log.map(x=>x.who==="pip"?`<div class="dbmsg pip">${art("pip",40,"Pip")}<p>${esc(x.t)}</p></div>`:`<div class="dbmsg me"><p>${esc(x.t)}</p></div>`).join("")}</div>`;
  return `<div class="head"><div><h1>Debate with Pip</h1><p class="lede">Debate over · ${d.stars===3?"Debate champion!":d.stars===2?"Strong debater!":"Brave debater!"}</p></div><button class="btn btn-ghost btn-sm" data-act="dbStop">Stop</button></div>
    ${dbrHTML(r,{live:1})}<details class="dbtrans"><summary>Read the whole debate</summary>${chat}</details>`;};}
/* rereading a saved report from the Games page */
{const f=VIEWS.play;VIEWS.play=function(){if(S.dbrView&&role()==="student")return `<div class="head"><div><h1>My report from Pip</h1></div></div>`+dbrHTML(S.dbrView);return f.apply(this,arguments);};}
{const f=A.dbStop;A.dbStop=()=>{S.dbrView=null;f();};}
{const f=A.debate;A.debate=()=>{S.dbrView=null;f();};}
{const f=A.endGame;A.endGame=()=>{S.dbrView=null;f();};}
