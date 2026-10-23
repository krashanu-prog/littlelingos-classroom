# ---- add learner: no duplicates, shorter form ----
_i=s.index('function learnerForm(L={},prefill={}){'); _j=s.index('async function saveLearner(f,form,id){',_i); _k=s.index('A.newLearner=',_j)
s=s[:_i]+open(W+'lf_block.js').read()+s[_k:]
R('A.newLearner=(_,__,prefill)=>openModal("Add learner",learnerForm({},prefill||{}),{wide:true,submitLabel:"Add learner",done:"Learner added",',
  'A.newLearner=(_,__,prefill)=>openModal("Add a learner",learnerForm({},prefill||{}),{wide:true,submitLabel:"Add learner",done:"Learner added",')
R('@media (prefers-reduced-motion:reduce)',open(W+'lf.css').read()+'@media (prefers-reduced-motion:reduce)')
