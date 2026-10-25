# ---- Activity record in the portfolio: games, quizzes, lessons, chess ... ----
R('/* ================= events ================= */',open(W+'act_block.js').read()+'\n/* ================= events ================= */')
R('A.finish=async lid=>{if(await save(()=>upsert("progress/"+S.uid,{completed:{[lid]:Date.now()}}))){S.bloomed=lid;',
  'A.finish=async lid=>{if(await save(()=>upsert("progress/"+S.uid,{completed:{[lid]:Date.now()}}))){S.bloomed=lid;actLog("lesson",(D.lessons[lid]||{}).title||"Lesson");')
R('await save(()=>earn(extra));g.stars=stars;render(true);return}',
  'actLog(g.type,{daily:"Daily challenge",quiz:"Word quiz",listen:"Listen and pick",revise:"Practise again"}[g.type]||"Word game",g.score,g.qs.length);await save(()=>earn(extra));g.stars=stars;render(true);return}')
R('g.stars=g.moves<=pairs+2?3:g.moves<=pairs+5?2:1;','g.stars=g.moves<=pairs+2?3:g.moves<=pairs+5?2:1;actLog("memory","Memory pairs",g.stars);')
R('if(x.opts[+k]===x.a){st.score++;st.streak++;}else st.streak=0;render(true);};','if(x.opts[+k]===x.a){st.score++;st.streak++;}else st.streak=0;qzLog(kind,x.opts[+k]===x.a);render(true);};')
R('function spEnd(){const G=SPG;if(!G)return;SPG=null;const ts=Date.now();','function spEnd(){const G=SPG;if(!G)return;SPG=null;const ts=Date.now();actLog("sound","Sound pairs",G.score,G.rs.length);')
R('toast("🌼 Golden flower planted!");','toast("🌼 Golden flower planted!");actLog("wod","Word of the Day · "+x.word);')
R('taught:{[x.k]:(+((p.taught||{})[x.k])||0)+1}});wkLog(x.w,true);','taught:{[x.k]:(+((p.taught||{})[x.k])||0)+1}});wkLog(x.w,true);actLog("teach",`Taught Pip “${x.w}”`);')
R('await S.db.collection(`kp/${S.uid}/x`).doc().set({kind,title:title||"",data,at:Date.now()});await earn({});',
  'await S.db.collection(`kp/${S.uid}/x`).doc().set({kind,title:title||"",data,at:Date.now()});if(kind==="draw")actLog("draw",title||"My drawing");await earn({});')
# show it: learner Me page, parent Progress, staff learner card
R('<section class="card panel"><h2>My settings</h2>','${actCardHTML(L,true)}<section class="card panel"><h2>My settings</h2>')
R('saves appear here.</p>`}</section>`;}','saves appear here.</p>`}</section>${actCardHTML(L,false)}`;}')
R('<p class="section-title">Stars and portfolio</p>','${actCardHTML(L,false)}<p class="section-title">Stars and portfolio</p>')
R('@media (prefers-reduced-motion:reduce)','''.actlist{display:flex;flex-direction:column;gap:6px}.actday{margin:8px 0 0;font:700 .78rem/1 var(--body);letter-spacing:.06em;text-transform:uppercase;color:var(--leafDeep,#22703A)}
.actrow{display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:14px;background:var(--ground,#F5FAEE)}.actrow .acte{font-size:1.4rem;width:32px;text-align:center;flex:none}
.actrow .grow{display:flex;flex-direction:column;min-width:0}.actrow .grow b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.actrow .grow span{font-size:.82rem;color:var(--muted,#5C4F45)}
.actsum{margin:0}.prevnote{margin-bottom:12px}
@media (prefers-reduced-motion:reduce)''')
