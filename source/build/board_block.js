/* ================= Phase 5: Whiteboard (Excalidraw from jsDelivr, simple board as fallback) ================= */
const EXC_LIBS=[["https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js","sha384-tMH8h3BGESGckSAVGZ82T9n90ztNXxvdwvdM6UoR56cYcf+0iGXBliJ29D+wZ/x8"],
  ["https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js","sha384-bm7MnzvK++ykSwVJ2tynSE5TRdN+xL418osEVF2DE/L/gfWHj91J2Sphe582B1Bh"],
  ["https://cdn.jsdelivr.net/npm/@excalidraw/excalidraw@0.17.6/dist/excalidraw.production.min.js","sha384-2RnaDBiRrWXqT5k4HtP4X4gh/ukRFg9zn1Sjt+JeYQOUWSYYnN1tKE4FL9QA3Wdl"]];
let excLoading=null;
const loadJs=(src,sri)=>new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.integrity=sri;s.crossOrigin="anonymous";const t=setTimeout(()=>rej(new Error("timeout")),30000);s.onload=()=>{clearTimeout(t);res()};s.onerror=()=>{clearTimeout(t);s.remove();rej(new Error(src))};document.head.appendChild(s);});
function needExc(){if(window.ExcalidrawLib&&window.React&&window.ReactDOM)return Promise.resolve(true);
  if(!excLoading){window.EXCALIDRAW_ASSET_PATH="https://cdn.jsdelivr.net/npm/@excalidraw/excalidraw@0.17.6/dist/";
    excLoading=(async()=>{try{for(const [u,h] of EXC_LIBS)if(!(u.includes("react@")&&window.React)&&!(u.includes("react-dom")&&window.ReactDOM))await loadJs(u,h);return !!window.ExcalidrawLib;}catch(e){excLoading=null;return false;}})();}
  return excLoading;}
const BRD={}; /* board cache: id -> doc */
const boardLoading={};
function boardGet(id){if(BRD[id])return Promise.resolve(BRD[id]);if(!boardLoading[id])boardLoading[id]=S.db.doc("boards/"+id).get().then(d=>{const v=d.exists?d.data():null;if(v)BRD[id]=v;delete boardLoading[id];schedule();return v;}).catch(()=>{delete boardLoading[id];return null;});return boardLoading[id];}
function boardThumb(id,meta){const b=BRD[id];if(!b)boardGet(id);
  return `<figure class="bthumb">${b&&b.png?`<button type="button" class="bimg" data-act="boardView" data-id="${esc(id)}" aria-label="Open ${esc((meta||b).title||"whiteboard")}"><img src="${esc(b.png)}" alt="${esc((meta||b).title||"Whiteboard")}" loading="lazy"></button>`:`<div class="bimg skel"></div>`}
    <figcaption><b>${esc((meta||b||{}).title||"Whiteboard")}</b><span class="small muted">${esc(fmtDay(new Date((meta||b||{}).at||Date.now())))}</span>
    ${isStaff()?`<div class="row" style="gap:6px"><button class="btn btn-ghost btn-sm" data-act="boardOpen" data-id="${esc(id)}">${ic("edit")}Open</button><button class="btn btn-ghost btn-sm" data-act="boardHw" data-id="${esc(id)}">${ic("pencil")}Share as homework</button><button class="iconbtn" data-act="boardDel" data-id="${esc(id)}" aria-label="Delete whiteboard">${ic("trash")}</button></div>`:""}</figcaption></figure>`;}
function lessonBoardsHTML(l){const bs=Object.entries(l.boards||{}).filter(([,v])=>v).sort((a,b)=>(b[1].at||0)-(a[1].at||0));const staff=isStaff();
  if(!bs.length&&!staff)return "";
  return `<section class="card panel"><div class="ph"><h2>Class whiteboards</h2>${staff?`<button class="btn btn-ghost btn-sm" data-act="boardNew" data-id="l:${esc(l.id)}">${ic("plus")}New whiteboard</button>`:""}</div>
    ${bs.length?`<div class="bgrid">${bs.map(([id,v])=>boardThumb(id,v)).join("")}</div>`:`<p class="small muted">Draw with your class, then save the board here. Learners can look at it after class.</p>`}</section>`;}
