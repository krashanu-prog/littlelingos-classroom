# Pip reads its AI replies aloud (debate, debate report, Ask Pip) with a free cloud voice.
R('''PIPST.chat.length?PIPST.chat.map(m=>`<div class="pip-msg ${m.role==="user"?"me":"pip"}">${pipFmt(m.content)}</div>`)''',
  '''PIPST.chat.length?PIPST.chat.map((m,i)=>`<div class="pip-msg ${m.role==="user"?"me":"pip"}">${pipFmt(m.content)}${m.role==="user"?"":` <button type="button" class="pip-hear" data-pip="hear" data-id="${i}" aria-label="Hear Pip">${ic("sound",18)}</button>`}</div>`)''')
R('/* ================= events ================= */', open(W+'piptts_block.js').read()+'\n/* ================= events ================= */')
R('@media (prefers-reduced-motion:reduce)','''.pip-hear{display:inline-grid;place-items:center;width:36px;height:36px;min-width:36px;border-radius:50%;border:2px solid var(--line,#e3ecd6);background:#F5FAEE;color:#22703A;vertical-align:middle;margin-left:4px;cursor:pointer}
.pip-hear:hover{background:#DDEFC4}
@media (prefers-reduced-motion:reduce)''')
