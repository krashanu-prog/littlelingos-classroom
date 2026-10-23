# ---- Phase 1: UPI payments ----
R('/* ================= events ================= */',open(W+'upi_block.js').read()+'\n/* ================= events ================= */')
R('''<div class="field"><label for="sa-a">Address (on invoices)</label><textarea id="sa-a" name="address" rows="2" maxlength="300">${esc(a.address||"")}</textarea></div>''',
  '''<div class="field"><label for="sa-a">Address (on invoices)</label><textarea id="sa-a" name="address" rows="2" maxlength="300">${esc(a.address||"")}</textarea></div>
    <div class="two"><div class="field"><label for="sa-upi">UPI ID for fee payments</label><input type="text" id="sa-upi" name="upi" maxlength="100" autocomplete="off" value="${esc(a.upi||"")}" placeholder="e.g. littlelingos@okhdfcbank"><span class="hint">Parents see a Pay with UPI button and QR code on their Fees page.</span></div><div class="field"><label for="sa-upn">Payee name shown in UPI apps</label><input type="text" id="sa-upn" name="upiName" maxlength="50" value="${esc(a.upiName||"")}" placeholder="e.g. Little Lingos"></div></div>''')
R('''address:f.address.value.trim()};''','''address:f.address.value.trim(),upi:(f.upi?f.upi.value.trim():a0upi()),upiName:(f.upiName?f.upiName.value.trim():(CFG().academy||{}).upiName||"")};if(a.upi&&!/^[\\w.\\-]{2,256}@[a-zA-Z][\\w.\\-]{1,64}$/.test(a.upi))throw userErr("Check the UPI ID. It looks like name@bank.");''')
R('const ACAD=()=>({name:"Little Lingos",...(D.config.academy||{})});','const ACAD=()=>({name:"Little Lingos",...(D.config.academy||{})});\nconst a0upi=()=>(CFG().academy||{}).upi||"";')
R('''. Pay the academy as usual; it shows here once recorded.</span></section>`:""}''','''. ${upiOn()?"Pay with UPI below, or pay the academy as usual.":"Pay the academy as usual; it shows here once recorded."}</span></section>`:""}
  ${upiParentHTML(L,fk)}''')
R('''<p class="small muted">From your reminder rules in Settings → Billing.</p></section>`:"";})()}''','''<p class="small muted">From your reminder rules in Settings → Billing.</p></section>`:"";})()}
  ${upiAdminHTML()}''')
R('''      const ld=pipTry(()=>adList("leads").filter(x=>x.status==="new").length)||0;''','''      const up=pipTry(()=>upiPending().length)||0;if(up)add(`${up} UPI payment${up===1?"":"s"} to confirm`,"fees",true);
      const ld=pipTry(()=>adList("leads").filter(x=>x.status==="new").length)||0;''')
R('@media (prefers-reduced-motion:reduce)','''.upirow{flex-wrap:wrap}.upibtns{gap:6px;flex-wrap:wrap}
.qrbox{width:min(260px,70vw);margin:0 auto;background:#fff;border-radius:16px;padding:8px;border:2px solid var(--line)}.qrbox svg{width:100%;height:auto;display:block}
.upiqr{display:flex;flex-direction:column;gap:10px}
@media (prefers-reduced-motion:reduce)''')
