exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2,re
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
cur.execute("""update public.docs set data = data || '{"lang2":"hi"}'::jsonb where path like 'profiles/%%' and data->>'role'='student'"""); print('rows',cur.rowcount); c.commit()
def hc(p): return len(re.findall(r'[ऀ-ॿ]',p.locator('main').text_content()))
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
    ctx,p=open_as(b,'K1'); p.wait_for_timeout(800)
    for pg in ['Words','Play']:
        nav(p,pg); p.wait_for_timeout(800); print('kid',pg,hc(p))
    ctx.close()
    ctx,p=open_as(b,'A'); p.wait_for_timeout(800); p.select_option('#viewas','student:Sprouts'); p.wait_for_timeout(800)
    p.locator('.l2chip').click(); p.wait_for_timeout(300); p.locator('[data-mact="pickL2"][data-id="hi"]').click(); p.wait_for_timeout(600)
    for pg in ['Words','Play']:
        nav(p,pg); p.wait_for_timeout(800); print('preview',pg,hc(p))
    nav(p,'Words'); p.wait_for_timeout(500)
    p.get_by_text('tap to flip').first.click(); p.wait_for_timeout(600); p.screenshot(path='test/l2_words.png'); print('after flip',hc(p))
    ctx.close()
