## Context

This repo (`@workspace/school-cup`) was generated as a member of a Replit/pnpm workspace. Its `package.json` uses pnpm `catalog:` specifiers for ~30 dependencies and `workspace:*` for `@workspace/api-client-react`; its `tsconfig.json` extends `../../tsconfig.base.json` and project-references `../../lib/api-client-react`; its `vite.config.ts` aliases `@assets` to `../../attached_assets` and hard-throws if `PORT` or `BASE_PATH` are unset. None of those parent/sibling paths exist in this checkout, so `npm install`, `npm run typecheck`, `npm run dev`, and `npm run build` all fail here. There is also no ESLint, Prettier, README, root `.gitignore`, or `.env.example`. The goal is a self-contained React + Vite + TypeScript project that works end-to-end from a clean checkout with just `npm install`.

Verified facts driving the design:

- `@workspace/api-client-react` is declared in `package.json` but **not imported anywhere** in `src/` — safe to drop.
- `@assets` is used in exactly one place: `src/pages/MatchSquad.tsx:7` imports `image_1782741719591.png`. The `../../attached_assets` directory is unreachable, so that import is currently broken standalone.
- Existing non-catalog ranges (e.g. `wouter ^3.3.5`, `react-hook-form ^7.55.0`, `recharts ^2.15.2`, `sonner ^2.0.7`) are valid public versions and can be kept as-is.

## Goals / Non-Goals

**Goals:**

- `npm install` resolves every dependency from the public npm registry with no `catalog:`/`workspace:` specifiers.
- `npm run typecheck`, `npm run build`, and `npm run dev` succeed from a clean checkout with no parent-workspace files.
- `npm run dev` starts without `PORT`/`BASE_PATH`, defaulting to `5173` and `/`; explicit values still win.
- `npm run lint` and `npm run format`/`format:check` exist and work.
- A new contributor can install, configure, and run the app using only `README.md` + `.env.example`.
- Keep the app visually/behaviorally identical (the one `@assets` image is replaced by a local equivalent).

**Non-Goals:**

- No test framework (Vitest) or test suite — out of scope per scope decision.
- No CI workflow — out of scope.
- No changes to the app's feature set, routes, or data model.
- No change to the build output location (`dist/public`).
- No removal of the Replit dev plugins (they stay pinned and conditionally active — see Decisions).

## Decisions

### D1: Pin dependencies to public versions; baseline React 18.3

Replace every `catalog:` specifier with a concrete version. For deps that already carry a public `^` range (e.g. `wouter ^3.3.5`), keep that range. For catalog-only deps, pin to current stable as of implementation (React `18.3.1`, `react-dom 18.3.1`, `@types/react`/`@types/react-dom 18.3.x`, `vite ^5.4`, `@vitejs/plugin-react ^4.3`, `@tanstack/react-query ^5.x`, `tailwindcss ^4` via `@tailwindcss/vite`, `framer-motion ^11`, `lucide-react ^0.4xx`, `zod ^3`, `clsx ^2`, `tailwind-merge ^2`, `class-variance-authority ^0.7`).

- **Why React 18.3 over 19**: every non-catalog dep in the file is React-18-compatible and the code uses `react-dom/client` `createRoot` (18+). React 18.3.1 is the safest stable baseline; the project can bump to 19 later without API churn here.
- **Alternatives**: React 19 (rejected — would force re-verifying peer ranges for recharts/react-hook-form/wouter and gains nothing for this static app); keep `catalog:` (rejected — fails standalone).

### D2: Remove `@workspace/api-client-react`

Drop it from `devDependencies`. It is declared but never imported (verified via grep over `src/`). The app uses `@tanstack/react-query` directly with local data from `src/data/tournament.ts`.

- **Risk**: none observed — no imports to update.

### D3: Self-contained `tsconfig.json`

