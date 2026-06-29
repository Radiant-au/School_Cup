## MODIFIED Requirements

### Requirement: Squad files organized in squads directory

All squad data files SHALL reside in `src/data/squads/`. Each file SHALL export a typed `Player[]` array with a named export. Every player entry SHALL include a unique `id` field. A barrel `index.ts` SHALL export a `SQUADS` lookup map of type `Record<string, Player[]>` keyed by team ID (matching `TEAMS[].id`). The barrel SHALL include entries for all 14 teams.

#### Scenario: Squad lookup by team ID

- **WHEN** the app needs the squad for team `"PrE(A)"`
- **THEN** it accesses `SQUADS["PrE(A)"]` and receives the player array for PrE group A male.

#### Scenario: All teams wired in barrel

- **WHEN** the `SQUADS` map is inspected
- **THEN** it contains entries for all 14 team IDs defined in `TEAMS`.

#### Scenario: Missing squad returns undefined

- **WHEN** a team has no squad file yet
- **THEN** `SQUADS[teamId]` returns `undefined` and the app handles the missing data gracefully.

### Requirement: Existing squad files migrated with IDs

All squad files SHALL be proper TypeScript modules that import the `Player` type from `../tournament`, export a named `Player[]` constant, and include a unique `id` field on every player entry. Player IDs SHALL follow the format `{major}_{group}_{seq}` (e.g., `CE_B_01`, `AME_F_03`). The `profile_string_link` field SHALL be `""` (empty string) when no link is available, not `"none"`.

#### Scenario: All players have unique IDs

- **WHEN** any squad file is inspected
- **THEN** every player object has an `id` field that is unique across all squad files.

#### Scenario: Player ID follows naming convention

- **WHEN** a player belongs to CE male team (group B) and is the 3rd player in the squad
- **THEN** their ID is `CE_B_03`.

#### Scenario: Squad file is a proper TypeScript module

- **WHEN** a squad file is inspected
- **THEN** it contains an `import type { Player }` statement and an `export const` declaration of type `Player[]`.

#### Scenario: Empty squad files export empty arrays

- **WHEN** a squad file has no player data yet (e.g., `CE_female.ts`)
- **THEN** it exports a typed empty array (`Player[] = []`).
