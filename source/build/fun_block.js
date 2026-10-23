/* ================= Fun corner (learners) and My space (trainers): drawing, chess, GK quiz, journal ================= */
const CHESS_SRC="https://cdn.jsdelivr.net/npm/chess.js@0.10.3/chess.js", CHESS_SRI="sha384-2D/YG6ZVRMpAIE2PL+zjrxBjvzCSytPKkNUB1Ut84ncxjOuTSrkoO66SGAKjsec3";
let chessLoading=null;
function needChess(){
  if(window.Chess)return Promise.resolve(true);
  if(!chessLoading)chessLoading=new Promise(res=>{const s=document.createElement("script");s.src=CHESS_SRC;s.integrity=CHESS_SRI;s.crossOrigin="anonymous";s.onload=()=>res(!!window.Chess);s.onerror=()=>{chessLoading=null;res(false)};document.head.appendChild(s);});
  return chessLoading;
}
const CH={g:null,sel:null,mode:"easy",me:"w",last:null,busy:false,err:false};
const PIECE_SVG={
  p:'<path d="M22.5 9a5 5 0 0 0-3.2 8.8C16.6 19.4 15 22 15 25c0 1.6.5 3 1.3 4.2C13.3 31 11 34 11 38h23c0-4-2.3-7-5.3-8.8.8-1.2 1.3-2.6 1.3-4.2 0-3-1.6-5.6-4.3-7.2A5 5 0 0 0 22.5 9z"/>',
  r:'<path d="M9 39h27v-4H9zM14 34l1-14h15l1 14zM11 9h5v3h4V9h5v3h4V9h5v8l-3 3H14l-3-3z"/><path class="ln" d="M15 20h15"/>',
  b:'<circle cx="22.5" cy="8" r="2.6"/><path d="M22.5 11c-5.5 4-8.5 9-8.5 13 0 4 3.3 6 8.5 6s8.5-2 8.5-6c0-4-3-9-8.5-13zM16 30h13l2 5H14zM10 39h25v-4H10z"/><path class="ln" d="M22.5 16v8M18.5 20h8"/>',
  n:'<path d="M12 39h23c0-9-2-15-5-19 1.5-3 .5-7.5-2.5-10.5L26 6l-2 3.5c-5.5 1.2-9.5 5-12.3 10.6-1 2.2.3 4.2 2.5 4 2-.2 4.2-2.3 6.3-2.4-1.5 4.5-6.8 8.3-8.5 17.3z"/><circle class="ln" cx="20.5" cy="14.5" r="1.3"/>',
  q:'<path d="M10 39h25l-2-6H12zM12 33l-2.5-17 6.5 9 2-13 4.5 12 4.5-12 2 13 6.5-9L33 33z"/><circle cx="9.5" cy="14" r="2.3"/><circle cx="16" cy="10.5" r="2.3"/><circle cx="22.5" cy="9" r="2.3"/><circle cx="29" cy="10.5" r="2.3"/><circle cx="35.5" cy="14" r="2.3"/>',
  k:'<path d="M10 39h25l-2-6H12zM13 33c-2.5-6-1.5-12.5 4-14.5 3-1 4.5 1 5.5 3.5 1-2.5 2.5-4.5 5.5-3.5 5.5 2 6.5 8.5 4 14.5z"/><path class="ln cross" d="M22.5 4v12M18 8.5h9"/>'
};
const pieceSvg=(t,c)=>`<svg class="pc ${c}" viewBox="0 0 45 45" aria-hidden="true">${PIECE_SVG[t]}</svg>`;
const PNAME={k:"king",q:"queen",r:"rook",b:"bishop",n:"knight",p:"pawn"};
const PVAL={p:100,n:320,b:330,r:500,q:900,k:0};
function chEval(g){ // from white's view
  if(g.in_checkmate())return g.turn()==="w"?-99999:99999;
  if(g.in_draw()||g.in_stalemate())return 0;
  let s=0;const b=g.board();
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(!p)continue;let v=PVAL[p.type];
    if(p.type==="p"||p.type==="n"){const cd=Math.abs(3.5-c)+Math.abs(3.5-r);v+=Math.round((7-cd)*4);}
    if(p.type==="p")v+=(p.color==="w"?(6-r):(r-1))*6;
    s+=p.color==="w"?v:-v;}
  return s;
}
function chSearch(g,d,a,b){
  if(d===0||g.game_over())return chEval(g);
  const ms=g.moves();
  if(g.turn()==="w"){let best=-1e9;for(const m of ms){g.move(m);best=Math.max(best,chSearch(g,d-1,a,b));g.undo();a=Math.max(a,best);if(a>=b)break;}return best;}
  let best=1e9;for(const m of ms){g.move(m);best=Math.min(best,chSearch(g,d-1,a,b));g.undo();b=Math.min(b,best);if(a>=b)break;}return best;
}
function chAiMove(){
  const g=CH.g;if(!g||g.game_over())return;
  const ms=g.moves({verbose:true});if(!ms.length)return;
  let pick;
  if(CH.mode==="easy"&&Math.random()<.35)pick=ms[Math.floor(Math.random()*ms.length)];
  else{const depth=CH.mode==="easy"?1:2, side=g.turn()==="w"?1:-1;let best=-1e9;
    for(const m of ms.sort(()=>Math.random()-.5)){g.move(m);const v=side*chSearch(g,depth-1,-1e9,1e9)+(CH.mode==="easy"?Math.random()*80:Math.random()*8);g.undo();if(v>best){best=v;pick=m;}}}
  const mv=g.move({from:pick.from,to:pick.to,promotion:"q"});CH.last=mv?[mv.from,mv.to]:null;
}
function chNewGame(mode,me){CH.g=new window.Chess();CH.sel=null;CH.last=null;CH.mode=mode||CH.mode;CH.me=me||"w";CH.busy=false;
  if(CH.mode!=="two"&&CH.me==="b"){CH.busy=true;setTimeout(()=>{chAiMove();CH.busy=false;render();},400);}}
