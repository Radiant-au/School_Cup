## Context

The MatchSquad page (`src/pages/MatchSquad.tsx`) displays a list of players for each team in a match. Each player row includes a `PlayerAvatar` component — currently a 44px circle with a team-color border and a football SVG icon inside. The `Player` data model already has a `profile_string_link` field (Cloudinary URLs), but it is never consumed by the UI. Only `PrE_A_male.ts` has populated photo URLs; other squads have `""` or `"none"`.

## Goals / Non-Goals

**Goals:**
- Display the player's profile photo in the squad list when `profile_string_link` contains a valid URL.
- Gracefully fall back to the existing football icon when no photo is available (empty string, `"none"`, or broken image).
- Preserve existing visual behavior: team-color border, goal badge overlay, and scorer highlighting.

**Non-Goals:**
- Adding a dedicated player profile page or detail view.
- Modifying squad data files to add photo URLs (data entry is out of scope).
- Image optimization, cropping, or CDN transformations beyond what Cloudinary already provides.

## Decisions

**1. Modify the existing inline `PlayerAvatar` component rather than extracting it to a shared component.**
The avatar is only used in `MatchSquad.tsx`. Extracting it to `src/components/shared/` would be premature — if another consumer appears later, extraction can happen then.

**2. Add a `photoUrl` prop to `PlayerAvatar` instead of passing the full `Player` object.**
Keeps the component's interface minimal and focused. The caller passes `player.profile_string_link` as `photoUrl`.

**3. Use a plain `<img>` tag with an `onError` handler for fallback, rather than the shadcn `Avatar` component.**
The shadcn `Avatar` (Radix-based) adds `AvatarImage` + `AvatarFallback` primitives, but the current `PlayerAvatar` has a custom circular container with team-color borders and a goal badge overlay. Wrapping shadcn's Avatar inside this custom container adds complexity for little benefit. A plain `<img>` with `onError` state is simpler and fits the existing pattern.

**4. Treat `""`, `"none"`, and `undefined` as "no photo" — show the football icon fallback.**
A helper function `isValidPhotoUrl(url)` centralizes this check.

**Alternatives considered:**
- _Use shadcn `Avatar` component_: Rejected — the custom container (border, badge overlay) makes integration awkward. Revisit if avatar is reused elsewhere.
- _Always show photo with a loading skeleton_: Rejected — most squads don't have photos yet, so the skeleton would flash for most users. The football icon fallback is the established visual.

## Risks / Trade-offs

- **[Broken image URLs]** → Mitigation: `onError` handler on `<img>` swaps to the football icon fallback if the image fails to load.
- **[Most squads have no photos]** → Accepted. The football icon fallback is the current behavior and looks intentional. As photo data is added to squad files, photos will appear automatically.
- **[Performance with many images]** → Low risk. Squad lists are ~15 players; Cloudinary serves optimized images. No lazy loading needed at this scale.
