exec(open('/home/claude/ws/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); c.autocommit=True; cur=c.cursor()
users['SL']=(U('f1'),'sales@x.com')
cur.execute("insert into auth.users(id,email,raw_user_meta_data,email_confirmed_at) values (%s,'sales@x.com','{}',now()) on conflict do nothing",(users['SL'][0],))
def snap():
    cur.execute("select count(*), md5(string_agg(path||data::text,'' order by path)) from public.docs"); return cur.fetchone()
REAL=['Anaya','Meera Iyer','Vikram','p1@x.com','Sharma']
errs=[]
with sync_playwright() as pw:
    b=pw.chromium.launch()
    # ---- super admin adds a sales team member
    ctx,p=open_as(b,'A'); p.on('pageerror',lambda e:errs.append(str(e))); p.wait_for_timeout(1200)
    nav(p,'Settings'); p.wait_for_timeout(1200)
    card=p.locator('.salescard'); print('admin sees sales card:',card.count(),'|',card.locator('.pill').inner_text() if card.count() else '')
    p.fill('.salesadd input[name=n]','Riya'); p.fill('.salesadd input[name=e]','not-an-email'); p.locator('.salesadd button').click(); p.wait_for_timeout(800)
    p.fill('.salesadd input[name=e]','Sales@X.com'); p.locator('.salesadd button').click(); p.wait_for_timeout(1500)
    print('team list:',p.locator('.salescard .item').all_inner_texts())
    p.locator('.salescard').screenshot(path='test/sales_card.png')
    ctx.close()
    cur.execute("select email,name from ll_sales"); print('db ll_sales:',cur.fetchall())
    before=snap()
    # ---- the salesperson
    ctx,p=open_as(b,'SL'); p.on('pageerror',lambda e:errs.append(str(e))); p.wait_for_timeout(1800)
    print('view-as choices:',p.locator('#viewas option').all_inner_texts())
    print('note:',p.locator('.prevnote').first.inner_text()[:90].replace('\n',' ') if p.locator('.prevnote').count() else 'NONE')
    navs=list(dict.fromkeys(p.evaluate("()=>[...document.querySelectorAll('#nav [data-go]')].map(a=>a.dataset.go)"))); print('learner nav:',navs)
    seen=''
    for g in navs:
        p.locator(f'#nav [data-go="{g}"]').first.click(); p.wait_for_timeout(700); seen+=p.locator('main').inner_text()
    p.screenshot(path='test/sales_kid.png')
    # try saving something as the "child"
    p.locator('#nav [data-go]').first.click(); p.wait_for_timeout(500)
    for sel in ['[data-act="pipMood"]','[data-act="rateEmo"]','[data-act="wodSaid"]','[data-act="plantWord"]']:
        if p.locator(sel).count(): p.locator(sel).first.click(); p.wait_for_timeout(600); print('clicked',sel)
    for st in ['Seeds','Sprouts','Blooms']:
        p.select_option('#viewas','parent:'+st); p.wait_for_timeout(1000)
        print('parent',st,'| bar:',p.locator('.ppvbar').first.inner_text().replace('\n',' ')[:150])
    pn=list(dict.fromkeys(p.evaluate("()=>[...document.querySelectorAll('#nav [data-go]')].map(a=>a.dataset.go)"))); print('parent nav:',pn)
    for g in pn:
        p.locator(f'#nav [data-go="{g}"]').first.click(); p.wait_for_timeout(700); seen+=p.locator('main').inner_text()
    p.screenshot(path='test/sales_parent.png')
    print('real names shown to sales:',[n for n in REAL if n in seen])
    data=' '.join(t for (u,s,t) in bodies['SL']); print('real data in responses:',[n for n in REAL if n in data],'| learners rows:', data.count('"learners/'))
    # admin-only actions are refused by the database
    r=p.evaluate("async()=>{const a=await window.LL_sb.rpc('ll_sales_add',{e:'x@y.com',n:'x'});const b=await window.LL_sb.rpc('ll_sales_list');return [a.error&&a.error.message,b.error&&b.error.message]}"); print('sales calling admin functions:',r)
    p.goto(p.url.split('#')[0]+'#settings'); p.wait_for_timeout(800); print('sales opening #settings ->',p.locator('main h1').first.inner_text() if p.locator('main h1').count() else '-')
    ctx.close()
    print('database unchanged by sales:',before==snap())
    # ---- remove them again
    ctx,p=open_as(b,'A'); p.on('pageerror',lambda e:errs.append(str(e))); p.wait_for_timeout(1000); nav(p,'Settings'); p.wait_for_timeout(1200)
    p.on('dialog',lambda d:d.accept()); p.locator('[data-act="salesRemove"]').first.click(); p.wait_for_timeout(1500)
    print('after remove:',p.locator('.salescard').inner_text().count('sales@x.com'))
    ctx.close()
    ctx,p=open_as(b,'SL',390,844); p.wait_for_timeout(1800); print('removed salesperson sees:',p.locator('main').inner_text()[:80].replace('\n',' '),'| view-as:',p.locator('#viewas').count()); ctx.close()
    # ---- an admin who is not a super admin has no sales card
    cur.execute("update ll_admins set super=false")
    ctx,p=open_as(b,'A'); p.wait_for_timeout(1000); nav(p,'Settings'); p.wait_for_timeout(1200); print('non-super admin sales card:',p.locator('.salescard').count()); ctx.close()
    cur.execute("update ll_admins set super=true")
print('errors',errs+errors[:5])
