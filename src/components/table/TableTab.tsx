import { TEAMS } from "@/data/tournament";
import { motion } from "framer-motion";
import { TeamCrest } from "@/components/shared/TeamCrest";
import { useStandings } from "@/hooks/useStandings";

interface TableRow {
  team: string;
  logo?: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

import type { StandingEntry } from "@/data/tournament";

const buildTable = (
  group: string,
  gender: string,
  standings: StandingEntry[],
): TableRow[] => {
  return TEAMS.filter((t) => t.group === group && t.gender === gender).map(
    (t) => {
      const entry = standings.find((s) => s.teamId === t.id);
      return {
        team: t.name,
        logo: t.logo,
        p: entry?.p ?? 0,
        w: entry?.w ?? 0,
        d: entry?.d ?? 0,
        l: entry?.l ?? 0,
        gf: entry?.gf ?? 0,
        ga: entry?.ga ?? 0,
        gd: entry?.gd ?? 0,
        pts: entry?.pts ?? 0,
      };
    },
  );
};

function gdColorClass(gd: number): string {
  if (gd > 0) return "text-green-400";
  if (gd < 0) return "text-red-400";
  return "text-muted-foreground";
}

export function TableTab() {
  const { data: standings = [] } = useStandings();
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4 pb-12 flex flex-col gap-8"
    >
      <LeagueTable
        title="GROUP A · MALE"
        data={buildTable("A", "Male", standings)}
        qualifyCount={2}
      />
      <LeagueTable
        title="GROUP B · MALE"
        data={buildTable("B", "Male", standings)}
        qualifyCount={2}
      />
      <LeagueTable
        title="FEMALE"
        data={buildTable("Female", "Female", standings)}
        qualifyCount={2}
      />
    </motion.div>
  );
}

function LeagueTable({
  title,
  data,
  qualifyCount,
}: {
  title: string;
  data: TableRow[];
  qualifyCount: number;
}) {
  const sortedData = [...data].sort(
    (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf,
  );

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-barlow text-xl font-bold tracking-wide text-foreground">
        {title}
      </h3>

      <div className="bg-card rounded-xl border border-card-border overflow-hidden shadow-md">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.04]">
                <th className="pl-3 pr-2 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold w-4" />
                <th className="px-2 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                  Team
                </th>
                <th className="px-2 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold text-center w-7">
                  PL
                </th>
                <th className="px-2 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold text-center w-7">
                  W
                </th>
                <th className="px-2 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold text-center w-7">
                  D
                </th>
                <th className="px-2 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold text-center w-7">
                  L
                </th>
                <th className="px-2 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold text-center w-7">
                  +
                </th>
                <th className="px-2 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold text-center w-7">
                  -
                </th>
                <th className="px-2 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold text-center w-10">
                  GD
                </th>
                <th className="px-2 pr-3 py-2 text-[10px] text-foreground uppercase tracking-widest font-bold text-center w-8">
                  PTS
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, idx) => {
                const isQualify = idx < qualifyCount;
                return (
                  <tr
                    key={row.team}
                    data-testid={`table-row-${row.team}`}
                    style={{
                      boxShadow: isQualify
                        ? "inset 3px 0 0 #22c55e"
                        : undefined,
                    }}
                    className={`border-t border-border/40 ${
                      idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                    } ${isQualify ? "bg-green-500/[0.06]" : ""}`}
                  >
                    <td className="pl-3 pr-2 py-2.5 text-center">
                      <span
                        className={`text-xs font-bold ${isQualify ? "text-green-400" : "text-muted-foreground"}`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <TeamCrest name={row.team} logo={row.logo} size="sm" />
                        <span className="font-barlow font-bold text-[15px] tracking-wide whitespace-nowrap">
                          {row.team}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center text-muted-foreground text-xs">
                      {row.p}
                    </td>
                    <td className="px-2 py-2.5 text-center text-muted-foreground text-xs">
                      {row.w}
                    </td>
                    <td className="px-2 py-2.5 text-center text-muted-foreground text-xs">
                      {row.d}
                    </td>
                    <td className="px-2 py-2.5 text-center text-muted-foreground text-xs">
                      {row.l}
                    </td>
                    <td className="px-2 py-2.5 text-center text-muted-foreground text-xs">
                      {row.gf}
                    </td>
                    <td className="px-2 py-2.5 text-center text-muted-foreground text-xs">
                      {row.ga}
                    </td>
                    <td className={`px-2 py-2.5 text-center text-xs font-medium ${gdColorClass(row.gd)}`}>
                      {row.gd}
                    </td>
                    <td className="px-2 pr-3 py-2.5 text-center font-bold text-[13px] text-foreground">
                      {row.pts}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-1">
        <span className="w-2.5 h-2.5 rounded-sm bg-green-500 shrink-0" />
        <span className="text-[11px] text-muted-foreground">
          Qualify to next stage
        </span>
      </div>
    </div>
  );
}
