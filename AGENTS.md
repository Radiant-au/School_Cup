# AGENTS.md

Guidance for OpenCode sessions working in this repo. Keep it short; verify against the files mentioned if anything looks stale.

## What this is

`@workspace/school-cup` — "School Cup 2026" tournament tracker. React + Vite + TypeScript + Tailwind v4 + shadcn/ui, routed with wouter. Live data (matches, goal events, standings) is backed by Supabase and read in real time; team/squad metadata still ships in `src/data/tournament.ts` and `src/data/squads/`. The `fifaOwner` admin panel authenticates via Supabase Auth (email+password) and writes goals / status.

## Standalone project

This is a self-contained React + Vite + TypeScript app. `npm install`, `npm run typecheck`, `npm run build`, and `npm run dev` all work from a clean checkout with no parent-workspace files. Dependency versions are pinned in `package.json` (no `catalog:`/`workspace:` specifiers).

## Optional env vars (safe defaults in vite.config.ts)

`dev`, `build`, and `serve` all load `vite.config.ts`, which defaults when unset:

- `PORT` — defaults to `5173`; an explicitly-set invalid value (non-numeric or `<= 0`) still throws. Dev server uses `strictPort: true`.
- `BASE_PATH` — defaults to `/`; used as Vite `base` and feeds wouter's `<Router base>` via `import.meta.env.BASE_URL`.

Example: `PORT=3000 BASE_PATH=/app npm run dev` (or just `npm run dev` for defaults).

Replit-only plugins (cartographer, dev-banner) load only when `NODE_ENV !== "production"` **and** `REPL_ID` is set, so they stay inactive outside Replit. The runtime error overlay always loads.

## Scripts (package.json) — there are no others

- `dev` — Vite dev server (host 0.0.0.0).
- `build` — Vite build → output is `dist/public` (not the default `dist`).
- `serve` — `vite preview` (host 0.0.0.0).
- `typecheck` — `tsc -p tsconfig.json --noEmit`.
- `lint` — ESLint (flat config, `eslint.config.js`) over the project.
- `format` — Prettier write-all (`--write .`).
- `format:check` — Prettier check-only (`--check .`), CI-friendly.

There is **no test script** and no test framework configured. Do not invent test commands or assume a framework (jest/vitest) is set up.

## Path aliases

- `@/*` → `src/*` (defined in both `vite.config.ts` and `tsconfig` paths).

## Routing

wouter, **not** react-router. All routes are declared in `src/App.tsx`: `/` (Home), `/match/:id` (MatchSquad), `/fifaOwner/login` (AdminLogin), `/fifaOwner` (AdminFixtures, wrapped in `AdminAuthGuard`), `/fifaOwner/match/:id` (AdminLiveMatch, wrapped in `AdminAuthGuard`), and a 404. Add new routes there. The router is wrapped with `QueryClientProvider` (TanStack Query) and `TooltipProvider`.

## Supabase

The Supabase client is in `src/lib/supabase.ts` (publishable/anon key only — never a service-role key in the browser). Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (see `.env.example`).

- `supabase/schema.sql` — tables (`teams`, `matches`, `goal_events`, `standings`), RLS enabled, tables added to `supabase_realtime`. Run first.
- `supabase/policies.sql` — RLS policies: anon + authenticated `SELECT` on all tables; `INSERT`/`DELETE` on `goal_events` and `UPDATE` on `matches` for `authenticated` only. Run after schema.
- `supabase/seed.sql` — **post-migration source of truth** for the initial dataset. Regenerate from the static data with `npx tsx supabase/generate-seed.mts`. Run after policies. Emits `ON CONFLICT (id) DO UPDATE` for `teams`/`matches`/`standings`, so re-running corrects stale rows (it never demotes a `status='live'` match). After editing `src/data/tournament.ts`, regenerate the seed and re-run it: `npx tsx supabase/generate-seed.mts`, then paste `supabase/seed.sql` into the Supabase SQL editor. If a `matches` row was deleted from `tournament.ts`, run `supabase/resync.sql` instead (it prunes orphaned `goal_events` first, then reapplies the seed). Hand-editing `supabase/seed.sql` directly is disallowed.
- `src/data/tournament.ts` — **pre-migration seed only.** `MATCHES`, `MATCH_EVENTS`, `STANDINGS`, `TOP_SCORERS_*` are `@deprecated`; the app reads from Supabase via the hooks below. `TEAMS` and `SQUADS` (metadata, not edited live) are still imported directly by components.

Public reads go through TanStack Query hooks in `src/hooks/` (`useMatches`, `useGoalEvents`, `useStandings`, `useTopScorers`) which subscribe to `postgres_changes` and invalidate their cache keys on changes; realtime invalidation is centralised in `src/lib/useRealtimeInvalidation.ts`. Live scores are derived by counting `goal_events` rows (so undo = `DELETE`); `matches.score_a/score_b` is the final snapshot written on Finish Match.

## UI / styling conventions

- shadcn/ui, **new-york** style, **neutral** base, CSS variables (`components.json`). Add components via the shadcn CLI; they land in `src/components/ui`. `cn()` is in `src/lib/utils`.
- Tailwind v4: styling via `@import "tailwindcss"` + `@tailwindcss/vite` plugin; theme tokens declared with `@theme inline` in `src/index.css`. There is **no `tailwind.config.js`**.
- Dark mode is the default — `class="dark"` is set on `<html>` in `index.html`; variant is `@custom-variant dark (&:is(.dark *))`.
- Feature components are grouped by domain under `src/components/` (`fixtures`, `info`, `knockout`, `layout`, `table`), separate from the generated `ui/` primitives.

## Spec-driven workflow (OpenSpec)

OpenSpec is configured under `openspec/` with skills in `.opencode/skills/openspec-*` and slash commands (`/opsx-propose`, `/opsx-apply`, `/opsx-sync`, `/opsx-explore`, `/opsx-archive`). Use these for proposing and implementing changes; `openspec/config.yaml` has no project context/rules filled in yet.
