exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
LONG2="3. **Add a new trainer**\n- Tap the ***“+ Add Trainer”** button (usually at the top-right corner).\n- Fill in the required details:\n* **Name** – Full name of the trainer.\n* **Email** – This will be used for login and communications.\n* **Phone (optional)** – For quick contact.\n* **Assign to Batches/Classes** – Choose the batches they will handle.\n4. **Save**"
LONG="**Happy** - feeling pleased, joyful, or content. It's the warm, bright feeling you get when something nice happens or when you're enjoying a moment.\n- Example: *I am happy today.*\n- Opposite: sad. Try using it in a sentence of your own!"
errs=[]
with sync_playwright() as pw:
    b = pw.chromium.launch()
    for (who,w,h) in [('K1',1280,760),('K1',390,700),('A',1280,760),('A',390,700)]:
        ctx,p=open_as(b,who,w,h); p.on('pageerror',lambda e:errs.append(str(e)))
        p.route('**/functions/v1/ask-pip',lambda r: r.fulfill(status=200,content_type='application/json',headers={'Access-Control-Allow-Origin':'*'},body=json.dumps({'reply':LONG2 if who=='A' else LONG})))
        p.wait_for_timeout(800); p.locator('#pipfab').click(); p.wait_for_timeout(400)
        p.locator('[data-pip="tab"][data-id="ask"]').click(); p.wait_for_timeout(300)
        for q in ['meaning of happy','confused meaning?','give me an example','what is a noun?']:
            p.fill('#pip-q',q); p.locator('.pip-form button[type=submit], .pip-form button').last.click(); p.wait_for_timeout(700)
        m=p.evaluate("""()=>{const c=document.querySelector('#pip-chat'),f=document.querySelector('.pip-form'),fi=document.querySelector('.pip-fine');const cr=c.getBoundingClientRect(),fr=f.getBoundingClientRect();
          return {scrolls:c.scrollHeight>c.clientHeight, atBottom:Math.abs(c.scrollHeight-c.clientHeight-c.scrollTop)<4, chatBottom:Math.round(cr.bottom), formTop:Math.round(fr.top), overlap:cr.bottom>fr.top+1, bold:c.querySelectorAll('.pip-msg b').length, rawStars:c.innerText.includes('**')}}""")
        print(who,w,'x',h,m); p.screenshot(path=f'test/pipscroll_{who}_{w}.png')
        ctx.close()
print('errors',errs)
