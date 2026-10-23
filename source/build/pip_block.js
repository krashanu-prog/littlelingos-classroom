/* ================= Ask Pip: helper on every dashboard (updates, mood check-in, AI chat) ================= */
const PIPM=[["great","Great",-8],["happy","Happy",-5],["okay","Okay",0],["tired","Tired",3],["sad","Sad or worried",7]];
const PIPMCOL={great:"#FFC94A",happy:"#A6DB5C",okay:"#BFE3FA",tired:"#F7A8C4",sad:"#4BA3E3"};
function moodFace(m,size){const f=PIPM.find(x=>x[0]===m)||PIPM[2],c=f[2];
  return `<svg viewBox="0 0 40 40" width="${size||34}" height="${size||34}" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="${PIPMCOL[f[0]]}"/>${m==="tired"?`<path d="M11 17h6M23 17h6" stroke="#2E2219" stroke-width="2.5" stroke-linecap="round"/>`:`<circle cx="14" cy="16" r="2.4" fill="#2E2219"/><circle cx="26" cy="16" r="2.4" fill="#2E2219"/>`}<path d="M12 ${26+c/3} Q20 ${26-c} 28 ${26+c/3}" fill="none" stroke="#2E2219" stroke-width="2.5" stroke-linecap="round"/></svg>`;}
