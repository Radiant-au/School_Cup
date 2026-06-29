## ADDED Requirements

### Requirement: Dynamic current date selection

The date picker in `FixtureTab` SHALL use the actual current date as the default selected date instead of a hardcoded string. The `TODAY` constant SHALL be derived from `new Date()`.

#### Scenario: Date picker selects today on load

- **WHEN** the app loads on July 3, 2026
- **THEN** the date picker defaults to July 3 (if it is a tournament date) or the first tournament date (if today is not a tournament date).

#### Scenario: Today indicator shows on current date

- **WHEN** the current date is a tournament date but not the selected date
- **THEN** the today dot indicator appears on the current date's chip.
