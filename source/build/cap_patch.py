# ---- Feature 1: voice time capsule ----
R('/* ================= events ================= */',open(W+'cap_block.js').read()+'\n/* ================= events ================= */')
R('+body+adaptStaffHTML(L)+','+body+adaptStaffHTML(L)+capStaffHTML(L)+')
R('actions:{adapt:()=>{closeModal();A.adaptEdit(id)},','actions:{adapt:()=>{closeModal();A.adaptEdit(id)},capnote:v=>{closeModal();A.capNote(id,v)},')
R('      ${adaptKidHTML(L)}\n','      ${capsuleDueHTML(L)}\n      ${adaptKidHTML(L)}\n')
R('  <section class="card panel"><h2>My badges</h2>','  ${capMeHTML(L)}\n  <section class="card panel"><h2>My badges</h2>')
R('${kidBar()}${memoriesHTML(L)}','${kidBar()}${memoriesHTML(L)}${capParentHTML(L)}')
R('.concat(["course","lesson","child"]','.concat(["course","lesson","child","capsule"]')
R('wall(){return wallView();},','wall(){return wallView();},\ncapsule(){return capsuleView();},')
R('${own?`<button class="iconbtn" data-act="delPort"','${own&&!x.capsule?`<button class="iconbtn" data-act="delPort"')
R('''    const wa=pipTry(()=>wallAskedCount())||0;''','''    const cd=pipTry(()=>capDueList().length)||0;if(cd)add(`${cd} learner${cd===1?"":"s"} due a time-capsule recording this term`,"learners");
    const wa=pipTry(()=>wallAskedCount())||0;''')
R('@media (prefers-reduced-motion:reduce)',open(W+'cap.css').read()+'@media (prefers-reduced-motion:reduce)')
