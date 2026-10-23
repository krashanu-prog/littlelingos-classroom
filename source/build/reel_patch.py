# ---- Feature 3: Friday highlight reel ----
R('/* ================= events ================= */',open(W+'reel_block.js').read()+'\n/* ================= events ================= */')
R('${kidBar()}${memoriesHTML(L)}${capParentHTML(L)}','${kidBar()}${memoriesHTML(L)}${reelCardHTML(L)}${capParentHTML(L)}')
R('''      ${adaptParentHTML(L)}
      ${confParentHTML(L)}''','''      ${reelCardHTML(L)}
      ${adaptParentHTML(L)}
      ${confParentHTML(L)}''')
R('''  if(r==="student"||r==="parent")for(const L of myKids())for(const h of pipTry(()=>hwFor(L))||[]){''','''  if(r==="parent"&&reelWeek().fresh)for(const L of kidsList()){if(L.uid&&!D.kp[L.uid])loadKp(L.uid);const n=(pipTry(()=>reelClips(L))||[]).length;if(n)add(`This week in ${firstOf(L.name)}'s garden: ${n} clip${n===1?"":"s"} to enjoy`,"progress","play",false,"reel|"+L.id+"|"+reelWeek().start);}
  if(r==="student"||r==="parent")for(const L of myKids())for(const h of pipTry(()=>hwFor(L))||[]){''')
R('@media (prefers-reduced-motion:reduce)',open(W+'reel.css').read()+'@media (prefers-reduced-motion:reduce)')