function chStatus(){
  const g=CH.g, two=CH.mode==="two", kid=role()==="student";
  const name=c=>c==="w"?"White":"Black";
  if(g.in_checkmate()){const loser=g.turn();if(two)return `Checkmate! ${name(loser==="w"?"b":"w")} wins.`;return loser===CH.me?(kid?"Checkmate! Pip wins this time. Good try, let's play again!":"Checkmate. The computer wins this one."):(kid?"Checkmate! You won! Yay!":"Checkmate! You win.");}
  if(g.in_stalemate())return "Stalemate. It's a draw!";
  if(g.in_draw())return "It's a draw!";
  if(CH.busy)return kid?"Pip is thinking…":"Thinking…";
  const t=g.turn(), mine=two||t===CH.me;
  return (g.in_check()?"Check! ":"")+(two?`${name(t)} to move.`:mine?"Your turn.":"Waiting…");
}
function chessHTML(){
  if(!window.Chess)return `<section class="card panel"><h2>Chess</h2><p class="muted">${CH.err?"Couldn't load the chess board. Check your internet connection and try again.":"Setting up the board…"}</p>${CH.err?`<button class="btn btn-ghost btn-sm" data-act="chOpen">Try again</button>`:""}</section>`;
  if(!CH.g)chNewGame();
  const g=CH.g, b=g.board(), flip=CH.mode!=="two"&&CH.me==="b";
  const targets=new Set(CH.sel?g.moves({square:CH.sel,verbose:true}).map(m=>m.to):[]);
  let kingSq="";if(g.in_check()){for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(p&&p.type==="k"&&p.color===g.turn())kingSq="abcdefgh"[c]+(8-r);}}
  let sq="";
  for(let i=0;i<8;i++)for(let j=0;j<8;j++){const r=flip?7-i:i,c=flip?7-j:j,name="abcdefgh"[c]+(8-r),p=b[r][c],dark=(r+c)%2===1;
    const cls=["chsq",dark?"dk":"lt",CH.sel===name?"sel":"",targets.has(name)?(p?"cap":"tgt"):"",CH.last&&CH.last.includes(name)?"lastmv":"",kingSq===name?"chk":""].filter(Boolean).join(" ");
    sq+=`<button type="button" class="${cls}" data-act="chTap" data-id="${name}" aria-label="${name}${p?` ${p.color==="w"?"white":"black"} ${PNAME[p.type]}`:""}">${p?pieceSvg(p.type,p.color):""}${j===0?`<i class="rk">${8-r}</i>`:""}${i===7?`<i class="fl">${"abcdefgh"[c]}</i>`:""}</button>`;}
  const over=g.game_over();
  return `<section class="card panel chesswrap"><div class="ph"><h2>Chess</h2><div class="row">
    <select data-change="chMode" aria-label="Opponent">${[["easy","Computer: easy"],["medium","Computer: medium"],["two","Two players"]].map(([v,t])=>`<option value="${v}" ${CH.mode===v?"selected":""}>${t}</option>`).join("")}</select>
    ${CH.mode!=="two"?`<select data-change="chSide" aria-label="Your colour"><option value="w" ${CH.me==="w"?"selected":""}>I play white</option><option value="b" ${CH.me==="b"?"selected":""}>I play black</option></select>`:""}
    <button class="btn btn-ghost btn-sm" data-act="chUndo" ${g.history().length?"":"disabled"}>Undo</button><button class="btn btn-ghost btn-sm" data-act="chReset">New game</button></div></div>
    <p class="chstat ${over?"over":""}" aria-live="polite">${esc(chStatus())}</p>
    <div class="board" role="grid" aria-label="Chess board">${sq}</div>
    <p class="small muted">Tap a piece, then tap where it should go. Pawns that reach the end become queens.</p></section>`;
}
A.chOpen=()=>{CH.err=false;needChess().then(ok=>{CH.err=!ok;render();});render();};
A.chTap=sq=>{
  const g=CH.g;if(!g||CH.busy||g.game_over())return;
  const turnOk=CH.mode==="two"||g.turn()===CH.me;if(!turnOk)return;
  const p=g.get(sq);
  if(CH.sel){const mv=g.moves({square:CH.sel,verbose:true}).find(m=>m.to===sq);
    if(mv){const done=g.move({from:CH.sel,to:sq,promotion:"q"});CH.last=[done.from,done.to];CH.sel=null;render();
      if(CH.mode!=="two"&&!g.game_over()){CH.busy=true;render();setTimeout(()=>{chAiMove();CH.busy=false;render();},350);}return;}}
  CH.sel=p&&p.color===g.turn()&&CH.sel!==sq?sq:null;render();
};
A.chUndo=()=>{const g=CH.g;if(!g||CH.busy)return;g.undo();if(CH.mode!=="two"&&g.turn()!==CH.me)g.undo();CH.sel=null;CH.last=null;render();};
A.chReset=()=>{chNewGame(CH.mode,CH.me);render();};
A.chMode=(_,v)=>{chNewGame(v,CH.me);render();};
A.chSide=(_,v)=>{chNewGame(CH.mode,v);render();};

