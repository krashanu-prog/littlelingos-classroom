/* ================= Super admin and sales team =================
   A super admin (supabase/sales-team.sql) adds sales team members by email in Settings. A sales account only sees
   the demo screens: the child's dashboard and the parent dashboard for each age group, with a sample child.
   The database gives sales accounts no access level, so no real child, parent, class or fee is ever loaded,
   and nothing they do in the demo is saved. */
const isPv=()=>{const r=realRole();return r==="admin"||r==="sales";};
const SALES_KIDS={Seeds:"Aanya",Sprouts:"Kabir",Blooms:"Meera"};
/* sample children for the parent demo (kept in this browser only) */
function salesSeed(){if(!S.isSales)return;D.learners=D.learners||{};const cids=Object.keys(D.courses||{});
  for(const st of Object.keys(SALES_KIDS)){const id="_demo_"+st;if(!D.learners[id])D.learners[id]={name:SALES_KIDS[st]+" (sample)",stage:st,courses:cids,parents:[S.uid],uid:"demo-"+st,active:true,demo:true,createdAt:1};}}
{const f=render;render=function(){salesSeed();return f.apply(this,arguments);};}
/* nothing a sales account does is saved */
let salesToastAt=0;
function salesGuard(db){
  const stop=()=>{if(!S.isSales)return false;if(Date.now()-salesToastAt>4000){salesToastAt=Date.now();setTimeout(()=>toast("Demo mode: nothing is saved."),0);}return true;};
  const bind=(t,v)=>typeof v==="function"?v.bind(t):v;
  const ref=r=>new Proxy(r,{get(t,k){if((k==="set"||k==="update"||k==="delete")&&stop())return ()=>Promise.resolve();return bind(t,t[k]);}});
  const col=c=>new Proxy(c,{get(t,k){if(k==="doc")return (...a)=>ref(t.doc(...a));if(k==="add"&&stop())return ()=>Promise.resolve({id:"demo"});return bind(t,t[k]);}});
  return new Proxy(db,{get(t,k){if(k==="doc")return p=>ref(t.doc(p));if(k==="collection")return p=>col(t.collection(p));return bind(t,t[k]);}});}
{const f=lpvGuardDb;lpvGuardDb=db=>salesGuard(f(db));}
/* the demo notes */
{const f=previewNoteHTML;previewNoteHTML=function(){if(!(S.isSales&&role()==="student"))return f.apply(this,arguments);
  return `<section class="alert a-sun prevnote"><span>🎬 <b>Demo: a child's dashboard.</b> This is what a child sees, with a sample learner. Try anything; nothing is saved.</span>${pvStageChips()}</section>`;};}
{const f=ppvBar;ppvBar=function(){const h=f.apply(this,arguments);if(!S.isSales||!h)return h;
  return h.replace(/<label class="ppvpick">[\s\S]*?<\/label>/,`<span class="small"><b>Parent of:</b> ${esc((ppvKid()||{}).name||"a sample child")}</span>`)
    .replace("Preview of what this child's family sees. Messages or changes made here are made as you, the admin.","🎬 Demo: what a family sees, with a sample child. Nothing you do here is saved.");};}
/* Settings: super admins manage the sales team */
S.sales=null;
async function salesLoad(){try{const {data,error}=await window.LL_sb.rpc("ll_sales_list");S.sales=error?{err:/function|does not exist|schema cache/i.test(error.message||"")?"setup":error.message}:{list:data||[]};}catch(e){S.sales={err:"setup"};}render(true);}
function salesCard(){if(!S.isSuper)return "";if(!S.sales){salesLoad();return `<section class="card panel"><h2>Sales team</h2><p class="small muted">Loading…</p></section>`;}
  const x=S.sales;if(x.err)return `<section class="card panel"><h2>Sales team</h2><p class="small">${x.err==="setup"?"To turn this on, run <b>supabase/sales-team.sql</b> once in the Supabase SQL editor.":esc(x.err)}</p></section>`;
  const when=t=>t?fmtDay(new Date(t)):"";
  return `<section class="card panel salescard"><div class="row" style="justify-content:space-between;align-items:center"><h2 style="margin:0">Sales team</h2><span class="pill p-good">You're a super admin</span></div>
    <p class="small">Sales team members sign in with their email and see only the demo: a child's dashboard and a parent dashboard for each age group, with a sample child. They can't see real children, parents, classes or fees, and can't add or remove anyone.</p>
    ${x.list.length?`<div class="list">${x.list.map(m=>`<div class="item"><div class="grow"><div class="t">${esc(m.name||m.email)}</div><div class="s">${esc(m.email)} · added ${esc(when(m.added_at))} · ${m.last_in?"last signed in "+esc(when(m.last_in)):"not signed in yet"}</div></div><button class="btn btn-ghost btn-sm" data-act="salesRemove" data-id="${esc(m.email)}">Remove</button></div>`).join("")}</div>`:`<p class="small muted">No one yet.</p>`}
    <form class="salesadd" data-form="salesAdd"><label class="small"><b>Name</b><input name="n" type="text" maxlength="80" autocomplete="off" placeholder="e.g. Riya"></label><label class="small"><b>Email</b><input name="e" type="email" required autocomplete="off" placeholder="name@example.com"></label><button class="btn btn-primary" type="submit">Add to sales team</button></form>
    <p class="small muted">They sign in at classroom.littlelingos.in with this email (a sign-in code is emailed to them).</p></section>`;}
document.addEventListener("submit",async e=>{const fm=e.target.closest&&e.target.closest('[data-form="salesAdd"]');if(!fm)return;e.preventDefault();
  const em=fm.e.value.trim(),nm=fm.n.value.trim();const b=fm.querySelector("button");b.disabled=true;
  try{const {error}=await window.LL_sb.rpc("ll_sales_add",{e:em,n:nm});if(error)throw error;toast((nm||em)+" can now sign in to show the demo.");await salesLoad();}
  catch(err){toast(String(err.message||err).replace(/^.*?exception:\s*/i,""),true);b.disabled=false;}});
A.salesRemove=async em=>{if(!confirm("Remove "+em+" from the sales team? They will lose access to the demo."))return;
  try{const {error}=await window.LL_sb.rpc("ll_sales_remove",{e:em});if(error)throw error;toast("Removed from the sales team.");await salesLoad();}catch(err){toast(String(err.message||err),true);}};
{const f=VIEWS.settings;if(f)VIEWS.settings=function(){const h=f.apply(this,arguments);return realRole()==="admin"&&!S.viewAs&&S.isSuper&&(S.stab||"academy")==="academy"?salesCard()+h:h;};}
