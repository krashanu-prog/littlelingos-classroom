import json,subprocess,numpy as np,re,glob,os,sys
exec(open('/tmp/t5/listen.py').read().split("km=json.load")[0])
from kokoro_onnx import Kokoro
K='/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/kok/'
kok=Kokoro(K+'kokoro-v1.0.onnx',K+'voices-v1.0.bin')
car,sr=kok.create("The word is",voice='af_heart',speed=0.88,lang='en-us')
car=subprocess.run(['ffmpeg','-v','quiet','-f','f32le','-ar',str(sr),'-ac','1','-i','-','-ac','1','-ar','16000','-f','f32le','-'],input=car.astype(np.float32).tobytes(),capture_output=True).stdout
car=np.frombuffer(car,dtype=np.float32)
def hear2(path):
    a=wav(path)[8000:-16000]
    x=np.concatenate([np.zeros(4000,np.float32),car,np.zeros(4800,np.float32),a,np.zeros(12000,np.float32)])
    s=rec.create_stream();s.accept_waveform(16000,x);rec.decode_stream(s);t=s.result.text.strip()
    t=norm(t); t=re.sub(r'^the word is\s*','',t); return t
km=json.load(open('/tmp/t5/keymap.json'))['map']
REPO='/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/repo/pv/'
which=sys.argv[1] if len(sys.argv)>1 else 'old'
D=REPO if which=='old' else '/tmp/t5/newpv/'
res={}
for k,t in km.items():
    if t=='?' : continue
    p=D+k+'.mp3'
    if not os.path.exists(p): continue
    res[t]=hear2(p)
bad={t:h for t,h in res.items() if norm(t)!=h}
json.dump({'all':res,'bad':bad},open(f'/tmp/t5/ev_{which}.json','w'),indent=0)
print(which,len(res),'clips,',len(bad),'heard differently')
for t,h in bad.items(): print(f'   {t:16} -> {h}')
