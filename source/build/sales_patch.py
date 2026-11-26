# Super admin + sales team (demo-only accounts). See sales_block.js and supabase/sales-team.sql.
R('S.uid=me.id;S.isOwner=me.isOwner;','S.uid=me.id;S.isOwner=me.isOwner;S.isSuper=!!me.isSuper;S.isSales=!me.isOwner&&!!me.isSales;if(S.isSales&&S.viewAs!=="parent")S.viewAs="student";')
R('  if(S.isOwner)return "admin";\n','  if(S.isOwner)return "admin";\n  if(S.isSales)return "sales";\n')
R('function role(){const r=realRole();return (r==="admin"&&S.viewAs)?S.viewAs:r;}','function role(){const r=realRole();if(r==="sales")return S.viewAs==="parent"?"parent":"student";return (r==="admin"&&S.viewAs)?S.viewAs:r;}')
R('  if(S.isOwner)return {id:"_preview"','  if(S.isOwner||S.isSales)return {id:"_preview"')
R('realRole()==="admin"&&S.viewAs==="student"','isPv()&&S.viewAs==="student"',2)
R('const l2Preview=()=>realRole()==="admin"&&','const l2Preview=()=>isPv()&&')
R('const ppvOn=()=>realRole()==="admin"&&S.viewAs==="parent";','const ppvOn=()=>isPv()&&S.viewAs==="parent";')
R('right=`${r==="admin"?`<div class="viewas">','right=`${r==="admin"||r==="sales"?`<div class="viewas">')
R('return [["admin","Admin"],["teacher","Trainer"],...STAGES','return [...(S.isSales?[]:[["admin","Admin"],["teacher","Trainer"]]),...STAGES')
R('const [a,b]=v.value.split(":");S.viewAs=a==="admin"?null:a;','const [a,b]=v.value.split(":");if(S.isSales&&a!=="student"&&a!=="parent")return;S.viewAs=a==="admin"?null:a;')
R('/* ================= events ================= */', open(W+'sales_block.js').read()+'\n/* ================= events ================= */')
R('@media (prefers-reduced-motion:reduce)','''.salesadd{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;margin-top:10px}.salesadd label{display:grid;gap:4px;flex:1;min-width:180px}.salesadd input{min-height:44px}.salesadd .btn{min-height:44px}
@media (prefers-reduced-motion:reduce)''')
