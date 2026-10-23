# ---- Phase 5: whiteboard ----
R('/* ================= events ================= */',open(W+'board_block.js').read()+'\n/* ================= events ================= */')
R('''  <div class="row" style="padding-top:10px;border-top:2px solid var(--line)">''','''  ${lessonBoardsHTML(l)}
  <div class="row" style="padding-top:10px;border-top:2px solid var(--line)">''')
R('''<button class="btn btn-ghost btn-sm" data-act="roster" data-id="${esc(s.id)}">${ic("users")}Roster</button>''','''<button class="btn btn-ghost btn-sm" data-act="boardNew" data-id="s:${esc(s.id)}">🖍️ Whiteboard</button><button class="btn btn-ghost btn-sm" data-act="roster" data-id="${esc(s.id)}">${ic("users")}Roster</button>''')
R('''    ${opts.manage?`<button class="iconbtn" data-act="editSession" data-id="${esc(s.id)}" aria-label="Edit class">${ic("edit")}</button>`:""}''','''    ${opts.manage&&!past&&isStaff()?`<button class="btn btn-ghost btn-sm" data-act="boardNew" data-id="s:${esc(s.id)}">🖍️ Whiteboard</button>`:""}
    ${opts.manage?`<button class="iconbtn" data-act="editSession" data-id="${esc(s.id)}" aria-label="Edit class">${ic("edit")}</button>`:""}''')
R('''${h.instructions?`<div class="prose" style="font-size:1.05rem">${paras(h.instructions)}</div>`:""}''','''${h.instructions?`<div class="prose" style="font-size:1.05rem">${paras(h.instructions)}</div>`:""}
   ${hwBoardHTML(h)}''')
R('@media (prefers-reduced-motion:reduce)',open(W+'board.css').read()+'@media (prefers-reduced-motion:reduce)')
