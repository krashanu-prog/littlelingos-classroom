exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
for f in ['supabase/starter-content.sql','supabase/age-lessons.sql']: cur.execute(open(f).read())
def stage(st): cur.execute("""update public.docs set data = data || jsonb_build_object('stage',%s,'courses','["c1","ex-seeds","ex-sprouts","ex-blooms"]'::jsonb) where path='learners/l1'""",(st,)); c.commit()
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        for st in ['Seeds','Sprouts','Blooms']:
            stage(st); ctx,p=open_as(b,'K1'); nav(p,'Play'); p.wait_for_timeout(400)
            info=p.evaluate("st=>({gk:LL_GK[st].length,en:LL_EN[st].length})",st)
            words=[]
            for r in range(6):
                p.locator('[data-act="startGame"][data-id="%s"]' % ('quiz' if p.locator('[data-act="startGame"][data-id="quiz"]').count() else 'pic')).first.click(); p.wait_for_selector('[data-act="answer"]',timeout=8000)
                for _q in range(12):
                    if not p.locator('[data-act="answer"]:not([disabled])').count(): break
                    words.append(p.locator('.quiz h2').inner_text()+' '+'/'.join(sorted(p.locator('[data-act="answer"]').all_inner_texts())))
                    p.locator('[data-act="answer"]').first.click(); p.wait_for_timeout(60); (p.locator('[data-act="nextQ"]').first.click() if p.locator('[data-act="nextQ"]').count() else None); p.wait_for_timeout(80)
                p.locator('[data-act="endGame"]').first.click(); p.wait_for_timeout(200)
            print(st,info,'| 6 rounds:',len(words),'questions,',len(set(words)),'different questions | sample:',[w[:70] for w in words[:4]])
            ctx.close()
        print('errors:', errors[:3]); b.close()
finally: srv.terminate()