/* ---- GK quiz ---- */
const GKQ={qs:null,i:0,score:0,picked:null,stage:""};
function gkStart(stage){const all=(window.LL_GK||{})[stage]||[];const qs=all.slice().sort(()=>Math.random()-.5).slice(0,5).map(x=>({q:x.q,a:x.a,opts:[x.a,...x.o].sort(()=>Math.random()-.5)}));Object.assign(GKQ,{qs,i:0,score:0,picked:null,stage});}
function gkHTML(){
  const L=myLearner(), stage=GKQ.stage||(L&&L.stage)||"Sprouts";
  if(!GKQ.qs){gkStart(stage);}
  const qs=GKQ.qs;
  if(!qs.length)return `<section class="card panel"><h2>GK quiz</h2><p class="muted">No questions yet.</p></section>`;
  const head=`<div class="ph"><h2>GK quiz</h2><div class="row"><select data-change="gkStage" aria-label="Level">${STAGES.map(s=>`<option value="${s.v}" ${s.v===GKQ.stage?"selected":""}>${s.v} · ${s.ages}</option>`).join("")}</select><button class="btn btn-ghost btn-sm" data-act="gkAgain">New quiz</button></div></div>`;
  if(GKQ.i>=qs.length){const n=GKQ.score,t=qs.length;
    return `<section class="card panel">${head}<div class="gkdone">${art(n>=t-1?"bloom":"pip",110,n>=t-1?"Bloom":"Pip")}<h3>${n===t?"Wow, all correct! You've bloomed!":n>=t/2?`Yay! ${n} out of ${t}. Great thinking!`:`${n} out of ${t}. Good try! Every quiz helps your brain grow.`}</h3><button class="btn btn-primary" data-act="gkAgain">Play again</button></div></section>`;}
  const x=qs[GKQ.i], done=GKQ.picked!=null;
  return `<section class="card panel">${head}<p class="small muted">Question ${GKQ.i+1} of ${qs.length} · Score ${GKQ.score}</p><h3 class="gkq">${esc(x.q)}</h3>
    <div class="gkopts">${x.opts.map((o,k)=>`<button class="gkopt ${done?(o===x.a?"right":(GKQ.picked===k?"nope":"")):""}" data-act="gkPick" data-id="${k}" ${done?"disabled":""}>${esc(o)}</button>`).join("")}</div>
    ${done?`<p class="gkfb" aria-live="polite">${x.opts[GKQ.picked]===x.a?"Yay! That's right.":`Good try! The answer is <b>${esc(x.a)}</b>.`}</p><button class="btn btn-primary" data-act="gkNext">${GKQ.i+1<qs.length?"Next question":"See my score"}</button>`:""}</section>`;
}
A.gkPick=k=>{if(GKQ.picked!=null)return;GKQ.picked=+k;const x=GKQ.qs[GKQ.i];if(x.opts[+k]===x.a)GKQ.score++;render();};
A.gkNext=()=>{GKQ.i++;GKQ.picked=null;render();};
A.gkAgain=()=>{gkStart(GKQ.stage||((myLearner()||{}).stage)||"Sprouts");render();};
A.gkStage=(_,v)=>{gkStart(v);render();};

