import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, updateMatchTeamSide } from "@/lib/supabase";
import { useMatches } from "@/hooks/useMatches";
import { useGoalEvents } from "@/hooks/useGoalEvents";
import { isKnockoutGroup } from "@/lib/knockout";
import { TEAMS, getTeamName, type Team } from "@/data/tournament";
import { TeamCrest } from "@/components/shared/TeamCrest";
import { AdminTabBar } from "@/components/shared/AdminTabBar";
import { toast } from "@/hooks/use-toast";

type MatchStatus = "scheduled" | "live" | "finished";

interface TeamSummary {
  id: string;
  name: string;
  logo?: string;
}

interface MatchSummary {
  id: string;
  group: string;
  gender: "Male" | "Female";
  status: MatchStatus;
  time: string;
  teamA: TeamSummary;
  teamB: TeamSummary;
  scoreA?: number | null;
  scoreB?: number | null;
}

const TODAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Yangon",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

function StatusPill({ status }: { status: MatchStatus }) {
  if (status === "live") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-sm tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        LIVE
      </span>
    );
  }
  if (status === "finished") {
    return (
      <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-sm tracking-wide">
        FT
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold text-muted-foreground bg-white/4 border border-white/8 px-2 py-0.5 rounded-sm tracking-wide">
      SCHEDULED
    </span>
  );
}

