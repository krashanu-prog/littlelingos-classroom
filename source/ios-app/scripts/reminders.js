/* iPhone app only: a reminder 10 minutes before each class in the next 7 days, delivered even when
   the app is closed. Grown-ups only (parents and trainers), never on a child's sign-in. Reminders are
   rebuilt whenever the timetable changes and removed on sign-out. */
if(window.LL_NATIVE){
  const LLN=()=>window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.LocalNotifications;
  const remId=k=>{let h=0;for(const c of String(k))h=(h*31+c.charCodeAt(0))|0;return 100000+(Math.abs(h)%2000000000);};
  let remSig=null,remBusy=false;
  const nativeReminders=async()=>{const ln=LLN();if(!ln||remBusy)return;remBusy=true;try{
    const ready=S.status==="ready",signedOut=!ready&&!!document.querySelector("#ll-gate form");
    if(!ready&&!signedOut)return; /* still loading: leave reminders as they are */
    const r=ready&&!S.viewAs?realRole():null,now=Date.now();
    const ok=(r==="parent"||r==="teacher")&&typeof Notification!=="undefined"&&Notification.permission==="granted";
    let ss=[];
    if(ok)ss=(r==="parent"?pipTry(()=>sessionsOf([...new Set(myKids().flatMap(L=>learnerCourses(L)))])):pipTry(()=>scopedSessions()))||[];
    const up=ss.map(s=>({s,t:new Date(s.startsAt).getTime()})).filter(x=>x.t-10*6e4>now+3e4&&x.t-now<=7*864e5).sort((a,b)=>a.t-b.t).slice(0,30);
    const sig=(ok?S.uid:"")+"|"+up.map(x=>x.s.id+"@"+x.t+"@"+(x.s.title||"")).join(",");
    if(sig===remSig)return;
    const old=((await ln.getPending()).notifications||[]).filter(n=>n.extra&&n.extra.llClass);
    if(old.length)await ln.cancel({notifications:old.map(n=>({id:n.id}))});
    if(up.length)await ln.schedule({notifications:up.map(x=>({id:remId("cls|"+x.s.id),title:"Class in 10 minutes",
      body:`${x.s.title||"Live class"} starts at ${fmtTime(new Date(x.t))}`,schedule:{at:new Date(x.t-10*6e4),allowWhileIdle:true},extra:{go:"schedule",llClass:1}}))});
    remSig=sig;
  }catch(e){}finally{remBusy=false;}};
  setInterval(nativeReminders,30000);setTimeout(nativeReminders,7000);
  const nativeGo=()=>{const g=window.LL_NATIVE.pendingGo;if(!g||S.status!=="ready")return;window.LL_NATIVE.pendingGo=null;NC.open=false;go(g);};
  addEventListener("ll-native-go",nativeGo);setInterval(nativeGo,2000);
}
