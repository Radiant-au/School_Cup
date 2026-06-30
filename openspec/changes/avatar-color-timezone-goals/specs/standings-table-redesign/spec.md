## MODIFIED Requirements

### Requirement: FotMob-style compact table columns

The standings table SHALL display exactly 7 stat columns plus the team name column: PL (Played), W (Won), D (Drawn), L (Lost), +/- (Goals For-Goals Against format), GD (signed Goal Difference), PTS (Points). The GF (Goals For) and GA (Goals Against) columns SHALL NOT be displayed.

#### Scenario: Table header shows FotMob columns

- **WHEN** the standings table is rendered
- **THEN** the header row displays: #, Team, PL, W, D, L, +/-, GD, PTS in that order.

#### Scenario: Goals format in +/- column

- **WHEN** a team has scored 2 goals and conceded 1
- **THEN** the +/- column shows `2-1` for that team.

#### Scenario: Negative goal difference in +/- column

- **WHEN** a team has scored 1 goal and conceded 2
- **THEN** the +/- column shows `1-2` for that team.

#### Scenario: Zero goal difference in +/- column

- **WHEN** a team has scored 3 goals and conceded 3
- **THEN** the +/- column shows `3-3` for that team.

#### Scenario: GD column shows signed numeric goal difference

- **WHEN** a team has a goal difference of +2 (scored 5, conceded 3)
- **THEN** the GD column shows `+2` (with sign).

#### Scenario: GD column shows negative goal difference

- **WHEN** a team has a goal difference of -3 (scored 2, conceded 5)
- **THEN** the GD column shows `-3` (with sign).