A.boardView=id=>{const b=BRD[id];if(!b)return;openModal(b.title||"Whiteboard",`<img class="bfull" src="${esc(b.png)}" alt="${esc(b.title||"Whiteboard")}">`,{wide:true});};
/* ---- the board overlay ---- */
let B=null;
function boardShell(title){let w=document.getElementById("boardwrap");if(!w){w=document.createElement("div");w.id="boardwrap";w.setAttribute("role","dialog");w.setAttribute("aria-label","Whiteboard");document.body.appendChild(w);
    w.addEventListener("click",e=>{const t=e.target.closest("[data-bw]");if(!t)return;const k=t.dataset.bw;if(k==="close")boardClose();else if(k==="save")boardSave();else if(k==="hw")boardSave(true);else if(PADA[k])PADA[k](t.dataset.v,t);});}
  w.hidden=false;document.body.classList.add("boarding");
  w.innerHTML=`<div class="bwbar"><label class="sr" for="bw-t">Whiteboard name</label><input id="bw-t" type="text" maxlength="80" value="${esc(title||"")}" placeholder="Name this whiteboard"><span class="bwmode small muted" id="bw-mode"></span><span class="spacer"></span>
    <button type="button" class="btn btn-ghost btn-sm" data-bw="hw">${ic("pencil")}Share as homework</button><button type="button" class="btn btn-primary btn-sm" data-bw="save">${ic("check")}Save to lesson</button><button type="button" class="iconbtn" data-bw="close" aria-label="Close whiteboard">${ic("x")}</button></div>
    <div id="bw-area"><p class="bwload">Opening the whiteboard…</p></div>`;return w;}
async function boardOpen(ctx){if(!isStaff())return;
  let doc=null;if(ctx.id){doc=await boardGet(ctx.id);if(!doc){toast("Couldn't open that whiteboard.",true);return}}
  B={id:ctx.id||null,lessonId:ctx.lessonId||(doc&&doc.lessonId)||null,sid:ctx.sid||(doc&&doc.sid)||null,courseId:ctx.courseId||(doc&&doc.courseId)||null,dirty:false};
  boardShell(doc?doc.title:ctx.title||"");const area=document.getElementById("bw-area");
  const ok=ctx.forcePad?false:await needExc();if(!B)return;
  if(ok){B.mode="exc";document.getElementById("bw-mode").textContent="";const EL=window.ExcalidrawLib;area.innerHTML="";const host=document.createElement("div");host.className="bwexc";area.appendChild(host);
    let init={appState:{viewBackgroundColor:"#ffffff",currentItemStrokeColor:"#2E2219"}};
    if(doc&&doc.scene){try{const sc=JSON.parse(doc.scene);init={elements:sc.elements||[],appState:{...(sc.appState||{}),viewBackgroundColor:"#ffffff",collaborators:new Map()},files:sc.files||{}};}catch(e){}}
    const h=React.createElement, M=EL.MainMenu, I=M.DefaultItems;
    B.root=ReactDOM.createRoot(host);
    B.root.render(h(EL.Excalidraw,{excalidrawAPI:a=>{if(B)B.api=a},initialData:init,langCode:"en",onChange:()=>{if(B&&B.api)B.dirty=true;},UIOptions:{canvasActions:{loadScene:false,saveToActiveFile:false,export:false}}},
      h(M,null,h(I.SaveAsImage),h(I.ClearCanvas),h(I.ChangeCanvasBackground),h(I.ToggleTheme),h(I.Help)),h(EL.WelcomeScreen,null)));}
  else{B.mode="pad";document.getElementById("bw-mode").textContent=ctx.forcePad?"":"Simple board (the full whiteboard couldn't load)";padMount(area,doc&&doc.png);}}
