# ---- no class without learners: list the ones missing learners, and block new ones everywhere ----
R('/* ================= events ================= */',open(W+'nk_block.js').read()+'\n/* ================= events ================= */')
# admin attention chip and trainer alert open the list
R('{const nk=entries(D.sessions).filter(s=>sessEnd(s)>Date.now()&&noKidsClass(s)).length;if(nk)att2.push(`<button class="chipbtn bad" data-go="schedule">',
  '{const nk=entries(D.sessions).filter(s=>sessEnd(s)>Date.now()&&noKidsClass(s)).length;if(nk)att2.push(`<button class="chipbtn bad" data-act="noKidsList">')
R('<button class="btn btn-primary btn-sm" data-act="editSession" data-id="${esc(xs[0].id)}">Pick learners</button></section>`;}',
  '${xs.length>1?`<button class="btn btn-primary btn-sm" data-act="noKidsList">See them</button>`:`<button class="btn btn-primary btn-sm" data-act="editSession" data-id="${esc(xs[0].id)}">Pick learners</button>`}</section>`;}')
# after picking learners from the list, come back to the list while any are left
R('A.editSession=id=>openModal("Edit class",sessionForm(D.sessions[id]),{wide:true,done:"Class saved",',
  'A.editSession=(id,fromList)=>openModal("Edit class",sessionForm(D.sessions[id]),{wide:true,done:"Class saved",after:()=>{if(fromList===true)setTimeout(()=>{if(noKidsUpcoming().length)A.noKidsList();},300);},')
# batches always have learners, so their classes do too
R('const lids=[...form.querySelectorAll(\'input[name="lids"]:checked\')].map(x=>x.value);if(f.type.value==="1:1"&&lids.length>1)',
  'const lids=[...form.querySelectorAll(\'input[name="lids"]:checked\')].map(x=>x.value);if(!lids.length)throw userErr("Pick at least one learner for this batch. Its classes only reach the learners in it.");if(f.type.value==="1:1"&&lids.length>1)')
R('async function removeFromBatch(bid,lid){const b=D.batches[bid];if(!b)return;const ls=(b.learners||[]).filter(x=>x!==lid);',
  'async function removeFromBatch(bid,lid){const b=D.batches[bid];if(!b)return;const ls=(b.learners||[]).filter(x=>x!==lid);if(!ls.length)throw userErr("A batch needs at least one learner. Add another learner first, or delete the batch.");')
R('async function genBatchClasses(bid,b,fromDate,weeks){if(!weeks)return 0;', 'async function genBatchClasses(bid,b,fromDate,weeks){if(!weeks)return 0;if(!(b.learners||[]).length)throw userErr("Add learners to this batch before adding classes.");')
# make-up classes need the learner
R('forLids:x.lid?[x.lid]:[],makeup:true,', 'forLids:(()=>{if(!x.lid)throw userErr("This request has no learner, so a make-up class can\'t be booked. Move the class instead.");return [x.lid];})(),makeup:true,')
# CSV import: learners column
R('<p class="small muted">Columns: course, title, date (YYYY-MM-DD), time (HH:MM), minutes, trainer, link.</p>',
  '<p class="small muted">Columns: course, title, date (YYYY-MM-DD), time (HH:MM), minutes, trainer, link, learners (names separated by ;). Rows without learners are skipped.</p>')
R('const [course,title,date,time,mins,tr,link]=r.map(x=>(x||"").trim());const c=findCourse(course);const at=new Date(`${date}T${time||"17:00"}`);if(!c||isNaN(at)){skip++;continue}',
  'const [course,title,date,time,mins,tr,link,kids]=r.map(x=>(x||"").trim());const c=findCourse(course);const at=new Date(`${date}T${time||"17:00"}`);const lids=String(kids||"").split(/[;|]/).map(normName).filter(Boolean).map(n=>(activeLearners().find(L=>normName(L.name)===n)||{}).id).filter(Boolean);if(!c||isNaN(at)||!lids.length){skip++;continue}')
R('durationMin:+mins||40,joinUrl:safeUrl(link),notes:"",createdBy:S.uid,createdAt:Date.now()});n++;}await audit("Imported classes"',
  'durationMin:+mins||40,joinUrl:safeUrl(link),notes:"",forLids:[...new Set(lids)],createdBy:S.uid,createdAt:Date.now()});n++;}await audit("Imported classes"')
R('${skip?`, ${skip} skipped (course not found or bad date)`:""}', '${skip?`, ${skip} skipped (course not found, bad date or no learners)`:""}')
