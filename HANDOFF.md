# Navin Nguyen Portfolio — Handoff

## File Structure

```
portfolio/
├── app/
│   ├── layout.js              # Root layout — fonts (Inter), metadata
│   ├── globals.css            # All styles (single CSS file)
│   ├── page.js                # Homepage — full-screen video bg, nav
│   ├── photos/page.js         # Photos page — carousel (Event + Life sections)
│   ├── videos/page.js         # Videos page — Event + Music sections with real videos
│   └── contact/page.js        # Contact page — Formspree form (working)
├── public/
│   ├── fonts/
│   │   ├── Moonhouse.ttf          # Current nav font
│   │   ├── SuperSunshine.ttf      # Unused
│   │   └── KabisatDemo-ItalicTall.ttf  # Unused
│   └── media/pics/
│       ├── LIFE/              # 9 life photos
│       └── MUSIC/             # 34 event photos
├── media/
│   └── videos/events/
│       ├── web/               # H.264 re-encoded + trimmed versions (upload these to R2)
│       │   ├── akilla.mp4     # Trimmed 13s–26s
│       │   └── another.mp4    # Trimmed from 18.5s to end (uploaded as akilla2.mp4 on R2)
│       └── *.mp4              # Original HEVC source files
├── vercel.json                # Sets navinnguyen.vercel.app as alias
├── HANDOFF.md                 # This file
├── package.json               # Next.js 14
└── next.config.js
```

## Current State

- **Homepage** — Full-screen video (Cloudflare R2: `vcftest.mp4`). Nav: Photos, Videos, Instagram, Contact. Font: Moonhouse, `scaleX(1.4)` horizontal stretch, `0.06em` letter spacing. Resting blur: `0.35px` desktop, none on mobile. Hover: `invert(1) blur(2px)`. Desktop autoplays, mobile shows first frame frozen then plays on touch.
- **Photos page** — Two carousels: **Event** (34 photos, top) and **Life** (9 photos, bottom). Arrow key + click navigation, lightbox on click.
- **Videos page** — Two sections: **Event** (7 videos) and **Music** (empty, "Coming soon"). Videos stream from Cloudflare R2. Click to open fullscreen player.
- **Contact page** — Wired to Formspree (`https://formspree.io/f/xzdlroyr`). Working.
- **Instagram** — Wired to `ng.navin`.

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
- **Production URL:** `https://navinnguyen.vercel.app`
- **Deploy method:** Push to `main` branch — Vercel auto-deploys
- **Always deploy after every change** (user preference)

### Current live state

All 7 event videos are live including PALACIO II, AKILLA, AKILLA II (deployed 2026-06-30).

## Services

| Service | Purpose | Details |
|---|---|---|
| Cloudflare R2 | Video + homepage video hosting | `https://pub-095a05fb51af4a3b83d5e05b40b59ff4.r2.dev/[filename]` |
| Formspree | Contact form emails | `https://formspree.io/f/xzdlroyr` |
| Vercel | Hosting | Auto-deploys from `main` |

## Adding New Videos

1. If HEVC (iPhone video): re-encode with ffmpeg: `ffmpeg -i input.mp4 -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 192k -movflags +faststart output.mp4`
2. To trim: `ffmpeg -ss [start] -to [end] -i input.mp4 -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 192k -movflags +faststart output.mp4` (omit `-to` to go to end)
3. Upload to Cloudflare R2
4. Add to `eventVideos` or `musicVideos` array in `app/videos/page.js`
5. Push to git

## Things Left To Do

- [x] Deploy pending videos (PALACIO II, AKILLA, AKILLA II) — done 2026-06-30
- [ ] Add real music videos to Music section on Videos page
- [ ] Optional: custom domain (~$10/yr via Namecheap)

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
