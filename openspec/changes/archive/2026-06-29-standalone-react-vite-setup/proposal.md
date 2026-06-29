## Why

This repo is checked out as a slice of a Replit/pnpm workspace, so `npm install` fails on `catalog:`/`workspace:*` specifiers, `npm run typecheck` fails without `../../tsconfig.base.json` + `../../lib/api-client-react`, `npm run dev` hard-throws without `PORT`/`BASE_PATH`, and the `@assets` import in `MatchSquad.tsx` points to a missing `../../attached_assets`. There is also no lint, format, or onboarding documentation. The project should be a self-contained React + Vite + TypeScript app that installs, typechecks, builds, lints, and runs with a single `npm install` + `npm run dev`.

## What Changes

- **BREAKING**: Replace all `catalog:` specifiers in `package.json` with pinned semver versions resolvable from the public npm registry.
- **BREAKING**: Remove the `@workspace/api-client-react` dependency (declared but never imported in `src/`).
- **BREAKING**: Make `tsconfig.json` self-contained — stop extending `../../tsconfig.base.json` and drop the project reference to `../../lib/api-client-react`. Inline any needed compiler options locally.
- **BREAKING**: Remove the `@assets` Vite alias. Vendor the referenced image into the project (e.g. `src/assets/`) or replace it with a local asset/inline SVG, and update the import in `src/pages/MatchSquad.tsx`.
- **BREAKING**: Change `vite.config.ts` so unset `PORT` and `BASE_PATH` fall back to safe defaults (`5173` and `/`) instead of throwing, while still honoring explicit values.
- Add ESLint with a flat config (`eslint.config.js`) targeting React + TypeScript, plus a `lint` script.
- Add Prettier with a minimal config (`.prettierrc`) and `format` / `format:check` scripts.
- Add a root `.gitignore` (node_modules, dist, .env, etc.), a `.env.example` documenting `PORT`/`BASE_PATH`, and a `README.md` with setup, scripts, and env-var instructions.
- Update `AGENTS.md` to reflect the now-standalone setup (remove the workspace-slice warnings, document new scripts).

## Capabilities

### New Capabilities

- `standalone-project`: The project installs, typechecks, builds, and runs `npm run dev` from a clean checkout without any parent-workspace files; dependency versions are pinned and the dev server starts with sensible env defaults.
- `dev-tooling`: Linting and formatting are wired up with ESLint (flat config) and Prettier, exposed via `npm run lint`, `npm run format`, and `npm run format:check`.
- `project-documentation`: A README, root `.gitignore`, and `.env.example` give a new contributor everything needed to install, configure, and run the app.

### Modified Capabilities

<!-- None — openspec/specs/ is empty, so all work is net-new. -->

## Impact

- **Affected files**: `package.json`, `tsconfig.json`, `vite.config.ts`, `src/pages/MatchSquad.tsx` (asset import), `AGENTS.md`; new files: `eslint.config.js`, `.prettierrc` (or prettier section in package.json), `.gitignore`, `.env.example`, `README.md`, and a vendored asset under `src/assets/`.
- **Dependencies**: ~30 `catalog:` entries become pinned versions; `@workspace/api-client-react` is removed; ESLint + Prettier (and plugins) added as devDependencies.
- **Scripts**: `package.json` gains `lint`, `format`, `format:check`; existing `dev`/`build`/`serve`/`typecheck` behavior preserved (typecheck now passes standalone).
- **Behavior**: `npm run dev` no longer throws when `PORT`/`BASE_PATH` are unset.
- **Non-goals**: No test framework (Vitest) and no CI workflow in this change — explicitly out of scope per scope decision.
