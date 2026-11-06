# ---- class reports required for every child right after each class ----
R('''<input type="text" class="mnote" name="n_${esc(L.id)}" maxlength="200" value="${esc((mk&&mk.notes||{})[L.id]||"")}" placeholder="Note for ${esc(firstOf(L.name))}'s family (optional)" aria-label="Note for ${esc(L.name)}'s family">''','''${srepFields(L,(mk&&mk.notes||{})[L.id]||"")}''')
R('''const notes={};for(const L of list){const t=form.querySelector(`input[name="n_${CSS.escape(L.id)}"]`);if(t&&t.value.trim())notes[L.id]=t.value.trim();}''','''const notes=srepCollect(list,m,form);''')
R('''The admin, parents and learners see the result.</p>''','''The admin, parents and learners see the result.</p><p class="small srepreq"><b>Required:</b> a short report for every child marked Present or Late: participation, understanding and a sentence for the family.</p>''')
R('/* ================= events ================= */',open(W+'srep_block.js').read()+'\n/* ================= events ================= */')
R('@media (prefers-reduced-motion:reduce)','''.srep{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;width:100%;margin-top:6px}
.srep textarea{grid-column:1/-1;width:100%}
.srsel{display:flex;flex-direction:column;gap:2px;font-size:.82rem;font-weight:700}
.srsel select{min-height:44px}
.srep.srmiss{outline:3px solid var(--bad);outline-offset:4px;border-radius:12px}
.srepreq{background:var(--sunSoft);border-radius:12px;padding:8px 12px}
.srepban{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px}
@media (prefers-reduced-motion:reduce)''')
# ---- Words: only the child's own age group (lesson words from their stage's courses; class words stay) ----
R('function wordsWithMeaning0(uid){const out=[],seen=new Set();if(!uid)return out;for(const x of doneList(uid)){const l=D.lessons[x.lid];if(!l)continue;const c=D.courses[l.courseId];',
  'function wordsWithMeaning0(uid){const out=[],seen=new Set();if(!uid)return out;const LS=learnerByUid(uid)||(uid===S.uid?myLearner():null);if(LS&&LS.preview)return courseVocab(LS).filter(x=>x.m).map(x=>({...x,ts:0}));const okC=LS?new Set(learnCourses(LS)):null;for(const x of doneList(uid)){const l=D.lessons[x.lid];if(!l)continue;if(okC&&!okC.has(l.courseId))continue;const c=D.courses[l.courseId];')
