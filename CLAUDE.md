# MyReelMind — Project Instructions

## Package manager: pnpm (NOT npm)

This repo uses **pnpm** — `pnpm-lock.yaml` is committed and `package.json` pins
`"packageManager": "pnpm@11.1.2"`. There is **no** `package-lock.json`; do not
use npm.

- Install: `pnpm install`
- Test: `pnpm test` (vitest — **strict TDD**: write the failing test first, watch it fail, then implement)
- Typecheck: `pnpm exec tsc --noEmit`
- Build: `pnpm build`

### pnpm 11 build-scripts gotcha

pnpm 10+/11 does **not** run dependencies' build/postinstall scripts by default.
Approved native deps are listed in **`pnpm-workspace.yaml` → `allowBuilds:`**
(a `name: true|false` map) — **not** in `package.json` `pnpm.onlyBuiltDependencies`,
which is the pnpm-10 key and is silently ignored by pnpm 11. `sharp` must stay
`true` (Next.js image optimization needs the native binary).

A clean `pnpm install` may only **warn** about ignored builds locally (exit 0)
but **fail on Vercel** with `ERR_PNPM_IGNORED_BUILDS` (exit 1) — so local install
success does not guarantee the deploy. Verify the Vercel build.

Dependency pins/overrides use **pnpm config** (`pnpm-workspace.yaml` /
`pnpm.overrides`), not npm `overrides`.

## Auth

Derive a `userId` for any authorization or data-scoping decision via
`getAuthenticatedUser()` (server-revalidated, `src/lib/auth/server.ts`), never
`getSession()` — `getSession()` only decodes the cookie JWT without revalidating,
so a stale/revoked token still yields an id. `getSession()` is retained only for
non-sensitive display/UX gates (it carries a JSDoc warning).

## Deploy

Vercel auto-detects pnpm from the lockfile + `packageManager`. There is no
`vercel.json` (dashboard defaults) and no GitHub Actions CI; the Vercel preview
build is the deploy gate. Lint is broken at baseline (eslint-config-next vs
ESLint 9) and is not a gate — `pnpm test` + `tsc` are.
