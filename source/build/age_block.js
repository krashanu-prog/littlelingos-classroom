/* ================= Age groups: each child learns from their own stage, and games get harder with age ================= */
/* a course fits a learner when it has no stage, an unknown stage, or the learner's own stage */
const stageOK=(c,L)=>!c||!L||!L.stage||!c.level||!STAGES.some(s=>s.v===c.level)||c.level===L.stage;
/* the courses a child learns from: their enrolled courses for their stage (all of them if none match, so nobody is left empty) */
function learnCourses(L){const all=learnerCourses(L);const m=all.filter(cid=>stageOK(D.courses[cid],L));return m.length?m:all;}
/* how hard each game is, by stage */
const LEVELS={
  Seeds:{opts:3,quiz:5,listen:5,mem:4,daily:["listen","mean"],quizK:["mean"],listenK:["listen"],note:"Easy games: 3 choices, short rounds"},
  Sprouts:{opts:4,quiz:8,listen:8,mem:6,daily:["mean","listen","rev"],quizK:["mean","rev"],listenK:["listen"],note:"4 choices, longer rounds, find the word from its meaning"},
  Blooms:{opts:4,quiz:10,listen:10,mem:8,daily:["rev","spell","listen","mean"],quizK:["mean","rev","spell"],listenK:["listen","spell"],note:"Hardest: spelling, reverse meanings, 10-question rounds"}};
const lvOf=L=>LEVELS[(L&&L.stage)||""]||LEVELS.Sprouts;
const myLv=()=>lvOf(myLearner());
const lvN=type=>type==="daily"?5:(myLv()[type]||8);
const lvKinds=type=>{const v=myLv();return type==="daily"?v.daily:type==="listen"?v.listenK:v.quizK;};
/* believable wrong spellings: swapped letters, a missing letter, a changed vowel, a doubled or single letter */
function misspell(w,r){w=String(w);const out=new Set(),V="aeiou",rr=r||Math.random;
  for(let t=0;t<60&&out.size<3;t++){const k=Math.floor(rr()*4),i=1+Math.floor(rr()*Math.max(1,w.length-2));let x=w;
    if(k===0&&i<w.length-1)x=w.slice(0,i)+w[i+1]+w[i]+w.slice(i+2);
    else if(k===1)x=w.slice(0,i)+w.slice(i+1);
    else if(k===2){const vs=[...w].map((c,j)=>V.includes(c)?j:-1).filter(j=>j>=0);if(vs.length){const j=vs[Math.floor(rr()*vs.length)];const nv=V.replace(w[j],"")[Math.floor(rr()*4)];x=w.slice(0,j)+nv+w.slice(j+1);}}
    else x=w[i]===w[i-1]?w.slice(0,i)+w.slice(i+1):w.slice(0,i)+w[i]+w.slice(i);
    if(x!==w&&x.length>1)out.add(x);}
  return [...out];}
const pMean=x=>{const m=meanFor(x.w,x.m),t=mt(x.w);return t&&m!==t?`${m} · ${t}`:m;};
const canSpell=w=>/^[a-z]{4,}$/i.test(String(w||""));
function buildQs(pool,n,r,kinds){const qs=[],o=Math.max(2,myLv().opts)-1;
  const k0=Math.floor(r()*kinds.length);let qi=0;
  const pick=freshFirst(pool,r).slice(0,Math.min(n,pool.length));noteAsked(pick.map(x=>String(x.w).toLowerCase()));
  for(const x of pick){const others=shuffle(pool.filter(y=>y.m!==x.m&&y.w!==x.w),r).slice(0,o);let k=kinds[(k0+qi++)%kinds.length];
    if(k==="spell"&&!canSpell(x.w))k=kinds.includes("rev")?"rev":"mean";
    if(k==="listen")qs.push({k,say:x.w,lang:x.lang,prompt:"Listen! Which word did Pip say?",opts:shuffle([x,...others],r).map(y=>y.w),ans:x.w});
    else if(k==="rev")qs.push({k,say:x.w,lang:x.lang,prompt:`Which word means “${pMean(x)}”?`,opts:shuffle([x,...others],r).map(y=>y.w),ans:x.w});
    else if(k==="spell"){const bad=misspell(x.w.toLowerCase(),r);if(bad.length<o){qs.push({k:"mean",say:x.w,lang:x.lang,prompt:`What does “${x.w}” mean?`,...mQ(shuffle([x,...others],r),x)});continue;}
      qs.push({k,say:x.w,lang:x.lang,prompt:`Which is the right spelling of the word that means “${pMean(x)}”?`,opts:shuffle([x.w.toLowerCase(),...bad.slice(0,o)],r),ans:x.w.toLowerCase()});}
    else qs.push({k:"mean",say:x.w,lang:x.lang,prompt:`What does “${x.w}” mean?`,...mQ(shuffle([x,...others],r),x)});}
  return qs;}
function levelBanner(L){const v=lvOf(L);return `<p class="lvband"><span class="pill p-good">${esc(stageLabel(L.stage||"Sprouts"))}</span><span class="small">${esc(v.note)}</span></p>`;}
/* game words: what the child has learned for their stage first, then their stage's lesson words, then the built-in bank (100+ per stage) */
function gamePool(L){const lc=w=>String(w||"").toLowerCase().trim();
  const stageW=courseVocab(L), have=new Set(stageW.map(x=>lc(x.w))), other=new Set();
  for(const cid of learnerCourses(L))if(!learnCourses(L).includes(cid))for(const l of lessonsOf(cid))for(const [w] of parseVocab(l.vocab))if(!have.has(lc(w)))other.add(lc(w));
  const out=wordsWithMeaning(L.uid).filter(x=>!other.has(lc(x.w))), seen=new Set(out.map(x=>lc(x.w)));
  const add=x=>{if(x.m&&!seen.has(lc(x.w))){seen.add(lc(x.w));out.push(x);}};
  stageW.forEach(add);(WORDBANK[L.stage]||WORDBANK.Sprouts).forEach(([w,m])=>add({w,m,lang:"en",bank:1}));
  return out;}
/* variety: words asked recently go to the back of the queue, so rounds keep bringing new words */
const recentKey=()=>"ll-recentq-"+(S.uid||"");
function recentWords(){try{return JSON.parse(localStorage.getItem(recentKey())||"[]")}catch{return []}}
function noteAsked(ws){try{const r=recentWords().filter(w=>!ws.includes(w));localStorage.setItem(recentKey(),JSON.stringify([...ws,...r].slice(0,250)));}catch{}}
function freshFirst(pool,r){const rec=recentWords(),pos=new Map(rec.map((w,i)=>[w,i]));const lc=x=>String(x.w).toLowerCase();
  return shuffle(pool.slice(),r).sort((a,b)=>(pos.has(lc(a))?1e4-pos.get(lc(a)):0)-(pos.has(lc(b))?1e4-pos.get(lc(b)):0));}
