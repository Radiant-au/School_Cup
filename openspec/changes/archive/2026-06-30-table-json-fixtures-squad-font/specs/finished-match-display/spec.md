## ADDED Requirements

### Requirement: Larger score for finished matches

When a match is finished, the score display in the fixture match card SHALL use a larger font size than unfinished matches. The score SHALL use `text-4xl` instead of `text-3xl`.

#### Scenario: Finished match shows bigger score

- **WHEN** a match card renders a finished match (scoreA=2, scoreB=1)
- **THEN** the score numbers are displayed at `text-4xl` font size.

#### Scenario: Unfinished match keeps normal score size

- **WHEN** a match card renders an unfinished match
- **THEN** the time display uses the existing styling (no score shown).

### Requirement: Hide time for finished matches

When a match is finished, the match time SHALL NOT be displayed in the fixture match card. Only the score SHALL be shown.

#### Scenario: Finished match hides time

- **WHEN** a match card renders a finished match
- **THEN** the match time is not visible in the card.

#### Scenario: Unfinished match shows time

- **WHEN** a match card renders an unfinished match
- **THEN** the match time is displayed as before.
