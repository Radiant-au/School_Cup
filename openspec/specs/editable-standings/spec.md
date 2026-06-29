# editable-standings

## Purpose

Defines the editable standings data structure and how the table component reads from it.

## Requirements

### Requirement: Editable standings data structure

A `STANDINGS` array SHALL exist in `tournament.ts` containing `StandingEntry` objects. Each entry SHALL have: `teamId` (string), `p` (played), `w` (won), `d` (drawn), `l` (lost), `gf` (goals for), `ga` (goals against), `gd` (goal difference), `pts` (points). All fields are numbers except `teamId`.

#### Scenario: Standings entry exists for each team

- **WHEN** the `STANDINGS` array is inspected
- **THEN** there is one entry per team matching each team ID in `TEAMS`.

#### Scenario: Standings values are editable

- **WHEN** a match finishes and stats need updating
- **THEN** the corresponding `StandingEntry` values can be edited directly in `tournament.ts`.

### Requirement: Table reads from STANDINGS data

The `TableTab` component SHALL read team stats from the `STANDINGS` array instead of generating zeroed rows. It SHALL filter `STANDINGS` by matching `teamId` against teams in the requested group and gender.

#### Scenario: Table displays edited standings

- **WHEN** a `StandingEntry` has `pts: 6` and `gd: 3`
- **THEN** the table row for that team displays PTS=6 and GD=3.

#### Scenario: Team not in STANDINGS shows zeros

- **WHEN** a team has no entry in `STANDINGS`
- **THEN** the table displays that team with all stats as 0.
