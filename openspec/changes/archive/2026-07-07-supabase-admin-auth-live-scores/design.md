## Context

The School Cup app is a static React + Vite + TypeScript client. All tournament data (`TEAMS`, `MATCHES`, `MATCH_EVENTS`, `STANDINGS`, `TOP_SCORERS_*`, `SQUADS`) lives in `src/data/tournament.ts` and `src/data/squads.ts`. Public pages (`Home`, `MatchSquad`, `FixtureTab`, `TableTab`, `TopScorersTab`) import these arrays directly. The `fifaOwner` admin panel (`AdminFixtures.tsx`, `AdminLiveMatch.tsx`) is unauthenticated and runs on `MOCK_DATES`/`MOCK_MATCHES`/`MOCK_MATCH` local state that is discarded on navigation — admin actions never reach the public app.

A Supabase project is now wired in (`src/lib/supabase.ts`, env vars in `.env`). The client uses the **publishable (anon) key** with no service-role key in the browser. Constraints:

- No backend service — all realtime via Supabase client subscriptions.
- Single admin user (the tournament owner) creates score events; many anonymous viewers read them.
- The existing `tournament.ts` data is real and curated (team IDs like `PrE(A)`, match IDs `1..26`, player IDs like `IS_A_07`) and must seed Supabase rather than be re-typed.
- wouter (not react-router); TanStack Query already in the tree; shadcn/ui + Tailwind v4 + dark mode.
- Route bug: `AdminFixtures` navigates to `/admin/match/:id` and `AdminLiveMatch` to `/admin`, but `App.tsx` registers `/fifaOwner` and `/fifaOwner/match/:id`. Both admin screens currently dead-end on navigation.

## Goals / Non-Goals

**Goals:**
- Gate `/fifaOwner` and `/fifaOwner/match/:id` behind Supabase email+password auth; unauthenticated users see a login screen.
- Admin live-match actions insert/delete rows in a Supabase `goal_events` table; score + goal log reflect those rows in real time.
- Each goal event carries scorer identity (`playerId`, `playerNumber`, `playerName`, `teamId`, `matchId`, `created_at`).
- Per-event undo deletes the exact row and recomputes score/goal counts.
- Public pages read matches + goal events from Supabase and update live via realtime subscriptions, without a page reload.
- Seed Supabase from the existing `tournament.ts` / `squads.ts` so the curated data is the initial dataset.
- RLS: anonymous read everywhere; writes restricted to authenticated users.

**Non-Goals:**
- No admin CRUD for teams, squads, or fixtures (metadata stays seeded from `tournament.ts`/`squads.ts`).
- No editing of historical finished matches beyond what the live-match undo already covers.
- No multi-admin roles or fine-grained per-match permissions — any authenticated admin can manage any match.
- No service-side scheduled "auto finish" or timer; "Finish Match" is a manual admin action.
- No migration of `TOP_SCORERS_*` to a dedicated table — top scorers are derived from `goal_events` + `SQUADS` at read time.
- No offline/PWA support; an active network is required for live updates.

## Decisions

### Decision 1: Auth via Supabase Auth (email+password), client-side route guard

Use Supabase Auth `signInWithPassword` / `signOut` / `onAuthStateChange`. Protect admin routes with a React guard component (`AdminAuthGuard`) that redirects to `/fifaOwner/login` when no session. The guard renders a loading state while `getSession()` resolves.

**Why not magic link / OAuth:** the user chose email+password (single owner, no email round-trip per session). **Why not a hardcoded password in code:** trivially extractable from the bundle; RLS would be unenforceable. Supabase Auth gives us a real session token that RLS policies can check via `auth.uid()`.

### Decision 2: RLS — anon SELECT, authenticated write; no service-role in browser

The browser only ever holds the publishable/anon key. RLS policies:

- `teams`, `matches`, `goal_events`, `standings` → `SELECT` allowed to `anon` and `authenticated`.
- `goal_events` `INSERT`/`DELETE` → `authenticated` only.
- `matches` `UPDATE` (status + score fields) → `authenticated` only.

No `service_role` key is shipped to the client. The admin's normal anon+session token is sufficient because RLS treats them as `authenticated`.

### Decision 3: Schema — four tables, `goal_events` append-only with soft-delete via DELETE

