exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        ctx, p = open_as(b, 'K1'); print('K1 (has password) gate shown:', p.locator('#ll-gate').count(), '| h1:', h1(p)); ctx.close()
        NOPW['p1@x.com'] = True
        ctx, p = open_as(b, 'P1')
        print('P1 (no password) gate:', p.locator('#ll-gate h1').inner_text() if p.locator('#ll-gate').count() else 'NONE')
        print('  buttons:', p.locator('#ll-gate button').all_inner_texts())
        p.screenshot(path=T+'r_pwreq.png')
        p.fill('#ll-np','abc'); p.fill('#ll-np2','abc'); p.click('#ll-go'); p.wait_for_timeout(300); print('  weak:', p.locator('#ll-err').inner_text())
        p.fill('#ll-np','garden2026'); p.fill('#ll-np2','garden2026'); p.click('#ll-go'); p.wait_for_timeout(1500)
        print('  after save:', p.locator('#ll-gate h1').inner_text() if p.locator('#ll-gate').count() else 'NONE')
        if p.locator('#ll-done').count(): p.click('#ll-done'); p.wait_for_timeout(800)
        print('  gate gone:', p.locator('#ll-gate').count()==0, '| app h1:', h1(p))
        ctx.close()
        print('errors:', [e for e in errors if 'auth' in e.lower()][:5])
        b.close()
finally: srv.terminate()
