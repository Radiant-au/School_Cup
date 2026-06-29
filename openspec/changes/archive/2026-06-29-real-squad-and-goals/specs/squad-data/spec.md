## ADDED Requirements

### Requirement: Player interface with unique ID

The `Player` interface SHALL be defined in `tournament.ts` with fields: `id` (string, unique across all squads), `name` (string), `year` (string), `number` (string, optional jersey number), and `profile_string_link` (string, optional). Each player ID SHALL follow the format `{major}_{group}_{seq}` (e.g., `IS_A_01`).

#### Scenario: Player has unique ID

- **WHEN** a squad file is inspected
- **THEN** every player object has an `id` field that is unique across all squad files.

#### Scenario: Player ID follows naming convention

- **WHEN** a player belongs to IS major, group A, and is the 7th player in the squad
- **THEN** their ID is `IS_A_07`.

### Requirement: Squad files organized in squads directory

All squad data files SHALL reside in `src/data/squads/`. Each file SHALL export a typed `Player[]` array. A barrel `index.ts` SHALL export a `SQUADS` lookup map of type `Record<string, Player[]>` keyed by team ID (matching `TEAMS[].id`).

#### Scenario: Squad lookup by team ID

- **WHEN** the app needs the squad for team `"IS(A)"`
- **THEN** it accesses `SQUADS["IS(A)"]` and receives the player array for IS group A male.

#### Scenario: Missing squad returns undefined

- **WHEN** a team has no squad file yet
- **THEN** `SQUADS[teamId]` returns `undefined` and the app handles the missing data gracefully.

### Requirement: Existing squad files migrated with IDs

The existing `IS_A_male.ts` and `IS_B_male.ts` files SHALL be moved into `src/data/squads/` and updated to include the `id` field on each player entry.

#### Scenario: IS_A_male players have IDs

- **WHEN** the IS_A_male squad file is inspected
- **THEN** each player has an `id` field starting with `IS_A_` followed by a zero-padded sequence number.
