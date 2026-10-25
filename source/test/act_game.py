exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        ctx, p = open_as(b, 'K1'); nav(p,'Play'); p.wait_for_timeout(500)
        p.locator('[data-act="startGame"][data-id="quiz"]').click(); p.wait_for_timeout(600)
        for i in range(12):
            if not p.locator('[data-act="answer"]').count(): break
            p.locator('[data-act="answer"]').first.click(); p.wait_for_timeout(200); p.locator('[data-act="nextQ"]').click(); p.wait_for_timeout(300)
        print('over:', h1(p)); p.wait_for_timeout(800)
        nav(p,'Me'); p.wait_for_timeout(800); print('acts', [x.replace('\n',' | ') for x in p.locator('.actcard .actrow').all_inner_texts()])
        p.set_viewport_size({'width':390,'height':844}); p.wait_for_timeout(500); p.locator('.actcard').screenshot(path=T+'r_act_phone.png')
        b.close()
finally: srv.terminate()
