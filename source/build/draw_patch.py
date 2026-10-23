# ---- Better drawing pad: pen/eraser, sizes, undo, clear, save to portfolio, download ----
def _swap2(start, end, new):
    global s
    i = s.index(start); j = s.index(end, i) + len(end)
    s = s[:i] + new + s[j:]
_swap2('A.drawPad=()=>{', 'const PAD={c:"#2E2219",w:6,used:false};', r'''const PAD={c:"#2E2219",w:8,tool:"pen",used:false,hist:[]};
function padTools(){const cols=["#2E2219","#E8492F","#FFC94A","#2F8F46","#4BA3E3","#F7A8C4","#8A5A2B","#7CC243"];
  return `<div class="padbar"><div class="padgrp" role="group" aria-label="Tool"><button type="button" class="padbtn ${PAD.tool==="pen"?"on":""}" data-mact="tool" data-id="pen" aria-pressed="${PAD.tool==="pen"}">${ic("pencil")}Pen</button><button type="button" class="padbtn ${PAD.tool==="eraser"?"on":""}" data-mact="tool" data-id="eraser" aria-pressed="${PAD.tool==="eraser"}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 21h10M5.5 14.5l7-7a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L13 19H8.5l-3-3a1 1 0 0 1 0-1.5z"/></svg>Eraser</button></div>
  <div class="padgrp padcols" role="group" aria-label="Colour">${cols.map((c,i)=>`<button type="button" class="pcol ${PAD.c===c&&PAD.tool==="pen"?"on":""}" style="background:${c}" data-mact="col" data-id="${c}" aria-label="Colour ${i+1}"></button>`).join("")}</div>
  <div class="padgrp" role="group" aria-label="Size">${[["S",4],["M",8],["L",16]].map(([t,w])=>`<button type="button" class="padbtn sz ${PAD.w===w?"on":""}" data-mact="size" data-id="${w}" aria-label="Size ${t}"><i style="width:${w/1.6+4}px;height:${w/1.6+4}px"></i></button>`).join("")}</div>
  <div class="padgrp"><button type="button" class="padbtn" data-mact="undo">Undo</button><button type="button" class="padbtn" data-mact="wipe">Clear</button></div></div>`;}
function padRefresh(form){const bar=form.querySelector(".padbar");if(bar)bar.outerHTML=padTools();}
A.drawPad=()=>{PAD.used=false;PAD.hist=[];PAD.tool="pen";
  openModal("Draw a picture",`${padTools()}<canvas id="pad" width="1000" height="700" class="pad" aria-label="Drawing area"></canvas>
  <div class="padfoot"><div class="field" style="flex:1;min-width:0"><label for="pd-t">Name your picture</label><input type="text" id="pd-t" name="t" maxlength="60" placeholder="Name your picture"></div><button type="button" class="btn btn-ghost" data-mact="dl">Download</button></div>
  <p class="small muted padhint">Save puts it in your portfolio (Me page) for your teacher to see. Download keeps a copy on this device.</p>`,
  {wide:true,noFocus:true,submitLabel:"Save to my portfolio",done:"Saved to your portfolio!",
   actions:{
     col:(c,b,form)=>{PAD.c=c;PAD.tool="pen";padRefresh(form);},
     tool:(t,b,form)=>{PAD.tool=t;padRefresh(form);},
     size:(w,b,form)=>{PAD.w=+w;padRefresh(form);},
     undo:()=>{const cv=document.getElementById("pad");const h=PAD.hist.pop();if(h)cv.getContext("2d").putImageData(h,0,0);else toast("Nothing to undo.");},
     wipe:()=>{const cv=document.getElementById("pad");const cx=cv.getContext("2d");PAD.hist.push(cx.getImageData(0,0,cv.width,cv.height));if(PAD.hist.length>25)PAD.hist.shift();cx.fillStyle="#fff";cx.fillRect(0,0,cv.width,cv.height);},
     dl:(_,b,form)=>{if(!PAD.used){toast("Draw something first!");return;}const cv=document.getElementById("pad");const a=document.createElement("a");const nm=(form.querySelector("#pd-t").value.trim()||"my-drawing").replace(/[^a-z0-9]+/gi,"-").toLowerCase();a.href=cv.toDataURL("image/png");a.download=nm+".png";document.body.appendChild(a);a.click();a.remove();toast("Picture downloaded.");}},
   onOpen:()=>{const cv=document.getElementById("pad");const cx=cv.getContext("2d");cx.fillStyle="#fff";cx.fillRect(0,0,cv.width,cv.height);cx.lineCap="round";cx.lineJoin="round";let down=false,last=null;
     const pt=e=>{const r=cv.getBoundingClientRect();return [(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height];};
     const dot=p=>{cx.fillStyle=PAD.tool==="eraser"?"#fff":PAD.c;cx.beginPath();cx.arc(p[0],p[1],(PAD.tool==="eraser"?PAD.w*2.5:PAD.w)*(cv.width/cv.getBoundingClientRect().width)/2,0,Math.PI*2);cx.fill();};
     cv.addEventListener("pointerdown",e=>{e.preventDefault();down=true;last=pt(e);cv.setPointerCapture(e.pointerId);PAD.hist.push(cx.getImageData(0,0,cv.width,cv.height));if(PAD.hist.length>25)PAD.hist.shift();PAD.used=true;dot(last);});
     cv.addEventListener("pointermove",e=>{if(!down)return;const p=pt(e);cx.strokeStyle=PAD.tool==="eraser"?"#fff":PAD.c;cx.lineWidth=(PAD.tool==="eraser"?PAD.w*2.5:PAD.w)*(cv.width/cv.getBoundingClientRect().width);cx.beginPath();cx.moveTo(...last);cx.lineTo(...p);cx.stroke();last=p;});
     const up=()=>{down=false};cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);cv.addEventListener("pointerleave",up);},
   onSubmit:async f=>{if(!PAD.used)throw userErr("Draw something first!");const cv=document.getElementById("pad");const sm=document.createElement("canvas");sm.width=800;sm.height=560;sm.getContext("2d").drawImage(cv,0,0,800,560);let q=.85,out=sm.toDataURL("image/jpeg",q);while(out.length>230000&&q>.3){q-=.1;out=sm.toDataURL("image/jpeg",q);}PAD.used=false;await savePort("draw",f.t.value.trim()||"My drawing",out);}});};''')
