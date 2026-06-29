## ADDED Requirements

### Requirement: Full-width mobile layout

The app SHALL render at the full viewport width on all devices. The `MobileLayout` container and `MatchSquad` page MUST NOT apply any `max-width` constraint. The layout SHALL use `w-full min-h-[100dvh]` without a `max-w-[430px]` class.

#### Scenario: Layout fills viewport on 768px tablet

- **WHEN** the app is viewed on a device with a 768px-wide viewport
- **THEN** the main container spans the full 768px width with no horizontal centering or letterboxing.

#### Scenario: Layout fills viewport on 390px phone

- **WHEN** the app is viewed on a device with a 390px-wide viewport
- **THEN** the main container spans the full 390px width.

#### Scenario: Match detail page also full-width

- **WHEN** a user navigates to `/match/:id`
- **THEN** the `MatchSquad` page container spans the full viewport width with no `max-w-[430px]` constraint.

### Requirement: Right-aligned bottom navigation tabs

The bottom navigation bar SHALL position its tab buttons to the right side of the screen. The nav bar remains fixed at the bottom of the viewport and spans the full width, but tab buttons SHALL be clustered to the right with compact spacing rather than evenly distributed across the bar.

#### Scenario: Tabs positioned to the right

- **WHEN** the bottom navigation bar is rendered
- **THEN** the tab buttons (Fixtures, Table, Cup) are aligned to the right side of the nav bar, not evenly spaced across its full width.

#### Scenario: Active tab indicator still functions

- **WHEN** a user taps a tab
- **THEN** the active indicator animates to the selected tab and the tab content switches, identical to the current behavior.
