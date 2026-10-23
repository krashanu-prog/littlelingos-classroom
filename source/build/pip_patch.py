# ---- Ask Pip helper on every dashboard ----
R('/* ================= events ================= */',open(W+'pip_block.js').read()+'\n/* ================= events ================= */')
R('@media (prefers-reduced-motion:reduce)','''#pipfab{position:fixed;right:20px;bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:55;display:flex;align-items:center;gap:8px;padding:6px 16px 6px 8px;border-radius:999px;border:3px solid #fff;background:var(--leaf);color:#fff;font-family:var(--display);font-weight:800;font-size:1.05rem;cursor:pointer;box-shadow:0 8px 24px rgba(46,34,25,.25)}
#pipfab svg{width:40px;height:46px;flex:none;animation:pipbob 3.2s ease-in-out infinite;transform-origin:50% 100%}
#pipfab:hover{background:var(--leafMid)}#pipfab:focus-visible{outline:3px solid var(--skyDeep);outline-offset:3px}
#pipfab .pfb{position:absolute;top:-6px;right:-6px;min-width:22px;height:22px;border-radius:999px;background:var(--tomato);color:#fff;font-family:var(--body);font-size:.75rem;font-weight:700;display:grid;place-items:center;padding:0 5px;border:2px solid #fff}
#pippanel{position:fixed;right:16px;bottom:16px;top:80px;z-index:70;width:min(420px,calc(100vw - 32px));background:var(--ground);border:2px solid var(--line);border-radius:28px;box-shadow:0 16px 48px rgba(46,34,25,.25);display:flex;flex-direction:column;overflow:hidden}
.pip-head{display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--sky)}
.pip-av{width:44px;height:52px;flex:none}.pip-head .grow{flex:1;min-width:0}.pip-head b{display:block;font-family:var(--display);font-size:1.3rem;line-height:1}.pip-head span{font-size:.85rem;color:var(--muted)}
.pip-tabs{display:flex;gap:4px;padding:8px 10px;border-bottom:2px solid var(--line);overflow-x:auto;background:#fff}
.pip-tabs button{border:0;background:none;font:inherit;font-weight:700;padding:8px 12px;border-radius:999px;cursor:pointer;white-space:nowrap;color:var(--muted)}
.pip-tabs button.on{background:var(--leafSoft);color:var(--leaf)}
.pip-body{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
.pip-say{font-family:var(--display);font-weight:700;font-size:1.05rem;background:#fff;border-radius:18px 18px 18px 6px;padding:10px 14px;margin:0;align-self:flex-start;max-width:92%}
.pip-list{display:flex;flex-direction:column;gap:8px}
.pip-up{display:flex;justify-content:space-between;align-items:center;gap:8px;text-align:left;background:#fff;border:2px solid var(--line);border-radius:16px;padding:10px 12px;font:inherit;font-weight:700;cursor:pointer;color:var(--soil)}
.pip-up.urgent{border-color:var(--sun);background:var(--sunSoft)}.pip-up span{color:var(--leaf);font-size:1.3rem}
.pip-moods{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.pip-mood{display:flex;flex-direction:column;align-items:center;gap:4px;background:#fff;border:2px solid var(--line);border-radius:16px;padding:8px 4px;font:inherit;font-size:.78rem;font-weight:700;cursor:pointer;color:var(--soil);text-align:center}
.pip-mood.on{border-color:var(--leafMid);background:var(--leafSoft)}
.pip-note{background:var(--leafSoft);border-radius:14px;padding:10px 12px;margin:0}
.pip-h4{margin:6px 0 0;font-size:1rem}.pip-mlist{display:flex;flex-direction:column;gap:6px}
.pip-mrow{display:flex;align-items:center;gap:8px;background:#fff;border-radius:12px;padding:6px 10px}.pip-mrow b{flex:1}.pip-mrow span{font-size:.85rem;color:var(--muted)}
.pip-mrow.sad{background:var(--skySoft)}.pip-nomood{width:26px;height:26px;border-radius:50%;border:2px dashed var(--line)}
.pip-chat{flex:1;display:flex;flex-direction:column;gap:8px;min-height:120px}
.pip-msg{max-width:88%;padding:9px 13px;border-radius:18px;line-height:1.4;white-space:normal;word-wrap:break-word}
.pip-msg.pip{background:#fff;align-self:flex-start;border-radius:18px 18px 18px 6px}.pip-msg.me{background:var(--leaf);color:#fff;align-self:flex-end;border-radius:18px 18px 6px 18px}
.pip-msg.typing{display:flex;gap:4px}.pip-msg.typing i{width:8px;height:8px;border-radius:50%;background:var(--muted);animation:pipdot 1s infinite}.pip-msg.typing i:nth-child(2){animation-delay:.15s}.pip-msg.typing i:nth-child(3){animation-delay:.3s}
@keyframes pipdot{0%,100%{opacity:.3}50%{opacity:1}}
.pip-sugg{display:flex;flex-wrap:wrap;gap:6px}.pip-sugg button{border:2px solid var(--line);background:#fff;border-radius:999px;padding:6px 12px;font:inherit;font-size:.9rem;cursor:pointer}
.pip-form{display:flex;gap:8px;position:sticky;bottom:0}.pip-form input{flex:1;min-height:44px;border-radius:999px;border:2px solid var(--line);padding:0 14px;font:inherit}
.pip-fine{font-size:.78rem;color:var(--muted);margin:0}
.pip-log{display:flex;flex-direction:column;gap:8px}.pip-lrow{background:#fff;border-radius:14px;padding:10px 12px;font-size:.9rem;display:flex;flex-direction:column;gap:3px}.pip-lrow.flag{border:2px solid var(--tomato)}.pip-lmeta{font-size:.8rem;color:var(--muted)}
@media (max-width:760px){#pipfab{bottom:calc(88px + env(safe-area-inset-bottom,0px));right:12px;padding:4px}#pipfab .pfl{display:none}#pipfab svg{width:44px;height:50px}
#pippanel{inset:0;width:auto;border-radius:0;border:0;z-index:80}}
@media (prefers-reduced-motion:reduce)''')
