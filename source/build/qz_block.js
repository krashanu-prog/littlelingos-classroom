/* ---------- GK quiz and Word power: endless, no question count ---------- */
const QZ={gk:{src:()=>window.LL_GK||{},title:"GK quiz",art:"buzz"},en:{src:()=>window.LL_EN||{},title:"Word power",art:"drizzle"}};
const QS={};
const qzDeck=(kind,stage)=>shuffle(((QZ[kind].src()[stage])||[]).slice()).map(x=>({q:x.q,a:x.a,opts:shuffle([x.a,...x.o])}));
function qzState(kind){let st=QS[kind];if(!st){const L=myLearner();const stage=(L&&L.stage)||"Sprouts";st=QS[kind]={stage,deck:qzDeck(kind,stage),i:0,score:0,answered:0,streak:0,picked:null,done:false};}if(!st.deck.length)st.deck=qzDeck(kind,st.stage);return st;}
const QZ_YAY=["Yay! That's right.","Brilliant!","Super thinking!","You got it!","Well done!"];
function quizHTML(kind){const st=qzState(kind),K=QZ[kind];
  const head=`<div class="ph"><h2>${esc(K.title)}</h2><div class="row"><select data-change="qzStage" aria-label="Level">${STAGES.map(s=>`<option value="${kind}:${s.v}" ${s.v===st.stage?"selected":""}>${s.v} · ${s.ages}</option>`).join("")}</select>${st.answered&&!st.done?`<button class="btn btn-ghost btn-sm" data-act="qzDone" data-id="${kind}">I'm done</button>`:""}</div></div>`;
  if(!st.deck.length)return `<section class="card panel">${head}<p class="muted">No questions for this level yet.</p></section>`;
  if(st.done){const n=st.answered,m=st.score;return `<section class="card panel">${head}<div class="gkdone">${art(m>=n*.7?"bloom":"pip",110,m>=n*.7?"Bloom":"Pip")}<h3>You answered ${n} question${n===1?"":"s"} and got ${m} right!</h3><p class="muted">${m>=n*.7?"You've bloomed! Your brain is growing.":"Good try! Every question helps your brain grow."}</p><button class="btn btn-primary" data-act="qzAgain" data-id="${kind}">Keep playing</button></div></section>`;}
  if(st.i>=st.deck.length){st.deck=qzDeck(kind,st.stage);st.i=0;}
  const x=st.deck[st.i],done=st.picked!=null;
  return `<section class="card panel qzpanel">${head}<p class="qzscore" aria-live="polite">⭐ ${st.score} right${st.streak>=3?` · 🔥 ${st.streak} in a row!`:""}</p><h3 class="gkq">${esc(x.q)}</h3>
    <div class="gkopts">${x.opts.map((o,k)=>`<button class="gkopt ${done?(o===x.a?"right":(st.picked===k?"nope":"")):""}" data-act="qzPick" data-id="${kind}:${k}" ${done?"disabled":""}>${esc(o)}</button>`).join("")}</div>
    ${done?`<p class="gkfb" aria-live="polite">${x.opts[st.picked]===x.a?esc(QZ_YAY[st.answered%QZ_YAY.length]):`Good try! The answer is <b>${esc(x.a)}</b>.`}</p><button class="btn btn-primary" data-act="qzNext" data-id="${kind}">Next question</button>`:""}</section>`;}
A.qzPick=v=>{const [kind,k]=String(v).split(":");const st=qzState(kind);if(st.picked!=null)return;st.picked=+k;st.answered++;const x=st.deck[st.i];if(x.opts[+k]===x.a){st.score++;st.streak++;}else st.streak=0;render(true);};
A.qzNext=kind=>{const st=qzState(kind);st.i++;st.picked=null;render(true);};
A.qzDone=kind=>{const st=qzState(kind);st.done=true;render(true);};
A.qzAgain=kind=>{const st=qzState(kind);Object.assign(st,{score:0,answered:0,streak:0,picked:null,done:false});st.i++;render(true);};
A.qzStage=(_,v)=>{const [kind,stage]=String(v).split(":");QS[kind]={stage,deck:qzDeck(kind,stage),i:0,score:0,answered:0,streak:0,picked:null,done:false};render(true);};
A.goQuiz=kind=>{S.fun=kind;go("fun");};
