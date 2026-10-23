# ---- Activity bank in "Set homework" ----
R('''  <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="lbl" style="margin-bottom:8px">Learners</legend>${ls.length?`<div class="checks">${ls.map(L=>`<label><input type="checkbox" name="hwl" value="${esc(L.id)}" ${chosen.has(L.id)?"checked":""}>${esc(L.name)}</label>`).join("")}</div>`:`<p class="small muted">No learners assigned to you yet.</p>`}</fieldset>`;
}''','''  <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="lbl" style="margin-bottom:8px">Learners</legend>${ls.length?`<div class="checks">${ls.map(L=>`<label><input type="checkbox" name="hwl" value="${esc(L.id)}" ${chosen.has(L.id)?"checked":""}>${esc(L.name)}${L.stage?` <span class="small muted">· ${esc(L.stage)}</span>`:""}</label>`).join("")}</div>`:`<p class="small muted">No learners assigned to you yet.</p>`}</fieldset>`;
}''')
R('''  return `<div class="field"><label for="hw-title">Title</label><input type="text" id="hw-title" name="title" required maxlength="100" data-label="Title"''',
  '''  return `${bankPickerHTML(h)}<div class="field"><label for="hw-title">Title</label><input type="text" id="hw-title" name="title" required maxlength="100" data-label="Title"''')
R('''const data={title,instructions:f.ins.value.trim(),due:f.due.value||null,courseId:who==="course"?f.course.value:null,learnerIds:who==="learners"?ids:[]};''',
  '''const data={title,instructions:f.ins.value.trim(),due:f.due.value||null,courseId:who==="course"?f.course.value:null,learnerIds:who==="learners"?ids:[],stage:(f.bkstage&&f.bkstage.value)||null,skill:(f.bkskill&&f.bkskill.value)||null,bankIds:f.bkids&&f.bkids.value?f.bkids.value.split(",").filter(Boolean).slice(0,20):[]};''')
R('''A.newHw=()=>openModal("Set homework",hwForm(),{wide:true,''','''A.newHw=()=>{openModal("Set homework",hwForm(),{wide:true,''')
R('''done:"Homework set. Learners can see it now.",onSubmit:(f,form)=>saveHw(f,form,null)});''','''done:"Homework set. Learners can see it now.",onSubmit:(f,form)=>saveHw(f,form,null)});bankRender();};''')
R('''A.editHw=key=>{const h=hwByKey(key);if(h)openModal("Edit homework",hwForm(h),{wide:true,done:"Homework saved",onSubmit:(f,form)=>saveHw(f,form,h)});};''',
  '''A.editHw=key=>{const h=hwByKey(key);if(h){openModal("Edit homework",hwForm(h),{wide:true,done:"Homework saved",onSubmit:(f,form)=>saveHw(f,form,h)});bankRender();}};''')
R('<p class="lede">Set homework for a course or for chosen learners, then read their answers and reply.</p>',
  '<p class="lede">Set homework for a course or for chosen learners, then read their answers and reply. Pick ready-made activities by age group and skill.</p>')
R('/* ================= events ================= */',open(W+'bank_block.js').read()+'\n/* ================= events ================= */')
R('@media (prefers-reduced-motion:reduce)','''.bankbox{border:2px solid var(--line);border-radius:20px;padding:12px 16px;background:var(--leafSoft)}
.bankbox>summary{cursor:pointer;font-family:var(--display);font-size:1.1rem;list-style-position:inside}
.bankbox[open]>summary{margin-bottom:10px}
.bk-filters{display:grid;grid-template-columns:1fr 1fr 1.3fr;gap:10px}
.banklist{display:flex;flex-direction:column;gap:8px;max-height:320px;overflow:auto;margin:10px 0;padding-right:4px}
.bk-item{display:flex;gap:10px;align-items:flex-start;background:#fff;border-radius:14px;padding:10px 12px;border:1px solid var(--line)}
.bk-t{font-weight:700}.bk-meta{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:.8rem;color:var(--muted);margin:3px 0}
.bk-meta .pill{font-size:.75rem}.bk-ours{background:var(--sunSoft)!important}
.bk-d{font-size:.88rem;color:var(--muted);line-height:1.4}.bk-acts{display:flex;gap:6px;align-items:center;flex:none}
.bk-sure{background:var(--badSoft)!important;color:var(--bad)!important}
.bk-words{display:flex;gap:10px;align-items:flex-end;margin-bottom:8px}
@media (max-width:640px){.bk-filters{grid-template-columns:1fr 1fr}.bk-filters .field:last-child{grid-column:1/-1}.bk-words{flex-direction:column;align-items:stretch}}
@media (prefers-reduced-motion:reduce)''')
