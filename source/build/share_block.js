/* ================= Feature 8: share with family (parent-only private links) ================= */
const SHARE_KINDS=new Set(["audio","photo","draw","note"]);
const shareBase=()=>{const u=(CFG().classroomUrl||"").replace(/\/+$/,"");return (u||location.origin+location.pathname.replace(/[^/]*$/,"").replace(/\/+$/,""))+"/share.html";};
const shareLink=t=>shareBase()+"#t="+t;
const shareRpc=async(fn,args)=>{const r=await window.LL_sb.rpc(fn,args||{});if(r.error)throw userErr(r.error.message||"Something went wrong");return r.data;};
function shareMsg(first,kind,days){const what=kind==="audio"?`Hear ${first} speaking English! 🌱`:kind==="cert"?`${first} earned a certificate in English class! 🌱`:`See ${first}'s work from English class! 🌱`;
  return `${what}\nTap to see it (link works for ${days} days):`;}
const shareBtn=(id,kind)=>role()==="parent"&&(SHARE_KINDS.has(kind)||kind==="cert")?`<button type="button" class="iconbtn" data-act="${kind==="cert"?"shareCert":"shareItem"}" data-id="${esc(id)}" aria-label="Share with family" title="Share with family">${ic("share")}</button>`:"";
function shareModal(L,o){/* o: {kind, ref, title, sub, at} */
  if(realRole()!=="parent"){toast("Only parents can share.",true);return}const f=firstOf(L.name);let days=7;
  const draw=()=>openModal("Share with family",`<p>Make a private link to <b>this one ${o.kind==="audio"?"recording":o.kind==="cert"?"certificate":"piece of work"}</b> for grandparents and family. They don't need to sign in.</p>
    <div class="sharepv"><b>${esc(o.title||"")}</b><span class="small muted">Shows only ${esc(f)}'s first name and this item. No surname, school, location or other work.</span></div>
    <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="lbl">Link works for</legend><div class="seg" role="radiogroup"><label><input type="radio" name="days" value="7" ${days===7?"checked":""} data-mchange="days">7 days</label><label><input type="radio" name="days" value="30" ${days===30?"checked":""} data-mchange="days">30 days</label></div></fieldset>
    <p class="small muted">You can switch the link off any time from “Shared with family”. Family can send a heart or a 30-second voice message, and you can hide any message.</p>`,
   {submitLabel:"Create private link",noFocus:true,actions:{days:v=>{days=+v===30?30:7;}},
    onSubmit:async()=>{const tok=await shareRpc("ll_share_create",{p_lid:L.id,p_kind:o.kind,p_ref:o.ref||null,p_title:o.title||"",p_sub:o.sub||"",p_at:o.at||null,p_days:days});
      setTimeout(()=>shareReady(f,o.kind,days,tok),250);}});
  draw();}
function shareReady(first,kind,days,tok){const link=shareLink(tok),msg=shareMsg(first,kind,days)+"\n"+link;
  openModal("Your private link is ready",`<p class="small muted">Send it to family on WhatsApp, or copy it.</p><textarea id="sh-msg" rows="4" maxlength="400" aria-label="Message">${esc(msg)}</textarea>`,
   {noFocus:true,submitLabel:"Done",footerExtra:`<button type="button" class="btn btn-ghost" data-mact="copy">${ic("copy")}Copy</button><button type="button" class="btn btn-leaf" data-mact="wa">${ic("wa")}Send on WhatsApp</button>`,
    actions:{copy:async()=>{const t=document.getElementById("sh-msg").value;try{await navigator.clipboard.writeText(t);toast("Copied");}catch(e){toast("Copy didn't work. Press and hold the message to copy it.",true);}},
      wa:()=>{const t=document.getElementById("sh-msg").value;window.open("https://wa.me/?text="+encodeURIComponent(t),"_blank","noopener");}}});}
A.shareItem=id=>{const L=curKid();if(!L||!L.uid)return;const x=(D.kp[L.uid]||{})[id];if(!x||!SHARE_KINDS.has(x.kind)){toast("This item can't be shared.",true);return}
  shareModal(L,{kind:x.kind,ref:`kp/${L.uid}/x/${id}`,title:x.title||(x.kind==="audio"?"A recording":"A piece of work"),at:x.at});};
A.shareCert=cid=>{const L=curKid();if(!L)return;const ct=(pipTry(()=>certsOf(L))||[]).find(x=>x.cid===cid);if(!ct)return;
  shareModal(L,{kind:"cert",title:ct.c.title,sub:ct.level?"has reached":"has finished every lesson in",at:ct.at});};
/* parent: everything they've shared */
let SHARES=null,sharesAt=0;
function sharesLoad(force){if(!window.LL_sb||realRole()!=="parent")return;if(!force&&Date.now()-sharesAt<20000)return;sharesAt=Date.now();
  shareRpc("ll_share_list").then(d=>{SHARES=d||[];schedule();},()=>{SHARES=SHARES||[];});}
const shareState=s=>!s.active?["Switched off","p-mute"]:new Date(s.expires)<=new Date()?["Ended","p-mute"]:["Live until "+fmtDay(new Date(s.expires)),"p-good"];
function sharesCardHTML(L){if(role()!=="parent")return "";sharesLoad();const xs=(SHARES||[]).filter(s=>!L||s.lid===L.id);const live=xs.filter(s=>s.active&&new Date(s.expires)>new Date()).length;
  return `<section class="card panel"><div class="ph"><h2>Shared with family</h2><button class="btn btn-ghost btn-sm" data-go="shares">Manage</button></div><p class="small muted">${xs.length?`${live} live link${live===1?"":"s"} · ❤️ ${xs.reduce((n,s)=>n+(+s.hearts||0),0)} · 🎤 ${xs.reduce((n,s)=>n+(+s.replies||0),0)} messages`:`Tap the share button on a recording, picture or certificate to send a private link to grandparents.`}</p></section>`;}
