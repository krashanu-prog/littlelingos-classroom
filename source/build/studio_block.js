/* ================= Art studio (drawing) and Pip's Chess: more fun for kids ================= */
const ST={tool:"pen",c:"#E8492F",w:10,stamp:"pip",hist:[],redo:[],used:false,hue:0,page:"blank",panel:""};
const ST_COLS=["#2E2219","#5C4F45","#E8492F","#F28C38","#FFC94A","#7CC243","#2F8F46","#4BA3E3","#1F6FA8","#9B6BD3","#F7A8C4","#C98A4B","#FFFFFF"];
const ST_SIZES=[["Thin",4],["Medium",10],["Thick",20],["Huge",36]];
const stIc=d=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ST_TOOLS=[
  ["pen","Pencil",'<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>'],
  ["crayon","Crayon",'<path d="M5 19l2-6 8-8 4 4-8 8z"/><path d="M13 7l4 4M5 19l2 0"/>'],
  ["rainbow","Rainbow",'<path d="M3 18a9 9 0 0 1 18 0"/><path d="M7 18a5 5 0 0 1 10 0"/><path d="M11 18a1 1 0 0 1 2 0"/>'],
  ["spray","Spray",'<path d="M8 10h6v10H8z"/><path d="M9 10V7h4v3"/><path d="M17 6h.01M20 4h.01M20 8h.01M18 3h.01M22 6h.01"/>'],
  ["fill","Fill",'<path d="M4 12l7-7 7 7-7 7z"/><path d="M4 12h14"/><path d="M20 15s2 2.4 2 3.8a2 2 0 0 1-4 0c0-1.4 2-3.8 2-3.8z"/>'],
  ["stamp","Stickers",'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.6 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>'],
  ["eraser","Eraser",'<path d="M7 21h10M5.5 14.5l7-7a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L13 19H8.5l-3-3a1 1 0 0 1 0-1.5z"/>']];
