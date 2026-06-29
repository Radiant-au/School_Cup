## 1. package.json — pin deps, remove workspace ref, add scripts

- [x] 1.1 Replace every `catalog:` specifier in `package.json` with a pinned public version (keep existing `^` ranges where already present; pin catalog-only deps to current stable per design D1).
- [x] 1.2 Remove the `@workspace/api-client-react` entry from `devDependencies`.
- [x] 1.3 Add ESLint devDependencies: `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-config-prettier`.
- [x] 1.4 Add Prettier devDependencies: `prettier`.
- [x] 1.5 Add scripts: `"lint": "eslint ."`, `"format": "prettier --write ."`, `"format:check": "prettier --check ."`.
- [x] 1.6 Add `"engines": { "node": ">=18" }` and set a `"packageManager"` if desired (default: npm).

## 2. tsconfig.json — self-contained

- [x] 2.1 Remove the `"extends": "../../tsconfig.base.json"` line and the `"references"` array.
- [x] 2.2 Inline a complete compiler config (target ES2020, module ESNext, strict, skipLibCheck, esModuleInterop, allowSyntheticDefaultImports, forceConsistentCasingInFileNames, isolatedModules, noEmit, jsx preserve, lib esnext/dom/dom.iterable, moduleResolution bundler, resolveJsonModule, allowImportingTsExtensions, types node/vite/client, incremental, paths `@/*` → `./src/*`) and keep `include: ["src/**/*"]` + existing `exclude`.

## 3. vite.config.ts — env defaults, drop @assets, keep Replit plugins

- [x] 3.1 Replace the `PORT` throw with `const port = rawPort ? Number(rawPort) : 5173;` and keep the `Number.isNaN(port) || port <= 0` guard so an explicit invalid value still throws.
- [x] 3.2 Replace the `BASE_PATH` throw with `const basePath = process.env.BASE_PATH ?? "/";`.
- [x] 3.3 Remove the `"@assets"` entry from `resolve.alias` (keep `"@"` → `src`).
- [x] 3.4 Keep the three `@replit/vite-plugin-*` imports (now pinned to public versions); the cartographer/dev-banner dynamic-import block stays gated on `NODE_ENV !== "production" && REPL_ID`.

## 4. Vendor the football asset and fix the import

- [x] 4.1 Create `src/assets/football.svg` with a simple football icon.
- [x] 4.2 Update `src/pages/MatchSquad.tsx:7` from `import footballImg from "@assets/image_1782741719591.png";` to `import footballImg from "@/assets/football.svg";`.
- [x] 4.3 Confirm no remaining references to `@assets` anywhere in `src/` (grep).

## 5. ESLint flat config

- [x] 5.1 Create `eslint.config.js` (flat) with: `@eslint/js` recommended → `typescript-eslint` recommended → `eslint-plugin-react-hooks` → `eslint-plugin-react-refresh` → `eslint-config-prettier` (last).
- [x] 5.2 Configure ignores for `dist`, `node_modules`, `dist/public`, and any config-file globals as needed.

## 6. Prettier config

- [x] 6.1 Create `.prettierrc` (semi: true, singleQuote: false, tabWidth: 2, trailingComma: "all", printWidth: 80).
- [x] 6.2 Create `.prettierignore` excluding `dist`, `node_modules`, `package-lock.json`.

## 7. Documentation and repo hygiene

- [x] 7.1 Create root `README.md` (description, Node >=18 prerequisite, `npm install`, `PORT`/`BASE_PATH` defaults, scripts table for dev/build/serve/typecheck/lint/format/format:check, brief stack/structure note, pointer to `AGENTS.md`).
- [x] 7.2 Create root `.gitignore` (node_modules, dist, .env, .env.local, .env.*.local, *.tsbuildinfo, .vite, .DS_Store, .vscode/).
- [x] 7.3 Create `.env.example` with `PORT=5173` and `BASE_PATH=/` plus `#` comments explaining each.

## 8. Update AGENTS.md

- [x] 8.1 Remove the "Replit/pnpm workspace member" critical section and the standalone-failure warnings; reflect that the project now installs/typechecks/builds/runs on its own.
- [x] 8.2 Add `lint`, `format`, `format:check` to the scripts list and note the env defaults (PORT=5173, BASE_PATH=/) in the env section.
- [x] 8.3 Keep the routing (wouter), styling (shadcn/Tailwind v4), and OpenSpec sections (still accurate).

## 9. Verify end-to-end

- [x] 9.1 Run `npm install` and confirm it completes with no resolution errors and produces `package-lock.json`.
- [x] 9.2 Run `npm run typecheck` and confirm exit 0.
- [x] 9.3 Run `npm run lint` and confirm exit 0 (fix any violations in source/config).
- [x] 9.4 Run `npm run format` then `npm run format:check` and confirm exit 0.
- [x] 9.5 Run `npm run build` and confirm output is written to `dist/public`.
- [x] 9.6 Run `npm run dev` with no env vars and confirm the server starts on port 5173; smoke-test `/` and `/match/1`.
- [x] 9.7 Run `PORT=abc npm run dev` and confirm it throws a clear invalid-PORT error (verifies the guard still rejects bad explicit values).
