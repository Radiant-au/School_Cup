## ADDED Requirements

### Requirement: FotMob-style compact table columns

The standings table SHALL display exactly 7 stat columns plus the team name column: PL (Played), W (Won), D (Drawn), L (Lost), +/- (signed Goal Difference), GD (Goal Difference), PTS (Points). The GF (Goals For) and GA (Goals Against) columns SHALL NOT be displayed.

#### Scenario: Table header shows FotMob columns

- **WHEN** the standings table is rendered
- **THEN** the header row displays: #, Team, PL, W, D, L, +/-, GD, PTS in that order.

#### Scenario: Signed goal difference in +/- column

- **WHEN** a team has scored 5 goals and conceded 3
- **THEN** the +/- column shows `+2` for that team.

#### Scenario: Negative goal difference in +/- column

- **WHEN** a team has scored 2 goals and conceded 5
- **THEN** the +/- column shows `-3` for that team.

#### Scenario: Zero goal difference in +/- column

- **WHEN** a team has scored 3 goals and conceded 3
- **THEN** the +/- column shows `0` for that team.

#### Scenario: GD column shows numeric goal difference

- **WHEN** a team has a goal difference of 2
- **THEN** the GD column shows `2` (the numeric value without sign).

### Requirement: Team logo field on Team data

The `Team` interface in `tournament.ts` SHALL include an optional `logo` field of type `string` containing a Cloudinary image URL. Each team entry SHALL be populated with its corresponding logo URL extracted from the existing `MATCHES` data.

#### Scenario: Team has logo URL

- **WHEN** the `TEAMS` array is inspected for a team that has a known logo (e.g., PrE, IS, AME, EcE, CE)
- **THEN** the team object includes a `logo` field with the Cloudinary URL for that team's crest.

#### Scenario: Table accesses team logo

- **WHEN** the `TableTab` component renders a team row
- **THEN** it reads the `logo` field from the `Team` object to display the crest.

### Requirement: Inline team logo in standings table

Each row in the standings table SHALL display a small team logo (crest) immediately before the team name. The logo SHALL be 20x20px, circular, and rendered inline with a small gap between the logo and the team name text.

#### Scenario: Logo displayed before team name

- **WHEN** a team row is rendered in the standings table and the team has a `logo` URL
- **THEN** a 20x20px circular crest image is displayed to the left of the team name with a small horizontal gap.

#### Scenario: Fallback initials when no logo

- **WHEN** a team row is rendered and the team has no `logo` URL
- **THEN** a 20x20px circular fallback showing the team's initials is displayed instead of an image.

### Requirement: Shared TeamCrest component

A single shared `TeamCrest` component SHALL exist at `src/components/shared/TeamCrest.tsx`. It SHALL accept `name`, optional `logo`, and `size` props. The `size` prop SHALL support at least `sm` (20px), `md` (40px), and `lg` (36px) variants. All existing inline `TeamCrest` definitions in `FixtureTab.tsx` and `MatchSquad.tsx` SHALL be replaced with imports from the shared component.

#### Scenario: Table uses shared TeamCrest at sm size

- **WHEN** the standings table renders a team crest
- **THEN** it uses the shared `TeamCrest` component with `size="sm"` producing a 20x20px crest.

#### Scenario: Fixtures use shared TeamCrest at md size

- **WHEN** the fixture cards render team crests
- **THEN** they use the shared `TeamCrest` component with `size="md"` producing a 40x40px crest.

#### Scenario: Match detail uses shared TeamCrest

- **WHEN** the match detail page renders team crests
- **THEN** it uses the shared `TeamCrest` component with the appropriate size.
