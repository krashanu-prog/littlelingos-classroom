# ---- security: sign-in & security screen, two-step nudge, safer memories file ----
R('A.setPassword=()=>{closeModal&&closeModal();if(window.LL_setPassword)LL_setPassword();};',
  'A.setPassword=()=>{closeModal&&closeModal();if(window.LL_security)LL_security();else if(window.LL_setPassword)LL_setPassword();};\nA.security=A.setPassword;\nfunction secNudgeHTML(){if(S.viewAs||!window.LL_twoStepOn||LL_twoStepOn())return "";\n  return `<section class="card panel secnudge"><p><b>Protect the children\'s data.</b> Turn on two-step sign-in, so nobody can get into this account with just your email or password.</p><button class="btn btn-primary btn-sm" data-act="security">Turn on</button></section>`;}')
R('data-mact="pw">Set or change password</button>','data-mact="pw">Sign-in &amp; security</button>')
R('data-act="setPassword">Set or change password</button>','data-act="setPassword">Sign-in &amp; security</button>')
R('data-act="setPassword">My password</button>','data-act="setPassword">My sign-in</button>')
R('You sign in with your email and a one-time code, or with a password once you set one. ','You sign in with your email and a one-time code, or with a password once you set one. For extra safety, turn on two-step sign-in. ')
R('home(){const r=role();return r==="student"?studentHome():r==="parent"?parentHome():r==="admin"?adminHome():trainerHome();},',
  'home(){const r=role();return r==="student"?studentHome():r==="parent"?parentHome():r==="admin"?secNudgeHTML()+adminHome():secNudgeHTML()+trainerHome();},')
R('${x.kind==="audio"?`<audio controls src="${x.data}"></audio>`:`<img src="${x.data}" alt="">`}',
  '${x.kind==="audio"?`<audio controls src="${esc(/^data:audio\\//.test(x.data)?x.data:"")}"></audio>`:`<img src="${esc(/^data:image\\//.test(x.data)?x.data:"")}" alt="">`}')
R('@media (prefers-reduced-motion:reduce)',open(W+'sec.css').read()+'@media (prefers-reduced-motion:reduce)')
