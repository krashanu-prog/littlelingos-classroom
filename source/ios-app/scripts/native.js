/* Runs only inside the iPhone and iPad app, before the app's own code.
   Gives the app the browser's Notification API, backed by iPhone notifications,
   so the existing alert code works unchanged. */
window.LL_NATIVE = { platform: "ios", web: "__WEB__", pendingGo: null };
document.documentElement.classList.add("ll-native");
(function () {
  const plugin = () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
  if (!plugin()) return; /* not available: the app says "can't show alerts" and carries on */
  const toWeb = d => d === "granted" ? "granted" : d === "denied" ? "denied" : "default";
  const idOf = k => { let h = 0; for (const c of String(k)) h = (h * 31 + c.charCodeAt(0)) | 0; return 1 + (Math.abs(h) % 99999); };
  let perm = "default";
  plugin().checkPermissions().then(r => { perm = toWeb(r.display); }).catch(() => {});
  function N(title, opts) {
    opts = opts || {};
    plugin().schedule({ notifications: [{ id: idOf(opts.tag || (title + "|" + (opts.body || ""))), title: String(title || "Little Lingos"),
      body: String(opts.body || ""), extra: { go: (opts.data && opts.data.go) || "home" } }] }).catch(() => {});
    this.close = () => {};
  }
  Object.defineProperty(N, "permission", { get: () => perm });
  N.requestPermission = async () => { try { perm = toWeb((await plugin().requestPermissions()).display); } catch (e) {} return perm; };
  try { window.Notification = N; } catch (e) {}
  /* a tapped notification opens the right page (picked up by reminders.js) */
  plugin().addListener("localNotificationActionPerformed", e => {
    const x = e && e.notification && e.notification.extra;
    window.LL_NATIVE.pendingGo = (x && x.go) || "home";
    dispatchEvent(new CustomEvent("ll-native-go"));
  });
})();
