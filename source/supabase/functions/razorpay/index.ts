// Online fee payments with Razorpay. Runs on Supabase Edge Functions.
//
// Secrets to set in Supabase > Edge Functions > Secrets:
//   RAZORPAY_KEY_ID          rzp_test_... or rzp_live_...   (shown to parents' browsers; this is fine)
//   RAZORPAY_KEY_SECRET      the matching secret            (never leaves this function)
//   RAZORPAY_WEBHOOK_SECRET  optional; the secret you typed when adding the webhook in Razorpay
//
// Deploy with "Verify JWT" OFF: the webhook from Razorpay carries no Supabase token. Every other action
// checks the caller's token itself.
//
// Actions (POST JSON with the parent's Supabase token):
//   {action:"order",  lid, month}                 -> {order_id, amount, key_id, name, prefill}
//   {action:"verify", order_id, payment_id, signature} -> {ok, pid}
//   {action:"ping"}  (admin only)                 -> {ok, mode, key, secret, webhook}
// Razorpay webhook (payment.captured):  POST .../razorpay/webhook
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });

const KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "";
const SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "";
const WH_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "";
const RZP = "https://api.razorpay.com/v1";
const basic = "Basic " + btoa(`${KEY_ID}:${SECRET}`);

async function hmacHex(key: string, msg: string) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const safeEq = (a: string, b: string) => a.length === b.length && a.split("").every((c, i) => c === b[i]);
// India time for dates and months
const ist = () => new Date(Date.now() + 5.5 * 3600e3);
const ymd = (d = ist()) => d.toISOString().slice(0, 10);
const thisMonth = () => ymd().slice(0, 7);
const shiftMonth = (m: string, n: number) => { const [y, mo] = m.split("-").map(Number); const d = new Date(Date.UTC(y, mo - 1 + n, 1)); return d.toISOString().slice(0, 7); };
const pad = (n: number) => String(n).padStart(2, "0");

type Doc = Record<string, any>;
function service() {
  const url = Deno.env.get("SUPABASE_URL")!;
  let key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!key) { try { const k = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}"); key = k.default || (Object.values(k)[0] as string) || ""; } catch { /* none */ } }
  return createClient(url, key, { auth: { persistSession: false } });
}
async function getDoc(db: ReturnType<typeof service>, path: string): Promise<Doc | null> {
  const { data } = await db.from("docs").select("data").eq("path", path).maybeSingle();
  return (data && (data as Doc).data) || null;
}

async function rzp(path: string, init: RequestInit = {}) {
  const r = await fetch(RZP + path, { ...init, headers: { Authorization: basic, "Content-Type": "application/json", ...(init.headers || {}) } });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((body && body.error && body.error.description) || `razorpay ${r.status}`);
  return body;
}

/** What this learner still owes for a month, from the fee record (never trust the browser's amount). */
function owedFor(fee: Doc, month: string) {
  const monthly = +fee.monthly || 0;
  if (!(monthly > 0) || !fee.start || month < fee.start || month > shiftMonth(thisMonth(), 1)) return 0;
  const paid = Object.values(fee.payments || {}).filter((p: any) => p && p.month === month).reduce((s: number, p: any) => s + (+p.amount || 0), 0);
  return Math.max(0, monthly - paid);
}

