exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
FAKE="""window.Razorpay=function(o){this.o=o;this.h={};};Razorpay.prototype.on=function(e,f){this.h[e]=f};Razorpay.prototype.open=function(){const o=this.o;window.__rzpOpts=o;setTimeout(()=>o.handler({razorpay_order_id:o.order_id,razorpay_payment_id:'pay_FAKE123',razorpay_signature:'sig'}),300);};"""
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        # admin switches online payments on
        ctx, p = open_as(b, 'A'); nav(p, 'Settings'); p.locator('[data-act="stab"][data-id="billing"]').click(); p.wait_for_timeout(500)
        print('A billing has setup panel:', p.locator('#rzp-setup').count(), '| pill:', p.locator('#rzp-setup .pill').inner_text())
        p.locator('[data-act="rzpPing"]').click(); p.wait_for_timeout(800); print('A ping:', p.locator('#rzp-ping').inner_text())
        p.locator('[data-act="rzpToggle"]').click(); p.wait_for_timeout(800); print('A modal:', p.locator('.modal h2, dialog h2').first.inner_text() if p.locator('.modal h2, dialog h2').count() else p.locator('#toast-root').inner_text())
        p.locator('form.modal button[type=submit]').first.click(); p.wait_for_timeout(1000)
        print('A toast:', p.locator('#toast-root').inner_text(), '| pill now:', p.locator('#rzp-setup .pill').inner_text())
        nav(p, 'Families'); nav(p, 'Fees'); p.wait_for_timeout(500); print('A fees has Online payments panel:', 'Online payments' in p.locator('#main').inner_text())
        ctx.close()
        # parent pays
        ctx, p = open_as(b, 'P1')
        ctx.route('**/checkout.razorpay.com/**', lambda r: r.fulfill(status=200, body=FAKE, headers={'Content-Type': 'application/javascript'}))
        p.on('console', lambda m: print('  console:', m.text[:160]) if m.type in ('error',) else None)
        nav(p, 'Fees'); p.wait_for_timeout(500)
        if p.locator('#gate').count():
            q = p.locator('#gate label').inner_text(); print('P1 gate:', q)
            import re as _r; W={'three':3,'four':4,'five':5,'six':6,'seven':7,'eight':8,'nine':9}; m=_r.search(r'What is (\w+) times (\w+)', q); p.fill('#gate-a', str(W[m.group(1)]*W[m.group(2)])); p.locator('#gate button[type=submit]').click(); p.wait_for_timeout(700)
        t = p.locator('#main').inner_text(); print('P1 fees has Pay online:', 'Pay online' in t, '| due banner:', [x.split('\n')[0] for x in p.locator('section.alert').all_inner_texts()][:1])
        btn = p.locator('[data-act="rzpPay"]'); print('P1 pay buttons:', btn.count(), btn.first.inner_text() if btn.count() else '')
        p.screenshot(path=T + 'r_rzp_before.png'); btn.first.click(); p.wait_for_timeout(2500)
        print('P1 checkout opts:', p.evaluate("window.__rzpOpts?{key:__rzpOpts.key,amount:__rzpOpts.amount,order:__rzpOpts.order_id,name:__rzpOpts.name,desc:__rzpOpts.description,color:__rzpOpts.theme.color}:null"))
        print('P1 toast:', p.locator('#toast-root').inner_text()); p.wait_for_timeout(800)
        t = p.locator('#main').inner_text(); print('P1 Pay online still shown:', 'Pay online' in t, '| pay buttons:', p.locator('[data-act="rzpPay"]').count())
        p.screenshot(path=T + 'r_rzp_parent.png', full_page=True)
        print('P1 LEAKS:', leaks('P1')); ctx.close()
        import psycopg2; c = psycopg2.connect(host='127.0.0.1', user='postgres', password='pw', dbname='e2e'); cur = c.cursor()
        cur.execute("select data->'payments' from public.docs where path='fees/l1'"); print('DB fees/l1 payments:', cur.fetchone()[0])
        cur.execute("select path, data->>'status', data->>'amount' from public.docs where path like 'rzp/%'"); print('DB rzp docs:', cur.fetchall())
        cur.execute("select data->'academy'->>'rzp' from public.docs where path='config/app'"); print('DB config rzp:', cur.fetchone()[0])
        b.close()
finally:
    srv.terminate()
