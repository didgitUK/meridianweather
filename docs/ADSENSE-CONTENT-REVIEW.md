# AdSense content review — Meridian

## Status

Google AdSense rejected **meridianweather.co.uk** for **Low value content** (thin / auto-generated patterns). Do **not** click Request review until the checklist below is green on **live**.

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

## Operator checklist before Request review

1. Deploy this build to Gandi (GitHub push first).
2. On host DB: `npm run unpublish:all-guides`
3. Env: `PLACE_CONTENT_LLM_MODE=gemini` + key, **or** leave guides unpublished (never `stub` published).
4. Verify:
   ```bash
   curl -sL 'https://meridianweather.co.uk/weather/auchterarder/guides/weather-weekend-planner' | rg -c 'rewards a paced visit' || true
   # expect 404 or 0 matches
   curl -sL 'https://meridianweather.co.uk/sitemap.xml' | rg -c '/guides/' || true
   # expect 0 (or only human-approved)
   curl -sI 'https://meridianweather.co.uk/about' | head -1
   curl -sI 'https://meridianweather.co.uk/faq' | head -1
   ```
5. Search Console → Manual actions (should be clean) → URL Inspection on `/about`, 2 journal URLs, `/weather/london` → Request indexing.
6. Wait until stub guide URLs leave Google’s index (often several days).
7. AdSense → Sites → confirm issues fixed → **Request review**. Do not resubmit while a review is open.

## Notes for the review

- Unique editorial: About, FAQ, Journal guides on reading UK weather and product honesty.
- Weather place pages: live OpenWeather + original regional blurbs on top cities; no stub guides.
- Ads remain consent-gated (ADR-008).
