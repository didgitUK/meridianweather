# SCOPE.md — MASTER DRAFT (source of truth for every agent)

> **Authority:** This document overrides feature enthusiasm, prior chat plans, and overbuilt ADRs when they conflict with delivery of the interview exercise.
> **Product name in repo:** meridian (Weather Dashboard coding exercise).
> **Expected effort bar:** 4–6 hours worth of *scoped* product — working, well-structured, demoable. Not a SaaS platform.

---

## 1. Why this exists

This submission is an **interview coding challenge**. All code may be discarded after interview. Reviewers will judge:

| Criterion | What “good” means here |
| --- | --- |
| Functionality | Add/remove cities, search, weather cards, persistence, rate-limit mindfulness |
| Code quality | Clean, readable, organized structure |
| React skills | Components, hooks, sensible data flow |
| API integration | OpenWeather via secure key; errors handled |
| UI/UX | Clear hierarchy, responsive, loading + error states |
| Testing | Basic tests or clear evidence of functional testing |
| Discussability | Can explain choices and demo confidently |

**Agent rule:** Prefer finishing and polishing **in-scope** behaviour over adding systems. If a task is not required to pass the criteria above, do not expand it.

---

## 2. Locked stack (do not change)

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | **Next.js** (App Router in this repo) | Required recommendation |
| Language | **Modern JavaScript (ES6+)** | TypeScript is optional in the brief; **this delivery stays JS** — do not migrate to TS |
| Styling | **CSS3 / Tailwind (existing)** | Keep current approach; no framework rewrite |
| Weather API | **OpenWeather** (free tier) | Key in env vars only |
| Persistence (user cities) | **localStorage** | Brief requirement |
| Package manager / run | `npm install` / `npm run dev` | Submission must run this way |

Do **not** introduce: new primary languages, new major UI frameworks, Docker-as-requirement, or a rewrite of the app shell.

---

## 3. In-scope product (must work for demo)

### 3.1 City management

- Search cities by name
- Add city to dashboard (UI: **pin from city detail** after search — preview before saving)
- Remove city from dashboard (UI: unpin / remove)
- Persist selected cities in **localStorage** across sessions
- Empty state with helpful instructions when no cities are selected

### 3.2 Weather display (per city)

- Current temperature
- Weather description
- At least some additional info (e.g. humidity, wind) — allowed and encouraged
- Weather icons (OpenWeather icons **or** existing local icon mapping is fine if documented)

### 3.3 Technical behaviour

- API key via environment variables (never commit secrets)
- Graceful API/network/invalid-key/not-found errors with meaningful UI messages
- Loading states while fetching
- Mindful of **1000 calls/day** free tier (caching / refresh policy is in-scope problem-solving)
- Responsive layout (mobile + desktop)
- Basic accessibility: semantics, readable structure, keyboard-usable primary flows
- README: setup, run, assumptions/decisions, approach
- Git history present
- Optional but valued: basic tests for key logic; “what we’d improve with more time”; deploy link

### 3.4 Primary demo path (agents: protect this)

1. `npm install` → configure `.env.local` with `OPENWEATHER_API_KEY` → `npm run dev`
2. Search a city (e.g. London) → opens city detail → **Pin to your locations** → home card shows temp/description/icon (+ extras)
3. Reload → cities still present (localStorage)
4. Remove / unpin a city → persists after reload
5. Empty dashboard → instructions visible
6. Force/simulate error path if possible (bad key / offline) → user-visible message
7. Resize / mobile viewport → usable layout

Canonical UI entry points:

- Home dashboard: `src/app/[locale]/page.js` → hero search + `src/features/weather/components/DashboardPage.jsx`
- Search → detail navigation: `src/features/cities/hooks/useCheckCityNavigation.js`
- City detail (pin): `src/app/[locale]/city/[cityId]/page.js` → `src/features/weather/components/CityDetailPage.jsx`
- Search UI: city search components under `src/features/cities/`
- Cards: `src/features/weather/components/WeatherCard.jsx` (+ grid)
- Weather fetch: `src/app/api/weather/*`, `src/lib/weather/*`, `src/features/weather/hooks/useWeatherData.js`
- City persistence: `src/features/cities/hooks/useSavedCities.js` (and related storage helpers)

Supporting docs for reviewers (keep accurate, don’t balloon):

- `README.md`, `REVIEWER.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/STUDY-BACKEND.md`

---

## 4. Out of scope / freeze list (do not grow)

These exist in the repo as **over-scope extras**. They may remain for the interview conversation (“what we explored”) but agents must **not** expand them unless fixing a **demo blocker** or an explicit user request.

