## Context

The School Cup 2026 app currently constrains all views to a 430px-wide phone-shaped column via `max-w-[430px]` on `MobileLayout` and `MatchSquad`. The standings table renders 8 stat columns (P W D L GF GA GD Pts) with plain-text team names and no logos. Team logos exist only on `Match` objects as Cloudinary URLs; the `Team` interface has no `logo` field. The `TeamCrest` component is duplicated across `FixtureTab.tsx` and `MatchSquad.tsx` with slight variations.

## Goals / Non-Goals

**Goals:**
- Make the app fill the full viewport width on mobile and tablet devices.
- Reposition the bottom navigation tabs to the right side of the screen.
- Redesign the standings table to FotMob-style compact columns: PL W D L +/- GD PTS.
- Display a small team logo (crest) inline before each team name in the table.
- Add a `logo` field to the `Team` interface so logos are team-level data, not match-level.
- Extract a single shared `TeamCrest` component for reuse across all views.

**Non-Goals:**
- Responsive breakpoints for desktop (the app remains mobile-first).
- Live match data or dynamic table computation from match results.
- Changes to the knockout/cup bracket view.
- Changes to the fixture tab layout beyond using the shared `TeamCrest`.

## Decisions

### 1. Remove `max-w-[430px]` from layout containers

**Decision**: Remove the `max-w-[430px]` constraint from both `MobileLayout.tsx` and `MatchSquad.tsx`. The container becomes `w-full min-h-[100dvh]` with no max-width cap.

**Rationale**: The 430px cap was a design choice to simulate a phone frame on desktop, but it wastes horizontal space on actual mobile devices with wider screens (most modern phones are 375-430px CSS width, tablets are 768px+). Removing it lets content breathe.

**Alternative considered**: Keeping `max-w-[430px]` only on desktop via a media query. Rejected because the app is mobile-first and the phone-frame aesthetic isn't needed.

### 2. Right-aligned bottom navigation

**Decision**: Change the bottom nav from `justify-around` (evenly spaced) to right-aligned positioning. The nav bar remains fixed at the bottom but tab buttons cluster to the right side with compact spacing.

**Rationale**: User explicitly requested tabs "absolute right." Right-alignment keeps tabs within thumb reach on mobile and pairs well with the full-width layout.

### 3. Team logo on the `Team` interface

**Decision**: Add an optional `logo?: string` field to the `Team` interface. Populate it with the Cloudinary URLs already present in `MATCHES` (extract the unique URL per team).

**Rationale**: Logos are team-level data, not match-level. Currently the same URL is repeated in every match entry. Centralizing on `Team` eliminates duplication and makes logos available to the table without match lookups.

**Alternative considered**: Creating a separate `TEAM_LOGOS` lookup map. Rejected because adding the field directly to `Team` is cleaner and keeps data co-located.

### 4. Shared `TeamCrest` component

**Decision**: Extract `TeamCrest` into `src/components/shared/TeamCrest.tsx` with a `size` prop (defaulting to `sm` for table, `md` for fixtures, `lg` for match detail). Replace the duplicated inline versions in `FixtureTab.tsx` and `MatchSquad.tsx`.

**Rationale**: Three components render team crests (FixtureTab, MatchSquad, and now TableTab). A shared component with size variants eliminates duplication and ensures visual consistency.

### 5. FotMob-style table columns

**Decision**: Replace the current 8 columns (P W D L GF GA GD Pts) with 7 columns: PL W D L +/- GD PTS. The `+/-` column shows signed goal difference (e.g., `+3`, `-1`, `0`). The `GD` column shows the absolute numeric value. Remove GF and GA columns entirely.

**Rationale**: Matches FotMob's compact format. The signed +/- gives quick visual indication of form, while GD provides the raw number for sorting. Removing GF/GA reduces horizontal clutter.

### 6. Table logo sizing

**Decision**: Table crests use the `sm` size variant (20x20px) rendered inline before the team name with a small gap. This keeps row height compact while providing visual identification.

**Rationale**: Table rows need to stay dense. A 20px crest is large enough to recognize but small enough to not inflate row height.

## Risks / Trade-offs

- **[Wider layout on very large screens]** → Without a max-width cap, the app could look stretched on desktop monitors. Mitigation: The app is mobile-first; desktop users are not the target audience. Can add a reasonable max-width later if needed.
- **[Logo URLs hardcoded in Team data]** → Cloudinary URLs are baked into the data file. If URLs change, the data file must be updated. Mitigation: This is a static data app; URL changes are rare and manual.
- **[+/- and GD column redundancy]** → Both columns derive from the same underlying value (goals for minus goals against). Mitigation: This matches FotMob's format exactly as requested. The +/- column uses color coding (green for positive, red for negative) to add visual value beyond the raw number.
