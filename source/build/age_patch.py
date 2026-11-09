# ---- Age groups: stage-matched lessons and words, harder games for older children ----
R('function gamePool(L){const mine=wordsWithMeaning(L.uid);return mine.length>=4?mine:courseVocab(L);}','function gamePool0(L){const mine=wordsWithMeaning(L.uid);return mine.length>=4?mine:courseVocab(L);}')
R('function buildQs(pool,n,r,kinds){','function buildQs0(pool,n,r,kinds){')
R('/* ================= events ================= */',open(W+'words_block.js').read()+open(W+'age_block.js').read()+'\n/* ================= events ================= */')
R('buildQs(pool,5,r,["mean","listen"])','buildQs(pool,lvN("daily"),r,lvKinds("daily"))')
R('buildQs(pool,8,Math.random,type==="listen"?["listen"]:["mean"])','buildQs(pool,lvN(type),Math.random,lvKinds(type))')
R('const ws=shuffle(pool.slice()).slice(0,6)','const ws=freshFirst(pool).slice(0,myLv().mem);noteAsked(ws.map(x=>String(x.w).toLowerCase()))')
R('canSpeak()?`<button class="iconbtn big" data-act="sayQ" aria-label="Hear the word"','q.k!=="rev"&&canSpeak()?`<button class="iconbtn big" data-act="sayQ" aria-label="Hear the word"')
R('<div class="gamegrid">','${levelBanner(L)}\n  <div class="gamegrid">')
# a child's lessons, path, words and practice come from courses for their own stage
R('mine=new Set(learnerCourses(L)), others=courseList().filter(c=>!mine.has(c.id))','mine=new Set(learnCourses(L)), others=courseList().filter(c=>!mine.has(c.id)&&!learnerCourses(L).includes(c.id)&&stageOK(c,L))')
R('const nx=nextLesson(uid,cids), stars=starsOf(L);','const nx=nextLesson(uid,learnCourses(L)), stars=starsOf(L);')
R('const cids=learnerCourses(L); if(!cids.length)return `<div class="head"><div><h1>Lesson path','const cids=learnCourses(L); if(!cids.length)return `<div class="head"><div><h1>Lesson path')
R('const ls=learnerCourses(L).flatMap(lessonsOf);','const ls=learnCourses(L).flatMap(lessonsOf);')
R('for(const cid of learnerCourses(L))for(const l of lessonsOf(cid)){const c=D.courses[cid];for(const [w,m] of parseVocab(l.vocab)){const k=w.toLowerCase();if(seen.has(k))continue;seen.add(k);out.push({w,m,lang:langOf(c),lesson:l.title,done','for(const cid of learnCourses(L))for(const l of lessonsOf(cid)){const c=D.courses[cid];for(const [w,m] of parseVocab(l.vocab)){const k=w.toLowerCase();if(seen.has(k))continue;seen.add(k);out.push({w,m,lang:langOf(c),lesson:l.title,done')
R('function overallPct(L){const cids=learnerCourses(L);','function overallPct(L){const cids=learnCourses(L);')
R('pr=practice(uid,cids)','pr=practice(uid,learnCourses(L))')
R('function adaptVocab(L){const m={};for(const cid of learnerCourses(L))','function adaptVocab(L){const m={};for(const cid of learnCourses(L))')
R('const cids=learnerCourses(L), nx=nextLesson(uid,cids);','const cids=learnCourses(L), nx=nextLesson(uid,cids);')
R('todo=learnerCourses(L).flatMap(lessonsOf)','todo=learnCourses(L).flatMap(lessonsOf)')
R('cids=learnerCourses(L),seen=new Set(),out=[]','cids=learnCourses(L),seen=new Set(),out=[]')
R('const ls=learnerCourses(L).flatMap(cid=>lessonsOf(cid).map(','const ls=learnCourses(L).flatMap(cid=>lessonsOf(cid).map(')
R('const nx=nextLesson(uid,learnerCourses(L));if(nx)recent.push(nx);','const nx=nextLesson(uid,learnCourses(L));if(nx)recent.push(nx);')
R('@media (prefers-reduced-motion:reduce)','''.lvband{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 12px}
@media (prefers-reduced-motion:reduce)''')
# ---- games for each age group, admin age preview, homework/notices by age ----
i=s.index('<div class="gamegrid">',s.index('${levelBanner(L)}')); j=s.index('<i>Listen, say it, hear yourself</i></button>\n  </div>`;\n}',i)+len('<i>Listen, say it, hear yourself</i></button>\n  </div>')
s=s[:i]+'${stageGamesHTML(L,n,dDone)}'+s[j:]
R('<h1>${g.type==="daily"?"Daily challenge":g.type==="listen"?"Listen and pick":"Word quiz"}</h1><p class="lede">⭐ ${g.score} right</p>','<h1>${esc(AG_TITLE[g.type]||"Word quiz")}</h1><p class="lede">⭐ ${g.score} right${g.type==="speed"?` · ⏱️ <span id="agclock">${Math.max(0,Math.ceil((g.end-Date.now())/1000))}s</span>`:""}${g.type!=="speed"?` · ${g.i+1} of ${g.qs.length}`:""}</p>')
R('<section class="quiz"><h2>${esc(q.prompt)}</h2>','${agQuestionHTML(g,q)||`<section class="quiz"><h2>${esc(q.prompt)}</h2>${q.vis||""}')
R('${ic("fwd")}</button></div>`:""}</section>`;}','${ic("fwd")}</button></div>`:""}</section>`}`;}')
R('q.k!=="rev"&&canSpeak()','q.k!=="rev"&&!q.nospeak&&canSpeak()')
R('class="qopt ${g.pick!=null?','class="qopt${q.big?" qbig":""}${q.long?" qlong":""} ${g.pick!=null?')
R('${q.k!=="mean"&&mt(q.say)?` <span class="mtline">“${esc(q.say)}” = ${mtHTML(q.say)}</span>`:""}','${q.k!=="mean"&&mt(q.wk||q.say)?` <span class="mtline">“${esc(q.wk||q.say)}” = ${mtHTML(q.wk||q.say)}</span>`:""}${q.why?` <span class="mtline">${esc(q.why)}</span>`:""}')
R('wkLog(q.say,q.opts[+v]===q.ans);render(true);};','wkLog(q.wk!=null?q.wk:q.say,q.opts[+v]===q.ans);render(true);if(g.type==="speed")setTimeout(()=>{if(S.game===g&&!g.over&&g.pick!=null)A.nextQ();},700);};')
R('if(q.k==="listen")setTimeout(()=>say(q.say,q.lang),300);};','if(q.k==="listen"||q.auto)setTimeout(()=>say(q.say,q.lang),300);};')
R('const stars=g.type==="daily"?g.score:Math.round(g.score/g.qs.length*3);','const stars=g.type==="daily"?g.score:g.type==="speed"?(g.score>=15?3:g.score>=9?2:g.score>=4?1:0):Math.round(g.score/g.qs.length*3);if(g.type==="speed"){try{if(g.score>speedBest())localStorage.setItem(speedBestKey(),String(g.score));}catch{}}')
R('{daily:"Daily challenge",quiz:"Word quiz",listen:"Listen and pick",revise:"Practise again"}[g.type]','AG_TITLE[g.type]')
# admin learner preview by age
R('stage:"Seeds",preview:true}','stage:S.previewStage||"Seeds",preview:true}')
R('${["admin","teacher","student","parent"].map(x=>opt(x,ROLE_LABEL[x],x===cur)).join("")}','${viewAsOpts(cur)}')
R('S.viewAs=v.value==="admin"?null:v.value;','{const [a,b]=v.value.split(":");S.viewAs=a==="admin"?null:a;if(b)setPvStage(b,true);S.game=null;}')
R("To see a child's work, open <b>Learners</b> and tap the child.</span></section>`;}","To see a child's work, open <b>Learners</b> and tap the child.</span>${pvStageChips()}</section>`;}")
# course homework and course notices reach only children of that course's age group
R('(h.courseId?learnersInCourse(h.courseId).filter(L=>hwForLearner(h,L)):[])','(h.courseId?learnersInCourse(h.courseId).filter(L=>hwForLearner(h,L)&&learnCourses(L).includes(h.courseId)):[])')
R('function noteLearners(n){if(n.audience==="course")return learnersInCourse(n.courseId);','function noteLearners(n){if(n.audience==="course")return learnersInCourse(n.courseId).filter(L=>learnCourses(L).includes(n.courseId));')
R('<span class="hint">Everyone in this course gets the homework.</span>','<span class="hint">Everyone in this course whose age group matches the course gets the homework.</span>')
R('@media (prefers-reduced-motion:reduce)','''.qopt.qbig{font-size:2.6rem;min-height:96px;line-height:1}
.qopts:has(.qbig){grid-template-columns:repeat(3,minmax(0,1fr))}
.qopt.qlong{font-family:var(--body);font-weight:700;font-size:1.05rem;text-align:left}
.agswatch{width:120px;height:120px;border-radius:50%;margin:4px auto;border:4px solid var(--line)}
.agcount{font-size:2.4rem;line-height:1.3;text-align:center;letter-spacing:4px;word-break:break-all}
.agword{font-family:var(--display);font-size:2.4rem;font-weight:800;letter-spacing:6px;text-align:center;margin:0}
.agblank{color:var(--tomato,#E8492F);text-decoration:underline}
.agsent{font-size:1.25rem;line-height:1.6;background:var(--soft);border-radius:16px;padding:14px 16px;margin:0}
.agline,.agbank{display:flex;flex-wrap:wrap;gap:8px;min-height:56px;padding:10px;border-radius:16px}
.agline{background:var(--soft);border:2px dashed var(--line)}
.agtile{min-height:48px;padding:8px 14px;border-radius:14px;border:2px solid var(--line);background:var(--card);font:inherit;font-weight:700;font-size:1.1rem;color:var(--soil);cursor:pointer}
.agtile.on{background:var(--sprout);border-color:var(--leafMid)}
#agtype{font-size:1.4rem;letter-spacing:2px}
.pvages{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:8px;width:100%}
@media (prefers-reduced-motion:reduce)''')

