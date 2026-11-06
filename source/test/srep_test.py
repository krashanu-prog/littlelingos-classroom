exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2,json,datetime
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
st=(datetime.datetime.utcnow()-datetime.timedelta(hours=2)).strftime('%Y-%m-%dT%H:%M:%S.000Z')
cur.execute("insert into public.docs(path,data) values ('sessions/srep1',%s::jsonb) on conflict (path) do update set data=excluded.data",(json.dumps({"courseId":"c1","trainerId":"t1","title":"Phonics fun","startsAt":st,"durationMin":45,"forLids":["l1","l2"],"url":""}),)); c.commit()
OUT='/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/'
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        ctx,p=open_as(b,'A'); p.wait_for_timeout(800); print('ADMIN banner:',p.locator('.srepban').inner_text().replace('\n',' ') if p.locator('.srepban').count() else 'none'); ctx.close()
        ctx,p=open_as(b,'T1'); p.wait_for_timeout(5000)
        print('TRAINER popup:',p.locator('#modal-root').inner_text().replace('\n',' ')[:200])
        p.screenshot(path=OUT+'srep_popup.png')
        p.locator('#modal-root [data-mact="fill"]').first.click(); p.wait_for_timeout(700)
        p.locator('[data-mact="all"]').click(); p.wait_for_timeout(200)
        p.locator('#modal-root button[type="submit"]').click(); p.wait_for_timeout(600)
        print('SAVE EMPTY ->',(p.locator('.modal .err, .modal [role="alert"], #modal-root .formerr').all_inner_texts() or [p.locator('#modal-root').inner_text()[-260:]])[0].replace('\n',' '))
        p.screenshot(path=OUT+'srep_form.png')
        for lid,txt in [('l1','Anaya read the new words aloud confidently. Practise the /th/ sound.'),('l2','Rohan joined in the song and answered two questions.')]:
            p.select_option(f'select[name="p_{lid}"]','2'); p.select_option(f'select[name="u_{lid}"]','3'); p.fill(f'textarea[name="n_{lid}"]',txt)
        p.locator('#modal-root button[type="submit"]').click(); p.wait_for_timeout(1500)
        print('after save, modal open:',p.locator('#modal-root .modal').count(),'| banner:',p.locator('.srepban').count())
        cur.execute("select data->'notes' from docs where path like 'tw/%/x/m-srep1'"); print('saved notes:',cur.fetchone()[0])
        ctx.close()
        ctx,p=open_as(b,'P1'); p.wait_for_timeout(500)
        txt=p.locator('main').inner_text()
        for nav_l in ['Classes','Progress','Overview']:
            try: nav(p,nav_l); p.wait_for_timeout(500)
            except Exception: continue
            t=p.locator('main').inner_text()
            if 'Participation' in t: i=t.index('Participation'); print('PARENT sees on',nav_l,':',t[i-60:i+160].replace('\n',' ')); break
        else: print('PARENT: report text not found on Classes/Progress/Overview')
        print('errors:', errors[:5]); b.close()
finally: srv.terminate()
