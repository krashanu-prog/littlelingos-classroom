/* ================= Phase 4: Garden wall (weekly showcase, teacher-approved) ================= */
const WALL_E=["❤️","👏","🌟","😊","🌸"];
let wallSub=false;
function wallLoad(){if(wallSub||!S.db)return;wallSub=true;D.wall=D.wall||{};try{S.db.collection("wall").onSnapshot(s=>{const o={};for(const d of s.docs)o[d.id]=d.data();D.wall=o;schedule();},()=>{});}catch(e){}}
const wallId=(uid,iid)=>String(uid+"_"+iid).replace(/[^A-Za-z0-9_-]/g,"").slice(0,80);
function wallPosts(){wallLoad();return entries(D.wall).filter(x=>x.status==="approved").sort((a,b)=>(b.at||0)-(a.at||0));}
const wallRc=x=>{if(x.rc)return x.rc;const o={};for(const e of Object.values(x.reacts||{}))o[e]=(o[e]||0)+1;return o;};
const wallMine=x=>x.mine!==undefined?x.mine:(x.reacts||{})[S.uid];
function wkStart(t){const d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d;}
function wallShares(L){const cs=parentsOf(L).map(u=>((D.profiles[u]||{}).consent||{}).wall);return cs.includes(true)&&!cs.includes(false);}
function wallCard(x){const staff=isStaff(),rc=wallRc(x),mine=wallMine(x);
  const src=x.data||((D.kp[x.uid]||{})[x.item]||{}).data;if(!src&&staff&&x.uid&&!D.kp[x.uid])loadKp(x.uid);
  const media=!src?`<div class="ptaudio small muted">This item was removed from the portfolio.</div>`:x.kind==="audio"?`<div class="ptaudio">🎤<audio controls preload="none" src="${esc(src)}"></audio></div>`:`<img src="${esc(src)}" alt="${esc(x.title||"Picture")} by ${esc(x.name||"a learner")}" loading="lazy">`;
  return `<figure class="wpost ${x.hidden?"hid":""}">${media}<figcaption><div class="row" style="gap:6px;flex-wrap:nowrap"><b class="grow">${esc(x.title||(x.kind==="audio"?"A recording":"A picture"))}</b>${x.hidden?`<span class="pill p-mute">Hidden</span>`:""}</div>
    <span class="small muted">${esc(x.name||"")}${x.stage?` · ${esc(x.stage)}`:""} · ${esc(fmtDay(new Date(x.at)))}</span>
    <div class="wreact" role="group" aria-label="Cheer for this">${WALL_E.map(e=>`<button type="button" class="wr ${mine===e?"on":""}" data-act="wallReact" data-id="${esc(x.id)}|${e}" aria-pressed="${mine===e}" aria-label="${e}${rc[e]?`, ${rc[e]}`:""}">${e}${rc[e]?`<i>${rc[e]}</i>`:""}</button>`).join("")}</div>
    ${staff?`<div class="row" style="gap:6px">${x.hidden?`<button class="btn btn-ghost btn-sm" data-act="wallHide" data-id="${esc(x.id)}|0">Show again</button>`:`<button class="btn btn-ghost btn-sm" data-act="wallHide" data-id="${esc(x.id)}|1">${ic("x")}Hide</button>`}<span class="small muted">${pipTry(()=>wallShares(learner(x.lid)))?"Class can see":"Only their family sees this"}</span></div>`:""}</figcaption></figure>`;}
function wallView(){
  const r=role(), staff=isStaff(), kid=r==="student";let ps=wallPosts();if(!staff)ps=ps.filter(x=>!x.hidden&&x.data);
  const groups=[];for(const x of ps){const w=wkStart(x.at).getTime();let g=groups.find(y=>y.w===w);if(!g)groups.push(g={w,xs:[]});g.xs.push(x);}
  const thisW=wkStart(Date.now()).getTime(), label=w=>w===thisW?"This week":w===thisW-7*864e5?"Last week":`Week of ${fmtDay(new Date(w))}`;
  const lede=kid?"The best work from your class this week, chosen by your teachers.":r==="parent"?"Work from your child's class, chosen by the teachers. You see your own child's posts, and posts from families who chose to share.":"Post learners' best work for families. Families in the same course see it only when that child's parents agree; otherwise only the child's own family sees it.";
  let banner="";
  if(r==="parent"){const c=((D.profiles[S.uid]||{}).consent||{}).wall;const ks=kidsList();
    if(c===undefined&&ks.length)banner=`<section class="alert a-sky"><b>Share ${esc(ks.map(k=>firstOf(k.name)).join(" and "))}'s work with the class?</b><span class="small">You choose in Settings › Garden wall. It's off until you turn it on.</span><span class="spacer"></span><button class="btn btn-ghost btn-sm" data-go="settings">Choose</button></section>`;}
  const head=`<div class="head"><div><h1>Garden wall</h1><p class="lede">${lede}</p></div>${staff?`<button class="btn btn-primary" data-act="wallGoPost">${ic("plus")}Post work</button>`:""}</div>`;
  if(!groups.length)return head+banner+emptyBox(kid?"Nothing on the wall yet":"No posts yet",kid?"When your teacher shares drawings and recordings, they bloom here!":staff?"Open Review › Garden wall to post drawings, photos and recordings from learners' portfolios.":"When teachers share work from your child's class, it appears here each week.","","bloom");
  return head+banner+groups.map(g=>`<section class="panel"><h2>${esc(label(g.w))} <span class="pill p-mute num">${g.xs.length}</span></h2><div class="wgrid">${g.xs.map(wallCard).join("")}</div></section>`).join("");}
