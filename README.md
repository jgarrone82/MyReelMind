# MyReelMind

A retro, VHS‑styled personal library for tracking the movies, TV shows and anime
you watch. Search a title, drop it on your shelf, set a watch status, rate it and
keep notes — all wrapped in a video‑rental‑store aesthetic.

**Live:** https://my-reel-mind.vercel.app

> MyReelMind is a personal, single‑user app: you sign in with your own account and
> the catalog you see is your own. The public repo exists as a portfolio piece.

---

## Features

- **Track what you watch** — add movies, TV and anime to your library with a watch
  status (`want to watch`, `watching`, `completed`, `paused`, `dropped`), progress,
  a rating and free‑form notes.
- **Search** powered by [TMDB](https://www.themoviedb.org/) — find a title and add
  it to your shelf in one step.
- **Media detail** pages with overview, genres, runtime and artwork.
- **Public profile** (`/users/[id]`) — a shareable view of a user's shelf.
- **Trending** feed to discover new titles.
- **Bilingual** — Spanish (default) and English, via locale‑prefixed routes
  (`/es/...`, `/en/...`).
- **Auth** — email/password sign‑up with verification, password reset and OAuth
  callback handling, backed by Supabase.
- **Settings** — profile and account management (avatar cropping included).

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | [Next.js 15](https://nextjs.org/) (App Router) · React 19 · TypeScript |
| Auth | [Supabase Auth](https://supabase.com/auth) (`@supabase/ssr`) |
| Database | PostgreSQL (Supabase) via [Drizzle ORM](https://orm.drizzle.team/) + `postgres` |
| Server state | [TanStack Query](https://tanstack.com/query) |
| UI state | [Zustand](https://zustand-demo.pmnd.rs/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) · [shadcn/ui](https://ui.shadcn.com/) · Base UI · CVA |
| Validation | [Zod](https://zod.dev/) |
| Data source | [TMDB API](https://developer.themoviedb.org/) (AniList reserved as a future source) |
| Testing | [Vitest](https://vitest.dev/) · Testing Library · MSW · [Playwright](https://playwright.dev/) (e2e) |
| Tooling | pnpm 11 · ESLint · Vercel |

## Getting started

> This repo uses **pnpm** (`pnpm-lock.yaml` is committed and `packageManager` is
> pinned). Do not use npm.

```bash
pnpm install
# create .env.local with the variables listed below
pnpm dev
```

The app runs at http://localhost:3000 and redirects to the default locale (`/es`).

### Environment variables

Create `.env.local` with:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `DATABASE_URL` | Postgres connection string (Supabase) — used by Drizzle |
| `TMDB_API_KEY` | TMDB API key for search / trending / details |
| `NEXT_PUBLIC_SITE_URL` | Public base URL (used in auth email redirects) |

For end‑to‑end tests, also set `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD`.

### Database

Drizzle manages the schema (`src/db/schema`). With `DATABASE_URL` set:

```bash
pnpm exec drizzle-kit push      # apply the schema to your database
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm test` | Run the unit/integration suite (Vitest) |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:coverage` | Coverage report |
| `pnpm exec tsc --noEmit` | Type‑check |

> **Strict TDD:** write the failing test first, watch it fail, then implement.

## Project structure

```
src/
  app/[lang]/         Locale-prefixed routes
    (app)/            Authenticated shell: library, search, media/[id], users/[id], settings
    (auth)/           login, signup, forgot/reset password, verify-email
    auth/callback/    OAuth code exchange
  app/api/            Route handlers: library, media, search, trending
  actions/            Server actions (auth, collection)
  components/         UI (VHS-themed) + feature components
  db/schema/          Drizzle tables: media-items, user-media, users, enums
  hooks/              TanStack Query hooks
  i18n/               Dictionaries (es/en) + provider
  lib/                Auth, Supabase clients, helpers
  stores/             Zustand stores
  middleware.ts       i18n + auth routing
```

## Data model

- **`media_items`** — a shared cache of catalog entries fetched from a source
  (`tmdb` / `anilist`), keyed uniquely by `(source, source_id)`. Holds type
  (`movie` / `tv` / `anime`), titles, overview (with per‑locale `overviews`),
  genres, artwork and runtime.
- **`user_media`** — your per‑title tracking row: `status`, `progress`, `rating`,
  `notes` and `dates`, unique per `(user_id, media_item_id)`.
- **`users`** — user records.

## Authentication

Authorization and data‑scoping always derive the `userId` from
`getAuthenticatedUser()` (`src/lib/auth/server.ts`), which revalidates the session
server‑side. `getSession()` only decodes the cookie JWT (no revalidation) and is
reserved for non‑sensitive display gates.

## Deployment

Deployed on [Vercel](https://vercel.com/), which auto‑detects pnpm from the
lockfile and `packageManager`. The Vercel preview build is the deploy gate
(`pnpm test` + `tsc`). Set the environment variables above in the Vercel project.

---

Built with care as a personal project. 📼
