## MODIFIED Requirements

### Requirement: Editable standings data structure

A `standings` table SHALL exist in Supabase with one row per team (`team_id` primary key) and numeric columns `p` (played), `w` (won), `d` (drawn), `l` (lost), `gf` (goals for), `ga` (goals against), `gd` (goal difference), `pts` (points). Each team in `TEAMS` SHALL have exactly one row. For Female-group teams, row values SHALL be derived from finished female group-stage matches (see "Standings auto-recompute on match finish"). For male-group teams (groups `A` and `B`), row values SHALL be the seeded snapshot and SHALL NOT be recomputed by the system.

#### Scenario: Standings row exists for each team

- **WHEN** the `standings` table is inspected
- **THEN** there is one row per team matching each team ID in `TEAMS`

#### Scenario: Female standings reflect finished matches

- **WHEN** a female group-stage match finishes or is reverted
- **THEN** the Female group's `standings` rows are recomputed from finished female matches and upserted

#### Scenario: Male standings are not recomputed

- **WHEN** any match finishes or is reverted
- **THEN** the male groups' (`A`, `B`) `standings` rows are not modified by the system

## ADDED Requirements

### Requirement: Standings auto-recompute on match finish

When a `group='Female'` group-stage match transitions to `finished` (via Finish Match) or away from `finished` (via Revert to Scheduled), the system SHALL recompute the Female group's `standings` rows from the set of `matches` rows where `status='finished'` and `group='Female'`, using `score_a` and `score_b` as each match's final goals. For each female team, the system SHALL compute: `p` = count of finished female matches the team participated in; `w`/`d`/`l` by comparing that team's score versus its opponent's; `gf` = sum of that team's goals across those matches; `ga` = sum of opponent goals; `gd` = `gf` - `ga`; `pts` = `w`*3 + `d`*1. The recomputed rows SHALL be upserted into `standings` keyed by `team_id`. Knockout matches (groups `Semi-final`, `Final`, `Bronze Final`) SHALL NOT contribute to any group's standings.

#### Scenario: Finish female match recomputes female standings

- **WHEN** the admin finishes a `group='Female'` match
- **THEN** the system recomputes `p`/`w`/`d`/`l`/`gf`/`ga`/`gd`/`pts` for every female team from all finished female matches and upserts the rows into `standings`

#### Scenario: Revert female match recomputes female standings

- **WHEN** the admin reverts a `group='Female'` match to scheduled
- **THEN** the system recomputes female standings excluding the reverted match (which is no longer finished)

#### Scenario: Finish male match does not recompute male standings

- **WHEN** the admin finishes a `group='A'` or `group='B'` match
- **THEN** the male `standings` rows are not modified by the system

#### Scenario: Knockout match does not affect standings

- **WHEN** the admin finishes or reverts a knockout match (group `Semi-final`, `Final`, or `Bronze Final`)
- **THEN** no `standings` rows are recomputed or modified

### Requirement: Authenticated standings update policy

The Supabase RLS policy on `public.standings` SHALL allow `authenticated` users to `UPDATE` rows and SHALL deny `UPDATE` for the `anon` role. `SELECT` SHALL remain available to `anon` and `authenticated` (unchanged). No `INSERT` or `DELETE` policy is required for `standings`; rows are seeded and only updated in place by the recompute path.

#### Scenario: Anon cannot update standings

- **WHEN** an unauthenticated client attempts `UPDATE` on `standings`
- **THEN** the request is rejected by RLS

#### Scenario: Authenticated admin can update standings

- **WHEN** an authenticated admin client attempts `UPDATE` on `standings`
- **THEN** the request succeeds
