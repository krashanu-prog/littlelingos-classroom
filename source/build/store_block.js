/* ================= Storage rules: small files, limits, cleanup, storage meter ================= */
const STORE={dbMax:500*1048576,filesMax:1024*1048576,keepN:5,days:90,warnDays:14};
const REC_LIMIT={Seeds:30,Sprouts:45,Blooms:60};
const recLimit=L=>REC_LIMIT[(L||pipTry(()=>myLearner())||{}).stage]||30;
/* friendly countdown while recording, then auto-stop */
function recPill(sec){let el=document.getElementById("recpill");if(!el){el=document.createElement("div");el.id="recpill";el.setAttribute("role","status");el.setAttribute("aria-live","polite");document.body.appendChild(el);}
  let left=sec;const draw=()=>{el.innerHTML=`<span class="rdot" aria-hidden="true"></span>${left>5?`Recording · ${left}s left`:left>0?`Almost done! ${left}s`:"Saving…"}`;};draw();el.hidden=false;
  clearInterval(REC.pt);REC.pt=setInterval(()=>{left--;draw();if(left<=0)clearInterval(REC.pt);},1000);}
function recPillOff(){clearInterval(REC.pt);const el=document.getElementById("recpill");if(el)el.hidden=true;}
/* images: longest side 1280px, WebP (or JPEG) around 70%, under the size cap */
function shrinkTo(src,maxSide,maxBytes){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>{const sc=Math.min(1,maxSide/Math.max(img.width,img.height));const cv=document.createElement("canvas");cv.width=Math.max(1,Math.round(img.width*sc));cv.height=Math.max(1,Math.round(img.height*sc));const cx=cv.getContext("2d");cx.fillStyle="#fff";cx.fillRect(0,0,cv.width,cv.height);cx.drawImage(img,0,0,cv.width,cv.height);
  const webp=cv.toDataURL("image/webp",.7).startsWith("data:image/webp");const type=webp?"image/webp":"image/jpeg";const lim=Math.round(maxBytes*1.37);let q=.7,out=cv.toDataURL(type,q);
  while(out.length>lim&&q>.25){q-=.1;out=cv.toDataURL(type,q);}
  let f=.8;while(out.length>lim&&f>.15){const c2=document.createElement("canvas");c2.width=Math.max(1,Math.round(cv.width*f));c2.height=Math.max(1,Math.round(cv.height*f));const x2=c2.getContext("2d");x2.fillStyle="#fff";x2.fillRect(0,0,c2.width,c2.height);x2.drawImage(cv,0,0,c2.width,c2.height);out=c2.toDataURL(type,.55);f-=.15;}
  res(out);};img.onerror=rej;img.src=src;});}
/* which saved items are "practice" (cleaned up after 90 days, 5 per activity) */
const PRACTICE_ACTS=new Set(["drill","teachpip","sounds","mission"]);
const isKeep=x=>!!(x&&(x.capsule||x.keep||pipTry(()=>(pcFor(x.id)||{}).keep)));
const isPractice=x=>!!(x&&x.act&&PRACTICE_ACTS.has(x.act)&&!isKeep(x));
const expiresAt=x=>(x.at||0)+STORE.days*864e5;
async function prunePractice(uid,act){if(!uid||!act)return;try{await loadKp(uid,true);const xs=kpItems(uid).filter(x=>x.act===act&&isPractice(x)).sort((a,b)=>(b.at||0)-(a.at||0));
  for(const x of xs.slice(STORE.keepN))await S.db.doc(`kp/${uid}/x/${x.id}`).delete().catch(()=>{});if(xs.length>STORE.keepN)loadKp(uid,true);}catch(e){}}
/* the child's own app tidies old practice items and old daily logs once a day */
let tidied="";
async function selfTidy(){try{if(realRole()!=="student"||S.viewAs||!S.uid)return;const day=ymd(new Date());if(tidied===day)return;tidied=day;
  await loadKp(S.uid,true);const now=Date.now();for(const x of kpItems(S.uid))if(isPractice(x)&&expiresAt(x)<now)await S.db.doc(`kp/${S.uid}/x/${x.id}`).delete().catch(()=>{});
  const p=progOf(S.uid),cut=ymd(new Date(now-STORE.days*864e5)),upd={};let mins=0,changed=false;
  for(const [k,v] of Object.entries(p.screen||{}))if(k<cut){mins+=+v||0;(upd.screen=upd.screen||{})[k]=null;changed=true;}
  if(mins)upd.screenOld=(+p.screenOld||0)+mins;
  for(const k of Object.keys(p.moods||{}))if(k<cut){(upd.moods=upd.moods||{})[k]=null;changed=true;}
  for(const [k,o] of Object.entries(p.wk||{}))if(o&&now-(o.t||0)>STORE.days*864e5&&!(+o.m)){(upd.wk=upd.wk||{})[k]=null;changed=true;}
  if(changed)await upsert("progress/"+S.uid,upd);}catch(e){}}