```
teams(id text PK, name text, group text, gender text, logo text, color text)
matches(id text PK, date date, time text, team_a text, team_b text,
        logo_a text, logo_b text, group text, gender text,
        score_a int, score_b int, finished bool, disbanded bool)
goal_events(id uuid PK default gen_random_uuid(),
             match_id text, team_id text, player_id text,
             player_number text, player_name text,
             created_at timestamptz default now())
standings(team_id text PK, p int, w int, d int, l int, gf int, ga int, gd int, pts int)
```

Scores are **derived** (`count(*) from goal_events where match_id=... group by team_id`) rather than stored on `matches`, so undo is just `DELETE` and cannot desync from the event log. `matches.score_a/score_b` columns remain for finished-match snapshots but live score is computed from events.

**Why derived scores:** the user's core need is "revert back when wrong". If score were a mutable counter, undo would require a read-modify-write and could race with concurrent admin devices. An append-only event log + `DELETE` for undo is idempotent and naturally consistent. **Alternative considered:** storing `score_a/score_b` on `matches` and decrementing on undo — rejected for the race reason.

### Decision 4: Realtime via `supabase.channel(...).on('postgres_changes', ...)`

Public hooks subscribe to `postgres_changes` on `goal_events` (and `matches` for status). On any change, refetch the relevant query (TanStack Query `invalidateQueries`) rather than hand-merging the payload — simpler and correct given small row counts. The admin live-match screen also subscribes so a second admin device sees the same events.

**Why not just polling:** the user explicitly wants live updates; realtime push is the point. **Why invalidate-and-refetch over payload merge:** merge logic for delete + insert + concurrent edits is fiddly; refetch keeps a single source of truth and the table sizes are tiny (tens of rows per match).

### Decision 5: Public data layer — TanStack Query hooks wrapping Supabase reads

Replace direct `import { MATCHES, ... } from "@/data/tournament"` in public components with hooks:

- `useMatches()` → `supabase.from('matches').select(...)`, realtime-invalidated.
- `useGoalEvents(matchId)` → filtered read + subscription.
- `useStandings()` / `useTopScorers(gender)` → read `standings` / derive from `goal_events` + `SQUADS`.

`squads.ts` (`SQUADS`) and `TEAMS` stay as static imports (metadata, not edited live) to avoid a round-trip for player lists on every match render. `MATCH_EVENTS`, `STANDINGS`, `TOP_SCORERS_*` exports in `tournament.ts` are marked deprecated and no longer imported by `src/`.

### Decision 6: Migration — SQL seed file under `supabase/seed.sql`, idempotent

A `supabase/schema.sql` (tables + RLS) and `supabase/seed.sql` (generated from the existing `tournament.ts` exports) live in-repo so the schema is reproducible. Seed is idempotent (`on conflict (id) do nothing`) so re-running is safe. Run via the Supabase dashboard SQL editor or `supabase db push` once the CLI is set up (out of scope for this change to set up CLI auth).

### Decision 7: Route fix — align admin navigation with `/fifaOwner`

Update `AdminFixtures` (navigate `/admin/match/:id` → `/fifaOwner/match/:id`) and `AdminLiveMatch` (navigate `/admin` → `/fifaOwner`) to match the registered routes. Add `/fifaOwner/login` to `App.tsx`.

## Risks / Trade-offs

- **Publishable key in bundle**: the anon key is visible in client JS. → Mitigated by RLS (anon can only SELECT public data; writes require an auth session). No service-role key in the browser, ever.
- **Concurrent admin devices**: two devices recording goals could double-insert or one could undo another's event. → Acceptable for a single-owner panel; the event log + `created_at` makes conflicts visible. No optimistic-concurrency control added.
- **Realtime reliability**: if a websocket drops, a viewer could see stale scores. → TanStack Query `refetchOnWindowFocus` + `refetchOnReconnect` plus an initial fetch on mount covers recovery; the subscription is best-effort on top.
- **Derived score drift**: `matches.score_a/score_b` snapshot could disagree with event count if someone edits both. → Treat `goal_events` as authoritative while `finished=false`; on "Finish Match" we write the final snapshot. Spec mandates this.
- **Seed drift from `tournament.ts`**: future edits to `tournament.ts` won't auto-propagate to Supabase. → Document in `AGENTS.md`/seed file header that `supabase/seed.sql` is the source of truth after migration; `tournament.ts` is the pre-migration seed only.
- **Undo vs Finish**: undoing after "Finish Match" must be blocked (matches the current "cannot be undone" copy). → Spec mandates the undo button is hidden once `finished=true`.
- **RLS misconfiguration**: a bad policy could expose write access or lock the admin out. → A `supabase/policies.sql` review step + a manual test (anon try-write should fail) is in the task list.
