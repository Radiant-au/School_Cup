## Why

The MatchSquad player list currently uses a basic vertical list with minimal visual hierarchy. Player rows lack clear separation, the column headers are understated, and the overall layout doesn't make effective use of spacing or typography to distinguish scorers from non-scorers. Improving the styling will make the squad view more polished, readable, and visually consistent with the rest of the app's design language.

## What Changes

- Redesign player row layout with improved spacing, padding, and visual separation between rows
- Enhance the column header row with clearer typography and alignment
- Improve scorer highlighting with better background treatment, borders, and visual emphasis
- Refine the player avatar area for better alignment and visual weight
- Improve jersey number and goal indicator positioning and styling
- Add subtle dividers or card-like treatments to distinguish individual player rows
- Better use of typography scale and color contrast for player names, numbers, and stats

## Capabilities

### New Capabilities

- `player-list-styling`: Covers the redesigned player list UI in MatchSquad — row layout, spacing, typography, scorer highlighting, column headers, avatar alignment, and goal/number indicator styling.

### Modified Capabilities

_(none — this is a pure visual/styling improvement with no behavior or data-model changes)_

## Impact

- **Affected code**: `src/pages/MatchSquad.tsx` — player list rendering section, `PlayerAvatar` component, `GoalIndicator` component, column header markup
- **Dependencies**: No new dependencies; uses existing Tailwind v4 utilities, framer-motion, and shadcn/ui primitives
- **APIs/data**: No changes to data model, tournament data, or squad data
- **Routing**: No changes
