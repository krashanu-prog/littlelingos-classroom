import json,re,sys
from kokoro_onnx.tokenizer import Tokenizer
tk=Tokenizer()
cmu={}
for line in open('/tmp/t5/dict/cmudict.dict',encoding='utf8',errors='ignore'):
    p=line.strip().split(' ')
    w=re.sub(r'\(\d\)$','',p[0]).lower()
    cmu.setdefault(w,[]).append([re.sub(r'\d','',x) for x in p[1:] if not x.startswith('#')])
# ARPAbet -> coarse classes ; espeak IPA -> same coarse classes
A2C={'AA':'a','AE':'a','AH':'ə','AO':'o','AW':'aw','AY':'ay','B':'b','CH':'ch','D':'d','DH':'dh','EH':'e','ER':'er','EY':'ey','F':'f','G':'g','HH':'h','IH':'i','IY':'i','JH':'j','K':'k','L':'l','M':'m','N':'n','NG':'ng','OW':'o','OY':'oy','P':'p','R':'r','S':'s','SH':'sh','T':'t','TH':'th','UH':'u','UW':'u','V':'v','W':'w','Y':'y','Z':'z','ZH':'zh'}
I2C=[('tʃ','ch'),('dʒ','j'),('aɪ','ay'),('aʊ','aw'),('eɪ','ey'),('oʊ','o'),('ɔɪ','oy'),('ɪə','i'),('ɚ','er'),('ɝ','er'),('ɾ','t'),('ŋ','ng'),('ʃ','sh'),('ʒ','zh'),('θ','th'),('ð','dh'),('ɹ','r'),('ɡ','g'),('j','y'),('æ','a'),('ɑ','a'),('ɒ','o'),('ɔ','o'),('ə','ə'),('ʌ','ə'),('ɛ','e'),('ɪ','i'),('i','i'),('ʊ','u'),('u','u'),('e','e'),('o','o'),('a','a')]
def ipa2c(ipa):
    s=re.sub(r'[ˈˌː\s]','',ipa);out=[]
    while s:
        for k,v in I2C:
            if s.startswith(k): out.append(v); s=s[len(k):]; break
        else:
            if s[0] in 'bdfghklmnprstvwz': out.append(s[0])
            s=s[1:]
    return out
def arp2c(seq): return [A2C.get(x,'?') for x in seq]
def norm(c): # merge near-equivalents kids won't notice
    m={'ə':'ə','a':'a','o':'o','e':'e','i':'i','u':'u'}
    return [m.get(x,x) for x in c]
def wordcheck(t):
    ipa=tk.phonemize(t,lang="en-us")
    words=re.findall(r"[a-z']+",t.lower())
    oov=[w for w in words if w not in cmu]
    if oov: return {'t':t,'ipa':ipa,'status':'not in dictionary','oov':oov}
    got=norm(ipa2c(ipa))
    opts=[]
    import itertools
    for combo in itertools.product(*[cmu[w] for w in words]):
        opts.append(norm([c for seq in combo for c in arp2c(seq)]))
    # vowels differ often by accent (ə vs a/i etc) -> compare consonant skeleton first, then vowel count
    cons=lambda c:[x for x in c if x not in ('ə','a','o','e','i','u','ay','aw','ey','oy','er')]
    vow=lambda c:[x for x in c if x in ('ə','a','o','e','i','u','ay','aw','ey','oy','er')]
    ok=any(cons(o)==cons(got) and len(vow(o))==len(vow(got)) for o in opts)
    close=any(cons(o)==cons(got) for o in opts)
    return {'t':t,'ipa':ipa,'status':'ok' if ok else ('vowel/syllable differs' if close else 'MISMATCH'),'cmu':[' '.join(seq) for combo in itertools.product(*[cmu[w] for w in words]) for seq in combo][:2]}
r=json.load(open('/tmp/t5/allwords.json'))
res=[dict(wordcheck(x['t']),src=x['src']) for x in r]
json.dump(res,open('/tmp/t5/diag.json','w'),ensure_ascii=False,indent=0)
from collections import Counter
print(Counter(x['status'] for x in res))
for x in res:
    if x['status']!='ok': print(x['status'].ljust(24),x['t'].ljust(14),x['ipa'].ljust(18),x.get('cmu',x.get('oov')),x['src'])
