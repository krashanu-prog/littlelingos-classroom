// Class reminders for families: an email about an hour before each class, and phone notifications (web push)
// an hour before and 10 minutes before. Runs on Supabase Edge Functions; a database timer calls it every 5 minutes.
//
// Deploy with "Verify JWT" OFF (the database timer has no user token); each action checks the caller itself.
//
// Email needs ONE of these sets of secrets (Supabase > Edge Functions > Secrets):
//   Google / any SMTP:  SMTP_HOST (smtp.gmail.com)  SMTP_PORT (465)  SMTP_USER  SMTP_PASS (an app password)  [SMTP_FROM]
//   Brevo:              BREVO_API_KEY  [MAIL_FROM]
// Phone notifications need no secrets: the push keys are made on first use and kept in the database.
//
// Actions (POST JSON):
//   {action:"vapid"}                      -> {key}                    public key for the browser (anyone)
//   {action:"subscribe", sub}             -> {ok}                     signed-in grown-up saves this device
//   {action:"unsubscribe", endpoint}      -> {ok}
//   {action:"test"}                       -> {sent}                   push a test to the caller's devices
//   {action:"status"}  (admin)            -> {email, push, devices, lastRun, ...}
//   {action:"run"}  + header x-cron       -> {checked, emails, pushes} (the 5-minute timer)
import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import webpush from "npm:web-push@3.6.7";
import nodemailer from "npm:nodemailer@6.9.16";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });

const APP = "https://classroom.littlelingos.in/";
const env = (k: string) => Deno.env.get(k) || "";
type Doc = Record<string, any>;
type DB = ReturnType<typeof service>;

function service() {
  const url = env("SUPABASE_URL");
  let key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) { try { const k = JSON.parse(env("SUPABASE_SECRET_KEYS") || "{}"); key = k.default || (Object.values(k)[0] as string) || ""; } catch { /* none */ } }
  return createClient(url, key, { auth: { persistSession: false } });
}
async function getDoc(db: DB, path: string): Promise<Doc | null> {
  const { data } = await db.from("docs").select("data").eq("path", path).maybeSingle();
  return (data && (data as Doc).data) || null;
}
async function kvGet(db: DB, k: string) { const { data } = await db.from("ll_kv").select("v").eq("k", k).maybeSingle(); return data ? (data as Doc).v : null; }
async function kvSet(db: DB, k: string, v: unknown) { await db.from("ll_kv").upsert({ k, v, updated_at: new Date().toISOString() }); }

// ---------- push keys (made once, kept in the database; the private half never leaves the server) ----------
const b64u = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function vapid(db: DB): Promise<{ pub: string; priv: string }> {
  const have = await kvGet(db, "vapid");
  if (have && have.pub && have.priv) return have;
  const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const pub = b64u(await crypto.subtle.exportKey("raw", kp.publicKey));
  const jwk = await crypto.subtle.exportKey("jwk", kp.privateKey);
  const v = { pub, priv: jwk.d as string };
  // keep the first keys if two calls race
  await db.from("ll_kv").insert({ k: "vapid", v }).then(() => {}, () => {});
  const saved = await kvGet(db, "vapid");
  if (!saved) throw new Error("setup needed: run class-reminders.sql"); // never hand out keys that were not saved
  return saved;
}

// ---------- email ----------
const FROM = env("SMTP_FROM") || env("MAIL_FROM") || "Little Lingos <classroom@littlelingos.in>";
const mailMode = () => (env("SMTP_HOST") && env("SMTP_USER") && env("SMTP_PASS")) ? "smtp" : env("BREVO_API_KEY") ? "brevo" : "";
let smtp: any = null;
async function sendMail(to: string, subject: string, text: string, html: string) {
  const m = mailMode();
  if (m === "smtp") {
    if (!smtp) {
      const port = +(env("SMTP_PORT") || 465);
      smtp = nodemailer.createTransport({ host: env("SMTP_HOST"), port, secure: port === 465, auth: { user: env("SMTP_USER"), pass: env("SMTP_PASS") } });
    }
    await smtp.sendMail({ from: FROM, to, subject, text, html });
    return;
  }
  if (m === "brevo") {
    const mm = /^(.*)<(.+)>\s*$/.exec(FROM);
    const sender = mm ? { name: mm[1].trim().replace(/^"|"$/g, ""), email: mm[2].trim() } : { email: FROM };
    const r = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST", headers: { "api-key": env("BREVO_API_KEY"), "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ sender, to: [{ email: to }], subject, textContent: text, htmlContent: html, tags: ["class-reminder"] }),
    });
    if (!r.ok) throw new Error("brevo " + r.status + " " + (await r.text()).slice(0, 200));
    return;
  }
  throw new Error("no email sender set up");
}

