exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2,json,time,datetime
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
cur.execute("""update public.docs set data = data || '{"stage":"Sprouts"}' where path='learners/l1'""")
cur.execute("select data->>'uid' from docs where path='learners/l1'"); kuid=cur.fetchone()[0]
now=int(time.time()*1000); day=86400000
d=lambda n: (datetime.date.today()-datetime.timedelta(days=n)).isoformat()
acts={f"a{i}":v for i,v in enumerate([
 {"k":"quiz","t":"Word quiz","s":6,"n":8,"at":now-1*day},{"k":"build","t":"Sentence builder","s":4,"n":6,"at":now-2*day},
 {"k":"miss","t":"Missing letter","s":7,"n":8,"at":now-2*day},{"k":"listen","t":"Listen and pick","s":3,"n":7,"at":now-3*day},
 {"k":"en","t":"Word power · Sprouts","s":9,"n":12,"at":now-4*day},{"k":"gk","t":"GK quiz · Sprouts","s":5,"n":6,"at":now-5*day},
 {"k":"lesson","t":"Weather watch","at":now-3*day},{"k":"odd","t":"Odd one out","s":8,"n":8,"at":now-12*day}])}
prog={"screen":{d(0):12,d(1):18,d(3):25,d(5):9,d(12):30},"acts":acts,
 "wk":{"breeze":{"r":1,"m":2,"l":0,"t":now},"forecast":{"r":0,"m":3,"l":0,"t":now},"curious":{"r":3,"m":0,"l":1,"t":now},"gentle":{"r":2,"m":0,"l":1,"t":now},"vendor":{"r":1,"m":1,"l":1,"t":now}},
 "adl":{"quiz":4,"build":2,"miss":3,"listen":1,"en-Sprouts":3}}
cur.execute("insert into public.docs(path,data) values (%s,%s::jsonb) on conflict (path) do update set data=public.docs.data||excluded.data",('progress/'+kuid,json.dumps(prog))); c.commit()
mk={"kind":"mark","sid":"srx","at":now,"by":"00000000-0000-0000-0000-0000000000b1","date":datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z'),"courseId":"c1","title":"Phonics fun","m":{"l1":"present"},"note":"","notes":{"l1":"Participation: 😃 Good · Understanding: 🙂 Getting there · Anaya read three new words aloud. Practise the 'th' sound at home."}}
cur.execute("insert into public.docs(path,data) values ('tw/00000000-0000-0000-0000-0000000000b1/x/m-srx',%s::jsonb) on conflict (path) do update set data=excluded.data",(json.dumps(mk),)); c.commit()
OUT='/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/'
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        for w,h,tag in [(1280,900,'desk'),(390,844,'phone')]:
            ctx,p=open_as(b,'P1',w,h); nav(p,'Progress'); p.wait_for_timeout(700)
            if not p.locator('.repcard').count(): print('NO REPORT'); print(p.locator('main').inner_text()[:500])
            el=p.locator('.repcard'); el.screenshot(path=OUT+f'rep_{tag}.png')
            print(tag,'overflow:',p.evaluate("document.documentElement.scrollWidth-innerWidth"))
            if tag=='desk':
                print(p.locator('.repsum').inner_text())
                p.locator('[data-act="repP"][data-id="month"]').click(); p.wait_for_timeout(400)
                print('MONTH:',p.locator('.repsum p').first.inner_text())
                p.locator('[data-act="printReport"]').click(); p.wait_for_timeout(300)
            ctx.close()
        cur.execute("update public.docs set data = data - 'uid' where path='learners/l1'"); c.commit()
        ctx,p=open_as(b,'P1',1280,900); nav(p,'Progress'); p.wait_for_timeout(700)
        p.locator('.repcard').screenshot(path=OUT+'rep_unsigned.png'); print('UNSIGNED:',p.locator('.repsum').inner_text().replace('\n',' ')[:200]); print('  sections:',p.locator('.repsec h3').all_inner_texts(),'| term-report sections:',p.locator('main h2').all_inner_texts())
        ctx.close()
        print('errors:', errors[:5]); b.close()
finally: srv.terminate()
