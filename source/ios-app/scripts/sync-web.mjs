/* Copies the published web app (the repo's top folder) into www/ for the iPhone app.
   Nothing in the top folder is changed. Two small edits are made to the copy only:
   1. Inside the app the page address is capacitor://localhost, so links meant for
      people (invites, share links, the sign-in email) use the real web address.
   2. native.js is loaded, which marks the page as running inside the app.
   3. Alerts use iPhone notifications (native.js), and grown-ups get a reminder
      10 minutes before each class, even when the app is closed (reminders.js).
   4. The parent pay panels (Razorpay and UPI) are removed, so no payment is taken in the app. */
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../..");
const out = resolve(here, "../www");
const WEB = "https://classroom.littlelingos.in";

const FILES = ["index.html", "adapter.js", "config.js", "supabase.js", "bank.js", "gk.js",
  "icon-192.png", "icon-512.png", "icon.svg", "pv.json"];
const DIRS = ["pv"];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const f of FILES) cpSync(join(root, f), join(out, f));
for (const f of DIRS) cpSync(join(root, f), join(out, f), { recursive: true });
for (const f of readdirSync(root)) if (/^pip-.*\.mp3$/.test(f)) cpSync(join(root, f), join(out, f));

function patch(file, edits) {
  const p = join(out, file);
  let s = readFileSync(p, "utf8");
  for (const [what, from, to, min] of edits) {
    const n = s.split(from).length - 1;
    if (n < min) throw new Error(`${file}: expected "${what}" at least ${min} time(s), found ${n}. The web app changed; update scripts/sync-web.mjs.`);
    s = s.split(from).join(to);
  }
  writeFileSync(p, s);
}

patch("index.html", [
  ["config script", '<script src="config.js"></script>', '<script src="config.js"></script>\n<script src="native.js"></script>', 1],
  ["web address + folder", "location.origin+location.pathname.replace(/[^/]*$/,\"\")", `"${WEB}/"`, 1],
  ["share page address", "location.origin+location.pathname.replace(/[^/]*$/,\"\").replace(/\\/+$/,\"\")", `"${WEB}"`, 0],
  ["web address", "location.origin", `"${WEB}"`, 3],
  ["manifest link", '<link rel="manifest" href="manifest.webmanifest">', "", 1],
  /* Native notifications: the app is already "installed", and class reminders are added (reminders.js). */
  ["installed check", "const isStandalone=()=>{try{return ", "const isStandalone=()=>{try{return !!window.LL_NATIVE||", 1],
  ["alerts-on line", "<b>Alerts are on</b> for this device while Little Lingos is open.", "<b>Alerts are on</b> for this device, with a reminder 10 minutes before each class.", 1],
  ["alert timer", "setTimeout(()=>{notifAlert();offlineSave();},6000);", "setTimeout(()=>{notifAlert();offlineSave();},6000);\n" + readFileSync(join(here, "reminders.js"), "utf8"), 1],
  /* No payments inside the app: parents see what is due, and pay the academy outside the app. */
  ["Razorpay pay panel", "function rzpParentHTML(L,fk){", 'function rzpParentHTML(L,fk){return "";', 1],
  ["UPI pay panel", "function upiParentHTML(L,fk){", 'function upiParentHTML(L,fk){return "";', 1],
  ["pay hint", '${rzpOn()?"Tap Pay now below to pay securely online.":upiOn()?"Pay with UPI below, or pay the academy as usual.":"Pay the academy as usual; it shows here once recorded."}', "Pay the academy as usual; it shows here once recorded.", 1],
  ["due alert rule", "fk.remainingM>0&&!(rzpOn()&&!rzpDues(L,fk).length)", "fk.remainingM>0", 1],
  ["Razorpay frame source", "frame-src https://api.razorpay.com https://checkout.razorpay.com;", "frame-src 'none';", 1],
  ["Razorpay script source", " https://checkout.razorpay.com;", ";", 1],
  ["Razorpay connect source", " https://*.razorpay.com;", ";", 1],
]);
patch("adapter.js", [
  ["sign-in email link", "location.origin + location.pathname", `"${WEB}/"`, 2],
]);

writeFileSync(join(out, "native.js"), readFileSync(join(here, "native.js"), "utf8").replaceAll("__WEB__", WEB));
console.log("www/ is ready (" + WEB + ")");
