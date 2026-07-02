## ADDED Requirements

### Requirement: Cloudinary URL transformation helper

The system SHALL provide a `cloudinary(src, opts)` helper in `src/lib/` that rewrites a raw Cloudinary image URL to include resizing, face-focused crop, auto-quality, and auto-format transformation parameters. The helper SHALL insert the transformation segment `/c_fill,g_face,w_<w>,h_<h>,q_auto,f_auto/` immediately after the `/upload/` segment of any URL whose origin is `https://res.cloudinary.com/`. The default width and height SHALL be `184`. Non-Cloudinary URLs SHALL pass through unchanged.

#### Scenario: Raw Cloudinary URL with default size

- **WHEN** `cloudinary("https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782968691/HninEainKyaw_16_mvlsew.jpg")` is called with no `opts`
- **THEN** the returned URL is `https://res.cloudinary.com/dw7kk0lvp/image/upload/c_fill,g_face,w_184,h_184,q_auto,f_auto/v1782968691/HninEainKyaw_16_mvlsew.jpg`.

#### Scenario: Raw Cloudinary URL with custom size

- **WHEN** `cloudinary(src, { w: 200, h: 200 })` is called with a `res.cloudinary.com` URL
- **THEN** the returned URL contains `/c_fill,g_face,w_200,h_200,q_auto,f_auto/` after `/upload/`.

#### Scenario: Non-Cloudinary URL passes through

- **WHEN** `cloudinary("/assets/football.svg")` or any URL not starting with `https://res.cloudinary.com/` is called
- **THEN** the helper returns the input string unchanged.

#### Scenario: Cloudinary URL already containing a transformation segment

- **WHEN** a `res.cloudinary.com` URL already has a transformation segment after `/upload/` (i.e. the path component immediately following `/upload/` is not starting with `v` followed by digits)
- **THEN** the helper returns the input URL unchanged to avoid producing a malformed path.

### Requirement: Goal badge image uses bundled asset

The `FootballBall` component in `MatchSquad.tsx` SHALL source its image from the bundled `src/assets/football.svg` import (`footballImg`) instead of a remote Cloudinary URL, so that per-goal-badge rendering incurs no network fetch.

#### Scenario: FootballBall renders without network fetch

- **WHEN** the `GoalBadge` renders one or more `FootballBall` instances
- **THEN** each `FootballBall` `<img>` `src` resolves to the bundled football SVG asset, not a `res.cloudinary.com` URL.
