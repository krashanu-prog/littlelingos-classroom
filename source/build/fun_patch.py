# ---- Fun corner (learners) + My space (trainers) ----
R('if(r==="student")return [["home","My garden","leaf"],["path","Path","map"],["words","Words","cards"],["play","Games","star"],',
  'if(r==="student")return [["home","My garden","leaf"],["path","Path","map"],["words","Words","cards"],["play","Games","star"],["fun","Fun corner","sunny"],')
R('["courses","Courses","book"],["hours","Hours & pay","clock"]];',
  '["courses","Courses","book"],["hours","Hours & pay","clock"],["myspace","My space","heart"]];')
R('library(){return libraryView();},','library(){return libraryView();},\nfun(){return funView();},\nmyspace(){return mySpaceView();},')
R('''  notices:f=>[["News from your garden!","Here's what your teacher shared."]]''','''  notices:f=>[["News from your garden!","Here's what your teacher shared."]],
  fun:f=>[[`Break time, ${f}!`,"Draw, play chess or try a quiz."],["Let's play a game together!","Pick something fun below."],["Brains love to play too!","Try the GK quiz or a game of chess."]]''')
R('/* ================= events ================= */',open(W+'fun_block.js').read()+'\n/* ================= events ================= */')
R('@media (prefers-reduced-motion:reduce)','''.funtiles{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.funtile{all:unset;box-sizing:border-box;cursor:pointer;border-radius:24px;padding:18px 18px 16px;display:flex;flex-direction:column;gap:6px;min-height:120px;border:3px solid transparent}
.funtile b{font-family:var(--display);font-size:1.45rem;font-weight:800;line-height:1.05;color:var(--soil)}
.funtile span{font-size:.95rem;color:var(--muted);line-height:1.35}
.funtile:focus-visible{outline:3px solid var(--leaf);outline-offset:3px}.funtile:hover{transform:translateY(-2px)}
.ft-draw{background:var(--petalSoft)}.ft-chess{background:var(--skySoft)}.ft-gk{background:var(--sunSoft)}
.funtile.on{border-color:var(--leafMid)}
.chesswrap .ph{flex-wrap:wrap;gap:10px}.chesswrap .ph .row{flex-wrap:wrap;gap:8px}.chesswrap select{width:auto;max-width:100%;min-height:40px;border-radius:12px;border:2px solid var(--line);padding:4px 10px;font:inherit;background:#fff}
.chstat{font-family:var(--display);font-weight:700;font-size:1.15rem;margin:4px 0 8px}.chstat.over{color:var(--leaf)}
.board{display:grid;grid-template-columns:repeat(8,1fr);width:min(100%,520px);aspect-ratio:1;border-radius:14px;overflow:hidden;border:4px solid var(--soil);margin:0 auto}
.chsq{all:unset;position:relative;display:grid;place-items:center;cursor:pointer;aspect-ratio:1;font-size:clamp(22px,7.2vw,46px);line-height:1}
.chsq.lt{background:#F5FAEE}.chsq.dk{background:#A6DB5C}
.chsq.lastmv.lt{background:#D7ECFA}.chsq.lastmv.dk{background:#9FCFF0}
.chsq.sel{background:#FFC94A!important}.chsq.chk{background:#F7A8C4!important}
.chsq.tgt::after{content:"";width:26%;height:26%;border-radius:50%;background:rgba(46,34,25,.28)}
.chsq.cap{box-shadow:inset 0 0 0 4px rgba(232,73,47,.75)}
.chsq:focus-visible{outline:3px solid var(--skyDeep);outline-offset:-3px}
.pc{width:84%;height:84%;stroke-linejoin:round;stroke-linecap:round;pointer-events:none}.pc.w{fill:#FFFDF5;stroke:#2E2219;stroke-width:2}.pc.b{fill:#2E2219;stroke:#2E2219;stroke-width:2;filter:drop-shadow(0 0 1px rgba(255,255,255,.9))}.pc .ln{fill:none;stroke-width:2}.pc.w .ln{stroke:#2E2219}.pc.b .ln{stroke:#FFFDF5}.pc.b circle.ln{fill:#FFFDF5;stroke:none}.pc.w circle.ln{fill:#2E2219;stroke:none}.pc .cross{stroke-width:3}.pc.b .cross{stroke:#2E2219}
.chsq i{position:absolute;font-style:normal;font-size:10px;font-weight:700;color:rgba(46,34,25,.55)}.chsq .rk{left:3px;top:2px}.chsq .fl{right:4px;bottom:1px}
.gkq{font-size:1.4rem;margin:6px 0 12px}.gkopts{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.gkopt{all:unset;box-sizing:border-box;cursor:pointer;background:#fff;border:2px solid var(--line);border-radius:16px;padding:14px 16px;font-weight:700;font-size:1.05rem;min-height:56px}
.gkopt:hover:not([disabled]){border-color:var(--leafMid)}.gkopt:focus-visible{outline:3px solid var(--leaf)}
.gkopt.right{background:var(--goodSoft);border-color:var(--leafMid)}.gkopt.nope{background:var(--badSoft);border-color:var(--tomato)}
.gkfb{font-family:var(--display);font-weight:700;font-size:1.15rem;margin:12px 0 8px}
.gkdone{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;padding:10px 0}
.item.tj{align-items:center}.mood{flex:none;font-size:.78rem;font-weight:700;border-radius:999px;padding:4px 10px}
.m-great{background:var(--goodSoft);color:var(--leaf)}.m-good{background:var(--skySoft);color:var(--skyText)}.m-okay{background:var(--sunSoft);color:var(--warn)}.m-tough{background:var(--petalSoft);color:#A83B67}
@media (max-width:640px){.funtiles{grid-template-columns:1fr}.funtile{min-height:0}.gkopts{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce)''')
