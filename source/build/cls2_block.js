/* ---------- a class reaches only the children picked for it ---------- */
const realLids=s=>((s&&s.forLids)||[]).filter(id=>id&&id[0]!=="_");
const noKidsClass=s=>!realLids(s).length&&!((s&&s.forLids)||[]).includes("_trial");
const isKidSide=()=>{const r=role();return r==="student"||r==="parent";};
function pickBatches(){const t=myTid(),admin=role()==="admin";return entries(D.batches||{}).filter(b=>(admin||b.tid===t)&&(b.learners||[]).length);}
/* learner chips with quick picks. byCourse: only show learners of the course chosen in the same form */
function kidPicker(name,chosen,pool,byCourse,c0){
  const ids=new Set(chosen||[]);const extra=[...ids].filter(id=>D.learners[id]&&!pool.some(L=>L.id===id)).map(learner);
  const all=[...pool,...extra].sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));
  if(!all.length)return `<p class="small muted">No learners are assigned to you yet. Ask the admin to assign learners to you.</p>`;
  const hide=L=>byCourse&&c0&&!(L.courses||[]).includes(c0)&&!ids.has(L.id);
  const bs=pickBatches();
  return `<div class="kpick" data-kpick="${esc(name)}" ${byCourse?'data-kpcourse="1"':""}>
    <div class="row kpq"><button type="button" class="btn btn-ghost btn-sm" data-kp="all">${byCourse?"Everyone in this course":"All my learners"}</button>${bs.map(b=>`<button type="button" class="btn btn-ghost btn-sm" data-kp="b:${esc(b.id)}" data-bc="${esc(b.courseId||"")}" ${byCourse&&c0&&b.courseId&&b.courseId!==c0?"hidden":""}>${ic("users")}${esc(b.name||"Batch")}</button>`).join("")}<button type="button" class="btn btn-ghost btn-sm" data-kp="none">Clear</button></div>
    <div class="chips">${all.map(L=>`<label class="chip" ${hide(L)?"hidden":""}><input type="checkbox" name="${esc(name)}" value="${esc(L.id)}" data-c="${esc((L.courses||[]).join(" "))}" ${ids.has(L.id)?"checked":""}><span>${esc(L.name)}${L.stage?` <i>${esc(L.stage)}</i>`:""}</span></label>`).join("")}</div>
    <p class="small kpn" aria-live="polite">${kpCount(ids.size)}</p></div>`;
}
const kpCount=n=>n?`${n} learner${n===1?"":"s"} picked.`:`No one picked yet.`;
function kpSync(box){const n=box.querySelectorAll('input[type=checkbox]:checked').length;const p=box.querySelector(".kpn");if(p)p.textContent=kpCount(n);}
function kpFilter(form){const box=form&&form.querySelector(".kpick[data-kpcourse]");if(!box)return;const sel=form.querySelector('select[name="course"]');const c=sel?sel.value:"";
  box.querySelectorAll("label.chip").forEach(l=>{const i=l.querySelector("input");l.hidden=!!c&&!i.checked&&!(" "+i.dataset.c+" ").includes(" "+c+" ");});
  box.querySelectorAll("[data-bc]").forEach(b=>{b.hidden=!!c&&!!b.dataset.bc&&b.dataset.bc!==c;});}
if(!window.__kpWired){window.__kpWired=true;
  document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-kp]");if(!b)return;e.preventDefault();const box=b.closest(".kpick");if(!box)return;const k=b.dataset.kp;
    const boxes=[...box.querySelectorAll('label.chip input[type=checkbox]')];
    if(k==="none")boxes.forEach(i=>{i.checked=false});
    else if(k==="all")boxes.forEach(i=>{if(!i.closest("label").hidden)i.checked=true});
    else if(k.startsWith("b:")){const bt=D.batches&&D.batches[k.slice(2)];const set=new Set((bt&&bt.learners)||[]);boxes.forEach(i=>{if(set.has(i.value)){i.checked=true;i.closest("label").hidden=false;}});}
    kpSync(box);},true);
  document.addEventListener("change",e=>{const t=e.target;if(!t||!t.closest)return;const box=t.closest(".kpick");if(box){kpSync(box);return;}
    if(t.name==="course"&&t.form)kpFilter(t.form);},true);
}
function sessKids(f){const el=f.course,form=el&&(el.form||el.closest("form"));const root=form||document.getElementById("modal-root")||document;
  const ids=[...root.querySelectorAll('input[name="sl"]:checked')].map(x=>x.value);
  const keep=(f.keepfor&&f.keepfor.value?f.keepfor.value.split(","):[]).filter(Boolean);
  if(!ids.length&&!keep.length)throw userErr("Pick the learners for this class. Only they will see it and its join link.");
  return [...keep,...ids];}
function sessPickHTML(s,cid){const cs=courseList();const c0=s.courseId||cid||(cs[0]||{}).id||"";const pool=role()==="admin"?activeLearners():scopedLearners();
  return `<div class="field"><span class="lbl">Learners in this class</span>${kidPicker("sl",realLids(s),pool,true,c0)}<input type="hidden" name="keepfor" value="${esc(((s.forLids)||[]).filter(x=>x&&x[0]==="_").join(","))}"><span class="hint">Only the learners you pick see this class and its join link.</span></div>`;}
