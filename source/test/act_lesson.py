exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        ctx, p = open_as(b, 'K1'); nav(p,'Path'); p.wait_for_timeout(500)
        ids=p.locator('[data-go^="lesson:"]').evaluate_all("es=>es.map(e=>e.dataset.go)"); print('links', ids)
        for g in ids:
            p.evaluate("g=>document.querySelector('[data-go=\"'+g+'\"]').click()",g); p.wait_for_timeout(800)
            print(g, h1(p), 'finish', p.locator('[data-act="finish"]').count(), 'undo', p.locator('[data-act="undoDone"]').count())
            if p.locator('[data-act="finish"]').count():
                p.locator('[data-act="finish"]').first.click(); p.wait_for_timeout(1500); break
            nav(p,'Path'); p.wait_for_timeout(400)
        nav(p,'Me'); p.wait_for_timeout(800); print('acts', [x.replace('\n',' | ') for x in p.locator('.actcard .actrow').all_inner_texts()])
        b.close()
finally: srv.terminate()
