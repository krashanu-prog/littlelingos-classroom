/* ================= Feature 4: Teach Pip (role reversal) ================= */
function teachWord(L){const uid=L&&L.uid;if(!uid)return null;const p=progOf(uid),wk=p.wk||{},taught=p.taught||{};
  const recent=doneList(uid).slice(0,4).map(x=>lessonById(x.lid)).filter(Boolean);const nx=nextLesson(uid,learnerCourses(L));if(nx)recent.push(nx);
  const pool=[];const seen=new Set();for(const l of recent){const c=D.courses[l.courseId];for(const [w,m] of parseVocab(l.vocab)){const k=wkKey(w);if(!k||seen.has(k))continue;seen.add(k);pool.push({w,m,lang:langOf(c),k});}}
  if(!pool.length)for(const [w,m] of (STARTER[L.stage]||STARTER.Seeds)){pool.push({w,m,lang:"en-IN",k:wkKey(w)});}
  const score=x=>{const o=wk[x.k]||{};return (+o.r||0)+(+o.m||0)+(+taught[x.k]||0)*3;};
  const skip=S.teachSkip||[];const order=pool.filter(x=>!skip.includes(x.k)).sort((a,b)=>score(a)-score(b));return order[0]||pool[0];}
const teachStars=uid=>Object.keys(progOf(uid).pts||{}).filter(k=>k[0]==="t").length;
A.teachPip=()=>{const L=myLearner();if(!L)return;if(timeUp()){render();return}const x=teachWord(L);if(!x){toast("Finish a lesson first, then teach Pip!",true);return}
  const seeds=(L.stage||"Seeds")==="Seeds",lim=recLimit(L),emo=emoOf(x.w);let clip=null,rec=false,done=false;
  const draw=()=>{if(done){openModal("Thank you, teacher!",`<div class="drill">${art("pip",110,"Pip")}<p class="lede" style="margin:0">Yay! Now I know <b>${esc(x.w)}</b>! You're a great teacher!</p><p class="bigstars">🎓</p><p class="small muted">You earned a Teacher star. Your teacher can listen to your lesson too.</p></div>`,{footerExtra:`<button type="button" class="btn btn-leaf" data-mact="again">Teach another word</button>`,actions:{again:()=>{closeModal();setTimeout(A.teachPip,200);}}});return}
    openModal("Teach Pip",`<div class="drill teachpip">${art("pip",96,"Pip")}<div class="bubble static">I don't know this word! Can you teach me?</div>
      ${emo?`<span class="dtemo" aria-hidden="true" style="font-size:3.4rem">${emo}</span>`:""}<b class="dword">${esc(x.w)}</b>
      <p class="small muted" style="margin:0">${seeds?(emo?"Point at the picture and say the word to Pip.":"Say the word to Pip and show what it means."):"Tell Pip what it means, and use it in a sentence."} Up to ${lim} seconds.</p>
      ${canSpeak()?`<button type="button" class="btn btn-ghost btn-sm" data-mact="hear">${ic("sound")}How do I say it?</button>`:""}
      ${canRecord()?`<button type="button" class="btn ${rec?"btn-danger":"btn-sun"} btn-big" data-mact="rec">${rec?"■ Stop":clip?"🎤 Teach again":"🎤 Teach Pip"}</button>${clip?`<audio controls src="${esc(clip)}"></audio>`:""}`:`<p class="small">This device can't record, so teach Pip out loud, then tap “I taught Pip”.</p>`}</div>`,
     {noFocus:true,submitLabel:canRecord()?"Send my lesson to Pip":"I taught Pip",footerExtra:`<button type="button" class="btn btn-ghost" data-mact="other">Another word</button>`,
      actions:{hear:()=>say(x.w,x.lang),other:()=>{S.teachSkip=[...(S.teachSkip||[]),x.k].slice(-6);closeModal();setTimeout(A.teachPip,150);},
        rec:async()=>{if(rec){stopRec();return}const ok=await startRec(lim,u=>{rec=false;clip=u;draw();});if(ok){rec=true;draw();}}},
      onSubmit:async()=>{if(canRecord()&&!clip)throw userErr("Teach Pip first: tap the microphone and talk.");
        const ts=Date.now();if(clip)await S.db.collection(`kp/${S.uid}/x`).doc().set({kind:"audio",title:`Teaching Pip “${x.w}”`,data:clip,at:ts,act:"teachpip",word:x.w});
        const p=progOf(S.uid);await earn({pts:{["t"+ts.toString(36)]:1},taught:{[x.k]:(+((p.taught||{})[x.k])||0)+1}});wkLog(x.w,true);
        if(clip)prunePractice(S.uid,"teachpip");done=true;setTimeout(draw,250);}});};
  draw();};
