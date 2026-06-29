## Why

The squad view currently uses mock data (`MOCK_SQUAD`, `MOCK_GOALS`) with generic "Player 1" names. Real squad member lists already exist per major (e.g., `IS_A_male.ts`, `IS_B_male.ts`) but are not wired into the app. Goal tracking needs a per-match event system so scorers can be recorded after each match and displayed at the top of the squad view.

## What Changes

- Add a unique `id` field to each player in squad data files (format: `{major}_{group}_{seq}`, e.g., `IS_A_01`).
- Create a `MATCH_EVENTS` array in `tournament.ts` for recording goals — each entry is `{ matchId, teamId, playerId }`. One entry per goal scored.
- Add a `color` field (hex string) to the `Team` interface for team identity color (e.g., IS(A) = yellow, IS(B) = brown).
- Create a `src/data/squads/` directory with one file per team, each exporting a typed squad array. Add a barrel `index.ts` that exports a `SQUADS` lookup map (`teamId → players[]`).
- Replace `MOCK_SQUAD` and `MOCK_GOALS` usage in `MatchSquad.tsx` with real squad data from `SQUADS[teamId]` and goal aggregation from `MATCH_EVENTS`.
- Sort the squad view so goal scorers appear at the top (by goals descending), followed by non-scorers in original squad order.
- Use the team `color` as an accent in the squad view (e.g., goal indicator badge, accent bar).
- Remove `MOCK_SQUAD` and `MOCK_GOALS` from `tournament.ts`.

## Capabilities

### New Capabilities
- `squad-data`: Real squad member lists per team with player IDs, organized in `src/data/squads/` with a barrel index lookup.
- `match-goals`: Per-match goal event tracking via `MATCH_EVENTS` array, with aggregation for squad view display.
- `team-color`: Team identity color on the `Team` interface, used as accent color in squad and match views.

### Modified Capabilities


## Impact

- **`src/data/tournament.ts`**: Add `color` to `Team` interface, add `MATCH_EVENTS` array, remove `MOCK_SQUAD` and `MOCK_GOALS`.
- **`src/data/squads/`** (new directory): 13 squad files + barrel `index.ts` exporting `SQUADS` map.
- **`src/data/IS_A_male.ts`**, **`IS_B_male.ts`**: Move into `squads/`, add `id` field to each player, update interface.
- **`src/pages/MatchSquad.tsx`**: Replace mock data with real squad lookup + goal aggregation, sort scorers to top, use team color accent.