const ST_STAMPS=[["pip","Pip"],["star","Star"],["heart","Heart"],["flower","Flower"],["sun","Sun"],["cloud","Cloud"],["leaf","Leaf"],["bee","Ladybird"]];
const ST_PAGES=[["blank","Blank page"],["pip","Pip"],["bloom","Flower"],["house","House"],["fish","Fish"],["butterfly","Butterfly"],["sun","Sunny day"]];
/* stamp and colouring-page shapes, drawn on a 200 x 200 grid */
function stShape(ctx,id,fillCol,outline){
  const P=d=>new Path2D(d),C=(x,y,r)=>{const p=new Path2D();p.arc(x,y,r,0,Math.PI*2);return p;},E=(x,y,rx,ry)=>{const p=new Path2D();p.ellipse(x,y,rx,ry,0,0,Math.PI*2);return p;};
  const paint=(p,col)=>{if(outline){ctx.stroke(p);}else{ctx.fillStyle=col;ctx.fill(p);}};
  const dot=(p,col)=>{ctx.fillStyle=outline?"#2E2219":col;ctx.fill(p);};
  if(id==="pip"){paint(P("M100 58 c-4 -26 -30 -40 -54 -30 c8 24 30 34 54 30 z"),"#A6DB5C");paint(P("M100 58 c4 -30 32 -46 60 -34 c-10 28 -34 38 -60 34 z"),"#7CC243");
    if(outline)ctx.stroke(P("M100 56 v14"));else{ctx.strokeStyle="#22703A";ctx.lineWidth=6;ctx.lineCap="round";ctx.stroke(P("M100 56 v14"));}
    paint(E(100,128,70,64),"#2F8F46");paint(E(100,150,46,30),"#3FA75A");paint(C(76,116,15),"#FFFFFF");paint(C(124,116,15),"#FFFFFF");dot(C(79,119,8),"#2E2219");dot(C(127,119,8),"#2E2219");
    paint(E(58,140,10,6),"#F7A8C4");paint(E(142,140,10,6),"#F7A8C4");paint(P("M84 140 q16 22 32 0 z"),"#2E2219");return;}
  if(id==="bloom"||id==="flower"){const col=id==="flower"?fillCol:"#F7A8C4";if(id==="bloom"){if(outline)ctx.stroke(P("M100 138 V196 M100 175 q-25 -20 -40 -5 q20 15 40 5 M100 165 q25 -20 40 -5 q-20 15 -40 5"));}
    for(const [x,y] of [[100,56],[144,92],[128,146],[72,146],[56,92]])paint(C(x,y,30),col);paint(C(100,104,34),"#FFC94A");
    if(id==="bloom"){dot(C(88,100,5),"#2E2219");dot(C(112,100,5),"#2E2219");ctx.stroke(P("M90 114 q10 10 20 0"));}return;}
  if(id==="star"){paint(P("M100 18 L124 72 L182 78 L138 117 L151 175 L100 145 L49 175 L62 117 L18 78 L76 72 Z"),fillCol);return;}
  if(id==="heart"){paint(P("M100 176 C40 130 14 96 30 60 C44 30 84 30 100 62 C116 30 156 30 170 60 C186 96 160 130 100 176 Z"),fillCol);return;}
  if(id==="sun"){ctx.save();ctx.strokeStyle=outline?ctx.strokeStyle:"#FFC94A";ctx.lineWidth=outline?ctx.lineWidth:12;ctx.lineCap="round";
    for(let k=0;k<8;k++){const a=k*Math.PI/4;ctx.beginPath();ctx.moveTo(100+Math.cos(a)*58,100+Math.sin(a)*58);ctx.lineTo(100+Math.cos(a)*86,100+Math.sin(a)*86);ctx.stroke();}ctx.restore();
    paint(C(100,100,46),"#FFC94A");dot(C(84,94,5),"#2E2219");dot(C(116,94,5),"#2E2219");if(!outline){ctx.strokeStyle="#2E2219";ctx.lineWidth=5;ctx.lineCap="round";}ctx.stroke(P("M84 112 q16 14 32 0"));return;}
  if(id==="cloud"){paint(P("M40 140 a32 32 0 0 1 22 -56 a40 40 0 0 1 74 12 a30 30 0 0 1 4 58 h-90 a24 24 0 0 1 -10 -14 z"),outline?"#fff":"#BFE3FA");return;}
  if(id==="leaf"){paint(P("M30 170 C30 90 90 30 176 30 C176 116 116 176 30 170 Z"),fillCol);if(!outline){ctx.strokeStyle="rgba(255,255,255,.7)";ctx.lineWidth=5;}ctx.stroke(P("M40 160 L150 50"));return;}
  if(id==="bee"){paint(E(100,110,56,66),fillCol);dot(C(100,48,14),"#2E2219");dot(C(76,96,10),"#2E2219");dot(C(124,96,10),"#2E2219");dot(C(78,140,10),"#2E2219");dot(C(122,140,10),"#2E2219");
    if(!outline){ctx.strokeStyle="#2E2219";ctx.lineWidth=4;}ctx.stroke(P("M100 46 V176"));return;}
  if(id==="house"){ctx.stroke(P("M30 100 L100 40 L170 100 Z"));ctx.stroke(P("M45 100 H155 V175 H45 Z"));ctx.stroke(P("M88 175 V130 H112 V175"));ctx.stroke(P("M58 115 H80 V137 H58 Z M120 115 H142 V137 H120 Z"));ctx.stroke(P("M5 176 H195"));ctx.stroke(C(172,30,14));return;}
  if(id==="fish"){ctx.stroke(E(92,100,62,40));ctx.stroke(P("M150 100 L188 72 V128 Z"));ctx.stroke(C(64,92,7));ctx.stroke(P("M84 62 q18 -26 40 -4 M80 138 q16 18 32 4 M70 112 q8 8 18 2"));ctx.stroke(C(22,58,7));ctx.stroke(C(12,34,5));ctx.stroke(P("M5 186 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0"));return;}
  if(id==="butterfly"){ctx.stroke(E(100,104,7,44));ctx.stroke(E(66,78,32,26));ctx.stroke(E(134,78,32,26));ctx.stroke(E(72,130,24,20));ctx.stroke(E(128,130,24,20));ctx.stroke(P("M97 62 q-8 -18 -18 -22 M103 62 q8 -18 18 -22"));ctx.stroke(C(66,78,9));ctx.stroke(C(134,78,9));return;}
}
function stPage(cv,id){const cx=cv.getContext("2d");cx.setTransform(1,0,0,1,0,0);cx.fillStyle="#fff";cx.fillRect(0,0,cv.width,cv.height);if(id==="blank")return;
  const s=Math.min(cv.width,cv.height)/200*.9;cx.save();cx.translate((cv.width-200*s)/2,(cv.height-200*s)/2);cx.scale(s,s);cx.strokeStyle="#2E2219";cx.lineWidth=2.4;cx.lineJoin="round";cx.lineCap="round";
  if(id==="sun"){stShape(cx,"sun","#fff",true);cx.translate(0,0);}else stShape(cx,id,"#fff",true);cx.restore();}
