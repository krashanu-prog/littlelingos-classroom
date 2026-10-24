import json,sys,os,re,subprocess,shutil,numpy as np
sys.argv=[sys.argv[0]]  # keep regen from processing all words
src=open('regen.py').read().split("km=json.load")[0]
exec(src)
# ev.py defines kok again inside split part; define hear2 pieces manually
ev=open('ev.py').read(); ev=ev[:ev.index("km=json.load(open('/tmp/t5/keymap.json'))")]
exec("\n".join(l for l in ev.splitlines() if not l.startswith(('from kokoro_onnx','K=','kok='))))
km=json.load(open('/tmp/t5/keymap.json'))['map']; inv={v:k for k,v in km.items()}
OLD='/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/repo/pv/'
hom={'one':{'won'},'tea':{'t','tee'},'two':{'to','too'},'four':{'for'},'sea':{'see'},'pear':{'pair'},'whale':{'wail'},'heel':{'heal'},'raise':{'rays'},'veil':{'vail'},'weigh':{'way'},'fin':{'finn'},'bell':{'belle'}}
ok=lambda t,h: h==norm(t) or h in hom.get(t,set()) or h==norm(t)+'s'
words=sys.stdin.read().split()
CARS=['Here is the word: ','Say the word: ','Pip says:... ','The word is: ','Listen: ']
for t in words:
    k=inv[t]; chosen=None; tries=[]
    for c in CARS:
        CAR=c; CAR_LEN=None
        try: a,sr=synth(t)
        except Exception as e: print(' err',e); continue
        y=finish(a,sr); p=f'/tmp/t5/cand_{k}.mp3'; mp3(y,sr,p); h=hear2(p); tries.append((c.strip(),h))
        if ok(t,h): chosen=(c,h); shutil.move(p,'/tmp/t5/newpv/'+k+'.mp3'); break
    if not chosen:
        h=hear2(OLD+k+'.mp3')
        if ok(t,h): chosen=('OLD',h); shutil.copy(OLD+k+'.mp3','/tmp/t5/newpv/'+k+'.mp3')
    print(f'{t:10}', chosen if chosen else ('NONE',tries))
