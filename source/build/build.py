"""Build the self-hosted site/index.html from the claude.ai app source."""
import re, shutil, os
P = '/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/'
W = P + 'web/'
s = open(P + 'littlelingos.html').read()

def R(a, b, cnt=1):
    global s
    n = s.count(a)
    assert n == cnt, (n, a[:100])
    s = s.replace(a, b)

# files and links
R('"/_blob/"+x.asset', '(window.LL_assetUrl?LL_assetUrl(x.asset):"/_blob/"+x.asset)')
R('classroomUrl||"the Little Lingos Classroom link"', 'classroomUrl||location.origin')
R('placeholder="https://claude.ai/artifact/…"', 'placeholder="https://classroom.your-site.com"')
R('Add the classroom link in Settings → Academy so invite messa', 'Add your classroom web address in Settings → Academy so invite messa')

# wording that mentioned claude.ai
R('centerMsg("Open Little Lingos from claude.ai","This classroom keeps gardens, attendance and fees for everyone who uses it. That only works when the page is opened from its claude.ai link while you\'re signed in.")',
  'centerMsg("Can\'t reach the classroom","Check your internet connection, then reload the page.")')
R('Sign in to claude.ai and open the link again.")', 'Reload the page and sign in with your email.")')
R("Connect the learner's claude.ai account so they see their garden and classes.", "Connect the account the learner signed in with so they see their garden and classes.")
R('<p class="section-title">Sign-in</p><p class="small">You sign in with your claude.ai account. Anyone who signs in with your account sees the same children, so use one account per family.</p></section>',
  '<p class="section-title">Sign-in</p><p class="small">You sign in with your email and a one-time code, or with a password once you set one. Both parents can sign in with their own emails; ask the academy to connect each one.</p><div class="row"><button class="btn btn-ghost btn-sm" data-act="setPassword">Set or change password</button><button class="btn btn-ghost btn-sm" data-act="signOut">Sign out</button></div></section>')

# sign out everywhere
R('A.profile=()=>{', 'A.signOut=()=>{if(window.LL_signOut)LL_signOut();};\nA.setPassword=()=>{closeModal&&closeModal();if(window.LL_setPassword)LL_setPassword();};\nA.profile=()=>{')
R('{submitLabel:"Save",done:"Saved",onSubmit:async f=>{await upsert("profiles/"+S.uid,{displayName:f.name.value.trim()})}});',
  '{submitLabel:"Save",done:"Saved",footerExtra:`<button type="button" class="btn btn-ghost" data-mact="pw">Set or change password</button><button type="button" class="btn btn-ghost" data-mact="out">Sign out</button>`,actions:{out:()=>A.signOut(),pw:()=>A.setPassword()},onSubmit:async f=>{await upsert("profiles/"+S.uid,{displayName:f.name.value.trim()})}});')
i = s.index('function meView(){')
tok = '<p class="lede">${esc(stageLabel(L.stage))}</p></div></div></div>'
j = s.index(tok, i)
s = s[:j] + '<p class="lede">${esc(stageLabel(L.stage))}</p></div></div>${S.viewAs?"":`<div class="row"><button class="btn btn-ghost btn-sm" data-act="setPassword">My password</button><button class="btn btn-ghost btn-sm" data-act="signOut">Sign out</button></div>`}</div>' + s[j + len(tok):]


# ---- sign-in emails on trainer and learner records (auto-connect) ----
R('<div class="field"><label for="lf-email">Email</label><input type="email" id="lf-email" name="email" maxlength="120" data-label="Email" value="${esc(pv.email||"")}" placeholder="parent@example.com"><span class="hint">The learner\'s trainer can send class links to this phone and email. Nobody else sees them.</span></div>',
  '<div class="two"><div class="field"><label for="lf-email">Parent\'s email (sign-in)</label><input type="email" id="lf-email" name="email" maxlength="120" data-label="Parent\'s email" value="${esc(pv.email||"")}" placeholder="parent@example.com"></div><div class="field"><label for="lf-email2">Second parent\'s email (optional)</label><input type="email" id="lf-email2" name="email2" maxlength="120" data-label="Second parent\'s email" value="${esc(pv.email2||"")}"></div></div>'
  '<span class="hint" style="margin-top:-8px">Parents sign in at ${esc(location.origin)} with these emails and see this child straight away. The trainer can also send class links to them. Nobody else sees them.</span>'
  '<div class="field"><label for="lf-semail">Learner\'s own email (optional)</label><input type="email" id="lf-semail" name="semail" maxlength="120" data-label="Learner\'s email" value="${esc(pv.studentEmail||"")}" placeholder="For older learners with their own login"><span class="hint">If the learner signs in with this email, they get their own garden and lessons.</span></div>')
R('upsert("private/"+lid,{guardian:f.guardian.value.trim(),phone:f.phone.value.trim(),guardian2:f.guardian2.value.trim(),phone2:f.phone2.value.trim(),email:f.email.value.trim(),notes:f.notes.value.trim()}',
  'upsert("private/"+lid,{guardian:f.guardian.value.trim(),phone:f.phone.value.trim(),guardian2:f.guardian2.value.trim(),phone2:f.phone2.value.trim(),email:chkEmail(f.email.value,"parent\'s email"),email2:chkEmail(f.email2.value,"second parent\'s email"),studentEmail:chkEmail(f.semail.value,"learner\'s email"),notes:f.notes.value.trim()}')