const PIPST={open:false,tab:"updates",chat:[],busy:false,off:false,log:null};
const pipRole=()=>{const r=role();return r==="student"?"learner":r==="teacher"?"trainer":r||"";};
const todayKey=()=>ymd(new Date());
function moodOf(uid,day){const p=D.progress[uid];const m=p&&p.moods&&p.moods[day||todayKey()];return m&&m.m||"";}
function pipTry(f){try{return f()}catch(e){return null}}
function pipUpdates(){
  const r=pipRole(), out=[], add=(t,go,urgent)=>out.push({t,go,urgent:!!urgent});
  if(r==="learner"){const L=myLearner();if(L){
      const hw=pipTry(()=>hwFor(L).filter(h=>!answerOf(L,h)))||[];if(hw.length)add(`${hw.length} homework to do`,"homework");
      const today=pipTry(()=>sessionsOf(learnerCourses(L)).filter(s=>dayKey(new Date(s.startsAt))===dayKey(new Date())&&sessEnd(s)>Date.now()))||[];
      for(const s of today.slice(0,2))add(`Class today at ${fmtTime(new Date(s.startsAt))}: ${s.title||"Live class"}`,"schedule",true);
      const un=pipTry(()=>unreadCount())||0;if(un)add(`${un} new message${un===1?"":"s"}`,"notices");
      if(!moodOf(S.uid))add("Tell Pip how you feel today","@mood");}}
  else if(r==="parent"){
    const un=pipTry(()=>unreadCount())||0;if(un)add(`${un} unread notice${un===1?"":"s"}`,"messages");
    const ch=pipTry(()=>chatUnread().length)||0;if(ch)add(`${ch} new chat message${ch===1?"":"s"} from the teacher`,"messages",true);
    const K=pipTry(()=>curKid());if(K){const hw=pipTry(()=>hwFor(K).filter(h=>!answerOf(K,h)))||[];if(hw.length)add(`${firstOf(K.name)} has ${hw.length} homework to do`,"homework");
      const m=K.uid&&moodOf(K.uid);if(m)add(`${firstOf(K.name)} is feeling ${(PIPM.find(x=>x[0]===m)||[])[1].toLowerCase()} today`,"@mood",m==="sad");}}
  else if(r==="trainer"||r==="admin"){
    const rv=pipTry(()=>toReview().length)||0;if(rv)add(`${rv} homework answer${rv===1?"":"s"} waiting for your reply`,"homework");
    const sp=pipTry(()=>speakingQueue().length)||0;if(sp)add(`${sp} speaking practice to review`,"review");
    const ib=pipTry(()=>inboxCount())||0;if(ib)add(`${ib} family conversation${ib===1?" needs":"s need"} a reply`,"inbox",true);
    if(r==="admin"){const wp=pipTry(()=>waitingParents().length)||0;if(wp)add(`${wp} account${wp===1?"":"s"} waiting to be connected`,"parents",true);
      const rm=pipTry(()=>remindersToday().length)||0;if(rm)add(`${rm} fee reminder${rm===1?"":"s"} due today`,"fees");
      const rp=pipTry(()=>reportsPending().length)||0;if(rp)add(`${rp} report${rp===1?"":"s"} to approve`,"reports");
      const lv=pipTry(()=>txAll("leave").filter(l=>l.status==="pending").length)||0;if(lv)add(`${lv} leave request${lv===1?"":"s"} to approve`,"trainers");
      const ld=pipTry(()=>adList("leads").filter(x=>x.status==="new").length)||0;if(ld)add(`${ld} new lead${ld===1?"":"s"}`,"leads");}
    if(r==="admin"&&PIPST.flagN)add(`${PIPST.flagN} child chat${PIPST.flagN===1?"":"s"} with Pip flagged for safety this week`,"@log",true);
    const sad=(pipTry(()=>scopedLearners())||[]).filter(L=>L.uid&&moodOf(L.uid)==="sad");
    for(const L of sad.slice(0,3))add(`${firstOf(L.name)} said they feel sad or worried today. A kind check-in could help.`,"@mood",true);}
  return out;
}
function pipBadge(){const n=pipUpdates().length;const b=document.getElementById("pipfab");if(!b)return;const s=b.querySelector(".pfb");if(s){s.textContent=n>9?"9+":String(n);s.hidden=!n;}b.setAttribute("aria-label",`Ask Pip${n?`, ${n} update${n===1?"":"s"}`:""}`);}
function pipEnsure(){
  const ok=S.status==="ready"&&!!pipRole()&&!document.getElementById("ll-gate");
  let b=document.getElementById("pipfab");
  if(!ok){if(b)b.hidden=true;return;}
  if(!b){b=document.createElement("button");b.id="pipfab";b.type="button";b.innerHTML=`<svg viewBox="24 12 152 186" aria-hidden="true"><use href="#pip" x="0" y="0" width="200" height="200"/></svg><span class="pfl">Ask Pip</span><span class="pfb" hidden></span>`;b.addEventListener("click",()=>pipOpen());document.body.appendChild(b);}
  b.hidden=PIPST.open;pipBadge();
}
setInterval(pipEnsure,1500);
function pipFlagCount(){if(pipRole()!=="admin"||!window.LL_sb)return;window.LL_sb.from("pip_chats").select("id",{count:"exact",head:true}).eq("flagged",true).gte("at",new Date(Date.now()-7*864e5).toISOString()).then(r=>{const n=r&&!r.error?r.count||0:0;if(n!==PIPST.flagN){PIPST.flagN=n;pipDraw();pipBadge();}},()=>{});}
function pipOpen(tab){PIPST.open=true;if(tab)PIPST.tab=tab;pipFlagCount();let p=document.getElementById("pippanel");
  if(!p){p=document.createElement("aside");p.id="pippanel";p.setAttribute("role","dialog");p.setAttribute("aria-label","Ask Pip");document.body.appendChild(p);
    p.addEventListener("click",pipClick);p.addEventListener("submit",pipSubmit);p.addEventListener("keydown",e=>{if(e.key==="Escape")pipClose();});}
  p.hidden=false;pipDraw();pipEnsure();setTimeout(()=>{const i=p.querySelector("#pip-q")||p.querySelector(".pip-x");if(i)i.focus();},60);}
