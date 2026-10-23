import json, base64, time, subprocess, re, sys
import subprocess as sp
from playwright.sync_api import sync_playwright
T = '/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/'
SITE = '/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/site'
PORT = 8765
srv = subprocess.Popen([sys.executable, T + 'minirest.py', str(PORT), 'e2e', SITE])
time.sleep(1.2)
U = lambda c: '00000000-0000-0000-0000-0000000000' + c
users = {'A': (U('0a'), 'krashanuagarwal@gmail.com'), 'T1': (U('b1'), 't1@x.com'), 'P1': (U('c1'), 'p1@x.com'),
         'P2': (U('c2'), 'p2@x.com'), 'K1': (U('d1'), 'k1@x.com'), 'S': (U('e1'), 's@x.com')}
b64 = lambda o: base64.urlsafe_b64encode(json.dumps(o).encode()).decode().rstrip('=')
def session(uid, email):
    exp = int(time.time()) + 86400
    jwt = b64({'alg': 'HS256', 'typ': 'JWT'}) + '.' + b64({'sub': uid, 'email': email, 'role': 'authenticated', 'aud': 'authenticated', 'exp': exp}) + '.sig'
    return {'access_token': jwt, 'refresh_token': 'r', 'token_type': 'bearer', 'expires_in': 86400, 'expires_at': exp,
            'user': {'id': uid, 'email': email, 'aud': 'authenticated', 'role': 'authenticated', 'app_metadata': {}, 'user_metadata': {}}}
errors = []; bodies = {}
def open_as(b, who, w=1280, h=900):
    uid, email = users[who]
    ctx = b.new_context(viewport={'width': w, 'height': h})
    ctx.add_init_script("localStorage.setItem('sb-127-auth-token', %s);" % json.dumps(json.dumps(session(uid, email))))
    ctx.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    p = ctx.new_page(); bodies[who] = []
    p.on('pageerror', lambda e: errors.append(f'[{who}] {e}'))
    p.on('console', lambda m: errors.append(f'[{who}] {m.type}: {m.text}') if m.type == 'error' and 'WebSocket' not in m.text and 'Failed to load resource' not in m.text and 'realtime' not in m.text.lower() else None)
    def onresp(r):
        if '/rest/v1/' in r.url:
            try: bodies[who].append((r.url, r.status, r.text()))
            except Exception: pass
    p.on('response', onresp)
    p.goto(f'http://127.0.0.1:{PORT}/'); p.wait_for_timeout(2500)
    return ctx, p
def nav(p, l): p.locator('#nav a').filter(has=p.locator('span', has_text=re.compile('^' + l + '$'))).first.click(); p.wait_for_timeout(700)
def h1(p): return p.locator('h1').first.inner_text() if p.locator('h1').count() else None
SECRETS = ['Rohan struggles', 'worried about Rohan', 'Rohan needs support', 'Rohan Khan', 'Farah', 'STAFF PLAN', 'p2@x.com']
def leaks(who): return sorted({s for (_, _, t) in bodies[who] for s in SECRETS if s in t})
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        # admin
        ctx, p = open_as(b, 'A'); print('A h1:', h1(p)); nav(p, 'Learners'); print('A learners rows:', p.locator('tbody tr').count())
        nav(p, 'Parents'); print('A parents on file:', [r.split('\t')[0].split('\n')[0] for r in p.locator('section.card.panel').nth(0).locator('tbody tr').all_inner_texts()])
        p.screenshot(path=T + 'r_admin.png'); ctx.close()
        # parent P1
        ctx, p = open_as(b, 'P1'); print('P1 h1:', h1(p), '| alerts:', [x.split('\n')[0] for x in p.locator('section.alert').all_inner_texts()][:3])
        nav(p, 'Classes'); p.wait_for_timeout(500); print('P1 classes text has Colours:', 'Colours' in p.content(), '| has Rohan 1:1:', 'Rohan 1:1' in p.content())
        print('P1 LEAKS:', leaks('P1')); p.screenshot(path=T + 'r_parent.png'); ctx.close()
        # parent P2 tries to book (fine) and P1 slot clash would be blocked server side
        ctx, p = open_as(b, 'P2'); print('P2 h1:', h1(p)); print('P2 LEAKS (should show only own):', [s for s in leaks('P2') if s not in ('worried about Rohan','Rohan needs support','Rohan Khan','Farah','Rohan struggles','p2@x.com')]); ctx.close()
        # student
        ctx, p = open_as(b, 'K1'); print('K1 h1:', h1(p)); print('K1 LEAKS:', leaks('K1')); ctx.close()
        # trainer
        ctx, p = open_as(b, 'T1'); print('T1 h1:', h1(p))
        cl = p.locator('[data-act="clockIn"]')
        if cl.count(): cl.first.click(); p.wait_for_timeout(1500)
        out = p.locator('[data-act="clockOut"]'); print('T1 clocked in (clock-out button shows):', out.count() > 0)
        if out.count(): out.first.click(); p.wait_for_timeout(800);
        if p.locator('#m-ok').count(): p.locator('#m-ok').click(); p.wait_for_timeout(1200)
        nav(p, 'My learners'); print('T1 my learners:', [r.split('\n')[0] for r in p.locator('tbody tr').all_inner_texts()])
        ctx.close()
        # stranger
        ctx, p = open_as(b, 'S'); print('S h1:', h1(p))
        p.fill('#ob-name', 'Krashanu (Admin)'); p.locator('label:has(input[value="parent"])').click(); p.click('#ob-go'); p.wait_for_timeout(1500)
        print('S after onboarding:', h1(p)); print('S LEAKS:', leaks('S')); ctx.close()
        b.close()
finally:
    srv.terminate()

print(sp.run(['su', 'postgres', '-c', "psql -q -At -d e2e -c \"select 'timesheets', count(*), bool_and(data->>'endAt' is not null) from docs where path like 'timesheets/%' union all select 'people S', count(*), null from people where name like '%Admin%' union all select 'S profile', count(*), null from docs where path='profiles/00000000-0000-0000-0000-0000000000e1'\""], capture_output=True, text=True).stdout)
print('ERRORS:', errors)
