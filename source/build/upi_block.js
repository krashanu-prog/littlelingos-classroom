/* ================= Phase 1: UPI payments (parent pays, admin confirms) ================= */
const QR_SRC="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js", QR_SRI="sha384-8FWZA6BGMXhsfO+BLtrJK0We6gg5o1JyO8xQm6peWDEUs17ACA5ziE/NIAkl9z2k";
let qrLoading=null;
function needQR(){if(window.qrcode)return Promise.resolve(true);if(!qrLoading)qrLoading=new Promise(res=>{const s=document.createElement("script");s.src=QR_SRC;s.integrity=QR_SRI;s.crossOrigin="anonymous";s.onload=()=>res(!!window.qrcode);s.onerror=()=>{qrLoading=null;res(false)};document.head.appendChild(s);});return qrLoading;}
const upiOn=()=>{const a=ACAD();return !!(a.upi&&/^[\w.\-]{2,256}@[a-zA-Z][\w.\-]{1,64}$/.test(a.upi));};
const upiNote=(L,month)=>`${firstOf(L.name)} ${monthLabel(month)} fee`.replace(/[^\w .\-]/g,"").slice(0,50);
function upiLink(amount,note){const a=ACAD();const q=new URLSearchParams({pa:a.upi,pn:(a.upiName||a.name||"Little Lingos").slice(0,50),am:(+amount).toFixed(2),cu:"INR",tn:note});return "upi://pay?"+q.toString().replace(/\+/g,"%20");}
const isPhone=()=>{try{return matchMedia("(pointer:coarse)").matches||innerWidth<=760}catch{return false}};
/* parent side */
let upiSub=false;
function upiLoadMine(){if(upiSub||!S.db||!S.uid)return;upiSub=true;try{S.db.collection(`upi/${S.uid}/x`).onSnapshot(s=>{const o={};for(const d of s.docs)o[d.id]=d.data();D.upiMine=o;render();},()=>{D.upiMine=D.upiMine||{};});}catch{D.upiMine={};}}
function upiDues(L,fk){const ivs=(fk.invoices||[]).filter(iv=>iv.amount-(iv.paid||0)>0).map(iv=>({month:iv.month,amount:iv.amount-(iv.paid||0)}));
  if(!ivs.length&&fk.remainingM>0)ivs.push({month:thisMonth(),amount:fk.remainingM});return ivs.sort((a,b)=>a.month.localeCompare(b.month));}