function stStamp(cx,id,x,y,size,col){const s=size/200;cx.save();cx.translate(x-size/2,y-size/2);cx.scale(s,s);stShape(cx,id,col,false);cx.restore();}
function stFill(cv,x,y,hex){const cx=cv.getContext("2d"),W=cv.width,H=cv.height,img=cx.getImageData(0,0,W,H),d=img.data;x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=H)return;
  const n=parseInt(hex.slice(1),16),R=n>>16&255,G=n>>8&255,B=n&255,i0=(y*W+x)*4,r0=d[i0],g0=d[i0+1],b0=d[i0+2];
  if(Math.abs(r0-R)+Math.abs(g0-G)+Math.abs(b0-B)<12)return;const tol=110,seen=new Uint8Array(W*H),stack=[x,y];
  const ok=i=>{const k=i*4;return Math.abs(d[k]-r0)+Math.abs(d[k+1]-g0)+Math.abs(d[k+2]-b0)<=tol;};
  while(stack.length){const py=stack.pop(),px=stack.pop();let xl=px;while(xl>=0&&!seen[py*W+xl]&&ok(py*W+xl))xl--;xl++;let up=false,dn=false;
    for(let xx=xl;xx<W;xx++){const i=py*W+xx;if(seen[i]||!ok(i))break;seen[i]=1;const k=i*4;d[k]=R;d[k+1]=G;d[k+2]=B;d[k+3]=255;
      if(py>0){const u=i-W;if(!seen[u]&&ok(u)){if(!up){stack.push(xx,py-1);up=true;}}else up=false;}
      if(py<H-1){const v=i+W;if(!seen[v]&&ok(v)){if(!dn){stack.push(xx,py+1);dn=true;}}else dn=false;}}}
  /* close the thin gap left beside anti-aliased outlines */
  for(let i=0;i<W*H;i++){if(seen[i])continue;const k=i*4;if(d[k]+d[k+1]+d[k+2]<200)continue;const xx=i%W;if((xx>0&&seen[i-1])||(xx<W-1&&seen[i+1])||(i>=W&&seen[i-W])||(i<W*H-W&&seen[i+W])){if(Math.abs(d[k]-r0)+Math.abs(d[k+1]-g0)+Math.abs(d[k+2]-b0)<=260){d[k]=R;d[k+1]=G;d[k+2]=B;}}}
  cx.putImageData(img,0,0);}
