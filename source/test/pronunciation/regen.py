import json,sys,os,subprocess,numpy as np
from scipy import signal
from kokoro_onnx import Kokoro
K='/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/kok/'
kok=Kokoro(K+'kokoro-v1.0.onnx',K+'voices-v1.0.bin')
OUT='/tmp/t5/newpv/';os.makedirs(OUT,exist_ok=True)
# words Kokoro says oddly on their own: spell out the sounds (IPA) so it says them the dictionary way
IPA=json.load(open('/tmp/t5/ipa_fix.json')) if os.path.exists('/tmp/t5/ipa_fix.json') else {}
exec(open('/tmp/t5/carrier.py').read())
CAR_LEN=None
def quiet_runs(a,sr,th_frac=0.02,step=0.005):
    w=int(sr*step); env=np.array([np.sqrt(np.mean(a[i:i+w]**2)) for i in range(0,len(a)-w,w)])
    th=env.max()*th_frac; q=env<th; runs=[]; i=0
    while i<len(q):
        if q[i]:
            j=i
            while j<len(q) and q[j]: j+=1
            runs.append((i*step,j*step)); i=j
        else: i+=1
    return runs
def speech_len(c,sr):
    th=max(0.0025,np.abs(c).max()*0.012); idx=np.where(np.abs(c)>th)[0]
    return (idx[-1]-idx[0])/sr if len(idx) else 0
CAR='Here is the word: '
def env5(a,sr):
    w=int(sr*.005); return np.array([np.sqrt(np.mean(a[i:i+w]**2)) for i in range(0,len(a)-w,w)])
def qruns(E,th):
    q=E<th; out=[]; i=0
    while i<len(q):
        if q[i]:
            j=i
            while j<len(q) and q[j]: j+=1
            out.append((i*.005,j*.005)); i=j
        else: i+=1
    return out
def synth(text):
    # Pip says the word inside a short sentence (so it is pronounced the natural way); the colon makes a clear
    # pause before the word, and only the part after that pause is kept
    global CAR_LEN
    w=IPA.get(text) or text
    if CAR_LEN is None:
        t,sr=kok.create(CAR.strip(),voice='af_heart',speed=0.88,lang='en-us',trim=False); E=env5(t,sr); CAR_LEN=np.where(E>E.max()*.02)[0][-1]*.005
    a,sr=kok.create(CAR+w+'.',voice='af_heart',speed=0.88,lang='en-us',trim=False); E=env5(a,sr); total=len(E)*.005
    rs=[r for r in qruns(E,E.max()*.02) if r[1]-r[0]>=0.06 and CAR_LEN-0.25<=r[0]<=CAR_LEN+0.35 and r[1]<total-0.3]
    if rs: cut=int((rs[0][1]-0.04)*sr)
    else: cut=int((CAR_LEN+0.05)*sr); print('  (no gap found, template cut)',text)
    c=a[max(0,cut):]
    if speech_len(c,sr)<0.1: c=a[int((CAR_LEN+0.05)*sr):]; print('  (too short, template cut)',text)
    return c.astype(np.float32),sr
def finish(x,sr):
    # trim: find speech with a LOW threshold so quiet starts (s, f, th, h) survive; keep 80 ms before and 150 ms after
    th=max(0.0025,np.abs(x).max()*0.012)
    idx=np.where(np.abs(x)>th)[0]
    if len(idx)==0: return x
    i=max(0,idx[0]-int(sr*.08)); j=min(len(x),idx[-1]+int(sr*.15))
    x=x[i:j]
    # 80 Hz high-pass, +2.5 dB bell at 3 kHz (Q .9)
    b,a=signal.butter(2,80/(sr/2),'high'); x=signal.lfilter(b,a,x)
    w0=3000/(sr/2); Q=.9; A=10**(2.5/40); al=np.sin(np.pi*w0)/(2*Q); c=np.cos(np.pi*w0)
    b=np.array([1+al*A,-2*c,1-al*A]); a=np.array([1+al/A,-2*c,1-al/A]); x=signal.lfilter(b/a[0],a/a[0],x)
    # light compressor (-20 dB threshold, 2.5:1, 5 ms attack, 120 ms release)
    env=np.zeros_like(x); e=0.0; att=np.exp(-1/(sr*.005)); rel=np.exp(-1/(sr*.12))
    for n,v in enumerate(np.abs(x)):
        e = att*e+(1-att)*v if v>e else rel*e+(1-rel)*v
        env[n]=e
    db=20*np.log10(np.maximum(env,1e-6)); over=np.maximum(0,db-(-20)); gain=10**(-(over-over/2.5)/20); x=x*gain
    # loudness: active RMS to -16.3 dB, peaks under -1.5 dB with a soft knee
    pk=np.abs(x).max(); act=x[np.abs(x)>pk*.03]; rms=np.sqrt(np.mean(act**2)) if len(act) else 1e-4
    x=x*(10**(-16.3/20)/max(rms,1e-4))
    lim=10**(-1.5/20); knee=lim*.8; m=np.abs(x); over=m>knee
    x[over]=np.sign(x[over])*(knee+(lim-knee)*np.tanh((m[over]-knee)/(lim-knee)))
    # fades
    f=int(sr*.012); x[:f]*=np.linspace(0,1,f); x[-f:]*=np.linspace(1,0,f)
    return np.clip(x,-1,1).astype(np.float32)
def mp3(x,sr,path):
    subprocess.run(['ffmpeg','-v','quiet','-y','-f','f32le','-ar',str(sr),'-ac','1','-i','-','-codec:a','libmp3lame','-b:a','48k','-ar','24000',path],input=x.tobytes(),check=True)
km=json.load(open('/tmp/t5/keymap.json'))['map']
want=sys.argv[1:] or [t for t in km.values() if t!='?']
inv={v:k for k,v in km.items()}
for t in want:
    a,sr=synth(t); y=finish(a,sr); mp3(y,sr,OUT+inv[t]+'.mp3')
print('made',len(want))
