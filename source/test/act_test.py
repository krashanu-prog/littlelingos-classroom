exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import re as _r
def clickgo(p,v): p.evaluate("v=>{const e=document.querySelector('[data-go=\"'+v+'\"]');if(e)e.click();else throw new Error('no go '+v)}",v); p.wait_for_timeout(700)
def gk(p,n):
    nav(p,'Play'); clickgo(p,'fun'); p.locator('[data-act="funTab"][data-id="gk"]').click(); p.wait_for_timeout(600)
    for i in range(n):
        p.locator('.gkopt').first.click(); p.wait_for_timeout(250)
        nx=p.locator('[data-act="qzNext"]')
        if nx.count(): nx.first.click(); p.wait_for_timeout(250)
    p.wait_for_timeout(1500)
def acts(p): return [x.replace('\n',' | ') for x in p.locator('.actcard .actrow').all_inner_texts()]
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        errs=[]
        ctx, p = open_as(b, 'K1'); p.on('console', lambda m: errs.append(m.text[:200]) if m.type=='error' and 'WebSocket' not in m.text else None)
        gk(p,4)
        nav(p,'Path'); p.wait_for_timeout(500)
        ls=p.locator('[data-go^="lesson:"]')
        print('K1 lesson links:', ls.count())
        if ls.count():
            ls.first.click(); p.wait_for_timeout(800)
            f=p.locator('[data-act="finish"]'); print('K1 finish button:', f.count())
            if f.count(): f.first.click(); p.wait_for_timeout(1500)
        nav(p,'Me'); p.wait_for_timeout(800)
        print('K1 My activities:', acts(p)); print('K1 week line:', p.locator('.actsum').inner_text() if p.locator('.actsum').count() else '')
        print('K1 preview note shown (should be 0):', p.locator('.prevnote').count())
        p.locator('.actcard').screenshot(path=T+'r_act_kid.png')
        print('K1 errors:', errs[:4]); ctx.close()
        # parent sees it
        ctx, p = open_as(b, 'P1'); nav(p,'Progress'); p.wait_for_timeout(1200)
        print('P1 activities:', acts(p)[:4]); ctx.close()
        # admin: learner card + preview
        ctx, p = open_as(b, 'A'); nav(p,'Learners'); p.wait_for_timeout(600)
        li=p.locator('[data-act="learnerInfo"]'); print('A learnerInfo buttons:', li.count())
        if li.count():
            li.first.click(); p.wait_for_timeout(1500); print('A modal activities:', acts(p)[:3])
        ctx.close(); ctx, p = open_as(b, 'A')
        p.select_option('#viewas','student'); p.wait_for_timeout(1200)
        print('A preview note:', p.locator('.prevnote').inner_text()[:90] if p.locator('.prevnote').count() else 'NONE')
        gk(p,2); nav(p,'Me'); p.wait_for_timeout(800); print('A preview activities:', acts(p))
        ctx.close()
        import psycopg2; c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
        cur.execute("select path, data->'acts' from public.docs where path like 'progress/%' and data ? 'acts'"); 
        for r in cur.fetchall(): print('DB', r[0][-4:], r[1])
        b.close()
finally: srv.terminate()