// ---------- helpers ----------
const okEmail = (e: unknown) => typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
const first = (n: string) => String(n || "").trim().split(/\s+/)[0] || "your child";
const esc = (s: string) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const timeIST = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s?(am|pm)$/i, (x) => " " + x.trim().toUpperCase());
const dayIST = (iso: string) => {
  const d = new Date(iso), f = (x: Date) => x.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return f(d) === f(new Date()) ? "today" : f(d) === f(new Date(Date.now() + 864e5)) ? "tomorrow" : d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "short" });
};
const safeUrl = (u: unknown) => (typeof u === "string" && /^https:\/\/\S+$/.test(u.trim())) ? u.trim() : "";

async function userFrom(db: DB, req: Request) {
  const tok = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!tok) return null;
  const { data } = await db.auth.getUser(tok);
  return data && data.user ? data.user : null;
}
async function roleOf(db: DB, uid: string) { const p = await getDoc(db, "profiles/" + uid); return (p && p.role) || ""; }

async function pushTo(db: DB, uids: string[], payload: Doc) {
  if (!uids.length) return 0;
  const k = await vapid(db);
  webpush.setVapidDetails("mailto:classroom@littlelingos.in", k.pub, k.priv);
  const { data } = await db.from("push_subs").select("endpoint,sub").in("uid", uids);
  let n = 0;
  for (const row of (data || []) as Doc[]) {
    try {
      await webpush.sendNotification(row.sub, JSON.stringify(payload), { TTL: 3600, urgency: "high" });
      n++;
      await db.from("push_subs").update({ last_ok: new Date().toISOString() }).eq("endpoint", row.endpoint);
    } catch (e) {
      const sc = (e as Doc).statusCode;
      if (sc === 404 || sc === 410) await db.from("push_subs").delete().eq("endpoint", row.endpoint); // phone unsubscribed
    }
  }
  return n;
}

