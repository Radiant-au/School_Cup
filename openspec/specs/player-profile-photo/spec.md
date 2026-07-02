# Player Profile Photo

## Purpose

Display player profile photos in the `PlayerAvatar` component with appropriate fallbacks when photos are unavailable or fail to load.

## Requirements

### Requirement: Display player profile photo when available

The `PlayerAvatar` component SHALL render the player's profile photo (from `profile_string_link`) as a circular image when a valid photo URL is provided. The photo SHALL fill the avatar container using `object-cover` and maintain the existing team-color border.

#### Scenario: Player has a valid profile photo URL

- **WHEN** a player's `profile_string_link` is a non-empty URL (e.g., a Cloudinary image URL)
- **THEN** the `PlayerAvatar` displays the player's photo as a circular image filling the 44px avatar container.

#### Scenario: Player has no profile photo

- **WHEN** a player's `profile_string_link` is `""` (empty string)
- **THEN** the `PlayerAvatar` displays the existing football SVG icon fallback with the team-color border and tinted background.

#### Scenario: Player profile string link is "none"

- **WHEN** a player's `profile_string_link` is `"none"`
- **THEN** the `PlayerAvatar` displays the football SVG icon fallback, treating `"none"` as equivalent to no photo.

### Requirement: Fallback on image load failure

If the player's profile photo URL is present but the image fails to load (network error, broken URL, etc.), the `PlayerAvatar` SHALL fall back to displaying the football SVG icon, identical to the no-photo state.

#### Scenario: Image URL returns an error

- **WHEN** a player has a valid-looking `profile_string_link` but the image fails to load
- **THEN** the `PlayerAvatar` replaces the broken image with the football SVG icon fallback.

### Requirement: Preserve goal badge overlay

The goal count badge (green circle with goal number) SHALL remain positioned at the bottom-right of the avatar regardless of whether a profile photo or the football icon fallback is displayed.

#### Scenario: Scorer with profile photo

- **WHEN** a player has a profile photo AND has scored goals
- **THEN** the green goal badge is displayed at the bottom-right of the circular photo.

#### Scenario: Scorer without profile photo

- **WHEN** a player has no profile photo AND has scored goals
- **THEN** the green goal badge is displayed at the bottom-right of the football icon avatar, matching current behavior.
