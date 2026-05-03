# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| Next.js - routing, Server Actions, data fetching | nextjs-15 | ~/.agents/skills/nextjs-15/SKILL.md |
| Drizzle schema, migrations, ORM usage | drizzle | ~/.agents/skills/drizzle/SKILL.md |
| Supabase products, Auth, RLS, CLI, MCP | supabase | ~/.agents/skills/supabase/SKILL.md |
| React Query data fetching, caching, server state | react-query | ~/.agents/skills/react-query/SKILL.md |
| Zustand store, actions, state management | zustand | ~/.agents/skills/zustand/SKILL.md |
| Tailwind + shadcn/ui design system, tokens, theming | tailwind-design-system | ~/.agents/skills/tailwind-design-system/SKILL.md |
| React UI components, Radix, shadcn/ui, accessibility | ui-design-system | ~/.agents/skills/ui-design-system/SKILL.md |
| Multi-language, i18n, translation, localization | internationalization-i18n | ~/.agents/skills/internationalization-i18n/SKILL.md |
| Frontend testing: Vitest, RTL, Playwright | nextjs-frontend-testing | ~/.agents/skills/nextjs-frontend-testing/SKILL.md |
| Alpine.js directives, patterns | alpinejs | ~/.agents/skills/alpinejs/SKILL.md |
| Find/install new skills | find-skills | ~/.agents/skills/find-skills/SKILL.md |

## Compact Rules

### nextjs-15
- Server Components by default (async), add 'use client' only for interactivity/hooks
- Server Actions: use "use server" directive, revalidatePath/redirect for mutations
- App Router: app/layout.tsx (required), app/page.tsx (home), route groups (auth)
- Data fetching: parallel with Promise.all, streaming with Suspense
- API routes: app/api/*/route.ts with GET/POST handlers
- Middleware at root level with matcher config
- Metadata: export metadata object or generateMetadata async function
- Use server-only package to prevent client imports of server code

### drizzle
- Config: drizzle.config.ts, schemas: src/database/schemas/, migrations: src/database/migrations/
- Tables: plural snake_case (users), columns: snake_case (user_id)
- Primary keys: text('id').primaryKey().$defaultFn(() => idGenerator('prefix'))
- Foreign keys: .references(() => table.id, { onDelete: 'cascade' })
- Timestamps: use ...timestamps spread from _helpers.ts
- Type inference: createInsertSchema, $inferInsert, $inferSelect
- Query style: ALWAYS use db.select() builder API, NEVER use db.query.*.findMany relational API
- JOINs: explicit leftJoin with select object, separate queries for one-to-many

### supabase
- Verify against current docs/changelog before implementing (Supabase changes frequently)
- RLS: enable on EVERY table in exposed schemas, create policies matching access model
- Security: NEVER use user_metadata in JWT auth decisions, use raw_app_meta_data instead
- API keys: NEVER expose service_role key in clients, use publishable/anon keys
- Views: use WITH (security_invoker = true) in Postgres 15+, views bypass RLS by default
- Storage: upsert requires INSERT + SELECT + UPDATE permissions
- CLI: always use --help to discover commands, use supabase migration new for migrations
- MCP server: check reachability, verify .mcp.json config, authenticate via OAuth flow

### react-query
- Use React Query for ALL server state, avoid useState for data fetching
- Query keys: structured format ['entity', id, filters], use query key factories
- Setup: QueryClientProvider with staleTime (5min), cacheTime (30min), retry (2)
- Mutations: useMutation with onSuccess invalidateQueries, onError toast
- Optimistic updates: onMutate cancel + snapshot, onError rollback, onSettled invalidate
- Error handling: services throw user-friendly errors, components display error.message
- Combine with Zustand: React Query for server state, Zustand for client global state
- DevTools: always include ReactQueryDevtools for debugging

### zustand
- Action hierarchy: public actions → internal_* actions → internal_dispatch* methods
- Reducer pattern: use for object lists/maps, optimistic updates, complex transitions
- Simple set: use for booleans, single values, simple field updates
- Optimistic updates: update frontend immediately, call backend, refresh for consistency
- Delete operations: DON'T use optimistic updates (destructive, complex recovery)
- Naming: ID arrays (topicEditingIds), maps (topicMaps), active (activeTopicId), init flags (topicsInit)
- Class-based actions: migrating from plain objects to classes with #private set/get
- flattenActions: use to merge class instances, don't spread class instances directly

### tailwind-design-system
- Three-tier tokens: primitive (gray-50) → semantic (background) → component (button-height)
- Color format: use oklch for perceptual uniformity (Tailwind v4.1+)
- Theme config: @theme inline bridges CSS variables to Tailwind utilities
- Dark mode: define dark values for EVERY token in :root, use class strategy
- shadcn/ui wrapping: create thin wrapper components that enforce design system constraints
- Single source of truth: all tokens in globals.css, never hardcode colors in components
- Foreground pairing: every background token MUST have matching -foreground for contrast
- Validation: run token check script to ensure all required tokens are defined

### ui-design-system
- Stack layers: TailwindCSS (styling) → Radix UI (accessibility) → shadcn/ui (components)
- Use Tailwind for: layouts, spacing, static content, rapid prototyping
- Use Radix for: custom component libraries, full control, unique interactions
- Use shadcn/ui for: standard UI components, forms, dashboards, CRUD apps
- Accessibility: WCAG AA minimum (4.5:1 text, 3:1 UI), keyboard navigation, screen readers
- Responsive: mobile-first approach, use breakpoints to scale up
- Form architecture: React Hook Form + Zod for schema-first validation
- Performance: code splitting, virtualization for long lists, accurate Tailwind content paths
- Dark mode: ThemeProvider with next-themes, class strategy, CSS variables in .dark

### internationalization-i18n
- Extract ALL user-facing strings to translation files, never hardcode
- Use ICU message format for complex messages with interpolation
- Pluralization: support correct rules per language (not just one/many)
- Date/time/numbers: use locale-aware formatting (Intl API or i18n library)
- RTL support: implement for Arabic, Hebrew, Farsi (dir="rtl", layout mirroring)
- Fallback language: always provide fallback (usually English)
- Namespaces: organize translations by feature/domain
- Locale detection: querystring → cookie → localStorage → navigator order
- Language switching: store preference in localStorage/cookie, provide UI toggle
- Don't concatenate translated strings, don't assume English grammar rules

### nextjs-frontend-testing
- Test behavior not implementation: use getByRole, getByText, avoid DOM nesting selectors
- Test layers: unit (logic/hooks), component (rendered with props), E2E (critical user flows)
- Vitest preferred: fast, modern, great TypeScript support for Next.js
- React Testing Library: @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
- Playwright E2E: critical flows, stable selectors, auto-waiting with expect
- Test structure: tests/unit/ (Vitest + RTL), tests/e2e/ (Playwright)
- Scripts: test:unit, test:e2e, test (runs both)
- CI: install deps, build if needed, run test:unit, run test:e2e against preview server
- Avoid flaky tests: no setTimeout, proper waitFor, cleanup after tests

### alpinejs
- Use Alpine.js directives for lightweight interactivity in HTML
- Avoid long inline JavaScript strings in directives
- Prefer x-data with object syntax for complex state
- Use x-bind for dynamic attributes, x-on for event handlers
- Keep components self-contained with all state in x-data

### find-skills
- Use when user asks "how do I do X", "find a skill for X", or wants to extend capabilities
- Search for existing skills that match the requested functionality
- Help user install new skills if needed

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | /home/jgarrone/.config/opencode/AGENTS.md | Index — defines agent personality, rules, Engram protocol |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
