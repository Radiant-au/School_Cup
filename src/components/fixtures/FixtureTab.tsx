import { useState, useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import {
  MATCHES,
  TOURNAMENT_DATES,
  getTeamName,
  type Match,
} from "@/data/tournament";
import { TeamCrest } from "@/components/shared/TeamCrest";

const TODAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Yangon",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

export function FixtureTab() {
  const todayIdx = TOURNAMENT_DATES.indexOf(TODAY);
  const defaultIdx = todayIdx >= 0 ? todayIdx : 0;
  const [selectedIdx, setSelectedIdx] = useState(defaultIdx);
  const [, navigate] = useLocation();

  const selectedDate = TOURNAMENT_DATES[selectedIdx];
  const matchesForDate = MATCHES.filter((m) => m.date === selectedDate);
  const canPrev = selectedIdx > 0;
  const canNext = selectedIdx < TOURNAMENT_DATES.length - 1;

  const stripRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Scroll selected chip into centre of strip
  useEffect(() => {
    const chip = chipRefs.current[selectedIdx];
    const strip = stripRef.current;
    if (!chip || !strip) return;
    const chipLeft = chip.offsetLeft;
    const chipWidth = chip.offsetWidth;
    const stripWidth = strip.offsetWidth;
    strip.scrollTo({
      left: chipLeft - stripWidth / 2 + chipWidth / 2,
      behavior: "smooth",
    });
  }, [selectedIdx]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      className="flex flex-col"
    >
      {/* ── FotMob-style date bar ── */}
      <div className="sticky top-0 z-30 bg-background/98 backdrop-blur-md border-b border-border/60">
        <div className="flex items-center">
          {/* Left arrow */}
          <button
            onClick={() => canPrev && setSelectedIdx((i) => i - 1)}
            className={`flex items-center justify-center w-10 h-full shrink-0 transition-opacity ${canPrev ? "text-foreground/70 active:text-foreground" : "text-foreground/15 pointer-events-none"}`}
            style={{ minHeight: 64 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scrollable chip strip */}
          <div
            ref={stripRef}
            className="flex-1 flex overflow-x-auto no-scrollbar py-2"
          >
            <div className="flex gap-1 px-1">
              {TOURNAMENT_DATES.map((date, i) => {
                const parsed = parseISO(date);
                const dayAbbr = format(parsed, "EEE").toUpperCase();
                const dateNum = format(parsed, "d");
                const isActive = i === selectedIdx;
                const isToday = date === TODAY;

                return (
                  <button
                    key={date}
                    ref={(el) => {
                      chipRefs.current[i] = el;
                    }}
                    onClick={() => setSelectedIdx(i)}
                    className={`relative flex flex-col items-center justify-center min-w-[52px] h-[52px] rounded-xl transition-all duration-200 ${isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground/80"
                      }`}
                  >
                    <span
                      className={`text-[10px] font-bold tracking-widest ${isActive ? "text-background/70" : ""}`}
                    >
                      {dayAbbr}
                    </span>
                    <span
                      className={`text-[20px] font-extrabold leading-tight font-barlow ${isActive ? "text-background" : ""}`}
                    >
                      {dateNum}
                    </span>
                    {/* Today dot */}
                    {isToday && !isActive && (
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right arrow */}
          <button
            onClick={() => canNext && setSelectedIdx((i) => i + 1)}
            className={`flex items-center justify-center w-10 h-full shrink-0 transition-opacity ${canNext ? "text-foreground/70 active:text-foreground" : "text-foreground/15 pointer-events-none"}`}
            style={{ minHeight: 64 }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Selected date label */}
        <div className="pb-2 text-center">
          <span className="text-[11px] font-semibold text-muted-foreground tracking-wide">
            {format(parseISO(selectedDate), "EEEE, d MMMM")}
            {selectedDate === TODAY ? " · Today" : ""}
          </span>
        </div>
      </div>

      {/* ── Match list (slides direction-aware) ── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="px-4 py-5 flex flex-col gap-3"
        >
          {matchesForDate.length === 0 ? (
            <div className="text-center text-muted-foreground py-16 text-sm">
              No matches scheduled.
            </div>
          ) : (
            matchesForDate.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onTap={() => navigate(`/match/${match.id}`)}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function MatchCard({ match, onTap }: { match: Match; onTap: () => void }) {
  const badgeText =
    match.group === "Female"
      ? "FEMALE"
      : match.group === "Semi-final" || match.group === "Final" || match.group === "Bronze Final"
        ? `${match.group.toUpperCase()} · ${match.gender.toUpperCase()}`
        : `GROUP ${match.group} · ${match.gender.toUpperCase()}`;

  const isFinished =
    match.finished && match.scoreA !== null && match.scoreB !== null;
  const isDisbanded = !!match.disbanded;
  const teamAName = getTeamName(match.teamA);
  const teamBName = getTeamName(match.teamB);

  return (
    <motion.div
      data-testid={`match-card-${match.id}`}
      whileTap={{ scale: 0.975 }}
      onClick={onTap}
      className={`bg-card border border-card-border rounded-xl overflow-hidden shadow-md cursor-pointer transition-opacity ${
        isDisbanded ? "opacity-60" : ""
      }`}
    >
      <div className="px-4 pt-3 pb-3">
        {/* Top row */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold tracking-widest text-blue-400 px-2 py-0.5 rounded-sm bg-blue-500/10 border border-blue-500/20">
            {badgeText}
          </span>
          {isDisbanded ? (
            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-sm tracking-widest">
              DISBAND
            </span>
          ) : isFinished ? (
            <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-sm tracking-wide">
              FT
            </span>
          ) : null}
        </div>

        {/* Teams row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <TeamCrest name={teamAName} logo={match.logoA} />
            <span className="font-barlow text-[17px] font-bold tracking-wide text-center leading-tight w-full truncate">
              {teamAName}
            </span>
          </div>

          <div className="flex flex-col items-center shrink-0 gap-0.5">
            {isDisbanded ? (
              <div className="flex flex-col items-center gap-1">
                <span className="relative font-barlow text-sm font-extrabold tracking-widest text-red-400/90 leading-none">
                  DISBAND
                  <span className="absolute left-0 right-0 top-1/2 h-[2px] bg-red-400/60 -translate-y-1/2 rotate-[-8deg]" />
                </span>
                <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-red-400/50">
                  Cancelled
                </span>
              </div>
            ) : isFinished ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="font-barlow text-4xl font-extrabold leading-none">
                    {match.scoreA}
                  </span>
                  <span className="font-barlow text-xl text-muted-foreground">
                    -
                  </span>
                  <span className="font-barlow text-4xl font-extrabold leading-none">
                    {match.scoreB}
                  </span>
                </div>
              </>
            ) : (
              <span className="font-barlow text-2xl font-bold text-foreground/80 tracking-tight leading-none">
                {match.time}
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center gap-1.5">
            <TeamCrest name={teamBName} logo={match.logoB} />
            <span className="font-barlow text-[17px] font-bold tracking-wide text-center leading-tight w-full truncate">
              {teamBName}
            </span>
          </div>
        </div>

        {/* Squad link */}
        <div className="flex items-center justify-end mt-3 gap-1 text-foreground/25">
          <span className="text-[10px] font-medium tracking-wide uppercase">
            Squad
          </span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  );
}
