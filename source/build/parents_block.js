/* ---------- Parents added by email (hosted version) ---------- */
const lowerEmail=v=>String(v||"").trim().toLowerCase();
S.acct=S.acct||{};
function parentsOnFile(){
  const m=new Map();
  for(const L of activeLearners()){const pv=D.priv[L.id]||{};
    for(const [ek,gk,pk] of [["email","guardian","phone"],["email2","guardian2","phone2"]]){const e=lowerEmail(pv[ek]);if(!e)continue;
      if(!m.has(e))m.set(e,{email:e,name:"",phone:"",kids:[]});const x=m.get(e);if(!x.name&&pv[gk])x.name=pv[gk];if(!x.phone&&pv[pk])x.phone=pv[pk];x.kids.push(L.id);}}
  return [...m.values()].sort((a,b)=>(a.name||a.email).localeCompare(b.name||b.email));
}
let acctReq=0;
function loadParentAccounts(){
  const emails=parentsOnFile().map(x=>x.email);if(!emails.length||!window.LL_sb)return;
  const key=emails.join(",");if(S.acctKey===key&&Date.now()-(S.acctAt||0)<30000)return;S.acctKey=key;S.acctAt=Date.now();const my=++acctReq;
  LL_sb.rpc("ll_accounts",{emails}).then(({data})=>{if(my!==acctReq||!data)return;const o={};for(const r of data)o[r.email]={uid:r.uid,last:r.last_sign_in};S.acct=o;schedule();},()=>{});
}
function parentInviteText(x){const kids=x.kids.map(id=>firstOf(learnerName(id)));const link=CFG().classroomUrl||location.origin;
  return `Hello${x.name?" "+firstOf(x.name):""}! ${kids.join(" and ")}'s classes, homework and progress are now on ${ACAD().name||"Little Lingos"}.\n\nOpen ${link} and sign in with this email: ${x.email}\nYou'll get a 6-digit code by email. No password needed.`;}