function sharesView(){if(role()!=="parent")return `<div class="head"><div><h1>Shared with family</h1><p class="lede">Only parents can share items.</p></div></div>`;sharesLoad();const xs=SHARES;
  return `<div class="head"><div><h1>Shared with family</h1><p class="lede">Every private link you've made. Links show only your child's first name and that one item.</p></div></div>
    ${xs==null?`<p class="muted">Loading…</p>`:xs.length?`<div class="list">${xs.map(s=>{const [st,cls]=shareState(s);const live=st.startsWith("Live");
      return `<div class="item shareitem"><div class="grow"><div class="t">${esc(s.title||"Shared item")} <span class="pill ${cls}">${esc(st)}</span></div><div class="s">${esc(s.first)} · shared ${esc(fmtDay(new Date(s.created)))} · ❤️ ${+s.hearts||0} · 🎤 ${+s.replies||0}${+s.hidden?` (${+s.hidden} hidden)`:""}</div>
        <div class="row sharebtns">${live?`<button class="btn btn-ghost btn-sm" data-act="shareResend" data-id="${esc(s.token)}">${ic("wa")}Send again</button>`:""}
        ${+s.replies?`<button class="btn btn-ghost btn-sm" data-act="shareReplies" data-id="${esc(s.token)}">Messages</button>`:""}
        ${s.active?`<button class="btn btn-ghost btn-sm" data-act="shareOff" data-id="${esc(s.token)}">Switch off</button>`:""}
        <button class="btn btn-ghost btn-sm" data-act="shareExtend" data-id="${esc(s.token)}">${live?"Extend to 30 days":"Turn on for 7 days"}</button>
        <button class="iconbtn" data-act="shareDel" data-id="${esc(s.token)}" aria-label="Delete link">${ic("trash")}</button></div></div></div>`;}).join("")}</div>`
      :`<section class="card panel"><p class="muted">Nothing shared yet. On the Progress page, tap the share button on a recording, picture or certificate.</p></section>`}`;}
const shareFind=t=>(SHARES||[]).find(s=>s.token===t);
A.shareResend=t=>{const s=shareFind(t);if(!s)return;const days=Math.max(1,Math.round((new Date(s.expires)-Date.now())/864e5));shareReady(s.first,s.kind,days,t);};
A.shareOff=async t=>{await shareRpc("ll_share_update",{p_token:t,p_active:false,p_days:null});toast("Link switched off");sharesLoad(true);};
A.shareExtend=async t=>{const s=shareFind(t);const live=s&&s.active&&new Date(s.expires)>new Date();await shareRpc("ll_share_update",{p_token:t,p_active:true,p_days:live?30:7});toast(live?"Link now works for 30 days":"Link switched on for 7 days");sharesLoad(true);};
A.shareDel=t=>{openModal("Delete this link?",`<p>The link stops working and its family messages are removed.</p>`,{danger:true,submitLabel:"Delete",done:"Deleted",onSubmit:async()=>{await shareRpc("ll_share_delete",{p_token:t});sharesLoad(true);}});};
A.shareReplies=async t=>{let rs=[];try{rs=await shareRpc("ll_share_replies",{p_token:t})||[];}catch(e){toast(e.message,true);return}
  const draw=()=>openModal("Messages from family",rs.length?`<div class="list">${rs.map(r=>`<div class="item"><div class="grow"><div class="t">${esc(r.from||"Family")} ${r.hidden?`<span class="pill p-mute">Hidden from your child</span>`:""}</div><div class="s">${esc(fmtDay(new Date(r.at)))}</div><audio controls preload="none" src="${esc(r.data)}"></audio></div><button type="button" class="btn btn-ghost btn-sm" data-mact="tog" data-id="${r.id}">${r.hidden?"Show":"Hide"}</button></div>`).join("")}</div>`:`<p class="muted">No voice messages yet.</p>`,
   {wide:true,noFocus:true,actions:{tog:async id=>{const r=rs.find(x=>String(x.id)===String(id));if(!r)return;await shareRpc("ll_share_hide",{p_id:+id,p_hidden:!r.hidden});r.hidden=!r.hidden;sharesLoad(true);draw();}}});
  draw();};
/* child: hearts and voice messages from family, in their garden */
let SHKID=null,shkAt=0;
function familyKidHTML(L){if(role()!=="student"||!window.LL_sb)return "";if(Date.now()-shkAt>60000){shkAt=Date.now();window.LL_sb.rpc("ll_share_kid").then(r=>{if(!r.error){SHKID=r.data;schedule();}},()=>{});}
  const d=SHKID;if(!d||(!(+d.hearts)&&!(d.replies||[]).length))return "";const rs=(d.replies||[]).slice(0,3);
  return `<section class="famcard"><div class="famh"><span class="famheart" aria-hidden="true">❤️</span><div class="grow"><b>Your family cheered for you!</b><span>${+d.hearts?`${+d.hearts} heart${+d.hearts===1?"":"s"}`:""}${+d.hearts&&rs.length?" · ":""}${(d.replies||[]).length?`${d.replies.length} voice message${d.replies.length===1?"":"s"}`:""}</span></div></div>
    ${rs.map(r=>`<div class="famrep"><span class="small"><b>${esc(r.from||"Family")}</b> · ${esc(r.title||"")}</span><audio controls preload="none" src="${esc(r.data)}"></audio></div>`).join("")}</section>`;}
