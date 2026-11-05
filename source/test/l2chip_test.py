exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        for who,w in [('K1',1280),('K1',390),('P1',390)]:
            ctx, p = open_as(b, who, w, 844); p.wait_for_timeout(600)
            print(who,w,'chip:', p.locator('.l2chip').count(), p.locator('.l2chip').inner_text() if p.locator('.l2chip').count() else '')
            if w==390 and who=='K1': p.locator('header, .top').first.screenshot(path=T+'r_l2chip_phone.png')
            if who=='K1' and w==1280:
                p.locator('.l2chip').click(); p.wait_for_timeout(400); p.locator('form.modal .l2btn[data-id="ml"]').click(); p.wait_for_timeout(900)
                print('  now:', p.locator('.l2chip').inner_text()); cur.execute("select data->>'lang2' from public.docs where path=%s",('profiles/'+U('d1'),)); print('  saved:', cur.fetchone())
            ctx.close()
        ctx, p = open_as(b, 'A'); p.wait_for_timeout(500); print('admin chip:', p.locator('.l2chip').count()); ctx.close()
        print('errors:', errors[:3]); b.close()
finally: srv.terminate()
