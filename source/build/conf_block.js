/* ================= Feature 2: Confidence meter (how brave speaking English feels) ================= */
const CONF=[[1,"I feel shy"],[2,"I feel a bit shy"],[3,"I feel okay"],[4,"I feel brave"]];
const CONF_T=["","Shy","A bit shy","Okay","Brave"];
const ymOf=t=>ymd(new Date(t||Date.now())).slice(0,7);
function pipFace(v,size){const s=size||56,m={1:"M84 150 q16 -6 32 0",2:"M84 148 q16 4 32 0",3:"M84 144 q16 14 32 0",4:"M82 140 q18 26 36 0 z"}[v];
  return `<svg viewBox="30 50 140 150" width="${s}" height="${s}" aria-hidden="true"><ellipse cx="100" cy="128" rx="66" ry="62" fill="#2F8F46"/><ellipse cx="100" cy="148" rx="44" ry="28" fill="#3FA75A"/>${v===1?`<path d="M66 116 q10 -6 20 0 M114 116 q10 -6 20 0" stroke="#2E2219" stroke-width="6" fill="none" stroke-linecap="round"/>`:`<circle cx="78" cy="118" r="13" fill="#fff"/><circle cx="80" cy="${v===2?123:120}" r="7" fill="#2E2219"/><circle cx="122" cy="118" r="13" fill="#fff"/><circle cx="124" cy="${v===2?123:120}" r="7" fill="#2E2219"/>`}
    <ellipse cx="60" cy="140" rx="9" ry="5" fill="#F7A8C4"/><ellipse cx="140" cy="140" rx="9" ry="5" fill="#F7A8C4"/><path d="${m}" ${v===4?'fill="#2E2219"':'fill="none" stroke="#2E2219" stroke-width="6" stroke-linecap="round"'}/></svg>`;}
const confSelf=L=>(L&&L.uid&&progOf(L.uid).conf)||{};
function confTeach(L){const o={};for(const x of txAll("conf"))if(x.lid===L.id&&x.ym&&(!o[x.ym]||(x.at||0)>(o[x.ym].at||0)))o[x.ym]=x;return o;}
function confSeries(L,n){const months=[];const d=new Date();d.setDate(1);for(let i=(n||6)-1;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth()-i,1);months.push(ymd(x).slice(0,7));}
  const me=confSelf(L),t=confTeach(L);return months.map(ym=>{const a=me[ym]&&+me[ym].v||null,b=t[ym]&&+t[ym].v||null;return {ym,self:a,teach:b,avg:a&&b?(a+b)/2:a||b||null};});}
