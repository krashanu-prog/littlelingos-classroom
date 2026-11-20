# Class reminders: (1) email and (2) phone notifications sent automatically by the class-reminders function,
# (3) a "Remind" button for staff that opens WhatsApp / email with a reminder for each family.
# --- (3) staff: Remind button next to Share for classes in the next 24 hours ---
SH='''data-act="shareSession" data-id="${esc(s.id)}">${ic("share")}Share</button>`:""}'''
assert s.count(SH)==2
RB='''${!past&&isStaff()&&new Date(s.startsAt).getTime()-Date.now()<864e5&&sessEnd(s)>Date.now()?`<button class="btn btn-ghost btn-sm" data-act="remindSession" data-id="${esc(s.id)}">${ic("bell")}Remind</button>`:""}'''
s=s.replace(SH,SH+RB)
R('''  const lines=[`${hi} Little Lingos class is coming up 🌱`,"",''','''  const mins=Math.round((d.getTime()-Date.now())/6e4),when=mins<=0?"is starting now":mins<60?`starts in ${mins} minute${mins===1?"":"s"}`:mins<180?`starts in about ${Math.round(mins/60)} hour${Math.round(mins/60)===1?"":"s"}`:`is at ${fmtTime(d)} ${sameDay(d,new Date())?"today":"tomorrow"}`;
  const lines=[RMDW?`⏰ Reminder: ${L?firstOf(L.name)+"'s":"your"} Little Lingos class ${when}!`.replace(/^⏰ Reminder: your/,"⏰ Reminder: your"):`${hi} Little Lingos class is coming up 🌱`,"",''')
