# ---- Art studio + Pip's Chess ----
for _n in ['function chAiMove(','function chNewGame(','function chStatus(','function chessHTML(']:
    R(_n, _n.replace('(','Old('))
R('/* ================= events ================= */',open(W+'studio_block.js').read()+'\n/* ================= events ================= */')
R('<button class="funtile ft-draw" data-act="drawPad"><b>Drawing</b><span>Draw a picture. It goes in your portfolio for your teacher to see.</span></button>',
  '<button class="funtile ft-draw" data-act="drawPad"><b>Art studio</b><span>Crayons, rainbow brush, stickers and colouring pages.</span><span class="ftart">${art("bloom",76)}</span></button>')
R('<b>Chess</b><span>Play against Pip\'s computer or with a friend.</span></button>',
  '<b>Pip\'s Chess</b><span>Play Pip or a friend. Pip gives hints!</span><span class="ftart">${art("pip",76)}</span></button>')
R('<b>GK quiz</b><span>Five quick questions. How many can you get?</span></button>',
  '<b>GK quiz</b><span>Five quick questions. How many can you get?</span><span class="ftart">${art("buzz",76)}</span></button>')
R('@media (prefers-reduced-motion:reduce)',open(W+'studio.css').read()+'@media (prefers-reduced-motion:reduce)')
R('function closeModal(){document.getElementById("modal-root").innerHTML="";',
  'function closeModal(){if(document.body.classList.contains("st-on")){document.body.classList.remove("st-on");try{if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});}catch(e){}}document.getElementById("modal-root").innerHTML="";')