function upiParentHTML(L,fk){
  upiLoadMine();
  const mine=entries(D.upiMine||{}).filter(x=>x.lid===L.id).sort((a,b)=>(b.at||0)-(a.at||0));
  const pend=mine.filter(x=>x.status==="pending");
  const dues=upiDues(L,fk).filter(d=>!pend.some(p=>p.month===d.month));
  const pendHTML=pend.length?`<div class="list">${pend.map(p=>`<div class="item"><div class="grow"><div class="t">${money(p.amount)} · ${esc(monthLabel(p.month))}</div><div class="s">UPI ref ${esc(p.ref)} · sent ${esc(fmtDay(new Date(p.at)))}</div></div><span class="pill p-sun">Waiting for the academy to confirm</span></div>`).join("")}</div>`:"";
  const rej=mine.filter(x=>x.status==="rejected"&&Date.now()-(x.at||0)<30*864e5).slice(0,2);
  const rejHTML=rej.map(p=>`<p class="small" style="color:var(--bad);margin:0">The academy couldn't find your payment of ${money(p.amount)} (ref ${esc(p.ref)}). Please check the reference or contact them.</p>`).join("");
  if(!upiOn()){return pendHTML?`<section class="card panel"><h2>UPI payments</h2>${pendHTML}</section>`:"";}
  if(!dues.length&&!pendHTML&&!rejHTML)return "";
  return `<section class="card panel upibox"><h2>Pay with UPI</h2>
    ${dues.length?`<p class="small muted" style="margin:0">Pay from any UPI app (Google Pay, PhonePe, Paytm, BHIM). After paying, tap <b>I've paid</b> and enter the UPI reference number.</p>
    <div class="list">${dues.map(d=>`<div class="item upirow"><div class="grow"><div class="t">${money(d.amount)} · ${esc(monthLabel(d.month))}</div><div class="s">To ${esc(ACAD().upiName||ACAD().name)} · ${esc(ACAD().upi)}</div></div>
      <div class="row upibtns">${isPhone()?`<a class="btn btn-primary btn-sm" href="${esc(upiLink(d.amount,upiNote(L,d.month)))}">Pay ${money(d.amount)} with UPI</a><button class="btn btn-ghost btn-sm" data-act="upiQR" data-id="${esc(L.id)}|${esc(d.month)}|${d.amount}">Show QR</button>`:`<button class="btn btn-primary btn-sm" data-act="upiQR" data-id="${esc(L.id)}|${esc(d.month)}|${d.amount}">Pay ${money(d.amount)} with UPI</button>`}
      <button class="btn btn-ghost btn-sm" data-act="upiPaid" data-id="${esc(L.id)}|${esc(d.month)}|${d.amount}">I've paid</button></div></div>`).join("")}</div>`:""}
    ${pendHTML}${rejHTML}</section>`;
}
A.upiQR=id=>{const [lid,month,amt]=id.split("|");const L=learner(lid);if(!L)return;const link=upiLink(+amt,upiNote(L,month));
  openModal(`Pay ${money(+amt)} with UPI`,`<div class="upiqr"><div id="upi-qr" class="qrbox" aria-label="UPI QR code"><p class="muted">Making the QR code…</p></div>
    <ol class="steps small"><li>Open any UPI app on your phone (Google Pay, PhonePe, Paytm, BHIM).</li><li>Scan this code. Check the name <b>${esc(ACAD().upiName||ACAD().name)}</b> and amount <b>${money(+amt)}</b>.</li><li>Pay, then come back and tap <b>I've paid</b>.</li></ol>
    <p class="small muted">UPI ID: <b>${esc(ACAD().upi)}</b> · Note: ${esc(upiNote(L,month))}</p>${isPhone()?`<a class="btn btn-ghost btn-sm" href="${esc(link)}">Open my UPI app</a>`:""}</div>`,
   {submitLabel:"I've paid",onOpen:()=>{needQR().then(ok=>{const box=document.getElementById("upi-qr");if(!box)return;if(!ok){box.innerHTML=`<p class="small">Couldn't load the QR code. Pay to UPI ID <b>${esc(ACAD().upi)}</b> instead.</p>`;return;}
      try{const q=window.qrcode(0,"M");q.addData(link);q.make();box.innerHTML=q.createSvgTag({cellSize:6,margin:2,scalable:true});}catch(e){box.innerHTML=`<p class="small">Pay to UPI ID <b>${esc(ACAD().upi)}</b>.</p>`;}});},
    onSubmit:async()=>{setTimeout(()=>A.upiPaid(id),350);}});};
A.upiPaid=id=>{const [lid,month,amt]=id.split("|");const L=learner(lid);if(!L)return;
  openModal("I've paid with UPI",`<p>Thanks! Enter the UPI reference number (also called UTR or transaction ID) from your UPI app. The academy checks it and confirms your payment.</p>
    <div class="two"><div class="field"><label for="up-ref">UPI reference</label><input type="text" id="up-ref" name="ref" required inputmode="numeric" maxlength="30" autocomplete="off" placeholder="e.g. 432198765012" data-label="UPI reference"></div>
    <div class="field"><label for="up-amt">Amount paid (₹)</label><input type="number" id="up-amt" name="amt" min="1" step="1" required value="${esc(amt)}" data-label="Amount"></div></div>
    <p class="small muted">For ${esc(L.name)} · ${esc(monthLabel(month))}</p>`,
   {submitLabel:"Send for confirmation",done:"Sent! The academy will confirm your payment soon.",onSubmit:async f=>{
     const ref=f.ref.value.replace(/\s+/g,"").toUpperCase();if(!/^[A-Z0-9]{6,30}$/.test(ref))throw userErr("Check the UPI reference. It's usually 12 digits.");
     const amount=Math.round(+f.amt.value);if(!(amount>0))throw userErr("Enter the amount you paid.");
     if(entries(D.upiMine||{}).some(x=>x.ref===ref&&x.status!=="rejected"))throw userErr("You've already sent this reference.");
     await S.db.collection(`upi/${S.uid}/x`).doc().set({lid,kid:L.name,month,amount,ref,status:"pending",at:Date.now()});}});};
