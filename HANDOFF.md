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
│   │   └── OwnerAccess.js     # Hidden bottom-right "admin access" button + password popover → /dashboard
│   ├── photos/page.js         # Photos page — carousels (Music + Life sections)
│   ├── videos/page.js         # Videos page — Music section with real videos
│   ├── contact/page.js        # Contact page — Formspree form (working)
│   ├── dashboard/              # Password-protected gig income & tax expense tracker (see below) — URL is /dashboard, internal files still say "ledger" (ledger.css, LedgerShell.js, etc.)
│   └── api/ledger/            # API routes backing the dashboard (login, mileage calc, CSV export) — kept the /api/ledger path, only the page URL changed
├── middleware.js               # Password gate for /dashboard/** and /api/ledger/** (except the login endpoints)
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
- **Design direction (important):** user prefers a strictly monochrome look for the *public* portfolio pages. Custom cursor and accent-color hover states were tried and explicitly rejected/removed — do not re-add a colored accent or custom cursor there without being asked again. (The `/dashboard` tool below is a deliberately separate, colorful dark dashboard — that choice does not apply there.)
- **Hidden admin-access button** — a barely-visible "admin access" link, bottom-right on every public page (`app/components/OwnerAccess.js`), opens an inline password popover (no page navigation) and drops into `/dashboard` on success. Hidden automatically while already inside `/dashboard` (checks `usePathname()`).

## Ledger (Gig & Tax Tracker) — `/dashboard`

A password-protected tool for tracking freelance gig income and tax-deductible expenses, built directly into this repo as a hidden route. Entry points: type `/dashboard` directly, or the hidden admin-access button on any public page. Password is in Vercel env var `LEDGER_PASSWORD` (all three environments) — login is password-only (a username requirement was tried and then reverted).

**Stack:** Same Next.js app. Page route lives at `app/dashboard/` → URL `/dashboard`; API routes stayed at `app/api/ledger/` → URL `/api/ledger` (only the page URL was renamed, not the API). Internal files inside `app/dashboard/` keep their original "ledger" names (`ledger.css`, `LedgerShell.js`, `actions.js`, etc.) — renaming the folder is all that changed the URL, so don't be confused by "ledger" showing up in file/component/CSS-class names throughout. Data lives in **Neon Postgres** (via Vercel Marketplace integration, project `neon-aureolin-plank`), connected through `@neondatabase/serverless`. Mutations use Server Actions (`app/dashboard/actions.js`) with `revalidatePath` so the dashboard/report always reflect the latest entry immediately.

**⚠️ Important gotcha (already fixed, but good to remember):** Next.js patches the global `fetch()` and caches it by default. `@neondatabase/serverless`'s HTTP driver uses `fetch()` internally, so without `fetchOptions: { cache: 'no-store' }` on the `neon()` client (set in both `app/dashboard/db.js` and `app/dashboard/security.js`), pages can serve a **stale cached snapshot** of the database — especially noticeable if data is ever changed outside the app's own server actions (e.g. a manual SQL script), since only in-app actions call `revalidatePath`. If stale data ever reappears, check that both files still have this option set before assuming it's a real data bug.

**Pages (dark card dashboard, sidebar nav, `app/dashboard/LedgerShell.js`):**
- `/dashboard` — Dashboard. Gradient stat cards (Income/Expenses/Mileage deduction/Net) with **click-to-reveal** amounts (blurred by default for privacy). "Gigs" and "Expenses" buttons expand a box containing that list *plus* its own "+ Add" button/form inside (`app/dashboard/DashboardSections.js`; form fields live in `GigForm.js` / `ExpenseForm.js`, reused for both add and edit). On successful add, the form clears and a green "ADDED" toast pops up bottom-center for ~1.8s. Every gig (`GigEntry.js`) and expense (`ExpenseLine.js`) has inline **Edit** and **Delete** controls — Edit swaps the row for the same form pre-filled, Delete asks for confirmation first (deleting a gig keeps its linked expenses, just unlinks them).
- `/dashboard/report` — Schedule-C-style summary (screen + print), plus screen-only charts (excluded from print via `ldg-no-print`): expenses-by-category donut, net-by-quarter bar, income-by-gig-type donut, net-by-month bar (`CategoryDonut.js` / `QuarterBars.js`, reused for both chart pairs). $600+ clients list (1099 flag), Print/CSV export.
- `/dashboard/tips` — Reminders banner (next quarterly deadline, contractors owed a 1099, stale pending gigs, recurring expenses with no charge logged in 2+ months), an estimated-tax-to-set-aside calculator (`EstimatedTaxCard.js`, YTD net profit × adjustable rate), a home office deduction calculator (`HomeOfficeCard.js`, simplified vs. regular method side by side), and a static list of general self-employment tax tips. Clearly disclaimed as educational, not professional tax advice.
- `/dashboard/security` — Lists lockout events only (not individual wrong guesses) — timestamp, IP, unlock time.
- `/dashboard/login` — Password form; shows live lockout state and a "N attempts left" counter after each wrong guess.

