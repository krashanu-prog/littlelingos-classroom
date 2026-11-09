exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
def stage(st): cur.execute("""update public.docs set data = data || jsonb_build_object('stage',%s) where path='learners/l1'""",(st,)); c.commit()
errs=[]
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args=['--autoplay-policy=no-user-gesture-required'])
    for st in ['Seeds','Sprouts']:
        stage(st); ctx,p=open_as(b,'K1'); p.on('pageerror',lambda e:errs.append(str(e)))
        got=[]; p.on('request',lambda r: got.append(r.url.split('/')[-1].split('?')[0]) if '/pv/' in r.url else None)
        nav(p,'Play'); p.wait_for_timeout(500); got.clear()
        p.locator('[data-act="startGame"][data-id="debate"]').click(); p.wait_for_timeout(5000)
        if st=='Seeds':
            print(st,'question clips:',got); got.clear()
            p.locator('[data-act="dbSeedPick"]').first.click(); p.wait_for_timeout(9000); print('  pick clips:',got); got.clear()
            p.locator('[data-act="dbSeedWhy"]').first.click(); p.wait_for_timeout(6000); print('  reason clips:',got)
        else:
            p.locator('[data-act="dbSide"][data-id="against"]').click(); p.wait_for_timeout(9000); print(st,'opening clips:',got,'| voice note:',p.locator('#dbvoice').inner_text() if p.locator('#dbvoice').count() else '')
        ctx.close()
print('errors',errs)
