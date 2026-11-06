# ---- class reports required for every child right after each class ----
R('''<input type="text" class="mnote" name="n_${esc(L.id)}" maxlength="200" value="${esc((mk&&mk.notes||{})[L.id]||"")}" placeholder="Note for ${esc(firstOf(L.name))}'s family (optional)" aria-label="Note for ${esc(L.name)}'s family">''','''${srepFields(L,(mk&&mk.notes||{})[L.id]||"")}''')
R('''const notes={};for(const L of list){const t=form.querySelector(`input[name="n_${CSS.escape(L.id)}"]`);if(t&&t.value.trim())notes[L.id]=t.value.trim();}''','''const notes=srepCollect(list,m,form);''')
R('''The admin, parents and learners see the result.</p>''','''The admin, parents and learners see the result.</p><p class="small srepreq"><b>Required:</b> a short report for every child marked Present or Late: participation, a rating for each skill practised, and a sentence for the family.</p>${srepSkillPick(mk)}''')
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
# ---- parent Progress: one tight report instead of repeated half-empty cards ----
_i=s.index('function parentProgress(){')
_a=s.index('${kidBar()}${memoriesHTML(L)}${reelCardHTML(L)}${capParentHTML(L)}',_i)
_b=s.index('${kidReports(L)}${confParentHTML(L)}',_a)
s=s[:_a]+'${kidBar()}${memoriesHTML(L)}${reelCardHTML(L)}\n  ${parentReportHTML(L)}\n  ${adaptParentHTML(L)}\n  '+s[_b:]
R('${kidReports(L)}${confParentHTML(L)}${spParentHTML(L)}${ppParentHTML(L)}${sharesCardHTML(L)}${kidExtras(L)}\n  <section class="card panel"><h2>Topics covered</h2>${topics.length?',
  '${kidReports(L)}${confParentHTML(L)}${spParentHTML(L)}${ppParentHTML(L)}${kidExtras(L)}${capParentHTML(L)}${sharesCardHTML(L)}\n  ${topics.length?`<section class="card panel"><h2>Topics covered</h2>${topics.length?')
R('''they're listed here after ${esc(firstOf(L.name))} attends.</p>`}</section>`;''','''they're listed here after ${esc(firstOf(L.name))} attends.</p>`}</section>`:""}`;''')
R('''<p class="lede">${esc(firstOf(L.name))}'s level, course completion, skills and every word learned so far.</p>''','''<p class="lede">How ${esc(firstOf(L.name))} is doing: one report from the app and the teachers.</p>''')
R('function kidExtras(L){if(!L.uid)return kidReports(L);','function kidExtras(L){if(!L.uid)return "";')
R('.repstats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin:6px 0 4px}','.repstats{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:8px;margin:4px 0 2px}')
R('.repstats div{background:var(--soft);border-radius:16px;padding:12px;text-align:center}','.repstats div{background:var(--soft);border-radius:14px;padding:8px 6px;text-align:center}')
R('.repstats b{display:block;font-family:var(--display);font-size:1.5rem;line-height:1.1;color:var(--soil)}','.repstats b{display:block;font-family:var(--display);font-size:1.25rem;line-height:1.1;color:var(--soil)}')
R('.repcard h3{font-size:1.05rem;margin:14px 0 8px}','''.repcard h3{font-size:.95rem;margin:0 0 6px}
.repcard h2 .pill{vertical-align:middle;margin-left:6px}
.repgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:10px 18px;margin-top:10px}
.repsec{border-top:1px solid var(--line);padding-top:10px}
.reprow{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(56px,1fr) auto;align-items:center;gap:8px;min-height:30px;font-size:.88rem}
.reprow .bar{height:8px}
.reprow span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.reprow .repdots{grid-column:2/4;justify-self:end}
.reptr{background:var(--soft);border-radius:12px;padding:8px 10px;margin-bottom:6px;font-size:.92rem}
.repws{display:flex;flex-wrap:wrap;gap:6px}
.repw{display:inline-flex;align-items:center;gap:4px;background:var(--sunSoft);border-radius:999px;padding:4px 10px;font-size:.88rem}
.repw i{font-style:normal;color:var(--muted);font-size:.78rem}''')
R('.repsum{background:var(--leafSoft);border-radius:18px;padding:14px 16px;margin:4px 0 10px}','.repsum{background:var(--leafSoft);border-radius:16px;padding:10px 14px;margin:2px 0 8px;font-size:.95rem}')
# ---- six skills everywhere: assessments and term reports too ----
R('const SKILLS=[["speaking","Speaking"],["listening","Listening"],["reading","Reading"],["writing","Writing"]];','const SKILLS=[["listening","Listening"],["reading","Reading"],["writing","Writing"],["vocabulary","Vocabulary"],["grammar","Grammar"],["speaking","Speaking"]];')
R('${SKILLS.map(([k,l])=>`${l} ${d.skills[k]}/5`).join(" · ")}','${SKILLS.filter(([k])=>d.skills[k]).map(([k,l])=>`${l} ${d.skills[k]}/5`).join(" · ")}')
R('${d.skills?SKILLS.map(([k,l])=>`<tr><td>${l}</td><td style="text-align:right">${d.skills[k]} / 5</td></tr>`).join(""):""}','${d.skills?SKILLS.filter(([k])=>d.skills[k]).map(([k,l])=>`<tr><td>${l}</td><td style="text-align:right">${d.skills[k]} / 5</td></tr>`).join(""):""}')
R('.srepreq{background:var(--sunSoft);border-radius:12px;padding:8px 12px}','.srepreq{background:var(--sunSoft);border-radius:12px;padding:8px 12px}\n.srskpick{border:2px solid var(--line);border-radius:14px;padding:8px 12px;margin:0 0 10px}\n.srskpick .row{flex-wrap:wrap;gap:6px;margin-top:6px}\n.srsel[hidden]{display:none}')
R('.repw i{font-style:normal;color:var(--muted);font-size:.78rem}','''.repw i{font-style:normal;color:var(--muted);font-size:.78rem}
.rep6wrap{margin-top:10px}
.rep6{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.rep6t{border-radius:14px;padding:10px;display:flex;flex-direction:column;gap:3px;background:var(--soft);border:2px solid transparent}
.rep6t.lv3{background:var(--leafSoft);border-color:var(--sprout)}
.rep6t.lv2{background:var(--leafSoft)}
.rep6t.lv1{background:var(--sunSoft)}
.rep6t.lv0{background:var(--petalSoft)}
.rep6h{display:flex;align-items:center;gap:6px;font-size:.95rem}
.rep6lv{font-family:var(--display);font-weight:800;font-size:1.1rem;color:var(--soil)}
.rep6bar{height:6px;border-radius:999px;background:rgba(0,0,0,.08);overflow:hidden}
.rep6bar i{display:block;height:100%;background:var(--leaf);border-radius:999px}
.rep6t small{font-size:.76rem;color:var(--muted);line-height:1.3}''')