/* ---- Learner: Fun corner ---- */
A.funTab=t=>{S.fun=t||"";if(t==="chess")A.chOpen();render();};
function funView(){
  const L=myLearner(); if(!L)return pendingHTML();
  const t=S.fun||"";
  const tiles=`<div class="funtiles">
    <button class="funtile ft-draw" data-act="drawPad"><b>Drawing</b><span>Draw a picture. It goes in your portfolio for your teacher to see.</span></button>
    <button class="funtile ft-chess ${t==="chess"?"on":""}" data-act="funTab" data-id="chess"><b>Chess</b><span>Play against Pip's computer or with a friend.</span></button>
    <button class="funtile ft-gk ${t==="gk"?"on":""}" data-act="funTab" data-id="gk"><b>GK quiz</b><span>Five quick questions. How many can you get?</span></button></div>`;
  return `<div class="head"><div><h1>Fun corner</h1><p class="lede">Take a little break: draw, play chess or try a quiz.</p></div></div>${tiles}${t==="chess"?chessHTML():t==="gk"?gkHTML():""}`;
}

/* ---- Trainer: My space (journal + chess) ---- */
let tjSub=false;
function tjLoad(){if(tjSub||!S.db||!S.uid)return;tjSub=true;try{S.db.collection(`tj/${S.uid}/x`).onSnapshot(s=>{const o={};for(const d of s.docs)o[d.id]=d.data();D.tj=o;render();},()=>{D.tj=D.tj||{};render();});}catch{D.tj={};}}
const MOODS=[["great","Great"],["good","Good"],["okay","Okay"],["tough","Tough"]];
const TJ_PROMPTS=["What went well in class today?","Which learner surprised me, and how?","What was tricky, and what will I try next time?","One thing I want to remember:","Ideas for next week's lessons:"];
function tjForm(x={}){return `<div class="two"><div class="field"><label for="tj-d">Date</label><input type="date" id="tj-d" name="d" value="${esc(x.date||ymd(new Date()))}"></div>
  <div class="field"><label for="tj-m">How was the day?</label><select id="tj-m" name="m">${MOODS.map(([v,t])=>opt(v,t,(x.mood||"good")===v)).join("")}</select></div></div>
  <div class="field"><label for="tj-t">Title (optional)</label><input type="text" id="tj-t" name="t" maxlength="100" value="${esc(x.title||"")}" placeholder="e.g. Great phonics class with the Sprouts batch"></div>
  <div class="field"><span class="lbl">Need a start? Tap a prompt</span><div class="row" style="flex-wrap:wrap">${TJ_PROMPTS.map((p,i)=>`<button type="button" class="btn btn-ghost btn-sm" data-mact="prompt" data-id="${i}">${esc(p)}</button>`).join("")}</div></div>
  <div class="field"><label for="tj-x">Journal</label><textarea id="tj-x" name="x" rows="9" maxlength="8000" placeholder="Write freely. This is just for you.">${esc(x.text||"")}</textarea></div>`;}
