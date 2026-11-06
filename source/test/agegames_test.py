exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2,time
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
for f in ['supabase/starter-content.sql','supabase/age-lessons.sql']: cur.execute(open(f).read())
cur.execute("""insert into public.docs(path,data) values ('tw/00000000-0000-0000-0000-0000000000b1/x/hwseeds','{"kind":"hw","title":"Seeds phonics homework","courseId":"ex-seeds","learnerIds":[],"at":1}') on conflict (path) do nothing"""); c.commit()
def stage(st): cur.execute("""update public.docs set data = data || jsonb_build_object('stage',%s,'courses','["c1","ex-seeds","ex-sprouts","ex-blooms"]'::jsonb) where path='learners/l1'""",(st,)); c.commit()
def play(p,gid,rounds=3):
    p.locator(f'[data-act="startGame"][data-id="{gid}"]').click(); p.wait_for_timeout(400)
    seen=[]
    for _ in range(rounds):
        if p.locator('[data-act="agTile"]').count():
            for _ in range(p.locator('.agbank [data-act="agTile"]').count()): p.locator('.agbank [data-act="agTile"]').first.click(); p.wait_for_timeout(40)
            seen.append(p.locator('.quiz h2').inner_text()+' | '+p.locator('.agline').inner_text().replace('\n',' ')); p.locator('[data-act="agCheck"]').click()
        elif p.locator('#agtype').count():
            seen.append(p.locator('.quiz h2').inner_text()); p.fill('#agtype','test'); p.locator('[data-act="agCheck"]').click()
        elif p.locator('[data-act="answer"]').count():
            vis=p.locator('.agcount,.agswatch,.agword,.agsent').all_inner_texts()
            seen.append(p.locator('.quiz h2').inner_text()+(' '+vis[0][:60] if vis else '')+' -> '+'/'.join(p.locator('[data-act="answer"]').all_inner_texts())[:90]); p.locator('[data-act="answer"]').first.click()
        else: break
        p.wait_for_timeout(150)
        fb=p.locator('.qfb').inner_text().replace('\n',' ')[:80] if p.locator('.qfb').count() else ''
        seen[-1]+='  || '+fb
        if p.locator('[data-act="nextQ"]').count(): p.locator('[data-act="nextQ"]').click(); p.wait_for_timeout(150)
    for x in seen: print('    ',x)
    p.locator('[data-act="endGame"]').first.click(); p.wait_for_timeout(200)
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        for st,games in [('Seeds',['daily','pic','sound','colour','count']),('Sprouts',['build','miss','odd']),('Blooms',['cloze','fix','bee'])]:
            stage(st); ctx,p=open_as(b,'K1'); nav(p,'Play'); p.wait_for_timeout(400)
            print('=====',st,'games:',[x.split('\n')[1] for x in p.locator('.gamecard').all_inner_texts()])
            for gm in games: print('  --',gm); play(p,gm)
            if st=='Seeds':
                p.locator('[data-act="startGame"][data-id="memory"]').click(); p.wait_for_timeout(300); print('  memory cards:',p.locator('.mem').count())
                p.locator('[data-act="endGame"]').click(); p.wait_for_timeout(200)
            if st=='Blooms':
                p.locator('[data-act="startGame"][data-id="speed"]').click(); p.wait_for_timeout(300)
                for _ in range(5):
                    if p.locator('[data-act="answer"]').count(): p.locator('[data-act="answer"]').first.click(); p.wait_for_timeout(900)
                print('  speed clock:',p.locator('#agclock').inner_text()); p.wait_for_timeout(58000)
                print('  speed end:',p.locator('main h1').first.inner_text(),'|',p.locator('.bigstars').inner_text() if p.locator('.bigstars').count() else '-')
                p.locator('[data-act="endGame"]').click(); p.wait_for_timeout(300); print('  speed card:',p.locator('[data-id="speed"]').inner_text().replace('\n',' '))
            nav(p,'Homework'); p.wait_for_timeout(400); print('  homework list:',p.locator('main .item .t').all_inner_texts())
            ctx.close()
        ctx,p=open_as(b,'A'); p.wait_for_timeout(300)
        print('view-as options:',p.locator('#viewas option').all_inner_texts())
        p.select_option('#viewas','student:Blooms'); p.wait_for_timeout(600); nav(p,'Play'); p.wait_for_timeout(300)
        print('admin as Blooms:',p.locator('.lvband').inner_text().replace('\n',' '),'| chips:',p.locator('.pvages .pvchip.on').inner_text())
        p.locator('.pvages [data-id="Seeds"]').click(); p.wait_for_timeout(500)
        print('switched to Seeds:',p.locator('.lvband').inner_text().replace('\n',' '),'| select:',p.eval_on_selector('#viewas','e=>e.value'))
        print('errors:', errors[:5]); b.close()
finally: srv.terminate()