function boardClose(force){if(B&&B.dirty&&!force){openModal("Close without saving?","<p>Your drawing hasn't been saved to a lesson yet.</p>",{danger:true,submitLabel:"Close without saving",onSubmit:async()=>{setTimeout(()=>boardClose(true),50);}});return}
  try{if(B&&B.root)B.root.unmount();}catch(e){}B=null;const w=document.getElementById("boardwrap");if(w){w.hidden=true;w.innerHTML="";}document.body.classList.remove("boarding");render(true);}
async function boardSnapshot(){if(!B)throw userErr("The whiteboard is closed.");let png,scene=null;
  if(B.mode==="exc"){const EL=window.ExcalidrawLib,api=B.api;const els=(api?api.getSceneElements():[]).filter(e=>!e.isDeleted);if(!els.length)throw userErr("Draw something first.");
    const st=api.getAppState(),files=api.getFiles();const blob=await EL.exportToBlob({elements:els,appState:{...st,exportBackground:true,viewBackgroundColor:"#ffffff",exportWithDarkMode:false},files,mimeType:"image/png",maxWidthOrHeight:1600});
    png=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(blob);});
    scene=EL.serializeAsJSON(els,st,files,"local");if(scene.length>380000)scene=EL.serializeAsJSON(els,st,{},"local");if(scene.length>380000)scene=null;}
  else{if(!PAD2.used)throw userErr("Draw something first.");png=padCrop();}
  if(png.length>230000)png=await shrinkImage(png,1400);if(png.length>230000)png=await shrinkImage(png,1000);if(png.length>260000)throw userErr("This board is too big to save. Try removing a picture.");
  return {png,scene};}
function boardLessons(){const cs=isStaff()&&role()==="teacher"?courseList().filter(c=>!c.teacherId||c.teacherId===myTid()||scopedLearners().some(L=>learnerCourses(L).includes(c.id))):courseList();
  return cs.flatMap(c=>lessonsOf(c.id).map(l=>({id:l.id,title:l.title,course:c.title,courseId:c.id})));}
async function boardSave(thenHw){if(!B)return;let snap;try{snap=await boardSnapshot();}catch(e){toast(e.userMsg||e.message||"Couldn't save.",true);return}
  const title=(document.getElementById("bw-t").value||"").trim();const ls=boardLessons();
  if(!ls.length){toast("Add a lesson to a course first, then save the board to it.",true);return}
  const pre=B.lessonId||(B.courseId&&(ls.find(l=>l.courseId===B.courseId)||{}).id)||ls[0].id;
  openModal(thenHw?"Save and share as homework":"Save whiteboard",`<img class="bprev" src="${esc(snap.png)}" alt="Preview of the whiteboard">
    <div class="field"><label for="bs-t">Name</label><input id="bs-t" name="t" type="text" maxlength="80" required data-label="Name" value="${esc(title||"Class whiteboard")}"></div>
    <div class="field"><label for="bs-l">Save to lesson</label><select id="bs-l" name="l">${ls.map(l=>opt(l.id,`${l.title} · ${l.course}`,l.id===pre)).join("")}</select><span class="hint">Learners in this course see it on the lesson page.</span></div>`,
   {submitLabel:thenHw?"Save and continue":"Save",...(thenHw?{}:{done:"Whiteboard saved to the lesson"}),onSubmit:async f=>{const l=D.lessons[f.l.value];if(!l)throw userErr("Pick a lesson.");
     const id=B&&B.id||("b"+Date.now().toString(36)+Math.random().toString(36).slice(2,6));const now=Date.now();
     const doc={title:f.t.value.trim().slice(0,80),lessonId:f.l.value,courseId:l.courseId,sid:B&&B.sid||null,png:snap.png,scene:snap.scene,mode:B?B.mode:"pad",at:now,by:S.uid};
     await S.db.doc("boards/"+id).set(doc);BRD[id]=doc;
     if(B&&B.lessonId&&B.lessonId!==f.l.value&&D.lessons[B.lessonId])await S.db.doc("lessons/"+B.lessonId).update({boards:{[id]:null}}).catch(()=>{});
     await S.db.doc("lessons/"+f.l.value).update({boards:{[id]:{title:doc.title,at:now}}});
     if(B){B.id=id;B.lessonId=f.l.value;B.courseId=l.courseId;B.dirty=false;const t=document.getElementById("bw-t");if(t)t.value=doc.title;}
     if(thenHw)setTimeout(()=>A.boardHw(id),350);}});}
