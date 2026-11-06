/* ================= Class reports: required for every child, right after each class =================
   Each child marked Present or Late needs a short report (participation, understanding and a note).
   It is saved as that child's note on the class record, which only that child's family can read. */
const SREP_FROM=Date.parse("2026-11-06T00:00:00+05:30"); /* classes that ended before this are not chased */
const SREP_LV=["🌱 Needs help","🙂 Getting there","😃 Good","🌟 Excellent"];
const SREP_RE=/^Participation: (.+?) · Understanding: (.+?) · ([\s\S]*)$/;
const srepParse=t=>{const m=SREP_RE.exec(String(t||""));return m?{p:SREP_LV.indexOf(m[1]),u:SREP_LV.indexOf(m[2]),txt:m[3]}:{p:-1,u:-1,txt:String(t||"")};};
const srepOk=t=>{const r=srepParse(t);return r.p>=0&&r.u>=0&&r.txt.trim().length>=10;};
function srepFields(L,note){const r=srepParse(note),n=esc(firstOf(L.name)),id=esc(L.id);
  const sel=(nm,lbl,v)=>`<label class="srsel"><span>${lbl}</span><select name="${nm}_${id}" aria-label="${lbl} for ${esc(L.name)}"><option value="">Choose…</option>${SREP_LV.map((x,i)=>`<option value="${i}" ${i===v?"selected":""}>${esc(x)}</option>`).join("")}</select></label>`;
  return `<div class="srep" data-srep="${id}">${sel("p","Participation",r.p)}${sel("u","Understanding",r.u)}
    <textarea class="mnote" name="n_${id}" rows="2" maxlength="400" placeholder="Report for ${n}'s family: what ${n} did well and what to practise next" aria-label="Report for ${esc(L.name)}'s family">${esc(r.txt)}</textarea></div>`;}
/* read the form, check every child who came has a full report, and build the notes */
function srepCollect(list,m,form){const notes={},miss=[];
  for(const L of list){const t=form.querySelector(`textarea[name="n_${CSS.escape(L.id)}"],input[name="n_${CSS.escape(L.id)}"]`),txt=t?t.value.trim():"";
    const came=m[L.id]==="present"||m[L.id]==="late";
    if(!came){if(txt)notes[L.id]=txt;continue;}
    const p=form.querySelector(`select[name="p_${CSS.escape(L.id)}"]`),u=form.querySelector(`select[name="u_${CSS.escape(L.id)}"]`);
    const pv=p?p.value:"",uv=u?u.value:"";
    if(pv===""||uv===""||txt.length<10){miss.push(firstOf(L.name));const box=form.querySelector(`[data-srep="${CSS.escape(L.id)}"]`);if(box)box.classList.add("srmiss");continue;}
    notes[L.id]=`Participation: ${SREP_LV[+pv]} · Understanding: ${SREP_LV[+uv]} · ${txt}`;}
  if(miss.length)throw userErr(`Please finish the report for ${miss.join(", ")}: choose participation and understanding, and write at least a short sentence.`);
  return notes;}
/* which classes still need reports */
function srepNeeds(s){if(!s||sessEnd(s)>Date.now()||sessEnd(s)<SREP_FROM)return false;if(noKidsClass(s)||(s.forLids||[]).includes("_trial"))return false;
  const mk=allMarks()[s.id];if(!mk)return true;const notes=mk.notes||{};
  return Object.entries(mk.m||{}).some(([lid,st])=>(st==="present"||st==="late")&&D.learners[lid]&&!srepOk(notes[lid]));}
const srepTrainerOf=s=>s.trainerId||(D.courses[s.courseId]||{}).teacherId||"";
function srepPending(all){const ss=all?entries(D.sessions):scopedSessions();return ss.filter(srepNeeds).sort((a,b)=>String(a.startsAt).localeCompare(String(b.startsAt)));}
const srepAge=s=>{const h=(Date.now()-sessEnd(s))/36e5;return h<1?`${Math.max(1,Math.round(h*60))} min ago`:h<48?`${Math.round(h)} h ago`:`${Math.round(h/24)} days ago`;};
function srepRow(s,inModal){const c=D.courses[s.courseId],d=new Date(s.startsAt);return `<div class="item"><div class="grow"><div class="t">${esc(s.title||(c?c.title:"Class"))}</div><div class="s">${esc(fmtDay(d))}, ${esc(fmtTime(d))} · ended ${esc(srepAge(s))}${role()==="admin"?` · ${esc((D.trainers[srepTrainerOf(s)]||{}).name||"No trainer")}`:""}</div></div><button type="button" class="btn btn-primary btn-sm" ${inModal?"data-mact":"data-act"}="${inModal?"fill":"mark"}" data-id="${esc(s.id)}">Fill reports</button></div>`;}
/* a banner on every staff page */
function srepBanner(){const r=role();if(r!=="teacher"&&r!=="admin")return "";if(realRole()==="admin"&&r==="teacher")return "";
  const ps=srepPending(r==="admin");if(!ps.length)return "";
  if(r==="admin"){const by={};for(const s of ps){const t=(D.trainers[srepTrainerOf(s)]||{}).name||"No trainer";by[t]=(by[t]||0)+1;}
    return `<section class="alert a-sun srepban"><span><b>${ps.length} class${ps.length===1?" still needs":"es still need"} child reports.</b> ${esc(Object.entries(by).map(([t,n])=>`${t}: ${n}`).join(" · "))}</span><button class="btn btn-ghost btn-sm" data-act="srepList">See classes</button></section>`;}
  return `<section class="alert a-bad srepban"><span><b>Class reports needed (${ps.length}).</b> Fill in a short report for every child right after each class. Families are waiting to hear how it went.</span><button class="btn btn-primary btn-sm" data-act="mark" data-id="${esc(ps[0].id)}">Fill now</button></section>`;}
A.srepList=()=>{const ps=srepPending(role()==="admin");openModal("Classes that need child reports",ps.length?`<p class="small">A short report is required for every child who came, right after each class.</p><div class="list">${ps.map(s=>srepRow(s,1)).join("")}</div>`:`<p>All class reports are done. 🎉</p>`,{noFocus:true,actions:SREP_ACTS});};
/* trainers: a reminder that pops up after a class ends, until the reports are done (can be put off for 15 minutes) */
const srepSnoozed=()=>{try{return +sessionStorage.getItem("ll-srep-snooze")>Date.now()}catch{return false}};
A.srepLater=()=>{try{sessionStorage.setItem("ll-srep-snooze",String(Date.now()+15*6e4))}catch{}closeModal();};
const SREP_ACTS={fill:id=>{closeModal();setTimeout(()=>A.mark(id),80);},later:()=>A.srepLater()};
function srepNudge(){try{if(S.status!=="ready"||realRole()!=="teacher"||modalOpen||srepSnoozed())return;const ps=srepPending(false);if(!ps.length)return;
  openModal("Class reports needed",`<p>${ps.length===1?"This class has":"These classes have"} ended. Reports for every child who came are required, and families see them straight away.</p><div class="list">${ps.slice(0,6).map(s=>srepRow(s,1)).join("")}</div>`,
    {noFocus:true,actions:SREP_ACTS,footerExtra:`<button type="button" class="btn btn-ghost" data-mact="later">Remind me in 15 minutes</button>`});}catch(e){}}
setInterval(srepNudge,60000);setTimeout(srepNudge,4000);
for(const v of Object.keys(VIEWS)){const f=VIEWS[v];VIEWS[v]=function(){return srepBanner()+f.apply(this,arguments);};}
