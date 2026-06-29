## Why

The current mobile layout is constrained to a 430px max-width column, wasting horizontal space on wider phones and tablets. The standings table lacks team logos and uses verbose columns (GF, GA) that don't match the compact FotMob-style format users expect. The bottom navigation tabs are centered rather than positioned to the right.

## What Changes

- Remove the `max-w-[430px]` constraint from `MobileLayout` so the app fills the full viewport width on all devices.
- Reposition the bottom navigation tabs to be absolutely positioned to the right side of the screen.
- Redesign the standings table columns from `P W D L GF GA GD Pts` to the compact FotMob format: `PL W D L +/- GD PTS` (removing GF and GA, adding signed +/- column).
- Add a `logo` field to the `Team` interface in `tournament.ts` so each team carries its own crest URL.
- Render a small team logo (crest) inline before the team name in the standings table.
- Extract the duplicated `TeamCrest` component into a single shared component used across fixtures, table, and match views.

## Capabilities

### New Capabilities
- `fullscreen-mobile-layout`: Full-width mobile layout without the 430px cap, and right-aligned bottom navigation tabs.
- `standings-table-redesign`: FotMob-style compact table columns (PL W D L +/- GD PTS) with inline team logos.

### Modified Capabilities


## Impact

- **`src/components/layout/MobileLayout.tsx`**: Remove `max-w-[430px]` from container and nav, reposition tabs to right.
- **`src/components/table/TableTab.tsx`**: Rewrite column headers and cells to FotMob format, add team logo rendering.
- **`src/data/tournament.ts`**: Add `logo` field to `Team` interface, populate with Cloudinary URLs extracted from `MATCHES`.
- **`src/components/`**: Extract shared `TeamCrest` component to replace duplicated versions in `FixtureTab.tsx` and `MatchSquad.tsx`.
- **`src/pages/MatchSquad.tsx`**: Update to use shared `TeamCrest` (also has its own `max-w-[430px]` to address).
