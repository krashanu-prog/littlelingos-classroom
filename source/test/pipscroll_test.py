exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
LONG="**Happy** - feeling pleased, joyful, or content. It's the warm, bright feeling you get when something nice happens or when you're enjoying a moment.\n- Example: *I am happy today.*\n- Opposite: sad. Try using it in a sentence of your own!"
errs=[]
with sync_playwright() as pw:
    b = pw.chromium.launch()
    for (w,h) in [(1280,760),(390,700)]:
        ctx,p=open_as(b,'K1',w,h); p.on('pageerror',lambda e:errs.append(str(e)))
        p.route('**/functions/v1/ask-pip',lambda r: r.fulfill(status=200,content_type='application/json',headers={'Access-Control-Allow-Origin':'*'},body=json.dumps({'reply':LONG})))
        p.wait_for_timeout(800); p.locator('#pipfab').click(); p.wait_for_timeout(400)
        p.locator('[data-pip="tab"][data-id="ask"]').click(); p.wait_for_timeout(300)
        for q in ['meaning of happy','confused meaning?','give me an example','what is a noun?']:
            p.fill('#pip-q',q); p.locator('.pip-form button[type=submit], .pip-form button').last.click(); p.wait_for_timeout(700)
        m=p.evaluate("""()=>{const c=document.querySelector('#pip-chat'),f=document.querySelector('.pip-form'),fi=document.querySelector('.pip-fine');const cr=c.getBoundingClientRect(),fr=f.getBoundingClientRect();
          return {scrolls:c.scrollHeight>c.clientHeight, atBottom:Math.abs(c.scrollHeight-c.clientHeight-c.scrollTop)<4, chatBottom:Math.round(cr.bottom), formTop:Math.round(fr.top), overlap:cr.bottom>fr.top+1, bold:c.querySelectorAll('.pip-msg b').length, rawStars:c.innerText.includes('**')}}""")
        print(w,'x',h,m); p.screenshot(path=f'test/pipscroll_{w}.png')
        ctx.close()
print('errors',errs)
