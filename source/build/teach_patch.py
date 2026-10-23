# ---- Feature 4: Teach Pip ----
R('/* ================= events ================= */',open(W+'teach_block.js').read()+'\n/* ================= events ================= */')
R('<button class="kidtile t5" data-go="wall"><span>🖼️</span>Garden wall</button>','<button class="kidtile t5" data-go="wall"><span>🖼️</span>Garden wall</button><button class="kidtile t6" data-act="teachPip"><span>🎓</span>Teach Pip</button>')
R('<span class="pill p-good">🌸 ${n} flower${n===1?"":"s"}</span>','<span class="pill p-good">🌸 ${n} flower${n===1?"":"s"}</span>${teachStars(uid)?`<span class="pill p-info">🎓 ${teachStars(uid)} teacher star${teachStars(uid)===1?"":"s"}</span>`:""}')
R('@media (prefers-reduced-motion:reduce)','.kidtile.t5,.kidtile.t6{grid-column:auto}.kidtile.t6{background:var(--petalSoft);flex-direction:row;align-items:center;gap:10px;min-height:72px}\n.teachpip .bubble.static{font-size:1.15rem}\n@media (prefers-reduced-motion:reduce)')
