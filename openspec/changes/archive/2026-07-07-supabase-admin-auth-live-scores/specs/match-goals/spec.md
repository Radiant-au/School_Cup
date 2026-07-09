## MODIFIED Requirements

### Requirement: Match goal events array

Goal events SHALL be stored as rows in the Supabase `goal_events` table. Each row SHALL have: `match_id` (string, referencing a match ID), `team_id` (string, referencing a team ID), and `player_id` (string, referencing a player ID). Each row represents exactly one goal scored. The legacy `MATCH_EVENTS` array in `tournament.ts` SHALL no longer be the source of truth for goal events; it is retained only as a pre-migration seed for `supabase/seed.sql`.

#### Scenario: Record a goal

- **WHEN** player `IS_A_07` scores a goal for team `IS(A)` in match `1`
- **THEN** a `goal_events` row exists with `match_id: "1"`, `team_id: "IS(A)"`, `player_id: "IS_A_07"`.

#### Scenario: Multiple goals by same player

- **WHEN** player `PrE_A_09` scores 2 goals in match `1`
- **THEN** there are 2 separate rows in `goal_events` with the same `player_id` for that `match_id`.

#### Scenario: Empty events for unplayed matches

- **WHEN** a match has not been played yet
- **THEN** there are no `goal_events` rows with that match's `match_id`.

### Requirement: Goal aggregation per player per match

The squad view SHALL compute each player's goal count for the current match by counting `goal_events` rows where `match_id` matches and `player_id` matches the player's ID. The aggregation SHALL be performed against the Supabase `goal_events` table (via a hook), not against a local in-memory array.

#### Scenario: Player scored 2 goals in a match

- **WHEN** the squad view renders for match `1` and player `PrE_A_09` has 2 `goal_events` rows for that match
- **THEN** the player row displays a goal count of 2.

#### Scenario: Player did not score

- **WHEN** the squad view renders and a player has no `goal_events` rows for the current match
- **THEN** the player row displays a goal count of 0.
