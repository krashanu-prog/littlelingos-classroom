exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2,collections
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
for f in ['supabase/starter-content.sql','supabase/age-lessons.sql']: cur.execute(open(f).read())
def stage(st): cur.execute("""update public.docs set data = data || jsonb_build_object('stage',%s,'courses','["c1","ex-seeds","ex-sprouts","ex-blooms"]'::jsonb) where path='learners/l1'""",(st,)); c.commit()
def run(b,st):
    stage(st); ctx,p=open_as(b,'K1'); print('=====',st)
    nav(p,'Path'); p.wait_for_timeout(500)
    print('path tabs:', p.locator('.seg button').all_inner_texts() if p.locator('.seg button').count() else '-', '| lessons:', p.locator('.plabel').all_inner_texts())
    nav(p,'Play'); p.wait_for_timeout(500); print('banner:', p.locator('.lvband').inner_text().replace('\n',' '))
    p.locator('[data-act="startGame"][data-id="quiz"]').click(); p.wait_for_timeout(500)
    kinds=collections.Counter(); n=0; nopt=set()
    while p.locator('[data-act="answer"]').count():
        q=p.locator('.quiz h2').inner_text(); o=p.locator('[data-act="answer"]').all_inner_texts(); nopt.add(len(o)); n+=1
        kinds[q.split(' ')[0]+' '+q.split(' ')[1]]+=1
        if n<=3: print('  Q:',q,'->',o)
        p.locator('[data-act="answer"]').first.click(); p.wait_for_timeout(120); p.locator('[data-act="nextQ"]').click(); p.wait_for_timeout(150)
    print('quiz questions:',n,'options:',nopt,dict(kinds))
    p.locator('[data-act="endGame"]').click(); p.wait_for_timeout(300)
    p.locator('[data-act="startGame"][data-id="memory"]').click(); p.wait_for_timeout(400); print('memory cards:', p.locator('.mem').count())
    ctx.close()
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        for st in ['Seeds','Sprouts','Blooms']: run(b,st)
        print('errors:', errors[:3]); b.close()
finally: srv.terminate()
