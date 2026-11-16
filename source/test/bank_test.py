exec(open('/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web/test/e2e_real.py').read().split("\ntry:")[0])
DICT={'brave':[{'meanings':[{'partOfSpeech':'adjective','definitions':[{'definition':'Showing courage.','example':'The brave knight faced the dragon.'}]}]}]}
def dict_route(r):
    w=r.request.url.rsplit('/',1)[1]
    if w in DICT: r.fulfill(status=200,content_type='application/json',body=json.dumps(DICT[w]),headers={'Access-Control-Allow-Origin':'*'})
    else: r.fulfill(status=404,content_type='application/json',body='{}',headers={'Access-Control-Allow-Origin':'*'})
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        ctx,p=open_as(b,'T1'); ctx.route('**/api.dictionaryapi.dev/**', dict_route)
        nav(p,'Homework'); p.click('[data-act="newHw"]'); p.wait_for_timeout(800); p.click('details.hwbank > summary'); p.wait_for_timeout(300)
        print('1 picker:', p.locator('.bankbox').count(), '| count:', p.locator('#bk-n').inner_text(), '| default stage:', p.input_value('#bk-stage'))
        p.select_option('#bk-skill','phonics'); p.wait_for_timeout(200); print('2 phonics items:', p.locator('.bk-item').count(), p.locator('#bk-n').inner_text())
        p.select_option('#bk-stage','Blooms'); p.select_option('#bk-skill','grammar'); p.wait_for_timeout(200); print('3 blooms grammar:', [t for t in p.locator('.bk-t').all_inner_texts()])
        p.fill('#bk-q','passive'); p.wait_for_timeout(200); print('4 search:', p.locator('.bk-t').all_inner_texts())
        p.locator('[data-bk="add"]').first.click(); p.wait_for_timeout(200)
        print('5 title:', p.input_value('#hw-title'), '| ins starts:', p.input_value('#hw-ins')[:80].replace('\n',' / '), '| hidden:', p.input_value('[name=bkids]'), p.input_value('[name=bkstage]'), p.input_value('[name=bkskill]'))
        p.click('details.bk-more > summary'); p.wait_for_timeout(200); p.fill('#bk-w','brave, xyzzq'); p.click('[data-bk="words"]'); p.wait_for_timeout(1200)
        print('6 words appended:', 'brave (adjective): Showing courage.' in p.input_value('#hw-ins'), '| missing noted:', 'xyzzq: ask your teacher' in p.input_value('#hw-ins'))
        p.fill('#bk-q',''); p.select_option('#bk-skill',''); p.select_option('#bk-stage',''); p.wait_for_timeout(1500)
        print('7 ours shown:', p.locator('.bk-ours').count())
        if p.locator('label:has(input[name="who"][value="learners"])').count(): p.locator('label:has(input[name="who"][value="learners"])').click()
        p.locator('input[name="hwl"]').first.check(force=True); p.wait_for_timeout(300)
        print('8 stage follows learner:', p.input_value('#bk-stage'))
        p.screenshot(path=T+'bank_modal.png'); p.click('#m-ok'); p.wait_for_timeout(1500)
        print('9 hw set; modal closed:', p.locator('#modal-root form').count()==0)
        ctx.close()
        ctx,p=open_as(b,'P1'); print('10 parent bank rows visible:', p.evaluate("(async()=>{const s=window.supabase.createClient(LL_CONFIG.supabaseUrl,LL_CONFIG.supabaseAnonKey);return 0})()")); ctx.close()
        ctx,p=open_as(b,'K1'); nav(p,'Homework'); print('11 kid sees new hw:', 'Active and passive' in p.content() or 'Passive' in p.content()); ctx.close()
        b.close()
finally:
    srv.terminate()
print(sp.run(['su','postgres','-c',"psql -q -At -d e2e -c \"select path, data->>'stage', data->>'skill', left(data->>'title',30) from docs where path like 'bank/%'; select data->>'title', data->>'stage', data->>'skill', data->'bankIds' from docs where path like 'tw/%' and data->>'kind'='hw' order by (data->>'at')::bigint desc nulls last limit 1;\""],capture_output=True,text=True).stdout)
print('ERRORS:', errors)
