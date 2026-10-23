# ---- Feature 8: share with family ----
R('/* ================= events ================= */',open(W+'share_block.js').read()+'\n/* ================= events ================= */')
R('${own?wallShareBtn(x):""}','${own?wallShareBtn(x):""}${!own?shareBtn(x.id,x.kind):""}')
R('<button class="certmini" data-act="cert" data-id="${esc(x.cid)}"><span>🏆</span><b>${esc(x.c.title)}</b><i>${esc(fmtDay(new Date(x.at)))}</i></button>`).join("")}</div>`:""}','<button class="certmini" data-act="cert" data-id="${esc(x.cid)}"><span>🏆</span><b>${esc(x.c.title)}</b><i>${esc(fmtDay(new Date(x.at)))}</i></button>${shareBtn(x.cid,"cert")}`).join("")}</div>`:""}')
R('<span class="hint">Used in invite messages to parents.</span></div>','<span class="hint">Used in invite messages to parents.</span></div>\n    <div class="field"><label for="sa-tr">Trial booking link</label><input type="url" id="sa-tr" name="trialUrl" value="${esc(a.trialUrl||"")}" placeholder="https://littlelingos.in/book"><span class="hint">The “Book a trial class” button on pages parents share with family.</span></div>')
R('upiName:(f.upiName?f.upiName.value.trim():(CFG().academy||{}).upiName||"")};','upiName:(f.upiName?f.upiName.value.trim():(CFG().academy||{}).upiName||""),trialUrl:(f.trialUrl&&safeUrl(f.trialUrl.value.trim()))||""};if(f.trialUrl&&f.trialUrl.value.trim()&&!safeUrl(f.trialUrl.value.trim())){toast("The trial booking link must start with https://",true);return}')
R('${kidReports(L)}${confParentHTML(L)}${spParentHTML(L)}${ppParentHTML(L)}','${kidReports(L)}${confParentHTML(L)}${spParentHTML(L)}${ppParentHTML(L)}${sharesCardHTML(L)}')
R('''      ${ppParentHTML(L)}
      <section class="card panel"><h2>Attendance</h2>''','''      ${ppParentHTML(L)}
      ${sharesCardHTML(L)}
      <section class="card panel"><h2>Attendance</h2>''')
R('      ${confKidHTML(L)}\n','      ${familyKidHTML(L)}\n      ${confKidHTML(L)}\n')
R('.concat(["course","lesson","child","capsule","sounds","passport"]','.concat(["course","lesson","child","capsule","sounds","passport","shares"]')
R('passport(){return passportView();},','passport(){return passportView();},\nshares(){return sharesView();},')
R('@media (prefers-reduced-motion:reduce)',open(W+'share.css').read()+'@media (prefers-reduced-motion:reduce)')
