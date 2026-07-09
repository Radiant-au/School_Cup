# realtime-public-reads

## Purpose

Defines how public (unauthenticated) pages read live match, goal-event, and standings data from Supabase via TanStack Query hooks, how they subscribe to realtime `postgres_changes` payloads, and how they recover from dropped realtime connections.

## Requirements

### Requirement: Public pages read matches and events from Supabase

The Home page, MatchSquad page, FixtureTab, TableTab, and TopScorersTab SHALL read `matches`, `goal_events`, and `standings` from Supabase via the `@/lib/supabase` client rather than from the static `MATCHES`, `MATCH_EVENTS`, `STANDINGS`, and `TOP_SCORERS_*` arrays in `src/data/tournament.ts`. Reads SHALL be wrapped in TanStack Query hooks so results are cached and refetchable.

#### Scenario: Home reads matches from Supabase

- **WHEN** the Home page mounts
- **THEN** it issues `supabase.from('matches').select(...)` (directly or via a hook) and renders from the returned rows, not from the `MATCHES` import.

#### Scenario: Static event/standings/scorers imports removed

- **WHEN** `src/pages/MatchSquad.tsx`, `src/components/fixtures/FixtureTab.tsx`, `src/components/table/TableTab.tsx`, and `src/components/scorers/TopScorersTab.tsx` are inspected
- **THEN** they do not import `MATCH_EVENTS`, `STANDINGS`, `TOP_SCORERS_MALE`, or `TOP_SCORERS_FEMALE` from `@/data/tournament`.

### Requirement: Realtime subscription on goal events

Public hooks SHALL subscribe to Supabase `postgres_changes` events on the `goal_events` table (and on `matches` for status changes) so that new goals, undo deletions, and status transitions are reflected on already-mounted public pages without a full page reload.

#### Scenario: New goal appears live

- **WHEN** the admin records a goal for match `21` and a viewer is on the MatchSquad page for match `21`
- **THEN** the viewer's squad view updates the scorer's goal count and the displayed score within the realtime delivery window, with no manual refresh.

#### Scenario: Undo appears live

- **WHEN** the admin undoes a goal event for a match a viewer is currently viewing
- **THEN** the viewer's score and per-player goal counts update to reflect the deletion without a page reload.

#### Scenario: Match finish appears live

- **WHEN** the admin finishes a match
- **THEN** any public view of that match transitions from a live/VS state to the final-score / FULL TIME state without a reload.

### Requirement: Realtime invalidation via TanStack Query

On a received `postgres_changes` payload, the public hooks SHALL invalidate the relevant TanStack Query cache keys (e.g. `['goal_events', matchId]`, `['matches']`, `['standings']`) so the next render refetches from Supabase. Hooks SHALL NOT hand-merge the realtime payload into local state; the Supabase read is the single source of truth.

#### Scenario: Subscription invalidates cache

- **WHEN** a `postgres_changes` INSERT on `goal_events` for match `21` is received by a subscribed hook
- **THEN** the TanStack Query key `['goal_events', '21']` is invalidated and the query refetches from Supabase.

### Requirement: Anonymous read access

All public reads SHALL succeed for anonymous (no-session) Supabase clients. RLS SHALL permit `SELECT` on `teams`, `matches`, `goal_events`, and `standings` for the `anon` role, so viewers never need to authenticate to see live data.

#### Scenario: Anonymous viewer reads matches

- **WHEN** an unauthenticated visitor loads the Home page
- **THEN** `supabase.from('matches').select()` returns rows without error.

#### Scenario: Anonymous viewer reads goal events

- **WHEN** an unauthenticated visitor opens the MatchSquad page for a match with goals
- **THEN** `supabase.from('goal_events').select().eq('match_id', id)` returns the goal rows without error.

### Requirement: Recovery from dropped realtime connection

Public hooks SHALL recover from a dropped realtime websocket by relying on TanStack Query's `refetchOnReconnect` and `refetchOnWindowFocus`. When the connection is restored or the tab is refocused, the affected queries SHALL refetch so the viewer is never permanently stuck on stale data.

#### Scenario: Reconnect triggers refetch

- **WHEN** the realtime websocket drops and the network later reconnects
- **THEN** the active matches/events queries refetch and the UI converges to the current Supabase state.

#### Scenario: Tab refocus triggers refetch

- **WHEN** a viewer returns to a long-open tab after the admin has recorded several goals
- **THEN** the queries refetch on focus and the displayed score reflects all recorded goals.