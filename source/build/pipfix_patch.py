# Ask Pip: the chat scrolls inside the panel (long answers no longer run under the typing box), and **bold** shows as bold.
R('''.pip-chat{flex:1;display:flex;flex-direction:column;gap:8px;min-height:120px}''',
  '''.pip-chat{flex:1 1 auto;display:flex;flex-direction:column;gap:8px;min-height:120px;overflow-y:auto;overscroll-behavior:contain;padding:2px 4px 6px 0;scroll-behavior:smooth}
.pip-chat>*{flex:none}.pip-form,.pip-fine{flex:none}.pip-form{background:inherit}''')
R('''${esc(m.content).replace(/\\n/g,"<br>")}</div>`).join("")''','''${pipFmt(m.content)}</div>`).join("")''')
R('/* ================= events ================= */','''/* Ask Pip replies: keep it plain and safe (everything escaped first), then show **bold**, *italics* and line breaks */
function pipFmt(t){return esc(String(t||"")).replace(/\\*\\*([^*\\n]+)\\*\\*/g,"<b>$1</b>").replace(/(^|[\\s(])\\*([^*\\n]+)\\*(?=[\\s.,!?)]|$)/g,"$1<i>$2</i>").replace(/^\\s*[-•]\\s+/gm,"• ").replace(/\\n/g,"<br>");}
/* ================= events ================= */''')