A.boardNew=v=>{const [k,id]=String(v||"").split(":");if(k==="l"){const l=D.lessons[id];boardOpen({lessonId:id,courseId:l&&l.courseId});}else if(k==="s"){const s=D.sessions[id];const ls=s?lessonsOf(s.courseId):[];const m=s&&ls.find(l=>norm(l.title)&&(norm(s.topic||"")===norm(l.title)||norm(s.title||"")===norm(l.title)));boardOpen({sid:id,courseId:s&&s.courseId,lessonId:m?m.id:null,title:s?(s.topic||s.title||""):""});}else boardOpen({});};
A.boardOpen=id=>boardOpen({id});
A.boardDel=id=>{const b=BRD[id];openModal("Delete this whiteboard?",`<p>“${esc(b&&b.title||"Whiteboard")}” will be removed from the lesson.</p>`,{danger:true,submitLabel:"Delete",done:"Whiteboard deleted",onSubmit:async()=>{const lid=b&&b.lessonId;if(lid&&D.lessons[lid])await S.db.doc("lessons/"+lid).update({boards:{[id]:null}});await S.db.doc("boards/"+id).delete();delete BRD[id];}});};
A.boardHw=async id=>{const b=BRD[id]||await boardGet(id);if(!b)return;const c=D.courses[b.courseId],l=D.lessons[b.lessonId];
  openModal("Share as homework",`<img class="bprev" src="${esc(b.png)}" alt="The whiteboard">
    <div class="field"><label for="bh-t">Homework title</label><input id="bh-t" name="t" type="text" maxlength="100" required data-label="Title" value="${esc("Look at our whiteboard: "+(b.title||"class board"))}"></div>
    <div class="field"><label for="bh-i">What should learners do?</label><textarea id="bh-i" name="i" rows="4" maxlength="2000" required data-label="Instructions">Look at the whiteboard from our class. Copy the words into your notebook, say each one out loud, and write one sentence using your favourite word.</textarea></div>
    <div class="field"><label for="bh-d">Due date (optional)</label><input id="bh-d" name="d" type="date"></div>
    <p class="small muted">For everyone in ${esc(c?c.title:"the course")}${l?` · from the lesson “${esc(l.title)}”`:""}.</p>`,
   {wide:true,submitLabel:"Set homework",done:"Homework set. Learners see the whiteboard with it.",onSubmit:async f=>{if(!b.courseId)throw userErr("Save the board to a lesson first.");
     await S.db.collection(`tw/${S.uid}/x`).doc().set({kind:"hw",title:f.t.value.trim(),instructions:f.i.value.trim(),courseId:b.courseId,learnerIds:[],due:f.d.value||null,boardId:id,at:Date.now(),by:S.uid,feedback:{}});}});};
function hwBoardHTML(h){if(!h||!h.boardId)return "";const b=BRD[h.boardId];if(!b){boardGet(h.boardId).then(v=>{if(v&&modalOpen){const el=document.getElementById("hwb-"+h.boardId);if(el)el.innerHTML=`<img class="bfull" src="${esc(v.png)}" alt="${esc(v.title||"Whiteboard")}">`;}});}
  return `<div class="field"><span class="lbl">🖍️ Whiteboard from class</span><div id="hwb-${esc(h.boardId)}">${b?`<img class="bfull" src="${esc(b.png)}" alt="${esc(b.title||"Whiteboard")}">`:`<div class="bimg skel"></div>`}</div></div>`;}
