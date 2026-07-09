import { useQuery } from "@tanstack/react-query";
import { supabase, type GoalEventRow } from "@/lib/supabase";
import { useRealtimeInvalidation } from "@/lib/useRealtimeInvalidation";

export interface GoalEvent {
  id: string;
  matchId: string;
  teamId: string;
  playerId: string;
  playerNumber: string;
  playerName: string;
  createdAt: string;
}

function toGoalEvent(row: GoalEventRow): GoalEvent {
  return {
    id: row.id,
    matchId: row.match_id,
    teamId: row.team_id,
    playerId: row.player_id,
    playerNumber: row.player_number ?? "",
    playerName: row.player_name ?? "",
    createdAt: row.created_at,
  };
}

export function useGoalEvents(matchId: string | undefined) {
  const queryKey = ["goal-events", matchId ?? ""] as const;
  useRealtimeInvalidation("goal_events", queryKey, matchId ? `match_id=eq.${matchId}` : undefined);

  return useQuery<GoalEvent[]>({
    queryKey,
    enabled: !!matchId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goal_events")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as GoalEventRow[]).map(toGoalEvent);
    },
  });
}