**Gig fields:** date, client/venue, type (Photography/Videography/DJ/Other — Other has a free-text specify field), gross payment, payment method (dropdown: Venmo/Zelle/Cash App/PayPal/Direct Deposit/Check/Cash/Other-with-specify), date paid, status (paid/pending), mileage (auto-calculated round-trip from home address via a venue-address + Calculate button — geocoded with Nominatim, routed with OSRM, both free/keyless), notes.

**Expense fields:** date, category (10 Schedule C categories, each with its own extra field(s) stored in a `meta` JSONB column — see `app/dashboard/categories.js`), linked gig (optional), amount, vendor, description, recurring-monthly flag. Every category shows a short tax-education hint under the category dropdown when selected (not professional advice, just practical reminders — e.g. meals/travel explain what's deductible on a multi-day trip, insurance explains health insurance isn't a Schedule C item, supplies explains the $2,500 capital-asset line). Meals and Supplies & equipment support **bulk entry** — "+ Add another meal/item" repeats Amount (+ Restaurant, or Item name) rows. Meals: each row is still its own separate expense line (a receipt with several food items is one meal transaction, but multiple restaurant stops in a day are genuinely separate). Supplies & equipment: as of Session 13, a multi-item cart is saved as **one expense row** (one purchase, one deduction) with an itemized `meta.items = [{ name, amount, capitalAsset }]` array instead of splitting into one row per item — `app/dashboard/actions.js`'s `collectSupplyItems()` builds it (used by both `addExpense` and `editExpense`; the supplies branch of the form is always the itemized-rows UI now, on both add and edit, not just add). Each item keeps its own **Capital asset** checkbox (auto-suggested past $2,500) so a big item within a mixed cart still stands out for the tax preparer despite the combined total. Clicking the entry in the list (see "expandable rows" below) reveals the per-item breakdown; the CSV export's Details column also lists every item + amount + capital-asset flag for multi-item entries (`expenseDetails()` in `app/api/ledger/export/route.js`) rather than the on-screen "N items" summary. All non-insurance categories (not just Meals/Supplies) get the **"Receipt Photo (optional)"** upload since Session 13 — for single-item categories it fills amount/vendor/date and folds item names into the description field. Insurance has no separate date field — instead: Billing frequency (Monthly/Annual) + Effective start date, and only Monthly shows an Effective end date input (Annual auto-computes end = start + 12 months); effective start date doubles as the expense's date. Meals are automatically counted at only 50% deductible and utilities at their declared business-use %, reflected correctly in the report, donut chart, quarterly totals, and CSV export (which has separate `Amount` / `DeductibleAmount` / `Details` columns for the tax preparer).

**Expandable rows (gigs and expenses):** clicking a row in the Gigs/Expenses list (or Enter/Space when focused) toggles a details panel — payment method + date paid for gigs, description/recurring flag/linked gig/receipt-view/itemized cart breakdown for expenses. A chevron only appears when there's something to reveal. `GigEntry.js` / `ExpenseLine.js`, styled via `.ldg-row-expandable`/`.ldg-row-chevron` in `ledger.css`. The receipt photo itself is viewable full-size via `ReceiptLightbox.js` (reuses `.ldg-modal-overlay`), both from the add/edit form and from an already-saved entry's expanded details, falling back to the signed `/api/ledger/receipt?key=` endpoint when there's no fresh local blob.

