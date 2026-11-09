"""Record every fixed line of "Debate with Pip" and "Pip's choice" with Pip's real voice (Kokoro af_heart, speed 0.88)
and the same finishing chain as the rest of the voice library, then add them to the built-in library.

Usage: python3 debate_voice.py <kokoro dir> <repo root> <debate_lines.json>
debate_lines.json is dbFixedLines() from debate_block.js (see the build notes). Lines already in the library are skipped."""
import json, os, re, subprocess, sys
import numpy as np
from scipy import signal
from kokoro_onnx import Kokoro

KDIR, REPO, LINES = sys.argv[1], sys.argv[2], sys.argv[3]
kok = Kokoro(os.path.join(KDIR, 'kokoro-v1.0.onnx'), os.path.join(KDIR, 'voices-v1.0.bin'))
lines = json.load(open(LINES))
# the app's pvNorm + pvKey (voice_block.js), so each clip is found by the line's own text
def pv_norm(t):
    t = re.sub(r"[’‘`]", "'", str(t).lower())
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9' ]+", " ", t)).strip()
def pv_key(t):
    s = pv_norm(t)
    if not s: return ''
    h = 0x811c9dc5
    for ch in s: h = ((h ^ ord(ch)) * 16777619) & 0xffffffff
    b36 = lambda n: np.base_repr(n, 36).lower()
    return b36(h) + b36(len(s))

def finish(x, sr):
    """Same chain as regen.py: trim, 80 Hz high-pass, +2.5 dB at 3 kHz, light compression, -16 LUFS-ish, fades."""
    th = max(0.0025, np.abs(x).max() * 0.012); idx = np.where(np.abs(x) > th)[0]
    if len(idx) == 0: return x
    x = x[max(0, idx[0] - int(sr * .08)):min(len(x), idx[-1] + int(sr * .15))]
    b, a = signal.butter(2, 80 / (sr / 2), 'high'); x = signal.lfilter(b, a, x)
    w0 = 3000 / (sr / 2); Q = .9; A = 10 ** (2.5 / 40); al = np.sin(np.pi * w0) / (2 * Q); c = np.cos(np.pi * w0)
    b = np.array([1 + al * A, -2 * c, 1 - al * A]); a = np.array([1 + al / A, -2 * c, 1 - al / A]); x = signal.lfilter(b / a[0], a / a[0], x)
    env = np.zeros_like(x); e = 0.0; att = np.exp(-1 / (sr * .005)); rel = np.exp(-1 / (sr * .12))
    for n, v in enumerate(np.abs(x)):
        e = att * e + (1 - att) * v if v > e else rel * e + (1 - rel) * v
        env[n] = e
    db = 20 * np.log10(np.maximum(env, 1e-6)); over = np.maximum(0, db + 20); x = x * 10 ** (-(over - over / 2.5) / 20)
    pk = np.abs(x).max(); act = x[np.abs(x) > pk * .03]; rms = np.sqrt(np.mean(act ** 2)) if len(act) else 1e-4
    x = x * (10 ** (-16.3 / 20) / max(rms, 1e-4))
    lim = 10 ** (-1.5 / 20); knee = lim * .8; m = np.abs(x); o = m > knee
    x[o] = np.sign(x[o]) * (knee + (lim - knee) * np.tanh((m[o] - knee) / (lim - knee)))
    f = int(sr * .012); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    return np.clip(x, -1, 1).astype(np.float32)

def mp3(x, sr, path):
    subprocess.run(['ffmpeg', '-v', 'quiet', '-y', '-f', 'f32le', '-ar', str(sr), '-ac', '1', '-i', '-',
                    '-codec:a', 'libmp3lame', '-b:a', '48k', '-ar', '24000', path], input=x.tobytes(), check=True)

pvj_path = os.path.join(REPO, 'pv.json'); pvj = json.load(open(pvj_path))
os.makedirs(os.path.join(REPO, 'pv'), exist_ok=True)
made = 0
for i, t in enumerate(lines):
    k = pv_key(t)
    if k in pvj['k'] and os.path.exists(os.path.join(REPO, 'pv', k + '.mp3')): continue
    a, sr = kok.create(t, voice='af_heart', speed=0.88, lang='en-us')
    mp3(finish(np.asarray(a, dtype=np.float32), sr), sr, os.path.join(REPO, 'pv', k + '.mp3'))
    pvj['k'][k] = '1'; made += 1
    if made % 25 == 0:
        json.dump(pvj, open(pvj_path, 'w'), separators=(',', ':')); print('recorded', made, flush=True)
json.dump(pvj, open(pvj_path, 'w'), separators=(',', ':'))
print('recorded', made, 'new lines of', len(lines))
