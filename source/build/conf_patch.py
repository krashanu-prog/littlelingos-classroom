# ---- Feature 2: confidence meter ----
R('/* ================= events ================= */',open(W+'conf_block.js').read()+'\n/* ================= events ================= */')
R('+capStaffHTML(L)+','+capStaffHTML(L)+confStaffHTML(L)+')
R('capnote:v=>{closeModal();A.capNote(id,v)},','capnote:v=>{closeModal();A.capNote(id,v)},conf:async v=>{await A.confRate(id,v);closeModal();A.learnerInfo(id);},')
R('      ${capsuleDueHTML(L)}\n','      ${confKidHTML(L)}\n      ${capsuleDueHTML(L)}\n')
R('${kidReports(L)}${kidExtras(L)}','${kidReports(L)}${confParentHTML(L)}${kidExtras(L)}')
R('''      ${adaptParentHTML(L)}
      <section class="card panel"><h2>Attendance</h2>''','''      ${adaptParentHTML(L)}
      ${confParentHTML(L)}
      <section class="card panel"><h2>Attendance</h2>''')
R('''    const cd=pipTry(()=>capDueList().length)||0;''','''    for(const L of (pipTry(()=>confFlagList())||[]).slice(0,3))add(`${firstOf(L.name)}'s speaking confidence has dipped two months running. A gentle boost could help.`,"learners",true);
    const cd=pipTry(()=>capDueList().length)||0;''')
R('@media (prefers-reduced-motion:reduce)',open(W+'conf.css').read()+'@media (prefers-reduced-motion:reduce)')
