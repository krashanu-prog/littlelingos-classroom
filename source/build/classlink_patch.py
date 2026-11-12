# Every class must have a joining link (Zoom / Google Meet …) before it can be scheduled.
LINKMSG = "Add the class joining link (Zoom, Google Meet or Teams, starting with https://). A class can't be scheduled without it."
# 1. Schedule / edit class
R('''<div class="field"><label for="s-url">Meeting link</label><input type="url" id="s-url" name="url" data-label="Meeting link" value="${esc(s.joinUrl||"")}" placeholder="https://meet.google.com/… or https://zoom.us/j/…"><span class="hint">Learners get a Join button. After saving you can send the link to families on WhatsApp or email. Leave empty for classes held at the centre.</span></div>''',
  '''<div class="field"><label for="s-url">Class joining link <span class="req">(required)</span></label><input type="url" id="s-url" name="url" required data-label="Class joining link" value="${esc(s.joinUrl||"")}" placeholder="https://meet.google.com/… or https://zoom.us/j/…"><span class="hint">Every class needs its Zoom, Google Meet or Teams link. Learners get a Join button, and you can send the link to families on WhatsApp or email.</span></div>''')
R('''const sessData=f=>{const _fl=sessKids(f);const u=f.url.value.trim();if(u&&!safeUrl(u))throw userErr("The meeting link must start with https://");''',
  '''const sessData=f=>{const _fl=sessKids(f);const u=f.url.value.trim();needLink(u);''')
# 2. Batches (recurring classes)
R('''<div class="field"><label for="bt-u">Meeting link</label><input type="url" id="bt-u" name="url" value="${esc(b.url||"")}" placeholder="https://…"></div>''',
  '''<div class="field"><label for="bt-u">Class joining link <span class="req">(required)</span></label><input type="url" id="bt-u" name="url" required data-label="Class joining link" value="${esc(b.url||"")}" placeholder="https://meet.google.com/…"></div>''')
R('''if(!days.length)throw userErr("Pick at least one day.");const u=f.url.value.trim();if(u&&!safeUrl(u))throw userErr("The meeting link must start with https://");''',
  '''if(!days.length)throw userErr("Pick at least one day.");const u=f.url.value.trim();needLink(u);''')
# 3. Free demo class
R('''<div class="field"><label for="tr-u">Meeting link</label><input type="url" id="tr-u" name="url" value="${esc(x.trialUrl||"")}" placeholder="https://meet.google.com/…"></div>''',
  '''<div class="field"><label for="tr-u">Class joining link <span class="req">(required)</span></label><input type="url" id="tr-u" name="url" required data-label="Class joining link" value="${esc(x.trialUrl||"")}" placeholder="https://meet.google.com/…"></div>''')
R('''if(isNaN(nd))throw userErr("Pick a date and time.");const u=f.url.value.trim();if(u&&!safeUrl(u))throw userErr("The link must start with https://");''',
  '''if(isNaN(nd))throw userErr("Pick a date and time.");const u=f.url.value.trim();needLink(u);''')
# 4. Make-up class from a reschedule request: link field (prefilled from the class)
R('''<div class="field"><label for="ap-r">Message to the parent</label><textarea id="ap-r" name="r" rows="2" maxlength="600"></textarea></div>`,''',
  '''<div class="field"><label for="ap-u">Class joining link for the make-up class <span class="req">(required)</span></label><input type="url" id="ap-u" name="url" data-label="Class joining link" value="${esc((s&&s.joinUrl)||"")}" placeholder="https://meet.google.com/…"></div>
   <div class="field"><label for="ap-r">Message to the parent</label><textarea id="ap-r" name="r" rows="2" maxlength="600"></textarea></div>`,''')
R('''if(isNaN(nd))throw userErr("Pick the new time.");const mins=+f.m.value||40;''',
  '''if(isNaN(nd))throw userErr("Pick the new time.");const mins=+f.m.value||40;const mkUrl=f.url.value.trim();if(f.how.value!=="move"||!s)needLink(mkUrl);''')
R('''title:`Make-up: ${base.title||"class"}`,startsAt:nd.toISOString(),durationMin:mins,joinUrl:(s&&s.joinUrl)||"",''',
  '''title:`Make-up: ${base.title||"class"}`,startsAt:nd.toISOString(),durationMin:mins,joinUrl:safeUrl(mkUrl),''')
# 5. CSV import: rows without a link are skipped
R('''if(!c||isNaN(at)||!lids.length){skip++;continue}const T=findTrainer(tr);''','''if(!c||isNaN(at)||!lids.length||!safeUrl(link)){skip++;continue}const T=findTrainer(tr);''')
R('''skipped (course not found, bad date or no learners)''','''skipped (course not found, bad date, no learners or no https:// joining link)''')
# helper + a banner for upcoming classes that still have no link
R('/* ================= events ================= */','''/* ================= Class joining links are required ================= */
function needLink(u){u=String(u||"").trim();if(!u)throw userErr("'''+LINKMSG+'''");if(!safeUrl(u))throw userErr("The class joining link must start with https:// (for example https://meet.google.com/abc-defg-hij).");}
/* upcoming classes (next 30 days) that were scheduled before links were required */
function noLinkUpcoming(){const now=Date.now();return (role()==="admin"?entries(D.sessions):scopedSessions()).filter(s=>s&&!safeUrl(s.joinUrl)&&sessEnd(s)>now&&new Date(s.startsAt).getTime()<now+30*864e5).sort((a,b)=>String(a.startsAt).localeCompare(String(b.startsAt)));}
function noLinkBanner(){const r=role();if(r!=="teacher"&&r!=="admin")return "";if(realRole()==="admin"&&r==="teacher")return "";const ss=noLinkUpcoming();if(!ss.length)return "";
  const s=ss[0],d=new Date(s.startsAt);
  return `<section class="alert a-bad nolinkban"><span><b>${ss.length===1?"A class has":ss.length+" classes have"} no joining link.</b> Learners can't join without it. Next: ${esc(s.title||"Class")}, ${esc(fmtDay(d))} ${esc(fmtTime(d))}.</span><button class="btn btn-primary btn-sm" data-act="editSession" data-id="${esc(s.id)}">Add link</button></section>`;}
for(const v of Object.keys(VIEWS)){const f=VIEWS[v];VIEWS[v]=function(){return noLinkBanner()+f.apply(this,arguments);};}
/* ================= events ================= */''')
R('@media (prefers-reduced-motion:reduce)','''.req{color:var(--tomato,#E8492F);font-weight:700;font-size:.85em}
@media (prefers-reduced-motion:reduce)''')
