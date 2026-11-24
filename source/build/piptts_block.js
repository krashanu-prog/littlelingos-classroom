/* ================= Pip reads its replies aloud =================
   Pip's fixed lines are recorded in Pip's own voice. Replies from Pip's AI are new every time, so they are read by a
   free cloud voice (ask-pip "tts": Cloudflare Workers AI MeloTTS). Audio is cached so a repeat plays at once. */
const PTTS=new Map();let pttsQ=0,PTTS_OFF=false;
const pttsClean=t=>String(t||"").replace(/\*\*?|__|#+\s*/g,"").replace(/\s+/g," ").trim().slice(0,700);
async function pipTTS(text){const t=pttsClean(text);if(!t)return null;if(PTTS.has(t))return PTTS.get(t);
  if(PTTS_OFF||!window.LL_sb||!navigator.onLine)return null;
  const job=(async()=>{try{const call=window.LL_sb.functions.invoke("ask-pip",{body:{mode:"tts",text:t}});
      const {data,error}=await Promise.race([call,new Promise(r=>setTimeout(()=>r({error:{timeout:1}}),25000))]);
      if(error||!data||!data.audio){const st=error&&error.context&&error.context.status;if(st===404)PTTS_OFF=true;return null;}
      const bin=atob(data.audio),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
      return URL.createObjectURL(new Blob([u8],{type:data.type||"audio/mpeg"}));}catch(e){return null;}})();
  PTTS.set(t,job);const url=await job;if(!url)PTTS.delete(t);
  if(PTTS.size>40){const k=PTTS.keys().next().value;const old=PTTS.get(k);PTTS.delete(k);Promise.resolve(old).then(u=>{try{u&&URL.revokeObjectURL(u)}catch(e){}});}
  return url;}
/* read a reply; returns true when played. "my" lets a caller cancel (debate uses its own counter) */
async function pipRead(text,stillMine){const my=++pttsQ;const slow=setTimeout(()=>{if(my===pttsQ)toast("Pip is getting ready to read…");},1200);
  const url=await pipTTS(text);clearTimeout(slow);
  if(my!==pttsQ||(stillMine&&!stillMine()))return false;
  if(!url){toast("Pip can't read this aloud right now. Please try again in a moment.",true);return false;}
  return (await pipAudioPlay(url,false))===true;}
{const f=pipStop;pipStop=function(){pttsQ++;return f.apply(this,arguments);};}
/* Debate: Pip reads the whole reply (after its short recorded line), and the 🔊 button repeats the whole reply */
const dbAllRecorded=t=>{const ss=DB_SENT(t);return ss.length>0&&ss.every(s=>pvAny(pvKey(s)));};
function dbReadLine(x){if(!x.ai&&dbAllRecorded(x.t)){dbSay(x.t);return;}
  (async()=>{if(x.ai&&x.react){pipTTS(x.t);const p=dbSay(x.react),my=DBQ;await p;if(my!==DBQ)return;}
    dbHush();const me=DBQ;await pipRead(x.t,()=>me===DBQ);})();}
A.dbHear=i=>{const d=S.debate;if(!d)return;const x=d.log[+i];if(x)dbReadLine(x);};
dbPip=function(d,t,ai){const react=ai?(d.done?DB_L.reactVerdict:d.closing?DB_L.reactClose:dbPick(DB_L.react[d.st]||DB_L.react.Sprouts)):"";
  const x={who:"pip",t,ai:!!ai,react};d.log.push(x);if(d.talk)dbReadLine(x);};
/* Pip's report: read the summary, the good points, what to work on and the goal */
function dbrSpeech(r){if(r.kind==="seeds"){const fb=dbrSeedsFeedback(r.recs||[]);return [...fb.good,"Let's grow.",...fb.work.map(x=>x.point+". "+x.why)].join(" ");}
  const rep=r.rep||{};return [rep.overall,"What you did well.",...(rep.strengths||[]),"What to work on.",...(rep.improve||[]).map(x=>x.point+". "+(x.why||"")),rep.goal?"Your goal for next time: "+rep.goal:""].filter(Boolean).join(" ");}
A.dbrHear=()=>{const r=S.dbrView||(S.debate&&(S.debate.saved||null));if(!r){const d=S.debate;if(d&&d.rep)pipRead(dbrSpeech({kind:"debate",rep:d.rep}));return;}dbHush();pipRead(dbrSpeech(r));};
{const f=dbrHTML;dbrHTML=function(r,opts){const h=f.apply(this,arguments);if(r.rep&&r.rep.loading)return h;
  return h.replace('<div class="row dbr-acts noprint">','<div class="row dbr-acts noprint"><button class="btn btn-sun" data-act="dbrHear">'+ic("sound",18)+'Hear Pip read it</button>');};}
/* Ask Pip: a 🔊 button on each of Pip's answers */
{const f=pipClick;pipClick=function(e){const b=e.target.closest("[data-pip]");if(b&&b.dataset.pip==="hear"){const m=PIPST.chat[+b.dataset.id];if(m)pipRead(m.content);return;}return f.apply(this,arguments);};}
