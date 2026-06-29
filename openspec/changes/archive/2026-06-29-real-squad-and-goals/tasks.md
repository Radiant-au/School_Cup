## 1. Data Types

- [x] 1.1 Add `Player` interface to `src/data/tournament.ts` with fields: `id`, `name`, `year`, `number`, `profile_string_link`.
- [x] 1.2 Add `MatchEvent` interface to `tournament.ts` with fields: `matchId`, `teamId`, `playerId`.
- [x] 1.3 Add optional `color?: string` field to the `Team` interface.

## 2. Squad Files

- [x] 2.1 Create `src/data/squads/` directory.
- [x] 2.2 Move `src/data/IS_A_male.ts` into `src/data/squads/`, add `id` field to each player (format: `IS_A_01`, `IS_A_02`, ...), and type the export as `Player[]`.
- [x] 2.3 Move `src/data/IS_B_male.ts` into `src/data/squads/`, add `id` field to each player (format: `IS_B_01`, `IS_B_02`, ...), and type the export as `Player[]`.
- [x] 2.4 Create `src/data/squads/index.ts` barrel file exporting `SQUADS: Record<string, Player[]>` map keyed by team ID.

## 3. Match Events & Team Colors

- [x] 3.1 Add `MATCH_EVENTS` array to `tournament.ts` (initially empty or with sample data for the finished demo match).
- [x] 3.2 Add `color` values to `TEAMS` entries (IS(A) = yellow `#FFD700`, IS(B) = brown `#8B4513`, others as placeholders).

## 4. MatchSquad Page Update

- [x] 4.1 Update `MatchSquad.tsx` to import `SQUADS` and `MATCH_EVENTS` instead of `MOCK_SQUAD` and `MOCK_GOALS`.
- [x] 4.2 Replace `MOCK_SQUAD` usage with `SQUADS[match.teamA]` / `SQUADS[match.teamB]` lookup, with fallback to empty array if squad is undefined.
- [x] 4.3 Add goal aggregation logic: for the current match, count goals per player from `MATCH_EVENTS`.
- [x] 4.4 Sort squad list so scorers (goals > 0) appear first (by goals descending), then non-scorers in original order.
- [x] 4.5 Update `PlayerAvatar` and `GoalIndicator` to use team `color` as accent instead of hardcoded green.
- [x] 4.6 Update the goal count column header from "G" to show the team color accent.

## 5. Cleanup

- [x] 5.1 Remove `MOCK_SQUAD` and `MOCK_GOALS` exports from `tournament.ts`.
- [x] 5.2 Remove old `src/data/IS_A_male.ts` and `src/data/IS_B_male.ts` from root data directory (now in squads/).

## 6. Verification

- [x] 6.1 Run `npm run typecheck` and fix any type errors.
- [x] 6.2 Run `npm run lint` and fix any lint violations.
- [x] 6.3 Run `npm run build` and verify the build succeeds.
