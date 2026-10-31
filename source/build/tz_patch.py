# ---- India time (IST) beside class times; schedule in IST or your own time ----
R('/* ================= events ================= */',open(W+'tz_block.js').read()+'\n/* ================= events ================= */')
# schedule form: start field shows/enters India time for people outside IST, plus a both-times check
R('''<input type="datetime-local" id="s-start" name="start" required data-label="Start time" value="${esc(toLocalInput(d))}"></div>''',
  '''<input type="datetime-local" id="s-start" name="start" required data-label="Start time" value="${esc(sameAsIST(d)?toLocalInput(d):toZonedInput(d,IST_TZ))}"></div>''')
R('''<input type="number" id="s-dur" name="dur" min="10" max="240" step="5" value="${esc(s.durationMin||45)}"></div></div>''',
  '''<input type="number" id="s-dur" name="dur" min="10" max="240" step="5" value="${esc(s.durationMin||45)}"></div></div>
  ${startTzField(d)}''')
R('''const sessData=f=>{const _fl=sessKids(f);const u=f.url.value.trim();if(u&&!safeUrl(u))throw userErr("The meeting link must start with https://");const d=new Date(f.start.value);''',
  '''const sessData=f=>{const _fl=sessKids(f);const u=f.url.value.trim();if(u&&!safeUrl(u))throw userErr("The meeting link must start with https://");const d=startFromForm(f);''')
# class lists, class cards, the kids' timetable, the "class starting" banner and the child summary
R('''${esc(fmtTime(d))}–${esc(fmtTime(end))} · ${esc(c?c.title:"Course removed")}''','''${esc(fmtTime(d))}–${esc(fmtTime(end))}${esc(istRange(d,end))} · ${esc(c?c.title:"Course removed")}''')
R('''<article class="classbox"><div class="row"><b>${esc(fmtTime(d))}–${esc(fmtTime(end))}</b>''','''<article class="classbox"><div class="row"><b>${esc(fmtTime(d))}–${esc(fmtTime(end))}</b>${istRange(d,end)?`<span class="pill p-info">${esc(istRange(d,end).replace(/^ \\S* · /,""))}</span>`:""}''')
R('''<span class="small">${esc(fmtTime(t))}${s.topic?''','''<span class="small">${esc(fmtTime(t))}${esc(istShort(t))}${s.topic?''')
R(''' at ${esc(fmtTime(new Date(live.startsAt)))}<span class="spacer"></span>''',''' at ${esc(fmtTime(new Date(live.startsAt)))}${esc(istShort(new Date(live.startsAt)))}<span class="spacer"></span>''')
R('''Next class: ${esc(fmtDay(new Date(s.next.startsAt)))}, ${esc(fmtTime(new Date(s.next.startsAt)))}''','''Next class: ${esc(fmtDay(new Date(s.next.startsAt)))}, ${esc(fmtTime(new Date(s.next.startsAt)))}${esc(istShort(new Date(s.next.startsAt)))}''')
R('@media (prefers-reduced-motion:reduce)','''.tzprev{margin:0;line-height:1.5;background:var(--skySoft,#BFE3FA);border-radius:12px;padding:8px 12px}
@media (prefers-reduced-motion:reduce)''')
