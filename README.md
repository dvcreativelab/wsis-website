# West Sacramento Inclusive Sailing Foundation — Website

A one-page site with a built-in content editor, so Sheila can update copy
and images herself without touching code.

## How it's built

- `index.html` — Home page. `sail.html`, `faq.html`, `about.html`, `support.html`, `donate.html`, `contact.html` — each their own page now, reached via the top nav
- `privacy-and-accessibility.html` — legal page. `thank-you.html` — shown after a contact form submission
- `style.css` / `script.js` / `cookie-consent.js` — shared across every page (don't need to be touched again)
- `content.json` — **every piece of text and every button link on the site.** This is the file the CMS edits.
- `admin/` — the login + editing screen (Decap CMS), lives at `yoursite.com/admin`
- `assets/` — logo, favicon, and site photos
- `uploads/` — sponsor logos and anything Sheila uploads through the CMS going forward

Sheila never opens the files above — she logs into `/admin`, sees a form
with labeled fields ("Hero Headline," "Donate Button Text," etc.), edits,
and clicks **Publish**. That commits the change to `content.json` and the
live site updates automatically within a minute or two.

## One-time setup (you, not Sheila)

**1. Push this to GitHub**
- Create a new repository (e.g. `wsis-website`) at github.com
- Push all these files to it (root of the repo — not in a subfolder)

**2. Connect it to Netlify**
- Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
- Pick the GitHub repo you just made
- Build settings: leave build command blank, publish directory = `.` (it's already set in `netlify.toml`)
- Deploy — you'll get a live URL like `random-name-123.netlify.app` immediately

**3. Turn on the editor for Sheila**
- In the Netlify site dashboard: **Site configuration → Identity → Enable Identity**
- Under Identity settings, set registration to **Invite only**
- Scroll to **Services → Git Gateway** → Enable Git Gateway
- Go to the **Identity** tab (top nav) → **Invite users** → enter Sheila's email
- She'll get an email, sets a password, and can then log in at `yoursite.netlify.app/admin`

**4. Point the real domain at it**
- In Netlify: **Site configuration → Domain management → Add a domain** → enter `westsacinclusivesailing.org`
- Netlify shows you either nameservers to switch to, or a couple of DNS records (A + CNAME) to add
- Go to wherever the domain was purchased, open DNS settings, add those records
- Netlify issues a free HTTPS certificate automatically once the domain is verified — the site will be reachable at `https://westsacinclusivesailing.org`
- Takes anywhere from a few minutes to a few hours to go live on the real domain

**5. Turn on form notifications**
- The Contact form uses Netlify Forms automatically — no setup needed for it to work
- To get emailed when someone submits it: **Site configuration → Forms → Form notifications → Add notification → Email notification** → enter Sheila's email

## Before (or right after) launch — three placeholders to fill in

These were left as placeholders in the copy you sent and are editable in `/admin`:

1. **PayPal donate link** — under *Donate Page → PayPal Donate Link*, paste your actual PayPal.me link or hosted donate button URL. This one field powers every Donate button sitewide.
2. **EIN** — under *Donate Page → Give With Confidence → EIN*. This single field also powers the EIN shown in the site footer, so you only ever need to update it in one place.
3. **Board Secretary/Treasurer name** — under *About Page → Board of Directors → Members*.
4. **Phone number** — under *Footer → Phone*, currently shows "TBD" until filled in.
5. **Email address** — standardized sitewide on `sheila@westsacinclusivesailing.org` to match the live domain. Three different email domains came up across our conversation — double check this is the right one before launch (editable under *Organization → Contact Email*).

## Cookie consent & legal page

A working cookie consent banner and a full **Privacy and Accessibility Policy** page (`privacy-and-accessibility.html`) are built in, covering Privacy Policy, Disclaimer, and Accessibility Statement — all editable under **Legal & Cookie Notice** in the CMS.

Important: the policy text mentions Google Ads Remarketing and analytics cookies, but **no tracking scripts are currently installed on the site** — the banner and opt-out toggle work (they store the visitor's choice), but there's nothing yet for them to actually gate. If/when you add Google Analytics or Google Ads, let me know and I'll wire the script to respect the stored opt-out choice so the policy text stays accurate.

One thing I removed rather than shipped: the accessibility contact line in your text read "please contact BaaDaBoom at sheila@..." — "BaaDaBoom" looked like leftover placeholder text from a template rather than something meant to go live, so the current copy just says "please contact us." Flag me if that was actually intentional.

Also worth a quick confirm: the Sail page references **Lake Washington Sailing Club** as the partner club for memberships — the About page clarifies this is an intentional partner org, but flagging in case that name should actually be a different local club.

## How Sheila edits going forward

1. Go to `yoursite.com/admin`
2. Log in (first time: check email for the invite link)
3. Click **Website Content**
4. Open any section (Home, Sail, About, Support, Donate, Contact, Footer)
5. Edit the text or upload a new image
6. Click **Publish** — live in a minute or two, no code involved

## Adding images later (once branding is ready)

Any image fields you want added (hero photo, team photos, program photos) are easy to add to `admin/config.yml` as `image` widgets — just let me know which sections need images once the branding's locked and I'll wire them in.
