import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  MATCHES,
  MATCH_EVENTS,
  TEAMS,
  getTeamName,
  type Player,
} from "@/data/tournament";
import { SQUADS } from "@/data/squads";
import footballImg from "@/assets/football.svg";
import { TeamCrest } from "@/components/shared/TeamCrest";

function FootballBall({ size = 16 }: { size?: number }) {
  return (
    <img
      src="https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782764556/76adb940-d963-48d3-aa07-63865817bbba.png"
      alt="goal"
      style={{ width: size, height: size }}
      className="rounded-full object-contain bg-white shrink-0"
    />
  );
}

function GoalIndicator({ goals }: { goals: number }) {
  if (goals === 0)
    return <span className="text-xs text-muted-foreground/30">—</span>;
  if (goals === 1) return <FootballBall size={16} />;
  return (
    <div className="relative" style={{ width: 22, height: 16 }}>
      <span className="absolute left-0 top-0 z-10">
        <FootballBall size={16} />
      </span>
      <span className="absolute left-[6px] top-0 z-20 drop-shadow-sm">
        <FootballBall size={16} />
      </span>
    </div>
  );
}

function PlayerAvatar({ goals, color }: { goals: number; color: string }) {
  const isScorer = goals > 0;
  const borderColor = color;
  const bgColor = `${color}15`;
  return (
    <div className="relative w-11 h-11 shrink-0">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center border-2 transition-colors"
        style={{ borderColor, backgroundColor: bgColor }}
      >
        <img
          src={footballImg}
          alt=""
          className={`w-6 h-6 rounded-full object-contain bg-white ${isScorer ? "" : "opacity-20"}`}
        />
      </div>
      {goals >= 1 && (
        <div
          className="absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center border border-background"
          style={{ width: 16, height: 16, backgroundColor: "#22c55e" }}
        >
          <span className="text-[9px] font-extrabold text-white leading-none">
            {goals}
          </span>
        </div>
      )}
    </div>
  );
}

interface PlayerWithGoals extends Player {
  goals: number;
}

function aggregateGoals(
  squad: Player[],
  matchId: string,
  teamId: string,
): PlayerWithGoals[] {
  const matchGoals = MATCH_EVENTS.filter(
    (e) => e.matchId === matchId && e.teamId === teamId,
  );

  return squad.map((player) => ({
    ...player,
    goals: matchGoals.filter((e) => e.playerId === player.id).length,
  }));
}

function sortSquad(players: PlayerWithGoals[]): PlayerWithGoals[] {
  return [...players].sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    return 0;
  });
}