function pipClose(){PIPST.open=false;const p=document.getElementById("pippanel");if(p)p.hidden=true;pipEnsure();const b=document.getElementById("pipfab");if(b)b.focus();}
function pipTabs(){const r=pipRole(),n=pipUpdates().length;const tabs=[["updates",`Updates${n?` (${n})`:""}`],["mood","Mood"],["ask","Ask Pip"]];if(r==="admin")tabs.push(["log","Safety log"]);
  return `<div class="pip-tabs" role="tablist">${tabs.map(([k,t])=>`<button type="button" role="tab" aria-selected="${PIPST.tab===k}" class="${PIPST.tab===k?"on":""}" data-pip="tab" data-id="${k}">${t}</button>`).join("")}</div>`;}
function pipHead(){const kid=pipRole()==="learner";return `<div class="pip-head"><svg viewBox="24 12 152 186" class="pip-av" aria-hidden="true"><use href="#pip" x="0" y="0" width="200" height="200"/></svg><div class="grow"><b>Pip</b><span>${kid?"Your garden helper":"Your Little Lingos helper"}</span></div><button type="button" class="iconbtn pip-x" data-pip="close" aria-label="Close Pip">${ic("x")}</button></div>`;}
function pipDraw(){const p=document.getElementById("pippanel");if(!p||p.hidden)return;let body="";
  if(PIPST.tab==="updates"){const u=pipUpdates();const kid=pipRole()==="learner";
    body=u.length?`<p class="pip-say">${kid?"Here's what's new in your garden!":"Here's what needs your attention."}</p><div class="pip-list">${u.map(x=>`<button type="button" class="pip-up ${x.urgent?"urgent":""}" data-pip="go" data-id="${esc(x.go)}">${esc(x.t)}<span aria-hidden="true">›</span></button>`).join("")}</div>`
      :`<p class="pip-say">${kid?"All done! Your garden is looking lovely today.":"You're all caught up. Nothing needs your attention right now."}</p>`;}
  else if(PIPST.tab==="mood"){const mine=moodOf(S.uid),r=pipRole();
    body=`<p class="pip-say">${r==="learner"?"How are you feeling today?":"How are you feeling today? Only you and the academy team see this."}</p>
    <div class="pip-moods">${PIPM.map(([k,t])=>`<button type="button" class="pip-mood ${mine===k?"on":""}" data-pip="mood" data-id="${k}" aria-pressed="${mine===k}">${moodFace(k,40)}<span>${t}</span></button>`).join("")}</div>
    ${mine?`<p class="pip-note">${esc(pipMoodReply(mine))}</p>`:""}${pipMoodOthers()}`;}
  else if(PIPST.tab==="ask"){const kid=pipRole()==="learner";
    const sugg=kid?["What does 'curious' mean?","Give me a fun word for today","How do I hand in homework?","Tell me a riddle"]:pipRole()==="parent"?["How can I help my child read at home?","How do I see my child's homework?","How do I set a password?"]:pipRole()==="trainer"?["A 10-minute phonics game for Seeds","How do I set homework?","Write a friendly note to a parent about missed homework"]:["Write a notice about the Diwali holiday","How do I add a trainer?","Ideas to keep parents engaged"];
    body=`<div class="pip-chat" id="pip-chat" aria-live="polite">${PIPST.chat.length?PIPST.chat.map(m=>`<div class="pip-msg ${m.role==="user"?"me":"pip"}">${esc(m.content).replace(/\n/g,"<br>")}</div>`).join(""):`<p class="pip-say">${kid?"Hi! I'm Pip. Ask me about words, stories or how to use your garden!":"Hi! I'm Pip. Ask me anything about teaching English, Little Lingos or using this app."}</p><div class="pip-sugg">${sugg.map(s=>`<button type="button" data-pip="sugg">${esc(s)}</button>`).join("")}</div>`}${PIPST.busy?`<div class="pip-msg pip typing"><i></i><i></i><i></i></div>`:""}</div>
    <form class="pip-form" novalidate><label for="pip-q" class="sr">Ask Pip</label><input id="pip-q" name="q" type="text" maxlength="500" autocomplete="off" placeholder="${kid?"Type your question…":"Ask Pip anything…"}" ${PIPST.busy?"disabled":""}><button class="btn btn-primary btn-sm" type="submit" ${PIPST.busy?"disabled":""}>Send</button></form>
    <p class="pip-fine">${kid?"Pip is a computer helper, not a person. Never share your address, phone number or passwords. Your chats help keep you safe: the academy can read them.":"Pip is an AI helper and can make mistakes. Check important facts."}</p>`;}
  else if(PIPST.tab==="log"){body=pipLogHTML();}
  p.innerHTML=pipHead()+pipTabs()+`<div class="pip-body">${body}</div>`;
  const ch=p.querySelector("#pip-chat");if(ch)ch.scrollTop=ch.scrollHeight;
}
function pipMoodReply(m){const kid=pipRole()==="learner";
  if(m==="great"||m==="happy")return kid?"Yay! I love that. Let's make today a great learning day!":"Wonderful. Thanks for checking in!";
  if(m==="okay")return kid?"Thanks for telling me. Maybe a fun game can make it even better!":"Thanks for checking in. Small wins count too.";
  if(m==="tired")return kid?"It's okay to feel tired. Take a little rest, drink some water, and try again later.":"Rest matters. Take a short break if you can.";
  return kid?"Thank you for telling me. It's okay to feel sad or worried sometimes. Talking to a grown-up you trust can really help. Your teacher will see how you feel so they can check in on you.":"Thanks for being honest. Be kind to yourself today, and reach out to someone you trust if it would help.";}