| Area | Examples in repo | Agent policy |
| --- | --- | --- |
| Admin platform | `/admin`, users, CMS, connections, AdSense earnings OAuth | Freeze |
| Monetization product | AdSense slots, premium tier, billing stubs | Freeze |
| Email product | Resend/SendGrid/SES, digests, alert emails, React Email | Freeze |
| Heavy i18n product work | Expanding admin/auth locale completeness | Freeze admin/auth English-first; public UI + legal/docs/journal are in scope when requested |
| Legal/docs site expansion | New legal/doc pages | Freeze |
| PWA / service worker polish | New offline product features | Freeze |
| Platform “recent checks” as a product | Seed scripts, showcase analytics | Freeze unless it breaks home demo |
| New databases / infra | Extra services, Docker requirements | Do not add |
| New microfile sprawl | Splitting 20-line leaf components | **Stop** — see §6 |

**Interview framing:** Extras can be mentioned as stretch; **evaluation focus is the Weather Dashboard brief.** Prefer a sharp core demo over a wide admin surface.

---

## 5. What “done” means for delivery

Submission is delivery-ready when:

1. Core flows in §3 work reliably on a clean machine with only `OPENWEATHER_API_KEY`.
2. README matches reality (setup/run/assumptions).
3. Code for the core path is readable without needing to understand admin/email/ads.
4. There is evidence of testing (`npm run test` for key units and/or a short manual test note in README).
5. You can discuss: localStorage, API routes vs client, caching/rate limits, error/loading UX, component structure.

Non-goals for “done”: perfect admin, AdSense live earnings, multi-ESP email, full locale parity.

---

## 6. Agent operating rules (speed + scope)

### 6.1 Before any feature work

1. Read **this file** (`SCOPE.md`).
2. Skim `REVIEWER.md` (5-minute path) only if touching core weather UI/API.
3. Ask: “Is this required for §3 demo or criteria?” If no → stop or minimal fix only.

### 6.2 Default change budget

- Touch the **smallest set of files** that implements the request.
- Prefer editing existing core modules over creating new packages/folders.
- **Do not** apply Structural Microfile Protocol to create new 20–40 line files unless a file is already large (~200+ lines) *and* the split is needed for clarity.
- **Do not** read all of `node_modules/next/dist/docs/` by default. Only open a **specific** Next doc when an API is unknown or a deprecation blocks the build.

### 6.3 CODEMAP — where to look (core only)

| Task | Look here first | Avoid unless needed |
| --- | --- | --- |
| Dashboard / cards / empty state | `src/features/weather/components/` | `src/features/admin/**` |
| Search / pin / unpin / localStorage | `src/features/cities/`, city detail `CityDetailPage.jsx` | admin locations CMS |
| Weather API + cache + quota | `src/lib/weather/`, `src/app/api/weather/`, `src/lib/weather-fetch-orchestrator.js` | adsense, email, cron |
| Errors / API envelope | `src/lib/server/api-response.js` | — |
| Styling / layout chrome | `src/components/layout/`, `src/app/globals.css` | footer app-store marketing expansion |
| Tests | co-located `*.test.js`, `npm run test` | — |
| Reviewer narrative | `README.md`, `REVIEWER.md` | rewriting all ADRs |

### 6.4 Performance / agent-tax rules

- Do not open Cursor browser automation unless the user asks for visual verification.
- Do not restart `next dev` unless the server is wedged; prefer hard refresh.
- Do not run full `npm run verify` unless changing shared contracts or preparing submission; prefer targeted tests.
- Do not “clean up” out-of-scope areas in the same PR/task as a core fix.

### 6.5 Allowed polish (still in spirit of brief)

- Better empty/loading/error copy on dashboard
- Responsive tweaks on cards/search
- Stronger OpenWeather error mapping
- Cache/TTL clarity for rate limits
- A few focused unit tests (validators, cache policy, icon map, city id)
- README / REVIEWER accuracy for the **core** story

---

## 7. Assumptions & decisions agents should defend in interview

Keep these stable unless the user explicitly changes product direction:

1. **Next.js API routes** proxy OpenWeather so the API key stays server-side.
2. **localStorage** holds the user’s city list (brief requirement).
3. **Caching** exists to respect the 1000 calls/day free tier (problem-solving criterion).
4. **JavaScript** (not TypeScript) for this delivery.
5. **Public UI localizes** via next-intl + content packs; auth/admin stay English-first. Locale routing and OpenWeather `lang` follow the selected public locale.
6. Stretch features (admin, email, ads) are **optional extras**, not substitutes for the core dashboard.

---

## 8. Explicit non-instructions

Agents must **not**:

- Rewrite the app to match a different stack
- Add TypeScript migration mid-delivery
- Build more admin/email/adsense surface “to impress”
- Treat ADR stretch features as mandatory scope
- Optimize for enterprise multi-tenancy

Agents **should**:

- Protect the demo path
- Keep core code obvious
- Make trade-offs explainable in 2–3 sentences each

---

## 9. Document control

| Field | Value |
| --- | --- |
| Status | MASTER DRAFT — binding for agents |
| Relates to | Interview “Web Developer Coding Exercise — Weather Dashboard” |
| Implementation map | `REVIEWER.md`, `docs/ARCHITECTURE.md` |
| Decision log | `docs/DECISIONS.md` (historical; subordinate to this scope) |

When chat plans conflict with this file, **this file wins**.
