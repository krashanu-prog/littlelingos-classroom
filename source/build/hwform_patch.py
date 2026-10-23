# ---- Tighter, step-by-step "Set homework" form ----
def _swap(start, end, new):
    global s
    i = s.index(start); j = s.index(end, i)
    s = s[:i] + new + s[j:]
_swap('function hwForm(h={}){', 'async function saveHw', r'''function hwForm(h={}){
  const cs=courseList(), ls=scopedLearners(), isNew=!h.id, chosen=new Set(h.learnerIds||[]);
  const byL=h.id?!!(h.learnerIds&&h.learnerIds.length):ls.length>0;
  const defC=h.courseId||(cs.find(c=>c.teacherId&&c.teacherId===myTid())||cs[0]||{}).id;
  return `<div class="hwf">
  <section class="hwstep"><h3><span class="num">1</span>Who is it for?</h3>
    <div class="seg" role="radiogroup" aria-label="Who is it for"><label><input type="radio" name="who" value="learners" ${byL?"checked":""}>Chosen learners</label><label><input type="radio" name="who" value="course" ${byL?"":"checked"}>A whole course</label></div>
    <div class="hw-learners">${ls.length?`<div class="chips">${ls.map(L=>`<label class="chip"><input type="checkbox" name="hwl" value="${esc(L.id)}" ${chosen.has(L.id)?"checked":""}><span>${esc(L.name)}${L.stage?` <i>${esc(L.stage)}</i>`:""}</span></label>`).join("")}</div>`:`<p class="small muted">No learners are assigned to you yet. Choose a whole course instead.</p>`}</div>
    <div class="hw-course field"><label for="hw-course">Course</label><select id="hw-course" name="course">${cs.map(c=>opt(c.id,c.title,c.id===defC)).join("")}</select><span class="hint">Everyone in this course gets the homework.</span></div>
  </section>
  <section class="hwstep"><h3><span class="num">2</span>Pick an activity <span class="opt">optional</span></h3>
    ${bankPickerHTML(h)}
  </section>
  <section class="hwstep"><h3><span class="num">3</span>Check and set</h3>
    <div class="field"><label for="hw-title">Title</label><input type="text" id="hw-title" name="title" required maxlength="100" data-label="Title" value="${esc(h.title||"")}" placeholder="e.g. Draw and label your garden"></div>
    <div class="field"><label for="hw-ins">What should the learner do?</label><textarea id="hw-ins" name="ins" rows="6" maxlength="4000" placeholder="Write the task in simple steps. Activities you pick above appear here, and you can change them.">${esc(h.instructions||"")}</textarea></div>
    <div class="field"><label for="hw-due">Due date</label><div class="duerow"><input type="date" id="hw-due" name="due" value="${esc(h.due||ymd(new Date(Date.now()+3*864e5)))}">${[["Tomorrow",1],["In 3 days",3],["In a week",7]].map(([t,n])=>`<button type="button" class="btn btn-ghost btn-sm" data-due="${n}">${t}</button>`).join("")}</div></div>
    ${isNew?`<label class="savebank"><input type="checkbox" name="tobank"> Also save it to our activity bank so other trainers can use it</label>`:""}
  </section></div>`;
}
''')
_swap('function bankPickerHTML(h){', 'function bankAppend(', r'''function bankPickerHTML(h){
  bankLoad();
  const st=h&&h.stage||bankStageFor(h&&h.learnerIds);
  return `<div class="bankbox">
  <div class="bk-filters"><select id="bk-stage" aria-label="Age group">${opt("","All ages",!st)}${STAGES.map(s=>opt(s.v,`${s.v} · ${s.ages}`,s.v===st)).join("")}</select>
  <select id="bk-skill" aria-label="Skill">${opt("","All skills",!(h&&h.skill))}${BANK_SKILLS.map(([v,t])=>opt(v,t,h&&h.skill===v)).join("")}</select>
  <input id="bk-q" type="search" placeholder="Search, e.g. rhyme" aria-label="Search activities"></div>
  <p class="small muted bk-n"><span id="bk-n"></span> · tap <b>Use</b> to add one to step 3</p>
  <div id="bk-list" class="banklist"></div>
  <div id="bk-added" class="bk-added" aria-live="polite"></div>
  <details class="bk-more"><summary>Or make a word list from your own words</summary>
  <div class="bk-words"><input id="bk-w" type="text" maxlength="200" placeholder="e.g. brave, gentle, curious" aria-label="Words"><button type="button" class="btn btn-ghost btn-sm" data-bk="words">Make word list</button></div>
  <p class="hint">Meanings come from the free Datamuse word service. Check they suit your learner.</p></details>
  <input type="hidden" name="bkids" value="${esc((h&&h.bankIds||[]).join(","))}"><input type="hidden" name="bkstage" value="${esc(h&&h.stage||"")}"><input type="hidden" name="bkskill" value="${esc(h&&h.skill||"")}">
  </div>`;
}
''')
R('''<div class="bk-acts"><button type="button" class="btn btn-ghost btn-sm" data-bk="add" data-id="${esc(x.src+":"+x.id)}">Add</button>''',
  '''<div class="bk-acts"><button type="button" class="btn btn-ghost btn-sm" data-bk="add" data-id="${esc(x.src+":"+x.id)}">Use</button>''')
R('''b.textContent="Added ✓";setTimeout(()=>{b.textContent="Add"},1500);}''',
  '''b.textContent="Added ✓";setTimeout(()=>{b.textContent="Use"},1500);const ad=form.querySelector("#bk-added");if(ad){const sp=document.createElement("span");sp.textContent="Added: "+x.title;ad.appendChild(sp);}const t3=form.querySelector("#hw-title");if(t3)t3.scrollIntoView({block:"nearest",behavior:"smooth"});}''')
