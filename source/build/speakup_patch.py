# ---- Speak Up with Pip: "Pip Gets It Wrong" (Sprouts speaking game) ----
R('/* ================= events ================= */',open(W+'speakup_block.js').read()+'\n/* ================= events ================= */')
R('<button class="kidtile t7" data-go="sounds"><span>👂</span>Sound pairs</button>','<button class="kidtile t7" data-go="sounds"><span>👂</span>Sound pairs</button>${pgwShow(L)?`<button class="kidtile t8" data-act="pipWrong"><span>🗣️</span>Pip Gets It Wrong</button>`:""}')
R('@media (prefers-reduced-motion:reduce)',open(W+'speakup.css').read()+'@media (prefers-reduced-motion:reduce)')
