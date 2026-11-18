# Children and parents see every class the child is booked into, even when the class was booked under a course
# the child isn't enrolled in (or the child has no course yet). Before, those classes were hidden.
R('''const sessionsOf=cids=>entries(D.sessions).filter(s=>cids.includes(s.courseId)&&seesSession(s)).sort(''',
  '''const kidOrphan=s=>{const r=role();if(r!=="student"&&r!=="parent")return false;const ks=myKids().filter(Boolean);return ks.some(L=>(s.forLids||[]).includes(L.id))&&!ks.some(L=>learnerCourses(L).includes(s.courseId));};
const sessionsOf=cids=>entries(D.sessions).filter(s=>(cids.includes(s.courseId)||kidOrphan(s))&&seesSession(s)).sort(''')
