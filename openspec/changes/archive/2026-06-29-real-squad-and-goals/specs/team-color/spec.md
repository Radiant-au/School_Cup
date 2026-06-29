## ADDED Requirements

### Requirement: Team color field

The `Team` interface SHALL include an optional `color` field of type `string` containing a hex color value (e.g., `"#FFD700"`). The color represents the team's identity color used for visual accents.

#### Scenario: Team has color

- **WHEN** the `TEAMS` array is inspected for team `IS(A)`
- **THEN** the team object includes a `color` field with the value `"#FFD700"` (yellow).

#### Scenario: Team color is optional

- **WHEN** a team does not have a color assigned yet
- **THEN** the `color` field is `undefined` and the app uses a default accent color as fallback.

### Requirement: Team color used as squad view accent

The squad view SHALL use the team's `color` as an accent for visual elements such as the goal indicator badge and header accent bar. If the team has no color, the default accent color SHALL be used.

#### Scenario: Squad view shows team color accent

- **WHEN** the squad view renders for team `IS(A)` which has color `"#FFD700"`
- **THEN** the goal indicator badges and header accent use yellow (`#FFD700`) instead of the default accent.

#### Scenario: Fallback when no team color

- **WHEN** the squad view renders for a team with no `color` defined
- **THEN** the default accent color is used for visual elements.
