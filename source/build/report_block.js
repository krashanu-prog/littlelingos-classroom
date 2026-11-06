/* ================= Parent: detailed report (this week / this month) ================= */
const REP_SKILL={quiz:"Word meanings",revise:"Word meanings",memory:"Word meanings",cloze:"Word meanings",en:"Word meanings",odd:"Word meanings",
  listen:"Listening",pic:"Listening",sound:"Listening",drill:"Speaking",
  bee:"Spelling and letters",miss:"Spelling and letters",
  build:"Sentences and grammar",fix:"Sentences and grammar",
  gk:"General knowledge",count:"Numbers and colours",colour:"Numbers and colours",daily:"Daily challenge",speed:"Speed round"};
const REP_GAME=k=>{const [x,st]=String(k).split("-");return x==="en"?"Word power":x==="gk"?"GK quiz":(typeof AG_TITLE!=="undefined"&&AG_TITLE[k])||k;};
function repSince(p){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(p==="month"?29:6));return d.getTime();}
function repData(L,p){const uid=L.uid,since=repSince(p),sinceK=ymd(new Date(since)),today=ymd(new Date());
  const pr=progOf(uid)||{},sc=pr.screen||{};let mins=0,days=0;for(const [k,v] of Object.entries(sc))if(k>=sinceK&&k<=today&&+v>0){mins+=+v;days++;}
  const acts=actsOf(uid).filter(x=>(x.at||0)>=since);
  const games=acts.filter(x=>x.n>0&&x.k!=="lesson"&&x.k!=="chess");let right=0,total=0;for(const x of games){right+=+x.s||0;total+=+x.n||0;}
  const skills={};for(const x of games){const s=REP_SKILL[x.k];if(!s)continue;const o=skills[s]=skills[s]||{r:0,n:0,c:0};o.r+=+x.s||0;o.n+=+x.n||0;o.c++;}
  const lessons=flowersSince(uid,since),words=wordsOf(uid,since);
  const hws=hwFor(L),hwSet=hws.filter(h=>(h.at||0)>=since||(h.due&&h.due>=sinceK)),hwIn=hws.filter(h=>{const a=answerOf(L,h);return a&&(a.at||0)>=since;});
  let ap=0,at=0;for(const v of Object.values(allMarks())){const st=v.m[L.id];if(!st||String(v.date)<sinceK)continue;at++;if(st==="present"||st==="late")ap++;}
  const wk=pr.wk||{},wkE=Object.entries(wk);const practise=wkE.filter(([,v])=>+v.m>0).sort((a,b)=>(+b[1].m)-(+a[1].m)||(+b[1].t||0)-(+a[1].t||0));
  const mastered=wkE.filter(([,v])=>+v.r>=2&&!(+v.m>0)).length;
  const adl=pr.adl||{};
  return {mins,days,acts,games,right,total,skills,lessons,words,hwSet,hwIn,ap,at,practise,mastered,adl,since};}
function repSummary(L,d,p){const n=esc(firstOf(L.name)),per=p==="month"?"In the last 30 days":"This week",bits=[];
  if(d.mins)bits.push(`spent <b>${esc(fmtMins(d.mins))}</b> learning on ${d.days} day${d.days===1?"":"s"}`);
  if(d.games.length)bits.push(`played <b>${d.games.length}</b> game${d.games.length===1?"":"s"}${d.total?` (<b>${pctStr(d.right/d.total)}</b> of answers right)`:""}`);
  if(d.lessons)bits.push(`finished <b>${d.lessons}</b> lesson${d.lessons===1?"":"s"}`);
  if(d.words.length)bits.push(`learned <b>${d.words.length}</b> new word${d.words.length===1?"":"s"}`);
  if(d.at)bits.push(`came to <b>${d.ap} of ${d.at}</b> class${d.at===1?"":"es"}`);
  if(d.hwIn.length)bits.push(`handed in <b>${d.hwIn.length}</b> homework task${d.hwIn.length===1?"":"s"}`);
  if(!bits.length)return `<p>${per}, ${n} hasn't used Little Lingos yet. A few minutes a day makes a big difference: try the Daily challenge together.</p>`;
  const last=bits.pop();return `<p>${per}, ${n} ${bits.length?bits.join(", ")+" and "+last:last}.</p>`;}
function repTips(L,d){const n=esc(firstOf(L.name)),t=[];const sk=Object.entries(d.skills).filter(([,v])=>v.n>=4).map(([k,v])=>[k,v.r/v.n]);
  const best=sk.slice().sort((a,b)=>b[1]-a[1])[0],weak=sk.slice().sort((a,b)=>a[1]-b[1])[0];
  if(best&&best[1]>=0.75)t.push(`🌟 <b>Strength:</b> ${esc(best[0])} (${pctStr(best[1])} right). Praise this!`);
  if(weak&&weak[1]<0.6&&(!best||weak[0]!==best[0]))t.push(`🌱 <b>Needs practice:</b> ${esc(weak[0])} (${pctStr(weak[1])} right). The games will give ${n} extra practice here.`);
  if(d.practise.length)t.push(`🗣️ <b>At home:</b> say the "words to practise" below together, a few times this week.`);
  if(d.days<3)t.push(`⏱️ <b>Little and often:</b> 10–15 minutes on most days works better than one long session.`);
  if(d.hwSet.length>d.hwIn.length)t.push(`📒 <b>Homework:</b> ${d.hwSet.length-d.hwIn.length} task${d.hwSet.length-d.hwIn.length===1?" is":"s are"} still to hand in.`);
  return t.length?`<ul class="reptips">${t.map(x=>`<li>${x}</li>`).join("")}</ul>`:"";}
