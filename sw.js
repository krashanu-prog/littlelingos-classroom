/* Little Lingos Classroom service worker: app shell offline + notification taps.
   Family data from the database is never cached here; only the app's own files. */
const CACHE = "ll-shell-v2";
const SHELL = ["./", "index.html", "adapter.js", "config.js", "supabase.js", "bank.js", "gk.js",
  "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon.svg"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("ll-") && k !== CACHE && k !== "ll-fonts").map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    /* shared family pages are never cached and never replace the app shell */
    if (/\/share\.html$/.test(url.pathname)) return;
    /* network first, so updates show straight away; the saved copy is used offline */
    e.respondWith(fetch(req).then(res => {
      if (res && res.ok && res.type === "basic") { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req.mode === "navigate" ? "index.html" : req, cp)); }
      return res;
    }).catch(() => caches.match(req.mode === "navigate" ? "index.html" : req, { ignoreSearch: true })
      .then(r => r || caches.match("index.html"))));
    return;
  }
  /* fonts only: keep a copy so the app looks right offline */
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open("ll-fonts").then(c => c.match(req).then(hit => {
      const net = fetch(req).then(res => { if (res && (res.ok || res.type === "opaque")) c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
  }
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const go = (e.notification.data && e.notification.data.go) || "home";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    for (const c of cs) { if ("focus" in c) { c.postMessage({ llGo: go }); return c.focus(); } }
    return self.clients.openWindow("./#" + go);
  }));
});
