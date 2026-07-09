import { useQuery } from "@tanstack/react-query";
import { supabase, type GoalEventRow } from "@/lib/supabase";
import { useRealtimeInvalidation } from "@/lib/useRealtimeInvalidation";
import { TEAMS, type Player, type Scorer, type Team } from "@/data/tournament";
import { SQUADS } from "@/data/squads";

const QUERY_KEY = ["top-scorers"] as const;

interface PlayerEntry {
  player: Player;
  teamId: string;
}

const PLAYER_INDEX: Map<string, PlayerEntry> = (() => {
  const map = new Map<string, PlayerEntry>();
  for (const [teamId, squad] of Object.entries(SQUADS)) {
    for (const player of squad) {
      map.set(player.id, { player, teamId });
    }
  }
  return map;
})();

const TEAM_INDEX: Map<string, Team> = new Map(TEAMS.map((t) => [t.id, t]));

export function useTopScorers(gender: "male" | "female") {
  useRealtimeInvalidation("goal_events", QUERY_KEY);

  return useQuery<Scorer[]>({
    queryKey: [...QUERY_KEY, gender] as const,
    queryFn: async () => {
      const { data, error } = await supabase.from("goal_events").select("*");

      if (error) throw error;

      const rows = data as GoalEventRow[];
      const counts = new Map<string, number>();
      for (const row of rows) {
        counts.set(row.player_id, (counts.get(row.player_id) ?? 0) + 1);
      }

      const scorers: Scorer[] = [];
      for (const [playerId, goals] of counts) {
        const entry = PLAYER_INDEX.get(playerId);
        if (!entry) continue;
        const team = TEAM_INDEX.get(entry.teamId);
        if (!team) continue;
        if (team.gender.toLowerCase() !== gender) continue;

        scorers.push({
          teamId: entry.teamId,
          playerId,
          name: entry.player.name,
          number: entry.player.number,
          profile_string_link: entry.player.profile_string_link,
          goals,
        });
      }

      return scorers.sort((a, b) => b.goals - a.goals);
    },
  });
}