setInterval(()=>{if(S.status==="ready")selfTidy();},60000);setTimeout(()=>{if(S.status==="ready")selfTidy();},7000);
/* parents: download memories before practice items are tidied away */
function memoriesSoon(L){if(!L||!L.uid)return [];const now=Date.now();return kpItems(L.uid).filter(x=>isPractice(x)&&expiresAt(x)-now<STORE.warnDays*864e5);}
function memoriesHTML(L){if(!L||!L.uid)return "";if(!D.kp[L.uid])loadKp(L.uid);const xs=memoriesSoon(L);if(!xs.length)return "";
  const first=Math.min(...xs.map(expiresAt));
  return `<section class="alert a-sun"><b>Save ${esc(firstOf(L.name))}'s garden memories</b><span class="small">${xs.length} practice recording${xs.length===1?"":"s"} and photo${xs.length===1?"":"s"} will be tidied away ${first<=Date.now()+864e5?"very soon":`from ${esc(fmtDay(new Date(first)))}`} to save space. Download a copy to keep.</span><span class="spacer"></span><button class="btn btn-sun btn-sm" data-act="memDl" data-id="${esc(L.id)}">Download memories</button></section>`;}
A.memDl=async lid=>{const L=learner(lid);if(!L||!L.uid)return;await loadKp(L.uid,true);const xs=kpItems(L.uid).filter(x=>x.kind!=="rate"&&x.kind!=="join"&&x.data);
  const body=xs.map(x=>`<figure><figcaption><b>${esc(x.title||(x.kind==="audio"?"Recording":"Picture"))}</b> · ${esc(fmtDay(new Date(x.at)))}</figcaption>${x.kind==="audio"?`<audio controls src="${x.data}"></audio>`:`<img src="${x.data}" alt="">`}</figure>`).join("");
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(firstOf(L.name))}'s garden memories</title><style>body{font-family:system-ui,sans-serif;background:#F5FAEE;color:#2E2219;max-width:720px;margin:0 auto;padding:24px}h1{color:#22703A}figure{background:#fff;border:2px solid #D5E8BE;border-radius:18px;padding:12px;margin:0 0 14px}img{max-width:100%;border-radius:12px}audio{width:100%}</style></head><body><h1>${esc(firstOf(L.name))}'s garden memories</h1><p>Saved from Little Lingos on ${esc(fmtDay(new Date()))}. Where words grow.</p>${body}</body></html>`;
  saveFile(`${firstOf(L.name).toLowerCase()}-garden-memories-${ymd(new Date())}.html`,html);};
/* admin: storage meter + clean up */
const MB=n=>(n/1048576).toFixed(n<10*1048576?1:0)+" MB";
function meter(label,used,max,note){const pct=max?Math.min(100,used/max*100):0,cls=pct>=90?"bad":pct>=70?"warn":"ok";
  return `<div class="smeter ${cls}"><div class="row" style="justify-content:space-between"><b>${label}</b><span class="num">${used==null?"–":`${MB(used)} of ${MB(max)}`}</span></div><div class="bar"><i style="width:${pct.toFixed(1)}%"></i></div>${pct>=90?`<p class="small" style="color:var(--bad);margin:0"><b>Almost full.</b> Clean up now, or upgrade before it fills.</p>`:pct>=70?`<p class="small" style="margin:0"><b>Over 70% used.</b> A clean-up soon is a good idea.</p>`:""}${note?`<p class="small muted" style="margin:0">${note}</p>`:""}</div>`;}
let storeInfo=null,storeAt=0;
function storageHTML(){if(!storeInfo&&Date.now()-storeAt>15000){storeAt=Date.now();window.LL_sb.rpc("ll_storage").then(r=>{storeInfo=r.error?{err:r.error.message}:r.data;schedule();},()=>{storeInfo={err:"offline"};schedule();});}
  const s=storeInfo||{};const ref=((window.LL_CONFIG||{}).supabaseUrl||"").match(/https:\/\/([a-z0-9]+)\./);const usage=ref?`https://supabase.com/dashboard/project/${ref[1]}/settings/billing/usage`:"https://supabase.com/dashboard";
  return `<section class="card panel"><h2>Storage</h2>${s.err?`<p class="small muted">Couldn't read storage use. Run the storage setup in Supabase first.</p>`:""}
    ${meter("Database",s.db,STORE.dbMax,s.media!=null?`Recordings, photos and drawings inside it: ${MB(s.media)} (${s.items||0} items).`:"")}
    ${meter("Files",s.files||0,STORE.filesMax,"Little Lingos keeps compressed media inside the database, so file storage stays nearly empty.")}
    <div class="smeter"><div class="row" style="justify-content:space-between"><b>Downloads this month</b><span>5 GB a month</span></div><p class="small muted" style="margin:0">Supabase doesn't let apps read this number. <a href="${esc(usage)}" target="_blank" rel="noopener">Check it in Supabase › Usage</a>. Reels are built on the device and never stored, which keeps this low.</p></div>
    <div class="row"><button class="btn btn-primary" data-act="cleanScan">${ic("trash")}Clean up now</button><button class="btn btn-ghost btn-sm" data-act="storeRefresh">Refresh</button></div>
    <p class="small"><b>Before a long break:</b> free Supabase projects pause after 7 days with no use. Over holidays, open the classroom at least once a week (any account), or the first visit after the break will take a minute while it wakes up.</p>
    <p class="small muted">Automatic rules: practice recordings and mission photos are tidied after ${STORE.days} days (parents get a download button ${STORE.warnDays} days before). Only the latest ${STORE.keepN} practice recordings per activity are kept. Time-capsule recordings and items a trainer marks “Keep” are never removed.</p></section>`;}
A.storeRefresh=()=>{storeInfo=null;storeAt=0;render(true);};
A.cleanScan=async()=>{const ls=allLearners().filter(L=>L.uid);toast("Checking…");for(const L of ls)await loadKp(L.uid,true);const now=Date.now(),del=[];
  for(const L of ls){const xs=kpItems(L.uid);for(const x of xs)if(isPractice(x)&&expiresAt(x)<now)del.push({uid:L.uid,x,why:"older than 90 days"});
    const byAct={};for(const x of xs)if(isPractice(x)&&expiresAt(x)>=now)(byAct[x.act]=byAct[x.act]||[]).push(x);
    for(const arr of Object.values(byAct))for(const x of arr.sort((a,b)=>(b.at||0)-(a.at||0)).slice(STORE.keepN))del.push({uid:L.uid,x,why:"more than 5 of the same practice"});}
  const msnOld=[];const pus=new Set();for(const L of ls)for(const u of (L.parents||[]))pus.add(u);
  for(const u of pus){try{const sn=await S.db.collection(`msn/${u}/x`).get();for(const d of sn.docs){const x=d.data();if(x&&x.photo&&now-(x.at||0)>STORE.days*864e5)msnOld.push({u,id:d.id,n:x.photo.length});}}catch(e){}}
  const wallOld=entries(D.wall||{}).filter(w=>w.status==="declined"&&now-(w.at||0)>30*864e5);
  const bytes=del.reduce((n,d)=>n+String(d.x.data||"").length,0)+msnOld.reduce((n,m)=>n+m.n,0);
  if(!del.length&&!wallOld.length&&!msnOld.length){openModal("Clean up now","<p>Nothing to clean up. Everything is within the storage rules. 🌱</p>");return}
  openModal("Clean up now",`<p>This frees about <b>${MB(bytes)}</b> by removing:</p><ul><li>${del.filter(d=>d.why[0]==="o").length} practice recordings or mission photos older than ${STORE.days} days</li><li>${del.filter(d=>d.why[0]==="m").length} extra practice recordings (only the latest ${STORE.keepN} per activity are kept)</li>${wallOld.length?`<li>${wallOld.length} old “not this time” wall records</li>`:""}${msnOld.length?`<li>${msnOld.length} mission photos older than ${STORE.days} days (the passport stamps stay)</li>`:""}</ul><p class="small muted">Time-capsule recordings and anything marked “Keep” are never removed.</p>`,
   {danger:true,submitLabel:"Clean up",done:"Cleaned up",onSubmit:async()=>{for(const d of del)await S.db.doc(`kp/${d.uid}/x/${d.x.id}`).delete().catch(()=>{});for(const w of wallOld)await S.db.doc("wall/"+w.id).delete().catch(()=>{});for(const m of msnOld)await S.db.doc(`msn/${m.u}/x/${m.id}`).update({photo:null}).catch(()=>{});
     await audit("Storage clean-up",`${del.length} items, about ${MB(bytes)}`);storeInfo=null;storeAt=0;}});};
