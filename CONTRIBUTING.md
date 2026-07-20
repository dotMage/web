# Contributing to dotMage web admin

The read-only admin panel for dotMage — an E2E-encrypted `.env` secret manager.
React + TypeScript + Vite. **It never displays secret values:** the server only
ever holds ciphertext and the panel has no decryption key. Keep it that way.

## Setup

Requires Node 22+.

```bash
npm ci
```

## Develop

```bash
npm run dev
```

The panel talks to the server same-origin. In production nginx serves the SPA
and proxies `/api` and `/health` to the server (`nginx.conf`). For local dev,
point those at a running server.

## Checks (CI runs the same)

```bash
npm run lint       # eslint
npx tsc --noEmit   # type-check
npm run build      # production build → dist/
```

## Build & deploy

`npm run build` emits `dist/`. The Docker image is just nginx serving `dist/`
plus `nginx.conf` — the build happens in CI, not in the Dockerfile.

## Layout

```
src/pages/          routes: Apps, AppDetail, Devices, Users, Audit, Login, Settings
src/components/     Layout, Icons, CmdChip, UpdateBanner
src/api/client.ts   typed API client (Bearer token, refresh-on-401)
src/context/        Auth + Toast providers
src/lib/            semver + update-check helpers
nginx.conf          serves the SPA, proxies /api and /health to the server
```

## Ground rules

- **Metadata only.** The panel shows app / env / revision / device metadata,
  never secret values — the server can't provide them and the browser has no
  key. Don't add features that would need the account key in the browser
  (minting CI tokens or team invites, for example, stay in the CLI).
- **i18n.** User-facing strings use `data-i18n` keys with EN and RU entries;
  keep both in sync.

## Commits & releases

Short, imperative Conventional Commits (`feat:`, `fix:`, `docs:`). Keep the
CHANGELOG's `[Unreleased]` section current. Releases are cut from an annotated
`vX.Y.Z` tag; pushing to `main` builds nothing user-facing.
