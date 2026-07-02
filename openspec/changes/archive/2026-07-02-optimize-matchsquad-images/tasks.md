## 1. Cloudinary URL-transform helper

- [x] 1.1 Create `src/lib/cloudinary.ts` exporting `cloudinary(src: string, opts?: { w?: number; h?: number }): string` with default `w=184`, `h=184`.
- [x] 1.2 Implement the URL rewrite: insert `/c_fill,g_face,w_<w>,h_<h>,q_auto,f_auto/` after `/upload/` for `https://res.cloudinary.com/` URLs only.
- [x] 1.3 Implement passthrough for non-Cloudinary URLs and for Cloudinary URLs that already contain a transformation segment (return input unchanged).
- [x] 1.4 Verify behavior manually against a sample squad URL (transformed) and against `footballImg` (passthrough).

## 2. MatchSquad avatar `<img>` updates

- [x] 2.1 Import the `cloudinary` helper into `src/pages/MatchSquad.tsx`.
- [x] 2.2 Wrap the avatar `<img>` `src={profile_string_link}` in `PlayerCard` with `cloudinary(profile_string_link)`.
- [x] 2.3 Add `loading="lazy"`, `decoding="async"`, `width={184}`, `height={184}` attributes to the avatar `<img>`.
- [x] 2.4 Confirm the fallback football-SVG `<img>` branch is unaffected (it uses `footballImg`, which passes through the helper unchanged if wrapped, or stays unwrapped — either is acceptable).

## 3. FootballBall uses bundled SVG

- [x] 3.1 Replace the hardcoded `https://res.cloudinary.com/.../76adb940-...png` `src` in `FootballBall` with the already-imported `footballImg`.
- [x] 3.2 Confirm `FootballBall` renders the bundled SVG with no network request to `res.cloudinary.com`.

## 4. Preconnect to Cloudinary

- [x] 4.1 Add `<link rel="preconnect" href="https://res.cloudinary.com" crossorigin />` to the `<head>` in `index.html`.
- [x] 4.2 Add `<link rel="dns-prefetch" href="https://res.cloudinary.com" />` as a fallback, placed after the preconnect.

## 5. Verification

- [x] 5.1 Run `npm run typecheck` and resolve any errors.
- [x] 5.2 Run `npm run lint` and resolve any errors.
- [x] 5.3 Run `npm run build` and confirm it succeeds.
- [ ] 5.4 Run `npm run dev`, open the MatchSquad route, and confirm in DevTools Network that avatar requests now hit transformed URLs (`/c_fill,g_face,w_184,h_184,q_auto,f_auto/...`) and are ~5–15 KB each instead of megabytes.
- [ ] 5.5 Confirm below-fold avatars defer fetching until scroll (Network panel: avatars appear as requests only when scrolled into view).
- [x] 5.6 Confirm the `FootballBall` goal badge no longer issues a `res.cloudinary.com` request.