function stBar(){const t=ST.tool;
  const tools=ST_TOOLS.map(([k,l,d])=>`<button type="button" class="sttool ${t===k?"on":""}" data-mact="sttool" data-id="${k}" aria-pressed="${t===k}">${stIc(d)}<span>${l}</span></button>`).join("");
  const cols=t==="eraser"?"":`<div class="stcols" role="group" aria-label="Colour">${ST_COLS.map((c,i)=>`<button type="button" class="stcol ${ST.c===c&&t!=="rainbow"?"on":""} ${c==="#FFFFFF"?"wh":""}" style="background:${c}" data-mact="stcol" data-id="${c}" aria-label="Colour ${i+1}"></button>`).join("")}</div>`;
  const sizes=t==="fill"?"":`<div class="stsizes" role="group" aria-label="Size">${ST_SIZES.map(([l,w])=>`<button type="button" class="stsz ${ST.w===w?"on":""}" data-mact="stsize" data-id="${w}" aria-label="${l}"><i style="width:${Math.min(28,w*.7+4)}px;height:${Math.min(28,w*.7+4)}px"></i></button>`).join("")}</div>`;
  const stamps=t==="stamp"?`<div class="ststamps" role="group" aria-label="Sticker">${ST_STAMPS.map(([k,l])=>`<button type="button" class="ststamp ${ST.stamp===k?"on":""}" data-mact="ststamp" data-id="${k}" aria-label="${l}"><svg viewBox="0 0 200 200" width="34" height="34" data-stamp="${k}"></svg></button>`).join("")}</div>`:"";
  return `<div class="stbar"><div class="sttools" role="group" aria-label="Tools">${tools}</div><div class="strow">${cols}${sizes}</div>${stamps}
    <div class="stacts"><button type="button" class="padbtn" data-mact="stpages">${stIc('<path d="M5 4h10l4 4v12H5z"/><path d="M14 4v5h5"/>')}Colouring pages</button><span class="spacer"></span><button type="button" class="padbtn" data-mact="stundo" aria-label="Undo">${stIc('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>')}</button><button type="button" class="padbtn" data-mact="stredo" aria-label="Redo">${stIc('<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>')}</button><button type="button" class="padbtn" data-mact="stwipe">New page</button></div>
    ${ST.panel==="pages"?`<div class="stpages">${ST_PAGES.map(([k,l])=>`<button type="button" class="stpage" data-mact="stpage" data-id="${k}"><canvas width="120" height="84" data-page="${k}" aria-hidden="true"></canvas><span>${l}</span></button>`).join("")}</div>`:""}</div>`;}
function stPaintPreviews(root){root.querySelectorAll("svg[data-stamp]").forEach(sv=>{const k=sv.dataset.stamp;const cv=document.createElement("canvas");cv.width=200;cv.height=200;stStamp(cv.getContext("2d"),k,100,100,190,k==="pip"?"#2F8F46":ST.c==="#FFFFFF"?"#FFC94A":ST.c);sv.outerHTML=`<img src="${cv.toDataURL()}" width="34" height="34" alt="">`;});
  root.querySelectorAll("canvas[data-page]").forEach(cv=>{const k=cv.dataset.page;const big=document.createElement("canvas");big.width=500;big.height=350;stPage(big,k);cv.getContext("2d").drawImage(big,0,0,120,84);});}
