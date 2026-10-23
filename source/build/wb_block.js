/* ---------- all class whiteboards in one place (Library) ---------- */
function allBoards(){const out=[];for(const l of entries(D.lessons||{}))for(const [id,v] of Object.entries(l.boards||{}))if(v)out.push({id,meta:v,l,c:D.courses[l.courseId]});return out.sort((a,b)=>(b.meta.at||0)-(a.meta.at||0));}
function boardsLibHTML(){const all=allBoards();const mineOnly=(S.wbAll!==true)&&role()!=="admin";
  for(const x of all)if(!BRD[x.id])boardGet(x.id);
  const xs=mineOnly?all.filter(x=>{const b=BRD[x.id];return !b||b.by===S.uid;}):all;
  return `<section class="card panel wbpanel" id="whiteboards"><div class="ph"><h2>🖍️ Class whiteboards</h2><div class="row">${role()!=="admin"?`<div class="seg" role="tablist" aria-label="Whose whiteboards"><button class="tog ${mineOnly?"on":""}" data-act="wbAll" data-id="mine">Mine</button><button class="tog ${mineOnly?"":"on"}" data-act="wbAll" data-id="all">Everyone's</button></div>`:""}<button class="btn btn-ghost btn-sm" data-act="boardNew" data-id="">${ic("plus")}New whiteboard</button></div></div>
   ${xs.length?`<div class="bgrid">${xs.map(x=>{const b=BRD[x.id];return `<div class="wbitem">${boardThumb(x.id,x.meta)}<p class="small muted wbwhere">${esc(x.c?x.c.title:"Course")} · ${esc(x.l.title||"Lesson")}${b&&b.by&&b.by!==S.uid?` · by ${esc(byWho(b.by))}`:""}</p></div>`;}).join("")}</div>`
   :`<p class="small muted">${mineOnly&&all.length?"You haven't saved a whiteboard yet. ":"No whiteboards yet. "}Open one from a class (Whiteboard button) or tap New whiteboard. Saved boards appear here and on their lesson page.</p>`}</section>`;}
A.wbAll=v=>{S.wbAll=v==="all";render(true);};
