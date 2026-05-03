# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| Next.js routing, Server Actions, data fetching | nextjs-15 | ~/.agents/skills/nextjs-15/SKILL.md |
| Drizzle ORM schema, migrations, database operations | drizzle | ~/.agents/skills/drizzle/SKILL.md |
| Supabase products, Auth, RLS, CLI, MCP server | supabase | ~/.agents/skills/supabase/SKILL.md |
| React Query data fetching, caching, server state | react-query | ~/.agents/skills/react-query/SKILL.md |
| Zustand store, actions, state management | zustand | ~/.agents/skills/zustand/SKILL.md |
| Tailwind + shadcn/ui design system, tokens, theming | tailwind-design-system | ~/.agents/skills/tailwind-design-system/SKILL.md |
| React UI components, Radix, accessibility, shadcn/ui | ui-design-system | ~/.agents/skills/ui-design-system/SKILL.md |
| Multi-language, i18n, translation, localization | internationalization-i18n | ~/.agents/skills/internationalization-i18n/SKILL.md |
| Vitest, RTL, Playwright testing | nextjs-frontend-testing | ~/.agents/skills/nextjs-frontend-testing/SKILL.md |
| Alpine.js directives and patterns | alpinejs | ~/.agents/skills/alpinejs/SKILL.md |
| Finding and installing new skills | find-skills | ~/.agents/skills/find-skills/SKILL.md |
| Split large changes into chained/stacked PRs | gentle-ai-chained-pr | ~/.config/opencode/skills/chained-pr/SKILL.md |
| Parallel adversarial review protocol | judgment-day | ~/.config/opencode/skills/judgment-day/SKILL.md |
| Issue creation workflow (bug/feature) | issue-creation | ~/.config/opencode/skills/issue-creation/SKILL.md |
| PR creation workflow, issue-first enforcement | branch-pr | ~/.config/opencode/skills/branch-pr/SKILL.md |
| Create new AI agent skills | skill-creator | ~/.config/opencode/skills/skill-creator/SKILL.md |
| Go tests, Bubbletea TUI testing | go-testing | ~/.config/opencode/skills/go-testing/SKILL.md |
| Write warm comments for PRs/issues/reviews | comment-writer | ~/.config/opencode/skills/comment-writer/SKILL.md |
| Design documentation with reduced cognitive load | cognitive-doc-design | ~/.config/opencode/skills/cognitive-doc-design/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### nextjs-15
- Server Components by default, add 'use client' only for interactivity/hooks
- Server Actions for mutations, collocate with components
- App Router: file-based routing with folders, layout.tsx, page.tsx, loading.tsx, error.tsx
- Data fetching: async/await in Server Components, no useEffect for data
- Caching: fetch() options (cache, next), revalidatePath/revalidateTag
- Streaming: Suspense boundaries with loading.tsx, use() for promises
- Metadata: export metadata object from page/layout, no <Head> component

### drizzle
- Define schemas in `src/database/schemas/*` with drizzle-orm
- Use pgTable, text, integer, timestamp, boolean, jsonb column types
- Migrations: `drizzle-kit generate` then `drizzle-kit migrate`
- Relations: use relations() with one/many for foreign keys
- Queries: db.select().from(), .where(), .insert(), .update(), .delete()
- TypeScript: infer types with $inferSelect and $inferInsert
- RLS: always pair with Supabase RLS policies for security

### supabase
- Use @supabase/ssr for Next.js middleware auth (createBrowserClient, createServerClient)
- Auth: getSession(), getUser(), signIn(), signOut(), signInWithOAuth()
- RLS: always enable row-level security, write policies for SELECT/INSERT/UPDATE/DELETE
- Middleware: call updateSession() in middleware.ts to refresh tokens
- Server Actions: always call getSession() to verify auth before mutations
- Profile sync: after OAuth login, upsert user profile in public.profiles table
- Storage: use storage.from().download()/.upload() with proper bucket policies

### react-query
- Use QueryClientProvider at app root, one client per request in SSR
- useQuery for data fetching: queryKey, queryFn, staleTime, gcTime
- useMutation for mutations: onSuccess → invalidateQueries or setQueryData
- Optimistic updates: use setQueryData in onMutate, rollback in onError
- SSR: prefetchQuery/dehydrateQuery in Server Components, HydrationBoundary in client
- Query keys: use arrays [key, id, params] for structured invalidation

### zustand
- Create stores with create() and TypeScript interfaces for state
- Actions are methods in the store: setState((state) => ({ ... }))
- Selectors: use store((state) => state.property) to avoid re-renders
- Persist middleware: persist(state, { name: 'store-name', storage: localStorage })
- Don't use Zustand for server state — use React Query instead
- For complex state: split into slices, merge with Object.assign

