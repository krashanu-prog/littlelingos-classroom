exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2, json as _j
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
cur.execute("insert into public.docs(path,data) values ('courses/c2',%s) on conflict do nothing",(_j.dumps({"title":"Story Time","stage":"Sprouts","lang":"English"}),))
for i,n in enumerate(['Zara','Ishaan','Meera','Kabir','Tara','Aarav','Diya','Vihaan','Anika','Reyansh','Saanvi','Advik']):
    cur.execute("insert into public.docs(path,data) values (%s,%s) on conflict do nothing",(f'learners/x{i}',_j.dumps({"name":n,"stage":"Sprouts","courses":["c2"],"trainerId":"t1","parents":[],"active":True,"createdAt":1})))
c.commit()
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        ctx, p = open_as(b, 'A'); nav(p,'Classes'); p.wait_for_timeout(500)
        p.locator('[data-act="newSession"]').first.click(); p.wait_for_timeout(800)
        vis=lambda: p.evaluate("[...document.querySelectorAll('.kpick label.chip')].filter(l=>!l.hidden).length")
        tot=lambda: p.evaluate("document.querySelectorAll('.kpick label.chip').length")
        print('course:', p.evaluate("document.querySelector('select[name=course]').selectedOptions[0].text"), '| chips visible', vis(), 'of', tot())
        print('dividers:', p.evaluate("[...document.querySelectorAll('.kpdiv')].filter(d=>!d.hidden).map(d=>d.textContent)"))
        p.locator('[data-kp="all"]').click(); p.wait_for_timeout(200); print('Everyone in this course ->', p.locator('.kpn').inner_text())
        p.locator('[data-kp="none"]').click()
        p.fill('.kps','mee'); p.wait_for_timeout(200); print('search "mee" visible:', vis(), p.evaluate("[...document.querySelectorAll('.kpick label.chip')].filter(l=>!l.hidden).map(l=>l.textContent.trim())"))
        p.fill('.kps',''); p.wait_for_timeout(200)
        opts=p.evaluate("[...document.querySelector('select[name=course]').options].map(o=>o.value)"); print('course options', opts)
        if 'c2' in opts:
            p.select_option('select[name=course]','c2'); p.wait_for_timeout(300); print('after switching to c2 visible', vis(), 'of', tot())
            p.locator('[data-kp="all"]').click(); p.wait_for_timeout(200); print('Everyone in c2 ->', p.locator('.kpn').inner_text())
        p.locator('form.modal').screenshot(path=T+'r_kp.png')
        b.close()
finally: srv.terminate()
