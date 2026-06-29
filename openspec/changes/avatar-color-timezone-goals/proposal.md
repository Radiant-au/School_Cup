## Why

The player avatar circle only shows team color for goal scorers, but should show it for all players to reinforce team identity. The "today" date uses UTC which can be wrong for Myanmar (UTC+6:30) — e.g., at 1am Myanmar time on June 30, UTC still says June 29. Goal badges use team color but should be a consistent green to clearly indicate scoring.

## What Changes

- Player avatar circle in squad view SHALL always use team color for border and background tint, regardless of whether the player scored.
- The `TODAY` constant in `FixtureTab` SHALL compute the current date in Myanmar timezone (UTC+6:30) instead of UTC.
- Goal badge on player avatar SHALL use green (`#22c55e`) instead of team color.

## Capabilities

### New Capabilities

### Modified Capabilities
- `team-color`: Avatar circle always uses team color (not just for scorers). Goal badge uses green instead of team color.
- `dynamic-today`: TODAY uses Myanmar timezone (UTC+6:30) instead of UTC.

## Impact

- **`src/pages/MatchSquad.tsx`**: `PlayerAvatar` always applies team color to border/bg. Goal badge color changes from `color` to green.
- **`src/components/fixtures/FixtureTab.tsx`**: `TODAY` computed with Myanmar timezone offset.
