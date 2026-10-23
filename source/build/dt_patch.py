# ---- Phase 3: daily challenge ----
R('/* ================= events ================= */',open(W+'dt_block.js').read()+'\ndocument.addEventListener("input",e=>{if(e.target&&e.target.id==="dt-in"&&S.dtPlan)S.dtPlan.typed=e.target.value;});\ndocument.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target&&e.target.id==="dt-in"){e.preventDefault();e.target.blur();A.dtCheck();}});\n/* ================= events ================= */')
R('''<p class="small muted" style="text-align:center;margin-top:-6px">Next: ${esc(nx.title)} · ${esc(D.courses[nx.courseId]?.title||"")}</p>`:""}''','''<p class="small muted" style="text-align:center;margin-top:-6px">Next: ${esc(nx.title)} · ${esc(D.courses[nx.courseId]?.title||"")}</p>`:""}
      ${dtHTML(L)}''')
R('<div class="grow"><b>Daily challenge</b><span>${dDone?','<div class="grow"><b>Word quiz</b><span>${dDone?')
R('"5 quick questions. Keep your streak going!"','"5 quick questions, just for fun."')
R('@media (prefers-reduced-motion:reduce)',open(W+'dt.css').read()+'@media (prefers-reduced-motion:reduce)')
