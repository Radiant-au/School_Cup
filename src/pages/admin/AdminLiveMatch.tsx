import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Undo2 } from "lucide-react";

interface Player {
  id: number;
  number: number;
  name: string;
}

interface Team {
  id: number;
  name: string;
}

interface GoalEvent {
  id: number;
  teamId: number;
  playerId: number;
  playerNumber: number;
  playerName: string;
}

// --- Mock data (design only — no real backend) ---
const MOCK_MATCH: Record<
  string,
  {
    group: string;
    teamA: Team;
    teamB: Team;
    teamAPlayers: Player[];
    teamBPlayers: Player[];
  }
> = {
  default: {
    group: "A",
    teamA: { id: 10, name: "Grade 11A" },
    teamB: { id: 11, name: "Grade 12B" },
    teamAPlayers: [
      { id: 1, number: 1, name: "Aung Min" },
      { id: 2, number: 7, name: "Kyaw Zin" },
      { id: 3, number: 9, name: "Htet Naing" },
      { id: 4, number: 10, name: "Su Sandi" },
      { id: 5, number: 11, name: "Aye Chan" },
    ],
    teamBPlayers: [
      { id: 6, number: 3, name: "Min Khant" },
      { id: 7, number: 5, name: "Phyo Thiha" },
      { id: 8, number: 8, name: "Lin Htet" },
      { id: 9, number: 9, name: "Bo Bo" },
      { id: 10, number: 11, name: "Thet Win" },
    ],
  },
};

function getMockMatch(id: string) {
  return MOCK_MATCH[id] ?? MOCK_MATCH.default;
}

function PlayerButton({
  player,
  goals,
  onScore,
  disabled,
}: {
  player: Player;
  goals: number;
  onScore: () => void;
  disabled: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onScore}
      disabled={disabled}
      className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-colors min-h-[56px] ${
        goals > 0
          ? "bg-green-500/8 border-green-500/25"
          : "bg-card border-card-border active:bg-white/5"
      } disabled:opacity-50`}
    >
      <span
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-barlow text-sm font-extrabold border ${
          goals > 0
            ? "bg-green-500/15 border-green-500/30 text-green-300"
            : "bg-white/5 border-white/10 text-foreground/70"
        }`}
      >
        {player.number}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-semibold text-sm truncate">{player.name}</span>
        {goals > 0 && (
          <span className="block text-[11px] text-green-400 font-medium mt-0.5">
            {goals === 1 ? "1 goal" : `${goals} goals`}
          </span>
        )}
      </span>
      <span className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-foreground text-background font-bold text-xs">
        +1
      </span>
    </motion.button>
  );
}