function stRefresh(form){const bar=form.querySelector(".stbar");if(bar){bar.outerHTML=stBar();stPaintPreviews(form);}}
function stPush(cv){const cx=cv.getContext("2d");ST.hist.push(cx.getImageData(0,0,cv.width,cv.height));if(ST.hist.length>20)ST.hist.shift();ST.redo=[];}
A.drawPad=()=>{Object.assign(ST,{hist:[],redo:[],used:false,panel:"",page:"blank"});if(ST.tool==="eraser"||ST.tool==="fill")ST.tool="pen";
  openModal("Art studio",`${stBar()}<div class="stcanvas"><canvas id="pad" width="${innerHeight>innerWidth*1.15?700:1000}" height="${innerHeight>innerWidth*1.15?1000:700}" class="pad" aria-label="Drawing area"></canvas></div>
  <div class="padfoot"><div class="field" style="flex:1;min-width:0"><label for="pd-t">Name your picture</label><input type="text" id="pd-t" name="t" maxlength="60" placeholder="e.g. My happy garden"></div><button type="button" class="btn btn-ghost" data-mact="dl">${stIc('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>')}Download</button></div>`,
  {wide:true,noFocus:true,submitLabel:"Save to my portfolio",done:"Saved! Pip loves your picture.",
   actions:{
     sttool:(k,b,form)=>{ST.tool=k;ST.panel="";stRefresh(form);},
     stcol:(c,b,form)=>{ST.c=c;if(ST.tool==="eraser"||ST.tool==="rainbow")ST.tool="pen";stRefresh(form);},
     stsize:(w,b,form)=>{ST.w=+w;stRefresh(form);},
     ststamp:(k,b,form)=>{ST.stamp=k;stRefresh(form);},
     stpages:(_,b,form)=>{ST.panel=ST.panel==="pages"?"":"pages";stRefresh(form);},
     stpage:(k,b,form)=>{const cv=document.getElementById("pad");stPush(cv);stPage(cv,k);ST.page=k;ST.used=k!=="blank"?ST.used:ST.used;ST.panel="";if(k!=="blank"){ST.tool="fill";}stRefresh(form);toast(k==="blank"?"Fresh page!":"Pick a colour, then tap inside a shape to colour it in.");},
     stundo:()=>{const cv=document.getElementById("pad"),cx=cv.getContext("2d"),h=ST.hist.pop();if(!h){toast("Nothing to undo.");return;}ST.redo.push(cx.getImageData(0,0,cv.width,cv.height));cx.putImageData(h,0,0);},
     stredo:()=>{const cv=document.getElementById("pad"),cx=cv.getContext("2d"),h=ST.redo.pop();if(!h){toast("Nothing to redo.");return;}ST.hist.push(cx.getImageData(0,0,cv.width,cv.height));cx.putImageData(h,0,0);},
     stwipe:()=>{const cv=document.getElementById("pad");stPush(cv);stPage(cv,ST.page==="blank"?"blank":ST.page);},
     dl:(_,b,form)=>{if(!ST.used){toast("Draw something first!");return;}const cv=document.getElementById("pad");const a=document.createElement("a");const nm=(form.querySelector("#pd-t").value.trim()||"my-drawing").replace(/[^a-z0-9]+/gi,"-").toLowerCase();a.href=cv.toDataURL("image/png");a.download=nm+".png";document.body.appendChild(a);a.click();a.remove();toast("Picture downloaded.");}},
   onOpen:form=>{form.classList.add("stfull");if(form.parentElement)form.parentElement.classList.add("stfullwrap");document.body.classList.add("st-on");try{const el=document.documentElement;if(!document.fullscreenElement&&el.requestFullscreen)el.requestFullscreen({navigationUI:"hide"}).catch(()=>{});}catch(e){}stPaintPreviews(form);const cv=document.getElementById("pad");const cx=cv.getContext("2d");stPage(cv,"blank");cx.lineCap="round";cx.lineJoin="round";let down=false,last=null,spray=null;
     const pt=e=>{const r=cv.getBoundingClientRect();return [(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height];};
     const k=()=>cv.width/cv.getBoundingClientRect().width;
     const col=()=>ST.tool==="eraser"?"#fff":ST.tool==="rainbow"?`hsl(${ST.hue},85%,55%)`:ST.c;
     const wid=()=>(ST.tool==="eraser"?ST.w*2.2:ST.w)*k();
     const crayon=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.max(1,Math.hypot(dx,dy)/2),r=wid()/2;cx.fillStyle=ST.c;
       for(let i=0;i<=n;i++){const x=a[0]+dx*i/n,y=a[1]+dy*i/n;for(let j=0;j<Math.max(3,r*1.2);j++){const ang=Math.random()*6.28,rr=Math.random()*r;cx.globalAlpha=.25+Math.random()*.35;cx.fillRect(x+Math.cos(ang)*rr,y+Math.sin(ang)*rr,1.6*k(),1.6*k());}}cx.globalAlpha=1;};
     const sprayAt=p=>{const r=Math.max(18,ST.w*2.4)*k();cx.fillStyle=ST.c;for(let i=0;i<Math.round(r*.9);i++){const ang=Math.random()*6.28,rr=Math.sqrt(Math.random())*r;cx.fillRect(p[0]+Math.cos(ang)*rr,p[1]+Math.sin(ang)*rr,1.8*k(),1.8*k());}};
     const seg=(a,b)=>{if(ST.tool==="crayon")return crayon(a,b);if(ST.tool==="rainbow")ST.hue=(ST.hue+4)%360;cx.strokeStyle=col();cx.lineWidth=wid();cx.beginPath();cx.moveTo(...a);cx.lineTo(...b);cx.stroke();};
     cv.addEventListener("pointerdown",e=>{e.preventDefault();const p=pt(e);stPush(cv);ST.used=true;
       if(ST.tool==="fill"){stFill(cv,p[0],p[1],ST.c);return;}
       if(ST.tool==="stamp"){const size=(60+ST.w*6)*k();stStamp(cx,ST.stamp,p[0],p[1],size,ST.stamp==="pip"?"#2F8F46":ST.c==="#FFFFFF"?"#FFC94A":ST.c);return;}
       down=true;last=p;cv.setPointerCapture(e.pointerId);
       if(ST.tool==="spray"){sprayAt(p);spray=setInterval(()=>{if(last)sprayAt(last);},40);return;}
       seg(p,[p[0]+.01,p[1]+.01]);});
     cv.addEventListener("pointermove",e=>{if(!down)return;const p=pt(e);if(ST.tool==="spray"){last=p;return;}seg(last,p);last=p;});
     const up=()=>{down=false;if(spray){clearInterval(spray);spray=null;}};cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);cv.addEventListener("pointerleave",up);},
   onSubmit:async f=>{if(!ST.used)throw userErr("Draw something first!");const cv=document.getElementById("pad");const sm=document.createElement("canvas");sm.width=Math.round(cv.width*.8);sm.height=Math.round(cv.height*.8);sm.getContext("2d").drawImage(cv,0,0,sm.width,sm.height);let q=.85,out=sm.toDataURL("image/jpeg",q);while(out.length>230000&&q>.3){q-=.1;out=sm.toDataURL("image/jpeg",q);}ST.used=false;await savePort("draw",f.t.value.trim()||"My drawing",out);}});};

