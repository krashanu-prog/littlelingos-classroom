/* ================= Online fee payments (Razorpay) =================
   The parent taps "Pay now"; the razorpay Edge Function creates the order from the fee record (the amount is
   never taken from the browser), Razorpay Checkout takes the payment (UPI, cards, netbanking, wallets), and the
   function checks the signature and records the payment. Keys live only on Supabase. */
const RZP_SRC="https://checkout.razorpay.com/v1/checkout.js";
const rzpOn=()=>!!(CFG().academy||{}).rzp;
let rzpLoading=null;
function needRzp(){if(window.Razorpay)return Promise.resolve(true);if(!rzpLoading)rzpLoading=new Promise(res=>{const s=document.createElement("script");s.src=RZP_SRC;s.onload=()=>res(!!window.Razorpay);s.onerror=()=>{rzpLoading=null;res(false)};document.head.appendChild(s);});return rzpLoading;}
/* the parent's own online receipts: rzp/<uid>/x/<pid>, written by the function */
let rzpSub=false;
function rzpLoadMine(){if(rzpSub||!S.db||!S.uid)return;rzpSub=true;try{S.db.collection(`rzp/${S.uid}/x`).onSnapshot(s=>{const o={};for(const d of s.docs)o[d.id]=d.data();D.rzpMine=o;render();},()=>{D.rzpMine=D.rzpMine||{};});}catch{D.rzpMine={};}}
/* what is still due for this child, after online payments the summary may not show yet */
function rzpDues(L,fk){const mine=entries(D.rzpMine||{}).filter(x=>x.lid===L.id);
  return upiDues(L,fk).map(d=>{const paid=mine.filter(x=>x.month===d.month&&!(fk.pays||[]).some(p=>p.id===x.id)).reduce((s,x)=>s+(+x.amount||0),0);return {month:d.month,amount:d.amount-paid};}).filter(d=>d.amount>0);}
function rzpParentHTML(L,fk){
  if(!rzpOn())return "";
  rzpLoadMine();
  const dues=rzpDues(L,fk);
  const busy=S.rzpBusy;
  const fresh=entries(D.rzpMine||{}).filter(x=>x.lid===L.id&&!(fk.pays||[]).some(p=>p.id===x.id)).sort((a,b)=>(b.at||0)-(a.at||0)).slice(0,3);
  const freshHTML=fresh.length?`<section class="card panel"><h2>Paid online</h2><div class="list">${fresh.map(x=>`<div class="item"><div class="grow"><div class="t">${money(x.amount)} · ${esc(monthLabel(x.month))}</div><div class="s">${esc(fmtDay(new Date(x.at||Date.now())))} · Razorpay ${esc(x.rp||"")}</div></div><span class="pill p-good">Paid</span></div>`).join("")}</div><p class="small muted" style="margin:0">Thank you! Your receipt appears under Receipts shortly.</p></section>`:"";
  if(!dues.length)return freshHTML;
  return freshHTML+`<section class="card panel paybox"><div class="ph"><h2>Pay online</h2><span class="pill p-good">Secure · Razorpay</span></div>
    <p class="small muted" style="margin:0">UPI, debit or credit card, net banking or wallet. Your receipt appears here the moment the payment goes through.</p>
    <div class="list">${dues.map(d=>`<div class="item payrow"><div class="grow"><div class="t">${money(d.amount)} · ${esc(monthLabel(d.month))}</div><div class="s">Fees for ${esc(firstOf(L.name))}</div></div>
      <button class="btn btn-primary" data-act="rzpPay" data-id="${esc(L.id)}|${esc(d.month)}" ${busy?"disabled":""}>${ic("rupee")}${busy===L.id+"|"+d.month?"Opening…":`Pay ${money(d.amount)} now`}</button></div>`).join("")}</div></section>`;
}
A.rzpPay=async id=>{const [lid,month]=id.split("|");const L=learner(lid);if(!L||S.rzpBusy)return;
  S.rzpBusy=id;render();
  try{
    const ok=await needRzp();if(!ok)throw userErr("Couldn't load the payment window. Check your connection and try again.");
    const o=await window.LL_fn("razorpay",{action:"order",lid,month});
    if(o.off)throw userErr("Online payments aren't switched on yet. Please pay the academy as usual.");
    if(o.error==="signin")throw userErr("Please sign in again to pay.");
    if(o.error==="nothing due")throw userErr("Nothing is due for this month. Thank you!");
    if(o.error||!o.order_id)throw userErr("Couldn't start the payment. Please try again in a moment.");
    const a=ACAD();
    const rz=new window.Razorpay({key:o.key_id,amount:o.amount,currency:"INR",order_id:o.order_id,name:(a.name||"Little Lingos").slice(0,40),description:`Fees · ${o.kid||L.name} · ${monthLabel(month)}`.slice(0,120),image:location.origin+location.pathname.replace(/[^/]*$/,"")+"icon-192.png",
      prefill:{name:o.prefill?.name||"",email:o.prefill?.email||"",contact:o.prefill?.contact||""},notes:{lid,month},theme:{color:"#2F8F46"},retry:{enabled:true,max_count:2},
      modal:{ondismiss:()=>{S.rzpBusy=null;render();},confirm_close:true},
      handler:async r=>{toast("Checking your payment…");
        const v=await window.LL_fn("razorpay",{action:"verify",order_id:r.razorpay_order_id,payment_id:r.razorpay_payment_id,signature:r.razorpay_signature});
        S.rzpBusy=null;
        if(v.ok){toast("Payment received. Thank you!");D.rzpMine=D.rzpMine||{};D.rzpMine[v.pid]={lid,month,amount:Math.round(o.amount/100),status:"paid",at:Date.now(),rp:r.razorpay_payment_id};}
        else toast("The payment went through but we couldn't confirm it yet. It will be recorded shortly; contact the academy if it doesn't appear.",true);
        render();}});
    rz.on("payment.failed",r=>{S.rzpBusy=null;render();toast((r&&r.error&&r.error.description)||"The payment didn't go through. Nothing was charged.",true);});
    rz.open();
  }catch(e){S.rzpBusy=null;render();handleErr(e);}
};
/* ---- admin: setup panel (Settings › Billing) and recent online payments (Fees) ---- */
function rzpSetupHTML(){const on=rzpOn();
  return `<section class="card panel" id="rzp-setup"><div class="ph"><h2>Online payments (Razorpay)</h2><span class="pill ${on?"p-good":"p-mute"}">${on?"On":"Off"}</span></div>
    <p class="small muted" style="margin:0">Parents get a <b>Pay now</b> button on their Fees page and pay by UPI, card, net banking or wallet. Payments are recorded here automatically with a receipt for the parent. Razorpay charges its standard fee per payment; there is no monthly cost.</p>
    <ol class="steps small"><li>Create a free account at razorpay.com and finish KYC, then open <b>Account &amp; Settings › API Keys</b> and generate a key.</li>
      <li>In Supabase, open <b>Edge Functions › razorpay › Secrets</b> and add <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code>. (Optional, recommended: add a webhook in Razorpay for <i>payment.captured</i> pointing to the function's <code>/webhook</code> address and save its secret as <code>RAZORPAY_WEBHOOK_SECRET</code>, so payments are recorded even if a parent closes the page early.)</li>
      <li>Tap <b>Check setup</b>, then switch online payments on.</li></ol>
    <div class="row wrap"><button type="button" class="btn btn-ghost btn-sm" data-act="rzpPing">${ic("check")}Check setup</button>
      <button type="button" class="btn ${on?"btn-ghost":"btn-primary"} btn-sm" data-act="rzpToggle">${on?"Switch off":"Switch on"}</button><span class="small muted" id="rzp-ping"></span></div></section>`;}