function AdminLiveMatchContent() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [activeSide, setActiveSide] = useState<"A" | "B">("A");
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [events, setEvents] = useState<GoalEvent[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const mock = getMockMatch(id ?? "");
  const match = {
    group: mock.group,
    teamA: mock.teamA,
    teamB: mock.teamB,
    teamAPlayers: mock.teamAPlayers,
    teamBPlayers: mock.teamBPlayers,
    status: isFinished ? ("finished" as const) : ("live" as const),
  };

  const scoreA = events.filter((e) => e.teamId === mock.teamA.id).length;
  const scoreB = events.filter((e) => e.teamId === mock.teamB.id).length;

  const goalCounts: Record<number, number> = {};
  for (const ev of events) {
    goalCounts[ev.playerId] = (goalCounts[ev.playerId] ?? 0) + 1;
  }

  const activeTeam = activeSide === "A" ? mock.teamA : mock.teamB;
  const activePlayers = activeSide === "A" ? mock.teamAPlayers : mock.teamBPlayers;

  // Design-only handlers — mutate local mock state, no backend.
  const handleScore = (player: Player) => {
    if (isFinished) return;
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        teamId: activeTeam.id,
        playerId: player.id,
        playerNumber: player.number,
        playerName: player.name,
      },
    ]);
  };

  const handleUndo = (eventId: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const handleFinish = () => {
    setIsFinished(true);
    setShowFinishConfirm(false);
    setTimeout(() => navigate("/admin"), 400);
  };

  const sortedEvents = [...events].sort((a, b) => b.id - a.id);

  return (
    <div className="w-full min-h-[100dvh] max-w-[430px] mx-auto bg-background flex flex-col">
      {/* header */}
      <div className="relative bg-background z-40 border-b border-border shrink-0">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <button
            onClick={() => navigate("/admin")}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-foreground active:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            GROUP {match.group}
          </span>
          {!isFinished && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              LIVE
            </span>
          )}
          {isFinished && (
            <span className="ml-auto text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-sm">
              FULL TIME
            </span>
          )}
        </div>

        <div className="px-5 pb-4 pt-1">
          <div className="flex items-center justify-between gap-2">
            <p className="flex-1 font-barlow text-lg font-extrabold tracking-wide text-center truncate">
              {match.teamA.name}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-barlow text-3xl font-extrabold">{scoreA}</span>
              <span className="font-barlow text-xl text-muted-foreground">-</span>
              <span className="font-barlow text-3xl font-extrabold">{scoreB}</span>
            </div>
            <p className="flex-1 font-barlow text-lg font-extrabold tracking-wide text-center truncate">
              {match.teamB.name}
            </p>
          </div>
        </div>

        {!isFinished && (
          <div className="flex border-t border-border">
            {(["A", "B"] as const).map((side) => {
              const name = side === "A" ? match.teamA.name : match.teamB.name;
              const isActive = activeSide === side;
              return (
                <button
                  key={side}
                  onClick={() => setActiveSide(side)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold relative transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {name}
                  {isActive && (
                    <motion.div
                      layoutId="admin-team-tab-bar"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-t-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* body */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {!isFinished && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeSide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="px-4 pt-4 flex flex-col gap-2"
            >
              {activePlayers.map((player) => (
                <PlayerButton
                  key={player.id}
                  player={player}
                  goals={goalCounts[player.id] ?? 0}
                  onScore={() => handleScore(player)}
                  disabled={false}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* goal log */}
        <div className="px-4 pt-6 pb-10">
          <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-2">
            Goal Log
          </p>
          {sortedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No goals yet.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {sortedEvents.map((ev) => (
                <motion.div
                  key={ev.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between gap-2 bg-card border border-card-border rounded-lg px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-bold text-foreground/40 shrink-0">
                      #{ev.playerNumber}
                    </span>
                    <span className="text-sm font-medium truncate">{ev.playerName}</span>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      ({ev.teamId === match.teamA.id ? match.teamA.name : match.teamB.name})
                    </span>
                  </div>
                  {!isFinished && (
                    <button
                      onClick={() => handleUndo(ev.id)}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-muted-foreground active:bg-white/10 transition-colors"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* finish action */}
      {!isFinished && (
        <div className="px-4 py-4 border-t border-border shrink-0 bg-background">
          <button
            onClick={() => setShowFinishConfirm(true)}
            className="w-full h-[52px] rounded-xl bg-red-500/90 text-white font-bold text-sm tracking-wide active:opacity-80 transition-opacity"
          >
            Finish Match
          </button>
        </div>
      )}

      {/* confirm dialog */}
      <AnimatePresence>
        {showFinishConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
            onClick={() => setShowFinishConfirm(false)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] bg-card border-t border-border rounded-t-2xl px-5 pt-5 pb-8 flex flex-col gap-4"
            >
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="font-barlow text-xl font-extrabold">Finish Match?</p>
                <p className="text-sm text-muted-foreground">
                  Final score: {match.teamA.name} {scoreA} - {scoreB} {match.teamB.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">This cannot be undone.</p>
              </div>
              <button
                onClick={handleFinish}
                className="w-full h-[52px] rounded-xl bg-red-500/90 text-white font-bold text-sm tracking-wide active:opacity-80 transition-opacity"
              >
                Confirm Finish
              </button>
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="w-full h-[52px] rounded-xl bg-white/5 text-foreground font-bold text-sm tracking-wide active:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminLiveMatch() {
  return <AdminLiveMatchContent />;
}