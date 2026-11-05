exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
cur.execute("""insert into public.docs(path,data) values ('batches/bt1','{"name":"Test batch","courseId":"c1","lids":["l1"]}') on conflict (path) do nothing"""); c.commit()
def stage(st): cur.execute("update public.docs set data = data || jsonb_build_object('stage',%s) where path='learners/l1'",(st,)); c.commit()
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        for st in ['Seeds','Sprouts','Blooms']:
            stage(st); ctx,p=open_as(b,'K1'); nav(p,'Explore'); p.wait_for_timeout(500)
            print('=====',st,'| mission:',p.locator('.mission b').first.inner_text())
            print('  cards:',[x.replace('\n',' ') for x in p.locator('.packcard').all_inner_texts()][:3])
            p.locator('.packcard').first.click(); p.wait_for_timeout(300)
            print('  cricket words:',[x.split('\n')[0] for x in p.locator('.pword .grow b').all_inner_texts()])
            print('  missions:',p.locator('ol.steps li').all_inner_texts())
            ctx.close()
        ctx,p=open_as(b,'A'); p.evaluate("document.querySelector('#nav a[data-go=\"library\"]').click()"); p.wait_for_timeout(500); p.evaluate("document.querySelector('[data-go=\"india\"]').click()"); p.wait_for_timeout(600); print('admin:',p.locator('.packcard').first.inner_text().replace('\n',' | '))
        p.locator('[data-act="msnAssign"]').first.click(); p.wait_for_timeout(300); print('assign options:', p.locator('#ma-m option').all_inner_texts())
        print('errors:', errors[:3]); b.close()
finally: srv.terminate()
