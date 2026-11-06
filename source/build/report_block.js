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
function repTips(L,d){if(!L.uid)return "";const n=esc(firstOf(L.name)),t=[];const sk=Object.entries(d.skills).filter(([,v])=>v.n>=4).map(([k,v])=>[k,v.r/v.n]);
  const best=sk.slice().sort((a,b)=>b[1]-a[1])[0],weak=sk.slice().sort((a,b)=>a[1]-b[1])[0];
  if(best&&best[1]>=0.75)t.push(`🌟 <b>Strength:</b> ${esc(best[0])} (${pctStr(best[1])} right). Praise this!`);
  if(weak&&weak[1]<0.6&&(!best||weak[0]!==best[0]))t.push(`🌱 <b>Needs practice:</b> ${esc(weak[0])} (${pctStr(weak[1])} right). The games will give ${n} extra practice here.`);
  if(d.practise.length)t.push(`🗣️ <b>At home:</b> say the "words to practise" below together, a few times this week.`);
  if(d.days<3)t.push(`⏱️ <b>Little and often:</b> 10–15 minutes on most days works better than one long session.`);
  if(d.hwSet.length>d.hwIn.length)t.push(`📒 <b>Homework:</b> ${d.hwSet.length-d.hwIn.length} task${d.hwSet.length-d.hwIn.length===1?" is":"s are"} still to hand in.`);
  return t.length?`<ul class="reptips">${t.map(x=>`<li>${x}</li>`).join("")}</ul>`:"";}
function repMeter(v,max=5){return `<span class="repdots" aria-label="${v} of ${max}">${"●".repeat(v)}${"○".repeat(max-v)}</span>`;}
/* trainers' class reports for this child in the period (participation / understanding / note) */
function repTeacher(L,since){const out=[];const sk=ymd(new Date(since));for(const v of Object.values(allMarks())){const st=v.m&&v.m[L.id];if(!st||String(v.date).slice(0,10)<sk)continue;
    const note=(v.notes||{})[L.id]||"";const r=typeof srepParse==="function"?srepParse(note):{p:-1,u:-1,txt:note};out.push({date:v.date,title:v.title||"Class",st,p:r.p,u:r.u,txt:r.txt,by:v.by});}
  return out.sort((a,b)=>String(b.date).localeCompare(String(a.date)));}
