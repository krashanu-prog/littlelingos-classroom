# Admin: "View as Parent" for each age group, shown with a real child of that age group so every parent page has data.
R('''const childrenOf=uid=>uid?activeLearners().filter(L=>(L.parents||[]).includes(uid)).map(L=>L.id):[];''',
  '''const childrenOf=uid=>{if(uid&&uid===S.uid&&ppvOn()){const k=ppvKid();return k?[k.id]:[];}return uid?activeLearners().filter(L=>(L.parents||[]).includes(uid)).map(L=>L.id):[];};''')
R('''...STAGES.map(s=>["student:"+s.v,`Learner · ${s.v} (${s.ages.replace("Ages ","")})`]),["parent","Parent"]]
  .map(([v,l])=>opt(v,l,v===(cur==="student"?"student:"+st:cur))).join("");};''',
  '''...STAGES.map(s=>["student:"+s.v,`Learner · ${s.v} (${s.ages.replace("Ages ","")})`]),...STAGES.map(s=>["parent:"+s.v,`Parent · ${s.v} (${s.ages.replace("Ages ","")})`])]
  .map(([v,l])=>opt(v,l,v===(cur==="student"||cur==="parent"?cur+":"+st:cur))).join("");};''')
R('/* ================= events ================= */','''/* ================= Admin parent preview =================
   Admin picks "Parent · <age group>"; the parent pages then show one real child of that age group (the admin can
   switch child). Nothing is saved to the child's family; anything done here is done as the admin. */
const ppvOn=()=>realRole()==="admin"&&S.viewAs==="parent";
const ppvKids=st=>activeLearners().filter(L=>(L.stage||"Seeds")===st);
function ppvRank(L){let n=0;for(const s of Object.values(D.sessions||{}))if(s&&(s.forLids||[]).includes(L.id))n++;return (L.uid?1000:0)+((L.parents||[]).length?500:0)+n;}
function ppvKid(){const st=S.previewStage||"Seeds",ks=ppvKids(st);if(!ks.length)return null;
  let k=ks.find(x=>x.id===S.ppvKid);if(!k){k=ks.slice().sort((a,b)=>ppvRank(b)-ppvRank(a))[0];S.ppvKid=k.id;}return k;}
try{const v=sessionStorage.getItem("ll-ppvkid");if(v)S.ppvKid=v;}catch{}
A.ppvKid=id=>{S.ppvKid=id;S.kid=id;try{sessionStorage.setItem("ll-ppvkid",id)}catch{}render(true);};
A.ppvStage=st=>{setPvStage(st,true);S.ppvKid=null;const k=ppvKid();if(k)S.kid=k.id;render(true);};
document.addEventListener("change",e=>{const t=e.target;if(t&&t.id==="ppv-kid")A.ppvKid(t.value);});
function ppvBar(){if(!ppvOn())return "";const st=S.previewStage||"Seeds",ks=ppvKids(st),k=ppvKid();
  return `<section class="ppvbar"><div class="pvages" role="group" aria-label="Preview age group"><span class="small"><b>Age group:</b></span>${STAGES.map(s=>`<button class="pvchip ${s.v===st?"on":""}" data-act="ppvStage" data-id="${s.v}" aria-pressed="${s.v===st}">${esc(s.v)}</button>`).join("")}</div>
    ${ks.length?`<label class="ppvpick"><span class="small"><b>Parent of:</b></span><select id="ppv-kid" aria-label="Child to preview">${ks.slice().sort((a,b)=>String(a.name).localeCompare(String(b.name))).map(L=>opt(L.id,`${L.name}${L.uid?"":" (not signed in yet)"}`,k&&L.id===k.id)).join("")}</select></label>`:`<span class="small">No ${esc(st)} children yet.</span>`}
    <span class="small muted">Preview of what this child's family sees. Messages or changes made here are made as you, the admin.</span></section>`;}
for(const v of Object.keys(VIEWS)){const f=VIEWS[v];VIEWS[v]=function(){return ppvBar()+f.apply(this,arguments);};}
/* ================= events ================= */''')
R('@media (prefers-reduced-motion:reduce)','''.ppvbar{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;background:#FFF4D6;border-radius:16px;padding:10px 14px;margin:0 0 14px}
.ppvbar .pvages{margin:0}.ppvpick{display:flex;gap:6px;align-items:center}.ppvpick select{min-height:44px;border-radius:12px;padding:0 10px;font:inherit}
@media (prefers-reduced-motion:reduce)''')
