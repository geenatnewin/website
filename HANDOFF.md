# Navin Nguyen Portfolio — Handoff

## File Structure

```
portfolio/
├── app/
│   ├── layout.js              # Root layout — fonts (Inter), metadata, mounts <OwnerAccess/>
│   ├── globals.css            # Portfolio styles (single CSS file) + hidden owner-access button styles
│   ├── page.js                # Homepage — full-screen video bg, nav
│   ├── components/
│   │   ├── PageFade.js        # Fade-in wrapper used by all 4 portfolio pages
│   │   └── OwnerAccess.js     # Hidden bottom-left "owner access" button + password popover → /ledger
│   ├── photos/page.js         # Photos page — carousels (Music + Life sections)
│   ├── videos/page.js         # Videos page — Music section with real videos
│   ├── contact/page.js        # Contact page — Formspree form (working)
│   ├── ledger/                # Password-protected gig income & tax expense tracker (see below)
│   └── api/ledger/            # API routes backing the ledger (login, mileage calc, CSV export)
├── middleware.js               # Password gate for /ledger/** and /api/ledger/** (except the login endpoints)
├── public/
│   ├── fonts/
│   │   ├── Moonhouse.ttf          # Current nav font
│   │   ├── SuperSunshine.ttf      # Unused
│   │   └── KabisatDemo-ItalicTall.ttf  # Unused
│   └── media/pics/
│       ├── LIFE/              # Life carousel photos
│       └── MUSIC/             # Music carousel photos
├── media/
│   └── videos/events/
│       ├── web/               # H.264 re-encoded + trimmed versions (upload these to R2)
│       └── *.mp4              # Original HEVC source files (gitignored, too large)
├── scripts/init-ledger-db.mjs  # One-time DB table setup for the ledger (Neon Postgres)
├── deploy.ps1                  # Interactive commit+push+alias script
├── HANDOFF.md                 # This file
├── package.json               # Next.js 14
└── next.config.js
```

## Current State

- **Homepage** — Full-screen video (Cloudflare R2: `vcftest.mp4`). Nav: Photos, Videos, Instagram, Contact. Font: Moonhouse, `scaleX(1.4)` horizontal stretch, `0.06em` letter spacing. Resting blur: `0.35px` desktop, none on mobile. Hover: `invert(1) blur(2px)`. Desktop autoplays, mobile shows first frame frozen then plays on touch.
- **Photos page** — Two carousels: **Music** (top) and **Life** (bottom). Arrow key + click navigation, lightbox on click (fullscreen, pure black background, just arrows + image, no counter/close button).
- **Videos page** — One **Music** section with 7 real videos streaming from Cloudflare R2. Click to open fullscreen player (pure black background).
- **Contact page** — Wired to Formspree (`https://formspree.io/f/xzdlroyr`). Working.
- **Instagram** — Wired to `ng.navin`.
- **Page transitions** — All 4 pages (Home/Photos/Videos/Contact) fade in on load via a shared `PageFade` component (`app/components/PageFade.js`), instead of appearing instantly.
- **Design direction (important):** user prefers a strictly monochrome look for the *public* portfolio pages. Custom cursor and accent-color hover states were tried and explicitly rejected/removed — do not re-add a colored accent or custom cursor there without being asked again. (The `/ledger` tool below is a deliberately separate, colorful dark dashboard — that choice does not apply there.)
- **Hidden owner-access button** — a barely-visible "owner access" link, bottom-left on every public page (`app/components/OwnerAccess.js`), opens an inline password popover (no page navigation) and drops into `/ledger` on success. Hidden automatically while already inside `/ledger` (checks `usePathname()`).

## Ledger (Gig & Tax Tracker) — `/ledger`

A password-protected tool for tracking freelance gig income and tax-deductible expenses, built directly into this repo as a hidden route. Entry points: type `/ledger` directly, or the hidden owner-access button on any public page. Password + a separate signing secret are in Vercel env vars `LEDGER_PASSWORD` / `LEDGER_SECRET` (all three environments).

