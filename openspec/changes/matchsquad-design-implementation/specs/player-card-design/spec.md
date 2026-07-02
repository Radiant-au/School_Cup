## ADDED Requirements

### Requirement: Large player cards with 92px avatars
Each player SHALL be rendered as a card with a 92px circular avatar, matching the design in `MatchDesign.tsx`. The avatar SHALL have a 2px border: green-tinted for scorers (`border-green-500/60 bg-green-500/10`), subtle white for non-scorers (`border-white/12 bg-white/5`).

#### Scenario: Scorer avatar styling
- **WHEN** a player has 1 or more goals
- **THEN** the avatar SHALL have a green border (`border-green-500/60`) and green-tinted background (`bg-green-500/10`)

#### Scenario: Non-scorer avatar styling
- **WHEN** a player has 0 goals
- **THEN** the avatar SHALL have a subtle white border (`border-white/12`) and white background (`bg-white/5`)

### Requirement: Faded jersey number watermark
Each player card SHALL display a faded jersey number watermark (72px, `font-barlow`, `font-extrabold`, 4% opacity) positioned absolutely on the right side, vertically centered behind the card content.

#### Scenario: Watermark visibility
- **WHEN** a player card is rendered
- **THEN** the jersey number SHALL appear as a large faded watermark on the right side with `text-foreground/[0.04]` opacity

### Requirement: Position badges derived from jersey number
Each player card SHALL display a position badge (GK, DEF, MID, FWD) derived from the jersey number: 1=GK, 2-4=DEF, 5-7=MID, 8+=FWD. The badge SHALL use color-coded styling: yellow for GK, blue for DEF, emerald for MID, red for FWD.

#### Scenario: Goalkeeper position badge
- **WHEN** a player's jersey number is 1
- **THEN** the position badge SHALL display "GK" with yellow styling (`text-yellow-400 bg-yellow-400/10 border-yellow-400/20`)

#### Scenario: Defender position badge
- **WHEN** a player's jersey number is 2, 3, or 4
- **THEN** the position badge SHALL display "DEF" with blue styling (`text-blue-400 bg-blue-400/10 border-blue-400/20`)

#### Scenario: Midfielder position badge
- **WHEN** a player's jersey number is 5, 6, or 7
- **THEN** the position badge SHALL display "MID" with emerald styling (`text-emerald-400 bg-emerald-400/10 border-emerald-400/20`)

#### Scenario: Forward position badge
- **WHEN** a player's jersey number is 8 or higher
- **THEN** the position badge SHALL display "FWD" with red styling (`text-red-400 bg-red-400/10 border-red-400/20`)

### Requirement: Goal badge pill for scorers
Players with 1 or more goals SHALL display a `GoalBadge` component: a green-tinted pill (`bg-green-500/15 border border-green-500/30 rounded-full`) containing football icons (up to 3) and "+N" text for more than 3 goals. The badge SHALL appear below the position info for scorers only.

#### Scenario: Single goal badge
- **WHEN** a player has exactly 1 goal
- **THEN** the goal badge SHALL display one football icon in a green pill

#### Scenario: Multiple goals badge with overflow
- **WHEN** a player has 4 or more goals
- **THEN** the goal badge SHALL display 3 football icons followed by "+N" text where N is goals minus 3

#### Scenario: Non-scorer has no goal badge
- **WHEN** a player has 0 goals
- **THEN** no goal badge SHALL be displayed

### Requirement: Scorer card highlighting
Player cards for scorers SHALL have green-tinted background (`bg-green-500/5`) and green border (`border-green-500/20`). Non-scorer cards SHALL use standard card background (`bg-card`) and border (`border-card-border`).

#### Scenario: Scorer card styling
- **WHEN** a player has 1 or more goals
- **THEN** the card SHALL have `bg-green-500/5 border-green-500/20` styling

#### Scenario: Non-scorer card styling
- **WHEN** a player has 0 goals
- **THEN** the card SHALL have `bg-card border-card-border` styling

### Requirement: Real data integration
Player cards SHALL use real data from `SQUADS` (player names, jersey numbers, profile photos) and `MATCH_EVENTS` (goals). Profile photos SHALL use `player.profile_string_link` with fallback to football SVG for invalid URLs or load errors.

#### Scenario: Player name from real data
- **WHEN** a player card is rendered
- **THEN** the player name SHALL be displayed using the real name from `SQUADS` data in Myanmar font

#### Scenario: Profile photo with fallback
- **WHEN** a player has a valid `profile_string_link`
- **THEN** the avatar SHALL display the profile photo
- **WHEN** the profile photo fails to load or URL is invalid
- **THEN** the avatar SHALL display the football SVG fallback

#### Scenario: Goals from match events
- **WHEN** a player card is rendered
- **THEN** the goal count SHALL be calculated from `MATCH_EVENTS` filtered by match ID, team ID, and player ID