function noKidsAlert(){const xs=scopedSessions().filter(s=>sessEnd(s)>Date.now()&&noKidsClass(s)).sort((a,b)=>String(a.startsAt).localeCompare(String(b.startsAt)));if(!xs.length)return "";
  return `<section class="alert a-sun"><b>${xs.length} upcoming class${xs.length===1?" has":"es have"} no learners picked</b><span class="small">Children only see classes they are picked for. Next: ${esc(xs[0].title||"Live class")}, ${esc(fmtDay(new Date(xs[0].startsAt)))}</span><span class="spacer"></span><button class="btn btn-primary btn-sm" data-act="editSession" data-id="${esc(xs[0].id)}">Pick learners</button></section>`;}

/* ---------- finished classes ---------- */
function kidDonePill(s){const mk=allMarks()[s.id];
  if(mk&&isKidSide())for(const L of myKids()){const st=L&&mk.m[L.id];if(st)return attPill(st);}
  return mk||s.doneAt?`<span class="pill p-good">Completed</span>`:`<span class="pill p-mute">Ended</span>`;}
function lastClassLine(L){const h=kidHistory(L)[0];if(!h||Date.now()-new Date(h.date).getTime()>30*864e5)return "";
  return `<p class="small lastcls">Last class: <b>${esc(h.title||"Class")}</b> · ${esc(fmtDay(new Date(h.date)))} ${attPill(h.st)}</p>`;}

/* ---------- worksheets ---------- */
const sheetList=()=>libItems().filter(x=>x.asset&&(x.type==="worksheet"||x.type==="printable"));
async function uploadSheet(file,title,stage){
  if(!/^(application\/pdf|image\/)/.test(file.type||""))throw userErr("Upload a PDF or a picture (JPG or PNG).");
  if(file.size>10*1024*1024)throw userErr("That file is over 10 MB. Try a smaller PDF or photo.");
  const as=await window.claude.use("assets");if(!as)throw userErr("Uploading isn't available for your account.");
  let r;try{r=await as.upload(file);}catch(e){throw userErr("Upload failed. Check your connection and try again.");}
  const name=(title||String(file.name||"Worksheet").replace(/\.[^.]+$/,"")).slice(0,100);
  const ref=S.db.collection("library").doc();
  await ref.set({type:"worksheet",stage:stage||"",title:name,url:"",asset:r.id,ctype:file.type||"",vocab:"",tags:"",notes:"",by:S.uid,at:Date.now()});
  return {asset:r.id,name,lib:ref.id,type:file.type||""};}
function sheetHTML(h){const x=h&&h.sheet;if(!x||!x.asset)return "";const u=window.LL_assetUrl?LL_assetUrl(x.asset):"";if(!u)return "";
  const img=/^image\//.test(x.type||"")||/\.(png|jpe?g|webp|gif)$/i.test(x.asset);
  return `<div class="sheetbox">${img?`<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="${esc(x.name||"Worksheet")}" loading="lazy"></a>`:""}<div class="row" style="flex-wrap:nowrap"><span class="sheeticon" aria-hidden="true">📝</span><b class="grow">${esc(x.name||"Worksheet")}</b><a class="btn btn-primary btn-sm" href="${esc(u)}" target="_blank" rel="noopener">${ic("open")}Open worksheet</a></div></div>`;}
function sheetsPanel(){const xs=sheetList();
  return `<section class="card panel sheetsp"><div class="ph"><h2>My worksheets</h2><button class="btn btn-ghost btn-sm" data-act="newSheet">${ic("plus")}Upload worksheet</button></div>
  ${xs.length?`<div class="list">${xs.map(x=>`<div class="item"><span class="sheeticon" aria-hidden="true">📝</span><div class="grow"><div class="t">${esc(x.title)}</div><div class="s">${esc(x.stage||"Any stage")} · ${esc(fmtDay(new Date(x.at||Date.now())))}${x.by&&x.by!==S.uid?" · "+esc(byWho(x.by)):""}</div></div><div class="acts wrap"><a class="btn btn-ghost btn-sm" href="${esc(libHref(x)||"#")}" target="_blank" rel="noopener">${ic("open")}Open</a><button class="btn btn-primary btn-sm" data-act="assignSheet" data-id="${esc(x.id)}">Assign</button>${x.by===S.uid||role()==="admin"?`<button class="iconbtn" data-act="delLib" data-id="${esc(x.id)}" aria-label="Delete ${esc(x.title)}">${ic("trash")}</button>`:""}</div></div>`).join("")}</div>`
  :`<p class="muted small">Upload your own worksheets (PDF or photo). Then tap Assign to give one to learners as homework.</p>`}</section>`;}
A.newSheet=()=>openModal("Upload a worksheet",`<div class="field"><label for="ws-f">Worksheet file</label><input type="file" id="ws-f" name="file" accept="application/pdf,image/*" required data-label="Worksheet file"><span class="hint">PDF or photo, up to 10 MB.</span></div>
  <div class="two"><div class="field"><label for="ws-t">Name</label><input type="text" id="ws-t" name="title" maxlength="100" placeholder="e.g. Farm animals: match and colour"><span class="hint">Leave empty to use the file name.</span></div><div class="field"><label for="ws-s">Stage</label><select id="ws-s" name="stage">${opt("","Any stage")}${STAGES.map(x=>opt(x.v,x.v)).join("")}</select></div></div>`,
  {submitLabel:"Upload",done:"Worksheet saved. Tap Assign to give it as homework.",onSubmit:async f=>{const file=f.file.files&&f.file.files[0];if(!file)throw userErr("Choose a PDF or photo.");await uploadSheet(file,f.title.value.trim(),f.stage.value);}});
A.assignSheet=id=>{const x=D.library[id];if(!x)return;openModal("Set homework",hwForm({title:x.title},{lib:id}),{wide:true,submitLabel:"Set homework",done:"Homework set. Learners can see it now.",onSubmit:(f,form)=>saveHw(f,form,null)});bankRender();};
