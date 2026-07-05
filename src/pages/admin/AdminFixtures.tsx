import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";

type MatchStatus = "scheduled" | "live" | "finished";

interface TeamSummary {
  id: number;
  name: string;
}

interface MatchSummary {
  id: number;
  group: string;
  gender: "Male" | "Female";
  status: MatchStatus;
  time: string;
  teamA: TeamSummary;
  teamB: TeamSummary;
  scoreA?: number;
  scoreB?: number;
}

// --- Mock data (design only — no real backend) ---
const MOCK_DATES = ["2026-06-29", "2026-06-30", "2026-07-01"];

const MOCK_MATCHES: Record<string, MatchSummary[]> = {
  "2026-06-29": [
    {
      id: 1,
      group: "A",
      gender: "Male",
      status: "finished",
      time: "09:00",
      teamA: { id: 10, name: "Grade 11A" },
      teamB: { id: 11, name: "Grade 12B" },
      scoreA: 3,
      scoreB: 1,
    },
    {
      id: 2,
      group: "B",
      gender: "Male",
      status: "live",
      time: "10:30",
      teamA: { id: 12, name: "Grade 10A" },
      teamB: { id: 13, name: "Grade 9C" },
      scoreA: 1,
      scoreB: 1,
    },
    {
      id: 3,
      group: "Female",
      gender: "Female",
      status: "scheduled",
      time: "13:00",
      teamA: { id: 14, name: "Grade 11 Girls" },
      teamB: { id: 15, name: "Grade 12 Girls" },
    },
  ],
  "2026-06-30": [
    {
      id: 4,
      group: "A",
      gender: "Male",
      status: "scheduled",
      time: "09:00",
      teamA: { id: 16, name: "Grade 11A" },
      teamB: { id: 17, name: "Grade 9C" },
    },
    {
      id: 5,
      group: "C",
      gender: "Male",
      status: "scheduled",
      time: "10:30",
      teamA: { id: 18, name: "Grade 10B" },
      teamB: { id: 19, name: "Grade 12A" },
    },
  ],
  "2026-07-01": [
    {
      id: 6,
      group: "Female",
      gender: "Female",
      status: "scheduled",
      time: "09:00",
      teamA: { id: 20, name: "Grade 10 Girls" },
      teamB: { id: 21, name: "Grade 9 Girls" },
    },
  ],
};

function TeamCrest({ name }: { name: string }) {
  const initials = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center border border-white/15 bg-white/6 shrink-0">
      <span className="font-barlow text-[10px] font-bold tracking-wider text-foreground/70">
        {initials}
      </span>
    </div>
  );
}

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
  const [starting, setStarting] = useState(false);

  const badgeText =
    match.group === "Female" ? "FEMALE" : `GROUP ${match.group} · ${match.gender.toUpperCase()}`;

  // Design-only: simulate "starting" then navigate. No real mutation.
  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStarting(true);
    setTimeout(() => navigate(`/admin/match/${match.id}`), 600);
  };

  const canOpen = match.status === "live" || match.status === "finished";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-card-border rounded-xl overflow-hidden shadow-md"
      onClick={() => canOpen && navigate(`/admin/match/${match.id}`)}
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
          <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <TeamCrest name={match.teamA.name} />
            <span className="font-barlow text-[15px] font-bold tracking-wide text-center leading-tight w-full truncate">
              {match.teamA.name}
            </span>
          </div>

          <div className="flex flex-col items-center shrink-0 gap-0.5">
            {match.status !== "scheduled" ? (
              <div className="flex items-center gap-1.5">
                <span className="font-barlow text-2xl font-extrabold leading-none">
                  {match.scoreA ?? 0}
                </span>
                <span className="font-barlow text-lg text-muted-foreground">-</span>
                <span className="font-barlow text-2xl font-extrabold leading-none">
                  {match.scoreB ?? 0}
                </span>
              </div>
            ) : (
              <span className="font-barlow text-xl font-bold text-foreground/80 tracking-tight leading-none">
                {match.time}
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <TeamCrest name={match.teamB.name} />
            <span className="font-barlow text-[15px] font-bold tracking-wide text-center leading-tight w-full truncate">
              {match.teamB.name}
            </span>
          </div>
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
  );
}

function AdminFixturesContent() {
  const [, navigate] = useLocation();
  const dates = MOCK_DATES;
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    const todayIdx = dates.findIndex((d) => d >= "2026-06-29");
    setSelectedIdx(todayIdx >= 0 ? todayIdx : 0);
  }, [dates]);

  const selectedDate = dates[selectedIdx];
  const matches = selectedDate ? MOCK_MATCHES[selectedDate] ?? [] : [];
  const isLoading = false;

  const canPrev = selectedIdx > 0;
  const canNext = selectedIdx < dates.length - 1;

  return (
    <div className="w-full min-h-[100dvh] max-w-[430px] mx-auto bg-background flex flex-col">
      <div className="sticky top-0 z-30 bg-background/98 backdrop-blur-md border-b border-border/60">
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <p className="font-barlow text-lg font-extrabold tracking-wide">Match Control</p>
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-foreground active:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

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
            ) : matches.length === 0 ? (
              <div className="text-center text-muted-foreground py-16 text-sm">
                No matches scheduled.
              </div>
            ) : (
              matches.map((match) => <MatchRow key={match.id} match={match} />)
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