function pipMoodOthers(){const r=pipRole();let ls=[];
  if(r==="trainer"||r==="admin")ls=pipTry(()=>scopedLearners())||[];else if(r==="parent")ls=pipTry(()=>childrenOf(S.uid).map(learner))||[];
  ls=ls.filter(L=>L&&L.uid);if(!ls.length)return "";
  const rows=ls.map(L=>{const m=moodOf(L.uid);return {L,m};}).sort((a,b)=>(b.m==="sad")-(a.m==="sad")||(!!b.m)-(!!a.m));
  return `<h4 class="pip-h4">${r==="parent"?"Your child today":"Your learners today"}</h4><div class="pip-mlist">${rows.map(({L,m})=>`<div class="pip-mrow ${m==="sad"?"sad":""}">${m?moodFace(m,26):`<span class="pip-nomood"></span>`}<b>${esc(L.name)}</b><span>${m?esc((PIPM.find(x=>x[0]===m)||[])[1]):"Not shared yet"}</span></div>`).join("")}</div>`;}
async function pipSaveMood(m){const day=todayKey();try{await upsert("progress/"+S.uid,{moods:{[day]:{m,at:Date.now()}}});}catch(e){toast("Couldn't save your mood. Try again.",true);return;}
  if(!D.progress[S.uid])D.progress[S.uid]={};D.progress[S.uid].moods={...(D.progress[S.uid].moods||{}),[day]:{m,at:Date.now()}};pipDraw();}
const PIPFAQ=[[/password/i,"To set a password: staff tap their name at the top, parents go to Settings › Sign-in, learners go to Me › My password. Then you can sign in with your email and password, no code needed."],
  [/homework/i,"Learners: open Homework, tap the homework, answer it and hand it in. Trainers: Homework › Set homework, choose who it's for, pick an activity, then check and set."],
  [/join|class|zoom|meet/i,"Open Classes. A Join button appears a little before the class starts."],
  [/draw|picture/i,"Go to Fun corner › Drawing. You can use the pen, eraser, undo, then save to your portfolio or download it."],
  [/chess/i,"Chess is in Fun corner (learners) and My space (trainers). Tap a piece, then tap where it should go."],
  [/fee|pay/i,"Parents can see fees under Fees. For questions about payments, please contact the academy team."],
  [/attendance/i,"Trainers mark attendance under Attendance. Admins can see everyone's attendance there too."]];
