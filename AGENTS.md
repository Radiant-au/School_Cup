# AGENTS.md

Guidance for OpenCode sessions working in this repo. Keep it short; verify against the files mentioned if anything looks stale.

## What this is

`@workspace/school-cup` — "School Cup 2026" tournament tracker. React + Vite + TypeScript + Tailwind v4 + shadcn/ui, routed with wouter. Static client app; match/team data lives in `src/data/tournament.ts` (no backend).

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

wouter, **not** react-router. All routes are declared in `src/App.tsx`: `/` (Home), `/match/:id` (MatchSquad), and a 404. Add new routes there. The router is wrapped with `QueryClientProvider` (TanStack Query) and `TooltipProvider`.

## UI / styling conventions

- shadcn/ui, **new-york** style, **neutral** base, CSS variables (`components.json`). Add components via the shadcn CLI; they land in `src/components/ui`. `cn()` is in `src/lib/utils`.
- Tailwind v4: styling via `@import "tailwindcss"` + `@tailwindcss/vite` plugin; theme tokens declared with `@theme inline` in `src/index.css`. There is **no `tailwind.config.js`**.
- Dark mode is the default — `class="dark"` is set on `<html>` in `index.html`; variant is `@custom-variant dark (&:is(.dark *))`.
- Feature components are grouped by domain under `src/components/` (`fixtures`, `info`, `knockout`, `layout`, `table`), separate from the generated `ui/` primitives.

## Spec-driven workflow (OpenSpec)

OpenSpec is configured under `openspec/` with skills in `.opencode/skills/openspec-*` and slash commands (`/opsx-propose`, `/opsx-apply`, `/opsx-sync`, `/opsx-explore`, `/opsx-archive`). Use these for proposing and implementing changes; `openspec/config.yaml` has no project context/rules filled in yet.