function MatchRow({ match }: { match: MatchSummary }) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [starting, setStarting] = useState(false);
  const { data: events = [] } = useGoalEvents(match.id);
  const [pickingSide, setPickingSide] = useState<"A" | "B" | null>(null);
  const [assigning, setAssigning] = useState(false);

  const isKnockout = isKnockoutGroup(match.group);
  const canAssign = isKnockout && match.status === "scheduled";
  const genderTeams = TEAMS.filter((t) => t.gender === match.gender);

  const badgeText =
    match.group === "Female"
      ? "FEMALE"
      : isKnockout
        ? `${match.group.toUpperCase()} · ${match.gender.toUpperCase()}`
        : `GROUP ${match.group} · ${match.gender.toUpperCase()}`;

  const liveScoreA = events.filter((e) => e.teamId === match.teamA.id).length;
  const liveScoreB = events.filter((e) => e.teamId === match.teamB.id).length;

  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setStarting(true);
    const { error } = await supabase
      .from("matches")
      .update({ status: "live" })
      .eq("id", match.id);

    if (error) {
      setStarting(false);
      toast({
        title: "Could not start match",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["matches"] });
    navigate(`/fifaOwner/match/${match.id}`);
  };

  const handleAssign = async (team: Team) => {
    if (assigning || !pickingSide) return;
    setAssigning(true);
    const { error } = await updateMatchTeamSide(match.id, pickingSide, {
      id: team.id,
      logo: team.logo,
    });
    setAssigning(false);
    if (error) {
      toast({
        title: "Could not assign team",
        description: error,
        variant: "destructive",
      });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["matches"] });
    setPickingSide(null);
  };

  const canOpen = match.status === "live" || match.status === "finished";

  const scoreBlock =
    match.status === "finished" ? (
      <div className="flex items-center gap-1.5">
        <span className="font-barlow text-2xl font-extrabold leading-none">
          {match.scoreA ?? 0}
        </span>
        <span className="font-barlow text-lg text-muted-foreground">-</span>
        <span className="font-barlow text-2xl font-extrabold leading-none">
          {match.scoreB ?? 0}
        </span>
      </div>
    ) : match.status === "live" ? (
      <div className="flex items-center gap-1.5">
        <span className="font-barlow text-2xl font-extrabold leading-none text-red-400">
          {liveScoreA}
        </span>
        <span className="font-barlow text-lg text-muted-foreground">-</span>
        <span className="font-barlow text-2xl font-extrabold leading-none text-red-400">
          {liveScoreB}
        </span>
      </div>
    ) : (
      <span className="font-barlow text-xl font-bold text-foreground/80 tracking-tight leading-none">
        {match.time}
      </span>
    );

  const renderSide = (side: "A" | "B") => {
    const team = side === "A" ? match.teamA : match.teamB;
    const isTBD = team.id === "TBD";
    const inner = (
      <>
        <TeamCrest name={team.name} logo={team.logo} />
        <span
          className={`font-barlow text-[15px] font-bold tracking-wide text-center leading-tight w-full truncate ${isTBD && canAssign ? "text-muted-foreground" : ""}`}
        >
          {canAssign && isTBD ? "Assign" : team.name}
        </span>
      </>
    );
    if (canAssign) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPickingSide(side);
          }}
          className="flex-1 flex flex-col items-center gap-1.5 min-w-0 active:bg-white/5 rounded-lg transition-colors"
        >
          {inner}
        </button>
      );
    }
    return (
      <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
        {inner}
      </div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-card-border rounded-xl overflow-hidden shadow-md"
        onClick={() => canOpen && navigate(`/fifaOwner/match/${match.id}`)}
        style={{ cursor: canOpen ? "pointer" : "default" }}
      >
        <div className="px-4 pt-3 pb-3">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold tracking-widest text-foreground/50 px-2 py-0.5 rounded-sm bg-white/4 border border-white/8">
              {badgeText}
            </span>
            <StatusPill status={match.status} />
          </div>

          <div className="flex items-center justify-between gap-3">
            {renderSide("A")}

            <div className="flex flex-col items-center shrink-0 gap-0.5">
              {scoreBlock}
            </div>

            {renderSide("B")}
          </div>

          {match.status === "scheduled" && (
            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full h-11 mt-3 rounded-lg bg-foreground text-background font-bold text-sm tracking-wide active:opacity-80 transition-opacity disabled:opacity-50"
            >
              {starting ? "Starting..." : "Start Match"}
            </button>
          )}

          {match.status === "live" && (
            <div className="flex items-center justify-center mt-3 gap-1 text-red-400/80">
              <span className="text-[11px] font-semibold tracking-wide uppercase">
                Tap to manage live match
              </span>
              <ChevronRight className="w-3 h-3" />
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {pickingSide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
            onClick={() => !assigning && setPickingSide(null)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] bg-card border-t border-border rounded-t-2xl px-4 pt-5 pb-8 flex flex-col gap-1.5 max-h-[80dvh] overflow-y-auto no-scrollbar"
            >
              <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-2">
                Select {match.gender} team
              </p>
              {genderTeams.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleAssign(t)}
                  disabled={assigning}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/4 border border-white/8 active:bg-white/10 transition-colors disabled:opacity-50 text-left"
                >
                  <TeamCrest name={t.name} logo={t.logo} />
                  <span className="font-barlow font-bold text-[15px] tracking-wide">
                    {t.name}
                  </span>
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AdminFixturesContent() {
  const [, navigate] = useLocation();
  const { data: matches = [], isLoading } = useMatches();
  const dates = Array.from(new Set(matches.map((m) => m.date))).sort();
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    const todayIdx = dates.findIndex((d) => d >= TODAY);
    setSelectedIdx(todayIdx >= 0 ? todayIdx : 0);
  }, [dates.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedDate = dates[selectedIdx];
  const matchesForDate = matches
    .filter((m) => m.date === selectedDate)
    .map<MatchSummary>((m) => ({
      id: m.id,
      group: m.group,
      gender: m.gender,
      status: (m.status ?? "scheduled") as MatchStatus,
      time: m.time,
      teamA: { id: m.teamA, name: getTeamName(m.teamA), logo: m.logoA },
      teamB: { id: m.teamB, name: getTeamName(m.teamB), logo: m.logoB },
      scoreA: m.scoreA,
      scoreB: m.scoreB,
    }));

  const canPrev = selectedIdx > 0;
  const canNext = selectedIdx < dates.length - 1;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/fifaOwner/login");
  };

  return (
    <div className="w-full min-h-[100dvh] max-w-[430px] mx-auto bg-background flex flex-col">
      <div className="sticky top-0 z-30 bg-background/98 backdrop-blur-md border-b border-border/60">
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <p className="font-barlow text-lg font-extrabold tracking-wide">Match Control</p>
          <button
            onClick={handleSignOut}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-foreground active:bg-white/10 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <AdminTabBar active="fixtures" />

        <div className="flex items-center">
          <button
            onClick={() => canPrev && setSelectedIdx((i) => i - 1)}
            className={`flex items-center justify-center w-10 h-full shrink-0 transition-opacity ${
              canPrev ? "text-foreground/70 active:text-foreground" : "text-foreground/15 pointer-events-none"
            }`}
            style={{ minHeight: 52 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center">
            {selectedDate && (
              <span className="text-sm font-bold tracking-wide">
                {format(parseISO(selectedDate), "EEEE, d MMMM")}
              </span>
            )}
          </div>
          <button
            onClick={() => canNext && setSelectedIdx((i) => i + 1)}
            className={`flex items-center justify-center w-10 h-full shrink-0 transition-opacity ${
              canNext ? "text-foreground/70 active:text-foreground" : "text-foreground/15 pointer-events-none"
            }`}
            style={{ minHeight: 52 }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="px-4 py-5 flex flex-col gap-3"
          >
            {isLoading ? (
              <div className="text-center text-muted-foreground py-16 text-sm">Loading...</div>
            ) : matchesForDate.length === 0 ? (
              <div className="text-center text-muted-foreground py-16 text-sm">
                No matches scheduled.
              </div>
            ) : (
              matchesForDate.map((match) => <MatchRow key={match.id} match={match} />)
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AdminFixtures() {
  return <AdminFixturesContent />;
}