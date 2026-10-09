# Feature: ESLint baseline fix

## Objective
Restore a working `pnpm lint` on MyReelMind so lint runs clean (or with a documented, deliberate baseline) and can become a real gate.

## Problem
`pnpm lint` fails at config load: `eslint.config.mjs` imports `FlatCompat` from `@eslint/eslintrc`, which is not in `devDependencies`. Additionally the `lint` script uses `next lint`, deprecated in Next 15.5 and removed in Next 16. CLAUDE.md documents lint as "broken at baseline" and excludes it from gates.

## Why
Lint has been excluded from project gates since baseline; the user wants this debt attacked now (2026-10-09), the same day the dependabot queue was cleared.

## Scope (authorized)
- Add missing ESLint dependencies so the flat config loads.
- Migrate `lint` script from `next lint` to the ESLint CLI (Next's own recommended path).
- Make `pnpm lint` exit 0: fix or deliberately configure away surfaced errors (see decision point).
- Update CLAUDE.md gate documentation to match reality.

## Out of scope
- Bumping `eslint-config-next` (15.5.15) beyond what the fix strictly requires — dependabot owns dep bumps.
- Enabling lint as a CI/deploy gate without explicit user approval (decision point below).

## Constraints
- pnpm only (never npm). Strict TDD applies to behavior changes with runnable deterministic tests; for tooling config the failing command itself is the RED evidence.
- Conventional commits, no AI attribution, work-unit commit on this feature branch.

## Decision point (ask user before closing)
Whether `pnpm lint` becomes a project gate (replacing the "lint broken" note in CLAUDE.md) or stays a non-gate local command once it passes.

## Tasks
- [x] T1: RED evidence — `pnpm lint` failed on config load (missing `@eslint/eslintrc`; `next lint` deprecated). Fixed: added `@eslint/eslintrc@3.3.7` to devDependencies, migrated script to `eslint .`, added flat-config `ignores` for build artifacts (`.next`, `out`, `build`, `coverage`, `next-env.d.ts`, `tsconfig.tsbuildinfo`).
- [x] T2: Green baseline reached — `pnpm lint` exits 0 with **0 errors / 20 warnings**: 16 × `no-explicit-any` concentrated in `src/lib/media/detail.ts`, 4 × `no-unused-vars` in tests (SettingsForm.test.tsx ×2, library-state.test.ts, service.test.ts). Both rules were deliberately set to `warn` by the existing config; warnings left visible, not silenced.
- [x] T3: Verify — 2026-10-09 evidence on branch: `tsc --noEmit` exit 0; `pnpm test` 662/662 (80 files); `pnpm build` exit 0; `pnpm lint` exit 0.
- [x] T4: Docs — CLAUDE.md updated: lint listed as a local gate (`pnpm lint`, zero-warning), "broken at baseline" note replaced with the 2026-10-09 repair record + anti-regression warning. Gate decision resolved: user chose **Option A** (lint as real gate with `--max-warnings=0`).
- [x] T5: Work-unit commit on `fix/eslint-baseline` — closed by this commit (`chore(lint): ...`; exact hash recorded in Engram mirror `odd/eslint-baseline/tasks`).

## Progress log
- 2026-10-09: feature doc created; branch `fix/eslint-baseline` opened from `main` (40bca6e).
- Route: T1 evidence gathered inline (3-call batch); T1–T3 executed inline (mechanical config/deps edits + bounded verification); no delegation triggers fired (non-trivial source files touched: 0).
- 2026-10-09: T1–T3 complete, all gates green. User selected Option A for T4.
- 2026-10-09: warning cleanup delegated to one writer (detail.ts typing + 3 test files + lint script); writer PASS. Native assess: `medium` risk (executable_change: eslint.config.mjs); writer ran on free-tier default model → independent verifier launched per bias rule. Verifier: **PASS**, 0 CRITICAL / 0 MAJOR, 2 documented MINOR, all three gates observed independently, 20-warning baseline reproduced exactly via stdin replay.

## Acceptance criteria
- `pnpm lint` exits 0 from a clean install.
- `pnpm test` and `tsc --noEmit` unchanged green.
- CLAUDE.md reflects the true lint status.
