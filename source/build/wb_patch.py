# ---- whiteboards: one place to find them (Library), clearer save message ----
R('/* ================= events ================= */',open(W+'wb_block.js').read()+'\n/* ================= events ================= */')
R('<button class="btn btn-primary" data-act="newLib">${ic("plus")}Add to library</button></div>\n  <div class="row">',
  '<button class="btn btn-primary" data-act="newLib">${ic("plus")}Add to library</button></div>\n  ${boardsLibHTML()}\n  <div class="row">')
R('done:"Whiteboard saved to the lesson"', 'done:"Whiteboard saved. Find it in Library → Class whiteboards, or on its lesson page."')
R('<p class="lede">Slides, songs, flashcards and worksheets to use in class. Attach any of them to a class from the class form.</p>',
  '<p class="lede">Class whiteboards, slides, songs, flashcards and worksheets. Attach any of them to a class from the class form.</p>')
R('@media (prefers-reduced-motion:reduce)','.wbpanel .ph{flex-wrap:wrap;gap:8px}.wbitem{display:flex;flex-direction:column;gap:4px}.wbwhere{margin:0 4px}\n@media (prefers-reduced-motion:reduce)')
