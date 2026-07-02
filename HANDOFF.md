# Navin Nguyen Portfolio — Handoff

## File Structure

```
portfolio/
├── app/
│   ├── layout.js              # Root layout — fonts (Inter), metadata
│   ├── globals.css            # All styles (single CSS file)
│   ├── page.js                # Homepage — full-screen video bg, nav
│   ├── components/
│   │   └── PageFade.js        # Fade-in wrapper used by all 4 pages
│   ├── photos/page.js         # Photos page — carousels (Music + Life sections)
│   ├── videos/page.js         # Videos page — Music section with real videos
│   └── contact/page.js        # Contact page — Formspree form (working)
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
- **Design direction (important):** user prefers a strictly monochrome look. Custom cursor and accent-color hover states were tried this session and explicitly rejected/removed — do not re-add a colored accent or custom cursor without being asked again.

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
- **Production URLs:** `https://navinnguyen.vercel.app` and custom domain `https://navinng.com`
- **Deploy method:** Push to `main` branch — Vercel auto-deploys
- **Vercel alias quirk:** `navinnguyen.vercel.app` must be manually re-pointed after each deploy via `vercel alias set [latest-url] navinnguyen.vercel.app` (see `deploy.ps1`). The custom domain `navinng.com` is a normal Vercel custom domain and should auto-follow production without manual steps — not yet double-checked after a deploy, worth confirming next session.
- **navinng.com DNS:** registered + DNS managed on Cloudflare. Records: `A @ → 76.76.21.21` and `CNAME www → cname.vercel-dns.com`, both set to "DNS only" (grey cloud, proxy off). Vercel also offered an optional CNAME-flattening upgrade (not applied — current setup already works fine).

## Services

| Service | Purpose | Details |
|---|---|---|
| Cloudflare R2 | Video + homepage video hosting | `https://pub-095a05fb51af4a3b83d5e05b40b59ff4.r2.dev/[filename]` |
| Formspree | Contact form emails | `https://formspree.io/f/xzdlroyr` |
| Vercel | Hosting | Auto-deploys from `main` |
| Cloudflare Registrar | Domain registration + DNS | `navinng.com` |

## Adding New Videos

1. If HEVC (iPhone video): re-encode with ffmpeg: `ffmpeg -i input.mp4 -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 192k -movflags +faststart output.mp4`
2. To trim: `ffmpeg -ss [start] -to [end] -i input.mp4 -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 192k -movflags +faststart output.mp4` (omit `-to` to go to end)
3. Upload to Cloudflare R2
4. Add to `eventVideos` or `musicVideos` array in `app/videos/page.js`
5. Push to git

## Things Left To Do

- [ ] Add real music videos to the Music section on the Videos page (currently only event footage)
- [ ] Confirm `navinng.com` auto-updates on the next deploy without needing a manual alias step

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
- Iterated on "make the site pop more": tried and then **removed** scroll-in reveal animations (user found them not visible / didn't want them), a warm gold accent color on hover states (removed everywhere), and two different custom cursor designs (viewfinder brackets, then dot+trailing ring — both ultimately removed). Net result: site remains fully monochrome, no custom cursor.
- Made all Photos/Videos section titles ("Music", "Life") the same fixed color/opacity instead of dimming inactive ones
- Made photo and video lightboxes fully opaque black (was a 96%-opacity near-black) so only the image/video + arrows show
- Added `PageFade` component — Home, Photos, Videos, and Contact now fade in on mount instead of appearing instantly
- Deployed all of the above; both `navinnguyen.vercel.app` and `navinng.com` are live and up to date
- User asked to hold off deploying mid-session while reviewing changes on `localhost:3000` — did several rounds of changes locally before getting the final go-ahead to deploy
