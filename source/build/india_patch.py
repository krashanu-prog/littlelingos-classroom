# ---- Feature 5: My India packs + missions ----
R('/* ================= events ================= */',open(W+'india_block.js').read()+'\n/* ================= events ================= */')
R('["fun","Fun corner","sunny"],["wall","Garden wall","wall"],','["fun","Fun corner","sunny"],["wall","Garden wall","wall"],["india","My India","map"],')
R('["progress","Progress","leaf"],["wall","Garden wall","wall"],','["progress","Progress","leaf"],["wall","Garden wall","wall"],["india","Missions","map"],')
R('["review","Review","star",speakingQueue().length],["wall","Garden wall","wall"],','["review","Review","star",speakingQueue().length],["wall","Garden wall","wall"],["india","India packs","map"],')
R('["review","Review","star"],["wall","Garden wall","wall"],','["review","Review","star"],["wall","Garden wall","wall"],["india","India packs","map"],')
R('capsule(){return capsuleView();},','capsule(){return capsuleView();},\nindia(){return indiaView();},')
R('const PIP_LINES={\n','const PIP_LINES={\n  india:f=>[["English is everywhere around you!","Try this week\'s mission with a grown-up."],[`Let\'s explore, ${f}!`,"Tap a pack to learn everyday words."]],\n')
R('@media (prefers-reduced-motion:reduce)',open(W+'india.css').read()+'@media (prefers-reduced-motion:reduce)')
