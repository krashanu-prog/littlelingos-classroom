# Learner top bar: the profile circle shows the child's initials (like every other role), in the colour they picked.
R('''${cur==="student"&&!S.viewAs?avatarHTML(S.uid,44):`<span class="av">${esc(ini)}</span>`}''',
  '''${cur==="student"&&!S.viewAs?`<span class="av" style="background:${esc(avatarOf(S.uid).c)}">${esc(ini)}</span>`:`<span class="av">${esc(ini)}</span>`}''')