Stop extending `../../tsconfig.base.json`; remove the `references` array. Inline a complete compiler config preserving the current working options (`incremental`, `noEmit`, `jsx: preserve`, `lib: ["esnext","dom","dom.iterable"]`, `resolveJsonModule`, `allowImportingTsExtensions`, `moduleResolution: bundler`, `types: ["node","vite/client"]`, `paths: { "@/*": ["./src/*"] }`) and add standard strictness (`target: ES2020`, `module: ESNext`, `strict: true`, `skipLibCheck: true`, `esModuleInterop: true`, `allowSyntheticDefaultImports: true`, `forceConsistentCasingInFileNames: true`, `isolatedModules: true`, `noEmit: true`). Keep `include: ["src/**/*"]` and the existing `exclude`.

- **Why**: makes `npm run typecheck` pass without the missing base file.
- **Alternatives**: keep a minimal `tsconfig.base.json` locally and extend it (rejected — adds a file for no benefit at this size).

### D4: Remove `@assets` alias; vendor a local football asset

Remove the `@assets` alias from `vite.config.ts`. Create `src/assets/football.svg` (a simple football icon) and change `src/pages/MatchSquad.tsx:7` from `import footballImg from "@assets/image_1782741719591.png"` to `import footballImg from "@/assets/football.svg"`. Vite imports SVGs as URL strings by default, so the existing `<img src={footballImg}>` usage keeps working.

