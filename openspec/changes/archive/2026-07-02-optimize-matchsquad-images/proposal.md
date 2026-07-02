## Why

The MatchSquad page is slow to display player photos because every avatar `<img>` points at a **raw Cloudinary original** (often 1–3 MB each) into a 92×92 px box. With ~15 players rendered at once, the browser fetches and decodes 15–45 MB of images on first paint, with no preconnect, no lazy-loading, and no async decoding. The result is a visible delay before avatars appear and jank during scroll. This change cuts per-avatar payload from megabytes to ~10 KB and removes the avoidable latency around it.

## What Changes

- Introduce a `cloudinary(src, opts)` URL-transform helper in `src/lib/` that inserts Cloudinary transformation params (`c_fill`, `g_face`, `w_`, `h_`, `q_auto`, `f_auto`) into a raw Cloudinary URL after `/upload/`. Non-Cloudinary URLs pass through unchanged.
- Route all Cloudinary `<img>` sources in `MatchSquad.tsx` (player avatars) through the helper so the browser requests resized, face-cropped, auto-quality, auto-format (AVIF/WebP) variants sized to the 92 px display box (2× for retina → `w_184,h_184`).
- Add `loading="lazy"`, `decoding="async"`, and explicit `width`/`height` attributes to the player avatar `<img>` so below-fold avatars defer fetching, decode off the main thread, and do not cause layout shift.
- Add `<link rel="preconnect" href="https://res.cloudinary.com" crossorigin>` (and a `dns-prefetch` fallback) to `index.html` so the first image request skips the DNS+TLS handshake (~150 ms).
- Replace the `FootballBall` component's Cloudinary PNG source with the already-bundled `src/assets/football.svg` (imported as `footballImg`) so per-goal-badge network fetches are eliminated entirely.

## Capabilities

### New Capabilities

- `cloudinary-image-optimization`: A URL-transform helper that rewrites raw Cloudinary URLs to include resizing, face-focused crop, auto-quality, and auto-format transformation parameters, while passing non-Cloudinary URLs through unchanged.

### Modified Capabilities

- `player-profile-photo`: Avatar rendering now sources transformed (sized/compressed) Cloudinary URLs and adds `loading="lazy"`, `decoding="async"`, and explicit `width`/`height` attributes to the `<img>` element.

## Impact

- **Code**: `src/lib/` (new helper), `src/pages/MatchSquad.tsx` (avatar `<img>` + `FootballBall`), `index.html` (preconnect link).
- **Data**: No changes to `src/data/squads/*.ts` — URLs stay raw; transformation happens at render time so params remain tunable without touching 14 data files.
- **Dependencies**: No new packages. Cloudinary transformations are URL-based and require no client SDK.
- **External**: Relies on the existing Cloudinary account (`dw7kk0lvp`). Transformation counts against the account's monthly transformation quota (163 unique URLs × 1–2 sizes is well within free-tier limits).
- **Non-goals**: Self-hosting images, rewriting squad data URLs, and the `AnimatePresence` tab-switch remount are explicitly out of scope for this change.
