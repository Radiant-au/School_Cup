# admin-revert-controls

## Requirements

### Requirement: Undo goal requires confirmation

The admin live-match screen SHALL require a two-step confirmation before deleting a `goal_events` row. Tapping the undo affordance on a goal-log entry SHALL open a confirmation dialog that displays the scorer's player name, jersey number, and team. The `goal_events` deletion SHALL execute only on explicit confirmation; dismissing the dialog SHALL perform no mutation. This applies only while a match is `live` (the undo affordance is not displayed for `finished` matches except via "Revert to Scheduled").

#### Scenario: Undo dialog shows scorer identity

- **WHEN** the admin taps the undo control on a goal event in a live match
- **THEN** a confirmation dialog opens showing the scorer's name, jersey number, and team
- **AND** no `goal_events` row is deleted until the admin confirms

#### Scenario: Confirming undo deletes the goal event

- **WHEN** the admin confirms the undo dialog
- **THEN** the system deletes that exact `goal_events` row from Supabase
- **AND** the live score and goal log update in real time via the existing realtime subscription

#### Scenario: Dismissing undo dialog cancels deletion

- **WHEN** the admin dismisses the undo confirmation dialog without confirming
- **THEN** no `goal_events` row is deleted and the goal entry remains in the log

### Requirement: Revert match to scheduled

The admin live-match screen SHALL provide a "Revert to Scheduled" control that is visible when the match status is `live` or `finished`, and hidden when the status is `scheduled`. Activating the control SHALL open a confirmation dialog. On confirmation, the system SHALL set `matches.status` to `scheduled`, set `matches.score_a` and `matches.score_b` to `null`, and delete every `goal_events` row whose `match_id` equals this match's id. If the match's `group` is `Female`, the Female group standings SHALL be recomputed (see the `editable-standings` spec).

#### Scenario: Revert control visible on live match

- **WHEN** the admin views a match whose status is `live`
- **THEN** a "Revert to Scheduled" control is displayed

#### Scenario: Revert control visible on finished match

- **WHEN** the admin views a match whose status is `finished`
- **THEN** a "Revert to Scheduled" control is displayed

#### Scenario: Revert control hidden on scheduled match

- **WHEN** the admin views a match whose status is `scheduled`
- **THEN** no "Revert to Scheduled" control is displayed

#### Scenario: Confirming revert resets the match

- **WHEN** the admin confirms "Revert to Scheduled"
- **THEN** `matches.status` becomes `scheduled`, `score_a` and `score_b` become `null`, and all `goal_events` for that match are deleted
- **AND** if the match `group` is `Female`, the Female group standings are recomputed

#### Scenario: Dismissing revert dialog cancels

- **WHEN** the admin dismisses the revert confirmation dialog without confirming
- **THEN** the match status, scores, and goal events remain unchanged