### tailwind-design-system
- Define design tokens in CSS variables (--color-primary, --radius-md, etc.)
- Theme config: extend tailwind.config.js with custom colors, fonts, spacing
- Dark mode: use class strategy, toggle .dark on html/body
- shadcn/ui: use CLI to add components, customize in components/ui/*
- Component variants: use cva() for className variants (size, intent, disabled)
- Responsive: mobile-first, use sm:, md:, lg:, xl: breakpoints

### ui-design-system
- Radix primitives: use @radix-ui/react-* for accessible components
- shadcn/ui: copy components to src/components/ui/, customize as needed
- Composition: prefer compound components (Card.Header, Card.Content)
- Accessibility: always include aria-label, role, proper focus management
- Responsive layouts: use CSS grid/flex with Tailwind responsive utilities
- Dark mode: use CSS variables, respect .dark class on parent

### internationalization-i18n
- Use next-intl for Next.js: i18n/request.ts with getRequestConfig()
- Locale routing: /en/*, /es/* with middleware for locale detection
- Messages: JSON files per locale (en.json, es.json), nested structure
- Types: generate types from messages with i18n/types.ts
- Translations: use t() hook in components, useTranslations() in Server Components
- Pluralization: use {count, plural, =0 {...} one {...} other {...}} syntax
- RTL: add dir="rtl" to html, use logical properties (margin-inline-start)

### nextjs-frontend-testing
- Vitest: configure with @vitejs/plugin-react, test files as *.test.tsx
- React Testing Library: render(), screen.getBy*, fireEvent.*, waitFor()
- Mocking: vi.mock() for modules, MSW for API mocking
- Playwright E2E: test.describe, test(), page.goto(), expect()
- Custom renders: create test-utils.tsx with AllTheProviders wrapper
- Test IDs: use data-testid for stable selectors, avoid CSS classes
- Coverage: run with --coverage, aim for 80%+ on critical paths

### alpinejs
- Use x-data, x-bind, x-on, x-model, x-show, x-if, x-for directives
- Avoid long inline JavaScript — extract to functions in x-data object
- Components: use Alpine.data() for reusable logic
- Reactivity: $state(), $derived(), $effect() for Alpine 3.x
- Events: @click, @submit, @keydown, use .stop, .prevent, .once modifiers
- Transitions: use x-transition with duration and easing classes

### gentle-ai-chained-pr
- MUST split when PR exceeds 400 changed lines (additions + deletions)
- Design each PR for ≤60-minute human review
- Every PR: state where it starts, ends, what came before, what comes next
- Include dependency diagram with 📍 marking current PR
- Autonomy: CI green, one deliverable, reasonable rollback, verification included
- Feature Branch Chain: all child PRs target feature branch, only tracker merges to main
- Stacked PRs: each PR merges to main in order, rebase and retarget after each merge
- Tracker PR: required for chains >2 PRs, includes status table and diagram

### judgment-day
- Launch TWO blind judge sub-agents in parallel via delegate()
- Judges work independently with same target, no cross-contamination
- Synthesize verdict: Confirmed (both), Suspect (one), Contradiction (disagree)
- WARNING classification: real (normal user can trigger) vs theoretical (contrived scenario)
- Fix Agent: separate delegation, fixes only confirmed issues
- Re-judge after fixes: launch both judges again in parallel
- Convergence: after 2 fix iterations, ask user whether to continue
- APPROVED: 0 confirmed CRITICALs + 0 confirmed real WARNINGs after Round 1

### issue-creation
- Blank issues disabled — MUST use template (bug report or feature request)
- Every issue gets status:needs-review automatically on creation
- Maintainer MUST add status:approved before any PR can be opened
- Questions go to Discussions, not issues
- Bug Report template: pre-flight checks, description, steps, expected/actual behavior
- Feature Request template: problem description, proposed solution, affected area
- CLI: gh issue create --template "bug_report.yml" or "feature_request.yml"

### branch-pr
- Every PR MUST link an approved issue with status:approved label
- Every PR MUST have exactly one type:* label (type:bug, type:feature, etc.)
- Branch naming: type/description (feat/login, fix/auth-bug, chore/deps)
- PR body: Closes #N, type checkbox, summary, changes table, test plan, contributor checklist
- Conventional commits: type(scope): description, no Co-Authored-By
- Automated checks: issue reference, status:approved verification, type:* label check
- Commands: gh pr create --title "feat(scope): desc" --body "Closes #N"

### skill-creator
- Create skill when: pattern used repeatedly, project-specific conventions, complex workflows
- Don't create skill when: docs already exist, pattern is trivial, one-off task
- Structure: skills/{skill-name}/SKILL.md, optional assets/ and references/
- Frontmatter: name, description (with Trigger), license: Apache-2.0, metadata.author/version
- Content: When to Use, Critical Patterns, Code Examples, Commands sections
- Naming: {technology}, {project}-{component}, {project}-test-{component}, {action}-{target}
- Register: add to AGENTS.md table with description and path

### go-testing
- Table-driven tests: []struct{name, input, expected, wantErr}, t.Run() for each case
- Bubbletea Model testing: test Model.Update() directly, assert state transitions
- Teatest integration: teatest.NewTestModel(), tm.Send(), tm.WaitFinished(), tm.FinalModel()
- Golden files: compare output with testdata/*.golden, use -update flag to regenerate
- Test organization: *_test.go beside source, testdata/ for golden files
- Commands: go test ./..., go test -v, go test -cover, go test -update

### comment-writer
- Tone: warm, direct, human — avoid robotic or overly formal language
- PR reviews: start with what's good, then constructive feedback with examples
- Issues: validate the question makes sense, explain WHY with technical reasoning
- Async collaboration: be concise but personable, use "dude", "here's the thing"
- Spanish input → Rioplatense: "buenísimo", "dejame ver", "¿se entiende?", "dale"
- Criticism: focus on the code, not the person; explain tradeoffs
- Praise: specific and genuine, call out clever solutions or clean patterns

### cognitive-doc-design
- Progressive disclosure: start with overview, then details, then deep dives
- Chunking: break content into sections with clear headings, 5-7 items max per section
- Signposting: use "In this section", "What you'll learn", "Prerequisites" boxes
- Tables over paragraphs: comparison tables, decision trees, quick reference
- Checklists: actionable steps with checkboxes for procedures
- Recognition over recall: provide examples, templates, copy-paste snippets
- Visual hierarchy: H1 → H2 → H3, bullet points, bold key terms sparingly

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | ~/.config/opencode/AGENTS.md | Index — personality, rules, engram protocol |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
