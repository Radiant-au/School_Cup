## MODIFIED Requirements

### Requirement: Match goal events record goal scorers
The system SHALL record every goal scored in a finished match as an entry in the `MATCH_EVENTS` array (`{ matchId, teamId, playerId }`). The canonical aggregate top-scorer totals SHALL ALSO be available as hand-curated `TOP_SCORERS_MALE` / `TOP_SCORERS_FEMALE` arrays exported from `src/data/tournament.ts`, joined with `SQUADS` for player `name`, `number`, and `profile_string_link` and split by the scoring player's `TEAMS` gender. The two representations SHALL remain consistent: every `MATCH_EVENTS` goal for a player whose `teamId` exists in `TEAMS` and whose `playerId` exists in the matching squad SHALL be reflected in that player's entry in the matching top-scorers array, with totals equal to the count of their `MATCH_EVENTS` entries.

#### Scenario: Curated totals equal event totals
- **WHEN** a player's entries in `MATCH_EVENTS` are counted
- **THEN** their `goals` value in the gender-appropriate `TOP_SCORERS_*` array equals that count