**Receipt upload flow (Session 13):** picking photos no longer scans immediately — `ExpenseForm.js` holds them as `pendingFiles` (local blob previews only) with a Remove button per photo, and nothing is uploaded/sent to Claude until the **Scan N files** button is clicked, so an accidental pick doesn't cost an API call. The file input takes `multiple`; all selected files go in one scan request (`formData.getAll('receipt')` server-side) and are treated as one receipt (e.g. a long receipt shot in parts) — `analyze-receipt/route.js` sends every file in the same Claude message and uploads each to R2 individually, returning `receiptKeys[]`. The first key is stored in the existing `receipt_url` column for backward compatibility; the full array (when there's more than one) goes in `meta.receiptKeys`, read by both `ExpenseForm.js` (editing) and `ExpenseLine.js` (list view) via a shared fallback: prefer `meta.receiptKeys`, else wrap `receipt_url` in a single-item array, else empty. **PDF support:** the upload accepts `application/pdf` alongside images — the route sends PDFs to Claude as a `document` content block instead of `image` (same request otherwise, no separate code path for extraction). A PDF can't render in an `<img>`/lightbox, so `format.js`'s `isPdfKey()` (checks the R2 key's extension, which `uploadReceipt()` in `r2.js` always derives from the file's content type) tells both `ExpenseForm.js` and `ExpenseLine.js` to render a "PDF" chip that opens the signed URL in a new tab instead.

**Gigs/Expenses lists grouped by month:** opening the Gigs or Expenses box no longer dumps every entry at once — `DashboardSections.js`'s `groupByMonth()` buckets `gigs`/`generalExpenses` by calendar month (relies on the DB query's existing `ORDER BY ... DESC`, so months come out newest-first for free), and each month renders as a collapsible `MonthSection.js` header ("July 2026 · 5 entries · $2,450.00") — only the most recent month starts expanded. Gig numbering (`008`, `007`...) is computed from the full flat list *before* grouping so it doesn't reset per month. Nested per-gig expenses (`expensesByGig`) are unaffected — only the two top-level lists group by month.

**Discount/coupon handling in the receipt reader:** found via a real NiSi PDF invoice with a "Cart discount -$87.15" line — the reader had no concept of a discount at all, so it extracted subtotal + tax ($263.16) and silently ignored the $87.15 taken off, overcharging the logged expense. `RECEIPT_SCHEMA` gained a `discount` field (positive number) alongside `tax`/`shipping`; `allocateExtraCharges()` was generalized to `allocateAdjustment()` (net of tax + shipping − discount, which can now go negative) so a discount that outweighs tax/shipping correctly nets the item's amount down, not just up. The prompt also has Claude self-check that sum(items) + tax + shipping − discount equals the printed grand total before returning.

**Color/design redesign attempts — history, both superseded.** Two plain-CSS passes were built and rejected before landing on Tailwind (below): (1) 2 brand hues + 3 status colors, chart-categorical left alone — rejected, still "too many colors," and specifically flagged the gig-type badges pulling 4 more hues from the chart set for purely decorative use next to text that already names the type (fixed regardless of the rejection — see the Tailwind section, the badge fix carried forward). (2) A named-color-role system (`--accent`/`--accent2`/`--good`/etc. in `ledger.css`) with 5 full variants behind `?palette=1..5` (violet-mono, blue-mono, amber-ink, two-hue-no-status, warm-neutral) — also rejected: "I just don't like these looks," followed by an explicit ask to implement Tailwind instead. The `[data-palette="N"]` blocks and `PaletteRoot.js` variant-switcher have since been deleted (see the "Color direction settled" note below) — mentioned here only for the history of how the team arrived at Tailwind.

**Tailwind CSS — migration complete, localhost only, not yet deployed.** After both plain-CSS passes were rejected, the user asked directly for Tailwind. Installed `tailwindcss@3`/`postcss`/`autoprefixer`, scoped to `/dashboard` only (`tailwind.config.js` `content: ['./app/dashboard/**/*.{js,jsx}']`) so it can't touch the portfolio site's own hand-written CSS — `corePlugins.preflight: false` too, since `globals.css` (loaded on every route including `/dashboard`) already does its own reset and a second one from Tailwind would fight it. Verified this scoping actually holds by screenshotting the portfolio homepage after the migration — unaffected. Directives (`@tailwind base/components/utilities`) live at the top of `ledger.css` (already dashboard-scoped via its import in `layout.js`), so no new CSS entrypoint was needed. Theme extensions (`brand`/`ink` color scales) are in `tailwind.config.js`.

