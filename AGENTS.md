# Agent instructions — meridian

When product scope conflicts with historical notes, prefer [`docs/DECISIONS.md`](docs/DECISIONS.md) and [`docs/OPS-RUNBOOK.md`](docs/OPS-RUNBOOK.md).

## Speed defaults

1. Touch the smallest file set that solves the request.
2. Do **not** expand admin, email, AdSense, i18n product work, legal/docs, or store-native apps unless the user explicitly asks or the home demo is broken. **PWA work is in scope** — see [`docs/PWA.md`](docs/PWA.md).
3. Prefer targeted `npm run test` over full `npm run verify` unless preparing submission or changing shared contracts.
4. Platform perfection backlog order: Trust → Honesty/Ops → Product finish → Growth → Engineering excellence (see Cursor plan / review docs).

## Live deploy

**Live deploy requires a GitHub (`origin`) push first** — then Gandi/host deploy. PRs must be labeled and include Summary, Changelog, Diff notes, Test plan, and Deploy notes. See Cursor rule `live-deploy-github` (always-on).

Never commit `.env.local`, `.secrets/`, or host tokens.
