exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2,json,datetime
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); c.autocommit=True; cur=c.cursor()
cur.execute("update public.docs set data=data||'{\"courses\":[]}'::jsonb where path='learners/l1'")
cur.execute("select substr(path,9) from public.docs where path like 'courses/%%' limit 1"); cid=cur.fetchone()[0]
t=(datetime.datetime.utcnow()+datetime.timedelta(days=1)).strftime('%Y-%m-%dT%H:%M:00.000Z')
cur.execute("insert into public.docs(path,data) values('sessions/zz-nocourse',%s) on conflict(path) do update set data=excluded.data",(json.dumps({'title':'Phonics fun','courseId':cid,'startsAt':t,'durationMin':40,'joinUrl':'https://meet.google.com/abc-defg-hij','forLids':['l1']}),))
errs=[]
with sync_playwright() as pw:
    b = pw.chromium.launch()
    for who in ['K1','P1']:
        ctx,p=open_as(b,who); p.on('pageerror',lambda e:errs.append(str(e))); p.wait_for_timeout(1000)
        home=p.locator('main').inner_text()
        p.locator('[data-go="schedule"]').first.click(); p.wait_for_timeout(1000)
        t2=p.locator('main').inner_text()
        print(who,'CLASSES PAGE:',t2[:600].replace(chr(10),' | '))
        print(who,'| home shows class:', 'Phonics fun' in home,'| Classes page shows class:', 'Phonics fun' in t2)
        ctx.close()
print('errors',errs)
