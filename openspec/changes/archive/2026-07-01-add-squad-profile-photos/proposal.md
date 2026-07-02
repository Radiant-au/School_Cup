## Why

The `Player` data model already includes a `profile_string_link` field for player photos (populated with Cloudinary URLs for PrE_A_male, partially for others), but the MatchSquad page ignores it entirely — the `PlayerAvatar` component renders a generic football SVG icon for every player. Displaying actual player photos makes the squad view more recognizable and engaging.

## What Changes

- The `PlayerAvatar` component in `MatchSquad.tsx` will render the player's profile photo (from `profile_string_link`) when a valid URL is available, falling back to the current football icon when the link is empty, `"none"`, or invalid.
- No data model changes — `profile_string_link` already exists on `Player`.
- No new routes or pages — this is a visual enhancement to the existing squad view.

## Capabilities

### New Capabilities

- `player-profile-photo`: Display player profile photos in the squad list, using `profile_string_link` with graceful fallback to the existing football icon.

### Modified Capabilities

_(none — the `squad-data` spec already defines the `profile_string_link` field; no requirement changes needed there)_

## Impact

- **`src/pages/MatchSquad.tsx`** — The inline `PlayerAvatar` component will be updated to conditionally render an `<img>` tag when a valid photo URL exists.
- **No new dependencies** — the existing shadcn `Avatar` component (`src/components/ui/avatar.tsx`) is available but unused; this change can leverage it or use a plain `<img>` within the existing avatar container.
- **No data changes** — all squad files already have the `profile_string_link` field.
