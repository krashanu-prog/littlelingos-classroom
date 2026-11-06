exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
cur.execute("""update public.docs set data = data || '{"stage":"Sprouts"}' where path='learners/l1'"""); c.commit()
cur.execute("select data->>'uid' from docs where path='learners/l1'"); kuid=cur.fetchone()[0]
def lede(p): return p.locator('main .head .lede').first.inner_text()
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        ctx,p=open_as(b,'K1'); nav(p,'Play'); p.wait_for_timeout(300)
        p.locator('[data-act="startGame"][data-id="odd"]').click(); p.wait_for_timeout(300)
        for k in range(8):
            if not p.locator('[data-act="answer"]').count(): break
            print('  ',lede(p)[:45])
            # answer correctly: the odd word is the one whose category differs; try each until right is revealed
            p.locator('[data-act="answer"]').first.click(); p.wait_for_timeout(100)
            if p.locator('[data-act="nextQ"]').count(): p.locator('[data-act="nextQ"]').click(); p.wait_for_timeout(120)
        p.wait_for_timeout(2500); ctx.close()
        cur.execute("select data->'adl' from docs where path=%s",('progress/'+kuid,)); print('saved on account:',cur.fetchone()[0])
        ctx,p=open_as(b,'K1'); nav(p,'Play'); p.wait_for_timeout(300)
        p.locator('[data-act="startGame"][data-id="odd"]').click(); p.wait_for_timeout(300); print('fresh device starts at:',lede(p)[:40]); ctx.close()
        ctx,p=open_as(b,'A'); nav(p,'Learners'); p.wait_for_timeout(500)
        p.locator('[data-act="learnerInfo"][data-id="l1"]').first.click(); p.wait_for_timeout(500)
        print('admin sees:',p.locator('.adlv').inner_text().replace('\n',' ') if p.locator('.adlv').count() else 'nothing')
        print('errors:', errors[:3]); b.close()
finally: srv.terminate()
