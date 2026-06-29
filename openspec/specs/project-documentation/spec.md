# Project Documentation Specification

## Purpose

Defines the contributor-facing documentation and environment files at the project root: a README sufficient for onboarding, a `.gitignore` that protects build output and local env, and a `.env.example` that documents environment variables.

## Requirements

### Requirement: README documents setup and scripts

The project SHALL include a root `README.md` that enables a new contributor to install, configure, and run the app using only that file. It SHALL include: a one-line project description, prerequisites (Node `>=18`), the `npm install` step, the `PORT` and `BASE_PATH` environment variables (with defaults `5173` and `/`), and a scripts table covering `dev`, `build`, `serve`, `typecheck`, `lint`, `format`, and `format:check`.

#### Scenario: Contributor onboards from README alone

- **WHEN** a new contributor follows only `README.md`
- **THEN** they can run `npm install` and `npm run dev` and reach the running app without consulting any other file.

#### Scenario: All scripts documented

- **WHEN** the README's scripts section is inspected
- **THEN** it lists `dev`, `build`, `serve`, `typecheck`, `lint`, `format`, and `format:check` with a one-line description of each.

### Requirement: Root .gitignore protects build output and local env

The project SHALL include a root `.gitignore` that excludes `node_modules`, `dist`, `.env`, `.env.local`, `.env.*.local`, TypeScript build info (`*.tsbuildinfo`), Vite cache (`.vite`), and common editor/OS artifacts (`.DS_Store`, `.vscode/`).

#### Scenario: Build output ignored

- **WHEN** `npm run build` produces files under `dist/public`
- **THEN** `git status` does not report any file under `dist/`.

#### Scenario: Local env ignored

- **WHEN** a contributor creates a `.env` file
- **THEN** it is ignored by git and not staged.

### Requirement: .env.example documents env vars with defaults

The project SHALL include a root `.env.example` that lists `PORT` and `BASE_PATH` with their default values (`5173` and `/`) and a comment line explaining each. It SHALL be safe to copy to `.env` as-is.

#### Scenario: Example mirrors defaults

- **WHEN** `.env.example` is copied to `.env` and `npm run dev` is run
- **THEN** the dev server starts on port `5173` with base path `/`, matching the documented defaults.

#### Scenario: Variables documented

- **WHEN** `.env.example` is inspected
- **THEN** both `PORT` and `BASE_PATH` appear with an inline `#` comment describing their purpose.
