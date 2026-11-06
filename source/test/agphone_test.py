exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
for f in ['supabase/starter-content.sql','supabase/age-lessons.sql']: cur.execute(open(f).read())
def stage(st): cur.execute("""update public.docs set data = data || jsonb_build_object('stage',%s,'courses','["c1","ex-seeds","ex-sprouts","ex-blooms"]'::jsonb) where path='learners/l1'""",(st,)); c.commit()
OUT='/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/'
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        for st,games in [('Seeds',['pic','count','colour']),('Sprouts',['build','odd']),('Blooms',['fix','bee','cloze'])]:
            stage(st); ctx,p=open_as(b,'K1',390,844); nav(p,'Play'); p.wait_for_timeout(300)
            for gm in games:
                p.locator(f'[data-act="startGame"][data-id="{gm}"]').click(); p.wait_for_timeout(400)
                ov=p.evaluate("document.documentElement.scrollWidth-innerWidth")
                p.screenshot(path=OUT+f'ag_{gm}.png'); print(st,gm,'overflow px:',ov)
                p.locator('[data-act="endGame"]').first.click(); p.wait_for_timeout(200)
            ctx.close()
        print('errors:', errors[:3]); b.close()
finally: srv.terminate()
