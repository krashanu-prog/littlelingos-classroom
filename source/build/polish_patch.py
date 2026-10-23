# ---- Final QA polish: consistent form fields and 44px touch targets ----
R('input[type=text],input[type=url],input[type=number],input[type=date],input[type=time],input[type=month],input[type=tel],input[type=search],input[type=datetime-local],select,textarea{','input[type=text],input[type=email],input[type=password],input[type=url],input[type=number],input[type=date],input[type=time],input[type=month],input[type=tel],input[type=search],input[type=datetime-local],select,textarea{')
R('@media (prefers-reduced-motion:reduce)','''.iconbtn{width:44px;height:44px;min-height:44px}
select.inline{min-height:44px}
.nm,.linkbtn{position:relative}
.nm::after,.linkbtn::after{content:"";position:absolute;left:50%;top:50%;width:max(calc(100% + 12px),44px);height:44px;transform:translate(-50%,-50%)}
@media (prefers-reduced-motion:reduce)''')
