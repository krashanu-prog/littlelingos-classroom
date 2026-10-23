# ---- Pip's voice everywhere ----
R('/* ================= events ================= */',open(W+'voice_block.js').read()+'\n/* ================= events ================= */')
R('S.bloomed=lid;render(true);','S.bloomed=lid;render(true);pipPlay("yay");')
R('@media (prefers-reduced-motion:reduce)','.garden .pip{cursor:pointer;pointer-events:auto}\n'+open(W+'voice.css').read()+'@media (prefers-reduced-motion:reduce)')
R('["wod","Word of the Day","sunny"],["reports","Reports","doc",reportsPending().length]','["wod","Word of the Day","sunny"],["pipvoice","Pip\'s voice","sound",pvMissing().length],["reports","Reports","doc",reportsPending().length]')
R('wod(){return wodView();},','wod(){return wodView();},\npipvoice(){return pipvoiceView();},')
