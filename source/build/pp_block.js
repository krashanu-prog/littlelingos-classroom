/* ================= Feature 7: Speaking passport (Blooms only) ================= */
/* the learner picks items (progress/{uid}.spk), a parent approves that exact selection
   (msn/{parent}/x/spk-{lid}, kind "passport"), the trainer adds an endorsement (tw kind "endorse").
   Nothing leaves the app: "Download as PDF" uses the device's own print-to-PDF. */
const ppIsBlooms=L=>!!L&&(L.stage||"")==="Blooms";
const ppSel=L=>{const x=(L&&L.uid&&progOf(L.uid).spk)||{};return {items:(x.items||[]).filter(Boolean),hw:(x.hw||[]).filter(Boolean),intro:x.intro||"",at:x.at||0};};
const ppSig=s=>{const t=JSON.stringify([[...s.items].sort(),[...s.hw].sort(),s.intro]);let h=5381;for(let i=0;i<t.length;i++)h=((h*33)^t.charCodeAt(i))>>>0;return h.toString(36);};
function ppApproval(L){if(!L)return null;msnLoad(L);let best=null;for(const [u,xs] of Object.entries(D.msn||{})){const x=(xs||{})["spk-"+L.id];if(x&&x.kind==="passport"&&x.lid===L.id&&(!best||(x.at||0)>(best.at||0)))best={...x,uid:u};}return best;}
const ppApproved=L=>{const a=ppApproval(L),s=ppSel(L);return !!(a&&a.sig&&a.sig===ppSig(s)&&(s.items.length||s.hw.length));};
const ppEndorse=L=>{let best=null;for(const x of txAll("endorse"))if(x.lid===L.id&&x.text&&(!best||(x.at||0)>(best.at||0)))best=x;return best;};
const ppSpeeches=L=>kpItems(L.uid).filter(x=>x.kind==="audio"&&x.data&&!PRACTICE_ACTS.has(x.act));
const ppWriting=L=>kpItems(L.uid).filter(x=>(x.kind==="photo"||x.kind==="draw"||x.kind==="note")&&x.data);
const ppHw=L=>(pipTry(()=>hwFor(L))||[]).map(h=>({h,a:answerOf(L,h)})).filter(x=>x.a&&String(x.a.text||"").trim().length>=40);
const PP_MARK=`<svg class="ppmark" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="56" r="30" fill="#E8492F"/><circle cx="144" cy="92" r="30" fill="#E8492F"/><circle cx="128" cy="146" r="30" fill="#E8492F"/><circle cx="72" cy="146" r="30" fill="#E8492F"/><circle cx="56" cy="92" r="30" fill="#E8492F"/><circle cx="100" cy="104" r="30" fill="#FFC94A"/></svg>`;
/* the passport itself (used on screen and for the PDF) */
function ppDocHTML(L,forPrint){const s=ppSel(L),f=firstOf(L.name),sp=ppSpeeches(L).filter(x=>s.items.includes(x.id)),wr=ppWriting(L).filter(x=>s.items.includes(x.id)),hw=ppHw(L).filter(x=>s.hw.includes(x.h.key));
  const certs=pipTry(()=>certsOf(L))||[],bs=(pipTry(()=>badgesOf(L))||[]).filter(b=>b.ok),as=(pipTry(()=>assessFor(L))||[])[0],en=ppEndorse(L),ap=ppApproval(L),ok=ppApproved(L);
  const sec=(t,b)=>b?`<section class="ppsec"><h3>${t}</h3>${b}</section>`:"";
  return `<article class="ppdoc" aria-label="Speaking passport">
    <header class="pphead">${PP_MARK}<div class="grow"><span class="ppeyebrow">Speaking passport</span><h2>${esc(L.name)}</h2><span class="ppsub">Blooms · ages 11–15 · Little Lingos</span></div></header>
    ${s.intro?`<p class="ppintro">“${esc(s.intro)}”</p>`:""}
    ${sec("Best speeches and debates",sp.length?`<ul class="pplist">${sp.map(x=>`<li><b>${esc(x.title||"Recording")}</b><span>${esc(fmtDay(new Date(x.at)))}</span>${forPrint?`<span class="ppnote">Audio: listen in the Little Lingos app</span>`:`<audio controls preload="none" src="${esc(x.data)}"></audio>`}</li>`).join("")}</ul>`:"")}
    ${sec("Best writing",wr.length||hw.length?`<div class="ppwrite">${wr.map(x=>`<figure><img src="${esc(x.data)}" alt="${esc(x.title||"Writing")}"><figcaption>${esc(x.title||"Writing")} · ${esc(fmtDay(new Date(x.at)))}</figcaption></figure>`).join("")}${hw.map(x=>`<blockquote><b>${esc(x.h.title||"Writing task")}</b><p>${esc(String(x.a.text).trim().slice(0,600))}${String(x.a.text).trim().length>600?"…":""}</p></blockquote>`).join("")}</div>`:"")}
    ${sec("Skills",as&&as.skills?`<div class="ppskills">${SKILLS.map(([k,l])=>`<div><span>${l}</span><b>${as.skills[k]?`${+as.skills[k]} / 5`:"–"}</b></div>`).join("")}</div><p class="ppsmall">From the trainer's assessment, ${esc(fmtDay(new Date(as.at)))}${as.level?` · ${esc(as.level)}`:""}</p>`:"")}
    ${sec("Speaking confidence",`<p>${esc(pipTry(()=>confSentence(L))||"")}</p>`)}
    ${sec("Certificates",certs.length?`<ul class="ppchips">${certs.map(c=>`<li>${esc((c.c&&c.c.title)||"Certificate")} · ${esc(fmtDay(new Date(c.at)))}</li>`).join("")}</ul>`:"")}
    ${sec("Badges",bs.length?`<ul class="ppchips">${bs.map(b=>`<li>${esc(b.t)}</li>`).join("")}</ul>`:"")}
    ${sec("Trainer's endorsement",en?`<blockquote class="ppend"><p>“${esc(en.text)}”</p><cite>${esc(byWho(en.uid))} · ${esc(fmtDay(new Date(en.at)))}</cite></blockquote>`:"")}
    <footer class="ppfoot"><span><b>little lingos</b> · Where words grow.</span><span>${ok?`Approved by a parent on ${esc(fmtDay(new Date(ap.at)))}`:"Not yet approved by a parent"}</span></footer></article>`;}
/* small cards that lead to the passport */
function ppMeHTML(L){if(!ppIsBlooms(L))return "";const s=ppSel(L),n=s.items.length+s.hw.length,ok=ppApproved(L);
  return `<section class="card panel ppcard">${PP_MARK}<div class="grow"><h2>My speaking passport</h2><p class="small muted">${n?`${n} item${n===1?"":"s"} picked · ${ok?"approved and ready to download":"waiting for a parent to approve"}`:"Pick your best speeches and writing for school, competitions and interviews."}</p><button class="btn btn-ghost btn-sm" data-go="passport">${n?"Open my passport":"Build my passport"}</button></div></section>`;}
function ppParentHTML(L){if(!ppIsBlooms(L)||!L.uid)return "";const s=ppSel(L),n=s.items.length+s.hw.length,ok=ppApproved(L),f=firstOf(L.name);
  return `<section class="card panel ppcard">${PP_MARK}<div class="grow"><h2>Speaking passport</h2><p class="small muted">${!n?`${esc(f)} hasn't picked anything yet.`:ok?"Approved. You can download it as a PDF.":`${esc(f)} picked ${n} item${n===1?"":"s"}. Please check and approve.`}</p><button class="btn ${n&&!ok?"btn-primary":"btn-ghost"} btn-sm" data-go="passport">${n&&!ok?"Review and approve":"Open passport"}</button></div></section>`;}
function ppStaffHTML(L){if(!ppIsBlooms(L))return "";const en=ppEndorse(L),s=ppSel(L);
  return `<p class="section-title">Speaking passport</p><div class="adstaff"><span class="small">${s.items.length+s.hw.length} item${s.items.length+s.hw.length===1?"":"s"} picked · ${ppApproved(L)?"approved by a parent":"not approved yet"}</span>
    ${en?`<span class="small"><b>Your endorsement:</b> “${esc(en.text)}”</span>`:`<span class="small muted">Add a short endorsement (2–3 sentences) for ${esc(firstOf(L.name))}'s passport.</span>`}
    <div class="row"><button type="button" class="btn btn-ghost btn-sm" data-mact="ppend">${en?"Edit endorsement":"Write endorsement"}</button><button type="button" class="btn btn-ghost btn-sm" data-mact="ppview">View passport</button></div></div>`;}
A.ppEndorseEdit=lid=>{const L=learner(lid);if(!L||!isStaff())return;const en=ppEndorse(L);
  openModal("Passport endorsement",`<p class="small muted">Shown on ${esc(firstOf(L.name))}'s speaking passport, which parents may share with schools. Keep it specific and true.</p><div class="field"><label for="pe-t">Endorsement</label><textarea id="pe-t" name="t" rows="4" maxlength="320" placeholder="[A short, honest note about how this learner speaks and presents]">${esc((en&&en.uid===S.uid&&en.text)||"")}</textarea></div>`,
   {submitLabel:"Save endorsement",done:"Endorsement saved",onSubmit:async f=>{const t=f.t.value.trim();if(t.length<10)throw userErr("Please write at least a sentence.");
     await S.db.doc(`tw/${S.uid}/x/endorse-${lid}`).set({kind:"endorse",lid,text:t,at:Date.now()});}});};
