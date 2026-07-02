# dynamic-today

## Purpose

Defines the dynamic date selection behavior for the fixture date picker, using the actual current date instead of a hardcoded value.

## Requirements

### Requirement: Dynamic current date selection

The date picker in `FixtureTab` SHALL use the actual current date as the default selected date instead of a hardcoded string. The `TODAY` constant SHALL be derived using Myanmar timezone (`Asia/Yangon`, UTC+6:30) to ensure correct date for tournament location.

#### Scenario: Date picker selects today on load

- **WHEN** the app loads on July 3, 2026 at 1:00 AM Myanmar time
- **THEN** the date picker defaults to July 3 (if it is a tournament date) or the first tournament date (if today is not a tournament date), not June 30 (which UTC would report).

#### Scenario: Today indicator shows on current date

- **WHEN** the current date is a tournament date but not the selected date
- **THEN** the today dot indicator appears on the current date's chip.
