exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2,datetime
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); c.autocommit=True; cur=c.cursor()
t=(datetime.datetime.utcnow()+datetime.timedelta(minutes=45)).strftime('%Y-%m-%dT%H:%M:00.000Z')
cur.execute("select data from public.docs where path like 'sessions/%%' limit 1"); base=dict(cur.fetchone()[0])
base.update({'title':'Phonics fun','startsAt':t,'joinUrl':'https://meet.google.com/abc-defg-hij','forLids':['l1']})
cur.execute("insert into public.docs(path,data) values('sessions/zz-soon',%s) on conflict(path) do update set data=excluded.data",(json.dumps(base),))
cur.execute("""update public.docs set data=data||'{"gate":false}'::jsonb where path like 'profiles/%%' and data->>'role'='parent'""")
MOCK="""(()=>{let perm='default';try{Object.defineProperty(Notification,'permission',{get:()=>perm,configurable:true});Notification.requestPermission=async()=>{perm='granted';return perm};}catch(e){}const fake={endpoint:'https://fcm.googleapis.com/fcm/send/test123',toJSON(){return {endpoint:this.endpoint,keys:{p256dh:'BPk',auth:'au'}}},unsubscribe:async()=>true};
 let on=false; if(window.PushManager){PushManager.prototype.getSubscription=async function(){return on?fake:null};PushManager.prototype.subscribe=async function(){on=true;return fake};}})();"""
calls=[]
def fn(route):
    b=json.loads(route.request.post_data or '{}'); calls.append(b.get('action'))
    a=b.get('action'); res={'vapid':{'key':'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'},'subscribe':{'ok':True},'test':{'sent':1},'unsubscribe':{'ok':True},
      'status':{'email':'off','push':True,'devices':3,'cron':True,'lastRun':{'at':datetime.datetime.utcnow().isoformat()+'Z','checked':2,'emails':0,'pushes':3,'errors':[]}}}.get(a,{})
    route.fulfill(status=200,content_type='application/json',headers={'Access-Control-Allow-Origin':'*'},body=json.dumps(res))
errs=[]
with sync_playwright() as pw:
    b = pw.chromium.launch()
    # parent
    ctx,p=open_as(b,'P1'); ctx.grant_permissions(['notifications'],origin=p.url.split('#')[0].rstrip('/').rsplit('/',0)[0] if False else '/'.join(p.url.split('/')[:3])); ctx.add_init_script(MOCK); p.route('**/functions/v1/class-reminders',fn); p.on('pageerror',lambda e:errs.append(str(e)))
    p.reload(); p.wait_for_timeout(2500)
    print('P home nudge:',p.locator('.rmdnudge').count())
    p.locator('.rmdnudge [data-act="rmdOn"]').click(); p.wait_for_timeout(1500)
    print('  calls:',calls,'| toast:',p.locator('#toast-root').inner_text()[:80],'| nudge gone:',p.locator('.rmdnudge').count()==0)
    p.locator('[data-go="help"]').first.click(); p.wait_for_timeout(800); print('  on:',p.locator('main h1').first.inner_text()); p.locator('main [data-go="settings"]').first.click(); p.wait_for_timeout(1000)
    print('P settings card:',p.locator('.rmdcard').inner_text()[:160].replace(chr(10),' | '))
    p.locator('.rmdmail input').uncheck(); p.wait_for_timeout(1200)
    cur.execute("select data->'classRemind' from public.docs where path like 'profiles/%%' and data->>'role'='parent'"); print('  saved pref:',cur.fetchall())
    p.screenshot(path='test/remind_parent.png'); ctx.close()
    # trainer
    ctx,p=open_as(b,'T1'); p.on('pageerror',lambda e:errs.append(str(e))); p.wait_for_timeout(1500)
    nav(p,'Classes'); p.wait_for_timeout(800)
    rb=p.locator('[data-act="remindSession"][data-id="zz-soon"]').first
    print('T remind button:',rb.count())
    if rb.count():
        rb.click(); p.wait_for_timeout(600); print('  modal:',p.locator('#modal-root h2').first.inner_text(),'|',p.locator('#modal-root .sharebox').inner_text()[:140].replace(chr(10),' / '))
        print('  wa links:',p.locator('#modal-root a[href*="wa.me"]').count())
    p.screenshot(path='test/remind_trainer.png'); ctx.close()
    # admin
    ctx,p=open_as(b,'A'); p.route('**/functions/v1/class-reminders',fn); p.on('pageerror',lambda e:errs.append(str(e))); p.wait_for_timeout(1000)
    nav(p,'Settings'); p.wait_for_timeout(1500)
    print('A card:',p.locator('main').inner_text().split('Class reminders for families')[1][:260].replace(chr(10),' | ') if 'Class reminders for families' in p.locator('main').inner_text() else 'none')
    ctx.close()
    # child: nothing
    ctx,p=open_as(b,'K1'); p.on('pageerror',lambda e:errs.append(str(e))); p.wait_for_timeout(1500); print('K nudge/card:',p.locator('.rmdnudge,.rmdcard').count()); ctx.close()
print('errors',errs)
