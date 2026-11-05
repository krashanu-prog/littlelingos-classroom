# ---- Home language: pick at first sign-in, meanings in the mother tongue, admin Translations page ----
R('/* ================= events ================= */',open(W+'lang_block.js').read()+'\n/* ================= events ================= */')
R('if(needsConsent())return consentHTML();','if(needsConsent())return consentHTML();\n  if(needsLang())return langPickHTML();')
R('btn.innerHTML=on?`<b>${esc(m)}</b><span>${esc(w)}</span>`','btn.innerHTML=on?`<b>${esc(m)}</b>${mtHTML(w)}<span>${esc(w)}</span>`')
R('<b>${esc(flipped?x.m:x.w)}</b><span>${flipped?esc(x.w):"tap to flip"}</span>','<b>${esc(flipped?x.m:x.w)}</b>${flipped?mtHTML(x.w):""}<span>${flipped?esc(x.w):"tap to flip"}</span>')
R('<p class="wodmean">${esc(x.mean||"")}</p>','<p class="wodmean">${esc(x.mean||"")}</p>${mtHTML(x.word,"wodmt")}',3)
R('<div class="grow"><b>${esc(w)}</b><span>${esc(ex)}</span></div>','<div class="grow"><b>${esc(w)}</b>${mtHTML(w)}<span>${esc(ex)}</span></div>')
R('`The answer is “${esc(q.ans)}”.`}','`The answer is “${esc(q.ans)}”.`}${mt(q.say)?` <span class="mtline">“${esc(q.say)}” = ${mtHTML(q.say)}</span>`:""}')
R('<td>${esc(w.m)}</td>','<td>${esc(w.m)}${mt(w.w)?` · ${mtHTML(w.w)}`:""}</td>')
R('<div class="row"><b>Secret pictures</b>','${l2Row()}\n    <div class="row"><b>Secret pictures</b>')
R('<div class="field"><label for="pr-l">Language for dates and numbers</label>','${l2Row()}\n    <div class="field"><label for="pr-l">Language for dates and numbers</label>')
R('''["pipvoice","Pip's voice","sound",pvMissing().length],''','''["pipvoice","Pip's voice","sound",pvMissing().length],["trans","Translations","cards"],''')
R('''["pipvoice","Pip's voice"]]]''','''["pipvoice","Pip's voice"],["trans","Translations"]]]''')
R('@media (prefers-reduced-motion:reduce)','''.mt{display:block;font-weight:700;font-size:1.05em;color:var(--leaf,#22703A);line-height:1.35;font-family:var(--body),"Noto Sans Tamil","Noto Sans Telugu","Noto Sans Malayalam","Noto Sans Kannada","Noto Naskh Arabic","Noto Sans Devanagari",sans-serif}
.flip .mt,.fcard .mt{margin:2px 0}.wodmt{font-size:1.25rem;margin:2px 0 0}.mtline .mt{display:inline}
.l2card{max-width:620px;gap:14px}.l2grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.l2btn{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:64px;padding:12px 16px;border-radius:18px;border:2px solid var(--line);background:#fff;cursor:pointer;font:inherit;text-align:left}
.l2btn b{font-size:1.35rem;line-height:1.2}.l2btn span{font-size:.85rem;color:var(--muted)}.l2btn:hover,.l2btn:focus-visible{border-color:var(--leaf)}.l2btn.en{background:var(--ground)}
.trtab td,.trtab th{white-space:nowrap}
@media (max-width:520px){.l2grid{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce)''')
R('''      ${clockChip(cur)}
      ${bellHTML()}''','''      ${l2Chip()}
      ${clockChip(cur)}
      ${bellHTML()}''')
R('@media (prefers-reduced-motion:reduce)','''.l2chip{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:6px 14px;border-radius:999px;border:2px solid var(--line);background:#fff;font:inherit;font-weight:700;color:var(--leaf);cursor:pointer}.l2chip:hover,.l2chip:focus-visible{border-color:var(--leaf)}
@media (max-width:600px){.l2chip{width:44px;padding:0;justify-content:center;flex:none}.l2chip span{display:none}}
@media (prefers-reduced-motion:reduce)''')
# games, flashcards, word cards and sheets use the home-language meaning
R('opts:shuffle([x,...others],r).map(o=>o.m),ans:x.m','...mQ(shuffle([x,...others],r),x)')
R('opts:shuffle([x,...others]).map(o=>o.m),ans:x.m','...mQ(shuffle([x,...others]),x)')
R('[{t:x.w,k:i,w:1},{t:x.m,k:i}]','[{t:x.w,k:i,w:1},{t:meanFor(x.w,x.m),k:i}]')
R('<b>${esc(flipped?x.m:x.w)}</b>${flipped?mtHTML(x.w):""}','<b>${esc(flipped?meanFor(x.w,x.m):x.w)}</b>${flipped?mtExtra(x.w,x.m):""}')
R('aria-label="${esc(flipped?`${x.w}: ${x.m}`','aria-label="${esc(flipped?`${x.w}: ${meanFor(x.w,x.m)}`')
R('btn.innerHTML=on?`<b>${esc(m)}</b>${mtHTML(w)}<span>${esc(w)}</span>`','btn.innerHTML=on?`<b>${esc(meanFor(w,m))}</b>${mtExtra(w,m)}<span>${esc(w)}</span>`')
R('<td>${esc(w.m)}${mt(w.w)?` · ${mtHTML(w.w)}`:""}</td>','<td>${esc(meanFor(w.w,w.m))}${mtExtra(w.w,w.m)}</td>')
R('${mt(q.say)?` <span class="mtline">','${q.k!=="mean"&&mt(q.say)?` <span class="mtline">')