// ---------- the 5-minute run ----------
type Kind = "h1" | "m10";
async function run(db: DB) {
  const now = Date.now();
  const windows: [Kind, number, number][] = [["h1", 50, 70], ["m10", 5, 15]];
  const out = { checked: 0, emails: 0, pushes: 0, errors: [] as string[], email: mailMode() || "off" };
  for (const [kind, a, b] of windows) {
    const from = new Date(now + a * 6e4).toISOString(), to = new Date(now + b * 6e4).toISOString();
    const { data: ss } = await db.from("docs").select("path,data").like("path", "sessions/%").gte("data->>startsAt", from).lte("data->>startsAt", to);
    for (const row of (ss || []) as Doc[]) {
      const sid = row.path.slice(9), s = row.data as Doc;
      if (!s || s.cancelled || !Array.isArray(s.forLids)) continue;
      out.checked++;
      // claim this reminder first so two runs never send it twice
      const { data: claimed } = await db.from("class_reminders_sent").upsert({ session_id: sid, kind }, { onConflict: "session_id,kind", ignoreDuplicates: true }).select("session_id");
      if (!claimed || !claimed.length) continue;
      const course = s.courseId ? await getDoc(db, "courses/" + s.courseId) : null;
      const title = String(s.title || (course && course.title) || "Live class");
      const at = timeIST(s.startsAt), day = dayIST(s.startsAt), join = safeUrl(s.joinUrl);
      const info: Doc = { emails: 0, pushes: 0 };
      for (const lid of s.forLids as string[]) {
        if (!lid || lid === "_trial") continue;
        const L = await getDoc(db, "learners/" + lid);
        if (!L || L.active === false) continue;
        const priv = (await getDoc(db, "private/" + lid)) || {};
        const kid = first(L.name);
        const parents: string[] = (Array.isArray(L.parents) ? L.parents : []).filter(Boolean);
        // who wants what (a parent can switch either off in Settings)
        const pushUids: string[] = [], emails = new Map<string, string>();
        for (const uid of parents) {
          const p = (await getDoc(db, "profiles/" + uid)) || {};
          const pref = p.classRemind || {};
          if (pref.push !== false) pushUids.push(uid);
          if (kind === "h1" && pref.email !== false) {
            const { data: u } = await db.auth.admin.getUserById(uid);
            const em = u && u.user && u.user.email;
            if (okEmail(em)) emails.set(em!.toLowerCase(), p.displayName || priv.guardian || "");
          }
        }
        if (kind === "h1" && okEmail(priv.email) && priv.classRemind !== false) {
          const em = String(priv.email).trim().toLowerCase();
          if (!emails.has(em)) emails.set(em, priv.guardian || "");
        }
        // phone notifications
        const body = kind === "h1" ? `${kid}'s class "${title}" starts at ${at}. Tap to open.` : `${kid}'s class "${title}" starts in 10 minutes. Tap to join.`;
        try { const n = await pushTo(db, pushUids, { title: kind === "h1" ? `Class at ${at} 🌱` : "Class starting soon 🌱", body, go: "schedule", url: kind === "m10" && join ? join : "", tag: "cls-" + sid + "-" + kind }); out.pushes += n; info.pushes += n; }
        catch (e) { out.errors.push("push: " + (e as Error).message); }
        // emails (an hour before only)
        if (kind === "h1" && mailMode()) {
          for (const [em, name] of emails) {
            const hello = name ? `Hello ${first(name)},` : "Hello,";
            const subject = `Reminder: ${kid}'s Little Lingos class at ${at} ${day}`;
            const lines = [hello, "", `${kid}'s class starts in about an hour.`, "", `📚 ${title}`, `⏰ ${at} (India time), ${day}`, join ? `🔗 Join: ${join}` : "📍 At the Little Lingos centre", "", `You can also open the class from ${APP}`, "", "See you there! 🌱", "Little Lingos", "", "You get this because your child is booked into this class. To stop these emails, turn off class reminders in Settings in the app, or reply to this email."];
            const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#2E2219;line-height:1.5">
<h2 style="color:#22703A;margin:0 0 8px">${esc(kid)}'s class starts at ${esc(at)} 🌱</h2>
<p>${esc(hello)}</p><p>A friendly reminder: <b>${esc(kid)}</b>'s Little Lingos class is in about an hour.</p>
<p style="background:#F5FAEE;border-radius:12px;padding:12px 14px;margin:14px 0">📚 <b>${esc(title)}</b><br>⏰ ${esc(at)} (India time), ${esc(day)}</p>
${join ? `<p><a href="${esc(join)}" style="display:inline-block;background:#E8492F;color:#fff;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:999px">Join the class</a></p>` : `<p>📍 At the Little Lingos centre</p>`}
<p style="color:#5C4F45;font-size:13px">Or open it in the app: <a href="${APP}#schedule" style="color:#22703A">${APP.replace(/^https:\/\//, "").replace(/\/$/, "")}</a></p>
<p style="color:#5C4F45;font-size:12px;margin-top:20px">You get this because your child is booked into this class. To stop these emails, turn off class reminders in Settings in the app, or reply to this email.</p></div>`;
            try { await sendMail(em, subject, lines.join("\n"), html); out.emails++; info.emails++; }
            catch (e) { out.errors.push("email: " + (e as Error).message.slice(0, 160)); }
          }
        }
      }
      await db.from("class_reminders_sent").update({ info }).eq("session_id", sid).eq("kind", kind);
    }
  }
  await kvSet(db, "reminders_last_run", { at: new Date().toISOString(), ...out, errors: out.errors.slice(0, 5) });
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const db = service();
  let body: Doc = {};
  try { body = await req.json(); } catch { /* empty */ }
  const action = String(body.action || "");
  try {
    if (action === "vapid") return json({ key: (await vapid(db)).pub });
    if (action === "run") {
      const tok = await kvGet(db, "cron_token");
      if (!tok || req.headers.get("x-cron") !== tok) return json({ error: "forbidden" }, 403);
      return json(await run(db));
    }
    const user = await userFrom(db, req);
    if (!user) return json({ error: "sign in" }, 401);
    const role = await roleOf(db, user.id);
    if (action === "subscribe") {
      if (role === "student" || role === "learner") return json({ error: "grown-ups only" }, 403); // never on children's devices
      const sub = body.sub;
      if (!sub || typeof sub.endpoint !== "string" || !/^https:\/\//.test(sub.endpoint) || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) return json({ error: "bad subscription" }, 400);
      await db.from("push_subs").upsert({ endpoint: sub.endpoint, uid: user.id, sub: { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } }, ua: String(req.headers.get("user-agent") || "").slice(0, 200) });
      return json({ ok: true });
    }
    if (action === "unsubscribe") {
      await db.from("push_subs").delete().eq("endpoint", String(body.endpoint || "")).eq("uid", user.id);
      return json({ ok: true });
    }
    if (action === "test") {
      const n = await pushTo(db, [user.id], { title: "Class reminders are on 🌱", body: "You'll get a notification an hour before each class and again 10 minutes before.", go: "schedule", tag: "ll-test" });
      return json({ sent: n });
    }
    if (action === "status") {
      if (role !== "admin") return json({ error: "admins only" }, 403);
      const { count } = await db.from("push_subs").select("endpoint", { count: "exact", head: true });
      const last = await kvGet(db, "reminders_last_run");
      return json({ email: mailMode() || "off", push: true, devices: count || 0, lastRun: last, cron: !!(await kvGet(db, "cron_token")) });
    }
    return json({ error: "unknown action" }, 400);
  } catch (e) {
    console.log("class-reminders:", (e as Error).message);
    return json({ error: "busy", detail: (e as Error).message.slice(0, 200) }, 500);
  }
});
