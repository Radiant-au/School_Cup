import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  TEAMS,
  getTeamName,
  type Player,
} from "@/data/tournament";
import { SQUADS } from "@/data/squads";
import { useMatches } from "@/hooks/useMatches";
import { useGoalEvents } from "@/hooks/useGoalEvents";
import footballImg from "@/assets/football.svg";
import { cloudinary } from "@/lib/cloudinary";
import { deriveKnockoutOutcome } from "@/lib/knockout";
import { TeamCrest } from "@/components/shared/TeamCrest";

function FootballBall({ size = 14 }: { size?: number }) {
  return (
    <img
      src={footballImg}
      alt="goal"
      style={{ width: size, height: size }}
      className="rounded-full object-contain bg-white shrink-0"
    />
  );
}

function GoalBadge({ goals }: { goals: number }) {
  if (goals === 0) return null;
  return (
    <div className="flex items-center gap-0.5 bg-green-500/15 border border-green-500/30 rounded-full px-2 py-0.5">
      {Array.from({ length: Math.min(goals, 3) }).map((_, i) => (
        <FootballBall key={i} size={11} />
      ))}
      {goals > 3 && <span className="text-[10px] font-bold text-green-400 ml-0.5">+{goals - 3}</span>}
    </div>
  );
}

function isValidPhotoUrl(url: string | undefined): boolean {
  return !!url && url !== "none";
}

interface PlayerCardProps extends PlayerWithGoals {
  delay: number;
}

function PlayerCard({ name, number, profile_string_link, goals, delay }: PlayerCardProps) {
  const [imgError, setImgError] = useState(false);
  const isScorer = goals > 0;
  const showPhoto = isValidPhotoUrl(profile_string_link) && !imgError;

  // const num = parseInt(number) || 0;
  // const position =
  //   num === 1 ? "Goalkeeper"
  //   : num <= 4 ? "Defender"
  //   : num <= 7 ? "Midfielder"
  //   : "Forward";

  // const posShort =
  //   num === 1 ? "GK" : num <= 4 ? "DEF" : num <= 7 ? "MID" : "FWD";

  // const posColor =
  //   num === 1 ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
  //   : num <= 4 ? "text-blue-400 bg-blue-400/10 border-blue-400/20"
  //   : num <= 7 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
  //   : "text-red-400 bg-red-400/10 border-red-400/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-2xl border overflow-hidden flex items-center gap-5 px-5 py-5 ${isScorer
        ? "bg-green-500/5 border-green-500/20"
        : "bg-card border-border"
        }`}
    >
      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-barlow text-[72px] font-extrabold leading-none text-foreground/[0.04] select-none pointer-events-none">
        {number}
      </span>

      <div className="relative shrink-0">
        <div
          className={`w-[92px] h-[92px] rounded-full flex items-center justify-center border-2 overflow-hidden ${isScorer ? "border-green-500/60 bg-green-500/10" : "border-white/12 bg-white/5"
            }`}
        >
          {showPhoto ? (
            <img
              src={cloudinary(profile_string_link)}
              alt=""
              loading="lazy"
              decoding="async"
              width={184}
              height={184}
              onError={() => setImgError(true)}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <img
              src={footballImg}
              alt=""
              className={`w-14 h-14 rounded-full object-contain bg-white ${isScorer ? "" : "opacity-15"}`}
            />
          )}
        </div>
        {isScorer && (
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
            <span className="text-[10px] font-extrabold text-white leading-none">{goals}</span>
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <p className={`font-myanmar text-[18px] font-extrabold leading-normal truncate ${isScorer ? "text-green-300" : "text-foreground"
          }`}>
          {name}
        </p>

        {/* <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded border ${posColor}`}>
            {posShort}
          </span>
          <span className="text-[12px] text-muted-foreground font-medium">{position}</span>
        </div> */}

        {isScorer && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <GoalBadge goals={goals} />
            <span className="text-[11px] text-green-400/70 font-medium">
              {goals === 1 ? "1 goal" : `${goals} goals`}
            </span>
          </div>
        )}
      </div>

      <span className="font-barlow text-[28px] font-black text-muted-foreground/20 shrink-0 relative z-10">
        #{number}
      </span>
    </motion.div>
  );
}

interface PlayerWithGoals extends Player {
  goals: number;
}

