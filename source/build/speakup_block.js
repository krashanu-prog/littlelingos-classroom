/* ================= Speak Up with Pip: "Pip Gets It Wrong" (Sprouts, ages 7 to 10) ================= */
/* Pip says something silly with total confidence. The child corrects Pip out loud and says why.
   Goal: move children from one-word answers to "No, Pip! ... because ...".
   - Listening uses the browser's speech recognition. No audio and no words are saved; only counts
     (turns, talking seconds, words, reasons) go into progress/<uid>.spk for the parent and teacher.
   - Three levels inside Sprouts. Everyone starts at level 1; after 3 good sessions in a row the level
     goes up, and after 2 mostly silent sessions it quietly goes back down (scaffolds return).
   - Pip never wins and nobody fails: a missing reason gets a gentle "why?" (up to 2 nudges), then praise. */
const PGW_BANK={
  1:[
    {c:"Fish live in trees!",e:"🐟",k:["water","sea","river","pond","ocean","swim","lake","tank"],a:"Then where do fish live?",f:"Ohh! Fish live in water. Thank you for teaching me!"},
    {c:"Cows say quack quack!",e:"🐄",k:["moo","duck","ducks"],a:"Then what do cows say?",f:"Moo! Cows say moo. You're so smart!"},
    {c:"The sun comes out at night!",e:"☀️",k:["day","morning","daytime","moon","afternoon"],a:"Then when does the sun come out?",f:"Oh! The sun comes out in the day. Thank you!"},
    {c:"Ice cream is very hot!",e:"🍦",k:["cold","cool","freez","fridge","ice","melt"],a:"Then is ice cream hot or cold?",f:"Brrr! Ice cream is cold. I learned something new!"},
    {c:"Cats can fly like birds!",e:"🐱",k:["wing","wings","walk","run","jump","climb","legs","bird","birds"],a:"Then what can cats do?",f:"Oh! Cats walk and jump. They can't fly. Thanks!"},
    {c:"We wear shoes on our hands!",e:"👟",k:["feet","foot","leg","legs","gloves","walk"],a:"Then where do we wear shoes?",f:"On our feet! Silly me. Thank you!"},
    {c:"Bananas are bright blue!",e:"🍌",k:["yellow","green","brown"],a:"Then what colour are bananas?",f:"Yellow! Bananas are yellow. You're a great teacher!"},
    {c:"Elephants are tiny, like ants!",e:"🐘",k:["big","huge","large","giant","heavy","tall"],a:"Then are elephants big or small?",f:"Elephants are huge! Thank you for telling me!"},
    {c:"Rain falls up into the sky!",e:"🌧️",k:["down","ground","fall","falls","clouds","cloud","gravity"],a:"Then which way does rain fall?",f:"Rain falls down! Now I know. Thank you!"},
    {c:"We eat soup with a fork!",e:"🥣",k:["spoon","spoons","drink","bowl","fall"],a:"Then what do we eat soup with?",f:"A spoon! Of course. Thank you!"},
    {c:"Snow is hot and red!",e:"❄️",k:["cold","white","ice","freez","winter"],a:"Then what is snow like?",f:"Snow is cold and white! You know so much!"},
    {c:"Dogs have two legs, just like me!",e:"🐶",k:["four","4"],a:"Then how many legs do dogs have?",f:"Four legs! Thank you for counting for me!"},
    {c:"We read books with our ears!",e:"📚",k:["eye","eyes","see","look","read"],a:"Then how do we read books?",f:"With our eyes! Thanks, teacher!"},
    {c:"Milk comes from fish!",e:"🥛",k:["cow","cows","buffalo","goat","goats","animal"],a:"Then where does milk come from?",f:"From cows and buffaloes! I didn't know. Thank you!"},
    {c:"Chairs are for eating!",e:"🪑",k:["sit","sitting","seat","chair"],a:"Then what are chairs for?",f:"Chairs are for sitting! You're so clever!"},
    {c:"A week has three days!",e:"📅",k:["seven","7","monday","sunday"],a:"Then how many days are in a week?",f:"Seven days! Thank you for teaching me!"},
    {c:"Trees grow in the sky!",e:"🌳",k:["ground","soil","earth","land","garden","roots","mud"],a:"Then where do trees grow?",f:"In the ground! Now I understand. Thank you!"},
    {c:"We sleep in the bathroom!",e:"🛏️",k:["bed","bedroom","room","pillow"],a:"Then where do we sleep?",f:"In a bed! Of course. Thank you!"}
  ],
  2:[
    {c:"Plants don't need water at all!",e:"🌱",k:["water","die","dry","grow","need","thirsty","drink"],a:"Then what do plants need?",f:"Plants need water to grow! Thank you for explaining!"},
    {c:"We only need to brush our teeth once a year!",e:"🪥",k:["day","daily","twice","morning","night","germ","germs","cavit","clean","dirty"],a:"Then how often should we brush?",f:"Every day! You gave me a great reason. Thank you!"},
    {c:"Reading books is boring!",e:"📖",k:["fun","story","stories","learn","interesting","exciting","words","imagin"],a:"Then what is good about reading?",f:"Reading is full of stories! You changed my mind!"},
    {c:"Vegetables make you weak!",e:"🥕",k:["strong","healthy","health","vitamin","vitamins","good","energy","grow"],a:"Then what do vegetables do for us?",f:"Vegetables make us strong! Thank you for teaching me!"},
    {c:"Sleeping is a waste of time!",e:"😴",k:["rest","tired","energy","grow","healthy","brain","sleepy","body"],a:"Then why do we need sleep?",f:"Sleep gives us energy! What a good reason!"},
    {c:"It's fine to cross the road without looking!",e:"🚦",k:["car","cars","danger","dangerous","safe","look","hurt","accident","traffic","bike"],a:"Then what should we do before we cross?",f:"Look both ways! You're keeping me safe. Thank you!"},
    {c:"Winter is the hottest time of the year!",e:"⛄",k:["cold","summer","cool","sweater","jacket"],a:"Then which season is hottest?",f:"Summer is hottest! Thank you for telling me!"},
    {c:"You don't need any friends!",e:"🤝",k:["play","fun","help","share","happy","lonely","sad","talk"],a:"Then why are friends important?",f:"Friends make us happy! You're right!"},
    {c:"Saying sorry makes things worse!",e:"🙏",k:["better","friend","friends","feel","happy","mistake","kind","hurt"],a:"Then what does saying sorry do?",f:"Sorry makes things better! Thank you for teaching me!"},
    {c:"Cars run on orange juice!",e:"🚗",k:["petrol","diesel","fuel","electric","electricity","gas","cng","battery"],a:"Then what do cars run on?",f:"Petrol or electricity! Thank you!"},
    {c:"Throwing rubbish on the road is okay!",e:"🗑️",k:["dustbin","bin","dirty","clean","sick","germs","animals","smell"],a:"Then where should rubbish go?",f:"In the dustbin! You made a great point!"},
    {c:"Homework doesn't help anyone!",e:"✏️",k:["learn","practice","practise","remember","school","better","brain"],a:"Then how does homework help?",f:"Homework helps us practise! You convinced me!"}
  ],
  3:[
    {c:"Only the fastest runner should get a prize. Nobody else!",e:"🏃",k:["try","tried","effort","fair","everyone","practice","practise","hard","feel","sad"],a:"Then who should get a prize?",f:"Everyone who tries hard matters! You convinced me!"},
    {c:"Only grown-ups have good ideas!",e:"💡",k:["kid","kids","children","child","anyone","everyone","idea","ideas","young","me"],a:"Then who can have good ideas?",f:"Anyone can have a good idea! Great argument!"},
    {c:"It's okay to cheat if nobody sees!",e:"🙈",k:["wrong","honest","unfair","fair","learn","truth","lie","bad"],a:"Then why is cheating not okay?",f:"Being honest matters, even when nobody sees. Thank you!"},
    {c:"We don't need to save water!",e:"💧",k:["waste","save","less","drink","future","people","everyone","finish","run out"],a:"Then why should we save water?",f:"Water can run out, so we save it! You convinced me!"},
    {c:"Animals don't have feelings!",e:"🐕",k:["feel","feelings","happy","sad","pain","hurt","love","scared","cry"],a:"Then how do animals feel?",f:"Animals feel happy and sad too! Great point!"},
    {c:"Phones are always better than playing outside!",e:"📱",k:["outside","play","friends","health","healthy","exercise","fresh","eyes","run","sun"],a:"Then what is good about playing outside?",f:"Playing outside keeps us healthy! You changed my mind!"},
    {c:"If you make a mistake, you're bad at it forever!",e:"🧩",k:["learn","try","practice","practise","better","improve","again","mistake"],a:"Then what do mistakes help us do?",f:"Mistakes help us learn! What a wise answer!"},
    {c:"Trees are not useful for anything!",e:"🌳",k:["oxygen","air","shade","fruit","fruits","bird","birds","home","breathe","wood","rain"],a:"Then how are trees useful?",f:"Trees give us air and shade! Thank you!"},
    {c:"We should close all the libraries!",e:"🏛️",k:["book","books","read","learn","free","quiet","study","everyone"],a:"Then why do we need libraries?",f:"Libraries share books with everyone! You convinced me!"},
    {c:"Being kind is a waste of time!",e:"💛",k:["happy","friend","friends","help","feel","nice","good","smile"],a:"Then why should we be kind?",f:"Kindness makes everyone happier! Great argument!"},
    {c:"In a group, only one person should ever talk!",e:"🗣️",k:["everyone","turn","turns","share","idea","ideas","listen","fair","team"],a:"Then who should talk in a group?",f:"Everyone gets a turn! Well argued!"},
    {c:"The Earth is flat, like a roti!",e:"🌍",k:["round","sphere","ball","globe","space","photo","photos"],a:"Then what shape is the Earth?",f:"The Earth is round! Thank you for teaching me!"}
  ]};
