import { useQuery } from "@tanstack/react-query";
import { supabase, type StandingRow } from "@/lib/supabase";
import { useRealtimeInvalidation } from "@/lib/useRealtimeInvalidation";
import type { StandingEntry } from "@/data/tournament";

const QUERY_KEY = ["standings"] as const;

function toStanding(row: StandingRow): StandingEntry {
  return {
    teamId: row.team_id,
    p: row.p,
    w: row.w,
    d: row.d,
    l: row.l,
    gf: row.gf,
    ga: row.ga,
    gd: row.gd,
    pts: row.pts,
  };
}

export function useStandings() {
  useRealtimeInvalidation("standings", QUERY_KEY);

  return useQuery<StandingEntry[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from("standings").select("*");

      if (error) throw error;
      return (data as StandingRow[]).map(toStanding);
    },
  });
}