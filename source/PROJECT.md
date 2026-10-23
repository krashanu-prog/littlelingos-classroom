# Little Lingos Classroom: project reference

An English-learning LMS for children aged 3.5 to 15 (Little Lingos, India). Admin, trainers, parents and learners each get their own dashboard. Brand: "The Word Garden" with Pip the seed as the mascot.

- **Live app:** https://classroom.littlelingos.in
- **Code:** https://github.com/krashanu-prog/littlelingos-classroom (the root is the published site, and `source/` holds everything used to build it)
- **Database:** Supabase project `ldfhdbsxphwxklrpvgul` (free plan)

---

## 1. How it is built

| Part | What it is |
|---|---|
| **App** | One page, `index.html`, built by `source/build/build.py`. It is plain HTML, CSS and JS with no framework. |
| **Data layer** | `adapter.js` (in the repo root) gives the app a small Firestore-style API (`db.doc`, `db.collection`, `onSnapshot`, assets, downloads) on top of Supabase. It also handles sign-in (email one-time code or password), two-step sign-in (TOTP), the idle sign-out for staff, and the email typo check. |
| **Database** | A single table, `docs(path, data jsonb, parent generated, updated_at)`. Paths look like `learners/<id>`, `sessions/<id>`, `tw/<trainerUid>/x/<id>` (homework, marks and notes), `kp/<uid>/x/<id>` (a child's portfolio) and `pp/<uid>/x/<id>` (parent requests). |
| **Who sees what** | Reads go through the `ll_fetch(p)` RPC, which scopes every row to the caller's family or staff role. `ll_row_ok` guards direct reads. Writes go through `ll_update` or row rules. Roles: `ll_level` 0 none, 1 signed in, 2 family, 3 trainer, 4 admin. |
| **Hosting** | GitHub Pages with a custom domain (`CNAME`). There are no server headers, so the Content Security Policy is set in a `<meta>` tag and frame-busting is done in JS. |
| **Emails** | Supabase Auth sends sign-in codes through Brevo SMTP (free plan, from classroom@littlelingos.in). |
| **Ask Pip (AI)** | The Supabase Edge Function `supabase/functions/ask-pip` uses the Groq free API first, with Cloudflare Workers AI as backup. Children get a strict safe mode, and chats are kept for 30 days for admin review. |
| **Pip's voice** | Pre-recorded MP3s (`pip-*.mp3`, plus the `pv/` library indexed by `pv.json`) generated with Kokoro TTS (af_heart voice, speed 0.88). Lines without a clip fall back to the device voice. |
| **Phone app** | Can be installed from the browser (`manifest.webmanifest`). The service worker `sw.js` keeps the app shell for offline use and caches Pip's voice. |

### How a build works
`build.py` reads `littlelingos-base.html` (the original app). It then runs each `*_patch.py` in order; every patch makes exact text replacements with `R(old, new)` and adds a matching `*_block.js` and `*.css`. Finally it writes `site/index.html` with the head (CSP, config, adapter and data scripts). If an expected piece of text isn't found, the build stops.

Patch order: parents, bank, fun, hwform, draw, pip, upi, adapt, dt, wall, board, notif, say, store, cap, conf, reel, teach, india, sound, pp, share, wod, voice, classfix, sec, cls2, lf, studio, nk, polish.

### Database setup order
`schema.sql`, `auto-link.sql`, `security-v2.sql`, `security-v2-compat.sql`, then the feature files (`bank`, `journal`, `pip`, `upi`, `adapt`, `screentime`, `wall`, `boards`, `storage`, `conf`, `missions`, `passport`, `share`), then `security-v3.sql` to `security-v6.sql`. `test/resetdb.sh` shows the exact order. Every file is safe to run again.

---

## 2. Features

**Children (learners)**
- **My garden:** every finished lesson grows a flower, with streaks and stars.
- **Adaptive path:** words a child finds hard come back for practice, and strong words let them jump ahead.
- **Speaking with Pip:**
  - "Say it with me" listens and gives 1 to 3 stars.
  - Word of the Day.
  - Teach Pip (the child explains a word to Pip).
  - Sound pairs (listen, tap the picture, say it).
- **Ask Pip** chat helper and mood check-in.
- **Games and daily challenge.**
- **Fun corner:**
  - Art studio: full screen, with crayon, rainbow brush, spray, fill, stickers and colouring pages.
  - Pip's Chess: Easy, Tricky or with a friend, with hints.
  - GK quiz.
  - Journal.
- **My India** word packs and real-life missions.
- **Garden wall:** shared work, approved by the teacher first.
- **Confidence meter** (monthly), **voice time capsule** (each term) and **speaking passport** (Blooms, ages 11 to 15).
- **Classes:** only the classes they are picked for, with Join, attendance status, recordings and ratings.
- **Homework:** with the teacher's worksheet, due dates and replies (stars, stickers, voice notes).

**Parents**
- **Overview:** next class, last class (Present or Absent), attendance, homework and words.
- **Weekly progress digest** and **Friday highlight reel** (built on the device, never stored).
- **Progress, reports and PTM bookings.**
- **Messages** with the teacher.
- **Help:** reschedule requests and tickets.
- **Fees:** pay by UPI and the admin confirms.
- **Share with family:** private links the parent controls.
- **Parental gate and screen-time rules.**

**Trainers**
- **Today:** schedule, classes to mark complete, and alerts for classes with no learners picked.
- **Classes:**
  - Every class must name its learners. There are quick picks for "Everyone in this course" and for batches.
  - Start class, whiteboard, roster.
  - Mark complete: Present, Late or Absent per child, plus notes.
- **Homework:**
  - A three-step form (Who, The task, Due date).
  - Upload your own worksheet (PDF or photo), and keep reusable sheets in **My worksheets**.
- **Review queue, reports, families inbox, hours and pay, availability, leave and substitutes, library, Word of the Day.**

**Admin**
- **Everything trainers have**, plus learners, parents, trainers and leads.
- **Batches.**
- **Fees:** plans, coupons and UPI confirmation.
- **Notices, audit log, imports and exports, storage meter, Pip's voice recorder, settings.**
- **Add learner:** a short form that checks everything before saving, warns about possible duplicates, and can't create double records.

---

## 3. Safety rules (important decisions)

1. **A child only receives classes they are picked for.** `forLids` on each class is the source of truth (`security-v5.sql`). A class with no learners reaches no child.
2. **No class can exist without learners.** The app enforces it in the class form, batches, make-up classes and CSV import, and the database trigger `ll_class_needs_learners` refuses it (`security-v6.sql`).
3. **Course-wide homework and notes from a trainer** reach only that trainer's learners. Admin items reach the whole course (`security-v4.sql`). Trainers set homework for chosen children only.
4. **Families never see other children:**
   - Marks, feedback and notes are filtered to the family's own children (`ll_pick`, `ll_keep`).
   - The lesson plan is removed for families.
5. **Two-step sign-in:** once an account turns it on, it sees no children's data until the code is entered (`security-v3.sql`, `ll_mfa_ok`, `ll_uid`).
6. **Staff idle sign-out:** admin after 30 minutes, trainers after 60.
7. **Uploaded files** (worksheets, library) go to the public `assets` storage bucket. Anyone with a file's link can open it, so nothing private is uploaded there.

---

## 4. Deploying

- **App:** rebuild `site/index.html`, then commit the changed files to the `main` branch of the GitHub repo, and GitHub Pages publishes them. If a commit that changes only `index.html` doesn't start a Pages build, also commit `version.txt` (a timestamp) in the same commit.
- **Database:** run the new `.sql` file in the Supabase SQL editor.
- **Service worker cache:** the name is `ll-shell-v3`. `adapter.js` is loaded as `adapter.js?v=<hash>`, so devices pick up changes straight away.

## 5. Costs
Everything runs on free plans: GitHub Pages, Supabase Free (about 500 MB of data and 1 GB of files, no automatic backups, pauses after about a week unused), Brevo (about 300 emails a day), and the Groq and Cloudflare free plans for Ask Pip. The first upgrade to consider is Supabase Pro (about $25 a month) for daily backups and more space.

## 6. Testing (local)
`test/resetdb.sh` loads all SQL into a local Postgres. `test/minirest.py` imitates the Supabase REST API. `test/crawl.py` opens every page as admin, trainer, parent and child on desktop and phone, and checks for errors, empty pages, sideways scrolling and data leaks.
