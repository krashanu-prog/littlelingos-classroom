# ---- Phase 2: adaptive lesson path ----
R('/* ================= events ================= */',open(W+'adapt_block.js').read()+'\n/* ================= events ================= */')
R('A.answer=v=>{const g=S.game;if(!g||g.pick!=null)return;const q=g.qs[g.i];g.pick=+v;if(q.opts[+v]===q.ans){g.score++;}',
  'A.answer=v=>{const g=S.game;if(!g||g.pick!=null)return;const q=g.qs[g.i];g.pick=+v;if(q.opts[+v]===q.ans){g.score++;}wkLog(q.say,q.opts[+v]===q.ans);')
R('d.heard=alts.find(a=>norm(a)===norm(x.w))||alts[0]||"";',
  'd.heard=alts.find(a=>norm(a)===norm(x.w))||alts[0]||"";wkLog(x.w,norm(d.heard)===norm(x.w));')
R('A.startGame=type=>{const L=myLearner();if(!L)return;const pool=gamePool(L);',
  'A.startGame=type=>{const L=myLearner();if(!L)return;const pool=gamePool(L);\n  if(type==="revise"){const qs=reviseGame(L);if(!qs){toast("Nothing to practise right now. Lovely work!");return}S.game={type,qs,i:0,score:0,pick:null};if(S.view!=="play")go("play");else render(true);if(qs[0].k==="listen")setTimeout(()=>say(qs[0].say,qs[0].lang),400);return;}')
R('      <section class="daily ${dDone?"done":""}">','      ${adaptKidHTML(L)}\n      <section class="daily ${dDone?"done":""}">')
R('''  <div class="cols even">
    <section class="card panel"><h2>Courses</h2>''','''  ${adaptParentHTML(L)}
  <div class="cols even">
    <section class="card panel"><h2>Courses</h2>''')
R('''    <div class="stack" style="gap:20px">
      <section class="card panel"><h2>Attendance</h2>''','''    <div class="stack" style="gap:20px">
      ${adaptParentHTML(L)}
      <section class="card panel"><h2>Attendance</h2>''')
R('''+body+`<p class="section-title">Stars and portfolio</p>''','''+body+adaptStaffHTML(L)+`<p class="section-title">Stars and portfolio</p>''')
R('''actions:{chat:k=>{closeModal();S.itab="chats";''','''actions:{adapt:()=>{closeModal();A.adaptEdit(id)},chat:k=>{closeModal();S.itab="chats";''')
R('''<th>Batch</th><th>Family</th><th>Flowers</th>''','''<th>Batch</th><th>Family</th><th>Flowers</th><th>Path</th>''')
R('''<td class="num">${L.uid?flowers(L.uid):"–"}</td>''','''<td class="num">${L.uid?flowers(L.uid):"–"}</td><td><button type="button" class="linkbtn" data-act="adaptEdit" data-id="${esc(L.id)}" aria-label="Lesson path for ${esc(L.name)}">${L.uid?adaptPill(L):'<span class="muted small">–</span>'}</button></td>''')
R('''    if(!moodOf(S.uid))add("Tell Pip how you feel today","@mood");}}''','''    if(!moodOf(S.uid))add("Tell Pip how you feel today","@mood");
      const ad=pipTry(()=>adaptFor(L));if(ad&&ad.mode==="revise"&&ad.words.length)add("Let's practise a few words again","home");}}''')
R('@media (prefers-reduced-motion:reduce)','''.adapt{display:flex;align-items:flex-start;gap:12px;border-radius:24px;padding:14px 16px;background:var(--skySoft)}
.adapt.ahd{background:var(--petalSoft)}.adapt .m{flex:none}
.adapt b{display:block;font-family:var(--display);font-size:1.25rem}.adapt span{font-size:.95rem}.adapt i{font-style:normal;font-weight:700}
.adbtns{margin-top:8px;gap:8px}.adbtns .btn{min-height:44px}
.adstaff{display:flex;flex-direction:column;gap:6px;background:var(--soft);border-radius:16px;padding:12px}
.adfs{border:0;padding:0;margin:0 0 8px;display:grid;gap:8px}
.adopt{display:flex;gap:10px;align-items:flex-start;border:2px solid var(--line);border-radius:16px;padding:10px 12px;cursor:pointer;min-height:44px}
.adopt:has(input:checked){border-color:var(--leafMid);background:var(--leafSoft)}
.adopt input{width:22px;height:22px;accent-color:var(--leafMid);flex:none;margin-top:2px}.adopt b{display:block}.adopt small{color:var(--muted)}
@media (prefers-reduced-motion:reduce)''')
