## Context

`MatchSquad.tsx` renders ~15 player avatars per team. Each `<img src={profile_string_link}>` points at a raw Cloudinary original like `https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782968691/HninEainKyaw_16_mvlsew.jpg` — no transformation params. The avatar box is `w-[92px] h-[92px]`, so the browser downloads full-resolution phone-camera uploads (commonly 1–3 MB each) and decodes them on the main thread. With 15 avatars fetched in parallel, no preconnect to `res.cloudinary.com`, and no lazy-loading, first paint is image-bound and scroll janks during decode. The site is a static client app (no backend); Cloudinary is already the de-facto image CDN, and the `dw7kk0lvp` account is in active use across all squad data files.

Cloudinary supports URL-based transformations: inserting a transformation segment after `/upload/` (e.g. `/c_fill,g_face,w_184,h_184,q_auto,f_auto/`) makes Cloudinary resize, face-crop, auto-quality, and auto-format (AVIF/WebP by `Accept` header) on the fly. The transformed variants are cached on Cloudinary's CDN after first request.

## Goals / Non-Goals

**Goals:**
- Cut per-avatar payload from megabytes to ~10 KB (sized to 2× the 92 px display box for retina).
- Eliminate the ~150 ms DNS+TLS penalty on the first image request via preconnect.
- Defer below-fold avatar fetches and move decode off the main thread.
- Keep transformation params tunable without editing 14 squad data files.
- Make the per-goal `FootballBall` badge fetch-free.

**Non-Goals:**
- Self-hosting images or rewriting URLs in `src/data/squads/*.ts`.
- Touching the `AnimatePresence` tab-switch remount in `MatchSquad.tsx`.
- Applying the helper to `TeamCrest` or `MobileLayout` logos in this change (those are separate, low-volume and can reuse the helper later).
- Adding a client-side image loader / blur-up placeholder UX.

## Decisions

### Decision 1: Render-layer URL transformation helper (not data-layer rewrite)

A `cloudinary(src, opts)` helper in `src/lib/` (alongside `utils.ts`) inserts the transformation segment after `/upload/`. Squad data files keep raw URLs.

**Rationale**: One helper, used at the `<img>` boundary, keeps the 163 raw URLs in 14 data files untouched. Tuning `w`/`q` later is a one-line change. The runtime cost of a string splice per avatar is negligible.

**Alternatives considered**:
- *Data-layer rewrite* (edit every URL in `src/data/squads/*.ts` to include params): locks params into 14 files; any retune is a 163-edit diff. Rejected.
- *Client SDK* (`cloudinary-react` / Cloudinary base component): adds a dependency for a feature achievable with string manipulation. Rejected.

### Decision 2: Transformation params — `c_fill,g_face,w_184,h_184,q_auto,f_auto`

- `c_fill` + `w_184,h_184` — crop to 184×184 (2× the 92 px box for retina; ≤ 2× DPR covers the vast majority of devices without over-serving).
- `g_face` — face-focused crop so avatars keep the face in frame (these are player headshots).
- `q_auto` — Cloudinary picks quality (~q40 for photos).
- `f_auto` — serves AVIF/WebP where the browser advertises support via `Accept`.

**Rationale**: This combination is Cloudinary's recommended "responsive avatar" recipe. Expected per-image size: ~5–15 KB.

**Alternatives considered**:
- *Larger `w_` (e.g. 368 for 4×)*: over-serves; payload grows quadratically for little visible gain at 92 px. Rejected.
- *Fixed `f_webp`*: loses AVIF on supporting browsers. `f_auto` strictly better. Rejected.
- *`g_auto` instead of `g_face`*: `g_auto` is a paid-tier feature on some plans; `g_face` is broadly available and sufficient for headshots. Rejected.

### Decision 3: Helper signature and passthrough behavior

```
cloudinary(src: string, opts?: { w?: number; h?: number }): string
```

- Matches `https://res.cloudinary.com/<cloud>/image/upload/...` and inserts `/c_fill,g_face,w_<w>,h_<h>,q_auto,f_auto/` after `/upload/`.
- Default `w`/`h` = `184`.
- Any URL not starting with `https://res.cloudinary.com/` is returned unchanged (so the bundled `football.svg` and any future non-Cloudinary URL pass through safely).
- If a URL already contains a transformation segment (rare; none in current data), the helper does not double-insert — it returns the URL unchanged to avoid malformed paths.

### Decision 4: Avatar `<img>` attributes

On the player avatar `<img>` in `PlayerCard`:
- `loading="lazy"` — below-fold avatars defer fetch until near-viewport.
- `decoding="async"` — decode off main thread.
- `width={184}` and `height={184}` — intrinsic dimensions to prevent layout shift (the CSS box still clamps to 92 px via the parent's `w-[92px] h-[92px]` + `object-cover`).

The fallback football-SVG `<img>` is already in-bundle and small; it does not need these attributes, but adding `loading="lazy"` is harmless.

### Decision 5: Preconnect in `index.html`

Add to `<head>`:
```html
<link rel="preconnect" href="https://res.cloudinary.com" crossorigin />
<link rel="dns-prefetch" href="https://res.cloudinary.com" />
```

`crossorigin` is required because Cloudinary image responses are fetched in CORS context by default for `<img>`? Actually plain `<img>` does not need CORS; however `crossorigin` on preconnect is harmless and future-proofs any `crossorigin` image fetch. `dns-prefetch` is a fallback for browsers that ignore `preconnect`.

### Decision 6: `FootballBall` uses bundled SVG

`MatchSquad.tsx:20` currently hardcodes a Cloudinary PNG for the goal badge. Replace its `src` with the already-imported `footballImg` (`src/assets/football.svg`). The `FootballBall` is rendered up to 3× per scorer card, so eliminating its network fetch removes up to ~45 redundant requests on a goal-heavy match view (browser cache dedupes after first, but the first paint still pays).

## Risks / Trade-offs

- **[Risk] `g_face` fails on non-face images** → A few avatars may not be headshots; `g_face` falls back to default crop behavior (center) when no face is detected, so the image still renders. No broken images. Acceptable.
- **[Risk] Cloudinary transformation quota** → 163 unique URLs × 1 size variant = 163 transformations, generated lazily on first request. Free tier allows ~6,500/month; this is well within limits. Mitigation: none needed; monitor if additional sizes are added later.
- **[Risk] `loading="lazy"` delays above-the-fold avatars** → The first ~2–3 avatars are above the fold on most viewports; `loading="lazy"` still fetches them promptly because they're near the viewport. If perceived lag appears on first avatar, the attribute can be scoped to below-fold only, but standard browser behavior handles this correctly.
- **[Risk] `width`/`height` of 184 mismatch with 92 px CSS box** → The parent container clamps the rendered size via Tailwind `w-[92px] h-[92px]` + `object-cover`, so intrinsic 184×184 only affects aspect-ratio reservation, not rendered size. No layout shift because the box is fixed.
- **[Trade-off] External Cloudinary dependency retained** → Matches the non-goal of self-hosting. The app remains dependent on the `dw7kk0lvp` account and Cloudinary availability. Acceptable for this change; self-hosting can be a future change.
- **[Trade-off] Transformation happens at runtime per render** → Each avatar render calls `cloudinary(src)` once. The cost is a single regex/string splice; negligible vs. the network fetch it precedes. No memoization needed unless profiling shows otherwise.

## Open Questions

- None blocking. The helper default size (184) is derived from the existing 92 px box; if the avatar size changes in a future redesign, the helper default or the call-site `opts` should be updated to match (2× new size).
