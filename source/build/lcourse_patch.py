# A learner saved with no course ticked is enrolled in their age group's course, and changing the age group in the
# form ticks that group's course when nothing else is ticked (new learners were being saved with no course).
R('''  const courses=[...form.querySelectorAll('input[name="courses"]:checked')].map(x=>x.value);
  const fee=+f.fee.value||0,''','''  let courses=[...form.querySelectorAll('input[name="courses"]:checked')].map(x=>x.value);
  if(!courses.length){const sc=courseList().filter(c=>c.level===f.stage.value);if(sc.length)courses=[sc[0].id];else if(courseList().length)throw userErr("Tick the course this child will join.");}
  const fee=+f.fee.value||0,''')
R('/* ================= events ================= */','''/* learner form: picking an age group ticks its course when no course is ticked yet */
document.addEventListener("change",e=>{const t=e.target;if(!t||t.name!=="stage"||!t.closest(".lfstage"))return;const form=t.closest("form");if(!form)return;
  const boxes=[...form.querySelectorAll('input[name="courses"]')];if(!boxes.length)return;
  const autoOn=boxes.filter(b=>b.dataset.auto==="1");const userOn=boxes.filter(b=>b.checked&&b.dataset.auto!=="1");if(userOn.length)return;
  autoOn.forEach(b=>{b.checked=false;delete b.dataset.auto;});
  const c=courseList().find(c=>c.level===t.value);const b=c&&boxes.find(b=>b.value===c.id);if(b){b.checked=true;b.dataset.auto="1";}});
document.addEventListener("change",e=>{const t=e.target;if(t&&t.name==="courses"&&t.dataset.auto)delete t.dataset.auto;});
/* ================= events ================= */''')
R('''mine=new Set(L.courses||prefill.courses||(cs.length===1?[cs[0].id]:[]));''','''mine=new Set(L.courses||prefill.courses||(cs.length===1?[cs[0].id]:cs.filter(c=>c.level===stage).slice(0,1).map(c=>c.id)));''')
R('''<input type="checkbox" name="courses" value="${esc(c.id)}" ${mine.has(c.id)?"checked":""}>''','''<input type="checkbox" name="courses" value="${esc(c.id)}" ${mine.has(c.id)?"checked":""} ${!L.id&&mine.has(c.id)&&c.level===stage?'data-auto="1"':""}>''')
