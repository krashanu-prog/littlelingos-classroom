# ---- classes reach only picked children; homework with worksheets; mark class complete ----
# strict class visibility for children and parents
R('const seesSession=s=>{const r=role();if(r!=="student"&&r!=="parent")return true;if(!s.forLids||!s.forLids.length)return myKids().some(L=>L&&(L.courses||[]).includes(s.courseId)&&sessForLearner(s,L));return myKids().some(L=>L&&s.forLids.includes(L.id));};',
  'const seesSession=s=>{const r=role();if(r!=="student"&&r!=="parent")return true;return myKids().some(L=>L&&(s.forLids||[]).includes(L.id));};')
R('.filter(s=>(!s.forLids||!s.forLids.length)?sessForLearner(s,L):s.forLids.includes(L.id))', '.filter(s=>(s.forLids||[]).includes(L.id))')
# class form: pick learners
R('<span class="hint">The admin assigns trainers to classes and learners.</span>`}</div></div>',
  '<span class="hint">The admin assigns trainers to classes and learners.</span>`}</div></div>\n  ${sessPickHTML(s,cid)}')
R('const sessData=f=>{', 'const sessData=f=>{const _fl=sessKids(f);')
R('return {courseId:f.course.value,trainerId:', 'return {forLids:_fl,courseId:f.course.value,trainerId:')
R('forLids:x.lid?[x.lid]:[],createdBy:S.uid', 'forLids:x.lid?[x.lid]:[],makeup:true,createdBy:S.uid')
R('${s.forLids&&s.forLids.length?` <span class="pill p-info">Make-up</span>`:""}',
  '${s.makeup||/^Make-up/.test(s.title||"")?` <span class="pill p-info">Make-up</span>`:noKidsClass(s)?` <span class="pill p-warn">No learners picked</span>`:""}')
R('${newAssignCard()}', '${newAssignCard()}${noKidsAlert()}')
R('if(pendingLeave)att2.push(', '{const nk=entries(D.sessions).filter(s=>sessEnd(s)>Date.now()&&noKidsClass(s)).length;if(nk)att2.push(`<button class="chipbtn bad" data-go="schedule">${nk} class${nk===1?"":"es"} with no learners picked</button>`);}if(pendingLeave)att2.push(')
# mark class complete
R('${ic("check")}${here}/${v.length} here</button>`}', '${ic("check")}Completed · ${here}/${v.length} present</button>`}')
R('${ic("clip")}Take attendance</button>`;', '${ic("check")}Mark complete</button>`;')
R('const body=list.length?`<p class="small muted">${esc(c?c.title:"")} · ',
  'const body=list.length?`<p class="small">Mark who came and who was absent, then tap <b>${mk?"Save changes":"Mark class complete"}</b>. The admin, parents and learners see the result.</p><p class="small muted">${esc(c?c.title:"")} · ')
R('openModal(s.title||"Take attendance",body,{wide:true,noFocus:true,submitLabel:"Save attendance",done:"Attendance saved",',
  'openModal("Finish class: "+(s.title||"Live class"),body,{wide:true,noFocus:true,submitLabel:mk?"Save changes":"Mark class complete",done:"Class marked complete. Families can see it now.",')
R('if(Object.keys(upd).length)await S.db.doc("sessions/"+sid).update(upd);',
  'if(Object.keys(upd).length)await S.db.doc("sessions/"+sid).update(upd);if(!s.doneAt){try{await S.db.doc("sessions/"+sid).update({doneAt:Date.now(),doneBy:S.uid})}catch(e){}}')
R('<h2>Still need attendance</h2>', '<h2>Classes to mark complete</h2>')
R('${unmarked} class${unmarked===1?"":"es"} need attendance', '${unmarked} class${unmarked===1?"":"es"} not marked complete')
R('(past&&!opts.attend?`<span class="pill p-mute">Ended</span>`:"")', '(past&&!opts.attend?kidDonePill(s):"")')
R('${h?attPill(h.st):""}', '${h?attPill(h.st):past&&s.doneAt?`<span class="pill p-good">Completed</span>`:""}')
R('<p class="small muted">${s.next?`Next class:', '${lastClassLine(L)}<p class="small muted">${s.next?`Next class:')
# homework: crisper form, worksheets
_i=s.index('function hwForm(h={}){'); _j=s.index('A.newHw=()=>',_i)
s=s[:_i]+open(W+'hw2_block.js').read()+open(W+'cls2_block.js').read()+s[_j:]
R('to add one to step 3', 'to add it to the task')
R('Set homework for a course or for chosen learners, then read their answers and reply. Pick ready-made activities by age group and skill.',
  'Pick learners, add your own worksheet or a task, and set a due date. Then read their answers and reply.')
R('<button class="btn btn-primary" data-act="newHw">${ic("plus")}Set homework</button></div>\n  ${hs.length?',
  '<div class="row"><button class="btn btn-ghost" data-act="newSheet">${ic("plus")}Upload worksheet</button><button class="btn btn-primary" data-act="newHw">${ic("plus")}Set homework</button></div></div>\n  ${hs.length?')
R('"buzz")}`;\n}\n\n/* ---------- PARENT ---------- */', '"buzz")}${sheetsPanel()}`;\n}\n\n/* ---------- PARENT ---------- */')
R('<span class="stamp sm ${hue(c)}">${esc(c?langCode(c):"HW")}</span><div style="flex:1;min-width:0"><h3>${esc(h.title)}</h3>',
  '<span class="stamp sm ${hue(c)}">${esc(c?langCode(c):"HW")}</span><div style="flex:1;min-width:0"><h3>${esc(h.title)}${h.sheet?" 📝":""}</h3>')
R('<div class="prose" style="font-size:.98rem;margin-top:8px">${paras(h.instructions)}</div></details>`:""}',
  '<div class="prose" style="font-size:.98rem;margin-top:8px">${paras(h.instructions)}</div></details>`:""}${sheetHTML(h)}')
R('${h.instructions?`<div class="prose" style="font-size:1rem">${paras(h.instructions)}</div>`:""}',
  '${sheetHTML(h)}${h.instructions?`<div class="prose" style="font-size:1rem">${paras(h.instructions)}</div>`:""}')
R('${h.instructions?`<div class="prose" style="font-size:1.05rem">${paras(h.instructions)}</div>`:""}',
  '${sheetHTML(h)}${h.instructions?`<div class="prose" style="font-size:1.05rem">${paras(h.instructions)}</div>`:""}')
R('@media (prefers-reduced-motion:reduce)',open(W+'cls2.css').read()+'@media (prefers-reduced-motion:reduce)')
R('data-go="schedule">Calendar</button></div></section>`;})()', 'data-go="schedule">Calendar</button></div>${lastClassLine(L)}</section>`;})()')
R('New classes appear here as soon as the teacher schedules them.</p></section>', 'New classes appear here as soon as the teacher schedules them.</p>${lastClassLine(L)}</section>')
