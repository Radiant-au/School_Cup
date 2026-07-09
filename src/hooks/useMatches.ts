import { useQuery } from "@tanstack/react-query";
import { supabase, type MatchRow, type MatchStatus } from "@/lib/supabase";
import { useRealtimeInvalidation } from "@/lib/useRealtimeInvalidation";
import type { Match } from "@/data/tournament";

const QUERY_KEY = ["matches"] as const;

function toMatch(row: MatchRow): Match {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    teamA: row.team_a,
    teamB: row.team_b,
    logoA: row.logo_a ?? undefined,
    logoB: row.logo_b ?? undefined,
    group: row.group as Match["group"],
    gender: row.gender as Match["gender"],
    status: (row.status as MatchStatus) ?? "scheduled",
    scoreA: row.score_a,
    scoreB: row.score_b,
    penaltyA: row.penalty_a,
    penaltyB: row.penalty_b,
    finished: row.status === "finished",
    disbanded: row.disbanded,
  };
}

export function useMatches() {
  useRealtimeInvalidation("matches", QUERY_KEY);

  return useQuery<Match[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) throw error;
      return (data as MatchRow[]).map(toMatch);
    },
  });
}