- **Why**: the original PNG lives in an unreachable `../../attached_assets`; a local SVG removes the only external-asset dependency and keeps the football-on-goal visual.
- **Trade-off**: the ball graphic changes from the original PNG to an SVG (acceptable; trivially swappable later if the original asset is recovered).
- **Alternatives**: put the image in `public/` and reference by URL (rejected — couples the component to a public path and loses Vite's asset hashing); delete the image entirely (rejected — degrades the goal timeline UI).

### D5: Safe env-var defaults in `vite.config.ts`

Replace the two `throw new Error(...)` blocks with defaults:

- `const port = rawPort ? Number(rawPort) : 5173;` then validate `Number.isNaN(port) || port <= 0` → throw **only for an explicitly invalid value**, not for absence.
- `const basePath = process.env.BASE_PATH ?? "/";`
  Keep `base: basePath`, `server.port: port`, `strictPort: true`, and the wouter `<Router base={import.meta.env.BASE_URL.replace(/\/$/, "")}>` wiring (unchanged — already default-safe once `BASE_PATH` defaults to `/`).
- **Why**: `npm run dev` should "just work" for a new contributor, while still honoring explicit `PORT`/`BASE_PATH` (e.g. Replit sets them).
- **Alternatives**: keep the throw and rely on `.env` (rejected — hostile defaults for a standalone project).

### D6: Keep the Replit dev plugins, pinned and conditional

Keep `@replit/vite-plugin-runtime-error-modal` (always loaded — useful dev overlay) and `@replit/vite-plugin-cartographer` + `@replit/vite-plugin-dev-banner` (dynamically imported only when `NODE_ENV !== "production"` **and** `REPL_ID` is set). Pin all three to public versions.

- **Why**: they are harmless outside Replit (the two Replit-only ones are behind a runtime gate) and keep the project deployable on Replit without special handling.
- **Trade-off**: three extra devDependencies that do nothing locally; acceptable for Replit portability.
- **Alternatives**: remove all three (rejected — loses the runtime error overlay and breaks Replit parity).

### D7: ESLint flat config (ESLint 9 style)

Add `eslint.config.js` using the flat-config format: `@eslint/js` recommended + `typescript-eslint` recommended + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` (Vite HMR rule) + `eslint-config-prettier` (last, to disable formatting conflicts). Ignore `dist`, `node_modules`, and `*.config.*` globals as needed. Script: `"lint": "eslint ."`.

- **Why**: flat config is the ESLint 9 standard and matches a fresh Vite React-TS scaffold.
- **Alternatives**: legacy `.eslintrc` (rejected — deprecated); skip Prettier integration (rejected — would let lint and format fight).

### D8: Prettier with `format` and `format:check`

Add `.prettierrc` (semi: true, singleQuote: false, tabWidth: 2, trailingComma: "all", printWidth: 80) and `.prettierignore` (`dist`, `node_modules`, `package-lock.json`, `*.md` maybe kept). Scripts: `"format": "prettier --write ."` and `"format:check": "prettier --check ."`.

- **Why**: gives a one-command normalize plus a CI-checkable variant.
- **Alternatives**: configure Prettier inside `package.json` (rejected — `.prettierrc` is more discoverable and editor-friendly).

### D9: README, `.gitignore`, `.env.example`

- `README.md`: title + one-line description, prerequisites (Node >= 18), `npm install`, env vars (`PORT` default 5173, `BASE_PATH` default `/`), a scripts table (dev/build/serve/typecheck/lint/format/format:check), brief stack/structure note, link to `AGENTS.md` for agent guidance.
- `.gitignore` (root): `node_modules`, `dist`, `dist/public`, `.env`, `.env.local`, `.env.*.local`, `*.tsbuildinfo`, `.vite`, editor dirs (`.vscode/*` keep `.vscode/extensions.json`? no — ignore wholesale), OS files (`.DS_Store`).
- `.env.example`: `PORT=5173` and `BASE_PATH=/` with `#` comment lines explaining each.
- **Why**: closes the onboarding gap; `.gitignore` also protects the new `.env`.
- **Node engines**: add `"engines": { "node": ">=18" }` to `package.json` (Vite 5 requirement); document npm as the default package manager.

### D10: Update `AGENTS.md`

Rewrite the workspace-slice warnings in `AGENTS.md` to reflect the standalone reality: remove the "Replit/pnpm workspace member" critical section, document the new `lint`/`format`/`format:check` scripts, note the env defaults, and keep the routing/styling/OpenSpec sections (still accurate).

## Risks / Trade-offs

- **Pinning versions blind (no access to the Replit catalog) could pick versions that drift from what the app was tested with.** → Mitigation: keep all existing public `^` ranges; pin catalog deps to current stable; implementation MUST verify with `npm install && npm run typecheck && npm run build`. If a peer conflict surfaces, adjust the pin and re-verify.
- **React 18.3 vs an assumed 19 baseline.** → Mitigation: 18.3.1 is chosen for compatibility; all non-catalog deps already declare 18-compatible ranges. Bumping to 19 is a later, separate change.
- **Replacing the football PNG with an SVG changes the goal icon's appearance.** → Mitigation: use a faithful, simple football SVG; the asset path is the only change site (`MatchSquad.tsx:7`) and is trivial to swap.
- **Keeping Replit plugins adds devDeps that are inert locally.** → Mitigation: acceptable for Replit portability; they add no runtime cost (gated dynamic imports).
- **ESLint flat config may be unfamiliar to contributors expecting `.eslintrc`.** → Mitigation: documented in README; flat config is the current ESLint default.
- **`npm install` will create a large `package-lock.json` (previously none existed).** → Mitigation: commit it for reproducible installs; add to `.gitignore`? No — keep it tracked (standard for npm projects).

## Migration Plan

Single-PR cutover; no deployed backend and no external consumers, so no coordinated rollout.

1. Edit `package.json`: pin all deps (D1), remove `@workspace/api-client-react` (D2), add ESLint/Prettier devDeps (D7/D8), add `engines.node` (D9), add `lint`/`format`/`format:check` scripts.
2. Replace `tsconfig.json` with the self-contained config (D3).
3. Edit `vite.config.ts`: remove `@assets` alias (D4), add env defaults (D5), keep Replit plugins pinned (D6).
4. Add `src/assets/football.svg` and update `src/pages/MatchSquad.tsx:7` import (D4).
5. Add `eslint.config.js`, `.prettierrc`, `.prettierignore` (D7/D8).
6. Add `README.md`, root `.gitignore`, `.env.example` (D9).
7. Update `AGENTS.md` (D10).
8. **Verify**: `npm install`, then `npm run typecheck && npm run lint && npm run format:check && npm run build`, then `npm run dev` (smoke-test `/` and `/match/1`).

**Rollback**: revert the commit; the old workspace-slice behavior is restored (still broken standalone, as before).

## Open Questions

None blocking. Decisions on React version (18.3.1 baseline), the football asset (SVG replacement), and keeping the Replit plugins (yes, pinned+gated) are settled above. If the original `image_1782741719591.png` becomes available later, it can be dropped into `src/assets/` and re-imported without further changes.
