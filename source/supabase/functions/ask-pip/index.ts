// Ask Pip: the Little Lingos helper. Runs on Supabase Edge Functions.
// Uses Groq's free API (Meta Llama models). Set the secret GROQ_API_KEY in Supabase.
// Children get a strict safe mode: crisis words are caught first, every question and
// answer is safety-checked, answers are short, and their chats are kept 30 days for admin review.
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const GROQ = Deno.env.get("GROQ_URL") || "https://api.groq.com/openai/v1/chat/completions";
const MAIN = "llama-3.3-70b-versatile", FAST = "llama-3.1-8b-instant";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });

const CRISIS = /\b(kill (my ?self|myself)|suicid|end my life|want to die|wanna die|hurt (my ?self|myself)|self[- ]?harm|cut (my ?self|myself)|nobody loves me|i hate my life|marna chahta|marna chahti|khud ko maar)\b/i;
const ABUSE = /\b(someone (touch|hit|hurts?) me|he touch(es|ed) me|she touch(es|ed) me|keep (it )?a secret from (my )?(mum|mom|dad|parents)|being bullied|they hit me|beats? me)\b/i;
const CRISIS_REPLY = "I'm really glad you told me. You matter so much. Please talk to a grown-up you trust right now, like your mum, dad, or your teacher. In India you can also call 1098 (Childline, free, any time). For feelings that are very heavy, Tele-MANAS is free on 14416. You are not alone.";
const ABUSE_REPLY = "Thank you for telling me. That is not okay, and it is not your fault. Please tell a grown-up you trust today, like a parent or your teacher. You can also call 1098 (Childline) for free, any time. You are brave for speaking up.";
const OFFTOPIC_KID = "Hmm, that's not something I can help with. Let's talk about words, stories, or something you're learning! What would you like to try?";

const APP_HELP = `Little Lingos Classroom app help (answer "how do I" questions with these):
- Sign in: type your email, then the 6-digit code from your email, or use your password if you set one. Set a password: tap your name (staff), Settings > Sign-in (parents), or Me > My password (learners).
- Learners: My garden (flowers grow as you learn), Path (lessons), Words (word cards), Games, Fun corner (drawing, chess, GK quiz), Homework (open it, answer, hand in), Classes (Join button appears near class time), Stories, Me (stars, badges, portfolio), Messages.
- Parents: Overview, Classes, Progress, Homework, Messages (chat with teacher), Fees, Help.
- Trainers: Today, My learners, Classes, Attendance, Homework (Set homework: 1 who, 2 pick an activity, 3 check and set), Review, Library, Reports, Families, Messages, Courses, Hours & pay (clock in/out), My space (journal, chess).
- Admin: Learners, Parents, Trainers, Leads, Classes, Batches, Attendance, Courses, Library, Review, Reports, Fees, Families, Notices, Settings.
- Pip's Updates tab lists what needs attention; the Mood tab is a daily feelings check-in.`;

function systemFor(ctx: Record<string, string>) {
  const role = ctx.role || "guest";
  const base = `You are Pip, the friendly seed mascot of Little Lingos, an English-learning programme for children aged 3.5 to 15 in India. Brand voice: warm, patient, encouraging; praise effort; never use the words fail, wrong or behind. Today is ${new Date().toDateString()}.
${APP_HELP}
If you don't know something about this academy (fees, timings, people), say so and suggest asking the academy team. Never make up facts, prices or results. Never ask for or repeat personal details like addresses, phone numbers or passwords.`;
  if (role === "learner" || role === "guest") {
    const stage = ctx.stage || "";
    const age = stage === "Seeds" ? "3.5 to 6" : stage === "Blooms" ? "11 to 15" : stage === "Sprouts" ? "7 to 10" : "young";
    return `${base}
You are talking with a CHILD (age group ${age}). Child-safe mode, strictly:
- Use very simple English. ${stage === "Seeds" ? "1 or 2 short sentences." : stage === "Blooms" ? "At most 5 short sentences." : "At most 3 short sentences."} Be cheerful and kind.
- Help with English, words, spelling, grammar, reading, stories, school-style general knowledge, and using this app. Encourage them to try first; give hints for homework instead of full answers.
- Never discuss violence, weapons, drugs, alcohol, romance, dating, scary or adult topics, or other websites and apps. Gently steer back to learning.
- Never ask for their name, age, school, address, phone, photos or passwords, and tell them not to share these.
- If they seem sad, worried or unsafe, be gentle and encourage them to talk to a grown-up they trust, like a parent or their teacher.
- Never pretend to be a human. You are Pip, a helper in the app.`;
  }
  if (role === "parent") return `${base}
You are talking with a PARENT. Be clear, reassuring and specific. Help with using the app, supporting their child's English at home, reading tips, and general questions. Don't pressure or use fear. Keep answers under 150 words unless they ask for more.`;
  if (role === "trainer") return `${base}
You are talking with a TRAINER (teacher). Help with lesson ideas, activities for Seeds (3.5-6), Sprouts (7-10) and Blooms (11-15), phonics, grammar explanations, classroom management, parent communication drafts, and using the app. Be practical and concise; use short lists when useful.`;
  return `${base}
You are talking with the ACADEMY ADMIN. Help with running the academy, writing notices and messages to parents, planning, teaching ideas, and using the app. Be practical and concise.`;
}