/* admin side */
let upiAdmSubs={};
function upiLoadAll(){if(!S.isOwner||!S.db)return;const uids=new Set();for(const L of activeLearners())for(const u of (L.parents||[]))uids.add(u);
  for(const u of uids){if(upiAdmSubs[u])continue;upiAdmSubs[u]=1;try{S.db.collection(`upi/${u}/x`).onSnapshot(s=>{D.upiAll=D.upiAll||{};D.upiAll[u]={};for(const d of s.docs)D.upiAll[u][d.id]=d.data();schedule();},()=>{});}catch{}}}
function upiPending(){upiLoadAll();const out=[];for(const [u,xs] of Object.entries(D.upiAll||{}))for(const [id,x] of Object.entries(xs||{}))if(x&&x.status==="pending")out.push({...x,id,uid:u});return out.sort((a,b)=>(a.at||0)-(b.at||0));}
function upiAdminHTML(){const ps=upiPending();
  if(!ps.length)return upiOn()?"":`<section class="card panel"><h2>UPI payments</h2><p class="small">Add your UPI ID in <b>Settings › Academy</b> so parents can pay with UPI from their Fees page.</p><button class="btn btn-ghost btn-sm" data-act="academy">${ic("gear")}Add UPI ID</button></section>`;
  return `<section class="card panel"><h2>Confirm UPI payments <span class="pill p-sun num">${ps.length}</span></h2><p class="small muted" style="margin:0">Check each reference in your bank or UPI app, then confirm. Confirming records the payment and sends the parent a receipt.</p>
  <div class="list">${ps.map(p=>`<div class="item"><div class="grow"><div class="t">${money(p.amount)} · ${esc(p.kid||learnerName(p.lid))} · ${esc(monthLabel(p.month))}</div><div class="s">UPI ref <b>${esc(p.ref)}</b> · from ${esc(accountName(p.uid))} · ${esc(fmtDay(new Date(p.at)))} ${esc(fmtTime(new Date(p.at)))}</div></div>
  <button class="btn btn-primary btn-sm" data-act="upiOk" data-id="${esc(p.uid)}|${esc(p.id)}">${ic("check")}Confirm</button><button class="btn btn-ghost btn-sm" data-act="upiNo" data-id="${esc(p.uid)}|${esc(p.id)}">Not received</button></div>`).join("")}</div></section>`;}
A.upiOk=async id=>{const [u,cid]=id.split("|");const x=((D.upiAll||{})[u]||{})[cid];if(!x||x.status!=="pending")return;
  try{const pid="p"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    await S.db.doc("fees/"+x.lid).update({payments:{[pid]:{amount:+x.amount,month:x.month,date:ymd(new Date(x.at||Date.now())),method:"UPI",note:"UPI ref "+x.ref,at:Date.now()}}});
    await S.db.doc(`upi/${u}/x/${cid}`).update({status:"confirmed",pid,confirmedAt:Date.now()});
    await audit("UPI payment confirmed",`${learnerName(x.lid)}: ${money(+x.amount)} (ref ${x.ref})`);toast("Payment confirmed and recorded");}
  catch(e){toast("Couldn't confirm. Check the learner has a fee plan.",true);}};
A.upiNo=id=>{const [u,cid]=id.split("|");const x=((D.upiAll||{})[u]||{})[cid];if(!x)return;
  openModal("Payment not received?",`<p>Mark ${money(+x.amount)} (ref ${esc(x.ref)}) as not received? The parent sees a note asking them to check the reference.</p>`,{danger:true,submitLabel:"Mark not received",done:"Marked as not received",onSubmit:async()=>{await S.db.doc(`upi/${u}/x/${cid}`).update({status:"rejected",rejectedAt:Date.now()});await audit("UPI payment not received",`${learnerName(x.lid)}: ref ${x.ref}`);}});};