**Every component is migrated** — sidebar/shell (`LedgerShell.js`, new `LogoutMenu.js` profile-icon-with-popover replacing a plain text "Log out" link), stat cards (`StatCard.js`), the Gigs/Expenses toggle + add buttons (`DashboardSections.js`'s `ToggleTab`/`AddButton`), all list rows (`GigEntry.js`, `ExpenseLine.js`, `MonthSection.js`), both forms (`GigForm.js`, `ExpenseForm.js`, sharing field styles from new `FormField.js`), both modals (`ConfirmModal.js`, `ReceiptLightbox.js`), the report page + its two calculator cards on `/tips` (sharing `ReportRow`/`ReportCard` from new `ReportUI.js`), `security/page.js`, `login/page.js`, and `RemindersBanner.js`. `RevealAmount.js` gained an optional `className` prop (Tailwind text-styling passthrough) and an `onRevealChange` callback (see StatCard glow note below).

`ledger.css` was cut down to just what's still genuinely load-bearing: the `.ldg-root` CSS-variable block (still read dynamically — `var(--chart-${color})` template strings in `CategoryDonut.js`/report's legend dots, so a plain grep for e.g. `--chart-blue` won't find that usage, don't assume unused), `.ldg-censored`/`.ldg-revealed` (`RevealAmount.js`'s blur-to-reveal), the donut/bar chart SVG classes (`CategoryDonut.js`/`QuarterBars.js` — deliberately left alone; a categorical chart needs distinguishable hues to convey data, unlike decorative chrome), the `ldg-toast-fade` keyframes (referenced by a Tailwind arbitrary `animate-[...]` value in `DashboardSections.js`), and print-only rules. Printing (`report/page.js` → "Print / save as PDF") still works — `.ldg-page-bg`/`.ldg-shell`/`.ldg-sidebar` class *names* are still applied in `LedgerShell.js`'s markup (empty of screen rules) purely so `@media print` has something to select, and `report/page.js`/`ReportUI.js` apply new `.ldg-print-card`/`.ldg-print-row` marker classes (also empty on screen) for the same reason — print output was never touched, only screen styling changed. Two bugs worth remembering if editing this file's comments again: a CSS comment containing a class name immediately followed by `/` (e.g. `.ldg-month-*/`) prematurely closes the comment (`*/`) and turns everything after it into real, broken CSS — hit this twice in the same session; `node -e` checking that `/\*/g` and `\*\//g` match counts are equal is a fast way to catch it before running a full build.

**StatCard glow is transient, not static.** Originally a permanent glow on the Income card — flagged as unwanted ("remove that... only add the glow if the pill changes data like money added, not when I lose money... make the glow disappear when I click to reveal"). `StatCard.js` is now a client component: it keeps the previous `rawValue` in a `useRef`, and in a `useEffect` compares it to the new `rawValue` on every prop update (which happens after `revalidatePath('/dashboard')` following an add-gig/add-expense server action) — a real increase on a `canGlow` card triggers a ~2.2s glow flash (`setTimeout`), not a permanent style. `canGlow` is only set on Income and Net (an increase there is "money added"); Expenses never glows, even though its value going up is extremely common, because that's money going *out*, not in. `RevealAmount.js` gained an `onRevealChange` callback so `StatCard` knows when its number is currently un-blurred and force-suppresses the glow (`showGlow = glowing && !revealed`) while it's showing — the point of the glow is to catch your eye before you're already looking at the number.

**Color direction settled: green / red / (yellow).** Two rounds of picking colors landed nowhere — first pass (violet+blue) got "I don't see any differences, I don't like either," second pass (5 CSS-variable variants incl. amber/warm-neutral options closer to a reference screenshot) got "I just don't like these looks," which is what prompted the Tailwind ask in the first place. Once in Tailwind, the *first* accent choice (violet, reusing the earlier work) was also flagged ("don't like the purple and blue badges" — the Gigs/Expenses toggle). The user then explicitly said to stop trying colors and just use green/red/(yellow) — which happens to collapse cleanly onto the semantic status colors already in the system (paid=good=green, critical=red, pending=warning=yellow), so there's now a single accent instead of a separate "brand" hue distinct from status. `tailwind.config.js`'s `brand` token (green, `#22d17e`) and `ledger.css`'s `--accent`/`--accent2` (now identical, same green, same hex) are kept deliberately in sync — **if the exact green ever changes, update both places.** `--warning` nudged from amber (`#ffb443`) to a truer yellow (`#eab308`). Deleted the now-fully-superseded `?palette=1..5` comparison system entirely (`PaletteRoot.js`, the `[data-palette="N"]` CSS blocks, the `Suspense`/searchParams wrapper in `layout.js`) rather than let it linger — the back-and-forth on this made clear more color options weren't the fix, picking one and moving on was.

**Not yet migrated** (still on the old `.ldg-*` CSS system, will look visually inconsistent against the migrated sidebar/stat-cards until done): the Gigs/Expenses lists and their forms (`DashboardSections.js`, `GigEntry.js`, `ExpenseLine.js`, `GigForm.js`, `ExpenseForm.js`, `MonthSection.js`), `ConfirmModal.js`/`ReceiptLightbox.js`, `report/page.js` + its charts, `tips/page.js` + its calculator cards, `security/page.js`, `login/page.js`. Continue the same pattern per file: replace the component's JSX classNames with Tailwind utilities against the `brand`/`ink` theme scale, delete the now-unused `.ldg-*` rules from `ledger.css` once nothing references them (grep first — several are shared across files), rebuild, check in a real browser before moving to the next file. Get sign-off on the direction (this is a first look) before doing the rest mechanically.
**Dashboard tab title/icon:** the `/dashboard/*` section's browser tab reads "Dashboard" (was "Ledger" — the internal name never made it into the sidebar, which already said Dashboard) and has its own favicon, `app/dashboard/icon.svg` (a static SVG, not `next/og`'s dynamic `ImageResponse` — that failed to prerender locally on a font-loading `Invalid URL` error), using the same purple→pink gradient as the active sidebar nav item so the tab is recognizable among other open tabs.

