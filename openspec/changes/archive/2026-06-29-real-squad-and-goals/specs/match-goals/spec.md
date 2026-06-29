## ADDED Requirements

### Requirement: Match goal events array

A `MATCH_EVENTS` array SHALL exist in `tournament.ts` containing goal event entries. Each entry SHALL have: `matchId` (string, referencing a match ID), `teamId` (string, referencing a team ID), and `playerId` (string, referencing a player ID). Each entry represents exactly one goal scored.

#### Scenario: Record a goal

- **WHEN** player `IS_A_07` scores a goal for team `IS(A)` in match `1`
- **THEN** a `MATCH_EVENTS` entry exists: `{ matchId: "1", teamId: "IS(A)", playerId: "IS_A_07" }`.

#### Scenario: Multiple goals by same player

- **WHEN** player `PrE_A_09` scores 2 goals in match `1`
- **THEN** there are 2 separate entries in `MATCH_EVENTS` with the same `playerId`.

#### Scenario: Empty events for unplayed matches

- **WHEN** a match has not been played yet
- **THEN** there are no `MATCH_EVENTS` entries with that match's ID.

### Requirement: Goal aggregation per player per match

The squad view SHALL compute each player's goal count for the current match by filtering `MATCH_EVENTS` where `matchId` matches and `playerId` matches the player's ID.

#### Scenario: Player scored 2 goals in a match

- **WHEN** the squad view renders for match `1` and player `PrE_A_09` has 2 goal entries for that match
- **THEN** the player row displays a goal count of 2.

#### Scenario: Player did not score

- **WHEN** the squad view renders and a player has no goal entries for the current match
- **THEN** the player row displays a goal count of 0.

### Requirement: Goal scorers sorted to top of squad view

The squad view SHALL sort players so that scorers (players with goals > 0 in the current match) appear first, ordered by goals descending. Non-scorers SHALL follow in their original squad order.

#### Scenario: Scorers appear before non-scorers

- **WHEN** the squad view renders and 3 players scored goals
- **THEN** those 3 players appear at the top of the list, sorted by goals descending, followed by the remaining players in their original squad order.

#### Scenario: No goals scored

- **WHEN** the squad view renders and no players scored goals in the match
- **THEN** all players appear in their original squad order.

### Requirement: Remove mock squad and goals data

The `MOCK_SQUAD` and `MOCK_GOALS` exports SHALL be removed from `tournament.ts`. The `MatchSquad.tsx` page SHALL use `SQUADS[teamId]` and `MATCH_EVENTS` instead.

#### Scenario: No mock data in tournament.ts

- **WHEN** `tournament.ts` is inspected
- **THEN** it does not export `MOCK_SQUAD` or `MOCK_GOALS`.

#### Scenario: Squad view uses real data

- **WHEN** the squad view renders for a match
- **THEN** it reads players from `SQUADS[teamId]` and goal counts from `MATCH_EVENTS`.