**Stack:** Same Next.js app, `/ledger` and `/api/ledger` subtrees. Data lives in **Neon Postgres** (via Vercel Marketplace integration, project `neon-aureolin-plank`), connected through `@neondatabase/serverless`. Mutations use Server Actions (`app/ledger/actions.js`) with `revalidatePath` so the dashboard/report always reflect the latest entry immediately.

**⚠️ Important gotcha (already fixed, but good to remember):** Next.js patches the global `fetch()` and caches it by default. `@neondatabase/serverless`'s HTTP driver uses `fetch()` internally, so without `fetchOptions: { cache: 'no-store' }` on the `neon()` client (set in both `app/ledger/db.js` and `app/ledger/security.js`), pages can serve a **stale cached snapshot** of the database — especially noticeable if data is ever changed outside the app's own server actions (e.g. a manual SQL script), since only in-app actions call `revalidatePath`. If stale data ever reappears, check that both files still have this option set before assuming it's a real data bug.

**Pages (dark card dashboard, sidebar nav, `app/ledger/LedgerShell.js`):**
- `/ledger` — Dashboard. Gradient stat cards (Income/Expenses/Mileage deduction/Net) with **click-to-reveal** amounts (blurred by default for privacy). Collapsible "+ Add gig" / "+ Add expense" buttons instead of always-visible forms (`app/ledger/AddForms.js`). Reminders banner at top (see Tips below). Gig list with nested expenses, general (non-gig) expenses section below.
- `/ledger/report` — Schedule-C-style summary, a donut chart of expenses by category and a bar chart of net-by-quarter (hand-rolled SVG, `CategoryDonut.js` / `QuarterBars.js`), $600+ clients list (1099 flag), Print/CSV export.
- `/ledger/tips` — Data-driven reminders (next quarterly estimated-tax deadline, contractors paid $600+ who may need a 1099-NEC from *you*, gigs stuck "pending" 2+ weeks) plus a static list of general self-employment tax tips. Clearly disclaimed as educational, not professional tax advice.
- `/ledger/security` — Lists lockout events only (not individual wrong guesses) — timestamp, IP, unlock time.
- `/ledger/login` — Password form; shows live lockout state and a "N attempts left" counter after each wrong guess.

**Gig fields:** date, client/venue, type (Photography/Videography/DJ/Other — Other has a free-text specify field), gross payment, payment method (dropdown: Venmo/Zelle/Cash App/PayPal/Direct Deposit/Check/Cash/Other-with-specify), date paid, status (paid/pending), mileage (auto-calculated round-trip from home address via a venue-address + Calculate button — geocoded with Nominatim, routed with OSRM, both free/keyless), notes.

**Expense fields:** date, category (10 Schedule C categories, each with its own extra field — e.g. contractor name + 1099 hint for contract labor, required business-purpose for meals, % business-use for utilities, item for supplies, destination for travel, policy/service type for insurance/legal), linked gig (optional), amount, vendor, description. Meals are automatically counted at only 50% deductible and utilities at their declared business-use %, reflected correctly in the report, donut chart, quarterly totals, and CSV export (which has separate `Amount` / `DeductibleAmount` / `Details` columns for the tax preparer).

**Security:** password gate via `middleware.js` (Edge, Web Crypto SHA-256 session cookie) on `/ledger/**` and `/api/ledger/**`. Login lockout: 3 failed attempts (first + 2 more) → 10-minute block, tracked per-IP in Postgres (`login_security`, `login_lockout_log` tables), enforced on both the `/ledger/login` page and the hidden popover's `/api/ledger/login` route.

**DB setup for a fresh clone:** `node scripts/init-ledger-db.mjs` (idempotent, creates all tables if missing).

## Videos on R2

| R2 filename | Display name |
|---|---|
| bushbabyyy13.mp4 | Bush Baby B2B Sidney Charles |
| bushbabyyy25.mp4 | Bush Baby B2B Sidney Charles II |
| horizontal00185628.mp4 | Cloone |
| 30k.mp4 | PALACIO |
| cover9.mp4 | PALACIO II |
| akilla.mp4 | AKILLA |
| akilla2.mp4 | AKILLA II |

