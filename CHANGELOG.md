# Changelog

All notable product changes for Meridian Weather (`meridianweather.co.uk`).  
Format: keep newest first. Dates are UTC calendar days of ship/merge.

## [Unreleased]

## 2026-08-01 — GEO llms.txt surface + public docs alignment

**Why:** Ship a proper Generative Engine Optimisation (GEO) corpus for AI discovery, matching the public Search Console surface — and stop public docs/llms from describing a different product (or leaking operator/admin detail).

### GEO
- Spec-shaped [`/llms.txt`](https://meridianweather.co.uk/llms.txt) index with absolute markdown links.
- [`/llms-full.txt`](https://meridianweather.co.uk/llms-full.txt) concatenated public corpus.
- Per-page microfiles under `/llms/` (`about`, `faq`, `docs/*`, `journal/*`, `legal/*`, `weather/*`).
- `/ai.txt` pointer + `/.well-known/llms.txt` rewrite mirror.
- `npm run reset:cms-public` to align CMS English docs/legal with file defaults (HTML ↔ GEO).
- Operator docs, admin, login, and API secrets excluded. See [`docs/GEO.md`](docs/GEO.md).

### Public copy alignment
- About/FAQ/Privacy: search may use OpenStreetMap/Nominatim-derived results; alerts do not promise unavailable Open-Meteo warnings.
- Terms: ad-free matches conditional Stripe wording (not “billing is not live”).
- Indexable English product docs rewritten without “For site operators” env/API dumps; Forecasts page is visitor-facing.

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
