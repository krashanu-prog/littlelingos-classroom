# ---- Time on the portal: learner card, learners table, Analytics › Engagement ----
R('/* ================= events ================= */',open(W+'use_block.js').read()+'\n/* ================= events ================= */')
R('''ps.filter(p=>(p.digest||{})[w]).length]))}</section></div>`;}''','''ps.filter(p=>(p.digest||{})[w]).length]))}</section></div>${usageAcademyHTML(act)}`;}''')
R('''${actCardHTML(L,false)}<p class="section-title">Stars and portfolio</p>''','''<p class="section-title">Time on the portal</p>${usageCardHTML(L)}${actCardHTML(L,false)}<p class="section-title">Stars and portfolio</p>''')
R('''<th>Attendance · ${esc(monthShort(m))}</th>''','''<th>Attendance · ${esc(monthShort(m))}</th><th>Time · 7 days</th>''')
R('''<td>${ratePill(a.rate)} <span class="small muted num">${a.t?`${a.p+a.l}/${a.t}`:""}</span></td>''','''<td>${ratePill(a.rate)} <span class="small muted num">${a.t?`${a.p+a.l}/${a.t}`:""}</span></td><td class="num">${L.uid?(()=>{const u=usageOf(L.uid);return `<b>${esc(fmtMins(u.t7))}</b><div class="small muted">Last on: ${esc(lastSeenTxt(u.last))}</div>`;})():`<span class="small muted">Not signed in</span>`}</td>''')
R('@media (prefers-reduced-motion:reduce)','''.usecard{display:flex;flex-direction:column;gap:12px;background:var(--leafSoft,#DDEFC4);border-radius:20px;padding:16px}
.usestats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.usestats div{background:#fff;border-radius:14px;padding:10px 12px;display:flex;flex-direction:column}.usestats b{font-size:1.15rem}.usestats span{font-size:.8rem;color:var(--muted)}
.usebars{display:flex;align-items:flex-end;gap:4px;height:90px;background:#fff;border-radius:14px;padding:10px 10px 22px;position:relative}.usebars .ub{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;position:relative}.usebars .ub span{width:100%;max-width:22px;background:var(--leaf,#2F8F46);border-radius:6px 6px 2px 2px}.usebars .ub i{position:absolute;bottom:-18px;font-size:.68rem;font-style:normal;color:var(--muted)}
@media (max-width:600px){.usestats{grid-template-columns:repeat(2,1fr)}}
@media (prefers-reduced-motion:reduce)''')