R('<span class="hint">Connected trainers can clock in, take attendance and read notices.</span></div></div>',
  '<span class="hint">Connected trainers can clock in, take attendance and read notices.</span></div></div>'
  '<div class="field"><label for="tf-email">Trainer\'s email (sign-in)</label><input type="email" id="tf-email" name="lemail" maxlength="120" data-label="Trainer\'s email" value="${esc(pv.loginEmail||"")}" placeholder="trainer@example.com"><span class="hint">The trainer signs in at ${esc(location.origin)} with this email and lands on their trainer dashboard. No other setup needed.</span></div>')
R('await upsert("private/"+tid,{phone:f.phone.value.trim(),rate:+f.rate.value||0,notes:f.notes.value.trim()});',
  'await upsert("private/"+tid,{phone:f.phone.value.trim(),rate:+f.rate.value||0,notes:f.notes.value.trim(),loginEmail:chkEmail(f.lemail.value,"trainer\'s email")});')
R('async function saveTrainer(f,id){', 'function chkEmail(v,what){v=String(v||"").trim().toLowerCase();if(v&&!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v))throw userErr("Check the "+what+".");return v;}\nasync function saveTrainer(f,id){')

exec(open(W+'parents_patch.py').read())
exec(open(W+'bank_patch.py').read())
exec(open(W+'fun_patch.py').read())
exec(open(W+'hwform_patch.py').read())
exec(open(W+'draw_patch.py').read())
exec(open(W+'pip_patch.py').read())
exec(open(W+'upi_patch.py').read())
exec(open(W+'adapt_patch.py').read())
exec(open(W+'dt_patch.py').read())
exec(open(W+'wall_patch.py').read())
exec(open(W+'board_patch.py').read())
exec(open(W+'notif_patch.py').read())
exec(open(W+'say_patch.py').read())
exec(open(W+'store_patch.py').read())
exec(open(W+'cap_patch.py').read())
exec(open(W+'conf_patch.py').read())
exec(open(W+'reel_patch.py').read())
exec(open(W+'teach_patch.py').read())
exec(open(W+'india_patch.py').read())
exec(open(W+'sound_patch.py').read())
exec(open(W+'pp_patch.py').read())
exec(open(W+'share_patch.py').read())
exec(open(W+'wod_patch.py').read())
exec(open(W+'voice_patch.py').read())
exec(open(W+'classfix_patch.py').read())
exec(open(W+'sec_patch.py').read())
exec(open(W+'cls2_patch.py').read())
exec(open(W+'lf_patch.py').read())
exec(open(W+'studio_patch.py').read())
exec(open(W+'nk_patch.py').read())
exec(open(W+'wb_patch.py').read())
exec(open(W+'qz_patch.py').read())
exec(open(W+'polish_patch.py').read())
# drop the claude-only meta
R('<meta name="claude:viewport-fit-sides" content="cover">\n', '')

head = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#22703A">
<meta name="description" content="Little Lingos Classroom: classes, progress, homework and fees for learners, parents and trainers.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icon-192.png">
<style>:root{color-scheme:light}body{margin:0}[hidden]{display:none!important}
#ll-gate{position:fixed;inset:0;z-index:9999;overflow:auto;background:var(--ground);display:flex}
#ll-gate .center{margin:auto;padding:24px 16px;width:100%;box-sizing:border-box;display:flex;justify-content:center}
#ll-gate .ll-gate-card{max-width:440px;width:100%;align-items:stretch;gap:14px}
#ll-gate h1{margin:0}#ll-gate form{display:flex;flex-direction:column;gap:12px}
.ll-brand{--ls:40px;display:flex;align-items:center;gap:8px;align-self:center;margin-bottom:4px}.ll-brand .lg-pip{width:52px;height:64px;flex:none}</style>
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://cdn.jsdelivr.net https://huggingface.co https://*.huggingface.co https://*.hf.co https://api.datamuse.com; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<style id="ll-fb">html{display:none!important}</style><script>if(self===top){var s=document.getElementById("ll-fb");s.parentNode.removeChild(s)}else{try{top.location.replace(self.location.href)}catch(e){}}</script>
<script src="config.js"></script>
<script src="supabase.js"></script>
<script src="adapter.js?v=ADAPTER_V"></script>
<script src="bank.js"></script>
<script src="gk.js"></script>
</head>
<body>
'''
os.makedirs(W + 'site/vendor', exist_ok=True)
import hashlib as _hl
head = head.replace('ADAPTER_V', _hl.sha256(open(W + 'site/adapter.js','rb').read()).hexdigest()[:10])
open(W + 'site/index.html', 'w').write(head + s + '\n</body>\n</html>\n')
shutil.copy(W + 'package/dist/umd/supabase.js', W + 'site/supabase.js')
shutil.copy(W + 'share_src.html', W + 'site/share.html')
for _f in os.listdir(W + '../pipvoice/out'): shutil.copy(W + '../pipvoice/out/' + _f, W + 'site/pip-' + _f)
shutil.copy(W + 'sw_src.js', W + 'site/sw.js')
open(W + 'site/robots.txt', 'w').write('User-agent: *\nDisallow: /share.html\nDisallow: /share\n')
print('built', len(s))
