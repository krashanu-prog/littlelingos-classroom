/* Little Lingos Classroom: Supabase connection + email sign-in.
   Gives the app the same small data API it used on claude.ai
   (db.doc / db.collection / onSnapshot, user.me, assets, downloads),
   backed by the "docs" table described in supabase/schema.sql. */
(function () {
  "use strict";
  // frame-buster: never run inside another site's frame
  if (window.top !== window.self) { try { window.top.location = window.self.location.href; } catch (e) { document.documentElement.innerHTML = ""; } return; }
  const CFG = window.LL_CONFIG || {};
  const configured = CFG.supabaseUrl && CFG.supabaseAnonKey && !/YOUR-/.test(CFG.supabaseUrl + CFG.supabaseAnonKey);
  const sb = configured && window.supabase ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    realtime: { params: { eventsPerSecond: 20 } }
  }) : null;
  window.LL_sb = sb;

  /* ---------------- helpers ---------------- */
  const parentOf = p => p.split("/").slice(0, -1).join("/");
  const lastSeg = p => p.split("/").pop();
  const clone = o => (o == null ? o : JSON.parse(JSON.stringify(o)));
  const AUTO = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const autoId = () => { const a = new Uint8Array(20); crypto.getRandomValues(a); return Array.from(a, b => AUTO[b % AUTO.length]).join(""); };
  function fail(e) {
    const msg = (e && (e.message || e.error_description)) || "error";
    const err = new Error(msg);
    const c = e && e.code;
    if (/row-level security|permission denied/i.test(msg)) err.code = "invalid_argument";
    else if (c === "42501" || c === "P0001") err.code = "denied";
    else if (c === "P0002" || msg === "missing") err.code = "not_found";
    else if (/fetch|network|Failed to fetch|timeout/i.test(msg)) err.code = "unavailable";
    else err.code = c || "unknown";
    return err;
  }
  const docSnap = (path, data) => ({ id: lastSeg(path), exists: data !== undefined, data: () => clone(data), metadata: { fromCache: false, hasPendingWrites: false } });
  const colSnap = (rows) => { const docs = rows.map(r => docSnap(r.path, r.data)); return { docs, size: docs.length, empty: !docs.length, docChanges: () => [], metadata: {} }; };

  /* ---------------- reads (filtered on the server per person) ---------------- */
  async function fetchCol(cpath) {
    const out = []; const PAGE = 1000;
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await sb.rpc("ll_fetch", { p: cpath }).order("path").range(from, from + PAGE - 1);
      if (error) throw fail(error);
      out.push(...data); if (data.length < PAGE) break;
    }
    return out;
  }
  async function fetchDoc(path) {
    const { data, error } = await sb.rpc("ll_fetch_doc", { p: path });
    if (error) throw fail(error);
    return data && data.length ? data[0].data : undefined;
  }

  /* ---------------- live subscriptions ---------------- */
  // key -> {kind, path, rows(Map path->data) | data, listeners:Set<{next,err}>, ver}
  const subs = new Map();
  function emit(s) {
    for (const l of s.listeners) {
      try { s.kind === "col" ? l.next(colSnap([...s.rows].sort((a, b) => a[0] < b[0] ? -1 : 1).map(([path, data]) => ({ path, data })))) : l.next(docSnap(s.path, s.data)); }
      catch (e) { console.error(e); }
    }
  }
  async function load(s, tries = 0) {
    const ver = (s.ver = (s.ver || 0) + 1);
    try {
      if (s.kind === "col") { const rows = await fetchCol(s.path); if (ver !== s.ver) return; s.rows = new Map(rows.map(r => [r.path, r.data])); }
      else { const d = await fetchDoc(s.path); if (ver !== s.ver) return; s.data = d; }
      s.loaded = true; emit(s);
    } catch (e) {
      if (ver !== s.ver) return;
      if (e.code === "unavailable" && tries < 6 && subs.get(s.kind + ":" + s.path) === s) { setTimeout(() => load(s, tries + 1), 2000 * (tries + 1)); return; }
      for (const l of s.listeners) if (l.err) try { l.err(e); } catch {}
    }
  }
  function subscribe(kind, path, next, err) {
    const key = kind + ":" + path;
    let s = subs.get(key);
    const l = { next, err };
    if (!s) { s = { kind, path, listeners: new Set(), rows: new Map(), data: undefined, loaded: false, ver: 0 }; subs.set(key, s); s.listeners.add(l); load(s); }
    else { s.listeners.add(l); if (s.loaded) setTimeout(() => { if (s.listeners.has(l)) { const one = { listeners: new Set([l]), kind: s.kind, path: s.path, rows: s.rows, data: s.data }; emit(one); } }, 0); }
    return () => { s.listeners.delete(l); if (!s.listeners.size) subs.delete(key); };
  }
  const reloadAll = () => { for (const s of subs.values()) load(s); };

  // A collection changed (from the live feed or our own write): re-read it.
  const pendingTopics = new Set(); let flushTimer = null;
  function touchTopic(t) { pendingTopics.add(t); if (!flushTimer) flushTimer = setTimeout(flush, 120); }
  function touched(path) { touchTopic(parentOf(path)); }
  function flush() {
    flushTimer = null;
    const topics = [...pendingTopics]; pendingTopics.clear();
    if (topics.includes("_access")) checkAccess();
    for (const s of subs.values()) {
      const t = s.kind === "col" ? s.path : parentOf(s.path);
      if (topics.includes(t)) load(s);
    }
  }
  let level = 0, scope = "";
  async function checkAccess() {
    const { data, error } = await sb.rpc("ll_whoami");
    if (error || !data) return;
    const changed = (level && data.level !== level) || (scope && data.scope !== scope);
    level = data.level; scope = data.scope;
    if (changed) reloadAll();
  }
  const checkLevel = checkAccess;
  function startRealtime() {
    let wasDown = false;
    sb.channel("ll-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "ll_changes" }, payload => {
        const t = (payload.new && payload.new.topic) || (payload.old && payload.old.topic);
        if (t) touchTopic(t);
      })
      .subscribe(status => {
        if (status === "SUBSCRIBED") { if (wasDown) { checkAccess(); reloadAll(); } wasDown = false; }
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") wasDown = true;
      });
    // Safety nets: refresh when the page comes back, and re-check access every few minutes.
    let hiddenAt = 0;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > 60000) { checkAccess(); reloadAll(); }
    });
    setInterval(() => { if (!document.hidden) checkAccess(); }, 180000);
  }

  /* ---------------- writes ---------------- */
  let linkTimer = null;
  function maybeLink(path) { if (level >= 4 && /^private\//.test(path)) { clearTimeout(linkTimer); linkTimer = setTimeout(() => { sb.rpc("ll_link").then(() => {}, () => {}); }, 400); } }
  async function setDoc(path, data) {
    const { error } = await sb.from("docs").upsert({ path, data: clone(data) || {}, updated_at: new Date().toISOString() }, { onConflict: "path" });
    if (error) throw fail(error);
    touched(path); maybeLink(path);
  }
  async function updateDoc(path, patch) {
    const { error } = await sb.rpc("ll_update", { p: path, patch: clone(patch) || {} });
    if (error) throw fail(error);
    touched(path); maybeLink(path);
  }
  async function deleteDoc(path) {
    const { error } = await sb.from("docs").delete().eq("path", path);
    if (error) throw fail(error);
    touched(path);
  }

  /* ---------------- the API the app uses ---------------- */
  function docRef(path) {
    return {
      id: lastSeg(path), path,
      get: async () => docSnap(path, await fetchDoc(path)),
      set: d => setDoc(path, d),
      update: d => updateDoc(path, d),
      delete: () => deleteDoc(path),
      onSnapshot: (next, err) => subscribe("doc", path, next, err),
      collection: p => colRef(path + "/" + p)
    };
  }
  function colRef(cpath) {
    return {
      path: cpath,
      doc: id => docRef(cpath + "/" + (id || autoId())),
      add: async d => { const r = docRef(cpath + "/" + autoId()); await r.set(d); return r; },
      get: async () => colSnap(await fetchCol(cpath)),
      onSnapshot: (next, err) => subscribe("col", cpath, next, err),
      where() { return this; }, orderBy() { return this; }, limit() { return this; }
    };
  }
  const db = { doc: docRef, collection: colRef };

  let session = null;
  const nameCache = {};
  const user = {
    id: async () => session && session.user.id,
    isOwner: async () => level >= 4,
    canEdit: async () => level >= 3,
    can: async () => null,
    me: async () => {
      const u = session.user;
      let name = nameCache[u.id];
      if (!name) { const { data } = await sb.from("people").select("name").eq("id", u.id).maybeSingle(); name = (data && data.name) || (u.email || "").split("@")[0]; nameCache[u.id] = name; }
      return { id: u.id, name, email: u.email, avatarUrl: "", color: "#888", isOwner: level >= 4, canEdit: level >= 3 };
    },
    profiles: async ids => {
      ids = [...new Set([].concat(ids || []))].filter(id => /^[0-9a-f-]{36}$/.test(id));
      const out = {};
      for (let i = 0; i < ids.length; i += 100) {
        const { data } = await sb.from("people").select("id,name").in("id", ids.slice(i, i + 100));
        for (const r of data || []) { nameCache[r.id] = r.name; }
      }
      for (const id of ids) out[id] = { id, name: nameCache[id] || "", avatarUrl: "", color: "#888", email: null, isMe: session && id === session.user.id, guest: false };
      return out;
    }
  };

  const assets = {
    upload: async file => {
      const ext = ((file.name || "").match(/\.[A-Za-z0-9]{1,8}$/) || [""])[0].toLowerCase();
      const id = autoId() + ext;
      const { error } = await sb.storage.from("assets").upload(id, file, { contentType: file.type || undefined, upsert: false });
      if (error) throw fail(error);
      return { id, url: window.LL_assetUrl(id), sizeBytes: file.size, contentType: file.type };
    },
    delete: async id => { const { error } = await sb.storage.from("assets").remove([id]); if (error) throw fail(error); },
    list: async () => ({ assets: [], usage: {} })
  };
  window.LL_assetUrl = id => sb ? sb.storage.from("assets").getPublicUrl(id).data.publicUrl : "";

  const downloads = {
    save: async ({ filename, data }) => {
      const blob = data instanceof Blob ? data : new Blob([data], { type: /\.html?$/i.test(filename) ? "text/html" : /\.csv$/i.test(filename) ? "text/csv" : "text/plain" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename || "download";
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }
  };

  /* ---------------- sign-in screen ---------------- */
  let readyResolve; const ready = new Promise(r => (readyResolve = r));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function gate(html) {
    let el = document.getElementById("ll-gate");
    if (!el) { el = document.createElement("div"); el.id = "ll-gate"; document.body.appendChild(el); }
    el.innerHTML = `<div class="center"><div class="card ll-gate-card">${html}</div></div>`;
    return el;
  }
  function closeGate() { const el = document.getElementById("ll-gate"); if (el) el.remove(); }
  const brand = `<div class="ll-brand" role="img" aria-label="Little Lingos"><svg class="lg-pip" viewBox="24 12 152 186" aria-hidden="true"><path d="M100 58 c-4 -26 -30 -40 -54 -30 c8 24 30 34 54 30 z" fill="#A6DB5C"/><path d="M100 58 c4 -30 32 -46 60 -34 c-10 28 -34 38 -60 34 z" fill="#7CC243"/><path d="M100 56 v14" stroke="#22703A" stroke-width="6" stroke-linecap="round"/><ellipse cx="100" cy="128" rx="70" ry="64" fill="#2F8F46"/><ellipse cx="100" cy="150" rx="46" ry="30" fill="#3FA75A"/><circle cx="76" cy="116" r="15" fill="#FFFFFF"/><circle cx="79" cy="119" r="8" fill="#2E2219"/><circle cx="82" cy="115" r="2.6" fill="#FFFFFF"/><circle cx="124" cy="116" r="15" fill="#FFFFFF"/><circle cx="127" cy="119" r="8" fill="#2E2219"/><circle cx="130" cy="115" r="2.6" fill="#FFFFFF"/><ellipse cx="58" cy="140" rx="10" ry="6" fill="#F7A8C4"/><ellipse cx="142" cy="140" rx="10" ry="6" fill="#F7A8C4"/><path d="M84 140 q16 22 32 0 z" fill="#2E2219"/><path d="M92 148 q8 8 16 0 l-4 -2 h-8 z" fill="#E8492F"/></svg><span class="wm"><b>little</b><span>lingos<svg class="lg-leaf" viewBox="0 0 40 40" aria-hidden="true"><path d="M0 40 c2 -22 16 -36 40 -40 c-2 22 -16 36 -40 40 z" fill="#E8492F"/></svg></span></span></div>`;
  function emailStep(prefill, note) {
    const el = gate(`${brand}<h1>Sign in</h1><p class="lede">Enter your email and we'll send you a 6-digit sign-in code. No password needed.</p>
      <form id="ll-email" novalidate><div class="field"><label for="ll-em">Email</label><input type="email" id="ll-em" name="em" required autocomplete="email" inputmode="email" value="${esc(prefill || "")}" placeholder="you@example.com"></div>
      <p class="formerr" id="ll-err" ${note ? "" : "hidden"}>${esc(note || "")}</p>
      <button class="btn btn-primary btn-big" type="submit" id="ll-go">Email me a code</button></form>
      <p class="small muted">Use the email you gave the academy. You'll go straight to your dashboard. If the academy doesn't have your email yet, they'll connect you after you sign in.</p>`);
    const f = el.querySelector("form"), err = el.querySelector("#ll-err"), btn = el.querySelector("#ll-go");
    setTimeout(() => f.em.focus(), 50);
    f.addEventListener("submit", async e => {
      e.preventDefault(); const email = f.em.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = "Check the email address."; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = "Sending…"; err.hidden = true;
      const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: location.origin + location.pathname } });
      if (error) { btn.disabled = false; btn.textContent = "Email me a code"; err.textContent = /rate|seconds|too many/i.test(error.message) ? "Please wait a minute before asking for another code." : "Couldn't send the email: " + error.message; err.hidden = false; return; }
      codeStep(email);
    });
  }
  function codeStep(email) {
    const el = gate(`${brand}<h1>Check your email</h1><p class="lede">We sent a 6-digit code to <b>${esc(email)}</b>. Type it here, or tap the link in the email.</p>
      <form id="ll-code" novalidate><div class="field"><label for="ll-cd">Sign-in code</label><input type="text" id="ll-cd" name="cd" required inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="123456" style="letter-spacing:.3em;font-size:1.3rem;max-width:240px"></div>
      <p class="formerr" id="ll-err" hidden></p>
      <button class="btn btn-primary btn-big" type="submit" id="ll-go">Sign in</button></form>
      <div class="row"><button class="btn btn-ghost btn-sm" type="button" id="ll-back">Use a different email</button><button class="btn btn-ghost btn-sm" type="button" id="ll-again">Send a new code</button></div>
      <p class="small muted">Not there? Check your spam folder. Codes expire after an hour.</p>`);
    const f = el.querySelector("form"), err = el.querySelector("#ll-err"), btn = el.querySelector("#ll-go");
    setTimeout(() => f.cd.focus(), 50);
    el.querySelector("#ll-back").onclick = () => emailStep(email);
    el.querySelector("#ll-again").onclick = async () => {
      const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: location.origin + location.pathname } });
      err.textContent = error ? (/rate|seconds/i.test(error.message) ? "Wait a minute before asking for another code." : error.message) : "New code sent."; err.hidden = false;
    };
    f.addEventListener("submit", async e => {
      e.preventDefault(); const token = f.cd.value.replace(/\D/g, "");
      if (token.length < 6) { err.textContent = "Type the code from the email."; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = "Checking…";
      const { error } = await sb.auth.verifyOtp({ email, token, type: "email" });
      if (error) { btn.disabled = false; btn.textContent = "Sign in"; err.textContent = /expired|invalid/i.test(error.message) ? "That code didn't work. Check it, or send a new one." : error.message; err.hidden = false; }
    });
  }
  async function started(s) {
    if (session) return; session = s;
    try { await sb.rpc("ll_link"); } catch {}
    try { await checkLevel(); } catch {}
    startRealtime();
    closeGate(); readyResolve(true);
  }
  window.LL_signOut = async () => { try { await sb.auth.signOut(); } catch {} location.reload(); };

  async function init() {
    if (!sb) {
      gate(`${brand}<h1>Almost ready</h1><p class="lede">This copy of Little Lingos isn't connected to its database yet.</p><p class="small">Open <b>config.js</b> and paste in your Supabase project URL and anon key (see the setup guide).</p>`);
      return;
    }
    const hashErr = new URLSearchParams(location.hash.slice(1)).get("error_description");
    const { data } = await sb.auth.getSession();
    if (data && data.session) started(data.session);
    else emailStep("", hashErr ? "That sign-in link has expired. Send yourself a new code." : "");
    sb.auth.onAuthStateChange((ev, s) => {
      if (ev === "SIGNED_IN" && s) { if (location.hash.includes("access_token")) history.replaceState(null, "", location.pathname); started(s); }
      if (ev === "SIGNED_OUT") location.reload();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

  window.claude = {
    use: async name => {
      if (!sb) return new Promise(() => {}); // stay on the setup screen
      await ready;
      if (name === "db") return db;
      if (name === "user") return user;
      if (name === "assets") return level >= 3 ? assets : null;
      if (name === "downloads") return downloads;
      return null;
    }
  };
})();
