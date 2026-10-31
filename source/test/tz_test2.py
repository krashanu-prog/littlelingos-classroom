exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        ctx, p = open_as(b, 'A'); nav(p,'Classes'); p.locator('[data-act="newSession"]').first.click(); p.wait_for_timeout(600)
        print('IST admin picker:', p.locator('select[name=startz]').count(), '| options:', p.evaluate("[...document.querySelector('select[name=startz]').options].map(o=>o.text)"))
        p.fill('input[name=start]','2026-11-03T18:00'); p.wait_for_timeout(200); print('preview IST:', p.locator('#s-tzp').inner_text().replace('\n',' | '))
        p.select_option('select[name=startz]','Asia/Dubai'); p.wait_for_timeout(200)
        print('as UAE ->', p.evaluate("document.querySelector('input[name=start]').value"), '|', p.locator('#s-tzp').inner_text().replace('\n',' | '))
        p.locator('form.modal').screenshot(path=T+'r_tz_form.png')
        p.locator('[data-kp="all"]').click(); p.fill('input[name=title]','TZ test class')
        p.locator('form.modal button[type=submit]').first.click(); p.wait_for_timeout(1500)
        c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
        cur.execute("select data->>'startsAt' from public.docs where path like 'sessions/%' and data->>'title'='TZ test class'"); print('saved:', cur.fetchone())
        t=p.locator('#main').inner_text(); print('admin list IST label:', [l for l in t.split('\n') if 'TZ test' in l or 'IST' in l][:3])
        ctx.close()
        ctx, p = open_as(b, 'K1'); nav(p,'Classes'); p.wait_for_timeout(800); p.locator('[data-act="wkShift"][data-id="1"]').click(); p.wait_for_timeout(600)
        print('kid India:', [l for l in p.locator('#main').inner_text().split('\n') if 'IST' in l][:2]); ctx.close()
        TZID['K1']='Asia/Dubai'
        ctx, p = open_as(b, 'K1'); nav(p,'Classes'); p.wait_for_timeout(800); p.locator('[data-act="wkShift"][data-id="1"]').click(); p.wait_for_timeout(600)
        print('kid Dubai:', [l for l in p.locator('#main').inner_text().split('\n') if 'IST' in l][:2]); ctx.close()
        b.close()
finally: srv.terminate()