/* ---- simple board (fallback): pen, shapes, text, eraser, colours, undo ---- */
const PAD2={c:null,x:null,tool:"pen",col:"#2E2219",w:4,hist:[],used:false,start:null,snap:null};
const PADCOLS=[["#2E2219","Soil"],["#2F8F46","Leaf"],["#E8492F","Tomato"],["#4BA3E3","Sky"],["#FFC94A","Sunny"]];
const PADTOOLS=[["pen","✏️","Pen"],["line","➖","Line"],["arrow","➡️","Arrow"],["rect","⬜","Box"],["ellipse","⭕","Circle"],["text","🔤","Text"],["eraser","🧽","Eraser"]];
function padMount(area,bg){PAD2.tool="pen";area.innerHTML=`<div class="bwpad"><div class="bwtools" role="toolbar" aria-label="Board tools">${PADTOOLS.map(([k,e,l])=>`<button type="button" class="bwt ${PAD2.tool===k?"on":""}" data-bw="tool" data-v="${k}" aria-pressed="${PAD2.tool===k}" aria-label="${l}"><span aria-hidden="true">${e}</span><small>${l}</small></button>`).join("")}
    <span class="bwsep"></span>${PADCOLS.map(([c,l])=>`<button type="button" class="bwc ${PAD2.col===c?"on":""}" data-bw="col" data-v="${c}" style="background:${c}" aria-label="${l}" aria-pressed="${PAD2.col===c}"></button>`).join("")}
    <span class="bwsep"></span><button type="button" class="bwt" data-bw="undo" aria-label="Undo"><span aria-hidden="true">↩️</span><small>Undo</small></button><button type="button" class="bwt" data-bw="clear" aria-label="Clear"><span aria-hidden="true">🗑️</span><small>Clear</small></button></div>
    <div class="bwcv"><canvas id="bw-cv"></canvas><input id="bw-txt" type="text" maxlength="60" hidden aria-label="Type text, then press Enter"></div></div>`;
  const cv=document.getElementById("bw-cv"),box=cv.parentElement;const W=Math.max(320,box.clientWidth),H=Math.max(300,box.clientHeight);const dpr=Math.min(2,window.devicePixelRatio||1);
  cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+"px";cv.style.height=H+"px";const x=cv.getContext("2d");x.scale(dpr,dpr);x.fillStyle="#fff";x.fillRect(0,0,W,H);x.lineCap="round";x.lineJoin="round";
  Object.assign(PAD2,{c:cv,x,hist:[],used:false,W,H,dpr});
  if(bg){const im=new Image();im.onload=()=>{const sc=Math.min(W/im.width,H/im.height,1);x.drawImage(im,(W-im.width*sc)/2,(H-im.height*sc)/2,im.width*sc,im.height*sc);PAD2.used=true;};im.src=bg;}
  const pos=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
  const push=()=>{try{PAD2.hist.push(x.getImageData(0,0,cv.width,cv.height));if(PAD2.hist.length>25)PAD2.hist.shift();}catch(e){}};
  cv.addEventListener("pointerdown",e=>{e.preventDefault();const [px,py]=pos(e);if(PAD2.tool==="text"){padText(px,py);return}push();cv.setPointerCapture(e.pointerId);PAD2.start=[px,py];PAD2.last=[px,py];PAD2.snap=x.getImageData(0,0,cv.width,cv.height);
    if(PAD2.tool==="pen"||PAD2.tool==="eraser"){x.beginPath();x.moveTo(px,py);x.lineTo(px+.01,py);padStroke();x.stroke();}PAD2.used=true;if(B)B.dirty=true;});
  cv.addEventListener("pointermove",e=>{if(!PAD2.start)return;const [px,py]=pos(e);const t=PAD2.tool;
    if(t==="pen"||t==="eraser"){x.beginPath();x.moveTo(PAD2.last[0],PAD2.last[1]);x.lineTo(px,py);padStroke();x.stroke();PAD2.last=[px,py];return}
    x.putImageData(PAD2.snap,0,0);padShape(t,PAD2.start[0],PAD2.start[1],px,py);});
  const end=()=>{PAD2.start=null;PAD2.snap=null;};cv.addEventListener("pointerup",end);cv.addEventListener("pointercancel",end);
  const ti=document.getElementById("bw-txt");ti.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();padTextCommit();}else if(e.key==="Escape"){ti.hidden=true;}});ti.addEventListener("blur",()=>padTextCommit());}
