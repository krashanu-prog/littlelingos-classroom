exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); c.autocommit=True; cur=c.cursor()
def snap():
    cur.execute("select path, data::text from public.docs where path like '%%0000000000d1%%' order by path"); return cur.fetchall()
before=snap()
errs=[]
def clean(t): return '\n'.join(l for l in t.split('\n') if 'preview' not in l.lower() and 'dashboard' not in l.lower())
with sync_playwright() as pw:
    b = pw.chromium.launch()
    # what the child sees
    ctx,k=open_as(b,'K1'); k.wait_for_timeout(1500)
    kid_nav=list(dict.fromkeys(k.evaluate("()=>[...document.querySelectorAll('#nav [data-go]')].map(a=>a.dataset.go)")))
    kid_txt={}
    for g in kid_nav:
        k.locator(f'#nav [data-go="{g}"]').first.click(); k.wait_for_timeout(900); kid_txt[g]=k.locator('main').inner_text()
    ctx.close()
    ctx,p=open_as(b,'A'); p.on('pageerror',lambda e:errs.append(str(e))); p.wait_for_timeout(1000)
    p.select_option('#viewas','student:Seeds'); p.wait_for_timeout(900)
    print('options:',p.evaluate("()=>[...document.querySelectorAll('#lpv-kid option')].map(o=>o.textContent+(o.disabled?' [disabled]':''))"))
    p.select_option('#lpv-kid','l1'); p.wait_for_timeout(1500)
    print('note:',p.locator('.prevnote').first.inner_text()[:160].replace('\n',' '))
    nav=list(dict.fromkeys(p.evaluate("()=>[...document.querySelectorAll('#nav [data-go]')].map(a=>a.dataset.go)")))
    print('nav same as child:',nav==kid_nav, nav)
    for g in nav:
        p.locator(f'#nav [data-go="{g}"]').first.click(); p.wait_for_timeout(1000)
        t=p.locator('main').inner_text()
        kl=set(x.strip() for x in clean(kid_txt.get(g,'')).split('\n') if x.strip()); al=set(x.strip() for x in clean(t).split('\n') if x.strip())
        print('  ',g.ljust(10),'| lines matching child view: %d/%d'%(len(kl&al),len(kl)),'| missing:',list(kl-al)[:3])
        p.screenshot(path=f'test/lpv_{g}.png')
    # try things that would normally save to the child's record
    p.locator('#nav [data-go]').first.click(); p.wait_for_timeout(700)
    for sel in ['[data-act="pipMood"]','[data-act="rateEmo"]','[data-act="confPick"]','[data-act="finish"]']:
        if p.locator(sel).count():
            p.locator(sel).first.click(); p.wait_for_timeout(800); print('clicked',sel)
    p.wait_for_timeout(1500)
    # back to sample learner
    p.select_option('#lpv-kid',''); p.wait_for_timeout(900)
    print('sample note:',p.locator('.prevnote').first.inner_text()[:80].replace('\n',' '))
    p.select_option('#viewas','parent:Seeds'); p.wait_for_timeout(800); print('parent view ok:',p.locator('#ppv-kid').count()==1)
    ctx.close()
after=snap()
print('child records unchanged:',before==after, [x[0] for x in after if x not in before])
print('errors',errs)