/* per level: the target answer, the starter, when it shows, and the longest turn in seconds */
const PGW_LV={
  1:{name:"Level 1",target:"one full sentence with “because”",start:["No, Pip! … because …","I think … because …"],starterAt:0,cap:30,need:x=>x.reason&&x.words>=5},
  2:{name:"Level 2",target:"what's right, a reason and an example",start:["No, Pip! … because … For example, …"],starterAt:5,cap:45,need:x=>x.reason&&x.words>=9},
  3:{name:"Level 3",target:"two reasons, and an answer when Pip argues back",start:["I disagree, because … Also, …"],starterAt:-1,cap:90,need:x=>x.reason&&x.words>=12}};
const PGW_TURNS=5,PGW_SILENT_END=2500,PGW_FIRST_WAIT=9000;
const pgwWords=t=>String(t||"").toLowerCase().replace(/[^a-z0-9' ]+/g," ").split(/\s+/).filter(Boolean);
/* the checks from the spec: spoke, full sentence (5+ words), gave a reason, on topic */
function pgwCheck(text,claim){const w=pgwWords(text),txt=" "+w.join(" ")+" ";
  const reason=/ (because|becoz|bcoz|cause|cuz|coz|cos|since|so) /.test(txt)||/ that's why | thats why /.test(txt);
  const topic=claim.k.some(k=>k.includes(" ")?txt.includes(" "+k+" "):w.some(x=>x===k||x.startsWith(k)));
  const two=(txt.match(/ (because|becoz|bcoz|cause|cuz|coz|cos|since|also|and another) /g)||[]).length>=2;
  return {spoke:w.length>0,full:w.length>=5,reason,topic,two,words:w.length};}
const pgwSeeds=x=>(x.spoke?1:0)+(x.full?1:0)+(x.reason?1:0)+(x.topic?1:0);
const pgwLevel=uid=>{const g=progOf(uid).pgw||{};return [1,2,3].includes(+g.lv)?+g.lv:1;};
const pgwShow=L=>!!L&&(L.stage||"")==="Sprouts";
function pgwPick(lv){const bank=PGW_BANK[lv]||PGW_BANK[1],seen=(S.pgwSeen||[]);
  const fresh=bank.filter(x=>!seen.includes(x.c)),pool=(fresh.length>=PGW_TURNS?fresh:bank).slice();
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const out=pool.slice(0,PGW_TURNS);S.pgwSeen=[...seen,...out.map(x=>x.c)].slice(-30);return out;}

A.pipWrong=()=>{const L=myLearner();if(!L)return;if(timeUp()){render();return}
  const lv=pgwLevel(S.uid),cfg=PGW_LV[lv],sr=!!SR;
  const g={lv,claims:pgwPick(lv),i:0,phase:"intro",said:"",nudge:0,pushed:false,silent:0,turns:[],sec:0,live:"",starter:cfg.starterAt===0,listening:false,rec:null,tick:null,err:""};
  const cur=()=>g.claims[g.i];
  const alive=()=>!!document.getElementById("pgw");
  const stop=()=>{if(g.tick){clearInterval(g.tick);g.tick=null;}if(g.rec){try{g.rec.onend=null;g.rec.stop();}catch(e){}g.rec=null;}g.listening=false;};
  const talk=async t=>{if(!alive())return;try{await pipSpeak(t);}catch(e){}};
  const bubble=t=>`<div class="bubble static pgw-bubble">${esc(t)}</div>`;
  const starterHTML=()=>g.starter&&cfg.start.length?`<p class="pgw-starter"><b>Try:</b> ${esc(cfg.start[(g.nudge+g.i)%cfg.start.length])}</p>`:"";
  const draw=()=>{const x=cur();let body="",foot="",title="Pip Gets It Wrong";
    if(g.phase==="intro"){
      body=`${art("pip",110,"Pip")}${bubble("I know everything! Well… I think I do. Can you check?")}
        <p class="lede" style="margin:0">Pip will say ${PGW_TURNS} silly things. Tell Pip what's really true, and say <b>why</b>.</p>
        <span class="pill p-info">${esc(cfg.name)} · aim for ${esc(cfg.target)}</span>
        ${sr?"":`<p class="small">Pip can't listen for words on this browser, so say your answers out loud and tap “I told Pip”. Chrome on a phone or computer works best.</p>`}`;
      foot=`<button type="button" class="btn btn-primary btn-big" data-mact="go">Let's go!</button>`;}
    else if(g.phase==="turn"){
      const ask=g.nudge===0?(g.pushed?"Hmm, are you sure? Give me one more reason!":x.c):g.nudge===1&&!g.lastTopic?x.a:"Ooh! Why do you think that?";
      body=`<span class="pill p-mute">${g.i+1} of ${PGW_TURNS}</span>${art(g.silent?"drizzle":"pip",96,g.silent?"Drizzle":"Pip")}
        ${g.silent?bubble("Take your time. Let's try again together."):bubble(ask)}
        ${g.nudge===0&&!g.pushed?`<span class="dtemo" aria-hidden="true" style="font-size:3.2rem">${x.e}</span>`:""}
        <div id="pgw-start">${starterHTML()}</div>
        ${sr?`<div class="pgw-heard" aria-live="polite"><span class="pgw-lab">${g.listening?"Pip hears":"Your turn"}</span><span id="pgw-live">${g.listening?(esc(g.live)||"…"):"Tap the button and tell Pip."}</span></div>
          <button type="button" class="btn ${g.listening?"btn-danger":"btn-primary"} btn-big" data-mact="mic">${g.listening?"■ I'm done":"🎤 Tell Pip"}</button>`
          :`<button type="button" class="btn btn-primary btn-big" data-mact="told">I told Pip</button>`}
        ${g.err?`<p class="small" style="margin:0">${esc(g.err)}</p>`:""}
        ${g.silent>=2&&!g.listening?`<button type="button" class="btn btn-ghost btn-sm" data-mact="skip">Skip this one</button>`:""}`;}
    else if(g.phase==="react"){const t=g.turns[g.turns.length-1]||{};const n=pgwSeeds(t);
      body=`<span class="pill p-mute">${g.i+1} of ${PGW_TURNS}</span>${art("pip",96,"Pip")}${bubble(t.reason?x.f:"Thank you for helping me! I'll remember that.")}
        <div class="pgw-ticks">${[["spoke","You told Pip"],["full","Full sentence"],["reason","You said why"],["topic","You fixed Pip's mistake"]].map(([k,lab])=>`<span class="pgw-tick ${t[k]?"on":""}">${t[k]?"✓":"·"} ${esc(lab)}</span>`).join("")}</div>
        <p class="saymsg" style="margin:0">${n?`${n} seed${n===1?"":"s"} planted!`:"Good try!"}</p>`;
      foot=`<button type="button" class="btn btn-leaf btn-big" data-mact="next">${g.i<PGW_TURNS-1?"Next silly thing":"See my garden"} ${ic("fwd")}</button>`;}
    else if(g.phase==="done"){const tot=g.turns.reduce((s,t)=>s+pgwSeeds(t),0),rs=g.turns.filter(t=>t.reason).length,fs=g.turns.filter(t=>t.full).length;title="You've bloomed!";
      body=`${art("bloom",110,"Bloom")}<p class="lede" style="margin:0"><b>${tot} seed${tot===1?"":"s"}</b> planted in your garden!</p>
        <div class="pgw-ticks"><span class="pgw-tick on">✓ ${fs} full sentence${fs===1?"":"s"}</span><span class="pgw-tick on">✓ ${rs} time${rs===1?"":"s"} you said why</span></div>
        ${g.up?`<p class="pill p-good" style="margin:0">Level up! Next time Pip will be trickier.</p>`:""}
        ${art("pip",72,"Pip")}${bubble("You're a great teacher! I learned so much.")}`;
      foot=`<button type="button" class="btn btn-primary" data-mact="again">Play again</button>`;}
    openModal(title,`<div class="drill pgw" id="pgw">${body}</div>`,{noFocus:true,footerExtra:foot,actions:{
      go:()=>{g.phase="turn";draw();talk(cur().c);},
      mic:()=>{if(g.listening)finish(true);else listen();},
      told:()=>{endTurn({spoke:true,full:false,reason:false,topic:false,words:0,manual:true});},
      skip:()=>{stop();endTurn({spoke:false,full:false,reason:false,topic:false,words:0});},
      next:()=>{if(g.i<PGW_TURNS-1){g.i++;Object.assign(g,{phase:"turn",said:"",nudge:0,pushed:false,silent:0,live:"",err:"",lastTopic:false,starter:cfg.starterAt===0});draw();talk(cur().c);}else done();},
      again:()=>{closeModal();setTimeout(A.pipWrong,150);}}});};
  /* listen until 2.5 s of quiet after speaking, a long first silence, the level's time cap, or the modal closes */
  function listen(){if(!SR)return;stop();pipStop&&pipStop();try{speechSynthesis.cancel();}catch(e){}
    let finals="",heardAny=false,last=Date.now();const t0=Date.now();g.live="";g.err="";
    let r;try{r=new SR();}catch(e){g.err="Pip can't listen on this browser.";draw();return}
    r.lang="en-IN";r.continuous=true;r.interimResults=true;r.maxAlternatives=1;g.rec=r;
    r.onresult=e=>{let interim="";for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;if(e.results[i].isFinal)finals+=t+" ";else interim+=t;}
      g.live=(finals+interim).trim();if(g.live){heardAny=true;last=Date.now();}const el=document.getElementById("pgw-live");if(el)el.textContent=g.live||"…";};
    r.onerror=e=>{if(e&&(e.error==="not-allowed"||e.error==="service-not-allowed"))g.err="Pip needs the microphone. Ask a grown-up to allow it in the browser settings.";};
    r.onend=()=>{if(g.rec===r){g.rec=null;finish(false);}};
    try{r.start();}catch(e){g.err="Pip couldn't start listening. Try again.";draw();return}
    g.listening=true;g.t0=t0;draw();
    g.tick=setInterval(()=>{if(!alive()){stop();return}const now=Date.now();
      if(cfg.starterAt>0&&!heardAny&&!g.starter&&now-t0>cfg.starterAt*1000){g.starter=true;const s=document.getElementById("pgw-start");if(s)s.innerHTML=starterHTML();}
      if((heardAny&&now-last>PGW_SILENT_END)||(!heardAny&&now-t0>PGW_FIRST_WAIT)||now-t0>cfg.cap*1000)finish(true);},250);}
  function finish(manual){if(!g.listening&&!g.rec)return;const text=g.live||"";const secs=Math.round((Date.now()-(g.t0||Date.now()))/1000);
    stop();if(!alive())return;if(g.err&&!text){draw();return}
    if(!pgwWords(text).length){g.silent++;g.live="";if(cfg.starterAt>=0)g.starter=true;draw();return}
    g.sec+=Math.min(secs,cfg.cap);g.said=(g.said+" "+text).trim();g.silent=0;const x=pgwCheck(g.said,cur());g.lastTopic=x.topic;
    /* gentle nudges: no reason yet → ask (up to 2); level 3 → Pip argues back once after a good answer */
    if(!x.reason&&g.nudge<2){g.nudge++;g.live="";if(cfg.starterAt>=0)g.starter=true;draw();talk(g.nudge===1&&!x.topic?cur().a:"Ooh! Why do you think that?");return}
    if(g.lv===3&&x.reason&&!g.pushed&&!x.two){g.pushed=true;g.nudge=0;g.live="";draw();talk("Hmm, are you sure? Give me one more reason!");return}
    endTurn(x);}
  function endTurn(x){g.turns.push(x);g.phase="react";draw();const c=cur();talk(x.reason?c.f:"Thank you for helping me! I'll remember that.");}
  async function done(){stop();g.phase="done";
    const tot=g.turns.reduce((s,t)=>s+pgwSeeds(t),0),rs=g.turns.filter(t=>t.reason).length,words=g.turns.reduce((s,t)=>s+(t.words||0),0);
    const met=g.turns.filter(t=>cfg.need(t)).length,silentish=g.turns.filter(t=>!t.spoke).length>=Math.ceil(PGW_TURNS/2);
    const old=progOf(S.uid).pgw||{};let lv=g.lv,ok=+old.ok||0,quiet=+old.quiet||0;
    if(sr){if(met>=Math.ceil(PGW_TURNS*0.6)){ok++;quiet=0;}else{ok=0;quiet=silentish?quiet+1:0;}
      if(ok>=3&&lv<3){lv++;ok=0;g.up=true;}if(quiet>=2&&lv>1){lv--;quiet=0;}}
    const day=ymd(new Date()),sp=((progOf(S.uid).spk||{})[day])||{};
    const stars=Math.max(1,rs);/* 1 star for playing, up to 5: one for each time the child said why */
    draw();talk("You're a great teacher! I learned so much.");
    try{await earn({pts:{["w"+Date.now().toString(36)]:stars},pgw:{lv,ok,quiet,n:(+old.n||0)+1,at:Date.now()},
      spk:{[day]:{n:(+sp.n||0)+1,turns:(+sp.turns||0)+g.turns.length,sec:(+sp.sec||0)+g.sec,words:(+sp.words||0)+words,reasons:(+sp.reasons||0)+rs,seeds:(+sp.seeds||0)+tot}}});}catch(e){}
    toast(`Great speaking! ${stars} star${stars===1?"":"s"} for your garden.`);}
  draw();};