/* the page */
function passportView(){const r=role();let L=null;
  if(r==="student")L=myLearner();else if(r==="parent")L=curKid();else L=learner(S.ppLid)||null;
  if(!L)return isStaff()?`<div class="head"><div><h1>Speaking passport</h1><p class="lede">Open a Blooms learner and tap “View passport”.</p></div></div>`:pendingHTML();
  if(L.uid&&!D.kp[L.uid])loadKp(L.uid);
  const f=firstOf(L.name),s=ppSel(L),n=s.items.length+s.hw.length,ok=ppApproved(L),ap=ppApproval(L);
  const head=`<div class="head"><div><h1>Speaking passport</h1><p class="lede">${r==="student"?"Your best English work in one polished page, for school admissions, competitions and interviews.":r==="parent"?`${esc(f)}'s best English work in one page. ${esc(f)} chooses what goes in; you approve it before it can be downloaded.`:`${esc(L.name)}'s passport. The learner picks the items; a parent approves before it can be downloaded.`}</p></div></div>${r==="parent"?kidBar():""}`;
  if(!ppIsBlooms(L))return head+`<section class="card panel"><p>The speaking passport is for Blooms learners (ages 11–15). ${r==="parent"?`${esc(f)} is in ${esc(L.stage||"Seeds")}, so it will open when they move up to Blooms.`:""}</p></section>`;
  if(r==="student"&&S.ppEdit)return head+ppEditHTML(L);
  const bar=r==="student"?`<div class="row ppbar"><button class="btn btn-primary" data-act="ppEdit">${n?"Change my items":"Pick my items"}</button>${ok?`<button class="btn btn-ghost" data-act="ppPrint" data-id="${esc(L.id)}">${ic("doc")}Download as PDF</button>`:""}<span class="pill ${ok?"p-good":n?"p-sun":"p-mute"}">${ok?"Approved":n?"Waiting for a parent to approve":"Not started"}</span></div>`
    :r==="parent"?`<div class="row ppbar">${n&&!ok?`<button class="btn btn-primary" data-act="ppApprove" data-id="${esc(L.id)}">${ic("check")}Approve this passport</button>`:""}${ok?`<button class="btn btn-primary" data-act="ppPrint" data-id="${esc(L.id)}">${ic("doc")}Download as PDF</button><button class="btn btn-ghost" data-act="ppWithdraw" data-id="${esc(L.id)}">Withdraw approval</button>`:""}<span class="pill ${ok?"p-good":n?"p-sun":"p-mute"}">${ok?"Approved":n?(ap?"Changed since you approved":"Needs your approval"):"Nothing picked yet"}</span></div>`
    :`<div class="row ppbar"><button class="btn btn-ghost" data-act="ppEndorseEdit" data-id="${esc(L.id)}">${ppEndorse(L)?"Edit endorsement":"Write endorsement"}</button>${ok?`<button class="btn btn-ghost" data-act="ppPrint" data-id="${esc(L.id)}">${ic("doc")}Download as PDF</button>`:""}<span class="pill ${ok?"p-good":"p-mute"}">${ok?"Approved by a parent":"Not approved yet"}</span></div>`;
  return head+bar+(n?ppDocHTML(L,false):`<section class="card panel"><p class="muted">${r==="student"?"Tap “Pick my items” to choose your best speeches and writing.":`${esc(f)} hasn't picked any items yet.`}</p></section>`)
    +`<p class="small muted">The passport stays inside the app. “Download as PDF” opens your device's print screen: choose “Save as PDF”.</p>`;}
function ppEditHTML(L){const s=ppSel(L),sp=ppSpeeches(L),wr=ppWriting(L),hw=ppHw(L);
  const box=(name,val,on,label,sub)=>`<label class="ppopt"><input type="checkbox" name="${name}" value="${esc(val)}" ${on?"checked":""}><span class="grow"><b>${esc(label)}</b><span class="small muted">${esc(sub)}</span></span></label>`;
  return `<form class="card panel ppedit" id="ppform"><h2>Pick your best work</h2><p class="small muted">Choose up to 8 items. A parent will check them before your passport can be downloaded.</p>
    <div class="field"><label for="pp-i">One line about you (optional)</label><input id="pp-i" name="intro" maxlength="160" value="${esc(s.intro)}" placeholder="I love debating and want to speak at the school assembly."></div>
    <h3>Speeches and debates</h3>${sp.length?sp.map(x=>box("it",x.id,s.items.includes(x.id),x.title||"Recording",fmtDay(new Date(x.at)))).join(""):`<p class="small muted">Record a speech from “Me › My portfolio › Record” and it will show here.</p>`}
    <h3>Writing</h3>${wr.map(x=>box("it",x.id,s.items.includes(x.id),x.title||"Writing",fmtDay(new Date(x.at)))).join("")}${hw.map(x=>box("hw",x.h.key,s.hw.includes(x.h.key),x.h.title||"Writing task",String(x.a.text).trim().slice(0,70)+"…")).join("")}${!wr.length&&!hw.length?`<p class="small muted">Your written homework and photos of your writing will show here.</p>`:""}
    <p class="small muted">Your certificates, badges, skills and your trainer's endorsement are added for you.</p>
    <div class="row"><button type="button" class="btn btn-ghost" data-act="ppEdit">Cancel</button><button type="button" class="btn btn-primary" data-act="ppSave">Save my passport</button></div></form>`;}
A.ppEdit=()=>{S.ppEdit=!S.ppEdit;render(true);window.scrollTo(0,0);};
A.ppSave=async()=>{const f=document.getElementById("ppform");if(!f||role()!=="student")return;const it=[...f.querySelectorAll('input[name="it"]:checked')].map(x=>x.value),hw=[...f.querySelectorAll('input[name="hw"]:checked')].map(x=>x.value);
  if(it.length+hw.length>8){toast("Pick up to 8 items.",true);return}
  await upsert("progress/"+S.uid,{spk:{items:it,hw,intro:f.intro.value.trim().slice(0,160),at:Date.now()}});
  S.ppEdit=false;toast(it.length+hw.length?"Saved! Ask a grown-up to approve it.":"Saved.");render(true);};
A.ppApprove=lid=>{const L=learner(lid);if(!L||realRole()!=="parent")return;const s=ppSel(L);
  openModal("Approve the passport",`<p>You're approving the ${s.items.length+s.hw.length} item${s.items.length+s.hw.length===1?"":"s"} ${esc(firstOf(L.name))} picked. After this, the passport can be downloaded as a PDF to share with schools or competitions.</p><p class="small muted">If ${esc(firstOf(L.name))} changes the items later, you'll be asked to approve again.</p>`,
   {submitLabel:"Approve",done:"Approved",onSubmit:async()=>{await S.db.doc(`msn/${S.uid}/x/spk-${lid}`).set({kind:"passport",lid,sig:ppSig(s),at:Date.now()});}});};
A.ppWithdraw=async lid=>{const L=learner(lid);if(!L||realRole()!=="parent")return;await S.db.doc(`msn/${S.uid}/x/spk-${lid}`).set({kind:"passport",lid,sig:"",at:Date.now()});toast("Approval withdrawn");};
A.ppPrint=lid=>{const L=learner(lid);if(!L||!ppApproved(L)){toast("A parent needs to approve the passport first.",true);return}
  let el=document.getElementById("pp-print");if(!el){el=document.createElement("div");el.id="pp-print";document.body.appendChild(el);}
  el.innerHTML=ppDocHTML(L,true);document.body.classList.add("pp-printing");const done=()=>{document.body.classList.remove("pp-printing");window.removeEventListener("afterprint",done);};
  window.addEventListener("afterprint",done);const old=document.title;document.title=`${L.name} - Speaking passport`;setTimeout(()=>{try{window.print()}catch(e){}document.title=old;setTimeout(done,1500);},150);};
