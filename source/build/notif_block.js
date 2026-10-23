/* ================= Phase 6: installable app, offline lessons, notification centre ================= */
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
/* --- service worker + install --- */
let installEvt=null;
if("serviceWorker" in navigator&&location.protocol!=="file:"){addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").catch(()=>{});});
  navigator.serviceWorker.addEventListener("message",e=>{if(e.data&&e.data.llGo){NC.open=false;go(e.data.llGo);}});}
addEventListener("beforeinstallprompt",e=>{e.preventDefault();installEvt=e;schedule();});
addEventListener("appinstalled",()=>{installEvt=null;toast("Little Lingos is on your home screen! 🌱");});
const isStandalone=()=>{try{return matchMedia("(display-mode: standalone)").matches||navigator.standalone===true}catch(e){return false}};
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
A.installApp=async()=>{if(installEvt){installEvt.prompt();try{await installEvt.userChoice;}catch(e){}installEvt=null;render(true);return}
  openModal("Add Little Lingos to your home screen",isIOS()?`<ol class="steps"><li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button (the square with an arrow).</li><li>Tap <b>Add to Home Screen</b>, then <b>Add</b>.</li></ol><p class="small muted">Pip's icon appears on your home screen and opens the classroom like an app.</p>`
    :`<ol class="steps"><li>Open this page in <b>Chrome</b>.</li><li>Tap the <b>⋮</b> menu at the top right.</li><li>Tap <b>Install app</b> or <b>Add to Home screen</b>.</li></ol><p class="small muted">Pip's icon appears on your home screen and opens the classroom like an app.</p>`);};
/* --- offline lessons (the child's own courses, kept on this device only) --- */
function offlineSave(){try{if(realRole()!=="student"||S.viewAs)return;const L=myLearner();if(!L||L.preview)return;
  const ls=learnerCourses(L).flatMap(cid=>lessonsOf(cid).map(l=>({id:l.id,t:l.title,c:(D.courses[cid]||{}).title||"",k:l.kind||"",v:l.vocab||"",b:String(l.body||"").slice(0,4000),lang:langOf(D.courses[cid])}))).slice(0,120);
  const data={at:Date.now(),name:firstOf(L.name),ls};const s=JSON.stringify(data);if(s.length>350000)return;
  const sig=nKey(s);if(sig!==lsGet("ll_off_sig",""))lsSet("ll_offline",data),lsSet("ll_off_sig",sig);}catch(e){}}
function offlineHTML(){const o=lsGet("ll_offline",null);if(!o||!o.ls||!o.ls.length)return null;const l=S.offL&&o.ls.find(x=>x.id===S.offL);
  const head=`<section class="alert a-sky"><b>You're offline.</b><span class="small">Your saved lessons are below. Everything else comes back when the internet does.</span></section>`;
  if(l)return head+`<div class="head"><div><button class="btn btn-ghost btn-sm" data-act="offL" data-id="">${ic("back")}All saved lessons</button><h1 style="margin-top:8px">${esc(l.t)}</h1><p class="lede">${esc(l.c)}</p></div></div>
    ${l.b?`<div class="prose">${paras(l.b)}</div>`:""}${parseVocab(l.v).length?`<div class="words">${parseVocab(l.v).map(([w,m])=>`<div class="word"><div><b>${esc(w)}</b><span>${esc(m)}</span></div>${canSpeak()?`<button class="iconbtn" data-act="say" data-w="${esc(w)}" data-l="${esc(l.lang)}" aria-label="Hear ${esc(w)}">${ic("sound")}</button>`:""}</div>`).join("")}</div>`:""}`;
  return head+`<div class="head"><div><h1>${esc(o.name||"My")}'s saved lessons</h1><p class="lede">Saved ${esc(fmtDay(new Date(o.at)))}.</p></div></div><div class="list">${o.ls.map(x=>`<div class="item click" role="button" tabindex="0" data-act="offL" data-id="${esc(x.id)}"><div class="grow"><div class="t">${esc(x.t)}</div><div class="s">${esc(x.c)}${parseVocab(x.v).length?` · ${parseVocab(x.v).length} words`:""}</div></div>${ic("fwd")}</div>`).join("")}</div>`;}