R('''openModal(fresh?"Share the class link":"Share “"+(s.title||"Live class")+"”",body,''','''openModal(fresh?"Share the class link":RMDW?"Remind families: “"+(s.title||"Live class")+"”":"Share “"+(s.title||"Live class")+"”",body,''')
R('/* ================= events ================= */','''/* ================= Class reminders ================= */
let RMDW=false;
const sameDay=(a,b)=>a.toDateString()===b.toDateString();
A.remindSession=id=>{RMDW=true;try{A.shareSession(id);}finally{RMDW=false;}};
/* phone notifications (web push) for grown-ups; never on children's devices */
const RMD={st:"",busy:false};
const rmdIOS=()=>/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const rmdStandalone=()=>{try{return matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;}catch{return false;}};
const rmdSupported=()=>"serviceWorker" in navigator&&"PushManager" in window&&typeof Notification!=="undefined";
async function rmdCheck(){let st;try{if(!rmdSupported())st=rmdIOS()&&!rmdStandalone()?"ios":"unsupported";else if(Notification.permission==="denied")st="denied";
  else{const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();st=sub?"on":"off";}}catch(e){st="unsupported";}
  if(st!==RMD.st){RMD.st=st;if(S.status==="ready")render(true);}return st;}
const rmdFn=body=>window.LL_sb.functions.invoke("class-reminders",{body});
const b64key=b=>{const p="=".repeat((4-b.length%4)%4),r=atob((b+p).replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from([...r].map(c=>c.charCodeAt(0)));};
A.rmdOn=async()=>{if(S.viewAs)return toast("This is a preview. Parents turn this on in their own account.");if(RMD.busy)return;RMD.busy=true;render(true);
  try{if(!rmdSupported()){toast(rmdIOS()?"On iPhone, first add this app to your Home Screen (Share → Add to Home Screen), then open it from there.":"This browser can't show notifications. Try Chrome.",true);return;}
    const p=await Notification.requestPermission();if(p!=="granted"){toast("Notifications are blocked. Allow them for this site in your browser settings, then try again.",true);RMD.st=p==="denied"?"denied":"off";return;}
    const {data:k,error:e1}=await rmdFn({action:"vapid"});if(e1||!k||!k.key)throw new Error("key");
    const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
    if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64key(k.key)});
    const {data:r,error:e2}=await rmdFn({action:"subscribe",sub:sub.toJSON()});if(e2||!r||!r.ok)throw new Error("save");
    RMD.st="on";toast("Class reminders are on for this device 🔔");rmdFn({action:"test"}).catch(()=>{});
  }catch(e){toast("Couldn't turn on reminders just now. Please try again.",true);}finally{RMD.busy=false;render(true);}};
A.rmdOff=async()=>{if(S.viewAs)return;try{const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();if(sub){await rmdFn({action:"unsubscribe",endpoint:sub.endpoint}).catch(()=>{});await sub.unsubscribe();}RMD.st="off";toast("Class reminders are off on this device.");}catch(e){}render(true);};
A.rmdTest=async()=>{try{const {data}=await rmdFn({action:"test"});toast(data&&data.sent?"Test sent. It should pop up in a few seconds.":"No device found. Turn reminders on first.",!(data&&data.sent));}catch(e){toast("Couldn't send a test.",true);}};
A.rmdEmail=async(v)=>{if(S.viewAs)return toast("This is a preview.");const p=D.profiles[S.uid]||{};const cr={...(p.classRemind||{}),email:v==="1"};await save(()=>upsert("profiles/"+S.uid,{classRemind:cr}),v==="1"?"Class reminder emails are on":"Class reminder emails are off");};
A.rmdHide=()=>{try{localStorage.setItem("ll-rmd-hide","1")}catch{}render(true);};
function rmdCard(){const p=D.profiles[S.uid]||{},emOn=(p.classRemind||{}).email!==false,st=RMD.st;
  const push=st==="on"?`<p class="rmdstate on">🔔 <b>On for this device.</b> A notification an hour before each class and again 10 minutes before.</p><div class="row"><button class="btn btn-ghost btn-sm" data-act="rmdTest">Send a test</button><button class="btn btn-ghost btn-sm" data-act="rmdOff">Turn off on this device</button></div>`
    :st==="ios"?`<p class="rmdstate">On iPhone, add this app to your Home Screen first: tap <b>Share</b>, then <b>Add to Home Screen</b>. Open it from there and come back here.</p>`
    :st==="denied"?`<p class="rmdstate">Notifications are blocked for this site. Allow them in your browser's site settings, then reload this page.</p>`
    :st==="unsupported"?`<p class="rmdstate">This browser can't show notifications. Chrome on Android or a computer works best.</p>`
    :`<p class="rmdstate">Get a notification on this phone or computer before each class, even when the app is closed.</p><button class="btn btn-primary" data-act="rmdOn" ${RMD.busy?"disabled":""}>🔔 Turn on class reminders</button>`;
  return `<section class="card panel rmdcard"><h2>Class reminders</h2>${push}
    <label class="rmdmail"><input type="checkbox" data-change="rmdEmail" ${emOn?"checked":""}> <span>Also email me about an hour before each class, with the Join link</span></label></section>`;}
document.addEventListener("change",e=>{const t=e.target;if(t&&t.dataset&&t.dataset.change==="rmdEmail")A.rmdEmail(t.checked?"1":"0");});
/* parent Settings: the reminders card; parent Overview: a one-time nudge until it's on */
{const f=parentSettings;parentSettings=function(){const h=f.apply(this,arguments);const i=h.indexOf('<div class="cols even">');return i<0?h+rmdCard():h.slice(0,i)+rmdCard()+h.slice(i);};}
{const f=parentHome;parentHome=function(){const h=f.apply(this,arguments);let hide=false;try{hide=localStorage.getItem("ll-rmd-hide")==="1"}catch{}
  if(hide||RMD.st!=="off"||!kidsList().length)return h;
  const nudge=`<section class="alert a-sun rmdnudge"><span>🔔 <b>Never miss a class.</b> Get a reminder on this phone before every class.</span><span class="row"><button class="btn btn-primary btn-sm" data-act="rmdOn">Turn on</button><button class="btn btn-ghost btn-sm" data-act="rmdHide">Not now</button></span></section>`;
  const i=h.indexOf('</div>',h.indexOf('class="head"'));return i<0?nudge+h:h.slice(0,i+6)+nudge+h.slice(i+6);};}
/* admin Settings: is it all working? */
const RMDS={d:null,t:0};
async function rmdStatusLoad(){if(Date.now()-RMDS.t<6e4)return;RMDS.t=Date.now();try{const {data}=await rmdFn({action:"status"});RMDS.d=data||{error:"none"};}catch(e){RMDS.d={error:"off"};}render(true);}
function rmdAdminCard(){if(realRole()!=="admin"||S.viewAs)return "";rmdStatusLoad();const d=RMDS.d;
  const lr=d&&d.lastRun&&d.lastRun.at?new Date(d.lastRun.at):null,mins=lr?Math.round((Date.now()-lr)/6e4):null;
  const row=(ok,t)=>`<li>${ok?"✅":"⚠️"} ${t}</li>`;
  const body=!d?`<p class="small muted">Checking…</p>`:d.error?`<p>⚠️ The class-reminders service isn't set up yet. See the setup steps.</p>`
    :`<ul class="rmdlist">${row(!!d.cron&&mins!=null&&mins<15,lr?`Reminder timer last ran ${mins<1?"just now":mins+" min ago"}${d.lastRun.checked!=null?` · ${d.lastRun.emails} emails, ${d.lastRun.pushes} notifications in that run`:""}`:"Reminder timer hasn't run yet")}
      ${row(d.email!=="off",d.email==="smtp"?"Emails send through your SMTP account":d.email==="brevo"?"Emails send through Brevo":"Emails are off: add the email secrets in Supabase")}
      ${row(true,`Phone notifications ready · ${d.devices} device${d.devices===1?"":"s"} signed up`)}
      ${d.lastRun&&d.lastRun.errors&&d.lastRun.errors.length?`<li>⚠️ Last problem: ${esc(String(d.lastRun.errors[0]))}</li>`:""}</ul>`;
  return `<section class="card panel"><h2>Class reminders for families</h2><p class="small">Families get an email about an hour before each class, and a phone notification an hour and 10 minutes before (if they turned it on). Trainers can also tap <b>Remind</b> on a class to send WhatsApp reminders.</p>${body}</section>`;}
{const f=VIEWS.settings;if(f)VIEWS.settings=function(){const h=f.apply(this,arguments);return realRole()==="admin"&&!S.viewAs&&(S.stab||"academy")==="academy"?rmdAdminCard()+h:h;};}
setTimeout(()=>{if(realRole&&realRole()!=="student")rmdCheck();},1500);
/* ================= events ================= */''')
R('@media (prefers-reduced-motion:reduce)','''.rmdcard{margin-bottom:16px}.rmdstate{margin:4px 0 10px}.rmdstate.on{color:var(--deep,#22703A)}.rmdmail{display:flex;gap:10px;align-items:flex-start;margin-top:14px;min-height:44px;cursor:pointer}.rmdmail input{width:22px;height:22px;margin-top:2px;flex:none}
.rmdnudge{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;justify-content:space-between}.rmdlist{list-style:none;padding:0;margin:8px 0 0;display:grid;gap:6px}
@media (prefers-reduced-motion:reduce)''')
