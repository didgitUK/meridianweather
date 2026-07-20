# Agent instructions — meridian

**Read [`SCOPE.md`](SCOPE.md) first** when present. When anything conflicts with `SCOPE.md`, `SCOPE.md` wins.

## Speed defaults

1. Touch the smallest file set that solves the request.
2. Do **not** expand admin, email, AdSense, i18n product work, legal/docs, or PWA unless the user explicitly asks or the home demo is broken.
3. Prefer targeted `npm run test` over full `npm run verify` unless preparing submission or changing shared contracts.

## Live deploy

**Live deploy requires a GitHub (`origin`) push first** — then Gandi/host deploy. PRs must be labeled and include Summary, Changelog, Diff notes, Test plan, and Deploy notes. See Cursor rule `live-deploy-github` (always-on).

Never commit `.env.local`, `.secrets/`, or host tokens.