/** Record a captured payment: fee record + parent receipt + the parent's fee summary (pf/<uid>). */
async function record(db: ReturnType<typeof service>, p: Doc) {
  const notes = p.notes || {};
  const lid = String(notes.lid || ""), uid = String(notes.uid || ""), month = String(notes.month || "");
  if (!lid || !uid || !/^\d{4}-\d{2}$/.test(month)) throw new Error("payment without learner notes");
  const pid = "rp_" + String(p.id).replace(/^pay_/, "").replace(/[^A-Za-z0-9]/g, "").slice(0, 40);
  const amount = Math.round((+p.amount || 0) / 100);
  const pay = { amount, month, date: ymd(), method: "Razorpay", note: `Razorpay ${p.id}${p.method ? " · " + p.method : ""}`, at: Date.now(), rp: p.id, order: p.order_id || "", uid };
  const { data: fresh, error } = await db.rpc("ll_rzp_record", { p_lid: lid, p_uid: uid, p_pid: pid, p_pay: pay });
  if (error) throw new Error(error.message);
  if (fresh) {
    // keep the parent's fee summary current so the receipt shows at once (the admin's app rebuilds it later anyway)
    try {
      const pf = await getDoc(db, "pf/" + uid);
      const k = pf && pf.kids && pf.kids[lid];
      if (pf && k) {
        const cur = thisMonth();
        k.invoices = (k.invoices || []).map((iv: Doc) => iv.month === month ? { ...iv, paid: (+iv.paid || 0) + amount } : iv);
        k.pays = [{ id: pid, amount, month, date: pay.date, method: "Razorpay", note: pay.note }, ...(k.pays || [])].slice(0, 24);
        k.balance = Math.max(0, (+k.balance || 0) - amount);
        if (month === cur) {
          k.remainingM = Math.max(0, (+k.remainingM || 0) - amount);
          if (k.remainingM === 0) { k.statusK = "paid"; k.statusLabel = "Paid"; k.statusCls = "p-good"; k.nextDue = `${shiftMonth(cur, 1)}-${pad(+k.dueDay || 10)}`; }
          else { k.statusK = "part"; k.statusLabel = "Part paid"; k.statusCls = "p-warn"; }
        }
        await db.from("docs").update({ data: { ...pf, at: Date.now() }, updated_at: new Date().toISOString() }).eq("path", "pf/" + uid);
      }
    } catch (_e) { /* the admin's app refreshes the summary */ }
  }
  return pid;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const db = service();

  // ---- Razorpay webhook: POST .../razorpay/webhook ----
  if (new URL(req.url).pathname.endsWith("/webhook")) {
    if (!WH_SECRET) return json({ error: "no webhook secret" }, 503);
    const raw = await req.text();
    const sig = req.headers.get("x-razorpay-signature") || "";
    if (!safeEq(await hmacHex(WH_SECRET, raw), sig)) return json({ error: "bad signature" }, 400);
    let ev: Doc = {}; try { ev = JSON.parse(raw); } catch { return json({ error: "bad body" }, 400); }
    if (ev.event === "payment.captured" && ev.payload && ev.payload.payment && ev.payload.payment.entity) {
      try { await record(db, ev.payload.payment.entity); } catch (e) { return json({ error: String(e && (e as Error).message || e) }, 500); }
    }
    return json({ ok: true });
  }

  // ---- app actions: need the caller's Supabase token ----
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: u } = await db.auth.getUser(token);
  const user = u?.user;
  if (!user) return json({ error: "signin" }, 401);
  let body: Doc = {}; try { body = await req.json(); } catch { /* empty */ }
  const action = String(body.action || "");

  if (action === "ping") {
    const { data: adm } = await db.from("ll_admins").select("email").eq("email", user.email || "").maybeSingle();
    if (!adm) return json({ error: "admin only" }, 403);
    return json({ ok: !!(KEY_ID && SECRET), mode: KEY_ID.startsWith("rzp_live") ? "live" : KEY_ID ? "test" : "", key: !!KEY_ID, secret: !!SECRET, webhook: !!WH_SECRET });
  }
  if (!KEY_ID || !SECRET) return json({ error: "not_configured" }, 503);

  if (action === "order") {
    const lid = String(body.lid || ""), month = String(body.month || "");
    if (!/^[A-Za-z0-9_.~:@+-]+$/.test(lid) || !/^\d{4}-\d{2}$/.test(month)) return json({ error: "bad request" }, 400);
    const L = await getDoc(db, "learners/" + lid);
    if (!L || !(L.parents || []).includes(user.id)) return json({ error: "not your learner" }, 403);
    const fee = await getDoc(db, "fees/" + lid);
    if (!fee) return json({ error: "no fee plan" }, 404);
    const amount = owedFor(fee, month);
    if (!(amount > 0)) return json({ error: "nothing due", amount: 0 }, 409);
    const kid = String(L.name || "").slice(0, 40);
    const order = await rzp("/orders", { method: "POST", body: JSON.stringify({ amount: amount * 100, currency: "INR", receipt: `${lid}-${month}`.slice(0, 40), notes: { lid, month, uid: user.id, kid } }) });
    const prof = await getDoc(db, "profiles/" + user.id);
    const { data: who } = await db.from("people").select("name").eq("id", user.id).maybeSingle();
    return json({ order_id: order.id, amount: order.amount, key_id: KEY_ID, kid, month, prefill: { name: (who && who.name) || (prof && prof.name) || "", email: user.email || "", contact: (prof && (prof.phone || prof.mobile)) || "" } });
  }

  if (action === "verify") {
    const order_id = String(body.order_id || ""), payment_id = String(body.payment_id || ""), signature = String(body.signature || "");
    if (!order_id || !payment_id || !signature) return json({ error: "bad request" }, 400);
    if (!safeEq(await hmacHex(SECRET, `${order_id}|${payment_id}`), signature)) return json({ error: "bad signature" }, 400);
    let p = await rzp("/payments/" + encodeURIComponent(payment_id));
    if (p.order_id !== order_id) return json({ error: "order mismatch" }, 400);
    if (p.status === "authorized") p = await rzp(`/payments/${encodeURIComponent(payment_id)}/capture`, { method: "POST", body: JSON.stringify({ amount: p.amount, currency: "INR" }) });
    if (p.status !== "captured") return json({ error: "not captured", status: p.status }, 409);
    if (!p.notes || p.notes.uid !== user.id) return json({ error: "not your payment" }, 403);
    try { const pid = await record(db, p); return json({ ok: true, pid }); }
    catch (e) { return json({ error: String(e && (e as Error).message || e) }, 500); }
  }
  return json({ error: "unknown action" }, 400);
});
