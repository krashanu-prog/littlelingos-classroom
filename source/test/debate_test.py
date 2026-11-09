exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2,time
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
def stage(st): cur.execute("""update public.docs set data = data || jsonb_build_object('stage',%s) where path='learners/l1'""",(st,)); c.commit()
OUT='/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/'
errs=[]
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
    for st in ['Seeds','Sprouts','Blooms']:
        stage(st); ctx,p=open_as(b,'K1'); p.on('pageerror',lambda e:errs.append(str(e))); p.set_viewport_size({'width':390,'height':844}); nav(p,'Play'); p.wait_for_timeout(400)
        print('=====',st,[x.split('\n')[1] for x in p.locator('.gamecard').all_inner_texts()][:3])
        p.locator('[data-act="startGame"][data-id="debate"]').click(); p.wait_for_timeout(400)
        if st=='Seeds':
            for i in range(3):
                print('  ',p.locator('.dbbig').all_inner_texts())
                p.locator('[data-act="dbSeedPick"]').nth(i%2).click(); p.wait_for_timeout(200)
                print('   pip:',p.locator('.bubble').inner_text())
                if i==0: p.screenshot(path=OUT+'db_seeds.png')
                p.locator('[data-act="dbSeedWhy"]').first.click(); p.wait_for_timeout(200)
                print('   line:',p.locator('.dbline').inner_text())
                p.locator('[data-act="dbSeedNext"]').click(); p.wait_for_timeout(200)
            print('   end:',p.locator('main h1').all_inner_texts())
        else:
            print('  motion:',p.locator('.dbmotion h2').inner_text()); p.locator('[data-act="dbNext"]').click(); p.wait_for_timeout(150)
            print('  motion2:',p.locator('.dbmotion h2').inner_text()); p.screenshot(path=OUT+f'db_{st}_pick.png')
            p.locator('[data-act="dbSide"][data-id="for"]').click(); p.wait_for_timeout(200)
            turns=["Yes","I think this is good because children learn a lot from it.",
                   "However, for example my friend tried it and she became much better at speaking in class.",
                   "I see your point, but it also helps families and friends work together, so it is fair.",
                   "To sum up, I believe my side is right because it helps everyone grow and learn every day."]
            for t in turns:
                p.locator('[data-act="dbStarter"]').first.click() if t=="Yes" else None
                p.fill('#dbtext',t); p.locator('[data-act="dbSend"]').click(); p.wait_for_timeout(200)
                print('   >',t[:40],'| lede:',p.locator('.head .lede').inner_text())
                if p.locator('.dbmsg.pip p').count(): print('     pip:',p.locator('.dbmsg.pip p').last.inner_text()[:200])
            p.screenshot(path=OUT+f'db_{st}_end.png',full_page=True)
            print('  result:',p.locator('.dbres').inner_text().replace('\n',' | ')[:400])
        ctx.close()
    # parent report shows the debate as speaking
    ctx,p=open_as(b,'P1'); p.on('pageerror',lambda e:errs.append(str(e))); nav(p,'Progress'); p.wait_for_timeout(600)
    t=p.locator('main').inner_text(); i=t.find('Speaking'); print('parent speaking:',t[i:i+120].replace('\n',' '))
    ctx.close()
print('errors',errs)
