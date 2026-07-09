## ADDED Requirements

### Requirement: Admin can manually edit standings rows

An authenticated admin SHALL be able to manually edit any `standings` row's `p`, `w`, `d`, `l`, `gf`, and `ga` values from the admin site. The editor SHALL derive `gd` (`gf - ga`) and `pts` (`w * 3 + d`) from the entered values and SHALL persist all eight fields by updating the `standings` row keyed by `team_id` using the authenticated Supabase session. This manual edit path SHALL coexist with the Female-group auto-recompute (which still runs on finish/revert of a female match) and SHALL be the only mutation path for male-group (`A`, `B`) rows. The public standings table SHALL reflect the edit in real time via the existing `standings` realtime subscription.

#### Scenario: Admin edits and saves a standings row

- **WHEN** the admin edits a team's `w` to `3` and `gf` to `5` and saves
- **THEN** the `standings` row is updated with `w=3` and `gf=5`, `gd` and `pts` are recomputed from the entered values, and the public table updates in real time

#### Scenario: gd and pts are derived, not directly editable

- **WHEN** the admin changes `gf` from `2` to `5` for a row whose `ga` is `1`
- **THEN** `gd` recomputes to `4` and is shown read-only, and the admin cannot type into `gd` or `pts`

#### Scenario: Manual edit coexists with Female auto-recompute

- **WHEN** the admin manually edits a female team's row and then finishes a different female match
- **THEN** the Female auto-recompute still runs and overwrites the Female group's `standings` rows (including the manually-edited row) from finished female matches

#### Scenario: Anonymous standings edit is rejected

- **WHEN** a client without a Supabase session attempts to update a `standings` row
- **THEN** Supabase RLS rejects the update and no change is persisted
