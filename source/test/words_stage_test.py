exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
import psycopg2,json,time
c=psycopg2.connect(host='127.0.0.1',user='postgres',password='pw',dbname='e2e'); cur=c.cursor()
for f in ['supabase/starter-content.sql','supabase/age-lessons.sql']: cur.execute(open(f).read())
cur.execute("""update public.docs set data = data || '{"stage":"Blooms","courses":["ex-seeds","ex-blooms"]}' where path='learners/l1'""")
cur.execute("select data->>'uid' from docs where path='learners/l1'"); kuid=cur.fetchone()[0]
now=int(time.time()*1000)
cur.execute("insert into public.docs(path,data) values (%s,%s::jsonb) on conflict (path) do update set data=public.docs.data||excluded.data",('progress/'+kuid,json.dumps({"completed":{"ex-s1":now-86400000,"ex-s2":now-80000000,"ex-b1":now-3600000}}))); c.commit()
def words(p):
    nav(p,'Words'); p.wait_for_timeout(500)
    lede=p.locator('main .head .lede').first.inner_text()
    return lede
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        ctx,p=open_as(b,'K1'); print('Blooms child (did 2 Seeds lessons + 1 Blooms):',words(p))
        print('   word sheet words:',p.evaluate("[...document.querySelectorAll('main')].map(m=>m.innerText)[0]").count('confident'), '(confident = Blooms word present?)')
        ctx.close()
        ctx,p=open_as(b,'A'); p.wait_for_timeout(300)
        for st in ['Seeds','Sprouts','Blooms']:
            p.select_option('#viewas','student:'+st); p.wait_for_timeout(500)
            print('admin preview',st,':',words(p),'| first card:',p.locator('.flash b, .fcard b, main .card b').first.inner_text()[:30])
        print('errors:', errors[:3]); b.close()
finally: srv.terminate()
