# player-list-styling

## Purpose

Defines the card-style visual treatment, spacing, and typography for the player list in the MatchSquad view, distinguishing scorers from non-scorers.

## Requirements

### Requirement: Card-style player rows

Each player row SHALL be rendered as a card with rounded corners (`rounded-xl`), consistent internal padding, and a subtle background fill. Non-scorer rows SHALL use a muted card style; scorer rows SHALL use a team-color-tinted card with a visible border.

#### Scenario: Non-scorer player row display

- **WHEN** a player has 0 goals
- **THEN** the player row SHALL render with a muted card background, rounded corners, and subtle border or no border

#### Scenario: Scorer player row display

- **WHEN** a player has 1 or more goals
- **THEN** the player row SHALL render with a team-color-tinted background, a visible team-color border, and rounded corners

### Requirement: Enhanced column header

The column header row (Player, #, G) SHALL have a distinct visual treatment with a subtle background fill and uppercase typography that clearly separates it from player rows.

#### Scenario: Column header visibility

- **WHEN** the player list is rendered
- **THEN** the column header row SHALL have a background fill distinct from player row backgrounds and use uppercase tracking-widest typography

### Requirement: Improved row spacing and alignment

Player rows SHALL have consistent vertical spacing between them. Each row SHALL vertically center its avatar, name, jersey number, and goal indicator with uniform gap spacing.

#### Scenario: Row spacing consistency

- **WHEN** multiple player rows are rendered in the list
- **THEN** each row SHALL have uniform vertical gap spacing between adjacent rows and consistent internal padding

#### Scenario: Avatar and content alignment

- **WHEN** a player row is rendered
- **THEN** the avatar, player name, jersey number, and goal indicator SHALL be vertically centered within the row

### Requirement: Scorer visual accent

Scorer rows SHALL include a left-edge gradient accent using the team color to visually distinguish them from non-scorers. The green goal badge on the avatar SHALL remain unchanged.

#### Scenario: Scorer left-edge accent

- **WHEN** a player has scored 1 or more goals
- **THEN** the player row SHALL display a left-edge gradient accent using the active team's color

#### Scenario: Non-scorer has no accent

- **WHEN** a player has 0 goals
- **THEN** the player row SHALL NOT display any left-edge gradient accent

### Requirement: Typography refinements

Player names SHALL use `font-myanmar` with tight line-height. Jersey numbers SHALL use `font-barlow` with increased visual weight. The goal column header SHALL use the active team color.

#### Scenario: Player name typography

- **WHEN** a player row is rendered
- **THEN** the player name SHALL use `font-myanmar` font with `font-bold` weight and tight line-height

#### Scenario: Jersey number typography

- **WHEN** a player row is rendered
- **THEN** the jersey number SHALL use `font-barlow` font with bold weight and clear visibility