/* ---------------- Pip's Chess ---------------- */
const CH_LINES={cap:["Ooh, you took my {p}!","Nice one! My {p} is yours.","Wow, you caught my {p}!"],lost:["I took your {p}. Your turn!","Got your {p}! Can you get one back?"],
  check:["Check! Keep your king safe!","Careful, your king is in check!"],good:["Good move!","Hmm, let me think…","You're getting good at this!","Nice thinking!"],start:["Let's play! You go first.","Ready? Tap a piece to start."]};
const chPick=(k,p)=>{const a=CH_LINES[k];return a[Math.floor(Math.random()*a.length)].replace("{p}",PNAME[p]||"piece");};
function chBest(g){const ms=g.moves({verbose:true});if(!ms.length)return null;const side=g.turn()==="w"?1:-1;let best=-1e9,pick=ms[0];for(const m of ms){g.move(m);let v=side*chSearch(g,1,-1e9,1e9);g.undo();const f="abcdefgh".indexOf(m.to[0]),r=+m.to[1]-1;v+=(7-Math.abs(3.5-f)-Math.abs(3.5-r))*3+(m.flags.includes("k")||m.flags.includes("q")?25:0)+((m.piece==="n"||m.piece==="b")&&(m.from[1]==="1"||m.from[1]==="8")?12:0);if(v>best){best=v;pick=m;}}return pick;}
function chAiMove(){const g=CH.g;if(!g||g.game_over())return;const ms=g.moves({verbose:true});if(!ms.length)return;let pick;
  if(CH.mode==="easy"&&Math.random()<.35)pick=ms[Math.floor(Math.random()*ms.length)];
  else{const depth=CH.mode==="easy"?1:2,side=g.turn()==="w"?1:-1;let best=-1e9;for(const m of ms.sort(()=>Math.random()-.5)){g.move(m);const v=side*chSearch(g,depth-1,-1e9,1e9)+(CH.mode==="easy"?Math.random()*80:Math.random()*8);g.undo();if(v>best){best=v;pick=m;}}}
  const mv=g.move({from:pick.from,to:pick.to,promotion:"q"});CH.last=mv?[mv.from,mv.to]:null;CH.hint=null;
  if(mv)CH.msg=g.in_check()?chPick("check"):mv.captured?chPick("lost",mv.captured):(Math.random()<.3?chPick("good"):"Your turn!");}
function chNewGame(mode,me){CH.g=new window.Chess();CH.sel=null;CH.last=null;CH.hint=null;CH.mode=mode||CH.mode;CH.me=me||CH.me||"w";CH.busy=false;CH.msg=chPick("start");CH.cheer=false;
  if(CH.mode!=="two"&&CH.me==="b"){CH.msg="I'll go first!";CH.busy=true;setTimeout(()=>{chAiMove();CH.busy=false;render();},500);}}
function chCaptured(g){const full={p:8,n:2,b:2,r:2,q:1},cnt={w:{p:0,n:0,b:0,r:0,q:0},b:{p:0,n:0,b:0,r:0,q:0}};for(const row of g.board())for(const p of row)if(p&&p.type!=="k")cnt[p.color][p.type]++;
  const lost=c=>{const out=[];for(const t of ["q","r","b","n","p"])for(let i=0;i<Math.max(0,full[t]-cnt[c][t]);i++)out.push(t);return out;};
  const val=c=>Object.entries(cnt[c]).reduce((s,[t,n])=>s+n*({p:1,n:3,b:3,r:5,q:9})[t],0);return {w:lost("w"),b:lost("b"),adv:val("w")-val("b")};}