A.wallReact=v=>{const [id,e]=v.split("|");const x=(D.wall||{})[id];if(!x||!window.LL_sb)return;const cur=wallMine(x),next=cur===e?null:e;
  if(x.rc||x.mine!==undefined){const rc={...(x.rc||{})};if(cur)rc[cur]=Math.max(0,(rc[cur]||1)-1);if(next)rc[next]=(rc[next]||0)+1;x.rc=rc;x.mine=next;}
  else{x.reacts={...(x.reacts||{})};if(next)x.reacts[S.uid]=next;else delete x.reacts[S.uid];}
  render(true);window.LL_sb.rpc("ll_wall_react",{p:"wall/"+id,e:next}).then(r=>{if(r&&r.error)toast("Couldn't save that. Try again.",true);},()=>toast("Couldn't save that. Try again.",true));};
A.wallHide=v=>{const [id,f]=v.split("|");save(()=>S.db.doc("wall/"+id).update({hidden:f==="1",hiddenBy:S.uid,hiddenAt:Date.now()}),f==="1"?"Hidden from families":"Showing again");};
/* kid: ask to share a portfolio item */
function wallShareBtn(x){if(realRole()!=="student"||x.kind==="rate"||x.kind==="join")return "";wallLoad();const p=(D.wall||{})[wallId(S.uid,x.id)];
  if(p&&p.status==="approved")return `<span class="pill p-good">On the Garden wall 🌟</span>`;
  if(x.wall==="asked")return `<span class="pill p-sun">Waiting for your teacher</span>`;
  return `<button class="btn btn-ghost btn-sm" data-act="wallAsk" data-id="${esc(x.id)}">${ic("wall")}Share on the wall</button>`;}
A.wallAsk=id=>{if(realRole()!=="student")return;save(async()=>{await S.db.doc(`kp/${S.uid}/x/${id}`).update({wall:"asked",wallAt:Date.now()});await loadKp(S.uid,true);},"Your teacher will take a look!");};
/* teachers: approve / post / decline */
function wallReviewHTML(items){wallLoad();const W=D.wall||{};const done=i=>W[wallId(i.L.uid,i.x.id)];
  const asked=items.filter(i=>i.x.wall==="asked"&&!done(i)).sort((a,b)=>(a.x.wallAt||0)-(b.x.wallAt||0));
  const recent=items.filter(i=>i.x.wall!=="asked"&&!done(i)&&Date.now()-(i.x.at||0)<30*864e5).sort((a,b)=>b.x.at-a.x.at).slice(0,24);
  const tile=(i,ask)=>`<figure class="ptile">${i.x.kind==="audio"?`<div class="ptaudio">🎤<audio controls preload="none" src="${esc(i.x.data)}"></audio></div>`:`<img src="${esc(i.x.data)}" alt="${esc(i.x.title||"")}">`}<figcaption><b>${esc(i.L.name)} · ${esc(i.x.title||(i.x.kind==="audio"?"Recording":"Picture"))}</b><span>${esc(fmtDay(new Date(i.x.at)))} · ${wallShares(i.L)?"Class can see":"Only their family will see"}</span>
    <div class="row" style="gap:6px"><button class="btn btn-primary btn-sm" data-act="wallPost" data-id="${esc(i.L.id+"|"+i.x.id)}">${ic("check")}Post</button>${ask?`<button class="btn btn-ghost btn-sm" data-act="wallNo" data-id="${esc(i.L.id+"|"+i.x.id)}">Not this time</button>`:""}</div></figcaption></figure>`;
  const live=wallPosts().filter(x=>Date.now()-x.at<7*864e5);
  return `<p class="small muted">Learners can ask to share work from their portfolio. Posting puts it on the Garden wall for this week. Families in the same course see it only when the child's parents agree.</p>
  <section class="panel"><h2>Asked to share <span class="pill p-sun num">${asked.length}</span></h2>${asked.length?`<div class="port">${asked.map(i=>tile(i,true)).join("")}</div>`:`<p class="muted">No requests right now.</p>`}</section>
  <section class="panel"><h2>Recent work you could post</h2>${recent.length?`<div class="port">${recent.map(i=>tile(i,false)).join("")}</div>`:`<p class="muted">Nothing new in the last 30 days.</p>`}</section>
  <div class="row"><button class="btn btn-ghost" data-go="wall">${ic("wall")}Open the Garden wall (${live.length} this week)</button></div>`;}
A.wallPost=v=>{const [lid,iid]=v.split("|");const L=learner(lid);if(!L||!L.uid)return;const x=kpItems(L.uid).find(y=>y.id===iid);if(!x)return;
  save(()=>S.db.doc("wall/"+wallId(L.uid,iid)).set({lid,uid:L.uid,item:iid,name:firstOf(L.name),stage:L.stage||"",courses:learnerCourses(L),kind:x.kind,title:x.title||"",made:x.at||null,at:Date.now(),by:S.uid,status:"approved",reacts:{}}),"Posted on the Garden wall 🌸");};
A.wallNo=v=>{const [lid,iid]=v.split("|");const L=learner(lid);if(!L||!L.uid)return;
  save(()=>S.db.doc("wall/"+wallId(L.uid,iid)).set({lid,uid:L.uid,item:iid,status:"declined",at:Date.now(),by:S.uid}),"Kept in the portfolio");};
function wallAskedCount(){let n=0;const W=D.wall||{};const ls=role()==="admin"?activeLearners():teacherLearners(myTid());for(const L of ls){if(!L.uid)continue;for(const x of kpItems(L.uid))if(x.wall==="asked"&&!W[wallId(L.uid,x.id)])n++;}return n;}
A.wallGoPost=()=>{S.rvT="wall";go("review");};
