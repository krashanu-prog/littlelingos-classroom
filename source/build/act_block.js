/* ================= Activity record: every game, quiz, lesson and chess game goes into the portfolio =================
   Kept in the learner's own progress record (progress/<uid>.acts), which parents and trainers already receive.
   Endless quizzes keep one line per quiz per day that updates as the child answers. The newest 150 are kept. */
const ACT_KEEP=150;
const ACT_KIND={lesson:["🌸","Lesson"],daily:["🎯","Daily challenge"],quiz:["❓","Word quiz"],listen:["👂","Listen and pick"],memory:["🃏","Memory pairs"],revise:["🔁","Practise again"],
  gk:["🌍","GK quiz"],en:["🔤","Word power"],chess:["♟️","Chess"],sound:["🎧","Sound pairs"],wod:["🌼","Word of the Day"],teach:["🦜","Teach Pip"],draw:["🎨","Art studio"],drill:["🎤","Repeat after me"]};
const actsOf=uid=>Object.entries((progOf(uid)||{}).acts||{}).filter(([,v])=>v&&v.at).map(([id,v])=>({id,...v})).sort((a,b)=>(b.at||0)-(a.at||0));
function actCanLog(){const r=realRole();return !!(S.db&&S.uid&&(r==="student"||(r==="admin"&&S.viewAs==="student")));}
/* add or update one line; id lets endless quizzes update the same line */
function actLog(k,t,s,n,id){try{if(!actCanLog())return;id=id||("a"+Date.now().toString(36)+Math.random().toString(36).slice(2,5));
  const v={k,t:String(t||"").slice(0,80),at:Date.now()};if(s!=null)v.s=+s;if(n!=null)v.n=+n;
  const upd={[id]:v};const old=actsOf(S.uid).filter(x=>x.id!==id);if(old.length>=ACT_KEEP)for(const x of old.slice(ACT_KEEP-1))upd[x.id]=null;
  const p=D.progress[S.uid]=D.progress[S.uid]||{};p.acts={...(p.acts||{}),...upd};for(const [i,x] of Object.entries(p.acts))if(x==null)delete p.acts[i];
  upsert("progress/"+S.uid,{acts:upd}).catch(()=>{});}catch(e){}}
/* endless quizzes: one line per quiz per day, saved a moment after each answer */
const qzLogT={},QZDAY={};
function qzLog(kind,ok){try{if(!actCanLog())return;const day=ymd(new Date()).replace(/-/g,""),id=`q${kind}${day}`;
  let a=QZDAY[kind];if(!a||a.id!==id){const prev=(((progOf(S.uid)||{}).acts||{})[id])||{};a=QZDAY[kind]={id,s:+prev.s||0,n:+prev.n||0};}
  a.n++;if(ok)a.s++;const st=QS[kind]||{};
  clearTimeout(qzLogT[kind]);qzLogT[kind]=setTimeout(()=>actLog(kind,(ACT_KIND[kind]||["",""])[1]+(st.stage?` · ${st.stage}`:""),a.s,a.n,id),900);}catch(e){}}
function actResult(x){if(x.k==="chess")return x.s===1?"Won 🎉":x.s===0.5?"Draw":"Played a game";if(x.k==="lesson")return "Finished 🌸";if(x.k==="draw")return "Saved a picture";if(x.k==="wod")return "Golden flower 🌼";
  if(x.k==="memory")return `All pairs · ${"⭐".repeat(Math.max(0,Math.min(3,x.s||0)))}`;if(x.n)return `${x.s||0} of ${x.n} right`;return "Done";}
function actRows(xs){let last="";return xs.map(x=>{const d=new Date(x.at),day=ymd(d)===ymd(new Date())?"Today":fmtDay(d);const head=day!==last?`<p class="actday">${esc(day)}</p>`:"";last=day;const k=ACT_KIND[x.k]||["✨","Activity"];
  return head+`<div class="actrow"><span class="acte" aria-hidden="true">${k[0]}</span><div class="grow"><b>${esc(x.t||k[1])}</b><span>${esc(fmtTime(d))}</span></div><span class="pill ${x.n&&x.s/x.n>=.8||x.s===1&&x.k==="chess"?"p-good":"p-mute"}">${esc(actResult(x))}</span></div>`;}).join("");}
function actWeek(xs){const since=Date.now()-7*864e5,w=xs.filter(x=>x.at>=since);if(!w.length)return "";const c={};for(const x of w){const g=x.k==="lesson"?"lessons":["gk","en","quiz","daily","listen","revise"].includes(x.k)?"quizzes":x.k==="chess"?"chess":"other";c[g]=(c[g]||0)+1;}
  return `<p class="small muted actsum">This week: <b>${w.length} activit${w.length===1?"y":"ies"}</b>${c.lessons?` · ${c.lessons} lesson${c.lessons===1?"":"s"}`:""}${c.quizzes?` · ${c.quizzes} ${c.quizzes===1?"game or quiz":"games and quizzes"}`:""}${c.chess?` · ${c.chess} chess`:""}</p>`;}
/* the card: own = the learner's Me page; otherwise parents and staff */
function actCardHTML(L,own){if(!L||!L.uid)return "";const xs=actsOf(L.uid);const key="act-"+L.uid,all=S.actAll===key;const show=all?xs:xs.slice(0,12);
  return `<section class="card panel actcard"><div class="ph"><h2>${own?"My activities":esc(firstOf(L.name))+"'s activities"}</h2>${xs.length?`<span class="pill p-sun num">${xs.length}</span>`:""}</div>
    ${xs.length?actWeek(xs)+`<div class="actlist">${actRows(show)}</div>${xs.length>12?`<button type="button" class="btn btn-ghost btn-sm" data-act="actMore" data-id="${esc(key)}">${all?"Show less":`Show all ${xs.length}`}</button>`:""}`
      :`<p class="muted">${own?"Play a game, finish a lesson, try a quiz or a chess game. Everything you do shows up here!":`Games, quizzes, lessons and chess games ${esc(firstOf(L.name))} plays show up here.`}</p>`}</section>`;}
A.actMore=k=>{S.actAll=S.actAll===k?null:k;render();};
/* admin "View as learner": say clearly where the work goes */
function previewNoteHTML(){if(!(realRole()==="admin"&&S.viewAs==="student"))return "";
  return `<section class="alert a-sun prevnote"><span>👀 <b>Learner preview.</b> You're playing as a sample learner, so your activities save to this preview only, not to a child's portfolio. To see a child's work, open <b>Learners</b> and tap the child.</span></section>`;}
/* chess: one line when a game ends (win, loss or draw) */
const CH_LOGGED=new WeakSet();
{const f=chessHTML;chessHTML=function(){const h=f.apply(this,arguments);try{const g=CH.g;if(g&&g.game_over()&&!CH_LOGGED.has(g)&&g.history().length>2){CH_LOGGED.add(g);const two=CH.mode==="two";
  actLog("chess",two?"Chess with a friend":`Chess with Pip · ${CH.mode==="hard"?"hard":CH.mode==="medium"?"medium":"easy"}`,two?null:g.in_checkmate()?(g.turn()!==CH.me?1:0):0.5);}}catch(e){}return h;};}
/* learner preview note above every learner page */
for(const v of Object.keys(VIEWS)){const f=VIEWS[v];VIEWS[v]=function(){return previewNoteHTML()+f.apply(this,arguments);};}
