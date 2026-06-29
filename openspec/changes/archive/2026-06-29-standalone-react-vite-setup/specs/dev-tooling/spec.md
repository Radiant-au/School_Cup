## ADDED Requirements

### Requirement: Lint script with flat config

The project SHALL provide an `npm run lint` script that runs ESLint over the project using a flat config file (`eslint.config.js`). The lint run SHALL exit with a non-zero code when any error is reported. The flat config SHALL include recommended JavaScript rules (`@eslint/js`), recommended TypeScript rules (`typescript-eslint`), React hooks rules (`eslint-plugin-react-hooks`), and the Vite react-refresh rule (`eslint-plugin-react-refresh`).

#### Scenario: Lint on clean source

- **WHEN** `npm run lint` is run against the project source
- **THEN** ESLint runs using `eslint.config.js` and exits 0 when no violations are present.

#### Scenario: Lint fails on violations

- **WHEN** a source file contains an unused variable (a TypeScript-ESLint recommended rule violation)
- **THEN** `npm run lint` exits non-zero and reports the violation.

### Requirement: Formatting rules do not conflict with Prettier

The ESLint flat config SHALL include `eslint-config-prettier` as the last entry so that formatting-related rules are disabled and ESLint never fights Prettier.

#### Scenario: No formatting rules active

- **WHEN** `npm run lint` and `npm run format:check` are both run on the same code
- **THEN** neither tool reports a formatting conflict caused by the other (ESLint does not enforce stylistic rules that Prettier governs).

### Requirement: Format and format:check scripts

The project SHALL provide `npm run format` (writes formatted files in place) and `npm run format:check` (checks formatting without writing, suitable for CI). Both SHALL operate on the whole project (`prettier --write .` / `prettier --check .`) and honor `.prettierignore`.

#### Scenario: Format normalizes files

- **WHEN** a file has inconsistent indentation and `npm run format` is run
- **THEN** the file is rewritten with consistent formatting per `.prettierrc`.

#### Scenario: Format check detects unformatted file

- **WHEN** a file is not formatted per `.prettierrc` and `npm run format:check` is run
- **THEN** the command exits non-zero and lists the offending file.

### Requirement: Prettier config and ignore file

The project SHALL include a `.prettierrc` declaring the project's formatting style and a `.prettierignore` that excludes generated/build artifacts (`dist`, `node_modules`, `package-lock.json`) from Prettier.

#### Scenario: Prettier config present

- **WHEN** `.prettierrc` is inspected
- **THEN** it declares explicit style settings (e.g. `semi`, `singleQuote`, `tabWidth`, `trailingComma`, `printWidth`).

#### Scenario: Build artifacts ignored

- **WHEN** `npm run format:check` is run
- **THEN** files under `dist/` and `node_modules/` and `package-lock.json` are not checked.
