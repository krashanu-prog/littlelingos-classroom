/* ================= Activity bank: find homework by age group and skill ================= */
const BANK_SKILLS=[["phonics","Phonics"],["vocabulary","Vocabulary"],["speaking","Speaking"],["listening","Listening"],["reading","Reading"],["writing","Writing"],["grammar","Grammar"]];
const bankSkill=k=>(BANK_SKILLS.find(x=>x[0]===k)||[k,k])[1];
let bankSub=false;
function bankLoad(){
  if(bankSub||!S.db)return; bankSub=true;
  try{S.db.collection("bank").onSnapshot(snap=>{const o={};for(const d of snap.docs)o[d.id]=d.data();D.bank=o;bankRender();},()=>{D.bank=D.bank||{};});}catch(e){D.bank=D.bank||{};}
}
function bankAll(){
  const open=(window.LL_BANK||[]).map(x=>({...x,src:"open"}));
  const ours=entries(D.bank||{}).map(x=>({...x,src:"academy"}));
  return ours.sort((a,b)=>(b.at||0)-(a.at||0)).concat(open);
}
function bankStageFor(ids){
  const ls=(ids&&ids.length?ids.map(id=>D.learners[id]).filter(Boolean):scopedLearners());
  const st=[...new Set(ls.map(L=>L.stage).filter(Boolean))];
  return st.length===1?st[0]:"";
}
function bankText(x){
  const qs=(x.questions||[]).filter(Boolean);
  const ins=String(x.instructions||""), dup=ins.trim().toLowerCase().startsWith(String(x.title||"").trim().toLowerCase());
  return `${dup?"":x.title+(x.minutes?` (about ${x.minutes} minutes)`:"")+"\n"}${ins}${qs.length?`\n\nQuestions:\n${qs.map((q,i)=>`${i+1}. ${q}`).join("\n")}`:""}`;
}
function bankItemHTML(x){
  const mine=x.src==="academy"&&(x.by===S.uid||S.isOwner);
  return `<div class="bk-item"><div class="grow"><div class="bk-t">${esc(x.title)}</div>
    <div class="bk-meta"><span class="pill">${esc(x.stage||"Any age")}</span><span class="pill">${esc(bankSkill(x.skill))}</span>${x.minutes?`<span>${x.minutes} min</span>`:""}${x.src==="academy"?`<span class="pill bk-ours">Our academy</span>`:""}</div>
    <div class="bk-d">${esc(String(x.instructions||"").slice(0,170))}${String(x.instructions||"").length>170?"…":""}${(x.questions||[]).length?` <i>· ${(x.questions||[]).length} question${x.questions.length===1?"":"s"}</i>`:""}</div></div>
    <div class="bk-acts"><button type="button" class="btn btn-ghost btn-sm" data-bk="add" data-id="${esc(x.src+":"+x.id)}">Add</button>${mine?`<button type="button" class="iconbtn" data-bk="del" data-id="${esc(x.id)}" aria-label="Remove from our bank">${ic("x")}</button>`:""}</div></div>`;
}
function bankRender(){
  const box=document.getElementById("bk-list"); if(!box)return;
  const st=(document.getElementById("bk-stage")||{}).value||"", sk=(document.getElementById("bk-skill")||{}).value||"", q=((document.getElementById("bk-q")||{}).value||"").trim().toLowerCase();
  const xs=bankAll().filter(x=>(!st||x.stage===st)&&(!sk||x.skill===sk)&&(!q||(x.title+" "+x.instructions+" "+(x.questions||[]).join(" ")).toLowerCase().includes(q)));
  box.innerHTML=xs.length?xs.slice(0,60).map(bankItemHTML).join(""):`<p class="small muted" style="margin:8px 0">Nothing matches yet. Try another skill or age group, or save your own activity to the bank.</p>`;
  const n=document.getElementById("bk-n"); if(n)n.textContent=`${xs.length} activit${xs.length===1?"y":"ies"}`;
}
function bankPickerHTML(h){
  bankLoad();
  const st=h&&h.stage||bankStageFor(h&&h.learnerIds);
  return `<details class="bankbox" ${h&&h.id?"":"open"}><summary><b>Find an activity</b> <span class="small muted">by age group and skill</span></summary>
  <div class="bk-filters"><div class="field"><label for="bk-stage">Age group</label><select id="bk-stage">${opt("","All ages",!st)}${STAGES.map(s=>opt(s.v,`${s.v} · ${s.ages}`,s.v===st)).join("")}</select></div>
  <div class="field"><label for="bk-skill">Skill</label><select id="bk-skill">${opt("","All skills",!(h&&h.skill))}${BANK_SKILLS.map(([v,t])=>opt(v,t,h&&h.skill===v)).join("")}</select></div>
  <div class="field"><label for="bk-q">Search</label><input id="bk-q" type="search" placeholder="e.g. rhyme, past tense"></div></div>
  <p class="small muted" style="margin:0"><span id="bk-n"></span>. Press <b>Add</b> to put an activity into the homework. You can edit the text before you set it.</p>
  <div id="bk-list" class="banklist"></div>
  <div class="bk-words"><div class="field" style="flex:1"><label for="bk-w">Make a word activity</label><input id="bk-w" type="text" maxlength="200" placeholder="Type words, e.g. brave, gentle, curious"><span class="hint">Meanings come from the free, open Datamuse word API (WordNet definitions). Check they suit your learner and edit if needed.</span></div><button type="button" class="btn btn-ghost btn-sm" data-bk="words">Make it</button></div>
  <div class="row"><button type="button" class="btn btn-ghost btn-sm" data-bk="save">Save this homework to our bank</button><span class="small muted">Saves the title and instructions above for other trainers, using the age group and skill chosen here.</span></div>
  <input type="hidden" name="bkids" value="${esc((h&&h.bankIds||[]).join(","))}"><input type="hidden" name="bkstage" value="${esc(h&&h.stage||"")}"><input type="hidden" name="bkskill" value="${esc(h&&h.skill||"")}">
  </details>`;
}
function bankAppend(form,text,meta){
  const t=form.querySelector("#hw-title"), ins=form.querySelector("#hw-ins");
  if(t&&!t.value.trim()&&meta&&meta.title)t.value=meta.title.slice(0,100);
  if(ins){ins.value=(ins.value.trim()?ins.value.trim()+"\n\n":"")+text; ins.value=ins.value.slice(0,4000); ins.dispatchEvent(new Event("input",{bubbles:true}));}
  if(meta){const ids=form.querySelector('[name="bkids"]');if(ids&&meta.id){const s=new Set(ids.value.split(",").filter(Boolean));s.add(meta.id);ids.value=[...s].join(",");}
    const st=form.querySelector('[name="bkstage"]'),sk=form.querySelector('[name="bkskill"]');if(st&&meta.stage&&!st.value)st.value=meta.stage;if(sk&&meta.skill&&!sk.value)sk.value=meta.skill;}
}
async function bankWords(form,btn){
  const raw=(form.querySelector("#bk-w")||{}).value||"";
  const words=[...new Set(raw.split(/[,\n;]+/).map(w=>w.trim().toLowerCase()).filter(w=>/^[a-z][a-z' -]{0,30}$/.test(w)))].slice(0,10);
  if(!words.length){toast("Type one or more English words, separated by commas.");return;}
  btn.disabled=true;const old=btn.textContent;btn.textContent="Looking up…";
  const st=(form.querySelector("#bk-stage")||{}).value||bankStageFor();
  const got=[],miss=[];
  const POS={n:"noun",v:"verb",adj:"adjective",adv:"adverb"};
  await Promise.all(words.map(async w=>{try{
    const r=await fetch("https://api.datamuse.com/words?md=d&max=1&sp="+encodeURIComponent(w));if(!r.ok)throw 0;const j=await r.json();
    const hit=(j||[]).find(x=>String(x.word||"").toLowerCase()===w&&(x.defs||[]).length);if(!hit)throw 0;
    const [p,...rest]=String(hit.defs[0]).split("\t");let syn=[];
    if(st!=="Seeds"){try{const s2=await fetch("https://api.datamuse.com/words?max=3&rel_syn="+encodeURIComponent(w)).then(x=>x.json());syn=(s2||[]).map(x=>x.word).filter(Boolean).slice(0,3);}catch{}}
    got.push({w,pos:POS[p]||p,def:rest.join(" ").replace(/^\s+/,""),syn});}catch{miss.push(w)}}));
  btn.disabled=false;btn.textContent=old;
  got.sort((a,b)=>words.indexOf(a.w)-words.indexOf(b.w));
  const list=got.map((x,i)=>`${i+1}. ${x.w}${x.pos?` (${x.pos})`:""}: ${x.def}${x.syn&&x.syn.length?`\n   Similar words: ${x.syn.join(", ")}`:""}`).join("\n")+(miss.length?`\n${miss.map(w=>`• ${w}: ask your teacher what it means`).join("\n")}`:"");
  const task=st==="Seeds"?"Say each word out loud with a grown-up. Draw a picture for each one."
    :st==="Blooms"?"Write one sentence for each word. Then write a short paragraph (5–6 sentences) that uses at least three of the words, and find a synonym for two of them."
    :"Read each word and its meaning. Write your own sentence for each word and draw a picture for your favourite one.";
  bankAppend(form,`New words\n${list}\n\n${task}`,{title:"New words: "+words.slice(0,3).join(", ")+(words.length>3?"…":""),skill:"vocabulary",stage:st});
  toast(got.length?`Added ${got.length} word${got.length===1?"":"s"}${miss.length?`. Not found: ${miss.join(", ")}`:""}.`:"Couldn't find those words. Check the spelling.");
}
async function bankSave(form){
  const title=((form.querySelector("#hw-title")||{}).value||"").trim(), ins=((form.querySelector("#hw-ins")||{}).value||"").trim();
  const st=(form.querySelector("#bk-stage")||{}).value, sk=(form.querySelector("#bk-skill")||{}).value;
  if(!title||!ins){toast("Write a title and instructions first.");return;}
  if(!st||!sk){toast("Choose an age group and a skill above, so others can find it.");return;}
  try{await S.db.collection("bank").doc().set({stage:st,skill:sk,title:title.slice(0,100),instructions:ins.slice(0,4000),questions:[],minutes:null,by:S.uid,byName:myName()||"",at:Date.now()});toast("Saved to our bank. Other trainers can use it now.");}
  catch(e){toast("Couldn't save to the bank. Ask the admin to check access.");}
}
if(!window.__bkWired){window.__bkWired=true;
  document.addEventListener("input",e=>{if(e.target&&e.target.id==="bk-q")bankRender();});
  document.addEventListener("change",e=>{const t=e.target;if(!t)return;
    if(t.id==="bk-stage"||t.id==="bk-skill"){bankRender();const f=t.closest("form");if(f){const h=f.querySelector(t.id==="bk-stage"?'[name="bkstage"]':'[name="bkskill"]');if(h&&t.value)h.value=t.value;}}
    if(t.name==="hwl"){const f=t.closest("form"),sel=f&&f.querySelector("#bk-stage");if(sel){const ids=[...f.querySelectorAll('input[name="hwl"]:checked')].map(x=>x.value);const st=bankStageFor(ids);if(st&&sel.value!==st){sel.value=st;bankRender();}}}});
  document.addEventListener("keydown",e=>{const t=e.target;if(e.key==="Enter"&&t&&(t.id==="bk-q"||t.id==="bk-w")){e.preventDefault();if(t.id==="bk-w"){const b=t.closest("form").querySelector('[data-bk="words"]');if(b)b.click();}}});
  document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-bk]");if(!b)return;e.preventDefault();const form=b.closest("form");if(!form)return;
    const k=b.dataset.bk;
    if(k==="add"){const [src,id]=b.dataset.id.split(/:(.+)/);const x=bankAll().find(y=>y.src===src&&y.id===id);if(!x)return;bankAppend(form,bankText(x),{title:x.title,id:(src==="open"?"o:":"a:")+id,stage:x.stage,skill:x.skill});b.textContent="Added ✓";setTimeout(()=>{b.textContent="Add"},1500);}
    else if(k==="words")bankWords(form,b);
    else if(k==="save")bankSave(form);
    else if(k==="del"){const id=b.dataset.id;if(!confirmDel(b))return;S.db.doc("bank/"+id).delete().then(()=>toast("Removed from our bank")).catch(()=>toast("Couldn't remove it."));}
  });
}
function confirmDel(b){if(b.dataset.sure)return true;b.dataset.sure="1";b.setAttribute("aria-label","Press again to remove");b.classList.add("bk-sure");setTimeout(()=>{delete b.dataset.sure;b.classList.remove("bk-sure");},3000);toast("Press × again to remove it from our bank.");return false;}
