# GEO — LLM discovery surface

Generative Engine Optimisation (GEO) for meridian: plain-text context for AI crawlers and agents, aligned with the **public** Search Console surface (`en` / `en-GB`).

## Endpoints

| URL | Role |
|-----|------|
| [`/llms.txt`](https://meridianweather.co.uk/llms.txt) | Curated index ([llmstxt.org](https://llmstxt.org) shape: H1, blockquote, H2 link lists) |
| [`/llms-full.txt`](https://meridianweather.co.uk/llms-full.txt) | Concatenated public corpus for one-pass ingestion |
| `/llms/{path}.txt` | Per-page microfiles (`about.txt`, `docs/getting-started.txt`, `journal/{id}.txt`, `legal/{slug}.txt`, `weather/{slug}.txt`, …) |
| [`/ai.txt`](https://meridianweather.co.uk/ai.txt) | Short AI discovery pointer |
| `/.well-known/llms.txt` | Rewrite mirror of `/llms.txt` |

Implementation: [`src/lib/llms/`](../src/lib/llms/), routes under `src/app/llms.txt/`, `src/app/llms-full.txt/`, `src/app/llms/[...path]/`.

## Sources (public libraries only)

- Brand: `src/constants/brand.js`
- About / FAQ / home intro: `messages/en.json`
- Visitor docs: `src/content/docs/*` (operator docs excluded)
- Legal: `src/content/legal/*`
- Journal: `src/constants/blog-posts-defaults.js`
- Hot UK place blurbs: `src/constants/place-editorial-blurbs.js`

Operator / noindex docs are **never** emitted: `deployment`, `api-limits`, `api-reference`, `monetization` (`DOCS_NOINDEX_SLUGS`). Sections titled “For site operators” are stripped even if present in CMS overlays.

## Explicitly out of scope

- `/admin`, `/login`, invites, password reset
- `/api/*`, cron secrets, env vars, SQLite schema
- Unpublished / stub place guides

## Alignment notes (2026-08-01 audit)

Public copy was checked against product behaviour and adjusted where claims drifted:

- Search uses OpenWeather **and** OpenStreetMap/Nominatim-derived results (About/FAQ/Privacy).
- Terms ad-free wording matches conditional Stripe (same as About/FAQ).
- Alerts: condition thresholds + official warning feeds **when available** (Open-Meteo warnings upstream is not promised as live).
- Indexable English docs no longer ship “For site operators” env/API dumps; those remain only on noindex operator pages.
- FAQ no longer mentions admin login.

Internal ops stay in [`docs/OPS-RUNBOOK.md`](OPS-RUNBOOK.md) and noindex `/docs/*` operator pages — not in GEO.

## Keep HTML docs/legal aligned

CMS English pages seed with `INSERT OR IGNORE`, so file updates do not overwrite edited CMS rows. After shipping content fixes:

```bash
DATABASE_PATH=/srv/data/home/meridian.db npm run reset:cms-public
```

## Verification

```bash
npm run test -- src/lib/llms/llms.test.js
curl -sS https://meridianweather.co.uk/llms.txt | head
curl -sS https://meridianweather.co.uk/llms/about.txt | head
curl -sS https://meridianweather.co.uk/ai.txt
curl -sS https://meridianweather.co.uk/.well-known/llms.txt | head
```