A.rzpPing=async()=>{const el=document.getElementById("rzp-ping");if(el)el.textContent="Checking…";
  const r=await window.LL_fn("razorpay",{action:"ping"});
  const msg=r.off?"The razorpay function isn't deployed yet (or returned 404).":r.error?`Couldn't check: ${r.error}.`:r.ok?`Ready · ${r.mode==="live"?"LIVE keys":"TEST keys"}${r.webhook?" · webhook secret set":" · no webhook secret (optional)"}.`:`Keys missing: ${[!r.key&&"RAZORPAY_KEY_ID",!r.secret&&"RAZORPAY_KEY_SECRET"].filter(Boolean).join(", ")}.`;
  if(el)el.textContent=msg;else toast(msg,!(r.ok));};
A.rzpToggle=async()=>{const on=rzpOn();
  if(!on){const r=await window.LL_fn("razorpay",{action:"ping"});if(!r.ok){toast(r.off?"Deploy the razorpay function and add the keys first (see the steps).":"Add both Razorpay keys in Supabase first, then check the setup again.",true);return;}
    if(r.mode==="test"){openModal("Test keys",`<p>The keys in Supabase are <b>TEST</b> keys: parents would see a test payment window and no money moves. Switch on anyway (for a trial run), or add your LIVE keys first.</p>`,{submitLabel:"Switch on with test keys",done:"Online payments are on (test mode)",onSubmit:async()=>{await saveCfg({academy:{...(CFG().academy||{}),rzp:true}});await audit("Online payments","on (test keys)");}});return;}}
  await save(()=>saveCfg({academy:{...(CFG().academy||{}),rzp:!on}}),on?"Online payments switched off":"Online payments are on");await audit("Online payments",on?"off":"on");};
let rzpAdmSubs={};
function rzpLoadAll(){if(!S.isOwner||!S.db)return;const uids=new Set();for(const L of activeLearners())for(const u of (L.parents||[]))uids.add(u);
  for(const u of uids){if(rzpAdmSubs[u])continue;rzpAdmSubs[u]=1;try{S.db.collection(`rzp/${u}/x`).onSnapshot(s=>{D.rzpAll=D.rzpAll||{};D.rzpAll[u]={};for(const d of s.docs)D.rzpAll[u][d.id]=d.data();schedule();},()=>{});}catch{}}}
function rzpRecent(n=8){rzpLoadAll();const out=[];for(const [u,xs] of Object.entries(D.rzpAll||{}))for(const [id,x] of Object.entries(xs||{}))if(x)out.push({...x,id,uid:u});return out.sort((a,b)=>(b.at||0)-(a.at||0)).slice(0,n);}
function rzpAdminHTML(){if(!rzpOn())return "";const xs=rzpRecent();
  return `<section class="card panel"><div class="ph"><h2>Online payments</h2><button class="btn btn-ghost btn-sm" data-act="stabGo" data-id="billing">${ic("gear")}Settings</button></div>
  ${xs.length?`<div class="list">${xs.map(p=>`<div class="item"><div class="grow"><div class="t">${money(p.amount)} · ${esc(learnerName(p.lid))} · ${esc(monthLabel(p.month))}</div><div class="s">${esc(fmtDay(new Date(p.at||Date.now())))} ${esc(fmtTime(new Date(p.at||Date.now())))} · ${esc(p.rp||"")} · from ${esc(accountName(p.uid))}</div></div><span class="pill p-good">Recorded</span></div>`).join("")}</div>`:`<p class="muted">Parents' online payments appear here and in each learner's fee record the moment they go through.</p>`}</section>`;}
A.stabGo=id=>{S.stab=id;go("settings");};
