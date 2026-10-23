# ---- Feature 6: Sound pairs ----
R('/* ================= events ================= */',open(W+'sound_block.js').read()+'\n/* ================= events ================= */')
R('<button class="kidtile t6" data-act="teachPip"><span>🎓</span>Teach Pip</button>','<button class="kidtile t6" data-act="teachPip"><span>🎓</span>Teach Pip</button><button class="kidtile t7" data-go="sounds"><span>👂</span>Sound pairs</button>')
R('["review","Review","star",speakingQueue().length],["wall","Garden wall","wall"],["india","India packs","map"],','["review","Review","star",speakingQueue().length],["wall","Garden wall","wall"],["india","India packs","map"],["sounds","Sound pairs","sound"],')
R('["review","Review","star"],["wall","Garden wall","wall"],["india","India packs","map"],','["review","Review","star"],["wall","Garden wall","wall"],["india","India packs","map"],["sounds","Sound pairs","sound"],')
R('.concat(["course","lesson","child","capsule"]','.concat(["course","lesson","child","capsule","sounds"]')
R('india(){return indiaView();},','india(){return indiaView();},\nsounds(){return soundsView();},')
R('${kidReports(L)}${confParentHTML(L)}','${kidReports(L)}${confParentHTML(L)}${spParentHTML(L)}')
R('''      ${confParentHTML(L)}
      <section class="card panel"><h2>Attendance</h2>''','''      ${confParentHTML(L)}
      ${spParentHTML(L)}
      <section class="card panel"><h2>Attendance</h2>''')
R('document.addEventListener("change",e=>{const t=e.target;if(!t)return;\n','document.addEventListener("change",e=>{const t=e.target;if(!t)return;\n    if(t.id==="spb"){S.spBatch=t.value;render(true);}\n')
R('const PIP_LINES={\n','const PIP_LINES={\n  sounds:f=>[["Listen carefully!","Is it ship or sheep?"],[`Big listening ears, ${f}!`,"Tap the picture you hear."]],\n')
R('@media (prefers-reduced-motion:reduce)',open(W+'sound.css').read()+'@media (prefers-reduced-motion:reduce)')
