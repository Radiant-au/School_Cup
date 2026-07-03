## Why

`MatchDesign.tsx` contains the approved visual design for the MatchSquad page with large player cards (92px avatars, position badges, faded jersey number watermarks, goal badges). However, `MatchSquad.tsx` currently uses a compact row-based layout with real data. This change implements the exact design from `MatchDesign.tsx` in `MatchSquad.tsx` while preserving all real data integration (player names, profile photos, real goals from `MATCH_EVENTS`).

## What Changes

- Replace compact player rows with large card-style `PlayerCard` components featuring 92px circular avatars
- Add faded jersey number watermark (72px, 4% opacity) positioned behind each player card
- Add position badges (GK, DEF, MID, FWD) derived from jersey number ranges (1=GK, 2-4=DEF, 5-7=MID, 8+=FWD)
- Replace `GoalIndicator` with `GoalBadge` pill component showing football icons with green tint
- Add green goal count badge on avatar for scorers (24px circle, bottom-right)
- Apply green tinting to scorer cards (`bg-green-500/5 border-green-500/20`)
- Use real player data: names from `SQUADS`, profile photos from `player.profile_string_link`, goals aggregated from `MATCH_EVENTS`
- Maintain existing match header, team tabs, and routing logic

## Capabilities

### New Capabilities

- `player-card-design`: Covers the large player card UI with 92px avatars, position badges, faded jersey watermarks, goal badges, and scorer highlighting — matching `MatchDesign.tsx` exactly.

### Modified Capabilities

_(none — this is a visual redesign preserving all existing data behavior)_

## Impact

- **Affected code**: `src/pages/MatchSquad.tsx` — replace `PlayerAvatar`, `GoalIndicator` with new `PlayerCard`, `GoalBadge` components; update player list rendering
- **Dependencies**: No new dependencies; uses existing Tailwind v4 utilities, framer-motion
- **APIs/data**: No changes to data model, `MATCH_EVENTS`, `SQUADS`, or tournament data
- **Routing**: No changes