async function groq(key: string, model: string, messages: unknown[], max = 400, temp = 0.5) {
  const r = await fetch(GROQ, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, max_tokens: max, temperature: temp }),
  });
  if (!r.ok) throw new Error(`groq ${r.status}`);
  const j = await r.json();
  return String(j.choices?.[0]?.message?.content ?? "").trim();
}
async function ask(key: string, messages: unknown[], max: number) {
  try { return await groq(key, MAIN, messages, max); }
  catch { return await groq(key, FAST, messages, max); } // fall back if the bigger model is busy or out of free quota
}
// Safety check for children's messages: returns "ok" or a short reason.
async function screen(key: string, text: string, who: "child" | "pip") {
  const sys = `You are a strict child-safety filter for an English-learning app for children aged 3.5-15. Classify the ${who === "child" ? "child's message" : "assistant's reply to a child"}.
Reply with exactly one word:
OK - fine for children (learning, everyday chat, harmless curiosity, jokes)
CRISIS - self-harm, suicide, wanting to die, or being abused/hurt by someone
UNSAFE - sexual, violent, drugs/alcohol, weapons, hate, dangerous activities, scary content, or asking for/sharing personal details (address, phone, school, photos, passwords)
OFFTOPIC - other websites/apps/games accounts, dating/romance, or anything a children's English app should not discuss`;
  try {
    const out = (await groq(key, FAST, [{ role: "system", content: sys }, { role: "user", content: text.slice(0, 1500) }], 3, 0)).toUpperCase();
    return out.startsWith("OK") ? "ok" : out.startsWith("CRISIS") ? "crisis" : out.startsWith("OFFTOPIC") ? "offtopic" : out.startsWith("UNSAFE") ? "unsafe" : "ok";
  } catch { return "ok"; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const key = Deno.env.get("GROQ_API_KEY");
  if (!key) return json({ error: "not_configured" }, 503);
  const url = Deno.env.get("SUPABASE_URL")!;
  let service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!service) { try { const k = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}"); service = k.default || Object.values(k)[0] as string || ""; } catch { /* none */ } }
  const db = createClient(url, service, { auth: { persistSession: false } });
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: u } = await db.auth.getUser(token);
  const user = u?.user;
  if (!user) return json({ error: "signin" }, 401);

  let body: { messages?: { role: string; content: string }[]; updates?: string[] } = {};
  try { body = await req.json(); } catch { /* empty */ }
  const msgs = (body.messages || []).filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-8).map((m) => ({ role: m.role, content: m.content.slice(0, 800) }));
  const q = msgs.length && msgs[msgs.length - 1].role === "user" ? msgs[msgs.length - 1].content.trim() : "";
  if (!q) return json({ error: "empty" }, 400);

  const { data: ctx } = await db.rpc("ll_pip_ctx", { u: user.id });
  const c = (ctx || { role: "guest" }) as Record<string, string>;
  const kid = c.role === "learner" || c.role === "guest";
  const { data: n } = await db.rpc("pip_take", { u: user.id });
  const limit = kid ? 40 : 150;
  if ((n as number) > limit) return json({ reply: kid ? "Pip needs a little rest now! Let's chat again tomorrow." : "You've reached today's limit for Ask Pip. It resets tomorrow." });
  if (Math.random() < 0.05) db.rpc("pip_tidy").then(() => {}, () => {});

  const log = (a: string, flagged = false, reason = "") =>
    (kid || flagged) ? db.from("pip_chats").insert({ uid: user.id, role: c.role, name: c.first || null, q, a, flagged, reason: reason || null }).then(() => {}, () => {}) : Promise.resolve();

  if (kid) {
    if (CRISIS.test(q)) { await log(CRISIS_REPLY, true, "crisis words"); return json({ reply: CRISIS_REPLY, flagged: true }); }
    if (ABUSE.test(q)) { await log(ABUSE_REPLY, true, "possible abuse"); return json({ reply: ABUSE_REPLY, flagged: true }); }
    const s = await screen(key, q, "child");
    if (s === "crisis") { await log(CRISIS_REPLY, true, "crisis (check)"); return json({ reply: CRISIS_REPLY, flagged: true }); }
    if (s === "unsafe" || s === "offtopic") { await log(OFFTOPIC_KID, s === "unsafe", s); return json({ reply: OFFTOPIC_KID }); }
  }

  const updates = (body.updates || []).slice(0, 10).map((x) => String(x).slice(0, 160));
  const sys = systemFor(c) + (updates.length ? `\nThe user's current updates in the app (use if relevant): ${updates.join("; ")}` : "");
  let reply = "";
  try { reply = await ask(key, [{ role: "system", content: sys }, ...msgs], kid ? 220 : 600); }
  catch { return json({ reply: kid ? "Oops, Pip is a bit sleepy. Try again in a minute!" : "Pip couldn't answer right now. Please try again in a minute." }); }
  if (!reply) reply = "Hmm, I'm not sure. Can you ask me another way?";
  if (kid) {
    const s2 = await screen(key, `Child asked: ${q}\nAssistant replied: ${reply}`, "pip");
    if (s2 !== "ok") { await log(reply, true, "reply blocked: " + s2); reply = OFFTOPIC_KID; }
    else await log(reply);
  }
  return json({ reply });
});
