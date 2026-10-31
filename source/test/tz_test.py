exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        # admin in India: nothing extra
        ctx, p = open_as(b, 'A'); nav(p,'Classes'); p.locator('[data-act="newSession"]').first.click(); p.wait_for_timeout(600)
        print('IST admin sees tz picker:', p.locator('select[name=startz]').count()); ctx.close()
        # trainer-like admin in Dubai schedules 6:00 pm IST
        TZID['A']='Asia/Dubai'
        ctx, p = open_as(b, 'A'); nav(p,'Classes'); p.locator('[data-act="newSession"]').first.click(); p.wait_for_timeout(600)
        print('Dubai picker:', p.locator('select[name=startz]').count(), '| default:', p.evaluate("document.querySelector('select[name=startz]').value"))
        p.fill('input[name=start]','2026-11-03T18:00'); p.wait_for_timeout(200)
        print('preview:', p.locator('#s-tzp').inner_text().replace('\n',' | '))
        p.select_option('select[name=startz]',''); p.wait_for_timeout(200)
        print('switch to my time ->', p.evaluate("document.querySelector('input[name=start]').value"), '|', p.locator('#s-tzp').inner_text().replace('\n',' | '))
        p.select_option('select[name=startz]','Asia/Kolkata'); p.wait_for_timeout(200)
        print('back to IST ->', p.evaluate("document.querySelector('input[name=start]').value"))
        p.locator('[data-kp="all"]').click(); p.fill('input[name=title]','TZ test class')
        p.locator('form.modal button[type=submit]').first.click(); p.wait_for_timeout(1500)
        c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
        cur.execute("select data->>'startsAt' from public.docs where path like 'sessions/%' and data->>'title'='TZ test class'"); print('saved startsAt (UTC):', cur.fetchone())
        ctx.close()
        # kid in Dubai sees IST beside class time
        TZID['K1']='Asia/Dubai'
        ctx, p = open_as(b, 'K1'); nav(p,'Classes'); p.wait_for_timeout(800)
        p.locator('[data-act="wkShift"][data-id="1"]').click(); p.wait_for_timeout(600)
        t=p.locator('#main').inner_text(); import re as _r
        print('kid Dubai sees IST:', 'IST' in t, '|', [l for l in t.split('\n') if 'IST' in l][:3])
        p.screenshot(path=T+'r_tz_kid.png'); ctx.close()
        TZID['P1']='Asia/Dubai'
        ctx, p = open_as(b, 'P1'); nav(p,'Classes'); p.wait_for_timeout(1000)
        if p.locator('#gate').count():
            q=p.locator('#gate label').inner_text(); W={'three':3,'four':4,'five':5,'six':6,'seven':7,'eight':8,'nine':9}; m=_r.search(r'What is (\w+) times (\w+)', q)
            if m: p.fill('#gate-a', str(W[m.group(1)]*W[m.group(2)])); p.locator('#gate button[type=submit]').click(); p.wait_for_timeout(700)
        t=p.locator('#main').inner_text(); print('parent Dubai:', [l for l in t.split('\n') if 'IST' in l][:3]); p.screenshot(path=T+'r_tz_parent.png'); ctx.close()
        TZID['K1']='Asia/Kolkata'
        ctx, p = open_as(b, 'K1'); nav(p,'Classes'); p.wait_for_timeout(800); p.locator('[data-act="wkShift"][data-id="1"]').click(); p.wait_for_timeout(600)
        print('kid India sees IST text:', 'IST' in p.locator('#main').inner_text()); ctx.close()
        b.close()
finally: srv.terminate()
