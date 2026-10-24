exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import re as _re
CJ=open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/chesspkg/package/chess.js','rb').read()
SAFE=_re.compile(r'^(new|add|edit|view|open|show|how|invite|inviteHelp|help|profile|drawPad|funTab|mySpaceTab|libCards|tjNew|newHw|newLib|sendSticker)', _re.I)
report=[]
def check_page(p, who, label, phone):
    issues=[]
    t=p.locator('#main').inner_text() if p.locator('#main').count() else ''
    if len(t.strip())<20: issues.append('page nearly empty')
    for bad in ['undefined','NaN','[object Object]','null ·','Invalid Date']:
        if bad in t: issues.append('shows "%s"'%bad)
    ov=p.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
    if ov>2: issues.append('sideways scroll %dpx'%ov)
    return issues
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        for who in ['A','T1','P1','K1']:
            for phone in [False, True]:
                ctx,p=open_as(b,who,390 if phone else 1280,844 if phone else 900)
                ctx.route('**/cdn.jsdelivr.net/**', lambda r: r.fulfill(status=200,body=CJ,headers={'Content-Type':'application/javascript','Access-Control-Allow-Origin':'*'}))
                p.on('dialog', lambda d: d.dismiss())
                keys=p.evaluate("[...document.querySelectorAll('#nav a[data-go]')].map(a=>a.dataset.go)")
                allk=[]
                for k in keys:
                    p.evaluate("k=>document.querySelector('#nav a[data-go=\"'+k+'\"]').click()",k); p.wait_for_timeout(400)
                    for t in p.evaluate("[...document.querySelectorAll('.hubtab')].map(b=>b.dataset.go)") or [k]:
                        if t not in allk: allk.append(t)
                labels=allk
                for lab in labels:
                    if not lab: continue
                    n0=len(errors)
                    try:
                        p.evaluate("k=>{const el=document.querySelector('[data-go=\"'+k+'\"]');el.click();}",lab); p.wait_for_timeout(600)
                    except Exception as e:
                        report.append((who,'phone' if phone else 'desk',lab,['could not open: '+str(e)[:60]])); continue
                    iss=check_page(p,who,lab,phone)
                    if not phone:
                        acts=[]
                        for el in p.locator('#main [data-act]').all()[:60]:
                            a=el.get_attribute('data-act') or ''
                            if SAFE.match(a) and a not in [x[0] for x in acts] and el.is_visible(): acts.append((a,el))
                        for a,el in acts[:8]:
                            try:
                                el.click(timeout=3000); p.wait_for_timeout(400)
                                if p.locator('#boardwrap').count() and p.locator('#boardwrap').is_visible():
                                    p.wait_for_timeout(1500)
                                    if 'undefined' in p.locator('#boardwrap').inner_text(): iss.append('board shows undefined')
                                    p.locator('[data-bw="close"]').click(); p.wait_for_timeout(300)
                                    if p.locator('#modal-root form').count(): p.locator('#m-ok').click(); p.wait_for_timeout(300)
                                if p.locator('#modal-root form').count():
                                    mt=p.locator('#modal-root').inner_text()
                                    for bad in ['undefined','NaN','[object Object]']:
                                        if bad in mt: iss.append(f'dialog {a} shows "{bad}"')
                                    p.keyboard.press('Escape'); p.wait_for_timeout(200)
                                    if p.locator('#modal-root form').count(): p.locator('#modal-root [data-close]').first.click(); p.wait_for_timeout(200)
                                elif p.locator('#ll-gate').count():
                                    p.locator('#ll-skip').click(); p.wait_for_timeout(200)
                            except Exception as e:
                                iss.append(f'button {a}: '+str(e)[:50])
                    new=errors[n0:]
                    if new: iss+= ['JS: '+x[:120] for x in new]
                    report.append((who,'phone' if phone else 'desk',lab,iss))
                ctx.close()
        b.close()
finally: srv.terminate()
tot=0
for who,dev,lab,iss in report:
    if iss: tot+=1; print(f'{who:3} {dev:5} {lab:18} -> '+' | '.join(sorted(set(iss)))[:400])
print('pages checked:',len(report),'with issues:',tot)
print('LEAKS', {w:leaks(w) for w in ['P1','K1'] if w in bodies})