export default function MatchSquad() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [activeTeamTab, setActiveTeamTab] = useState<"A" | "B">("A");

  const match = MATCHES.find((m) => m.id === id);

  if (!match) {
    return (
      <div className="w-full min-h-[100dvh] bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Match not found.</p>
        <button
          onClick={() => navigate("/")}
          className="text-foreground text-sm underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const teamAName = getTeamName(match.teamA);
  const teamBName = getTeamName(match.teamB);
  const teamAInfo = TEAMS.find((t) => t.id === match.teamA);
  const teamBInfo = TEAMS.find((t) => t.id === match.teamB);
  const isFinished =
    match.finished && match.scoreA !== null && match.scoreB !== null;

  const teamAColor = teamAInfo?.color ?? "#22c55e";
  const teamBColor = teamBInfo?.color ?? "#22c55e";

  const squadA = SQUADS[match.teamA] ?? [];
  const squadB = SQUADS[match.teamB] ?? [];

  const squadAWithGoals = sortSquad(aggregateGoals(squadA, match.id, match.teamA));
  const squadBWithGoals = sortSquad(aggregateGoals(squadB, match.id, match.teamB));

  const activeSquad = activeTeamTab === "A" ? squadAWithGoals : squadBWithGoals;
  const activeColor = activeTeamTab === "A" ? teamAColor : teamBColor;

  const badgeText =
    match.group === "Female"
      ? "FEMALE"
      : match.group === "Semi-final" || match.group === "Final" || match.group === "Bronze Final"
        ? match.group.toUpperCase()
        : `GROUP ${match.group} · ${match.gender.toUpperCase()}`;

  const formattedDate = format(parseISO(match.date), "EEEE, d MMMM yyyy");

  return (
    <div className="w-full min-h-[100dvh] bg-background flex flex-col">
      <div className="h-[3px] w-full bg-gradient-to-b from-foreground/30 to-transparent absolute top-0 z-50 pointer-events-none" />

      <div className="relative pt-3 pb-0 bg-background z-40 border-b border-border shrink-0">
        <div className="flex items-center gap-3 px-4 pb-3 pt-3">
          <button
            data-testid="back-button"
            onClick={() => navigate("/")}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-foreground active:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            {badgeText}
          </span>
          {isFinished && (
            <span className="ml-auto text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-sm">
              FULL TIME
            </span>
          )}
        </div>

        <div className="px-4 pb-5 pt-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 flex flex-col items-center gap-2">
              <TeamCrest name={teamAName} logo={match.logoA} size="lg" isActive={activeTeamTab === "A"} />
              <p className="font-barlow text-xl font-extrabold tracking-wide leading-tight text-center">
                {teamAName}
              </p>
              {teamAInfo && (
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {teamAInfo.gender === "Female"
                    ? "Female"
                    : `Group ${teamAInfo.group}`}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center shrink-0 gap-1">
              {isFinished ? (
                <div className="flex items-center gap-1">
                  <span className="font-barlow text-3xl font-extrabold">
                    {match.scoreA}
                  </span>
                  <span className="font-barlow text-xl text-muted-foreground mx-0.5">
                    -
                  </span>
                  <span className="font-barlow text-3xl font-extrabold">
                    {match.scoreB}
                  </span>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-card border border-border">
                  <span className="font-barlow text-2xl font-bold text-muted-foreground tracking-widest">
                    VS
                  </span>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground font-medium">
                {match.time}
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center gap-2">
              <TeamCrest name={teamBName} logo={match.logoB} size="lg" isActive={activeTeamTab === "B"} />
              <p className="font-barlow text-xl font-extrabold tracking-wide leading-tight text-center">
                {teamBName}
              </p>
              {teamBInfo && (
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {teamBInfo.gender === "Female"
                    ? "Female"
                    : `Group ${teamBInfo.group}`}
                </p>
              )}
            </div>
          </div>

          <p className="text-center text-[11px] text-muted-foreground mt-4 font-medium">
            {formattedDate}
          </p>
        </div>

        <div className="flex border-t border-border relative">
          <button
            data-testid="team-tab-A"
            onClick={() => setActiveTeamTab("A")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors duration-200 relative ${activeTeamTab === "A"
              ? "text-foreground"
              : "text-muted-foreground"
              }`}
          >
            <TeamCrest name={teamAName} logo={match.logoA} size="lg" isActive={activeTeamTab === "A"} />
            {teamAName}
            {activeTeamTab === "A" && (
              <motion.div
                layoutId="team-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-t-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
              />
            )}
          </button>
          <button
            data-testid="team-tab-B"
            onClick={() => setActiveTeamTab("B")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors duration-200 relative ${activeTeamTab === "B"
              ? "text-foreground"
              : "text-muted-foreground"
              }`}
          >
            <TeamCrest name={teamBName} logo={match.logoB} size="lg" isActive={activeTeamTab === "B"} />
            {teamBName}
            {activeTeamTab === "B" && (
              <motion.div
                layoutId="team-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-t-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
              />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTeamTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-3 pb-8 flex flex-col gap-1"
          >
            <div className="flex items-center gap-3 px-2 pb-2 pt-1">
              <span className="w-11 shrink-0" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex-1">
                Player
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold w-8 text-center">
                #
              </span>
              <span
                className="text-[10px] uppercase tracking-widest font-semibold w-6 text-center"
                style={{ color: activeColor }}
              >
                G
              </span>
            </div>

            {activeSquad.length === 0 ? (
              <div className="text-center text-muted-foreground py-16 text-sm">
                Squad data not available yet.
              </div>
            ) : (
              activeSquad.map((player, i) => {
                const isScorer = player.goals > 0;
                const nameColor = isScorer ? activeColor : undefined;

                return (
                  <motion.div
                    key={player.id}
                    data-testid={`player-row-${player.id}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025 }}
                    className={`flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors ${isScorer
                      ? "border"
                      : "hover:bg-white/3"
                      }`}
                    style={
                      isScorer
                        ? {
                          backgroundColor: `${activeColor}08`,
                          borderColor: `${activeColor}25`,
                        }
                        : undefined
                    }
                  >
                    <PlayerAvatar goals={player.goals} color={activeColor} />

                    <div className="flex-1 min-w-0">
                      <p
                        className="font-myanmar text-[17px] font-bold leading-normal truncate"
                        style={nameColor ? { color: nameColor } : undefined}
                      >
                        {player.name}
                      </p>
                    </div>

                    <span className="w-8 text-center font-barlow text-lg font-bold text-muted-foreground shrink-0">
                      {player.number || "—"}
                    </span>

                    <div className="w-6 flex items-center justify-center shrink-0">
                      <GoalIndicator goals={player.goals} />
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
