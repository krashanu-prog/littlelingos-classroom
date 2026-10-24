# Pip voice library: pronunciation check and regeneration

- `diag.py` compares each word's espeak phonemes with CMUdict.
- `listen.py` / `ev.py` run whisper tiny.en (sherpa-onnx) over every clip in `pv/` and list the words heard differently
  (`ev.py` adds a spoken carrier so the recogniser has context; `python3 ev.py old|new`).
- `regen.py` re-renders clips with Kokoro af_heart 0.88: the word is spoken inside "Here is the word: X." (natural
  pronunciation) and only the part after the pause is kept, then the same finishing chain as before.
- `pick.py` tries several carriers for a word and keeps the first one the recogniser hears correctly.

v2 (Oct 2026): 37 clips were heard wrongly (cat, fish, two, six, chair, splash...). After re-rendering, all but 5 ASR
near-misses (sip/zip, bin/been, vet, jeep, umpire) are heard as the right word.
