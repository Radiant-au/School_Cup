## Context

The app currently uses `MOCK_SQUAD` (11 generic "Player N" entries) and `MOCK_GOALS` (hardcoded per-player-number goal counts) in `MatchSquad.tsx`. Real squad data exists in `src/data/IS_A_male.ts` and `IS_B_male.ts` with Burmese names and academic year, but no player IDs. The `Team` interface has no color field. There is no goal event tracking system.

13 teams need squad files. Only 2 exist so far; the user will add the remaining 11 later. The data must be structured so new squad files can be dropped in with minimal friction.

## Goals / Non-Goals

**Goals:**
- Wire real squad data (with player IDs) into the squad view, replacing mocks.
- Create a `MATCH_EVENTS` system for recording goals per match, easy to edit after each game.
- Add team color to the `Team` interface for visual identity.
- Sort squad view so goal scorers appear at the top.
- Use team color as accent in the squad view.

**Non-Goals:**
- Assists, own goals, or any event type beyond goals.
- Dynamic table computation from match results (table stats remain zeroed for now).
- Player profile pages or detailed stats views.
- Editing squad data through a UI (all edits are direct file changes).

## Decisions

### 1. Player ID format: `{major}_{group}_{seq}`

**Decision**: Each player gets a string ID like `IS_A_01`, `CE_B_03`, `PrE_F_07`. The sequence is zero-padded to 2 digits.

**Rationale**: Human-readable, encodes team membership, easy to scan in `MATCH_EVENTS`. Avoids numeric IDs that are meaningless without a lookup.

**Alternative considered**: UUIDs or auto-increment numbers. Rejected because they're opaque and hard to debug when editing match events manually.

### 2. Flat goal events in `MATCH_EVENTS`

**Decision**: A single `MATCH_EVENTS` array in `tournament.ts`. Each goal is one entry: `{ matchId: string, teamId: string, playerId: string }`. No assists, no event types.

**Rationale**: Simplest possible structure for manual editing after a match. One line per goal. Aggregation is a simple `.filter().length` call. Can be extended later with a `type` field if needed.

**Alternative considered**: Nesting goals inside `Match` objects (e.g., `goalsA: [{ playerId, goals }]`). Rejected because it requires editing the match object after every game. A separate flat array is easier to append to.

### 3. Team color on `Team` interface

**Decision**: Add `color?: string` (hex value) to the `Team` interface. Populate with known colors (IS(A) = yellow, IS(B) = brown), leave others as placeholder or undefined.

**Rationale**: Color is team identity metadata, belongs alongside name and logo. The squad view uses it for accent styling (goal badge color, header bar). Keeping it on `Team` centralizes all team branding.

### 4. Squad files in `src/data/squads/` with barrel index

**Decision**: Move squad files into `src/data/squads/`. Each file exports a typed `Player[]` array. A barrel `index.ts` exports a `SQUADS: Record<string, Player[]>` map keyed by team ID (matching `TEAMS[].id`).

**Rationale**: Clean separation from tournament data. The barrel index provides a single import point. Adding a new team = add file + add one line to the index.

### 5. Shared `Player` interface in `tournament.ts`

**Decision**: Define the `Player` interface in `tournament.ts` alongside `Team` and `Match`. Squad files import and use this type.

**Rationale**: Keeps all core data types in one place. Squad files are just data arrays, not type definitions.

### 6. Squad view goal aggregation

**Decision**: In `MatchSquad.tsx`, for the current match, filter `MATCH_EVENTS` by `matchId` and `teamId`, then count goals per `playerId`. Merge counts into the squad array and sort: scorers first (by goals desc), then non-scorers in original order.

**Rationale**: Simple O(n) aggregation. No pre-computation needed. The sort is stable — non-scorers maintain their squad order.

## Risks / Trade-offs

- **[Incomplete squad files]** → Only 2 of 13 squad files exist. The `SQUADS` map will have missing entries. Mitigation: Fall back to `MOCK_SQUAD`-style placeholder when `SQUADS[teamId]` is undefined, so the app doesn't crash.
- **[Player ID typos in MATCH_EVENTS]** → Manual editing could reference non-existent player IDs. Mitigation: TypeScript won't catch this at compile time since IDs are strings. Could add a runtime validation helper later.
- **[Color accessibility]** → Some team colors may be hard to read on the dark background. Mitigation: Use colors as accents (borders, badges) not as text color. Fall back to default accent if color is undefined.