R('/* ================= events ================= */',open(W+'agegames_data.js').read()+open(W+'agegames_block.js').read()+open(W+'adgame_block.js').read()+open(W+'report_block.js').read()+open(W+'debate_data.js').read()+open(W+'debate_block.js').read()+'\n/* ================= events ================= */')
# ---- adaptive levels: header, feedback, Next/Finish, daily stars, quizzes ----
R('${g.type!=="speed"?` · ${g.i+1} of ${g.qs.length}`:""}','${g.ad?adLede(g):g.type!=="speed"?` · ${g.i+1} of ${g.qs.length}`:""}')
R('${q.why?` <span class="mtline">${esc(q.why)}</span>`:""}','${q.why?` <span class="mtline">${esc(q.why)}</span>`:""}${adFbHTML(g)}')
R('${g.i<g.qs.length-1?"Next":"Finish"} ${ic("fwd")}</button></div>`:""}</section>`}`;}','${agMore(g)?"Next":"Finish"} ${ic("fwd")}</button></div>`:""}</section>`}`;}')
R('const stars=g.type==="daily"?g.score:','const stars=g.type==="daily"?Math.min(5,g.ad?g.ad.ft:g.score):')
R('<p class="qzscore" aria-live="polite">⭐ ${st.score} right${st.streak>=3?` · 🔥 ${st.streak} in a row!`:""}</p>','<p class="qzscore" aria-live="polite">⭐ ${st.score} right${st.streak>=3?` · 🔥 ${st.streak} in a row!`:""}${qzAdHTML(st,kind)}</p>${st.deck[st.i]&&st.deck[st.i].again?`<p class="small adnote">💪 Practice: let\'s try this one again.</p>`:""}')
R('<button class="btn btn-primary" data-act="qzNext" data-id="${kind}">Next question</button>','${qzFbHTML(st)}<button class="btn btn-primary" data-act="qzNext" data-id="${kind}">Next question</button>')
R('@media (prefers-reduced-motion:reduce)','.adnote{color:var(--leaf);font-weight:700}\n@media (prefers-reduced-motion:reduce)')
R('Counts only minutes when the child is actively using the portal.</p></div>`;}','Counts only minutes when the child is actively using the portal.</p>${adLevelsHTML(L)}</div>`;}')
R('.adnote{color:var(--leaf);font-weight:700}','.adnote{color:var(--leaf);font-weight:700}\n.adlv{margin-top:10px}')
# ---- parent: detailed report on the Progress page ----
R('''  </div>
  ${adaptParentHTML(L)}''','''  </div>
  ${parentReportHTML(L)}
  ${adaptParentHTML(L)}''')
