## MODIFIED Requirements

### Requirement: Display player profile photo when available

The `PlayerAvatar` component SHALL render the player's profile photo (from `profile_string_link`) as a circular image when a valid photo URL is provided. The photo source SHALL be passed through the `cloudinary()` URL-transform helper so the browser requests a resized, face-cropped, auto-quality, auto-format variant sized to the avatar display box. The photo SHALL fill the avatar container using `object-cover` and maintain the existing team-color border. The avatar `<img>` element SHALL set `loading="lazy"`, `decoding="async"`, and explicit `width` and `height` attributes sized to the transformed image dimensions (default `184`×`184`) to defer below-fold fetches, decode off the main thread, and prevent layout shift.

#### Scenario: Player has a valid profile photo URL

- **WHEN** a player's `profile_string_link` is a non-empty URL (e.g., a Cloudinary image URL)
- **THEN** the `PlayerAvatar` displays the player's photo as a circular image filling the 92px avatar container, sourced from the `cloudinary()`-transformed URL, with `loading="lazy"`, `decoding="async"`, and `width`/`height` attributes set on the `<img>`.

#### Scenario: Player has no profile photo

- **WHEN** a player's `profile_string_link` is `""` (empty string)
- **THEN** the `PlayerAvatar` displays the existing football SVG icon fallback with the team-color border and tinted background.

#### Scenario: Player profile string link is "none"

- **WHEN** a player's `profile_string_link` is `"none"`
- **THEN** the `PlayerAvatar` displays the football SVG icon fallback, treating `"none"` as equivalent to no photo.
