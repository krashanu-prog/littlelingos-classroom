# ---- Phase 6: installable app + notifications ----
open(W+'site/sw.js','w').write(open(W+'sw_src.js').read())
R('/* ================= events ================= */',open(W+'notif_block.js').read()+'\n/* ================= events ================= */')
R('''${cur!=="admin"&&noticesFor(cur).length?`<button class="bell" data-go="${cur==="parent"?"messages":"notices"}" ${cur==="parent"?'data-act="mtab" data-id="news"':""} aria-label="Notices${un?`, ${un} new`:""}">${ic("bell")}${un?`<span class="badge">${un}</span>`:""}</button>`:""}''','''${bellHTML()}''')
R('function mainHTML(){\n','function mainHTML(){\n  if(!navigator.onLine&&(realRole()==="student"||S.status!=="ready")){const o=offlineHTML();if(o)return o;}\n')
R('@media (prefers-reduced-motion:reduce)',open(W+'notif.css').read()+'@media (prefers-reduced-motion:reduce)')
