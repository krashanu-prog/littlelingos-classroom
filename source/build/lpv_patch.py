# Admin: "View as Learner" can open any real child's own dashboard (pick the child), view only.
R('''  S.db=db;S.user=user;
  const me=await user.me();''','''  S.db=lpvGuardDb(db);S.user=user;
  const me=await user.me();''')
R('/* ================= events ================= */','''/* ================= Admin: open a child's own dashboard =================
   In "View as Learner" the admin can pick a real child. The pages are then drawn with that child's own data
   (progress, garden, portfolio, classes). It is view only: anything tried there is not saved to the child. */
function lpvKid(){if(realRole()!=="admin"||S.viewAs!=="student"||!S.lpvKid)return null;const L=learner(S.lpvKid);
  return L&&L.uid&&!L.archived&&(L.stage||"Seeds")===(S.previewStage||"Seeds")?L:null;}
try{const v=sessionStorage.getItem("ll-lpvkid");if(v)S.lpvKid=v;}catch{}
let lpvToastAt=0;
function lpvGuardDb(db){
  const blocked=p=>{const L=lpvKid();if(!L||!String(p||"").includes(L.uid))return false;
    if(Date.now()-lpvToastAt>4000){lpvToastAt=Date.now();setTimeout(()=>toast("Preview only. Nothing is saved to "+firstOf(L.name)+"'s account."),0);}return true;};
  const bind=(t,v)=>typeof v==="function"?v.bind(t):v;
  const ref=(r,p)=>new Proxy(r,{get(t,k){if((k==="set"||k==="update"||k==="delete")&&blocked(p))return ()=>Promise.resolve();return bind(t,t[k]);}});
  const col=(c,p)=>new Proxy(c,{get(t,k){if(k==="doc")return (...a)=>{const r=t.doc(...a);return ref(r,p+"/"+(a[0]||r.id||""));};
    if(k==="add"&&blocked(p))return ()=>Promise.resolve({id:"preview"});return bind(t,t[k]);}});
  return new Proxy(db,{get(t,k){if(k==="doc")return p=>ref(t.doc(p),p);if(k==="collection")return p=>col(t.collection(p),p);return bind(t,t[k]);}});}
/* draw the learner pages as the chosen child */
function lpvAs(f){return function(){const L=lpvKid();if(!L||S._realUid)return f.apply(this,arguments);
  S._realUid=S.uid;S.uid=L.uid;try{return f.apply(this,arguments);}finally{S.uid=S._realUid;S._realUid=null;}};}
mainHTML=lpvAs(mainHTML);navHTML=lpvAs(navHTML);
A.lpvKid=id=>{S.lpvKid=id||null;S.game=null;try{sessionStorage.setItem("ll-lpvkid",id||"")}catch{}if(id){const L=learner(id);if(L)loadKp(L.uid,true);}go("home");};
document.addEventListener("change",e=>{const t=e.target;if(t&&t.id==="lpv-kid")A.lpvKid(t.value);});
function lpvPick(){const st=S.previewStage||"Seeds",ks=activeLearners().filter(L=>(L.stage||"Seeds")===st).sort((a,b)=>String(a.name).localeCompare(String(b.name)));const k=lpvKid();
  return `<label class="ppvpick"><span class="small"><b>Child:</b></span><select id="lpv-kid" aria-label="Child whose dashboard to open">${opt("","Sample learner (try activities)",!k)}${ks.map(L=>L.uid?opt(L.id,L.name,k&&k.id===L.id):`<option value="" disabled>${esc(L.name)} (not signed in yet)</option>`).join("")}</select></label>`;}
previewNoteHTML=function(){if(!(realRole()==="admin"&&S.viewAs==="student"))return "";const k=lpvKid();
  return `<section class="alert a-sun prevnote"><span>${k?`👀 <b>${esc(k.name)}'s dashboard.</b> You're seeing exactly what ${esc(firstOf(k.name))} sees. View only: nothing you do here is saved to ${esc(firstOf(k.name))}'s account.`
    :`👀 <b>Learner preview.</b> You're playing as a sample learner, so your activities save to this preview only, not to a child's portfolio. Pick a child to open their own dashboard.`}</span>${pvStageChips()}${lpvPick()}</section>`;};
/* ================= events ================= */''')