function pipFaq(q){const hit=PIPFAQ.find(([re])=>re.test(q));return hit?hit[1]:null;}
async function pipAsk(q){q=String(q||"").trim();if(!q||PIPST.busy)return;PIPST.chat.push({role:"user",content:q});PIPST.busy=true;pipDraw();
  let reply="";
  if(!PIPST.off&&window.LL_askPip){const r=await window.LL_askPip(PIPST.chat.slice(-8),pipUpdates().filter(x=>x.go!=="@mood").map(x=>x.t));
    if(r&&r.reply)reply=r.reply;else if(r&&r.off){PIPST.off=true;}else if(r&&r.error==="signin")reply="Please sign in again to chat with Pip.";}
  if(!reply){const f=pipFaq(q);reply=f||(PIPST.off?(pipRole()==="admin"?"My thinking cap isn't switched on yet. To turn on AI answers, add your free Groq key in Supabase (see the setup guide). Until then I can answer questions about using the app.":"I can't answer that just yet, but I can help with using the app! Try asking about homework, classes or passwords."):"Oops, Pip couldn't answer right now. Please try again in a minute.");}
  PIPST.chat.push({role:"assistant",content:reply});PIPST.busy=false;pipDraw();setTimeout(()=>{const i=document.getElementById("pip-q");if(i)i.focus();},30);}
function pipLogHTML(){
  if(PIPST.log==null){PIPST.log="loading";(async()=>{try{const {data,error}=await window.LL_sb.from("pip_chats").select("*").order("at",{ascending:false}).limit(200);PIPST.log=error?{err:error.message}:data||[];}catch(e){PIPST.log={err:String(e)};}pipDraw();})();}
  if(PIPST.log==="loading")return `<p class="pip-say">Loading…</p>`;
  if(PIPST.log.err)return `<p class="pip-say">The safety log isn't set up yet. Run the Ask Pip setup in Supabase first.</p>`;
  const xs=PIPST.log, fl=xs.filter(x=>x.flagged);
  return `<p class="pip-say">Children's chats with Pip from the last 30 days. Flagged ones are at the top. Only you can see these.</p>
  <div class="row" style="gap:6px"><button type="button" class="btn btn-ghost btn-sm" data-pip="logreload">Refresh</button></div>
  ${xs.length?`<div class="pip-log">${[...fl,...xs.filter(x=>!x.flagged)].map(x=>`<div class="pip-lrow ${x.flagged?"flag":""}"><div class="pip-lmeta"><b>${esc(x.name||x.role||"Learner")}</b> · ${esc(fmtDay(new Date(x.at)))} ${esc(fmtTime(new Date(x.at)))}${x.flagged?` · <span class="pill p-bad">${esc(x.reason||"flagged")}</span>`:""}</div><div><i>Asked:</i> ${esc(x.q)}</div><div><i>Pip:</i> ${esc(x.a)}</div></div>`).join("")}</div>`:`<p class="muted">No children's chats yet.</p>`}`;}
function pipClick(e){const b=e.target.closest("[data-pip]");if(!b)return;const k=b.dataset.pip,id=b.dataset.id;
  if(k==="close")pipClose();
  else if(k==="tab"){PIPST.tab=id;pipDraw();}
  else if(k==="go"){if(id==="@mood"){PIPST.tab="mood";pipDraw();return;}if(id==="@log"){PIPST.tab="log";PIPST.log=null;pipDraw();return;}pipClose();go(id);}
  else if(k==="mood")pipSaveMood(id);
  else if(k==="sugg")pipAsk(b.textContent);
  else if(k==="logreload"){PIPST.log=null;pipDraw();}}
function pipSubmit(e){e.preventDefault();const i=e.target.querySelector("#pip-q");if(!i)return;const q=i.value;i.value="";pipAsk(q);}