const repAvgLv=xs=>{const v=xs.filter(x=>x>=0);if(!v.length)return null;return Math.round(v.reduce((a,b)=>a+b,0)/v.length);};
function parentReportHTML(L){if(!L)return "";const p=S.repP||"week",d=repData(L,p),n=esc(firstOf(L.name)),signed=!!L.uid;
  const pool=signed?(pipTry(()=>gamePool(L))||[]):[],meaning=w=>{const x=pool.find(y=>String(y.w).toLowerCase()===w);return x?meanFor(x.w,x.m):"";};
  const skills=Object.entries(d.skills).sort((a,b)=>b[1].n-a[1].n);
  const lv=Object.entries(d.adl).filter(([,v])=>+v>=1).sort((a,b)=>(+b[1])-(+a[1]));
  const tr=repTeacher(L,d.since),came=tr.filter(x=>x.st!=="absent"),pA=repAvgLv(came.map(x=>x.p)),uA=repAvgLv(came.map(x=>x.u));
  const cids=learnCourses(L),crs=cids.map(cid=>{const c=D.courses[cid],ls=lessonsOf(cid),dn=ls.filter(l=>isDone(L.uid,l.id)).length;return {c,dn,t:ls.length};}).filter(x=>x.c&&x.t);
  const tiles=[
    signed&&[esc(fmtMins(d.mins)),"Time learning",`${d.days} active day${d.days===1?"":"s"}`],
    signed&&d.total&&[pctStr(d.right/d.total),"Answers right",`${d.games.length} game${d.games.length===1?"":"s"}`],
    signed&&[String(d.words.length),"New words",`${d.mastered} mastered`],
    signed&&[String(d.lessons),"Lessons done",crs.length?`${crs.reduce((a,x)=>a+x.dn,0)} of ${crs.reduce((a,x)=>a+x.t,0)} in total`:""],
    d.at&&[`${d.ap}/${d.at}`,"Classes attended",""],
    (d.hwSet.length||d.hwIn.length)&&[`${d.hwIn.length}/${Math.max(d.hwSet.length,d.hwIn.length)}`,"Homework in",""],
    pA!=null&&[esc(SREP_LV[pA].split(" ").slice(1).join(" ")),"Participation","teacher's view"],
    uA!=null&&[esc(SREP_LV[uA].split(" ").slice(1).join(" ")),"Understanding","teacher's view"]].filter(Boolean);
  const sec=(t,body)=>body?`<div class="repsec"><h3>${t}</h3>${body}</div>`:"";
  const teacherHTML=came.filter(x=>x.txt).slice(0,3).map(x=>`<div class="reptr"><div class="small muted">${esc(fmtDay(new Date(x.date)))} · ${esc(x.title)}${x.p>=0?` · ${esc(SREP_LV[x.p])}`:""}</div><div>${esc(x.txt)}</div></div>`).join("");
  const skillHTML=skills.map(([k,v])=>{const r=v.n?v.r/v.n:0;return `<div class="reprow"><span>${esc(k)}</span><div class="bar"><i style="width:${pctStr(r)};background:${r>=.75?"var(--leaf)":r>=.5?"var(--sun)":"var(--petal)"}"></i></div><b class="num">${pctStr(r)}</b></div>`;}).join("");
  const lvHTML=lv.map(([k,v])=>`<div class="reprow"><span>${esc(REP_GAME(k))}</span>${repMeter(+v)}</div>`).join("");
  const wordsHTML=d.practise.slice(0,6).map(([w,v])=>`<span class="repw" title="${esc(meaning(w))}"><b>${esc(w)}</b>${mt(w)?` ${mtHTML(w)}`:""}<i>×${+v.m}</i></span>`).join("");
  const crsHTML=crs.map(x=>`<div class="reprow"><span>${esc(x.c.title)}</span><div class="bar"><i style="width:${pctStr(x.t?x.dn/x.t:0)}"></i></div><b class="num">${x.dn}/${x.t}</b></div>`).join("");
  return `<section class="card panel repcard">
  <div class="ph"><h2>${n}'s report <span class="pill p-good">${esc(L.stage||"Seeds")}</span></h2><div class="row"><div class="seg repseg" role="group" aria-label="Report period"><button class="${p==="week"?"on":""}" data-act="repP" data-id="week" aria-pressed="${p==="week"}">Week</button><button class="${p==="month"?"on":""}" data-act="repP" data-id="month" aria-pressed="${p==="month"}">Month</button></div><button class="btn btn-ghost btn-sm" data-act="printReport" aria-label="Print or save the report">🖨️ Print</button></div></div>
  <div class="repsum">${signed?repSummary(L,d,p):`<p><b>${n} hasn't signed in to the app yet,</b> so games, words and time aren't counted. Classes, homework and teacher reports are below.</p>`}${repTips(L,d)}</div>
  ${tiles.length?`<div class="repstats">${tiles.map(([b,s,sm])=>`<div><b class="num">${b}</b><span>${s}</span>${sm?`<small>${sm}</small>`:""}</div>`).join("")}</div>`:""}
  <div class="repgrid">
    ${sec("From the teacher",teacherHTML)}
    ${sec(p==="month"?"Skills this month":"Skills this week",skillHTML)}
    ${sec("Game levels <small class=\"muted\">(5 = hardest)</small>",lvHTML)}
    ${sec("Words to practise at home",wordsHTML?`<div class="repws">${wordsHTML}</div>`:"")}
    ${sec("Courses",crsHTML)}
    ${signed&&d.mins?sec("Minutes each day",usageBars(L.uid,p==="month"?30:14)):""}
  </div>
  ${d.acts.length?`<details class="repmore"><summary>Everything ${n} did (${d.acts.length})</summary><div class="list">${d.acts.slice(0,40).map(x=>`<div class="item"><div class="grow"><div class="t">${esc(x.t||REP_GAME(x.k))}</div><div class="s">${esc(fmtDay(new Date(x.at)))}, ${esc(fmtTime(new Date(x.at)))}</div></div>${x.n?`<span class="pill ${x.s/x.n>=.75?"p-good":x.s/x.n>=.5?"p-warn":"p-mute"}">${x.s}/${x.n}</span>`:typeof actResult==="function"?`<span class="pill p-mute">${esc(actResult(x))}</span>`:""}</div>`).join("")}</div></details>`:""}
  </section>`;}
A.repP=p=>{S.repP=p==="month"?"month":"week";render(true);};
A.printReport=()=>{const el=document.querySelector(".repcard");if(!el)return;const det=el.querySelector("details");if(det)det.open=true;el.classList.add("printdoc");setTimeout(()=>{try{window.print()}catch{toast("Printing isn't available here.",true)}setTimeout(()=>el.classList.remove("printdoc"),500);},50);};
