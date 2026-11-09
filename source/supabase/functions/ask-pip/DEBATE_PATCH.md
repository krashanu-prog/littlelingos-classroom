# Debate mode added to the live ask-pip function (Nov 2026)

The live function is newer than index.ts here (gpt-oss models, Cloudflare backup). These pieces were added to it:

1. Before `async function groq(`:
```ts
// "Debate with Pip": Pip argues the other side and answers what the child actually said.
type Debate = { motion?: string; side?: string; stage?: string; phase?: string };
const DEBATE_OFF = "Let's keep to our debate! Tell me what you think about the motion, and give me a reason.";
function debateSystem(d: Debate) {
  const stage = d.stage === "Blooms" ? "Blooms" : "Sprouts";
  const age = stage === "Blooms" ? "11 to 15" : "7 to 10";
  const kidSide = d.side === "against" ? "AGAINST" : "FOR";
  const pipSide = kidSide === "FOR" ? "AGAINST" : "FOR";
  const motion = String(d.motion || "").slice(0, 160);
  const len = stage === "Blooms" ? "At most 4 sentences (about 70 words)." : "At most 3 short sentences (about 45 words), using simple words a 7-year-old knows.";
  const phase = d.phase === "final"
    ? `The debate is over and the child has just given their closing statement. Do NOT argue any more. In ${stage === "Blooms" ? "3" : "2"} sentences: say which of the child's points (name it in your own words, from anything they said in the debate) was their strongest and why, then give ONE specific tip to make their arguing even better next time. Be warm.`
    : d.phase === "closing"
    ? `Reply to the child's last point in one or two sentences (recognise anything good in it, then one short counter-point that answers their actual reasoning). Then invite them to give a closing statement that sums up why everyone should agree with them. Do not ask any other question.`
    : `Reply to the point the child just made:
1. Show you understood it: briefly restate their actual idea in your own words (do not just copy their sentence), and say what is reasonable about it.
2. Challenge THAT specific idea with a counter-argument for your side: point out a weakness, a missing step, an exception or a different way of seeing it. Do not ignore their point to make an unrelated one.
3. If they gave no reason or example, ask for one; otherwise end with ONE short question that makes them defend or develop their point.
Use a new argument each time; do not repeat points you already made.`;
  return `You are Pip, the friendly seed mascot of Little Lingos, an English-learning app for children in India. You are having a friendly practice debate with a CHILD aged ${age}.
The motion is: "${motion}". The child argues ${kidSide} the motion. You argue ${pipSide} the motion, even if you personally think otherwise, unless the phase below says to stop arguing.
${phase}
Style: ${len} Warm, playful and respectful, like a kind older friend. Praise effort, never mock. Never use the words fail, wrong or behind. Plain text only: no lists, no headings, no emoji except at most one.
Safety: keep it suitable for children. Use only everyday, child-friendly arguments; no frightening, violent, adult or political-party content, and no statistics or facts you are not sure of. If the child's message is not about the debate, gently bring them back to the motion. If they seem upset or unsafe, stop debating and kindly suggest they talk to a grown-up they trust. Never ask for personal details. You are Pip, a helper in the app, not a human.`;
}

```
2. body type gains `mode?: string; debate?: Debate`; `const debate = body.mode === "debate" && body.debate ? body.debate : null;` before `const log`; logged q is prefixed `[Debate: motion]`.
3. Off-topic check: in debates only unsafe messages are blocked (reply DEBATE_OFF, blocked: true).
4. After the kid safety block:
```ts
  if (debate) {
    // a debate turn: the conversation so far, with Pip as the assistant
    const dm = (body.messages || []).filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-10).map((m) => ({ role: m.role, content: m.content.slice(0, 700) }));
    let reply = "";
    try { reply = await chat(keys, [MAIN, FAST], [{ role: "system", content: debateSystem(debate) }, ...dm], debate.stage === "Blooms" ? 220 : 150, 0.7); }
    catch { return json({ error: "busy" }); }
    reply = reply.replace(/^\s*(pip|assistant)\s*:\s*/i, "").trim();
    if (!reply) return json({ error: "busy" });
    if (kid) {
      const s2 = await screen(keys, `Child said in a debate: ${q}\nAssistant replied: ${reply}`, "pip");
      if (s2 === "unsafe" || s2 === "crisis") { await log(reply, true, "reply blocked: " + s2); return json({ error: "busy" }); }
      await log(reply);
    }
    return json({ reply });
  }
```
