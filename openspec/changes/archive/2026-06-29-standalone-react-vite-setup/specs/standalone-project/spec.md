## ADDED Requirements

### Requirement: Clean install from the public npm registry

The project's `package.json` SHALL declare every dependency with a concrete version or `^`/`~` range resolvable from the public npm registry. It MUST NOT contain any `catalog:` or `workspace:` specifiers. `@workspace/api-client-react` SHALL be removed from `devDependencies` because it is not imported anywhere in `src/`.

#### Scenario: Fresh checkout install

- **WHEN** a contributor runs `npm install` in a clean checkout with no parent workspace files present
- **THEN** the install completes successfully and produces a `node_modules` tree and `package-lock.json` with no resolution errors.

#### Scenario: No workspace protocols remain

- **WHEN** `package.json` is inspected
- **THEN** it contains zero occurrences of the strings `catalog:` and `workspace:*`.

### Requirement: Standalone TypeScript typecheck

`tsconfig.json` SHALL be self-contained: it MUST NOT extend any `../../tsconfig.base.json` and MUST NOT declare a project reference to `../../lib/api-client-react`. It SHALL inline all compiler options needed for a Vite + React + TypeScript app, including `strict: true`, `moduleResolution: "bundler"`, `jsx: "preserve"`, `lib` including `dom`, and the `@/*` → `./src/*` path mapping.

#### Scenario: Typecheck without workspace parents

- **WHEN** `npm run typecheck` is run in a checkout where `../../tsconfig.base.json` and `../../lib/api-client-react` do not exist
- **THEN** `tsc --noEmit` completes with exit code 0 and reports no errors.

#### Scenario: Path alias still resolves

- **WHEN** a source file imports from `@/lib/utils`
- **THEN** the import resolves to `src/lib/utils` without error during typecheck.

### Requirement: Standalone production build

`npm run build` SHALL produce the production bundle in `dist/public` (the existing output directory) without requiring any parent-workspace file. The `@assets` Vite alias SHALL be removed; the previously-aliased asset SHALL be vendored under `src/assets/` and imported via the `@/` alias.

#### Scenario: Build from clean checkout

- **WHEN** `npm run build` is run with no `../../attached_assets` directory present
- **THEN** the build completes successfully and writes output to `dist/public`.

#### Scenario: Football asset resolves locally

- **WHEN** `src/pages/MatchSquad.tsx` is bundled
- **THEN** the football image import resolves to a file under `src/assets/` and no `@assets` alias is referenced anywhere in the project.

### Requirement: Dev server starts without environment variables

`vite.config.ts` SHALL default `PORT` to `5173` and `BASE_PATH` to `/` when those environment variables are unset, instead of throwing. Explicit `PORT` and `BASE_PATH` values SHALL override the defaults. An explicitly-provided but invalid `PORT` (non-numeric or ≤ 0) SHALL still cause a hard error.

#### Scenario: No env vars set

- **WHEN** `npm run dev` is run with neither `PORT` nor `BASE_PATH` set in the environment
- **THEN** the Vite dev server starts on port `5173` with base path `/` and does not throw.

#### Scenario: Explicit port honored

- **WHEN** `PORT=3000 npm run dev` is run
- **THEN** the dev server starts on port `3000`.

#### Scenario: Invalid explicit port rejected

- **WHEN** `PORT=abc npm run dev` is run
- **THEN** the process throws a clear error indicating the `PORT` value is invalid.

### Requirement: Node engine requirement declared

`package.json` SHALL declare `"engines": { "node": ">=18" }` so the minimum Node version required by Vite 5 is documented and enforceable.

#### Scenario: Engine field present

- **WHEN** `package.json` is inspected
- **THEN** `engines.node` is present and set to `">=18"`.