function repMeter(v,max=5){return `<span class="repdots" aria-label="${v} of ${max}">${"●".repeat(v)}${"○".repeat(max-v)}</span>`;}
function parentReportHTML(L){if(!L||!L.uid)return "";const p=S.repP||"week",d=repData(L,p),n=esc(firstOf(L.name));
  const pool=pipTry(()=>gamePool(L))||[],meaning=w=>{const x=pool.find(y=>String(y.w).toLowerCase()===w);return x?meanFor(x.w,x.m):"";};
  const skills=Object.entries(d.skills).sort((a,b)=>b[1].n-a[1].n);
  const lv=Object.entries(d.adl).filter(([,v])=>+v>=1).sort((a,b)=>(+b[1])-(+a[1]));
  return `<section class="card panel repcard">
  <div class="ph"><h2>${n}'s report</h2><div class="row"><div class="seg repseg" role="group" aria-label="Report period"><button class="${p==="week"?"on":""}" data-act="repP" data-id="week" aria-pressed="${p==="week"}">This week</button><button class="${p==="month"?"on":""}" data-act="repP" data-id="month" aria-pressed="${p==="month"}">This month</button></div><button class="btn btn-ghost btn-sm" data-act="printReport">🖨️ Print or save</button></div></div>
  <div class="repsum">${repSummary(L,d,p)}${repTips(L,d)}</div>
  <div class="repstats">
    <div><b class="num">${esc(fmtMins(d.mins))}</b><span>Time learning</span><small>${d.days} active day${d.days===1?"":"s"}</small></div>
    <div><b class="num">${d.total?pctStr(d.right/d.total):"–"}</b><span>Answers right</span><small>${d.games.length} game${d.games.length===1?"":"s"}</small></div>
    <div><b class="num">${d.words.length}</b><span>New words</span><small>${d.mastered} mastered in total</small></div>
    <div><b class="num">${d.lessons}</b><span>Lessons finished</span></div>
    <div><b class="num">${d.at?`${d.ap}/${d.at}`:"–"}</b><span>Classes attended</span></div>
    <div><b class="num">${d.hwSet.length||d.hwIn.length?`${d.hwIn.length}/${Math.max(d.hwSet.length,d.hwIn.length)}`:"–"}</b><span>Homework handed in</span></div>
  </div>
  <div class="cols even">
    <div><h3>Skills ${p==="month"?"this month":"this week"}</h3>${skills.length?skills.map(([k,v])=>{const r=v.n?v.r/v.n:0;return `<div class="${r>=.75?"h0":r>=.5?"h2":"h3"}"><div class="row" style="justify-content:space-between"><span class="small" style="font-weight:700">${esc(k)}</span><span class="small muted">${v.r} of ${v.n} right</span></div><div class="barrow"><div class="bar"><i style="width:${pctStr(r)}"></i></div><b class="num">${pctStr(r)}</b></div></div>`;}).join(""):`<p class="muted small">Skills show here once ${n} plays some games.</p>`}</div>
    <div><h3>Game levels</h3>${lv.length?`<div class="replv">${lv.map(([k,v])=>`<div class="row" style="justify-content:space-between"><span class="small">${esc(REP_GAME(k))}</span>${repMeter(+v)}</div>`).join("")}</div><p class="small muted">Levels go up when ${n} answers correctly and down for extra practice. 5 is the hardest.</p>`:`<p class="muted small">Levels appear after ${n} plays the games.</p>`}</div>
  </div>
  <div class="cols even">
    <div><h3>Words to practise at home</h3>${d.practise.length?`<div class="list">${d.practise.slice(0,8).map(([w,v])=>`<div class="item"><div class="grow"><div class="t">${esc(w)}${mt(w)?` · ${mtHTML(w)}`:""}</div>${meaning(w)?`<div class="s">${esc(meaning(w))}</div>`:""}</div><span class="pill p-warn">missed ${+v.m}×</span></div>`).join("")}</div>`:`<p class="muted small">No tricky words right now. Lovely!</p>`}</div>
    <div><h3>Time on Little Lingos</h3>${usageBars(L.uid,p==="month"?30:14)}<p class="small muted">Minutes each day. Counts only time when ${n} is actively learning.</p>
      ${d.words.length?`<h3>New words</h3><div class="row" style="gap:6px;flex-wrap:wrap">${d.words.slice(0,24).map(w=>`<span class="pill p-mute">${esc(w)}</span>`).join("")}</div>`:""}</div>
  </div>
  ${d.acts.length?`<details class="repmore"><summary>Everything ${n} did (${d.acts.length})</summary><div class="list">${d.acts.slice(0,40).map(x=>`<div class="item"><div class="grow"><div class="t">${esc(x.t||REP_GAME(x.k))}</div><div class="s">${esc(fmtDay(new Date(x.at)))}, ${esc(fmtTime(new Date(x.at)))}</div></div>${x.n?`<span class="pill ${x.s/x.n>=.75?"p-good":x.s/x.n>=.5?"p-warn":"p-mute"}">${x.s}/${x.n}</span>`:typeof actResult==="function"?`<span class="pill p-mute">${esc(actResult(x))}</span>`:""}</div>`).join("")}</div></details>`:""}
  </section>`;}
A.repP=p=>{S.repP=p==="month"?"month":"week";render(true);};
A.printReport=()=>{const el=document.querySelector(".repcard");if(!el)return;const det=el.querySelector("details");if(det)det.open=true;el.classList.add("printdoc");setTimeout(()=>{try{window.print()}catch{toast("Printing isn't available here.",true)}setTimeout(()=>el.classList.remove("printdoc"),500);},50);};
