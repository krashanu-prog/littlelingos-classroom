exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2,re as _r
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
cur.execute("update public.docs set data = data || '{\"lang2\":\"ar\"}'::jsonb where path=%s",('profiles/'+U('d1'),)); c.commit()
scr=lambda s:'arabic' if _r.search('[؀-ۿ]',s) else 'hindi' if _r.search('[ऀ-ॿ]',s) else 'latin'
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        ctx, p = open_as(b, 'K1'); nav(p,'Play'); p.wait_for_timeout(500)
        p.locator('[data-act="startGame"][data-id="quiz"]').click(); p.wait_for_timeout(600)
        for i in range(3):
            q=p.locator('.quiz h2').inner_text(); o=p.locator('[data-act="answer"]').all_inner_texts()
            print(q,'->',o,[scr(x) for x in o])
            p.locator('[data-act="answer"]').first.click(); p.wait_for_timeout(200); print('  feedback:', p.locator('.qfb').inner_text().split('\n')[0]); p.locator('[data-act="nextQ"]').click(); p.wait_for_timeout(300)
        p.locator('[data-act="endGame"]').click() if p.locator('[data-act="endGame"]').count() else None
        nav(p,'Words'); p.wait_for_timeout(500)
        if p.locator('.fcard').count(): p.locator('.fcard').click(); p.wait_for_timeout(300); print('flashcard:', p.locator('.fcard').inner_text().replace('\n',' | '))
        nav(p,'Play'); p.locator('[data-act="startGame"][data-id="memory"]').click(); p.wait_for_timeout(500)
        print('memory scripts:', sorted(set(scr(x) for x in p.evaluate("S=null||[...document.querySelectorAll('.mem')].map(b=>b.getAttribute('aria-label'))")))[:3])
        print('errors:', errors[:3]); b.close()
finally: srv.terminate()
