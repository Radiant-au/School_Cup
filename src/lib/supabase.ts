import { createClient } from "@supabase/supabase-js";
import type { Team } from "@/data/tournament";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type MatchStatus = "scheduled" | "live" | "finished";

export interface TeamRow {
  id: string;
  name: string;
  group: string;
  gender: string;
  logo: string | null;
  color: string | null;
}

export interface MatchRow {
  id: string;
  date: string;
  time: string;
  team_a: string;
  team_b: string;
  logo_a: string | null;
  logo_b: string | null;
  group: string;
  gender: string;
  status: MatchStatus;
  score_a: number | null;
  score_b: number | null;
  penalty_a: number | null;
  penalty_b: number | null;
  disbanded: boolean;
}

export interface GoalEventRow {
  id: string;
  match_id: string;
  team_id: string;
  player_id: string;
  player_number: string | null;
  player_name: string | null;
  created_at: string;
}

export interface StandingRow {
  team_id: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

/**
 * Recompute the `standings` rows for a single group from the set of finished
 * matches in that group (using `score_a`/`score_b` snapshots) and upsert them.
 * Called by the admin on Finish/Revert of a Female group-stage match. Male
 * groups are never recomputed (final). Rows must already exist (seeded); the
 * upsert takes the ON CONFLICT (team_id) DO UPDATE branch, which requires the
 * `standings_update` RLS policy for authenticated users.
 */
export async function recomputeStandingsForGroup(
  groupId: string,
): Promise<{ error: string | null }> {
  const { data: teamsData, error: teamsErr } = await supabase
    .from("teams")
    .select("id")
    .eq("group", groupId);
  if (teamsErr) return { error: teamsErr.message };
  const teams = (teamsData ?? []) as Array<{ id: string }>;

  const { data: matchesData, error: matchesErr } = await supabase
    .from("matches")
    .select("team_a, team_b, score_a, score_b")
    .eq("group", groupId)
    .eq("status", "finished");
  if (matchesErr) return { error: matchesErr.message };
  const matches = (matchesData ?? []) as Array<
    Pick<MatchRow, "team_a" | "team_b" | "score_a" | "score_b">
  >;

  const stats: Record<
    string,
    { p: number; w: number; d: number; l: number; gf: number; ga: number }
  > = {};
  for (const t of teams) {
    stats[t.id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
  }

  for (const m of matches) {
    const a = m.team_a;
    const b = m.team_b;
    const sa = m.score_a ?? 0;
    const sb = m.score_b ?? 0;
    if (!stats[a] || !stats[b]) continue;
    stats[a].p += 1;
    stats[b].p += 1;
    stats[a].gf += sa;
    stats[a].ga += sb;
    stats[b].gf += sb;
    stats[b].ga += sa;
    if (sa > sb) {
      stats[a].w += 1;
      stats[b].l += 1;
    } else if (sa < sb) {
      stats[a].l += 1;
      stats[b].w += 1;
    } else {
      stats[a].d += 1;
      stats[b].d += 1;
    }
  }

  const rows = Object.entries(stats).map(([team_id, s]) => ({
    team_id,
    p: s.p,
    w: s.w,
    d: s.d,
    l: s.l,
    gf: s.gf,
    ga: s.ga,
    gd: s.gf - s.ga,
    pts: s.w * 3 + s.d,
  }));

  const { error: upsertErr } = await supabase
    .from("standings")
    .upsert(rows, { onConflict: "team_id" });
  if (upsertErr) return { error: upsertErr.message };
  return { error: null };
}

/**
 * Assign (or reassign) a team to one side of a knockout match. Used by the
 * admin to fill a `TBD` side of a scheduled Semi-final/Final/Bronze Final as
 * finalists are decided. Updates `team_a`/`logo_a` (side "A") or
 * `team_b`/`logo_b` (side "B") on the `matches` row. Requires the
 * authenticated session (RLS `matches_update`).
 */
export async function updateMatchTeamSide(
  matchId: string,
  side: "A" | "B",
  team: Pick<Team, "id" | "logo">,
): Promise<{ error: string | null }> {
  const patch =
    side === "A"
      ? { team_a: team.id, logo_a: team.logo ?? null }
      : { team_b: team.id, logo_b: team.logo ?? null };
  const { data, error } = await supabase
    .from("matches")
    .update(patch)
    .eq("id", matchId)
    .select();
  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return {
      error:
        "No match row was updated — the `matches_update` RLS policy is likely missing on your Supabase project. Run `supabase/policies.sql` in the Supabase SQL editor.",
    };
  }
  return { error: null };
}

/**
 * Manually overwrite a single `standings` row (keyed by `team_id`) with the
 * given stats. Used by the admin standings editor to correct any group's row.
 * The caller MUST derive `gd` (`gf - ga`) and `pts` (`w * 3 + d`) before
 * calling. Requires the authenticated session (RLS `standings_update`).
 */
export async function updateStandingRow(
  teamId: string,
  stats: {
    p: number;
    w: number;
    d: number;
    l: number;
    gf: number;
    ga: number;
    gd: number;
    pts: number;
  },
): Promise<{ error: string | null }> {
  const { data, error } = await supabase
    .from("standings")
    .update(stats)
    .eq("team_id", teamId)
    .select();
  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return {
      error:
        "No standings row was updated — the `standings_update` RLS policy is likely missing on your Supabase project. Run `supabase/policies.sql` in the Supabase SQL editor.",
    };
  }
  return { error: null };
}