A.offL=id=>{S.offL=id||null;render(true);};
addEventListener("online",()=>{toast("You're back online!");render(true);});addEventListener("offline",()=>render(true));
/* --- notification centre --- */
const NC={open:false};
const nKey=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))|0;return "n"+(h>>>0).toString(36);};
function notifItems(){const r=role(),out=[],add=(t,go,ico,urgent,key)=>out.push({t,go,ico,urgent:!!urgent,k:nKey(key||t)});
  for(const u of pipTry(()=>pipUpdates())||[]){if(u.go==="@mood")continue;const ico=u.go==="homework"?"pencil":u.go==="fees"?"rupee":u.go==="schedule"?"cal":u.go==="messages"||u.go==="notices"||u.go==="inbox"?"chat":u.go==="@log"?"help":"bell";add(u.t,u.go==="@log"?"home":u.go,ico,u.urgent,u.t+"|"+ymd(new Date()));}
  const now=Date.now();
  let ss=[];if(r==="student"||r==="parent")ss=pipTry(()=>sessionsOf([...new Set(myKids().flatMap(L=>learnerCourses(L)))]))||[];else if(r==="teacher")ss=pipTry(()=>scopedSessions())||[];
  for(const s of ss){const t=new Date(s.startsAt).getTime();if(t>now&&t-now<=60*6e4)add(`Class at ${fmtTime(new Date(t))}: ${s.title||"Live class"}`,"schedule","cal",t-now<=15*6e4,"cls|"+s.id);}
  if(r==="parent")for(const L of kidsList()){const f=pipTry(()=>pfKid(L.id));if(!f||!(f.balance>0)||!f.nextDue)continue;const due=new Date(f.nextDue+"T12:00").getTime(),days=Math.round((due-now)/864e5);
    if(f.statusK==="overdue"||days<0)add(`${firstOf(L.name)}'s fee of ${money(f.balance)} is overdue`,"fees","rupee",true,"fee|"+L.id+"|"+f.nextDue+"|o");
    else if(days<=5)add(`${firstOf(L.name)}'s fee of ${money(f.balance)} is due ${days===0?"today":days===1?"tomorrow":`on ${fmtDay(new Date(due))}`}`,"fees","rupee",days<=1,"fee|"+L.id+"|"+f.nextDue);}
  if(r==="student"||r==="parent")for(const L of myKids())for(const h of pipTry(()=>hwFor(L))||[]){const f=replyOf(L,h);if(f&&f.at&&now-f.at<7*864e5)add(`${hwAuthor(h)} replied to “${h.title}”${r==="parent"?` (${firstOf(L.name)})`:""}`,"homework","chat",false,"rep|"+h.key+"|"+L.id+"|"+f.at);}
  if(r==="teacher"){const un=pipTry(()=>unreadCount())||0;if(un)add(`${un} new notice${un===1?"":"s"} from the academy`,"notices","chat",false,"un|"+un);}
  return out;}
const seenKey=()=>"ll_seen_"+(S.uid||"x");
function notifUnseen(){const seen=new Set(lsGet(seenKey(),[]));return notifItems().filter(x=>!seen.has(x.k));}
function bellHTML(){const n=pipTry(()=>notifUnseen().length)||0;return `<button class="bell" id="nbell" data-act="notifOpen" aria-haspopup="dialog" aria-expanded="${NC.open}" aria-label="Notifications${n?`, ${n} new`:""}">${ic("bell")}${n?`<span class="badge">${n>9?"9+":n}</span>`:""}</button>`;}
function notifPanelHTML(){const items=notifItems(),seen=new Set(lsGet(seenKey(),[])),r=realRole(),kid=role()==="student";
  const perm=typeof Notification==="undefined"?"none":Notification.permission;
  const alertsRow=kid||S.viewAs?"":perm==="none"?`<p class="small muted">This browser can't show alerts. You'll still see everything here.</p>`
    :perm==="granted"?`<p class="small"><b>Alerts are on</b> for this device while Little Lingos is open.</p>`
    :perm==="denied"?`<p class="small muted">Alerts are blocked in this browser's settings. You'll still see everything here.</p>`
    :`<button class="btn btn-ghost btn-sm" data-act="notifPerm">${ic("bell")}Get alerts on this device</button>`;
  const inst=!kid&&!isStandalone()?`<button class="btn btn-ghost btn-sm" data-act="installApp">📲 Add to home screen</button>`:"";
  return `<div class="ncard" role="dialog" aria-label="Notifications"><div class="nhead"><b>${kid?"What's new":"Notifications"}</b>${items.length?`<button class="linkbtn" data-act="notifSeen">Mark all as read</button>`:""}</div>
    ${items.length?`<div class="nlist">${items.map(x=>`<button class="nitem ${seen.has(x.k)?"":"new"} ${x.urgent?"urgent":""}" data-act="notifGo" data-id="${esc(x.k+"|"+x.go)}">${ic(x.ico)}<span>${esc(x.t)}</span></button>`).join("")}</div>`:`<p class="nempty">${kid?"All quiet in your garden! 🌱":"You're all caught up."}</p>`}
    <div class="nfoot">${alertsRow}${inst}</div></div>`;}
