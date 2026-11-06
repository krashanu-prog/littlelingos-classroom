/* ================= Adaptive games =================
   Every game has 5 levels, remembered per child. Right answer: the next question is one level harder.
   Wrong answer: one level easier, and the next questions practise the same word or skill in a new way
   until the child gets it right (up to 3 tries, then we move on and it comes back later). */
const AD_MAX_TRIES=3;
const adKey=t=>"ll-adl-"+(S.uid||"")+"-"+t;
/* levels live on the child's account (progress/<uid>.adl), with this device as a backup; admin previews stay on the device */
const adOnAccount=()=>realRole()==="student"&&!!S.uid&&!!S.db;
function adGet(t){const a=adOnAccount()?((progOf(S.uid)||{}).adl||{})[t]:null;if(+a>=1&&+a<=5)return +a;
  try{const v=+localStorage.getItem(adKey(t));if(v>=1&&v<=5)return v;}catch{}return agStage()==="Seeds"?1:2;}
let adPend={},adT=null;
function adSet(t,v){try{localStorage.setItem(adKey(t),String(v))}catch{}
  if(!adOnAccount())return;const p=D.progress[S.uid]=D.progress[S.uid]||{};p.adl=p.adl||{};if(p.adl[t]===v)return;p.adl[t]=v;adPend[t]=v;clearTimeout(adT);adT=setTimeout(adFlush,1500);}
function adFlush(){const x=adPend;adPend={};if(!Object.keys(x).length||!S.db||!S.uid)return;upsert("progress/"+S.uid,{adl:x}).catch(()=>{});}
addEventListener("pagehide",adFlush);
/* parents and teachers see the levels in the child's info card */
function adLevelsHTML(L){const a=(progOf(L&&L.uid)||{}).adl||{};const ks=Object.keys(a).filter(k=>+a[k]>=1);if(!ks.length)return "";
  const name=k=>{const [x,st]=k.split("-");return x==="en"?`Word power (${st})`:x==="gk"?`GK quiz (${st})`:(AG_TITLE[k]||k);};
  return `<div class="adlv"><p class="small"><b>Game levels</b> (1 = easiest, 5 = hardest)</p><div class="pvchips">${ks.sort().map(k=>`<span class="pvchip">${esc(name(k))} · <b>${+a[k]}/5</b></span>`).join("")}</div></div>`;}
const adLc=w=>String(w||"").toLowerCase();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
/* split a list into 5 difficulty bands by a score */
function adBands(items,score){const s=items.map(x=>[x,score(x)]).sort((a,b)=>a[1]-b[1]);const m=new Map();s.forEach(([x],i)=>m.set(x,1+Math.floor(i*5/Math.max(1,s.length))));return m;}
function adPickBand(items,band,d,asked,r,key){key=key||(x=>x);const fresh=items.filter(x=>!asked.has(key(x)));const src=fresh.length?fresh:items;
  for(const dd of [0,1,-1,2,-2,3,-3,4,-4]){const c=src.filter(x=>band.get(x)===d+dd);if(c.length)return c[Math.floor(r()*c.length)];}return src[Math.floor(r()*src.length)];}
/* distractors: at higher levels they look and sound more like the answer */
function adNear(target,others,n,d,r,key){key=key||(x=>x);const t=adLc(key(target));
  if(d<4)return pickN(others,n,r);
  const sc=y=>{const s=adLc(key(y));let v=0;if(s[0]===t[0])v+=3;v-=Math.abs(s.length-t.length);if(s.slice(-2)===t.slice(-2))v+=2;return v+r();};
  return others.slice().sort((a,b)=>sc(b)-sc(a)).slice(0,n);}
