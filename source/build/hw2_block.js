function hwForm(h={},pre={}){
  const cs=courseList(), ls=scopedLearners(), admin=role()==="admin", isNew=!h.id;
  const wasCourse=!!(h.id&&!(h.learnerIds&&h.learnerIds.length)&&h.courseId);
  const twoWays=admin||wasCourse;
  const defC=h.courseId||(cs.find(c=>c.teacherId&&c.teacherId===myTid())||cs[0]||{}).id;
  const sheets=sheetList(), sh=h.sheet&&h.sheet.asset?h.sheet:null, shUrl=sh&&window.LL_assetUrl?LL_assetUrl(sh.asset):"";
  return `<div class="hwf hwf2">
  <section class="hwstep"><h3><span class="num">1</span>Who is it for?</h3>
    ${twoWays?`<div class="seg" role="radiogroup" aria-label="Who is it for"><label><input type="radio" name="who" value="learners" ${wasCourse?"":"checked"}>Chosen learners</label><label><input type="radio" name="who" value="course" ${wasCourse?"checked":""}>A whole course</label></div>`:`<input type="hidden" name="who" value="learners">`}
    <div class="hw-learners">${kidPicker("hwl",h.learnerIds||[],ls,false)}</div>
    ${twoWays?`<div class="hw-course field"><label for="hw-course">Course</label><select id="hw-course" name="course">${cs.map(c=>opt(c.id,c.title,c.id===defC)).join("")}</select><span class="hint">Everyone in this course gets the homework.</span></div>`:""}
  </section>
  <section class="hwstep"><h3><span class="num">2</span>The task</h3>
    <div class="field"><label for="hw-title">Title</label><input type="text" id="hw-title" name="title" required maxlength="100" data-label="Title" value="${esc(h.title||"")}" placeholder="e.g. Farm animals worksheet"></div>
    <div class="sheetpick"><span class="lbl">📝 Worksheet <span class="opt">optional</span></span>
      ${sh?`<div class="row sheetcur"><b class="grow">${esc(sh.name||"Worksheet")}</b>${shUrl?`<a class="btn btn-ghost btn-sm" href="${esc(shUrl)}" target="_blank" rel="noopener">${ic("open")}Open</a>`:""}<label class="small"><input type="checkbox" name="sheetdel"> Remove</label></div>`:""}
      <div class="two"><div class="field"><label for="hw-file">${sh?"Replace with a new file":"Upload a worksheet"}</label><input type="file" id="hw-file" name="sheetfile" accept="application/pdf,image/*"><span class="hint">PDF or photo, up to 10 MB. It's also kept in My worksheets.</span></div>
      ${sheets.length?`<div class="field"><label for="hw-sheet">Or pick a saved worksheet</label><select id="hw-sheet" name="sheetlib">${opt("","None",!pre.lib)}${sheets.map(x=>opt(x.id,x.title,x.id===pre.lib)).join("")}</select></div>`:""}</div>
    </div>
    <div class="field"><label for="hw-ins">Instructions <span class="opt">optional</span></label><textarea id="hw-ins" name="ins" rows="4" maxlength="4000" placeholder="e.g. Colour the animals and say each name out loud.">${esc(h.instructions||"")}</textarea></div>
  </section>
  <section class="hwstep"><h3><span class="num">3</span>Due date</h3>
    <div class="duerow"><input type="date" id="hw-due" name="due" aria-label="Due date" value="${esc(h.due||ymd(new Date(Date.now()+3*864e5)))}">${[["Tomorrow",1],["In 3 days",3],["In a week",7]].map(([t,n])=>`<button type="button" class="btn btn-ghost btn-sm" data-due="${n}">${t}</button>`).join("")}</div>
  </section>
  <details class="hwbank"><summary>Use a ready-made activity from our bank <span class="opt">optional</span></summary>${bankPickerHTML(h)}
    ${isNew?`<label class="savebank"><input type="checkbox" name="tobank"> Also save this task to our activity bank so other trainers can use it</label>`:""}</details>
  </div>`;
}
async function saveHw(f,form,h){
  const title=f.title.value.trim(); if(!title)throw userErr("Add a title.");
  const wEl=form.querySelector('input[name="who"]:checked')||form.querySelector('input[name="who"][type="hidden"]');const who=wEl?wEl.value:"learners";
  const ids=[...form.querySelectorAll('input[name="hwl"]:checked')].map(x=>x.value);
  if(who==="learners"&&!ids.length)throw userErr("Tick at least one learner.");
  if(who==="course"&&!(f.course&&f.course.value))throw userErr("Create a course first, or choose learners.");
  let sheet=(h&&h.sheet)||null; if(f.sheetdel&&f.sheetdel.checked)sheet=null;
  const file=f.sheetfile&&f.sheetfile.files&&f.sheetfile.files[0];
  if(file)sheet=await uploadSheet(file,title,(f.bkstage&&f.bkstage.value)||"");
  else if(f.sheetlib&&f.sheetlib.value){const x=D.library[f.sheetlib.value];if(x&&x.asset)sheet={asset:x.asset,name:x.title,lib:x.id,type:x.ctype||""};}
  if(!sheet&&!f.ins.value.trim()&&!(f.bkids&&f.bkids.value))throw userErr("Add a worksheet or write what the learner should do.");
  const data={title,instructions:f.ins.value.trim(),due:f.due.value||null,courseId:who==="course"?f.course.value:null,learnerIds:who==="learners"?ids:[],sheet,stage:(f.bkstage&&f.bkstage.value)||null,skill:(f.bkskill&&f.bkskill.value)||null,bankIds:f.bkids&&f.bkids.value?f.bkids.value.split(",").filter(Boolean).slice(0,20):[]};
  if(!h&&f.tobank&&f.tobank.checked){const st=data.stage||(form.querySelector("#bk-stage")||{}).value||bankStageFor(ids), sk=data.skill||(form.querySelector("#bk-skill")||{}).value;
    if(!st||!sk)throw userErr("To save it to the activity bank, choose an age group and a skill in the activity bank section.");
    try{await S.db.collection("bank").doc().set({stage:st,skill:sk,title:title.slice(0,100),instructions:data.instructions.slice(0,4000),questions:[],minutes:null,by:S.uid,byName:myName()||"",at:Date.now()});}catch(e){}}
  if(h)await S.db.doc(`tw/${h.uid}/x/${h.id}`).update(data);
  else await S.db.collection(`tw/${S.uid}/x`).doc().set({...data,kind:"hw",at:Date.now(),by:S.uid,feedback:{}});
}