function padCrop(){const c=PAD2.c,w=c.width,h=c.height;let d;try{d=PAD2.x.getImageData(0,0,w,h).data;}catch(e){return c.toDataURL("image/png");}
  let x0=w,y0=h,x1=-1,y1=-1;for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){const i=(y*w+x)*4;if(d[i]<245||d[i+1]<245||d[i+2]<245){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}}
  if(x1<0)return c.toDataURL("image/png");const pad=Math.round(30*(PAD2.dpr||1));x0=Math.max(0,x0-pad);y0=Math.max(0,y0-pad);x1=Math.min(w,x1+pad);y1=Math.min(h,y1+pad);
  const o=document.createElement("canvas");o.width=x1-x0;o.height=y1-y0;const ox=o.getContext("2d");ox.fillStyle="#fff";ox.fillRect(0,0,o.width,o.height);ox.drawImage(c,x0,y0,o.width,o.height,0,0,o.width,o.height);return o.toDataURL("image/png");}
function padStroke(){const x=PAD2.x;x.globalCompositeOperation="source-over";x.strokeStyle=PAD2.tool==="eraser"?"#ffffff":PAD2.col;x.lineWidth=PAD2.tool==="eraser"?28:PAD2.w;}
function padShape(t,x0,y0,x1,y1){const x=PAD2.x;padStroke();x.strokeStyle=PAD2.col;x.lineWidth=PAD2.w;x.beginPath();
  if(t==="rect")x.strokeRect(Math.min(x0,x1),Math.min(y0,y1),Math.abs(x1-x0),Math.abs(y1-y0));
  else if(t==="ellipse"){x.ellipse((x0+x1)/2,(y0+y1)/2,Math.abs(x1-x0)/2,Math.abs(y1-y0)/2,0,0,Math.PI*2);x.stroke();}
  else{x.moveTo(x0,y0);x.lineTo(x1,y1);x.stroke();if(t==="arrow"){const a=Math.atan2(y1-y0,x1-x0),L=16;x.beginPath();x.moveTo(x1,y1);x.lineTo(x1-L*Math.cos(a-.45),y1-L*Math.sin(a-.45));x.moveTo(x1,y1);x.lineTo(x1-L*Math.cos(a+.45),y1-L*Math.sin(a+.45));x.stroke();}}}
function padText(px,py){const ti=document.getElementById("bw-txt");if(!ti)return;ti.hidden=false;ti.value="";ti.style.left=px+"px";ti.style.top=(py-16)+"px";ti.dataset.x=px;ti.dataset.y=py;ti.focus();setTimeout(()=>ti.focus(),0);}
function padTextCommit(){const ti=document.getElementById("bw-txt");if(!ti||ti.hidden)return;const v=ti.value.trim();ti.hidden=true;if(!v)return;
  try{PAD2.hist.push(PAD2.x.getImageData(0,0,PAD2.c.width,PAD2.c.height));}catch(e){}const x=PAD2.x;x.fillStyle=PAD2.col;x.font=`700 28px "Baloo 2", system-ui, sans-serif`;x.textBaseline="middle";x.fillText(v,+ti.dataset.x,+ti.dataset.y);PAD2.used=true;if(B)B.dirty=true;}
const PADA={tool:(v,btn)=>{PAD2.tool=v;document.querySelectorAll("#boardwrap .bwt[data-bw=tool]").forEach(b=>{const on=b.dataset.v===v;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on);});},
  col:(v)=>{PAD2.col=v;document.querySelectorAll("#boardwrap .bwc").forEach(b=>{const on=b.dataset.v===v;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on);});},
  undo:()=>{const h=PAD2.hist.pop();if(h)PAD2.x.putImageData(h,0,0);},
  clear:()=>{try{PAD2.hist.push(PAD2.x.getImageData(0,0,PAD2.c.width,PAD2.c.height));}catch(e){}PAD2.x.save();PAD2.x.setTransform(1,0,0,1,0,0);PAD2.x.fillStyle="#fff";PAD2.x.fillRect(0,0,PAD2.c.width,PAD2.c.height);PAD2.x.restore();}};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&B&&!modalOpen&&document.activeElement&&document.activeElement.id!=="bw-txt"&&!document.activeElement.closest(".excalidraw"))boardClose();});