const adMissPos=new Map();
const adOpts=d=>agStage()==="Seeds"?(d<=1?2:d<=3?3:4):(d<=1?3:4);
/* ---------- word games: quiz, listen, daily (meanings, reverse, listening, spelling) ---------- */
function adWordQ(x,pool,k,d,r){const o=adOpts(d)-1,others=adNear(x,pool.filter(y=>y.m!==x.m&&adLc(y.w)!==adLc(x.w)),o,d,r,y=>y.w);
  if(k==="spell"&&!canSpell(x.w))k="rev";
  if(k==="listen"&&!canSpeak())k="mean";
  if(k==="listen")return {k,say:x.w,wk:x.w,lang:x.lang,prompt:"Listen! Which word did Pip say?",opts:shuffle([x,...others],r).map(y=>y.w),ans:x.w};
  if(k==="rev")return {k,say:x.w,wk:x.w,lang:x.lang,prompt:`Which word means “${pMean(x)}”?`,opts:shuffle([x,...others],r).map(y=>y.w),ans:x.w};
  if(k==="spell"){const bad=misspell(adLc(x.w),r);if(bad.length>=o)return {k,say:x.w,wk:x.w,lang:x.lang,prompt:`Which is the right spelling of the word that means “${pMean(x)}”?`,opts:shuffle([adLc(x.w),...bad.slice(0,o)],r),ans:adLc(x.w)};}
  return {k:"mean",say:x.w,wk:x.w,lang:x.lang,prompt:`What does “${x.w}” mean?`,...mQ(shuffle([x,...others],r),x)};}
const AD_WORD_KINDS={quiz:{Seeds:["mean","mean","mean","rev","rev"],Sprouts:["mean","mean","rev","rev","rev"],Blooms:["mean","rev","rev","spell","spell"]},
  listen:{Seeds:["listen","listen","listen","listen","listen"],Sprouts:["listen","listen","listen","listen","listen"],Blooms:["listen","listen","listen","spell","spell"]}};
