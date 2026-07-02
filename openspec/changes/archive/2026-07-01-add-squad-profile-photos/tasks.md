## 1. PlayerAvatar Component Update

- [x] 1.1 Add a `photoUrl` prop (type `string`) to the `PlayerAvatar` component in `src/pages/MatchSquad.tsx`
- [x] 1.2 Create a helper function `isValidPhotoUrl(url: string)` that returns `false` for `""`, `"none"`, `undefined`, and `true` otherwise
- [x] 1.3 When `isValidPhotoUrl(photoUrl)` is true, render an `<img>` tag with the photo URL as `src`, `object-cover` fill, rounded-full, and an `onError` handler that swaps to the football icon fallback
- [x] 1.4 When `isValidPhotoUrl(photoUrl)` is false (or image failed to load), render the existing football SVG icon inside the team-color bordered circle (current behavior)
- [x] 1.5 Ensure the goal badge overlay (green circle with count) remains positioned at bottom-right in both photo and fallback states

## 2. Wire Up Player Data

- [x] 2.1 Update the `<PlayerAvatar>` call site in the player row to pass `photoUrl={player.profile_string_link}`

## 3. Verification

- [x] 3.1 Run `npm run typecheck` and fix any type errors
- [x] 3.2 Run `npm run lint` and fix any lint errors
- [x] 3.3 Run `npm run build` to confirm the production build succeeds
