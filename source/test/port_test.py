exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
def draw_and_save(p, tag):
    nav(p,'Me'); p.wait_for_timeout(800); print(tag,'tiles before:', p.locator('.port .ptile').count())
    p.locator('[data-act="drawPad"]').first.click(); p.wait_for_timeout(1000)
    box=p.locator('#pad').bounding_box()
    p.mouse.move(box['x']+50,box['y']+50); p.mouse.down(); p.mouse.move(box['x']+200,box['y']+150,steps=8); p.mouse.up(); p.wait_for_timeout(300)
    p.locator('form.modal button[type=submit]').first.click(); p.wait_for_timeout(2000)
    print(tag,'toast:', p.locator('#toast-root').inner_text(), '| modal err:', p.locator('#m-err').inner_text() if p.locator('#m-err').count() else '')
    if p.locator('form.modal').count(): p.keyboard.press('Escape'); p.wait_for_timeout(300)
    nav(p,'Play'); nav(p,'Me'); p.wait_for_timeout(1200)
    print(tag,'portfolio tiles on Me:', p.locator('.port .ptile').count())
def stats(p,tag):
    print(tag,'stars text:', p.locator('.stat').first.inner_text().replace('\n',' ') if p.locator('.stat').count() else '')
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        errs=[]
        ctx, p = open_as(b, 'A'); p.on('console', lambda m: errs.append(m.text[:200]) if m.type=='error' and 'WebSocket' not in m.text else None)
        p.select_option('#viewas','student'); p.wait_for_timeout(1200)
        print('A-as-learner h1:', h1(p))
        draw_and_save(p,'A-as-learner')
        print('errors:', errs[:5]); ctx.close()
        errs=[]
        ctx, p = open_as(b, 'K1'); p.on('console', lambda m: errs.append(m.text[:200]) if m.type=='error' and 'WebSocket' not in m.text else None)
        print('K1 h1:', h1(p))
        draw_and_save(p,'K1')
        print('errors:', errs[:5]); ctx.close()
        import psycopg2; c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
        cur.execute("select path, data->>'kind', data->>'title' from public.docs where path like 'kp/%'"); print('DB kp:', cur.fetchall())
        b.close()
finally: srv.terminate()
