/* ================= Time on the portal (from the minutes the child's app logs while they are active) ================= */
const scrOf=uid=>(progOf(uid)||{}).screen||{};
function usageOf(uid){const sc=scrOf(uid),now=new Date(),today=ymd(now),m=thisMonth();
  const dayAgo=n=>ymd(new Date(now.getTime()-n*864e5));const d7=dayAgo(6),d30=dayAgo(29);
  let t7=0,t30=0,tm=0,tot=+((progOf(uid)||{}).screenOld)||0,days30=0,last="";
  for(const [k,v] of Object.entries(sc)){const n=+v||0;if(!n)continue;tot+=n;if(k>=d7&&k<=today)t7+=n;if(k>=d30&&k<=today){t30+=n;days30++;}if(k.startsWith(m))tm+=n;if(k>last)last=k;}
  return {today:+sc[today]||0,t7,t30,tm,tot,days30,avg:days30?Math.round(t30/days30):0,last};}
const fmtMins=n=>{n=Math.round(+n||0);if(n<60)return `${n} min`;const h=Math.floor(n/60),r=n%60;return r?`${h} h ${r} min`:`${h} h`;};
const lastSeenTxt=k=>!k?"Not yet":k===ymd(new Date())?"Today":k===ymd(new Date(Date.now()-864e5))?"Yesterday":fmtDay(new Date(k+"T12:00"));
function usageBars(uid,n=14){const sc=scrOf(uid),now=Date.now(),days=[...Array(n)].map((_,i)=>ymd(new Date(now-(n-1-i)*864e5)));const mx=Math.max(30,...days.map(d=>+sc[d]||0));
  return `<div class="usebars" role="img" aria-label="Minutes on the portal, last ${n} days">${days.map(d=>{const v=+sc[d]||0;return `<div class="ub" title="${esc(fmtDay(new Date(d+"T12:00")))}: ${esc(fmtMins(v))}"><span style="height:${Math.max(v?6:2,Math.round(v/mx*100))}%"></span><i>${esc(new Date(d+"T12:00").getDate())}</i></div>`;}).join("")}</div>`;}
function usageCardHTML(L){if(!L||!L.uid)return `<p class="small muted">${esc(firstOf(L&&L.name||"This learner"))} hasn't signed in yet, so there's no time to show.</p>`;
  const u=usageOf(L.uid),lim=limitFor(L);
  return `<div class="usecard"><div class="usestats">
    <div><b class="num">${esc(fmtMins(u.today))}</b><span>Today${lim?` · limit ${lim} min`:""}</span></div>
    <div><b class="num">${esc(fmtMins(u.t7))}</b><span>Last 7 days</span></div>
    <div><b class="num">${esc(fmtMins(u.tm))}</b><span>This month</span></div>
    <div><b class="num">${esc(fmtMins(u.tot))}</b><span>All time</span></div></div>
    ${usageBars(L.uid)}
    <p class="small muted" style="margin:0">Last on: <b>${esc(lastSeenTxt(u.last))}</b> · ${u.days30} active day${u.days30===1?"":"s"} in the last 30 · about ${esc(fmtMins(u.avg))} on a day they use it. Counts only minutes when the child is actively using the portal.</p></div>`;}
/* academy-wide: Analytics › Engagement */
function usageAcademyHTML(ls){const rows=ls.filter(L=>L.uid).map(L=>({L,u:usageOf(L.uid)}));if(!rows.length)return "";
  const tot7=rows.reduce((s,r)=>s+r.u.t7,0),act7=rows.filter(r=>r.u.t7>0).length,quiet=rows.filter(r=>!r.u.t7);
  const top=rows.filter(r=>r.u.t7>0).sort((a,b)=>b.u.t7-a.u.t7);
  return `<section class="card panel"><div class="ph"><h2>Time on the portal</h2><span class="small muted">Last 7 days</span></div>
    <div class="stats"><div class="stat f" style="background:var(--leafSoft)"><b class="num">${esc(fmtMins(tot7))}</b><span>Total, all learners</span></div><div class="stat f" style="background:var(--skySoft)"><b class="num">${act7}/${rows.length}</b><span>Learners who used it</span></div><div class="stat f" style="background:var(--sunSoft)"><b class="num">${esc(fmtMins(act7?Math.round(tot7/act7):0))}</b><span>Average per active learner</span></div></div>
    ${top.length?`<div class="tablewrap"><table><thead><tr><th>Learner</th><th>Last 7 days</th><th>This month</th><th>All time</th><th>Last on</th></tr></thead><tbody>${top.map(({L,u})=>`<tr><td><button class="nm" data-act="learnerInfo" data-id="${esc(L.id)}">${esc(L.name)}</button><div class="small muted">${esc(trainerName(L.trainerId))}</div></td><td class="num"><b>${esc(fmtMins(u.t7))}</b></td><td class="num">${esc(fmtMins(u.tm))}</td><td class="num">${esc(fmtMins(u.tot))}</td><td>${esc(lastSeenTxt(u.last))}</td></tr>`).join("")}</tbody></table></div>`:`<p class="muted">No learner has used the portal in the last 7 days.</p>`}
    ${quiet.length?`<p class="small muted" style="margin:0"><b>Not on the portal this week (${quiet.length}):</b> ${esc(quiet.slice(0,25).map(r=>r.L.name).join(", "))}${quiet.length>25?"…":""}</p>`:""}</section>`;}