R('''  if(h)await S.db.doc(`tw/${h.uid}/x/${h.id}`).update(data);''','''  if(!h&&f.tobank&&f.tobank.checked){const st=data.stage||(form.querySelector("#bk-stage")||{}).value||bankStageFor(ids), sk=data.skill||(form.querySelector("#bk-skill")||{}).value;
    if(!st||!sk)throw userErr("To save it to the activity bank, choose an age group and a skill in step 2.");
    try{await S.db.collection("bank").doc().set({stage:st,skill:sk,title:title.slice(0,100),instructions:data.instructions.slice(0,4000),questions:[],minutes:null,by:S.uid,byName:myName()||"",at:Date.now()});}catch(e){}}
  if(h)await S.db.doc(`tw/${h.uid}/x/${h.id}`).update(data);''')
R('''if(!window.__bkWired){window.__bkWired=true;''','''if(!window.__dueWired){window.__dueWired=true;document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-due]");if(!b)return;e.preventDefault();const f=b.closest("form"),i=f&&f.querySelector("#hw-due");if(i)i.value=ymd(new Date(Date.now()+(+b.dataset.due)*864e5));});}
if(!window.__bkWired){window.__bkWired=true;''')
R('@media (prefers-reduced-motion:reduce)','''.hwf{display:flex;flex-direction:column;gap:12px}
.hwstep{border:2px solid var(--line);border-radius:20px;padding:14px 16px;background:#fff;display:flex;flex-direction:column;gap:10px}
.hwstep h3{display:flex;align-items:center;gap:10px;font-size:1.15rem;margin:0}
.hwstep .num{width:28px;height:28px;border-radius:50%;background:var(--leaf);color:#fff;display:grid;place-items:center;font-size:.95rem;flex:none}
.hwstep .opt{font-family:var(--body);font-weight:400;font-size:.8rem;color:var(--muted);background:var(--soft);border-radius:999px;padding:2px 8px}
.seg{display:inline-flex;flex-wrap:wrap;background:var(--soft);border-radius:999px;padding:4px;gap:4px;align-self:flex-start}
.seg label{position:relative;padding:8px 16px;border-radius:999px;cursor:pointer;font-weight:700}
.seg input{position:absolute;opacity:0;inset:0;margin:0;cursor:pointer}
.seg label:has(input:checked){background:var(--leaf);color:#fff}
.seg label:has(input:focus-visible){outline:3px solid var(--skyDeep);outline-offset:2px}
.hwf:has(input[name="who"][value="learners"]:checked) .hw-course{display:none}
.hwf:has(input[name="who"][value="course"]:checked) .hw-learners{display:none}
.chips{display:flex;flex-wrap:wrap;gap:8px}.chip{position:relative}.chip input{position:absolute;opacity:0;inset:0;margin:0}
.chip span{display:inline-flex;gap:6px;align-items:center;border:2px solid var(--line);border-radius:999px;padding:7px 14px;font-weight:700;cursor:pointer;background:#fff;min-height:24px}
.chip span i{font-style:normal;font-weight:400;color:var(--muted);font-size:.85em}
.chip input:checked+span{background:var(--leafSoft);border-color:var(--leafMid)}
.chip input:checked+span::before{content:"✓";color:var(--leaf)}
.chip input:focus-visible+span{outline:3px solid var(--skyDeep);outline-offset:2px}
.hwstep .bankbox{border:0;padding:0;background:none;display:flex;flex-direction:column;gap:8px}
.hwstep .bk-filters{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:8px}
.hwstep .bk-filters select,.hwstep .bk-filters input{min-height:42px}
.hwstep .bk-n{margin:0}.hwstep .banklist{max-height:250px;margin:0}
.hwstep .bk-item{padding:8px 10px;align-items:center}
.hwstep .bk-d{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.bk-added{display:flex;flex-wrap:wrap;gap:6px}.bk-added:empty{display:none}
.bk-added span{background:var(--leafSoft);color:var(--leaf);border-radius:999px;padding:4px 12px;font-size:.85rem;font-weight:700}
.bk-more summary{cursor:pointer;font-weight:700;color:var(--leaf)}.bk-more[open] summary{margin-bottom:8px}
.hwstep .bk-words{display:flex;gap:8px;margin:0}.hwstep .bk-words input{flex:1}
.duerow{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.duerow input{max-width:190px}
.savebank{display:flex;gap:8px;align-items:center;font-size:.95rem}
@media (max-width:640px){.hwstep .bk-filters{grid-template-columns:1fr 1fr}.hwstep .bk-filters input{grid-column:1/-1}.hwstep .bk-words{flex-direction:column}}
@media (prefers-reduced-motion:reduce)''')
# ---- never let one bad date break a whole page ----
R('const fmtDay=d=>DAY.format(d), fmtTime=d=>TIME.format(d);',
  'const okDate=d=>d instanceof Date&&!isNaN(d.getTime()), fmtDay=d=>okDate(d)?DAY.format(d):"", fmtTime=d=>okDate(d)?TIME.format(d):"";')
R('const esc=v=>String(v??"")', '''(()=>{try{const d=Object.getOwnPropertyDescriptor(Intl.DateTimeFormat.prototype,"format");if(d&&d.get)Object.defineProperty(Intl.DateTimeFormat.prototype,"format",{configurable:true,get(){const f=d.get.call(this);return v=>{try{return f(v)}catch(e){return ""}}}});}catch(e){}})(); // a bad date shows blank instead of breaking the page
const esc=v=>String(v??"")''')