function notifDraw(){let p=document.getElementById("npanel");if(!NC.open){if(p)p.remove();return}
  if(!p){p=document.createElement("div");p.id="npanel";document.body.appendChild(p);}p.innerHTML=notifPanelHTML();}
A.notifOpen=()=>{NC.open=!NC.open;notifDraw();const b=document.getElementById("nbell");if(b)b.setAttribute("aria-expanded",NC.open);};
A.notifSeen=()=>{const s=new Set(lsGet(seenKey(),[]));for(const x of notifItems())s.add(x.k);lsSet(seenKey(),[...s].slice(-400));lastTop="";render(true);notifDraw();};
A.notifGo=v=>{const i=v.indexOf("|");const k=v.slice(0,i),g=v.slice(i+1);const s=new Set(lsGet(seenKey(),[]));s.add(k);lsSet(seenKey(),[...s].slice(-400));NC.open=false;notifDraw();lastTop="";go(g||"home");};
A.notifPerm=async()=>{try{const p=await Notification.requestPermission();if(p==="granted"){const al=new Set(lsGet("ll_alerted_"+S.uid,[]));for(const x of notifItems())al.add(x.k);lsSet("ll_alerted_"+S.uid,[...al].slice(-400));toast("Alerts are on for this device");}}catch(e){}notifDraw();};
document.addEventListener("click",e=>{if(!NC.open)return;if(e.target.closest("#npanel")||e.target.closest("#nbell"))return;NC.open=false;notifDraw();const b=document.getElementById("nbell");if(b)b.setAttribute("aria-expanded","false");});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&NC.open){NC.open=false;notifDraw();const b=document.getElementById("nbell");if(b){b.setAttribute("aria-expanded","false");b.focus();}}});
/* browser alerts while the app is open (grown-ups only; never for children's devices) */
function notifAlert(){try{if(S.status!=="ready"||S.viewAs||typeof Notification==="undefined"||Notification.permission!=="granted")return;const r=realRole();if(!r||r==="student"||r==="pending")return;
  const al=new Set(lsGet("ll_alerted_"+S.uid,[]));const fresh=notifItems().filter(x=>!al.has(x.k));if(!fresh.length)return;
  for(const x of fresh.slice(0,3)){const opts={body:x.t,icon:"icon-192.png",badge:"icon-192.png",tag:x.k,data:{go:x.go}};
    if(navigator.serviceWorker&&navigator.serviceWorker.controller)navigator.serviceWorker.ready.then(reg=>reg.showNotification("Little Lingos",opts)).catch(()=>{});else try{const n=new Notification("Little Lingos",opts);n.onclick=()=>{focus();go(x.go);n.close();};}catch(e){}}
  for(const x of fresh)al.add(x.k);lsSet("ll_alerted_"+S.uid,[...al].slice(-400));}catch(e){}}
setInterval(()=>{if(S.status!=="ready")return;notifAlert();offlineSave();if(NC.open)notifDraw();const n=pipTry(()=>notifUnseen().length);if(n!==NC.last){NC.last=n;lastTop="";render();}},30000);
setTimeout(()=>{notifAlert();offlineSave();},6000);
