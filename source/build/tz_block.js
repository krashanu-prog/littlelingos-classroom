/* ================= India time (IST) beside every class time ================= */
const IST_TZ="Asia/Kolkata";
const ISTT=new Intl.DateTimeFormat("en-IN",{timeZone:IST_TZ,hour:"numeric",minute:"2-digit"});
const ISTD=new Intl.DateTimeFormat("en-IN",{timeZone:IST_TZ,weekday:"short",day:"numeric",month:"short"});
const ISTK=new Intl.DateTimeFormat("en-CA",{timeZone:IST_TZ,year:"numeric",month:"2-digit",day:"2-digit"});
/* the time zone this person sees times in: a parent's chosen zone, else the device's */
function viewerTz(){const p=realRole()==="parent"?((D.profiles[S.uid]||{}).tz||""):"";if(p)return p;try{return Intl.DateTimeFormat().resolvedOptions().timeZone||""}catch{return ""}}
function tzOffset(tz,d){try{return (new Intl.DateTimeFormat("en-US",{timeZone:tz,timeZoneName:"longOffset"}).formatToParts(d||new Date()).find(p=>p.type==="timeZoneName")||{}).value||tz}catch{return tz}}
const sameAsIST=d=>{const v=viewerTz();return !v||v===IST_TZ||v==="Asia/Calcutta"||tzOffset(v,d)===tzOffset(IST_TZ,d);};
const myZone=d=>{const v=viewerTz();try{return (new Intl.DateTimeFormat("en-US",{timeZone:v||undefined,timeZoneName:"short"}).formatToParts(d||new Date()).find(p=>p.type==="timeZoneName")||{}).value||""}catch{return ""}};
/* " · 6:00–6:45 pm IST" (with the IST day when it differs), or "" for people already on IST */
function istRange(d,end){if(!okDate(d))return "";if(sameAsIST(d))return " IST";const dayDiff=ISTK.format(d)!==DKEY.format(d);
  return ` ${myZone(d)} · ${ISTT.format(d)}${end&&okDate(end)?"–"+ISTT.format(end):""} IST${dayDiff?" ("+ISTD.format(d)+")":""}`;}
const istShort=d=>istRange(d,null);
const istPill=(d,end)=>!okDate(d)?"":sameAsIST(d)?`<span class="pill p-info">IST</span>`:`<span class="pill p-info">${esc(istRange(d,end).replace(/^ \S* · /,""))}</span>`;
const tzLabel=tz=>tz===IST_TZ?"India (IST)":((TZ_LIST.find(([v])=>v===tz)||[,tz])[1]+" ("+tzShort(tz)+")");
/* scheduling: enter the start in India time or your own time, and always see both */
function toZonedInput(d,tz){if(!tz)return toLocalInput(d);try{const p=Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:tz,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}).formatToParts(d).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}T${pad((+p.hour)%24)}:${p.minute}`;}catch{return toLocalInput(d)}}
function fromZonedInput(v,tz){if(!v)return new Date(NaN);if(!tz)return new Date(v);const [ds,ts]=v.split("T");return zonedDate(ds,ts||"00:00",tz);}
function startTzField(d){const now=d&&okDate(d)?d:new Date();const mine=!sameAsIST(now);
  const zones=TZ_LIST.filter(([v])=>v&&v!==IST_TZ);
  return `<div class="two"><div class="field"><label for="s-tz">Start time is in</label><select id="s-tz" name="startz" data-prev="${IST_TZ}">${opt(IST_TZ,"India time (IST)",true)}${mine?opt("","My time ("+(myZone(now)||"this device")+")",false):""}${zones.map(([v,l])=>opt(v,l+" time",false)).join("")}</select><span class="hint">For a trainer abroad, pick their time zone and type the time on their clock.</span></div>
    <div class="field"><span class="lbl">Check the time</span><p class="small tzprev" id="s-tzp" aria-live="polite">${tzLines(d&&okDate(d)?d:null,IST_TZ)}</p></div></div>`;}
function tzLines(d,zone){if(!d||!okDate(d))return "Pick a start time.";
  const f=tz=>{try{return new Intl.DateTimeFormat("en-IN",{timeZone:tz,weekday:"short",day:"numeric",month:"short",hour:"numeric",minute:"2-digit"}).format(d)}catch{return ""}};
  let h=`<b>India (IST):</b> ${esc(f(IST_TZ))}`;
  if(zone&&zone!==IST_TZ)h+=`<br><b>${esc(tzLabel(zone))}:</b> ${esc(f(zone))}`;
  if(!sameAsIST(d)&&zone)h+=`<br><b>Your time (${esc(myZone(d))}):</b> ${esc(fmtDay(d))}, ${esc(fmtTime(d))}`;
  else if(!sameAsIST(d)&&!zone)h+=`<br><b>Your time (${esc(myZone(d))}):</b> ${esc(fmtDay(d))}, ${esc(fmtTime(d))}`;
  return h;}
function tzPreview(form){const p=form&&form.querySelector("#s-tzp");if(!p)return;const z=form.querySelector('select[name="startz"]'),i=form.querySelector('input[name="start"]');
  const d=fromZonedInput(i&&i.value,z?z.value:"");p.innerHTML=tzLines(okDate(d)?d:null,z?z.value:"");}
const startFromForm=f=>fromZonedInput(f.start.value,f.startz?f.startz.value:"");
if(!window.__tzWired){window.__tzWired=true;
  document.addEventListener("change",e=>{const t=e.target;if(!t||t.name!=="startz")return;const form=t.closest("form");const i=form&&form.querySelector('input[name="start"]');
    if(i&&i.value){const d=fromZonedInput(i.value,t.dataset.prev||"");if(okDate(d))i.value=toZonedInput(d,t.value);}t.dataset.prev=t.value;tzPreview(form);},true);
  document.addEventListener("input",e=>{const t=e.target;if(t&&t.name==="start"&&t.form&&t.form.querySelector("#s-tzp"))tzPreview(t.form);},true);
}
