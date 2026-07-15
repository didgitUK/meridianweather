# Agent instructions — meridian

**Read [`SCOPE.md`](SCOPE.md) first.** It is the binding interview brief, stack lock, in/out-of-scope freeze list, CODEMAP, and speed rules. When anything conflicts with `SCOPE.md`, `SCOPE.md` wins.

## Speed defaults

1. Touch the smallest file set that solves the request (prefer CODEMAP paths in `SCOPE.md` §6.3).
2. Do **not** expand admin, email, AdSense, or PWA unless the user explicitly asks or the home demo is broken. Freeze **admin/auth** i18n completeness and **new** legal/doc pages (per `SCOPE.md` §4); public UI + legal/docs/journal are in scope when the user explicitly requests them.
3. Do **not** create new 20–40 line microfiles by default; only split when a file is already ~200+ lines and clarity requires it.
4. Do **not** crawl `node_modules/next/dist/docs/` by default. Open a **specific** Next doc only when an API is unknown or a deprecation blocks the build.
5. Skip Cursor browser automation unless the user asks for visual verification. Prefer external browser + hard refresh over restarting `next dev`.
6. Prefer targeted `npm run test` over full `npm run verify` unless preparing submission or changing shared contracts.

## Next.js note

This repo uses **Next.js 16** — APIs may differ from older training data. When stuck on a Next API or deprecation, check the matching guide under `node_modules/next/dist/docs/` for that topic only, then proceed.

## Reviewer path

For humans and demo prep: [`REVIEWER.md`](REVIEWER.md) → [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) → [`docs/DECISIONS.md`](docs/DECISIONS.md) (stretch ADRs are subordinate to `SCOPE.md`).
