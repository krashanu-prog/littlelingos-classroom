import json,threading,functools,http.server,socketserver,datetime,re
from playwright.sync_api import sync_playwright
T='/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/'
SITE='/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/site'
FAKE=open(T+'fake-supabase.js').read()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=SITE)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
U=lambda c:'00000000-0000-0000-0000-0000000000'+c
A,T1,T2,P,K,S=U('aa'),U('b1'),U('b2'),U('cc'),U('dd'),U('ee')
users={A:'krashanuagarwal@gmail.com',T1:'meera@x.com',T2:'rohan@x.com',P:'priya@x.com',K:'anaya@x.com',S:'stranger@x.com'}
now=datetime.datetime.now(datetime.timezone.utc); iso=lambda d:d.isoformat().replace('+00:00','Z')
store={
 'config/app':{'ownerUid':A,'academy':{'name':'LittleLingos'}},
 'courses/ex-seeds':{'title':'First Words','level':'Seeds','language':'English','langCode':'en','hue':4},
 'lessons/ex-s1':{'courseId':'ex-seeds','order':1,'title':'Hello song','kind':'words','minutes':5,'vocab':'hello = नमस्ते'},
 'profiles/'+A:{'displayName':'Krashanu','role':'admin','createdAt':1},
 'trainers/t1':{'name':'Meera Iyer','uid':T1,'active':True},'trainers/t2':{'name':'Rohan Das','uid':T2,'active':True},
 'profiles/'+T1:{'displayName':'Meera Iyer','role':'teacher','createdAt':1},'profiles/'+T2:{'displayName':'Rohan Das','role':'teacher','createdAt':1},
 'learners/l1':{'name':'Anaya Sharma','stage':'Seeds','courses':['ex-seeds'],'trainerId':'t1','uid':K,'parents':[P],'active':True,'createdAt':1,'code':'K7P2QX'},
 'learners/l2':{'name':'Kabir Rao','stage':'Seeds','courses':['ex-seeds'],'trainerId':None,'uid':None,'parents':[P],'active':True,'createdAt':1,'code':'Q2W3E4'},
 'profiles/'+P:{'displayName':'Priya Sharma','role':'parent','createdAt':1,'consent':{'v':1,'at':1,'rec':True,'photo':True}},
 'profiles/'+K:{'displayName':'Anaya Sharma','role':'student','createdAt':1},
 'private/l2':{'guardian':'Priya Sharma','phone':'9876543210','email':'priya@example.com'},
 'fees/l1':{'monthly':1000,'start':now.strftime('%Y-%m'),'dueDay':10},
 'sessions/s1':{'courseId':'ex-seeds','title':'Animal friends','startsAt':iso(now+datetime.timedelta(hours=3)),'durationMin':40,'joinUrl':'https://meet.google.com/abc','trainerId':'t1'},
}
people={k:v for k,v in [(A,'Krashanu'),(T1,'Meera Iyer'),(T2,'Rohan Das'),(P,'Priya Sharma'),(K,'Anaya Sharma')]}
errors=[]
def open_as(b,who,st,ppl,w=1280,h=900):
    ctx=b.new_context(viewport={'width':w,'height':h})
    fk={'store':st,'people':ppl,'users':users,'admins':['krashanuagarwal@gmail.com'],'session':({'id':who,'email':users[who]} if who else None)}
    ctx.add_init_script("window.__FAKE__="+json.dumps(fk)+";")
    ctx.route(re.compile(r'.*/(vendor/)?supabase\.js(\?.*)?$'),lambda r:r.fulfill(status=200,content_type='application/javascript',body=FAKE))
    ctx.route('**/config.js',lambda r:r.fulfill(status=200,content_type='application/javascript',body='window.LL_CONFIG={supabaseUrl:"https://fake.supabase.co",supabaseAnonKey:"anon"};'))
    ctx.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    p=ctx.new_page(); nm=users.get(who,'anon')
    p.on('pageerror',lambda e:errors.append(f'[{nm}] {e}'))
    p.on('console',lambda m:errors.append(f'[{nm}] {m.type}: {m.text}') if m.type in('error','warning') and 'Failed to load resource' not in m.text else None)
    p.goto(f'http://127.0.0.1:{port}/'); p.wait_for_timeout(900); return ctx,p
def nav(p,l): p.locator('#nav a').filter(has=p.locator('span',has_text=re.compile('^'+l+'$'))).first.click(); p.wait_for_timeout(300)
def ok(p): p.locator('#m-ok').click(); p.wait_for_timeout(500)
with sync_playwright() as pw:
    b=pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
    # 1. sign in as admin through the email-code screen
    ctx,p=open_as(b,None,store,people,390,800)
    print('gate:',p.locator('#ll-gate h1').inner_text())
    p.screenshot(path=T+'g1_email.png')
    p.fill('#ll-em','krashanuagarwal@gmail.com'); p.click('#ll-go'); p.wait_for_timeout(300)
    print('code step:',p.locator('#ll-gate h1').inner_text(), '| fields:', p.evaluate("()=>[...document.querySelectorAll('#ll-gate input,#ll-gate button')].map(x=>x.id+(x.offsetParent?'':'(hid)'))"), '| err:', p.locator('#ll-err').all_inner_texts())
    p.fill('#ll-cd','111111'); p.click('#ll-go'); p.wait_for_timeout(300); print('bad code msg:',p.locator('#ll-err').inner_text())
    p.screenshot(path=T+'g2_code.png')
    p.fill('#ll-cd','123456'); p.click('#ll-go'); p.wait_for_timeout(1500)
    if p.locator('#ll-np').count():   # staff must choose a password after the first code sign-in
        print('password set-up:', p.locator('#ll-gate h1').inner_text()); p.fill('#ll-np','Test-pass-2026'); p.fill('#ll-np2','Test-pass-2026'); p.locator('#ll-setpw button[type=submit]').first.click(); p.wait_for_timeout(1500)
        if p.locator('#ll-done').count(): print('then:', p.locator('#ll-gate h1').inner_text()); p.click('#ll-done'); p.wait_for_timeout(1500)
    print('signed in, sign-in screen gone:',p.locator('#ll-gate').count()==0)
    p.screenshot(path=T+'g3_admin_phone.png'); ctx.close()
    # The rest of the old flows (assigning trainers, trainer and parent views, connecting new accounts, the trainer
    # and parent forms) now run against the real database in e2e_real.py, e2e_real2.py and crawl.py. This file
    # covers the sign-in screen: code by email, a wrong code, and the password staff must set after their first code.
    # this offline stand-in for Supabase has no database functions, so "profiles stopped updating" warnings are expected here
    print('ERRORS:',[e for e in errors if 'rpc(' not in e and 'stopped updating' not in e])
