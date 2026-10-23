# ---- Phase 7: "Say it" upgrade ----
R('function drillModal(){const d=S.drill;if(!d)return;const x=d.ws[d.i];\n  openModal("Repeat after me"','function drillModalOld(){const d=S.drill;if(!d)return;const x=d.ws[d.i];\n  openModal("Repeat after me"')
R('/* ================= events ================= */',open(W+'say_block.js').read()+'\n/* ================= events ================= */')
R('S.db.collection(`kp/${S.uid}/x`).doc().set({kind:"audio",title:`Saying “${x.w}”`,data:d.clip,at:Date.now()})','S.db.collection(`kp/${S.uid}/x`).doc().set({kind:"audio",title:`Saying “${x.w}”`,data:d.clip,at:Date.now(),...(d.stars?{pipStars:d.stars}:{})})')
R('<figcaption><b>${esc(L.name)} · ${esc(x.title||"")}</b><span>${esc(fmtDay(new Date(x.at)))}</span>','<figcaption><b>${esc(L.name)} · ${esc(x.title||"")}</b><span>${esc(fmtDay(new Date(x.at)))}${x.pipStars?` · Pip practice ${"★".repeat(+x.pipStars)}${"☆".repeat(3-x.pipStars)}`:""}</span>')
R('@media (prefers-reduced-motion:reduce)',open(W+'say.css').read()+'@media (prefers-reduced-motion:reduce)')
