# ---- Online fee payments with Razorpay ----
R('/* ================= events ================= */',open(W+'rzp_block.js').read()+'\n/* ================= events ================= */')
# parent Fees page: Pay online above the UPI box; the due banner mentions it
R('''  ${upiParentHTML(L,fk)}''','''  ${rzpParentHTML(L,fk)}
  ${upiParentHTML(L,fk)}''')
R('''${upiOn()?"Pay with UPI below, or pay the academy as usual.":"Pay the academy as usual; it shows here once recorded."}''',
  '''${rzpOn()?"Tap Pay now below to pay securely online.":upiOn()?"Pay with UPI below, or pay the academy as usual.":"Pay the academy as usual; it shows here once recorded."}''')
R('''  ${fk.remainingM>0?`<section class="alert ${late?"a-bad":"a-sun"}"><b>${late?"Overdue":"Due"}: ${money(fk.remainingM)}</b>''','''  ${fk.remainingM>0&&!(rzpOn()&&!rzpDues(L,fk).length)?`<section class="alert ${late?"a-bad":"a-sun"}"><b>${late?"Overdue":"Due"}: ${money(fk.remainingM)}</b>''')
# admin Fees page: recent online payments next to the UPI confirmations
R('''  ${upiAdminHTML()}''','''  ${rzpAdminHTML()}
  ${upiAdminHTML()}''')
# Settings › Billing: setup panel at the top
R('''  else if(tab==="billing"){const R=s.reminders||{before:3,onDue:true,after:[3,7]};body=`<section class="card panel"><div class="ph"><h2>Plans</h2>''',
  '''  else if(tab==="billing"){const R=s.reminders||{before:3,onDue:true,after:[3,7]};body=`${rzpSetupHTML()}<section class="card panel"><div class="ph"><h2>Plans</h2>''')
# recording a payment by hand: "Online" is a method too
R('const METHODS=["UPI","Cash","Bank transfer","Card","Cheque"];','const METHODS=["UPI","Cash","Bank transfer","Card","Cheque","Razorpay"];')
R('@media (prefers-reduced-motion:reduce)','''.paybox{border-color:var(--leafMid)}.payrow{flex-wrap:wrap}.payrow .btn{min-height:44px}
#rzp-setup code{background:var(--ground);padding:1px 5px;border-radius:6px;font-size:.92em}
@media (prefers-reduced-motion:reduce)''')
