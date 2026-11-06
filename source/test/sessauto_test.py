exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
cur.execute(open('supabase/starter-content.sql').read())
cur.execute("update public.docs set data=data||'{\"stage\":\"Blooms\"}' where path='learners/l1'"); cur.execute("update public.docs set data=data||'{\"stage\":\"Seeds\"}' where path='learners/l2'"); cur.execute("update public.docs set data=data||'{\"stage\":\"Seeds\"}' where path='learners/l3'"); c.commit()
cur.execute("select split_part(path,'/',2), data->>'name' from docs where path in ('learners/l1','learners/l2','learners/l3')"); names=dict(cur.fetchall()); print(names)
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        ctx,p=open_as(b,'A'); p.wait_for_timeout(300)
        nav(p,'Classes'); p.locator('[data-act="newSession"]').first.click(); p.wait_for_timeout(600)
        cs=lambda: p.eval_on_selector('#s-course','e=>e.options[e.selectedIndex].text')
        hint=lambda: p.locator('#s-cauto').inner_text() if p.locator('#s-cauto').count() else ''
        print('start course:',cs())
        p.locator('input[name="sl"][value="l1"]').check(); p.wait_for_timeout(200); print('pick Blooms kid ->',cs(),'|',hint())
        p.locator('input[name="sl"][value="l2"]').check(); p.wait_for_timeout(200); print('add a Seeds kid ->',cs(),'|',hint())
        p.locator('input[name="sl"][value="l1"]').uncheck(); p.wait_for_timeout(200); print('only the Seeds kid ->',cs(),'|',hint())
        p.locator('[data-kp="none"]').first.click(); p.wait_for_timeout(200); print('cleared ->',cs(),'|',repr(hint()))
        print('errors:', errors[:3]); b.close()
finally: srv.terminate()