function parentsOnFileHTML(){
  loadParentAccounts();const list=parentsOnFile();
  return `<section class="card panel"><div class="ph"><div><h2>Parents added by email</h2><p class="small muted">They sign in at ${esc(CFG().classroomUrl||location.origin)} with this email and see their children straight away.</p></div></div>
  ${list.length?`<div class="tablewrap"><table><thead><tr><th>Parent</th><th>Email</th><th>Children</th><th>Status</th><th></th></tr></thead><tbody>${list.map(x=>{const a=S.acct[x.email];const wa=x.phone?waLinkTo(x.phone,parentInviteText(x)):"";
    return `<tr data-search="${esc((x.name+" "+x.email+" "+x.kids.map(learnerName).join(" ")).toLowerCase())}"><td><b>${esc(x.name||"–")}</b>${x.phone?`<div class="small muted">${esc(x.phone)}</div>`:""}</td><td class="small" style="user-select:all">${esc(x.email)}</td>
      <td>${x.kids.map(id=>`<button class="nm" data-act="learnerInfo" data-id="${esc(id)}">${esc(learnerName(id))}</button>`).join(", ")}</td>
      <td>${a?`<span class="pill p-good">Signed in${a.last?" "+esc(fmtDay(new Date(a.last))):""}</span>`:`<span class="pill p-mute">Not signed in yet</span>`}</td>
      <td><div class="acts">${wa?`<a class="btn btn-ghost btn-sm" href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp invite</a>`:""}<a class="btn btn-ghost btn-sm" href="${esc(mailLink(x.email,`Your ${ACAD().name||"Little Lingos"} parent login`,parentInviteText(x)))}" target="_blank" rel="noopener">${ic("mail")}Email invite</a><button class="btn btn-ghost btn-sm" data-act="editParentEmail" data-id="${esc(x.email)}">Children</button></div></td></tr>`}).join("")}</tbody></table></div>`
  :`<p class="muted">No parents added yet. Use <b>Add parent</b>, or fill in the parent's email when you add a learner.</p>`}</section>`;
}
function parentForm(x){
  const ks=activeLearners();const mine=new Set(x?x.kids:[]);
  return `<div class="two"><div class="field"><label for="pa-name">Parent's name</label><input type="text" id="pa-name" name="name" maxlength="60" required data-label="Parent's name" value="${esc(x&&x.name||"")}" placeholder="e.g. Priya Sharma"></div>
   <div class="field"><label for="pa-phone">Phone (WhatsApp)</label><input type="tel" id="pa-phone" name="phone" maxlength="20" value="${esc(x&&x.phone||"")}" placeholder="+91 98765 43210"></div></div>
   <div class="field"><label for="pa-email">Email (used to sign in)</label><input type="email" id="pa-email" name="email" maxlength="120" required data-label="Email" value="${esc(x&&x.email||"")}" ${x?"readonly":""} placeholder="parent@example.com">${x?`<span class="hint">To change the email, remove this parent from the children and add them again.</span>`:""}</div>
   <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="lbl" style="margin-bottom:8px">Their children</legend>${ks.length?`<div class="checks">${ks.map(L=>{const pv=D.priv[L.id]||{};const full=pv.email&&pv.email2&&!mine.has(L.id);return `<label><input type="checkbox" name="kids" value="${esc(L.id)}" ${mine.has(L.id)?"checked":""} ${full?"disabled":""}>${esc(L.name)}${full?` <span class="small muted">(has 2 parents)</span>`:""}</label>`}).join("")}</div>`:`<p class="small muted">Add the learner first, then add their parent.</p>`}<span class="hint">Tick two or more children for siblings. Each child can have two parents.</span></fieldset>`;
}
async function saveParent(f,form,old){
  const name=f.name.value.trim(), phone=f.phone.value.trim(), email=lowerEmail(f.email.value);
  if(!name)throw userErr("Add the parent's name.");
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw userErr("Check the email address.");
  const want=new Set([...form.querySelectorAll('input[name="kids"]:checked')].map(x=>x.value));
  if(!want.size)throw userErr("Tick at least one child.");
  const acct=S.acct[email];
  for(const L of activeLearners()){const pv=D.priv[L.id]||{};const in1=lowerEmail(pv.email)===email, in2=lowerEmail(pv.email2)===email;
    if(want.has(L.id)){
      if(in1)await upsert("private/"+L.id,{guardian:name,phone:phone||pv.phone||""});
      else if(in2)await upsert("private/"+L.id,{guardian2:name,phone2:phone||pv.phone2||""});
      else if(!pv.email)await upsert("private/"+L.id,{guardian:name,email,phone:phone||pv.phone||""});
      else if(!pv.email2)await upsert("private/"+L.id,{guardian2:name,email2:email,phone2:phone});
      else throw userErr(`${L.name} already has two parent emails. Edit ${firstOf(L.name)} to change one.`);
    }else if(in1||in2){
      await upsert("private/"+L.id,in1?(pv.email2?{email:pv.email2,guardian:pv.guardian2||"",phone:pv.phone2||"",email2:"",guardian2:"",phone2:""}:{email:""}):{email2:"",guardian2:"",phone2:""});
      if(acct&&(L.parents||[]).includes(acct.uid))await S.db.doc("learners/"+L.id).update({parents:(L.parents||[]).filter(u=>u!==acct.uid)});
    }}
  await audit(old?"Parent children changed":"Parent added",`${name} <${email}>: ${[...want].map(learnerName).join(", ")}`);
  S.acctKey="";
}
A.addParent=()=>{if(!activeLearners().length){toast("Add a learner first.",true);return}openModal("Add parent",parentForm(null),{wide:true,submitLabel:"Add parent",done:"Parent added. They can sign in now.",onSubmit:(f,form)=>saveParent(f,form,null)});};
A.editParentEmail=email=>{const x=parentsOnFile().find(p=>p.email===email);if(!x)return;openModal("Parent · "+(x.name||x.email),parentForm(x),{wide:true,done:"Saved",onSubmit:(f,form)=>saveParent(f,form,x)});};
