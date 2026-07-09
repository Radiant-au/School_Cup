# supabase-match-state

## Purpose

Defines the Supabase-backed live-match state model: goal events persisted as rows in the `goal_events` table, scores derived from event counts, per-event undo via delete, goal log ordering, match status transitions, admin write authentication, and use of real squad data in the admin live-match screen.

## Requirements

### Requirement: Goal events stored in Supabase

Each goal recorded by the admin SHALL be persisted as a row in the Supabase `goal_events` table with the columns: `id` (uuid, server-generated), `match_id` (string), `team_id` (string), `player_id` (string), `player_number` (string), `player_name` (string), and `created_at` (timestamptz, server-generated). The admin client SHALL NOT generate the `id` or `created_at` locally; both SHALL come from Supabase.

#### Scenario: Record a goal

- **WHEN** the admin taps a player in the live-match screen
- **THEN** a row is inserted into `goal_events` with that player's `player_id`, `player_number`, `player_name`, the active team's `team_id`, and the current `match_id`.

#### Scenario: Server-generated identity and timestamp

- **WHEN** a goal event is inserted
- **THEN** the returned row has a server-generated `id` (uuid) and `created_at` (timestamptz), and the client uses these values for subsequent undo and ordering.

### Requirement: Live score derived from goal events

The live score for each team in a match SHALL be computed as the count of `goal_events` rows for that `match_id` and `team_id`. The admin live-match screen and the public views SHALL derive scores from the event log rather than from a mutable counter, so that inserts and deletes are the only mutations and can never desync from the score.

#### Scenario: Score reflects event count

- **WHEN** team A has 2 goal events and team B has 1 for a given match
- **THEN** the displayed score is `2 - 1`.

#### Scenario: No events means zero score

- **WHEN** a match has no `goal_events` rows
- **THEN** both teams display a score of `0`.

### Requirement: Per-event undo via delete

The admin live-match screen SHALL provide an undo control on each goal-event row while a match is still live. Tapping undo SHALL delete that exact `goal_events` row by its server-generated `id`. After deletion, the score and per-player goal counts SHALL recompute from the remaining rows.

#### Scenario: Undo removes the exact event

- **WHEN** the admin taps undo on a goal-event row with id `X`
- **THEN** the row with id `X` is deleted from `goal_events` and all other rows for the match remain unchanged.

#### Scenario: Score recomputes after undo

- **WHEN** team A had 3 goal events and the admin undoes one
- **THEN** team A's displayed score becomes `2`.

#### Scenario: Undo blocked after finish

- **WHEN** the match has `finished = true`
- **THEN** the undo control is not rendered on goal-event rows and no deletion can be triggered from the UI.

### Requirement: Goal log ordering

The admin goal log SHALL list goal events in reverse-chronological order (most recent first) using the server-generated `created_at` timestamp, so the latest event appears at the top for quick undo access.

#### Scenario: Newest event on top

- **WHEN** three goals are recorded in sequence A, B, C
- **THEN** the goal log renders C at the top, followed by B, then A.

### Requirement: Match status transitions

The admin SHALL be able to transition a match's status from `scheduled` to `live` (Start Match) and from `live` to `finished` (Finish Match) by updating the `matches` row. The "Finish Match" action SHALL additionally snapshot the final `score_a`/`score_b` from the derived event counts into the `matches` row. The "Finish Match" action SHALL be irreversible from the admin UI.

#### Scenario: Start match

- **WHEN** the admin taps "Start Match" on a scheduled match
- **THEN** the match's status becomes `live` and the admin is navigated to the live-match screen for that match.

#### Scenario: Finish match snapshots score

- **WHEN** the admin confirms "Finish Match" while team A has 2 events and team B has 1
- **THEN** the `matches` row is updated to `finished = true`, `score_a = 2`, `score_b = 1`, and the undo controls disappear.

#### Scenario: Finish is irreversible

- **WHEN** a match is `finished`
- **THEN** no "Start Match", "Finish Match", score-increment, or undo control is available for that match in the admin UI.

### Requirement: Admin writes require authentication

All `INSERT`, `UPDATE`, and `DELETE` operations on `goal_events` and `matches` from the client SHALL be performed using the authenticated Supabase session. Anonymous (no-session) write attempts SHALL be rejected by RLS and SHALL surface an error to the admin UI.

#### Scenario: Anonymous write rejected

- **WHEN** a client without a Supabase session attempts to insert a `goal_events` row
- **THEN** Supabase RLS rejects the insert and the admin UI displays an error.

#### Scenario: Authenticated write succeeds

- **WHEN** an authenticated admin inserts a `goal_events` row
- **THEN** the insert succeeds and the row is visible to subsequent reads.

### Requirement: Live-match uses real squad data

The admin live-match screen SHALL load player lists from the existing `SQUADS[teamId]` data (static `src/data/squads.ts`) for the two teams in the selected match, not from a hardcoded mock squad. Team and match metadata SHALL come from Supabase `matches`/`teams` (seeded from `tournament.ts`).

#### Scenario: Players come from real squad

- **WHEN** the admin opens the live-match screen for match `21` (PrE(A) vs CE_M)
- **THEN** the player buttons for team PrE(A) are the entries in `SQUADS["PrE(A)"]`, not the hardcoded `MOCK_MATCH.default` players.

#### Scenario: No hardcoded mock squad remains

- **WHEN** `src/pages/admin/AdminLiveMatch.tsx` is inspected
- **THEN** it does not export or reference `MOCK_MATCH` or `getMockMatch`.