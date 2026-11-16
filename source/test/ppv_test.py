exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); c.autocommit=True; cur=c.cursor()
cur.execute("select substr(path,10), data->>'name', data->>'stage' from public.docs where path like 'learners/%'"); kids=cur.fetchall(); print('learners:',kids)
# make sure each age group has a child
st=['Seeds','Sprouts','Blooms']
cur.execute("insert into public.docs(path,data) select 'learners/l9', data||jsonb_build_object('name','Kabir Rao','stage','Blooms') from public.docs where path='learners/l2' on conflict do nothing")
kids.append(('l9','Kabir Rao','Blooms'))
for i,(lid,n,s) in enumerate([kids[0],kids[1],kids[-1]]): cur.execute("update public.docs set data=data||jsonb_build_object('stage',%s) where path=%s",(st[i],'learners/'+lid))
errs=[]
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
    ctx,p=open_as(b,'A'); p.on('pageerror',lambda e:errs.append(str(e))); p.wait_for_timeout(800)
    print('options:',p.evaluate("()=>[...document.querySelectorAll('#viewas option')].map(o=>o.textContent)"))
    for s in st:
        p.select_option('#viewas','parent:'+s); p.wait_for_timeout(900)
        kid=p.locator('#ppv-kid').input_value() if p.locator('#ppv-kid').count() else None
        kname=p.locator('#ppv-kid option:checked').inner_text() if kid else 'none'
        navs=p.evaluate("()=>[...document.querySelectorAll('nav [data-go], .nav [data-go], #nav [data-go]')].map(a=>a.dataset.go)")
        navs=list(dict.fromkeys(navs))
        print('==',s,'| child:',kname,'| pages:',navs)
        for g in navs:
            p.locator(f'[data-go="{g}"]').first.click(); p.wait_for_timeout(800)
            t=p.locator('main').inner_text()
            first=kname.split(' (')[0].split(' ')[0]
            p.screenshot(path=f'test/ppv_{s}_{g}.png')
            subs=[x for x in dict.fromkeys(p.evaluate("()=>[...document.querySelectorAll('main [data-go]')].map(a=>a.dataset.go)")) if x not in navs]
            for sg in subs:
                n0=len(errs); p.locator(f'main [data-go="{sg}"]').first.click(); p.wait_for_timeout(700)
                print('      sub',sg.ljust(10),'| h1:',(p.locator('main h1').first.inner_text() if p.locator('main h1').count() else '-')[:40],'| child named:',kname.split(' ')[0].lower() in p.locator('main').inner_text().lower(),'| new errors:',len(errs)-n0)
                p.locator(f'[data-go="{g}"]').first.click(); p.wait_for_timeout(500)
            print('  ',g.ljust(10),'| h1:',(p.locator('main h1').first.inner_text() if p.locator('main h1').count() else '-')[:40].ljust(40),'| mentions child:',first.lower() in t.lower(),'| empty-state:', any(x in t for x in ['No children','Link your child','connect your child','Add your child']))
        p.screenshot(path=f'test/ppv_{s}.png',full_page=False)
    ctx.close()
print('errors',errs)
