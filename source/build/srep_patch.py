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
