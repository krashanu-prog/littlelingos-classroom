# ---- course-wide classes and homework only reach the trainer's own learners ----
R('const seesSession=s=>{if(!s.forLids||!s.forLids.length)return true;const r=role();if(r!=="student"&&r!=="parent")return true;return myKids().some(L=>L&&s.forLids.includes(L.id));};',
  '''/* a learner's trainers: the one on their record plus any batch they are in */
const learnerTids=L=>{if(!L)return [];const s=new Set();if(L.trainerId)s.add(L.trainerId);for(const b of entries(D.batches||{}))if(b.tid&&(b.learners||[]).includes(L.id))s.add(b.tid);return [...s];};
/* a course-wide class goes to the learners of that class's trainer (no trainer = whole course; a learner with no trainer yet still sees the whole course) */
const sessForLearner=(s,L)=>{if(!s.trainerId)return true;const t=learnerTids(L);return !t.length||t.includes(s.trainerId);};
/* course-wide homework goes to the learners of the trainer who set it (set by the admin = whole course) */
const hwForLearner=(h,L)=>{const t=trainerByUid(h.uid);if(!t)return true;const ts=learnerTids(L);return !ts.length||ts.includes(t.id);};
const seesSession=s=>{const r=role();if(r!=="student"&&r!=="parent")return true;if(!s.forLids||!s.forLids.length)return myKids().some(L=>L&&(L.courses||[]).includes(s.courseId)&&sessForLearner(s,L));return myKids().some(L=>L&&s.forLids.includes(L.id));};''')
R('const kidSessions=L=>sessionsOf(learnerCourses(L)).filter(s=>!s.forLids||!s.forLids.length||s.forLids.includes(L.id));',
  'const kidSessions=L=>sessionsOf(learnerCourses(L)).filter(s=>(!s.forLids||!s.forLids.length)?sessForLearner(s,L):s.forLids.includes(L.id));')
R('.concat(s.forLids.filter(id=>D.learners[id]&&!ls.some(L=>L.id===id)).map(learner)):ls;};',
  '.concat(s.forLids.filter(id=>D.learners[id]&&!ls.some(L=>L.id===id)).map(learner)):ls.filter(L=>sessForLearner(s,L));};')
R('(h.courseId?learnersInCourse(h.courseId):[])','(h.courseId?learnersInCourse(h.courseId).filter(L=>hwForLearner(h,L)):[])')
