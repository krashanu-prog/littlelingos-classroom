exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); c.autocommit=True; cur=c.cursor()
def n(): cur.execute("select count(*) from public.docs where path like 'sessions/%'"); return cur.fetchone()[0]
errs=[]
cur.execute("select data from public.docs where path like 'sessions/%' limit 1"); base=cur.fetchone()[0]
import json,datetime
base=dict(base); base['joinUrl']=''; base['title']='Old class without link'; base['startsAt']=(datetime.datetime.utcnow()+datetime.timedelta(days=2)).isoformat()+'Z'
cur.execute("insert into public.docs(path,data) values('sessions/zz-old',%s)",(json.dumps(base),))
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
    for who in ['T1','A']:
        ctx,p=open_as(b,who); p.on('pageerror',lambda e:errs.append(str(e))); p.wait_for_timeout(800)
        print('==',who,'banner:',p.locator('.nolinkban').inner_text()[:120] if p.locator('.nolinkban').count() else 'none')
        if who=='T1' and p.locator('.nolinkban').count():
            p.locator('.nolinkban [data-act="editSession"]').click(); p.wait_for_timeout(500)
            p.fill('#s-url','https://zoom.us/j/123456'); p.locator('#modal-root button[type="submit"]').click(); p.wait_for_timeout(1200)
            cur.execute("select data->>'joinUrl' from public.docs where path='sessions/zz-old'"); print('  fixed old class link:',cur.fetchone()[0],'| banner now:',p.locator('.nolinkban').count())
        nav(p,'Classes'); p.wait_for_timeout(500)
        before=n()
        p.locator('[data-act="newSession"]').first.click(); p.wait_for_timeout(500)
        kid=p.locator('#modal-root input[name="sl"]').first
        if kid.count(): kid.check()
        p.fill('#s-title','Link test'); p.fill('#s-url','')
        p.locator('#modal-root button[type="submit"]').click(); p.wait_for_timeout(700)
        print('  empty link -> saved?',n()>before,'| msg:',(p.locator('#modal-root .formerr, #modal-root [role="alert"]').all_inner_texts() or p.locator('#toast-root').all_inner_texts()))
        p.fill('#s-url','meet.google.com/abc'); p.locator('#modal-root button[type="submit"]').click(); p.wait_for_timeout(700)
        print('  no https -> saved?',n()>before)
        p.fill('#s-url','https://meet.google.com/abc-defg-hij'); p.locator('#modal-root button[type="submit"]').click(); p.wait_for_timeout(1500)
        print('  with link -> saved?',n()>before)
        ctx.close()
    # database guard: a signed-in user's insert without a link is refused
    ctx,p=open_as(b,'T1'); p.wait_for_timeout(800)
    r=p.evaluate("""async()=>{const {error}=await window.LL_sb.from('docs').insert({path:'sessions/zz-nolink',data:{title:'x',courseId:'c1',forLids:['l1'],startsAt:new Date(Date.now()+864e5).toISOString()}});return error?error.message:'inserted'}""")
    print('db guard:',r[:90]); ctx.close()
print('errors',errs)