## Deployment Status (IMPORTANT)

- **Platform:** Vercel (account: `navinnguyen` / `geenatnewin@gmail.com`)
- **Production URLs:** `https://navinnguyen.vercel.app` and custom domain `https://navinng.com` — both confirmed live and serving the same production deployment (they always deploy together, no way to push to just one)
- **Deploy method:** Push to `main` branch — Vercel auto-deploys. The `ledger` feature was built on a `ledger` branch (pushed separately for preview-URL testing) and merged to `main` once verified.
- **Vercel alias quirk:** `navinnguyen.vercel.app` must be manually re-pointed after each deploy via `vercel alias set [latest-url] navinnguyen.vercel.app` (see `deploy.ps1`). The custom domain `navinng.com` is a normal Vercel custom domain and auto-follows production without manual steps (confirmed working).
- **navinng.com DNS:** registered + DNS managed on Cloudflare. Records: `A @ → 76.76.21.21` and `CNAME www → cname.vercel-dns.com`, both set to "DNS only" (grey cloud, proxy off).

## Services

| Service | Purpose | Details |
|---|---|---|
| Cloudflare R2 | Video + homepage video hosting | `https://pub-095a05fb51af4a3b83d5e05b40b59ff4.r2.dev/[filename]` |
| Formspree | Contact form emails | `https://formspree.io/f/xzdlroyr` |
| Vercel | Hosting | Auto-deploys from `main` |
| Cloudflare Registrar | Domain registration + DNS | `navinng.com` |
| Neon Postgres | Ledger database | Via Vercel Marketplace integration, project `neon-aureolin-plank` |
| Nominatim + OSRM | Free geocoding/routing for mileage calc | No API key, public services — fine for personal, occasional lookups |

## Adding New Videos

1. If HEVC (iPhone video): re-encode with ffmpeg: `ffmpeg -i input.mp4 -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 192k -movflags +faststart output.mp4`
2. To trim: `ffmpeg -ss [start] -to [end] -i input.mp4 -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 192k -movflags +faststart output.mp4` (omit `-to` to go to end)
3. Upload to Cloudflare R2
4. Add to `eventVideos` or `musicVideos` array in `app/videos/page.js`
5. Push to git

## Things Left To Do

- [ ] Add real music videos to the Music section on the Videos page (currently only event footage)
- [ ] Ledger: re-enter real gig/expense data (database was cleared for a fresh start)

## Session Log

### Session 1 — 2026-06-28
- Built full site structure, diagnosed Vercel URL issues, set up memory/handoff system

### Session 2 — 2026-06-28
- Added resting blur to nav, added photos in carousel layout (Event + Life), renamed Vercel project to `navinnguyen`, site now at `https://navinnguyen.vercel.app`

### Session 3 — 2026-06-29
- Switched nav font to Moonhouse, added horizontal stretch (`scaleX(1.4)`), fixed video autoplay (desktop auto, mobile frozen first frame)
- Built Videos page with Event + Music sections, re-encoded HEVC videos to H.264
- Added 7 videos to Event section

### Session 4 — 2026-06-29
- Added PALACIO II, AKILLA, AKILLA II to videos page
- Trimmed akilllla.mp4 (13s–26s) → akilla.mp4 on R2
- Trimmed another.mp4 (18.5s–end) → akilla2.mp4 on R2
- Hit Vercel 100 deploy/day rolling limit — PALACIO II, AKILLA, AKILLA II pending

### Session 5 — 2026-06-30
- Quota reset, deployed PALACIO II, AKILLA, AKILLA II — all 7 event videos now live

### Session 6 — 2026-06-30
- Fixed mobile nav font size overflow in portrait (INSTAGRAM no longer cut off)
- Fixed back button: now in a non-scrolling flex header bar (reliable on iOS)
- Fixed carousel on mobile: full images shown (no cropping), swipe to navigate, arrows hidden
- Added lightbox swipe navigation between photos + prev/next arrows on desktop
- Removed lightbox close button and counter — just arrows remain
- Fixed homepage background video on mobile: poster image shown on load (hides iOS play button), fades to video on first touch
- Removed iOS tap highlight on nav items, suppressed long-press callout
- Added scale-up `:active` effect on nav items for both mobile and desktop