R('.adlv{margin-top:10px}','''.adlv{margin-top:10px}
.repcard h3{font-size:1.05rem;margin:14px 0 8px}
.repsum{background:var(--leafSoft);border-radius:18px;padding:14px 16px;margin:4px 0 10px}
.repsum p{margin:0 0 6px;line-height:1.55}
.reptips{margin:6px 0 0;padding-left:20px;line-height:1.55}
.reptips li{margin:4px 0}
.repstats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin:6px 0 4px}
.repstats div{background:var(--soft);border-radius:16px;padding:12px;text-align:center}
.repstats b{display:block;font-family:var(--display);font-size:1.5rem;line-height:1.1;color:var(--soil)}
.repstats span{display:block;font-size:.85rem;font-weight:700}
.repstats small{display:block;font-size:.78rem;color:var(--muted)}
.repseg button{border:0;background:transparent;border-radius:999px;min-height:40px;padding:6px 14px;font:inherit;font-weight:700;color:var(--soil);cursor:pointer}
.repseg button.on{background:var(--card);box-shadow:0 1px 3px rgba(0,0,0,.12)}
.repdots{color:var(--leaf);letter-spacing:2px;font-size:1rem}
.replv .row{min-height:32px;border-bottom:1px dashed var(--line)}
.repmore summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:700;color:var(--leaf)}''')
# ---- Debate with Pip ----
R('@media (prefers-reduced-motion:reduce)','''.dbmotion h2{font-size:1.5rem;text-align:center}
.dbsides{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}.dbsides .btn{min-width:150px}
.dbmot{margin:0 0 8px}
.dbchat{display:flex;flex-direction:column;gap:10px;margin:0 0 12px}
.dbmsg{display:flex;gap:8px;align-items:flex-end}.dbmsg p{margin:0;padding:10px 14px;border-radius:18px;max-width:85%;line-height:1.45}
.dbmsg.pip p{background:#fff;border:2px solid var(--leaf-light,#DDEFC4);border-bottom-left-radius:4px}
.dbmsg.me{justify-content:flex-end}.dbmsg.me p{background:#DDEFC4;border-bottom-right-radius:4px}
.dbhear{min-width:44px;min-height:44px;vertical-align:middle}
.dbinput{display:flex;flex-direction:column;gap:8px;background:#fff;border-radius:20px;padding:14px}
.dbinput textarea{width:100%;font:inherit;font-size:1rem;border-radius:12px;padding:10px}
.dbstarters{display:flex;flex-wrap:wrap;gap:6px}.dbstarters .chip{min-height:44px;border:2px solid #DDEFC4;background:#F5FAEE;cursor:pointer}
.dbbtns{justify-content:flex-end;flex-wrap:wrap}.dbbtns .btn{min-height:44px}
.dbchecks{list-style:none;padding:0;margin:0;text-align:left;display:grid;gap:4px}
.dbtips{background:#FFF4D6;border-radius:12px;padding:10px 14px;text-align:left}.dbtips ul{margin:4px 0 0;padding-left:18px}
.dbtrans{margin-top:12px}.dbtrans summary{cursor:pointer;font-weight:700;min-height:44px;display:flex;align-items:center}
.dbpip{display:flex;gap:10px;align-items:center}.dbpip svg,.dbmsg svg{flex:none}.dbpip svg{width:64px!important;height:64px!important}.dbmsg svg{width:40px!important;height:40px!important}
.dbchoose{display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap}
.dbbig{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:130px;min-height:130px;padding:14px;border-radius:28px;border:3px solid #DDEFC4;background:#fff;cursor:pointer;font:inherit}
.dbbig span{font-size:3.4rem;line-height:1}.dbbig b{font-family:var(--display);font-size:1.2rem}
.dbor{font-family:var(--display);font-weight:800;font-size:1.2rem}
.dbline{font-family:var(--display);font-weight:800;font-size:1.5rem;text-align:center;margin:8px 0}
@media (prefers-reduced-motion:reduce)''')