function chStatus(){const g=CH.g,two=CH.mode==="two",kid=role()==="student",name=c=>c==="w"?"White":"Black";
  if(g.in_checkmate()){const loser=g.turn();if(two)return `Checkmate! ${name(loser==="w"?"b":"w")} wins!`;return loser===CH.me?(kid?"Checkmate! I win this time. Good game, want a rematch?":"Checkmate. The computer wins this one."):(kid?"Checkmate! You won! You've bloomed!":"Checkmate! You win.");}
  if(g.in_stalemate())return "Stalemate. It's a draw!";if(g.in_draw())return "It's a draw. Well played!";
  if(CH.busy)return kid?"Hmm, let me think…":"Thinking…";
  if(two)return (g.in_check()?"Check! ":"")+`${name(g.turn())} to move.`;
  return CH.msg||"Your turn!";}
function chPlayer(side,who){const cap=chCaptured(CH.g),mine=side==="w"?cap.b:cap.w,adv=side==="w"?cap.adv:-cap.adv,kid=role()==="student",turn=CH.g.turn()===side&&!CH.g.game_over();
  const av=who==="pip"?art("pip",44,"Pip"):who==="friend"?`<span class="chav">${side==="w"?"W":"B"}</span>`:`<span class="chav me">${esc((firstOf(myName()||"You")[0]||"Y").toUpperCase())}</span>`;
  const nm=who==="pip"?(kid?"Pip":"Computer")+` <i>${CH.mode==="easy"?"Easy":"Tricky"}</i>`:who==="friend"?(side==="w"?"White":"Black"):"You";
  return `<div class="chplayer ${turn?"turn":""}">${av}<div class="grow"><b>${nm}</b><div class="chcap">${mine.map(t=>pieceSvg(t,side==="w"?"b":"w")).join("")}${adv>0?`<span class="chadv">+${adv}</span>`:""}</div></div>${turn?`<span class="pill p-sun">${who==="pip"?"Thinking":"Turn"}</span>`:""}</div>`;}