### Session 7 — 2026-06-30
- Removed pool photo (IMG_0097.jpg) from Life carousel
- Added 4 new photos to Music carousel (4I0A3022, 4I0A3282, IMG_3065, IMG_3068)
- Renamed "Event" → "Music" on both Photos and Videos pages
- Added 19 photos to Life carousel from Desktop\port folder
- Removed empty second Music section from Videos page
- Reordered Life carousel multiple times per user request
- Removed IMG_9435, IMG_9462 from Life; added IMG_0177 (exported from DNG)
- Fixed alias downtime issue: removed alias from vercel.json, now manually set after each deploy
- Created deploy.ps1 script to auto-set alias after future deploys
- Started localhost:3000 dev server for faster previewing

### Session 8 — 2026-07-01
- Purchased and connected custom domain `navinng.com` (registered via Cloudflare Registrar) to the Vercel project, alongside existing `navinnguyen.vercel.app`
- Set DNS records in Cloudflare (A + CNAME, proxy off) per Vercel's requirements; confirmed domain resolves and is live
- Iterated on "make the site pop more": tried and then **removed** scroll-in reveal animations, a warm gold accent color on hover states, and two custom cursor designs (viewfinder brackets, then dot+trailing ring — both ultimately removed). Net result: site remains fully monochrome, no custom cursor.
- Made all Photos/Videos section titles ("Music", "Life") the same fixed color/opacity instead of dimming inactive ones
- Made photo and video lightboxes fully opaque black (was a 96%-opacity near-black) so only the image/video + arrows show
- Added `PageFade` component — Home, Photos, Videos, and Contact now fade in on mount instead of appearing instantly
- Deployed all of the above; both `navinnguyen.vercel.app` and `navinng.com` are live and up to date

### Session 9 — 2026-07-29 to 2026-07-30 (Ledger build)
Built the entire `/ledger` gig & tax tracker from scratch, on a `ledger` branch, iterating through many rounds of feedback before merging to `main`:
- Initial build: password-gated route, Neon Postgres, dashboard + Schedule-C-style report + CSV export, mileage tracking with date-aware IRS rate, minimal monospace design
- Added hidden owner-access button on public pages (bottom-left, popover login, no page nav)
- Full visual redesign to a dark card dashboard with sidebar nav and gradient stat cards, per a reference screenshot — donut + bar charts added to the report
- Added click-to-reveal (blur) on stat card dollar amounts for privacy
- Collapsible Add Gig / Add Expense forms (buttons instead of always-visible fields)
- Added Videography gig type + free-text "Other" specify field for both gig type and payment method
- Payment method converted to a dropdown (Venmo/Zelle/Cash App/PayPal/Direct Deposit/Check/Cash/Other)
- Auto mileage calculation: venue address + Calculate button, geocoded/routed via free Nominatim + OSRM services against home address
- Category-specific expense fields (contractor name, business purpose, % business use, item, destination, policy/service type) stored in a `meta` JSONB column; meals (50%) and utilities (% business use) now correctly compute actual deductible amounts everywhere (report, donut, quarterly totals, CSV)
- Login lockout: 3 failed attempts → 10-minute block per IP, tracked in Postgres, "N attempts left" counter shown after each failure, new `/ledger/security` page logging lockout events only
- Switched ledger font from monospace to system sans-serif for readability
- Added `/ledger/tips` page + dashboard Reminders banner: next quarterly tax deadline, contractors owed a 1099, stale pending gigs, general self-employment tax tips (with a "not professional advice" disclaimer)
- **Found and fixed a real bug:** Next.js was caching the `fetch()` calls that `@neondatabase/serverless` makes internally, causing stale reads whenever data changed outside an in-app server action — fixed with `fetchOptions: { cache: 'no-store' }` in `db.js` and `security.js`
- Merged `ledger` → `main`, deployed to both `navinnguyen.vercel.app` and `navinng.com`, confirmed live
- Database cleared for a fresh start — ready for real gig/expense entries

