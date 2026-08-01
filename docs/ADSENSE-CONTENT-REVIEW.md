# AdSense content review — Meridian

## Status

Google AdSense rejected **meridianweather.co.uk** for **Low value content** (thin / auto-generated patterns). Code + host remediation shipped **2026-07-30** (PR #7). Search Console sitemap **`https://meridianweather.co.uk/sitemap.xml`** discovered (manual Index submission, 2026-08-01). Wait for the ~700+ sitemap URLs to finish indexing, then AdSense **Request review**.

GEO surface (`/llms.txt`, `/llms-full.txt`, `/llms/*`) ships with the 2026-08-01 SEO/GEO PR — public pages only.

## Root cause (confirmed)

- Published **stub** place guides with repeated filler (“rewards a paced visit…”) in the sitemap (~1,400 guide URLs across locales).
- Near-identical `/weather/{slug}` templates plus keyword “SEO bridge” copy.
- Thin editorial surface (few journal posts, no About/FAQ).
- Extra thin URLs (POI pages, cold/geocode places, non-English chrome over English weather).

## Code fixes shipped

- Stub guides fail `validatePlaceArticle`; pipeline **never auto-publishes** (draft + admin publish).
- `npm run unpublish:stub-guides` / `unpublish:all-guides`
- POI pages `noindex`; tier ≥ 3 places `noindex`
- Sitemap + hreflang limited to `en` / `en-GB`
- Operator docs (`deployment`, `api-limits`, `api-reference`, `monetization`) `noindex` + out of sitemap
- `/about`, `/faq`, expanded Journal (≥15 posts), footer links, visible home intro
- Hot-place editorial blurbs; neutral `weatherPlaceBridge` copy
- GEO: `/llms.txt`, `/llms-full.txt`, `/llms/*`, `/ai.txt`, `/.well-known/llms.txt` — see [`docs/GEO.md`](GEO.md)

## Operator checklist before Request review

1. Deploy latest `main` to Gandi (GitHub push first).
2. On host DB: `npm run unpublish:all-guides` (if any guides reappear).
3. On host DB: `npm run reset:cms-public` after docs/legal file updates (HTML ↔ GEO alignment).
4. Env: `PLACE_CONTENT_LLM_MODE=gemini` + key, **or** leave guides unpublished (never `stub` published).
5. Verify:
   ```bash
   curl -sL 'https://meridianweather.co.uk/weather/auchterarder/guides/weather-weekend-planner' | rg -c 'rewards a paced visit' || true
   # expect 404 or 0 matches
   curl -sL 'https://meridianweather.co.uk/sitemap.xml' | rg -c '/guides/' || true
   # expect 0 (or only human-approved)
   curl -sI 'https://meridianweather.co.uk/about' | head -1
   curl -sI 'https://meridianweather.co.uk/faq' | head -1
   curl -sS 'https://meridianweather.co.uk/llms.txt' | head -5
   curl -sS 'https://meridianweather.co.uk/ai.txt' | head -5
   ```
6. Search Console → sitemap submitted ✓ → wait for index coverage of `/about`, journal, `/weather/london`, etc.
7. AdSense → Sites → confirm issues fixed → **Request review**. Do not resubmit while a review is open.

## Notes for the review

- Unique editorial: About, FAQ, Journal guides on reading UK weather and product honesty.
- Weather place pages: live OpenWeather + original regional blurbs on top cities; no stub guides.
- Ads remain consent-gated (ADR-008).
