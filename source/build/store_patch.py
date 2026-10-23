# ---- Storage rules ----
R('/* ================= events ================= */',open(W+'store_block.js').read()+'\n/* ================= events ================= */')
R('try{REC.stream=await navigator.mediaDevices.getUserMedia({audio:true});}','try{REC.stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true}});}')
R('mr.onstop=()=>{clearTimeout(REC.t);','mr.onstop=()=>{clearTimeout(REC.t);recPillOff();')
R('mr.start();REC.t=setTimeout(()=>{if(mr.state==="recording")mr.stop()},maxSec*1000);return true;','mr.start();recPill(maxSec);REC.t=setTimeout(()=>{if(mr.state==="recording")mr.stop()},maxSec*1000);return true;')
R('const ok=await startRec(30,(u)=>{rec=false;clip=u;draw();});','const ok=await startRec(recLimit(),(u)=>{rec=false;clip=u;draw();});')
R('const data=await shrinkImage(fr.result,1000);','const data=await shrinkTo(fr.result,1280,200000);')
R('let q=.85,out=sm.toDataURL("image/jpeg",q);while(out.length>230000&&q>.3){q-=.1;out=sm.toDataURL("image/jpeg",q);}','const out=await shrinkTo(sm.toDataURL("image/png"),1280,150000);')
R('data:d.clip,at:Date.now(),...(d.stars?{pipStars:d.stars}:{})}).then(()=>loadKp(S.uid,true))','data:d.clip,at:Date.now(),act:"drill",...(d.stars?{pipStars:d.stars}:{})}).then(()=>prunePractice(S.uid,"drill"))')
R('''<div class="field"><label for="rv-t">Comment</label>''','''<label class="row consentrow"><input type="checkbox" name="keep" ${c.keep?"checked":""}> <span><b>Keep</b> this one. It's never tidied away and goes first in highlight reels.</span></label>
   <div class="field"><label for="rv-t">Comment</label>''')
R('if(!t&&!s&&!sc&&!voice)throw userErr("Add a comment, sticker, score or voice note.");','if(!t&&!s&&!sc&&!voice&&!f.keep.checked&&!c.keep)throw userErr("Add a comment, sticker, score or voice note.");')
R('{kind:"pc",lid,item:iid,text:t,s,score:sc||null,voice:voice||c.voice||null,at:Date.now()}','{kind:"pc",lid,item:iid,text:t,s,score:sc||null,voice:voice||c.voice||null,keep:!!f.keep.checked,at:Date.now()}')
R('${kidBar()}\n  ${!uid?','${kidBar()}${memoriesHTML(L)}\n  ${!uid?')
R('[["academy","Academy"],["billing","Billing"],["rules","Rules"],["templates","Messages"],["privacy","Privacy"],["data","Import / export"]]','[["academy","Academy"],["billing","Billing"],["rules","Rules"],["templates","Messages"],["privacy","Privacy"],["storage","Storage"],["data","Import / export"]]')
R('  else if(tab==="privacy"){const ps=parentAccounts()','  else if(tab==="storage")body=storageHTML();\n  else if(tab==="privacy"){const ps=parentAccounts()')
R('''      const up=pipTry(()=>upiPending().length)||0;''','''      {const md=ymd(new Date()).slice(5);if((md>="05-15"&&md<="06-10")||md>="12-15"||md<="01-02")add("Holidays soon? Free Supabase databases pause after 7 days unused. Open the classroom once a week.","settings");}
      const up=pipTry(()=>upiPending().length)||0;''')
R('@media (prefers-reduced-motion:reduce)',open(W+'store.css').read()+'@media (prefers-reduced-motion:reduce)')