function aggregateGoals(
  squad: Player[],
  events: { teamId: string; playerId: string }[],
  teamId: string,
): PlayerWithGoals[] {
  const teamGoals = events.filter((e) => e.teamId === teamId);
  return squad.map((player) => ({
    ...player,
    goals: teamGoals.filter((e) => e.playerId === player.id).length,
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

  const matchesQuery = useMatches();
  const eventsQuery = useGoalEvents(id);

  const match = matchesQuery.data?.find((m) => m.id === id);
  const events = eventsQuery.data ?? [];

  if (matchesQuery.isLoading || !matchesQuery.data) {
    return (
      <div className="w-full min-h-[100dvh] bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Loading match...</p>
      </div>
    );
  }

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

  if (match.disbanded) {
    return (
      <div className="w-full min-h-[100dvh] bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 font-barlow text-lg font-bold tracking-widest uppercase">
          Disbanded
        </p>
        <p className="text-muted-foreground text-sm">This match has been cancelled.</p>
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
  const isLive = match.status === "live";
  const { aEliminated, bEliminated, hasPenalties, penAWins, penBWins } =
    deriveKnockoutOutcome(match);

  const squadA = SQUADS[match.teamA] ?? [];
  const squadB = SQUADS[match.teamB] ?? [];

  const squadAWithGoals = sortSquad(aggregateGoals(squadA, events, match.teamA));
  const squadBWithGoals = sortSquad(aggregateGoals(squadB, events, match.teamB));

  const activeSquad = activeTeamTab === "A" ? squadAWithGoals : squadBWithGoals;

  const liveScoreA = events.filter((e) => e.teamId === match.teamA).length;
  const liveScoreB = events.filter((e) => e.teamId === match.teamB).length;

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
          {isLive && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        <div className="px-4 pb-5 pt-1">
          <div className="flex items-center justify-between gap-2">
            <div className={`flex-1 flex flex-col items-center gap-2 ${aEliminated ? "opacity-45" : ""}`}>
              <TeamCrest name={teamAName} logo={match.logoA} size="lg" isActive={activeTeamTab === "A"} />
              <p className={`font-barlow text-xl font-extrabold tracking-wide leading-tight text-center ${aEliminated ? "line-through decoration-red-500/70" : ""}`}>
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
                <div className="flex flex-col items-center gap-1">
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
                  {hasPenalties && (
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-bold tracking-widest text-amber-400/80 mr-0.5">
                        PEN
                      </span>
                      <span
                        className={`font-barlow text-sm font-bold leading-none ${penAWins ? "text-foreground" : "text-muted-foreground/80"}`}
                      >
                        ({match.penaltyA})
                      </span>
                      <span className="font-barlow text-xs text-muted-foreground/60">
                        -
                      </span>
                      <span
                        className={`font-barlow text-sm font-bold leading-none ${penBWins ? "text-foreground" : "text-muted-foreground/80"}`}
                      >
                        ({match.penaltyB})
                      </span>
                    </div>
                  )}
                </div>
              ) : isLive ? (
                <div className="flex items-center gap-1">
                  <span className="font-barlow text-3xl font-extrabold text-red-400">
                    {liveScoreA}
                  </span>
                  <span className="font-barlow text-xl text-muted-foreground mx-0.5">
                    -
                  </span>
                  <span className="font-barlow text-3xl font-extrabold text-red-400">
                    {liveScoreB}
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

            <div className={`flex-1 flex flex-col items-center gap-2 ${bEliminated ? "opacity-45" : ""}`}>
              <TeamCrest name={teamBName} logo={match.logoB} size="lg" isActive={activeTeamTab === "B"} />
              <p className={`font-barlow text-xl font-extrabold tracking-wide leading-tight text-center ${bEliminated ? "line-through decoration-red-500/70" : ""}`}>
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

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          <motion.div
            key={activeTeamTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="px-4 pt-4 pb-10 flex flex-col gap-3"
          >
            {activeSquad.length === 0 ? (
              <div className="text-center text-muted-foreground py-16 text-sm">
                Squad data not available yet.
              </div>
            ) : (
              activeSquad.map((player, i) => (
                <PlayerCard
                  key={player.id}
                  {...player}
                  delay={i * 0.03}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div >
  );
}
