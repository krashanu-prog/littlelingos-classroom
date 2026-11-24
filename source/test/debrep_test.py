exec(open('/home/claude/ws/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); c.autocommit=True; cur=c.cursor()
def stage(st): cur.execute("update public.docs set data = data || jsonb_build_object('stage',%s) where path='learners/l1'",(st,))
OUT='/home/claude/ws/web/test/'
errs=[]; calls=[]
REPORT={"overall":"You argued with energy and gave clear reasons. Next time, answer Pip's point before giving yours.",
 "strengths":["You said your side clearly in your opening.","Your example about your friend made your point real."],
 "improve":[{"point":"Answer Pip's point first","why":"It shows why Pip's idea doesn't work.","try":"I see your point, but children learn more by doing."},
            {"point":"Use linking words","why":"They make your ideas easy to follow.","try":"Firstly, … Also, …"}],
 "turns":[{"n":1,"good":"Clear opinion with a reason.","fix":"Say 'children learn a lot' instead of 'childrens learns lot'.","better":"I think this is good because children learn a lot from it, for example new words."},
          {"n":2,"good":"A real example.","fix":"Link it to the motion.","better":"For example, my friend practised and became better at speaking."}],
 "goal":"Answer every one of Pip's points with 'But…'."}
def fake(route):
    b=json.loads(route.request.post_data or '{}'); d=b.get('debate',{}); calls.append(d.get('phase'))
    body={'report':REPORT} if d.get('phase')=='report' else {'reply':f"AI {d.get('phase')} reply."}
    route.fulfill(status=200,content_type='application/json',headers={'Access-Control-Allow-Origin':'*'},body=json.dumps(body))
def down(route): route.fulfill(status=500,content_type='application/json',headers={'Access-Control-Allow-Origin':'*'},body='{}')
turns=["I think this is good because children learn a lot from it.",
       "For example my friend tried it and she became much better at speaking in class.",
       "I see your point, but it also helps families and friends work together, so it is fair.",
       "To sum up, I believe my side is right because it helps everyone grow and learn every day."]
with sync_playwright() as pw:
    b = pw.chromium.launch()
    for st,handler in [('Sprouts',fake),('Blooms',down),('Seeds',None)]:
        stage(st); ctx,p=open_as(b,'K1',390,844); p.on('pageerror',lambda e:errs.append(str(e)))
        if handler: p.route('**/functions/v1/ask-pip',handler)
        nav(p,'Play'); p.wait_for_timeout(500)
        p.locator('[data-act="startGame"][data-id="debate"]').click(); p.wait_for_timeout(500)
        if st=='Seeds':
            for i in range(3):
                p.locator('[data-act="dbSeedPick"]').nth(i%2).click(); p.wait_for_timeout(200)
                p.locator('[data-act="dbSeedWhy"]').first.click(); p.wait_for_timeout(200)
                p.locator('[data-act="dbSeedNext"]').click(); p.wait_for_timeout(300)
        else:
            p.locator('[data-act="dbSide"][data-id="for"]').click(); p.wait_for_timeout(200)
            for t in turns:
                p.fill('#dbtext',t); p.locator('[data-act="dbSend"]').click(); p.wait_for_timeout(500)
        p.wait_for_timeout(1500)
        rep=p.locator('.dbreport')
        print('=====',st,'| report shown:',rep.count(),'| sections:',p.locator('.dbreport h3').all_inner_texts())
        txt=rep.inner_text() if rep.count() else ''
        print('   overall:',(p.locator('.dbr-overall').inner_text() if p.locator('.dbr-overall').count() else '-')[:120])
        print('   turns:',p.locator('.dbr-turns li').count(),'| stronger versions:',p.locator('.dbr-better').count(),'| fixes:',[x[:60] for x in p.locator('.dbr-fix').all_inner_texts()][:4])
        print('   work on:',[x.split('\n')[0] for x in p.locator('.dbr-tip').all_inner_texts()])
        print('   buttons:',p.locator('.dbr-acts .btn').all_inner_texts(),'| loading left:',p.locator('.dbr-wait').count())
        p.screenshot(path=OUT+f'debrep_{st}.png',full_page=True)
        # back to start screen: saved reports listed, and one can be reopened
        p.locator('.dbr-acts [data-act="debate"]').click(); p.wait_for_timeout(500)
        print('   past list:',p.locator('.dbr-past li').all_inner_texts())
        if p.locator('[data-act="dbrOpen"]').count():
            p.locator('[data-act="dbrOpen"]').first.click(); p.wait_for_timeout(400)
            print('   reopened:',p.locator('main h1').first.inner_text(),'| report:',p.locator('.dbreport').count())
            p.locator('[data-act="dbrClose"]').click(); p.wait_for_timeout(300)
        ctx.close()
    cur.execute("select jsonb_object_keys(data->'dbr') from public.docs where path='progress/00000000-0000-0000-0000-0000000000d1'"); print('saved reports in DB:',len(cur.fetchall()))
    # admin opening the child's dashboard sees the child's reports (view only)
    ctx,p=open_as(b,'A'); p.on('pageerror',lambda e:errs.append(str(e))); p.wait_for_timeout(900)
    p.select_option('#viewas','student:Seeds'); p.wait_for_timeout(600); p.select_option('#lpv-kid','l1'); p.wait_for_timeout(900)
    nav(p,'Play'); p.wait_for_timeout(400); p.locator('[data-act="startGame"][data-id="debate"]').click(); p.wait_for_timeout(500)
    print('admin sees child reports:',len(p.locator('.dbr-past li').all_inner_texts()))
    if p.locator('[data-act="dbrOpen"]').count(): p.locator('[data-act="dbrOpen"]').first.click(); p.wait_for_timeout(400); print('admin reopened:',p.locator('.dbreport').count())
    ctx.close()
print('ai calls:',calls)
print('errors',errs)