R('.pad{width:100%;height:auto;border-radius:16px;border:2px solid var(--line);touch-action:none;background:#fff;cursor:crosshair}',
  '''.pad{display:block;width:100%;height:auto;max-height:max(200px,calc(100vh - 430px));max-height:max(200px,calc(100dvh - 430px));aspect-ratio:10/7;object-fit:contain;margin:0 auto;border-radius:16px;border:2px solid var(--line);touch-action:none;background:#fff;cursor:crosshair}
.padbar{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center}
.padgrp{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.padbtn{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:6px 12px;border-radius:999px;border:2px solid var(--line);background:#fff;font:inherit;font-weight:700;cursor:pointer;color:var(--soil)}
.padbtn.on{background:var(--leafSoft);border-color:var(--leafMid);color:var(--leaf)}
.padbtn.sz{width:40px;justify-content:center;padding:0}.padbtn.sz i{display:block;border-radius:50%;background:var(--soil)}
.padbtn:focus-visible,.pcol:focus-visible{outline:3px solid var(--skyDeep);outline-offset:2px}
.padfoot{display:flex;gap:10px;align-items:flex-end}
.padhint{margin:0}
@media (max-width:640px){.pad{max-height:max(190px,calc(100dvh - 500px))}.padhint{display:none}.padfoot .field label{display:none}}''')
