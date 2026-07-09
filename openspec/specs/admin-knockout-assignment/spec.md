# admin-knockout-assignment

## Purpose

Defines the admin's ability to assign a real team to a TBD side of a scheduled knockout match.

## Requirements

### Requirement: Admin can assign a team to a TBD knockout side

The admin SHALL be able to assign a real team to any side of a scheduled knockout match (group `Semi-final`, `Final`, or `Bronze Final`) whose `team_a` or `team_b` is `TBD`. The assignment control SHALL be rendered on the match row in the admin fixtures view only while the match `status` is `scheduled`; it SHALL be hidden once the match is `live` or `finished`. The team picker SHALL list entries from `TEAMS` filtered to the match's `gender`. On selection, the system SHALL update the `matches` row's `team_a`/`logo_a` (or `team_b`/`logo_b`) to the selected team's id and logo using the authenticated Supabase session. An already-assigned side SHALL remain re-pickable while the match is still `scheduled`. The public fixture list and match page SHALL reflect the assignment in real time via the existing `matches` realtime subscription.

#### Scenario: TBD side shows the assign control

- **WHEN** the admin views a scheduled knockout match that has a `TBD` side
- **THEN** a tappable assign control is rendered on that side

#### Scenario: Picker lists gender-appropriate teams only

- **WHEN** the admin opens the team picker for a male knockout match
- **THEN** only teams whose `gender` is `Male` from `TEAMS` are listed

#### Scenario: Selecting a team updates the match row

- **WHEN** the admin selects team `CE_M` for a `TBD` side
- **THEN** the `matches` row's `team_a`/`logo_a` (or `team_b`/`logo_b`) is updated to `CE_M` and its logo, and the row re-renders with that team and crest

#### Scenario: Assignment control hidden once match is live or finished

- **WHEN** the match `status` is `live` or `finished`
- **THEN** no assign control is rendered on either side

#### Scenario: Already-assigned side is re-pickable while scheduled

- **WHEN** a scheduled knockout side already has a real team assigned
- **THEN** the admin can open the picker and choose a different team for that side

#### Scenario: Anonymous assignment is rejected

- **WHEN** a client without a Supabase session attempts to update a `matches` row's `team_a`
- **THEN** Supabase RLS rejects the update and no change is persisted