# team-color

## Purpose

Defines the optional team color field on the Team interface and its use as a visual accent in the squad view.

## Requirements

### Requirement: Team color field

The `Team` interface SHALL include an optional `color` field of type `string` containing a hex color value (e.g., `"#FFD700"`). The color represents the team's identity color used for visual accents.

#### Scenario: Team has color

- **WHEN** the `TEAMS` array is inspected for team `IS(A)`
- **THEN** the team object includes a `color` field with the value `"#FFD700"` (yellow).

#### Scenario: Team color is optional

- **WHEN** a team does not have a color assigned yet
- **THEN** the `color` field is `undefined` and the app uses a default accent color as fallback.

### Requirement: Team color used as squad view accent

The squad view SHALL use the team's `color` as an accent for the player avatar circle border and background tint for all players, regardless of scoring status. The goal indicator badge SHALL use green (`#22c55e`) instead of team color. The header accent bar SHALL continue to use team color. If the team has no color, the default accent color SHALL be used as fallback.

#### Scenario: Avatar circle shows team color for all players

- **WHEN** the squad view renders for team `IS(A)` which has color `"#FFD700"`
- **THEN** every player's avatar circle uses yellow (`#FFD700`) for border and background tint, whether or not they scored.

#### Scenario: Goal badge uses green

- **WHEN** a player has scored goals in the squad view
- **THEN** the goal count badge displays with green (`#22c55e`) background instead of team color.

#### Scenario: Fallback when no team color

- **WHEN** the squad view renders for a team with no `color` defined
- **THEN** the default accent color is used for avatar circles and header accent.