const tjActs={prompt:(i,b,form)=>{const ta=form.querySelector("#tj-x");ta.value=(ta.value.trim()?ta.value.trim()+"\n\n":"")+TJ_PROMPTS[+i]+"\n";ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);}};
async function tjSave(f,id){const text=f.x.value.trim();if(!text)throw userErr("Write something first.");const data={date:f.d.value||ymd(new Date()),mood:f.m.value,title:f.t.value.trim(),text,updatedAt:Date.now()};
  if(id)await S.db.doc(`tj/${S.uid}/x/${id}`).update(data);else await S.db.collection(`tj/${S.uid}/x`).doc().set({...data,at:Date.now()});}
A.tjNew=()=>openModal("New journal entry",tjForm(),{wide:true,submitLabel:"Save entry",done:"Saved to your journal",actions:tjActs,onSubmit:f=>tjSave(f,null)});
A.tjEdit=id=>{const x=(D.tj||{})[id];if(x)openModal("Edit journal entry",tjForm(x),{wide:true,submitLabel:"Save",done:"Saved",actions:tjActs,onSubmit:f=>tjSave(f,id)});};
A.tjDel=id=>openModal("Delete this entry?","<p>It will be removed from your journal.</p>",{danger:true,submitLabel:"Delete",done:"Deleted",onSubmit:async()=>{await S.db.doc(`tj/${S.uid}/x/${id}`).delete();}});
A.mySpaceTab=t=>{S.mys=t||"journal";if(S.mys==="chess")A.chOpen();render();};
function mySpaceView(){
  tjLoad();
  const t=S.mys||"journal";
  const tabs=`<div class="row" role="tablist"><button class="btn ${t==="journal"?"btn-leaf":"btn-ghost"} btn-sm" role="tab" aria-selected="${t==="journal"}" data-act="mySpaceTab" data-id="journal">My journal</button><button class="btn ${t==="chess"?"btn-leaf":"btn-ghost"} btn-sm" role="tab" aria-selected="${t==="chess"}" data-act="mySpaceTab" data-id="chess">Play chess</button></div>`;
  let body="";
  if(t==="chess")body=chessHTML();
  else{const xs=entries(D.tj||{}).sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))||(b.at||0)-(a.at||0));
    body=`<section class="card panel"><div class="ph"><h2>My journal</h2><button class="btn btn-primary btn-sm" data-act="tjNew">${ic("plus")}New entry</button></div>
    <p class="small muted">Reflect on your classes, note ideas and track how your days feel. Families and learners can't see your journal.</p>
    ${D.tj==null?`<div class="skel"></div>`:xs.length?`<div class="list">${xs.map(x=>`<div class="item tj"><span class="mood m-${esc(x.mood||"good")}">${esc((MOODS.find(m=>m[0]===x.mood)||MOODS[1])[1])}</span><div class="grow"><div class="t">${esc(x.title||fmtDay(new Date(x.date+"T00:00")))}</div><div class="s">${x.title?esc(fmtDay(new Date(x.date+"T00:00")))+" · ":""}${esc(String(x.text||"").slice(0,160))}${String(x.text||"").length>160?"…":""}</div></div><button class="btn btn-ghost btn-sm" data-act="tjEdit" data-id="${esc(x.id)}">${ic("edit")}Open</button><button class="iconbtn" data-act="tjDel" data-id="${esc(x.id)}" aria-label="Delete entry">${ic("trash")}</button></div>`).join("")}</div>`
      :emptyBox("No entries yet","Write a few lines after class. Over time you'll see what works best with your learners.",`<button class="btn btn-primary" data-act="tjNew">Write my first entry</button>`,"pip")}</section>`;}
  return `<div class="head"><div><h1>My space</h1><p class="lede">Your own corner: a private journal and a game of chess between classes.</p></div></div>${tabs}${body}`;
}
