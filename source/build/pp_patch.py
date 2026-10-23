# ---- Feature 7: Speaking passport (Blooms) ----
R('/* ================= events ================= */',open(W+'pp_block.js').read()+'\n/* ================= events ================= */')
R('.concat(["course","lesson","child","capsule","sounds"]','.concat(["course","lesson","child","capsule","sounds","passport"]')
R('sounds(){return soundsView();},','sounds(){return soundsView();},\npassport(){return passportView();},')
R('  ${capMeHTML(L)}\n','  ${capMeHTML(L)}\n  ${ppMeHTML(L)}\n')
R('${kidReports(L)}${confParentHTML(L)}${spParentHTML(L)}','${kidReports(L)}${confParentHTML(L)}${spParentHTML(L)}${ppParentHTML(L)}')
R('''      ${spParentHTML(L)}
      <section class="card panel"><h2>Attendance</h2>''','''      ${spParentHTML(L)}
      ${ppParentHTML(L)}
      <section class="card panel"><h2>Attendance</h2>''')
R('+capStaffHTML(L)+confStaffHTML(L)+','+capStaffHTML(L)+confStaffHTML(L)+ppStaffHTML(L)+')
R('conf:async v=>{await A.confRate(id,v);closeModal();A.learnerInfo(id);},','conf:async v=>{await A.confRate(id,v);closeModal();A.learnerInfo(id);},ppend:()=>{closeModal();A.ppEndorseEdit(id)},ppview:()=>{closeModal();S.ppLid=id;go("passport")},')
R('if(x&&x.lid===L.id)out.push({...x,id,uid:u});','if(x&&x.lid===L.id&&x.kind!=="passport")out.push({...x,id,uid:u});')
R('''  if(r==="parent"&&reelWeek().fresh)''','''  if(r==="parent")for(const L of kidsList())if(ppIsBlooms(L)&&L.uid){const s=ppSel(L);if((s.items.length||s.hw.length)&&!ppApproved(L))add(`${firstOf(L.name)}'s speaking passport is ready for you to approve`,"passport","check",false,"spk|"+L.id+"|"+ppSig(s));}
  if(r==="parent"&&reelWeek().fresh)''')
R('@media (prefers-reduced-motion:reduce)',open(W+'pp.css').read()+'@media (prefers-reduced-motion:reduce)')
