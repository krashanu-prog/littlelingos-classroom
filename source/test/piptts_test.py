exec(open('/home/claude/ws/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2,base64
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); c.autocommit=True; cur=c.cursor()
cur.execute("update public.docs set data = data || jsonb_build_object('stage','Sprouts') where path='learners/l1'")
MP3=base64.b64encode(open('/home/claude/littlelingos-classroom/pv/1057kqw11.mp3','rb').read()).decode()
errs=[]; tts=[]; FAIL={'on':False}
def fake(route):
    b=json.loads(route.request.post_data or '{}')
    if b.get('mode')=='tts':
        tts.append(b.get('text'))
        if FAIL['on']: return route.fulfill(status=503,content_type='application/json',headers={'Access-Control-Allow-Origin':'*'},body='{"error":"voice busy"}')
        return route.fulfill(status=200,content_type='application/json',headers={'Access-Control-Allow-Origin':'*'},body=json.dumps({'audio':MP3,'type':'audio/mpeg'}))
    d=b.get('debate') or {}
    if d.get('phase')=='report': body={'report':{"overall":"Great energy and clear reasons.","strengths":["Clear side."],"improve":[{"point":"Answer Pip first","why":"It wins points.","try":"I see your point, but..."}],"turns":[],"goal":"Use But every turn."}}
    elif d: body={'reply':f"AI {d.get('phase')} reply number {len(b.get('messages',[]))}. What do you think?"}
    else: body={'reply':'Hello! '+[m for m in b.get('messages',[]) if m['role']=='user'][-1]['content']}
    route.fulfill(status=200,content_type='application/json',headers={'Access-Control-Allow-Origin':'*'},body=json.dumps(body))
INIT="""window.__played=[];const op=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__played.push(this.src.slice(0,30));const a=this;setTimeout(()=>{a.dispatchEvent(new Event('ended'))},80);return Promise.resolve();};"""
with sync_playwright() as pw:
    b = pw.chromium.launch()
    ctx,p=open_as(b,'K1',390,844); ctx.add_init_script(INIT); p.on('pageerror',lambda e:errs.append(str(e)))
    p.route('**/functions/v1/ask-pip',fake); p.reload(); p.wait_for_timeout(1500)
    nav(p,'Play'); p.wait_for_timeout(400); p.locator('[data-act="startGame"][data-id="debate"]').click(); p.wait_for_timeout(400)
    p.locator('[data-act="dbSide"][data-id="for"]').click(); p.wait_for_timeout(1200)
    print('opening (recorded) played:',p.evaluate("window.__played.length"),'tts calls:',len(tts))
    p.evaluate("window.__played=[]")
    p.fill('#dbtext',"I think this is good because children learn a lot from it."); p.locator('[data-act="dbSend"]').click(); p.wait_for_timeout(2500)
    print('after AI reply -> tts texts:',tts,'| played:',p.evaluate("window.__played"))
    n=len(tts); p.evaluate("window.__played=[]")
    p.locator('.dbmsg.pip.dbai [data-act="dbHear"]').last.click(); p.wait_for_timeout(1500)
    print('hear again -> new tts calls:',len(tts)-n,'| played:',p.evaluate("window.__played"))
    for t in ["For example my friend tried it and became better at speaking.","I see your point, but it helps families work together.","To sum up, I believe my side is right because it helps everyone."]:
        p.fill('#dbtext',t); p.locator('[data-act="dbSend"]').click(); p.wait_for_timeout(1800)
    p.wait_for_timeout(1500)
    print('report hear button:',p.locator('[data-act="dbrHear"]').count())
    n=len(tts); p.locator('[data-act="dbrHear"]').click(); p.wait_for_timeout(1500); print('report read text:',(tts[n:] or ['none'])[0][:120])
    # Ask Pip chat
    p.locator('#pipfab').click(); p.wait_for_timeout(500); p.locator('[data-pip="tab"][data-id="ask"]').click(); p.wait_for_timeout(300)
    p.fill('#pip-q','What is a noun?'); p.locator('.pip-form button').last.click(); p.wait_for_timeout(1200)
    print('ask pip hear buttons:',p.locator('.pip-hear').count())
    n=len(tts); p.evaluate("window.__played=[]"); p.locator('.pip-hear').last.click(); p.wait_for_timeout(1500)
    print('ask pip read:',tts[n:],'| played:',p.evaluate("window.__played"))
    # voice unavailable -> friendly message
    FAIL['on']=True; p.fill('#pip-q','What is a verb?'); p.locator('.pip-form button').last.click(); p.wait_for_timeout(1200)
    p.locator('.pip-hear').last.click(); p.wait_for_timeout(2500)
    print('when voice busy, toast:',p.locator('.toast').all_inner_texts())
    p.screenshot(path='test/piptts_ask.png')
    ctx.close()
print('errors',errs)
