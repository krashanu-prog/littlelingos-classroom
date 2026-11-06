exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
for f in ['supabase/starter-content.sql','supabase/age-lessons.sql']: cur.execute(open(f).read())
def stage(st): cur.execute("""update public.docs set data = data || jsonb_build_object('stage',%s,'courses','["c1","ex-seeds","ex-sprouts","ex-blooms"]'::jsonb) where path='learners/l1'""",(st,)); c.commit()
def play(p,gid,n=10,policy=None):
    p.locator(f'[data-act="startGame"][data-id="{gid}"]').click(); p.wait_for_timeout(400)
    for k in range(n):
        if not (p.locator('[data-act="answer"]').count() or p.locator('#agtype').count() or p.locator('.agbank').count()): break
        lede=p.locator('main .head .lede').first.inner_text()
        h=p.locator('.quiz h2').inner_text(); vis=p.locator('.agcount,.agword,.agsent').all_inner_texts()
        if p.locator('#agtype').count(): p.fill('#agtype','zzz' if k%3==0 else 'x'); p.locator('[data-act="agCheck"]').click()
        elif p.locator('.agbank').count():
            for _ in range(p.locator('.agbank [data-act="agTile"]').count()): p.locator('.agbank [data-act="agTile"]').first.click()
            p.locator('[data-act="agCheck"]').click()
        else:
            # policy: pick the right answer when we can tell from a previous reveal, else option 0
            opts=p.locator('[data-act="answer"]').all_inner_texts(); i=0
            if policy=='right' and len(seen_ans)>0:
                for j,o in enumerate(opts):
                    if o in seen_ans: i=j
            p.locator('[data-act="answer"]').nth(i).click()
        p.wait_for_timeout(120)
        fb=p.locator('.qfb').inner_text().replace('\n',' ') if p.locator('.qfb').count() else ''
        right=p.locator('.qopt.right').all_inner_texts(); seen_ans.extend(right)
        print(f'   {lede[:48]:48} | {h[:55]} {(vis[0][:40] if vis else "")} || {fb[:110]}')
        nb=p.locator('[data-act="nextQ"]')
        if not nb.count(): break
        nb.click(); p.wait_for_timeout(150)
    if p.locator('.bigstars').count(): print('   END:',p.locator('main h1').first.inner_text(),p.locator('.bigstars').inner_text())
    if p.locator('[data-act="endGame"]').count(): p.locator('[data-act="endGame"]').first.click(); p.wait_for_timeout(200)
seen_ans=[]
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        for st,games in [('Seeds',['pic','colour']),('Sprouts',['miss','build']),('Blooms',['cloze','bee','speed'])]:
            stage(st); ctx,p=open_as(b,'K1'); nav(p,'Play'); p.wait_for_timeout(300)
            for gm in games: print('=====',st,gm); seen_ans.clear(); play(p,gm,12,'right' if gm in ('count','quiz') else None)
            ctx.close()
        stage('Sprouts'); ctx,p=open_as(b,'K1'); nav(p,'Play'); p.wait_for_timeout(300)
        p.locator('[data-act="goQuiz"][data-id="en"]').click(); p.wait_for_timeout(500); print('===== Word power')
        for k in range(6):
            q=p.locator('.gkq').inner_text(); sc=p.locator('.qzscore').inner_text(); p.locator('[data-act="qzPick"]').first.click(); p.wait_for_timeout(120)
            fb=' '.join(p.locator('.gkfb,.adnote').all_inner_texts()); print('  ',sc[:45],'|',q[:50],'||',fb[:90]); p.locator('[data-act="qzNext"]').click(); p.wait_for_timeout(150)
        print('errors:', errors[:5]); b.close()
finally: srv.terminate()
