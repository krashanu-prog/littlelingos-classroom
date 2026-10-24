import json,subprocess,numpy as np,re,glob,os,sys
import sherpa_onnx
M='/tmp/t5/asr/sherpa-onnx-whisper-tiny.en/'
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+'tiny.en-encoder.int8.onnx',decoder=M+'tiny.en-decoder.int8.onnx',tokens=M+'tiny.en-tokens.txt',num_threads=4)
def wav(path):
    out=subprocess.run(['ffmpeg','-v','quiet','-i',path,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout
    a=np.frombuffer(out,dtype=np.float32)
    # pad with silence so whisper gets context
    return np.concatenate([np.zeros(8000,np.float32),a,np.zeros(16000,np.float32)])
def hear(path):
    s=rec.create_stream();s.accept_waveform(16000,wav(path));rec.decode_stream(s);return s.result.text.strip()
norm=lambda t:re.sub(r"[^a-z0-9' ]+"," ",t.lower()).strip()
km=json.load(open('/tmp/t5/keymap.json'))['map']
REPO='/tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/repo/'
res=[]
files=sys.argv[1:] or sorted(glob.glob(REPO+'pv/*.mp3'))
for f in files:
    k=os.path.basename(f)[:-4]; exp=km.get(k,'?')
    heard=hear(f)
    res.append({'k':k,'file':f,'expected':exp,'heard':heard,'ok':norm(heard)==norm(exp)})
json.dump(res,open('/tmp/t5/heard.json','w'),indent=0)
bad=[x for x in res if not x['ok']]
print(len(res),'clips;',len(bad),'heard differently')
for x in bad: print(f"  {x['expected']!r:34} -> heard {x['heard']!r}")
