# ---- simpler menus: grouped pages with tabs, phone More, calmer home pages ----
R('function navHTML(){\n  if(S.status!=="ready"||!role()||role()==="pending"||lockNeeded())return "";\n  const parent=', 'function navHTMLOld(){\n  if(S.status!=="ready"||!role()||role()==="pending"||lockNeeded())return "";\n  const parent=')
R('/* ================= events ================= */',open(W+'nav2_block.js').read()+'\n/* ================= events ================= */')
_old = """return `<section class="card panel secnudge"><p><b>Protect the children's data.</b> Turn on two-step sign-in, so nobody can get into this account with just your email or password.</p><button class="btn btn-primary btn-sm" data-act="security">Turn on</button></section>`;}"""
_new = """let later=0;try{later=+localStorage.getItem("ll-2step-later")||0}catch(e){}if(Date.now()-later<7*864e5)return "";
  return `<section class="alert a-sun slimnudge"><span>🔒 <b>Protect the children's data:</b> turn on two-step sign-in.</span><span class="spacer"></span><button class="btn btn-ghost btn-sm" data-act="nudgeLater">Later</button><button class="btn btn-primary btn-sm" data-act="security">Turn on</button></section>`;}
A.nudgeLater=()=>{try{localStorage.setItem("ll-2step-later",String(Date.now()))}catch(e){}render(true);};"""
R(_old, _new)
R('@media (prefers-reduced-motion:reduce)',open(W+'nav2.css').read()+'@media (prefers-reduced-motion:reduce)')