function chessHTML(){
  if(!window.Chess)return `<section class="card panel chx"><h2>Pip's Chess</h2><p class="muted">${CH.err?"Couldn't load the chess board. Check your internet connection and try again.":"Setting up the board…"}</p>${CH.err?`<button class="btn btn-ghost btn-sm" data-act="chOpen">Try again</button>`:""}</section>`;
  if(!CH.g)chNewGame();
  const g=CH.g,b=g.board(),flip=CH.mode!=="two"&&CH.me==="b",two=CH.mode==="two",over=g.game_over(),kid=role()==="student";
  const targets=new Set(CH.sel?g.moves({square:CH.sel,verbose:true}).map(m=>m.to):[]);
  let kingSq="";if(g.in_check()){for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(p&&p.type==="k"&&p.color===g.turn())kingSq="abcdefgh"[c]+(8-r);}}
  let sq="";
  for(let i=0;i<8;i++)for(let j=0;j<8;j++){const r=flip?7-i:i,c=flip?7-j:j,name="abcdefgh"[c]+(8-r),p=b[r][c],dark=(r+c)%2===1;
    const cls=["chsq",dark?"dk":"lt",CH.sel===name?"sel":"",targets.has(name)?(p?"cap":"tgt"):"",CH.last&&CH.last.includes(name)?"lastmv":"",CH.last&&CH.last[1]===name?"landed":"",kingSq===name?"chk":"",CH.hint&&CH.hint.includes(name)?"hint":""].filter(Boolean).join(" ");
    sq+=`<button type="button" class="${cls}" data-act="chTap" data-id="${name}" aria-label="${name}${p?` ${p.color==="w"?"white":"black"} ${PNAME[p.type]}`:""}">${p?pieceSvg(p.type,p.color):""}${j===0?`<i class="rk">${8-r}</i>`:""}${i===7?`<i class="fl">${"abcdefgh"[c]}</i>`:""}</button>`;}
  const me=two?"w":CH.me,op=me==="w"?"b":"w",won=over&&g.in_checkmate()&&!two&&g.turn()!==CH.me;
  const chip=(act,v,cur,label)=>`<button class="chchip ${v===cur?"on":""}" data-act="${act}" data-id="${v}" aria-pressed="${v===cur}">${label}</button>`;
  return `<section class="card panel chx ${won?"won":""}">
    <div class="chhead"><h2>${kid?"Pip's Chess":"Chess"}</h2><div class="chchips" role="group" aria-label="Opponent">${chip("chModeB","easy",CH.mode,"Easy")}${chip("chModeB","medium",CH.mode,"Tricky")}${chip("chModeB","two",CH.mode,"With a friend")}</div>
      ${two?"":`<div class="chchips" role="group" aria-label="Your colour">${chip("chSideB","w",CH.me,'<i class="chdot w"></i>White')}${chip("chSideB","b",CH.me,'<i class="chdot b"></i>Black')}</div>`}</div>
    <div class="chgame"><div class="chboardcol">
      ${chPlayer(op,two?"friend":"pip")}
      <div class="chframe"><div class="board" role="grid" aria-label="Chess board">${sq}</div>${won?`<div class="chconfetti" aria-hidden="true">${Array.from({length:24},(_,k)=>`<i style="left:${(k*37)%100}%;animation-delay:${(k%8)*.15}s;background:${["#E8492F","#FFC94A","#7CC243","#4BA3E3","#F7A8C4"][k%5]}"></i>`).join("")}</div>`:""}</div>
      ${chPlayer(me,two?"friend":"me")}</div>
      <div class="chside">
        <div class="chbubble ${over?"over":""}">${art(won?"bloom":"pip",64,won?"Bloom":"Pip")}<p aria-live="polite">${esc(chStatus())}</p></div>
        <div class="chbtns">${!over&&!two?`<button class="btn btn-ghost btn-sm" data-act="chHint" ${CH.busy?"disabled":""}>${stIc('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>')}Hint</button>`:""}<button class="btn btn-ghost btn-sm" data-act="chUndo" ${g.history().length&&!CH.busy?"":"disabled"}>${stIc('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>')}Undo</button><button class="btn ${over?"btn-primary":"btn-ghost"} btn-sm" data-act="chReset">${over?"Play again":"New game"}</button></div>
        <p class="small muted">Tap a piece, then tap a dot to move. Pawns that reach the end become queens.</p></div></div></section>`;}
A.chTap=sq=>{const g=CH.g;if(!g||CH.busy||g.game_over())return;const turnOk=CH.mode==="two"||g.turn()===CH.me;if(!turnOk)return;const p=g.get(sq);
  if(CH.sel){const mv=g.moves({square:CH.sel,verbose:true}).find(m=>m.to===sq);
    if(mv){const done=g.move({from:CH.sel,to:sq,promotion:"q"});CH.last=[done.from,done.to];CH.sel=null;CH.hint=null;
      if(CH.mode!=="two"){CH.msg=done.captured?chPick("cap",done.captured):g.in_check()?"Ooh, check! Let me get out of this…":"Hmm, let me think…";}
      render();if(CH.mode!=="two"&&!g.game_over()){CH.busy=true;render();setTimeout(()=>{chAiMove();CH.busy=false;render();},650);}return;}}
  CH.sel=p&&p.color===g.turn()&&CH.sel!==sq?sq:null;render();};
A.chHint=()=>{const g=CH.g;if(!g||CH.busy||g.game_over()||g.turn()!==CH.me)return;const m=chBest(g);if(m){CH.hint=[m.from,m.to];CH.sel=null;CH.msg=`Try moving your ${PNAME[m.piece]} to ${m.to}.`;}render();};
A.chUndo=()=>{const g=CH.g;if(!g||CH.busy)return;g.undo();if(CH.mode!=="two"&&g.turn()!==CH.me)g.undo();CH.sel=null;CH.last=null;CH.hint=null;CH.msg="Let's try that again.";render();};
A.chReset=()=>{chNewGame(CH.mode,CH.me);render();};
A.chModeB=v=>{chNewGame(v,CH.me);render();};
A.chSideB=v=>{chNewGame(CH.mode,v);render();};
