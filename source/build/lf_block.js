function learnerForm(L={},prefill={}){
  const pv=D.priv[L.id]||{}, f=D.fees[L.id]||{}, ts=activeTrainers(), isNew=!L.id;
  const stage=L.stage||prefill.stage||"Seeds", cs=courseList(), mine=new Set(L.courses||prefill.courses||(cs.length===1?[cs[0].id]:[]));
  const waiting=waitingAccounts("student");
  const acct=prefill.uid||L.uid||"";
  const extraAcct=prefill.uid&&!waiting.some(w=>w.uid===prefill.uid)&&prefill.uid!==L.uid;
  const pas=parentAccounts();
  const moreOpen=!!prefill.uid||!isNew&&!!(f.monthly||pv.guardian2||pv.phone2||pv.email2||pv.studentEmail||pv.notes||L.uid||(L.parents||[]).length);
  return `<div class="lfx">
  ${isNew?`<input type="hidden" name="lid" value="${esc(S.db.collection("learners").doc().id)}"><input type="hidden" name="code" value="${esc(genCode())}">`:""}
  <div class="two"><div class="field"><label for="lf-name">Child's name</label><input type="text" id="lf-name" name="name" required maxlength="60" data-label="Child's name" autocomplete="off" value="${esc(L.name||prefill.name||"")}" placeholder="First and last name"></div>
    <div class="field"><label for="lf-trainer">Trainer</label><select id="lf-trainer" name="trainer">${opt("","Assign later",!L.trainerId)}${ts.map(t=>opt(t.id,t.name,t.id===(L.trainerId||prefill.trainerId))).join("")}</select></div></div>
  <div class="field"><span class="lbl">Stage</span><div class="chips lfstage" role="radiogroup" aria-label="Stage">${STAGES.map(s=>`<label class="chip"><input type="radio" name="stage" value="${s.v}" ${s.v===stage?"checked":""}><span>${s.v} <i>${esc(s.ages)}</i></span></label>`).join("")}</div></div>
  <div class="field"><span class="lbl">Courses</span>${cs.length?`<div class="chips">${cs.map(c=>`<label class="chip"><input type="checkbox" name="courses" value="${esc(c.id)}" ${mine.has(c.id)?"checked":""}><span>${esc(c.title)}</span></label>`).join("")}</div>`:`<p class="small muted">No courses yet. Create a course first, then add learners to it.</p>`}</div>
  <p class="section-title">Parent</p>
  <div class="two"><div class="field"><label for="lf-guardian">Parent's name</label><input type="text" id="lf-guardian" name="guardian" maxlength="60" autocomplete="off" value="${esc(pv.guardian||prefill.guardian||"")}"></div>
    <div class="field"><label for="lf-phone">WhatsApp number</label><input type="tel" id="lf-phone" name="phone" maxlength="20" inputmode="tel" value="${esc(pv.phone||prefill.phone||"")}" placeholder="+91 98765 43210"></div></div>
  <div class="field"><label for="lf-email">Parent's email</label><input type="email" id="lf-email" name="email" maxlength="120" data-label="Parent's email" autocomplete="off" value="${esc(pv.email||prefill.email||"")}" placeholder="parent@example.com"><span class="hint">The parent signs in with this email and sees this child straight away.</span></div>
  <div class="lfdup" hidden><p class="small"></p><label class="row"><input type="checkbox" name="dupok"> Yes, this is a different child. Add them anyway.</label></div>
  <details class="lfmore" ${moreOpen?"open":""}><summary>More details <span class="small muted">fees, second parent, sign-in, notes</span></summary>
    <div class="three"><div class="field"><label for="lf-fee">Monthly fee (₹)</label><input type="number" id="lf-fee" name="fee" min="0" step="50" value="${esc(f.monthly??"")}" placeholder="e.g. 2000"></div>
      <div class="field"><label for="lf-start">Fees start</label><input type="month" id="lf-start" name="start" value="${esc(f.start||thisMonth())}"></div>
      <div class="field"><label for="lf-due">Due by day</label><input type="number" id="lf-due" name="due" min="1" max="28" value="${esc(f.dueDay||10)}"></div></div>
    <div class="two"><div class="field"><label for="lf-g2">Second parent (optional)</label><input type="text" id="lf-g2" name="guardian2" maxlength="60" value="${esc(pv.guardian2||"")}" placeholder="Name and relation"></div><div class="field"><label for="lf-p2">Their phone</label><input type="tel" id="lf-p2" name="phone2" maxlength="20" value="${esc(pv.phone2||"")}"></div></div>
    <div class="two"><div class="field"><label for="lf-email2">Second parent's email</label><input type="email" id="lf-email2" name="email2" maxlength="120" data-label="Second parent's email" value="${esc(pv.email2||"")}"></div><div class="field"><label for="lf-semail">Child's own email</label><input type="email" id="lf-semail" name="semail" maxlength="120" data-label="Child's email" value="${esc(pv.studentEmail||"")}" placeholder="For older learners with their own login"></div></div>
    <div class="field"><label for="lf-acct">Child's sign-in account</label><select id="lf-acct" name="acct">${opt("","Not connected",!acct)}${L.uid?opt(L.uid,`Connected: ${accountName(L.uid)}`,acct===L.uid):""}${extraAcct?opt(prefill.uid,accountName(prefill.uid),true):""}${waiting.filter(w=>w.uid!==L.uid).map(w=>opt(w.uid,`${w.displayName||accountName(w.uid)} (waiting)`,acct===w.uid)).join("")}</select></div>
    ${pas.length?`<fieldset class="field" style="border:0;padding:0;margin:0"><legend class="lbl" style="margin-bottom:8px">Parent accounts already signed in</legend><div class="chips">${pas.map(p=>`<label class="chip"><input type="checkbox" name="parents" value="${esc(p.uid)}" ${(L.parents||[]).includes(p.uid)||prefill.parent===p.uid?"checked":""}><span>${esc(p.displayName||accountName(p.uid))}</span></label>`).join("")}</div><span class="hint">Usually not needed: the parent's email above connects them automatically.</span></fieldset>`:""}
    <div class="field"><label for="lf-notes">Notes (only staff see these)</label><textarea id="lf-notes" name="notes" rows="2" maxlength="600">${esc(pv.notes||"")}</textarea></div>
  </details>
  ${L.id?`<label class="row" style="font-weight:700"><input type="checkbox" name="active" ${L.active!==false?"checked":""} style="width:20px;height:20px;accent-color:var(--leafMid)"> Currently attending</label>`:""}
  </div>`;
}
const normName=x=>String(x||"").toLowerCase().replace(/[^a-z0-9ऀ-ॿ]+/g," ").trim();
const phoneKey=x=>String(x||"").replace(/\D/g,"").slice(-10);
function sameChild(name,phone,email,skipId){const n=normName(name),ph=phoneKey(phone),em=String(email||"").trim().toLowerCase();if(!n)return null;
  return allLearners().find(L=>{if(L.id===skipId||normName(L.name)!==n)return false;const pv=D.priv[L.id]||{};
    if(ph&&phoneKey(pv.phone)&&phoneKey(pv.phone)!==ph)return false;if(em&&pv.email&&String(pv.email).toLowerCase()!==em)return false;return true;})||null;}
let lfBusy=false;
async function saveLearner(f,form,id){
  if(lfBusy)return false;
  const name=f.name.value.trim().replace(/\s+/g," "); if(!name)throw userErr("Add the child's name.");
  const courses=[...form.querySelectorAll('input[name="courses"]:checked')].map(x=>x.value);
  const fee=+f.fee.value||0, start=f.start.value, due=Math.min(28,Math.max(1,+f.due.value||10));
  if(fee>0&&!isMonth(start))throw userErr("Pick the month fees start from (for example 2026-10).");
  const acct=f.acct.value||null;
  if(acct){const other=activeLearners().find(l=>l.uid===acct&&l.id!==id);if(other)throw userErr(`That account is already connected to ${other.name}.`);}
  /* check everything before saving anything, so a fix-and-retry never makes a second copy */
  const priv={guardian:f.guardian.value.trim(),phone:f.phone.value.trim(),guardian2:f.guardian2.value.trim(),phone2:f.phone2.value.trim(),email:chkEmail(f.email.value,"parent's email"),email2:chkEmail(f.email2.value,"second parent's email"),studentEmail:chkEmail(f.semail.value,"child's email"),notes:f.notes.value.trim()};
  const newId=!id&&f.lid?f.lid.value:null;
  if(!id){const dup=sameChild(name,priv.phone,priv.email,newId);const box=form.querySelector(".lfdup");
    if(dup&&!(f.dupok&&f.dupok.checked)){if(box){box.hidden=false;box.querySelector("p").textContent=`${dup.name} is already on your list${dup.active===false?" (not attending now)":""}${dup.createdAt?`, added ${fmtDay(new Date(dup.createdAt))}`:""}${(D.priv[dup.id]||{}).guardian?`, parent ${(D.priv[dup.id]||{}).guardian}`:""}.`;}
      throw userErr(`${dup.name} is already on your list. Open them from Learners instead, or tick the box if this is a different child.`);}}
  const rec={name,stage:f.stage.value,courses,...assignPatch(id?learner(id):null,f.trainer.value),uid:acct,parents:[...form.querySelectorAll('input[name="parents"]:checked')].map(x=>x.value)};
  lfBusy=true;
  try{
    let lid=id;
    if(id){rec.active=f.active?f.active.checked:true;const was=D.learners[id];if(was&&was.active!==false&&!rec.active)rec.leftAt=Date.now();if(was&&was.active===false&&rec.active)rec.leftAt=null;await S.db.doc("learners/"+id).update(rec);}
    else{lid=newId||S.db.collection("learners").doc().id;const was=D.learners[lid];await S.db.doc("learners/"+lid).set({...rec,active:true,code:(was&&was.code)||(f.code&&f.code.value)||genCode(),createdAt:(was&&was.createdAt)||Date.now()});}
    await upsert("private/"+lid,priv);
    if(fee>0)await upsert("fees/"+lid,{monthly:fee,start,dueDay:due});
    else if(D.fees[lid])await S.db.doc("fees/"+lid).update({monthly:0});
    if(!form.dataset.logged){form.dataset.logged="1";await audit(id?"Learner edited":"Learner added",name);}
  }finally{lfBusy=false;}
}
if(!window.__lfWired){window.__lfWired=true;document.addEventListener("invalid",e=>{const d=e.target&&e.target.closest&&e.target.closest("details");if(d)d.open=true;},true);}
