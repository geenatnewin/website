# Navin Nguyen Portfolio — Handoff

## File Structure

```
portfolio/
├── navin-nguyen-portfolio_11.html   # Main site (single file)
├── HANDOFF.md                       # This file
└── media/
    ├── pics/                        # Photo assets (empty — add your images here)
    └── videos/
        ├── date2.mp4                # Homepage background video (active)
        └── edchorizontal.mp4        # Alternate video (not currently used)
```

## Current State

- **Homepage** — Full-screen video background (`date2.mp4`), dark overlay, centered nav with four words: Photos, Videos, Instagram, Contact. Hovering dims words to 70% opacity.
- **Photos page** — Masonry grid layout. Placeholder tiles only — no real images added yet.
- **Videos page** — 2-column grid layout. Placeholder tiles only — no real videos added yet.
- **Contact page** — Email (`inavinnguyen@gmail.com`) and Instagram (`ng.navin`) listed. "Get in touch" form is a **fake form** (simulates send, does not deliver emails).

## Things Left To Do

- [ ] Add real photos to the Photos page (replace `<div class="media-placeholder">` with `<img src="...">`)
- [ ] Add real videos/thumbnails to the Videos page
- [ ] Wire up the contact form to actually send emails (Formspree account already created at `https://formspree.io/f/xzdlroyr` — just needs to be connected)
- [ ] Host the site online (recommended: Netlify free tier + custom domain ~$12/yr via Namecheap)
- [ ] Decide on a hover effect for the homepage nav words

## How to Connect the Contact Form (Formspree)

A Formspree account has already been created at `https://formspree.io/f/xzdlroyr`. To activate it:

1. Add `name` attributes to the form inputs in the HTML
2. Replace the fake `handleSubmit` timeout with a real `fetch` POST to the endpoint
3. The first submission will trigger a confirmation email from Formspree

## Notes

- The site is a **single HTML file** — no build tools, no dependencies, no server needed. Open in Chrome to preview.
- The homepage video (`date2.mp4`) is 608MB — keep this in mind for hosting (Netlify free tier has a 100MB file limit; you may need to compress the video or host it separately e.g. via Cloudflare R2 or Vimeo embed).
- `edchorizontal.mp4` did not display in Chrome during testing — likely a codec issue (possibly H.265). Re-export as H.264 if you want to use it.