**Receipt-photo AI scan:** `app/api/ledger/analyze-receipt/route.js` uploads the photo to Cloudflare R2 (bucket `portfoliomedia`, under `receipts/`, **not publicly accessible** — unlike the site's videos, receipts are only ever served via a short-lived signed URL from `app/api/ledger/receipt/route.js`, generated by `app/dashboard/r2.js`) and sends it to Claude (`claude-sonnet-5` — upgraded from Haiku after it was misreading receipts, e.g. dumping full verbose product titles into item names) with a JSON-schema structured output for reliable parsing. Tax/shipping are not returned as their own items — Claude extracts them as separate `tax`/`shipping` numbers (no math asked of it) and the route code (`allocateExtraCharges`, integer-cents math so nothing drifts) splits them proportionally into each item's amount server-side, since sales tax/shipping count toward an item's cost basis for the $2,500 capital-asset threshold below. (Originally had Claude do this split itself inside the same response that lists items — on at least one real receipt it silently dropped a second item while doing that arithmetic, so the split was moved out of the model and into plain code.) Returns `{ vendor, date, items[] }`, which the client uses to fill the form — always left for the user to review before submitting, never auto-submitted. Needs `ANTHROPIC_API_KEY`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`, `R2_BUCKET_NAME` (all set in Vercel + `.env.local`).

**Security:** password gate via `middleware.js` (Edge, Web Crypto SHA-256 session cookie) on `/dashboard/**` and `/api/ledger/**`. Login lockout: 3 failed attempts (first + 2 more) → 10-minute block, tracked per-IP in Postgres (`login_security`, `login_lockout_log` tables), enforced on both the `/dashboard/login` page and the hidden popover's `/api/ledger/login` route.

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
| Cloudflare R2 | Video + homepage video hosting (public), + ledger receipt photos (private) | Videos: `https://pub-095a05fb51af4a3b83d5e05b40b59ff4.r2.dev/[filename]`. Receipts: bucket `portfoliomedia`, prefix `receipts/`, no public URL — served via signed URLs only, S3-compatible access via `R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/`R2_ACCOUNT_ID`/`R2_BUCKET_NAME` |
| Formspree | Contact form emails | `https://formspree.io/f/xzdlroyr` |
| Vercel | Hosting | Auto-deploys from `main` |
| Cloudflare Registrar | Domain registration + DNS | `navinng.com` |
| Neon Postgres | Ledger database | Via Vercel Marketplace integration, project `neon-aureolin-plank` |
| Nominatim + OSRM | Free geocoding/routing for mileage calc | No API key, public services — fine for personal, occasional lookups |
| Anthropic API | Ledger receipt-photo scanning | `ANTHROPIC_API_KEY`, model `claude-sonnet-5`, structured JSON output |

## Adding New Videos

1. If HEVC (iPhone video): re-encode with ffmpeg: `ffmpeg -i input.mp4 -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 192k -movflags +faststart output.mp4`
2. To trim: `ffmpeg -ss [start] -to [end] -i input.mp4 -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 192k -movflags +faststart output.mp4` (omit `-to` to go to end)
3. Upload to Cloudflare R2
4. Add to `eventVideos` or `musicVideos` array in `app/videos/page.js`
5. Push to git

## Things Left To Do

- [ ] Add real music videos to the Music section on the Videos page (currently only event footage)
- [ ] Ledger: re-enter real gig/expense data (database was cleared for a fresh start)
- [ ] **Idea, not started:** AI chatbot "personal financial advisor" in the ledger — a chat interface that can see a summary of your gig/expense data and answer questions conversationally. Cost is low for personal use (a few dollars/month at most, chatting a few times a week) as long as it's fed a compact data summary per message rather than the full transaction history, and uses Sonnet 5 rather than Opus 5 for the quality/cost balance. Revisit when there's time to build it properly.

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
- Confirmed `npm run dev` → localhost:3000 works cleanly for previewing `/ledger` changes without deploying (no code changes made this session)

### Session 10 — 2026-07-30 (Ledger: edit/delete, bulk entry, tax hints)
- Added **Edit** and **Delete** to every gig and expense line (`GigForm.js`/`ExpenseForm.js` extracted as shared add/edit form components; `GigEntry.js`/`ExpenseLine.js` render the row + inline edit toggle + confirm-before-delete). Deleting a gig unlinks (doesn't delete) its expenses.
- Add Gig / Add Expense now clear all fields and show a green "ADDED" toast (bottom-center, ~1.8s) after a successful submit, so it's obvious an entry went through and you don't double-add.
- **Meals** and **Supplies & equipment** support bulk entry — repeatable rows so a multi-item receipt logs as several expense lines in one submit.
- **Insurance** category redesigned: no separate date field (Effective start date doubles as the expense date), Billing frequency Monthly/Annual, Effective end date only shown for Monthly — Annual auto-computes it as start + 12 months.
- Added a **Capital asset** checkbox on Supplies items (auto-suggested once amount > $2,500) so big equipment purchases are flagged for the tax preparer instead of blending into ordinary supplies; shows in the expense summary line and the CSV Details column.
- Added short tax-education hints under the category dropdown for all 10 expense categories (multi-day trip meal/lodging rules, health insurance ≠ Schedule C, home office is a separate Form 8829 deduction, $2,500 capital-asset line + Section 179, $25 client-gift cap, clothing-deductibility rule, etc.) — general education, not professional advice.
- `categories.js`'s per-category `extraField` (singular) generalized to `extraFields` (array), now supporting `select` and `checkbox` field types in addition to text/number/date.
- Caught and fixed a self-inflicted issue: running `next build` while `npm run dev` was still live corrupted the dev server's `.next` folder (500s on every asset) — stop the dev server (or use a separate `.next` dir) before running a production build alongside it.
- All dollar amounts (dashboard stat cards, report, donut/bar charts, reminders) now render with thousands separators via a shared `app/dashboard/format.js` `formatMoney()` helper. CSV export intentionally left as plain numbers (commas there would break spreadsheet parsing).
- Renamed the hidden entry button to "ADMIN ACCESS" and moved it to bottom-right (smaller, tighter to the corner) from its original bottom-left "owner access" spot.
- Tried adding a username requirement (+ a "remember username on this device" checkbox) to the admin login — built it end-to-end, then reverted it same-session per instruction; login is back to password-only. `LEDGER_USERNAME` env var was added then removed from Vercel (all 3 environments) — don't be surprised it's referenced in old commit history but isn't live.
- **Renamed the tool's URL from `/ledger` to `/dashboard`** — moved `app/ledger/` → `app/dashboard/` (`git mv`), updated `middleware.js`'s matcher/redirects, all `redirect()`/`revalidatePath()` calls in `actions.js`, sidebar links in `LedgerShell.js`, the admin-access popover's redirect, and the cross-folder relative imports in `app/api/ledger/*/route.js` (those still pointed at `../../../ledger/...`, now `../../../dashboard/...`). The `/api/ledger/**` API path and all internal file/component/CSS-class names were deliberately left as "ledger" — only the page URL changed.

### Session 12 — 2026-07-30 (Receipt upload: allow photo library; styled delete confirmation)
- Fixed `app/dashboard/ExpenseForm.js`'s receipt photo `<input type="file">`: it had `capture="environment"`, which on mobile browsers forces the camera app to open directly and skips the normal file picker (so there was no way to pick an existing photo from the library). Removed `capture` — mobile now shows the native chooser (camera or photo library) like a normal file input.
- Replaced the native browser `confirm()` popup used when deleting a gig or expense (looked out of place against the dashboard's dark theme) with a proper in-app modal: new `app/dashboard/ConfirmModal.js`, styled to match the existing card/button/gradient system (`.ldg-modal-overlay`/`.ldg-modal`/`.ldg-btn-danger` etc. added to `ledger.css`), closes on Escape or backdrop click. `GigEntry.js`/`ExpenseLine.js` delete buttons changed from `type="submit"` (with a `confirm()` call in the click handler) to `type="button"` that opens the modal; confirming calls `formRef.current.requestSubmit()` to actually run the delete server action.

### Session 13 — 2026-07-30 (Receipt reader overhaul, combined-cart expenses, expandable rows, multi-photo scan)
- **Receipt reader was misreading receipts** — reported via a real receipt (NiSi filter kit) where the item description was the full verbose product title and the amount didn't clearly show which item it was. Fixed in stages: upgraded `claude-haiku-4-5` → `claude-sonnet-5`; had the model write short summarized item names instead of verbatim titles; found and fixed a real mobile CSS bug where the item-name field was being squeezed to an unreadable sliver next to the amount/checkbox/Remove controls (`.ldg-meal-row` flex layout). Renamed the Supplies vendor field label to "Brand/Vendor".
- **Tax/shipping allocation moved out of the model and into code.** Originally had Claude both list every item *and* proportionally fold tax/shipping into each item's amount in the same response — on a real 2-item receipt it silently dropped the second item while doing that arithmetic (confirmed via a direct read-only DB query: the one saved row's amount matched the tax-inclusive cost of item 1 exactly, item 2 never appeared). Claude now only extracts raw items + separate `tax`/`shipping` numbers; `allocateExtraCharges()` in `analyze-receipt/route.js` does the proportional split deterministically in integer cents so nothing can drift or vanish.
- **Receipt photo is now clickable to view full-size** — new `ReceiptLightbox.js` (reuses `.ldg-modal-overlay`), from both the upload form and an already-saved entry.
- **Gig/expense rows are now expandable on click** (chevron indicator, Enter/Space also works) to reveal fields that existed but were never shown on screen — payment method/date paid for gigs; description, recurring flag, linked gig, and receipt view for expenses. Only shows the chevron when there's actually something to reveal.
- **Multi-item Supplies purchases are now one expense, not one row per item.** Explicitly chosen over the alternative (separate row per item) after discussion — a cart checked out together should log as one deduction. Stores an itemized `meta.items = [{ name, amount, capitalAsset }]` array (`collectSupplyItems()` in `actions.js`, used by both add and edit) instead of splitting into separate rows; each item keeps its own capital-asset flag so the $2,500 threshold is still checked per item, not against the blended total. The itemized breakdown shows via the new expandable-row feature; CSV export lists every item+amount+flag for multi-item entries instead of the on-screen "N items" summary, so the tax preparer still sees everything.
- **Receipt-photo scan extended to every category except Insurance** (was just Meals/Supplies) — single-item categories get vendor/date/amount filled and item names folded into the description field.
- **Multi-photo scan with an explicit Scan button** — picking photos no longer scans immediately; they sit as removable local previews until "Scan N photos" is clicked, so an accidental pick doesn't burn an API call. The file input takes multiple photos, sent together as one receipt (e.g. a long receipt shot in parts) in one request; `receiptKeys[]` replaces the old singular `receiptKey`, first key still lands in the legacy `receipt_url` column, full list in `meta.receiptKeys` when there's more than one.
- Renamed the `/dashboard/*` browser tab title "Ledger" → "Dashboard" (matches the sidebar) and gave it a favicon (`app/dashboard/icon.svg`, static — `next/og`'s dynamic `ImageResponse` failed to prerender locally on a font-loading error) using the sidebar's active-link gradient. Caught and fixed a real bug from this: the favicon path matched the `/dashboard/:path*` auth middleware and was getting 307'd to the login page, so it silently never rendered — added it to `middleware.js`'s allowlist alongside `/dashboard/login`.
- Deployment verified live each time via direct checks (not just "should be fine"): pulled the deployed CSS bundle from navinng.com and grepped for new class names, queried the Neon DB directly (read-only) to confirm real data matched expectations, and polled the aliased deployment's `readyState` — caught the favicon middleware bug this way before declaring it done.

### Session 11 — 2026-07-30 (Receipt-photo AI scan, recurring expenses, tax calculators, dashboard reorg, more radiance)
- Login page brand changed from `[LEDGER]` to `[PRIVATE ACCESS]`.
- Fixed a real print bug: the Schedule-C summary card could get sliced across a page break in `/dashboard/report` → Print. Added `page-break-inside: avoid` alongside `break-inside: avoid` (Chrome print pagination doesn't always honor the modern property alone) plus an `@page` margin rule. Also removed the donut/bar charts from the printed report entirely (`ldg-no-print` on the chart grid) — the printed copy for a tax preparer is just numbers now.
- Added two more report charts (screen-only, still excluded from print): **Income by gig type** (donut, reuses `CategoryDonut`) and **Net by month** (12-bar version of the quarterly chart, reuses `QuarterBars`). `GIG_TYPES` in `categories.js` gained a `chartColor` per type matching the existing gig-type badge colors.
- **Dashboard reorganized:** the always-visible "Gigs" list and "General expenses" section, plus the separate "+ Add gig"/"+ Add expense" toggle row, were collapsed into two boxes — click **"Gigs"** or **"Expenses"** to expand a box containing that list *and* its own "+ Add" button/form inside. New component `app/dashboard/DashboardSections.js` replaced the old `AddForms.js` (deleted) plus the inline list JSX that used to live in `page.js`. Inside each box, the "+ Add" button/form is now centered instead of left-aligned, with margin so it's not touching the list below it (`.ldg-box-add` CSS).
- **Receipt-photo AI scan (Supplies & equipment, then extended to Meals):** an optional "Receipt Photo (optional)" file input analyzes the photo via Claude (`claude-haiku-4-5`, chosen for cost — extraction is a simple bounded task, not worth Opus-tier pricing) using structured outputs (`output_config.format` with a JSON schema) so the response is always valid JSON, no regex parsing. New route `app/api/ledger/analyze-receipt/route.js` uploads the image to Cloudflare R2 (bucket `portfoliomedia`, same bucket as the site's videos but under a `receipts/` prefix, uploaded **without public access** — receipts are tax documents, so they're only reachable via a short-lived signed URL from `app/api/ledger/receipt/route.js`, not the same public `pub-...r2.dev` URL the videos use) and returns extracted `{ vendor, date, items[] }` alongside the R2 object key. On the client, extracted fields populate the form (via refs for uncontrolled inputs, or replacing bulk-row state) for the user to review — **never auto-submitted**. For Supplies bulk-add, multiple extracted line items become multiple item rows; for Meals, all items on one receipt are summed into a single meal row (a receipt is one meal transaction, not itemized-separately-deductible line items). New `app/dashboard/r2.js` wraps `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`. New env vars (Vercel all 3 environments + `.env.local`): `ANTHROPIC_API_KEY`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`. New `expenses.receipt_url` column stores the R2 **object key**, not a URL (name is a holdover from before the private-bucket decision).
- **Recurring monthly expense tracking:** a "Recurring monthly expense" checkbox on any non-bulk expense (e.g. software subscriptions). New `expenses.recurring_monthly` column. `taxTips.js`'s `missingRecurringExpenses()` flags a vendor in the Reminders banner if it's ever been marked recurring but has gone 2+ months (current + prior, to avoid early-month false alarms) with nothing logged for it — "did you forget to log it, or cancel it?"
- **Quarterly estimated tax calculator** (`/dashboard/tips`, `EstimatedTaxCard.js`): computes YTD net profit (calendar-year-to-date gigs minus expenses minus mileage deduction, via `taxTips.js`'s `ytdNetProfit()`) and multiplies by an adjustable rate (default 27%, the common self-employed rule-of-thumb midpoint) to suggest how much should be set aside so far this year. Deliberately a flat-rate estimate, not real SE-tax/bracket math — disclaimed as such.
- **Home office deduction calculator** (`/dashboard/tips`, `HomeOfficeCard.js`): pure client-side, no persistence — enter office sq ft, total home sq ft, and estimated annual home costs, and it shows both the simplified method ($5/sq ft, capped at 300 sq ft = $1,500 max) and the regular method (business-use % × home costs) side by side so you can see which is bigger.
- Saved a not-yet-built idea to "Things Left To Do": an AI chatbot "personal financial advisor" inside the ledger — cost estimated at a few dollars/month for personal use if fed a compact data summary per message (not full history) on Sonnet 5.
- **More visual "radiance"/glow pass** (inspired by a reference fitness-dashboard screenshot): added colored ambient glow shadows to the shell, stat cards (each in its own gradient's hue), sidebar active link, gradient buttons, the "ADDED" toast, and the donut/bar charts (`filter: drop-shadow(...)`). Then a second pass replaced several flat single-color backgrounds (`.ldg-sidebar`, `.ldg-main`, `.ldg-card`, `.ldg-form`, `.ldg-entry`, `.ldg-login-box`) with subtle gradients/radial color washes — the flat panels were the actual reason the dashboard read as "boring/solid color," not the small accent areas.

