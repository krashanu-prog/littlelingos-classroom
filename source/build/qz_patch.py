# ---- more questions, no question counters ----
R('/* ================= events ================= */',open(W+'qz_block.js').read()+'\n/* ================= events ================= */')
R('<span class="num fcpos">${i+1} / ${ws.length}</span>','')
R('<p class="lede">Question ${g.i+1} of ${g.qs.length} · ⭐ ${g.score}</p>','<p class="lede">⭐ ${g.score} right</p>')
R('<div class="bar"><i style="width:${pctStr(g.i/g.qs.length)}"></i></div>','')
R('${t==="chess"?chessHTML():t==="gk"?gkHTML():""}','${t==="chess"?chessHTML():t==="gk"?quizHTML("gk"):t==="en"?quizHTML("en"):""}')
R('<p class="lede">Take a little break: draw, play chess or try a quiz.</p>','<p class="lede">Take a little break: draw, play chess or answer quiz questions.</p>')
R('<b>GK quiz</b><span>Five quick questions. How many can you get?</span><span class="ftart">${art("buzz",76)}</span></button>',
  '<b>GK quiz</b><span>Hundreds of questions about our world. Play as long as you like!</span><span class="ftart">${art("buzz",76)}</span></button>\n    <button class="funtile ft-en ${t==="en"?"on":""}" data-act="funTab" data-id="en"><b>Word power</b><span>Opposites, rhymes, spellings and more English fun.</span><span class="ftart">${art("drizzle",76)}</span></button>')
R('<button class="gamecard g4" data-act="drill"','<button class="gamecard g1" data-act="goQuiz" data-id="en"><span>🔤</span><b>Word power</b><i>English quiz, always open</i></button>\n    <button class="gamecard g2" data-act="goQuiz" data-id="gk"><span>🌍</span><b>GK quiz</b><i>Questions about our world</i></button>\n    <button class="gamecard g4" data-act="drill"')
R('.funtiles{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}','.funtiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.funtile.ft-en{background:#FFE3D9}.qzscore{font-family:var(--display);font-weight:700;color:var(--leaf);margin:0}')