const AD_RETRY_KINDS=["mean","listen","rev","spell"];
/* ---------- each game: how to choose a topic and make a question at a level ---------- */
function adGame(type,pool){const st=agStage();
  if(type==="quiz"||type==="listen"){const items=pool.filter(x=>x.m),band=adBands(items,x=>adLc(x.w).replace(/ /g,"").length+(x.w.includes(" ")?4:0)+(x.bank?0:-1));
    return {topic:(d,asked,r)=>adPickBand(items,band,d,asked,r,x=>adLc(x.w)),key:x=>adLc(x.w),
      make:(x,d,r,att)=>{const ks=AD_WORD_KINDS[type][st]||AD_WORD_KINDS[type].Sprouts;let k=ks[d-1];if(att)k=AD_RETRY_KINDS.filter(y=>y!==k&&(y!=="spell"||st==="Blooms"))[(att-1)%3];return adWordQ(x,items,k,d,r);}};}
  if(type==="pic"){const ws=Object.keys(AG.pic),band=adBands(ws,w=>w.replace(/ /g,"").length+(w.includes(" ")?3:0));
    return {topic:(d,asked,r)=>adPickBand(ws,band,d,asked,r),key:w=>w,make:(w,d,r)=>{const o=adNear(w,ws.filter(x=>x!==w),adOpts(d)-1,d,r);
      return {k:"pic",say:`Find the ${w}`,wk:w,auto:1,big:1,prompt:`Find the ${w}!`,opts:shuffle([w,...o],r).map(x=>AG.pic[x]),ans:AG.pic[w]};}};}
  if(type==="sound"){const em=w=>AG.pic[w],snd=Object.fromEntries(AG.sounds),fact=a=>AG.facts.filter(f=>f[1]===a),home=a=>Object.keys(AG.homes).find(h=>AG.homes[h].includes(a)),allA=[...new Set([...AG.sounds.map(x=>x[0]),...AG.facts.map(x=>x[1]),...Object.keys(AG.legs)])].filter(a=>em(a));
    const subs=a=>[snd[a]&&"who",snd[a]&&"what",home(a)&&"home",fact(a).length&&"fact",AG.legs[a]!=null&&"legs"].filter(Boolean);
    const lvOfSub={who:1,what:2,home:3,fact:4,legs:5};
    return {topic:(d,asked,r)=>{const c=allA.filter(a=>!asked.has(a)&&subs(a).some(s=>lvOfSub[s]===d));const src=c.length?c:allA.filter(a=>!asked.has(a));const s2=src.length?src:allA;return s2[Math.floor(r()*s2.length)];},key:a=>a,
      make:(a,d,r,att)=>{const ss=subs(a);let s=ss.slice().sort((x,y)=>Math.abs(lvOfSub[x]-d)-Math.abs(lvOfSub[y]-d))[0];if(att)s=ss[(ss.indexOf(s)+att)%ss.length];const o=adOpts(d)-1;
        if(s==="who"){const ot=pickN(AG.sounds.filter(x=>x[0]!==a),o,r).map(x=>x[0]);return {k:"sound",say:`Who says ${snd[a]}?`,wk:a,auto:1,big:1,prompt:`Who says “${snd[a]}”?`,opts:shuffle([a,...ot],r).map(em),ans:em(a)};}
        if(s==="what"){const ot=pickN(AG.sounds.filter(x=>x[0]!==a),o,r).map(x=>x[1]);return {k:"sound",say:`What does the ${a} say?`,wk:a,auto:1,prompt:`What does the ${a} say? ${em(a)}`,opts:shuffle([snd[a],...ot],r),ans:snd[a]};}
        if(s==="home"){const h=home(a),ot=Object.keys(AG.homes).filter(x=>x!==h).flatMap(x=>AG.homes[x]).filter(x=>!AG.homes[h].includes(x)&&!(h==="sky"&&["duck","hen"].includes(x)));return {k:"sound",say:AG.homeQ[h],wk:a,auto:1,big:1,prompt:AG.homeQ[h],opts:shuffle([a,...pickN(ot,o,r)],r).map(em),ans:em(a)};}
        if(s==="fact"){const fs=fact(a),[q]=fs[Math.floor(r()*fs.length)],ot=pickN(allA.filter(x=>x!==a&&!AG.facts.some(f=>f[0]===q&&f[1]===x)),o,r);return {k:"sound",say:q,wk:a,auto:1,big:1,prompt:q,opts:shuffle([a,...ot],r).map(em),ans:em(a)};}
        const n=AG.legs[a],word=n?AG.nums[n-1]:"none",pl=["none","two","four","six","eight"].filter(x=>x!==word);return {k:"sound",say:`How many legs does a ${a} have?`,wk:a,auto:1,prompt:`How many legs does a ${a} have? ${em(a)}`,opts:shuffle([word,...pickN(pl,o,r)],r),ans:word};}};}
  if(type==="colour"){const cw=AG.colours.map(x=>x[0]),hex=Object.fromEntries(AG.colours),objs=Object.entries(AG.objc),near={red:["pink","orange","purple"],pink:["red","purple","white"],purple:["pink","blue","red"],blue:["purple","green","black"],green:["blue","yellow","brown"],yellow:["orange","white","green"],orange:["red","yellow","brown"],brown:["orange","black","red"],black:["brown","blue","purple"],white:["yellow","pink","blue"]};
    const subsFor=c=>["swatch",objs.some(o=>o[1]===c)&&"obj",objs.some(o=>o[1]===c)&&"which","near",AG.mix.some(m=>m[2]===c)&&"mix"].filter(Boolean);const lv={swatch:1,obj:2,which:3,near:4,mix:5};
    return {topic:(d,asked,r)=>{const c=cw.filter(x=>!asked.has(x)&&subsFor(x).some(s=>lv[s]===d));const s2=c.length?c:cw;return s2[Math.floor(r()*s2.length)];},key:c=>c,
      make:(c,d,r,att)=>{const ss=subsFor(c);let s=ss.slice().sort((x,y)=>Math.abs(lv[x]-d)-Math.abs(lv[y]-d))[0];if(att)s=ss[(ss.indexOf(s)+att)%ss.length];const o=adOpts(d)-1;
        const wrong=d>=4?near[c].slice(0,o):pickN(cw.filter(x=>x!==c),o,r);
        if(s==="swatch"||s==="near")return {k:"colour",say:"What colour is this?",wk:c,auto:1,prompt:"What colour is this?",vis:`<div class="agswatch" style="background:${hex[c]}" role="img" aria-label="A colour"></div>`,opts:shuffle([c,...wrong],r),ans:c};
        if(s==="obj"){const os=objs.filter(x=>x[1]===c),[e]=os[Math.floor(r()*os.length)];return {k:"colour",say:"What colour is this?",wk:c,auto:1,prompt:"What colour is this?",vis:`<div class="agcount" role="img" aria-label="A picture">${e}</div>`,opts:shuffle([c,...wrong],r),ans:c};}
        if(s==="which"){const os=objs.filter(x=>x[1]===c),[e]=os[Math.floor(r()*os.length)],ot=pickN(objs.filter(x=>x[1]!==c&&(d<4||near[c].includes(x[1]))).map(x=>x[0]),o,r);return {k:"colour",say:`Which one is ${c}?`,wk:c,auto:1,big:1,prompt:`Which one is ${c}?`,opts:shuffle([e,...ot],r),ans:e};}
        const [a,b]=AG.mix.find(m=>m[2]===c);return {k:"colour",say:`Mix ${a} and ${b}. What colour do you get?`,wk:c,auto:1,prompt:`Mix ${a} and ${b}. What colour do you get?`,opts:shuffle([c,...pickN(cw.filter(x=>x!==c&&x!==a&&x!==b),o,r)],r),ans:c};}};}
  if(type==="count"){const rng5=[[1,3],[2,5],[4,7],[5,9],[7,10]];
    return {topic:(d,asked,r)=>{const [a,b]=rng5[d-1];const c=[];for(let n=a;n<=b;n++)if(!asked.has(n))c.push(n);const s=c.length?c:[a,b];return s[Math.floor(r()*s.length)];},key:n=>n,
      make:(n,d,r,att)=>{const t=AG.things[Math.floor(r()*AG.things.length)],o=adOpts(d)-1;const cand=(d>=4?[n-1,n+1,n-2,n+2]:[n-2,n+2,n-3,n+3,n-1,n+1]).filter(x=>x>=1&&x<=10&&x!==n);const near=(d>=4?cand:shuffle(cand,r)).slice(0,o);
        return {k:"count",say:"How many can you count?",wk:AG.nums[n-1],auto:1,prompt:"How many can you count?",vis:`<div class="agcount" role="img" aria-label="Some pictures to count">${t.repeat(n)}</div>`,opts:shuffle([n,...near],r).map(x=>AG.nums[x-1]),ans:AG.nums[n-1]};}};}
  if(type==="build"){const all=agSentences(),len=s=>s.split(" ").length,lvOf=s=>len(s)<=4?1:len(s)===5?2:len(s)===6?3:len(s)===7?4:5;
    return {topic:(d,asked,r)=>{const c=all.filter(s=>!asked.has(s)&&lvOf(s)===d);const s2=c.length?c:all.filter(s=>!asked.has(s));const s3=s2.length?s2:all;return s3[Math.floor(r()*s3.length)];},key:s=>s,
      make:(s,d,r,att,asked)=>{if(att===2){const c=all.filter(x=>x!==s&&lvOf(x)===lvOf(s)&&!asked.has(x));if(c.length)s=c[Math.floor(r()*c.length)];}
        const words=s.split(" ");let tiles=shuffle(words.map((w,i)=>({w,i})),r);if(tiles.every((t,i)=>t.i===i))tiles=tiles.reverse();
        return {k:"build",say:s,wk:"",prompt:att?"Let's try one like that again. Tap the words in order.":"Tap the words in the right order.",tiles,ans:s,opts:[s,"__"],chosen:[],nospeak:1};}};}
  if(type==="miss"){const ws=pool.filter(x=>/^[a-z]{3,12}$/i.test(x.w)),band=adBands(ws,x=>x.w.length);
    return {topic:(d,asked,r)=>adPickBand(ws,band,d,asked,r,x=>adLc(x.w)),key:x=>adLc(x.w),
      make:(x,d,r,att)=>{const w=adLc(x.w),V="aeiou";let pos=[...Array(w.length).keys()].filter(i=>i>0&&i<w.length-1||w.length<=3&&i===1);if(d>=4){const vp=pos.filter(i=>V.includes(w[i]));if(vp.length)pos=vp;}
        const prev=adMissPos.get(w);const pp=pos.length>1?pos.filter(k=>k!==prev):pos;const i=pp[Math.floor(r()*pp.length)],c=w[i];adMissPos.set(w,i);const L=(d>=4&&V.includes(c)?V:"aeiourstlnmbcdgp").split("").filter(y=>y!==c);const o=pickN(L,adOpts(d)-1,r);
        return {k:"miss",say:w,wk:w,prompt:`Which letter is missing? (${meanFor(x.w,x.m)})`,vis:`<p class="agword">${esc(w.slice(0,i))}<span class="agblank">_</span>${esc(w.slice(i+1))}</p>`,opts:shuffle([c,...o],r),ans:c,big:1,nospeak:1};}};}
  if(type==="odd"){const cats=Object.keys(AG.odd),near={feelings:["food","weather"],weather:["feelings","colours"],places:["jobs","transport"],jobs:["places","animals"],animals:["food","body"],food:["animals","colours"],past:["feelings","jobs"],colours:["weather","food"],body:["animals","transport"],transport:["places","body"]};
    return {topic:(d,asked,r)=>{const c=cats.filter(x=>!asked.has(x));const s=c.length?c:cats;return s[Math.floor(r()*s.length)];},key:a=>a,
      make:(a,d,r)=>{const n=d<=2?2:d<=4?3:4,bs=d>=4?near[a]:cats.filter(x=>x!==a),b=bs[Math.floor(r()*bs.length)];const same=pickN(AG.odd[a],n,r),odd=AG.odd[b][Math.floor(r()*AG.odd[b].length)];
        return {k:"odd",say:odd,wk:odd,prompt:"Which word does not belong?",opts:shuffle([...same,odd],r),ans:odd,why:`The others are all ${AG.oddLabel[a]}.`,nospeak:1};}};}
  if(type==="cloze"){const all=agCloze(),band=adBands(all,x=>x[0].length+(x[1].length>60?2:0)),words=[...new Set(all.map(x=>x[0]))];
    return {topic:(d,asked,r)=>adPickBand(all,band,d,asked,r,x=>adLc(x[0])),key:x=>adLc(x[0]),
      make:(x,d,r,att)=>{const [w,s]=x;const bw=pool.find(y=>adLc(y.w)===adLc(w));if(att===1&&bw)return adWordQ(bw,pool,"mean",d,r);if(att===2&&bw)return adWordQ(bw,pool,"rev",d,r);
        const re=new RegExp("(^|[^a-z])"+w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(?=[^a-z]|$)","i"),o=adNear(w,words.filter(y=>adLc(y)!==adLc(w)),adOpts(d)-1,d,r);
        return {k:"cloze",say:w,wk:w,prompt:"Choose the word that fits the gap.",vis:`<p class="agsent">${esc(s.replace(re,(m,p1)=>p1+"_____"))}</p>`,opts:shuffle([w,...o],r),ans:w,nospeak:1,full:s};}};}
  if(type==="fix"){const grp=ok=>/doesn't/.test(ok)?["does",1]:/^Yesterday we/.test(ok)?["past",1]:/when it started to rain/.test(ok)?["were",2]:/^I have \w+ it already/.test(ok)?["perfect",2]:/forgot their/.test(ok)?["their",2]:/ than /.test(ok)&&/ is /.test(ok)?["compare",2]:/fewer/.test(ok)?["fewer",3]:/ its /.test(ok)?["its",3]:/^Each of the/.test(ok)?["each",4]:/look forward to/.test(ok)?["forward",4]:/have (lived|been waiting) (since|for)/.test(ok)?["sincefor",4]:/^(The news|Mathematics|The furniture|The information|My luggage|The advice|The scenery|Physics|The equipment|Her hair)/.test(ok)?["uncount",4]:["mixed",5];
    const items=AG.fix.map(x=>({ok:x[0],bad:x[1],g:grp(x[0])[0],lv:grp(x[0])[1]}));const band=new Map(items.map(x=>[x,x.lv]));
    return {topic:(d,asked,r)=>adPickBand(items,band,d,asked,r,x=>x.ok),key:x=>x.ok,
      make:(x,d,r,att,asked)=>{if(att){const c=items.filter(y=>y.g===x.g&&y.ok!==x.ok&&!asked.has(y.ok));if(c.length)x=c[Math.floor(r()*c.length)];}asked.add(x.ok);
        const bad=d<=1?pickN(x.bad,2,r):x.bad;return {k:"fix",say:x.ok,wk:"",prompt:att?"Same rule, another one: which sentence is correct?":"Which sentence is correct?",opts:shuffle([x.ok,...bad],r),ans:x.ok,nospeak:1,long:1};}};}
  if(type==="bee"){const ws=pool.filter(x=>/^[a-z]{4,15}$/i.test(x.w)),band=adBands(ws,x=>x.w.length);
    return {topic:(d,asked,r)=>adPickBand(ws,band,d,asked,r,x=>adLc(x.w)),key:x=>adLc(x.w),
      make:(x,d,r,att)=>({k:"bee",say:x.w,wk:x.w,auto:1,prompt:att?`Have another go. Spell the word that means “${pMean(x)}”.`:`Spell the word that means “${pMean(x)}”.`,ans:adLc(x.w),opts:[adLc(x.w),"__"],typed:""})};}
  return null;}
/* daily challenge and speed round mix the age group's games */
const AD_MIX={daily:{Seeds:["pic","count","colour","sound"],Sprouts:["miss","odd","quiz","build"],Blooms:["cloze","fix","quiz","bee"]},speed:{Blooms:["cloze","fix","quiz"],Sprouts:["miss","odd","quiz"],Seeds:["pic","count","colour"]}};
function adStartGame(type,pool,r){const st=agStage(),mix=AD_MIX[type]&&AD_MIX[type][st];
  const games={};for(const t of (mix||[type])){const gm=adGame(t,pool);if(gm)games[t]=gm;}
  if(!Object.keys(games).length)return null;
  const target=type==="speed"?999:type==="daily"?5:(AG_N[type]||lvN(type)||8);
  const ad={type,games,order:Object.keys(games),d:adGet(type),retry:null,done:0,target,asked:new Set(),qn:0,up:false,ft:0,r};
  return ad;}
function adNext(g){const ad=g.ad,r=ad.r||Math.random;let t,topic,att=0;
  if(ad.retry){({t,topic}=ad.retry);att=ad.retry.tries;}
  else{t=ad.order[ad.qn%ad.order.length];topic=ad.games[t].topic(ad.d,ad.asked,r);ad.asked.add(ad.games[t].key(topic));}
  ad.qn++;const q=ad.games[t].make(topic,ad.d,r,att,ad.asked);q.adT=t;q.adTopic=topic;q.adRetry=att;q.adLv=ad.d;return q;}
function adFinished(g){const ad=g.ad;if(g.end&&Date.now()>=g.end)return true;if(ad.retry&&ad.retry.tries<AD_MAX_TRIES&&g.qs.length<ad.target*3)return false;return ad.done>=ad.target||g.qs.length>=ad.target*3;}
function adAfter(g,q,ok){const ad=g.ad;if(!ad||q.adT==null)return;ad.up=false;ad.down=false;
  if(ok){if(!q.adRetry){ad.ft++;if(ad.d<5){ad.d++;ad.up=true;}}ad.retry=null;ad.done++;}
  else{if(g.type==="speed"){if(ad.d>1){ad.d--;ad.down=true;}ad.done++;}
    else if(q.adRetry){ad.retry.tries++;if(ad.retry.tries>=AD_MAX_TRIES){ad.retry=null;ad.done++;}}
    else{ad.retry={t:q.adT,topic:q.adTopic,tries:1};if(ad.d>1){ad.d--;ad.down=true;}}}
  adSet(g.type,ad.d);}
function adFbHTML(g){const ad=g.ad;if(!ad)return "";
  if(ad.retry&&!adFinished(g))return ` <span class="mtline adnote">💪 Let's practise this again.</span>`;
  if(ad.up)return ` <span class="mtline adnote">⬆️ Level ${ad.d}! The next one is a bit harder.</span>`;
  if(ad.down&&g.type==="speed")return ` <span class="mtline adnote">Level ${ad.d}. Keep going!</span>`;
  return "";}
const adLede=g=>{const ad=g.ad;return ` · Level ${ad.d}/5 ${"●".repeat(ad.d)}${"○".repeat(5-ad.d)}${g.type!=="speed"?` · ${Math.min(ad.done,ad.target)} of ${ad.target} done`:""}`;};
const agMore=g=>g.ad?!adFinished(g):g.i<g.qs.length-1;
/* hook into the game engine */
const AD_TYPES=new Set(["daily","quiz","listen","pic","sound","colour","count","build","miss","odd","cloze","fix","bee","speed"]);
{const f=A.answer;A.answer=v=>{const g=S.game;if(g&&g.ad&&g.pick==null){const q=g.qs[g.i];adAfter(g,q,q.opts[+v]===q.ans);}f(v);};}
{const f=A.nextQ;A.nextQ=async()=>{const g=S.game;if(g&&g.ad&&g.i===g.qs.length-1&&!adFinished(g)){g.qs.push(adNext(g));}if(g&&g.ad&&g.i>=g.qs.length-1)adSet(g.type,g.ad.d);return f();};}
/* ---------- Word power and GK quizzes: same idea ---------- */
const qzTopic=q=>String(q).toLowerCase().replace(/['‘’“”"]/g,"").split(/\s+/).slice(0,4).join(" ");
const qzDiff=x=>String(x.q).length+String(x.a).length*2;
function qzAdapt(st,kind){if(st.ad)return st.ad;const band=adBands(st.deck,qzDiff);st.ad={d:adGet((kind||st.kind||"qz")+"-"+st.stage),band,miss:new Map(),up:false,retry:false};return st.ad;}
{const f=A.qzPick;A.qzPick=v=>{const [kind]=String(v).split(":");const st=qzState(kind);st.kind=kind;if(st.picked==null){const ad=qzAdapt(st,kind),x=st.deck[st.i],ok=x.opts[+String(v).split(":")[1]]===x.a;ad.up=false;ad.retry=false;
  if(ok){if(!x.again&&ad.d<5){ad.d++;ad.up=true;}ad.miss.delete(x.q);}
  else{if(ad.d>1)ad.d--;const n=(ad.miss.get(x.q)||0)+1;ad.miss.set(x.q,n);ad.retry=n<AD_MAX_TRIES;}
  adSet(kind+"-"+st.stage,ad.d);}f(v);};}
{const f=A.qzNext;A.qzNext=kind=>{const st=qzState(kind),ad=qzAdapt(st,kind),x=st.deck[st.i];
  if(x&&ad.retry){/* same topic next, and the missed question again two questions later */
    const tp=qzTopic(x.q),j=st.deck.findIndex((y,k)=>k>st.i&&qzTopic(y.q)===tp&&!y.again);if(j>st.i+1){const [y]=st.deck.splice(j,1);st.deck.splice(st.i+1,0,y);}
    st.deck.splice(Math.min(st.deck.length,st.i+3),0,{q:x.q,a:x.a,opts:shuffle(x.opts.slice()),again:1});}
  else{/* move a question at the new level to be next */
    const j=st.deck.findIndex((y,k)=>k>st.i&&!y.again&&ad.band.get(y)===ad.d);if(j>st.i+1){const [y]=st.deck.splice(j,1);st.deck.splice(st.i+1,0,y);}}
  ad.retry=false;f(kind);};}
function qzAdHTML(st,kind){if(kind)st.kind=kind;const ad=st.deck&&st.deck.length?qzAdapt(st,kind):null;if(!ad)return "";return ` · Level ${ad.d}/5 ${"●".repeat(ad.d)}${"○".repeat(5-ad.d)}`;}
function qzFbHTML(st){const ad=st.ad;if(!ad)return "";if(ad.retry)return `<p class="small adnote">💪 We'll practise this kind of question again.</p>`;if(ad.up)return `<p class="small adnote">⬆️ Level ${ad.d}! The next one is a bit harder.</p>`;return "";}
