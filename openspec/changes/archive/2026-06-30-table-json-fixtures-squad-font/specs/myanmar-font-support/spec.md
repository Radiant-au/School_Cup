## ADDED Requirements

### Requirement: Myanmar web font loaded

The app SHALL load the Padauk font (weights 400, 700) from Google Fonts for Myanmar/Burmese script rendering. A `--font-myanmar` CSS variable SHALL be defined and available via Tailwind.

#### Scenario: Padauk font is available

- **WHEN** the app loads
- **THEN** the Padauk font family is available for rendering Myanmar text.

#### Scenario: CSS variable defined

- **WHEN** the CSS is inspected
- **THEN** `--font-myanmar` is defined as `"Padauk", sans-serif`.

### Requirement: Squad view uses Myanmar font for player names

Player names in the squad view SHALL use the Myanmar font (`font-myanmar`) instead of `font-barlow`. The `tracking-wide` class SHALL be removed from player names. Line-height SHALL be `leading-normal` instead of `leading-tight` to accommodate Myanmar script height.

#### Scenario: Player names render in Padauk

- **WHEN** the squad view renders a player with a Burmese name
- **THEN** the name is rendered using the Padauk font family, not Barlow Condensed.

#### Scenario: No extra letter-spacing on Myanmar text

- **WHEN** a player name is rendered
- **THEN** no `tracking-wide` letter-spacing is applied.

#### Scenario: Adequate line-height for Myanmar script

- **WHEN** a player name is rendered
- **THEN** the line-height is `leading-normal` to provide sufficient vertical space for Myanmar glyphs.
