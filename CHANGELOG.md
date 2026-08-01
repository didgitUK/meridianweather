# Changelog

All notable product changes for Meridian Weather (`meridianweather.co.uk`).  
Format: keep newest first. Dates are UTC calendar days of ship/merge.

## [Unreleased]

_(nothing pending after the 2026-07-30 AdSense content ship)_

## 2026-07-30 — AdSense low-value remediation + editorial core

**Why:** Google AdSense rejected the site for **Low value content** (thin / auto-generated / doorway patterns). Live stub place-guides had repeated filler and inflated the sitemap.

### Product / SEO
- Added public **`/about`** and **`/faq`** pages; footer links + visible home intro (no longer `sr-only`-only).
- Expanded Journal to **19** original posts (UK weather reading, product honesty, consent/ads).
- Hot UK place pages get unique regional blurbs (`place-editorial-blurbs`); removed keyword-stuffed SEO bridge copy.
- Sitemap is **dynamic** and limited to **`en` / `en-GB`**; stub `/guides/` URLs removed from the indexable surface.
- POI pages and cold (tier ≥ 3) weather places send **`noindex`**; operator docs (`deployment`, `api-limits`, `api-reference`, `monetization`) noindex + out of sitemap.

### Place guides pipeline
- Stub / repeated-filler bodies **fail validation** and **never auto-publish** (draft + admin publish only).
- Scripts: `npm run unpublish:stub-guides`, `npm run unpublish:all-guides`.
- Host: unpublished all published guides; prefer `PLACE_CONTENT_LLM_MODE=gemini` (never leave stub published).

### Ops / docs
- [`docs/ADSENSE-CONTENT-REVIEW.md`](docs/ADSENSE-CONTENT-REVIEW.md) — checklist before AdSense Request review.
- ADR-018 updated: no auto-publish of guides.
- LiveDNS: `www` no longer intentionally parked (see OPS-RUNBOOK — Starter hosting still allows only one vhost, so `www` HTTPS may return vhost unknown until upgraded).

**PR:** https://github.com/didgitUK/meridianweather/pull/7

## 2026-07-21 — Place content, PWA, hero theater

- Place content Phase 1: OSM Things to do, LLM/stub guides, admin publish/lock.
- PWA install / offline / optional Web Push daily refresh.
- Hero weather theater (24h scrub on satellite map).
- Signed consent cookie hardening.

**PR:** https://github.com/didgitUK/meridianweather/pull/5

## 2026-07-20 — Live catch-up, UK places, Stripe

- Gandi Simple Hosting live, AdSense verification meta, UK `/weather/{slug}` Phase A/B.
- Place SEO budget tiers, mobile search sheet + bottom nav.
- Stripe ad-free checkout (env-gated).

**PRs:** https://github.com/didgitUK/meridianweather/pull/1 and follow-ups through #6