function confDropping(L){const s=confSeries(L,3).map(x=>x.avg);return s.every(v=>v!=null)&&s[1]<s[0]&&s[2]<s[1];}
function confChart(L){const s=confSeries(L,6),W=320,H=150,px=i=>28+i*(W-44)/5,py=v=>H-24-(v-1)*(H-44)/3;
  const line=(k,c,dash)=>{const pts=s.map((x,i)=>x[k]?[px(i),py(x[k])]:null);let d="";pts.forEach((p,i)=>{if(!p)return;d+=(d&&pts[i-1]?"L":"M")+p[0]+" "+p[1];});return `${d?`<path d="${d}" fill="none" stroke="${c}" stroke-width="3" ${dash?'stroke-dasharray="6 5"':""} stroke-linecap="round" stroke-linejoin="round"/>`:""}${pts.map(p=>p?`<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${c}"/>`:"").join("")}`;};
  const mon=ym=>new Date(ym+"-15").toLocaleString(undefined,{month:"short"});
  return `<svg viewBox="0 0 ${W} ${H}" class="confchart" role="img" aria-label="Confidence over the last 6 months">${[1,2,3,4].map(v=>`<line x1="28" x2="${W-16}" y1="${py(v)}" y2="${py(v)}" stroke="#D5E8BE"/><text x="2" y="${py(v)+4}" font-size="10" fill="#5C4F45">${["","Shy","Bit shy","Okay","Brave"][v]}</text>`).join("")}
    ${s.map((x,i)=>`<text x="${px(i)}" y="${H-6}" font-size="10" text-anchor="middle" fill="#5C4F45">${mon(x.ym)}</text>`).join("")}${line("teach","#4BA3E3",true)}${line("self","#2F8F46")}</svg>
    <p class="small muted" style="margin:0"><span style="color:#2F8F46">●</span> How ${esc(firstOf(L.name))} feels &nbsp; <span style="color:#4BA3E3">●</span> Teacher, in class</p>`;}
function confSentence(L){const s=confSeries(L,6).filter(x=>x.avg!=null),f=firstOf(L.name);if(!s.length)return `${f} will start sharing how brave they feel speaking English each month.`;
  const last=s[s.length-1],first=s[0];if(s.length===1)return `${f} feels “${CONF_T[Math.round(last.avg)].toLowerCase()}” speaking English this month. We'll track it gently each month.`;
  if(last.avg>first.avg)return `${f} is growing braver about speaking English: from “${CONF_T[Math.round(first.avg)].toLowerCase()}” to “${CONF_T[Math.round(last.avg)].toLowerCase()}”.`;
  if(last.avg<first.avg)return `${f} feels a little less sure speaking lately. That's normal while learning; lots of encouragement at home helps.`;
  return `${f}'s speaking confidence is steady. Celebrating small tries at home keeps it growing.`;}
function confParentHTML(L){if(!L||!L.uid)return "";return `<section class="card panel"><h2>Speaking confidence</h2><p>${esc(confSentence(L))}</p>${confChart(L)}</section>`;}
/* kid: once a month */
function confKidHTML(L){if(!L||!L.uid||confSelf(L)[ymOf()])return "";
  return `<section class="confask"><b>How brave do you feel speaking English?</b><div class="conffaces">${CONF.map(([v,t])=>`<button class="cface" data-act="confPick" data-id="${v}" aria-label="${t}">${pipFace(v,60)}<span>${t.replace("I feel ","")}</span></button>`).join("")}</div><p class="small muted" style="margin:0">Every answer is a good answer!</p></section>`;}
A.confPick=v=>{if(realRole()!=="student"||S.viewAs){toast("Only the learner can answer this.",true);return}const ym=ymOf();
  save(async()=>{await upsert("progress/"+S.uid,{conf:{[ym]:{v:+v,at:Date.now()}}});if(!D.progress[S.uid])D.progress[S.uid]={};D.progress[S.uid].conf={...(D.progress[S.uid].conf||{}),[ym]:{v:+v,at:Date.now()}};render(true);},+v>=3?"Thanks for telling Pip! 🌟":"Thanks for telling Pip. Every try makes you braver! 🌱");};
/* trainers */
function confStaffHTML(L){if(!L.uid)return "";const t=confTeach(L)[ymOf()];
  return `<p class="section-title">Speaking confidence</p><div class="adstaff">${confDropping(L)?`<span class="pill p-sun" style="align-self:flex-start">Dropped two months running: a kind word could help</span>`:""}${confChart(L)}
    <div><span class="small"><b>Your rating for ${esc(new Date().toLocaleString(undefined,{month:"long"}))}:</b></span><div class="row" style="gap:6px;margin-top:4px">${CONF.map(([v])=>`<button type="button" class="btn btn-sm ${t&&+t.v===v?"btn-leaf":"btn-ghost"}" data-mact="conf" data-id="${v}">${CONF_T[v]}</button>`).join("")}</div></div></div>`;}
A.confRate=(lid,v)=>{save(()=>S.db.doc(`tw/${S.uid}/x/conf-${lid}-${ymOf()}`).set({kind:"conf",lid,ym:ymOf(),v:+v,at:Date.now()}),"Confidence saved");};
function confFlagList(){const ls=role()==="admin"?activeLearners():pipTry(()=>teacherLearners(myTid()))||[];return ls.filter(L=>L.uid&&confDropping(L));}
