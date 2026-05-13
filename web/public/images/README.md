# Required SEO / Social Preview Assets

The site's metadata (`web/lib/site.ts`) references the following files.
Drop them in at the listed paths — every URL below is **relative to `web/public/`**, so a file at `web/public/images/favicon.ico` is served as `/images/favicon.ico`.

All files marked **required** must exist before deploying to production, otherwise social previews and favicons will 404 silently.

## Favicons & app icons

| File | Path | Size | Format | Required |
|---|---|---|---|---|
| Browser favicon | `images/favicon.ico` | 32×32 (multi-resolution `.ico`) | ICO | ✅ |
| Apple touch icon | `images/icons/apple-touch-icon.png` | 180×180 | PNG | ✅ |
| PWA icon (small) | `images/icons/icon-192.png` | 192×192 | PNG | ✅ |
| PWA icon (large) | `images/icons/icon-512.png` | 512×512 | PNG | ✅ |
| PWA maskable icon | `images/icons/icon-512-maskable.png` | 512×512 (safe zone padding) | PNG | ✅ |

> **Maskable icon tip:** keep the visual mark inside the centre 80% — Android applies circular/squircle masks.

## Open Graph / Twitter preview image

| File | Path | Size | Format | Required |
|---|---|---|---|---|
| Default OG image | `images/og/og-default.png` | **1200×630** (1.91:1) | PNG or JPG | ✅ |

- Used for WhatsApp, Facebook, LinkedIn, Discord, Slack, X/Twitter.
- Keep the file under **~5 MB** — LinkedIn rejects larger.
- Avoid text smaller than ~24 px equivalent — most platforms downscale to ~600×315.
- A per-issue cover can override this via the page's `generateMetadata` (already wired for `/issue/[slug]` and `/issue-1`).

## Brand logo (already in repo)

- `images/logo.jpg` — used in `Organization` JSON-LD and PWA splash fallback.

## Generating from a single source

If you have a single high-resolution square logo + a horizontal hero, the easiest pipeline is:

```bash
# Favicon + PWA icons (using ImageMagick)
magick logo-square.png -resize 32x32 images/favicon.ico
magick logo-square.png -resize 180x180 images/icons/apple-touch-icon.png
magick logo-square.png -resize 192x192 images/icons/icon-192.png
magick logo-square.png -resize 512x512 images/icons/icon-512.png

# OG image — pad/crop a 1200x630 canvas with brand background
magick hero.jpg -resize 1200x630^ -gravity center -extent 1200x630 images/og/og-default.png
```

Or use **<https://realfavicongenerator.net/>** — it produces every size from one upload.

## Validating after deploy

1. **Facebook / WhatsApp / LinkedIn** — <https://developers.facebook.com/tools/debug/> · paste production URL · click **Scrape Again** (FB caches forever).
2. **LinkedIn-specific** — <https://www.linkedin.com/post-inspector/>
3. **X / Twitter** — <https://cards-dev.twitter.com/validator> *(legacy)* or just post the URL to a draft tweet to preview.
4. **Discord / Slack** — paste the URL into a private channel; they hit OG tags directly.
5. **Google Rich Results** — <https://search.google.com/test/rich-results> verifies the WebSite + Article JSON-LD.
6. **PWA manifest** — Chrome DevTools → Application → Manifest.

If a platform shows a stale preview, use its debugger's "Scrape Again" / "Re-fetch" — most cache OG tags for 24–48h.
