## ADDED Requirements

### Requirement: Top scorers data exports
The system SHALL export a `Scorer` interface and two hand-curated authoritative arrays, `TOP_SCORERS_MALE` and `TOP_SCORERS_FEMALE`, from `src/data/tournament.ts`. Each `Scorer` SHALL contain `teamId` (matching a `TEAMS` id), `playerId` (matching a `SQUADS[player]` id), `name`, `number`, `profile_string_link` (the player's Cloudinary photo URL, copied from the matching squad entry), and `goals`. The arrays SHALL reflect the real per-player goals recorded in `MATCH_EVENTS`, split by the scoring player's team gender, and SHALL be sorted descending by `goals`.

#### Scenario: Male scorers reflect MATCH_EVENTS totals
- **WHEN** a player's male-team goals in `MATCH_EVENTS` are summed
- **THEN** that player's `goals` value in `TOP_SCORERS_MALE` equals that sum, joined with their squad `name` and `number`

#### Scenario: Female scorers reflect MATCH_EVENTS totals
- **WHEN** a player's female-team goals in `MATCH_EVENTS` are summed
- **THEN** that player's `goals` value in `TOP_SCORERS_FEMALE` equals that sum

#### Scenario: Unknown scorer ids are excluded
- **WHEN** a `MATCH_EVENTS` entry references a `teamId`/`playerId` not present in `TEAMS`/`SQUADS`
- **THEN** that goal SHALL still be counted in the source of truth but the curated arrays SHALL only contain entries whose `teamId` exists in `TEAMS` and `playerId` exists in the matching squad

### Requirement: Scorers tab renders top scorers view
The bottom-nav tab SHALL render `TopScorersTab` (from `src/components/scorers/TopScorersTab.tsx`) instead of the previous knockout view. The bottom-nav tab id SHALL be `scorers`, the label SHALL be "Scorers", and the icon SHALL be the lucide-react `Goal` icon. The previous `knockout`/Cup tab and `KnockoutTab.tsx` SHALL be removed.

#### Scenario: Scorers tab content
- **WHEN** the user activates the "Scorers" bottom-nav tab
- **THEN** the app renders `TopScorersTab` with male and female scorers

### Requirement: Top scorers view layout
`TopScorersTab` SHALL present a sticky header containing an uppercase "Top Scorers" label and a two-way male/female toggle pill (default male), a list of scorer cards sorted descending by goals showing rank, player avatar, player name, team crest + team name + squad `#number`, and goal count, and tapping a card SHALL open a centered player preview modal that shows the player avatar, name, team crest, team name, `#number`, and total goals scored, closable via a close button or tapping the backdrop.

#### Scenario: Default gender
- **WHEN** `TopScorersTab` mounts
- **THEN** the male toggle is active and male scorers are listed sorted descending by `goals`

#### Scenario: Switching gender
- **WHEN** the user taps the "Female" toggle
- **THEN** the list animates and shows `TOP_SCORERS_FEMALE` entries sorted descending by `goals`

#### Scenario: Opening a player preview
- **WHEN** the user taps a scorer card
- **THEN** a centered modal opens showing that scorer's name, team, `#number`, and goals, and pressing the close button or the backdrop closes it

### Requirement: Top scorer card uses real squad numbers, names, and photos
Each scorer card SHALL display the scorer's real `name` and `#number` from the `Scorer` record (which is joined from `SQUADS`), SHALL display the team name via `getTeamName(scorer.teamId)`, and SHALL display the team crest via the shared `@/components/shared/TeamCrest` component (passing the team `logo` from `TEAMS`) rather than a local duplicate. The scorer's avatar SHALL show the real player profile photo by applying `cloudinary()` to `scorer.profile_string_link`, and SHALL fall back to `@/assets/football.svg` when `profile_string_link` is empty/`"none"` or the image fails to load — matching the `MatchSquad.PlayerCard` pattern. The rank #1 card SHALL use the amber "top" styling.

#### Scenario: Top rank styling
- **WHEN** the highest-goals scorer (rank 1) is rendered
- **THEN** the card uses the amber gradient background, amber border, and amber-tinted name/goals text

## MODIFIED Requirements

### Requirement: Match goal events
Match goal events SHALL continue to be recorded as `MATCH_EVENTS` (per-goal `matchId`/`teamId`/`playerId` entries). Additionally, the canonical per-player totals SHALL be available as hand-curated `TOP_SCORERS_MALE` / `TOP_SCORERS_FEMALE` arrays in `src/data/tournament.ts`. The two representations SHALL stay consistent: every `MATCH_EVENTS` goal for a player whose team and squad exist SHALL be reflected in that player's entry in the matching top-scorers array.

#### Scenario: Totals match events
- **WHEN** `MATCH_EVENTS` is summed per player and joined with `TEAMS` (for gender) and `SQUADS` (for name/number)
- **THEN** each player's goal total equals the `goals` value of their entry in `TOP_SCORERS_MALE` or `TOP_SCORERS_FEMALE`, sorted descending