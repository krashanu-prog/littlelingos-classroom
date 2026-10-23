# LittleLingos Classroom: your own website

This is the LittleLingos Classroom app with all its features: the admin, trainer, parent and student dashboards, batches, fees and chats. It runs on its own web address. People sign in with their email and a one-time code. Nobody needs a Claude account.

It has two parts:

- **Supabase** keeps the logins and all the data. The free plan is enough to start.
- **A static host** (Netlify, Vercel or Cloudflare Pages) serves the `site` folder. All three have free plans.

Setup takes about 30 minutes. You only do it once.

---

## Step 1: Create the database (Supabase)

1. Go to **supabase.com** and sign up. Click **New project**.
   - Name: `littlelingos`.
   - Region: **Mumbai (ap-south-1)**, the closest to your families.
   - Choose a database password and keep it somewhere safe.
2. When the project is ready, open **SQL Editor**, then **New query**.
3. Open `supabase/schema.sql` from this folder. Copy all of it, paste it in, and click **Run**. It should say "Success".
   - The file makes **krashanuagarwal@gmail.com** the admin.
   - To use a different admin email, change it in the `insert into public.ll_admins` line before you run it.
   - To add a second admin later, run: `insert into ll_admins values ('other@email.com');`
4. Run `supabase/auto-link.sql` the same way, then `supabase/security-v2.sql`, `supabase/security-v2-compat.sql` (privacy and security rules) and `supabase/bank.sql` (the homework activity bank). This connects people automatically when they sign in with the email you put on their record.
5. Optional: to start with the example courses and lessons, run `supabase/starter-content.sql` the same way.

## Step 2: Turn on email sign-in codes

1. Open **Authentication**, then **Sign In / Providers**. Check that **Email** is enabled.
2. Open **Authentication**, then **Emails**, then **Templates**. In both **Magic Link** and **Confirm signup**:
   - Subject: `Your LittleLingos sign-in code`
   - Body:

   ```html
   <h2>Your LittleLingos sign-in code</h2>
   <p>Type this code in the classroom:</p>
   <p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
   <p>Or <a href="{{ .ConfirmationURL }}">tap here to sign in</a> on this device.</p>
   <p>If you didn't ask for this, you can ignore this email.</p>
   ```

3. **Important before families join:** Supabase's built-in email service only sends a few emails an hour. It's fine for testing, but too few for real use.
   - Under **Authentication**, then **Emails**, then **SMTP Settings**, connect an email-sending service.
   - **Brevo**, **Resend** or **Zoho ZeptoMail** all have free tiers.
   - Use a sender like `classroom@littlelingos.in`.

## Step 3: Connect the website to the database

1. In Supabase, open **Project Settings**, then **API** (or use the **Connect** button).
2. Copy the **Project URL** and the **anon public** key.
3. Open `site/config.js` in any text editor and paste them in:

   ```js
   window.LL_CONFIG = {
     supabaseUrl: "https://abcdefgh.supabase.co",
     supabaseAnonKey: "eyJhbGciOi..."
   };
   ```

   The anon key is meant to be public. The rules from `schema.sql` decide who can read or change what. **Never** paste the `service_role` key here.

## Step 4: Put the site online

The easiest way is Netlify with no coding:

1. Go to **app.netlify.com** and sign up.
2. Choose **Add new site**, then **Deploy manually**.
3. Drag the whole **`site`** folder onto the page. You get an address like `littlelingos-classroom.netlify.app`.
4. Optional: under **Domain settings**, add your own address, e.g. `classroom.littlelingos.in`.

To update the site later, drag the `site` folder onto **Deploys** again.

Vercel or Cloudflare Pages also work. Upload the `site` folder as a static site, with no build step.

## Where it is hosted now

GitHub Pages (current home): repository `krashanu-prog/littlelingos-classroom`, address https://classroom.littlelingos.in (Wix DNS: CNAME `classroom` → `krashanu-prog.github.io`). To update: in the repository choose **Add file → Upload files**, drop the files from `site`, and commit. Updates are free and unlimited.

## Step 5: Tell Supabase your web address

In Supabase, open **Authentication**, then **URL Configuration**:

- **Site URL:** your web address, e.g. `https://classroom.littlelingos.in`.
- **Redirect URLs:** add the same address, plus the Netlify one if you use both.

This makes the "tap here to sign in" link in the email open your classroom.

## Step 6: First sign-in and inviting people

1. Open your web address and sign in with the admin email. You'll see the admin dashboard.
2. Go to **Settings**, then **Academy**. Set the **Classroom link** to your web address, so invite messages carry the right link.
3. Add your **trainers** with their **Trainer's email (sign-in)**, and your **learners** with the **Parent's email** (and optionally a second parent's email, or the learner's own email for older children).
4. Send everyone the web address. When they sign in with that email they land straight on their own dashboard: trainers on the trainer dashboard, parents on their child's page. You don't need to connect them by hand.
5. If someone signs in with a different email, they appear under **Waiting to be connected**. Either add that email to their record, or connect them there.
6. Use **Assign trainers** to give each trainer their learners.

Until you connect someone, they can only see their own sign-up screen. They can't see any learners, fees or messages.

## Phones

The site works on phones and can be installed like an app:

- **Android (Chrome):** menu, then **Add to Home screen**.
- **iPhone (Safari):** Share, then **Add to Home Screen**.

## Who can see and change what

| Who | Can do |
|---|---|
| Admin (emails in `ll_admins`) | Everything: learners, trainers, fees, assignments, settings, reports |
| Trainer (connected to a trainer record) | Their learners, classes, attendance, homework, family chats. Can't see fees, add learners, or change assignments |
| Parent (connected to a child) | Their child's classes, progress, homework, fees, chat with the teacher |
| Learner (connected to a record) | Their garden, lessons, games, homework and classes |
| Signed in but not yet connected | Only their own sign-up screen |

## Good to know

- **Backups:** the free plan has no automatic backups you can restore yourself. Use the admin **Export** buttons every month, or move to Supabase Pro for daily backups.
- **Free plan pause:** free Supabase projects can be paused if nobody uses them for about a week. Daily use keeps them awake. Pro removes this.
- **Files:** class materials uploaded by trainers go to Supabase Storage (the `assets` bucket). Anyone with a file's link can open it, so don't upload private documents there.
- **Moving from the claude.ai version:** only the example courses were stored there, and `starter-content.sql` brings them across. People sign in fresh here, so connect them again as in Step 6.

## Files

```
site/                     upload this folder to your host
  index.html              the app
  adapter.js              sign-in screen and database connection
  config.js               your Supabase URL and anon key (edit this)
  supabase.js             Supabase library (v2.117.2)
  bank.js                 open homework activity bank (Seeds, Sprouts, Blooms × 7 skills); edit bank_src.py to add more
  manifest.webmanifest, icon*.png, icon.svg   home-screen icon
supabase/
  schema.sql              database, access rules, live updates, file storage
  auto-link.sql           connects people automatically by the email on their record
  security-v2.sql         each family sees only its own children; admin-only approvals; size limits
  security-v2-compat.sql  same privacy rules for direct table reads
  bank.sql                lets trainers and admins read and add to the activity bank
  starter-content.sql     optional example courses and lessons
```
